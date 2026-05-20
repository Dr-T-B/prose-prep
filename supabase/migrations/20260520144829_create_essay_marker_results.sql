-- Stores results from the mark-component2-essay edge function.
-- Used for: rate-limit accounting, per-user mark history, ao_readiness updates.
--
-- One row per successful AI response. Failed AI calls do not persist a row,
-- which is intentional: the rate limit (10/hour) counts only billable calls.

CREATE TABLE IF NOT EXISTS public.essay_marker_results (
  id                   uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode                 text        NOT NULL
                       CHECK (mode IN ('full_essay', 'paragraph_only', 'structured_attempt')),
  question_id          text        REFERENCES public.questions(id),
  question_stem        text,
  paragraph_attempt_id uuid        REFERENCES public.paragraph_attempts(id) ON DELETE SET NULL,
  essay_text           text,
  word_count           integer,
  target_grade         text        DEFAULT 'A/A*',
  provisional_level    text        CHECK (provisional_level IS NULL OR provisional_level IN
                         ('Level 1','Level 2','Level 3','Level 4','Level 5')),
  provisional_marks    integer     CHECK (provisional_marks IS NULL OR provisional_marks BETWEEN 1 AND 20),
  result_json          jsonb       NOT NULL,
  model                text        DEFAULT 'claude-opus-4-7',
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_essay_marker_results_user_created
  ON public.essay_marker_results (user_id, created_at DESC);

ALTER TABLE public.essay_marker_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own results" ON public.essay_marker_results;
CREATE POLICY "Users can read own results"
  ON public.essay_marker_results
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own results" ON public.essay_marker_results;
CREATE POLICY "Users can insert own results"
  ON public.essay_marker_results
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access" ON public.essay_marker_results;
CREATE POLICY "Service role full access"
  ON public.essay_marker_results
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE public.essay_marker_results IS
  'Persisted output of mark-component2-essay edge function. Drives rate limiting (10/hr) and mark-history UI.';
