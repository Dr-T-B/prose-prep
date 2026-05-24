import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { annotatedEssayPracticePack, type Component2AO } from "../src/data/annotatedEssayPracticePack/index";

const outPath = resolve(
  process.cwd(),
  "supabase/migrations/20260524194500_seed_annotated_essay_practice_pack.sql",
);

const quote = (value: string | null | undefined) => {
  if (value === null || value === undefined) return "null";
  return `'${value.replace(/'/g, "''")}'`;
};

const bool = (value: boolean) => (value ? "true" : "false");

const int = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "null";
  return String(value);
};

const textArray = (values: readonly string[]) => {
  if (values.length === 0) return "'{}'::text[]";
  return `array[${values.map(quote).join(", ")}]::text[]`;
};

const aoArray = (values: readonly Component2AO[]) => textArray(values);

const tuple = (values: string[]) => `  (${values.join(", ")})`;

const valuesBlock = (rows: string[][]) => rows.map(tuple).join(",\n");

const stemFunction = (aoFocus: readonly Component2AO[]) => {
  if (aoFocus.includes("AO2")) return "method_analysis";
  if (aoFocus.includes("AO3")) return "context";
  if (aoFocus.includes("AO4")) return "comparison";
  return "opening";
};

const levelLabel = (level: string) => level;

const textFocus = (characters: readonly string[]) => {
  const hasHardTimes = characters.some((item) =>
    ["Louisa", "Tom", "Sissy", "Gradgrind", "Bitzer", "Stephen", "Bounderby", "Coketown"].some((needle) =>
      item.includes(needle),
    ),
  );
  const hasAtonement = characters.some((item) =>
    ["Briony", "Robbie", "Cecilia", "Lola", "Marshall", "Tallis"].some((needle) => item.includes(needle)),
  );
  if (hasHardTimes && hasAtonement) return "Comparative";
  if (hasHardTimes) return "Hard Times";
  if (hasAtonement) return "Atonement";
  return "Comparative";
};

let sortOrder = 5000;

