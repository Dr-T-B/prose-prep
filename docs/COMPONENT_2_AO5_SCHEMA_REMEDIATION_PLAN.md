# Component 2 AO5 Schema Remediation Plan

## 1. Executive summary

This is a forward-only planning pass for Pearson Edexcel A-Level English Literature Component 2: Prose, paper 9ET0/02. Component 2 assesses AO1, AO2, AO3, and AO4 only; AO5 must not be used as an assessed objective, import field, score, schema label, app model label, rubric, prompt requirement, or dataset route for Prose.

The staging database and repository still contain AO5-named schema and app surfaces. The most important live blockers are the `ao5_tensions` content path, `EssayPlan` persistence fields (`ao5_enabled`, `selected_ao5_ids`), paragraph/thesis route model fields (`ao5_prompt`, `ao5_tension`, `ao5_evaluation`, `ao5_self_score`), admin import/edit registries, and generated Supabase types.

Do not import Component 2 content yet. Proceed with a separate implementation branch that adds replacement names first, updates app code and import validation second, regenerates types from staging only third, and deprecates old names only after compatibility checks pass.

## 2. Repository and branch

- Repository: `Dr-T-B/prose-prep`
- Local path: `/Users/tarwindersaran/Downloads/Projects/prose-prep`
- Remote: `https://github.com/Dr-T-B/prose-prep.git`
- Branch for this pass: `fix/component-2-staging-ao5-schema-remediation-plan`
- Starting branch observed: `fix/component-2-canonical-import-ao5-rejection`

The worktree already had uncommitted changes from earlier passes before this branch was created. This pass only adds the remediation planning artifacts and improves validator classification/reporting.

## 3. Supabase project inspected

- Project URL: `https://nxlxunygoccbnzdopqna.supabase.co`
- Project ref: `nxlxunygoccbnzdopqna`
- Project name: `prose-craft-aid-staging`
- Local link file: `supabase/.temp/linked-project.json`

Read-only checks were run with `supabase db query --linked`. No SQL mutation, import, push, reset, or type regeneration was run.

## 4. Safety statement

No production project was touched. No Drive data was imported. No staging data or schema was changed. No `supabase db reset`, `supabase db push`, destructive SQL, or migration application was run. Historical migrations were read and classified, not edited.

## 5. Current AO5 schema surfaces

Read-only information schema checks found 15 AO5 schema/dependency surfaces:

| Surface | Type | Current state | Classification | Target |
| --- | --- | --- | --- | --- |
| `ao5_tensions` | table | 0 estimated rows | Component 2 blocker | `interpretive_tensions` |
| `drama_scene_ao5_readings` | table | 0 estimated rows | Component 1 Drama-valid exception | keep isolated |
| `essay_plans.ao5_enabled` | column | boolean | Component 2 blocker | `interpretive_extension_enabled` |
| `essay_plans.selected_ao5_ids` | column | jsonb | Component 2 blocker | `selected_interpretive_extension_ids` |
| `library_paragraph_frames.ao5_stem` | column | text | Component 2 import blocker | `interpretive_stem` |
| `paragraph_attempts.ao5_evaluation` | column | text | Component 2 blocker | `interpretive_judgement` |
| `paragraph_attempts.ao5_self_score` | column | integer | Component 2 blocker | `ao1_sophistication_self_score` |
| `quote_pairs.ao5_tension` | column | text | Component 2 blocker | `interpretive_tension` |
| `saved_essay_plans.selected_ao5_ids` | column | text[] | Component 2 blocker | `selected_interpretive_extension_ids` |
| `saved_essay_plans.ao5_enabled` | column | boolean | Component 2 blocker | `interpretive_extension_enabled` |
| `student_quote_pair_mastery.ao5_secure` | column | boolean | Component 2 blocker | `interpretive_secure` or remove from Prose mastery |
| `thesis_routes.ao5_tension` | column | text | Component 2 blocker | `interpretive_tension` |
| `retrieval_due_today` | view definition | joins `ao5_tensions`; item type `ao5_tension` | Component 2 blocker | join `interpretive_tensions`; item type `interpretive_tension` |
| `v_student_quote_pair_progress.ao5_secure` | view column | exposes `student_quote_pair_mastery.ao5_secure` | Component 2 blocker | expose `interpretive_secure` |
| `v_student_recent_paragraphs.ao5_self_score` | view column | exposes `paragraph_attempts.ao5_self_score` | Component 2 blocker | expose `ao1_sophistication_self_score` |

Additional database dependencies:

- Trigger: `trg_ao5_tensions_updated` on `ao5_tensions`.
- Policies: admin insert/update/delete and public read policies on `ao5_tensions`; authenticated read policy on `drama_scene_ao5_readings`.
- Functions: no public functions containing AO5 were found by read-only `pg_proc` inspection.

## 6. Current AO5 code surfaces

The targeted code sweep found 177 AO5-named line hits across live code, SQL, functions, prompts, and migrations, excluding `docs/`, `dist/`, lockfiles, and `node_modules`. The broader sweep including docs found 664 AO5-related line hits across 73 files.

Live code surfaces that would break or continue leaking AO5 if schema names changed without app updates:

- `src/lib/contentRepo.ts`: fetches `ao5_tensions`, exposes `ContentBundle.ao5_tensions`, falls back to `AO5_TENSIONS`.
- `src/data/seed.ts`: local fallback `AO5_TENSIONS` and `AO5Tension` records.
- `src/lib/planStore.ts`: `ParagraphCard.ao5_prompt`, `EssayPlan.ao5_enabled`, `EssayPlan.selected_ao5_ids`, local storage normalisation.
- `src/lib/planCloud.ts`: maps essay plan rows to/from `ao5_enabled` and `selected_ao5_ids`.
- `src/lib/planLogic.ts`: selects `AO5_TENSIONS` and serialises selected AO5 readings into plan output.
- `src/lib/paragraphEngine.ts` and `src/components/ParagraphEngine.tsx`: compute and edit `ao5_prompt` as an optional analytical position.
- `src/pages/EssayBuilder.tsx`: toggles `ao5_enabled`, selects `selected_ao5_ids`, reads `content.ao5_tensions`, and displays "Analytical positions".
- `src/pages/TimedPractice.tsx`: displays count of selected AO5 readings.
- `src/pages/InterpretiveFlex.tsx`: reads `ao5_tensions`; uses `ao5_lens` glossary category.
- `src/pages/ThesisRouteDetailPage.tsx`: displays `data.ao5_tension`.
- `src/types/thesisRoutes.ts`: declares `ao5_evaluation`, `ao5_prompt`, `ao5_tension`, `ao5_self_score`.
- Admin surfaces: `src/lib/datasets.ts`, `src/components/admin/ContentAudit.tsx`, `ContentInspector.tsx`, `DataDashboard.tsx`, `RecordEditor.tsx`, `ReviewQueue.tsx`, `VocabularyAudit.tsx`, `src/lib/vocabularyAudit.ts`.
- Generated types: `src/integrations/supabase/types.ts`.

## 7. Current AO5 import surfaces

Component 2 import blockers:

- `src/lib/datasets.ts` includes `ao5_tensions` as an importable content dataset labelled "AO5 Tensions".
- `src/lib/datasets.ts` persists user-state CSV fields `ao5_enabled` and `selected_ao5_ids`.
- `src/lib/tier1LibraryImport.ts` allows `library_paragraph_frames.ao5_stem` and maps aliases `"ao5_stem"` / `"ao5 stem"`.
- `supabase/functions/apply-staged-change/index.ts` allowlists `ao5_tensions` vocabulary normalization and `ao5_stem`.
- `scripts/validateStagingSchema.ts` expects legacy `ao5_glossary`, `ao5_layer_resources`, and `ao5_tensions`.
- `sql/minimal_seed_data.sql` inserts `ao5_tensions` rows.

## 8. Current AO5 UI/model surfaces

Several UI labels have already been softened to "Analytical position", "Interpretive lens", or "Critical readings", but the underlying models remain AO5-labelled. That is still a blocker because the schema/import path can carry AO5-named fields into Component 2 data.

Highest-risk UI/model paths:

- Essay Builder analytical-position picker.
- Paragraph Engine `ao5_prompt` suggestion and edit field.
- Interpretive Flex table query to `ao5_tensions`.
- Thesis Route detail display of `ao5_tension`.
- Library context adapter kind `"ao5"`.
- Admin data import, audit, edit, and review tools that still expose `ao5_tensions`.

## 9. Component 1 Drama-valid exceptions

`drama_scene_ao5_readings` is valid as a Component 1 Drama surface. It should not be renamed merely because it contains AO5. It should be isolated from Component 2 Prose import manifests, app routes, and validation scopes.

The prompt assets under `prompts/` are also Component 1 Drama-oriented for Hamlet and The Duchess of Malfi. They should be separated from Component 2 import paths or explicitly allowlisted as Drama-only assets.

## 10. Historical migration files that should not be edited directly

These historical migrations contain AO5 names but should remain immutable:

- `supabase/migrations/20240504000000_drama_scene_schema.sql` - Component 1 Drama exception.
- `supabase/migrations/20260417115303_ad3baa4f-aadd-4672-a69c-5c25aa86db70.sql` - creates `ao5_tensions` and early plan fields.
- `supabase/migrations/20260418143855_29349ec3-093e-4d1b-bfb8-217890f6f529.sql` - references `ao5_tensions`.
- `supabase/migrations/20260423_add_essay_plans.sql` - creates `ao5_enabled` and `selected_ao5_ids`.
- `supabase/migrations/20260424150000_add_tier1_library_tables.sql` - creates `library_paragraph_frames.ao5_stem`.
- `supabase/migrations/20260425000000_create_quote_pairs.sql` - creates `quote_pairs.ao5_tension`.
- `supabase/migrations/20260426000000_create_missing_content_tables.sql` - creates `thesis_routes.ao5_tension`.
- `supabase/migrations/20260427110000_paragraph_attempts_and_quote_pair_mastery.sql` - creates `ao5_secure`, `ao5_evaluation`, `ao5_self_score`.
- `supabase/migrations/20260427113000_dashboard_next_best_action.sql` - exposes AO5 fields in views.
- `supabase/migrations/20260428020000_add_retrieval_tables.sql` - retrieval item type and join for `ao5_tension`.
- `supabase/migrations/20260514210803_remove_poc_drama_seed_rows.sql` - removes prior Drama seed rows.

## 11. Generated files that must not be manually edited

- `src/integrations/supabase/types.ts`

Regenerate this file from staging only after the forward-only schema migration has been applied and verified. Do not regenerate from production. Do not hand-edit AO5 names out of generated types.

## 12. Dependency map

```text
ao5_tensions table
  -> src/lib/contentRepo.ts
  -> src/pages/InterpretiveFlex.tsx
  -> src/pages/EssayBuilder.tsx via ContentBundle
  -> src/pages/library/Context.tsx via toLibraryContextFromAO5
  -> src/components/admin/* audit/edit/review dashboards
  -> supabase/functions/apply-staged-change/index.ts
  -> retrieval_due_today view
  -> src/integrations/supabase/types.ts

essay_plans ao5 fields
  -> src/lib/planCloud.ts
  -> src/hooks/useCurrentPlanCloud.ts
  -> src/lib/planStore.ts
  -> src/pages/EssayBuilder.tsx
  -> src/pages/TimedPractice.tsx
  -> tests around plan persistence

saved_essay_plans ao5 fields
  -> src/lib/datasets.ts user-state import
  -> src/lib/persistence.ts
  -> src/lib/planRepository.ts
  -> plan store tests

paragraph_attempts ao5 fields
  -> src/types/thesisRoutes.ts
  -> src/pages/ParagraphBuilderPage.tsx
  -> v_student_recent_paragraphs

quote_pairs / thesis_routes ao5_tension
  -> src/types/thesisRoutes.ts
  -> src/pages/ThesisRouteDetailPage.tsx
  -> v_student_quote_pair_progress and paragraph route workflows

library_paragraph_frames.ao5_stem
  -> src/lib/tier1LibraryImport.ts
  -> Supabase generated types
  -> future library import packets
```

## 13. Recommended target names

Use the supplied target model:

| Current | Recommended target |
| --- | --- |
| `ao5_tensions` | `interpretive_tensions` |
| `ao5_tension` | `interpretive_tension` |
| `ao5_stem` | `interpretive_stem` |
| `ao5_prompt` | `analytical_position_prompt` |
| `ao5_evaluation` | `interpretive_judgement` |
| `ao5_self_score` | `ao1_sophistication_self_score` |
| `ao5_enabled` | `interpretive_extension_enabled` |
| `selected_ao5_ids` | `selected_interpretive_extension_ids` |
| `ao5_lens` | `interpretive_lens` |
| `ao5_secure` | `interpretive_secure` |
| `AO5_TENSIONS` | `INTERPRETIVE_TENSIONS` |

## 14. Proposed forward-only migration sequence

1. Create replacement schema without dropping old schema:
   - Create `interpretive_tensions` and copy from `ao5_tensions`.
   - Add replacement columns to affected tables.
   - Backfill replacement columns from AO5-named columns.
   - Add comments marking AO5-named columns/tables deprecated for Component 2.

2. Update compatibility views:
   - Keep existing view names if clients use them, but expose replacement aliases.
   - Add or change joins to `interpretive_tensions`.
   - Introduce retrieval item type `interpretive_tension` while preserving old rows until migrated.

