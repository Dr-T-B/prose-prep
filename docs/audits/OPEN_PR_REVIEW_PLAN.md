# Open PR Review and Merge Plan

## Executive summary

Recommended immediate action: treat PR #97 as the master Compare audit, but do not merge it until it is edited to acknowledge that PR #95 and PR #96 already fixed the AO filter state and known mobile tap interception issues.

Safe to merge immediately: none as-is. All seven PRs are docs-only and locally merge cleanly, but several are stale after later merged work. PR #81 and PR #76 remain useful non-Compare supporting docs after minor edits/rebase.

Close as superseded: #56, #57, and #59 should be closed without merge because PR #58, #60, and #61 already landed the data backfill, themes multiselect, and follow-up UX audit. PR #75 should be folded into #97 rather than merged separately.

Safety: no PRs were merged or closed, no Supabase write/migration/db commands were run, and no AO5 logic was introduced.

## Open PR table

| PR | Title | Branch | Draft? | Changed files | Type | Current against main? | Conflicts? | Main topic | Initial recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| #97 | audit(compare): Compare feature audit | `audit/compare-feature` | Yes | `docs/audits/COMPARE_FEATURE_AUDIT.md` | docs | Yes | No | Master Compare feature audit | MERGE AFTER MINOR EDIT |
| #81 | docs(audit): assess questions bank coverage | `audit/questions-bank-coverage` | No | `docs/QUESTIONS_BANK_COVERAGE_AUDIT.md` | docs | No; behind main by 15 commits | No | Questions bank coverage | MERGE AFTER MINOR EDIT |
| #76 | docs(testing): add student testing results template for matrix builder workflow | `docs/student-testing-results-template` | No | `docs/STUDENT_TESTING_MATRIX_BUILDER_WORKFLOW_RESULTS.md` | docs | No; behind main by 19 commits | No | Student testing workflow | MERGE AFTER MINOR EDIT |
| #75 | docs(audit): assess matrix UI action architecture | `audit/matrix-ui-action-architecture` | No | `docs/MATRIX_UI_ACTION_ARCHITECTURE_AUDIT.md` | docs | No; behind main by 19 commits | No | Matrix row actions | SUPERSEDED BY #97 |
| #59 | docs(audit): verify matrix themes filter readiness | `audit/matrix-themes-filter-readiness-after-backfill` | No | `docs/COMPARATIVE_MATRIX_THEMES_FILTER_READINESS_AFTER_BACKFILL.md` | docs | No; behind main by 35 commits | No | Theme filter readiness | CLOSE WITHOUT MERGE |
| #57 | docs(audit): assess comparative matrix mock rows | `audit/matrix-mock-row-normalisation` | No | `docs/COMPARATIVE_MATRIX_MOCK_ROW_NORMALISATION_AUDIT.md` | docs | No; behind main by 35 commits | No | Mock row metadata | CLOSE WITHOUT MERGE |
| #56 | docs(audit): assess comparative matrix themes array | `audit/matrix-themes-array-shape` | No | `docs/COMPARATIVE_MATRIX_THEMES_ARRAY_AUDIT.md` | docs | No; behind main by 35 commits | No | Themes array shape | CLOSE WITHOUT MERGE |

## Cross-PR topic matrix

| Topic | #97 | #81 | #76 | #75 | #59 | #57 | #56 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Compare route architecture | Yes | No | Partial | Partial | No | No | No |
| `/matrix` vs `/compare` | Yes | No | No | No | No | No | No |
| Comparative matrix data shape | Yes | No | Partial | Partial | Yes | Yes | Yes |
| Themes array | Yes | No | No | No | Yes | Yes | Yes |
| Theme filtering | Yes | No | Yes | Partial | Yes | Yes | Yes |
| Mock row quality | Partial | No | No | No | Yes | Yes | Yes |
| UI action architecture | Partial | No | Yes | Yes | No | No | No |
| Question bank coverage | No | Yes | No | No | No | No | No |
| Student testing workflow | Partial | No | Yes | No | No | No | No |
| Mobile/tap behaviour | Yes | No | Yes | Yes | No | No | No |
| Accessibility | Yes | No | Partial | Partial | No | No | No |
| Print modes | Yes | No | Yes | Partial | No | No | No |
| AO filtering | Yes | No | Yes | Partial | Yes | No | Yes |
| AO5 safety | Yes | Yes | Yes, but wording needs care | Yes | Yes | Yes | Yes |
| Supabase safety | Yes | Yes | No DB touch | Yes | Yes | Yes | Yes |

## Detailed PR-by-PR review

### PR #97 `audit(compare): Compare feature audit`

Summary: Adds the broadest and most current Compare audit. It covers `/matrix` and `/compare`, data flow, AO/theme/search filtering, print modes, accessibility, mobile coverage, Supabase safety, and AO5 guardrails.

