# Staging Admin Review Mutation Validation - 2026-05-25

## Summary

This was a staging-only authentication/admin-RLS validation pass for the Prose Tutor annotated essay review workflow.

The pass is **partial / blocked**. A real staging admin role row was created, and admin/non-admin RLS behaviour was probed against live staging data, but the required authenticated browser mutation through `/admin` -> `Annotated essays` was **not completed** in this session.

## Safety Confirmation

- Target Supabase project ref: `nxlxunygoccbnzdopqna`
- Supabase project name observed: `prose-craft-aid-staging`
- Region observed: `eu-west-2`
- Project status observed: `ACTIVE_HEALTHY`
- Production touched: **No**
- Service-role keys printed: **No**
- Service-role keys added to frontend code: **No**
- Secrets committed or printed: **No**

Local shell access was unavailable in this Codex session, so local `git branch --show-current`, `git status`, and local test commands could not be run. Remote GitHub state was inspected through the GitHub connector instead.

## Branch / Repository Notes

- Prompt repository: `Dr-T-B/prose-prep`
- Report branch created: `validation/staging-admin-review-mutation`
- Base branch used for this report: `main` at `f61cf9f748504fe10d764e3da01c71dc71cbc052`
- Vercel project observed: `prose-craft-aid-main`
- Vercel deployment metadata points to `Dr-T-B/prose-craft-aid`, not `Dr-T-B/prose-prep`

This repo/deployment mismatch is a validation risk: the code inspected in `prose-prep` may not be the exact code currently deployed on Vercel.

## Auth / Admin Model Inspected

Observed from repository code and staging schema:

- Supabase client is created in `src/integrations/supabase/client.ts` using Vite public environment variables.
- No service-role key is used in frontend code.
- `AuthContext` loads the active Supabase session and checks `public.user_roles` for `role = 'admin'` against the signed-in user id.
- `/admin` is wrapped by `ProtectedRoute requireAdmin`.
- `ProtectedRoute` redirects non-admin users away from `/admin`.
- `public.has_role(_user_id uuid, _role app_role)` exists as a `SECURITY DEFINER` SQL function and checks `public.user_roles`.
- A no-argument `public.has_role()` function also exists and always returns false.

## RLS / Schema Snapshot

Seven annotated essay content tables inspected:

- `essay_questions`
- `annotated_essays`
- `essay_paragraphs`
- `ao_annotations`
- `paragraph_stems`
- `quote_method_links`
- `misconception_upgrades`

Observed RLS shape:

- Admin `SELECT` and `UPDATE` policies exist on the annotated essay tables using `has_role(auth.uid(), 'admin')` or the equivalent subselect form.
- Public `SELECT` policies exist for the annotated essay content tables and currently allow statuses in `approved`, `reviewed`, `teacher review required`, and `needs correction`.
- `public.user_roles` has an admin management policy and a self-read policy.

Relevant review columns exist on the annotated content tables, including `verification_status`, `reviewed`, `reviewed_at`, `reviewed_by`, `approved_at`, `approved_by`, and `review_notes`.

## Admin User Creation / Confirmation

Before this pass, `public.user_roles` contained zero rows.

A staging auth user existed and was selected based on recent staging sign-in activity. I inserted/confirmed:

- `user_id = 0c536f97-e5a0-445b-9582-5baf6ec9cdf4`
- `role = admin`

Method:

```sql
insert into public.user_roles (user_id, role)
values ('0c536f97-e5a0-445b-9582-5baf6ec9cdf4'::uuid, 'admin'::public.app_role)
on conflict (user_id, role) do nothing;
```

Confirmation query returned the row with `role = admin`.

## Candidate Row For UI Validation

Recommended non-critical candidate identified but **not promoted**:

- Table: `paragraph_stems`
- Row id: `ps_ao2_01`
- Initial status: `teacher review required`
- Initial reviewed: `false`
- Initial `reviewed_at`: `null`
- Initial `approved_at`: `null`
- Initial `review_notes`: `null`

Reason selected: paragraph stem, non-critical, not part of the already-approved essay chain.

