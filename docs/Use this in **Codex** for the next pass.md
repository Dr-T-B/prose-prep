Use this in **Codex** for the next pass.

````markdown
# Codex Prompt — Component 2 Staging AO5 Schema Remediation Plan

You are working on my Pearson Edexcel A-Level English Literature Component 2: Prose app.

Think carefully. Accuracy and safety are essential. This is a **forward-only staging schema remediation planning pass**, not a data import and not a production migration.

## Repository

Primary repo:

`Dr-T-B/prose-prep`

Local path:

`/Users/tarwindersaran/Downloads/Projects/prose-prep`

Remote:

`https://github.com/Dr-T-B/prose-prep.git`

Create a new branch:

```bash
fix/component-2-staging-ao5-schema-remediation-plan
````

## Supabase target

Staging Supabase project only:

```text
https://nxlxunygoccbnzdopqna.supabase.co
```

Project ref:

```text
nxlxunygoccbnzdopqna
```

Project name:

```text
prose-craft-aid-staging
```

Do not touch production.
Do not run destructive commands.
Do not import Drive data.
Do not run `db reset` against linked staging or production.

## Context

Qualification: Pearson Edexcel A-Level English Literature
Component: Component 2 — Prose
Paper code: 9ET0/02
Texts:

* *Hard Times*, Charles Dickens, ISBN 978-0141439679
* *Atonement*, Ian McEwan, ISBN 978-0099429791

## Critical assessment rule

For Pearson Edexcel A-Level English Literature **Component 2: Prose**, the assessed Assessment Objectives are:

* AO1
* AO2
* AO3
* AO4

**AO5 is not assessed in Component 2: Prose.**

Therefore, no Component 2 Prose schema, app model, import path, validator, seed data, prompt, UI, scoring model, rubric, or dataset should treat AO5 as an assessed objective.

Interpretive sophistication may be retained only if reframed as:

* interpretive extension
* interpretive tension
* critical angle
* alternative reading
* interpretive judgement
* interpretive nuance
* AO1 sophistication
* AO2 method-led interpretation

Do not label this AO5 for Component 2.

## Current known state

A previous controlled import-prep pass has been completed on branch:

```text
fix/component-2-canonical-import-ao5-rejection
```

It created:

```text
docs/component2_canonical_import_manifest.json
docs/COMPONENT_2_IMPORT_README.md
docs/COMPONENT_2_CANONICAL_IMPORT_AO5_REJECTION_REPORT.md
scripts/validate-component2-ao-model.mjs
```

The validator currently fails intentionally because legacy AO5-bearing schema/import surfaces still exist.

Known report results from previous pass:

* Broad AO5-related search: 535 line hits across 70 files.
* Validator scan: 63 files.
* Validator-allowed AO5 references: 20.
* Validator-blocked AO5 references: 31.
* `npm run lint`: passed with existing warnings.
* `npm run test`: passed.
* `npm run build`: passed.
* `npm run typecheck`: passed.
* `node scripts/validate-component2-ao-model.mjs`: failed intentionally with 31 blocked AO5 references.

## Read-only Supabase findings

A read-only staging check found these AO5-related schema surfaces:

```text
ao5_tensions
drama_scene_ao5_readings
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

Current staging row-count highlights:

```text
quotes: 22
quote_methods: 40
comparative_matrix: 38
themes: 12
theme_maps: 12
theses: 12
library_thesis_bank: 12
library_context_bank: 7
questions: 15
exam_questions: 16
paragraph_jobs: 14
character_cards: 11
routes: 7
ao5_tensions: 0
quote_pairs: 0
library_quotes: 0
library_paragraph_frames: 0
```

Important nuance:

* `ao5_tensions` currently has 0 rows.
* `drama_scene_ao5_readings` currently has 0 rows.
* Some AO5 columns may be legacy or unused.
* Some AO5 schema is related to Component 1 Drama and may legitimately remain separate.
* The goal is not to erase history blindly. The goal is to prevent Component 2 imports and app paths from using AO5-labelled structures.

## Supabase migration guidance

Use normal Supabase migration discipline: schema changes should be captured in migration files, tested locally where possible, and pushed only deliberately. Supabase documents database migrations as SQL statements used to track schema changes over time; new migrations are normally generated with `supabase migration new`, tested locally with `supabase migration up` or local reset, and deployed with `supabase db push` only when ready. Do not push or reset staging in this pass.

## Primary task

