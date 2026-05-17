#!/usr/bin/env node

import { validateStagedContentShape, writeJsonOrConsole } from "./component2-staged-content-utils.mjs";

const report = validateStagedContentShape();

if (!writeJsonOrConsole(report)) {
  console.log("Component 2 staged-content shape validation");
  console.log(`Present expected files: ${report.presentFiles.length}`);
  console.log(`Missing/manual-export files: ${report.missingFiles.length}`);
  console.log(`CSV files parsed: ${report.csvReports.length}`);
  console.log(`Unexpected files: ${report.unexpectedFiles.length}`);
  console.log(`Warnings: ${report.warnings.length}`);
  console.log(`Errors: ${report.errors.length}`);

  if (report.missingFiles.length > 0) {
    console.log("\nMissing/manual export required:");
    for (const item of report.missingFiles) console.log(`  ${item.path}`);
  }
  if (report.warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of report.warnings) console.log(`  ${warning}`);
  }
  if (report.errors.length > 0) {
    console.log("\nErrors:");
    for (const error of report.errors) console.log(`  ${error}`);
  }
}

process.exit(report.ok ? 0 : 1);
