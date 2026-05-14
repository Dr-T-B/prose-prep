# Staging Migration Plan

Date: 2026-05-14

## Scope

This plan audits the local Supabase migration set before any staging database
mutation. Production Supabase is deny-listed for this work.

- Staging project ref: `nxlxunygoccbnzdopqna`
- Production deny-list ref: `szdgsmpxtifrcmwelqfo`
- Database push status: blocked
- Types regeneration status: blocked

No secrets were inspected or printed.

## Safety Findings

Repository identity was confirmed from `docs/REPO_IDENTITY.md`,
`BACKEND_STATUS.md`, and the Git remote as `Dr-T-B/prose-prep`.

`supabase/config.toml` points to `nxlxunygoccbnzdopqna` and does not point to
`szdgsmpxtifrcmwelqfo`.

`supabase/.temp/project-ref` is not currently present in this worktree, so the
live Supabase CLI linked project was not reconfirmed from local CLI metadata in
this run. `supabase/.temp/` is ignored by `.gitignore`.

`.env.example` contains placeholders only. `.env`, `.env.local`, and
`.env.*.local` are ignored. Real local env files were not inspected.

A committed-repo search found the production ref only in safety/audit
documentation, not in runtime configuration, app code, scripts, or deploy
configuration.

## Migration Suitability Decision

The local migration set is not suitable for applying to an empty staging
database as-is.

Two high-confidence blockers were found:

1. `supabase/migrations/20260429140000_secure_progress_tables_and_functions.sql`
   revokes and alters zero-argument functions that are not created by the local
   migration history:
   - `REVOKE EXECUTE ON FUNCTION has_role() FROM anon;`
   - `REVOKE EXECUTE ON FUNCTION is_owner() FROM anon;`
   - `ALTER FUNCTION trigger_set_updated_at() SET search_path = public;`

   The local migrations create `public.has_role(uuid, public.app_role)` and
   `public.is_owner(uuid, text)`, not zero-argument variants. The
   `trigger_set_updated_at()` function exists only in
   `src/stage1/sql/migration_thematic_axis.sql`, not in
   `supabase/migrations/`.

2. `supabase/migrations/20260505010059_expand_drama_themes_and_curation_status.sql`
   assumes `quote_methods.curation_status` and
   `quote_methods_curation_status_check` already exist. The prior local
   migrations do not create that column or constraint, so a fresh staging push
   is expected to fail at the `ALTER TABLE quote_methods DROP CONSTRAINT ...`
   statement.

Because historical migrations should not be edited casually, the safe next step
is a forward reconciliation migration or a deliberate migration-history repair
plan aimed at staging only. No database migration was applied in this run.

## Ordered Migration Audit

