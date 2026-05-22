# Inactive Question Family Triage — 2026-05-22

Documentation- and planning-only triage of the inactive Builder question families
on the canonical Supabase project (`nxlxunygoccbnzdopqna`,
`prose-craft-aid-staging`). No DDL, no DML, no migration, no schema change, no
RLS change, no type regeneration, no deployment, and no destructive SQL was
performed by this pass — every query that fed this report was a read-only
`select`.

## Scope and inputs

| Field | Value |
|---|---|
| Branch | `main` |
| HEAD commit | `91f8a12` (`docs: backfill commit hash in Builder UI verification report`) |
| Remote schema | `nxlxunygoccbnzdopqna` (post `20260522120000_add_childhood_builder_contract`) |
| Active families (4) | `childhood`, `class`, `guilt`, `imagination` |
| Inactive families inspected | **15** (see correction note below) |
| Builder contract validator referenced | `supabase/validation/builder_content_contract.sql` |

### Correction to the prompt count

The prompt requested triage of **14** inactive unsupported families. The
canonical remote actually has **15** inactive question rows. The number `14`
appears to descend from prose in
`docs/CHILDHOOD_BUILDER_FAMILY_ADD_2026_05_22.md` (its Remaining Risks #1 says
"14 unsupported question families remain inactive" but the list immediately
following enumerates 15). The 15-row count was reconfirmed against
`public.questions where is_active = false` in this pass and is treated as
ground truth here. All 15 are triaged below.

### Files inspected (read-only)

- `supabase/validation/builder_content_contract.sql` (contract checks)
- `supabase/migrations/20260522120000_add_childhood_builder_contract.sql` (precedent for the kind of activation work this report points at)
- `docs/CHILDHOOD_BUILDER_FAMILY_ADD_2026_05_22.md` (prior phase report)
- `src/data/seed.ts` (frontend `QuestionFamily` union — staleness flagged for
  the activation-time follow-up, not addressed here)
- Remote tables read via `select` only:
  `public.questions`, `public.theses`, `public.paragraph_jobs`,
  `public.quote_methods`, `public.comparative_matrix`,
  `public.interpretive_tensions`, `public.routes`.

## Builder content contract — recap

`supabase/validation/builder_content_contract.sql` defines what an active
family must satisfy:

| Surface | Required for active family | Filter |
|---|---|---|
| `theses` | ≥ 1 row with matching `theme_family` | — |
| `paragraph_jobs` | ≥ 1 row with matching `question_family` | — |
| `comparative_matrix` | ≥ 1 row with family in `themes[]` | — |
| `quote_methods` | ≥ 2 rows with family in `best_themes[]` | `is_active = true` |
| `interpretive_tensions` | ≥ 1 row with family in `best_use[]` | — |
| `questions` row | exact-family active row with both `primary_route_id` and `secondary_route_id` resolving in `routes` | `is_active = true` |

`level_tag` / `level_band` for every surface must be one of
`secure | strong | top_band`.

## Inactive families found (15)

Each row shows the inactive `questions` row plus its existing footprint across
the contract surfaces. `qm_active` counts only `quote_methods` rows where
`is_active = true` (which is the figure the contract checks). The `gaps`
column uses the contract letters **T**heses / **P**aragraph_jobs /
**M**atrix / **Q**uote_methods / interpretive_**I**tensions; a present
letter means the contract is unsatisfied on that surface.