## Admin Browser Mutation Validation

Status: **Blocked / not completed**

Required browser steps not completed:

- Open `/admin`
- Open `Annotated essays` tab
- Add review notes through UI
- Save review notes through UI
- Mark as reviewed through UI
- Confirm review metadata from DB
- Mark as approved through UI
- Confirm approval metadata from DB

Blockers:

- The local command runner could not start a shell, so no local dev server or Playwright/browser test could be launched.
- No browser automation tool was exposed in this session.
- The live Vercel project is linked to `Dr-T-B/prose-craft-aid`, while the prompt target is `Dr-T-B/prose-prep`.
- The inspected `/admin` implementation in the accessible repos exposes a staged `Review queue`; I could not confirm an `Annotated essays` admin tab in the inspected source.

No row was promoted from `teacher review required` to `reviewed` or `approved` in this pass.

## Denied Non-Admin Mutation Verification

RLS was probed against live staging using no-op updates against `public.paragraph_stems` row `ps_ao2_01`:

- Admin user context updated 1 row.
- Non-admin user context updated 0 rows.

Result:

```text
admin_noop_update_rows = 1
non_admin_noop_update_rows = 0
```

This confirms that the database policy blocks non-admin mutation for the tested table/row. It does not replace the required browser validation.

## Student-Facing Verification

Status: **Partial / database-level only**

Observed via staging SQL:

- `annotated_essays`: 1 approved row
- `ao_annotations`: 12 approved rows
- `essay_paragraphs`: 6 approved rows
- `essay_questions`: 1 approved row and 7 teacher-review-required rows
- `paragraph_stems`: 3 approved rows and 51 teacher-review-required rows
- `quote_method_links`: 3 approved rows and 2 teacher-review-required rows
- `misconception_upgrades`: 3 approved rows and 3 teacher-review-required rows

AO5 checks returned zero rows for:

- `ao_annotations.ao_tags`
- `essay_questions.ao_requirements`
- `paragraph_stems.ao`

Browser checks not completed:

- `/annotated-essays` rendered state
- Reviewed/approved badge display
- AO overlay interaction
- Absence of raw Supabase errors in browser
- Absence of AO5 filter in browser UI

## Tests And Checks

Commands requested but not run because local shell execution was unavailable:

- focused admin review tests
- focused annotated essay tests
- full test suite
- typecheck
- build
- lint

Remote/static inspections performed instead:

- GitHub source inspection via connector
- Vercel project/deployment metadata inspection via connector
- Supabase project/table/policy SQL inspection via connector
- Staging RLS no-op mutation probe via connector

## Defects / Blockers Found

1. `public.user_roles` had no admin row at the start of the pass. Fixed in staging by adding a real admin role row.
2. The required authenticated browser validation could not be performed in this session due unavailable shell/browser tooling.
3. The prompt repository (`Dr-T-B/prose-prep`) and observed Vercel deployment repository (`Dr-T-B/prose-craft-aid`) do not match.
4. The inspected admin source did not expose a confirmed `Annotated essays` tab; only the existing staged review queue was confirmed from source.

## Fixes Made

- Inserted/confirmed one staging admin row in `public.user_roles` for a staging auth user.
- Created this validation report on branch `validation/staging-admin-review-mutation`.

No frontend code was changed.
No content row was promoted.
No production project was touched.

## Remaining Risks

- The core acceptance criterion, authenticated browser promotion through `/admin` -> `Annotated essays`, remains unvalidated.
- If the deployed app is still sourced from `prose-craft-aid`, validating `prose-prep` alone may not validate the live app.
- Public `SELECT` policies currently include `teacher review required`; confirm this is intentional for student-facing annotated essay content.
- Local test/build/typecheck status is unknown for this pass.

## Recommended Next Step

Resolve the repo/deployment target first, then run an authenticated browser pass with the staging admin user now present in `public.user_roles`. Use `ps_ao2_01` or another non-critical paragraph stem as the mutation target, promote it through the actual UI, and then run the focused tests, typecheck, build, and lint locally.