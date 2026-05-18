# Post-Remediation Deploy Smoke Report — 2026-05-16

## Scope

- Repository: `Dr-T-B/prose-prep`
- Local branch: `main`
- Target Supabase project: `nxlxunygoccbnzdopqna`
- Target Netlify app: `https://prosetutor.netlify.app`
- Content import: not run
- Deletes/truncates: not run
- Supabase dashboard settings: not changed

## Working Tree

`git status --short --branch` confirmed `main...origin/main` with existing remediation changes and untracked reports/migrations already present in the working tree. No unrelated files were reverted.

Netlify CLI also updated `.netlify/netlify.toml` during deployment.

## Supabase Migrations

The two requested migrations were absent from remote migration history before this run:

- `20260516230000_add_glossary_terms_sort_order.sql`
- `20260516230100_create_quote_question_links.sql`

Both were applied to the linked staging project with `supabase db query --linked --file ...` and then recorded with `supabase migration repair --linked --status applied`.

Post-apply verification:

- `supabase_migrations.schema_migrations` contains both `20260516230000` and `20260516230100`.
- `public.glossary_terms.sort_order` exists as nullable `integer`.
- `public.quote_question_links` exists with columns `id`, `quote_id`, `question_id`, `relevance_score`, `rationale`, `created_at`, and `updated_at`.
- `quote_question_links` has RLS enabled.
- Policies present:
  - `quote_question_links_public_select`: `SELECT` to `anon, authenticated` using `true`.
  - `quote_question_links_admin_insert`: authenticated insert gated by `has_role(auth.uid(), 'admin')`.
  - `quote_question_links_admin_update`: authenticated update gated by `has_role(auth.uid(), 'admin')`.
  - `quote_question_links_admin_delete`: authenticated delete gated by `has_role(auth.uid(), 'admin')`.
- Anonymous REST insert was blocked with RLS error `42501`.
- Service-role writes remain possible through normal Supabase RLS bypass.

## REST Verification

Browser-context and direct REST checks passed:

| Check | Result | Evidence |
|---|---:|---|
| `glossary_terms` ordered by `sort_order` | Pass | HTTP `200`; no `42703` missing-column error. Returned `0` rows because no imported glossary content is present. |
| `quote_question_links` public read | Pass | HTTP `200`; returned `0` rows because no content links have been imported. |
| `quote_question_links` anonymous write restriction | Pass | Anonymous insert returned HTTP `401` / Postgres code `42501`. |
| Supabase REST connectivity | Pass | `questions?select=id&limit=1` returned HTTP `200` with one row. |

`public.quote_question_links` row count remains `0`, confirming no content/link import was run.

## Netlify Deploy

The previous live CSP still lacked Google Fonts allowances, so a production deploy was run.

- Production deploy ID: `6a08eacadd7746bbb7bf33d4`
- Production URL: `https://prosetutor.netlify.app`
- Unique deploy URL: `https://6a08eacadd7746bbb7bf33d4--prosetutor.netlify.app`

Netlify deploy ran:

- `npm run typecheck`: pass
- `npm test`: pass, 13 files passed and 1 skipped; 79 tests passed and 3 skipped
- `npm run build`: pass

Post-deploy header verification confirmed the live CSP now includes:

- `style-src ... https://fonts.googleapis.com`
- `font-src ... https://fonts.gstatic.com`

## Browser Smoke Results

Smoke target: `https://prosetutor.netlify.app`

| Area | Result | Evidence |
|---|---:|---|
| Anonymous local-only mode | Pass | Anonymous `/` loaded `Revision Dashboard` without redirecting to `/auth`; `/builder` showed the local-only notice; `Save plan` showed `Plan saved locally`; browser local saved-plan count became `1`. |
| Authenticated login | Pass | Used a one-time Supabase auth session for an existing staging user without printing credentials/tokens; dashboard loaded from the live app with an auth session present. |
| Dashboard loading | Pass | Anonymous and authenticated dashboard smoke both rendered `Revision Dashboard`. |
| Saved plans / cloud sync | Pass | Authenticated `Save plan` wrote to `saved_essay_plans` with HTTP `201`; UI showed `Saved to your account`. |
| Glossary query | Pass | Browser REST query for `glossary_terms` ordered by `sort_order` returned HTTP `200`. |
| Quote-question-links query | Pass | Browser REST query returned HTTP `200`; builder network also showed `quote_question_links` requests returning `200`. |
| CSP/font loading | Pass | No browser CSP console violations; `fonts.googleapis.com` and `fonts.gstatic.com` requests returned HTTP `200`. |
| Supabase REST connectivity | Pass | Content/dashboard REST reads returned HTTP `200`; no Supabase request failures were recorded. |

Notes:

- The authenticated cloud-sync smoke created one saved plan row in staging. It was not deleted because this run was explicitly non-destructive.
- `saved_essay_plans` count after the smoke was `1`.
- No content tables were imported, truncated, or cleaned.

## Supabase Advisor Status

Security Advisor:

- Total warnings: `6`
- `anon_security_definer_function_executable`: `1`
- `authenticated_security_definer_function_executable`: `4`
- `auth_leaked_password_protection`: `1`

The callable `SECURITY DEFINER` warnings remain as previously documented accepted exceptions for staging import readiness in `docs/BROWSER_SMOKE_SUPABASE_ADVISOR_DECISION_REPORT_2026_05_16.md`.

Leaked-password protection remains deferred. It was not changed because dashboard settings were not explicitly permitted for this run. This remains a follow-up before a wider pilot.

Performance Advisor:

- Total warnings: `95`
- `auth_rls_initplan`: `86`
- `multiple_permissive_policies`: `9`

These are performance/hardening follow-ups, not current content-import blockers.

## Remaining Risks

- Leaked-password protection is still disabled/deferred.
- Security Advisor callable-function warnings remain as documented staging exceptions.
- Performance Advisor warnings remain.
- Staging has local/remote migration-history drift outside the two migrations applied here; this run intentionally did not run broad `db push`.
- Content tables are still sparse/empty by design until controlled import.
- One non-content authenticated saved-plan smoke row now exists in staging.

## Content Import Gate Decision

All required browser smoke areas passed after applying the two schema migrations and redeploying Netlify.

Final verdict: **Content import approved with notes**.

Import may proceed only through the controlled import path, with no deletes/truncates and with the remaining Advisor/leaked-password items tracked as post-gate risks.
