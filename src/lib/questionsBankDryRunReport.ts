import type {
  DryRunSummary,
  QuestionImportPayload,
  ValidationIssue,
  ValidationReport,
} from "./questionsBankDryRun";

export type QuestionsBankDryRunReportInput = {
  payloads: QuestionImportPayload[];
  validation: ValidationReport;
  summary: DryRunSummary;
};

function listOrNone(items: string[]): string {
  return items.length > 0 ? items.join(", ") : "none";
}

function checkStatus(ran: boolean, conflicts: string[], skippedReason: string): string {
  if (!ran) return `not run (${skippedReason})`;
  return conflicts.length > 0 ? `failed (${listOrNone(conflicts)})` : "passed";
}

function issuesById(issues: ValidationIssue[]): Map<string, ValidationIssue[]> {
  return issues.reduce((acc, issue) => {
    const current = acc.get(issue.id) ?? [];
    current.push(issue);
    acc.set(issue.id, current);
    return acc;
  }, new Map<string, ValidationIssue[]>());
}

function formatPayload(payload: QuestionImportPayload): string {
  return [
    `- \`${payload.id}\``,
    `family: ${payload.family}`,
    `level: ${payload.level_tag}`,
    `source: ${payload.source_type ?? "(missing)"}`,
    `AO: ${payload.ao_emphasis ?? "(missing)"}`,
  ].join("; ");
}

function formatIssueList(issues: ValidationIssue[]): string {
  if (issues.length === 0) return "- none";
  return issues
    .map((issue) => `- \`${issue.id}\` ${issue.field}: ${issue.message}`)
    .join("\n");
}

function importReadiness(summary: DryRunSummary): { status: string; reason: string } {
  if (summary.validationErrorCount > 0) {
    return {
      status: "BLOCKED, NOT IMPORTABLE",
      reason: "dry-run validation has errors that must be resolved before human approval review",
    };
  }

  return {
    status: "REVIEWABLE, NOT IMPORTABLE",
    reason: "dry-run validation passed, but no explicit approval gate or write-capable importer exists",
  };
}

export function buildQuestionsBankDryRunReport({
  payloads,
  validation,
  summary,
}: QuestionsBankDryRunReportInput): string {
  const errorMap = issuesById(validation.errors);
  const acceptedPayloads = payloads.filter((payload) => !errorMap.has(payload.id));
  const rejectedPayloads = payloads.filter((payload) => errorMap.has(payload.id));
  const readiness = importReadiness(summary);

  return `# Questions Bank Import Dry-Run Review Report

## Summary

- Total questions inspected: ${summary.totalQuestionsInspected}
- Total payloads generated: ${summary.totalPayloadsGenerated}
- Accepted/generated payloads: ${acceptedPayloads.length}
- Rejected/invalid candidates: ${rejectedPayloads.length}
- Validation errors: ${summary.validationErrorCount}
- Warnings: ${summary.warningCount}
- AO compliance: ${summary.aoCompliant ? "passed" : "failed"}
- Duplicate generated IDs: ${listOrNone(summary.duplicateGeneratedIds)}
- Existing-ID conflict check: ${checkStatus(
    summary.existingIdCheckRan,
    summary.conflictingExistingIds,
    "no existing IDs supplied",
  )}
- Source/import-ID conflict check: ${checkStatus(
    summary.sourceIdCheckRan,
    summary.conflictingSourceIds,
    "no source IDs supplied",
  )}

## Import Readiness

Import readiness: ${readiness.status}

Reason: ${readiness.reason}.

No Supabase writes were performed.

## Accepted Payloads

${acceptedPayloads.length > 0 ? acceptedPayloads.map(formatPayload).join("\n") : "- none"}

## Rejected / Invalid Candidates

${rejectedPayloads.length > 0 ? rejectedPayloads.map(formatPayload).join("\n") : "- none"}

## Validation Errors

${formatIssueList(validation.errors)}

## Warnings

${formatIssueList(validation.warnings)}

## Duplicate And Conflict Status

- Duplicate generated IDs: ${listOrNone(summary.duplicateGeneratedIds)}
- Existing-ID conflicts: ${summary.existingIdCheckRan ? listOrNone(summary.conflictingExistingIds) : "not checked"}
- Source/import-ID conflicts: ${summary.sourceIdCheckRan ? listOrNone(summary.conflictingSourceIds) : "not checked"}
- Existing/source checks are informational until a reviewed ID source is supplied.

## Distributions

### Source Type

${Object.entries(summary.sourceTypeDistribution).map(([key, count]) => `- ${key}: ${count}`).join("\n") || "- none"}

### Paper Code

${Object.entries(summary.paperCodeDistribution).map(([key, count]) => `- ${key}: ${count}`).join("\n") || "- none"}

### Text Pairing

${Object.entries(summary.textPairingDistribution).map(([key, count]) => `- ${key}: ${count}`).join("\n") || "- none"}
`;
}
