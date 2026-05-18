# Component 2 Staging Interpretive Schema Apply Report

## 1. Executive summary

The reviewed forward-only Component 2 Prose interpretive schema migration was applied to the staging Supabase project only. Production was not touched. No Drive data was imported, no seed import was run, no secrets were modified, and no destructive table/column/data operation was run.

Supabase TypeScript types were regenerated from staging project `nxlxunygoccbnzdopqna`, and the full local verification suite passes.

## 2. Branch name

`fix/apply-component-2-interpretive-schema-to-staging`

## 3. Supabase project ref confirmed

- Project ref: `nxlxunygoccbnzdopqna`
- Project name: `prose-craft-aid-staging`
- Project URL: `https://nxlxunygoccbnzdopqna.supabase.co`
- Confirmed from `supabase/config.toml`, `supabase/.temp/project-ref`, and `supabase/.temp/linked-project.json` before mutation.

## 4. Migration applied

Applied to staging.

Migration file:

`supabase/migrations/20260517232441_component2_interpretive_schema_remediation.sql`

Commands used:

```bash
npx supabase db query --linked --file supabase/migrations/20260517232441_component2_interpretive_schema_remediation.sql --output table
npx supabase migration repair --status applied 20260517232441 --yes
npx supabase migration list
```

`npx supabase db push --dry-run` was attempted first and did not apply anything. It stopped because remote migration history contains versions that are not present in the local migrations directory. To avoid applying unrelated local pending migrations, the reviewed SQL file was executed directly against the linked staging database, then the single migration version was marked applied in Supabase migration history.

## 5. Preflight checks

- Starting branch: `fix/component-2-ao5-forward-schema-remediation-implementation`
- Working tree before branch creation: clean
- New branch created: `fix/apply-component-2-interpretive-schema-to-staging`
- Linked project ref: `nxlxunygoccbnzdopqna`
- Remote: `https://github.com/Dr-T-B/prose-prep.git`
- Migration list before application: `20260517232441` was present locally and absent remotely.
- Important migration history note: other unrelated local/remote history drift exists, so `db push` was not a safe one-migration apply path.

## 6. Migration SQL safety review

The migration is forward-only for the Component 2 interpretive schema remediation.

Confirmed safe behavior:

- Creates `public.interpretive_tensions` if missing.
- Backfills from `public.ao5_tensions` into `public.interpretive_tensions`.
- Adds interpretive replacement columns to essay plans, saved essay plans, paragraph frames, paragraph attempts, quote pairs, quote-pair mastery, and thesis routes.
- Backfills replacement columns from legacy AO5-named compatibility columns.
- Updates compatible views: `retrieval_due_today`, `v_student_quote_pair_progress`, and `v_student_recent_paragraphs`.
- Preserves `public.ao5_tensions`.
- Preserves old AO5-named columns.
- Preserves `public.drama_scene_ao5_readings`.
- Adds Component 2 deprecation comments to old AO5 schema surfaces.
- Enables RLS on `public.interpretive_tensions`.
- Adds `interpretive_tensions_read_all` select policy.

Confirmed absent:

- No `drop table`.
- No dropped AO5 compatibility table or columns.
- No dropped `drama_scene_ao5_readings`.
- No `delete` / `truncate`.
- No Drive import.
- No seed import.
- No production reference.

The SQL does replace a trigger and broadens the `retrieval_items_item_type_check` constraint in place. No data-bearing object was destructively removed.

## 7. Post-migration SQL verification

New table:

```text
interpretive_tensions_table = interpretive_tensions
```

Old table remains:

```text
ao5_tensions_table = ao5_tensions
```

Component 1 Drama table remains:

```text
drama_scene_ao5_readings_table = drama_scene_ao5_readings
```

Row counts:

```text
ao5_tensions          0
interpretive_tensions 0
```

Replacement columns confirmed:

```text
essay_plans.interpretive_extension_enabled boolean
essay_plans.selected_interpretive_extension_ids jsonb
interpretive_tensions.* expected columns
library_paragraph_frames.interpretive_stem text
paragraph_attempts.interpretive_judgement text
paragraph_attempts.ao1_sophistication_self_score integer
quote_pairs.interpretive_tension text
saved_essay_plans.interpretive_extension_enabled boolean
saved_essay_plans.selected_interpretive_extension_ids ARRAY
student_quote_pair_mastery.interpretive_secure boolean
thesis_routes.interpretive_tension text
v_student_quote_pair_progress.interpretive_secure boolean
v_student_recent_paragraphs.ao1_sophistication_self_score integer
```

Old AO5 compatibility columns confirmed still present:

```text
essay_plans.ao5_enabled
essay_plans.selected_ao5_ids
library_paragraph_frames.ao5_stem
paragraph_attempts.ao5_evaluation
paragraph_attempts.ao5_self_score
quote_pairs.ao5_tension
saved_essay_plans.selected_ao5_ids
saved_essay_plans.ao5_enabled
student_quote_pair_mastery.ao5_secure
thesis_routes.ao5_tension
v_student_quote_pair_progress.ao5_secure
v_student_recent_paragraphs.ao5_self_score
```

View checks:

- `retrieval_due_today` maps `ao5_tension` item type to `interpretive_tension` and joins `interpretive_tensions`.
- `v_student_quote_pair_progress` exposes `interpretive_secure` and retains `ao5_secure` compatibility.
- `v_student_recent_paragraphs` exposes `ao1_sophistication_self_score` and retains `ao5_self_score` compatibility.

RLS/policy check:

```text
interpretive_tensions_read_all SELECT
```

## 8. Supabase types

Regenerated from staging only:

```bash
npx supabase gen types typescript --project-id nxlxunygoccbnzdopqna --schema public > src/integrations/supabase/types.ts
```

Diff summary:

- `src/integrations/supabase/types.ts`: 314 insertions, 93 deletions.
- Expected `interpretive_tensions` table appears.
- Expected interpretive replacement columns appear.
- Legacy AO5 names remain in generated types as compatibility surfaces and the Component 1 Drama exception.
- Additional generated type changes reflect pre-existing staging schema surfaces already present on the remote, not hand edits.

## 9. Verification command results

```text
npm run lint
passed, 0 errors, 23 existing warnings

npm run test
passed, 79 passed, 3 skipped

npm run build
passed, with existing stale Browserslist notice and large chunk warning

npm run typecheck
passed

npm run validate:component2-ao
passed
```

AO validator result:

```text
Files scanned: 79
Allowed AO5 references: 130
Blocked AO5 references: 0
```

## 10. Component 2 import status

Component 2 import is now schema-ready on staging.

Remaining content readiness caveat: content exports still need an AO sweep before any write import. No Drive data was imported during this pass.

## 11. Remaining blockers

- Local and remote Supabase migration history remain drifted outside this migration.
- Component 2 source exports still need AO compliance review before content import.
- No production migration has been performed or authorised.

## 12. Next recommended task

Create a new branch for the content-readiness pass:

`fix/component-2-content-export-ao-sweep-and-import-dry-run`

Recommended scope: export canonical Component 2 source tabs, run the AO gate before import, perform an AO sweep on staged content, then run dry-run imports only against staging.
