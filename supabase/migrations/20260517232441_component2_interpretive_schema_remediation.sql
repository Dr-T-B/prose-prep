-- Component 2 Prose interpretive schema remediation.
-- Forward-only add/copy/deprecate migration for staging review.
-- Do not drop legacy AO5 objects in this pass.

create table if not exists public.interpretive_tensions (
  id text primary key,
  focus text not null,
  dominant_reading text not null,
  alternative_reading text not null,
  interpretive_stem text not null,
  best_use text[] not null default '{}',
  level_tag text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if to_regclass('public.ao5_tensions') is not null then
    insert into public.interpretive_tensions (
      id,
      focus,
      dominant_reading,
      alternative_reading,
      interpretive_stem,
      best_use,
      level_tag,
      created_at,
      updated_at
    )
    select
      id,
      focus,
      dominant_reading,
      alternative_reading,
      safe_stem,
      best_use,
      level_tag,
      created_at,
      updated_at
    from public.ao5_tensions
    on conflict (id) do update set
      focus = excluded.focus,
      dominant_reading = excluded.dominant_reading,
      alternative_reading = excluded.alternative_reading,
      interpretive_stem = excluded.interpretive_stem,
      best_use = excluded.best_use,
      level_tag = excluded.level_tag,
      updated_at = excluded.updated_at;
  end if;
end $$;

alter table public.interpretive_tensions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'interpretive_tensions'
      and policyname = 'interpretive_tensions_read_all'
  ) then
    create policy interpretive_tensions_read_all
      on public.interpretive_tensions
      for select
      using (true);
  end if;

  if to_regprocedure('public.is_admin(uuid)') is not null then
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'interpretive_tensions'
        and policyname = 'interpretive_tensions_admin_insert'
    ) then
      create policy interpretive_tensions_admin_insert
        on public.interpretive_tensions
        for insert
        with check (public.is_admin(auth.uid()));
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'interpretive_tensions'
        and policyname = 'interpretive_tensions_admin_update'
    ) then
      create policy interpretive_tensions_admin_update
        on public.interpretive_tensions
        for update
        using (public.is_admin(auth.uid()))
        with check (public.is_admin(auth.uid()));
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'interpretive_tensions'
        and policyname = 'interpretive_tensions_admin_delete'
    ) then
      create policy interpretive_tensions_admin_delete
        on public.interpretive_tensions
        for delete
        using (public.is_admin(auth.uid()));
    end if;
  end if;
end $$;

drop trigger if exists set_updated_at_interpretive_tensions on public.interpretive_tensions;
create trigger set_updated_at_interpretive_tensions
before update on public.interpretive_tensions
for each row execute function public.update_updated_at_column();

alter table public.essay_plans
  add column if not exists interpretive_extension_enabled boolean not null default false,
  add column if not exists selected_interpretive_extension_ids jsonb not null default '[]'::jsonb;

update public.essay_plans
set
  interpretive_extension_enabled = coalesce(ao5_enabled, false),
  selected_interpretive_extension_ids = coalesce(selected_ao5_ids, '[]'::jsonb)
where
  interpretive_extension_enabled is distinct from coalesce(ao5_enabled, false)
  or selected_interpretive_extension_ids is distinct from coalesce(selected_ao5_ids, '[]'::jsonb);

alter table public.saved_essay_plans
  add column if not exists interpretive_extension_enabled boolean not null default false,
  add column if not exists selected_interpretive_extension_ids text[] not null default '{}';

update public.saved_essay_plans
set
  interpretive_extension_enabled = coalesce(ao5_enabled, false),
  selected_interpretive_extension_ids = coalesce(selected_ao5_ids, '{}')
where
  interpretive_extension_enabled is distinct from coalesce(ao5_enabled, false)
  or selected_interpretive_extension_ids is distinct from coalesce(selected_ao5_ids, '{}');

alter table public.library_paragraph_frames
  add column if not exists interpretive_stem text;

update public.library_paragraph_frames
set interpretive_stem = ao5_stem
where interpretive_stem is null and ao5_stem is not null;

alter table public.paragraph_attempts
  add column if not exists interpretive_judgement text,
  add column if not exists ao1_sophistication_self_score integer
    check (ao1_sophistication_self_score between 1 and 5);

update public.paragraph_attempts
set
  interpretive_judgement = ao5_evaluation,
  ao1_sophistication_self_score = ao5_self_score
where
  (interpretive_judgement is null and ao5_evaluation is not null)
  or (ao1_sophistication_self_score is null and ao5_self_score is not null);

alter table public.quote_pairs
  add column if not exists interpretive_tension text;

update public.quote_pairs
set interpretive_tension = ao5_tension
where interpretive_tension is null and ao5_tension is not null;

alter table public.thesis_routes
  add column if not exists interpretive_tension text;

update public.thesis_routes
set interpretive_tension = ao5_tension
where interpretive_tension is null and ao5_tension is not null;

alter table public.student_quote_pair_mastery
  add column if not exists interpretive_secure boolean not null default false;

update public.student_quote_pair_mastery
set interpretive_secure = coalesce(ao5_secure, false)
where interpretive_secure is distinct from coalesce(ao5_secure, false);

