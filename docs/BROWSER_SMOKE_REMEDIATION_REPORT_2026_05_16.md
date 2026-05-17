# Browser Smoke Remediation Report — 2026-05-16

## 1. Summary Verdict

Local remediation is complete. The CSP/font issue is fixed in Netlify headers, the `glossary_terms.sort_order` mismatch is addressed with a forward migration, and `quote_question_links` is now represented as an intended schema table with safe read/write RLS.

Content import should remain paused for the target Supabase project until the new migrations are applied there and the browser smoke is rerun against the deployed app.

## 2. Files Changed

- `netlify.toml`
- `src/integrations/supabase/types.ts`
- `supabase/migrations/20260516230000_add_glossary_terms_sort_order.sql`
- `supabase/migrations/20260516230100_create_quote_question_links.sql`
- `docs/AUTH_SECURITY_DECISION_2026_05_16.md`
- `docs/BROWSER_SMOKE_REMEDIATION_REPORT_2026_05_16.md`

## 3. CSP Decision and Fix

Google Fonts are required by the app: `index.html` imports Inter, IBM Plex Mono, Fraunces, and Cormorant Garamond, and `tailwind.config.ts` uses Inter, Cormorant Garamond, and IBM Plex Mono in the app font stack.

The CSP was updated to allow:

- `https://fonts.googleapis.com` in `style-src`
- `https://fonts.gstatic.com` in `font-src`

## 4. glossary_terms.sort_order Fix

Created `supabase/migrations/20260516230000_add_glossary_terms_sort_order.sql`.

The migration adds `public.glossary_terms.sort_order`, creates `glossary_terms_sort_order_idx`, and safely backfills existing null values to `0`. This matches the runtime query in `src/lib/contentRepo.ts`.

## 5. quote_question_links Decision and Fix

Question-specific quote links are in scope because `src/lib/planFetches.ts` has a primary question-aware quote retrieval path and a separate theme-overlap fallback.

Created `supabase/migrations/20260516230100_create_quote_question_links.sql`.

The migration creates `public.quote_question_links` with text foreign keys to `public.quote_methods(id)` and `public.questions(id)`, uniqueness on `(quote_id, question_id)`, lookup indexes, RLS, public read access for anon/authenticated roles, and admin-only writes. Service role remains able to manage data through normal Supabase RLS bypass.

## 6. Leaked-Password Protection Decision

Recorded in `docs/AUTH_SECURITY_DECISION_2026_05_16.md`.

Leaked-password protection is deferred because this task was not allowed to change Supabase dashboard settings. Compensating controls: email confirmation, private/small-user staging posture, and strong-password guidance for pilot accounts.

## 7. Verification Results

- `npm run typecheck`: pass.
- `npm run lint`: pass with 23 existing warnings, no errors.
- `npm test`: pass, 13 files passed and 1 skipped; 79 tests passed and 3 skipped.
- `npm run build`: pass. Vite reported the existing large chunk warning and stale Browserslist data notice.
- `supabase db lint --local`: not completed because no local Supabase Postgres was running on `127.0.0.1:54322`.
- Dev server: running at `http://127.0.0.1:8080/`.
- Local HTTP smoke: `curl -I http://127.0.0.1:8080/` returned `HTTP/1.1 200 OK`.

## 8. Remaining Risks

- The new migrations have not been applied to the target Supabase project in this run.
- The deployed Netlify app has not been re-smoked after deployment.
- Existing lint warnings remain outside the scope of this remediation.
- Supabase leaked-password protection still needs a dashboard enablement decision before a wider pilot.

## 9. Content Import Gate

Do not import content yet on the target project.

The repo is ready for the next controlled step: apply these migrations to the intended Supabase environment, deploy the CSP change, rerun the browser smoke, then reopen the content import gate if `glossary_terms` and `quote_question_links` return cleanly.
