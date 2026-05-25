// useAnnotatedEssayPackContent
//
// Loads the Annotated Essay Pack from Supabase and falls back to the bundled
// seed if any of the seven pack tables errors, returns empty, or is missing
// rows the page needs to render. Student-visible content is filtered so that
// 'draft' and 'retired' rows never reach the UI; 'needs correction' rows do
// flow through (the UI tags them with a warning).
//
// The hook returns a value shaped exactly like the bundled pack so the page
// can swap data sources with no further changes. It is intentionally narrow:
// no writes, no caching of admin-only fields. Admin queries live in their
// own component.

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  annotatedEssayPracticePack,
  PACK_PROVENANCE,
  type AnnotatedContentProvenance,
  type AnnotatedContentVerificationStatus,
  type AnnotatedEssay,
  type AnnotatedEssayPracticePack,
  type AOAnnotation,
  type EssayParagraph,
  type EssayQuestion,
  type MisconceptionUpgrade,
  type ParagraphStem,
  type QuoteMethodLink,
} from "@/data/annotatedEssayPracticePack";

const STUDENT_VISIBLE: ReadonlySet<AnnotatedContentVerificationStatus> = new Set([
  "approved",
  "reviewed",
  "teacher review required",
  "needs correction",
]);

const ANNOTATED_ESSAY_TABLES = [
  "essay_questions",
  "annotated_essays",
  "essay_paragraphs",
  "ao_annotations",
  "paragraph_stems",
  "quote_method_links",
  "misconception_upgrades",
] as const;

type Row = Record<string, unknown>;

function getString(row: Row, key: string, fallback = ""): string {
  const value = row[key];
  return typeof value === "string" ? value : fallback;
}

function getNumber(row: Row, key: string, fallback = 0): number {
  const value = row[key];
  return typeof value === "number" ? value : fallback;
}

function getStringArray(row: Row, key: string): string[] {
  const value = row[key];
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function getFirstStringArray(row: Row, keys: string[]): string[] {
  for (const key of keys) {
    const value = getStringArray(row, key);
    if (value.length > 0) return value;
  }
  return [];
}

function getFirstString(row: Row, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = getString(row, key);
    if (value) return value;
  }
  return fallback;
}

function statusOf(row: Row): AnnotatedContentVerificationStatus {
  const raw = getString(row, "verification_status", "teacher review required");
  if (STUDENT_VISIBLE.has(raw as AnnotatedContentVerificationStatus)) {
    return raw as AnnotatedContentVerificationStatus;
  }
  return "teacher review required";
}

function provenanceFor(row: Row): AnnotatedContentProvenance {
  return {
    source: getString(row, "source", PACK_PROVENANCE.source),
    content_type: "annotated essay practice",
    exam_board: "Pearson Edexcel",
    component: "Component 2 Prose",
    verification_status: statusOf(row),
    reviewed: row.reviewed === true,
  };
}

function isStudentVisible(row: Row): boolean {
  const raw = getString(row, "verification_status", "teacher review required");
  return STUDENT_VISIBLE.has(raw as AnnotatedContentVerificationStatus);
}

export function toEssayQuestion(row: Row): EssayQuestion {
  return {
    id: getString(row, "id"),
    paper_code: "9ET0/02",
    component: "Component 2 — Prose",
    exam_board: "Pearson Edexcel",
    year: typeof row.year === "string" ? row.year : null,
    question_text: getString(row, "question_text"),
    theme: getString(row, "theme"),
    marks: 40,
    text_pair: "Hard Times / Atonement",
    pre_1900_text: "Hard Times",
    post_1900_text: "Atonement",
    ao_requirements: getStringArray(row, "ao_requirements") as EssayQuestion["ao_requirements"],
    difficulty_level: getString(row, "difficulty_level", "secure") as EssayQuestion["difficulty_level"],
    question_family: getString(row, "question_family"),
    likely_routes: getStringArray(row, "likely_routes"),
    linked_quote_cluster_ids: getStringArray(row, "linked_quote_cluster_ids"),
    linked_paragraph_stem_ids: getStringArray(row, "linked_paragraph_stem_ids"),
    pitfalls: getStringArray(row, "pitfalls"),
    level_5_upgrade_moves: getStringArray(row, "level_5_upgrade_moves"),
    created_at: getString(row, "created_at"),
    updated_at: getString(row, "updated_at"),
    provenance: provenanceFor(row),
  };
}

