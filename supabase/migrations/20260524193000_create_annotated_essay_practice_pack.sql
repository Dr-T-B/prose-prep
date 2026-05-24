-- Annotated Paper 2 Essay Practice Pack — Hard Times / Atonement
-- Schema-only migration. Seed content is held in 20260524194500_seed_annotated_essay_practice_pack.sql.
-- and mirrored in src/data/annotatedEssayPracticePack for local fallback/UI tests.

begin;

create table if not exists public.essay_questions (
  id text primary key,
  paper_code text not null default '9ET0/02',
  component text not null default 'Component 2 — Prose',
  exam_board text not null default 'Pearson Edexcel',
  year text,
  question_text text not null,
  theme text not null,
  marks integer not null default 40,
  text_pair text not null default 'Hard Times / Atonement',
  pre_1900_text text not null default 'Hard Times',
  post_1900_text text not null default 'Atonement',
  ao_requirements text[] not null default array['AO1','AO2','AO3','AO4'],
  difficulty_level text not null,
  question_family text not null,
  likely_routes text[] not null default '{}',
  linked_quote_cluster_ids text[] not null default '{}',
  linked_paragraph_stem_ids text[] not null default '{}',
  pitfalls text[] not null default '{}',
  level_5_upgrade_moves text[] not null default '{}',
  source text not null default 'ChatGPT session, 24 May 2026',
  content_type text not null default 'annotated essay practice',
  verification_status text not null default 'teacher review required',
  reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint essay_questions_component2_aos_no_ao5
    check (ao_requirements <@ array['AO1','AO2','AO3','AO4']::text[]),
  constraint essay_questions_component2_marks check (marks = 40)
);

