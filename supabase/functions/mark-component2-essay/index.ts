// mark-component2-essay
//
// Pearson Edexcel A-Level English Literature, Component 2 (Prose) — diagnostic
// AI essay marker. Returns structured JSON feedback against AO1–AO4 only.
//
// PR 1 (this file): non-streaming. The frontend calls via
// supabase.functions.invoke('mark-component2-essay', { body: payload }).
// A later PR introduces SSE for progressive section rendering.

import Anthropic from "npm:@anthropic-ai/sdk@0.30.1";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.95.0";
import {
  AO_KEYS,
  EXAM_WARNING,
  extractSection,
  LEVEL_TO_MARKS,
  LEVEL_TO_READINESS_SCORE,
  pickDrillRouteForWeakestAO,
  safeJsonParse,
  stripAO5,
  validateInput,
  validateShape,
  VALID_APP_ROUTES,
  type AOKey,
  type LevelLabel,
  type MarkerResult,
  type ValidatedInput,
} from "./validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  // --- Auth: validate JWT before anything else --------------------------------
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return json(401, { error: "Missing or malformed Authorization header" });
  }
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json(401, { error: "Invalid or expired JWT" });
  const userId = userData.user.id;

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // --- Rate limit: 10 successful marks per user per hour ----------------------
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recent, error: rateErr } = await admin
    .from("essay_marker_results")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneHourAgo);
  if (rateErr) {
    console.error("rate-limit query failed", rateErr);
    return json(500, { error: "Rate-limit check failed" });
  }
  if ((recent ?? 0) >= 10) {
    return json(429, { error: "Rate limit exceeded. Maximum 10 marks per hour." });
  }

  // --- Input validation -------------------------------------------------------
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Request body must be valid JSON" });
  }
  const validated = validateInput((body ?? {}) as Record<string, unknown>);
  if (!validated.ok) return json(400, { error: validated.error });
  const input = validated.value;

  // --- Resolve mode-specific data --------------------------------------------
  let questionId: string | null = null;
  let attemptId: string | null = null;
  let studentWorkBlock: string;
  let essayTextForPersist: string | null = null;
  let wordCountForPersist: number | null = null;

  if (input.mode === "structured_attempt") {
    attemptId = input.paragraph_attempt_id;
    const { data: attempt, error: attemptErr } = await admin
      .from("paragraph_attempts")
      .select(
        "id, student_id, exam_question_id, topic_sentence, hard_times_analysis, atonement_analysis, ao4_comparison, ao3_context_integration, final_paragraph, quote_pair_id",
      )
      .eq("id", attemptId)
      .maybeSingle();
    if (attemptErr) {
      console.error("paragraph_attempts lookup failed", attemptErr);
      return json(500, { error: "Database error loading attempt" });
    }
    if (!attempt) return json(404, { error: "paragraph_attempt not found" });
    if (attempt.student_id !== userId) {
      return json(404, { error: "paragraph_attempt not found" });
    }
    questionId = attempt.exam_question_id ?? null;
    studentWorkBlock = formatStructuredAttempt(attempt);
    essayTextForPersist = studentWorkBlock;
    wordCountForPersist = wordCountOf(studentWorkBlock);
  } else {
    questionId = input.question_id;
    studentWorkBlock = `STUDENT WORK (${input.mode}):\n\n${input.essay_text}`;
    essayTextForPersist = input.essay_text;
    wordCountForPersist = input.word_count;
  }

  // --- Context block 1: exam question ----------------------------------------
  let question: {
    stem: string;
    family: string;
    likely_core_methods: string[];
    primary_route_id: string | null;
    secondary_route_id: string | null;
  } | null = null;
  if (questionId) {
    const { data, error } = await admin
      .from("questions")
      .select("id, stem, family, likely_core_methods, primary_route_id, secondary_route_id")
      .eq("id", questionId)
      .maybeSingle();
    if (error) {
      console.error("questions lookup failed", error);
    } else if (!data) {
      if (input.mode !== "structured_attempt") return json(404, { error: "question_id not found" });
    } else {
      question = data;
    }
  }
  if (!question) console.warn("Proceeding without question context", { questionId });

  // --- Context block 2: argument routes --------------------------------------
  const routeIds = [question?.primary_route_id, question?.secondary_route_id].filter(
    (x): x is string => !!x,
  );
  const { data: routes } = routeIds.length
    ? await admin
        .from("routes")
        .select("id, name, core_question, hard_times_emphasis, atonement_emphasis, comparative_insight, best_use")
        .in("id", routeIds)
    : { data: [] as never[] };

  // --- Context block 3: comparative matrix -----------------------------------
  const { data: matrix } = await admin
    .from("comparative_matrix")
    .select("axis, hard_times, atonement, divergence, thesis, ao2, ao3, ao4")
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .limit(20);

  // --- Context block 4: levelled thesis exemplars ----------------------------
  const { data: theses } = question?.primary_route_id
    ? await admin
        .from("theses")
        .select("level, thesis_text")
        .eq("route_id", question.primary_route_id)
        .order("level", { ascending: true })
    : { data: [] as never[] };

  // --- Context block 5: glossary + misuse warnings ---------------------------
  const { data: glossary } = await admin
    .from("glossary_terms")
    .select("term, common_misuse_warning, what_to_notice, best_verbs")
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .limit(30);

  // --- Context block 6: quote verification bank ------------------------------
  const { data: quotes } = await admin
    .from("quote_methods")
    .select("quote_text, method, speaker_or_narrator, source_text")
    .eq("is_active", true)
    .in("curation_status", ["strong", "top_band"])
    .order("retrieval_priority", { ascending: true, nullsFirst: false })
    .limit(40);

  // --- Context block 7: interpretive tensions --------------------------------
  const { data: tensions } = await admin
    .from("interpretive_tensions")
    .select("focus, dominant_reading, alternative_reading, interpretive_stem")
    .order("id", { ascending: true })
    .limit(15);

  const systemPrompt = buildSystemPrompt({
    question,
    routes: routes ?? [],
    matrix: matrix ?? [],
    theses: theses ?? [],
    glossary: glossary ?? [],
    quotes: quotes ?? [],
    tensions: tensions ?? [],
    targetGrade: input.target_grade,
    mode: input.mode,
  });

  // --- Anthropic streaming call (SSE) ----------------------------------------
  // All validation above this point returns JSON error responses. Once we
  // open the SSE response below, HTTP errors can no longer be sent, so any
  // failure inside the stream is surfaced as a `data: {"error": ...}` event.

  const encoder = new TextEncoder();
  const allowMissingMarks = input.mode === "paragraph_only";
  const persistCtx: PersistCtx = {
    userId,
    mode: input.mode,
    questionId,
    questionStem: question?.stem ?? null,
    attemptId,
    essayText: essayTextForPersist,
    wordCount: wordCountForPersist,
    targetGrade: input.target_grade,
    allowMissingMarks,
  };

  const readable = new ReadableStream({
    async start(controller) {
      let accumulated = "";
      try {
        const stream = anthropic.messages.stream({
          model: "claude-opus-4-7",
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content:
                `${studentWorkBlock}\n\n` +
                `Return ONLY the section-tagged response specified in the system prompt. ` +
                `No prose, JSON, or markdown outside the section tags.`,
            },
          ],
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = event.delta.text;
            accumulated += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`),
            );
          }
        }

        try {
          const finalMsg = await stream.finalMessage();
          const u = finalMsg.usage as {
            input_tokens: number;
            output_tokens: number;
            cache_creation_input_tokens?: number | null;
            cache_read_input_tokens?: number | null;
          };
          console.log("anthropic_usage", {
            input_tokens: u.input_tokens,
            output_tokens: u.output_tokens,
            cache_creation_input_tokens: u.cache_creation_input_tokens ?? 0,
            cache_read_input_tokens: u.cache_read_input_tokens ?? 0,
          });
        } catch (logErr) {
          console.warn("usage log failed", logErr);
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        console.error("Anthropic stream failed", err);
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream failed" })}\n\n`,
            ),
          );
          controller.close();
        } catch {
          // controller already closed — nothing to do.
        }
        return;
      }

      // Post-stream: reconstruct, validate, persist. The HTTP response has
      // already completed from the client's perspective, so failures here
      // are logged but do not throw.
      try {
        await postStream(accumulated, admin, persistCtx);
      } catch (err) {
        console.error("postStream failed", err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
});

