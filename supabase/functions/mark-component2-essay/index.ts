// mark-component2-essay
//
// Pearson Edexcel A-Level English Literature, Component 2 (Prose) — diagnostic
// AI essay marker. Returns structured JSON feedback against AO1–AO4 only.
//
// PR 1 (this file): non-streaming. The frontend calls via
// supabase.functions.invoke('mark-component2-essay', { body: payload }).
// A later PR introduces SSE for progressive section rendering.

import Anthropic from "npm:@anthropic-ai/sdk@0.30.1";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import {
  AO_KEYS,
  EXAM_WARNING,
  LEVEL_TO_MARKS,
  LEVEL_TO_READINESS_SCORE,
  pickDrillRouteForWeakestAO,
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
    .in("level_tag", ["strong", "top_band"])
    .order("id", { ascending: true });

  const systemPrompt = buildSystemPrompt({
    question,
    routes: routes ?? [],
    matrix: matrix ?? [],
    theses: theses ?? [],
    glossary: glossary ?? [],
    quotes: quotes ?? [],
    tensions: tensions ?? [],
    validAppRoutes: [...VALID_APP_ROUTES],
    targetGrade: input.target_grade,
    mode: input.mode,
  });

  // --- Anthropic call ---------------------------------------------------------
  let aiText: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `${studentWorkBlock}\n\nReturn ONLY the JSON object specified in the system prompt. No prose before or after.`,
        },
      ],
    });
    const firstBlock = response.content[0];
    if (!firstBlock || firstBlock.type !== "text") {
      return json(500, { error: "Anthropic returned no text content" });
    }
    aiText = firstBlock.text;
  } catch (err) {
    console.error("Anthropic call failed", err);
    return json(500, { error: "AI model call failed" });
  }

  // --- Parse + AO5 strip + shape validate ------------------------------------
  const parsed = extractJsonObject(aiText);
  if (!parsed) return json(422, { error: "AI response was not valid JSON" });

  const stripped = stripAO5(parsed) as Record<string, unknown>;
  // Force canonical examWarning regardless of what the model produced.
  stripped.examWarning = EXAM_WARNING;
  // Backfill provisionalMarks for non-paragraph_only if the model omitted it.
  const allowMissingMarks = input.mode === "paragraph_only";
  if (!allowMissingMarks && stripped.provisionalMarks === undefined) {
    if (typeof stripped.provisionalLevel === "string" && stripped.provisionalLevel in LEVEL_TO_MARKS) {
      stripped.provisionalMarks = LEVEL_TO_MARKS[stripped.provisionalLevel as LevelLabel];
    }
  }
  // Force appRoute into the allowed list if the model hallucinated one.
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
      nd.appRoute = pickDrillRouteForWeakestAO(
        stripped.aoFeedback as Parameters<typeof pickDrillRouteForWeakestAO>[0],
      );
    }
  }

  const shape = validateShape(stripped, { allowMissingProvisionalMarks: allowMissingMarks });
  if (!shape.ok) {
    console.error("Shape validation failed", shape.errors);
    return json(422, { error: "AI response failed shape validation", details: shape.errors });
  }
  const result: MarkerResult = shape.value;

  // --- Persist ----------------------------------------------------------------
  const { error: insertErr } = await admin.from("essay_marker_results").insert({
    user_id: userId,
    mode: input.mode,
    question_id: questionId,
    question_stem: question?.stem ?? null,
    paragraph_attempt_id: attemptId,
    essay_text: essayTextForPersist,
    word_count: wordCountForPersist,
    target_grade: input.target_grade,
    provisional_level: result.provisionalLevel,
    provisional_marks: result.provisionalMarks ?? null,
    result_json: result,
    model: "claude-opus-4-7",
  });
  if (insertErr) {
    console.error("essay_marker_results insert failed", insertErr);
    return json(500, { error: "Failed to persist result" });
  }

  // --- ao_readiness upsert ----------------------------------------------------
  await Promise.all(
    AO_KEYS.map(async (ao: AOKey) => {
      const level = result.aoFeedback[ao].level;
      const newScore = LEVEL_TO_READINESS_SCORE[level];
      if (!newScore) return;
      const { data: current } = await admin
        .from("ao_readiness")
        .select("score")
        .eq("ao", ao)
        .eq("user_id", userId)
        .maybeSingle();
      const trend = current ? newScore - current.score : 0;
      const { error: upsertErr } = await admin
        .from("ao_readiness")
        .upsert(
          {
            ao,
            user_id: userId,
            score: newScore,
            trend,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "ao,user_id" },
        );
      if (upsertErr) console.error("ao_readiness upsert failed", { ao, upsertErr });
    }),
  );

  return json(200, { result });
});

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

