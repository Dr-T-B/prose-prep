-- Phase 7: themes/theme_maps consolidation
-- - Adds synthesis column to themes
-- - Backfills 11 rows from theme_maps.one_line (10 direct + theme-truth -> authorship per D1a)
-- - Composes synthesis for memory (D1a side-effect)
-- - Drops theme-morality content (D2c)
-- - Drops theme_maps table

-- 1. Add synthesis column (nullable initially so backfill can land)
ALTER TABLE themes ADD COLUMN synthesis text;

-- 2. Backfill 10 strong/conceptual matches
UPDATE themes SET synthesis = (SELECT one_line FROM theme_maps WHERE id='theme-education')    WHERE id='education';
UPDATE themes SET synthesis = (SELECT one_line FROM theme_maps WHERE id='theme-imagination')  WHERE id='imagination';
UPDATE themes SET synthesis = (SELECT one_line FROM theme_maps WHERE id='theme-class')        WHERE id='class';
UPDATE themes SET synthesis = (SELECT one_line FROM theme_maps WHERE id='theme-childhood')    WHERE id='childhood';
UPDATE themes SET synthesis = (SELECT one_line FROM theme_maps WHERE id='theme-family')       WHERE id='family';
UPDATE themes SET synthesis = (SELECT one_line FROM theme_maps WHERE id='theme-guilt')        WHERE id='guilt';
UPDATE themes SET synthesis = (SELECT one_line FROM theme_maps WHERE id='theme-gender')       WHERE id='gender';
UPDATE themes SET synthesis = (SELECT one_line FROM theme_maps WHERE id='theme-industrialism') WHERE id='war';
UPDATE themes SET synthesis = (SELECT one_line FROM theme_maps WHERE id='theme-crime')        WHERE id='justice';
UPDATE themes SET synthesis = (SELECT one_line FROM theme_maps WHERE id='theme-time')         WHERE id='endings';

-- 3. D1a: theme-truth -> authorship
UPDATE themes SET synthesis = (SELECT one_line FROM theme_maps WHERE id='theme-truth') WHERE id='authorship';

-- 4. D1a side-effect: composed synthesis for memory
UPDATE themes SET synthesis =
  'Dickens subordinates memory to a stable moral verdict delivered by an omniscient narrator; McEwan exposes memory itself as authored artefact, dismantling the very narrative authority on which retrospective truth depends.'
WHERE id='memory';

-- 5. Verify every row has a synthesis before locking NOT NULL
DO $$
DECLARE null_count int;
BEGIN
  SELECT count(*) INTO null_count FROM themes WHERE synthesis IS NULL;
  IF null_count > 0 THEN
    RAISE EXCEPTION 'Phase 7 abort: % themes rows still have NULL synthesis', null_count;
  END IF;
END $$;

-- 6. Lock down
ALTER TABLE themes ALTER COLUMN synthesis SET NOT NULL;

-- 7. Drop the now-redundant table (D2c: theme-morality content discarded)
DROP TABLE theme_maps;
