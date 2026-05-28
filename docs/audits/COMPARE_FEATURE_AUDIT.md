# Compare / Comparative Matrix Feature Audit

## 1. Executive summary

This audit covered the current Compare and Comparative Matrix surfaces from the repository state on branch `audit/compare-feature`. The interactive `/matrix` feature correctly exposes only `All AOs`, `AO2`, `AO3`, and `AO4`; it does not expose AO1 as a filter and does not contain active AO5 UI or logic. Its AO filter predicate is based on trimmed non-empty AO content, theme chips compose with search, and the targeted ComparativeMatrix suite passes.

The main risks are not AO-rule violations, but product consistency and output correctness. `/matrix` and `/compare` are separate routed surfaces with different data paths and filtering semantics. Teacher print mode ignores the active row filters and prints all loaded rows. Sparse matrix rows can render blank AO/detail sections, especially in mobile card view. Accessibility gaps remain around the unlabeled search input and print-mode select, small mobile tap targets, and limited mobile-specific testing. Test coverage is broad for happy-path interactions but still missing real viewport checks, AO+theme composition, and several accessibility assertions.

Top 3-5 findings: CF-001 route/source split, CF-002 teacher print ignores filters, CF-004 empty mobile sections, CF-006/CF-007 unlabeled controls, and CF-010 missing real mobile viewport coverage.

No Supabase write or migration commands were run.

No AO5 logic was introduced.

## 2. Files inspected

| File | Role |
| --- | --- |
| `src/App.tsx` | Registers `/matrix` to `ComparativeMatrix` and `/compare` to `Compare`. |
| `src/components/AppShell.tsx` | Primary navigation; the visible "Compare" nav item points to `/matrix`; sticky header creates mobile stacking context. |
| `src/components/ComparativeMatrix.tsx` | Interactive comparative matrix, Supabase fetch, filter state, table/card/print rendering, copy and Builder handoff actions. |
| `src/components/ComparativeMatrix.test.tsx` | Main unit tests for AO filters, search, theme chips, print modes, accordion expansion, AO5 absence, copy, and Builder handoff. |
| `src/pages/Compare.tsx` | Read-only `/compare` comparative routes page using `useContent()`. |
| `src/pages/Compare.test.tsx` | Smoke test for `/compare` AO-content rendering and AO5 absence. |
| `src/lib/ContentProvider.tsx` | Provides local seed first, then asynchronously replaces it with `loadContent()` results. |
| `src/lib/contentRepo.ts` | Loads `comparative_matrix` from Supabase with local seed fallback for ContentProvider consumers. |
| `src/data/seed.ts` | Local fallback types and seed data, including `ComparativeMatrixEntry` and theme labels. |
| `src/integrations/supabase/client.ts` | Client-side Supabase anon-key setup; used by `/matrix` direct fetch. |
| `src/integrations/supabase/types.ts` | Generated Supabase table types for `comparative_matrix` AO2/AO3/AO4 fields. |
| `src/types/database.types.ts` | Re-export shim for generated Supabase types. |
| `src/lib/builderHandoff.ts` | Builder handoff model and matrix paragraph-card conversion used by "Send to Essay Builder". |
| `src/lib/libraryAdapters.ts` | Adapts comparative matrix rows into library comparison pairings and search helpers. |
| `src/pages/library/Comparison.tsx` | Library comparison surface backed by `comparative_matrix`. |
| `src/pages/ComparisonRoutes.tsx` | Older comparison routes page with a `Comparative Matrix` tab and tier/theme filters. |
| `src/pages/RetrievalToolkit.tsx` | Uses `comparative_matrix` in retrieval toolkit matrix tab. |
| `src/pages/EssayBuilder.tsx` | Consumes matrix handoffs and displays matrix-derived paragraph cards. |
| `src/pages/EssayBuilder.test.tsx` | Tests matrix handoff integration into Builder output. |
| `src/lib/paragraphEngine.ts` | Uses comparative matrix rows to pick comparative paragraph directions. |
| `src/components/admin/ContentAudit.tsx` | Admin completeness/audit config for comparative matrix AO fields. |
| `src/components/admin/ContentInspector.tsx` | Admin inspection/search config for comparative matrix AO fields. |
| `src/lib/datasets.ts` | Dataset registry entry for comparative matrix. |
| `supabase/functions/apply-staged-change/index.ts` | Server-side allowlist for staged comparative matrix field updates. |
| `supabase/migrations/20260417115303_ad3baa4f-aadd-4672-a69c-5c25aa86db70.sql` | Initial `comparative_matrix` table definition. |
| `supabase/migrations/20260514223610_add_content_contract_metadata_columns.sql` | Adds `level_band`, `is_active`, and `sort_order` metadata to `comparative_matrix`. |
| `supabase/migrations/20260516115407_a1_extend_comparative_matrix.sql` | Adds AO2/AO3/AO4, thesis, character, narrative, structure, and exam-fit columns. |
| `supabase/migrations/20260518133500_seed_baseline_content_from_remote.sql` | Baseline seed for 40 comparative matrix rows. |
| `supabase/migrations/20260526160000_seed_comparative_matrix_ao_content_themes_7_to_9.sql` | Data-only AO-content seed for themes 7-9. |
| `supabase/migrations/20260526170000_seed_comparative_matrix_ao_content_themes_10_to_15.sql` | Data-only AO-content seed for themes 10-15. |
| `supabase/migrations/20260528004217_backfill_comparative_matrix_mock_row_themes.sql` | Data-only theme backfill with AO5 guard assertions. |
| `scripts/validate-component2-ao-model.mjs` | AO model validator and comparative matrix AO-content contract check. |
| `index.html` | Viewport and mobile web app metadata. |
| `src/index.css` | Global print utilities, focus-relevant baseline CSS, and design tokens. |
| `package.json` | Required command definitions and absence of Playwright/mobile e2e scripts. |
| `vitest.config.ts` | Test environment and include pattern. |

