#!/usr/bin/env node

import { QUESTIONS, ROUTES } from "../src/data/seed";
import {
  buildDryRunSummary,
  selectReviewedPriorityQuestions,
  toQuestionImportPayload,
  validateQuestionImportPayloads,
  type ValidationIssue,
} from "../src/lib/questionsBankDryRun";

function renderDistribution(distribution: Record<string, number>): string {
  return Object.entries(distribution)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, count]) => `  ${key}: ${count}`)
    .join("\n");
}

function renderIssues(label: string, issues: ValidationIssue[]): string {
  if (issues.length === 0) return `${label}: none`;
  return [
    `${label}:`,
    ...issues.map((issue) => `  - ${issue.id} ${issue.field}: ${issue.message}`),
  ].join("\n");
}

function renderIdList(ids: string[]): string {
  return ids.length > 0 ? ids.join(", ") : "none";
}

function renderOptionalCheck(ran: boolean, ids: string[], notRunLabel: string): string {
  if (!ran) return notRunLabel;
  return renderIdList(ids);
}

const selectedQuestions = selectReviewedPriorityQuestions(QUESTIONS);
const payloads = selectedQuestions.map(toQuestionImportPayload);
const routeIds = new Set(ROUTES.map((route) => route.id));
const validation = validateQuestionImportPayloads(payloads, { routeIds });
const summary = buildDryRunSummary(QUESTIONS.length, payloads, validation);
const samplePayload = payloads[0] ?? null;

console.log("Questions Bank Supabase Import Dry Run");
console.log("");
console.log(`Total questions inspected: ${summary.totalQuestionsInspected}`);
console.log(`Total payloads generated: ${summary.totalPayloadsGenerated}`);
console.log(`Validation errors: ${summary.validationErrorCount}`);
console.log(`Warnings: ${summary.warningCount}`);
console.log(`Duplicate generated IDs: ${renderIdList(summary.duplicateGeneratedIds)}`);
console.log(`Existing-ID conflict check: ${renderOptionalCheck(
  summary.existingIdCheckRan,
  summary.conflictingExistingIds,
  "not run / no existing IDs supplied",
)}`);
console.log(`Source/import-ID conflict check: ${renderOptionalCheck(
  summary.sourceIdCheckRan,
  summary.conflictingSourceIds,
  "not run / no source IDs supplied",
)}`);
console.log(`AO compliance: ${summary.aoCompliant ? "passed" : "failed"}`);
console.log("");
console.log("Source type distribution:");
console.log(renderDistribution(summary.sourceTypeDistribution));
console.log("");
console.log("Paper code distribution:");
console.log(renderDistribution(summary.paperCodeDistribution));
console.log("");
console.log("Text pairing distribution:");
console.log(renderDistribution(summary.textPairingDistribution));
console.log("");
console.log("Sample payload preview:");
console.log(JSON.stringify(samplePayload, null, 2));
console.log("");
console.log(renderIssues("Validation errors", validation.errors));
console.log(renderIssues("Warnings", validation.warnings));
console.log("");
console.log("No Supabase writes were performed.");

process.exit(validation.errors.length === 0 ? 0 : 1);
