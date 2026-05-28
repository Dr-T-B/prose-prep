# Comparative Matrix Themes Filter Readiness After Backfill

## Executive summary

This is a docs-only readiness check on whether
`comparative_matrix.themes[]` is suitable for a future UI theme
multiselect *after* the mock-row backfill prepared in PR #58.

State of the world at audit time:

- **PR #58 is open, not merged.** The migration
  `supabase/migrations/20260528004217_backfill_comparative_matrix_mock_row_themes.sql`
  exists on `origin/feat/backfill-matrix-mock-row-themes` (commit
  `e6e81f2`) but is absent from `main`.
- **Live staging still matches PR #56's findings exactly.** A read-only
  REST query against the project's staging Supabase returned 40 active
  rows, 30 with non-empty `themes[]` and 10 with empty `themes[]`
  (all `mock-*`). `memory` is still an unused canonical theme on live.
- **The PR #58 migration is deterministic and minimal.** It only
  `UPDATE`s the 10 named `mock-*` rows with theme arrays drawn from the
  already-canonical vocabulary, and it asserts both pre-conditions
  (target rows exist; required themes exist in `public.themes`) and
  post-conditions (all 10 rows populated; no unknown theme ids; no
  `ao5_*` column present on `comparative_matrix`).

Predicted shape once PR #58 merges and is applied to staging:

- 40/40 active rows have non-empty `themes[]`;
- 13/13 canonical theme ids are in use across the matrix (the previously
  unused `memory` gains two rows);
- the most frequent theme (`class`) appears on 21/40 rows, the least
  frequent (`memory`) on 2/40 — i.e. each theme remains a meaningful
  filter that returns a non-trivial subset without trivialising the
  matrix.

**Classification (post-backfill, predicted): A — Good filter candidate.**
**Classification (live, today): unchanged from PR #56 — B (Weak).**

**Recommendation: D — Defer pending PR #58 merge and application to
staging. Upgrade to A as soon as both have landed.** The codebase change
is small (the themes column is not currently selected by
`ComparativeMatrix.tsx`, so a future UI PR will need a one-line `select`
addition plus the multiselect itself), but it cannot land safely until
the data is actually populated on the runtime database, otherwise the
filter would silently hide 25% of active rows.

No AO5 column, label, filter, tag, route or validation is involved at
any stage of this analysis.

## Commands run

```text
git switch main
git pull --ff-only origin main
git fetch --prune origin
git status --short
gh pr view 58 --json state,mergedAt,mergeCommit
ls supabase/migrations/ | grep -i backfill
git log --oneline -n 10

git switch -c audit/matrix-themes-filter-readiness-after-backfill

git fetch origin feat/backfill-matrix-mock-row-themes:refs/remotes/origin/feat/backfill-matrix-mock-row-themes
git show origin/feat/backfill-matrix-mock-row-themes:supabase/migrations/20260528004217_backfill_comparative_matrix_mock_row_themes.sql

grep -n "mock-" supabase/migrations/20260518133500_seed_baseline_content_from_remote.sql
grep -oE "VALUES \('cm-[^']+', .*?\{[^}]+\}'::text\[\]" supabase/migrations/20260518133500_seed_baseline_content_from_remote.sql
grep -nE "themes|axis|ao5|ao2|ao3|ao4|select\(" src/components/ComparativeMatrix.tsx
grep -nE "ao5|AO5|themes|mock-" src/components/ComparativeMatrix.test.tsx

# Read-only live REST verification (GET only; no mutation):
curl -G "$VITE_SUPABASE_URL/rest/v1/comparative_matrix" \
  --data-urlencode "select=id,axis,themes,is_active,sort_order" \
  --data-urlencode "is_active=eq.true" \
  --data-urlencode "order=sort_order.asc" \
  -H "apikey: <anon>" -H "Authorization: Bearer <anon>"
```

No write, no migration apply, no `supabase db push|reset|pull` was
executed.

## Files inspected

