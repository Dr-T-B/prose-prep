// mark-component2-essay
//
// Pearson Edexcel A-Level English Literature, Component 2 (Prose) formative
// AI essay feedback. Returns AO1-AO4 guidance only; no marks, grades, bands,
// levels, scores, model answers, or rewrite paragraphs.

import Anthropic from "npm:@anthropic-ai/sdk@0.30.1";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.95.0";
import {
  EXAM_WARNING,
  extractSection,
  safeJsonParse,
  stripAO5,
  validateInput,
  validateShape,
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
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

type QuestionContext = {
  stem: string;
  family: string;
  likely_core_methods: string[];
  primary_route_id: string | null;
  secondary_route_id: string | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

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
    return json(429, { error: "Rate limit exceeded. Maximum 10 feedback requests per hour." });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Request body must be valid JSON" });
  }
  const validated = validateInput((body ?? {}) as Record<string, unknown>);
  if (!validated.ok) return json(400, { error: validated.error });
  const input = validated.value;

  let questionId: string | null = null;
  let attemptId: string | null = null;
  let studentWorkBlock: string;
  let essayTextForPersist: string | null = null;
  let wordCountForPersist: number | null = null;
  let submittedQuestionStem: string | null = null;

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
    if (!attempt || attempt.student_id !== userId) {
      return json(404, { error: "paragraph_attempt not found" });
    }
    questionId = attempt.exam_question_id ?? null;
    studentWorkBlock = formatStructuredAttempt(attempt);
    essayTextForPersist = studentWorkBlock;
    wordCountForPersist = wordCountOf(studentWorkBlock);
  } else {
    questionId = input.question_id ?? null;
    submittedQuestionStem = input.question_stem ?? null;
    studentWorkBlock = `STUDENT WORK (${input.mode}):\n\n${input.essay_text}`;
    essayTextForPersist = input.essay_text;
    wordCountForPersist = input.word_count;
  }

  let question: QuestionContext | null = null;
  if (submittedQuestionStem) {
    question = {
      stem: submittedQuestionStem,
      family: "Student practice question",
      likely_core_methods: [],
      primary_route_id: null,
      secondary_route_id: null,
    };
  } else if (questionId) {
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

  const routeIds = [question?.primary_route_id, question?.secondary_route_id].filter(
    (x): x is string => !!x,
  );
  const { data: routes } = routeIds.length
    ? await admin
        .from("routes")
        .select("id, name, core_question, hard_times_emphasis, atonement_emphasis, comparative_insight, best_use")
        .in("id", routeIds)
    : { data: [] as never[] };

  const { data: matrix } = await admin
    .from("comparative_matrix")
    .select("axis, hard_times, atonement, divergence, thesis, ao2, ao3, ao4")
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .limit(20);

  const { data: theses } = question?.primary_route_id
    ? await admin
        .from("theses")
        .select("thesis_text")
        .eq("route_id", question.primary_route_id)
    : { data: [] as never[] };

  const { data: glossary } = await admin
    .from("glossary_terms")
    .select("term, common_misuse_warning, what_to_notice, best_verbs")
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .limit(30);

  const { data: quotes } = await admin
    .from("quote_methods")
    .select("quote_text, method, speaker_or_narrator, source_text")
    .eq("is_active", true)
    .in("curation_status", ["strong", "top_band"])
    .order("retrieval_priority", { ascending: true, nullsFirst: false })
    .limit(40);

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
    mode: input.mode,
  });

  if (!anthropic) {
    return json(503, { error: "Feedback provider unavailable. No feedback was generated." });
  }

  const encoder = new TextEncoder();
  const persistCtx: PersistCtx = {
    userId,
    mode: input.mode,
    questionId,
    questionStem: question?.stem ?? submittedQuestionStem,
    attemptId,
    essayText: essayTextForPersist,
    wordCount: wordCountForPersist,
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
          // controller already closed
        }
        return;
      }

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

type PersistCtx = {
  userId: string;
  mode: ValidatedInput["mode"];
  questionId: string | null;
  questionStem: string | null;
  attemptId: string | null;
  essayText: string | null;
  wordCount: number | null;
};

