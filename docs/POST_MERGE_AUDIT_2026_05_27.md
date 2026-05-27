# Post-Merge Audit - 2026-05-27

## Executive summary

Main is current with `origin/main` at `f1918f9` (`feat(matrix): add comparative matrix filters and print modes (#52)`). The AO route-engine recovery and Comparative Matrix layout-print work are present on main, full validation passes, and no active Component 2 AO5 functionality was found in the merged AO route-engine or Comparative Matrix paths.

The app state is safe to proceed from a validation and feature-integration perspective. One repository hygiene caveat remains: before this audit report was created, `git status --short` already showed an unrelated untracked file, `docs/CODEX_AUDIT_REPORT_VERIFICATION_2026_05_25.md`. This audit did not remove or modify that file.

No Supabase commands were run. No migrations were created or applied. No source files were modified.

## Branch and PR status

- `git switch main`: succeeded.
- `git pull --ff-only origin main`: succeeded and fast-forwarded local main to `f1918f9`.
- `git status --short`: showed pre-existing untracked `docs/CODEX_AUDIT_REPORT_VERIFICATION_2026_05_25.md`.
- `git log --oneline --decorate --graph -12`: shows `f1918f9` at `HEAD -> main, origin/main, origin/HEAD`.
- `git diff --name-only origin/main...HEAD`: no output, so local main has no diff against origin/main.
- `gh pr view 52 --json number,title,state,mergeCommit,url`: PR #52 is `MERGED`, merge commit `f1918f959d83f26b45d0c5ecf962e40b9634bfbb`.
- `gh pr view 50 --json number,title,state,url`: PR #50 is `CLOSED`.
- Additional PR #50 check: `mergedAt` and `mergeCommit` are `null`, confirming it was not merged.

Branch checks:

- `feat/matrix-layout-print-modes-clean` is absent locally and remotely.
- `origin/feat/ao-route-engines-recovery` still exists.
- `feat/ao-route-engines-recovery` was not deleted or modified.
- `git branch -r | grep "matrix-layout"` still shows `origin/feat/matrix-layout-print-modes`, an older non-clean branch associated with closed PR #50. This is separate from the deleted `feat/matrix-layout-print-modes-clean` branch.

## Validation command results

| Command | Result | Details |
| --- | --- | --- |
| `npm run test -- src/components/ComparativeMatrix.test.tsx` | Pass | 1 file passed, 5 tests passed |
| `npm run test -- src/pages/EssayBuilder.test.tsx` | Pass | 1 file passed, 1 test passed |
| `npm run test` | Pass | 39 files passed, 1 file skipped; 351 tests passed, 3 skipped |
| `npm run typecheck` | Pass | `tsc --noEmit` exited 0 |
| `npm run lint` | Pass with warnings | 0 errors, 24 warnings |
| `npm run build` | Pass with warnings | Build completed in 3.61s |

Lint warnings:

- 24 warnings, 0 errors.
- Warning files were not part of the `b520333..HEAD` AO/matrix merge diff, so they appear pre-existing relative to this merge set.
- Warnings are primarily `react-hooks/exhaustive-deps` and `react-refresh/only-export-components`.

Build warnings:

- Browserslist data is 11 months old.
- Vite warns that `dist/assets/index-BNCcGqyd.js` is larger than 500 kB after minification.
- These warnings did not cause a non-zero exit.

## File-scope findings

Expected files are present on main:

- `src/components/ComparativeMatrix.tsx`
- `src/components/ComparativeMatrix.test.tsx`
- `src/pages/EssayBuilder.tsx`
- `docs/AO1_CONCEPT_ROUTE_ENGINE.md`
- `docs/AO2_METHOD_ROUTE_ENGINE.md`
- `docs/AO3_CONTEXT_ROUTE_ENGINE.md`
- `docs/AO4_COMPARATIVE_ROUTE_ENGINE.md`
- `docs/AO_ROUTE_COMBINATION_ENGINE.md`
- `src/types/ao1ConceptRoutes.ts`
- `src/types/ao2MethodRoutes.ts`
- `src/types/ao3ContextRoutes.ts`
- `src/types/ao4ComparativeRoutes.ts`
- `src/types/aoRouteCombinations.ts`
- `src/data/ao1ConceptRoutes.ts`
- `src/data/ao2MethodRoutes.ts`
- `src/data/ao3ContextRoutes.ts`
- `src/data/ao4ComparativeRoutes.ts`
- `src/data/aoRouteCombinations.ts`
- `src/lib/ao1ConceptRoutes.ts`
- `src/lib/ao2MethodRoutes.ts`
- `src/lib/ao3ContextRoutes.ts`
- `src/lib/ao4ComparativeRoutes.ts`
- `src/lib/aoRouteCombinations.ts`
- AO panel components and tests for AO1, AO2, AO3, AO4, and route combinations.

Route data counts observed by local inspection:

- AO1 concept routes: 24.
- AO2 method routes: 24.
- AO3 context routes: 24.
- AO4 comparative routes: 24.
- AO route combinations: 10.

## AO compliance findings

Broad search command:

```bash
rg "AO5|ao5" src docs --glob '!node_modules'
```

Interpretation:

- The broad search finds historical docs and guardrail tests that mention AO5.
- Defensive tests explicitly assert AO5 absence in Component 2 UI/data paths.
- Non-test source search found one guardrail sentence in `src/lib/prose/annotatedEssays.ts` stating that Component 2 uses AO1, AO2, AO3 and AO4 and does not create AO5 scoring fields.
- Targeted checks of `index.html`, `src/components/ComparativeMatrix.tsx`, `src/pages/EssayBuilder.tsx`, AO route data/lib/types, AO panels, and AO route docs found no active AO5 UI labels, filters, scoring, route logic, database fields, or validation requirements in the merged Component 2 AO route-engine and Comparative Matrix functionality.

