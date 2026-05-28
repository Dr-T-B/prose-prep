import { describe, expect, it } from "vitest";
import {
  buildDryRunSummary,
  selectReviewedPriorityQuestions,
  toQuestionImportPayload,
  validateQuestionImportPayloads,
  type LocalQuestionForDryRun,
} from "./questionsBankDryRun";

const baseQuestion: LocalQuestionForDryRun = {
  id: "c2-class-01",
  family: "class",
  stem: "Compare class in Hard Times and Atonement.",
  primary_route_id: "r_class_mechanism",
  secondary_route_id: "r_systems",
  likely_core_methods: ["setting", "dialogue"],
  level_tag: "secure",
  sourceType: "exam-style mock",
  authenticityStatus: "not official; practice mock",
  yearSource: "mock bank 2026",
  paperCode: "9ET0/02",
  textPairing: "Hard Times / Atonement",
  aoEmphasis: "AO3/AO4",
  builderHandoffNotes: "prefill theme: class; route: social conditioning",
};

describe("questions bank dry-run helpers", () => {
  it("selects reviewed priority questions from the local seed metadata", () => {
    const selected = selectReviewedPriorityQuestions([
      { id: "legacy", stem: "Compare ideas." },
      baseQuestion,
    ]);

    expect(selected).toEqual([baseQuestion]);
  });

  it("transforms local camelCase metadata to remote snake_case payload fields", () => {
    const payload = toQuestionImportPayload(baseQuestion);

    expect(payload.source_type).toBe("exam-style mock");
    expect(payload.authenticity_status).toBe("not official; practice mock");
    expect(payload.year_source).toBe("mock bank 2026");
    expect(payload.paper_code).toBe("9ET0/02");
    expect(payload.text_pairing).toBe("Hard Times / Atonement");
    expect(payload.ao_emphasis).toBe("AO3/AO4");
  });

  it("moves builder handoff notes into JSONB metadata", () => {
    const payload = toQuestionImportPayload(baseQuestion);

    expect(payload.metadata).toEqual({
      builder_handoff_notes: "prefill theme: class; route: social conditioning",
      review_notes: [],
      import_batch: "questions-bank-priority-2026-05",
      validation_warnings: [],
    });
  });

  it("validates allowed source types", () => {
    const payload = toQuestionImportPayload({
      ...baseQuestion,
      sourceType: "unverified worksheet",
    });
    const report = validateQuestionImportPayloads([payload]);

    expect(report.errors.some((error) => error.field === "source_type")).toBe(true);
  });

  it("rejects AO5 anywhere in payload strings or metadata", () => {
    const payload = toQuestionImportPayload({
      ...baseQuestion,
      aoEmphasis: "AO5",
    });
    const report = validateQuestionImportPayloads([payload]);

    expect(report.aoCompliant).toBe(false);
    expect(report.errors.some((error) => error.message.includes("AO5 is forbidden"))).toBe(true);
  });

  it("rejects duplicate IDs", () => {
    const payload = toQuestionImportPayload(baseQuestion);
    const report = validateQuestionImportPayloads([payload, payload]);

    expect(report.duplicateIds).toEqual(["c2-class-01"]);
    expect(report.errors.some((error) => error.message === "Duplicate question ID.")).toBe(true);
  });

  it("produces summary counts and distributions", () => {
    const payload = toQuestionImportPayload(baseQuestion);
    const report = validateQuestionImportPayloads([payload]);
    const summary = buildDryRunSummary(2, [payload], report);

    expect(summary.totalQuestionsInspected).toBe(2);
    expect(summary.totalPayloadsGenerated).toBe(1);
    expect(summary.validationErrorCount).toBe(0);
    expect(summary.warningCount).toBe(0);
    expect(summary.sourceTypeDistribution).toEqual({ "exam-style mock": 1 });
    expect(summary.paperCodeDistribution).toEqual({ "9ET0/02": 1 });
    expect(summary.textPairingDistribution).toEqual({ "Hard Times / Atonement": 1 });
  });
});
