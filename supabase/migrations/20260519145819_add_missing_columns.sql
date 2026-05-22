-- ────────────────────────────────────────────────────────
-- add_missing_columns
-- 23 columns across 5 tables identified as behind main schema.
-- All additive — IF NOT EXISTS prevents double-application.
-- Pre-flight 2026-05-19 confirmed all 23 columns are absent.
-- Existing row counts: profiles=2, glossary_terms=38,
--   character_cards=11, symbol_entries=12, paragraph_jobs=14.
-- NOT NULL DEFAULT columns will populate existing rows with the default.
-- ────────────────────────────────────────────────────────

-- ── profiles: student personalisation (3 columns) ──────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS target_grade        text,
  ADD COLUMN IF NOT EXISTS exam_date           date DEFAULT '2026-06-01',
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.target_grade IS
  'Student target grade: A or A*. Adjusts default thesis level and content filtering.';

COMMENT ON COLUMN public.profiles.exam_date IS
  'Date of Component 2 exam. Drives countdown. Default: Edexcel 1 June 2026.';

COMMENT ON COLUMN public.profiles.onboarding_complete IS
  'Whether student completed onboarding. Controls onboarding visibility on login.';

-- ── glossary_terms: richer AO2 term content (8 columns) ──
ALTER TABLE public.glossary_terms
  ADD COLUMN IF NOT EXISTS student_friendly_definition text,
  ADD COLUMN IF NOT EXISTS common_misuse_warning       text,
  ADD COLUMN IF NOT EXISTS what_to_notice              text,
  ADD COLUMN IF NOT EXISTS best_verbs                  text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS example_ht                  text,
  ADD COLUMN IF NOT EXISTS example_at                  text,
  ADD COLUMN IF NOT EXISTS sentence_stem               text,
  ADD COLUMN IF NOT EXISTS theme_links                 text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.glossary_terms.student_friendly_definition IS
  'Plain-English definition for exam use.';

COMMENT ON COLUMN public.glossary_terms.common_misuse_warning IS
  'How this term is commonly misapplied — critical for AO2 accuracy.';

COMMENT ON COLUMN public.glossary_terms.example_ht IS
  'Example of this term applied to Hard Times.';

COMMENT ON COLUMN public.glossary_terms.example_at IS
  'Example of this term applied to Atonement.';

-- ── character_cards: richer character content (4 columns) ──
ALTER TABLE public.character_cards
  ADD COLUMN IF NOT EXISTS linked_methods  text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS use_case        text,
  ADD COLUMN IF NOT EXISTS level_band      text,
  ADD COLUMN IF NOT EXISTS source_row_key  text UNIQUE;

-- ── symbol_entries: richer symbol content (4 columns) ──
ALTER TABLE public.symbol_entries
  ADD COLUMN IF NOT EXISTS linked_methods  text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS use_case        text,
  ADD COLUMN IF NOT EXISTS level_band      text,
  ADD COLUMN IF NOT EXISTS source_row_key  text UNIQUE;

-- ── paragraph_jobs: richer scaffold content (4 columns) ──
ALTER TABLE public.paragraph_jobs
  ADD COLUMN IF NOT EXISTS recommended_methods     text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS recommended_themes      text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS suggested_evidence_type text,
  ADD COLUMN IF NOT EXISTS level_band              text;
