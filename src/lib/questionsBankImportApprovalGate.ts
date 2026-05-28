import { checksumQuestionImportPayloads, type DryRunSummary, type QuestionImportPayload, type ValidationReport } from "./questionsBankDryRun";

export const APPROVAL_STATUS = "APPROVED_FOR_IMPORT_IMPLEMENTATION_ONLY";
export const IMPORT_STATUS = "NOT IMPORTED";

export type QuestionsBankImportApprovalMetadata = {
  approvedBy: string;
  approvedAt: string;
  sourceBranch: string;
  commitSha: string;
  dryRunCommand: string;
  reportCommand: string;
  allowWarnings?: boolean;
};

export type QuestionsBankImportApprovalInput = {
  payloads: QuestionImportPayload[];
  summary: DryRunSummary;
  validation: ValidationReport;
  reportMarkdown: string;
  approval: QuestionsBankImportApprovalMetadata;
};

export type QuestionsBankImportApprovalResult = {
  ok: boolean;
  reasons: string[];
  artifact?: string;
};

function listOrNone(items: string[]): string {
  return items.length > 0 ? items.join(", ") : "none";
}

function checkLine(ran: boolean, conflicts: string[], skippedLabel: string): string {
  if (!ran) return skippedLabel;
  return conflicts.length > 0 ? `failed (${listOrNone(conflicts)})` : "passed";
}

function validateApprovalInput(input: QuestionsBankImportApprovalInput): string[] {
  const { payloads, summary, validation, reportMarkdown, approval } = input;
  const reasons: string[] = [];

  if (!approval.approvedBy.trim()) {
    reasons.push("approvedBy is required.");
  }

  if (payloads.length !== summary.totalPayloadsGenerated) {
    reasons.push("payload count must match the dry-run summary.");
  }

  if (summary.validationErrorCount !== 0 || validation.errors.length !== 0) {
    reasons.push("dry-run validation must have 0 errors.");
  }

  if (!approval.allowWarnings && (summary.warningCount !== 0 || validation.warnings.length !== 0)) {
    reasons.push("dry-run validation must have 0 warnings unless warnings are explicitly allowed.");
  }

  if (!summary.aoCompliant || !validation.aoCompliant) {
    reasons.push("AO compliance must pass for AO1/AO2/AO3/AO4 only.");
  }

  if (summary.duplicateGeneratedIds.length > 0 || validation.duplicateGeneratedIds.length > 0) {
    reasons.push("duplicate generated IDs must be resolved.");
  }

  if (summary.existingIdCheckRan && summary.conflictingExistingIds.length > 0) {
    reasons.push("existing-ID conflict check must be clean when supplied.");
  }

  if (summary.sourceIdCheckRan && summary.conflictingSourceIds.length > 0) {
    reasons.push("source/import-ID conflict check must be clean when supplied.");
  }

  if (!reportMarkdown.includes("Import readiness: REVIEWABLE, NOT IMPORTABLE")) {
    reasons.push("review report must conclude REVIEWABLE, NOT IMPORTABLE.");
  }

  return reasons;
}

function buildApprovalArtifact(input: QuestionsBankImportApprovalInput): string {
  const { payloads, summary, approval } = input;
  const payloadChecksum = checksumQuestionImportPayloads(payloads);

  return `Question Bank Import Approval Artifact

Status: ${APPROVAL_STATUS}
Import status: ${IMPORT_STATUS}
Supabase writes performed: NO
Migrations performed: NO

Dry-run summary:
- inspected: ${summary.totalQuestionsInspected}
- generated: ${summary.totalPayloadsGenerated}
- generatedPayloadCount: ${summary.totalPayloadsGenerated}
- payloadChecksum: ${payloadChecksum}
- errors: ${summary.validationErrorCount}
- warnings: ${summary.warningCount}
- warnings allowed: ${approval.allowWarnings ? "YES" : "NO"}
- AO compliance: ${summary.aoCompliant ? "passed" : "failed"}
- duplicate generated IDs: ${listOrNone(summary.duplicateGeneratedIds)}
- existing-ID conflict check: ${checkLine(
    summary.existingIdCheckRan,
    summary.conflictingExistingIds,
    "not run / no existing IDs supplied",
  )}
- source/import-ID conflict check: ${checkLine(
    summary.sourceIdCheckRan,
    summary.conflictingSourceIds,
    "not run / no source IDs supplied",
  )}

Approval:
- approvedBy: ${approval.approvedBy}
- approvedAt: ${approval.approvedAt}
- sourceBranch: ${approval.sourceBranch}
- commitSha: ${approval.commitSha}
- approvedBranch: ${approval.sourceBranch}
- approvedCommitSha: ${approval.commitSha}
- generatedAt: ${approval.approvedAt}
- dryRunCommand: ${approval.dryRunCommand}
- reportCommand: ${approval.reportCommand}

Important:
This artifact does not import data.
This artifact does not authorize unattended Supabase writes.
A separate importer PR is still required.
`;
}

export function createQuestionsBankImportApprovalArtifact(
  input: QuestionsBankImportApprovalInput,
): QuestionsBankImportApprovalResult {
  const reasons = validateApprovalInput(input);

  if (reasons.length > 0) {
    return { ok: false, reasons };
  }

  return {
    ok: true,
    reasons: [],
    artifact: buildApprovalArtifact(input),
  };
}