// --- Post-stream reconstruction + persistence ---------------------------------

type PersistCtx = {
  userId: string;
  mode: ValidatedInput["mode"];
  questionId: string | null;
  questionStem: string | null;
  attemptId: string | null;
  essayText: string | null;
  wordCount: number | null;
  targetGrade: string;
  allowMissingMarks: boolean;
};

async function postStream(
  accumulated: string,
  admin: SupabaseClient,
  ctx: PersistCtx,
): Promise<void> {
  const reconstructed: Record<string, unknown> = {
    // Always enforce the canonical exam-warning string regardless of what
    // the model produced in the <section:examWarning> tag.
    examWarning: EXAM_WARNING,
    provisionalLevel: extractSection(accumulated, "provisionalLevel"),
    overallSummary: extractSection(accumulated, "overallSummary"),
    aoFeedback: {
      AO1: safeJsonParse(extractSection(accumulated, "AO1"), {}),
      AO2: safeJsonParse(extractSection(accumulated, "AO2"), {}),
      AO3: safeJsonParse(extractSection(accumulated, "AO3"), {}),
      AO4: safeJsonParse(extractSection(accumulated, "AO4"), {}),
    },
    topStrengths: safeJsonParse<unknown[]>(
      extractSection(accumulated, "topStrengths"),
      [],
    ),
    priorityWeaknesses: safeJsonParse<unknown[]>(
      extractSection(accumulated, "priorityWeaknesses"),
      [],
    ),
    quoteMethodDiagnostic: safeJsonParse<unknown[]>(
      extractSection(accumulated, "quoteMethodDiagnostic"),
      [],
    ),
    modelUpgradeParagraph: extractSection(accumulated, "modelUpgradeParagraph"),
    nextDrill: safeJsonParse(extractSection(accumulated, "nextDrill"), {}),
  };

  if (!ctx.allowMissingMarks) {
    const rawMarks = extractSection(accumulated, "provisionalMarks");
    const parsedMarks = rawMarks != null ? parseInt(rawMarks, 10) : NaN;
    if (Number.isFinite(parsedMarks)) {
      reconstructed.provisionalMarks = parsedMarks;
    } else if (
      typeof reconstructed.provisionalLevel === "string" &&
      reconstructed.provisionalLevel in LEVEL_TO_MARKS
    ) {
      reconstructed.provisionalMarks =
        LEVEL_TO_MARKS[reconstructed.provisionalLevel as LevelLabel];
    }
  }

  const stripped = stripAO5(reconstructed) as Record<string, unknown>;
  // Re-enforce canonical examWarning post-strip in case the regex touched it.
  stripped.examWarning = EXAM_WARNING;

  // Coerce appRoute into the allowed set if the model hallucinated one.
  if (
    stripped.nextDrill &&
    typeof stripped.nextDrill === "object" &&
    stripped.aoFeedback &&
    typeof stripped.aoFeedback === "object"
  ) {
    const nd = stripped.nextDrill as Record<string, unknown>;
    if (
      typeof nd.appRoute !== "string" ||
      !(VALID_APP_ROUTES as readonly string[]).includes(nd.appRoute)
    ) {
      try {
        nd.appRoute = pickDrillRouteForWeakestAO(
          stripped.aoFeedback as Parameters<typeof pickDrillRouteForWeakestAO>[0],
        );
      } catch {
        // aoFeedback may be malformed; fall back to a safe default.
        nd.appRoute = "/paragraph-builder";
      }
    }
  }

  const shape = validateShape(stripped, {
    allowMissingProvisionalMarks: ctx.allowMissingMarks,
  });
  if (!shape.ok) {
    // Stream has already completed; log and skip persistence. The frontend
    // has already rendered whatever sections it could parse.
    console.warn("postStream shape validation failed; skipping persist", {
      errors: shape.errors,
    });
    return;
  }
  const result: MarkerResult = shape.value;

  const { error: insertErr } = await admin.from("essay_marker_results").insert({
    user_id: ctx.userId,
    mode: ctx.mode,
    question_id: ctx.questionId,
    question_stem: ctx.questionStem,
    paragraph_attempt_id: ctx.attemptId,
    essay_text: ctx.essayText,
    word_count: ctx.wordCount,
    target_grade: ctx.targetGrade,
    provisional_level: result.provisionalLevel,
    provisional_marks: result.provisionalMarks ?? null,
    result_json: result,
    model: "claude-opus-4-7",
  });
  if (insertErr) {
    console.error("essay_marker_results insert failed", insertErr);
    return;
  }

  await Promise.all(
    AO_KEYS.map(async (ao: AOKey) => {
      const level = result.aoFeedback[ao].level;
      const newScore = LEVEL_TO_READINESS_SCORE[level];
      if (!newScore) return;
      const { data: current } = await admin
        .from("ao_readiness")
        .select("score")
        .eq("ao", ao)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      const trend = current ? newScore - current.score : 0;
      const { error: upsertErr } = await admin
        .from("ao_readiness")
        .upsert(
          {
            ao,
            user_id: ctx.userId,
            score: newScore,
            trend,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "ao,user_id" },
        );
      if (upsertErr) console.error("ao_readiness upsert failed", { ao, upsertErr });
    }),
  );
}