## 3. Feature map / data flow

```text
Primary nav
  AppShell "Compare" (/matrix)
    -> App route /matrix
      -> ComparativeMatrix
        -> supabase.from("comparative_matrix")
             .select(id, axis, hard_times, atonement, ao2, ao3, ao4,
                     thesis, character, narrative, structure, exam_fit, themes)
             .eq("is_active", true)
             .order("sort_order", ascending)
        -> component state
             rows: Row[]
             query: string
             aoFilter: "all" | "AO2" | "AO3" | "AO4"
             lens: "all" | "character" | "narrative" | "structure" | "examFit"
             selectedThemes: string[]
             expandedIds: Set<string>
             printMode: "compact" | "cards" | "teacher"
        -> derived filtered rows
        -> desktop table, mobile accordion cards, print layouts, Builder handoff

Direct route still exists
  App route /compare
    -> Compare
      -> useContent()
        -> ContentProvider
          -> localContentBundle initially
          -> loadContent()
            -> supabase.from("comparative_matrix").select("*")
            -> fallback to src/data/seed.ts if remote empty/error
      -> static read-only comparative routes list

Related consumers
  Library Comparison, Retrieval Toolkit, Essay Builder, paragraphEngine,
  admin audit/inspector, and staged-change allowlist also read or adapt
  comparative_matrix rows.
```

Filter state lives in `ComparativeMatrix` component state only. It is not in URL params, context, or persisted storage. `/compare` has no local filter state.

## 4. Current behaviour summary

- Search filters the interactive `/matrix` row set by joining all `Row` values, including arrays, into a lower-cased string.
- AO buttons are exclusive: `All AOs`, `AO2`, `AO3`, and `AO4` set a single `aoFilter` value. AO1 is not exposed as a filter.
- AO2/AO3/AO4 filtering uses `hasText(row[aoKey])`, so whitespace-only AO content is not enough to match.
- Selecting AO2/AO3/AO4 deactivates `All AOs`; selecting `All AOs` clears the AO-specific filter.
- Secondary lens controls change visible columns, not the row set. `All details` restores all default columns.
- AO and secondary lens compose at the visible-column level.
- AO and search compose in the `filtered` memo.
- Theme chips use OR semantics and compose with search. AO+theme composition is implemented by the filter pipeline, but not directly tested.
- `Clear filters` resets `query`, `aoFilter`, `lens`, and `selectedThemes`; it does not reset `expandedIds`, `printMode`, `copiedId`, loaded rows, loading state, or errors.
- `Expand all` expands only the currently filtered row IDs. `Collapse all` clears all expanded IDs.
- Compact print mode maps the filtered row set through the desktop table. Revision-card print mode maps the filtered row set through the mobile/card layout. Teacher print mode maps all `rows`, ignoring current filters.
- Mobile/tablet layout is an accordion card list under `lg`; desktop layout is a horizontally scrollable table from `lg` upward.
- `/compare` is a separate, read-only page. It hides empty AO/detail sections using `hasText`, but does not provide the matrix filters.

