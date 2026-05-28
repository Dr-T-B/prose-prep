# Comparative Matrix Mock Row Normalisation Audit

## Executive summary

The 10 `mock-*` rows in `public.comparative_matrix` were flagged by the
themes-array audit (PR #56,
`docs/COMPARATIVE_MATRIX_THEMES_ARRAY_AUDIT.md`) as the sole reason a
themes multiselect would be classed as **B (Weak filter candidate)** rather
than **A (Good filter candidate)**: 25% (10/40) of active rows have empty
`themes[]`, and all ten are `mock-*`.

Inspection of the seed shows the situation is more nuanced than a simple
"placeholder vs. production" split:

- **Prose content is production-quality.** Every `mock-*` row has fully
  populated `hard_times`, `atonement`, `divergence`, `ao2`, `ao3`, `ao4`,
  `thesis`, `character`, `narrative`, `structure`, and `exam_fit` fields,
  written to the same depth, register, and citation style as the `cm-*`
  curated rows.
- **Metadata pattern is theme-shaped, not pairing-shaped.** Every `mock-*`
  row's `axis` value is a *theme label* (`Childhood`, `Class and power`,
  `War and industrial systems`, …) and matches an alias in
  `20260519192443_theme_vocabulary_canonicalisation.sql` lines 75–82
  (e.g. `('Class and power','class')`,
  `('Childhood and moral formation','childhood')`). The `cm-*` axes, by
  contrast, are Pearson Component 2 prompt categories
  (`Changing relationships`, `Roles of children`, `Important choices`,
  `Marriage`, `Settings`, …).
- **`themes[]` is empty on every `mock-*` row** even though the axis
  itself is a canonical theme alias that the canonicalisation migration
  already knows how to map.
- **`sort_order` is `101–110`,** placing every `mock-*` row after the
  `cm-*` curated set (`sort_order` ≤ ~30 in practice).
- **No source or test code references any `mock-*` id.** `rg "mock-"`
  across `src/` returns one unrelated hit
  (`src/data/seed.ts:638` — a quote analysis using the phrase
  "mock-Latin"). `ComparativeMatrix.tsx` and `ComparativeMatrix.test.tsx`
  contain zero references.

So the `mock-` prefix is misleading: these are a **second, theme-organised
production layer** that was seeded as `mock-` (likely from an earlier
schema iteration where `axis` was treated as the theme), then never
renamed or re-tagged when the cm-curated Pearson-prompt set was added.
The prose is real; only the metadata (`id` prefix, `themes[]`) is stale.

**Recommendation: B — Backfill `mock-*` rows with canonical themes (and,
secondarily, reconcile their `axis` values against the cm-curated
vocabulary).**

`A (Deactivate)` is the safe fallback if product / curatorial review
concludes the rows should not be student-facing; the content is
preservable in either case because the seed migration is immutable
history. `C (Move to fixtures)` is unnecessary because no test depends
on these rows. `D (Defer)` is not the right call now — PR #56 has already
deferred once on these rows, and the question is no longer "what shape is
the data?" but "what is the curatorial intent of these ten rows?", which
this audit can answer from the seed itself.

This audit does **not** introduce AO5 in any form.

## Commands run

```text
git switch main
git pull --ff-only origin main
git fetch --prune origin
git status --short
git switch -c audit/matrix-mock-row-normalisation

ls supabase/migrations/ | grep -iE "comparative|matrix|theme"
git show 01dc4c0:docs/COMPARATIVE_MATRIX_THEMES_ARRAY_AUDIT.md
git show --stat 01dc4c0

rg -n "mock-|comparative_matrix|themes|axis|is_active|sort_order" src supabase docs
rg -n "mock-" supabase/migrations
rg -n "mock-" src
rg -n "comparative_matrix" src/components src/hooks src/lib src/pages
grep -n "comparative_matrix\|axis\|themes" src/components/ComparativeMatrix.tsx
grep -nE "mock-|Childhood|Class and power" supabase/migrations/*.sql
```

