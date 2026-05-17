#!/usr/bin/env node

import { scanStagedContent, summariseForConsole, writeJsonOrConsole } from "./component2-staged-content-utils.mjs";

const report = scanStagedContent();

if (!writeJsonOrConsole(report)) {
  summariseForConsole("Component 2 staged-content AO scan", report);
  if (report.allowedGuardrails.length > 0) {
    console.log("\nAllowed guardrail references:");
    for (const hit of report.allowedGuardrails) console.log(`  ${hit.file}:${hit.line} ${hit.term}`);
  }
  if (report.reframingCandidates.length > 0) {
    console.log("\nInterpretive reframing candidates:");
    for (const hit of report.reframingCandidates) console.log(`  ${hit.file}:${hit.line} ${hit.term}`);
  }
  if (report.excludedFiles.length > 0) {
    console.log("\nExcluded files staged:");
    for (const hit of report.excludedFiles) console.log(`  ${hit.file}: ${hit.reason}`);
  }
  if (report.hardBlockers.length > 0) {
    console.log("\nHard blockers:");
    for (const hit of report.hardBlockers) console.log(`  ${hit.file}:${hit.line} ${hit.term}`);
  }
}

process.exit(report.ok ? 0 : 1);
