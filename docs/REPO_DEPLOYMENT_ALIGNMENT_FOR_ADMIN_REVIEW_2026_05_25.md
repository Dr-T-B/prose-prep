# Repo/Deployment Alignment For Admin Review - 2026-05-25

## Executive Summary

This pass did not promote any annotated essay content row.

The canonical source for the current Prose Tutor annotated essay work appears to be `Dr-T-B/prose-prep`, not `Dr-T-B/prose-craft-aid`.

The currently observed Vercel project is `prose-craft-aid-main`, and its deployment metadata links it to `Dr-T-B/prose-craft-aid`. That deployed source is therefore not aligned with the prompt repository for this validation pass.

The staging Supabase project `nxlxunygoccbnzdopqna` is active and contains the annotated essay review workflow migration `20260525120000_annotated_essay_content_review_workflow`. However, the matching migration file and the expected admin annotated essay review UI were not found in the inspected GitHub source branches. Browser admin mutation validation is not safe to attempt until the app target is aligned and the admin review UI is present in the actual validation target.

## Safety Confirmation

- Date: 2026-05-25
- Production touched: no
- Content rows promoted: no
- Secrets printed or committed: no
- Service-role keys used in frontend code: no evidence of this in inspected source; no frontend code changes were made
- Staging Supabase project ref confirmed: `nxlxunygoccbnzdopqna`
- Staging Supabase project name: `prose-craft-aid-staging`
- Staging region: `eu-west-2`
- Local shell status: unavailable in this Codex session. Shell commands failed before execution with `CreateProcess ... /bin/zsh ... No such file or directory`, so local `git remote -v`, working tree status, npm checks, and browser checks could not be run from the filesystem.
- Remote documentation branch created in `Dr-T-B/prose-prep`: `validation/repo-deployment-alignment-admin-review`

## Canonical Repository Determination

Likely canonical repository: `Dr-T-B/prose-prep`.

Evidence:

- The prompt repository is `Dr-T-B/prose-prep`.
- `Dr-T-B/prose-prep` contains the `/annotated-essays` route in `src/App.tsx`.
- `Dr-T-B/prose-prep` contains `src/pages/AnnotatedEssayPack.tsx`.
- `Dr-T-B/prose-prep` has staging-oriented deployment config:
  - `vercel.json` build command includes `npm run typecheck && npm test && npm run build`.
  - `vercel.json` CSP allows connections only to `https://nxlxunygoccbnzdopqna.supabase.co` and the matching websocket endpoint.
  - `netlify.toml` uses the same staging Supabase ref in CSP and includes typecheck/test/build.
- `Dr-T-B/prose-prep` has stricter Supabase client env handling: it requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` or the deprecated publishable key alias.
- The previous validation report exists on the `Dr-T-B/prose-prep` validation branch.

Counter-evidence / unresolved drift:

- `src/components/admin/AnnotatedEssayReview.tsx` was not found in `Dr-T-B/prose-prep` main, `codex/annotated-essay-pack`, or `feature/supabase-annotated-essay-data`.
- `src/hooks/useAnnotatedEssayPackContent.ts` was not found in those inspected branches.
- `supabase/migrations/20260525120000_annotated_essay_content_review_workflow.sql` was not found in those inspected branches.
- `src/pages/DataManager.tsx` in `Dr-T-B/prose-prep` does not currently show an `Annotated essays` tab in the inspected source.

Conclusion: `Dr-T-B/prose-prep` is the best candidate for canonical source, but it is not yet validation-ready for the authenticated admin annotated essay review workflow because the expected admin UI and migration file are missing from inspected source.

## Deployment Target Determination

Observed Vercel project:

- Team: `team_sjSevPFOKi4HeaDFA2lt7HcQ`
- Project id: `prj_aCsRWi5uf7nTIRxtH5idtMa8scLi`
- Project name: `prose-craft-aid-main`
- Framework: Vite
- Node version: `24.x`
- Latest deployment id: `dpl_DDofq45W67EcUg932P7EMR5dbZJQ`
- Latest deployment URL: `https://prose-craft-aid-main-laluo3cxt-dr-t-bs-projects.vercel.app`
- Public project domain: `https://prose-craft-aid-main.vercel.app`
- Latest deployment target: preview/null, not production
- Latest deployment GitHub org: `Dr-T-B`
- Latest deployment GitHub repo: `prose-craft-aid`
- Latest deployment GitHub ref: `codex/prepare-staging-development`
- Latest deployment PR id: `16`
- Latest deployment commit: `6f31d5e9ba51ea17df2575f8c5735679953d8cb4`