## 5. Findings table

| ID | Severity | Area | Finding | Evidence | Recommended action |
| --- | --- | --- | --- | --- | --- |
| CF-001 | high | Correctness / IA | There are two Compare surfaces with different data paths: nav goes to `/matrix`, while `/compare` remains routed and renders a separate read-only page through ContentProvider. This can produce inconsistent rows and behaviour. | `src/components/AppShell.tsx:17`, `src/App.tsx:90`, `src/App.tsx:98`, `src/components/ComparativeMatrix.tsx:76`, `src/pages/Compare.tsx:8` | Choose one canonical Compare route, redirect or remove the other, and share one data-loading/filtering layer. |
| CF-002 | high | Print / filtering | Teacher print mode ignores active filters because it renders `rows.map`, not `filtered.map`. A student can filter to AO2/theme/search and print an unrelated full teacher pack. | `src/components/ComparativeMatrix.tsx:552`, `src/components/ComparativeMatrix.tsx:554` | Use the filtered row set for teacher print, or clearly separate and label "full unfiltered teacher pack" with tests. |
| CF-003 | medium | Data correctness | `/compare` uses ContentProvider data from `supabase.from("comparative_matrix").select("*")` without `is_active` filtering or `sort_order`, unlike `/matrix`. | `src/lib/contentRepo.ts:182`, `src/lib/contentRepo.ts:245`, `src/pages/Compare.tsx:27`, `src/components/ComparativeMatrix.tsx:81` | Normalize the content repository query to the same active/order contract, or make `/compare` consume the same matrix loader. |
| CF-004 | medium | Mobile / data rendering | Mobile cards render AO, thesis, and meta blocks unconditionally, so sparse rows display empty labelled sections. | `src/components/ComparativeMatrix.tsx:488`, `src/components/ComparativeMatrix.tsx:512`, `src/components/ComparativeMatrix.tsx:520`, `src/components/ComparativeMatrix.tsx:611`, `src/components/ComparativeMatrix.tsx:622` | Gate each mobile AO/detail block with `hasText`, matching `/compare`, or provide explicit unavailable copy. |
| CF-005 | medium | Data rendering | Desktop All-AOs table can show empty AO cells for rows with missing AO content; empty content is suppressed only by AO-specific row filtering. | `src/components/ComparativeMatrix.tsx:397`, `src/components/ComparativeMatrix.tsx:443`, `src/components/ComparativeMatrix.tsx:448` | Avoid rendering blank AO cells, or add a deliberate placeholder and tests for sparse rows. |
| CF-006 | medium | Accessibility | The search input has no label or `aria-label`; placeholder text is doing the naming work. | `src/components/ComparativeMatrix.tsx:278`, `src/components/ComparativeMatrix.tsx:281`, `src/components/ComparativeMatrix.tsx:282` | Add a visible or visually hidden label, then test by role/name instead of placeholder. |
| CF-007 | medium | Accessibility | The print-mode `<select>` has no accessible label. | `src/components/ComparativeMatrix.tsx:322`, `src/components/ComparativeMatrix.tsx:325` | Add a label or `aria-label` such as "Print layout". |
| CF-008 | medium | Mobile usability | Many mobile controls appear below the 44x44 tap-target guideline, including AO/lens pills, theme chips, expand/collapse buttons, and row action buttons. | `src/components/ComparativeMatrix.tsx:290`, `src/components/ComparativeMatrix.tsx:306`, `src/components/ComparativeMatrix.tsx:317`, `src/components/ComparativeMatrix.tsx:350`, `src/components/ComparativeMatrix.tsx:430`, `src/components/ComparativeMatrix.tsx:530` | Add mobile min-height/min-width or responsive padding for all interactive controls. |
| CF-009 | medium | Mobile interaction | The filter toolbar has `z-40`, while the sticky app header uses `z-30`. When content scrolls under the sticky header, page controls can stack above global navigation. The test currently blesses this class. | `src/components/AppShell.tsx:35`, `src/components/ComparativeMatrix.tsx:268`, `src/components/ComparativeMatrix.tsx:271`, `src/components/ComparativeMatrix.test.tsx:128` | Revisit the stacking contract with real scrolling verification; do not assert a higher z-index than the app shell unless intentionally sticky. |
| CF-010 | medium | Test coverage / mobile | No Playwright or real mobile viewport setup exists. The mobile coverage is jsdom/class-based only. | `package.json:87`, `package.json:110`, `vitest.config.ts:8`, `vitest.config.ts:11` | Add later e2e/mobile viewport coverage for `/matrix` layout, tap targets, sticky header, and print controls. |
| CF-011 | medium | Test coverage / filtering | Tests cover AO+search and theme+search, but not AO+theme composition directly. | `src/components/ComparativeMatrix.test.tsx:241`, `src/components/ComparativeMatrix.test.tsx:472`, `src/components/ComparativeMatrix.test.tsx:512` | Add a test that selects an AO and one or more theme chips and asserts the exact remaining rows. |
| CF-012 | medium | Test coverage / accessibility | Tests do not assert accessible names for the search input or print-mode select. The search test queries by placeholder. | `src/components/ComparativeMatrix.test.tsx:184`, `src/components/ComparativeMatrix.test.tsx:306` | Add role/name assertions for textbox and combobox, then avoid placeholder-only tests. |
| CF-013 | low | Filtering behaviour | Secondary lens controls are named like filters but only change visible columns. They do not filter rows by non-empty character/narrative/structure/exam-fit content. | `src/components/ComparativeMatrix.tsx:183`, `src/components/ComparativeMatrix.tsx:204`, `src/components/ComparativeMatrix.tsx:575` | Rename them as view/detail controls or implement row-level filtering if that is the intended product behaviour. |
| CF-014 | low | Interaction state | `Clear filters` does not reset expanded rows or print mode. That may be correct, but it is not asserted clearly. | `src/components/ComparativeMatrix.tsx:222`, `src/components/ComparativeMatrix.tsx:227` | Decide and test whether "clear" should reset only filters or the whole matrix view state. |
| CF-015 | low | Accessibility | Row action buttons use only `row.theme` in their accessible labels. Duplicate axes can create duplicate button names. The tests intentionally include duplicate axes. | `src/components/ComparativeMatrix.tsx:429`, `src/components/ComparativeMatrix.tsx:436`, `src/components/ComparativeMatrix.test.tsx:8`, `src/components/ComparativeMatrix.test.tsx:23` | Include a subtitle, row id, or unique route descriptor in action labels. |
| CF-016 | low | Data labels | Theme chip labels in `/matrix` are hand-formatted by replacing hyphens only. Seed labels already define canonical labels and include underscore IDs such as `narrative_authority`. | `src/components/ComparativeMatrix.tsx:131`, `src/components/ComparativeMatrix.tsx:134`, `src/data/seed.ts:13`, `src/data/seed.ts:31` | Reuse the canonical theme-label map or a shared label helper. |
| CF-017 | low | Search correctness | Search joins all object values, so it also searches technical ids and raw theme slugs, not just visible educational content. | `src/components/ComparativeMatrix.tsx:197`, `src/components/ComparativeMatrix.tsx:203` | Search a curated list of meaningful fields, or document hidden-field matching as intentional. |
| CF-018 | observation | Deployment resilience | `/matrix` fetches Supabase directly and has no local seed fallback, while `/compare` uses ContentProvider fallback. A Supabase read error leaves `/matrix` in an error state. | `src/components/ComparativeMatrix.tsx:76`, `src/components/ComparativeMatrix.tsx:86`, `src/lib/ContentProvider.tsx:11`, `src/lib/contentRepo.ts:214` | Consider sharing the ContentProvider fallback or a dedicated matrix repository for deployment resilience. |
| CF-019 | observation | AO5 safety | Active Compare code does not add AO5 controls, but latent AO5 references exist in guard/test/report contexts. The validator classifies them as allowed and reports zero blocked AO5 references. | `supabase/migrations/20260528004217_backfill_comparative_matrix_mock_row_themes.sql:41`, `supabase/migrations/20260528004217_backfill_comparative_matrix_mock_row_themes.sql:181`, `src/components/ComparativeMatrix.test.tsx:341`, `src/components/ComparativeMatrix.test.tsx:591` | Keep validator coverage; do not remove guardrail references unless the AO policy changes. |
| CF-020 | observation | Data validation | Seed migrations verify AO-content columns are non-null, but not trimmed non-empty. Whitespace-only AO content would pass migration checks while failing UI AO filters. | `supabase/migrations/20260526160000_seed_comparative_matrix_ao_content_themes_7_to_9.sql:130`, `supabase/migrations/20260526160000_seed_comparative_matrix_ao_content_themes_7_to_9.sql:139`, `supabase/migrations/20260526170000_seed_comparative_matrix_ao_content_themes_10_to_15.sql:220` | Add non-empty validation to dry-run/import validation, not as an ad hoc UI patch. |
| CF-021 | low | Test quality | Several tests assert implementation styling classes such as `bg-ink`, `text-paper`, and `z-40`; these can preserve risky CSS rather than user-visible behaviour. | `src/components/ComparativeMatrix.test.tsx:124`, `src/components/ComparativeMatrix.test.tsx:134`, `src/components/ComparativeMatrix.test.tsx:157` | Prefer behaviour, computed accessibility state, or visual/e2e assertions over class-name lock-in. |