export function toAnnotatedEssay(row: Row): AnnotatedEssay {
  return {
    id: getString(row, "id"),
    question_id: getString(row, "question_id"),
    title: getString(row, "title"),
    essay_type: "timed-condition model",
    target_band: "Level 5",
    estimated_mark_range: getString(row, "estimated_mark_range"),
    timed_condition_minutes: 60,
    word_count_band: getString(row, "word_count_band", "900-1100") as AnnotatedEssay["word_count_band"],
    thesis: getString(row, "thesis"),
    full_essay_text: getString(row, "full_essay_text"),
    examiner_summary: getString(row, "examiner_summary"),
    strengths: getStringArray(row, "strengths"),
    risks: getStringArray(row, "risks"),
    upgrade_targets: getStringArray(row, "upgrade_targets"),
    student_realism_note: getString(row, "student_realism_note"),
    created_at: getString(row, "created_at"),
    updated_at: getString(row, "updated_at"),
    provenance: provenanceFor(row),
  };
}

export function toEssayParagraph(row: Row): EssayParagraph {
  return {
    id: getString(row, "id"),
    essay_id: getString(row, "essay_id"),
    paragraph_number: getNumber(row, "paragraph_number"),
    paragraph_function: getString(row, "paragraph_function"),
    comparative_focus: getString(row, "comparative_focus"),
    main_argument: getString(row, "main_argument"),
    hard_times_focus: getString(row, "hard_times_focus"),
    atonement_focus: getString(row, "atonement_focus"),
    key_methods: getStringArray(row, "key_methods"),
    key_contexts: getStringArray(row, "key_contexts"),
    paragraph_text: getString(row, "paragraph_text"),
    ao_coverage: getStringArray(row, "ao_coverage") as EssayParagraph["ao_coverage"],
    examiner_comment: getString(row, "examiner_comment"),
    upgrade_target: getString(row, "upgrade_target"),
  };
}

export function toAOAnnotation(row: Row): AOAnnotation {
  return {
    id: getString(row, "id"),
    essay_id: getString(row, "essay_id"),
    paragraph_id: getString(row, "paragraph_id"),
    annotation_order: getNumber(row, "annotation_order"),
    text_span: getString(row, "text_span"),
    ao_tags: getStringArray(row, "ao_tags") as AOAnnotation["ao_tags"],
    explanation: getString(row, "explanation"),
    why_it_scores: getString(row, "why_it_scores"),
    improvement_note: getString(row, "improvement_note"),
    annotation_type: getString(row, "annotation_type") as AOAnnotation["annotation_type"],
  };
}

export function toParagraphStem(row: Row): ParagraphStem {
  return {
    id: getString(row, "id"),
    stem_text: getString(row, "stem_text"),
    theme: getString(row, "theme"),
    question_family: getString(row, "question_family"),
    ao_focus: getFirstStringArray(row, ["ao_focus", "ao"]) as ParagraphStem["ao_focus"],
    compatible_characters: getStringArray(row, "compatible_characters"),
    compatible_quotes: getStringArray(row, "compatible_quotes"),
    method_triggers: getStringArray(row, "method_triggers"),
    context_route: getString(row, "context_route"),
    comparison_route: getString(row, "comparison_route"),
    difficulty_level: getFirstString(row, ["difficulty_level", "level_band"], "secure") as ParagraphStem["difficulty_level"],
    drill_instruction: getString(row, "drill_instruction"),
    timed_target_minutes: getNumber(row, "timed_target_minutes"),
    provenance: provenanceFor(row),
  };
}

export function toQuoteMethodLink(row: Row): QuoteMethodLink {
  return {
    id: getString(row, "id"),
    quotation: getString(row, "quotation"),
    speaker_or_narrative_location: getString(row, "speaker_or_narrative_location"),
    text: getString(row, "text") as QuoteMethodLink["text"],
    character: getString(row, "character"),
    method: getString(row, "method"),
    theme: getString(row, "theme"),
    essay_question_id: getString(row, "essay_question_id"),
    paragraph_stem_id: getString(row, "paragraph_stem_id"),
    ao2_explanation: getString(row, "ao2_explanation"),
    ao4_comparative_partner: getString(row, "ao4_comparative_partner"),
    quote_type: getString(row, "quote_type", "quote anchor / paraphrase") as QuoteMethodLink["quote_type"],
    verification_status: statusOf(row),
    provenance: provenanceFor(row),
  };
}

