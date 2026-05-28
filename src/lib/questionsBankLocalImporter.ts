import {
  buildDryRunSummary,
  checksumQuestionImportPayloads,
  selectReviewedPriorityQuestions,
  toQuestionImportPayload,
  validateQuestionImportPayloads,
  type DryRunSummary,
  type LocalQuestionForDryRun,
  type QuestionImportPayload,
  type ValidationReport,
} from "./questionsBankDryRun";
import { buildQuestionsBankDryRunReport } from "./questionsBankDryRunReport";
import { APPROVAL_STATUS, IMPORT_STATUS } from "./questionsBankImportApprovalGate";

export type QuestionsBankLocalImportClient = {
  fetchExistingQuestionIds: (ids: string[]) => Promise<string[]>;
  insertQuestions: (payloads: QuestionImportPayload[]) => Promise<string[]>;
};

export type QuestionsBankLocalImportRunInput = {
  write: boolean;
  approvedBy?: string;
  approvalArtifactPath?: string;
  approvalArtifactMarkdown?: string;
  questions: LocalQuestionForDryRun[];
  routeIds?: Set<string>;
  sourceIds?: Iterable<string>;
  client?: QuestionsBankLocalImportClient;
  currentBranch: string;
  command: string;
  commitSha: string;
  timestamp: string;
  env?: Record<string, string | undefined>;
  preflightReceipt?: () => Promise<void>;
};

export type ParsedQuestionBankApprovalArtifact = {
  status?: string;
  importStatus?: string;
  supabaseWritesPerformed?: string;
  migrationsPerformed?: string;
  generatedCount?: number;
  payloadChecksum?: string;
  approvedBy?: string;
  approvedBranch?: string;
  approvedCommitSha?: string;
  generatedAt?: string;
};

export type QuestionsBankLocalDryRun = {
  payloads: QuestionImportPayload[];
  summary: DryRunSummary;
  validation: ValidationReport;
  reportMarkdown: string;
  payloadChecksum: string;
};

export type QuestionsBankLocalImportRunResult = {
  ok: boolean;
  wrote: boolean;
  reasons: string[];
  dryRun: QuestionsBankLocalDryRun;
  approval?: ParsedQuestionBankApprovalArtifact;
  plannedIds: string[];
  insertedIds: string[];
  receipt?: string;
};

function readLine(markdown: string, label: string): string | undefined {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^${escaped}:\\s*(.+?)\\s*$`, "m"));
  return match?.[1]?.trim();
}

function readBullet(markdown: string, label: string): string | undefined {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^-\\s+${escaped}:\\s*(.+?)\\s*$`, "m"));
  return match?.[1]?.trim();
}

export function parseQuestionBankApprovalArtifact(markdown: string): ParsedQuestionBankApprovalArtifact {
  const generated = readBullet(markdown, "generatedPayloadCount") ?? readBullet(markdown, "generated");

  return {
    status: readLine(markdown, "Status"),
    importStatus: readLine(markdown, "Import status"),
    supabaseWritesPerformed: readLine(markdown, "Supabase writes performed"),
    migrationsPerformed: readLine(markdown, "Migrations performed"),
    generatedCount: generated && /^\d+$/.test(generated) ? Number(generated) : undefined,
    payloadChecksum: readBullet(markdown, "payloadChecksum"),
    approvedBy: readBullet(markdown, "approvedBy"),
    approvedBranch: readBullet(markdown, "approvedBranch"),
    approvedCommitSha: readBullet(markdown, "approvedCommitSha"),
    generatedAt: readBullet(markdown, "generatedAt"),
  };
}

export function buildQuestionsBankLocalDryRun(
  questions: LocalQuestionForDryRun[],
  options: {
    routeIds?: Set<string>;
    existingIds?: Iterable<string>;
    sourceIds?: Iterable<string>;
  } = {},
): QuestionsBankLocalDryRun {
  const selectedQuestions = selectReviewedPriorityQuestions(questions);
  const payloads = selectedQuestions.map(toQuestionImportPayload);
  const validation = validateQuestionImportPayloads(payloads, {
    routeIds: options.routeIds,
    existingIds: options.existingIds,
    sourceIds: options.sourceIds,
  });
  const summary = buildDryRunSummary(questions.length, payloads, validation);
  const reportMarkdown = buildQuestionsBankDryRunReport({ payloads, validation, summary });

  return {
    payloads,
    summary,
    validation,
    reportMarkdown,
    payloadChecksum: checksumQuestionImportPayloads(payloads),
  };
}