// --- Helpers ---------------------------------------------------------------

function wordCountOf(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function formatStructuredAttempt(a: {
  topic_sentence: string | null;
  hard_times_analysis: string | null;
  atonement_analysis: string | null;
  ao4_comparison: string | null;
  ao3_context_integration: string | null;
  final_paragraph: string | null;
}): string {
  const sections: string[] = [];
  if (a.topic_sentence) sections.push(`TOPIC SENTENCE:\n${a.topic_sentence}`);
  if (a.hard_times_analysis) sections.push(`HARD TIMES ANALYSIS:\n${a.hard_times_analysis}`);
  if (a.atonement_analysis) sections.push(`ATONEMENT ANALYSIS:\n${a.atonement_analysis}`);
  if (a.ao4_comparison) sections.push(`AO4 COMPARISON:\n${a.ao4_comparison}`);
  if (a.ao3_context_integration) sections.push(`AO3 CONTEXT:\n${a.ao3_context_integration}`);
  if (a.final_paragraph) sections.push(`FINAL PARAGRAPH:\n${a.final_paragraph}`);
  return `STUDENT WORK (structured paragraph attempt):\n\n${sections.join("\n\n")}`;
}

type SystemPromptCtx = {
  question: {
    stem: string;
    family: string;
    likely_core_methods: string[];
    primary_route_id: string | null;
    secondary_route_id: string | null;
  } | null;
  routes: Array<Record<string, unknown>>;
  matrix: Array<Record<string, unknown>>;
  theses: Array<Record<string, unknown>>;
  glossary: Array<Record<string, unknown>>;
  quotes: Array<Record<string, unknown>>;
  tensions: Array<Record<string, unknown>>;
  targetGrade: string;
  mode: ValidatedInput["mode"];
};

type SystemBlock = {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
};

// The static block below MUST stay byte-identical across calls for prompt
// caching to hit. Any interpolation that varies per request (target grade,
// mode, question-specific context) belongs in the dynamic block.
function buildSystemPrompt(ctx: SystemPromptCtx): SystemBlock[] {
  const staticEnvelope = [
    `ROLE AND AO RULES`,
    `You are a strict Pearson Edexcel A-Level English Literature examiner-coach operating against the Component 2: Prose mark scheme.`,
    ``,
    `CRITICAL RULES:`,
    `- Assess AO1, AO2, AO3 and AO4 only. Never mention AO` + `5.`,
    `- Component 2 (Prose) does NOT assess AO` + `5. Reward interpretive sophistication as AO2 precision, never as AO` + `5.`,
    `- Identify whether comparison between Hard Times and Atonement is sustained using the "Comparative Pivot" technique (weaving comparison throughout, rather than sequential parallel blocks).`,
    `- Never invent quotations. Cross-reference every student quotation against the supplied QUOTE BANK. Flag any quotation not found there in quoteMethodDiagnostic with status "unverified" or "paraphrased".`,
    `- Never produce a complete replacement essay. Produce one model upgrade paragraph only — the weakest paragraph in the submitted work.`,
    `- Provisional marks are out of 20. Level→marks: L1→3, L2→7, L3→11, L4→15, L5→19.`,
    ``,
    `PEDAGOGICAL CRITERIA FOR A* (LEVEL 5):`,
    `- Three-Layer Context Model (AO3): Verify that context is analyzed at three levels: (1) Micro close-reading of method, (2) Macro integration showing context as the socio-political "pressure" acting on characters, and (3) Comparative context frames showing how eras speak to each other.`,
    `- Hand-in-Glove Technique (AO3): Penalize "history dumps" or paragraphs starting with historical dates (e.g. "In 1854..."). Context must be introduced through the writer's narrative and thematic intent.`,
    `- Comparative Pivot (AO4): Level 5 requires a synthetic comparative weave. Penalize "history sandwiches" or parallel text blocks. The student must place both texts in continuous dialogue within analytical sentences.`,
    ``,
    `EDEXCEL COMPONENT 2 MARK SCHEME — LEVEL DESCRIPTORS`,
    `Level 1 (1–4): AO1 simple/narrative; AO2 features without analysis; AO3 absent; AO4 no comparison.`,
    `Level 2 (5–8): AO1 some relevant comment; AO2 explanatory not analytical; AO3 mentioned not integrated; AO4 superficial comparison.`,
    `Level 3 (9–12): AO1 explained response; AO2 methods with some development; AO3 linked to meaning in places; AO4 some comparison but may drift to parallel.`,
    `Level 4 (13–16): AO1 perceptive detailed argument; AO2 methods analysed with precision; AO3 integrated; AO4 sustained comparison with divergence.`,
    `Level 5 (17–20): AO1 convincing critical argument; AO2 illuminating precise analysis with interpretive tension; AO3 embedded; AO4 perceptive nuanced comparison.`,
    ``,
    `NARRATIVE FORM REFERENCE — reward these at Level 4/5 AO2:`,
    `Hard Times (Dickens, 1854): third-person omniscient narrator with satirical intrusion; industrial/mechanical imagery as structural device; nomenclature as characterisation; Circus/Fact binary; repetition of "facts" as rhetorical device.`,
    `Atonement (McEwan, 2001): free indirect discourse — Briony's focalisation; retrospective unreliable narration — Part 4 reveal as structural irony; writing as redemption and harm; narrative gap and ellipsis as form; 1935/1940/1999 structure; water/light/fragmentation motifs.`,
    `PENALISE: treating narrative form as decoration. Naming free indirect discourse without showing how it shapes meaning is Level 2–3.`,
    ``,
    `REWARD: sustained comparative argument with clear thesis; accurately attributed evidence; method-led AO2; embedded context; recognition of formal/contextual divergence; interpretive tension (two competing readings) for L5; conceptual register.`,
    `PENALISE AND FLAG: plot summary; vague/paraphrased quotation; invented quotation; bolt-on context; parallel discussion sold as comparison; unsupported authorial-intent claims; device-spotting without analysis; generic statements about Dickens or McEwan.`,
    ``,
    `--- OUTPUT FORMAT ---`,
    `Read the student work (in the user message). Output your response as a sequence of`,
    `tagged sections in EXACTLY this order. Each section is wrapped in`,
    `XML-style tags. Do NOT output a top-level JSON object. Do NOT output`,
    `anything outside the section tags. No prose before, between, or after.`,
    `No markdown fences. Stream the sections in the order shown.`,
    ``,
    `<section:examWarning>${EXAM_WARNING}</section:examWarning>`,
    ``,
    `<section:provisionalLevel>Level N</section:provisionalLevel>`,
    ``,
    `<section:provisionalMarks>N</section:provisionalMarks>`,
    ``,
    `<section:overallSummary>`,
    `3-5 sentences of holistic feedback here.`,
    `</section:overallSummary>`,
    ``,
    `<section:AO1>`,
    `{"level":"Level N","strength":"...","weakness":"...","nextAction":"..."}`,
    `</section:AO1>`,
    ``,
    `<section:AO2>`,
    `{"level":"Level N","strength":"...","weakness":"...","nextAction":"..."}`,
    `</section:AO2>`,
    ``,
    `<section:AO3>`,
    `{"level":"Level N","strength":"...","weakness":"...","nextAction":"..."}`,
    `</section:AO3>`,
    ``,
    `<section:AO4>`,
    `{"level":"Level N","strength":"...","weakness":"...","nextAction":"..."}`,
    `</section:AO4>`,
    ``,
    `<section:topStrengths>`,
    `["strength one","strength two","strength three"]`,
    `</section:topStrengths>`,
    ``,
    `<section:priorityWeaknesses>`,
    `["weakness one","weakness two"]`,
    `</section:priorityWeaknesses>`,
    ``,
    `<section:quoteMethodDiagnostic>`,
    `[]`,
    `</section:quoteMethodDiagnostic>`,
    ``,
    `<section:modelUpgradeParagraph>`,
    `One complete model upgrade paragraph here.`,
    `</section:modelUpgradeParagraph>`,
    ``,
    `<section:nextDrill>`,
    `{"title":"...","durationMinutes":15,"instructions":"...","appRoute":"/compare"}`,
    `</section:nextDrill>`,
    ``,
    `RULES:`,
    `- examWarning content must always be exactly: ${EXAM_WARNING}`,
    `- provisionalLevel: one of "Level 1","Level 2","Level 3","Level 4","Level 5".`,
    `- AO1/AO2/AO3/AO4 sections contain a JSON OBJECT ONLY — no surrounding text. Keys: level, strength, weakness, nextAction.`,
    `- topStrengths is a JSON array of exactly 3 strings.`,
    `- priorityWeaknesses is a JSON array of exactly 2 strings.`,
    `- quoteMethodDiagnostic is a JSON array (possibly empty) of objects { quote, status, note } where status ∈ "verified"|"unverified"|"paraphrased".`,
    `- modelUpgradeParagraph is ONE rewritten paragraph (the weakest in the student work). Not a full essay.`,
    `- nextDrill is a JSON object: { title, durationMinutes, instructions, appRoute }. appRoute MUST be one of: ${[...VALID_APP_ROUTES].join(", ")}.`,
    `- Do NOT emit a <section:AO` + `5> tag anywhere. Do NOT mention AO` + `5.`,
    `- Do NOT wrap the section tags in a top-level JSON object.`,
    `- Do NOT use markdown code fences.`,
  ].join("\n");

  const marksSectionLine = ctx.mode === "paragraph_only"
    ? "DO NOT emit a <section:provisionalMarks> tag. Paragraph-only marking does not map to /20."
    : "Emit <section:provisionalMarks>N</section:provisionalMarks> where N is an integer 1–20 mapped from provisionalLevel.";

  const dynamicContext = [
    `--- PER-CALL CONTEXT ---`,
    `Student target grade: ${ctx.targetGrade}`,
    `Marking mode: ${ctx.mode}`,
    `Mode-specific marks rule (overrides the generic provisionalMarks template above): ${marksSectionLine}`,
    ``,
    `--- CONTEXT BLOCK 1: EXAM QUESTION ---`,
    ctx.question
      ? `Stem: ${ctx.question.stem}\nFamily: ${ctx.question.family}\nLikely core methods: ${(ctx.question.likely_core_methods ?? []).join(", ")}`
      : `(no question loaded — assess generically against the mark scheme)`,
    ``,
    `--- CONTEXT BLOCK 2: ARGUMENT ROUTES ---`,
    ctx.routes.length
      ? ctx.routes
          .map((r) => `• ${r.name}: ${r.core_question}\n  HT: ${r.hard_times_emphasis}\n  AT: ${r.atonement_emphasis}\n  Insight: ${r.comparative_insight}\n  Best use: ${r.best_use}`)
          .join("\n")
      : "(none)",
    ``,
    `--- CONTEXT BLOCK 3: COMPARATIVE MATRIX (valid arguments) ---`,
    ctx.matrix.length
      ? ctx.matrix.map((m) => `• ${m.axis} | HT: ${m.hard_times} | AT: ${m.atonement} | Divergence: ${m.divergence}`).join("\n")
      : "(none)",
    ``,
    `--- CONTEXT BLOCK 4: LEVELLED THESIS EXEMPLARS ---`,
    ctx.theses.length
      ? ctx.theses.map((t) => `${t.level}: ${t.thesis_text}`).join("\n")
      : "(none)",
    ``,
    `--- CONTEXT BLOCK 5: GLOSSARY + MISUSE WARNINGS ---`,
    ctx.glossary.length
      ? ctx.glossary.map((g) => `• ${g.term} — misuse: ${g.common_misuse_warning ?? "—"} — notice: ${g.what_to_notice ?? "—"}`).join("\n")
      : "(none)",
    ``,
    `--- CONTEXT BLOCK 6: QUOTE VERIFICATION BANK ---`,
    `Cross-reference EVERY quotation in the student work against this list. Any quotation not found here is unverified.`,
    ctx.quotes.length
      ? ctx.quotes.map((q) => `[${q.source_text}] "${q.quote_text}" — ${q.method} (${q.speaker_or_narrator ?? "narrator"})`).join("\n")
      : "(none)",
    ``,
    `--- CONTEXT BLOCK 7: INTERPRETIVE TENSIONS (AO2 L5 markers) ---`,
    ctx.tensions.length
      ? ctx.tensions.map((t) => `• ${t.focus}: dominant=${t.dominant_reading} / alternative=${t.alternative_reading}`).join("\n")
      : "(none)",
  ].join("\n");

  return [
    { type: "text", text: staticEnvelope, cache_control: { type: "ephemeral" } },
    { type: "text", text: dynamicContext },
  ];
}
