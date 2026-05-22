# Education Builder UI Verification - 2026-05-22

## Purpose and scope

This pass verified that the newly activated Education Builder family is exposed and rendered by the Essay Builder UI. It was verification-first only: no quote-method curation, schema work, RLS work, type regeneration, deployment, migration repair, or unrelated taxonomy cleanup was performed.

## Branch and commit checked

- Branch: `main`
- Latest commit checked: `2d49a21 docs: backfill commit hash in education activation report`
- Activation commit present: `242d457 Activate education Builder family`
- Working tree note: the tree had substantial pre-existing unrelated noise, mostly deleted tracked docs and untracked audit/migration material. These files were not touched.
- Activation report backfill: already committed as `2d49a21`; no separate backfill commit was needed in this pass.

## Files inspected

- `src/pages/EssayBuilder.tsx`
- `src/lib/contentRepo.ts`
- `src/lib/planLogic.ts`
- `src/data/seed.ts`
- `src/App.tsx`
- `src/lib/ContentProvider.tsx`
- `src/components/QuotePicker.tsx`
- `supabase/migrations/20260522133400_activate_education_builder_family.sql`
- `package.json`

## Code-path findings

- Visible Builder family chips are derived from `content.questions`, which are loaded from active remote `questions` rows.
- `QuestionFamily` and `QUESTION_FAMILY_LABELS` include `education: "Education"`.
- There is no Essay Builder UI allowlist blocking Education.
- `q-education` should display as `Education`.
- Route display uses the question's primary and secondary route ids.
- The `Why this fits` panel renders `routes.best_use` directly.
- Thesis resolution uses `findThesis(plan.route_id, plan.family, plan.thesis_level, content)` and can resolve `thesis-education-astar`.
- Paragraph-job resolution uses `resolveParagraphJobs(plan.family, plan.route_id, thesis, content)` and can resolve `pj-education-1a`.

## Remote read-only validation

Remote project ref confirmed from repo env/config: `nxlxunygoccbnzdopqna`.

Read-only Supabase checks passed:

- Active families are exactly: `childhood`, `class`, `education`, `guilt`, `imagination`.
- `q-education` exists and is active.
- `q-education` has `level_tag = top_band`.
- `q-education` primary route is `route-imagination`.
- `q-education` secondary route is `route-perception`.
- Both linked routes exist.
- Both linked routes have student-facing `best_use` prose.
- `thesis-education-astar` exists.
- `pj-education-1a` exists.
- Education quote-method coverage exists.
- Education comparative-matrix coverage exists.
- Education interpretive-tension coverage exists.
- Unsupported active families: `0`.
- Missing required active fields: `0`.
- Broken route references: `0`.
- Raw slug-list `best_use` values on active routes: `0`.

Coverage note: the direct `best_themes` education quote-method query returned 14 active rows, all `Hard Times`. The UI also surfaced Atonement evidence for the education question through the question/route quote lookup path. Balance remains a curation topic, not a UI activation defect.

## Local runtime and UI verification method

The app was run locally with the existing project script:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Vite served successfully at `http://127.0.0.1:5173/` and returned HTTP 200.

The Codex in-app Browser control surface was not exposed in this session after tool discovery. As a fallback, UI verification used the installed macOS Google Chrome in headless mode via the built-in Chrome DevTools Protocol against `http://127.0.0.1:5173/builder`. No screenshots were saved.

## UI verification results

- Essay Builder loaded successfully at `/builder`.
- Family chips rendered: `Childhood`, `Class`, `Education`, `Guilt`, `Imagination`.
- Selecting `Education` displayed: `Compare the ways Dickens and McEwan present the role of education.`
- Selecting the education question displayed the recommended route: `Imagination vs Rationality`.
- The alternative route displayed: `Reality, Perception and Misreading`.
- `Why this fits` displayed polished prose, including the `Best used when...` route explanations, not raw slug lists.
- The thesis panel displayed the `thesis-education-astar` content beginning `Both Hard Times and Atonement present education as moral formation...`.
- The paragraph-job surface displayed `pj-education-1a` content under `Education as moral formation`, including the Gradgrind and Briony prompts.
- The quote/evidence surface displayed Hard Times education evidence beginning `Now, what I want is, Facts.` and Atonement evidence beginning `She was not yet old enough to understand...`.
- The comparative matrix surface rendered for Education with primary pairings and advanced pairings.
- The analytical positions surface rendered.
- Switching away from Education and back again preserved a working Education question-selection state.

## Existing-family regression check

The same headless UI pass clicked the other active family chips:

- `Childhood`: chip present; question rendered.
- `Class`: chip present; question rendered.
- `Guilt`: chip present; question rendered.
- `Imagination`: chip present; question rendered.

## Local check results

- `npm run typecheck`: passed.
- `npm run test`: passed, 15 test files passed, 1 skipped; 120 tests passed, 3 skipped.
- `npm run build`: passed.

Build warnings: Browserslist/caniuse-lite data is stale, and the production JS chunk is larger than 500 kB after minification. These warnings pre-existed this documentation-only verification task and did not block the build.

## Files changed

- `docs/EDUCATION_BUILDER_UI_VERIFICATION_2026_05_22.md`

## Safety confirmation

No schema changes, RLS changes, Supabase type regeneration, deployment, `--include-all`, database reset, migration repair, destructive SQL, route-gender changes, hope/settings activation, unrelated family activation, or quote-method curation were performed.

## Remaining risks

- Browser verification used headless Chrome CDP rather than the Codex in-app Browser plugin because the plugin's required control tool was unavailable in this session.
- Education quote-method balance remains uneven and should be handled in a later curation phase, not this verification phase.
- The working tree contains substantial unrelated pre-existing noise; commit staging must remain path-specific.

## Recommended next phase

Proceed to Education Quote-Method Balance Curation, focusing on better cross-text balance without changing the already verified Builder activation surface.
