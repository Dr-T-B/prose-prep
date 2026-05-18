import fs from "node:fs";
import path from "node:path";

export const repoRoot = process.cwd();
export const stagingRoot = path.join(repoRoot, "staging", "component2");
export const manifestPath = path.join(repoRoot, "docs", "component2_canonical_import_manifest.json");
export const dryRunReportPath = path.join(repoRoot, "docs", "COMPONENT_2_CONTENT_EXPORT_AO_SWEEP_DRY_RUN_REPORT.md");

export const expectedDirectories = [
  "wp1_complete_workbook",
  "hard_times_matrix",
  "atonement_matrix",
  "quote_method_source",
  "quote_pair_dataset",
  "ao3_context_guide",
  "rubric_candidate"
];

export const expectedFiles = [
  { path: "wp1_complete_workbook/AO2_Prose_Grid.csv", source: "WP1 corrected workbook", sourceTab: "AO2_Prose_Grid", kind: "quote_method", targetTables: ["quote_methods", "library_quotes"] },
  { path: "wp1_complete_workbook/Quote_Bank.csv", source: "WP1 corrected workbook", sourceTab: "Quote_Bank", kind: "quote", targetTables: ["quote_methods", "library_quotes"] },
  { path: "wp1_complete_workbook/Quotes_by_Theme.csv", source: "WP1 corrected workbook", sourceTab: "Quotes_by_Theme", kind: "quote", targetTables: ["quote_methods", "library_quotes"] },
  { path: "wp1_complete_workbook/Master_Comparative_Matrix.csv", source: "WP1 corrected workbook", sourceTab: "Master_Comparative_Matrix", kind: "comparison", targetTables: ["comparative_matrix", "library_comparative_pairings"] },
  { path: "wp1_complete_workbook/Essay_Paragraph_Planner.csv", source: "WP1 corrected workbook", sourceTab: "Essay_Paragraph_Planner", kind: "planner", targetTables: ["routes", "questions", "paragraph_jobs"] },
  { path: "wp1_complete_workbook/Model_Paragraph_Frames.csv", source: "WP1 corrected workbook", sourceTab: "Model_Paragraph_Frames", kind: "paragraph_frame", targetTables: ["library_paragraph_frames"] },
  { path: "wp1_complete_workbook/Essay_Openings_Thesis_Bank.csv", source: "WP1 corrected workbook", sourceTab: "Essay_Openings_Thesis_Bank", kind: "thesis", targetTables: ["theses", "library_thesis_bank"] },
  { path: "wp1_complete_workbook/AO3_Context_Triggers.csv", source: "WP1 corrected workbook", sourceTab: "AO3_Context_Triggers", kind: "context", targetTables: ["library_context_bank"] },
  { path: "wp1_complete_workbook/WP1_Correction_Log.csv", source: "WP1 corrected workbook", sourceTab: "WP1_Correction_Log", kind: "audit", targetTables: [] },
  { path: "hard_times_matrix/Hard_Times_Matrix.csv", source: "Hard Times chapter-to-exam matrix", sourceTab: "Hard Times Matrix", kind: "matrix", targetTables: ["library_questions", "library_context_bank", "comparative_matrix"] },
  { path: "hard_times_matrix/WP4_Paragraph_Engine.csv", source: "Hard Times chapter-to-exam matrix", sourceTab: "WP4 Paragraph Engine", kind: "paragraph_frame", targetTables: ["library_paragraph_frames"] },
  { path: "hard_times_matrix/WP5_Essay_Generator.csv", source: "Hard Times chapter-to-exam matrix", sourceTab: "WP5 Essay Generator", kind: "thesis", targetTables: ["library_thesis_bank", "questions"] },
  { path: "hard_times_matrix/Final_Layer_Exam_Simulation_Marking.csv", source: "Hard Times chapter-to-exam matrix", sourceTab: "Final Layer - Exam Simulation + Marking", kind: "rubric", targetTables: ["library_questions"] },
  { path: "hard_times_matrix/Adaptive_Intelligence_Layer.csv", source: "Hard Times chapter-to-exam matrix", sourceTab: "Adaptive Intelligence Layer", kind: "planner", targetTables: ["routes", "paragraph_jobs"] },
  { path: "atonement_matrix/Atonement_Matrix.csv", source: "Atonement chapter-to-exam matrix", sourceTab: "Atonement Matrix", kind: "matrix", targetTables: ["library_questions", "library_context_bank", "comparative_matrix"] },
  { path: "atonement_matrix/AO3_Context_Bank.csv", source: "Atonement chapter-to-exam matrix", sourceTab: "AO3 Context Bank", kind: "context", targetTables: ["library_context_bank"] },
  { path: "atonement_matrix/at_past_papers_reference.csv", source: "Atonement chapter-to-exam matrix", sourceTab: "at_past_papers_reference", kind: "questions", targetTables: ["library_questions", "questions"] },
  { path: "quote_method_source/AO2_Prose_Grid.csv", source: "HT & Atonement quote/method source", sourceTab: "AO2_Prose_Grid", kind: "quote_method", targetTables: ["quote_methods", "library_quotes"] },
  { path: "quote_method_source/Quote_Bank.csv", source: "HT & Atonement quote/method source", sourceTab: "Quote_Bank", kind: "quote", targetTables: ["quote_methods", "library_quotes"] },
  { path: "quote_pair_dataset/Quote_Pair_Matrix.csv", source: "Quote Pair Matrix app dataset", sourceTab: "primary sheet", kind: "comparison", targetTables: ["quote_pairs", "library_comparative_pairings"] },
  { path: "ao3_context_guide/AO3_Context_Library.md", source: "AO3 Context Library student guide", sourceTab: "document export", kind: "context_doc", targetTables: ["library_context_bank"] },
  { path: "rubric_candidate/Peer_Assessment_Rubric.md", source: "Peer-assessment rubric candidate", sourceTab: "document export", kind: "rubric_doc", targetTables: ["library_questions"] }
];

