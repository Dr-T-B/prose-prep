# Compare / Comparative Matrix Feature Audit

**Branch:** `audit/compare-feature`
**Audit date:** 2026-05-29
**Scope:** correctness, mobile usability, filtering behaviour, accessibility, test coverage, deployment safety.
**Mode:** read-only audit. No feature code, tests, migrations, seed data, package manifests, or env files were modified.

---

## 1. Executive summary

The repository ships **two distinct "Compare" surfaces**: a fully-featured filtered matrix at `/matrix` (`src/components/ComparativeMatrix.tsx`, 723 LOC, Supabase-backed) and a simpler read-only list at `/compare` (`src/pages/Compare.tsx`, 146 LOC, ContentProvider-backed). The primary nav links the label "Compare" to `/matrix`; `/compare` is effectively orphaned in the UI but tested and routed.

The matrix feature itself is functionally solid: filter state, AO predicates, OR-style theme composition and search composition all behave as the existing test suite asserts (24 component tests + 1 page test pass). Print modes, accordion expansion, copy-to-clipboard and "Send to Essay Builder" handoff are all wired and covered. AO5 is **not** introduced anywhere in the Compare UI, the export payload, or the handoff metadata; existing latent AO5 references are confined to historical migrations (already covered by `validate:component2-ao`, currently green).

Main risks worth follow-up:

1. **Two parallel implementations** of "Compare" with divergent data sources and divergent rendering — a structural maintenance hazard and likely UX inconsistency, not a bug today.
2. **Mobile / accessibility gaps in the toolbar**: the search input has no programmatic label, the print-mode `<select>` has no accessible name, filter buttons fall under recommended 44×44 px tap target size, and the toolbar wraps onto multiple rows without disclosure / collapse on narrow screens.
3. **Mobile AO/Meta cards render even when their bodies are empty**, producing labelled-but-blank blocks for sparse rows (Step 7 / empty-content handling).
4. **Teacher-pack print mode iterates `rows`, not `filtered`**, so it ignores the active filters when printing. Likely intentional but undocumented.

Typecheck, lint, full Vitest suite, and `validate:component2-ao` all pass; `git diff --check` is clean. No Supabase writes were performed; the audit is read-only.

(Word count ≈ 245.)

---

## 2. Files inspected

| File | Role |
|------|------|
| `src/App.tsx` | Mounts `/matrix` (ComparativeMatrix) and `/compare` (Compare) under `ProtectedRoute` + `AppShell`. |
| `src/components/AppShell.tsx` | Primary nav. The student "Compare" link targets `/matrix`, not `/compare`. Header is `sticky top-0 z-30`. |
| `src/components/ComparativeMatrix.tsx` | The full feature: Supabase fetch of `comparative_matrix`, filter state (search / AO / lens / themes), three render modes (table / mobile accordion / print), copy + Essay Builder handoff. |
| `src/components/ComparativeMatrix.test.tsx` | 24 component tests covering filter composition, AO toggling, theme chips, copy clipboard, handoff payload, AO5 negation, accordion + print modes. |
| `src/pages/Compare.tsx` | Read-only secondary "Compare" page using `useContent().comparative_matrix`. No filters. Renders divergence + thesis + AO + planning blocks. |
| `src/pages/Compare.test.tsx` | One test verifying the populated AO content fields render. |
| `src/pages/ComparisonRoutes.tsx` | Adjacent feature at `/routes` (separate AO4 comparative-route planner). Not part of the Compare audit but referenced for naming overlap. |
| `src/components/ComparativeRoutePlanPanel.tsx` | Comparative route planner panel (separate concern). Referenced for AO5 negation tests. |
| `src/components/Ao4ComparativeRoutePanel.tsx` | Adjacent AO4 panel. Out of audit scope; checked for naming clash only. |
| `src/lib/ContentProvider.tsx` (referenced) | Provides `comparative_matrix` to `/compare`. |
| `src/lib/contentRepo.ts` | Builds `comparative_matrix` payload from remote (Supabase) or seed bundle. |
| `src/data/seed.ts` | `ComparativeMatrixEntry` interface and `COMPARATIVE_MATRIX` local seed; no `ao1` field. |
| `src/lib/builderHandoff.ts` (referenced) | Target of `Send to Essay Builder` handoff. |
| `supabase/migrations/20260417115303_*.sql` | Original `comparative_matrix` table (id, axis, hard_times, atonement, divergence, themes). |
| `supabase/migrations/20260514223610_add_content_contract_metadata_columns.sql` | Adds `level_band`, `is_active`, `sort_order` to `comparative_matrix` (relied on by ComparativeMatrix.tsx query). |
| `supabase/migrations/20260516115407_a1_extend_comparative_matrix.sql` | Adds `ao2/ao3/ao4/thesis/character/narrative/structure/exam_fit` columns. |
| `supabase/migrations/20260526160000_seed_comparative_matrix_ao_content_themes_7_to_9.sql`, `20260526170000_seed_comparative_matrix_ao_content_themes_10_to_15.sql`, `20260528004217_backfill_comparative_matrix_mock_row_themes.sql` | AO content seeds and theme backfill. |
| `scripts/validate-component2-ao-model.mjs` | AO5 guardrail (passes; 0 blocked references). |
| `index.html` | Viewport meta tag present and correct. |