| Order | Migration | Summary | Classification | Empty-staging suitability |
|---:|---|---|---|---|
| 1 | `20240504000000_drama_scene_schema.sql` | Creates nine `drama_scene_*` tables and seeds Hamlet scene data. | Schema creation, RLS/security policy, seed/data | Technically additive, but product-scope warning: Drama schema appears out of scope for the Prose app. |
| 2 | `20260417115303_ad3baa4f-aadd-4672-a69c-5c25aa86db70.sql` | Creates core prose content tables plus saved plans, timed sessions, reflections, owner helper, indexes, triggers, and RLS. | Schema creation, RLS/security policy, index/performance, function, trigger | Suitable for empty staging as a base migration. |
| 3 | `20260418143855_29349ec3-093e-4d1b-bfb8-217890f6f529.sql` | Adds `app_role`, user roles, import logs, saved views, admin helper RPC, and admin content policies. | Schema creation, RLS/security policy, function/RPC, trigger, index/performance | Suitable after the base migration. |
| 4 | `20260418230444_6983f823-5f63-4b2a-886d-720e01750823.sql` | Adds profiles, modules, lessons, lesson progress, resources, signup profile trigger, and backfill from `auth.users`. | Schema creation, RLS/security policy, function, trigger, index/performance, reconciliation/backfill | Mostly suitable; assumes Supabase `auth.users` exists, which is normal. |
| 5 | `20260419043128_82353d56-92a5-4490-995d-d19b14989a98.sql` | Creates `normalization_proposals` review queue. | Schema creation, RLS/security policy, function, trigger, index/performance | Suitable, but immediately superseded by the next migration. |
| 6 | `20260419043342_c96e2df3-233d-494a-b43d-ff71d1f52279.sql` | Drops `normalization_proposals` and creates the generalized `staged_changes` review queue. | Destructive change, schema creation, RLS/security policy, function, trigger, index/performance | Suitable on empty staging, but intentionally drops the prior review table. |
| 7 | `20260419135846_449ca292-5311-4058-a771-53caebe102a3.sql` | Adds `staged_changes` to Supabase Realtime and sets replica identity. | Realtime/publication change, replication setting | Risky if the publication/table state differs; later migration removes this table from realtime. |
| 8 | `20260419155301_a331b1c4-e72f-4d24-81e6-8b7fddb45928.sql` | Adds `paragraph_cards` to `saved_essay_plans`. | Schema alteration | Suitable after `saved_essay_plans` exists. |
| 9 | `20260419180437_fba08faf-a509-44e3-8073-29da051c6210.sql` | Tightens `is_owner` to authenticated ownership and removes `staged_changes` from realtime if present. | Function, security repair, reconciliation/drift repair | Suitable after prior helpers/tables exist. |
| 10 | `20260422120000_extend_quote_methods.sql` | Adds structured quote import fields and unique import dedupe index. | Schema alteration, index/performance | Suitable after `quote_methods` exists. |
| 11 | `20260423_add_essay_plans.sql` | Creates separate `essay_plans` table with RLS and updated-at trigger. | Schema creation, RLS/security policy, function, trigger, index/performance | Suitable. |
| 12 | `20260424150000_add_tier1_library_tables.sql` | Creates Tier 1 library tables, indexes, updated-at triggers, and admin policies. | Schema creation, RLS/security policy, trigger, index/performance | Suitable after `import_logs` and `has_role` exist. |
| 13 | `20260424161000_extend_staged_changes_for_tier1_imports.sql` | Adds Tier 1 import compatibility columns, constraints, FK, and indexes to `staged_changes`. | Schema alteration, reconciliation/drift repair, index/performance | Suitable after `staged_changes` and `import_logs` exist. |
| 14 | `20260424999999_essay_plans_add_is_current.sql` | Adds `is_current` flag and index to `essay_plans`. | Schema alteration, index/performance | Suitable after `essay_plans` exists. |
| 15 | `20260425000000_create_quote_pairs.sql` | Creates `quote_pairs` with RLS, admin policy, indexes, and updated-at trigger. | Schema creation, RLS/security policy, trigger, index/performance | Suitable after `quote_methods` and `has_role` exist. |
| 16 | `20260425000001_quote_methods_source_row_key.sql` | Adds `source_row_key` to `quote_methods` and a partial unique index. | Schema alteration, index/performance | Suitable after `quote_methods` exists. |
| 17 | `20260426000000_create_missing_content_tables.sql` | Creates `exam_questions`, `thesis_routes`, and `paragraph_templates` as stubs for tables that existed without migrations. | Schema creation, RLS/security policy, reconciliation/drift repair | Suitable, but the comments show production drift history. |
| 18 | `20260426000001_create_glossary_terms.sql` | Creates `glossary_terms` with authenticated read and admin policy. | Schema creation, RLS/security policy, reconciliation/drift repair | Suitable after `has_role` exists. |
| 19 | `20260427110000_paragraph_attempts_and_quote_pair_mastery.sql` | Creates student quote mastery, paragraph attempts, quote links, policies, indexes, and updated-at triggers. | Schema creation, RLS/security policy, trigger, index/performance | Suitable after `quote_pairs` and `profiles` exist. |
| 20 | `20260427113000_dashboard_next_best_action.sql` | Creates progress/recent paragraph views and `get_next_best_action` RPC. | View, function/RPC | Suitable after progress tables exist. |
| 21 | `20260428020000_add_retrieval_tables.sql` | Creates retrieval items, sessions, responses, policies, indexes, and due-today view. | Schema creation, RLS/security policy, index/performance, view | Suitable. |
| 22 | `20260429010000_fix_critical_rls_and_student_progress.sql` | Converts progress ownership to `auth.users`, replaces FKs and policies, rewrites next-best-action RPC, and repairs retrieval policies. | RLS/security policy, function/RPC, reconciliation/drift repair, data update | Suitable on empty staging, though it contains production-repair data updates. |
| 23 | `20260429140000_secure_progress_tables_and_functions.sql` | Tries to tighten policies and revoke function access. | RLS/security policy, function hardening | Not suitable: references non-existent zero-argument functions and `trigger_set_updated_at()`. |
| 24 | `20260430000000_security_hardening.sql` | Revokes anon grants, recreates authenticated owner policies, pins helper function search paths, restricts admin RPCs. | RLS/security policy, function hardening, reconciliation/drift repair | Likely suitable after blocker 23 is resolved. |
| 25 | `20260430010000_performance_indexes.sql` | Auto-adds FK indexes and normalizes hot RLS policies for planner performance. | Index/performance, RLS/security policy, reconciliation/drift repair | Likely suitable after prior tables/policies exist. |
| 26 | `20260430020000_normalise_policies.sql` | Drops legacy short policy names and ensures paragraph quote-link policies exist. | RLS/security policy, reconciliation/drift repair | Likely suitable after progress tables exist. |
| 27 | `20260430030000_fix_paragraph_attempts_insert_policy.sql` | Recreates canonical policies after production migration-repair drift. | RLS/security policy, reconciliation/drift repair | Likely suitable after progress tables exist, but comments confirm production drift history. |
| 28 | `20260505010059_expand_drama_themes_and_curation_status.sql` | Expands theme validation for Drama tokens and widens `quote_methods.curation_status` constraint. | Function, schema alteration, constraint change, product-scope drift | Not suitable: assumes missing `curation_status` column/constraint and introduces Drama scope into Prose schema. |

## SQL Files Outside `supabase/migrations/`

The repository contains additional SQL files outside the canonical migration
folder:

- `sql/core_current_schema.sql`: reconstructed core schema for a new Supabase
  project.
- `sql/minimal_seed_data.sql`: minimal verification seed data.
- `sql/profiles_auto_create_trigger.sql`: profile trigger helper.
- `sql/drama_scene_schema_seed.sql`: reference copy for Drama scene schema,
  explicitly says not to apply via Supabase CLI.
- `src/stage1/sql/migration_thematic_axis.sql`: thematic-axis companion schema.
- `src/stage1/sql/seed_thematic_axis.sql`: thematic-axis seed data.

These files indicate schema history and potential drift outside the canonical
Supabase migration chain. They should not be applied implicitly as part of
staging schema preparation.

## Warnings

- The local migration chain contains production/drift-repair comments and
  production-specific assumptions.
- The migration chain includes Drama-scoped DDL/data in a Prose app repo.
- Some migrations are intentionally destructive only for transient objects or
  policies (`DROP TABLE IF EXISTS`, `DROP POLICY IF EXISTS`, trigger drops).
- No broad destructive table truncation or database reset command is required
  or authorized.
- A forward reconciliation migration is needed before staging can be prepared
  safely from this migration chain.