const blockedPieces = [
  ["AO", "5"],
  ["ao", "5"],
  ["AO", " 5"],
  ["assessment objective ", "5"],
  ["AO1-AO", "5"],
  ["AO1\u2013AO", "5"],
  ["all five AOs"],
  ["AO", "5 Critics Bank"],
  ["ao", "5_tension"],
  ["ao", "5_stem"],
  ["ao", "5_prompt"],
  ["ao", "5_enabled"],
  ["selected_ao", "5_ids"],
  ["ao", "5_evaluation"],
  ["ao", "5_self_score"],
  ["ao", "5_secure"],
  ["ao", "5_lens"]
];

export const blockedTerms = blockedPieces.map((parts) => parts.join(""));

export function readManifest() {
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

export function toPosix(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

export function fileExists(relPath) {
  return fs.existsSync(path.join(stagingRoot, relPath));
}

export function walkFiles(root = stagingRoot) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(full);
    }
  };
  walk(root);
  return files.sort();
}

export function isTrackedScaffoldFile(filePath) {
  const base = path.basename(filePath);
  const rel = toPosix(filePath);
  return base === ".gitkeep" || rel === "staging/component2/README.md";
}

export function isGuardrailLine(relPath, line) {
  const normalized = line.toLowerCase();
  if (!relPath.endsWith("README.md")) return false;
  return (
    normalized.includes("not assessed") ||
    normalized.includes("forbidden") ||
    normalized.includes("rejected") ||
    normalized.includes("exclude") ||
    normalized.includes("reframe") ||
    normalized.includes("do not") ||
    normalized.includes("out of scope")
  );
}

export function scanStagedContent() {
  const files = walkFiles().filter((file) => !path.basename(file).startsWith("."));
  const hits = [];
  const hardBlockers = [];
  const excludedFiles = [];
  const allowedGuardrails = [];
  const reframingCandidates = [];

  for (const file of files) {
    const rel = toPosix(file);
    const relLower = rel.toLowerCase();
    if (relLower.includes("ao5_critics_bank") || relLower.includes("ao5 critics bank")) {
      excludedFiles.push({ file: rel, reason: "Atonement AO5 Critics Bank must be excluded or reframed before staging." });
    }

    const text = fs.readFileSync(file, "utf8");
    text.split(/\r?\n/).forEach((line, index) => {
      for (const term of blockedTerms) {
        if (!line.toLowerCase().includes(term.toLowerCase())) continue;
        const hit = { file: rel, line: index + 1, term, text: line.trim().slice(0, 240) };
        hits.push(hit);
        if (isGuardrailLine(rel, line)) allowedGuardrails.push({ ...hit, category: "allowed_guardrail" });
        else if (/critic|critical|alternative|interpret/i.test(line)) reframingCandidates.push({ ...hit, category: "interpretive_reframing_candidate" });
        else hardBlockers.push({ ...hit, category: "hard_blocker" });
        break;
      }
    });
  }

  return {
    scannedFiles: files.map(toPosix),
    hits,
    hardBlockers,
    allowedGuardrails,
    excludedFiles,
    reframingCandidates,
    ok: hardBlockers.length === 0 && excludedFiles.length === 0
  };
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === "\"") {
      if (inQuotes && next === "\"") {
        cell += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }
  row.push(cell);
  if (row.some((value) => value.trim() !== "") || rows.length === 0) rows.push(row);

  const headers = (rows[0] ?? []).map((header) => header.trim());
  const dataRows = rows.slice(1).filter((cells) => cells.some((value) => value.trim() !== ""));
  return { headers, rows: dataRows };
}