Observed production Vercel deployment for the same project also points to `Dr-T-B/prose-craft-aid` on `main`.

No Vercel project linked to `Dr-T-B/prose-prep` was confirmed in this pass.

Netlify:

- Repository config exists in both repos.
- No live Netlify project settings were available through the current tools.
- `Dr-T-B/prose-prep` has staging-hardened `netlify.toml`.
- `Dr-T-B/prose-craft-aid` has older `netlify.toml` with `npm run build` only.

## Repo/Deployment Alignment Table

| Repository | Remote URL | Deployment platform | Linked deployment project | Linked Supabase project ref | Contains annotated essay page | Contains admin annotated essay review UI | Contains latest review workflow migration file | Contains latest validation reports | Likely canonical status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `Dr-T-B/prose-prep` | `https://github.com/Dr-T-B/prose-prep.git` | Vercel/Netlify config present, but no live Vercel project confirmed | Not confirmed | Repo deployment config points CSP to `nxlxunygoccbnzdopqna`; `.env.example` uses staging placeholders | Yes, `/annotated-essays` route and `AnnotatedEssayPack` page found | No, `AnnotatedEssayReview` and `Annotated essays` admin tab not found in inspected branches | No, file not found in inspected branches | Yes, previous validation report exists on validation branch | Likely canonical source, but incomplete for admin browser mutation validation |
| `Dr-T-B/prose-craft-aid` | `https://github.com/Dr-T-B/prose-craft-aid.git` | Vercel project confirmed; Netlify config present | `prose-craft-aid-main` | Actual Vercel env values not printed or confirmed; repo lacks staging CSP and has legacy client fallback; historical deployment messages include production ref `szdgsmpxtifrcmwelqfo` | No, `/annotated-essays` route/page not found | No, `AnnotatedEssayReview` and `Annotated essays` admin tab not found | No, file not found | No matching latest validation report found | Current deployed source, but likely legacy/misaligned for this workflow |
| Another repository | Not discovered | Not discovered | Not discovered | Not discovered | Not confirmed | Not confirmed | Not confirmed | Not confirmed | Not identified |

## Correct Browser Validation Target

No safe deployed browser-validation target is confirmed yet.

The currently visible Vercel URLs belong to `prose-craft-aid-main`, which is linked to `Dr-T-B/prose-craft-aid` and does not contain the `/annotated-essays` page in inspected source. That is not the correct target for authenticated admin annotated essay mutation validation.

Expected local validation target once source alignment is fixed:

- Repository: `Dr-T-B/prose-prep`
- Branch: a branch containing the annotated essay page, review workflow migration file, and admin review UI
- Local install command: `npm install` if dependencies are not already installed
- Local dev command: `npm run dev`
- Expected local dev URL: `http://localhost:5173`
- Required frontend env variables:
  - `VITE_SUPABASE_URL` pointing to `https://nxlxunygoccbnzdopqna.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` for staging
- Secrets: not printed

Expected deployed validation target after alignment:

