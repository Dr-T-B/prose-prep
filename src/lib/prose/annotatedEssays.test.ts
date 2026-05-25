import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@/types/database.types";
import {
  getAnnotatedEssaysByQuestionId,
  getAoAnnotations,
  getEssayParagraphs,
  getEssayQuestions,
  getParagraphStems,
  loadAnnotatedEssayPracticePack,
} from "./annotatedEssays";

type TableName = keyof Database["public"]["Tables"];
type MockRow = Record<string, unknown>;
type QueryResult = { data: MockRow[] | MockRow | null; error: { message: string } | null };

const mockState = vi.hoisted(() => ({
  rows: {} as Record<string, MockRow[]>,
  errors: {} as Record<string, string>,
  calls: [] as Array<{ table: string; op: string; args: unknown[] }>,
}));

vi.mock("@/integrations/supabase/client", () => {
  const readValue = (row: MockRow, key: string) => row[key];

  const createQuery = (table: string) => {
    let rows = [...(mockState.rows[table] ?? [])];

    const query = {
      select: (...args: unknown[]) => {
        mockState.calls.push({ table, op: "select", args });
        return query;
      },
      eq: (field: string, value: unknown) => {
        mockState.calls.push({ table, op: "eq", args: [field, value] });
        rows = rows.filter((row) => readValue(row, field) === value);
        return query;
      },
      not: (field: string, operator: string, value: unknown) => {
        mockState.calls.push({ table, op: "not", args: [field, operator, value] });
        if (operator === "is" && value === null) {
          rows = rows.filter((row) => readValue(row, field) !== null && readValue(row, field) !== undefined);
        }
        return query;
      },
      contains: (field: string, value: unknown[]) => {
        mockState.calls.push({ table, op: "contains", args: [field, value] });
        rows = rows.filter((row) => {
          const rowValue = readValue(row, field);
          return Array.isArray(rowValue) && value.every((item) => rowValue.includes(item));
        });
        return query;
      },
      order: (field: string, options?: { ascending?: boolean }) => {
        mockState.calls.push({ table, op: "order", args: [field, options] });
        rows = [...rows].sort((left, right) => {
          const leftValue = String(readValue(left, field) ?? "");
          const rightValue = String(readValue(right, field) ?? "");
          return options?.ascending === false
            ? rightValue.localeCompare(leftValue)
            : leftValue.localeCompare(rightValue);
        });
        return query;
      },
      maybeSingle: async (): Promise<QueryResult> => ({
        data: rows[0] ?? null,
        error: mockState.errors[table] ? { message: mockState.errors[table] } : null,
      }),
      then: (resolve: (result: QueryResult) => void) =>
        resolve({
          data: rows,
          error: mockState.errors[table] ? { message: mockState.errors[table] } : null,
        }),
    };

    return query;
  };

  return {
    supabase: {
      from: (table: TableName) => createQuery(table),
    },
  };
});

const questionRow = (overrides: Partial<Database["public"]["Tables"]["essay_questions"]["Row"]> = {}) => ({
  id: "eq_live_childhood",
  paper_code: "9ET0/02",
  component: "Component 2 — Prose",
  exam_board: "Pearson Edexcel",
  year: null,
  question_text: "Live question: compare childhood.",
  theme: "childhood",
  marks: 40,
  text_pair: "Hard Times / Atonement",
  pre_1900_text: "Hard Times",
  post_1900_text: "Atonement",
  ao_requirements: ["AO1", "AO2", "AO3", "AO4"],
  difficulty_level: "top_band",
  question_family: "childhood",
  likely_routes: ["route one"],
  linked_quote_cluster_ids: ["quote_cluster"],
  linked_paragraph_stem_ids: ["stem_live_childhood"],
  pitfalls: ["plot-first paragraph"],
  level_5_upgrade_moves: ["argument before evidence"],
  source: "ChatGPT session, 24 May 2026",
  content_type: "annotated essay practice",
  verification_status: "teacher review required",
  reviewed: false,
  created_at: "2026-05-24T00:00:00.000Z",
  updated_at: "2026-05-24T00:00:00.000Z",
  ...overrides,
});

const essayRow = (overrides: Partial<Database["public"]["Tables"]["annotated_essays"]["Row"]> = {}) => ({
  id: "essay_live_childhood",
  question_id: "eq_live_childhood",
  title: "Live Supabase Essay",
  essay_type: "timed-condition model",
  target_band: "Level 5",
  estimated_mark_range: "34-38 / 40",
  timed_condition_minutes: 60,
  word_count_band: "900-1100",
  thesis: "Live thesis from Supabase.",
  full_essay_text: "Live full essay text.",
  examiner_summary: "Live examiner summary.",
  strengths: ["sustained comparison"],
  risks: ["needs quotation check"],
  upgrade_targets: ["tighten method"],
  student_realism_note: "Realistic timed model.",
  source: "ChatGPT session, 24 May 2026",
  content_type: "annotated essay practice",
  verification_status: "teacher review required",
  reviewed: false,
  created_at: "2026-05-24T00:00:00.000Z",
  updated_at: "2026-05-24T00:00:00.000Z",
  ...overrides,
});

