import { describe, expect, it, vi } from "vitest";
import {
  runQuestionsBankLocalImporter,
  type QuestionsBankLocalImportClient,
} from "./questionsBankLocalImporter";
import type { LocalQuestionForDryRun, QuestionImportPayload } from "./questionsBankDryRun";

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

function approvalArtifact(overrides: {
  status?: string;
  importStatus?: string;
  supabaseWrites?: string;
  migrations?: string;
  generated?: number;
  approvedBy?: string;
} = {}) {
  return `Question Bank Import Approval Artifact

Status: ${overrides.status ?? "APPROVED_FOR_IMPORT_IMPLEMENTATION_ONLY"}
Import status: ${overrides.importStatus ?? "NOT IMPORTED"}
Supabase writes performed: ${overrides.supabaseWrites ?? "NO"}
Migrations performed: ${overrides.migrations ?? "NO"}

Dry-run summary:
- generated: ${overrides.generated ?? 1}
- errors: 0
- warnings: 0
- AO compliance: passed
- duplicate generated IDs: none

Approval:
- approvedBy: ${overrides.approvedBy ?? "Dr T"}
`;
}

function client(existingIds: string[] = []): QuestionsBankLocalImportClient & {
  fetchExistingQuestionIds: ReturnType<typeof vi.fn>;
  insertQuestions: ReturnType<typeof vi.fn>;
} {
  return {
    fetchExistingQuestionIds: vi.fn(async () => existingIds),
    insertQuestions: vi.fn(async (payloads: QuestionImportPayload[]) => payloads.map((payload) => payload.id)),
  };
}

function baseInput(overrides: Partial<Parameters<typeof runQuestionsBankLocalImporter>[0]> = {}) {
  return {
    write: true,
    approvedBy: "Dr T",
    approvalArtifactPath: "docs/approval.md",
    approvalArtifactMarkdown: approvalArtifact(),
    questions: [validQuestion],
    client: client(),
    command: 'npm run questions:import:local -- --approval-artifact docs/approval.md --approved-by "Dr T" --write',
    commitSha: "abc123",
    timestamp: "2026-05-28T16:00:00.000Z",
    env: {},
    ...overrides,
  };
}

describe("questions bank local importer", () => {
  it("keeps the default command path non-writing", async () => {
    const importClient = client();
    const result = await runQuestionsBankLocalImporter(baseInput({
      write: false,
      approvalArtifactPath: undefined,
      approvalArtifactMarkdown: undefined,
      client: importClient,
    }));

    expect(result.ok).toBe(true);
    expect(result.wrote).toBe(false);
    expect(importClient.fetchExistingQuestionIds).not.toHaveBeenCalled();
    expect(importClient.insertQuestions).not.toHaveBeenCalled();
  });

  it("fails without an approval artifact in write mode", async () => {
    const importClient = client();
    const result = await runQuestionsBankLocalImporter(baseInput({
      approvalArtifactPath: undefined,
      approvalArtifactMarkdown: undefined,
      client: importClient,
    }));

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("approval artifact path is required in write mode.");
    expect(result.reasons).toContain("approval artifact is required.");
    expect(importClient.insertQuestions).not.toHaveBeenCalled();
  });

  it("fails if the approval artifact status is missing or invalid", async () => {
    const importClient = client();
    const result = await runQuestionsBankLocalImporter(baseInput({
      approvalArtifactMarkdown: approvalArtifact({ status: "READY_TO_IMPORT" }),
      client: importClient,
    }));

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("approval artifact status must be APPROVED_FOR_IMPORT_IMPLEMENTATION_ONLY.");
    expect(importClient.insertQuestions).not.toHaveBeenCalled();
  });

  it("fails if the approval artifact says the payloads were already imported", async () => {
    const importClient = client();
    const result = await runQuestionsBankLocalImporter(baseInput({
      approvalArtifactMarkdown: approvalArtifact({ importStatus: "IMPORTED" }),
      client: importClient,
    }));

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("approval artifact import status must be NOT IMPORTED.");
    expect(importClient.insertQuestions).not.toHaveBeenCalled();
  });

  it("fails if the fresh dry-run has errors", async () => {
    const importClient = client();
    const result = await runQuestionsBankLocalImporter(baseInput({
      questions: [{ ...validQuestion, stem: "" }],
      client: importClient,
    }));

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("fresh dry-run validation must have 0 errors.");
    expect(importClient.insertQuestions).not.toHaveBeenCalled();
  });

  it("fails if AO compliance fails", async () => {
    const importClient = client();
    const result = await runQuestionsBankLocalImporter(baseInput({
      questions: [{ ...validQuestion, aoEmphasis: "AO6" }],
      client: importClient,
    }));

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("AO compliance must pass before import.");
    expect(importClient.insertQuestions).not.toHaveBeenCalled();
  });

  it("fails if duplicate generated IDs exist", async () => {
    const importClient = client();
    const result = await runQuestionsBankLocalImporter(baseInput({
      approvalArtifactMarkdown: approvalArtifact({ generated: 2 }),
      questions: [validQuestion, validQuestion],
      client: importClient,
    }));

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("duplicate generated IDs must be absent before import.");
    expect(importClient.insertQuestions).not.toHaveBeenCalled();
  });

  it("fails if existing-ID conflicts exist", async () => {
    const importClient = client(["c2-class-01"]);
    const result = await runQuestionsBankLocalImporter(baseInput({ client: importClient }));

    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("existing-ID conflicts must be resolved before import.");
    expect(importClient.insertQuestions).not.toHaveBeenCalled();
  });

  it("only calls the write function when --write is present and every gate passes", async () => {
    const dryRunClient = client();
    const dryRunResult = await runQuestionsBankLocalImporter(baseInput({
      write: false,
      client: dryRunClient,
    }));

    expect(dryRunResult.ok).toBe(true);
    expect(dryRunResult.wrote).toBe(false);
    expect(dryRunClient.insertQuestions).not.toHaveBeenCalled();

    const writeClient = client();
    const writeResult = await runQuestionsBankLocalImporter(baseInput({ client: writeClient }));

    expect(writeResult.ok).toBe(true);
    expect(writeResult.wrote).toBe(true);
    expect(writeClient.insertQuestions).toHaveBeenCalledTimes(1);
    expect(writeResult.insertedIds).toEqual(["c2-class-01"]);
  });

  it("generates an import receipt after a successful mocked write", async () => {
    const result = await runQuestionsBankLocalImporter(baseInput());

    expect(result.ok).toBe(true);
    expect(result.receipt).toContain("Question Bank Import Receipt");
    expect(result.receipt).toContain("Import status: IMPORTED");
    expect(result.receipt).toContain("Supabase writes performed: YES");
    expect(result.receipt).toContain("Migrations performed: NO");
    expect(result.receipt).toContain("Inserted count: 1");
    expect(result.receipt).toContain("Inserted IDs: c2-class-01");
    expect(result.receipt).toContain("Approved by: Dr T");
    expect(result.receipt).toContain("Approval artifact: docs/approval.md");
  });
});
