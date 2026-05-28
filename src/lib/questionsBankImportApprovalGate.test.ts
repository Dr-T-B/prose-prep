import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildDryRunSummary,
  checksumQuestionImportPayloads,
  toQuestionImportPayload,
  validateQuestionImportPayloads,
  type LocalQuestionForDryRun,
} from "./questionsBankDryRun";
import { buildQuestionsBankDryRunReport } from "./questionsBankDryRunReport";
import { createQuestionsBankImportApprovalArtifact } from "./questionsBankImportApprovalGate";

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

function approvalFor(
  questions: LocalQuestionForDryRun[],
  overrides: {
    reportMarkdown?: string;
    existingIds?: string[];
    sourceIds?: string[];
    allowWarnings?: boolean;
    approvedBy?: string;
  } = {},
) {
  const payloads = questions.map(toQuestionImportPayload);
  const validation = validateQuestionImportPayloads(payloads, {
    existingIds: overrides.existingIds,
    sourceIds: overrides.sourceIds,
  });
  const summary = buildDryRunSummary(questions.length, payloads, validation);
  const reportMarkdown = overrides.reportMarkdown ?? buildQuestionsBankDryRunReport({ payloads, validation, summary });

  return createQuestionsBankImportApprovalArtifact({
    payloads,
    summary,
    validation,
    reportMarkdown,
    approval: {
      approvedBy: overrides.approvedBy ?? "Dr T",
      approvedAt: "2026-05-28T15:45:00.000Z",
      sourceBranch: "feat/questions-bank-import-approval-gate",
      commitSha: "abc123",
      dryRunCommand: "npm run questions:dry-run",
      reportCommand: "npm run questions:dry-run:report",
      allowWarnings: overrides.allowWarnings,
    },
  });
}

describe("questions bank import approval gate", () => {
  it("creates an approval artifact for a clean reviewable dry-run", () => {
    const result = approvalFor([validQuestion]);

    expect(result.ok).toBe(true);
    expect(result.artifact).toContain("Question Bank Import Approval Artifact");
    expect(result.artifact).toContain("Status: APPROVED_FOR_IMPORT_IMPLEMENTATION_ONLY");
    expect(result.artifact).toContain("Import status: NOT IMPORTED");
    expect(result.artifact).toContain("Supabase writes performed: NO");
    expect(result.artifact).toContain("Migrations performed: NO");
    expect(result.artifact).toContain("- approvedBy: Dr T");
    expect(result.artifact).toContain("- generatedPayloadCount: 1");
    expect(result.artifact).toContain(`- payloadChecksum: ${checksumQuestionImportPayloads([toQuestionImportPayload(validQuestion)])}`);
    expect(result.artifact).toContain("- approvedBranch: feat/questions-bank-import-approval-gate");
    expect(result.artifact).toContain("- approvedCommitSha: abc123");
    expect(result.artifact).toContain("- generatedAt: 2026-05-28T15:45:00.000Z");
  });

  it("does not use unsafe import authorization language", () => {
    const result = approvalFor([validQuestion]);

    expect(result.artifact).not.toMatch(/APPROVED_TO_IMPORT|READY_TO_IMPORT|SAFE_TO_IMPORT|IMPORT_NOW/);
    expect(result.artifact).toContain("This artifact does not authorize unattended Supabase writes.");
    expect(result.artifact).toContain("A separate importer PR is still required.");
  });

  it("requires explicit approvedBy metadata", () => {
    const result = approvalFor([validQuestion], { approvedBy: "" });

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("approvedBy is required.");
  });

  it("blocks validation errors and AO compliance failures", () => {
    const result = approvalFor([{ ...validQuestion, aoEmphasis: "AO6" }]);

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("dry-run validation must have 0 errors.");
    expect(result.reasons).toContain("AO compliance must pass for AO1/AO2/AO3/AO4 only.");
  });

  it("blocks warnings unless explicitly allowed", () => {
    const blocked = approvalFor([{ ...validQuestion, builderHandoffNotes: undefined }]);
    const allowed = approvalFor([{ ...validQuestion, builderHandoffNotes: undefined }], { allowWarnings: true });

    expect(blocked.ok).toBe(false);
    expect(blocked.reasons).toContain("dry-run validation must have 0 warnings unless warnings are explicitly allowed.");
    expect(allowed.ok).toBe(true);
    expect(allowed.artifact).toContain("- warnings allowed: YES");
  });

  it("blocks duplicate generated IDs", () => {
    const result = approvalFor([validQuestion, validQuestion]);

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("duplicate generated IDs must be resolved.");
  });

  it("allows skipped existing/source checks but blocks supplied conflicts", () => {
    const skipped = approvalFor([validQuestion]);
    const existingConflict = approvalFor([validQuestion], { existingIds: ["c2-class-01"] });
    const sourceConflict = approvalFor([validQuestion], { sourceIds: ["c2-class-01"] });

    expect(skipped.ok).toBe(true);
    expect(skipped.artifact).toContain("- existing-ID conflict check: not run / no existing IDs supplied");
    expect(skipped.artifact).toContain("- source/import-ID conflict check: not run / no source IDs supplied");
    expect(existingConflict.ok).toBe(false);
    expect(existingConflict.reasons).toContain("existing-ID conflict check must be clean when supplied.");
    expect(sourceConflict.ok).toBe(false);
    expect(sourceConflict.reasons).toContain("source/import-ID conflict check must be clean when supplied.");
  });

  it("requires the review report to remain reviewable and not importable", () => {
    const result = approvalFor([validQuestion], { reportMarkdown: "Import readiness: BLOCKED, NOT IMPORTABLE" });

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("review report must conclude REVIEWABLE, NOT IMPORTABLE.");
  });

  it("keeps the approval gate and CLI local-only", () => {
    const gateSource = readFileSync(resolve(process.cwd(), "src/lib/questionsBankImportApprovalGate.ts"), "utf8");
    const cliSource = readFileSync(resolve(process.cwd(), "scripts/questions-bank-import-approval.ts"), "utf8");
    const forbiddenRemoteWritePatterns = /@\/integrations\/supabase\/client|createClient|supabase\.from|\.(insert|upsert|update|delete)\(|db push|db pull|apply_migration/;

    expect(gateSource).not.toMatch(forbiddenRemoteWritePatterns);
    expect(cliSource).not.toMatch(forbiddenRemoteWritePatterns);
    expect(cliSource).toContain("--approved-by");
    expect(cliSource).toContain("No Supabase writes were performed.");
    expect(cliSource).toContain("No migrations were performed.");
  });
});