do $$
begin
  if to_regclass('public.retrieval_items') is not null then
    alter table public.retrieval_items
      drop constraint if exists retrieval_items_item_type_check;

    alter table public.retrieval_items
      add constraint retrieval_items_item_type_check check (item_type = any (array[
        'quote',
        'glossary',
        'context',
        'pairing',
        'thesis',
        'ao5_tension',
        'interpretive_tension',
        'theme_reframe',
        'conceptual_upgrade'
      ]));
  end if;
end $$;

create or replace view public.retrieval_due_today as
  select
    ri.id as retrieval_item_id,
    ri.user_id,
    case
      when ri.item_type = 'ao5_tension' then 'interpretive_tension'
      else ri.item_type
    end as item_type,
    ri.item_id,
    ri.ease_factor,
    ri.interval_days,
    ri.repetitions,
    ri.next_review_at,
    ri.last_reviewed_at,
    ri.total_reviews,
    ri.correct_reviews,
    round(
      case
        when ri.total_reviews = 0 then 0::numeric
        else (ri.correct_reviews::numeric / ri.total_reviews::numeric) * 100::numeric
      end
    ) as accuracy_pct,
    coalesce(qm.quote_text, gt.term, lcb.context_point, cm.axis, th.thesis_text, it.focus) as item_label,
    coalesce(qm.source_text, gt.source_text, lcb.source_text, cm.axis, null::text) as source_text,
    coalesce(gt.category, lcb.context_type) as item_category
  from public.retrieval_items ri
    left join public.quote_methods qm on ri.item_type = 'quote' and ri.item_id = qm.id
    left join public.glossary_terms gt on ri.item_type = 'glossary' and ri.item_id = gt.id
    left join public.library_context_bank lcb on ri.item_type = 'context' and ri.item_id = lcb.id::text
    left join public.comparative_matrix cm on ri.item_type = 'pairing' and ri.item_id = cm.id
    left join public.theses th on ri.item_type = 'thesis' and ri.item_id = th.id
    left join public.interpretive_tensions it
      on ri.item_type in ('interpretive_tension', 'ao5_tension')
     and ri.item_id = it.id
  where ri.next_review_at <= now();

create or replace view public.v_student_quote_pair_progress as
select
  m.student_id,
  m.quote_pair_id,
  qp.quote_pair_code,
  qp.theme_label,
  qp.hard_times_quote,
  qp.atonement_quote,
  qp.student_action,
  qp.why_useful_in_essay,
  m.mastery_status,
  m.confidence_score,
  m.used_in_plan_count,
  m.used_in_paragraph_count,
  m.used_in_essay_count,
  m.ao2_secure,
  m.ao3_secure,
  m.ao4_secure,
  m.ao5_secure,
  m.needs_review,
  m.last_practised_at,
  m.updated_at,
  m.interpretive_secure
from public.student_quote_pair_mastery m
join public.quote_pairs qp on qp.id = m.quote_pair_id;

create or replace view public.v_student_recent_paragraphs as
select
  pa.id,
  pa.student_id,
  pa.quote_pair_id,
  qp.quote_pair_code,
  qp.theme_label,
  pa.final_paragraph,
  pa.draft_status,
  pa.ao1_self_score,
  pa.ao2_self_score,
  pa.ao3_self_score,
  pa.ao4_self_score,
  pa.ao5_self_score,
  pa.improvement_target,
  pa.created_at,
  pa.ao1_sophistication_self_score
from public.paragraph_attempts pa
left join public.quote_pairs qp on qp.id = pa.quote_pair_id;

alter view public.retrieval_due_today set (security_invoker = true);
alter view public.v_student_quote_pair_progress set (security_invoker = true);
alter view public.v_student_recent_paragraphs set (security_invoker = true);

comment on table public.interpretive_tensions is
  'Component 2 Prose interpretive extension tensions. Replaces the legacy AO5-named content table.';
comment on table public.ao5_tensions is
  'Deprecated legacy AO5 name. Component 2 Prose must use public.interpretive_tensions.';
comment on column public.essay_plans.ao5_enabled is
  'Deprecated legacy AO5 name. Use interpretive_extension_enabled for Component 2 Prose.';
comment on column public.essay_plans.selected_ao5_ids is
  'Deprecated legacy AO5 name. Use selected_interpretive_extension_ids for Component 2 Prose.';
comment on column public.saved_essay_plans.ao5_enabled is
  'Deprecated legacy AO5 name. Use interpretive_extension_enabled for Component 2 Prose.';
comment on column public.saved_essay_plans.selected_ao5_ids is
  'Deprecated legacy AO5 name. Use selected_interpretive_extension_ids for Component 2 Prose.';
comment on column public.library_paragraph_frames.ao5_stem is
  'Deprecated legacy AO5 name. Use interpretive_stem for Component 2 Prose.';
comment on column public.paragraph_attempts.ao5_evaluation is
  'Deprecated legacy AO5 name. Use interpretive_judgement for Component 2 Prose.';
comment on column public.paragraph_attempts.ao5_self_score is
  'Deprecated legacy AO5 name. Use ao1_sophistication_self_score for Component 2 Prose.';
comment on column public.quote_pairs.ao5_tension is
  'Deprecated legacy AO5 name. Use interpretive_tension for Component 2 Prose.';
comment on column public.thesis_routes.ao5_tension is
  'Deprecated legacy AO5 name. Use interpretive_tension for Component 2 Prose.';
comment on column public.student_quote_pair_mastery.ao5_secure is
  'Deprecated legacy AO5 name. Use interpretive_secure for Component 2 Prose.';