## 6. Mobile interaction findings

- Viewport metadata is present with `viewport-fit=cover`: `index.html:5`.
- The app shell uses `min-h-dvh`, which is generally safer than fixed `100vh` for mobile address-bar resizing: `src/components/AppShell.tsx:34`.
- The primary nav is horizontally scrollable: `src/components/AppShell.tsx:81`. This avoids clipping but can hide the Compare entry off-screen on narrow devices.
- The matrix toolbar is not sticky, but it has `relative z-40` inside a page below a `sticky top-0 z-30` app header. That is a stacking risk when scrolled.
- No invisible overlay or `pointer-events:none` wrapper was found in the matrix toolbar.
- The desktop matrix uses `overflow-x-auto` only for the `lg:block` table. Mobile/tablet gets cards instead, which avoids the main horizontal table-scroll risk.
- Mobile card article wrappers use `overflow-hidden`. This is acceptable for rounded borders, but the inside controls need tap-target review.
- Multiple controls are visually small on mobile (`py-0.5`, `py-1`, or `py-1.5`), below 44x44 tap-target guidance.
- No Playwright/mobile viewport setup was found. No real-device or browser mobile audit was run.

## 7. Accessibility findings

- AO, lens, and theme toggle buttons use `aria-pressed`, and the mobile accordion uses `aria-expanded`/`aria-controls`.
- The filter toolbar has a region label: `role="region"` and `aria-label="Comparative matrix filters"`.
- The search input lacks an explicit label or accessible name beyond placeholder copy.
- The print mode combobox lacks an accessible label.
- Buttons have visible text or `aria-label`, but duplicate row axes can create duplicate row action names.
- No global `outline: none` reset was found in `src/index.css`; input/select controls add focus rings. Most buttons rely on browser default focus styling rather than an explicit focus-visible treatment.
- No key traps or manual `tabIndex` risks were found in the audited matrix component.
- Within the toolbar, AO and lens button visible names are unique. Theme buttons are unique when theme labels are unique.