const sql = `-- Seed Annotated Paper 2 Essay Practice Pack — Hard Times / Atonement
-- Generated from src/data/annotatedEssayPracticePack/index.ts.
-- Content remains marked teacher review required and reviewed=false.

begin;

insert into public.essay_questions (
  id, paper_code, component, exam_board, year, question_text, theme, marks,
  text_pair, pre_1900_text, post_1900_text, ao_requirements, difficulty_level,
  question_family, likely_routes, linked_quote_cluster_ids, linked_paragraph_stem_ids,
  pitfalls, level_5_upgrade_moves, source, content_type, verification_status,
  reviewed, created_at, updated_at
)
values
${valuesBlock(
  annotatedEssayPracticePack.essay_questions.map((question) => [
    quote(question.id),
    quote(question.paper_code),
    quote(question.component),
    quote(question.exam_board),
    quote(question.year),
    quote(question.question_text),
    quote(question.theme),
    int(question.marks),
    quote(question.text_pair),
    quote(question.pre_1900_text),
    quote(question.post_1900_text),
    aoArray(question.ao_requirements),
    quote(question.difficulty_level),
    quote(question.question_family),
    textArray(question.likely_routes),
    textArray(question.linked_quote_cluster_ids),
    textArray(question.linked_paragraph_stem_ids),
    textArray(question.pitfalls),
    textArray(question.level_5_upgrade_moves),
    quote(question.provenance.source),
    quote(question.provenance.content_type),
    quote(question.provenance.verification_status),
    bool(question.provenance.reviewed),
    quote(question.created_at),
    quote(question.updated_at),
  ]),
)}
on conflict (id) do update set
  paper_code = excluded.paper_code,
  component = excluded.component,
  exam_board = excluded.exam_board,
  year = excluded.year,
  question_text = excluded.question_text,
  theme = excluded.theme,
  marks = excluded.marks,
  text_pair = excluded.text_pair,
  pre_1900_text = excluded.pre_1900_text,
  post_1900_text = excluded.post_1900_text,
  ao_requirements = excluded.ao_requirements,
  difficulty_level = excluded.difficulty_level,
  question_family = excluded.question_family,
  likely_routes = excluded.likely_routes,
  linked_quote_cluster_ids = excluded.linked_quote_cluster_ids,
  linked_paragraph_stem_ids = excluded.linked_paragraph_stem_ids,
  pitfalls = excluded.pitfalls,
  level_5_upgrade_moves = excluded.level_5_upgrade_moves,
  source = excluded.source,
  content_type = excluded.content_type,
  verification_status = excluded.verification_status,
  reviewed = excluded.reviewed,
  updated_at = now();

insert into public.annotated_essays (
  id, question_id, title, essay_type, target_band, estimated_mark_range,
  timed_condition_minutes, word_count_band, thesis, full_essay_text,
  examiner_summary, strengths, risks, upgrade_targets, student_realism_note,
  source, content_type, verification_status, reviewed, created_at, updated_at
)
values
${valuesBlock(
  annotatedEssayPracticePack.annotated_essays.map((essay) => [
    quote(essay.id),
    quote(essay.question_id),
    quote(essay.title),
    quote(essay.essay_type),
    quote(essay.target_band),
    quote(essay.estimated_mark_range),
    int(essay.timed_condition_minutes),
    quote(essay.word_count_band),
    quote(essay.thesis),
    quote(essay.full_essay_text),
    quote(essay.examiner_summary),
    textArray(essay.strengths),
    textArray(essay.risks),
    textArray(essay.upgrade_targets),
    quote(essay.student_realism_note),
    quote(essay.provenance.source),
    quote(essay.provenance.content_type),
    quote(essay.provenance.verification_status),
    bool(essay.provenance.reviewed),
    quote(essay.created_at),
    quote(essay.updated_at),
  ]),
)}
on conflict (id) do update set
  question_id = excluded.question_id,
  title = excluded.title,
  essay_type = excluded.essay_type,
  target_band = excluded.target_band,
  estimated_mark_range = excluded.estimated_mark_range,
  timed_condition_minutes = excluded.timed_condition_minutes,
  word_count_band = excluded.word_count_band,
  thesis = excluded.thesis,
  full_essay_text = excluded.full_essay_text,
  examiner_summary = excluded.examiner_summary,
  strengths = excluded.strengths,
  risks = excluded.risks,
  upgrade_targets = excluded.upgrade_targets,
  student_realism_note = excluded.student_realism_note,
  source = excluded.source,
  content_type = excluded.content_type,
  verification_status = excluded.verification_status,
  reviewed = excluded.reviewed,
  updated_at = now();

insert into public.essay_paragraphs (
  id, essay_id, paragraph_number, paragraph_function, comparative_focus,
  main_argument, hard_times_focus, atonement_focus, key_methods, key_contexts,
  paragraph_text, ao_coverage, examiner_comment, upgrade_target, created_at, updated_at
)
values
${valuesBlock(
  annotatedEssayPracticePack.essay_paragraphs.map((paragraph) => [
    quote(paragraph.id),
    quote(paragraph.essay_id),
    int(paragraph.paragraph_number),
    quote(paragraph.paragraph_function),
    quote(paragraph.comparative_focus),
    quote(paragraph.main_argument),
    quote(paragraph.hard_times_focus),
    quote(paragraph.atonement_focus),
    textArray(paragraph.key_methods),
    textArray(paragraph.key_contexts),
    quote(paragraph.paragraph_text),
    aoArray(paragraph.ao_coverage),
    quote(paragraph.examiner_comment),
    quote(paragraph.upgrade_target),
    quote("2026-05-24T00:00:00.000Z"),
    quote("2026-05-24T00:00:00.000Z"),
  ]),
)}
on conflict (id) do update set
  essay_id = excluded.essay_id,
  paragraph_number = excluded.paragraph_number,
  paragraph_function = excluded.paragraph_function,
  comparative_focus = excluded.comparative_focus,
  main_argument = excluded.main_argument,
  hard_times_focus = excluded.hard_times_focus,
  atonement_focus = excluded.atonement_focus,
  key_methods = excluded.key_methods,
  key_contexts = excluded.key_contexts,
  paragraph_text = excluded.paragraph_text,
  ao_coverage = excluded.ao_coverage,
  examiner_comment = excluded.examiner_comment,
  upgrade_target = excluded.upgrade_target,
  updated_at = now();

insert into public.paragraph_stems (
  id, stem_text, "function", ao, source_text, text_focus, best_themes,
  level_band, example_use, sort_order, is_active, curation_status,
  theme, question_family, compatible_characters, compatible_quotes,
  method_triggers, context_route, comparison_route, drill_instruction,
  timed_target_minutes, source, content_type, verification_status, reviewed
)
values
${valuesBlock(
  annotatedEssayPracticePack.paragraph_stems.map((stem) => [
    quote(stem.id),
    quote(stem.stem_text),
    quote(stemFunction(stem.ao_focus)),
    aoArray(stem.ao_focus),
    quote("Comparative"),
    quote(textFocus(stem.compatible_characters)),
    textArray([stem.theme]),
    quote(levelLabel(stem.difficulty_level)),
    quote(stem.drill_instruction),
    int((sortOrder += 10)),
    "true",
    quote(stem.difficulty_level),
    quote(stem.theme),
    quote(stem.question_family),
    textArray(stem.compatible_characters),
    textArray(stem.compatible_quotes),
    textArray(stem.method_triggers),
    quote(stem.context_route),
    quote(stem.comparison_route),
    quote(stem.drill_instruction),
    int(stem.timed_target_minutes),
    quote(stem.provenance.source),
    quote(stem.provenance.content_type),
    quote(stem.provenance.verification_status),
    bool(stem.provenance.reviewed),
  ]),
)}
on conflict (id) do update set
  stem_text = excluded.stem_text,
  "function" = excluded."function",
  ao = excluded.ao,
  source_text = excluded.source_text,
  text_focus = excluded.text_focus,
  best_themes = excluded.best_themes,
  level_band = excluded.level_band,
  example_use = excluded.example_use,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  curation_status = excluded.curation_status,
  theme = excluded.theme,
  question_family = excluded.question_family,
  compatible_characters = excluded.compatible_characters,
  compatible_quotes = excluded.compatible_quotes,
  method_triggers = excluded.method_triggers,
  context_route = excluded.context_route,
  comparison_route = excluded.comparison_route,
  drill_instruction = excluded.drill_instruction,
  timed_target_minutes = excluded.timed_target_minutes,
  source = excluded.source,
  content_type = excluded.content_type,
  verification_status = excluded.verification_status,
  reviewed = excluded.reviewed,
  updated_at = now();

insert into public.ao_annotations (
  id, essay_id, paragraph_id, annotation_order, text_span, ao_tags,
  explanation, why_it_scores, improvement_note, annotation_type, created_at, updated_at
)
values
${valuesBlock(
  annotatedEssayPracticePack.ao_annotations.map((annotation) => [
    quote(annotation.id),
    quote(annotation.essay_id),
    quote(annotation.paragraph_id),
    int(annotation.annotation_order),
    quote(annotation.text_span),
    aoArray(annotation.ao_tags),
    quote(annotation.explanation),
    quote(annotation.why_it_scores),
    quote(annotation.improvement_note),
    quote(annotation.annotation_type),
    quote("2026-05-24T00:00:00.000Z"),
    quote("2026-05-24T00:00:00.000Z"),
  ]),
)}
on conflict (id) do update set
  essay_id = excluded.essay_id,
  paragraph_id = excluded.paragraph_id,
  annotation_order = excluded.annotation_order,
  text_span = excluded.text_span,
  ao_tags = excluded.ao_tags,
  explanation = excluded.explanation,
  why_it_scores = excluded.why_it_scores,
  improvement_note = excluded.improvement_note,
  annotation_type = excluded.annotation_type,
  updated_at = now();

insert into public.quote_method_links (
  id, quotation, speaker_or_narrative_location, text, character, method,
  theme, essay_question_id, paragraph_stem_id, ao2_explanation,
  ao4_comparative_partner, quote_type, verification_status, source,
  content_type, reviewed, created_at, updated_at
)
values
${valuesBlock(
  annotatedEssayPracticePack.quote_method_links.map((link) => [
    quote(link.id),
    quote(link.quotation),
    quote(link.speaker_or_narrative_location),
    quote(link.text),
    quote(link.character),
    quote(link.method),
    quote(link.theme),
    quote(link.essay_question_id),
    quote(link.paragraph_stem_id),
    quote(link.ao2_explanation),
    quote(link.ao4_comparative_partner),
    quote(link.quote_type),
    quote(link.verification_status),
    quote(link.provenance.source),
    quote(link.provenance.content_type),
    bool(link.provenance.reviewed),
    quote("2026-05-24T00:00:00.000Z"),
    quote("2026-05-24T00:00:00.000Z"),
  ]),
)}
on conflict (id) do update set
  quotation = excluded.quotation,
  speaker_or_narrative_location = excluded.speaker_or_narrative_location,
  text = excluded.text,
  character = excluded.character,
  method = excluded.method,
  theme = excluded.theme,
  essay_question_id = excluded.essay_question_id,
  paragraph_stem_id = excluded.paragraph_stem_id,
  ao2_explanation = excluded.ao2_explanation,
  ao4_comparative_partner = excluded.ao4_comparative_partner,
  quote_type = excluded.quote_type,
  verification_status = excluded.verification_status,
  source = excluded.source,
  content_type = excluded.content_type,
  reviewed = excluded.reviewed,
  updated_at = now();

insert into public.misconception_upgrades (
  id, weakness, diagnosis, example_problem_sentence, improved_level_5_version,
  linked_drill_id, source, content_type, verification_status, reviewed,
  created_at, updated_at
)
values
${valuesBlock(
  annotatedEssayPracticePack.misconception_upgrades.map((upgrade) => [
    quote(upgrade.id),
    quote(upgrade.weakness),
    quote(upgrade.diagnosis),
    quote(upgrade.example_problem_sentence),
    quote(upgrade.improved_level_5_version),
    quote(upgrade.linked_drill_id),
    quote("ChatGPT session, 24 May 2026"),
    quote("annotated essay practice"),
    quote("teacher review required"),
    "false",
    quote("2026-05-24T00:00:00.000Z"),
    quote("2026-05-24T00:00:00.000Z"),
  ]),
)}
on conflict (id) do update set
  weakness = excluded.weakness,
  diagnosis = excluded.diagnosis,
  example_problem_sentence = excluded.example_problem_sentence,
  improved_level_5_version = excluded.improved_level_5_version,
  linked_drill_id = excluded.linked_drill_id,
  source = excluded.source,
  content_type = excluded.content_type,
  verification_status = excluded.verification_status,
  reviewed = excluded.reviewed,
  updated_at = now();

commit;
`;

writeFileSync(outPath, sql);
console.log(`Wrote ${outPath}`);