Produce a complete **AO5 schema remediation plan and dependency map** for `prose-prep`.

This pass should answer:

1. Which AO5-named tables, columns, views, generated types, imports, UI models, functions, validators, prompts, and seed data are still present?
2. Which are Component 2 blockers?
3. Which are valid Component 1 Drama surfaces?
4. Which are historical migrations that should remain untouched?
5. Which should be renamed through a forward-only migration?
6. Which should be deprecated but not removed?
7. Which app code paths would break if names were changed?
8. What is the safest migration sequence?

## Safety requirements

Do not:

* import any Drive content
* write real content into Supabase
* touch production
* run destructive Supabase commands
* run `supabase db reset` against linked staging
* edit historical migration files unless the repo already requires it and you explicitly justify it
* drop tables or columns in this pass
* rename schema objects directly on staging in this pass
* regenerate Supabase types from production
* modify secrets

Prefer:

* analysis
* dependency map
* forward-only migration draft
* compatibility views
* report
* validator improvements
* local-only dry-run plans

## Required search pass

Before editing, search the repo for:

```text
AO5
ao5
AO 5
assessment objective 5
ao5_tensions
ao5_tension
ao5_stem
ao5_prompt
ao5_enabled
selected_ao5_ids
ao5_evaluation
ao5_self_score
ao5_lens
ao5_secure
drama_scene_ao5_readings
v_student_quote_pair_progress
v_student_recent_paragraphs
interpretive_tension
interpretive_extension
critical_angle
alternative_reading
interpretive_judgement
ao1_sophistication
AssessmentObjective
Component 2
Component 1
Drama
Prose
```

Classify every AO5 occurrence as:

A. Component 2 blocker — must rename/reframe
B. Component 2 import blocker — must reject or exclude
C. Component 1 Drama-valid — isolate from Prose
D. Historical migration — do not edit directly
E. Generated type — update only after schema plan
F. Legacy document/report — allowlist as archive
G. Unclear — manual review

## Required read-only database checks

If Supabase access is available, run read-only SQL only.

Run checks equivalent to:

```sql
select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
order by table_name;
```

```sql
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and (
    lower(table_name) like '%ao5%'
    or lower(column_name) like '%ao5%'
  )
order by table_name, ordinal_position;
```

```sql
select table_schema, table_name
from information_schema.views
where table_schema = 'public'
  and lower(table_name) like '%ao5%'
order by table_name;
```

Also inspect view definitions for AO5 columns:

```sql
select table_name, view_definition
from information_schema.views
where table_schema = 'public'
  and lower(view_definition) like '%ao5%'
order by table_name;
```

If you run row-count checks, keep them read-only.

Do not execute any SQL that mutates data or schema.

## Naming remediation map

Use this mapping as the preferred target model:

```text
ao5_tensions                  → interpretive_tensions
ao5_tension                   → interpretive_tension
ao5_stem                      → interpretive_stem
ao5_prompt                    → analytical_position_prompt
ao5_evaluation                → interpretive_judgement
ao5_self_score                → ao1_sophistication_self_score
ao5_enabled                   → interpretive_extension_enabled
selected_ao5_ids              → selected_interpretive_extension_ids
ao5_lens                      → interpretive_lens
ao5_secure                    → interpretive_secure
AO5 Critics Bank              → Critical Interpretations / Interpretive Extension / AO1 Sophistication
AO5_TENSIONS                  → INTERPRETIVE_TENSIONS
```

Component 1 Drama exception:

```text
drama_scene_ao5_readings
```

This may be legitimate for Component 1 Drama and should not be renamed merely because it contains AO5. It should be isolated so Component 2 code/imports do not depend on it.

## Required deliverables

Create:

```text
docs/COMPONENT_2_AO5_SCHEMA_REMEDIATION_PLAN.md
```

This report must include:

1. Executive summary
2. Repository and branch
3. Supabase project inspected
4. Safety statement
5. Current AO5 schema surfaces
6. Current AO5 code surfaces
7. Current AO5 import surfaces
8. Current AO5 UI/model surfaces
9. Component 1 Drama-valid exceptions
10. Historical migration files that should not be edited directly
11. Generated files that must not be manually edited
12. Dependency map
13. Recommended target names
14. Proposed forward-only migration sequence
15. Compatibility strategy
16. Validator changes required
17. Type generation strategy
18. Testing strategy
19. Risks
20. Manual decisions required
21. Final recommendation: proceed / do not proceed

