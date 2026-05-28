#!/usr/bin/env node

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { QUESTIONS, ROUTES } from "../src/data/seed";
import {
  buildQuestionsBankLocalDryRun,
  runQuestionsBankLocalImporter,
  type QuestionsBankLocalImportClient,
} from "../src/lib/questionsBankLocalImporter";
import type { QuestionImportPayload } from "../src/lib/questionsBankDryRun";
import type { Database } from "../src/integrations/supabase/types";

type CliOptions = {
  write: boolean;
  approvedBy: string;
  approvalArtifactPath?: string;
  receiptOutPath?: string;
  sourceIdsPath?: string;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    write: false,
    approvedBy: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--write") {
      options.write = true;
      continue;
    }

    if (arg === "--approval-artifact") {
      options.approvalArtifactPath = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--approved-by") {
      options.approvedBy = argv[i + 1] ?? "";
      i += 1;
      continue;
    }

    if (arg === "--receipt-out") {
      options.receiptOutPath = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--source-ids") {
      options.sourceIdsPath = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--help") {
      console.log(
        "Usage: npm run questions:import:local -- [--approval-artifact <path>] [--approved-by <name>] [--source-ids <path>] [--write] [--receipt-out <path>]",
      );
      process.exit(0);
    }

    console.error(`Unknown argument: ${arg}`);
    process.exit(1);
  }

  return options;
}

function readGitValue(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function quoteShellArg(value: string): string {
  return /^[A-Za-z0-9_/:=.,@-]+$/.test(value) ? value : `"${value.replace(/(["\\$`])/g, "\\$1")}"`;
}

function renderCommand(argv: string[]): string {
  const suffix = argv.length > 0 ? ` -- ${argv.map(quoteShellArg).join(" ")}` : "";
  return `npm run questions:import:local${suffix}`;
}

function buildSupabaseClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    const missing = [
      !supabaseUrl ? "SUPABASE_URL (or VITE_SUPABASE_URL)" : null,
      !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
    ].filter(Boolean);

    throw new Error(
      `Missing environment variable(s): ${missing.join(", ")}. ` +
        "This local-only importer requires staging Supabase credentials for approval preflight/write mode.",
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function buildImportClient(supabase: SupabaseClient<Database>): QuestionsBankLocalImportClient {
  return {
    async fetchExistingQuestionIds(ids: string[]) {
      if (ids.length === 0) return [];

      const { data, error } = await supabase
        .from("questions")
        .select("id")
        .in("id", ids);

      if (error) {
        throw new Error(`Failed to check existing question IDs: ${error.message}`);
      }

      return (data ?? []).map((row) => row.id);
    },

    async insertQuestions(payloads: QuestionImportPayload[]) {
      if (payloads.length === 0) return [];

      const { data, error } = await supabase
        .from("questions")
        .insert(payloads)
        .select("id");

      if (error) {
        throw new Error(`Question insert failed: ${error.message}`);
      }

      return (data ?? []).map((row) => row.id);
    },
  };
}

function defaultReceiptPath(timestamp: string): string {
  const safeTimestamp = timestamp.replace(/[:.]/g, "-");
  return `docs/import-receipts/question-bank-import-receipt-${safeTimestamp}.md`;
}

function readSourceIds(path: string | undefined): string[] | undefined {
  if (!path) return undefined;
  const absolutePath = resolve(process.cwd(), path);
  const raw = readFileSync(absolutePath, "utf8");

  if (extname(path).toLowerCase() === ".json") {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
      throw new Error("--source-ids JSON must contain an array of strings.");
    }
    return parsed.map((item) => item.trim()).filter(Boolean);
  }

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

function preflightReceiptPath(receiptPath: string) {
  const absoluteReceiptPath = resolve(process.cwd(), receiptPath);
  if (existsSync(absoluteReceiptPath)) {
    throw new Error(`Import receipt already exists: ${receiptPath}`);
  }

  mkdirSync(dirname(absoluteReceiptPath), { recursive: true });
  const probePath = `${absoluteReceiptPath}.preflight-${process.pid}-${Date.now()}.tmp`;
  writeFileSync(probePath, "receipt preflight\n", { flag: "wx" });
  unlinkSync(probePath);
}

function printDryRunOnly() {
  console.log("DRY RUN ONLY — no Supabase writes performed.");
  console.log("To write, rerun with --write and --approval-artifact <path>.");
  console.log("");
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  const routeIds = new Set(ROUTES.map((route) => route.id));
  const commitSha = readGitValue(["rev-parse", "HEAD"]);
  const currentBranch = readGitValue(["branch", "--show-current"]);
  const timestamp = new Date().toISOString();
  const command = renderCommand(args);
  const sourceIds = readSourceIds(options.sourceIdsPath);
  const receiptPath = options.receiptOutPath ?? defaultReceiptPath(timestamp);

  if (!options.write && !options.approvalArtifactPath) {
    printDryRunOnly();
    const dryRun = buildQuestionsBankLocalDryRun(QUESTIONS, { routeIds, sourceIds });
    console.log(dryRun.reportMarkdown);
    console.log(`Payload checksum: ${dryRun.payloadChecksum}`);
    console.log(`Planned inserts: ${dryRun.payloads.map((payload) => payload.id).join(", ") || "none"}`);
    return;
  }

  const approvalArtifactMarkdown = options.approvalArtifactPath
    ? readFileSync(resolve(process.cwd(), options.approvalArtifactPath), "utf8")
    : undefined;
  const importClient = options.approvalArtifactPath
    ? buildImportClient(buildSupabaseClient())
    : undefined;
  const result = await runQuestionsBankLocalImporter({
    write: options.write,
    approvedBy: options.approvedBy,
    approvalArtifactPath: options.approvalArtifactPath,
    approvalArtifactMarkdown,
    questions: QUESTIONS,
    routeIds,
    sourceIds,
    client: importClient,
    currentBranch,
    command,
    commitSha,
    timestamp,
    env: process.env,
    preflightReceipt: options.write ? async () => preflightReceiptPath(receiptPath) : undefined,
  });

  if (!options.write) {
    printDryRunOnly();
  }

  console.log(result.dryRun.reportMarkdown);
  console.log(`Payload checksum: ${result.dryRun.payloadChecksum}`);
  console.log(`Planned inserts: ${result.plannedIds.join(", ") || "none"}`);

  if (!result.ok) {
    console.error("");
    console.error("Question-bank local import was blocked.");
    result.reasons.forEach((reason) => console.error(`- ${reason}`));
    console.error("No Supabase writes were performed.");
    console.error("No migrations were performed.");
    process.exit(1);
  }

  if (!options.write) {
    console.log("");
    console.log("Approval preflight passed.");
    console.log("No Supabase writes were performed.");
    console.log("No migrations were performed.");
    return;
  }

  if (!result.receipt) {
    throw new Error("Import succeeded but no receipt was generated.");
  }

  const absoluteReceiptPath = resolve(process.cwd(), receiptPath);
  writeFileSync(absoluteReceiptPath, result.receipt);

  console.log("");
  console.log(`Inserted count: ${result.insertedIds.length}`);
  console.log(`Inserted IDs: ${result.insertedIds.join(", ")}`);
  console.log(`Import receipt written: ${receiptPath}`);
  console.log("No migrations were performed.");
}

main().catch((error) => {
  console.error("Question-bank local import failed.");
  console.error(error instanceof Error ? error.message : String(error));
  console.error("No migrations were performed.");
  process.exit(1);
});