| family | thesis | paragraph_job | matrix | qm_active | tension | gaps | inactive question | proposed primary/secondary route |
|---|---:|---:|---:|---:|---:|---|---|---|
| `changing_relationships` | 0 | 1 (`pj-gender-4b`) | 0 | 0 | 0 | TMQI | `q-changing-relationships` | route-gender / route-guilt |
| `conflict` | 0 | 0 | 0 | 0 | 0 | TPMQI | `q-conflict` | route-systems / route-class |
| `critique_of_society` | 0 | 1 (`pj-class-3b`) | 0 | 0 | 0 | TMQI | `q-critique-of-society` | route-class / route-perception |
| `difficult_circumstances` | 0 | 1 (`pj-systems-7a`) | 0 | 0 | 0 | TMQI | `q-difficult-circumstances` | route-systems / route-class |
| `education` | 0 | 0 | 6 | 14 | 4 | **TP** | `q-education` | route-imagination / route-perception |
| `female_relationships` | 0 | 1 (`pj-gender-4a`) | 0 | 0 | 0 | TMQI | `q-female-relationships` | route-gender / route-class |
| `friendship` | 0 | 0 | 0 | 0 | 0 | TPMQI | `q-friendship` | route-gender / route-class |
| `hope` | 0 | 1 (`pj-narrative-6b`) | 0 | 0 | 3 | TMQ | `q-hope` | route-narrative / route-imagination |
| `important_choices` | 0 | 1 (`pj-guilt-5b`) | 0 | 0 | 0 | TMQI | `q-important-choices` | route-guilt / route-perception |
| `independence` | 0 | 0 | 0 | 0 | 1 | TPMQ | `q-independence` | route-gender / route-class |
| `love` | 0 | 0 | 0 | 0 | 1 | TPMQ | `q-love` | route-gender / route-class |
| `marriage` | 0 | 0 | 0 | 0 | 0 | TPMQI | `q-marriage` | route-gender / route-class |
| `role_models` | 0 | 0 | 0 | 0 | 0 | TPMQI | `q-role-models` | route-class / route-gender |
| `roles_of_children` | 0 | 0 | 0 | 0 | 0 | TPMQI | `q-roles-of-children` | route-imagination / route-systems |
| `settings` | 0 | 1 (`pj-systems-7b`) | 0 | 0 | 1 | TMQ | `q-settings` | route-systems / route-class |

Of the 15 inactive families, **only `education` has substantive curated
literary content** (14 active `quote_methods`, 6 `comparative_matrix` rows, 4
`interpretive_tensions`). Every other inactive family is contract-blank on at
least three of the five surfaces. Eight of the fifteen are blank on all five.

## Triage table

Triage buckets (per the prompt):

- **A** — Good candidate for next activation
- **B** — Repair first, then activate
- **C** — Merge into existing family
- **D** — Rename / normalise before decision
- **E** — Defer due to broader taxonomy dependency
- **F** — Leave inactive / archive candidate

| family | bucket | rationale |
|---|---|---|
| `education` | **A** | Already 14 active quote_methods, 6 matrix rows, 4 tensions; only `theses` and `paragraph_jobs` are missing. Most contract-ready of all inactives and concept-distinct from the four currently active families. |
| `hope` | **B** | Has 1 paragraph_job (`pj-narrative-6b`, "Endings as moral judgement") and 3 tensions, but 0 theses / 0 matrix / 0 active qm. Activation possible but requires authoring three surfaces; `hope` also sits awkwardly between `narrative` (endings) and `imagination` — confirm framing before promoting. |
| `settings` | **B** | Has 1 paragraph_job (`pj-systems-7b`, "Settings as systems of harm") and 1 tension (`it_ht_coketown_realism_symbol`). 0 theses / 0 matrix / 0 active qm. Smaller authoring task than the all-blank families; worth promoting if the taxonomy keeps "settings" distinct from `route-systems`. Also see (D) below — slug normalisation risk: theme canonicalisation 2026-05-19 deliberately dropped the singular `setting` from the theme vocabulary, so `settings` here is the family slug, not the dropped theme. |
| `critique_of_society` | **C → `class`** | The only paragraph_job tagged for it (`pj-class-3b`, "Fabrication as social fact") already belongs to `route-class`, and the question stem ("how Dickens and McEwan criticise aspects of society") is the same surface the active `class` family already covers. Merge `q-critique-of-society` into the class surface — re-tag the existing inactive question row's content into `class`, archive the family slug. |
| `difficult_circumstances` | **C → existing systems/class material under `class` or `guilt`** | The single paragraph_job (`pj-systems-7a`, "Human life under impersonal force") belongs to `route-systems`. There is no `systems` family — questions targeting route-systems content currently route through `class` (Coketown / industrial harm) and `guilt` (responsibility under pressure). Merge rather than spin up. |
| `female_relationships` | **C → `gender`** | The single paragraph_job (`pj-gender-4a`, "Female interiority under pressure") is already keyed to `route-gender`. The active-family equivalent is `gender` (currently inactive as a *question* family but well-supported via tensions). Once `gender` activates, fold this question stem into it. Until then, defer (see also (E)). |
| `changing_relationships` | **C → `gender`** | `pj-gender-4b` ("Moral self-interrogation") already routes through route-gender. Stem is generic; merging into `gender` or `guilt` avoids fragmenting a thin surface. |
| `important_choices` | **C → `guilt`** | `pj-guilt-5b` ("Revelation and its limits") sits inside route-guilt; the stem is a guilt/responsibility variant. Merge into `guilt`. |
| `love` | **C → `gender`** | Per the theme-vocabulary canonicalisation 2026-05-19, the marriage/love cluster was folded into `gender` at the *theme* layer. The same logic applies at the question-family layer. 0 paragraph_jobs, 1 tension (`it_at_robbie_victim_romance`) which is already tagged `guilt` + `gender`. |
| `marriage` | **C → `gender`** | Same justification as `love`. 0 footprint anywhere. |
| `roles_of_children` | **C → `childhood`** | Synonym of `childhood`, which is now active. 0 footprint. Archive `q-roles-of-children` or rewrite it as a stem variant under `childhood`. |
| `independence` | **D → likely fold into `gender`, or rename to `agency`** | Slug is generic; the single tension `it_at_cecilia_rebel_constraint` is already a `gender`/`class` tension about Cecilia's constrained agency. Decide whether `independence` should survive as a distinct family or be replaced by `agency` (closer to the route name "Gender, Control and Agency"). Either way, do not stand it up under the current slug. |
| `friendship` | **F** | 0 rows on every surface. No literary content in either novel mapped to this slug. Question stem is generic. Recommend leaving inactive / archiving the question row. |
| `role_models` | **F** | 0 rows on every surface. Generic stem. Archive. |
| `conflict` | **F** | 0 rows on every surface. Slug is so broad it overlaps `class`, `gender`, `guilt`, and `systems` at once — promoting it would dilute the family-chip surface. Archive. |

