-- Annotated Essay Pack — manual content promotion examples.
--
-- These are EXAMPLES ONLY. Run them in the Supabase SQL editor under an
-- admin-role session, or via psql with the service role. They are the
-- documented escape hatch for batch promotions that would be tedious in the
-- admin UI (see /admin → "Annotated essays" tab for the preferred surface).
--
-- The verification_status CHECK constraint introduced in migration
-- 20260525120000_annotated_essay_content_review_workflow.sql enforces the
-- canonical six-value set. Trying to set any other status will fail.
--
-- Status values (use exactly these strings):
--   'draft'
--   'teacher review required'
--   'reviewed'
--   'approved'
--   'needs correction'
--   'retired'

-- ---------------------------------------------------------------------------
-- 1. Inspect what is currently teacher-review-required across the seven tables.
-- ---------------------------------------------------------------------------
with teacher_review as (
  select 'essay_questions'      as table_name, id, theme, verification_status from public.essay_questions
  union all select 'annotated_essays',     id, null::text, verification_status from public.annotated_essays
  union all select 'essay_paragraphs',     id, null::text, verification_status from public.essay_paragraphs
  union all select 'ao_annotations',       id, null::text, verification_status from public.ao_annotations
  union all select 'paragraph_stems',      id, theme,      verification_status from public.paragraph_stems
  union all select 'quote_method_links',   id, theme,      verification_status from public.quote_method_links
  union all select 'misconception_upgrades', id, null::text, verification_status from public.misconception_upgrades
)
select table_name, count(*) as row_count
from teacher_review
where verification_status = 'teacher review required'
group by table_name
order by table_name;

-- ---------------------------------------------------------------------------
-- 2. Promote ONE annotated essay (and its paragraphs + AO annotations) to
--    'reviewed' in a single transaction. Replace the essay_id below.
-- ---------------------------------------------------------------------------
begin;

update public.annotated_essays
set verification_status = 'reviewed',
    reviewed = true,
    reviewed_at = coalesce(reviewed_at, now()),
    reviewed_by = auth.uid()
where id = 'replace-with-essay-id';

update public.essay_paragraphs
set verification_status = 'reviewed',
    reviewed = true,
    reviewed_at = coalesce(reviewed_at, now()),
    reviewed_by = auth.uid()
where essay_id = 'replace-with-essay-id';

update public.ao_annotations
set verification_status = 'reviewed',
    reviewed = true,
    reviewed_at = coalesce(reviewed_at, now()),
    reviewed_by = auth.uid()
where essay_id = 'replace-with-essay-id';

commit;

-- ---------------------------------------------------------------------------
-- 3. Promote everything linked to one essay question (the question itself,
--    plus any quote_method_links and paragraph_stems referenced from it) to
--    'approved'.
-- ---------------------------------------------------------------------------
begin;

update public.essay_questions
set verification_status = 'approved',
    reviewed = true,
    reviewed_at = coalesce(reviewed_at, now()),
    reviewed_by = auth.uid(),
    approved_at = now(),
    approved_by = auth.uid()
where id = 'replace-with-question-id';

update public.quote_method_links
set verification_status = 'approved',
    reviewed = true,
    reviewed_at = coalesce(reviewed_at, now()),
    reviewed_by = auth.uid(),
    approved_at = now(),
    approved_by = auth.uid()
where essay_question_id = 'replace-with-question-id';

update public.paragraph_stems
set verification_status = 'approved',
    reviewed = true,
    reviewed_at = coalesce(reviewed_at, now()),
    reviewed_by = auth.uid(),
    approved_at = now(),
    approved_by = auth.uid()
where id = any (
  select unnest(linked_paragraph_stem_ids)
  from public.essay_questions
  where id = 'replace-with-question-id'
);

commit;

-- ---------------------------------------------------------------------------
-- 4. Flag specific quote_method_links as 'needs correction' with a note.
-- ---------------------------------------------------------------------------
update public.quote_method_links
set verification_status = 'needs correction',
    reviewed = false,
    correction_notes = 'Quotation needs source verification — confirm chapter and edition before relying.'
where id in (
  'qml_replace_me_1',
  'qml_replace_me_2'
);

-- ---------------------------------------------------------------------------
-- 5. Retire a draft misconception upgrade (kept for audit, hidden from
--    student-facing surfaces).
-- ---------------------------------------------------------------------------
update public.misconception_upgrades
set verification_status = 'retired',
    review_notes = 'Superseded by replacement entry; retain for history.'
where id = 'replace-with-misconception-id';

-- ---------------------------------------------------------------------------
-- 6. Audit: list every row across the pack still flagged as
--    'teacher review required'.
-- ---------------------------------------------------------------------------
with teacher_review as (
  select 'essay_questions'        as table_name, id, question_text     as title from public.essay_questions where verification_status = 'teacher review required'
  union all select 'annotated_essays',         id, title                          from public.annotated_essays      where verification_status = 'teacher review required'
  union all select 'essay_paragraphs',         id, main_argument                  from public.essay_paragraphs      where verification_status = 'teacher review required'
  union all select 'ao_annotations',           id, text_span                      from public.ao_annotations        where verification_status = 'teacher review required'
  union all select 'paragraph_stems',          id, stem_text                      from public.paragraph_stems       where verification_status = 'teacher review required'
  union all select 'quote_method_links',       id, quotation                      from public.quote_method_links    where verification_status = 'teacher review required'
  union all select 'misconception_upgrades',   id, weakness                       from public.misconception_upgrades where verification_status = 'teacher review required'
)
select * from teacher_review order by table_name, id;
