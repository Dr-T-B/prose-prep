-- Question-aware quote links for the essay planner primary quote retrieval path.
-- Contains study-content IDs only; writes remain limited to admins/service role.

create table if not exists public.quote_question_links (
  id uuid primary key default gen_random_uuid(),
  quote_id text not null references public.quote_methods(id) on delete cascade,
  question_id text not null references public.questions(id) on delete cascade,
  relevance_score integer,
  rationale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (quote_id, question_id)
);

create index if not exists quote_question_links_question_id_idx
  on public.quote_question_links (question_id);

create index if not exists quote_question_links_quote_id_idx
  on public.quote_question_links (quote_id);

alter table public.quote_question_links enable row level security;

create policy "quote_question_links_public_select"
  on public.quote_question_links for select
  to anon, authenticated
  using (true);

create policy "quote_question_links_admin_insert"
  on public.quote_question_links for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

create policy "quote_question_links_admin_update"
  on public.quote_question_links for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

create policy "quote_question_links_admin_delete"
  on public.quote_question_links for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'update_updated_at_column'
      and p.pronargs = 0
  ) then
    drop trigger if exists quote_question_links_set_updated_at on public.quote_question_links;
    create trigger quote_question_links_set_updated_at
      before update on public.quote_question_links
      for each row execute function public.update_updated_at_column();
  end if;
end $$;
