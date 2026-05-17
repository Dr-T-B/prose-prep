/**
 * Read-only staging schema validation.
 *
 * Connects to the staging Supabase project (from VITE_SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY in .env) and verifies:
 *
 *   1. All 49 expected public tables exist.
 *   2. quote_methods has every column required by toDbRow() in importQuotes.ts.
 *   3. All public tables are at 0 rows (clean slate before first import).
 *   4. RLS is enabled on critical tables.
 *
 * This script performs SELECT-only queries against the Supabase REST API and
 * never calls .insert / .update / .delete / .upsert.
 *
 * Usage:
 *   npx tsx scripts/validateStagingSchema.ts
 *
 * Output is printed as PASS / FAIL / WARN per check and saved to
 * docs/STAGING_READ_VALIDATION_REPORT.md (path optionally overridden via
 * OUTPUT_REPORT env var).
 *
 * SAFETY: never connects to production. URL/key come from .env only.
 */

import 'dotenv/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Expected schema reference
// ---------------------------------------------------------------------------

const EXPECTED_TABLES = [
  'interpretive_glossary', 'interpretive_layer_resources', 'interpretive_tensions',
  'character_cards', 'comparative_matrix', 'comparison_pairs',
  'content_audit_log', 'content_changes', 'content_dataset_versions',
  'core_quote_evidence', 'cross_text_themes', 'curation_notes',
  'curation_status', 'dataset_publications', 'drama_act_overviews',
  'drama_extracts', 'drama_extract_passages', 'drama_quote_methods',
  'drama_scene_breakdowns', 'drama_themes',
  'feature_flags', 'import_logs', 'inspector_links', 'method_glossary',
  'paragraph_attempts', 'paragraph_runs', 'plan_revisions',
  'profiles', 'quote_methods', 'quote_pairs', 'reflection_entries',
  'response_quality_metrics', 'retrieval_logs', 'rubric_criteria',
  'saved_essay_plans', 'session_outcomes', 'soundbank',
  'starter_prompts', 'student_progress', 'theme_maps',
  'theme_pairings', 'tier1_library_packets', 'tier1_library_versions',
  'timed_sessions', 'topic_taxonomy', 'topic_taxonomy_terms',
  'usage_metrics', 'user_preferences', 'voice_card_examples',
];

const EXPECTED_QUOTE_METHODS_COLUMNS = [
  'id', 'source_row_key', 'source_text', 'quote_text',
  'method', 'best_themes', 'level_tag',
  'is_core_quote', 'b_mode_rank',
  'speaker_or_narrator', 'location_reference', 'plain_english_meaning',
  'linked_motifs', 'linked_context', 'linked_interpretations',
  'opening_stems', 'comparative_prompts', 'grade_priority',
  'exam_question_tags', 'recommended_for_questions', 'question_types',
  'ao_priority', 'comparison_strength', 'retrieval_priority', 'best_used_for',
];

const RLS_REQUIRED_TABLES = [
  'quote_methods', 'saved_essay_plans', 'timed_sessions', 'reflection_entries',
];

// Banned production project ref. If we ever see this in the URL we abort.
const PRODUCTION_REF = 'szdgsmpxtifrcmwelqfo';
const STAGING_REF    = 'nxlxunygoccbnzdopqna';

// ---------------------------------------------------------------------------
// Result accumulator
// ---------------------------------------------------------------------------

type Status = 'PASS' | 'FAIL' | 'WARN' | 'SKIP';

interface CheckResult {
  name: string;
  status: Status;
  detail: string;
}

const results: CheckResult[] = [];