function hasAnyHeader(headers, terms) {
  const normalized = headers.map((header) => header.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
  return terms.some((term) => normalized.some((header) => header.includes(term)));
}

export function validateStagedContentShape() {
  const errors = [];
  const warnings = [];
  const presentFiles = [];
  const missingFiles = [];
  const csvReports = [];

  for (const dir of expectedDirectories) {
    const full = path.join(stagingRoot, dir);
    if (!fs.existsSync(full)) errors.push(`Missing expected staging directory: staging/component2/${dir}`);
  }

  for (const expected of expectedFiles) {
    const full = path.join(stagingRoot, expected.path);
    if (!fs.existsSync(full)) {
      missingFiles.push({ ...expected, reason: "manual export required" });
      continue;
    }
    presentFiles.push(expected);
    if (expected.path.toLowerCase().includes("ao5_critics_bank")) errors.push(`${expected.path}: excluded tab is staged`);
    if (expected.path.endsWith(".csv")) {
      try {
        const parsed = parseCsv(fs.readFileSync(full, "utf8"));
        const nonEmptyHeaders = parsed.headers.filter((header) => header.trim() !== "");
        if (nonEmptyHeaders.length === 0) errors.push(`${expected.path}: CSV has empty headers`);
        const blockedHeaders = parsed.headers.filter((header) =>
          blockedTerms.some((term) => header.toLowerCase().includes(term.toLowerCase()))
        );
        if (blockedHeaders.length > 0) errors.push(`${expected.path}: blocked AO-labelled columns: ${blockedHeaders.join(", ")}`);
        if (["quote", "quote_method"].includes(expected.kind) && !hasAnyHeader(parsed.headers, ["quote", "quotation", "method", "theme", "text"])) {
          warnings.push(`${expected.path}: quote/method headers were not recognised`);
        }
        if (["comparison", "matrix"].includes(expected.kind) && !hasAnyHeader(parsed.headers, ["hard_times", "atonement", "comparison", "theme", "axis"])) {
          warnings.push(`${expected.path}: comparison/matrix headers were not recognised`);
        }
        csvReports.push({ file: expected.path, headers: parsed.headers, rowCount: parsed.rows.length, targetTables: expected.targetTables });
      } catch (error) {
        errors.push(`${expected.path}: CSV parse failed: ${error.message}`);
      }
    }
    if (expected.path.endsWith(".md") && expected.kind === "rubric_doc") {
      const text = fs.readFileSync(full, "utf8");
      if (/AO\s*5|assessment objective\s*5|all five AOs/i.test(text)) errors.push(`${expected.path}: rubric candidate references AO5 as content; review before import`);
    }
  }

  const stagedFiles = walkFiles().filter((file) => !isTrackedScaffoldFile(file)).map(toPosix);
  const unexpectedFiles = stagedFiles.filter((rel) => {
    const relToStaging = rel.replace(/^staging\/component2\//, "");
    return !expectedFiles.some((expected) => expected.path === relToStaging);
  });

  for (const rel of unexpectedFiles) {
    if (/AO5[_\s-]*Critics[_\s-]*Bank/i.test(rel)) errors.push(`${rel}: excluded AO5 Critics Bank file must not be staged`);
    else warnings.push(`${rel}: file is not in the expected canonical export list`);
  }

  return { ok: errors.length === 0, errors, warnings, presentFiles: presentFiles.map((file) => file.path), missingFiles, csvReports, unexpectedFiles };
}

export function summariseForConsole(title, report) {
  console.log(title);
  for (const [key, value] of Object.entries(report)) {
    if (Array.isArray(value)) console.log(`${key}: ${value.length}`);
    else if (typeof value !== "object") console.log(`${key}: ${value}`);
  }
}

export function writeJsonOrConsole(report) {
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
    return true;
  }
  return false;
}
