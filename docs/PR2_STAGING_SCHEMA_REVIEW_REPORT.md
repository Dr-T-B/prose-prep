# PR #2 Staging Schema Review Report

## PR

- PR: #2, https://github.com/Dr-T-B/prose-prep/pull/2
- Branch: `codex/prepare-staging-schema`
- Base: `main`
- Review date: 2026-05-14
- Final review status: CHANGES REQUESTED

## Safety confirmations

- Production touched: No
- Secrets inspected: No real secret files or secret values inspected; only committed placeholders/docs were reviewed.
- Secrets found in diff: No
- Content imported: No
- Database commands run: No database mutation or Supabase migration commands were run during this review; only safe config-file inspection was performed.
- `db reset` run: No
- PR merged: No

## PR metadata

- Title: `Prepare staging schema for Prose content import`
- State: OPEN
- Draft: Yes
- Mergeability: MERGEABLE
- Review decision: None reported
- Status checks: Unit tests succeeded; live Supabase integration tests were skipped.

## Diff summary

### Supabase migrations

- `supabase/migrations/20260429135959_reconcile_staging_schema_chain.sql`
- `supabase/migrations/20260514210803_remove_poc_drama_seed_rows.sql`
- `supabase/migrations/20260514212610_align_quote_methods_curation_status.sql`

### Generated types

- `src/integrations/supabase/types.ts`

### Documentation/reports

- `docs/QUOTE_METHODS_CURATION_STATUS_ALIGNMENT_REPORT.md`
- `docs/STAGING_MIGRATION_APPLY_REPORT.md`
- `docs/STAGING_MIGRATION_PLAN.md`
- `docs/STAGING_RECONCILIATION_MIGRATION_REVIEW.md`
- `docs/STAGING_SCHEMA_BLOCKED.md`
- `docs/STAGING_SCHEMA_PREPARATION.md`
- `docs/STAGING_SEED_CONTAMINATION_CLEANUP_REPORT.md`
- `docs/STAGING_SUPABASE_TYPES_REGENERATION_REPORT.md`

### Prompts

- `prompts/quote_bank_master.md`

### App/runtime code

- None

### Config

- None in the PR diff. Local safe inspection confirmed `supabase/config.toml` and `supabase/.temp/project-ref` point to `nxlxunygoccbnzdopqna`.

### Other/unexpected

- No unrelated file categories were introduced.
- Minor whitespace note: `git diff --check origin/main...HEAD` reports trailing new blank-line-at-EOF warnings in `docs/STAGING_MIGRATION_PLAN.md` and `docs/STAGING_SCHEMA_BLOCKED.md`.

## Migration review

### POC Drama seed cleanup migration

- File: `supabase/migrations/20260514210803_remove_poc_drama_seed_rows.sql`
- Narrow predicates: Yes
- Broad deletes: No
- Schema objects changed: No
- Safe to merge: Yes
- Notes: Deletes child rows before the parent row and targets the proof-of-concept Hamlet row using `scene_id = 'hamlet_3_1'`, `play = 'hamlet'`, `act_scene = '3.1'`, and `scene_title = 'Surveillance, Suicide, and Ophelia'`. Safe if the row is absent because the deletes become no-ops.

### `quote_methods.curation_status` alignment migration

- File: `supabase/migrations/20260514212610_align_quote_methods_curation_status.sql`
- Canonical values: `secure`, `strong`, `top_band`
- Data import: No
- Unrelated schema changes: No
- Safe to merge: Yes
- Notes: Drops only the old `quote_methods_curation_status_check`, recreates it with the canonical values, and updates the column comment.

### Staging reconciliation migration

- File: `supabase/migrations/20260429135959_reconcile_staging_schema_chain.sql`
- Safe to merge: Yes, with notes
- Notes: The migration is compatibility-only, creates inert zero-argument helper overloads, creates `trigger_set_updated_at()`, and adds a temporary curation-status compatibility baseline so the existing historical migration chain can replay. It does not import, delete, or rewrite content. The later alignment migration supersedes the old curation-status values.

## Prompt review

