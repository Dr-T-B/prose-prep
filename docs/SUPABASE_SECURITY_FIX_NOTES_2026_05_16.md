# Supabase Security Fix Notes — 2026-05-16

## Views Hardened

Migration `20260516223000_harden_security_invoker_views.sql` sets `security_invoker = true` on these ordinary public views when present:

- `public.v_student_recent_paragraphs`
- `public.v_student_quote_pair_progress`
- `public.retrieval_due_today`

This keeps student dashboard and retrieval reads subject to the caller's underlying table RLS policies instead of the view owner's privileges.

## Functions Reviewed

Migration `20260516223100_tighten_function_execute_grants.sql` changes or confirms grants for:

- `public.handle_new_user()`: direct public, anon, and authenticated execution revoked; retained for the auth trigger.
- `public.is_owner(uuid, text)`: public and anon execution revoked; authenticated execution retained for RLS policies.
- `public.get_next_best_action(uuid)`: public and anon execution revoked; authenticated execution retained.
- `public.get_user_emails(uuid[])`: public and anon execution revoked; authenticated execution retained, with admin filtering still enforced inside the function.
- `public.has_role(uuid, public.app_role)`: reviewed but not tightened further because published-content RLS policies call it in public-read predicates.

## Safe Manual Verification SQL

```sql
select
  n.nspname as schema_name,
  c.relname as view_name,
  c.reloptions
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'v_student_recent_paragraphs',
    'v_student_quote_pair_progress',
    'retrieval_due_today'
  );
```

```sql
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  p.proacl as grants
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'has_role',
    'is_owner',
    'handle_new_user',
    'get_next_best_action',
    'get_user_emails'
  )
order by p.proname, arguments;
```

```sql
select schemaname, viewname, viewowner
from pg_views
where schemaname = 'public'
  and viewname in (
    'v_student_recent_paragraphs',
    'v_student_quote_pair_progress',
    'retrieval_due_today'
  );
```

## Advisor Checks To Rerun

- Supabase Security Advisor after applying migrations.
- RLS policy smoke checks for student progress tables.
- Authenticated dashboard RPC call for `get_next_best_action`.
- Anonymous read smoke checks for published content tables.

## Risks And Limits

The migrations were authored locally and were not applied to the live Supabase project. Live verification still needs to be run by an operator with Supabase project access.
