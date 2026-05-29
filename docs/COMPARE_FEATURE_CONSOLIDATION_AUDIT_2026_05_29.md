# Compare Feature Consolidation Audit - 2026-05-29

## Current Feature Status

Status: stable after the PR #95-#103 consolidation run.

The Compare feature is now canonicalised at `/matrix`, with legacy `/compare` traffic redirected through `src/pages/Compare.tsx`. The student navigation in `AppShell` points directly to `/matrix`. The active Component 2 Comparative Matrix covers Hard Times and Atonement with AO2, AO3, and AO4 filtering only.

The current implementation in `src/components/ComparativeMatrix.tsx` uses one shared filtered row set for the visible matrix, mobile/revision-card view, compact print, Teacher Pack print, expansion controls, and print status copy. Empty or whitespace-only optional values are handled by shared `hasText` checks so labelled empty sections are suppressed in mobile, copy export, and Teacher Pack output while desktop table cells keep an accessible fallback.

## Confirmed Behaviours

- `/matrix` remains the canonical Compare route.
- `/compare` still redirects to `/matrix` with `replace`.
- AppShell's Compare navigation points to `/matrix`.
- AO filters are limited to All AOs, AO2, AO3, and AO4.
- AO2/AO3/AO4 filters retain only rows with meaningful text in the corresponding AO field.
- AO5 is absent from active Component 2 UI, filter options, row model, print output, copy export, Essay Builder handoff metadata, and student-facing copy.
- Search filters across row values, including theme arrays.
- Theme chips are derived from row data, use OR semantics, and can be reset independently or via Clear filters.
- Secondary lenses remain clickable and affect visible columns without changing the underlying filtered row set.
- Copy export omits whitespace-only labelled sections and includes comparative tension where present.
- Essay Builder handoff uses the selected row and carries AO2/AO3/AO4, comparative tension, thesis, themes, and text-specific argument metadata.
- Compact print, revision cards, and Teacher Pack print all render from `filtered`, preserving PR #102 behaviour.
- Teacher Pack no-results output shows: `No routes match the current filters. Clear filters before printing.`
- Print status copy is shown from the same filtered count:
  - `Printing 1 filtered route`
  - `Printing N filtered routes`
  - `No routes match the current filters`
- `Clear filters before printing` appears only when AO/search/theme filters are active and restores the full row set.
- Sparse-row suppression remains intact for mobile cards, Teacher Pack print, copy export, and Essay Builder handoff checks.
- Toolbar controls retain larger mobile tap targets, focus-visible styles, accessible search and print-layout labels, and the z-index stacking fix.

## Test Coverage Summary

Reviewed tests:

- `src/components/ComparativeMatrix.test.tsx`
- `src/pages/Compare.test.tsx`
- `src/components/AppShell.test.tsx`

Coverage is strong for the consolidation surface:

- AO2/AO3/AO4 filters and All AOs reset.
- Search and combined AO/search filtering.
- Theme chip filtering, OR semantics, reset themes, and clear-filters composition.
- Secondary lens controls and AO-column narrowing.
- Mobile toolbar stacking and touch/focus affordances.
- Accessible labels for search and print layout.
- Print layout switching.
- Filtered print count after AO, search, and theme filters.
- Print-toolbar clear-filters affordance.
- Teacher Pack respecting AO/search/theme filtered rows.
- Teacher Pack no-results state.
- Comparative tension display.
- Empty-content and whitespace-only suppression.
- Copy export content and AO5 absence.
- Essay Builder handoff content and AO5 absence.
- `/compare` redirect and AppShell `/matrix` navigation.

Validation commands run:

- `npm run test -- src/components/ComparativeMatrix.test.tsx` - passed, 38 tests
- `npm run test -- src/pages/Compare.test.tsx` - passed, 1 test
- `npm run test -- src/components/AppShell.test.tsx` - passed, 1 test
- `npm run typecheck` - passed
- `npm run lint` - passed with 0 errors and the existing warning-only baseline
- `npm run validate:component2-ao` - passed, blocked AO5 references: 0
- `git status --short` - showed only this new audit document before commit

## Known Limitations

- Browser/manual verification in this environment is limited by unavailable local Supabase data access. Previous smoke checks reached `/matrix` and confirmed the app shell/nav path, but the matrix data fetch failed with test-only local Supabase values.
- The Comparative Matrix currently fails closed on data-load error rather than falling back to bundled local matrix content. This is acceptable for the current audit but remains a usability risk if Supabase is unavailable.
- Print status is duplicated across toolbar and print-only layout surfaces by design, but there is no visual regression/browser print snapshot coverage for actual browser print rendering.
- The clear-filters action resets the secondary lens as well as AO/search/theme filters. This matches the existing broad Clear filters behaviour, but the newer copy specifically says "before printing", so user expectations may be worth watching.
- The search implementation scans all row values, including metadata-like arrays. This is flexible but not weighted or field-aware.

## Recommended Next PRs

### P0

- None. No serious defect was found that justifies product code changes in this audit PR.

### P1

- Add a data-load resilience pass for the matrix, either by documenting required Supabase local setup more clearly or adding a read-only local fallback for Comparative Matrix content when the remote fetch fails.
- Add a browser/visual print verification path for compact, cards, and Teacher Pack layouts using mocked or local read-only data, so print-only status and sparse-row rendering can be verified outside jsdom.

### P2

- Consider splitting "Clear filters" from "Reset view" semantics if teachers expect `Clear filters before printing` to preserve the selected secondary lens.
- Add focused tests for `formatComparativeRouteExport` and `createMatrixRouteBuilderHandoff` as exported or separately testable helpers if this component continues to grow.
- Add field-aware search affordances later if users struggle to understand why a row matched a broad query.

## Safety Confirmations

- No Supabase write operations were run.
- No Supabase migration, schema, seed, or remote DB mutation commands were run.
- No AO5 logic, UI, fields, scoring, validation requirements, or student-facing copy were introduced.
- This PR is documentation-only.