3. Update app code:
   - Rename TypeScript interfaces and local state fields.
   - Update Supabase queries and admin registries.
   - Update import aliases to reject AO5-labelled headers for Component 2.
   - Keep temporary read compatibility from old columns where necessary.

4. Regenerate Supabase types from staging only.

5. Run full verification.

6. In a later cleanup branch, after logs and row checks confirm no active clients use old names, consider dropping old columns/tables. Do not drop in the first remediation migration.

## 15. Compatibility strategy

Prefer add/copy/deprecate over direct rename for the first migration. Direct `ALTER TABLE ... RENAME` would break current app paths immediately unless the code and generated types land atomically with the database change. A staged replacement lets the app read either old or new names during deployment.

Recommended compatibility pattern:

- New table: `interpretive_tensions`.
- Old table: leave `ao5_tensions` in place with a deprecation comment for one release window.
- New columns: add replacement columns and backfill.
- Old columns: leave in place, read-only by convention, with comments.
- Views: temporarily expose both old and new output column names where possible.
- Import validation: reject AO5 headers for Component 2 imports immediately, even while compatibility columns exist.

## 16. Validator changes required

The validator should continue to fail on live Component 2 AO5 blockers. It should also classify:

- active Component 2 blockers,
- Component 2 import blockers,
- schema snapshot blockers,
- Component 1 Drama-valid references,
- historical migrations,
- generated types,
- archive/report references.

This pass updates `scripts/validate-component2-ao-model.mjs` to report those categories. It does not allow live Component 2 AO5 code/import/schema snapshot paths to pass.

## 17. Type generation strategy

Do not hand-edit generated types. After the forward-only migration is reviewed and applied to staging:

1. Confirm linked project is `nxlxunygoccbnzdopqna`.
2. Regenerate types from staging only.
3. Review generated diff for replacement names and absence of unexpected production surfaces.
4. Update code against generated types.
5. Run lint, test, build, typecheck, and AO validator.

## 18. Testing strategy

Before applying a real migration:

- Review `docs/COMPONENT_2_AO5_FORWARD_MIGRATION_DRAFT.sql`.
- Convert the accepted draft into a timestamped migration only on the implementation branch.
- Test against a local database where possible using local migration replay.
- Run read-only row-count and column existence checks.
- Run application unit tests before and after code changes.

After staging migration and app update:

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run typecheck`
- `npm run validate:component2-ao`
- Read-only checks for old and new columns, view definitions, and row counts.

## 19. Risks

- Direct renames can break deployed clients, generated types, and Supabase functions.
- `retrieval_due_today` has an AO5 dependency even though the view name is not AO5-labelled.
- `saved_essay_plans` and `essay_plans` may contain user/device state; add/backfill/deprecate is safer than removal.
- Admin tools can reintroduce AO5 if dataset registries keep accepting `ao5_tensions` or `ao5_stem`.
- `drama_scene_ao5_readings` is valid for Component 1 and should not be swept into Prose cleanup.
- Historical migrations must remain intact for auditability.

## 20. Manual decisions required

- Decide whether `student_quote_pair_mastery.ao5_secure` should become `interpretive_secure` or be removed from Prose mastery modelling.
- Decide whether `ao5_tensions` data should be copied into `interpretive_tensions` even though staging currently estimates 0 rows.
- Decide whether old AO5 columns should be retained for one release or two release cycles before a later drop migration.
- Decide whether Component 1 Drama prompt assets should live in this repo or move to a Drama-only package/path.
- Decide whether `ao5_lens` glossary categories should be migrated to `interpretive_lens` in the same migration or a separate content taxonomy pass.

## 21. Final recommendation: proceed / do not proceed

Proceed with a dedicated implementation branch for a forward-only remediation migration and app-code rename. Do not proceed with Component 2 content import yet. Do not claim staging is import-ready until AO5 Component 2 blockers are remediated and the validator either passes or fails only on explicitly allowed archive/history/Drama/generated references.

## 22. Implementation pass status

Implemented on `fix/component-2-ao5-forward-schema-remediation-implementation`.

- Created `supabase/migrations/20260517232441_component2_interpretive_schema_remediation.sql`.
- Updated live Component 2 app/import/schema snapshot paths to interpretive naming.
- Preserved `drama_scene_ao5_readings` as the Component 1 Drama exception.
- Did not apply the migration to staging.
- Did not regenerate Supabase types because staging was not migrated.
- `npm run validate:component2-ao` now passes with 0 blocked references.

Next step: review and authorise the new migration for staging-only application, then regenerate types from project `nxlxunygoccbnzdopqna` and rerun the full verification suite.