---

## 3. Feature map / data flow

```
URL "/matrix"  ──►  AppShell (sticky header, z-30)
                      └── ComparativeMatrix.tsx (Component2ComparativeMatrix)
                            ├── Supabase: from("comparative_matrix")
                            │     .select("id, axis, hard_times, atonement,
                            │              ao2, ao3, ao4, thesis,
                            │              character, narrative, structure,
                            │              exam_fit, themes")
                            │     .eq("is_active", true)
                            │     .order("sort_order")
                            │
                            ├── Local state:
                            │     rows, loading, error, reloadKey,
                            │     query, aoFilter ('all'|AO2|AO3|AO4),
                            │     lens ('all'|character|narrative|
                            │           structure|examFit),
                            │     selectedThemes[], expandedIds (Set),
                            │     printMode (compact|cards|teacher),
                            │     copiedId
                            │
                            ├── Derived: themeOptions (useMemo over rows),
                            │            filtered (useMemo: AO predicate →
                            │              theme OR predicate → search includes)
                            │
                            └── Render:
                                  ▶ Desktop table   (lg:block, print:block when compact)
                                  ▶ Mobile cards    (lg:hidden, print:block when cards)
                                  ▶ Teacher print   (hidden, print:block when teacher)
                                                   ── iterates rows, NOT filtered

URL "/compare" ──►  AppShell
                      └── Compare.tsx
                            └── useContent().comparative_matrix
                                  └── contentRepo.ts (remote-then-seed)
```

Note: `/matrix` and `/compare` consume the same logical table but via different code paths (direct Supabase call vs. `ContentProvider`). The student-facing nav label "Compare" points to `/matrix`.

---

## 4. Current behaviour summary

- **Data load:** `/matrix` issues a single Supabase query filtered to `is_active = true`, ordered by `sort_order`. On error, a Retry button bumps `reloadKey` and re-fetches. Cancelled-flag guards against late responses.
- **Search:** debounce-less `value/onChange` against `query`. Match logic stringifies every row property (including `id` and themes array), lowercases, and `.includes(q)`.
- **AO filter:** `AO_FILTER_OPTIONS` exposes exactly `All AOs`, `AO2`, `AO3`, `AO4`. Selection is exclusive (single `aoFilter` state). When an AO is selected, rows are filtered by `hasText(row[aoKey])`, and the desktop table hides the non-selected AO columns via `visibleCols()`. The mobile accordion rewrites the selected AO block's label to "Method"/"Context"/"Comparative Link" and hides the other two. **No AO1 button or AO1 field is present** in the matrix UI or row interface.
- **Secondary lens:** `LENS_OPTIONS` (`All details`, `Character / function`, `Narrative method`, `Structural method`, `Exam question suitability`). Exclusive single-value setter. Does not filter rows; only changes which extra column appears in the desktop table.
- **Themes chips:** derived from row data, OR-composed, multi-select, with a "Reset themes" link.
- **Composition:**
  - AO + search: applied sequentially in `filtered` useMemo (AO predicate then search). Verified by test `combines AO filtering with search…`.
  - AO + themes: applied sequentially. Theme predicate uses `selectedThemes.some(theme => rowThemes.includes(theme))`.
  - AO + lens: composes for column visibility only (AO filter narrows rows; lens narrows columns).