**No live Supabase queries were made for this audit.** The themes-array
audit (PR #56) confirmed the local seed matches the live staging row
set exactly (40 active rows, identical `themes[]` distribution), so all
findings here are derived from the seed migration and the canonicalisation
migration. No write, no migration, no `supabase db push|reset|pull` was
executed.

## Files inspected

- `docs/COMPARATIVE_MATRIX_THEMES_ARRAY_AUDIT.md` (read via
  `git show 01dc4c0:…` since PR #56 is not yet merged to local `main`)
- `src/components/ComparativeMatrix.tsx`
- `src/components/ComparativeMatrix.test.tsx` (no `mock-` references)
- `src/integrations/supabase/types.ts` (Row shape for `comparative_matrix`)
- `supabase/migrations/20260417115303_…_initial_schema.sql`
  (CREATE TABLE; `themes text[] NOT NULL DEFAULT '{}'`)
- `supabase/migrations/20260514223610_add_content_contract_metadata_columns.sql`
  (adds `level_band`, `is_active`, `sort_order`)
- `supabase/migrations/20260516115407_a1_extend_comparative_matrix.sql`
  (adds `ao2`, `ao3`, `ao4`, `thesis`, `character`, `narrative`,
  `structure`, `exam_fit`)
- `supabase/migrations/20260518133500_seed_baseline_content_from_remote.sql`
  (introduces all 40 rows, including the 10 `mock-*` rows on lines 96–105)
- `supabase/migrations/20260519181413_phase7_themes_consolidation.sql`
- `supabase/migrations/20260519184203_phase_d2_drop_validate_themes.sql`
- `supabase/migrations/20260519190000_seed_canonical_themes_for_replay.sql`
- `supabase/migrations/20260519192443_theme_vocabulary_canonicalisation.sql`
  (alias map; lines 75–82 contain the matchups against `mock-*` axes)
- `supabase/migrations/20260526160000_seed_comparative_matrix_ao_content_themes_7_to_9.sql`
- `supabase/migrations/20260526170000_seed_comparative_matrix_ao_content_themes_10_to_15.sql`

## Mock row provenance

All ten `mock-*` rows are introduced by a single `INSERT … ON CONFLICT
(id) DO NOTHING` block in
`supabase/migrations/20260518133500_seed_baseline_content_from_remote.sql`
(lines 96–105). No other migration creates, updates, deactivates, renames,
or references any `mock-*` id.

The seed file's name (`seed_baseline_content_from_remote`) indicates the
rows were dumped from the previous remote (staging) database at that
date, not generated from a UI fixture or test harness. They predate the
canonicalisation migration (`20260519…`) and the cm-curated reseed
batches (`20260526…`), and they appear to come from an earlier schema
iteration where `axis` doubled as the theme label.

No source file (`src/`, `tests/`, `e2e/`, `docs/`) references any
`mock-*` id. They are not used as test fixtures; they are not gated by
any feature flag; nothing in the application code distinguishes them
from `cm-*` rows at render time.

## Mock row field completeness

Computed from `supabase/migrations/20260518133500_seed_baseline_content_from_remote.sql`
lines 96–105.

| id | axis | themes[] | ao2 | ao3 | ao4 | thesis | character | narrative | structure | exam_fit | is_active | sort_order |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `mock-childhood` | Childhood | `{}` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | true | 104 |
| `mock-class` | Class and power | `{}` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | true | 105 |
| `mock-endings` | Endings and closure | `{}` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | true | 109 |
| `mock-family` | Family failure | `{}` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | true | 107 |
| `mock-guilt` | Guilt and atonement | `{}` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | true | 103 |
| `mock-imagination` | Imagination vs rationality | `{}` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | true | 101 |
| `mock-narrative-truth` | Narrative truth and unreliability | `{}` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | true | 108 |
| `mock-social-responsibility` | Social responsibility | `{}` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | true | 102 |
| `mock-time-memory` | Time and memory | `{}` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | true | 110 |
| `mock-war` | War and industrial systems | `{}` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | true | 106 |

`✓` denotes a non-null, non-trivial value (full paragraphs, citation-grade
prose). The only data deficiency is `themes[] = {}` on every row; every
other narrative column is populated to the same depth as `cm-*` rows.

Inferred theme tags from the axis (using the existing
`theme_alias` map in
`20260519192443_theme_vocabulary_canonicalisation.sql` lines 75–82 plus
the alias intent of the axis text):

| id | inferred canonical themes |
| --- | --- |
| `mock-childhood` | `childhood`, `education` |
| `mock-class` | `class` |
| `mock-endings` | `endings` |
| `mock-family` | `family` |
| `mock-guilt` | `guilt`, `justice` |
| `mock-imagination` | `imagination`, `authorship` |
| `mock-narrative-truth` | `authorship`, `imagination`, `memory` |
| `mock-social-responsibility` | `class`, `justice`, `morality` |
| `mock-time-memory` | `memory`, `endings` |
| `mock-war` | `war`, `class` |

These inferences are documented for completeness only; this audit does
not write them. A future data-only migration would need product /
curatorial sign-off before applying them.

## Comparison with curated cm-* rows

| Field | `cm-*` curated rows (30) | `mock-*` rows (10) | Risk |
| --- | --- | --- | --- |
| `id` shape | `cm-<topic>-NN` (paired NN=01/02) | `mock-<theme>` | Cosmetic; `mock-` prefix is misleading given the prose quality |
| `axis` semantics | Pearson Component 2 prompt categories (`Marriage`, `Settings`, `Roles of children`) | Theme labels matching alias map (`Childhood`, `Class and power`) | Two parallel taxonomies on one column; the UI displays `axis` verbatim |
| `themes[]` | Populated, 3–4 canonical values per row, alias-normalised | Empty on every row | **Blocker for themes multiselect** (PR #56 finding) |
| `ao2`/`ao3`/`ao4` | Populated (citation-grade) | Populated (citation-grade) | None — parity |
| `thesis` | Populated | Populated | None |
| `character`/`narrative`/`structure` | Populated | Populated | None |
| `exam_fit` | Populated, usage guidance to students | Populated, usage guidance to students | None |
| `is_active` | `true` (all 30) | `true` (all 10) | Both groups are student-facing |
| `sort_order` | 1–30 (paired) | 101–110 (single per theme) | `mock-*` rows appear at the end of the matrix — visually a "second section" |
| Test references | none (filters/printing tested with seeded rows) | none | None |
| Student-facing risk | Standard | Mixed: rich prose, but `axis` doubles as theme without `themes[]` backing | See next section |

The two row sets are not redundant: `cm-*` answers
"which curated pairing fits this Pearson prompt category?", while
`mock-*` answers "what does a theme-organised cross-novel comparison look
like?". The substantive comparisons (e.g. `mock-narrative-truth`,
`mock-time-memory`) cover ground the `cm-*` set does not (no `cm-*` row
has `Narrative truth and unreliability` or `Time and memory` as its
axis).

## Student-facing risk assessment

Current behaviour: all 40 rows render in the comparative matrix UI.
`ComparativeMatrix.tsx:69` maps `row.theme = r.axis ?? ""` — i.e. the
`axis` text is the visible per-row label. The `themes[]` column is **not
projected** by the component (`ComparativeMatrix.tsx:54–56`), so the
empty `themes[]` on `mock-*` rows has **zero current UI impact**.

Risks today:
- **Taxonomic confusion.** A user scanning the matrix sees 30 rows
  labelled with Pearson prompt categories followed by 10 rows labelled
  with bare theme nouns. There is no visual cue that the last 10 are a
  different organising principle. This is mild but real.
- **Search overlap.** The lens-and-search model treats all 40 rows
  equally, so theme-organised rows occasionally surface alongside
  prompt-organised ones on the same query, which is generally a feature
  rather than a bug.

Risks tomorrow (if a themes multiselect is added without resolving):
- **Silent disappearance.** Any selected theme would drop all 10
  `mock-*` rows from view (they have no `themes[]` to match against),
  losing the only theme-organised comparisons in the dataset. PR #56
  identified this as the reason classification is B not A.
- **Apparent contradiction.** A user selecting "childhood" as a theme
  filter would not see the row whose axis is literally `Childhood`. This
  failure mode is the worst single UX risk of the empty `themes[]`.

Conclusion: the rows are not actively harmful today, but they are a
latent blocker for any theme-based filtering or grouping.

## Option A: deactivate mock-* rows

Set `is_active = false` on all ten `mock-*` rows in a small data-only
migration.

**Pros**
- Reversible (single boolean flip; seed migration history preserved).
- Removes the multiselect blocker immediately (no remaining
  empty-`themes[]` active rows).
- Eliminates the dual-taxonomy display risk.
- Smallest possible change; lowest review burden.

**Cons**
- Loses 10 unique theme-organised comparisons, several of which
  (`mock-narrative-truth`, `mock-time-memory`, `mock-imagination`) have
  no `cm-*` equivalent and are demonstrably substantive.
- Reduces total student-facing matrix coverage from 40 to 30 rows.
- Treats production-grade content as if it were placeholder, which the
  prose contradicts on inspection.

**Required future migration**: one `UPDATE public.comparative_matrix
SET is_active = false WHERE id LIKE 'mock-%';` in a new dated migration.
No schema change.

**Effect on student UI**: 10 rows disappear from the matrix; the print
modes, filters, and expand controls behave normally on the remaining 30.

**Effect on future themes filter**: classification moves to **A (Good
filter candidate)** immediately. The multiselect would operate on 30
rows / 12 themes, all populated.

## Option B: backfill mock-* rows

Apply a data-only migration that:
1. Populates `themes[]` on each `mock-*` row using the
   already-canonical aliases from
   `20260519192443_theme_vocabulary_canonicalisation.sql` lines 75–82
   (or product-supplied tag sets per the table in
   "Mock row field completeness").
2. *Optionally* renames the ten ids from `mock-*` to a non-misleading
   prefix (e.g. `tm-<theme>` for "theme-axis matrix row") and/or moves
   them into the cm-curated `sort_order` range.
3. *Optionally* reclassifies `axis` values onto the cm-curated Pearson
   prompt vocabulary, with the original theme label demoted into
   `themes[]`.

**Pros**
- Preserves substantive content; no loss of student-facing coverage.
- Promotes the rows to first-class production status, matching how
  their prose already reads.
- Unlocks the **A** classification for the themes multiselect.
- The minimum form (step 1 only) is mechanical: every required tag is
  already known from the existing alias map.

**Cons**
- Requires curatorial sign-off on inferred theme tags (small number,
  but a judgement call).
- If the optional id rename is included, requires a coordinated update
  to any future content that references the old ids (none exist today).
- More review surface than Option A.

**Required content work**: confirm the 10 inferred theme sets in the
"Mock row field completeness" table; resolve `mock-narrative-truth` and
`mock-social-responsibility` (the two with the broadest tag candidates);
optionally choose a non-`mock-` id scheme.

**Required canonical themes**: all required themes (`childhood`,
`class`, `endings`, `family`, `guilt`, `imagination`, `authorship`,
`memory`, `morality`, `war`, `justice`, `education`) are already in the
13-row canonical `themes` table. No new themes need to be added.

**Effect on future themes filter**: classification moves to **A (Good
filter candidate)**; all 40 active rows tagged; `memory` (currently
unused per PR #56) gains at least two rows; theme distribution becomes
more balanced.

## Option C: move mock rows to fixture/test-only data

Extract the ten `mock-*` rows from the live seed and relocate them into
a test-only fixture (e.g. `src/components/__fixtures__/comparative-matrix-mock-rows.ts`)
or an integration-test seed that does not ship to staging/production.

**Pros**
- Cleanest "production data is curated, demo data is fixturised" model.
- Removes the multiselect blocker.
- Matches the literal reading of the `mock-` id prefix.

**Cons**
- No current test depends on these rows. There is no place to "move"
  them to that improves coverage; they would be dead-weight fixtures.
- Requires writing a data-only migration that **deletes** rows from a
  shared staging database, which is more invasive than Option A's
  deactivation flip and is irreversible without re-applying the seed.
- Same net loss of student-facing coverage as Option A, plus more
  engineering work.

**Required source/test changes**: a new fixture module plus, if any
component-level test ever wants `mock-*` shapes, an import; today none
do.

**Effect on production data**: ten rows hard-deleted from
`comparative_matrix` (or set `is_active = false` and the rows kept as
a fossil, in which case Option C collapses into Option A).

## AO compliance assessment

- The component restricts the AO filter to `all | ao2 | ao3 | ao4`
  (`src/components/ComparativeMatrix.tsx:44, 174`); no AO5 column is
  read, projected, or rendered.
- The `comparative_matrix` schema after
  `20260516115407_a1_extend_comparative_matrix.sql` adds `ao2`, `ao3`,
  `ao4` only. There is no `ao5` column on `comparative_matrix`.
- Every `mock-*` row populates `ao2`, `ao3`, `ao4` (citation-grade
  prose) and no AO5-shaped field. The audit confirms the rows
  themselves are AO1–AO4 only.
- Any future data-only migration arising from this audit must remain
  strictly AO1/AO2/AO3/AO4: no `ao5_*` column add, no AO5 tag, no AO5
  filter, no AO5 routing, no AO5 validation.
- The canonical `themes` vocabulary (13 rows, of which 12 are used by
  `cm-*`) contains no AO5-coded value; backfilling `themes[]` from this
  vocabulary cannot introduce AO5.
- The presence of `ao5_tensions` as a legacy unrelated table name in
  `20260417115303_…_initial_schema.sql` is incidental, not consumed by
  `comparative_matrix`, and is unaffected by this audit and by any of
  Options A/B/C above.

**Component 2 Prose AO1/AO2/AO3/AO4-only rule is preserved by every
option in this audit.**

## Recommendation

**B. Backfill `mock-*` rows with canonical themes** (and, as a
secondary step requiring curatorial sign-off, reconcile their
`axis`/`id` patterns with the `cm-*` convention).

Rationale:
- The prose content is production-quality, end to end. Treating it as
  placeholder (Options A/C) discards substantive comparisons —
  particularly the four rows (`mock-narrative-truth`, `mock-time-memory`,
  `mock-imagination`, `mock-endings`) that have no `cm-*` equivalent on
  their organising theme.
- Every required canonical theme already exists in the `themes` table
  and every `mock-*` axis already maps cleanly through the existing
  alias migration. The data work is *mechanical*, not curatorial.
- Backfilling moves the themes-multiselect classification to **A**
  immediately, unlocking the deferred work tracked by PR #56.
- The `mock-` prefix is the only "placeholder" signal, and a prefix is
  cheaper to rename than ten rows of prose are to recreate.

**Fallback** if product / curatorial review concludes the rows should
not be student-facing (e.g. because of the dual-taxonomy on `axis`):
**A. Deactivate**. This is reversible and keeps the seed history
intact. Option C is not recommended in either case because no test
depends on these rows.

Defer (D) is **not** the right call now: PR #56 has already deferred,
and the curatorial question can be answered by inspecting the seed,
which this audit does.

## Proposed next step

- **This PR (docs only):** record this recommendation.
- **Next step (separate data-only PR, requires curatorial sign-off on
  the inferred theme tags):** new migration
  `supabase/migrations/<date>_backfill_mock_comparative_matrix_themes.sql`
  applying the inferred tag sets in the
  "Mock row field completeness" table to the ten rows. Strictly an
  `UPDATE … SET themes = ARRAY[…]::text[] WHERE id = '…';` per row.
  Must remain AO1/AO2/AO3/AO4-only.
- **Optional follow-up (separate decision):** rename `mock-*` ids to a
  non-misleading prefix and/or reclassify `axis` values, but only if
  product wants a single taxonomy on the `axis` column.
- **After backfill:** the deferred `feat/matrix-themes-multiselect` PR
  from #56 becomes unblocked (classification A).

## Risks and non-goals

Risks if Option B is pursued without curatorial sign-off:
- A wrong tag set on a row could mis-filter a row in a future
  multiselect (low blast radius — single row, easily corrected by
  another data-only migration).
- Renaming ids in the same migration (the "optional" step) would
  require any future seed/import that references the old ids to update
  — but no current code references them.

Risks if Option A is pursued:
- Loss of student-facing coverage on themes that have no `cm-*`
  equivalent (`Narrative truth and unreliability`, `Time and memory`).
- Apparent regression in the matrix row count visible to staging
  reviewers.

Non-goals of this audit:
- Not writing the backfill migration (data-only work is out of scope
  for a docs-only audit).
- Not mutating any Supabase data (the safety rules forbid it).
- Not introducing the themes multiselect itself (separate UI PR,
  blocked on the data work above).
- Not adding AO5 in any form — no column, no tag, no filter, no UI,
  no route logic, no validation.
- Not touching `origin/feat/ao-route-engines-recovery` or any archived
  branch.
- Not modifying source files, tests, or migrations.

## What was not changed

- No source files were modified.
- No migrations were created or modified.
- No `supabase db push`, `supabase migration up`, `supabase db reset`,
  or `supabase db pull` was run.
- No live Supabase data was queried for this audit (the themes-array
  audit in PR #56 already confirmed local seed and live staging match
  for these rows).
- No write or mutation was made against the Supabase project.
- No new feature branch was created beyond the docs-only audit branch
  `audit/matrix-mock-row-normalisation`.
- No AO5 column, label, filter, UI, validation, or route logic was
  introduced. The Component 2 Prose AO1/AO2/AO3/AO4-only rule is
  preserved.
- The archived `origin/feat/ao-route-engines-recovery` branch was not
  touched.
- The only file added by this change is
  `docs/COMPARATIVE_MATRIX_MOCK_ROW_NORMALISATION_AUDIT.md`.
