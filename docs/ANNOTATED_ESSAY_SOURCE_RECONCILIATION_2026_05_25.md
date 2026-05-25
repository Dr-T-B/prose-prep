# Annotated Essay Source Reconciliation - 2026-05-25

## Summary

This pass reconciled the annotated essay content review workflow source into the local `Dr-T-B/prose-prep` checkout. Production was not touched, no Supabase migration was pushed, and no content rows were promoted.

## Branch And Safety

- Repository confirmed: `https://github.com/Dr-T-B/prose-prep.git`
- Working directory: `/Users/tarwindersaran/Downloads/Projects/prose-prep`
- Starting branch: `validation/staging-annotated-essay-promotion`
- Reconciliation branch created: `reconcile/annotated-essay-review-source`
- Supabase staging ref confirmed from prompt and repo config: `nxlxunygoccbnzdopqna`
- `supabase/config.toml`: `project_id = "nxlxunygoccbnzdopqna"`
- Production targeted: no
- Production touched: no
- Service-role keys used or committed: no
- Secrets printed: no
- Content rows promoted: no
- Browser admin mutation validation run: no

Initial working tree was already dirty and included the annotated essay workflow files plus unrelated local Phase 3 / character-pairing files. Those unrelated files were left in place and were not part of this reconciliation.

## Source Search Result

Searched local working tree, local branches, remote-tracking branches, stashes, and recent commit history for:

- `AnnotatedEssayReview`
- `useAnnotatedEssayPackContent`
- `annotated essay review workflow`
- `20260525120000_annotated_essay_content_review_workflow`
- `Annotated essays`
- `buildPromotionPatch`
- `assembleAnnotatedPack`

Result:

- No stash entries existed.
- Committed local/remote branch history did not contain the missing admin review component, hook, or migration source.
- The expected workflow source was present only as local untracked/recreated working-tree files plus edits on the starting validation branch.

Conclusion: the missing source was not recovered from committed branch history. It was preserved/reconciled from the local recreated working tree and lightly hardened during this pass.

## Files Recovered Or Recreated

Workflow files now present in source:

- `supabase/migrations/20260525120000_annotated_essay_content_review_workflow.sql`
- `src/hooks/useAnnotatedEssayPackContent.ts`
- `src/hooks/useAnnotatedEssayPackContent.test.ts`
- `src/components/admin/AnnotatedEssayReview.tsx`
- `src/components/admin/AnnotatedEssayReview.test.tsx`
- `src/pages/DataManager.tsx`
- `src/pages/AnnotatedEssayPack.tsx`
- `src/pages/AnnotatedEssayPack.test.tsx`
- `src/data/annotatedEssayPracticePack/index.ts`
- `docs/ANNOTATED_ESSAY_CONTENT_REVIEW_WORKFLOW_2026_05_25.md`
- `docs/STAGING_ANNOTATED_ESSAY_PROMOTION_VALIDATION_2026_05_25.md`
- `docs/sql/annotated_essay_content_promotion_examples.sql`

Additional hardening performed in this reconciliation:

- Exported annotated essay row mapper helpers from `useAnnotatedEssayPackContent.ts` for easier pure testing.
- Hardened `buildPromotionPatch` so demotions to `reviewed`, `needs correction`, `teacher review required`, or `draft` clear stale approval/review metadata where appropriate.
- Added an admin component render test to confirm `AnnotatedEssayReview` loads and displays queue rows.
- Aligned the migration admin role checks to `public.has_role(auth.uid(), 'admin'::app_role)`.

## Migration Reconciliation Notes

The migration file covers the seven annotated essay content tables:

- `essay_questions`
- `annotated_essays`
- `essay_paragraphs`
- `ao_annotations`
- `paragraph_stems`
- `quote_method_links`
- `misconception_upgrades`

It is idempotent where practical for source history and future environments:

- Adds review metadata columns with `if not exists`.
- Adds `verification_status` and `reviewed` defaults where needed.
- Drops/recreates the canonical status constraints.
- Enables RLS on all seven tables.
- Drops/recreates public select policies that exclude `draft` and `retired`.
- Drops/recreates admin select/update policies gated by `public.has_role(auth.uid(), 'admin'::app_role)`.
- Drops the legacy unrestricted `Public read paragraph_stems` policy.
- Creates reviewer/status indexes with `if not exists`.

The migration was not reapplied to staging in this pass because staging already has version `20260525120000_annotated_essay_content_review_workflow` applied.

