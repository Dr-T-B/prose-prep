/**
 * Import JSON quote files into Supabase quote_methods table.
 *
 * Source folders (actual locations on disk):
 *   ~/Downloads/HT_AT_ChatGPT_App_Files/HT/          — HT main + metadata files
 *   ~/Downloads/HT_AT_ChatGPT_App_Files/AT/          — AT main files
 *   ~/Downloads/HT_AT_ChatGPT_App_Files/AT_EXAM_QUESTION_STEMS/  — AT metadata files
 *
 * Usage:
 *   npm run import-quotes          # DRY RUN (default) — no DB writes
 *   npm run import-quotes:write    # WRITE MODE — mutates staging Supabase
 *
 * Safety: the script defaults to dry-run. It must be invoked with the explicit
 * `--write` flag to perform inserts/updates. Dry-run reports what would change
 * without calling any write method on the Supabase client.
 *
 * Requires in .env (both modes — dry-run still reads existing rows from staging):
 *   VITE_SUPABASE_URL=STAGING_SUPABASE_URL_HERE
 *   SUPABASE_SERVICE_ROLE_KEY=STAGING_SERVICE_ROLE_KEY_HERE
 *
 * Re-running is safe: existing rows (matched by source_text + quote_text) are
 * classified as would-update; new rows as would-insert; within-batch duplicates
 * as would-skip. In write mode, would-insert rows are batch-inserted and
 * would-update rows are updated by id.
 */

import 'dotenv/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

export function parseArgs(argv: string[]): { write: boolean } {
  return { write: argv.includes('--write') };
}

// ---------------------------------------------------------------------------
// File paths
// ---------------------------------------------------------------------------

const BASE_DIR = path.join(os.homedir(), 'Downloads', 'HT_AT_ChatGPT_App_Files');
const HT_DIR  = path.join(BASE_DIR, 'HT');
const AT_DIR  = path.join(BASE_DIR, 'AT');
const AT_META_DIR = path.join(BASE_DIR, 'AT_EXAM_QUESTION_STEMS');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MainQuoteFile {
  text_name: string;
  quote_text: string;
  speaker_or_narrator?: string;
  location_reference?: string;
  plain_english_meaning?: string;
  linked_themes?: string[];
  linked_motifs?: string[];
  linked_methods?: string[];
  linked_context?: string[];
  linked_interpretations?: string[];
  opening_stems?: string[];
  comparative_prompts?: string[];
  grade_priority?: string;
  is_core_quote?: boolean;
  b_mode_rank?: number;
}

export interface MetadataFile {
  exam_question_tags?: string[];
  recommended_for_questions?: string[];
  question_types?: string[];
  ao_priority?: string[];
  comparison_strength?: string;
  retrieval_priority?: number;
  best_used_for?: string[];
}

export type MergedQuote = MainQuoteFile & MetadataFile;