const paragraphRow = (
  paragraphNumber: number,
  overrides: Partial<Database["public"]["Tables"]["essay_paragraphs"]["Row"]> = {},
) => ({
  id: `para_live_${paragraphNumber}`,
  essay_id: "essay_live_childhood",
  paragraph_number: paragraphNumber,
  paragraph_function: `function ${paragraphNumber}`,
  comparative_focus: "childhood",
  main_argument: "live paragraph argument",
  hard_times_focus: "Hard Times focus",
  atonement_focus: "Atonement focus",
  key_methods: ["focalisation"],
  key_contexts: ["education"],
  paragraph_text: `Live paragraph ${paragraphNumber}`,
  ao_coverage: ["AO1", "AO2", "AO3", "AO4"],
  examiner_comment: "ordered comment",
  upgrade_target: "ordered upgrade",
  created_at: "2026-05-24T00:00:00.000Z",
  updated_at: "2026-05-24T00:00:00.000Z",
  ...overrides,
});

const annotationRow = (
  order: number,
  overrides: Partial<Database["public"]["Tables"]["ao_annotations"]["Row"]> = {},
) => ({
  id: `annotation_live_${order}`,
  essay_id: "essay_live_childhood",
  paragraph_id: "para_live_1",
  annotation_order: order,
  text_span: `span ${order}`,
  ao_tags: ["AO2"],
  explanation: "method explanation",
  why_it_scores: "explains effect",
  improvement_note: "be more precise",
  annotation_type: "AO2 method",
  created_at: "2026-05-24T00:00:00.000Z",
  updated_at: "2026-05-24T00:00:00.000Z",
  ...overrides,
});

const stemRow = (overrides: Partial<Database["public"]["Tables"]["paragraph_stems"]["Row"]> = {}) => ({
  id: "stem_live_childhood",
  stem_text: "Live paragraph stem.",
  ao: ["AO1", "AO2"],
  function: "comparison",
  text_focus: "Hard Times / Atonement",
  best_themes: ["childhood"],
  level_band: "top_band",
  example_use: null,
  is_active: true,
  sort_order: 5010,
  source_text: "Comparative",
  theme: "childhood",
  question_family: "childhood",
  compatible_characters: ["Louisa Gradgrind", "Briony Tallis"],
  compatible_quotes: ["Facts", "just so"],
  method_triggers: ["satire", "focalisation"],
  context_route: "education context",
  comparison_route: "formation versus misformation",
  drill_instruction: "Write for six minutes.",
  timed_target_minutes: 6,
  curation_status: "top_band",
  source: "ChatGPT session, 24 May 2026",
  content_type: "annotated essay practice",
  verification_status: "teacher review required",
  reviewed: false,
  created_at: "2026-05-24T00:00:00.000Z",
  updated_at: "2026-05-24T00:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  mockState.rows = {};
  mockState.errors = {};
  mockState.calls = [];
});

describe("annotated essay Supabase repository", () => {
  it("fetches essay questions from Supabase and preserves Component 2 AO1-AO4 only", async () => {
    mockState.rows.essay_questions = [questionRow({ ao_requirements: ["AO1", "AO2", "AO5"] })];

    const questions = await getEssayQuestions();

    expect(questions).toHaveLength(1);
    expect(questions[0].question_text).toBe("Live question: compare childhood.");
    expect(questions[0].ao_requirements).toEqual(["AO1", "AO2"]);
  });

  it("fetches essays for the selected question", async () => {
    mockState.rows.annotated_essays = [essayRow(), essayRow({ id: "other", question_id: "other_question" })];

    const essays = await getAnnotatedEssaysByQuestionId("eq_live_childhood");

    expect(essays.map((essay) => essay.id)).toEqual(["essay_live_childhood"]);
    expect(essays[0].title).toBe("Live Supabase Essay");
  });

  it("fetches paragraphs in paragraph_number order", async () => {
    mockState.rows.essay_paragraphs = [paragraphRow(2), paragraphRow(1)];

    const paragraphs = await getEssayParagraphs("essay_live_childhood");

    expect(paragraphs.map((paragraph) => paragraph.paragraph_number)).toEqual([1, 2]);
  });

  it("fetches AO annotations in annotation_order order", async () => {
    mockState.rows.ao_annotations = [annotationRow(2), annotationRow(1)];

    const annotations = await getAoAnnotations("essay_live_childhood");

    expect(annotations.map((annotation) => annotation.annotation_order)).toEqual([1, 2]);
  });

  it("fetches paragraph stems with theme and AO filters", async () => {
    mockState.rows.paragraph_stems = [
      stemRow(),
      stemRow({ id: "stem_marriage", theme: "marriage", ao: ["AO3"] }),
    ];

    const stems = await getParagraphStems({ theme: "childhood", aoFocus: "AO2" });

    expect(stems).toHaveLength(1);
    expect(stems[0].id).toBe("stem_live_childhood");
    expect(stems[0].provenance.verification_status).toBe("teacher review required");
  });

  it("falls back to bundled seed data when Supabase returns no essay questions", async () => {
    mockState.rows.essay_questions = [];
    mockState.rows.annotated_essays = [essayRow()];
    mockState.rows.essay_paragraphs = [paragraphRow(1)];
    mockState.rows.ao_annotations = [annotationRow(1)];
    mockState.rows.paragraph_stems = [stemRow()];
    mockState.rows.quote_method_links = [];
    mockState.rows.misconception_upgrades = [];

    const result = await loadAnnotatedEssayPracticePack();

    expect(result.source).toBe("fallback");
    expect(result.pack.title).toMatch(/Annotated Paper 2 Essay Practice Pack/i);
    expect(result.diagnostics[0]).toMatch(/no essay_questions rows/i);
  });
});

