import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";
import {
  annotatedEssayPracticePack,
  type AOAnnotation,
  type AnnotatedContentProvenance,
  type AnnotatedEssay,
  type AnnotatedEssayPracticePack,
  type Component2AO,
  type EssayParagraph,
  type EssayQuestion,
  type MisconceptionUpgrade,
  type ParagraphStem,
  type QuoteMethodLink,
} from "@/data/annotatedEssayPracticePack";

type EssayQuestionRow = Database["public"]["Tables"]["essay_questions"]["Row"];
type AnnotatedEssayRow = Database["public"]["Tables"]["annotated_essays"]["Row"];
type EssayParagraphRow = Database["public"]["Tables"]["essay_paragraphs"]["Row"];
type AOAnnotationRow = Database["public"]["Tables"]["ao_annotations"]["Row"];
type ParagraphStemRow = Database["public"]["Tables"]["paragraph_stems"]["Row"];
type QuoteMethodLinkRow = Database["public"]["Tables"]["quote_method_links"]["Row"];
type MisconceptionUpgradeRow = Database["public"]["Tables"]["misconception_upgrades"]["Row"];

export type AnnotatedEssayDataSource = "supabase" | "fallback";

export type AnnotatedEssayPackLoadResult = {
  pack: AnnotatedEssayPracticePack;
  source: AnnotatedEssayDataSource;
  diagnostics: string[];
};

export type ParagraphStemFilters = {
  theme?: string;
  questionFamily?: string;
  aoFocus?: Component2AO;
  difficultyLevel?: string;
  reviewStatus?: string;
};

export type QuoteMethodLinkFilters = {
  questionId?: string;
  theme?: string;
  paragraphStemId?: string;
};

const COMPONENT2_AOS = new Set<Component2AO>(["AO1", "AO2", "AO3", "AO4"]);
const PACK_TITLE = "Annotated Paper 2 Essay Practice Pack — Hard Times / Atonement";
const PACK_DESCRIPTION =
  "Live Supabase-backed model essays, paragraph annotations, examiner commentary, stems, quote-method links and upgrade drills.";
const AO_POLICY_NOTE =
  "Pearson Edexcel Component 2 Prose uses AO1, AO2, AO3 and AO4 only. Interpretive debate is labelled as interpretive nuance or critical perspective only.";

const warnFallback = (reason: string) => {
  if (import.meta.env.DEV && import.meta.env.MODE !== "test") {
    console.warn(`[ProseCraft] Using bundled annotated essay fallback: ${reason}`);
  }
};

const toComponent2Aos = (values: string[] | null | undefined): Component2AO[] =>
  (values ?? []).filter((value): value is Component2AO => COMPONENT2_AOS.has(value as Component2AO));

const provenanceFrom = (
  row: {
    source?: string | null;
    content_type?: string | null;
    verification_status?: string | null;
    reviewed?: boolean | null;
  },
  fallback: AnnotatedContentProvenance = annotatedEssayPracticePack.provenance,
): AnnotatedContentProvenance => ({
  source: row.source ?? fallback.source,
  content_type: row.content_type ?? fallback.content_type,
  exam_board: fallback.exam_board,
  component: fallback.component,
  verification_status: row.verification_status ?? fallback.verification_status,
  reviewed: row.reviewed ?? fallback.reviewed,
});

const isAnnotatedStemRow = (row: ParagraphStemRow) =>
  Boolean(row.theme && row.question_family && row.drill_instruction);

export const mapEssayQuestionRow = (row: EssayQuestionRow): EssayQuestion => ({
  id: row.id,
  paper_code: row.paper_code,
  component: row.component,
  exam_board: row.exam_board,
  year: row.year,
  question_text: row.question_text,
  theme: row.theme,
  marks: row.marks,
  text_pair: row.text_pair,
  pre_1900_text: row.pre_1900_text,
  post_1900_text: row.post_1900_text,
  ao_requirements: toComponent2Aos(row.ao_requirements),
  difficulty_level: row.difficulty_level,
  question_family: row.question_family,
  likely_routes: row.likely_routes ?? [],
  linked_quote_cluster_ids: row.linked_quote_cluster_ids ?? [],
  linked_paragraph_stem_ids: row.linked_paragraph_stem_ids ?? [],
  pitfalls: row.pitfalls ?? [],
  level_5_upgrade_moves: row.level_5_upgrade_moves ?? [],
  created_at: row.created_at,
  updated_at: row.updated_at,
  provenance: provenanceFrom(row),
});