export function toMisconceptionUpgrade(row: Row): MisconceptionUpgrade {
  return {
    id: getString(row, "id"),
    weakness: getString(row, "weakness"),
    diagnosis: getString(row, "diagnosis"),
    example_problem_sentence: getString(row, "example_problem_sentence"),
    improved_level_5_version: getString(row, "improved_level_5_version"),
    linked_drill_id: getString(row, "linked_drill_id"),
  };
}

async function fetchAll(table: string): Promise<Row[]> {
  const { data, error } = await supabase.from(table as never).select("*");
  if (error) throw new Error(`[annotatedEssayPack] ${table}: ${error.message}`);
  return (data as Row[] | null) ?? [];
}

export interface AnnotatedPackResult {
  pack: AnnotatedEssayPracticePack;
  source: "supabase" | "seed";
  /** Reason for falling back to the bundled seed, if applicable. */
  fallbackReason?: string;
}

/**
 * Pure transformation: takes raw row arrays from each pack table, filters out
 * student-hidden statuses ('draft', 'retired'), and returns a pack object plus
 * a 'source' flag. Exported separately so tests can exercise it without a
 * Supabase mock.
 */
export function assembleAnnotatedPack(rows: {
  essay_questions: Row[];
  annotated_essays: Row[];
  essay_paragraphs: Row[];
  ao_annotations: Row[];
  paragraph_stems: Row[];
  quote_method_links: Row[];
  misconception_upgrades: Row[];
}): AnnotatedPackResult | null {
  const visibleQuestions = rows.essay_questions.filter(isStudentVisible).map(toEssayQuestion);
  const visibleEssays = rows.annotated_essays.filter(isStudentVisible).map(toAnnotatedEssay);
  const visibleParagraphs = rows.essay_paragraphs.filter(isStudentVisible).map(toEssayParagraph);
  const visibleAnnotations = rows.ao_annotations.filter(isStudentVisible).map(toAOAnnotation);
  const visibleStems = rows.paragraph_stems.filter(isStudentVisible).map(toParagraphStem);
  const visibleQuotes = rows.quote_method_links.filter(isStudentVisible).map(toQuoteMethodLink);
  const visibleMisconceptions = rows.misconception_upgrades
    .filter(isStudentVisible)
    .map(toMisconceptionUpgrade);

  // Page renders only make sense with at least one essay, question, paragraph
  // and stem to drive their dropdowns. If any of those are empty, the seed is
  // a safer default than a broken UI.
  if (
    visibleQuestions.length === 0 ||
    visibleEssays.length === 0 ||
    visibleParagraphs.length === 0 ||
    visibleStems.length === 0
  ) {
    return null;
  }

  return {
    pack: {
      ...annotatedEssayPracticePack,
      essay_questions: visibleQuestions,
      annotated_essays: visibleEssays,
      essay_paragraphs: visibleParagraphs,
      ao_annotations: visibleAnnotations,
      paragraph_stems: visibleStems,
      quote_method_links: visibleQuotes,
      misconception_upgrades: visibleMisconceptions,
    },
    source: "supabase",
  };
}

export function useAnnotatedEssayPackContent(): AnnotatedPackResult & { isLoading: boolean } {
  const query = useQuery<AnnotatedPackResult>({
    queryKey: ["annotated-essay-pack-content"],
    queryFn: async () => {
      try {
        const [
          essay_questions,
          annotated_essays,
          essay_paragraphs,
          ao_annotations,
          paragraph_stems,
          quote_method_links,
          misconception_upgrades,
        ] = await Promise.all(ANNOTATED_ESSAY_TABLES.map(fetchAll));
        const assembled = assembleAnnotatedPack({
          essay_questions,
          annotated_essays,
          essay_paragraphs,
          ao_annotations,
          paragraph_stems,
          quote_method_links,
          misconception_upgrades,
        });
        if (!assembled) {
          return {
            pack: annotatedEssayPracticePack,
            source: "seed",
            fallbackReason: "Supabase returned no student-visible rows for one or more pack tables.",
          };
        }
        return assembled;
      } catch (err) {
        return {
          pack: annotatedEssayPracticePack,
          source: "seed",
          fallbackReason: err instanceof Error ? err.message : String(err),
        };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // While loading we render the bundled seed so the page stays interactive.
  return {
    pack: query.data?.pack ?? annotatedEssayPracticePack,
    source: query.data?.source ?? "seed",
    fallbackReason: query.data?.fallbackReason,
    isLoading: query.isLoading,
  };
}