### Bucket summary

| Bucket | Count | Families |
|---|---:|---|
| A — activate next | 1 | `education` |
| B — repair, then activate | 2 | `hope`, `settings` |
| C — merge into existing family | 8 | `changing_relationships`, `critique_of_society`, `difficult_circumstances`, `female_relationships`, `important_choices`, `love`, `marriage`, `roles_of_children` |
| D — rename / normalise first | 1 | `independence` |
| E — defer (broader taxonomy) | 0 | — (none stand alone here; see "broader risks" below) |
| F — archive | 3 | `conflict`, `friendship`, `role_models` |

No family was placed in bucket E in isolation, but bucket-C work is itself
gated on the broader theme/family-taxonomy consolidation flagged in
`prose_prep_schema_remediation` (see "Risks & dependencies" below). If that
consolidation is not run first, several C-bucket merges should be re-classified
as E.

## Top 3 next activation candidates

In priority order:

### 1. `education` — strong A candidate (recommended next activation)

- 14 `quote_methods` rows already tagged `education` and active (`qm_ht_01`,
  `_03`, `_05`, `_06`, `_08`, `_09`, `_10`, `_12`, `_13`, `_14`, `_16`, `_17`,
  `_19`, `_20`). All `curation_status = 'strong'`; none top_band yet — the
  contract requires only ≥ 2 active rows, so this is satisfied today.
- 6 `comparative_matrix` rows already tagged `education`.
- 4 `interpretive_tensions` already in `best_use`: `it_cmp_childhood_training`,
  `it_ht_fact_discipline_ideology`, `it_ht_gradgrind_reformable`,
  `it_ht_sissy_centre_device`.
- Pre-existing question row `q-education` (currently `is_active = false`) is
  already routed `route-imagination` (primary) / `route-perception`
  (secondary), level_tag `top_band`, methods `metaphor, imagery,
  characterisation`. No re-routing decision needed.
- **Activation gap is exactly the same shape as the just-shipped childhood
  migration**: one `paragraph_jobs` row plus flipping the question row to
  `is_active = true`. The thesis row may already exist via theme-family
  spillover or may need one strong-band row authored. (None today — the
  triage query returned `th = 0` for `education`.)
- All 14 quote_methods rows are Hard Times-side (`qm_ht_*`); a follow-up
  curatorial pass should add at least one Atonement-side quote so the
  Toolkit's two-text surface does not look one-sided. Not contract-blocking,
  but a UX caveat.

### 2. `hope` — strong B candidate (second activation after education)

- Already 1 paragraph_job (`pj-narrative-6b`, "Endings as moral judgement",
  on `route-narrative`) and 3 interpretive tensions
  (`it_at_ending_repair_evasion`, `it_cmp_moral_confidence_uncertainty`,
  `it_ht_dickens_reform_sentiment`).