create table if not exists public.annotated_essays (
  id text primary key,
  question_id text not null references public.essay_questions(id) on delete cascade,
  title text not null,
  essay_type text not null,
  target_band text not null,
  estimated_mark_range text,
  timed_condition_minutes integer not null default 60,
  word_count_band text not null,
  thesis text not null,
  full_essay_text text not null,
  examiner_summary text not null,
  strengths text[] not null default '{}',
  risks text[] not null default '{}',
  upgrade_targets text[] not null default '{}',
  student_realism_note text,
  source text not null default 'ChatGPT session, 24 May 2026',
  content_type text not null default 'annotated essay practice',
  verification_status text not null default 'teacher review required',
  reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.essay_paragraphs (
  id text primary key,
  essay_id text not null references public.annotated_essays(id) on delete cascade,
  paragraph_number integer not null,
  paragraph_function text not null,
  comparative_focus text not null,
  main_argument text not null,
  hard_times_focus text,
  atonement_focus text,
  key_methods text[] not null default '{}',
  key_contexts text[] not null default '{}',
  paragraph_text text not null,
  ao_coverage text[] not null default '{}',
  examiner_comment text,
  upgrade_target text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (essay_id, paragraph_number),
  constraint essay_paragraphs_component2_aos_no_ao5
    check (ao_coverage <@ array['AO1','AO2','AO3','AO4']::text[])
);

create table if not exists public.ao_annotations (
  id text primary key,
  essay_id text not null references public.annotated_essays(id) on delete cascade,
  paragraph_id text not null references public.essay_paragraphs(id) on delete cascade,
  annotation_order integer not null,
  text_span text not null,
  ao_tags text[] not null default '{}',
  explanation text not null,
  why_it_scores text not null,
  improvement_note text,
  annotation_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (essay_id, annotation_order),
  constraint ao_annotations_component2_aos_no_ao5
    check (ao_tags <@ array['AO1','AO2','AO3','AO4']::text[]),
  constraint ao_annotations_type_allowed
    check (annotation_type in (
      'thesis',
      'topic sentence',
      'AO2 method',
      'AO3 context',
      'AO4 comparison',
      'evidence use',
      'evaluative comment',
      'structural link',
      'conclusion'
    ))
);

-- Extend the existing paragraph_stems table rather than duplicating it.
alter table public.paragraph_stems
  add column if not exists theme text,
  add column if not exists question_family text,
  add column if not exists compatible_characters text[] not null default '{}',
  add column if not exists compatible_quotes text[] not null default '{}',
  add column if not exists method_triggers text[] not null default '{}',
  add column if not exists context_route text,
  add column if not exists comparison_route text,
  add column if not exists drill_instruction text,
  add column if not exists timed_target_minutes integer,
  add column if not exists source text not null default 'ChatGPT session, 24 May 2026',
  add column if not exists content_type text not null default 'annotated essay practice',
  add column if not exists verification_status text not null default 'teacher review required',
  add column if not exists reviewed boolean not null default false;

create table if not exists public.quote_method_links (
  id text primary key,
  quotation text not null,
  speaker_or_narrative_location text,
  text text not null,
  character text,
  method text not null,
  theme text not null,
  essay_question_id text references public.essay_questions(id) on delete set null,
  paragraph_stem_id text references public.paragraph_stems(id) on delete set null,
  ao2_explanation text not null,
  ao4_comparative_partner text,
  quote_type text not null default 'quote anchor / paraphrase',
  verification_status text not null default 'teacher review required',
  source text not null default 'ChatGPT session, 24 May 2026',
  content_type text not null default 'annotated essay practice',
  reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.misconception_upgrades (
  id text primary key,
  weakness text not null,
  diagnosis text not null,
  example_problem_sentence text not null,
  improved_level_5_version text not null,
  linked_drill_id text references public.paragraph_stems(id) on delete set null,
  source text not null default 'ChatGPT session, 24 May 2026',
  content_type text not null default 'annotated essay practice',
  verification_status text not null default 'teacher review required',
  reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_essay_questions_theme on public.essay_questions(theme);
create index if not exists idx_essay_questions_family on public.essay_questions(question_family);
create index if not exists idx_annotated_essays_question_id on public.annotated_essays(question_id);
create index if not exists idx_essay_paragraphs_essay_id on public.essay_paragraphs(essay_id);
create index if not exists idx_ao_annotations_essay_id on public.ao_annotations(essay_id);
create index if not exists idx_ao_annotations_paragraph_id on public.ao_annotations(paragraph_id);
create index if not exists idx_quote_method_links_question on public.quote_method_links(essay_question_id);
create index if not exists idx_quote_method_links_stem on public.quote_method_links(paragraph_stem_id);
create index if not exists idx_misconception_upgrades_drill on public.misconception_upgrades(linked_drill_id);

alter table public.essay_questions enable row level security;
alter table public.annotated_essays enable row level security;
alter table public.essay_paragraphs enable row level security;
alter table public.ao_annotations enable row level security;
alter table public.quote_method_links enable row level security;
alter table public.misconception_upgrades enable row level security;

drop policy if exists essay_questions_public_select on public.essay_questions;
create policy essay_questions_public_select
  on public.essay_questions for select
  to anon, authenticated
  using (true);

drop policy if exists annotated_essays_public_select on public.annotated_essays;
create policy annotated_essays_public_select
  on public.annotated_essays for select
  to anon, authenticated
  using (true);

drop policy if exists essay_paragraphs_public_select on public.essay_paragraphs;
create policy essay_paragraphs_public_select
  on public.essay_paragraphs for select
  to anon, authenticated
  using (true);

drop policy if exists ao_annotations_public_select on public.ao_annotations;
create policy ao_annotations_public_select
  on public.ao_annotations for select
  to anon, authenticated
  using (true);

drop policy if exists quote_method_links_public_select on public.quote_method_links;
create policy quote_method_links_public_select
  on public.quote_method_links for select
  to anon, authenticated
  using (true);

drop policy if exists misconception_upgrades_public_select on public.misconception_upgrades;
create policy misconception_upgrades_public_select
  on public.misconception_upgrades for select
  to anon, authenticated
  using (true);

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'set_updated_at'
      and p.pronargs = 0
  ) then
    drop trigger if exists set_updated_at_essay_questions on public.essay_questions;
    create trigger set_updated_at_essay_questions
      before update on public.essay_questions
      for each row execute function public.set_updated_at();

    drop trigger if exists set_updated_at_annotated_essays on public.annotated_essays;
    create trigger set_updated_at_annotated_essays
      before update on public.annotated_essays
      for each row execute function public.set_updated_at();

    drop trigger if exists set_updated_at_essay_paragraphs on public.essay_paragraphs;
    create trigger set_updated_at_essay_paragraphs
      before update on public.essay_paragraphs
      for each row execute function public.set_updated_at();

    drop trigger if exists set_updated_at_ao_annotations on public.ao_annotations;
    create trigger set_updated_at_ao_annotations
      before update on public.ao_annotations
      for each row execute function public.set_updated_at();

    drop trigger if exists set_updated_at_quote_method_links on public.quote_method_links;
    create trigger set_updated_at_quote_method_links
      before update on public.quote_method_links
      for each row execute function public.set_updated_at();

    drop trigger if exists set_updated_at_misconception_upgrades on public.misconception_upgrades;
    create trigger set_updated_at_misconception_upgrades
      before update on public.misconception_upgrades
      for each row execute function public.set_updated_at();
  end if;
end $$;

commit;
