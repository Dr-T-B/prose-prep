# PR #2 Staging Schema Review Rerun Report

## PR

- PR: #2, https://github.com/Dr-T-B/prose-prep/pull/2
- Branch: `codex/prepare-staging-schema`
- Base: `main`
- Review date: 2026-05-14
- Final review status: PASS WITH NOTES

## Reason for rerun

Previous review status:

- CHANGES REQUESTED

Previous blocker:

- Missing `quote_methods.is_active`
- Missing `quote_methods.sort_order`
- Missing `comparative_matrix.level_band`
- Missing `comparative_matrix.is_active`
- Missing `comparative_matrix.sort_order`

Fix commit:

- `92c4611 Align content contract metadata columns with staging schema`

## Safety confirmations

- Production touched: No
- Secrets inspected: No secret files or secret values inspected; only committed diff/docs/config text was reviewed.
- Secrets found in diff: No
- Content imported: No
- Database commands run: No Supabase database, migration, type-generation, or content-import commands were run during this rerun. Only safe config-file inspection was performed.
- `db reset` run: No
- PR merged: No

## PR metadata

- Title: `Prepare staging schema for Prose content import`
- URL: https://github.com/Dr-T-B/prose-prep/pull/2
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
- `supabase/migrations/20260514223610_add_content_contract_metadata_columns.sql`

### Generated types

- `src/integrations/supabase/types.ts`

### Documentation/reports

- `docs/CONTENT_CONTRACT_SCHEMA_ALIGNMENT_REPORT.md`
- `docs/PR2_STAGING_SCHEMA_REVIEW_REPORT.md`
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

- None in the PR diff. Safe local inspection confirmed `supabase/config.toml` and `supabase/.temp/project-ref` point to staging ref `nxlxunygoccbnzdopqna`.

### Other/unexpected

- No unrelated file categories were introduced.
- `git diff --check origin/main...HEAD` reports trailing blank-line-at-EOF warnings in `docs/STAGING_MIGRATION_PLAN.md` and `docs/STAGING_SCHEMA_BLOCKED.md`. This is cosmetic and not a merge blocker.

## Migration review

### POC Drama seed cleanup migration

- File: `supabase/migrations/20260514210803_remove_poc_drama_seed_rows.sql`
- Safe to merge: Yes
- Notes: Deletes child rows before parent rows. Predicates are narrow and target only the Hamlet Act 3 Scene 1 proof-of-concept row with `scene_id = 'hamlet_3_1'`, `play = 'hamlet'`, `act_scene = '3.1'`, and `scene_title = 'Surveillance, Suicide, and Ophelia'`. No broad wipes, schema drops, unrelated deletes, or content imports were found. It is a safe no-op if the rows are absent.

### `quote_methods.curation_status` alignment migration

- File: `supabase/migrations/20260514212610_align_quote_methods_curation_status.sql`
- Canonical values: `secure`, `strong`, `top_band`
- Safe to merge: Yes
- Notes: Drops only `quote_methods_curation_status_check`, recreates it with the canonical values, and updates the column comment. It does not import data, delete data, touch unrelated tables, or edit historical migrations.

### Content contract metadata migration

- File: `supabase/migrations/20260514223610_add_content_contract_metadata_columns.sql`
- Columns added:
  - `quote_methods.is_active boolean not null default true`
  - `quote_methods.sort_order integer`
  - `comparative_matrix.level_band text`
  - `comparative_matrix.is_active boolean not null default true`
  - `comparative_matrix.sort_order integer`
- Data import: No
- Existing data deleted: No
- Historical migrations edited: No
- Previous blocker resolved: Yes
- Safe to merge: Yes
- Notes: Uses `add column if not exists` forward migration logic. Defaults preserve existing import behaviour, and comments accurately describe app/import metadata purpose.

### Staging reconciliation migration

- File: `supabase/migrations/20260429135959_reconcile_staging_schema_chain.sql`
- Safe to merge: Yes, with notes
- Notes: Compatibility-only migration that creates the updated-at helper, inert zero-argument helper overloads, and a temporary curation-status baseline so the historical chain can replay on empty staging. It imports no data, deletes no data, and leaves historical migrations intact. The later curation-status migration supersedes the temporary baseline values.

## Prompt review

- File: `prompts/quote_bank_master.md`
- `curation_status` aligned: Yes, the prompt now documents `secure | strong | top_band`.
- `is_active`/`sort_order` now schema-backed: Yes
- Deprecated values removed: Yes for `quote_methods.curation_status`.
- Safe to merge: Yes
- Notes: The prompt still requires exactly 24 keys and still emits `is_active` and `sort_order`; those fields now exist in generated staging schema/types. JSON-only output rules remain intact, and the prompt change does not trigger content import.

## Generated types review

- File: `src/integrations/supabase/types.ts`
- Generated from staging: Appears yes, based on the regeneration reports and schema-refresh diff.
- Required metadata fields present: Yes
- CHECK-constraint caveat understood: Yes. `quote_methods.curation_status` remains `string | null`, which is acceptable because it is a `text` column with a CHECK constraint, not a Postgres enum.
- Secrets/production refs: No secrets or production refs in the generated type file.
- Previous blocker resolved: Yes
- Safe to merge: Yes
- Notes: The required `quote_methods` and `comparative_matrix` metadata fields are present in `Row`, `Insert`, and `Update`. No unexpected major schema removal was identified.

## Documentation review

- Reports reviewed:
  - `docs/STAGING_MIGRATION_APPLY_REPORT.md`
  - `docs/STAGING_SEED_CONTAMINATION_CLEANUP_REPORT.md`
  - `docs/QUOTE_METHODS_CURATION_STATUS_ALIGNMENT_REPORT.md`
  - `docs/STAGING_SUPABASE_TYPES_REGENERATION_REPORT.md`
  - `docs/CONTENT_CONTRACT_SCHEMA_ALIGNMENT_REPORT.md`
  - `docs/PR2_STAGING_SCHEMA_REVIEW_REPORT.md`
- Internal consistency: Yes
- Safety claims accurate: Yes
- Follow-up blocker fix documented: Yes
- Safe to merge: Yes
- Notes: The reports consistently describe the initial partial migration apply, the POC Drama cleanup, curation-status alignment, type regeneration, and the follow-up metadata-column fix. They do not claim production was touched, secrets were inspected, content was imported, or PR #2 was merged.

## Secret and ref scan

- Production refs found: Yes, only as safety/audit deny-list references.
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

PASS WITH NOTES - PR #2 is safe to merge after human review.

The previous app/import/schema contract blocker is resolved by the forward metadata-column migration and regenerated staging types. No production mutation, secret exposure, content import, database reset, migration run, type regeneration, merge, or force push occurred during this rerun.

Notes before merge:

- PR #2 is currently marked draft. It must be marked ready for review before normal merge flow.
- `git diff --check origin/main...HEAD` reports two cosmetic trailing blank-line-at-EOF warnings in existing documentation files.
- Existing local lint warnings and build warnings remain, but there are 0 lint errors and the build succeeds.

## Required next action

- Human may review and merge PR #2 after marking it ready, if appropriate.
- Do not import real content immediately after merge.
- Next technical step is dry-run content import validation against staging.