export const mapAnnotatedEssayRow = (row: AnnotatedEssayRow): AnnotatedEssay => ({
  id: row.id,
  question_id: row.question_id,
  title: row.title,
  essay_type: row.essay_type,
  target_band: row.target_band,
  estimated_mark_range: row.estimated_mark_range ?? "Pending teacher review",
  timed_condition_minutes: row.timed_condition_minutes,
  word_count_band: row.word_count_band,
  thesis: row.thesis,
  full_essay_text: row.full_essay_text,
  examiner_summary: row.examiner_summary,
  strengths: row.strengths ?? [],
  risks: row.risks ?? [],
  upgrade_targets: row.upgrade_targets ?? [],
  student_realism_note: row.student_realism_note ?? "",
  created_at: row.created_at,
  updated_at: row.updated_at,
  provenance: provenanceFrom(row),
});

export const mapEssayParagraphRow = (row: EssayParagraphRow): EssayParagraph => ({
  id: row.id,
  essay_id: row.essay_id,
  paragraph_number: row.paragraph_number,
  paragraph_function: row.paragraph_function,
  comparative_focus: row.comparative_focus,
  main_argument: row.main_argument,
  hard_times_focus: row.hard_times_focus ?? "",
  atonement_focus: row.atonement_focus ?? "",
  key_methods: row.key_methods ?? [],
  key_contexts: row.key_contexts ?? [],
  paragraph_text: row.paragraph_text,
  ao_coverage: toComponent2Aos(row.ao_coverage),
  examiner_comment: row.examiner_comment ?? "",
  upgrade_target: row.upgrade_target ?? "",
});

export const mapAOAnnotationRow = (row: AOAnnotationRow): AOAnnotation => ({
  id: row.id,
  essay_id: row.essay_id,
  paragraph_id: row.paragraph_id,
  annotation_order: row.annotation_order,
  text_span: row.text_span,
  ao_tags: toComponent2Aos(row.ao_tags),
  explanation: row.explanation,
  why_it_scores: row.why_it_scores,
  improvement_note: row.improvement_note ?? "",
  annotation_type: row.annotation_type as AOAnnotation["annotation_type"],
});

export const mapParagraphStemRow = (row: ParagraphStemRow): ParagraphStem => ({
  id: row.id,
  stem_text: row.stem_text,
  theme: row.theme ?? "general",
  question_family: row.question_family ?? row.function,
  ao_focus: toComponent2Aos(row.ao),
  compatible_characters: row.compatible_characters ?? [],
  compatible_quotes: row.compatible_quotes ?? [],
  method_triggers: row.method_triggers ?? [],
  context_route: row.context_route ?? "",
  comparison_route: row.comparison_route ?? "",
  difficulty_level: row.level_band,
  drill_instruction: row.drill_instruction ?? row.example_use ?? "",
  timed_target_minutes: row.timed_target_minutes ?? 6,
  provenance: provenanceFrom(row),
});

export const mapQuoteMethodLinkRow = (row: QuoteMethodLinkRow): QuoteMethodLink => ({
  id: row.id,
  quotation: row.quotation,
  speaker_or_narrative_location: row.speaker_or_narrative_location ?? "",
  text: row.text,
  character: row.character ?? "",
  method: row.method,
  theme: row.theme,
  essay_question_id: row.essay_question_id ?? "",
  paragraph_stem_id: row.paragraph_stem_id ?? "",
  ao2_explanation: row.ao2_explanation,
  ao4_comparative_partner: row.ao4_comparative_partner ?? "",
  quote_type: row.quote_type,
  verification_status: row.verification_status,
  provenance: provenanceFrom(row),
});

export const mapMisconceptionUpgradeRow = (row: MisconceptionUpgradeRow): MisconceptionUpgrade => ({
  id: row.id,
  weakness: row.weakness,
  diagnosis: row.diagnosis,
  example_problem_sentence: row.example_problem_sentence,
  improved_level_5_version: row.improved_level_5_version,
  linked_drill_id: row.linked_drill_id ?? "",
});

