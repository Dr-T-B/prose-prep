# Staging Migration Apply Report

## Target

- Repo: `/Users/tarwindersaran/Downloads/Projects/prose-prep`
- Staging Supabase ref: `nxlxunygoccbnzdopqna`
- Production touched: No

## Safety Confirmations

- Staging linkage confirmed: Yes. `supabase/config.toml` and `supabase/.temp/project-ref` both resolved to `nxlxunygoccbnzdopqna` after explicit relink.
- Production ref absent from active Supabase linkage: Yes, in the safe linkage files inspected.
- Secrets inspected: No
- Types regenerated: No
- Content imported: No separate seed or content import command was run. Note: migration `20240504000000_drama_scene_schema.sql` contains proof-of-concept seed inserts, and those migration-contained rows now exist on staging.

## Pre-Apply State

- Current branch: `codex/prepare-staging-schema`
- Working tree status: Clean before report creation.
- Supabase CLI version: `2.98.2`
- Local migration count: 29
- Remote staging migration count before apply: 0
- Any unexpected remote migrations: None. Remote appeared empty/unapplied.

## Migration Apply Result

- `npx supabase db push` result: Succeeded.
- Migrations applied:
  - `20240504000000_drama_scene_schema.sql`
  - `20260417115303_ad3baa4f-aadd-4672-a69c-5c25aa86db70.sql`
  - `20260418143855_29349ec3-093e-4d1b-bfb8-217890f6f529.sql`
  - `20260418230444_6983f823-5f63-4b2a-886d-720e01750823.sql`
  - `20260419043128_82353d56-92a5-4490-995d-d19b14989a98.sql`
  - `20260419043342_c96e2df3-233d-494a-b43d-ff71d1f52279.sql`
  - `20260419135846_449ca292-5311-4058-a771-53caebe102a3.sql`
  - `20260419155301_a331b1c4-e72f-4d24-81e6-8b7fddb45928.sql`
  - `20260419180437_fba08faf-a509-44e3-8073-29da051c6210.sql`
  - `20260422120000_extend_quote_methods.sql`
  - `20260423_add_essay_plans.sql`
  - `20260424150000_add_tier1_library_tables.sql`
  - `20260424161000_extend_staged_changes_for_tier1_imports.sql`
  - `20260424999999_essay_plans_add_is_current.sql`
  - `20260425000000_create_quote_pairs.sql`
  - `20260425000001_quote_methods_source_row_key.sql`
  - `20260426000000_create_missing_content_tables.sql`
  - `20260426000001_create_glossary_terms.sql`
  - `20260427110000_paragraph_attempts_and_quote_pair_mastery.sql`
  - `20260427113000_dashboard_next_best_action.sql`
  - `20260428020000_add_retrieval_tables.sql`
  - `20260429010000_fix_critical_rls_and_student_progress.sql`
  - `20260429135959_reconcile_staging_schema_chain.sql`
  - `20260429140000_secure_progress_tables_and_functions.sql`
  - `20260430000000_security_hardening.sql`
  - `20260430010000_performance_indexes.sql`
  - `20260430020000_normalise_policies.sql`
  - `20260430030000_fix_paragraph_attempts_insert_policy.sql`
  - `20260505010059_expand_drama_themes_and_curation_status.sql`
- Errors: None. The CLI emitted non-blocking notices for missing triggers, policies, and a replaced check constraint during idempotent migration operations.

## Post-Apply Migration State

- Remote migration state: All 29 local migrations are reflected remotely on staging.
- Any local/remote mismatch: None detected by `npx supabase migration list --linked`.

## Schema Verification

- Tables verified: Yes. Public schema contains 49 base tables and 3 views, including core tables (`profiles`, `modules`, `lessons`, `resources`, `routes`, `questions`, `theses`, `quote_methods`) and migration-created tables (`essay_plans`, Tier 1 library tables, `quote_pairs`, `glossary_terms`, paragraph attempt/mastery tables, retrieval tables).
- Constraints verified: Yes. Public schema has 49 primary key constraints, 59 foreign key constraints, 12 unique constraints, and 33 check constraints.
- RLS verified: Yes. RLS is enabled on all 49 public base tables.
- Content import detected: No import/staged/library/user-progress content was detected (`import_logs`, `staged_changes`, Tier 1 library tables, user tables, paragraph progress tables, and retrieval tables were empty). However, migration-contained proof-of-concept drama rows were detected: `drama_scenes` 1, `drama_scene_themes` 6, `drama_scene_characters` 4, `drama_scene_ao1_arguments` 1, `drama_scene_ao2_methods` 5, `drama_scene_ao5_readings` 3, `drama_scene_essay_uses` 7.
- Notes: `quote_methods.curation_status` check constraint exists and allows `review`, `core`, `strong`, `good`, and `draft`. A first dynamic all-table count query hit a transient Supabase upstream 503; smaller follow-up count queries succeeded.

## Known Warning Retained

`quote_methods.curation_status` mismatch remains unresolved.

Migration allows:

- `review`
- `core`
- `strong`
- `good`
- `draft`

Prose seed/app types use:

- `secure`
- `strong`
- `top_band`

This does not block empty staging migration apply, but must be resolved before content import or before treating staging as representative.

## Local Checks

- `npm run test`: Passed. 64 passed, 3 skipped.
- `npm run lint`: Passed. 0 errors, 24 existing warnings.
- `npm run build`: Passed. Vite build completed; existing Browserslist and chunk-size warnings were reported.
- Typecheck: Typecheck not run: no typecheck script exists.

## Final Status

PARTIAL: migrations applied and schema verification completed, but migration-contained proof-of-concept seed rows were detected in drama-scene tables. No separate seed/content import command was run.

## Next Recommended Action

Resolve the `quote_methods.curation_status` mismatch before any content import or before treating staging as representative. Separately decide whether the proof-of-concept drama rows embedded in `20240504000000_drama_scene_schema.sql` are acceptable for staging or need a non-destructive follow-up plan.