## Source Workflow Confirmation

- Seven-table review workflow exists in source: yes
- Migration file matching the staging review workflow exists in source: yes
- Admin review UI exists in source: yes
- Admin UI uses the authenticated Supabase client: yes
- Admin UI uses service-role keys: no
- `buildPromotionPatch` exported and tested: yes
- `DataManager` contains an `Annotated essays` tab: yes
- `AnnotatedEssayPack` uses the live-data hook: yes
- `AnnotatedEssayPack` preserves bundled seed fallback: yes
- Student-facing assembly filters `draft` and `retired`: yes
- `needs correction` rows remain visible with warning badges: yes
- `paragraph_stems.ao` maps to `ao_focus`: yes
- `paragraph_stems.level_band` maps to `difficulty_level`: yes
- Component 2 AO controls remain AO1-AO4 only: yes
- AO5 filter exposed for Component 2: no

## Report Reconciliation

Compared against available reports:

- Repo report: `docs/STAGING_ANNOTATED_ESSAY_PROMOTION_VALIDATION_2026_05_25.md`
- External report copy: `/Users/tarwindersaran/Downloads/STAGING_ADMIN_REVIEW_MUTATION_VALIDATION_2026_05_25.md`
- External report copy: `/Users/tarwindersaran/Downloads/REPO_DEPLOYMENT_ALIGNMENT_FOR_ADMIN_REVIEW_2026_05_25.md`

The reports agree that:

- Staging ref is `nxlxunygoccbnzdopqna`.
- Staging has migration `20260525120000_annotated_essay_content_review_workflow` applied.
- Current observed Vercel deployment points to `Dr-T-B/prose-craft-aid`, not `Dr-T-B/prose-prep`.
- Browser admin mutation validation should wait until source and deployment target are aligned.
- Candidate future browser mutation row is `paragraph_stems.ps_ao2_01`.

This pass reconciles the source side only and does not resolve the Vercel deployment link.

## Local Checks

Commands run:

- `npm test -- useAnnotatedEssayPackContent.test.ts AnnotatedEssayPack.test.tsx AnnotatedEssayReview.test.tsx`
  - Passed: 19 tests
- `npm run typecheck`
  - Passed
- `npm test -- --run`
  - Passed: 139 tests
  - Skipped: 3 integration tests
- `npm run build`
  - Passed
  - Warnings: Browserslist `caniuse-lite` data is 11 months old; one Rollup chunk is larger than 500 kB after minification.
- `npm run lint`
  - Passed with 24 warnings and 0 errors.
  - Warnings are existing repo warnings in files outside the annotated essay reconciliation surface, including `ParagraphEngine.tsx`, admin/import UI files, shared UI primitives, contexts, and library pages.
- `npx eslint src/hooks/useAnnotatedEssayPackContent.ts src/hooks/useAnnotatedEssayPackContent.test.ts src/components/admin/AnnotatedEssayReview.tsx src/components/admin/AnnotatedEssayReview.test.tsx src/pages/AnnotatedEssayPack.tsx src/pages/AnnotatedEssayPack.test.tsx src/pages/DataManager.tsx src/data/annotatedEssayPracticePack/index.ts src/App.tsx`
  - Passed with 0 warnings and 0 errors.
  - This direct pass was run because the repo lint script only includes `git ls-files`, and the newly reconciled files are still untracked until staged.

## Remaining Risks

- The Vercel project observed in prior reports is still aligned to `Dr-T-B/prose-craft-aid`; browser validation against that deployment would validate the wrong source.
- This branch contains unrelated pre-existing local Phase 3 / character-pairing untracked files. They were not modified for this workflow and should be kept out of any focused annotated-essay commit unless intentionally included.
- The migration source now matches the expected staging shape, but it was not re-run against staging in this pass.
- Authenticated admin mutation through `/admin -> Annotated essays` remains unvalidated in a browser.

## Browser Admin Mutation Readiness

Browser admin mutation validation is safe to retry only after a staging deployment is linked to `Dr-T-B/prose-prep` source from this reconciled branch, with staging Supabase environment variables only.

Recommended next sequence:

1. Link a staging deployment to `Dr-T-B/prose-prep`.
2. Set only staging Supabase env vars for `nxlxunygoccbnzdopqna`.
3. Deploy this reconciled source.
4. Retry authenticated `/admin -> Annotated essays` mutation using `paragraph_stems.ps_ao2_01`.
