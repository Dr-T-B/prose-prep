#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, "docs", "component2_canonical_import_manifest.json");

const BLOCKED_PATTERNS = [
  /\bAO5\b/i,
  /\bAO\s+5\b/i,
  /assessment objective 5/i,
  /\bao5_tension\b/i,
  /\bao5_tensions\b/i,
  /\bao5_stem\b/i,
  /\bao5_prompt\b/i,
  /\bao5_enabled\b/i,
  /\bselected_ao5_ids\b/i,
  /\bao5_evaluation\b/i,
  /\bao5_self_score\b/i,
  /\bao5_lens\b/i,
  /\bao5_secure\b/i,
  /\bAO5_TENSIONS\b/i,
  /\bAO1-AO5\b/i,
  /\bAO1–AO5\b/i,
  /\ball five AOs\b/i
];

const EXTENSIONS = new Set([".csv", ".json", ".js", ".mjs", ".md", ".sql", ".ts", ".tsx"]);

const CORE_SCAN_TARGETS = [
  "docs/component2_canonical_import_manifest.json",
  "docs/COMPONENT_2_IMPORT_README.md",
  "prompts",
  "scripts",
  "sql",
  "src/data",
  "src/components/ParagraphEngine.tsx",
  "src/hooks/useCurrentPlanCloud.ts",
  "src/integrations/supabase/types.ts",
  "src/lib/csvImport.ts",
  "src/lib/contentRepo.ts",
  "src/lib/datasets.ts",
  "src/lib/libraryAdapters.ts",
  "src/lib/paragraphEngine.ts",
  "src/lib/planCloud.ts",
  "src/lib/planLogic.ts",
  "src/lib/planStore.ts",
  "src/lib/tier1LibraryImport.ts",
  "src/pages/EssayBuilder.tsx",
  "src/pages/InterpretiveFlex.tsx",
  "src/pages/ParagraphBuilderPage.tsx",
  "src/pages/ThesisRouteDetailPage.tsx",
  "src/pages/TimedPractice.tsx",
  "src/types/thesisRoutes.ts",
  "supabase/functions",
  "supabase/migrations"
];

const OPTIONAL_STAGING_TARGETS = [
  "data/component2",
  "data/component2_exports",
  "imports/component2",
  "staging/component2"
];

const REPORT_OR_ARCHIVE_RE = /(?:^|\/)docs\/.*(?:audit|archive|archived|report|verification|readiness|staging|contamination|correction|fix|blockers).*\.md$/i;
const DRAMA_RE = /(?:drama|hamlet|duchess|component\s*1|9ET0\/01)/i;
const HISTORICAL_MIGRATION_RE = /^supabase\/migrations\//;
const GENERATED_TYPES_RE = /^src\/integrations\/supabase\/types\.ts$/;
const VALIDATOR_SELF_FILES = new Set([
  "scripts/validate-component2-ao-model.mjs",
  "scripts/component2-staged-content-utils.mjs",
  "scripts/scan-component2-staged-content.mjs",
  "scripts/validate-component2-staged-content-shape.mjs",
  "scripts/dry-run-component2-canonical-import.mjs"
]);
const FAILING_CATEGORIES = new Set([
  "component2_blocker",
  "component2_import_blocker",
  "component2_schema_snapshot_blocker"
]);

function toPosix(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function fail(message) {
  console.error(`Component 2 AO validation failed: ${message}`);
  process.exit(1);
}

function readManifest() {
  if (!fs.existsSync(manifestPath)) {
    fail(`Missing canonical manifest: ${toPosix(manifestPath)}`);
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    fail(`Could not parse manifest JSON: ${error.message}`);
  }

  const assessed = JSON.stringify(manifest.assessed_aos);
  const excluded = JSON.stringify(manifest.excluded_aos);
  if (assessed !== JSON.stringify(["AO1", "AO2", "AO3", "AO4"])) {
    fail(`Manifest assessed_aos must be exactly ["AO1","AO2","AO3","AO4"]; got ${assessed}`);
  }
  if (excluded !== JSON.stringify(["AO5"])) {
    fail(`Manifest excluded_aos must be exactly ["AO5"]; got ${excluded}`);
  }
  if (!Array.isArray(manifest.canonical_sources) || manifest.canonical_sources.length === 0) {
    fail("Manifest must list canonical_sources.");
  }
  if (!Array.isArray(manifest.excluded_sources) || manifest.excluded_sources.length === 0) {
    fail("Manifest must list excluded_sources.");
  }
}

function walk(targetPath, files) {
  if (!fs.existsSync(targetPath)) return false;
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    if (EXTENSIONS.has(path.extname(targetPath))) files.push(targetPath);
    return true;
  }
  if (!stat.isDirectory()) return true;

  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
    walk(path.join(targetPath, entry.name), files);
  }
  return true;
}

function collectFiles() {
  const files = [];
  const missingOptional = [];

  for (const target of CORE_SCAN_TARGETS) {
    walk(path.join(repoRoot, target), files);
  }

  for (const target of OPTIONAL_STAGING_TARGETS) {
    if (!walk(path.join(repoRoot, target), files)) missingOptional.push(target);
  }

  return {
    files: [...new Set(files)].sort(),
    missingOptional
  };
}