Conclusion: AO5 is absent from active Component 2 functionality checked in this audit. Remaining AO5 mentions are historical documentation or tests/guardrails asserting AO5 absence.

## UI route visibility findings

- `src/App.tsx` imports and routes `EssayBuilder` at `/builder`.
- `src/App.tsx` imports and routes `ComparativeMatrix` at `/matrix`.
- `src/App.tsx` redirects `/build` to `/builder`.
- `src/components/AppShell.tsx` exposes `/builder` as `Plan`.
- `src/components/AppShell.tsx` exposes `/matrix` as `Compare`.
- `src/pages/EssayBuilder.tsx` integrates AO route combinations via `AoRouteCombinationPanel` and `getResolvedAoRouteCombination`.
- `src/pages/EssayBuilder.tsx` integrates AO3 route selection via `Ao3ContextRoutePanel`.
- `src/components/ComparativeMatrix.tsx` remains a separate `/matrix` tool and does not import the AO route-combination engine.
- No broken imports were reported by typecheck, lint, test, or build.
- No duplicate conflicting route for `/matrix` or `/builder` was found in `src/App.tsx`.

## Comparative Matrix findings

Confirmed in `src/components/ComparativeMatrix.tsx`:

- AO filter state is limited to `all | ao2 | ao3 | ao4`.
- AO filter buttons render only `All AOs`, `AO2`, `AO3`, and `AO4`.
- Search is applied after AO filtering in the `filtered` memo.
- Print modes are `compact`, `cards`, and `teacher`.
- Print button label reflects the active print mode: `Print compact matrix`, `Print revision cards`, or `Print teacher pack`.
- Duplicate themes are distinguishable through `getSubtitle(row.hardTimes, row.atonement)`.
- Supabase select includes `ao2`, `ao3`, and `ao4`, with no AO5 field selected or rendered.

Confirmed in `src/components/ComparativeMatrix.test.tsx`:

- Result count uses `comparative routes`.
- Duplicate-theme subtitles are covered.
- AO2 filtering is covered.
- Print button label updates for `cards` and `teacher`.
- AO5 absence is covered.

Test coverage note:

- The code confirms that search runs after AO filtering, but the current test file does not include a dedicated test that combines an AO filter with a search query.
- The test covers the print button label, but not the print CSS layout branches themselves.

## AO route-engine findings

Confirmed architecture:

- `src/types/ao1ConceptRoutes.ts` defines AO1 concept route shape.
- `src/types/ao2MethodRoutes.ts` defines AO2 method route shape.
- `src/types/ao3ContextRoutes.ts` defines AO3 context route shape.
- `src/types/ao4ComparativeRoutes.ts` defines AO4 comparative route shape.
- `src/types/aoRouteCombinations.ts` composes AO1, AO2, AO3, and AO4 routes only.
- `src/lib/aoRouteCombinations.ts` resolves:
  - AO1 via `getAo1ConceptRouteById`
  - AO2 via `getAo2MethodRouteById`
  - AO3 via `getAo3ContextRouteById`
  - AO4 via `getAo4ComparativeRouteById`
- `src/lib/aoRouteCombinations.test.ts` verifies source-locked AO1, AO2, AO3, and AO4 resolution and asserts the combination dataset does not contain AO5.

The 10 required pilot combinations are present:

- Childhood
- Education
- Class
- Truth and Deception
- Gender / Women
- Setting / Place
- War / Industrialism
- Guilt / Responsibility
- Memory / Authorship
- Marriage / Relationships

No AO5 route engine or AO5 combination logic was found in the AO route-engine files checked.

## Recovery branch recommendation

Commands run:

```bash
git branch -r | grep "feat/ao-route-engines-recovery" || true
git log --oneline --decorate --graph main..origin/feat/ao-route-engines-recovery | head -40
git diff --name-status main..origin/feat/ao-route-engines-recovery | head -120
git cherry -v main origin/feat/ao-route-engines-recovery
```

Findings:

- `origin/feat/ao-route-engines-recovery` exists.
- `git cherry -v` marks the six AO route-engine recovery commits as patch-equivalent to main.
- The recovery branch still contains `d7c7db4 feat(matrix): redesign comparative matrix layout and print modes`, which appears in closed PR #50 history.
- `git diff --name-status main..origin/feat/ao-route-engines-recovery` shows differences only in:
  - `src/components/ComparativeMatrix.tsx`
  - `src/components/ComparativeMatrix.test.tsx`

Recommendation: A. Keep `feat/ao-route-engines-recovery` as an archive for now. The AO route-engine work appears safely represented on main, and the remaining branch-specific matrix differences are tied to closed PR #50 history rather than the clean merged PR #52, but manual confirmation should happen before deletion.

## Risks, warnings, and follow-up tasks

- Resolve or intentionally keep the pre-existing untracked file `docs/CODEX_AUDIT_REPORT_VERIFICATION_2026_05_25.md`; it prevents a fully clean `git status --short`.
- Consider adding a Comparative Matrix test that combines AO filtering with search to lock the observed filter-then-search ordering.
- Consider adding a print-mode rendering test if layout regressions become likely.
- Existing lint warnings remain outside the merged AO/matrix files.
- Build still reports Browserslist age and chunk-size warnings.
- Do not delete `feat/ao-route-engines-recovery` yet.

## Final recommendation

Safe to proceed with the merged main app state.

The validation suite passes, PR #52 is merged, PR #50 is closed and unmerged, AO1-AO4 route engines resolve coherently, Comparative Matrix remains reachable and Component 2 scoped, and no active AO5 leakage was found in the checked Component 2 functionality.