## 8. Filtering / data correctness findings

- AO filters map correctly to fields: `AO2 -> ao2`, `AO3 -> ao3`, `AO4 -> ao4`.
- AO filters use trimmed content via `hasText`, so filtering is meaningful rather than based on field existence alone.
- Theme filtering uses OR semantics across selected themes.
- Search composes after AO and theme filtering.
- Secondary lens controls change visible columns only; they do not filter rows.
- Desktop and mobile/card views render the same filtered row set.
- Teacher print mode does not render the same logical row set because it uses `rows`, not `filtered`.
- Empty/null AO fields are mapped to empty strings in `/matrix`; sparse rows do not crash, but mobile cards and desktop all-AO cells can still render empty labelled content.
- `/compare` handles empty AO/detail content more defensively than `/matrix` by using `hasText` before rendering sections.
- `/compare` and `/matrix` can disagree on active row set and ordering because they load data differently.

## 9. Test coverage assessment

| Behaviour / accessibility item | Covered? | Evidence / gap |
| --- | --- | --- |
| Search input filters rows | yes | `src/components/ComparativeMatrix.test.tsx:178`, `src/components/ComparativeMatrix.test.tsx:241` |
| AO buttons exist as All AOs/AO2/AO3/AO4 only | yes | `src/components/ComparativeMatrix.test.tsx:103`, `src/components/ComparativeMatrix.test.tsx:141`, `src/components/ComparativeMatrix.test.tsx:591` |
| AO buttons are exclusive and deactivate All AOs | yes | `src/components/ComparativeMatrix.test.tsx:103`, `src/components/ComparativeMatrix.test.tsx:141` |
| All AOs clears AO-specific filter | yes | `src/components/ComparativeMatrix.test.tsx:168` |
| Secondary lens controls operate | partial | Clickability and column projection covered at `src/components/ComparativeMatrix.test.tsx:201` and `src/components/ComparativeMatrix.test.tsx:221`; no row-filter expectation because implementation is projection only. |
| AO + secondary lens composition | yes | `src/components/ComparativeMatrix.test.tsx:221` |
| AO + search composition | yes | `src/components/ComparativeMatrix.test.tsx:241` |
| AO + theme chip composition | no | Theme+search and AO+search are covered separately; no direct AO+theme test. |
| Theme chip filtering and reset | yes | `src/components/ComparativeMatrix.test.tsx:452`, `src/components/ComparativeMatrix.test.tsx:472` |
| Clear filters reset semantics | partial | Search/result count covered at `src/components/ComparativeMatrix.test.tsx:401`; theme+search empty-state reset covered at `src/components/ComparativeMatrix.test.tsx:512`; no assertion for lens, AO button state, expanded rows, or print mode. |
| Expand all / collapse all | yes | `src/components/ComparativeMatrix.test.tsx:382` |
| Compact / revision-card / teacher print mode switching | partial | Labels and class toggles covered at `src/components/ComparativeMatrix.test.tsx:297` and `src/components/ComparativeMatrix.test.tsx:315`; no test that teacher mode respects filters. |
| Print output row set | partial | Print classes covered, but teacher print row-set bug is untested. |
| Mobile card layout | partial | Accordion expand/collapse and mobile handoff are covered in jsdom at `src/components/ComparativeMatrix.test.tsx:349` and `src/components/ComparativeMatrix.test.tsx:642`; no mobile viewport/browser render. |
| Accessible button names | partial | Copy/send/theme reset labels covered; search/select labels not covered. |
| `aria-pressed` on toggles | yes | `src/components/ComparativeMatrix.test.tsx:110`, `src/components/ComparativeMatrix.test.tsx:147`, `src/components/ComparativeMatrix.test.tsx:466` |
| Filter toolbar landmark/label | yes | `src/components/ComparativeMatrix.test.tsx:134` |
| Keyboard navigability | no | No tab-order or keyboard interaction tests beyond native click events. |
| Visible focus states | no | No focus-visible or computed style checks. |
| Labels for search input | no | Input queried by placeholder at `src/components/ComparativeMatrix.test.tsx:184`; no role/name assertion. |
| No duplicate accessible names in toolbar | partial | Unique static buttons are implicit; no automated duplicate-name audit. |
| AO5 absence | yes | `src/components/ComparativeMatrix.test.tsx:341`, `src/components/ComparativeMatrix.test.tsx:591`, `src/pages/Compare.test.tsx:42`, `npm run validate:component2-ao` |

