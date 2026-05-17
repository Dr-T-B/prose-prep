# Browser Smoke + Supabase Advisor Decision Report — 2026-05-16

## Scope

Target: `https://prosetutor.netlify.app`

Supabase project: `nxlxunygoccbnzdopqna`

No content import was run. No broad remediation was run.

## Browser-Level Smoke Results

| Area | Result | Evidence |
|---|---:|---|
| Anonymous local-only mode | Pass | `/builder` did not redirect to `/auth`; local-only notice was visible; Save plan showed `Saved locally on this device`; local saved plan count became `1`. |
| Authenticated login | Pass with test setup note | Supabase Auth email confirmation is enabled. A disposable smoke user was created, manually confirmed for the test, used for password login, then deleted. `POST /auth/v1/token?grant_type=password` returned `200`; app showed the signed-in dashboard and `Sign out`. |
| Dashboard loading | Pass | Anonymous and authenticated dashboard both rendered `Revision Dashboard`, `AO Readiness`, and `Theme Readiness`; no dashboard error state appeared. |
| Saved plans / cloud sync | Pass | Authenticated `Save plan` posted to `saved_essay_plans` with HTTP `201`; UI showed `Saved to your account`; local `remotePlanId` marker was stored. |
| Supabase connectivity | Pass with notes | Core dashboard/content reads returned `200`; auth/user-role/session reads returned `200`; cloud save returned `201`. |
| CSP connectivity | Needs remediation or explicit acceptance | CSP blocked Google Fonts stylesheet requests from `fonts.googleapis.com`. The app still rendered, but the browser smoke is not CSP-clean. |

Temporary test data cleanup: the disposable auth user and related rows were deleted after the smoke test; follow-up verification found `0` remaining smoke auth users, `0` matching smoke saved plans, and `0` recent smoke `essay_plans` rows.

## Browser Smoke Notes

1. CSP currently blocks Google Fonts:
   - `style-src 'self' 'unsafe-inline'` blocks `https://fonts.googleapis.com`.
   - Recommended remediation: either self-host/remove these font imports, or explicitly add `https://fonts.googleapis.com` to `style-src` and `https://fonts.gstatic.com` to `font-src`.

2. `glossary_terms` query fails:
   - Browser request: `/rest/v1/glossary_terms?select=*&is_active=eq.true&order=sort_order.asc`
   - Supabase response: HTTP `400`, code `42703`, message `column glossary_terms.sort_order does not exist`.
   - Schema inspection shows `glossary_terms.is_active` exists, but `sort_order` does not.
   - Recommendation before importing `glossary_terms`: add/verify `sort_order` in the controlled import plan, or update the app query to avoid ordering by a missing column.

3. `quote_question_links` query fails:
   - Browser request: `/rest/v1/quote_question_links?select=quote_id&question_id=eq.q_class_1`
   - Supabase response: HTTP `404`, code `PGRST205`, message `Could not find the table 'public.quote_question_links' in the schema cache`.
   - The app catches this and falls back to theme-based quote retrieval, so the builder remains usable.
   - Recommendation before content import: decide whether question-specific quote links are in scope. If yes, include `quote_question_links` in the schema/import plan; if no, remove or gate the primary lookup to avoid repeated 404s.

## Supabase Advisor Function Warning Decision

The remaining callable `SECURITY DEFINER` warnings are acceptable for content-import readiness only if they are explicitly documented as accepted exceptions. Further remediation is not required before content import for these functions, based on the current definitions and grants:

| Function | Current state | Decision |
|---|---|---|
| `public.handle_new_user()` | `SECURITY DEFINER`, `search_path=public`, trigger-backed on `auth.users`, executable only by `postgres`/`service_role`. | Accept. It is not exposed to `anon` or `authenticated`; it is needed for signup profile creation. |
| `public.has_role(uuid, app_role)` | `SECURITY DEFINER`, `search_path=public`, executable by `anon` and `authenticated`; used by public-read/admin RLS predicates. | Accept with note. This is the main intentional exception. Remediate later only if RLS policies are refactored so public reads no longer require this helper in `published = true OR has_role(...)` predicates. |
| `public.is_owner(uuid, text)` | `SECURITY DEFINER`, `search_path=public`, executable by `authenticated`; body requires `auth.uid()` and matching row owner. | Accept. Grants are restricted and the body is auth/self-only. |
| `public.get_next_best_action(uuid)` | `SECURITY DEFINER`, `search_path=public`, executable by `authenticated`; body rejects unauthenticated and non-self requests. | Accept. Required for student dashboard/RPC flow. |
| `public.get_user_emails(uuid[])` | `SECURITY DEFINER`, `search_path=public`, executable by `authenticated`; body returns rows only when caller has admin role. | Accept with note. The internal admin check is correct; later hardening could move this behind a narrower admin-only RPC surface if desired. |

Decision: accept the remaining Supabase Advisor function warnings as documented exceptions for staging content import, rather than blocking import on further function rewrites.

## Leaked-Password Protection

Supabase Auth email/password is enabled and email confirmation is currently required. Leaked-password protection remains worth enabling if the project plan supports it, especially before a wider student pilot. It is not a content-table import blocker, but the decision should be recorded before moving beyond staging/import validation.

Decision: remediate if available on the project plan; otherwise record an explicit deferral with compensating password policy notes.

## Content Import Gate

Do not import content yet unless explicitly instructed.

Before import, either remediate or explicitly accept the browser-smoke notes above, especially the `glossary_terms.sort_order` mismatch because `glossary_terms` is one of the planned import targets.

Recommended gate status: pass with notes for app smoke; content import remains conditionally paused pending CSP/schema-note acceptance or remediation.
