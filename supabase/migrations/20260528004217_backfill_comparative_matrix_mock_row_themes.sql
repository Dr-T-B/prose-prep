-- ============================================================================
-- Backfill canonical themes[] for the 10 active mock-* comparative_matrix rows.
--
-- Context:
--   PR #56 (docs/COMPARATIVE_MATRIX_THEMES_ARRAY_AUDIT.md) found that
--   themes[] is controlled and repeated across 30/40 active rows, but the
--   remaining 10 active rows (all mock-*) had empty themes[]. PR #56
--   classified themes[] as a B (weak) filter candidate solely because of
--   this gap.
--
--   PR #57 (docs/COMPARATIVE_MATRIX_MOCK_ROW_NORMALISATION_AUDIT.md) found
--   that those 10 mock-* rows are production-quality AO2/AO3/AO4 content
--   (not throwaway fixtures, not test data, not referenced by any source
--   or test), and recommended Option B: backfill canonical themes[] using
--   ids already present in public.themes and aliases already present in
--   the theme_alias map seeded by 20260519192443.
--
-- Mapping (quoted verbatim from PR #57 audit, "Mock row field completeness"
-- table, lines 162-171):
--
--   mock-childhood            -> childhood, education
--   mock-class                -> class
--   mock-endings              -> endings
--   mock-family               -> family
--   mock-guilt                -> guilt, justice
--   mock-imagination          -> imagination, authorship
--   mock-narrative-truth      -> authorship, imagination, memory
--   mock-social-responsibility-> class, justice, morality
--   mock-time-memory          -> memory, endings
--   mock-war                  -> war, class
--
-- All theme ids above are canonical entries in public.themes (seeded by
-- 20260519190000_seed_canonical_themes_for_replay.sql and extended by
-- 20260519192443_theme_vocabulary_canonicalisation.sql which adds
-- 'morality').
--
-- Scope:
--   - Data-only UPDATE on the 10 named mock-* rows.
--   - No schema change.
--   - No new themes introduced.
--   - No AO5 column, label, filter, tag, route, validation or UI added.
--     Component 2 Prose remains AO1/AO2/AO3/AO4 only.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Pre-conditions
-- ---------------------------------------------------------------------------

-- All 10 target rows must exist in comparative_matrix.
DO $$
DECLARE
  target_ids text[] := ARRAY[
    'mock-childhood',
    'mock-class',
    'mock-endings',
    'mock-family',
    'mock-guilt',
    'mock-imagination',
    'mock-narrative-truth',
    'mock-social-responsibility',
    'mock-time-memory',
    'mock-war'
  ];
  missing text[];
BEGIN
  SELECT array_agg(t)
    INTO missing
  FROM unnest(target_ids) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM public.comparative_matrix cm WHERE cm.id = t
  );

  IF missing IS NOT NULL AND array_length(missing, 1) > 0 THEN
    RAISE EXCEPTION
      'Backfill aborted: expected comparative_matrix rows missing: %',
      missing;
  END IF;
END $$;

-- Every theme id used by the mapping must exist in public.themes.
DO $$
DECLARE
  required_themes text[] := ARRAY[
    'authorship',
    'childhood',
    'class',
    'education',
    'endings',
    'family',
    'guilt',
    'imagination',
    'justice',
    'memory',
    'morality',
    'war'
  ];
  unknown text[];
BEGIN
  SELECT array_agg(t)
    INTO unknown
  FROM unnest(required_themes) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM public.themes th WHERE th.id = t
  );

  IF unknown IS NOT NULL AND array_length(unknown, 1) > 0 THEN
    RAISE EXCEPTION
      'Backfill aborted: required canonical themes not present in public.themes: %',
      unknown;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Apply the backfill
-- ---------------------------------------------------------------------------

WITH mapping(id, themes) AS (
  VALUES
    ('mock-childhood',             ARRAY['childhood','education']::text[]),
    ('mock-class',                 ARRAY['class']::text[]),
    ('mock-endings',               ARRAY['endings']::text[]),
    ('mock-family',                ARRAY['family']::text[]),
    ('mock-guilt',                 ARRAY['guilt','justice']::text[]),
    ('mock-imagination',           ARRAY['imagination','authorship']::text[]),
    ('mock-narrative-truth',       ARRAY['authorship','imagination','memory']::text[]),
    ('mock-social-responsibility', ARRAY['class','justice','morality']::text[]),
    ('mock-time-memory',           ARRAY['memory','endings']::text[]),
    ('mock-war',                   ARRAY['war','class']::text[])
)
UPDATE public.comparative_matrix cm
   SET themes     = m.themes,
       updated_at = now()
  FROM mapping m
 WHERE cm.id = m.id;

-- ---------------------------------------------------------------------------
-- Post-conditions
-- ---------------------------------------------------------------------------

-- All 10 mock-* rows now have non-empty themes[].
DO $$
DECLARE
  populated_count integer;
BEGIN
  SELECT count(*)
    INTO populated_count
  FROM public.comparative_matrix
  WHERE id LIKE 'mock-%'
    AND coalesce(array_length(themes, 1), 0) > 0;

  IF populated_count < 10 THEN
    RAISE EXCEPTION
      'Backfill verification failed: expected 10 mock-* rows with non-empty themes[], found %',
      populated_count;
  END IF;
END $$;

-- Every theme assigned to a mock-* row must resolve against public.themes.
DO $$
DECLARE
  dangling text[];
BEGIN
  SELECT array_agg(DISTINCT t)
    INTO dangling
  FROM public.comparative_matrix cm,
       LATERAL unnest(cm.themes) AS t
  WHERE cm.id LIKE 'mock-%'
    AND NOT EXISTS (
      SELECT 1 FROM public.themes th WHERE th.id = t
    );

  IF dangling IS NOT NULL AND array_length(dangling, 1) > 0 THEN
    RAISE EXCEPTION
      'Backfill verification failed: mock-* rows reference unknown themes: %',
      dangling;
  END IF;
END $$;

-- AO5 guard: this migration must not touch any ao5_* field on
-- comparative_matrix. The table has no ao5 column today; assert this
-- holds so any future schema drift that re-introduces AO5 trips the
-- replay rather than going unnoticed.
DO $$
DECLARE
  ao5_columns text[];
BEGIN
  SELECT array_agg(column_name)
    INTO ao5_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name   = 'comparative_matrix'
    AND column_name ILIKE 'ao5%';

  IF ao5_columns IS NOT NULL AND array_length(ao5_columns, 1) > 0 THEN
    RAISE EXCEPTION
      'AO5 guard failed: comparative_matrix has unexpected ao5 column(s): %',
      ao5_columns;
  END IF;
END $$;

COMMIT;