Recommended tests to add later:

- AO+theme chip composition with an exact expected row set.
- Teacher print mode after AO/search/theme filters.
- Sparse-row rendering should not show empty AO/detail cards.
- Search textbox and print select must be discoverable by role and accessible name.
- Mobile viewport smoke for `/matrix` at common widths, with sticky header and tap-target checks.

## 10. Recommended follow-up PRs

Urgent:

- Unify `/matrix` and `/compare` or redirect one to the other so there is one canonical Compare experience and data contract.
- Fix teacher print mode so it respects the same logical filtered row set, or explicitly rename it as a full unfiltered export.
- Add labels for the search input and print-mode select.

Important:

- Suppress or intentionally annotate empty AO/detail sections in mobile and desktop layouts.
- Add mobile viewport/e2e coverage for `/matrix`, including sticky header overlap and tap target sizing.
- Add AO+theme and teacher-print tests.
- Normalize `comparative_matrix` loading through one repository path with `is_active` and `sort_order`.

Polish:

- Rename secondary lens controls if they are view controls, not filters.
- Use canonical theme labels for matrix theme chips.
- Reduce implementation-detail assertions in tests.
- Make duplicate row action names unique for screen-reader users.

## 11. Commands run and results

| Command | Exit code | Result |
| --- | ---: | --- |
| `git checkout main` from `/Users/tarwindersaran/Downloads/A-Level English Literature CODEX` | 128 | Failed before repo discovery: `fatal: not a git repository (or any of the parent directories): .git`. Continued after locating `prose-prep/.git`. |
| `git checkout main` from repo root | 0 | Already on `main`; branch up to date with `origin/main`. |
| `git pull --ff-only` | 0 | Already up to date. Also fetched remote branch `origin/audit/compare-feature`. |
| `git checkout -b audit/compare-feature` | 0 | Created and switched to `audit/compare-feature`. |
| `npm run typecheck` | 0 | Passed: `tsc --noEmit`. |
| `npm run lint` | 0 | Passed with 24 warnings, 0 errors. Warnings are existing React hooks / fast-refresh warnings in files such as `ParagraphEngine.tsx`, admin components, UI components, contexts, and library pages. |
| `npm run test -- src/components/ComparativeMatrix.test.tsx` | 0 | Passed: 1 file, 24 tests. |
| `npm run test` | 0 | Passed: 43 files passed, 1 skipped; 427 tests passed, 3 skipped. |
| `npm run validate:component2-ao` | 0 | Passed. Files scanned: 146. Allowed AO5 references: 159. Blocked AO5 references: 0. Optional staging folders missing: `data/component2`, `data/component2_exports`, `imports/component2`. |
| `git diff --check` | 0 | Passed with no whitespace errors. |