- Deployment platform: Vercel or Netlify staging
- Linked repository: `Dr-T-B/prose-prep`
- Linked branch: branch containing the admin annotated essay review UI and migration source, or `main` after merge
- Supabase environment: staging project `nxlxunygoccbnzdopqna`
- Required verification before content promotion:
  - `/annotated-essays` loads from the aligned deployment
  - `/admin` is protected by admin auth
  - `/admin` includes `Annotated essays`
  - `AnnotatedEssayReview` renders mutation controls
  - mutations use the authenticated Supabase client, not a service-role key

## Admin Review UI Verification In Actual Target

Actual observed deployed target: Vercel project `prose-craft-aid-main`, linked to `Dr-T-B/prose-craft-aid`.

Findings:

- `/admin` route exists in inspected `prose-craft-aid` source and is wrapped by `ProtectedRoute requireAdmin`.
- `/annotated-essays` route was not found in inspected `prose-craft-aid` source.
- `DataManager` exists, but its inspected tab list does not include `Annotated essays`.
- `AnnotatedEssayReview` was not found in inspected `prose-craft-aid` source.
- `useAnnotatedEssayPackContent` was not found in inspected `prose-craft-aid` source.
- The latest review workflow migration file was not found in inspected `prose-craft-aid` source.

Therefore the current deployed target is not ready for admin annotated essay browser mutation validation.

Likely canonical target: `Dr-T-B/prose-prep`.

Findings:

- `/admin` route exists and is wrapped by `ProtectedRoute requireAdmin`.
- `/annotated-essays` route exists and renders `AnnotatedEssayPack`.
- `AnnotatedEssayPack` uses AO filters/options limited to AO1-AO4 in inspected source.
- `DataManager` exists, but the inspected tab list does not include `Annotated essays`.
- `AnnotatedEssayReview` was not found.
- `useAnnotatedEssayPackContent` was not found.
- The latest review workflow migration file was not found in inspected source.

Therefore the likely canonical source also needs the missing admin review UI/migration source reconciled before browser mutation validation.

## Supabase Staging State

Staging project confirmed:

- Ref: `nxlxunygoccbnzdopqna`
- Name: `prose-craft-aid-staging`
- Region: `eu-west-2`
- Status: active/healthy

Migration state:

- `20260524193000_create_annotated_essay_practice_pack` is applied.
- `20260524194500_seed_annotated_essay_practice_pack` is applied.
- `20260524222952_create_annotated_essay_practice_pack` is applied.
- `20260525120000_annotated_essay_content_review_workflow` is applied.

RLS/admin policy state:

The staging database has admin select/update policies on the annotated essay content tables using `has_role(auth.uid(), 'admin'::app_role)` or the equivalent `has_role((select auth.uid()), 'admin'::app_role)` pattern.

Confirmed update policy coverage includes:

- `essay_questions`
- `annotated_essays`
- `essay_paragraphs`
- `ao_annotations`
- `paragraph_stems`
- `quote_method_links`
- `misconception_upgrades`

This means the database side is staged for admin-authenticated mutation, but the correct browser/UI target is not yet aligned.

## Mismatch Assessment

Mismatch confirmed.

- Prompt repository: `Dr-T-B/prose-prep`
- Observed Vercel deployment source: `Dr-T-B/prose-craft-aid`
- Observed Vercel project: `prose-craft-aid-main`
- Current deployed source lacks `/annotated-essays` in inspected code.
- Current deployed source lacks the expected admin annotated essay review UI in inspected code.
- Staging database has the review workflow migration applied, but the matching migration file was not found in inspected repository branches.

This is an alignment blocker for browser mutation validation.

## Proposed Fix Route

Preferred route: Option A, move or create the staging deployment from `Dr-T-B/prose-prep`, after reconciling the missing admin review UI and migration source.

Recommended steps:

1. Locate the missing admin review UI and migration source if it exists locally or on an uninspected branch.
2. Commit the missing pieces into `Dr-T-B/prose-prep`:
   - admin `Annotated essays` tab or equivalent in `DataManager`
   - `AnnotatedEssayReview` component or equivalent
   - authenticated Supabase update path for review notes, reviewed, and approved states
   - migration file `supabase/migrations/20260525120000_annotated_essay_content_review_workflow.sql`
   - focused tests
