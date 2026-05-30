import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const validatorPath = path.join(repoRoot, "scripts/validate-component2-ao-model.mjs");

function writeFixtureFile(root: string, relativePath: string, content: string) {
  const filePath = path.join(root, relativePath);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

function createFixtureRepo() {
  const root = mkdtempSync(path.join(tmpdir(), "component2-ao-validator-"));
  const manifest = {
    assessed_aos: ["AO1", "AO2", "AO3", "AO4"],
    excluded_aos: ["AO5"],
    canonical_sources: ["fixture"],
    excluded_sources: ["fixture guardrail"]
  };

  writeFixtureFile(root, "docs/component2_canonical_import_manifest.json", JSON.stringify(manifest));
  writeFixtureFile(root, "docs/COMPONENT_2_IMPORT_README.md", "Component 2 assesses AO1, AO2, AO3, and AO4 only. AO5 is not assessed for Component 2: Prose.\n");
  writeFixtureFile(root, "src/data/seed.ts", "ao2?: string | null\nao3?: string | null\nao4?: string | null\nthesis?: string | null\ncharacter?: string | null\nnarrative?: string | null\nstructure?: string | null\nexam_fit?: string | null\n");
  writeFixtureFile(root, "src/components/ComparativeMatrix.tsx", "ao2:\nao3:\nao4:\nthesis:\ncharacter:\nnarrative:\nstructure:\nexamFit:\n");
  writeFixtureFile(root, "src/components/admin/ContentAudit.tsx", "\"ao2\"\n\"ao3\"\n\"ao4\"\n\"thesis\"\n\"character\"\n\"narrative\"\n\"structure\"\n\"exam_fit\"\n");
  writeFixtureFile(root, "src/components/admin/ContentInspector.tsx", "\"ao2\"\n\"ao3\"\n\"ao4\"\n\"thesis\"\n\"character\"\n\"narrative\"\n\"structure\"\n\"exam_fit\"\n");
  writeFixtureFile(root, "supabase/functions/apply-staged-change/index.ts", "\"ao2\"\n\"ao3\"\n\"ao4\"\n\"thesis\"\n\"character\"\n\"narrative\"\n\"structure\"\n\"exam_fit\"\n");
  writeFixtureFile(root, "supabase/migrations/20260516115407_a1_extend_comparative_matrix.sql", "ADD COLUMN IF NOT EXISTS ao2 text\nADD COLUMN IF NOT EXISTS ao3 text\nADD COLUMN IF NOT EXISTS ao4 text\nADD COLUMN IF NOT EXISTS thesis text\nADD COLUMN IF NOT EXISTS character text\nADD COLUMN IF NOT EXISTS narrative text\nADD COLUMN IF NOT EXISTS structure text\nADD COLUMN IF NOT EXISTS exam_fit text\n");
  return root;
}

function runValidator(cwd: string) {
  return execFileSync(process.execPath, [validatorPath], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function expectValidatorFailure(cwd: string) {
  try {
    runValidator(cwd);
  } catch (error) {
    const failed = error as { stderr?: Buffer | string; stdout?: Buffer | string };
    return `${failed.stdout ?? ""}${failed.stderr ?? ""}`;
  }
  throw new Error("Expected Component 2 AO validator to fail");
}

describe("validate-component2-ao-model migration DML scanning", () => {
  it("fails when Component 2 INSERT seed values contain AO5", () => {
    const root = createFixtureRepo();
    try {
      writeFixtureFile(root, "supabase/migrations/20260501000000_bad_quote_seed.sql", "INSERT INTO public.quotes (id, a_star_insight) VALUES ('fixture', 'AO5 should fail inside quote seed content');\n");

      const output = expectValidatorFailure(root);

      expect(output).toContain("component2_seed_dml_blocker");
      expect(output).toContain("20260501000000_bad_quote_seed.sql");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("fails when Component 2 UPDATE seed values contain AO5", () => {
    const root = createFixtureRepo();
    try {
      writeFixtureFile(root, "supabase/migrations/20260501000001_bad_essay_update.sql", "UPDATE public.annotated_essays SET full_essay_text = 'AO5 should fail inside essay content' WHERE id = 'fixture';\n");

      const output = expectValidatorFailure(root);

      expect(output).toContain("component2_seed_dml_blocker");
      expect(output).toContain("20260501000001_bad_essay_update.sql");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("passes a clean fixture with explicit guardrail documentation", () => {
    const root = createFixtureRepo();
    try {
      const output = runValidator(root);

      expect(output).toContain("Blocked AO5 references: 0");
      expect(output).toContain("readme_guardrail");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