No requested package script was missing.

## 12. Supabase safety confirmation

No Supabase write or migration commands were run.

Specifically, this audit did not run `supabase db push`, `supabase db pull`, `supabase db reset`, `supabase migration up`, `supabase migration repair`, `supabase migration new`, any remote schema/data mutation, or any write-capable `psql` command. Supabase inspection was limited to reading local source, generated types, function code, validation scripts, and migration SQL files. No migration, schema, seed, or `.env` files were changed.

Client-side secret review found the audited Compare code using the existing browser Supabase client with `VITE_SUPABASE_URL` and anon/publishable key only: `src/integrations/supabase/client.ts:4`.

## 13. AO5 safety confirmation

No AO5 logic was introduced.

The interactive filter UI exposes `All AOs`, `AO2`, `AO3`, and `AO4` only: `src/components/ComparativeMatrix.tsx:39`. AO1 remains absent from filter buttons, as required. Active Compare feature rendering uses AO2/AO3/AO4 fields only.

Latent AO5 references exist as guardrails/tests/reports rather than active feature logic. Examples include the AO5 guard in `supabase/migrations/20260528004217_backfill_comparative_matrix_mock_row_themes.sql:181` and AO5 absence tests in `src/components/ComparativeMatrix.test.tsx:341` and `src/components/ComparativeMatrix.test.tsx:591`.

`npm run validate:component2-ao` passed with `Blocked AO5 references: 0`.

## 14. Appendix: full findings list

No appendix is needed because the findings table contains the full findings list and has fewer than 25 entries.