function sorted(values: string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function sameStringSet(left: string[], right: string[]): boolean {
  const sortedLeft = sorted(left);
  const sortedRight = sorted(right);
  return sortedLeft.length === sortedRight.length && sortedLeft.every((value, index) => value === sortedRight[index]);
}

function validateLocalOnlyEnvironment(env: Record<string, string | undefined> | undefined, write: boolean): string[] {
  if (!write) return [];
  const reasons: string[] = [];

  if (env?.CI === "true") {
    reasons.push("write mode is blocked in CI.");
  }

  if (env?.VERCEL || env?.VERCEL_ENV) {
    reasons.push("write mode is blocked in Vercel environments.");
  }

  return reasons;
}

function validateApprovalArtifact(
  artifact: ParsedQuestionBankApprovalArtifact | undefined,
  dryRun: QuestionsBankLocalDryRun,
  input: Pick<QuestionsBankLocalImportRunInput, "approvedBy" | "commitSha" | "currentBranch">,
): string[] {
  const reasons: string[] = [];

  if (!artifact) {
    reasons.push("approval artifact is required.");
    return reasons;
  }

  if (artifact.status !== APPROVAL_STATUS) {
    reasons.push(`approval artifact status must be ${APPROVAL_STATUS}.`);
  }

  if (artifact.importStatus !== IMPORT_STATUS) {
    reasons.push(`approval artifact import status must be ${IMPORT_STATUS}.`);
  }

  if (artifact.supabaseWritesPerformed !== "NO") {
    reasons.push("approval artifact must confirm Supabase writes performed: NO.");
  }

  if (artifact.migrationsPerformed !== "NO") {
    reasons.push("approval artifact must confirm Migrations performed: NO.");
  }

  if (!input.approvedBy?.trim()) {
    reasons.push("approvedBy is required in write/preflight mode.");
  } else if (artifact.approvedBy && artifact.approvedBy !== input.approvedBy) {
    reasons.push("approvedBy must match the approval artifact.");
  }

  if (typeof artifact.generatedCount !== "number") {
    reasons.push("approval artifact must include generatedPayloadCount.");
  } else if (artifact.generatedCount !== dryRun.summary.totalPayloadsGenerated) {
    reasons.push("fresh dry-run payload count must match the approval artifact.");
  }

  if (!artifact.payloadChecksum) {
    reasons.push("approval artifact must include payloadChecksum.");
  } else if (artifact.payloadChecksum !== dryRun.payloadChecksum) {
    reasons.push("fresh dry-run payload checksum must match the approval artifact.");
  }

  if (!artifact.approvedCommitSha) {
    reasons.push("approval artifact must include approvedCommitSha.");
  } else if (artifact.approvedCommitSha !== input.commitSha) {
    reasons.push("approval artifact approvedCommitSha must match the current commit.");
  }

  if (!artifact.approvedBranch) {
    reasons.push("approval artifact must include approvedBranch.");
  } else if (artifact.approvedBranch !== input.currentBranch) {
    reasons.push("approval artifact approvedBranch must match the current branch.");
  }

  if (!artifact.generatedAt) {
    reasons.push("approval artifact must include generatedAt.");
  }

  return reasons;
}

function validateFreshDryRun(dryRun: QuestionsBankLocalDryRun, options: { requireSourceIdCheck: boolean }): string[] {
  const reasons: string[] = [];
  const { summary, validation, reportMarkdown } = dryRun;

  if (summary.validationErrorCount !== 0 || validation.errors.length !== 0) {
    reasons.push("fresh dry-run validation must have 0 errors.");
  }

  if (summary.warningCount !== 0 || validation.warnings.length !== 0) {
    reasons.push("fresh dry-run validation must have 0 warnings.");
  }

  if (!summary.aoCompliant || !validation.aoCompliant) {
    reasons.push("AO compliance must pass before import.");
  }

  if (summary.duplicateGeneratedIds.length > 0 || validation.duplicateGeneratedIds.length > 0) {
    reasons.push("duplicate generated IDs must be absent before import.");
  }

  if (summary.existingIdCheckRan && summary.conflictingExistingIds.length > 0) {
    reasons.push("existing-ID conflicts must be resolved before import.");
  }

  if (summary.sourceIdCheckRan && summary.conflictingSourceIds.length > 0) {
    reasons.push("source/import-ID conflicts must be resolved before import.");
  }

  if (options.requireSourceIdCheck && !summary.sourceIdCheckRan) {
    reasons.push("source/import-ID conflict check must run before write mode.");
  }

  if (!reportMarkdown.includes("Import readiness: REVIEWABLE, NOT IMPORTABLE")) {
    reasons.push("fresh dry-run report must remain REVIEWABLE, NOT IMPORTABLE.");
  }

  return reasons;
}

export function buildQuestionsBankImportReceipt(input: {
  insertedIds: string[];
  approvedBy: string;
  approvalArtifactPath: string;
  command: string;
  commitSha: string;
  timestamp: string;
}): string {
  return `Question Bank Import Receipt

Import status: IMPORTED
Supabase writes performed: YES
Migrations performed: NO
Inserted count: ${input.insertedIds.length}
Inserted IDs: ${input.insertedIds.join(", ")}
Approved by: ${input.approvedBy}
Approval artifact: ${input.approvalArtifactPath}
Import command: ${input.command}
Commit SHA: ${input.commitSha}
Timestamp: ${input.timestamp}
`;
}

export async function runQuestionsBankLocalImporter(
  input: QuestionsBankLocalImportRunInput,
): Promise<QuestionsBankLocalImportRunResult> {
  const defaultDryRun = buildQuestionsBankLocalDryRun(input.questions, {
    routeIds: input.routeIds,
    sourceIds: input.sourceIds,
  });
  const plannedIds = defaultDryRun.payloads.map((payload) => payload.id);

  if (!input.write && !input.approvalArtifactMarkdown) {
    return {
      ok: true,
      wrote: false,
      reasons: [],
      dryRun: defaultDryRun,
      plannedIds,
      insertedIds: [],
    };
  }

  const setupReasons = validateLocalOnlyEnvironment(input.env, input.write);

  if (input.write && !input.approvalArtifactPath?.trim()) {
    setupReasons.push("approval artifact path is required in write mode.");
  }

  if (!input.approvalArtifactMarkdown?.trim()) {
    setupReasons.push("approval artifact is required.");
  }

  if (input.approvalArtifactMarkdown?.trim() && !input.client) {
    setupReasons.push("Supabase import client is required for approval preflight/write mode.");
  }

  if (input.write && !input.preflightReceipt) {
    setupReasons.push("receipt path preflight is required in write mode.");
  }

  if (setupReasons.length > 0) {
    return {
      ok: false,
      wrote: false,
      reasons: setupReasons,
      dryRun: defaultDryRun,
      plannedIds,
      insertedIds: [],
    };
  }

  const existingIds = await input.client!.fetchExistingQuestionIds(plannedIds);
  const checkedDryRun = buildQuestionsBankLocalDryRun(input.questions, {
    routeIds: input.routeIds,
    existingIds,
    sourceIds: input.sourceIds,
  });
  const artifact = parseQuestionBankApprovalArtifact(input.approvalArtifactMarkdown!);
  const reasons = [
    ...validateApprovalArtifact(artifact, checkedDryRun, input),
    ...validateFreshDryRun(checkedDryRun, { requireSourceIdCheck: input.write }),
  ];

  if (reasons.length > 0) {
    return {
      ok: false,
      wrote: false,
      reasons,
      dryRun: checkedDryRun,
      approval: artifact,
      plannedIds: checkedDryRun.payloads.map((payload) => payload.id),
      insertedIds: [],
    };
  }

  if (!input.write) {
    return {
      ok: true,
      wrote: false,
      reasons: [],
      dryRun: checkedDryRun,
      approval: artifact,
      plannedIds: checkedDryRun.payloads.map((payload) => payload.id),
      insertedIds: [],
    };
  }

  await input.preflightReceipt!();
  const insertedIds = await input.client!.insertQuestions(checkedDryRun.payloads);
  const expectedIds = checkedDryRun.payloads.map((payload) => payload.id);

  if (!sameStringSet(insertedIds, expectedIds)) {
    return {
      ok: false,
      wrote: true,
      reasons: [
        `inserted ID verification failed; expected ${sorted(expectedIds).join(", ")}, received ${sorted(insertedIds).join(", ")}.`,
      ],
      dryRun: checkedDryRun,
      approval: artifact,
      plannedIds: expectedIds,
      insertedIds,
    };
  }

  return {
    ok: true,
    wrote: true,
    reasons: [],
    dryRun: checkedDryRun,
    approval: artifact,
    plannedIds: expectedIds,
    insertedIds,
    receipt: buildQuestionsBankImportReceipt({
      insertedIds,
      approvedBy: input.approvedBy!,
      approvalArtifactPath: input.approvalArtifactPath!,
      command: input.command,
      commitSha: input.commitSha,
      timestamp: input.timestamp,
    }),
  };
}