- File: `prompts/quote_bank_master.md`
- `curation_status` aligned: Yes
- Deprecated values removed: Partially. The edited line removes `good` and `draft`, but the prompt still asks each generated object to include `is_active` and `sort_order`.
- Safe to merge: No
- Notes: The prompt claims each output object represents one `quote_methods` row, but the regenerated staging type for `quote_methods` does not include `is_active` or `sort_order`. Either the staging schema needs those columns before dry-run import validation, or the prompt/import contract needs to stop emitting them.

## Generated types review

- File: `src/integrations/supabase/types.ts`
- Generated from staging: Appears to be generated from staging based on the report and the large schema-refresh diff.
- CHECK-constraint caveat understood: Yes. `quote_methods.curation_status` appears as `string | null`, which is acceptable because the column is `text` with a CHECK constraint rather than a Postgres enum.
- Secrets/production refs: No secrets or production refs in the generated type file.
- Safe to merge: No
- Notes: The generated staging schema exposes an app/schema contract mismatch. `quote_methods` has `curation_status` but does not have `is_active` or `sort_order`, while `src/lib/contentRepo.ts` still queries `quote_methods.eq("is_active", true)` and the quote-bank prompt still emits `is_active` and `sort_order`. Similar removed/generated-missing content metadata fields are still referenced elsewhere in app code, including `comparative_matrix.level_band`, `comparative_matrix.is_active`, and `comparative_matrix.sort_order`. This means staging is not yet ready for reliable app-backed dry-run import validation.

## Documentation review

- Reports reviewed:
  - `docs/STAGING_MIGRATION_APPLY_REPORT.md`
  - `docs/STAGING_SEED_CONTAMINATION_CLEANUP_REPORT.md`
  - `docs/QUOTE_METHODS_CURATION_STATUS_ALIGNMENT_REPORT.md`
  - `docs/STAGING_SUPABASE_TYPES_REGENERATION_REPORT.md`
  - plus the additional staging-plan/reconciliation/blocker/preparation reports included in the PR diff.
- Internal consistency: Mostly yes
- Safety claims accurate: Mostly yes
- Safe to merge: No
- Notes: The reports correctly describe the partial migration apply, later cleanup, curation-status alignment, and CHECK-constraint typing caveat. However, the type regeneration report says there are no unexpected generated changes requiring code changes; the regenerated type diff suggests the opposite because app code and prompt output still reference fields missing from the generated staging schema.

## Secret and ref scan

- Production refs found: Yes, only in safety/audit documentation as a deny-list reference.
- Unexpected production refs found: No
- Secrets found: No
- Staging refs found only in expected docs/config/type-regeneration reports: Yes

## Staging config inspection

- `supabase/config.toml`: `project_id = "nxlxunygoccbnzdopqna"`
- `supabase/.temp/project-ref`: `nxlxunygoccbnzdopqna`
- Config linkage: Staging-only

## Local checks

- `npm run test`: PASS, 64 passed / 3 skipped
- `npm run lint`: PASS, 24 warnings / 0 errors
- `npm run build`: PASS, with existing Browserslist age and chunk-size warnings
- Typecheck: Typecheck not run: no `typecheck` script exists.

## Review conclusion

CHANGES REQUESTED — PR #2 needs changes before merge.

The schema cleanup and curation-status migrations are narrow and safe, and local checks pass. The blocker is contract correctness: the generated staging schema/types show that content-table fields still expected by the app and prompt are missing from staging. Merging this PR as-is would label staging as ready for dry-run content import validation while at least the `quote_methods` path can still fail against staging due to the missing `is_active`/`sort_order` contract.

## Required next action

- Decide the intended canonical content-table contract before merge.
- If the app/import workflow still needs `is_active`, `sort_order`, and related metadata columns, add a forward staging migration for those fields, apply it to staging, regenerate types, and rerun checks.
- If those fields are intentionally removed, update app queries, prompt output rules, import handling, and reports so they no longer rely on missing columns.
- After those changes, rerun the PR review. Do not import real content yet; the next technical step should remain dry-run content import validation against staging.