function classifyOccurrence(relPath, lineText, fileText) {
  const line = lineText.toLowerCase();

  if (VALIDATOR_SELF_FILES.has(relPath)) {
    return "validator_self";
  }

  if (relPath === "docs/component2_canonical_import_manifest.json") {
    return (
      line.includes('"excluded_aos"') ||
      line.includes("excluded") ||
      line.includes("legacy draft notice") ||
      line.includes("different ao rules") ||
      line.includes("exclude_or_rename_to_critical_interpretations") ||
      line.includes("requires_ao5_reframe")
    ) ? "manifest_guardrail" : "component2_import_blocker";
  }

  if (relPath === "docs/COMPONENT_2_IMPORT_README.md") {
    return (
      line.includes("not assessed") ||
      line.includes("reject") ||
      line.includes("rejection") ||
      line.includes("excluded") ||
      line.includes("do not import") ||
      line.includes("must not be imported") ||
      line.includes("exclude it or reframe")
    ) ? "readme_guardrail" : "component2_import_blocker";
  }

  if (relPath === "staging/component2/README.md") {
    return (
      line.includes("not assessed") ||
      line.includes("forbidden") ||
      line.includes("rejected") ||
      line.includes("exclude") ||
      line.includes("reframed") ||
      line.includes("do not") ||
      line.includes("out of scope")
    ) ? "readme_guardrail" : "component2_import_blocker";
  }

  if (REPORT_OR_ARCHIVE_RE.test(relPath)) return "archive_or_report";
  if (GENERATED_TYPES_RE.test(relPath)) return "generated_type";
  if (HISTORICAL_MIGRATION_RE.test(relPath)) {
    return DRAMA_RE.test(lineText) || DRAMA_RE.test(relPath)
      ? "component1_drama_migration"
      : "historical_migration";
  }
  if (DRAMA_RE.test(lineText) || DRAMA_RE.test(relPath) || (relPath.startsWith("prompts/") && DRAMA_RE.test(fileText))) {
    return "component1_drama_valid";
  }

  if (
    line.includes("not assessed") &&
    (line.includes("component 2") || line.includes("9et0/02") || line.includes("prose"))
  ) {
    return "component2_rule_statement";
  }

  if (relPath.startsWith("sql/")) return "component2_schema_snapshot_blocker";
  if (relPath.startsWith("scripts/") || relPath.startsWith("supabase/functions/") || relPath === "src/lib/datasets.ts" || relPath === "src/lib/tier1LibraryImport.ts") {
    return "component2_import_blocker";
  }

  return "component2_blocker";
}

function isAllowedCategory(category) {
  return !FAILING_CATEGORIES.has(category);
}

function scanFile(filePath) {
  const relPath = toPosix(filePath);
  const text = fs.readFileSync(filePath, "utf8");
  const offences = [];
  const allowed = [];

  text.split(/\r?\n/).forEach((lineText, index) => {
    for (const pattern of BLOCKED_PATTERNS) {
      if (!pattern.test(lineText)) continue;
      const hit = {
        file: relPath,
        line: index + 1,
        text: lineText.trim().slice(0, 240),
        category: classifyOccurrence(relPath, lineText, text)
      };
      if (isAllowedCategory(hit.category)) allowed.push(hit);
      else offences.push(hit);
      break;
    }
  });

  return { offences, allowed };
}

function printResults({ files, missingOptional, offences, allowed }) {
  console.log("Component 2 AO model validation");
  console.log(`Manifest: ${toPosix(manifestPath)}`);
  console.log(`Files scanned: ${files.length}`);
  if (missingOptional.length > 0) {
    console.log(`Optional staging folders not present: ${missingOptional.join(", ")}`);
  }
  console.log(`Allowed AO5 references: ${allowed.length}`);
  console.log(`Blocked AO5 references: ${offences.length}`);

  const allHits = [...allowed, ...offences];
  const counts = new Map();
  for (const hit of allHits) {
    counts.set(hit.category, (counts.get(hit.category) ?? 0) + 1);
  }
  if (counts.size > 0) {
    console.log("AO5 classification counts:");
    for (const [category, count] of [...counts.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      console.log(`  ${category}: ${count}`);
    }
  }

  if (offences.length > 0) {
    const grouped = new Map();
    for (const offence of offences) {
      const hits = grouped.get(offence.file) ?? [];
      hits.push(offence);
      grouped.set(offence.file, hits);
    }

    console.error("\nBlocked Component 2 AO5 references:");
    for (const [file, hits] of grouped) {
      console.error(`\n${file}`);
      for (const hit of hits.slice(0, 20)) {
        console.error(`  ${hit.line} [${hit.category}]: ${hit.text}`);
      }
      if (hits.length > 20) {
        console.error(`  ... ${hits.length - 20} more in this file`);
      }
    }
  }
}

readManifest();
const { files, missingOptional } = collectFiles();
const allOffences = [];
const allAllowed = [];

for (const file of files) {
  const { offences, allowed } = scanFile(file);
  allOffences.push(...offences);
  allAllowed.push(...allowed);
}

printResults({
  files,
  missingOptional,
  offences: allOffences,
  allowed: allAllowed
});

if (allOffences.length > 0) process.exit(1);