Create:

```text
docs/component2_ao5_schema_remediation_map.json
```

Use this structure:

```json
{
  "component": "Component 2: Prose",
  "paper_code": "9ET0/02",
  "assessed_aos": ["AO1", "AO2", "AO3", "AO4"],
  "excluded_aos": ["AO5"],
  "supabase_project_ref": "nxlxunygoccbnzdopqna",
  "schema_surfaces": [
    {
      "current_name": "ao5_tensions",
      "object_type": "table",
      "classification": "component2_blocker",
      "target_name": "interpretive_tensions",
      "recommended_action": "create forward-only rename or replacement table after dependency check",
      "row_count_known": 0,
      "risk": "medium"
    }
  ],
  "column_surfaces": [
    {
      "table": "quote_pairs",
      "current_column": "ao5_tension",
      "target_column": "interpretive_tension",
      "classification": "component2_blocker",
      "recommended_action": "add replacement column, backfill, update code, later deprecate old column",
      "risk": "medium"
    }
  ],
  "component1_exceptions": [
    {
      "object": "drama_scene_ao5_readings",
      "reason": "Component 1 Drama may assess AO5; isolate from Component 2 Prose imports"
    }
  ],
  "historical_migration_policy": "do_not_edit_historical_migrations; add forward-only remediation migration",
  "production_policy": "do_not_touch_production"
}
```

Create:

```text
docs/COMPONENT_2_AO5_FORWARD_MIGRATION_DRAFT.sql
```

This must be a **draft only**, not an applied migration.

The draft should include commented SQL only or very clearly marked staged SQL blocks.

It should prefer non-destructive operations such as:

* create replacement tables
* add replacement columns
* backfill from old columns
* create compatibility views
* comment on deprecated columns
* avoid dropping old columns/tables in the first migration

Example pattern:

```sql
-- DRAFT ONLY — DO NOT APPLY WITHOUT REVIEW

-- 1. Rename or replace ao5_tensions
-- Option A: rename table if confirmed unused by Component 1 and safe:
-- alter table public.ao5_tensions rename to interpretive_tensions;

-- Option B: safer staged replacement:
-- create table if not exists public.interpretive_tensions (...);
-- insert into public.interpretive_tensions (...) select ... from public.ao5_tensions;
-- comment on table public.ao5_tensions is 'Deprecated legacy AO5 name; use interpretive_tensions for Component 2 Prose.';
```

Do not add an actual migration file under `supabase/migrations/` in this pass unless you keep it as a draft with a non-executable or clearly gated structure. Prefer `docs/COMPONENT_2_AO5_FORWARD_MIGRATION_DRAFT.sql`.

## Optional validator improvement

If safe, update:

```text
scripts/validate-component2-ao-model.mjs
```

Only to improve classification/reporting. Do not weaken it.

Acceptable improvements:

* separate schema blockers from archive/report references
* report Component 1 exceptions separately
* report generated files separately
* explain which AO5 references are expected to remain until the remediation migration is applied

Do not allow Component 2 assessed/import content to pass with AO5.

## Package script

If useful, add or preserve:

```json
"validate:component2-ao": "node scripts/validate-component2-ao-model.mjs"
```

Do not remove the existing validation command.

## Verification

Run:

```bash
npm run lint
npm run test
npm run build
npm run typecheck
npm run validate:component2-ao
```

If any command is missing, record it.

Expected state:

* lint/test/build/typecheck should pass, unless there are pre-existing warnings.
* `validate:component2-ao` may still fail if blockers remain. That is acceptable only if the report clearly explains that this branch is a remediation plan, not the completed remediation.

## Final Codex response

Return:

* branch name
* files changed
* Supabase project inspected
* whether any database changes were applied
* number of AO5 schema surfaces found
* number of Component 2 blockers
* number of Component 1 exceptions
* recommended migration strategy
* whether validator still fails
* verification results
* exact next branch/task recommendation

## Success criteria

This pass is successful if it produces a clear, safe, forward-only remediation plan that a later branch can implement without guessing.

Do not claim the staging database is import-ready unless:

* AO5 Component 2 blockers are actually remediated
* validator passes or only fails on explicitly allowed archive/history files
* canonical Drive exports have been swept
* Atonement AO5 Critics Bank has been excluded or reframed

```

After Codex runs this, the next decision should be whether to implement the migration or keep the schema as-is and isolate AO5 through import validation only.
```
