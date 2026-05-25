-- Annotated Essay Pack — content review and promotion workflow.
--
-- Extends the six tables introduced in 20260524193000_create_annotated_essay_practice_pack.sql
-- with reviewer metadata, locks verification_status to a canonical six-value set, and replaces
-- the permissive read-all policies with stricter ones: students see only content that is safe
-- to surface (approved / reviewed / teacher review required); admins can read and update
-- everything via has_role(auth.uid(),'admin').
--
-- Status vocabulary:
--   draft                    — incomplete or internal-only; hidden from students
--   teacher review required  — visible but flagged as unverified (default for seeded rows)
--   reviewed                 — checked for basic accuracy; student-safe
--   approved                 — ready for student-facing final use; student-safe
--   needs correction         — flagged; visible but should be paired with a warning in UI
--   retired                  — hidden from normal student workflows; retained for audit

begin;

-- 1. Add reviewer metadata. All columns are nullable so existing rows are unaffected.
do $$
declare
  t text;
  tbls text[] := array[
    'essay_questions',
    'annotated_essays',
    'essay_paragraphs',
    'ao_annotations',
    'paragraph_stems',
    'quote_method_links',
    'misconception_upgrades'
  ];
begin
  foreach t in array tbls loop
    execute format($f$
      alter table public.%I
        add column if not exists verification_status text not null default 'teacher review required',
        add column if not exists reviewed boolean not null default false,
        add column if not exists reviewed_at timestamptz,
        add column if not exists reviewed_by uuid,
        add column if not exists approved_at timestamptz,
        add column if not exists approved_by uuid,
        add column if not exists review_notes text,
        add column if not exists correction_notes text
    $f$, t);
  end loop;
end $$;

-- 2. Lock verification_status to the canonical six-value set on every pack table.
--    Existing seeded rows all use 'teacher review required' so the constraints validate cleanly.
do $$
declare
  t text;
  tbls text[] := array[
    'essay_questions',
    'annotated_essays',
    'essay_paragraphs',
    'ao_annotations',
    'paragraph_stems',
    'quote_method_links',
    'misconception_upgrades'
  ];
  con text;
begin
  foreach t in array tbls loop
    con := t || '_verification_status_allowed';
    execute format('alter table public.%I drop constraint if exists %I', t, con);
    execute format($f$
      alter table public.%I
        add constraint %I
        check (verification_status in (
          'draft',
          'teacher review required',
          'reviewed',
          'approved',
          'needs correction',
          'retired'
        ))
    $f$, t, con);
  end loop;
end $$;

-- 3. Replace the permissive "select using true" policies with student-visibility rules.
--    Admins keep full read via has_role(); students get approved/reviewed/teacher-review-required
--    + needs-correction (the UI surfaces a warning). Drafts and retired rows are hidden.
do $$
declare
  t text;
  tbls text[] := array[
    'essay_questions',
    'annotated_essays',
    'essay_paragraphs',
    'ao_annotations',
    'paragraph_stems',
    'quote_method_links',
    'misconception_upgrades'
  ];
  select_policy text;
  admin_select_policy text;
  admin_update_policy text;
begin
  foreach t in array tbls loop
    select_policy := t || '_public_select';
    admin_select_policy := t || '_admin_select';
    admin_update_policy := t || '_admin_update';

    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', select_policy, t);
    -- paragraph_stems had a legacy public-read policy with a different name.
    -- Drop it so draft/retired stems cannot bypass the canonical status filter.
    if t = 'paragraph_stems' then
      drop policy if exists "Public read paragraph_stems" on public.paragraph_stems;
    end if;
    execute format($f$
      create policy %I on public.%I for select to anon, authenticated
        using (
          coalesce(verification_status, 'teacher review required') in (
            'approved',
            'reviewed',
            'teacher review required',
            'needs correction'
          )
        )
    $f$, select_policy, t);

    execute format('drop policy if exists %I on public.%I', admin_select_policy, t);
    execute format($f$
      create policy %I on public.%I for select to authenticated
        using (public.has_role(auth.uid(), 'admin'::app_role))
    $f$, admin_select_policy, t);

    execute format('drop policy if exists %I on public.%I', admin_update_policy, t);
    execute format($f$
      create policy %I on public.%I for update to authenticated
        using (public.has_role(auth.uid(), 'admin'::app_role))
        with check (public.has_role(auth.uid(), 'admin'::app_role))
    $f$, admin_update_policy, t);
  end loop;
end $$;

-- 4. Reviewer metadata indexes for the admin queue.
create index if not exists idx_essay_questions_verification_status      on public.essay_questions(verification_status);
create index if not exists idx_annotated_essays_verification_status     on public.annotated_essays(verification_status);
create index if not exists idx_essay_paragraphs_verification_status     on public.essay_paragraphs(verification_status);
create index if not exists idx_ao_annotations_verification_status       on public.ao_annotations(verification_status);
create index if not exists idx_paragraph_stems_verification_status      on public.paragraph_stems(verification_status);
create index if not exists idx_quote_method_links_verification_status   on public.quote_method_links(verification_status);
create index if not exists idx_misconception_upgrades_verification_status on public.misconception_upgrades(verification_status);

commit;