async function postStream(
  accumulated: string,
  admin: SupabaseClient,
  ctx: PersistCtx,
): Promise<void> {
  const reconstructed: Record<string, unknown> = {
    examWarning: EXAM_WARNING,
    summary: extractSection(accumulated, "summary"),
    aoFeedback: {
      AO1: safeJsonParse(extractSection(accumulated, "AO1"), {}),
      AO2: safeJsonParse(extractSection(accumulated, "AO2"), {}),
      AO3: safeJsonParse(extractSection(accumulated, "AO3"), {}),
      AO4: safeJsonParse(extractSection(accumulated, "AO4"), {}),
    },
    strengths: safeJsonParse<unknown[]>(
      extractSection(accumulated, "strengths"),
      [],
    ),
    priorityTargets: safeJsonParse<unknown[]>(
      extractSection(accumulated, "priorityTargets"),
      [],
    ),
    quoteMethodDiagnostic: safeJsonParse<unknown[]>(
      extractSection(accumulated, "quoteMethodDiagnostic"),
      [],
    ),
    revisionPrompts: safeJsonParse<unknown[]>(
      extractSection(accumulated, "revisionPrompts"),
      [],
    ),
    nextStep: extractSection(accumulated, "nextStep"),
  };
  const teacherNotes = extractSection(accumulated, "teacherNotes");
  if (teacherNotes) reconstructed.teacherNotes = teacherNotes;

  const stripped = stripAO5(reconstructed) as Record<string, unknown>;
  stripped.examWarning = EXAM_WARNING;

  const shape = validateShape(stripped);
  if (!shape.ok) {
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
    target_grade: null,
    provisional_level: null,
    provisional_marks: null,
    result_json: result,
    model: "claude-opus-4-7",
  });
  if (insertErr) {
    console.error("essay_marker_results insert failed", insertErr);
  }
}

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
  question: QuestionContext | null;
  routes: Array<Record<string, unknown>>;
  matrix: Array<Record<string, unknown>>;
  theses: Array<Record<string, unknown>>;
  glossary: Array<Record<string, unknown>>;
  quotes: Array<Record<string, unknown>>;
  tensions: Array<Record<string, unknown>>;
  mode: ValidatedInput["mode"];
};

type SystemBlock = {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
};

function promptData(value: unknown): string {
  return JSON.stringify(value ?? "");
}