- `docs/COMPARATIVE_MATRIX_THEMES_ARRAY_AUDIT.md` (PR #56)
- `docs/COMPARATIVE_MATRIX_MOCK_ROW_NORMALISATION_AUDIT.md` (PR #57)
- `supabase/migrations/20260528004217_backfill_comparative_matrix_mock_row_themes.sql`
  (PR #58, read via `git show
  origin/feat/backfill-matrix-mock-row-themes:…` — not present on `main`)
- `supabase/migrations/20260417115303_initial_schema.sql`
  (CREATE TABLE; `themes text[] NOT NULL DEFAULT '{}'`)
- `supabase/migrations/20260514223610_add_content_contract_metadata_columns.sql`
  (`level_band`, `is_active`, `sort_order`)
- `supabase/migrations/20260516115407_a1_extend_comparative_matrix.sql`
  (adds `ao2`, `ao3`, `ao4`; no `ao5`)
- `supabase/migrations/20260518133500_seed_baseline_content_from_remote.sql`
  (introduces the 40 rows; mock-* rows on lines 96–105)
- `supabase/migrations/20260519181413_phase7_themes_consolidation.sql`
- `supabase/migrations/20260519184203_phase_d2_drop_validate_themes.sql`
- `supabase/migrations/20260519190000_seed_canonical_themes_for_replay.sql`
  (12 canonical themes)
- `supabase/migrations/20260519192443_theme_vocabulary_canonicalisation.sql`
  (adds `morality` as canonical theme #13; populates the alias map)
- `supabase/migrations/20260526160000_seed_comparative_matrix_ao_content_themes_7_to_9.sql`
- `supabase/migrations/20260526170000_seed_comparative_matrix_ao_content_themes_10_to_15.sql`
- `src/components/ComparativeMatrix.tsx`
- `src/components/ComparativeMatrix.test.tsx`
- `src/integrations/supabase/types.ts`

## PR #58 migration findings

The PR #58 migration is a single dated file
(`20260528004217_backfill_comparative_matrix_mock_row_themes.sql`)
that:

1. Asserts all 10 `mock-*` target ids exist in `public.comparative_matrix`
   before doing anything.
2. Asserts every theme id used by the backfill mapping
   (`authorship`, `childhood`, `class`, `education`, `endings`, `family`,
   `guilt`, `imagination`, `justice`, `memory`, `morality`, `war`) is
   present in `public.themes` before doing anything.
3. Applies one `UPDATE` per row via a `WITH mapping(id, themes) AS
   (VALUES …) UPDATE public.comparative_matrix … FROM mapping`.
4. Asserts all 10 `mock-*` rows now have non-empty `themes[]`.
5. Asserts every theme assigned to any `mock-%` row resolves against
   `public.themes`.
6. Asserts `comparative_matrix` has no `ao5%` column, so a future
   schema drift that re-introduces AO5 would trip this migration on
   replay rather than going unnoticed.

The mapping itself is quoted verbatim in the migration comment from the
PR #57 audit's "Mock row field completeness" table:

| `mock-*` id | `themes[]` after PR #58 |
| --- | --- |
| `mock-childhood` | `childhood, education` |
| `mock-class` | `class` |
| `mock-endings` | `endings` |
| `mock-family` | `family` |
| `mock-guilt` | `guilt, justice` |
| `mock-imagination` | `imagination, authorship` |
| `mock-narrative-truth` | `authorship, imagination, memory` |
| `mock-social-responsibility` | `class, justice, morality` |
| `mock-time-memory` | `memory, endings` |
| `mock-war` | `war, class` |

Every theme id above is a canonical row in `public.themes`. No new
canonical themes are introduced. No `ao5` field is touched.

## Expected post-backfill data shape

Derived directly from the seed migration plus the PR #58 mapping. All
arithmetic assumes PR #58 is applied without further data drift.

- Total active rows: **40** (unchanged; PR #58 does not add/remove
  rows or flip `is_active`).
- Rows with non-empty `themes[]`: **40 of 40** (was 30 of 40).
- Rows with empty `themes[]`: **0** (was 10, all `mock-*`).
- Unique theme ids in use on `comparative_matrix`: **13** (was 12;
  `memory` joins).
- Canonical theme ids in `public.themes`: **13** (unchanged).
- Untagged active row count: **0**.
- `axis` column: unchanged in content and schema; still a per-row
  display label rendered verbatim by `ComparativeMatrix.tsx:69`
  (`theme: r.axis`).

All 13 canonical theme ids appear on at least one active row. The
former "dead" theme (`memory`) is now used twice.

## Live read-only findings, if available

A read-only REST `GET` against the project's staging Supabase using the
publishable `VITE_SUPABASE_ANON_KEY` was executed at audit time. **No
mutation was performed.**

Live state (today, PR #58 not yet applied):

- Active rows: **40**
- Rows with empty `themes[]`: **10** — all `mock-*`:
  `mock-childhood`, `mock-class`, `mock-endings`, `mock-family`,
  `mock-guilt`, `mock-imagination`, `mock-narrative-truth`,
  `mock-social-responsibility`, `mock-time-memory`, `mock-war`.
- Unique theme ids in use: **12** (`memory` unused).
- `gender` theme: appears on 9 rows — unchanged by PR #58 and
  therefore stable at 9 in the predicted post-backfill shape too.

This live state matches PR #56's findings exactly, confirming that
PR #58 has not been applied to staging and that classification cannot
move out of B until it is.

## Theme frequency table

Counts are out of 40 active rows.

| Theme | Pre-backfill (live, today) | Post-backfill (predicted) | Delta |
| --- | ---: | ---: | ---: |
| `class` | 18 | 21 | +3 |
| `morality` | 16 | 17 | +1 |
| `justice` | 9 | 11 | +2 |
| `gender` | 9 | 9 | 0 |
| `authorship` | 8 | 10 | +2 |
| `imagination` | 8 | 10 | +2 |
| `education` | 7 | 8 | +1 |
| `guilt` | 7 | 8 | +1 |
| `endings` | 6 | 8 | +2 |
| `childhood` | 6 | 7 | +1 |
| `family` | 5 | 6 | +1 |
| `war` | 4 | 5 | +1 |
| `memory` | **0** | **2** | +2 |
| **Total tag occurrences** | 103 | 122 | +19 |
| **Distinct themes used** | 12 | **13** | +1 |
| **Rows with non-empty `themes[]`** | 30 | **40** | +10 |

Properties of the post-backfill distribution:

- **No theme dominates the matrix.** The most common tag (`class`) is
  on 21/40 rows, i.e. just over half — a selected theme filter would
  always exclude at least 19 rows even at the most popular end.
- **No theme is one-off.** The rarest tag (`memory`) is on 2/40, still
  a usable filter return set.
- **Every active row would survive at least one possible filter
  selection.** Each row carries at least one canonical theme (PR #58
  guarantees minimum 1 per `mock-*` row; cm-* rows already carry 3–4).
- **All 13 canonical themes become first-class filter values.** No
  canonical theme is unused.

## Comparison with axis and search

`comparative_matrix` carries three orthogonal indexing signals:

| Signal | Cardinality | Semantics | Filter suitability |
| --- | --- | --- | --- |
| `axis` | ~40 distinct strings | Two parallel taxonomies: cm-* rows use Pearson Component 2 prompt categories (`Marriage`, `Settings`, `Roles of children`); mock-* rows use theme labels (`Childhood`, `War and industrial systems`). Rendered verbatim per row. | **Display label, not filter.** Cardinality ≈ row count; a dropdown would be a long flat list with no meaningful grouping. PR #57 notes the dual taxonomy here. |
| `themes[]` (post-backfill) | 13 canonical ids | Controlled vocabulary, multi-tag per row, alias-normalised by `20260519192443`. | **Strong multiselect candidate** (A). Frequencies in the 2–21 range out of 40; every active row tagged. |
| Free-text search (`ComparativeMatrix.tsx`) | Unbounded | Substring match over the displayed fields (`axis`, `hard_times`, `atonement`, AO bodies, thesis, etc.). | **Complementary.** Catches phrases the controlled vocabulary cannot anticipate (character names, prompt years, novel chapters). |

`ComparativeMatrix.tsx:55–56` currently selects
`"id, axis, hard_times, atonement, ao2, ao3, ao4, thesis, character,
narrative, structure, exam_fit"` — **`themes` is not in the projection
today**, so the UI never receives it. A future themes multiselect must
add `themes` to that `select(…)` call before any client-side filter
logic can read it.

Recommended UI division of labour for the post-backfill world:

- Keep `axis` exactly as it is — per-row display label, not a filter.
- Add a `themes[]` multiselect (the new control).
- Keep the existing free-text search.
- Keep the existing AO filter as `all | AO2 | AO3 | AO4`.

Themes and AO are independent: a user selecting `gender` themes with
AO3 should get gender-tagged rows whose AO3 body is non-empty, not an
implicit intersection through any AO5 logic (which does not exist).

## Classification

Using the same criteria as PR #56:

- **A. Good filter candidate** — populated on most/all active rows;
  values are short labels; repeated across multiple rows; controlled
  vocabulary appears intentional; filter would reduce row set
  meaningfully.
- **B. Weak filter candidate** — populated inconsistently; values are
  labels but too many one-offs; useful after cleanup/normalisation.
- **C. Bad filter candidate** — empty/sparse; values are long prose; no
  repetition; not useful for filtering.
- **D. Unknown** — cannot inspect actual values.

| Snapshot | Coverage | Vocabulary | Distribution | Classification |
| --- | --- | --- | --- | --- |
| Live, today (PR #58 not applied) | 30/40 | controlled (12 canonical) | balanced on cm-* rows, empty on all mock-* | **B** (unchanged from PR #56) |
| Predicted post-backfill | 40/40 | controlled (13 canonical) | every theme used; counts 2–21 / 40; no dominant theme; no one-off | **A** |

The post-backfill classification is **A**, conditional on PR #58
merging and being applied to the runtime database. Until then the
correct live classification is still **B**.

## AO compliance assessment

- `ComparativeMatrix.tsx:44` restricts the AO filter to
  `"all" | "ao2" | "ao3" | "ao4"`. No AO5 token exists in the source.
- `ComparativeMatrix.test.tsx:206–211` and `:313` already assert
  "does not output any AO5 data" and `screen.queryByText(/AO5/i)`
  returns nothing.
- `comparative_matrix` schema (post
  `20260516115407_a1_extend_comparative_matrix.sql`) has `ao2`, `ao3`,
  `ao4` only — no `ao5*` column. PR #58 explicitly asserts no `ao5%`
  column exists on the table and aborts the migration if one ever
  appears.
- `public.themes` carries no AO-coded entry; every theme id used by
  PR #58 (`authorship`, `childhood`, `class`, `education`, `endings`,
  `family`, `guilt`, `imagination`, `justice`, `memory`, `morality`,
  `war`) is a literary theme label, not an AO label.
- A future `themes[]` multiselect operates on this controlled
  vocabulary and is **independent of AO logic**. It cannot introduce
  AO5 by construction: selecting a theme cannot create an AO5 column,
  filter, tag, route, validation or UI.

**Component 2 Prose AO1/AO2/AO3/AO4-only rule is preserved by every
finding in this audit.**

## Recommendation

**D. Defer pending migration application / live verification.**

Specifically:

1. Merge PR #58 to `main`.
2. Apply the resulting migration to the staging Supabase project.
3. Re-run the read-only REST `GET` in this audit and confirm 40/40
   active rows have non-empty canonical `themes[]` and `memory` is
   present on `mock-narrative-truth` and `mock-time-memory`.
4. Once 1–3 hold, the live classification moves from **B** to **A**
   and the next-step recommendation becomes:

**A — Proceed to a small `feat/matrix-themes-multiselect` UI PR.**

That UI PR will be tightly scoped:

- add `themes` to the `select(…)` call at
  `src/components/ComparativeMatrix.tsx:55–56`;
- add a multiselect control (one new state hook + one filter
  predicate) that intersects with the existing AO filter and free-text
  search;
- keep `axis` as the per-row display label, unchanged;
- keep the AO filter as `all | AO2 | AO3 | AO4`, unchanged;
- add tests asserting (a) selecting `memory` returns the two predicted
  rows, (b) no theme returns zero rows, (c) the existing "no AO5"
  assertions still pass.

No migration is needed for that UI PR; PR #58 is the only data work.

Options not chosen:

- **A (proceed to UI PR now)** is rejected because the data on the
  staging database still matches PR #56's empty-mock state; shipping
  the multiselect before PR #58 applies would silently hide 25% of
  active rows on every theme selection.
- **B (axis dropdown)** is rejected because `axis` is ~40 distinct
  strings with two parallel taxonomies — it is a label, not a filter
  vocabulary.
- **C (keep lens + search only)** is rejected because the controlled
  `themes[]` vocabulary materially adds cross-cutting filter value
  (`memory`, `authorship`, `morality` and so on cut across the cm-*
  Pearson-prompt axis taxonomy).
- **E (Unknown)** does not apply: the data is fully inspectable from
  the seed migration and was confirmed by read-only REST.

## Proposed next step

- **This PR (docs only):** record the readiness finding.
- **Pre-condition for the UI PR:** PR #58 merged to `main` *and*
  applied to the staging Supabase project.
- **Next PR after that pre-condition (small UI PR,
  `feat/matrix-themes-multiselect`):**
  - one source file edit to add `themes` to the `select(…)`
    projection;
  - one new multiselect UI control plus a filter predicate;
  - no new migration;
  - no AO5;
  - tests covering theme-filter correctness and the existing
    "no AO5" guards.
- **Optional curatorial follow-up (separate decision):** rename
  `mock-*` ids to a non-misleading prefix and/or reconcile their `axis`
  values with the cm-curated Pearson-prompt vocabulary. This is
  cosmetic; the themes multiselect does not depend on it.

## Risks and non-goals

Risks if the UI PR is launched before PR #58 lands and applies:

- **Silent disappearance.** Selecting any theme would drop all 10
  `mock-*` rows. The matrix would look smaller than the AO/all view by
  exactly 10 rows for every non-empty theme selection — the worst UX
  failure mode this audit is trying to prevent.
- **Spurious empty result.** Selecting `memory` would return zero
  rows on the live database today, suggesting to the user that no
  comparative content about memory exists, when in fact two rich
  rows (`mock-narrative-truth`, `mock-time-memory`) will exist as
  soon as PR #58 applies.
- **Apparent contradiction.** Selecting `childhood` would not return
  the row whose axis is literally `Childhood`.

Risks if PR #58 lands but is not applied to staging before the UI PR:

- Same as above. Application to the runtime database is a hard
  pre-condition, not a follow-up.

Non-goals of this audit:

- Not implementing the themes multiselect (separate UI PR, blocked on
  PR #58 application).
- Not modifying any source files, tests, or migrations.
- Not mutating Supabase in any way; only read-only REST `GET` was
  used for the live verification step.
- Not introducing AO5 in any form — no column, no tag, no filter, no
  UI, no route logic, no validation. AO filter remains `all | AO2 |
  AO3 | AO4`.
- Not renaming the `mock-*` ids or reclassifying their `axis` values
  (PR #57's "optional follow-up" — out of scope here).
- Not touching `origin/feat/ao-route-engines-recovery` or any
  archived branch.

## What was not changed

- No source files were modified.
- No tests were modified.
- No migrations were created or modified. PR #58's migration was read
  via `git show` from `origin/feat/backfill-matrix-mock-row-themes`;
  it was not copied, edited, or applied.
- No `supabase db push`, `supabase migration up`, `supabase db reset`,
  or `supabase db pull` was run.
- No write, `UPDATE`, `INSERT` or `DELETE` was issued against any
  Supabase project. Only read-only REST `GET /rest/v1/…` calls were
  made against the staging project using the publishable anon key.
- No new feature branch was created beyond the docs-only audit branch
  `audit/matrix-themes-filter-readiness-after-backfill`.
- No AO5 column, label, filter, UI, validation, or route logic was
  introduced. The Component 2 Prose AO1/AO2/AO3/AO4-only rule is
  preserved.
- The archived `origin/feat/ao-route-engines-recovery` branch was not
  touched.
- The only file added by this change is
  `docs/COMPARATIVE_MATRIX_THEMES_FILTER_READINESS_AFTER_BACKFILL.md`.
