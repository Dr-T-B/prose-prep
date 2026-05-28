#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { QUESTIONS, ROUTES } from "../src/data/seed";
import {
  buildDryRunSummary,
  selectReviewedPriorityQuestions,
  toQuestionImportPayload,
  validateQuestionImportPayloads,
} from "../src/lib/questionsBankDryRun";
import { buildQuestionsBankDryRunReport } from "../src/lib/questionsBankDryRunReport";
import { createQuestionsBankImportApprovalArtifact } from "../src/lib/questionsBankImportApprovalGate";

type CliOptions = {
  approvedBy: string;
  allowWarnings: boolean;
  outPath?: string;
};

function readGitValue(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    approvedBy: "",
    allowWarnings: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--approved-by") {
      options.approvedBy = argv[i + 1] ?? "";
      i += 1;
      continue;
    }

    if (arg === "--allow-warnings") {
      options.allowWarnings = true;
      continue;
    }

    if (arg === "--out") {
      options.outPath = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--help") {
      console.log("Usage: npm run questions:dry-run:approve -- --approved-by <name> [--allow-warnings] [--out <path>]");
      process.exit(0);
    }

    console.error(`Unknown argument: ${arg}`);
    process.exit(1);
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));
const selectedQuestions = selectReviewedPriorityQuestions(QUESTIONS);
const payloads = selectedQuestions.map(toQuestionImportPayload);
const routeIds = new Set(ROUTES.map((route) => route.id));
const validation = validateQuestionImportPayloads(payloads, { routeIds });
const summary = buildDryRunSummary(QUESTIONS.length, payloads, validation);
const reportMarkdown = buildQuestionsBankDryRunReport({ payloads, validation, summary });

const result = createQuestionsBankImportApprovalArtifact({
  summary,
  validation,
  reportMarkdown,
  approval: {
    approvedBy: options.approvedBy,
    approvedAt: new Date().toISOString(),
    sourceBranch: readGitValue(["branch", "--show-current"]),
    commitSha: readGitValue(["rev-parse", "HEAD"]),
    dryRunCommand: "npm run questions:dry-run",
    reportCommand: "npm run questions:dry-run:report",
    allowWarnings: options.allowWarnings,
  },
});

if (!result.ok || !result.artifact) {
  console.error("Question-bank import approval artifact was not created.");
  result.reasons.forEach((reason) => console.error(`- ${reason}`));
  console.error("No Supabase writes were performed.");
  console.error("No migrations were performed.");
  process.exit(1);
}

if (options.outPath) {
  const absoluteOutPath = resolve(process.cwd(), options.outPath);
  mkdirSync(dirname(absoluteOutPath), { recursive: true });
  writeFileSync(absoluteOutPath, result.artifact);
  console.log(`Approval artifact written: ${options.outPath}`);
} else {
  console.log(result.artifact);
}

console.log("No Supabase writes were performed.");
console.log("No migrations were performed.");
