# Import Readiness Report

**Date:** 2026-05-15
**Target:** Staging Supabase (`nxlxunygoccbnzdopqna`)
**Scope:** Confirm `prose-prep` is safe to import content into staging.

---

## 1. Dry-run mode status — **PASS**

- `scripts/importQuotes.ts` now defaults to **dry-run**. Writes happen only
  when `--write` is passed on the command line.
- `npm run import-quotes` → dry-run (default). Prints a summary table of
  would-insert / would-update / would-skip counts plus validation errors.
- `npm run import-quotes:write` → write mode. Prints
  `"WRITE MODE: this will mutate staging Supabase."` at the start, then
  performs the same batched insert + update as before.
- The write path (`upsertQuotes`) is guarded three ways:
  1. `main()` only invokes it when `parseArgs(...).write === true`.
  2. An explicit `writeMode: boolean` parameter is asserted at the top.
  3. The function throws if `writeMode === false` (defence in depth).
- A guard comment box flags the write path for reviewers.
- Tests in `src/test/importQuotes.test.ts` cover:
  - dry-run never calls `.insert / .update / .upsert / .delete`
  - classification counts (insert / update / skip-duplicate) are accurate
  - the write-mode gate throws when invoked without `--write`
  - invalid input (missing `quote_text` / `text_name`) produces a validation
    error in the summary, never a DB write or unhandled exception
- `npm test` → **14 new tests pass; 78 total pass, 3 skipped.**

## 2. Staging schema validation — **PASS** (1 SKIP)

Run via `npx tsx scripts/validateStagingSchema.ts` against staging with
anon-key auth. Full output in
[STAGING_READ_VALIDATION_REPORT.md](STAGING_READ_VALIDATION_REPORT.md).

| Check | Result |
|-------|--------|
| All 49 expected public tables exist | PASS (49/49) |
| All tables readable | PASS |
| All tables at 0 rows | PASS (counted via anon; RLS-filtered) |
| `quote_methods` has all 25 required columns | PASS |
| RLS enabled on critical tables | SKIP — requires service-role key to anon-probe; verify in Supabase Studio |

The RLS check is structurally limited: with empty tables, an anon SELECT
returns 0 rows regardless of whether RLS is enabled. Confirm via Supabase
Studio (Database → Tables → RLS toggle) on `quote_methods`,
`saved_essay_plans`, `timed_sessions`, and `reflection_entries` before the
import session.

## 3. Deployment hygiene

### 3a — Package manager: **DONE**

- `bun.lock` deleted. `bun.lockb` was not present.
- `package.json` continues to declare `"packageManager": "npm@11.6.2"`.
- `BACKEND_STATUS.md` updated with a "Package manager" section confirming
  npm is canonical.

### 3b — Deployment platform: **REPORTED (no file deleted yet)**

| File | What it configures |
|------|--------------------|
| `vercel.json` | SPA rewrite (`/(.*)` → `/index.html`) + `Cache-Control: no-cache, no-store, must-revalidate` on `/sw.js`. **No build command, no output dir, no Node version pin** — relies entirely on Vercel autodetect. |
| `netlify.toml` | Build command `npm run build`, publish dir `dist`, `NODE_VERSION=20`, plus `Cache-Control: no-cache, no-store, must-revalidate` on `/sw.js` and `public, max-age=31536000, immutable` on `/assets/*`. |

**Recommendation: keep `netlify.toml`, delete `vercel.json`.** Reasons:
- `netlify.toml` is more explicit (pinned Node 20, declared build + publish)
  whereas `vercel.json` provides no build configuration.
- `netlify.toml` adds a long-cache header on `/assets/*` which improves PWA
  asset delivery; `vercel.json` does not.
- The PWA service-worker no-cache header is duplicated in both, so there's
  no platform-specific behaviour at risk.
- If Vercel is later chosen, a new `vercel.json` can be reconstructed in
  minutes by mirroring `netlify.toml`.

Final call deferred to Tawi. No file deleted in this session.

### 3c — `typecheck` script: **DONE**

- Added `"typecheck": "tsc --noEmit"` to `package.json` `scripts`.
- Ran `npm run typecheck`. **0 type errors** (exit 0).
- No follow-up triage needed.

## 4. Next step — content import session

Single ordered checklist. Do this in the *next* session, not this one.

1. **Run `npm run import-quotes` against staging with staging credentials in
   `.env` and confirm the dry-run summary shows the expected row counts
   before proceeding to `npm run import-quotes:write`.**
   - `.env` must contain both `VITE_SUPABASE_URL` (staging) and
     `SUPABASE_SERVICE_ROLE_KEY` (staging).
   - Never commit `.env`.
2. Re-run `npx tsx scripts/validateStagingSchema.ts` with the service-role
   key in `.env` to upgrade the RLS check from SKIP to a definitive result.
3. Review the dry-run summary: would-insert should equal expected HT+AT
   counts, would-update should be 0 (clean staging), would-skip should be 0
   or a small known number of within-batch duplicates, validation errors
   should be 0.
4. If the dry-run summary is correct, run `npm run import-quotes:write`.
5. Confirm `quote_methods` row count in Supabase Studio matches the
   would-insert number from step 3.
6. Check Library → Quotes UI renders real content end-to-end.
7. Repeat the analogous flow for `quote_pairs`, `character_cards`,
   `theme_maps`, `comparative_matrix`, `ao5_tensions` via the CSV importer
   or Tier 1 library importer — choice depends on Tawi's final call on
   section 3b above.

---

## What was NOT done in this session (by design)

- No connection to production Supabase (`szdgsmpxtifrcmwelqfo`).
- No writes against staging.
- No real content imported.
- No service-role key inspected, printed, logged, or committed.
- No historical migration files edited.
- `vercel.json` retained (deletion deferred to platform decision).