- **Clear filters:** resets `query`, `aoFilter`, `lens`, `selectedThemes`. Does **not** reset `expandedIds` or `printMode`. (Acceptable behaviour, but not documented anywhere.)
- **Expand all / Collapse all:** Set/clear the expanded set against the currently filtered rows.
- **Print modes:**
  - `compact` → desktop table is print-visible.
  - `cards` → mobile-style accordion list is print-visible (and is rendered expanded? — see Finding F-22).
  - `teacher` → a separate `<section>` iterates `rows` (unfiltered) producing a complete dump.
- **Copy route:** primary `navigator.clipboard.writeText`; textarea fallback; status reverts after 2 s.
- **Send to Essay Builder:** integrates a handoff and navigates to `/builder`. Failure case still navigates.

The `/compare` page renders the full set unfiltered, with no controls. It uses `divergence` (which the matrix UI does not show) and renders Thesis/AO/Character/Narrative/Structure/Exam fit only when `hasText` returns true.

---

## 5. Findings table (top 25)

| ID | Severity | Area | Finding | Evidence | Recommended action |
|----|----------|------|---------|----------|--------------------|
| F-01 | high | Architecture | Two divergent "Compare" implementations: feature-rich `/matrix` (Supabase) and minimal `/compare` (ContentProvider) coexist; only `/matrix` is linked from the primary nav. | [src/App.tsx:90](src/App.tsx:90), [src/App.tsx:98](src/App.tsx:98), [src/components/AppShell.tsx:17](src/components/AppShell.tsx:17) | Decide canonical surface. Either delete or redirect `/compare` (it duplicates content but lacks filters), or document why both exist. |
| F-02 | medium | Architecture | `/compare` shows `divergence` content (an analytical joint) that `/matrix` does **not** surface anywhere, so students using the linked nav never see it. | [src/pages/Compare.tsx:91-97](src/pages/Compare.tsx:91), [src/components/ComparativeMatrix.tsx:78-79](src/components/ComparativeMatrix.tsx:78) | Either add a "Divergence" column / collapsed reveal to the matrix, or expose `/compare` in nav. |
| F-03 | medium | Accessibility | The toolbar search input has no `<label>` or `aria-label`; only `placeholder` text. Screen readers will announce the field as untitled. | [src/components/ComparativeMatrix.tsx:278-283](src/components/ComparativeMatrix.tsx:278) | Add a visually-hidden `<label>` (or `aria-label="Search comparative routes"`) bound via `htmlFor`/`id`. |
| F-04 | medium | Accessibility | The print-mode `<select>` has no accessible name (no label, no `aria-label`); it is purely visually positioned. | [src/components/ComparativeMatrix.tsx:322-330](src/components/ComparativeMatrix.tsx:322) | Add `aria-label="Print layout"`. |
| F-05 | medium | Mobile UX | Filter pills use `px-3 py-1 text-xs` (≈24 px tall) and theme chips `px-2.5 py-0.5` — well below the 44×44 px recommended mobile tap target. | [src/components/ComparativeMatrix.tsx:290-295](src/components/ComparativeMatrix.tsx:290), [src/components/ComparativeMatrix.tsx:350-354](src/components/ComparativeMatrix.tsx:350) | Increase touch height (`py-2`) at the `sm:` breakpoint, or wrap each control with a larger hit area. |
| F-06 | medium | Mobile UX | The filter toolbar consists of four button groups + a print row + a theme row; on narrow screens it wraps to 6–8 stacked rows below a sticky app header, pushing content far below the fold. There is no collapse/disclosure mechanism. | [src/components/ComparativeMatrix.tsx:268-371](src/components/ComparativeMatrix.tsx:268) | Add a `Filters` disclosure (sheet/accordion) on `<sm` viewports. |
| F-07 | medium | Data | Mobile `<AO>`, `<Meta>` and `<Pair>` components render label + body unconditionally, so sparse rows (empty `character`, `narrative`, `structure`, `exam_fit`) display labelled-but-blank cards. | [src/components/ComparativeMatrix.tsx:485-525](src/components/ComparativeMatrix.tsx:485), [src/components/ComparativeMatrix.tsx:600-630](src/components/ComparativeMatrix.tsx:600) | Wrap each in a `hasText(body)` guard, matching `/compare`'s pattern. |
| F-08 | medium | Data | Mobile accordion renders the Thesis block unconditionally even when `row.thesis` is empty (sparse-rows test only asserts no crash). | [src/components/ComparativeMatrix.tsx:512-519](src/components/ComparativeMatrix.tsx:512) | Guard the Thesis container with `hasText(row.thesis)`. |
| F-09 | medium | Data | Desktop table cells render `row[c.key]` with no fallback — an empty AO/thesis cell produces a visually blank but still-laid-out cell, and AO columns persist when the user has not selected an AO filter, even though rows may have empty bodies. | [src/components/ComparativeMatrix.tsx:444-449](src/components/ComparativeMatrix.tsx:444) | Either render a dim em-dash for empty cells, or hide AO columns whose data is empty across the filtered set. |
| F-10 | medium | Filtering | Teacher-pack print iterates `rows`, not `filtered`. This silently ignores search / AO / theme filters when the user prints in `teacher` mode. | [src/components/ComparativeMatrix.tsx:552-569](src/components/ComparativeMatrix.tsx:552) | Decide and document: either honour filters or surface a "This print includes all rows regardless of filters" note. |
| F-11 | medium | Filtering | Search match includes `r.id` (every row's internal id) by stringifying `Object.values(r)`. Searching e.g. `cmx_` returns every row. | [src/components/ComparativeMatrix.tsx:197-203](src/components/ComparativeMatrix.tsx:197) | Restrict search to user-visible textual fields. |
| F-12 | low | A11y | Filter buttons use only `bg-ink text-paper` to indicate active state; no programmatic indicator beyond `aria-pressed`. Acceptable, but the inactive style (`text-ink-muted`) loses contrast at small sizes. | [src/components/ComparativeMatrix.tsx:290-298](src/components/ComparativeMatrix.tsx:290) | Verify 3:1 contrast for inactive label vs paper-dim background and bump muted token if needed. |
| F-13 | low | A11y | Reset themes link uses `underline decoration-dotted` but no `:focus-visible` style; default browser ring is suppressed only on inputs, but Tailwind link classes inherit no focus ring. | [src/components/ComparativeMatrix.tsx:361-367](src/components/ComparativeMatrix.tsx:361) | Add explicit `focus-visible:ring-2 focus-visible:ring-ink`. |
| F-14 | low | A11y | The toolbar `role="region"` is named "Comparative matrix filters" but lives **inside** the `<header>` of the page. Some screen readers will count it as part of the banner landmark. | [src/components/ComparativeMatrix.tsx:255-272](src/components/ComparativeMatrix.tsx:255) | Either move the region outside the `<header>`, or label it as a `<nav>` / explicit `<section>`. |
| F-15 | low | A11y | Toolbar contains two distinct buttons with similar accessible labels — `Clear filters` (toolbar) and `Clear all filters` / `aria-label="Clear all active filters"` (empty state). Only one is visible at a time, so not a true duplicate, but the wording divergence is confusing. | [src/components/ComparativeMatrix.tsx:319](src/components/ComparativeMatrix.tsx:319), [src/components/ComparativeMatrix.tsx:379-384](src/components/ComparativeMatrix.tsx:379) | Normalise to one label string. |
| F-16 | low | Code quality | `printMode` setter uses `as any` to cast the `<select>` value. | [src/components/ComparativeMatrix.tsx:324](src/components/ComparativeMatrix.tsx:324) | Type the value via `value as typeof printMode`. |
| F-17 | low | Code quality | The mobile accordion renders the AO block list via an IIFE that re-derives label strings (`"Method"`/`"Context"`/`"Comparative Link"`) inside the JSX. The label remapping shadows the same data already encoded in `COLS`. | [src/components/ComparativeMatrix.tsx:488-511](src/components/ComparativeMatrix.tsx:488) | Lift the AO display table to a module-level constant; consume from one source. |
| F-18 | low | Code quality | `visibleCols()` mutates a temp array via `splice` while running inside a render path. Works, but is unusual; an explicit array build would read more clearly. | [src/components/ComparativeMatrix.tsx:575-598](src/components/ComparativeMatrix.tsx:575) | Refactor to a declarative builder. |
| F-19 | low | Code quality | The page-level `Component2ComparativeMatrix` is 723 LOC with state, fetching, three rendering modes, theme labelling, export formatter, and handoff builder inline. | [src/components/ComparativeMatrix.tsx:1-723](src/components/ComparativeMatrix.tsx) | Split into `useComparativeMatrix()` hook + `MatrixToolbar` + `MatrixTable` + `MatrixCards` + `MatrixPrint`. |
| F-20 | low | Mobile UX | The desktop table is rendered inside an `overflow-x-auto` that nests inside another scroll container under the sticky header — combined with `sticky left-0` on the first column, this can cause "double-shadow" or scroll-eat behaviour on iOS Safari. | [src/components/ComparativeMatrix.tsx:390-411](src/components/ComparativeMatrix.tsx:390) | Verify on iOS Safari; consider explicit `-webkit-overflow-scrolling: touch` and a single horizontal scroll boundary. |
| F-21 | low | Print | `print:hidden` on the toolbar is set, but the page header also lacks an explicit `print:` class for the orientation/copyright row, which will print regardless. | [src/components/ComparativeMatrix.tsx:254-261](src/components/ComparativeMatrix.tsx:254) | Confirm visually; if undesired, add `print:hidden` to the eyebrow row. |
| F-22 | low | Behaviour | "Print revision cards" mode always prints **collapsed** mobile cards unless the user separately uses Expand all (mobile-only control). Print output may be empty bodies if students press Print without first expanding. | [src/components/ComparativeMatrix.tsx:457-547](src/components/ComparativeMatrix.tsx:457) | Force `expanded=true` for print regardless of state, or auto-expand all before `window.print()`. |
| F-23 | observation | AO5 | Latent AO5 references exist in historical migrations (e.g. `supabase/migrations/20260417115303_*.sql:108,208–209`, `20240504000000_drama_scene_schema.sql:99-220`, `20260426000000_create_missing_content_tables.sql:44`). They are pre-existing, not introduced by Compare, and already covered by the AO5 guardrail validator. | grep results above | Per audit brief: list, do not delete. The guardrail (`validate:component2-ao`) is passing. |
| F-24 | observation | Naming | The route `/matrix`, the component `ComparativeMatrix`, the page-class `Component2ComparativeMatrix`, and the nav label `"Compare"` use four different names for one feature. Tests reference both "comparative routes" wording and "comparative matrix" wording. | [src/components/ComparativeMatrix.tsx:58](src/components/ComparativeMatrix.tsx:58), [src/components/AppShell.tsx:17](src/components/AppShell.tsx:17) | Pick one canonical noun; rename the route and component to match in a follow-up PR. |
| F-25 | observation | Tests | `ComparativeMatrix.test.tsx` exercises every filter axis individually but does not assert combined **AO + theme** composition or **AO + theme + search** composition. | [src/components/ComparativeMatrix.test.tsx](src/components/ComparativeMatrix.test.tsx) | Add explicit triple-composition tests. |

(No further appendix needed; total findings = 25.)

---

## 6. Mobile interaction findings

- **Sticky stack:** AppShell header is `sticky top-0 z-30`. The matrix toolbar is `relative z-40 bg-paper`. Z-ordering is correct: filters render above the header backdrop, and the toolbar tests already assert these classes (`ComparativeMatrix.test.tsx` "keeps the filter toolbar above the sticky app shell on mobile"). No invisible-overlay risk identified.
- **Tap target sizes:** filter / lens / theme buttons are 24–28 px tall — well below WCAG 2.5.5 recommended 44 px. See **F-05**.
- **Filter density:** toolbar wraps to ≥6 rows on a 375 px viewport — no disclosure. See **F-06**.
- **Horizontal overflow:** desktop matrix is gated behind `lg:block`, so the table never appears on mobile; the mobile-only accordion uses simple block flow with no horizontal scroll. Good.
- **Sticky first column inside scroll container:** desktop only (`hidden lg:block` wrapper). Tablet edge case (>= lg breakpoint touch device) might show scroll oddities on iOS — see **F-20**.
- **Viewport meta:** present and correct (`width=device-width, initial-scale=1.0, viewport-fit=cover` at [index.html:5](index.html:5)).
- **100vh / iOS Safari:** ComparativeMatrix uses `min-h-screen` only on the loading and error containers, not on the main content. Low risk.
- **No Playwright / mobile-viewport harness exists.** Recorded as a coverage gap; no new harness added.

---

## 7. Accessibility findings

- Filter region: `role="region"` + `aria-label="Comparative matrix filters"` ✓ (See F-14 nesting concern.)
- AO toggle buttons: `aria-pressed` reflects state ✓
- Lens toggle buttons: `aria-pressed` reflects state ✓
- Theme chips: `aria-pressed` + `aria-label="Toggle X theme filter"` ✓
- Reset themes link: `aria-label="Reset theme filters"` ✓ (missing focus-visible style — F-13)
- Mobile accordion: `aria-expanded` + `aria-controls` ✓
- Copy / Send buttons: per-row `aria-label` with row theme ✓
- Search input: **no label / no aria-label** ✗ (**F-03**)
- Print-mode select: **no label / no aria-label** ✗ (**F-04**)
- "Clear filters" / "Clear all filters" inconsistency (**F-15**)
- Visible focus: input/select use `focus:outline-none focus:ring-2 focus:ring-ink` (replacement provided ✓). Buttons rely on browser default outline (`focus:` classes not present, but `outline-none` is not applied, so the default outline still renders).

---

## 8. Filtering / data correctness findings

- AO predicate maps `AO2 → ao2`, `AO3 → ao3`, `AO4 → ao4` and uses `hasText(value)` which trims whitespace ✓ ([ComparativeMatrix.tsx:50-56,183-188](src/components/ComparativeMatrix.tsx:50)).
- AO1 is a valid AO in the data model (per the brief), and **no AO1 column or filter exists in the matrix UI** ✓.
- No AO5 keys are emitted in: row interface, table headers, mobile cards, print modes, clipboard export, or Essay Builder handoff payload ✓ (tests at lines 341-347, 591-598, 636-637 of the test file).
- Theme predicate uses OR semantics (`some`) ✓; document this in the UI ("Showing routes matching ANY of N themes") for clarity.
- Search predicate: `Object.values(r)…toLowerCase().includes(q)` matches `r.id` (**F-11**).
- Empty-content handling differs between views:
  - `/compare` page guards every AO and planning block with `hasText()` ✓
  - Matrix mobile accordion renders blocks unconditionally ✗ (**F-07**, **F-08**)
  - Matrix desktop table renders empty `<td>` cells ✗ (**F-09**)
- Teacher-print mode prints unfiltered set (**F-10**).
- `clearFilters()` resets the four filter axes but not `expandedIds` or `printMode`. Acceptable; not documented.

---

## 9. Test coverage assessment

| Behaviour | Test file | Covered? |
|-----------|-----------|----------|
| Search filters rows | `ComparativeMatrix.test.tsx` "accepts search text…" / "combines AO filtering with search" | ✓ |
| AO buttons toggle exclusively | "marks AO3 and AO4 active when selected and clears back to All AOs" | ✓ |
| Selecting AO deactivates "All AOs" | same | ✓ |
| Selecting "All AOs" clears AO filter | same | ✓ |
| Secondary lens controls clickable + exclusive | "keeps every secondary lens control clickable" | ✓ (clickable only — exclusivity not asserted explicitly) |
| AO + secondary lens column composition | "limits visible AO columns while combining an AO filter with a secondary lens" | ✓ |
| AO + search composition | "combines AO filtering with search" | ✓ |
| AO + theme composition | — | ✗ (only theme alone, and theme + search) |
| AO + theme + search composition | — | ✗ |
| Theme chip multi-select OR semantics | "filters rows when a theme filter is clicked (toggled) using OR semantics" | ✓ |
| Theme + search composition | "composes theme filter with search query and clears it on clear filters" | ✓ |
| Clear filters resets axes | same / "clears search and filters" | ✓ |
| Clear filters does *not* reset printMode/expandedIds | — | ✗ |
| Expand all / Collapse all | "expands and collapses all visible routes" | ✓ |
| Compact / cards / teacher print mode label switching | "dynamically reflects the print mode in the print button label" / "updates printable layout regions when switching print modes" | ✓ |
| Print teacher mode shows unfiltered rows | — | ✗ |
| Mobile accordion expand single row | "sets aria-expanded when a route accordion is toggled" | ✓ |
| Multiple accordions remain expanded | "allows multiple comparative routes to remain expanded simultaneously" | ✓ |
| Copy route to clipboard | "copies formatted comparative route scaffold to clipboard on click" | ✓ |
| Send to Essay Builder handoff payload | "renders 'Send to Essay Builder' buttons…" / mobile variant | ✓ |
| AO5 never rendered | three dedicated tests | ✓ |
| Sparse / empty-content rows render | "renders sparse comparative rows without crashing" | ✓ (only asserts no crash, not that empty blocks are suppressed) |
| Search input has accessible name | — | ✗ |
| Print-mode select has accessible name | — | ✗ |
| Tap target sizes on mobile | — | ✗ (no mobile harness) |
| Keyboard navigation of toolbar | — | ✗ |
| `/compare` page renders AO content | `Compare.test.tsx` | ✓ |
| `/compare` empty-state | — | ✗ |

**Recommended new tests (do not add in this PR):**
1. AO + theme composition with non-overlapping selections returns expected subset.
2. AO + theme + search triple composition.
3. Mobile accordion does NOT render `<AO>` / `<Meta>` / Thesis blocks when bodies are empty (drives F-07, F-08).
4. Teacher-pack print mode behaviour around filters (drives F-10 decision).
5. Search input has `aria-label`; select has `aria-label` (drives F-03, F-04).
6. `clearFilters` preserves `printMode` and `expandedIds`.
7. Empty `comparative_matrix` array shows a graceful empty state (mirrors `/compare`).

---

## 10. Recommended follow-up PRs

### Urgent
- **PR A — Architectural decision on `/matrix` vs `/compare`** (F-01, F-02, F-24): rename and unify; expose `divergence`; pick one nav target.
- **PR B — Mobile + a11y toolbar fix** (F-03, F-04, F-05, F-06, F-13, F-15): label search input, label select, increase tap target, add a disclosure on small viewports, normalise "Clear filters" wording.

### Important
- **PR C — Empty-content rendering** (F-07, F-08, F-09): apply `hasText` guards to mobile and desktop renderings; render em-dash for empty cells.
- **PR D — Teacher-pack print semantics** (F-10, F-22): honour filters or document the deliberate divergence; auto-expand mobile cards before printing.
- **PR E — Search scope** (F-11): exclude `id` from the haystack; restrict to user-visible fields.

### Polish
- **PR F — Refactor `ComparativeMatrix.tsx` into smaller files / a hook** (F-17, F-18, F-19).
- **PR G — Tighten `printMode` typing** (F-16).
- **PR H — Test coverage gaps** listed under §9.
- **PR I — iOS Safari sticky-column scroll review** (F-20, F-21).

---

## 11. Commands run and results

| Command | Exit | Summary |
|---------|------|---------|
| `git checkout main && git pull --ff-only` | 0 | Fast-forwarded to `57d908f`. |
| `git checkout -b audit/compare-feature` | 0 | Branch created. |
| `npm run typecheck` | 0 | `tsc --noEmit` clean. |
| `npm run lint` | 0 | 24 pre-existing `react-refresh/only-export-components` and one `react-hooks/exhaustive-deps` warning. **No errors.** No Compare files implicated. |
| `npm run test -- src/components/ComparativeMatrix.test.tsx` | 0 | 24 tests passed (1.04 s). |
| `npm run test` | 0 | 427 passed, 3 skipped (Vitest, 5.73 s). |
| `npm run validate:component2-ao` | 0 | 148 files scanned. 159 allowed AO5 references (historical migrations + validator self-references). **0 blocked AO5 references.** |
| `git diff --check` | 0 | No whitespace errors. (Audit branch contains only this file.) |

No commands failed. No new dependencies installed. No feature code or migrations altered.

---

## 12. Supabase safety confirmation

- No `supabase db push / pull / reset` commands were run.
- No `supabase migration up / repair / new` commands were run.
- No remote schema or data mutation was attempted.
- No write-mode `psql` was run.
- Migration files were inspected read-only (`grep`, `sed -n`).
- The audit branch touches only `docs/audits/COMPARE_FEATURE_AUDIT.md` and the parent `docs/audits/` directory.

**No Supabase write or migration commands were run.**

---

## 13. AO5 safety confirmation

- No AO5 logic, UI, filter, scoring, database field, or validation was introduced anywhere in this audit.
- Latent AO5 references (in historical drama-scene migrations, the `ao5_tensions` legacy table, and view-recreation migrations that explicitly remove AO5 columns) were located and listed under **F-23** without being modified.
- `npm run validate:component2-ao` returned 0 blocked AO5 references.
- All existing Compare tests assert that no AO5 string appears in the rendered output, in the clipboard export, or in the Essay Builder handoff payload — they continue to pass.

**No AO5 logic was introduced.**

---

## 14. Appendix — full findings list

All 25 findings are listed inline in §5. No additional findings exceed the table cap.