3. Link a Vercel or Netlify staging deployment to `Dr-T-B/prose-prep`.
4. Set deployment env vars to staging Supabase only:
   - `VITE_SUPABASE_URL=https://nxlxunygoccbnzdopqna.supabase.co`
   - staging anon key, not printed or committed
5. Deploy and verify:
   - `/annotated-essays`
   - `/admin`
   - `/admin` -> `Annotated essays`
   - authenticated admin mutation via browser
   - denied non-admin mutation via RLS

Option B, porting the annotated essay workflow into `Dr-T-B/prose-craft-aid`, is higher risk because that repo lacks the annotated essay route, staging-hardened deployment config, stricter Supabase env handling, and current validation trail. It should only be chosen if `prose-craft-aid` is intentionally the deployment repository.

Option C is not currently supported by the evidence. `prose-craft-aid` is not merely stale metadata for the inspected Vercel project; Vercel deployment metadata repeatedly shows `Dr-T-B/prose-craft-aid` as the linked GitHub repo.

## Local Checks

Requested checks were not run because the local shell in this Codex session could not start.

Unable to run:

- `git remote -v`
- `git branch --show-current`
- `git status --short --branch`
- `npm install`
- `npm run typecheck`
- `npm run build`
- `npm test -- --run`
- `npm run lint`
- local dev server/browser automation

Remote checks completed instead:

- GitHub repository metadata inspection for `Dr-T-B/prose-prep` and `Dr-T-B/prose-craft-aid`
- GitHub source file inspection for routes, deployment config, Supabase client config, and expected admin review files
- Vercel project/deployment metadata inspection for `prose-craft-aid-main`
- Supabase project/migration/policy inspection for `nxlxunygoccbnzdopqna`

## Risks

- The local checkout may contain uncommitted files that could not be inspected because shell access failed.
- The missing admin review UI or migration file may exist on an uninspected branch, in local-only work, or in another repository not discovered here.
- Vercel environment variable values were not printed or confirmed, by design; project settings should be checked in the Vercel dashboard before any deployment validation.
- The staging database is ahead of inspected source because migration `20260525120000` is applied but the migration file was not found in inspected branches.
- Browser validation against the current Vercel URL would validate the wrong deployed source.

## Defects Found

- Deployment/source mismatch: Vercel project `prose-craft-aid-main` deploys `Dr-T-B/prose-craft-aid`, while the current annotated essay workflow appears to live in `Dr-T-B/prose-prep`.
- Admin annotated essay review UI not found in the actual deployed source.
- `/annotated-essays` route not found in the actual deployed source.
- Review workflow migration is applied to staging but the migration file was not found in inspected source branches.

## Fixes Made

- No application code changed.
- No database data changed.
- No production project touched.
- Created this alignment report on branch `validation/repo-deployment-alignment-admin-review` in `Dr-T-B/prose-prep`.

## Recommended Next Step

Do not perform authenticated admin browser mutation validation yet.

First, reconcile source and deployment:

1. Confirm whether `Dr-T-B/prose-prep` is the intended canonical repository.
2. Recover or implement the missing admin annotated essay review UI and migration file in `Dr-T-B/prose-prep`.
3. Link a staging deployment to `Dr-T-B/prose-prep` with staging Supabase env vars only.
4. Run typecheck, tests, lint, and build.
5. Then repeat the browser validation pass against the aligned staging target.

## Is Browser Admin Mutation Validation Safe To Attempt Now?

No.

The database side is prepared, but the browser target is not aligned. The observed deployed app is sourced from `Dr-T-B/prose-craft-aid`, while the likely canonical annotated essay app source is `Dr-T-B/prose-prep`. The expected `/admin` -> `Annotated essays` review UI was not found in the actual deployed source or in the inspected canonical candidate branches.