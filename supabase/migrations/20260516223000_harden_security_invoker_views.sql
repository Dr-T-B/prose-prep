-- Harden dashboard/retrieval views so table RLS is evaluated as the caller.
-- Safe to run repeatedly; skips objects that are not ordinary views.

do $$
declare
  view_name text;
begin
  foreach view_name in array array[
    'v_student_recent_paragraphs',
    'v_student_quote_pair_progress',
    'retrieval_due_today'
  ]
  loop
    if exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = view_name
        and c.relkind = 'v'
    ) then
      execute format('alter view public.%I set (security_invoker = true)', view_name);
      execute format(
        'comment on view public.%I is %L',
        view_name,
        'Student dashboard/retrieval view. Hardened with security_invoker=true so underlying table RLS applies to the caller.'
      );
    end if;
  end loop;
end $$;
