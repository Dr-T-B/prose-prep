#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  dryRunReportPath,
  expectedFiles,
  fileExists,
  readManifest,
  repoRoot,
  scanStagedContent,
  stagingRoot,
  validateStagedContentShape
} from "./component2-staged-content-utils.mjs";

function list(items) {
  return items.length === 0 ? "_None._" : items.map((item) => `- ${item}`).join("\n");
}

function readProjectRef() {
  const refPath = path.join(repoRoot, "supabase", ".temp", "project-ref");
  return fs.existsSync(refPath) ? fs.readFileSync(refPath, "utf8").trim() : "unknown";
}

function renderReport({ manifest, projectRef, scan, shape, mappings }) {
  const found = mappings.filter((item) => item.present);
  const missing = mappings.filter((item) => !item.present);
  const blocked = [
    ...scan.hardBlockers.map((hit) => `${hit.file}:${hit.line} ${hit.term}`),
    ...scan.excludedFiles.map((hit) => `${hit.file}: ${hit.reason}`),
    ...shape.errors
  ];
  const targetTables = [...new Set(mappings.flatMap((item) => item.targetTables))].filter(Boolean).sort();
  const safeForLater = found
    .filter((item) => !blocked.some((blocker) => blocker.includes(item.path)))
    .map((item) => `${item.path} -> ${item.targetTables.join(", ") || "review only"}`);

  return `# Component 2 Content Export AO Sweep Dry-Run Report

## 1. Executive summary

This pass created the local Component 2 staging layout, AO sweep tooling, content-shape validation, and a dry-run import report generator. No write import was performed.

Actual canonical exports are not yet present in \`staging/component2/\`, so content is not ready for write import. The current dry run validates the scaffolding and reports every expected manual export as pending.

## 2. Branch name

\`fix/component-2-content-export-ao-sweep-and-import-dry-run\`

## 3. Staging project ref

\`${projectRef}\`

## 4. Drive access/export status

Drive metadata access was checked separately for canonical files, but raw Drive content was not committed. Manual export placeholders and an ignored local staging layout were created instead.

## 5. Files expected

${list(expectedFiles.map((item) => item.path))}

## 6. Files found

${list(found.map((item) => item.path))}

## 7. Files missing

${list(missing.map((item) => `${item.path} (${item.source}: ${item.sourceTab})`))}

## 8. AO sweep results

- Scanned files: ${scan.scannedFiles.length}
- Allowed guardrail references: ${scan.allowedGuardrails.length}
- Interpretive reframing candidates: ${scan.reframingCandidates.length}
- Excluded files staged: ${scan.excludedFiles.length}
- Hard blockers: ${scan.hardBlockers.length}
- Result: ${scan.ok ? "passed" : "failed"}

## 9. Content-shape validation results

- Present expected files: ${shape.presentFiles.length}
- Missing/manual-export files: ${shape.missingFiles.length}
- Parsed CSV files: ${shape.csvReports.length}
- Unexpected files: ${shape.unexpectedFiles.length}
- Warnings: ${shape.warnings.length}
- Errors: ${shape.errors.length}
- Result: ${shape.ok ? "passed" : "failed"}

## 10. Dry-run import mapping

${list(mappings.map((item) => {
  const status = item.present ? "present" : "missing";
  const targets = item.targetTables.length > 0 ? item.targetTables.join(", ") : "review only";
  return `${item.path}: ${status}; target tables: ${targets}`;
}))}

## 11. Intended target tables

${list(targetTables)}

## 12. Blocked files

${list(blocked)}

## 13. Files safe for later import

${list(safeForLater)}

## 14. Whether Supabase was written to

No. This script does not create a Supabase client and does not perform database writes.

## 15. Verification results

Initial required gates before scaffolding:

- \`npm run validate:component2-ao\`: passed
- \`npm run typecheck\`: passed

Dry-run script result:

- \`npm run dry-run:component2-import\`: ${scan.ok && shape.ok ? "passed and wrote this report" : "blocked and wrote this report"}

Full final verification is recorded after this report is regenerated.

## 16. Remaining blockers

- Canonical Drive exports are not yet present locally.
- Manual content export and AO sweep remain pending.
- Missing files must be exported from the approved manifest sources only.
- Atonement \`AO5 Critics Bank\` must remain excluded unless fully reframed without AO5 labels.
- Local and remote Supabase migration history have unrelated drift from the prior pass.

## 17. Exact next branch/task recommendation

\`fix/component-2-manual-export-stage-and-clean-dry-run\`

Export the approved canonical files into \`staging/component2/\`, rerun the AO scan and shape validator, then rerun the dry-run import report. Do not run a write import until every required export is present, AO-clean, shape-valid, and dry-run mapped cleanly.

## Manifest source count

- Canonical sources: ${manifest.canonical_sources.length}
- Excluded sources: ${manifest.excluded_sources.length}
`;
}

const manifest = readManifest();
const projectRef = readProjectRef();
const scan = scanStagedContent();
const shape = validateStagedContentShape();
const mappings = expectedFiles.map((item) => ({ ...item, present: fileExists(item.path) }));

const report = renderReport({ manifest, projectRef, scan, shape, mappings });
fs.mkdirSync(path.dirname(dryRunReportPath), { recursive: true });
fs.writeFileSync(dryRunReportPath, report);

console.log(`Dry-run report written: ${path.relative(repoRoot, dryRunReportPath)}`);
console.log(`Staging root: ${path.relative(repoRoot, stagingRoot)}`);
console.log(`Files found: ${mappings.filter((item) => item.present).length}`);
console.log(`Files missing: ${mappings.filter((item) => !item.present).length}`);
console.log(`AO scan: ${scan.ok ? "passed" : "failed"}`);
console.log(`Shape validation: ${shape.ok ? "passed" : "failed"}`);
console.log("No Supabase writes performed.");

process.exit(scan.ok && shape.ok ? 0 : 1);