// Best-effort JSON extraction. The model is instructed to return JSON only,
// but it sometimes wraps in ```json ... ``` or adds a leading sentence.
function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : trimmed;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  const slice = candidate.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
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
  validAppRoutes: string[];
  targetGrade: string;
  mode: ValidatedInput["mode"];
};

function buildSystemPrompt(ctx: SystemPromptCtx): string {
  const allowMarksLine = ctx.mode === "paragraph_only"
    ? "DO NOT include a `provisionalMarks` key. Paragraph-only marking does not map to /20."
    : "Include `provisionalMarks` as an integer 1–20 mapped from `provisionalLevel`.";

  return [
    `ROLE AND AO RULES`,
    `You are a strict Pearson Edexcel A-Level English Literature examiner-coach operating against the Component 2: Prose mark scheme.`,
    ``,
    `CRITICAL RULES:`,
    `- Assess AO1, AO2, AO3 and AO4 only. Never mention AO5.`,
    `- Component 2 (Prose) does NOT assess AO5. Reward interpretive sophistication as AO2 precision, never as AO5.`,
    `- Identify whether comparison between Hard Times and Atonement is sustained (AO4). Parallel discussion is not comparison.`,
    `- Never invent quotations. Cross-reference every student quotation against the supplied QUOTE BANK. Flag any quotation not found there in quoteMethodDiagnostic with status "unverified" or "paraphrased".`,
    `- Never produce a complete replacement essay. Produce one model upgrade paragraph only — the weakest paragraph in the submitted work.`,
    `- Provisional marks are out of 20. Level→marks: L1→3, L2→7, L3→11, L4→15, L5→19.`,
    `- Student target grade: ${ctx.targetGrade}`,
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
    ``,
    `--- MARKING TASK ---`,
    `Read the student work below. Return your assessment as a single JSON object with exactly these top-level keys:`,
    `provisionalLevel, ${ctx.mode === "paragraph_only" ? "" : "provisionalMarks, "}overallSummary, aoFeedback, topStrengths, priorityWeaknesses, quoteMethodDiagnostic, modelUpgradeParagraph, nextDrill, examWarning.`,
    `${allowMarksLine}`,
    ``,
    `Shape requirements:`,
    `- provisionalLevel: one of "Level 1","Level 2","Level 3","Level 4","Level 5".`,
    `- aoFeedback: object with exactly keys AO1, AO2, AO3, AO4. Each: { level, strength, weakness, nextAction }. NEVER include AO5.`,
    `- topStrengths: array of strings (3 items).`,
    `- priorityWeaknesses: array of strings (2 items).`,
    `- quoteMethodDiagnostic: array of { quote, status: "verified"|"unverified"|"paraphrased", note }. Empty array if all quotes verified.`,
    `- modelUpgradeParagraph: ONE rewritten paragraph (the weakest in the student work). Not a full essay.`,
    `- nextDrill: { title, durationMinutes, instructions, appRoute }. appRoute MUST be one of: ${ctx.validAppRoutes.join(", ")}.`,
    `- examWarning: exactly "${EXAM_WARNING}"`,
    ``,
    `Return ONLY the JSON object. No prose before or after. No markdown fences.`,
  ].join("\n");
}