export interface ValidationError {
  source: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

/** True if filename has a non-digit word after the number, e.g. HT01_NOW.json */
function isMetadataFilename(filename: string): boolean {
  return /^(HT|AT)\d+_[A-Z_]+\.json$/i.test(filename);
}

/** Extract the numeric rank from a filename: HT03_A_MAN.json → 3, AT07.json → 7 */
function fileRank(filename: string): number {
  const m = filename.match(/^(?:HT|AT)(\d+)/i);
  return m ? parseInt(m[1], 10) : -1;
}

export function loadQuotes(
  mainDir: string,
  metaDir?: string,
): { quotes: MergedQuote[]; mainCount: number; metaCount: number } {
  if (!fs.existsSync(mainDir)) {
    console.warn(`  Directory not found: ${mainDir}`);
    return { quotes: [], mainCount: 0, metaCount: 0 };
  }

  const allFiles = fs.readdirSync(mainDir).filter((f) => f.endsWith('.json'));
  const mainFiles = allFiles.filter((f) => !isMetadataFilename(f));
  const htMetaFiles = allFiles.filter((f) => isMetadataFilename(f));

  const htMetaMap = new Map<number, MetadataFile>();
  for (const f of htMetaFiles) {
    const rank = fileRank(f);
    if (rank >= 0) htMetaMap.set(rank, readJson<MetadataFile>(path.join(mainDir, f)));
  }

  const atMetaMap = new Map<number, MetadataFile>();
  if (metaDir && fs.existsSync(metaDir)) {
    for (const f of fs.readdirSync(metaDir).filter((f) => f.endsWith('.json'))) {
      const rank = fileRank(f);
      if (rank >= 0) atMetaMap.set(rank, readJson<MetadataFile>(path.join(metaDir, f)));
    }
  }

  const metaMap = atMetaMap.size > 0 ? atMetaMap : htMetaMap;
  const metaCount = metaMap.size;

  const quotes: MergedQuote[] = mainFiles.map((f) => {
    const main = readJson<MainQuoteFile>(path.join(mainDir, f));
    const rank = main.b_mode_rank ?? fileRank(f);
    const meta: MetadataFile = (rank >= 0 ? metaMap.get(rank) : undefined) ?? {};
    return { ...main, ...meta };
  });

  return { quotes, mainCount: mainFiles.length, metaCount };
}

// ---------------------------------------------------------------------------
// Field mapping (unchanged from prior version)
// ---------------------------------------------------------------------------

export function toLevel(gp?: string): string {
  switch (gp?.toLowerCase()) {
    case 'higher':     return 'top_band';
    case 'foundation': return 'secure';
    case 'a':          return 'top_band';
    case 'c':          return 'secure';
    default:           return 'strong';
  }
}

export function toRowKey(q: MergedQuote): string {
  const prefix = q.text_name?.toLowerCase().includes('atonement') ? 'at' : 'ht';
  const rank = String(q.b_mode_rank ?? 0).padStart(2, '0');
  return `qm_${prefix}_${rank}`;
}

export function toDbRow(q: MergedQuote) {
  const rowKey = toRowKey(q);
  return {
    id:                        rowKey,
    source_row_key:            rowKey,
    source_text:               q.text_name,
    quote_text:                q.quote_text,
    method:                    q.linked_methods?.[0] ?? '',
    best_themes:               q.linked_themes ?? [],
    effect_prompt:             '',
    meaning_prompt:            '',
    level_tag:                 toLevel(q.grade_priority),
    speaker_or_narrator:       q.speaker_or_narrator       ?? null,
    location_reference:        q.location_reference        ?? null,
    plain_english_meaning:     q.plain_english_meaning     ?? null,
    linked_motifs:             q.linked_motifs             ?? null,
    linked_context:            q.linked_context            ?? null,
    linked_interpretations:    q.linked_interpretations    ?? null,
    opening_stems:             q.opening_stems             ?? null,
    comparative_prompts:       q.comparative_prompts       ?? null,
    grade_priority:            q.grade_priority            ?? null,
    is_core_quote:             q.is_core_quote             ?? false,
    b_mode_rank:               q.b_mode_rank               ?? null,
    exam_question_tags:        q.exam_question_tags        ?? null,
    recommended_for_questions: q.recommended_for_questions ?? null,
    question_types:            q.question_types            ?? null,
    ao_priority:               q.ao_priority               ?? null,
    comparison_strength:       q.comparison_strength       ?? null,
    retrieval_priority:        q.retrieval_priority        ?? null,
    best_used_for:             q.best_used_for             ?? null,
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateQuote(q: Partial<MergedQuote>, source = '<unknown>'): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!q.quote_text || typeof q.quote_text !== 'string' || q.quote_text.trim() === '') {
    errors.push({ source, reason: 'missing or empty quote_text' });
  }
  if (!q.text_name || typeof q.text_name !== 'string' || q.text_name.trim() === '') {
    errors.push({ source, reason: 'missing or empty text_name' });
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Classification — pure: no DB calls
// ---------------------------------------------------------------------------

export type DbRow = ReturnType<typeof toDbRow>;

export interface ExistingRow {
  id: string;
  source_text: string;
  quote_text: string;
}

export interface ClassifyResult {
  toInsert: DbRow[];
  toUpdate: Array<{ id: string; row: DbRow }>;
  skipped: Array<{ row: DbRow; reason: string }>;
}

export function classifyRows(rows: DbRow[], existing: ExistingRow[]): ClassifyResult {
  const existingMap = new Map<string, string>();
  for (const r of existing) existingMap.set(`${r.source_text}||${r.quote_text}`, r.id);

  const seenInBatch = new Set<string>();
  const toInsert: DbRow[] = [];
  const toUpdate: ClassifyResult['toUpdate'] = [];
  const skipped: ClassifyResult['skipped'] = [];

  for (const row of rows) {
    const key = `${row.source_text}||${row.quote_text}`;
    if (seenInBatch.has(key)) {
      skipped.push({ row, reason: 'duplicate within import batch' });
      continue;
    }
    seenInBatch.add(key);
    const existingId = existingMap.get(key);
    if (existingId) toUpdate.push({ id: existingId, row });
    else toInsert.push(row);
  }

  return { toInsert, toUpdate, skipped };
}

// ---------------------------------------------------------------------------
// Dry-run summary printing
// ---------------------------------------------------------------------------

export interface SummaryInput {
  htMain: number;
  htMeta: number;
  atMain: number;
  atMeta: number;
  totalRows: number;
  classify: ClassifyResult;
  validationErrors: ValidationError[];
}

export function formatDryRunSummary(s: SummaryInput): string {
  const lines: string[] = [];
  lines.push('─'.repeat(48));
  lines.push('DRY RUN — no writes performed');
  lines.push('─'.repeat(48));
  lines.push(`  HT main files:        ${s.htMain}`);
  lines.push(`  HT metadata files:    ${s.htMeta}`);
  lines.push(`  AT main files:        ${s.atMain}`);
  lines.push(`  AT metadata files:    ${s.atMeta}`);
  lines.push(`  Total source rows:    ${s.totalRows}`);
  lines.push('');
  lines.push(`  Would insert:         ${s.classify.toInsert.length}`);
  lines.push(`  Would update:         ${s.classify.toUpdate.length}`);
  lines.push(`  Would skip (dupes):   ${s.classify.skipped.length}`);
  lines.push(`  Validation errors:    ${s.validationErrors.length}`);
  if (s.validationErrors.length > 0) {
    lines.push('');
    lines.push('  Validation errors:');
    for (const e of s.validationErrors.slice(0, 20)) {
      lines.push(`    - [${e.source}] ${e.reason}`);
    }
    if (s.validationErrors.length > 20) {
      lines.push(`    … and ${s.validationErrors.length - 20} more`);
    }
  }
  lines.push('─'.repeat(48));
  lines.push('To perform writes, re-run with --write (npm run import-quotes:write).');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Upsert — WRITE PATH (guarded)
// ---------------------------------------------------------------------------

/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ WRITE PATH — DO NOT CALL IN DRY-RUN MODE                                 │
 * │                                                                          │
 * │ This is the ONLY function in this script that calls Supabase write       │
 * │ methods (.insert / .update). It is gated three ways:                     │
 * │   1. main() only invokes it when parseArgs().write === true              │
 * │   2. The explicit `writeMode` parameter is asserted at the top           │
 * │   3. The function throws if writeMode === false                          │
 * │                                                                          │
 * │ Dry-run mode goes through classifyRows() + formatDryRunSummary() only.   │
 * │ Reviewer: if you change this, also update the dry-run gate tests in      │
 * │ src/test/importQuotes.test.ts.                                           │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
export async function upsertQuotes(
  supabase: SupabaseClient,
  classified: ClassifyResult,
  writeMode: boolean,
): Promise<{ inserted: number; updated: number; errors: number }> {
  if (!writeMode) {
    throw new Error(
      'upsertQuotes called without writeMode=true. This is a programming error: '
      + 'dry-run mode must never reach the write path.',
    );
  }

  const { toInsert, toUpdate } = classified;
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  const BATCH = 50;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { error } = await supabase.from('quote_methods').insert(batch);
    if (error) {
      console.error(`  Insert batch error: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += batch.length;
    }
  }

  for (const { id, row } of toUpdate) {
    const { error } = await supabase.from('quote_methods').update(row).eq('id', id);
    if (error) {
      console.error(`  Update error for "${row.quote_text.slice(0, 50)}": ${error.message}`);
      errors++;
    } else {
      updated++;
    }
  }

  return { inserted, updated, errors };
}

// ---------------------------------------------------------------------------
// Existing-rows fetch (read-only)
// ---------------------------------------------------------------------------

export async function fetchExistingRows(supabase: SupabaseClient): Promise<ExistingRow[]> {
  const { data, error } = await supabase
    .from('quote_methods')
    .select('id, source_text, quote_text');
  if (error) {
    console.error('Failed to fetch existing rows:', error.message);
    console.error('Check that SUPABASE_SERVICE_ROLE_KEY is correct and has sufficient privileges.');
    process.exit(1);
  }
  return (data ?? []) as ExistingRow[];
}

// ---------------------------------------------------------------------------
// Main orchestration
// ---------------------------------------------------------------------------

function buildSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('\nMissing environment variables. Add to your .env file:\n');
    if (!supabaseUrl)    console.error('  VITE_SUPABASE_URL=STAGING_SUPABASE_URL_HERE');
    if (!serviceRoleKey) console.error('  SUPABASE_SERVICE_ROLE_KEY=STAGING_SERVICE_ROLE_KEY_HERE');
    console.error('\nUse staging credentials only. Do not run imports against production.\n');
    process.exit(1);
  }

  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

async function main() {
  const { write: writeMode } = parseArgs(process.argv.slice(2));

  if (writeMode) {
    console.log('⚠️  WRITE MODE: this will mutate staging Supabase.');
    console.log('   (To preview without writing, re-run without --write.)\n');
  } else {
    console.log('🔒 DRY RUN: no writes will be performed. Pass --write to mutate staging.\n');
  }

  console.log('Loading quote files…\n');
  const ht = loadQuotes(HT_DIR);
  const at = loadQuotes(AT_DIR, AT_META_DIR);

  console.log(`HT: ${ht.mainCount} main quotes, ${ht.metaCount} metadata files`);
  console.log(`AT: ${at.mainCount} main quotes, ${at.metaCount} metadata files`);

  const allQuotes = [...ht.quotes, ...at.quotes];
  if (allQuotes.length === 0) {
    console.error('\nNo quotes loaded. Check that the source folders exist:');
    console.error(`  ${HT_DIR}`);
    console.error(`  ${AT_DIR}`);
    process.exit(1);
  }

  const validationErrors: ValidationError[] = [];
  const validQuotes: MergedQuote[] = [];
  for (let i = 0; i < allQuotes.length; i++) {
    const q = allQuotes[i];
    const src = q.text_name
      ? `${q.text_name} #${q.b_mode_rank ?? i}`
      : `(quote index ${i})`;
    const errs = validateQuote(q, src);
    if (errs.length > 0) validationErrors.push(...errs);
    else validQuotes.push(q);
  }

  const rows = validQuotes.map(toDbRow);

  const supabase = buildSupabaseClient();
  const existing = await fetchExistingRows(supabase);
  const classified = classifyRows(rows, existing);

  if (!writeMode) {
    console.log(
      formatDryRunSummary({
        htMain: ht.mainCount,
        htMeta: ht.metaCount,
        atMain: at.mainCount,
        atMeta: at.metaCount,
        totalRows: allQuotes.length,
        classify: classified,
        validationErrors,
      }),
    );
    return;
  }

  console.log(`\nUpserting ${rows.length} valid quotes into Supabase…`);
  console.log(`  Would insert: ${classified.toInsert.length}`);
  console.log(`  Would update: ${classified.toUpdate.length}`);
  console.log(`  Skipped (within-batch dupes): ${classified.skipped.length}`);
  console.log(`  Validation errors: ${validationErrors.length}\n`);

  const { inserted, updated, errors } = await upsertQuotes(supabase, classified, writeMode);

  console.log('─'.repeat(48));
  console.log('Import complete');
  console.log(`  HT quotes:    ${ht.mainCount}`);
  console.log(`  AT quotes:    ${at.mainCount}`);
  console.log(`  Total:        ${allQuotes.length}`);
  console.log(`  Inserted:     ${inserted}  (new rows)`);
  console.log(`  Updated:      ${updated}   (existing rows)`);
  if (errors > 0)            console.warn(`  DB errors:    ${errors} (see above)`);
  if (validationErrors.length > 0) {
    console.warn(`  Skipped (validation): ${validationErrors.length}`);
  }
  console.log('─'.repeat(48));
}

// Only run when invoked directly (not when imported by tests)
const invokedDirectly = (() => {
  try {
    const entry = process.argv[1] ? path.resolve(process.argv[1]) : '';
    const self = new URL(import.meta.url).pathname;
    return entry === self;
  } catch {
    return false;
  }
})();

if (invokedDirectly) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
