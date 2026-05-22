-- ────────────────────────────────────────────────────────
-- phase8a_recreate_views_without_ao5
--
-- Recreates 2 views with the ao5_* columns removed from their SELECT
-- lists. Must run BEFORE Phase 8b drops the underlying columns,
-- otherwise the column drops would either fail or CASCADE-drop the
-- views (silently losing them).
--
-- Preserves:
--   - security_invoker=true (both views)
--   - GRANT ALL to anon, authenticated, postgres, service_role
--   - All non-ao5 columns (ao2_secure, ao3_secure, ao4_secure,
--     interpretive_secure, ao1_self_score..ao4_self_score, etc.)
-- ────────────────────────────────────────────────────────

BEGIN;

-- ── v_student_quote_pair_progress: drop m.ao5_secure from SELECT ──
DROP VIEW IF EXISTS public.v_student_quote_pair_progress;

CREATE VIEW public.v_student_quote_pair_progress
  WITH (security_invoker = true) AS
SELECT m.student_id,
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
       m.needs_review,
       m.last_practised_at,
       m.updated_at,
       m.interpretive_secure
FROM public.student_quote_pair_mastery m
JOIN public.quote_pairs qp ON qp.id = m.quote_pair_id;

GRANT ALL ON public.v_student_quote_pair_progress TO anon;

GRANT ALL ON public.v_student_quote_pair_progress TO authenticated;

GRANT ALL ON public.v_student_quote_pair_progress TO postgres;

GRANT ALL ON public.v_student_quote_pair_progress TO service_role;

-- ── v_student_recent_paragraphs: drop pa.ao5_self_score from SELECT ──
DROP VIEW IF EXISTS public.v_student_recent_paragraphs;

CREATE VIEW public.v_student_recent_paragraphs
  WITH (security_invoker = true) AS
SELECT pa.id,
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
       pa.improvement_target,
       pa.created_at,
       pa.ao1_sophistication_self_score
FROM public.paragraph_attempts pa
LEFT JOIN public.quote_pairs qp ON qp.id = pa.quote_pair_id;

GRANT ALL ON public.v_student_recent_paragraphs TO anon;

GRANT ALL ON public.v_student_recent_paragraphs TO authenticated;

GRANT ALL ON public.v_student_recent_paragraphs TO postgres;

GRANT ALL ON public.v_student_recent_paragraphs TO service_role;

COMMIT;