- Conceptual fit: hope reads naturally as the "endings/closure" question
  surface, which `route-narrative` already covers thematically. Atonement's
  coda is the single richest hope/no-hope set-piece in either text;
  Dickens' reformist sentiment in Hard Times is its mirror.
- Activation gap: 1 thesis row, 1 comparative_matrix row, and ≥ 2 active
  quote_methods rows. Smaller authoring task than every all-blank family.
- Existing `q-hope` row already routed `route-narrative` / `route-imagination`,
  level_tag `top_band` — no re-routing decision needed.

### 3. `settings` — moderate B candidate (third activation)

- Already 1 paragraph_job (`pj-systems-7b`, "Settings as systems of harm",
  on `route-systems`) and 1 tension (`it_ht_coketown_realism_symbol`).
- Conceptual fit: Coketown and the Tallis grounds are paired set-pieces
  about environment as moral pressure; this is exam-frequent.
- Activation gap: 1 thesis, 1 matrix, ≥ 2 quote_methods. Comparable to `hope`.
- Slug-overlap caveat: the 2026-05-19 theme-vocabulary canonicalisation
  dropped the singular `setting` from the `themes` array vocabulary. The
  family slug `settings` (plural) is distinct from that dropped theme tag and
  should remain so; the activation migration must use `settings` consistently
  in all `*_themes` arrays it writes.

Of the three, `education` is materially closer to ready than the other two —
its only gaps are the two surfaces a single small migration can close, which
is the exact pattern the childhood migration already established.

## Risks & dependencies

The bucket-C merges (8 families) and the bucket-D normalisation (1 family)
all depend on the broader theme-taxonomy consolidation flagged in
`docs/CHILDHOOD_BUILDER_FAMILY_ADD_2026_05_22.md` Risks #2 and the deferred
"second priority" prompt at the bottom of that report. Running C/D merges
without first reconciling `theses.theme_family`,
`paragraph_jobs.question_family`, `quote_methods.best_themes`,
`comparative_matrix.themes`, `interpretive_tensions.best_use`, and
`routes.best_use*` will re-introduce the same drift the canonicalisation
session closed.

If the consolidation is deferred, the safe order is:

1. Activate `education` (A) — small, isolated, no merge required.
2. Activate `hope` (B) — small, isolated, no merge required.
3. Activate `settings` (B) — small, isolated, no merge required.
4. Decide on the broader taxonomy consolidation.
5. Then execute the C/D merges in a single batched pass.
6. Archive the F bucket once (3) is also done so the family list shrinks
   cleanly.

A separate caveat carries over from the same prior report: the frontend
`QuestionFamily` union in `src/data/seed.ts` still lists pre-canonical theme
values and is missing canonical themes. Activating any new family will
require touching that union (or, preferably, sourcing it from the database).
This report does not change either.

## Checks

| Check | Result |
|---|---|
| `npm run typecheck` | **Pass** — `tsc --noEmit`, 0 diagnostics |
| `npm run test` | **Pass** — 15 files, 120 tests passed, 3 integration tests skipped as designed (`planRepository.integration.test.ts`) |
| `npm run build` | **Pass** — `vite build` produced `dist/` in 2.94s; only the pre-existing chunk-size + browserslist informational warnings (no regression vs. the post-`91f8a12` baseline) |

## Files changed

| File | Status |
|---|---|
| `docs/INACTIVE_FAMILY_TRIAGE_2026_05_22.md` | New, added in this commit |

No other file is modified by this triage. No migration, no SQL, no schema or
RLS change, no Supabase type regeneration, no deployment, and no destructive
operation was performed.

## Commit hash

(filled in after commit — see end of file.)

## Confirmation

- No `apply_migration` was invoked.
- No `supabase db push`, `supabase migration repair`, `supabase db reset`,
  `--include-all`, or `confirm_cost` call was made.
- No DROP / DELETE / TRUNCATE / UPDATE / INSERT was issued against the
  remote.
- No table was reactivated; `is_active` was not flipped on any row.
- No schema, column, type, view, function, RLS policy, or grant was
  changed.
- No frontend file was edited.
- No Supabase TypeScript types were regenerated.
- The Supabase MCP was used exclusively in `execute_sql` mode for read-only
  `SELECT` statements that informed this report.
- Working-tree noise inherited from earlier sessions (deleted historical
  `docs/*.md` files, untracked `audit/`, `poetry-companion/`, `roles.sql`,
  `supabase/validation/`, and the seven untracked `supabase/migrations/20260519*.sql`)
  is unchanged by this pass; only the triage document below is staged.
