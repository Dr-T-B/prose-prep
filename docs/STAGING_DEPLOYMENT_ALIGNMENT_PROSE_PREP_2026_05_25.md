# Staging Deployment Alignment - prose-prep - 2026-05-25

## Summary

- Repository: `Dr-T-B/prose-prep`
- Local repository path: `/Users/tarwindersaran/Downloads/Projects/prose-prep`
- Local branch: `reconcile/annotated-essay-review-source`
- Commit SHA: `f051883eaa208fc756282cbdf952faaac533d45f`
- Deployment source note: Vercel CLI preview uploaded the local reconciled working tree from this branch. The remote `reconcile/annotated-essay-review-source` branch was not present when checked; the preview is therefore not a Git branch-backed preview.
- Deployment platform: Vercel
- Vercel project name: `prose-prep`
- Vercel project id: `prj_vM9SXdtTx96ajKWuF7e7kBHaLPpe`
- Vercel team: `dr-t-bs-projects`
- Deployed URL: `https://prose-prep-5gzg2v8x1-dr-t-bs-projects.vercel.app`
- Deployment id: `dpl_CHCNXmeHnriNWbxsaS61QCRCgZjd`
- Deployment type: Preview
- Deployment status: Ready
- Build command: `npm run typecheck && npm test && npm run build`
- Build result: Passed

## Safety Confirmation

- Production touched: No in this pass. The deployment command used was `vercel deploy --yes`; no `--prod`, promote, alias-to-production, rollback, or production Supabase action was run.
- Old Vercel project avoided: Yes. The deployment targeted `dr-t-bs-projects/prose-prep`, not `prose-craft-aid-main`.
- Supabase staging ref confirmed: `nxlxunygoccbnzdopqna`
- Supabase URL confirmed from deployed browser network requests: `https://nxlxunygoccbnzdopqna.supabase.co`
- Other Supabase hosts observed from deployed browser smoke: none
- CSP/config alignment: `vercel.json` sends `connect-src` for `https://nxlxunygoccbnzdopqna.supabase.co` and `wss://nxlxunygoccbnzdopqna.supabase.co`.
- Frontend service-role key use: No. `rg` over `src` found no service-role key references.
- Secret safety: No key values were printed. `.env`, `.env.local`, and `.vercel/` are gitignored.
- Content promotion: No rows were promoted or mutated.

## Reconciled Source Markers

- Migration exists: `supabase/migrations/20260525120000_annotated_essay_content_review_workflow.sql`
- Live-data hook exists: `src/hooks/useAnnotatedEssayPackContent.ts`
- Admin review UI exists: `src/components/admin/AnnotatedEssayReview.tsx`
- DataManager contains `Annotated essays` tab: Yes
- `AnnotatedEssayPack` uses live Supabase loading with bundled seed fallback: Yes
- Component 2 annotated essay controls: AO1, AO2, AO3, AO4 only

## Routes Verified

| Route | Result |
| --- | --- |
| `/` | Loaded without fatal error |
| `/annotated-essays` | Loaded without fatal error; content source showed live Supabase |
| `/admin` unauthenticated | Blocked/redirected to `/auth` |
| `/admin` authenticated as local staging test admin | Opened successfully |

## Admin Review Verification

- Admin protection active: Yes
- Staging admin sign-in completed: Yes, using local test credentials without printing them
- Admin review tab present: Yes
- `AnnotatedEssayReview` rendered: Yes
- Raw Supabase errors visible in admin UI: No

## AO5 Check

- AO5 absent from annotated essay controls/filters: Yes
- Observed deployed AO controls: `Show all`, `AO1 only`, `AO2 only`, `AO3 only`, `AO4 only`, `Hide annotations`, and drill AO options `All`, `AO1`, `AO2`, `AO3`, `AO4`.
- Note: the deployed page does contain a policy note mentioning that the pack does not create AO5 scoring fields. That is explanatory copy, not an AO5 control/filter.

## Check Results

- `npm run typecheck`: Passed locally.
- `npm test -- --run`: Passed locally, 139 passed and 3 skipped.
- `npm run build`: Passed locally.
- `npm run lint`: Passed locally with existing warnings only, 0 errors and 24 warnings.
- Vercel remote build: Passed `npm run typecheck && npm test && npm run build`; remote tests reported 139 passed and 3 skipped.

## Browser/Network Notes

- Vercel preview deployment protection returned `401` to plain unauthenticated HTTP, as expected for protected previews.
- Browser smoke used a temporary Vercel automation bypass secret, passed only in headers, and revoked it after verification.
- Deployed browser network requests reached only `nxlxunygoccbnzdopqna.supabase.co` among Supabase hosts.
- Non-app console noise observed: protected-preview/font CORS noise from applying the bypass header globally, one 404 resource, and a redirect-loop resource warning. No page-level runtime exception was observed.

## Remaining Risks

- The preview was deployed from the local reconciled working tree, not from a pushed remote validation branch. For long-lived auditability, push a validation branch containing the exact deployed source and report.
- The working tree remains dirty with the reconciled source and this report uncommitted.
- The deployment is Vercel-auth protected. Future browser automation needs a Vercel session or a temporary automation bypass.
- Bundle size warning remains: the main JS chunk is over 500 kB after minification.
- `npm install` reported 4 package audit findings during the Vercel build; they were not addressed in this pass.

## Mutation Validation Decision

Authenticated admin browser mutation validation is now safe to attempt against this preview URL, provided the next pass continues to target only staging Supabase ref `nxlxunygoccbnzdopqna`, keeps production untouched, and does not promote content rows unless explicitly instructed.
