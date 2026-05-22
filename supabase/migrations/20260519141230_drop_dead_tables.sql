-- ────────────────────────────────────────────────────────
-- drop_dead_tables
-- Drops 4 empty tables confirmed at 0 rows on remote (2026-05-19).
--
-- ao5_tensions                  → superseded by interpretive_tensions
-- library_comparative_pairings  → covered by quote_pairs + comparative_matrix
-- library_questions             → covered by questions
-- library_quotes                → covered by quote_methods
--
-- DEFERRED (had rows on remote — pending content audit):
--   thesis_routes        (6 rows)   → audit vs. routes
--   exam_questions       (16 rows)  → audit vs. questions
--   paragraph_templates  (8 rows)   → audit vs. paragraph_jobs
-- ────────────────────────────────────────────────────────

DROP TABLE IF EXISTS public.ao5_tensions;

DROP TABLE IF EXISTS public.library_comparative_pairings;

DROP TABLE IF EXISTS public.library_questions;

DROP TABLE IF EXISTS public.library_quotes;