export async function getEssayQuestions(): Promise<EssayQuestion[]> {
  const { data, error } = await supabase
    .from("essay_questions")
    .select("*")
    .order("theme", { ascending: true })
    .order("question_family", { ascending: true })
    .order("year", { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapEssayQuestionRow);
}

export async function getEssayQuestionById(id: string): Promise<EssayQuestion | null> {
  const { data, error } = await supabase.from("essay_questions").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapEssayQuestionRow(data) : null;
}

export async function getAnnotatedEssaysByQuestionId(questionId: string): Promise<AnnotatedEssay[]> {
  const { data, error } = await supabase
    .from("annotated_essays")
    .select("*")
    .eq("question_id", questionId)
    .order("created_at", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapAnnotatedEssayRow);
}

export async function getAllAnnotatedEssays(): Promise<AnnotatedEssay[]> {
  const { data, error } = await supabase
    .from("annotated_essays")
    .select("*")
    .order("created_at", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapAnnotatedEssayRow);
}

export async function getEssayParagraphs(essayId: string): Promise<EssayParagraph[]> {
  const { data, error } = await supabase
    .from("essay_paragraphs")
    .select("*")
    .eq("essay_id", essayId)
    .order("paragraph_number", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapEssayParagraphRow);
}

export async function getAllEssayParagraphs(): Promise<EssayParagraph[]> {
  const { data, error } = await supabase
    .from("essay_paragraphs")
    .select("*")
    .order("essay_id", { ascending: true })
    .order("paragraph_number", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapEssayParagraphRow);
}

export async function getAoAnnotations(essayId: string): Promise<AOAnnotation[]> {
  const { data, error } = await supabase
    .from("ao_annotations")
    .select("*")
    .eq("essay_id", essayId)
    .order("annotation_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapAOAnnotationRow);
}

export async function getAllAoAnnotations(): Promise<AOAnnotation[]> {
  const { data, error } = await supabase
    .from("ao_annotations")
    .select("*")
    .order("essay_id", { ascending: true })
    .order("annotation_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapAOAnnotationRow);
}

export async function getParagraphStems(filters: ParagraphStemFilters = {}): Promise<ParagraphStem[]> {
  let query = supabase
    .from("paragraph_stems")
    .select("*")
    .eq("is_active", true)
    .not("theme", "is", null);

  if (filters.theme) query = query.eq("theme", filters.theme);
  if (filters.questionFamily) query = query.eq("question_family", filters.questionFamily);
  if (filters.aoFocus) query = query.contains("ao", [filters.aoFocus]);
  if (filters.difficultyLevel) query = query.eq("level_band", filters.difficultyLevel);
  if (filters.reviewStatus) query = query.eq("verification_status", filters.reviewStatus);

  const { data, error } = await query.order("theme", { ascending: true }).order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).filter(isAnnotatedStemRow).map(mapParagraphStemRow);
}

export async function getQuoteMethodLinks(filters: QuoteMethodLinkFilters = {}): Promise<QuoteMethodLink[]> {
  let query = supabase.from("quote_method_links").select("*");
  if (filters.questionId) query = query.eq("essay_question_id", filters.questionId);
  if (filters.theme) query = query.eq("theme", filters.theme);
  if (filters.paragraphStemId) query = query.eq("paragraph_stem_id", filters.paragraphStemId);

  const { data, error } = await query.order("theme", { ascending: true }).order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapQuoteMethodLinkRow);
}

export async function getMisconceptionUpgrades(): Promise<MisconceptionUpgrade[]> {
  const { data, error } = await supabase
    .from("misconception_upgrades")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapMisconceptionUpgradeRow);
}

export async function loadAnnotatedEssayPracticePack(): Promise<AnnotatedEssayPackLoadResult> {
  try {
    const [questions, essays, paragraphs, annotations, stems, quotes, upgrades] = await Promise.all([
      getEssayQuestions(),
      getAllAnnotatedEssays(),
      getAllEssayParagraphs(),
      getAllAoAnnotations(),
      getParagraphStems(),
      getQuoteMethodLinks(),
      getMisconceptionUpgrades(),
    ]);

    if (questions.length === 0) {
      warnFallback("essay_questions returned no rows");
      return {
        pack: annotatedEssayPracticePack,
        source: "fallback",
        diagnostics: ["Supabase returned no essay_questions rows; bundled seed data is being used."],
      };
    }

    return {
      pack: {
        id: annotatedEssayPracticePack.id,
        title: PACK_TITLE,
        description: PACK_DESCRIPTION,
        provenance: questions[0]?.provenance ?? annotatedEssayPracticePack.provenance,
        ao_policy_note: AO_POLICY_NOTE,
        essay_questions: questions,
        annotated_essays: essays,
        essay_paragraphs: paragraphs,
        ao_annotations: annotations,
        paragraph_stems: stems,
        quote_method_links: quotes,
        misconception_upgrades: upgrades,
      },
      source: "supabase",
      diagnostics: [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown Supabase query failure";
    warnFallback(message);
    return {
      pack: annotatedEssayPracticePack,
      source: "fallback",
      diagnostics: [`Supabase annotated essay query failed; bundled seed data is being used. ${message}`],
    };
  }
}
