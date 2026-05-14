-- ============================================================
-- Remove proof-of-concept Drama seed rows from staging
--
-- The rows were introduced by:
--   20240504000000_drama_scene_schema.sql
--
-- This migration is not a content import. It restores the linked
-- staging database to a schema-only state before real Prose content
-- is imported.
-- ============================================================

BEGIN;

DELETE FROM public.drama_scene_ao5_readings
WHERE scene_id = 'hamlet_3_1'
  AND id IN (
    'hamlet_3_1_ao5_psychoanalytic',
    'hamlet_3_1_ao5_feminist',
    'hamlet_3_1_ao5_political'
  );

DELETE FROM public.drama_scene_ao1_arguments
WHERE scene_id = 'hamlet_3_1';

DELETE FROM public.drama_scene_essay_uses
WHERE scene_id = 'hamlet_3_1';

DELETE FROM public.drama_scene_ao2_methods
WHERE scene_id = 'hamlet_3_1';

DELETE FROM public.drama_scene_characters
WHERE scene_id = 'hamlet_3_1'
  AND play = 'hamlet';

DELETE FROM public.drama_scene_themes
WHERE scene_id = 'hamlet_3_1';

DELETE FROM public.drama_scenes
WHERE id = 'hamlet_3_1'
  AND play = 'hamlet'
  AND act = 3
  AND scene = 1
  AND act_scene = '3.1'
  AND scene_title = 'Surveillance, Suicide, and Ophelia';

COMMIT;
