# Comparative Matrix Themes Array Audit

## Executive summary

`comparative_matrix.themes: string[]` is a `text[] NOT NULL DEFAULT '{}'` column
defined in the initial schema (`20260417115303_…`) and normalised against a
canonical 13-row `themes` table by `20260519192443_theme_vocabulary_canonicalisation.sql`.

A read-only HTTP query against the staging Supabase project (publishable anon
key, schema is RLS-public SELECT) confirms:

- 40 rows in `public.comparative_matrix`, all `is_active = true`.
- 30 rows (the `cm-*` curated set) have populated, controlled `themes[]` values
  drawn from a 12-element subset of the canonical vocabulary.
- 10 rows (the `mock-*` placeholder set) have empty `themes[]` and placeholder
  `axis` strings that overlap conceptually with theme labels
  (e.g. `Childhood`, `Class and power`, `War and industrial systems`).
- The 12 themes used are repeated meaningfully: `class` 18, `morality` 16,
  `gender` 9, `justice` 9, `authorship` 8, `imagination` 8, `education` 7,
  `guilt` 7, `childhood` 6, `endings` 6, `family` 5, `war` 4.

The vocabulary itself is healthy and tag-shaped. The blocker is **data
completeness**: 25% of active rows (10/40) have empty `themes[]`, so any
multiselect would either hide them entirely or surface them under an
"untagged" bucket. The `mock-*` rows also carry placeholder axes that should
probably be deactivated independently.

**Classification: B (Weak filter candidate).**
**Recommendation: D (Defer pending data normalisation / population).**

Specifically: deactivate or repopulate the 10 `mock-*` rows before
considering a `feat/matrix-themes-multiselect` PR. Until then, keep the
current lens + search + AO-presence model.

## Commands run

```text
git switch main
git pull --ff-only origin main
git fetch --prune origin
git status --short
git switch -c audit/matrix-themes-array-shape

ls supabase/migrations/ | grep -i -E "comparative|matrix|theme"
grep -n "themes" src/integrations/supabase/types.ts
grep -n "comparative_matrix" src/integrations/supabase/types.ts
grep -rn "comparative_matrix" supabase/migrations/
grep -rn "mock-" supabase/migrations/*.sql

grep "INSERT INTO public.comparative_matrix" \
  supabase/migrations/20260518133500_seed_baseline_content_from_remote.sql \
  | sed -E "s/.*VALUES \('([^']+)', '([^']+)'.*'\{([^}]*)\}'::text\[\].*/\1|\2|\3/"

# Read-only live query (staging publishable anon key from .env.local;
# no writes, no migrations, no secrets exposed in this report):
curl -s -G "$VITE_SUPABASE_URL/rest/v1/comparative_matrix" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  --data-urlencode "select=id,axis,themes,is_active,sort_order" \
  --data-urlencode "order=sort_order.asc,id.asc"

curl -s -G "$VITE_SUPABASE_URL/rest/v1/themes" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  --data-urlencode "select=id,label,sort_order" \
  --data-urlencode "order=sort_order.asc"
```

## Files inspected

- `src/components/ComparativeMatrix.tsx`
- `src/components/ComparativeMatrix.test.tsx`
- `src/integrations/supabase/types.ts` (lines 247–312 for the
  `comparative_matrix` Row / Insert / Update shapes)
- `supabase/migrations/20260417115303_…_initial_schema.sql` (CREATE TABLE)
- `supabase/migrations/20260514223610_add_content_contract_metadata_columns.sql`
- `supabase/migrations/20260516115407_a1_extend_comparative_matrix.sql`
- `supabase/migrations/20260518133500_seed_baseline_content_from_remote.sql`
- `supabase/migrations/20260519192443_theme_vocabulary_canonicalisation.sql`
- `supabase/migrations/20260521235900_forward_builder_content_contract_normalisation.sql`
- `supabase/migrations/20260526160000_seed_comparative_matrix_ao_content_themes_7_to_9.sql`
- `supabase/migrations/20260526170000_seed_comparative_matrix_ao_content_themes_10_to_15.sql`
- `.env.local` (read only to obtain staging publishable anon key for read query)

## Local schema findings

The `themes` column is declared at table creation:

```sql
-- 20260417115303_…_initial_schema.sql
CREATE TABLE public.comparative_matrix (
  id text PRIMARY KEY,
  axis text NOT NULL,
  hard_times text NOT NULL,
  atonement text NOT NULL,
  divergence text NOT NULL,
  themes text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

The generated Supabase type definition mirrors this:

```ts
// src/integrations/supabase/types.ts (Row)
comparative_matrix: {
  Row: {
    …
    axis: string
    themes: string[]
    …
  }
}
```

Subsequent migrations:

- `20260514223610_add_content_contract_metadata_columns.sql` adds
  `level_band`, `is_active`, `sort_order` (no theme changes).
- `20260516115407_a1_extend_comparative_matrix.sql` adds AO content columns
  `ao2`, `ao3`, `ao4`, `thesis`, `character`, `narrative`, `structure`,
  `exam_fit` (no theme changes).
- `20260519192443_theme_vocabulary_canonicalisation.sql` creates a 13-row
  canonical `themes` table, builds a `theme_alias` map, and rewrites
  `comparative_matrix.themes` to the canonical vocabulary across all rows,
  then validates that no non-canonical values remain.
- `20260526160000_…` and `20260526170000_…` update AO content columns only;
  they do not touch `themes`.

The component (`src/components/ComparativeMatrix.tsx`) selects only:

```
id, axis, hard_times, atonement, ao2, ao3, ao4, thesis,
character, narrative, structure, exam_fit
```

`themes` is **not** in the projection. The UI maps `axis` onto the per-row
`theme` display string (`row.theme = r.axis`). There is no current consumer
of the `themes[]` array in source.

## Local seed findings

The seed migration `20260518133500_seed_baseline_content_from_remote.sql`
inserts 40 rows into `comparative_matrix`, all with `is_active = true`. Each
row has a `themes[]` literal of the form `'{authorship,family,guilt}'::text[]`.

| id | axis | themes (post-canonicalisation) |
| --- | --- | --- |
| `cm-change-01` | Changing relationships | authorship, family, guilt |
| `cm-change-02` | Changing relationships | authorship, class, family, gender |
| `cm-child-01` | Roles of children | childhood, class, education |
| `cm-child-02` | Roles of children | childhood, endings, guilt, imagination |
| `cm-choice-01` | Important choices | authorship, childhood, education, guilt |
| `cm-choice-02` | Important choices | class, justice, morality |
| `cm-conflict-01` | Conflict | class, justice, morality |
| `cm-conflict-02` | Conflict | authorship, education, imagination |
| `cm-diff-01` | Difficult circumstances | class, justice, morality, war |
| `cm-diff-02` | Difficult circumstances | childhood, education, guilt, morality |
| `cm-edu-01` | Education (formal / informal) | childhood, education, imagination |
| `cm-edu-02` | Education (formal / informal) | education, imagination, morality |
| `cm-female-01` | Relationships between female characters | family, gender, guilt, imagination |
| `cm-female-02` | Relationships between female characters | class, family, gender |
| `cm-friend-01` | Friendship | class, gender, morality |
| `cm-friend-02` | Friendship | class, morality, war |
| `cm-hope-01` | Hope | endings, imagination, morality |
| `cm-hope-02` | Hope | authorship, endings, guilt, imagination |
| `cm-indep-01` | Independence | class, gender, morality |
| `cm-indep-02` | Independence | class, justice, morality |
| `cm-love-01` | Love | class, endings, gender, morality |
| `cm-love-02` | Love | class, gender, justice, morality |
| `cm-marriage-01` | Marriage | class, gender, justice, morality |
| `cm-marriage-02` | Marriage | class, endings, justice, morality |
| `cm-rolemodel-01` | Role models | childhood, education, gender |
| `cm-rolemodel-02` | Role models | authorship, endings, guilt |
| `cm-setting-01` | Settings | class, morality, war |
| `cm-setting-02` | Settings | class, family, imagination |
| `cm-society-01` | Criticising aspects of society | authorship, class, justice, war |
| `cm-society-02` | Criticising aspects of society | authorship, class, justice, morality |
| `mock-childhood` | Childhood | _(empty)_ |
| `mock-class` | Class and power | _(empty)_ |
| `mock-endings` | Endings and closure | _(empty)_ |
| `mock-family` | Family failure | _(empty)_ |
| `mock-guilt` | Guilt and atonement | _(empty)_ |
| `mock-imagination` | Imagination vs rationality | _(empty)_ |
| `mock-narrative-truth` | Narrative truth and unreliability | _(empty)_ |
| `mock-social-responsibility` | Social responsibility | _(empty)_ |
| `mock-time-memory` | Time and memory | _(empty)_ |
| `mock-war` | War and industrial systems | _(empty)_ |

Counts per row:
- 30 rows have between 3 and 4 themes each (mean ≈ 3.4).
- 10 rows have 0 themes (all `mock-*`).
- All values across all populated rows come from the canonical 12-element
  vocabulary (subset of the 13-row `themes` table; `memory` is unused).

## Live read-only data findings, if available

Live access **was** available via the staging Supabase project URL and the
publishable anon key declared in `.env.local`. The query was a pure
`GET /rest/v1/comparative_matrix?select=…` with no body and no mutation
endpoints touched. No secrets are repeated in this report.

Live state matches the local seed exactly:

- 40 rows total.
- 40 rows with `is_active = true`; 0 inactive rows.
- 30 rows with non-empty `themes[]`; 10 rows with empty `themes[]` (all the
  `mock-*` placeholder rows).
- 12 distinct theme values used across active rows.
- The canonical `themes` table has 13 rows; `memory` is defined but unused
  by any current `comparative_matrix.themes[]` value.
- 25 distinct `axis` values across active rows: 15 of the cm-curated axes
  (each used by 2 rows) plus 10 placeholder axes (each used by 1 mock row).

## Theme frequency table

Computed from the 30 active `cm-*` rows (the 10 `mock-*` rows contribute
zero theme values):

| theme id | canonical label | frequency |
| --- | --- | --- |
| class | Class & Social Hierarchy | 18 |
| morality | Morality, Sympathy & Human Feeling | 16 |
| gender | Gender & Power | 9 |
| justice | Justice, Punishment & Atonement | 9 |
| authorship | Authorship & Narrative Control | 8 |
| imagination | Imagination & Fiction | 8 |
| education | Education & Utilitarianism | 7 |
| guilt | Guilt & Responsibility | 7 |
| childhood | Childhood & Moral Formation | 6 |
| endings | Time, Retrospection & Endings | 6 |
| family | Family & Emotional Neglect | 5 |
| war | Systems that Consume the Body | 4 |
| memory | Memory & Narrative Reconstruction | 0 (unused) |

Distribution observations:
- Every used theme is repeated across at least 4 rows.
- No tail of one-off values (the alias migration eliminated them).
- The most common theme (`class`, 18/30 = 60%) is broad enough that a single
  selection would still leave a meaningful row set.
- `memory` is defined in `themes` but absent from `comparative_matrix.themes`
  — fine for a multiselect (would simply show as an option with 0 matches if
  the future UI lists all canonical themes, or be omitted if it derives the
  list from the column).

## Comparison with axis

| dimension | `axis` (current display) | `themes[]` (candidate filter) |
| --- | --- | --- |
| Cardinality (active) | 25 values (15 cm + 10 mock) | 12 values (cm only) |
| Per-row count | 1 string per row | 0–4 values per row |
| Granularity | row-level (each axis used by ~1–2 rows) | cross-row (themes repeat) |
| Repetition | low (mostly 2 rows per axis) | high (every theme used ≥4×) |
| Vocabulary control | free text; mock axes drift from canonical | canonical vocabulary, alias-normalised |
| Coverage | 100% of active rows | 75% of active rows (30/40) |
| What it answers | "which curated pairing is this?" | "what does this row cross-cut?" |

`axis` already functions as a stable theme-like display label, but it is
*essentially a primary key for the pairing* — selecting on it is closer to
picking a row than filtering. `themes[]` is genuinely cross-cutting and
would change the row set in a way `axis` cannot.

A `themes[]` filter would not duplicate search: search hits prose body text
(`Object.values(r).join(" ").toLowerCase()`), which is too coarse to behave
like a tag filter.

If a future UI surfaces both:
- `axis` should remain a display label, not a filter.
- `themes[]` could be a multiselect — but only after the `mock-*` rows are
  resolved, otherwise activating any theme silently drops the 10 untagged
  rows from view.

## Classification

**B. Weak filter candidate.**

The vocabulary is controlled, repeated, and small (12 used / 13 canonical).
Frequencies are healthy. But 10/40 active rows (25%) have empty `themes[]`,
so a multiselect would either hide a quarter of the active matrix or need an
explicit "untagged" bucket. The shape is right; the population is not.

If the `mock-*` rows are deactivated or backfilled, classification moves to
**A. Good filter candidate**.

## AO compliance assessment

- The component restricts the AO filter to `all | ao2 | ao3 | ao4`
  (`src/components/ComparativeMatrix.tsx:44, 174`). No AO5 column is read or
  rendered.
- The canonical `themes` table contains no AO5 entry; the candidate filter
  would inherit the same 12-of-13 vocabulary.
- `ao5_tensions` exists as a legacy table name in the very first migration
  (`20260417115303_…`) but is not referenced by `comparative_matrix`, by
  `ComparativeMatrix.tsx`, or by any theme. Its presence is incidental and
  unchanged by this audit.
- Any future `feat/matrix-themes-multiselect` would operate purely on
  `themes[]` and would not change AO rules, AO scoring, AO labels, AO
  validation, or AO routing. The AO filter would remain `all/AO2/AO3/AO4`.

No AO5 functionality is, or would be, introduced.

## Recommendation

**D. Defer pending data normalisation / population.**

Specifically, before opening a `feat/matrix-themes-multiselect` PR:

1. Decide the status of the 10 `mock-*` rows:
   - either deactivate them (set `is_active = false`), or
   - backfill `themes[]` and reconcile their placeholder `axis` values with
     the cm-curated axis vocabulary.
2. Re-run the inspection. If all active rows have non-empty `themes[]`,
   classification becomes A and a multiselect is justified.

Rationale: the vocabulary is healthy, but a filter that silently drops a
quarter of active rows is a worse UX than no filter at all. The
data-cleanup is a separate, small unit of work and should not be bundled
into a UI feature PR.

## Proposed next step

- **This PR (docs only):** merge this audit so the conclusion is recorded.
- **Next step (separate, data-only PR or curatorial decision):** resolve the
  10 `mock-*` rows in `comparative_matrix`. This is plausibly the same
  shape as the deferred curatorial work tracked in the Session A–D
  remediation notes.
- **After data is clean:** re-evaluate. If accepted, open
  `feat/matrix-themes-multiselect` to add `themes` to the
  `ComparativeMatrix.tsx` projection and surface a multiselect with the 12
  canonical theme labels (joined from the `themes` table for human-readable
  labels).
- **If data clean-up is not undertaken:** keep current lens + search +
  AO-presence model indefinitely (Recommendation C from the prior data-shape
  audit remains the default).

## Risks and non-goals

Risks if a multiselect is built before the data is cleaned:
- 10 `mock-*` rows silently disappear from the matrix whenever any theme is
  selected, with no indication to the user.
- Placeholder axes (`Class and power`, `War and industrial systems`, etc.)
  may be interpreted by users as canonical comparative pairings, masking
  the fact that they are unbacked.

Non-goals:
- Not porting the archived `splitTags(value.split(/[,;|]/))` approach from
  `origin/feat/ao-route-engines-recovery`. That approach derives fake tags
  from prose fields and is unrelated to `themes[]`.
- Not introducing multi-axis filtering across the prose fields
  (`character`, `narrative`, `structure`, `examFit`, `ao2`, `ao3`, `ao4`,
  `thesis`).
- Not modifying the AO filter or introducing AO5 anywhere.
- Not normalising or backfilling data in this PR (would breach the
  docs-only safety rules).

## What was not changed

- No source files were modified.
- No migrations were created or modified.
- No `supabase db push`, `supabase migration up`, `supabase db reset`, or
  `supabase db pull` was run.
- No write or mutation was made against the Supabase project.
- No new feature branch was created beyond the docs-only audit branch.
- No AO5 column, label, filter, UI, validation, or route logic was
  introduced.
- The archived `origin/feat/ao-route-engines-recovery` branch was not
  touched.
- The only file added by this change is
  `docs/COMPARATIVE_MATRIX_THEMES_ARRAY_AUDIT.md`.