Files changed: `docs/audits/COMPARE_FEATURE_AUDIT.md`.

Unique useful content: canonical Compare route split finding; teacher print mode ignores filters; `/compare` data path differs from `/matrix`; mobile sparse-row rendering gaps; accessibility gaps for search/select; test coverage matrix.

Overlap with other PRs: overlaps all matrix audit PRs (#56, #57, #59, #75) and should be the master audit. It does not replace #81's questions-bank audit or #76's testing template.

Stale or inaccurate claims: update CF-009/mobile wording so it does not imply PR #96's sticky header/tap interception bug remains unfixed. The remaining point should be framed as "unit tests assert CSS classes; real viewport coverage is still missing." Confirm no wording says AO2/AO3/AO4 buttons do not work; PR #95 fixed that.

AO5 risk: low. The doc correctly treats AO5 references as guardrails/tests, not active feature logic.

Supabase risk: low. It inspects schema/migrations but changes no schema or data.

Test/check status: GitHub checks show Unit tests success, live Supabase integration skipped, Vercel success. Local safe checks passed during this review.

Recommendation: MERGE AFTER MINOR EDIT.

Required action before merge or closure: keep #97 as draft until the stale post-#95/#96 wording is corrected and the useful #75 action-architecture findings are copied in.

### PR #81 `docs(audit): assess questions bank coverage`

Summary: Adds a questions-bank coverage audit explaining why the live Questions page showed 5 active remote rows while the local fallback has broader seed coverage.

Files changed: `docs/QUESTIONS_BANK_COVERAGE_AUDIT.md`.

Unique useful content: useful non-Compare audit covering live-vs-local question coverage, authenticity metadata, official/adapted/mock classifications, and a docs-first expansion path.

Overlap with other PRs: little overlap with #97. It is separate supporting audit material.

Stale or inaccurate claims: main now contains `supabase/migrations/20260528131629_add_question_bank_metadata.sql`, so statements that the schema lacks year, paper code, source type, or authenticity metadata need updating. Any live count claim should be reverified before merge because the branch is 15 commits behind main.

AO5 risk: low; it says expansion must not add AO5.

Supabase risk: low in the PR itself; it is docs-only. Its Option B discusses future Supabase-backed work, so keep the "no migrations/data writes in this audit" wording.

Test/check status: GitHub checks show Unit tests success, live Supabase integration skipped, Vercel success. Local checks passed on current main/review branch.

Recommendation: MERGE AFTER MINOR EDIT.

Required action before merge or closure: rebase, update schema/current-state claims after the question-bank metadata migration, and reverify or remove the exact "5 active rows" live claim.

### PR #76 `docs(testing): add student testing results template for matrix builder workflow`

Summary: Adds a student testing results template for the Matrix-to-Builder workflow.

Files changed: `docs/STUDENT_TESTING_MATRIX_BUILDER_WORKFLOW_RESULTS.md`.

Unique useful content: practical testing rubric for route discovery, filters, Copy route, Send to Essay Builder, card creation/editing, copy/print output, and AO understanding.

Overlap with other PRs: supports #97's test-coverage gaps but is not redundant with it.

Stale or inaccurate claims: none about #95/#96. However, the AO compliance section asks whether the student saw or mentioned AO5; this should be reworded so AO5 is recorded only as "must be absent" and is not presented as an expected student-facing item.

AO5 risk: medium-low as written because the template contains a visible AO5 prompt. It is intended as a negative check, but the wording should be tightened.

Supabase risk: none; docs-only workflow template.

Test/check status: GitHub checks show Unit tests success, live Supabase integration skipped, Vercel success. Local checks passed on current main/review branch.

Recommendation: MERGE AFTER MINOR EDIT.

Required action before merge or closure: rebase and rewrite the AO compliance section to confirm absence of AO5 without normalising AO5 as a student-facing category.

### PR #75 `docs(audit): assess matrix UI action architecture`

Summary: Adds a focused audit of Matrix action buttons, especially Copy route and Send to Essay Builder.

Files changed: `docs/MATRIX_UI_ACTION_ARCHITECTURE_AUDIT.md`.

Unique useful content: identifies duplicated desktop/mobile row action DOM, possible sticky table hit-testing risk, clipboard/localStorage failure modes, silent Builder handoff failure followed by navigation, and weak inline error feedback.

Overlap with other PRs: substantially overlaps #97's Compare audit, but #97 does not fully capture the silent Builder handoff failure or action-component extraction recommendation.

Stale or inaccurate claims: claims about buttons not responding and sticky/tap issues need updating after #96. The report should not imply mobile toolbar taps remain blocked. It also predates #95's clearer AO filter state logic.

AO5 risk: low; no active AO5 logic.

Supabase risk: none; docs-only.

Test/check status: GitHub checks show Unit tests success, live Supabase integration skipped, Vercel success. Local checks passed on current main/review branch.

Recommendation: SUPERSEDED BY #97.

Required action before merge or closure: copy the unique action findings into #97 or a follow-up issue, then close #75 without merge.

### PR #59 `docs(audit): verify matrix themes filter readiness`

Summary: Adds a readiness audit for theme filtering after the planned mock-row backfill.

Files changed: `docs/COMPARATIVE_MATRIX_THEMES_FILTER_READINESS_AFTER_BACKFILL.md`.

Unique useful content: predicted post-backfill distribution table and clear precondition chain for theme multiselect readiness.

Overlap with other PRs: overlaps #56 and #57, and is now superseded by merged PR #58 and merged feature PR #60, plus the merged UX audit #61.

Stale or inaccurate claims: stale. It says PR #58 is open/not merged and that `themes` is not projected by `ComparativeMatrix.tsx`. Main now includes PR #58, PR #60, and PR #61; `ComparativeMatrix.tsx` selects `themes` and has `selectedThemes` filtering.

AO5 risk: low; AO5 appears only as safety/guardrail language.

Supabase risk: historical. It documents read-only REST checks and no writes, but future readers could be confused because the migration is no longer pending.

Test/check status: GitHub checks show Unit tests success, live Supabase integration skipped, Vercel success. Local checks passed on current main/review branch.

Recommendation: CLOSE WITHOUT MERGE.

Required action before merge or closure: no merge. If desired, preserve only the frequency/distribution table as historical context in #97 or the existing #61 UX audit.

### PR #57 `docs(audit): assess comparative matrix mock rows`

Summary: Adds a detailed audit of the ten `mock-*` comparative matrix rows and recommends backfilling canonical themes.

Files changed: `docs/COMPARATIVE_MATRIX_MOCK_ROW_NORMALISATION_AUDIT.md`.

Unique useful content: strong curatorial rationale that the `mock-*` rows are production-quality theme-organised rows rather than throwaway fixtures.

Overlap with other PRs: overlaps #56/#59 and the now-merged data backfill PR #58. #97 already treats the backfill migration as part of current state.

Stale or inaccurate claims: stale as an actionable recommendation. The recommended backfill has already landed in `supabase/migrations/20260528004217_backfill_comparative_matrix_mock_row_themes.sql`.

AO5 risk: low; it explicitly preserves AO1/AO2/AO3/AO4-only rules.

Supabase risk: historical. It proposes a future data-only migration, but that migration has since landed. The PR itself is docs-only.

Test/check status: GitHub checks show Unit tests success, live Supabase integration skipped, Vercel success. Local checks passed on current main/review branch.

Recommendation: CLOSE WITHOUT MERGE.

Required action before merge or closure: no merge. If any content is copied forward, copy only the concise rationale that the rows are production-quality and should remain student-facing.

### PR #56 `docs(audit): assess comparative matrix themes array`

Summary: Adds the original themes-array audit that classified `themes[]` as a weak filter candidate due to 10 untagged `mock-*` rows.

Files changed: `docs/COMPARATIVE_MATRIX_THEMES_ARRAY_AUDIT.md`.

Unique useful content: baseline before the backfill: 30/40 tagged rows, 10 empty `mock-*` rows, controlled vocabulary health.

Overlap with other PRs: superseded by #57 and #59, then by merged #58/#60/#61.

Stale or inaccurate claims: stale. Main now includes the mock-row theme backfill and themes multiselect implementation, so the "defer pending data normalisation" conclusion is no longer current.

AO5 risk: low; it keeps AO5 excluded.

Supabase risk: historical read-only REST check only; no writes in the PR.

Test/check status: GitHub checks show Unit tests success, live Supabase integration skipped, Vercel success. Local checks passed on current main/review branch.

Recommendation: CLOSE WITHOUT MERGE.

Required action before merge or closure: no merge. The pre-backfill baseline can be recovered from Git history if needed.

## Supersession plan

Merge after amendment:

- #97, as the master Compare audit, after updating post-#95/#96 stale wording and copying unique #75 row-action findings.
- #81, after rebasing and updating question-bank schema/current-state claims.
- #76, after rebasing and tightening AO5 absence wording.

Close as superseded:

- #75, after copying unique findings into #97 or a follow-up issue.
- #59, because #58/#60/#61 and #97 supersede it.
- #57, because #58 completed its recommended backfill.
- #56, because #58/#60/#61 moved the theme filter from proposed/deferred to implemented/audited.

Remain open for human decision:

- None required if the above copy-forward edits are made. Human review is only needed if the team wants to preserve older historical audits as standalone docs despite stale conclusions.

## Recommended merge order

1. Amend #97 first. It should become the single authoritative Compare audit, including the unique row-action findings from #75 and explicit acknowledgement that #95 and #96 fixed the AO filter and known mobile tap interception bugs.
2. Merge #97 after review. This gives the team one current Compare audit instead of several overlapping historical reports.
3. Amend and merge #81 independently. It is not blocked by #97, but it must acknowledge the merged question-bank metadata migration and should avoid stale live row-count claims.
4. Amend and merge #76 independently. It is a useful test template, but its AO5 negative-check wording should be tightened before it enters the docs.
5. Close #75 as superseded after its unique action findings are copied forward.
6. Close #59, #57, and #56 without merge. Their actionable conclusions have already been overtaken by merged #58/#60/#61 work.

Dependency notes: #97 does not need #56/#57/#59 merged first. Merging those older audits first would add stale, contradictory recommendations. #81 and #76 can be merged independently after minor edits because they are docs-only and do not conflict with Compare code or data.

## Findings to copy forward

From #75 into #97 or a follow-up issue:

- Copy/Builder row actions are duplicated across desktop and mobile render paths, creating test and accessibility blind spots.
- `handleSendToEssayBuilder` can navigate to `/builder` even after handoff persistence fails, leaving the user without the expected imported route.
- Clipboard and localStorage failures need inline feedback rather than native alerts or console-only errors.
- A shared route-action component/hook would reduce duplicated behaviour.

From #57, optional:

- Preserve the short rationale that `mock-*` rows were production-quality theme-organised comparisons, not throwaway test fixtures. This is useful historical context for why PR #58 backfilled rather than deactivated them.

From #59, optional:

- Preserve the post-backfill theme distribution table only if #97 wants more evidence for why the theme multiselect is now justified. Do not copy the stale "PR #58 is open" or "themes not projected" claims.

From #81:

- No need to copy into #97. Keep it as a separate questions-bank audit after updating for the metadata migration.

From #76:

- No need to copy into #97. Keep it as a reusable testing template after tightening AO5 wording.

## Commands run

| Command | Result |
| --- | --- |
| `git status --short` from provided workspace | Failed outside repo, then succeeded in `prose-prep`; one pre-existing untracked file: `docs/CODEX_AUDIT_REPORT_VERIFICATION_2026_05_25.md`. |
| `gh pr list --state open` | Succeeded; returned #97, #81, #76, #75, #59, #57, #56. |
| `gh pr view <number> --json title,state,isDraft,headRefName,baseRefName,mergeStateStatus,changedFiles,files,commits,reviewDecision,statusCheckRollup` | Succeeded for all seven PRs. |
| `git fetch origin main pull/97/head:pr-97 pull/81/head:pr-81 pull/76/head:pr-76 pull/75/head:pr-75 pull/59/head:pr-59 pull/57/head:pr-57 pull/56/head:pr-56` | Succeeded. |
| `git diff --name-status origin/main...pr-<number>` | Succeeded for all PRs; each PR adds one Markdown file. |
| `git merge-base --is-ancestor origin/main pr-<number>` | #97 current; #81 behind by 15 commits; #76/#75 behind by 19; #59/#57/#56 behind by 35. |
| `git merge-tree --write-tree origin/main pr-<number>` | No conflicts for all seven PRs. |
| `git show pr-<number>:<changed-file>` | Inspected every changed Markdown file. |
| `git show --name-only --oneline 5472324` | Confirmed PR #95 touched `src/components/ComparativeMatrix.tsx` and test file for AO filter fixes. |
| `git show --name-only --oneline 57d908f` | Confirmed PR #96 touched `src/components/ComparativeMatrix.tsx` and test file for mobile compare filter taps. |
| `git show --stat --oneline 3743f9d` | Confirmed merged PR #58 added the mock-row theme backfill migration. |
| `git show --stat --oneline ea34087` | Confirmed merged PR #60 added the themes multiselect implementation. |
| `git show --stat --oneline 8521991` | Confirmed merged PR #61 added the themes multiselect UX audit. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with 0 errors and 24 existing warnings. |
| `npm run test` | Passed: 43 files passed, 1 skipped; 427 tests passed, 3 skipped. |
| `npm run validate:component2-ao` | Passed: 146 files scanned, 159 allowed AO5 references, 0 blocked AO5 references. |
| `git diff --check` | Passed. |

## Safety confirmation

- No PRs were merged.
- No PRs were closed.
- No Supabase write, migration, or database commands were run.
- Specifically, no `supabase db push`, `supabase migration up`, `supabase migration repair`, `supabase db reset`, `supabase db pull`, migration apply command, or remote schema/data mutation command was run.
- No AO5 logic, UI, filters, scoring, database fields, or validation requirements were introduced.
- The only intended file for this review branch is `docs/audits/OPEN_PR_REVIEW_PLAN.md`.