function record(name: string, status: Status, detail: string) {
  results.push({ name, status, detail });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️ ' : '⏭️ ';
  console.log(`${icon} ${status.padEnd(4)} ${name}`);
  if (detail) console.log(`         ${detail}`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function tableExistsAndCount(supabase: SupabaseClient, table: string): Promise<{ exists: boolean; count: number | null; error?: string }> {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) {
    // Distinguish "table does not exist" from "permission denied"
    const msg = error.message || '';
    if (/does not exist|relation .* does not exist|schema cache/i.test(msg)) {
      return { exists: false, count: null, error: msg };
    }
    return { exists: true, count: null, error: msg };
  }
  return { exists: true, count: count ?? 0 };
}

async function probeColumns(supabase: SupabaseClient, table: string): Promise<{ ok: boolean; missing: string[]; error?: string }> {
  // Select all expected columns explicitly — PostgREST returns 400 on missing cols.
  const cols = EXPECTED_QUOTE_METHODS_COLUMNS.join(',');
  const { error } = await supabase.from(table).select(cols, { head: true, count: 'exact' });
  if (!error) return { ok: true, missing: [] };

  // If a column is missing, error usually mentions the column name.
  const msg = error.message || '';
  const missing: string[] = [];
  for (const col of EXPECTED_QUOTE_METHODS_COLUMNS) {
    if (msg.includes(`"${col}"`) || msg.includes(`'${col}'`) || msg.includes(` ${col} `) || msg.includes(`column ${col}`)) {
      missing.push(col);
    }
  }
  return { ok: false, missing, error: msg };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const key = serviceRoleKey ?? anonKey;
  const usingServiceRole = Boolean(serviceRoleKey);

  if (!supabaseUrl || !key) {
    console.error('Missing env. Need VITE_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY.');
    process.exit(1);
  }

  // ─── Production safety guard ────────────────────────────────────────────
  if (supabaseUrl.includes(PRODUCTION_REF)) {
    console.error(`\nABORT: VITE_SUPABASE_URL references the production project (${PRODUCTION_REF}).`);
    console.error('This script is staging-only. Refusing to connect.\n');
    process.exit(1);
  }
  if (!supabaseUrl.includes(STAGING_REF)) {
    console.warn(`\n⚠️  VITE_SUPABASE_URL does not contain the expected staging ref (${STAGING_REF}).`);
    console.warn(`   URL host portion: ${new URL(supabaseUrl).host}\n`);
  }

  console.log(`\nStaging schema validation`);
  console.log(`URL host: ${new URL(supabaseUrl).host}`);
  console.log(`Auth:     ${usingServiceRole ? 'service-role' : 'anon (limited — RLS will hide rows)'}`);
  console.log('─'.repeat(60));

  const supabase = createClient(supabaseUrl, key, { auth: { persistSession: false } });

  // ─── Check 1: tables exist + row counts ─────────────────────────────────
  const missingTables: string[] = [];
  const nonEmpty: Array<{ table: string; count: number }> = [];
  const inaccessible: Array<{ table: string; error: string }> = [];

  for (const table of EXPECTED_TABLES) {
    const r = await tableExistsAndCount(supabase, table);
    if (!r.exists) {
      missingTables.push(table);
    } else if (r.error) {
      inaccessible.push({ table, error: r.error });
    } else if ((r.count ?? 0) > 0) {
      nonEmpty.push({ table, count: r.count ?? 0 });
    }
  }

  if (missingTables.length === 0) {
    record('All 49 expected tables exist', 'PASS', `Checked ${EXPECTED_TABLES.length} tables`);
  } else {
    record('All 49 expected tables exist', 'FAIL',
      `Missing: ${missingTables.join(', ')}`);
  }

  if (inaccessible.length === 0) {
    record('All tables readable', 'PASS', '');
  } else if (!usingServiceRole) {
    record('All tables readable', 'WARN',
      `Anon key cannot read ${inaccessible.length} tables (RLS) — re-run with SUPABASE_SERVICE_ROLE_KEY for definitive check.`);
  } else {
    record('All tables readable', 'WARN',
      `Inaccessible: ${inaccessible.slice(0, 5).map((x) => x.table).join(', ')}${inaccessible.length > 5 ? '…' : ''}`);
  }

  if (nonEmpty.length === 0) {
    record('All tables at 0 rows', 'PASS', usingServiceRole ? 'Counted via service-role' : 'Counted via anon (RLS-filtered counts)');
  } else {
    record('All tables at 0 rows', 'WARN',
      `Non-zero: ${nonEmpty.map((x) => `${x.table}=${x.count}`).join(', ')}`);
  }

  // ─── Check 2: quote_methods columns ─────────────────────────────────────
  const colCheck = await probeColumns(supabase, 'quote_methods');
  if (colCheck.ok) {
    record('quote_methods has all required columns',
      'PASS',
      `Verified ${EXPECTED_QUOTE_METHODS_COLUMNS.length} columns`);
  } else if (colCheck.missing.length > 0) {
    record('quote_methods has all required columns',
      'FAIL',
      `Missing: ${colCheck.missing.join(', ')}`);
  } else {
    record('quote_methods has all required columns',
      'WARN',
      `Could not introspect; PostgREST said: ${colCheck.error}`);
  }

  // ─── Check 3: RLS on critical tables ────────────────────────────────────
  // We can't read pg_class directly via PostgREST, but if anon-key reads to
  // these tables succeed without auth, RLS is either disabled or has a public
  // policy. We probe by trying anon SELECTs as a smoke test, only if anon
  // key is available alongside service role.
  if (usingServiceRole && anonKey && anonKey !== serviceRoleKey) {
    const anonClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const rlsResults: string[] = [];
    for (const table of RLS_REQUIRED_TABLES) {
      const { error } = await anonClient.from(table).select('*', { count: 'exact', head: true });
      // RLS denial typically returns no error but 0 rows; permission denied is a strong signal.
      // Without a row to test against, the cleanest signal is: anon read succeeds AND service-role
      // sees the same 0 — both consistent with RLS-on-empty-table. Mark as WARN so the user
      // confirms in Supabase Studio.
      rlsResults.push(`${table}: ${error ? 'denied/blocked' : 'reachable (empty)'}`);
    }
    record('RLS enabled on critical tables', 'WARN',
      `Anon-probe results: ${rlsResults.join('; ')}. Confirm RLS=ON in Supabase Studio (read-only check cannot prove enforcement on empty tables).`);
  } else {
    record('RLS enabled on critical tables', 'SKIP',
      'Need both SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_ANON_KEY in .env to anon-probe. Verify via Supabase Studio: Database → Tables → check the RLS toggle on quote_methods, saved_essay_plans, timed_sessions, reflection_entries.');
  }

  // ─── Write report ───────────────────────────────────────────────────────
  console.log('─'.repeat(60));
  const counts = results.reduce<Record<Status, number>>(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }),
    { PASS: 0, FAIL: 0, WARN: 0, SKIP: 0 },
  );
  console.log(`Summary: ${counts.PASS} PASS, ${counts.FAIL} FAIL, ${counts.WARN} WARN, ${counts.SKIP} SKIP`);

  const today = new Date().toISOString().slice(0, 10);
  const reportPath = process.env.OUTPUT_REPORT
    ?? path.join(process.cwd(), 'docs', 'STAGING_READ_VALIDATION_REPORT.md');

  const md = [
    `# Staging Read-Only Validation Report`,
    ``,
    `**Date:** ${today}`,
    `**Project:** Supabase staging (\`${STAGING_REF}\`)`,
    `**Auth used:** ${usingServiceRole ? 'service-role' : 'anon key (RLS-limited)'}`,
    `**URL host:** ${new URL(supabaseUrl).host}`,
    ``,
    `## Summary`,
    ``,
    `| Status | Count |`,
    `|--------|-------|`,
    `| PASS   | ${counts.PASS} |`,
    `| FAIL   | ${counts.FAIL} |`,
    `| WARN   | ${counts.WARN} |`,
    `| SKIP   | ${counts.SKIP} |`,
    ``,
    `## Checks`,
    ``,
    `| Check | Status | Detail |`,
    `|-------|--------|--------|`,
    ...results.map((r) => `| ${r.name} | ${r.status} | ${r.detail.replace(/\|/g, '\\|')} |`),
    ``,
    `## Notes`,
    ``,
    `- This script is read-only. It only calls \`.select()\` on Supabase tables.`,
    `- Production project ref \`${PRODUCTION_REF}\` is on the deny-list and the script aborts if the URL contains it.`,
    `- The RLS check is structurally limited: with empty tables, anon-key SELECT returns 0 rows whether RLS is enabled or not. Confirm RLS via Supabase Studio.`,
    ``,
  ].join('\n');

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, md);
  console.log(`\nReport written to ${reportPath}`);

  if (counts.FAIL > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
