-- ────────────────────────────────────────────────────────
-- fix_paragraph_attempts_type_and_fks
--
-- Re-points 3 paragraph_attempts FK columns from the deferred dead
-- tables (thesis_routes, exam_questions, paragraph_templates) to the
-- canonical replacements (routes, questions, paragraph_jobs).
--
-- The dead tables use uuid IDs; the canonical tables use short text
-- IDs (e.g. 'route-class', 'q-friendship', 'pj-class-3a'), so the
-- columns are also converted from uuid to text.
--
-- Pre-flight confirmed 2026-05-19:
--   - paragraph_attempts row count = 0 (type conversion lossless)
--   - All 3 columns are uuid
--   - All 3 existing FKs to dead tables are present (must be dropped first)
--   - The 3 surviving dead tables remain in DB (deferred from Session A drop)
--
-- This migration severs the structural link between paragraph_attempts
-- and the dead tables. That is intentional — the dead tables are
-- pending an audit and likely future drop. The new FKs align
-- paragraph_attempts with the canonical schema.
-- ────────────────────────────────────────────────────────

-- Step 1: drop the 3 existing FKs pointing at the dead tables
ALTER TABLE public.paragraph_attempts
  DROP CONSTRAINT IF EXISTS paragraph_attempts_exam_question_id_fkey,
  DROP CONSTRAINT IF EXISTS paragraph_attempts_thesis_route_id_fkey,
  DROP CONSTRAINT IF EXISTS paragraph_attempts_paragraph_template_id_fkey;

-- Step 2: convert column types from uuid to text
ALTER TABLE public.paragraph_attempts
  ALTER COLUMN exam_question_id      TYPE text USING exam_question_id::text,
  ALTER COLUMN thesis_route_id       TYPE text USING thesis_route_id::text,
  ALTER COLUMN paragraph_template_id TYPE text USING paragraph_template_id::text;

-- Step 3: add new FKs pointing at the canonical text-PK tables
ALTER TABLE public.paragraph_attempts
  ADD CONSTRAINT paragraph_attempts_exam_question_id_fkey
    FOREIGN KEY (exam_question_id)
    REFERENCES public.questions(id) ON DELETE SET NULL;

ALTER TABLE public.paragraph_attempts
  ADD CONSTRAINT paragraph_attempts_thesis_route_id_fkey
    FOREIGN KEY (thesis_route_id)
    REFERENCES public.routes(id) ON DELETE SET NULL;

ALTER TABLE public.paragraph_attempts
  ADD CONSTRAINT paragraph_attempts_paragraph_template_id_fkey
    FOREIGN KEY (paragraph_template_id)
    REFERENCES public.paragraph_jobs(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.paragraph_attempts.exam_question_id IS
  'FK to questions(id). Re-pointed from exam_questions on 2026-05-19; type changed uuid -> text.';

COMMENT ON COLUMN public.paragraph_attempts.thesis_route_id IS
  'FK to routes(id). Re-pointed from thesis_routes on 2026-05-19; type changed uuid -> text.';

COMMENT ON COLUMN public.paragraph_attempts.paragraph_template_id IS
  'FK to paragraph_jobs(id). Re-pointed from paragraph_templates on 2026-05-19; type changed uuid -> text.';
