The browser smoke report is useful and changes the gate status.

Overall status: **PASS WITH NOTES, BUT CONTENT IMPORT SHOULD REMAIN PAUSED.**

The app itself is broadly working: anonymous local-only mode passed, authenticated login passed with a manual test-user setup, dashboard loading passed, cloud save passed, and Supabase connectivity mostly passed. The disposable smoke user/test rows were also cleaned up afterward. 

However, the report identifies three issues that should be resolved or formally accepted before content import:

First, **CSP is not clean**. Google Fonts requests are blocked because `style-src` does not allow `fonts.googleapis.com`, and `font-src` does not allow `fonts.gstatic.com`. The app still renders, but this is a deployment hygiene issue. 

Second, **`glossary_terms` has a schema/query mismatch**. The app queries `glossary_terms.sort_order`, but the column does not exist. This matters because `glossary_terms` is one of the planned import targets. This should be fixed before importing glossary content. 

Third, **`quote_question_links` is missing**. The app requests the table, Supabase returns `404/PGRST205`, and the app falls back to theme-based retrieval. This is not immediately fatal, but it needs a decision: either create/import `quote_question_links`, or remove/gate that query if question-specific quote links are not in scope. 

The remaining Supabase `SECURITY DEFINER` warnings have now been assessed and accepted as documented exceptions for staging content import. The report gives a function-by-function rationale: `handle_new_user`, `has_role`, `is_owner`, `get_next_best_action`, and `get_user_emails` are accepted, with notes for `has_role` and `get_user_emails`. 

Recommended next Codex prompt:

````markdown id="u36gci"
# Codex Prompt — Fix Browser Smoke Schema/CSP Issues Before Content Import

## Role

You are acting as a senior full-stack engineer and Supabase schema reviewer for the Prose Tutor app.

## Objective

Fix or formally gate the remaining browser-smoke issues before content import.

Target repo:

```text
https://github.com/Dr-T-B/prose-prep
````

Target app:

```text
https://prosetutor.netlify.app
```

Supabase project:

```text
nxlxunygoccbnzdopqna
```

## Source Report

Use the report:

```text
docs/BROWSER_SMOKE_SUPABASE_ADVISOR_DECISION_REPORT_2026_05_16.md
```

The report found:

1. CSP blocks Google Fonts.
2. `glossary_terms.sort_order` is queried but the column does not exist.
3. `quote_question_links` is queried but the table does not exist.
4. Remaining Supabase Advisor callable `SECURITY DEFINER` warnings are accepted as documented staging exceptions.
5. Leaked-password protection should be enabled if available, or explicitly deferred.

## Safety Rules

Do not import content.

Do not delete tables.

Do not truncate data.

Do not expose secrets.

Do not read or print `.env` values.

All database schema changes must be made through new Supabase migration files.

Do not apply migrations to production unless explicitly instructed.

## Phase 1 — Fix CSP Google Fonts Issue

Inspect:

```text
netlify.toml
src
index.html
```

Determine whether the app actually uses Google Fonts.

If Google Fonts are required, update the CSP to allow:

```text
https://fonts.googleapis.com
https://fonts.gstatic.com
```

Likely CSP additions:

```text
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' data: https://fonts.gstatic.com;
```

If Google Fonts are not required, remove the font import instead and keep CSP tighter.

After the change, document the decision.

## Phase 2 — Fix glossary_terms.sort_order Mismatch

Inspect all references to:

```text
glossary_terms
sort_order
```

Check migrations and generated Supabase types.

Because `glossary_terms` is a planned content import target, prefer a schema-level fix if the UI expects ordered glossary terms.

Create a migration:

```text
supabase/migrations/YYYYMMDDHHMMSS_add_glossary_terms_sort_order.sql
```

Add a nullable or defaulted integer column:

```sql
alter table public.glossary_terms
add column if not exists sort_order integer;

create index if not exists glossary_terms_sort_order_idx
on public.glossary_terms (sort_order);
```

If existing rows need stable ordering, use a non-destructive backfill only if safe. Do not overwrite meaningful values.

Example safe default:

```sql
update public.glossary_terms
set sort_order = 0
where sort_order is null;
```

Only do this if existing row semantics do not require a better ordering.

Regenerate Supabase types if the project has a type generation script.

Update tests if needed.

## Phase 3 — Decide and Fix quote_question_links

Inspect the app query that requests:

```text
quote_question_links?select=quote_id&question_id=eq.q_class_1
```

Decide whether question-specific quote links are intended.

If yes, create a migration for:

```text
public.quote_question_links
```

Recommended schema:

```sql
create table if not exists public.quote_question_links (
  id uuid primary key default gen_random_uuid(),
  quote_id text not null,
  question_id text not null,
  relevance_score integer,
  rationale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (quote_id, question_id)
);
```

Add indexes:

```sql
create index if not exists quote_question_links_question_id_idx
on public.quote_question_links (question_id);

create index if not exists quote_question_links_quote_id_idx
on public.quote_question_links (quote_id);
```

Then add appropriate RLS:

* published content/question-link rows can be readable by anonymous users if they contain only study content;
* write access should be restricted to admin/service role only;
* do not allow anonymous or ordinary authenticated users to insert/update/delete.

If existing quote/question tables use UUIDs rather than text IDs, use the correct column types and foreign keys. Do not guess. Inspect the existing schema before writing the migration.

If no, remove or gate the frontend query so it does not repeatedly call a missing table. Preserve theme-based fallback.

Document the decision clearly.

## Phase 4 — Leaked-Password Protection Decision

Do not change Supabase dashboard settings unless explicitly instructed.

Add a note to:

```text
docs/BROWSER_SMOKE_SUPABASE_ADVISOR_DECISION_REPORT_2026_05_16.md
```

or create:

```text
docs/AUTH_SECURITY_DECISION_2026_05_16.md
```

Record one of:

```text
Leaked-password protection enabled.
```

or:

```text
Leaked-password protection deferred because [reason]. Compensating controls: email confirmation, private/small-user app, strong-password guidance.
```

## Phase 5 — Verification

Run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

If Supabase CLI is available, run local migration validation if safe.

Do not import content.

## Phase 6 — Final Report

Create:

```text
docs/BROWSER_SMOKE_REMEDIATION_REPORT_2026_05_16.md
```

Include:

```markdown
# Browser Smoke Remediation Report — 2026-05-16

## 1. Summary Verdict

## 2. Files Changed

## 3. CSP Decision and Fix

## 4. glossary_terms.sort_order Fix

## 5. quote_question_links Decision and Fix

## 6. Leaked-Password Protection Decision

## 7. Verification Results

## 8. Remaining Risks

## 9. Content Import Gate
```

## Acceptance Criteria

The task is complete when:

1. CSP no longer blocks required Google Fonts, or Google Fonts imports are removed.
2. `glossary_terms.sort_order` mismatch is fixed by migration or app query correction.
3. `quote_question_links` is either created with safe RLS or the frontend query is removed/gated.
4. Remaining Supabase Advisor function warnings remain documented as accepted exceptions.
5. Leaked-password protection has an explicit enable/defer decision.
6. Typecheck, tests, and build pass.
7. No content has been imported.
8. A remediation report exists.

## Final Response

Respond with:

1. Overall result.
2. Files changed.
3. Migrations created.
4. Commands run and results.
5. Whether content import may now proceed.

```

My recommendation: run that narrowly scoped remediation before content import. The only blocker I would prioritise heavily is `glossary_terms.sort_order`, because it directly affects one of the planned import targets.
```
