-- ────────────────────────────────────────────────────────
-- phase8b_drop_ao5_columns
--
-- Drops all 10 legacy ao5_* columns. AO5 is non-canonical for
-- Edexcel Component 2 Prose (assessed on AO1, AO2, AO3, AO4 only).
--
-- Includes selected_ao5_ids on essay_plans and saved_essay_plans,
-- which were missing from the Session C prompt's drop list but
-- discovered by pre-flight enumeration.
--
-- DATA LOSS ACKNOWLEDGED 2026-05-19:
--   essay_plans.ao5_enabled            — 5 non-null rows
--   essay_plans.selected_ao5_ids       — 5 non-null rows
--   saved_essay_plans.ao5_enabled      — 1 non-null row
--   saved_essay_plans.selected_ao5_ids — 1 non-null row
-- The other 6 columns are all-null and lose no data.
--
-- Phase 8a already recreated the 2 views without ao5_ refs;
-- column drops below should now succeed without CASCADE.
-- DO-block guards make this re-runnable.
-- ────────────────────────────────────────────────────────

BEGIN;

DO $$
BEGIN
  -- 1. essay_plans.ao5_enabled
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='essay_plans' AND column_name='ao5_enabled') THEN
    ALTER TABLE public.essay_plans DROP COLUMN ao5_enabled;
  END IF;

  -- 2. essay_plans.selected_ao5_ids (missing from Session C spec)
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='essay_plans' AND column_name='selected_ao5_ids') THEN
    ALTER TABLE public.essay_plans DROP COLUMN selected_ao5_ids;
  END IF;

  -- 3. library_paragraph_frames.ao5_stem
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='library_paragraph_frames' AND column_name='ao5_stem') THEN
    ALTER TABLE public.library_paragraph_frames DROP COLUMN ao5_stem;
  END IF;

  -- 4. paragraph_attempts.ao5_evaluation
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='paragraph_attempts' AND column_name='ao5_evaluation') THEN
    ALTER TABLE public.paragraph_attempts DROP COLUMN ao5_evaluation;
  END IF;

  -- 5. paragraph_attempts.ao5_self_score
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='paragraph_attempts' AND column_name='ao5_self_score') THEN
    ALTER TABLE public.paragraph_attempts DROP COLUMN ao5_self_score;
  END IF;

  -- 6. quote_pairs.ao5_tension
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='quote_pairs' AND column_name='ao5_tension') THEN
    ALTER TABLE public.quote_pairs DROP COLUMN ao5_tension;
  END IF;

  -- 7. saved_essay_plans.ao5_enabled
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='saved_essay_plans' AND column_name='ao5_enabled') THEN
    ALTER TABLE public.saved_essay_plans DROP COLUMN ao5_enabled;
  END IF;

  -- 8. saved_essay_plans.selected_ao5_ids (missing from Session C spec)
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='saved_essay_plans' AND column_name='selected_ao5_ids') THEN
    ALTER TABLE public.saved_essay_plans DROP COLUMN selected_ao5_ids;
  END IF;

  -- 9. student_quote_pair_mastery.ao5_secure
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='student_quote_pair_mastery' AND column_name='ao5_secure') THEN
    ALTER TABLE public.student_quote_pair_mastery DROP COLUMN ao5_secure;
  END IF;

  -- 10. thesis_routes.ao5_tension (in surviving dead table; column drop only — table stays)
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='thesis_routes' AND column_name='ao5_tension') THEN
    ALTER TABLE public.thesis_routes DROP COLUMN ao5_tension;
  END IF;
END $$;

COMMIT;
