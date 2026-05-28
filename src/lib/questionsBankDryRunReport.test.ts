import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildDryRunSummary,
  toQuestionImportPayload,
  validateQuestionImportPayloads,
  type LocalQuestionForDryRun,
} from "./questionsBankDryRun";
import { buildQuestionsBankDryRunReport } from "./questionsBankDryRunReport";

const validQuestion: LocalQuestionForDryRun = {
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

function reportFor(questions: LocalQuestionForDryRun[], existingIds?: string[]) {
  const payloads = questions.map(toQuestionImportPayload);
  const validation = validateQuestionImportPayloads(payloads, { existingIds });
  const summary = buildDryRunSummary(questions.length, payloads, validation);

  return buildQuestionsBankDryRunReport({ payloads, validation, summary });
}

describe("questions bank dry-run review report", () => {
  it("renders a reviewable but not importable readiness conclusion for valid dry-runs", () => {
    const report = reportFor([validQuestion]);

    expect(report).toContain("Import readiness: REVIEWABLE, NOT IMPORTABLE");
    expect(report).toContain("dry-run validation passed, but no explicit approval gate or write-capable importer exists");
    expect(report).toContain("No Supabase writes were performed.");
  });

  it("surfaces accepted payloads and empty rejected candidates", () => {
    const report = reportFor([validQuestion]);

    expect(report).toContain("Accepted/generated payloads: 1");
    expect(report).toContain("Rejected/invalid candidates: 0");
    expect(report).toContain("## Accepted Payloads");
    expect(report).toContain("`c2-class-01`; family: class");
    expect(report).toContain("## Rejected / Invalid Candidates\n\n- none");
  });

  it("surfaces rejected candidates, validation errors, and AO compliance failures", () => {
    const report = reportFor([{ ...validQuestion, id: "c2-bad-ao", aoEmphasis: "AO6" }]);

    expect(report).toContain("Import readiness: BLOCKED, NOT IMPORTABLE");
    expect(report).toContain("Rejected/invalid candidates: 1");
    expect(report).toContain("AO compliance: failed");
    expect(report).toContain("`c2-bad-ao` ao_emphasis: AO emphasis must reference AO1/AO2/AO3/AO4 only.");
  });

  it("surfaces warnings separately from errors", () => {
    const report = reportFor([{ ...validQuestion, builderHandoffNotes: undefined }]);

    expect(report).toContain("Warnings: 1");
    expect(report).toContain("`c2-class-01` metadata.builder_handoff_notes: Builder handoff notes are missing.");
  });

  it("surfaces duplicate and existing-ID conflict status", () => {
    const report = reportFor([validQuestion, validQuestion], ["c2-class-01"]);

    expect(report).toContain("Duplicate generated IDs: c2-class-01");
    expect(report).toContain("Existing-ID conflict check: failed (c2-class-01)");
    expect(report).toContain("Source/import-ID conflict check: not run (no source IDs supplied)");
  });

  it("explicitly shows skipped existing/source checks", () => {
    const report = reportFor([validQuestion]);

    expect(report).toContain("Existing-ID conflict check: not run (no existing IDs supplied)");
    expect(report).toContain("Source/import-ID conflict check: not run (no source IDs supplied)");
    expect(report).toContain("Existing-ID conflicts: not checked");
    expect(report).toContain("Source/import-ID conflicts: not checked");
  });

  it("keeps the report builder and report CLI local-only", () => {
    const reportSource = readFileSync(resolve(process.cwd(), "src/lib/questionsBankDryRunReport.ts"), "utf8");
    const cliSource = readFileSync(resolve(process.cwd(), "scripts/questions-bank-dry-run.ts"), "utf8");
    const forbiddenWritePatterns = /@\/integrations\/supabase\/client|createClient|supabase\.from|\.(insert|upsert|update|delete)\(|db push|db pull/;

    expect(reportSource).not.toMatch(forbiddenWritePatterns);
    expect(cliSource).not.toMatch(forbiddenWritePatterns);
    expect(cliSource).toContain("--report");
  });
});
