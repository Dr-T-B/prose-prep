# Prose Tutor Audit Fix Report — 2026-05-16

## 1. Executive Summary

Result: pass with notes. Local tests, typecheck, lint, and production build pass. Supabase fixes were implemented as new migrations only and were not applied to production.

Post-deploy update: the two Supabase migrations were applied to the linked staging project `nxlxunygoccbnzdopqna` and Netlify deploy `6a08e34d6284e19e01d2fba6` is live at `https://prosetutor.netlify.app`.

## 2. Files Changed

- `.github/workflows/ci.yml`
- `netlify.toml`
- `src/App.tsx`
- `src/components/Dashboard.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/components/ProtectedRoute.test.tsx`
- `src/pages/Dashboard.test.tsx`
- `supabase/migrations/20260516223000_harden_security_invoker_views.sql`
- `supabase/migrations/20260516223100_tighten_function_execute_grants.sql`
- `docs/SUPABASE_SECURITY_FIX_NOTES_2026_05_16.md`
- `docs/ENVIRONMENT_SECURITY_NOTES.md`
- `docs/CONTENT_IMPORT_READINESS_NOTES.md`
- `docs/AUDIT_FIX_REPORT_2026_05_16.md`

## 3. Issues Fixed

### 3.1 Dashboard Test Provider Failure

`Dashboard.test.tsx` now wraps `Dashboard` in `GradeBModeProvider`, matching the app tree. The test Supabase mock was updated for the current dashboard data flow.

### 3.2 GitHub Actions Node Runtime Drift

Used the existing `.nvmrc` with Node `22` and updated both GitHub Actions jobs to use `node-version-file: ".nvmrc"`.

### 3.3 Supabase Security-Definer Views

Added migration `20260516223000_harden_security_invoker_views.sql` to set `security_invoker = true` on the three dashboard/retrieval views when they exist as ordinary views.

### 3.4 Supabase Function Execute Grants

Added migration `20260516223100_tighten_function_execute_grants.sql` to revoke broad execution for `handle_new_user`, `is_owner`, `get_next_best_action`, and `get_user_emails` while preserving required authenticated access. `has_role(uuid, app_role)` was reviewed and left callable because public-read policies depend on it.

### 3.5 Local-Only / Anonymous Route Access

`ProtectedRoute` now supports `allowAnonymous`. The app-shell route uses it so anonymous students can reach local-only workflows while admin routes remain authenticated/admin-gated.

### 3.6 Dashboard Theme Count Logic

Dashboard theme counts now normalize theme ids, labels, and quote tags, with aliases for known prose theme vocabulary. Tests cover `theme.id = "education"` matching `quote.theme_tags = ["Education and utilitarianism"]`.

### 3.7 Netlify Build Gating

Netlify build command now runs:

```bash
npm run typecheck && npm test && npm run build
```

### 3.8 Netlify Security Headers

Added baseline `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and a conservative CSP allowing the app origin and the configured Supabase project.

### 3.9 Environment Secret Hygiene

Confirmed `.env` is gitignored without reading it. Added `docs/ENVIRONMENT_SECURITY_NOTES.md`.

### 3.10 Content Import Readiness Notes

Added `docs/CONTENT_IMPORT_READINESS_NOTES.md`. No content was imported, deleted, or reset.

## 4. Verification Results

| Command | Result | Notes |
|---|---|---|
| `npm ci --dry-run` | Pass | Warned because local shell uses Node 24 while repo requires Node 22. CI/Netlify now use Node 22. |
| `npm run typecheck` | Pass | `tsc --noEmit` completed successfully. |
| `npm run lint` | Pass | 0 errors, 23 warnings from existing React hook/fast-refresh rules. |
| `npm test` | Pass | 13 files passed, 1 integration file skipped; 79 tests passed, 3 skipped. |
| `npm run build` | Pass | Vite build completed; emitted existing large chunk and Browserslist freshness warnings. |

Additional checks:

- `git check-ignore .env` returned `.env`.
- `git diff --check` passed.
- `public/_redirects` still contains `/* /index.html 200`.
- `supabase --version` returned `2.98.2`.
- Supabase staging verification confirmed `security_invoker=true` on all three target views.
- Supabase Security Advisor no longer reports the three security-definer view findings.
- Live Netlify headers include CSP, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- Live Supabase REST smoke checks returned HTTP 200 for dashboard table reads and auth settings.

## 5. Database Migration Summary

`20260516223000_harden_security_invoker_views.sql`:

- Safely checks for the target views.
- Applies `security_invoker = true`.
- Adds explanatory comments.

`20260516223100_tighten_function_execute_grants.sql`:

- Revokes direct trigger-function execution from broad roles.
- Keeps authenticated execution only where the frontend/RLS path needs it.
- Documents why `has_role(uuid, app_role)` was not further restricted.

Both migrations were executed against staging with `supabase db query --linked --file ...` and marked applied in migration history with `supabase migration repair --linked --status applied`.

## 6. Security Notes

No secrets or `.env` values were read or printed. The service-role key guidance is documented separately. Supabase migrations were applied to staging only; production database rollout remains out of scope.

Security Advisor still reports accepted warnings for callable `SECURITY DEFINER` functions (`has_role`, `is_owner`, `get_next_best_action`, `get_user_emails`) and leaked-password protection disabled. These are no longer the original view findings, but they should be explicitly accepted or remediated before content import.

## 7. Remaining Risks

- Supabase advisor function warnings remain and need acceptance/remediation.
- Existing lint warnings remain outside this audit scope.
- Content tables remain incomplete by design.

## 8. Recommended Next Steps

1. Decide whether to accept or further remediate the remaining Supabase Advisor warnings for callable `SECURITY DEFINER` functions.
2. Enable leaked-password protection if appropriate for the current Supabase auth configuration.
3. Run a browser-level smoke test covering anonymous local-only mode, authenticated login, dashboard loading, saved plans/cloud sync if available, and CSP/auth/Supabase connectivity.
4. Prepare a controlled content import plan for `library_quotes`, `library_questions`, `quote_pairs`, `thesis_routes`, `paragraph_stems`, and `glossary_terms`.
5. Do not import content yet unless explicitly instructed.

## 9. Final Verdict

Pass with notes. Original high-priority issues are remediated and staging/live smoke checks have passed. Content import is conditionally ready, pending explicit acceptance/remediation of remaining Supabase Advisor function warnings and completion of browser-level smoke tests.
