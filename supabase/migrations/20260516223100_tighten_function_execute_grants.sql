-- Tighten EXECUTE grants on SECURITY DEFINER functions without changing bodies.
-- has_role(uuid, app_role) intentionally remains callable by anon/authenticated:
-- public read policies use it in OR predicates such as published = true OR has_role(...).

do $$
begin
  if to_regprocedure('public.handle_new_user()') is not null then
    execute 'revoke execute on function public.handle_new_user() from public';
    execute 'revoke execute on function public.handle_new_user() from anon';
    execute 'revoke execute on function public.handle_new_user() from authenticated';
    comment on function public.handle_new_user() is
      'Auth trigger only. Direct EXECUTE revoked from public, anon, and authenticated.';
  end if;

  if to_regprocedure('public.is_owner(uuid, text)') is not null then
    execute 'revoke execute on function public.is_owner(uuid, text) from public';
    execute 'revoke execute on function public.is_owner(uuid, text) from anon';
    execute 'grant execute on function public.is_owner(uuid, text) to authenticated';
    comment on function public.is_owner(uuid, text) is
      'Authenticated ownership helper for RLS policies. Anonymous EXECUTE remains revoked.';
  end if;

  if to_regprocedure('public.get_next_best_action(uuid)') is not null then
    execute 'revoke execute on function public.get_next_best_action(uuid) from public';
    execute 'revoke execute on function public.get_next_best_action(uuid) from anon';
    execute 'grant execute on function public.get_next_best_action(uuid) to authenticated';
    comment on function public.get_next_best_action(uuid) is
      'Student dashboard RPC. Callable by authenticated users only; function body enforces target_student_id = auth.uid().';
  end if;

  if to_regprocedure('public.get_user_emails(uuid[])') is not null then
    execute 'revoke execute on function public.get_user_emails(uuid[]) from public';
    execute 'revoke execute on function public.get_user_emails(uuid[]) from anon';
    execute 'grant execute on function public.get_user_emails(uuid[]) to authenticated';
    comment on function public.get_user_emails(uuid[]) is
      'Admin-only email lookup RPC. Callable by authenticated users only; function body returns rows only for admins.';
  end if;
end $$;