function buildSystemPrompt(ctx: SystemPromptCtx): SystemBlock[] {
  const staticEnvelope = [
    `ROLE AND AO RULES`,
    `You are a Pearson Edexcel A-Level English Literature formative feedback coach for Component 2: Prose.`,
    ``,
    `CRITICAL RULES:`,
    `- Assess AO1, AO2, AO3 and AO4 only. Never mention AO` + `5.`,
    `- Component 2 (Prose) does NOT assess AO` + `5. Treat interpretive sophistication as AO2 precision, never as AO` + `5.`,
    `- Do not give marks, scores, grades, bands, or level labels.`,
    `- Do not produce a model answer, full rewrite, rewritten paragraph, or model upgrade paragraph.`,
    `- Use the submitted practice question as the focus for all feedback.`,
    `- Identify whether comparison between Hard Times and Atonement is sustained using the Comparative Pivot technique.`,
    `- Never invent quotations. Cross-reference every student quotation against the supplied QUOTE BANK. Flag any quotation not found there in quoteMethodDiagnostic with status "unverified" or "paraphrased".`,
    ``,
    `PEDAGOGICAL CRITERIA FOR STRONG FORMATIVE GUIDANCE:`,
    `- Three-Layer Context Model (AO3): Check whether context is analyzed through method, wider pressure on characters, and comparative context frames showing how eras speak to each other.`,
    `- Hand-in-Glove Technique (AO3): Context must be introduced through the writer's narrative and thematic intent.`,
    `- Comparative Pivot (AO4): Look for a synthetic comparative weave and give a concrete revision target if the two texts are treated separately.`,
    ``,
    `NARRATIVE FORM REFERENCE - use these for AO2 next steps:`,
    `Hard Times (Dickens, 1854): third-person omniscient narrator with satirical intrusion; industrial/mechanical imagery as structural device; nomenclature as characterisation; Circus/Fact binary; repetition of facts as rhetorical device.`,
    `Atonement (McEwan, 2001): free indirect discourse; Briony's focalisation; retrospective unreliable narration; Part 4 reveal as structural irony; writing as redemption and harm; narrative gap and ellipsis as form; 1935/1940/1999 structure; water/light/fragmentation motifs.`,
    ``,
    `--- OUTPUT FORMAT ---`,
    `Read the student work in the user message. Output your response as a sequence of tagged sections in EXACTLY this order. Do NOT output anything outside the section tags. No markdown fences.`,
    ``,
    `<section:examWarning>${EXAM_WARNING}</section:examWarning>`,
    `<section:summary>3-5 sentences of holistic feedback here.</section:summary>`,
    `<section:AO1>{"diagnosticLabel":"argument clarity","strength":"...","nextStep":"..."}</section:AO1>`,
    `<section:AO2>{"diagnosticLabel":"method analysis","strength":"...","nextStep":"..."}</section:AO2>`,
    `<section:AO3>{"diagnosticLabel":"context integration","strength":"...","nextStep":"..."}</section:AO3>`,
    `<section:AO4>{"diagnosticLabel":"comparison","strength":"...","nextStep":"..."}</section:AO4>`,
    `<section:strengths>["strength one","strength two","strength three"]</section:strengths>`,
    `<section:priorityTargets>["target one","target two","target three"]</section:priorityTargets>`,
    `<section:quoteMethodDiagnostic>[]</section:quoteMethodDiagnostic>`,
    `<section:revisionPrompts>["prompt one","prompt two","prompt three"]</section:revisionPrompts>`,
    `<section:nextStep>One concise next step for the student's next practice attempt.</section:nextStep>`,
    ``,
    `RULES:`,
    `- examWarning content must always be exactly: ${EXAM_WARNING}`,
    `- AO1/AO2/AO3/AO4 sections contain a JSON OBJECT ONLY with keys diagnosticLabel, strength, nextStep.`,
    `- strengths, priorityTargets and revisionPrompts are JSON arrays of exactly 3 strings.`,
    `- quoteMethodDiagnostic is a JSON array of objects { quote, status, note } where status is "verified", "unverified" or "paraphrased".`,
    `- Do NOT emit sections named provisionalLevel, provisionalMarks, modelUpgradeParagraph, modelAnswer, rewrittenParagraph, or fullEssay.`,
    `- Do NOT use the words mark, marks, score, grade, band, bands, or level in student-facing content.`,
    `- Do NOT emit a <section:AO` + `5> tag anywhere. Do NOT mention AO` + `5.`,
  ].join("\n");

  const dynamicContext = [
    `--- PER-CALL CONTEXT ---`,
    `Feedback mode: ${ctx.mode}`,
    ``,
    `--- CONTEXT BLOCK 1: EXAM QUESTION ---`,
    ctx.question
      ? [
          `Stem: ${promptData(ctx.question.stem)}`,
          `Family: ${promptData(ctx.question.family)}`,
          `Likely core methods: ${promptData(ctx.question.likely_core_methods ?? [])}`,
        ].join("\n")
      : `(no question loaded - assess generically against the Component 2 criteria)`,
    ``,
    `--- TEXT PAIR ---`,
    `Hard Times, Charles Dickens; Atonement, Ian McEwan.`,
    ``,
    `--- CONTEXT BLOCK 2: ARGUMENT ROUTES ---`,
    ctx.routes.length
      ? ctx.routes
          .map((r) => `- ${r.name}: ${r.core_question}\n  HT: ${r.hard_times_emphasis}\n  AT: ${r.atonement_emphasis}\n  Insight: ${r.comparative_insight}\n  Best use: ${r.best_use}`)
          .join("\n")
      : "(none)",
    ``,
    `--- CONTEXT BLOCK 3: COMPARATIVE MATRIX ---`,
    ctx.matrix.length
      ? ctx.matrix.map((m) => `- ${m.axis} | HT: ${m.hard_times} | AT: ${m.atonement} | Divergence: ${m.divergence}`).join("\n")
      : "(none)",
    ``,
    `--- CONTEXT BLOCK 4: THESIS EXEMPLARS ---`,
    ctx.theses.length
      ? ctx.theses.map((t) => `${t.thesis_text}`).join("\n")
      : "(none)",
    ``,
    `--- CONTEXT BLOCK 5: GLOSSARY + MISUSE WARNINGS ---`,
    ctx.glossary.length
      ? ctx.glossary.map((g) => `- ${g.term} - misuse: ${g.common_misuse_warning ?? "-"} - notice: ${g.what_to_notice ?? "-"}`).join("\n")
      : "(none)",
    ``,
    `--- CONTEXT BLOCK 6: QUOTE VERIFICATION BANK ---`,
    `Cross-reference EVERY quotation in the student work against this list. Any quotation not found here is unverified.`,
    ctx.quotes.length
      ? ctx.quotes.map((q) => `[${q.source_text}] "${q.quote_text}" - ${q.method} (${q.speaker_or_narrator ?? "narrator"})`).join("\n")
      : "(none)",
    ``,
    `--- CONTEXT BLOCK 7: INTERPRETIVE TENSIONS ---`,
    ctx.tensions.length
      ? ctx.tensions.map((t) => `- ${t.focus}: dominant=${t.dominant_reading} / alternative=${t.alternative_reading}`).join("\n")
      : "(none)",
  ].join("\n");

  return [
    { type: "text", text: staticEnvelope, cache_control: { type: "ephemeral" } },
    { type: "text", text: dynamicContext },
  ];
}
