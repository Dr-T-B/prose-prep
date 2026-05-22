DO $$
DECLARE ref_count int;
BEGIN
  SELECT count(*) INTO ref_count FROM (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_schema='public'
      AND ccu.table_name IN ('thesis_routes','exam_questions','paragraph_templates')
    UNION ALL
    SELECT 1 FROM pg_views WHERE schemaname='public'
      AND (definition ~* '\\mthesis_routes\\M'
        OR definition ~* '\\mexam_questions\\M'
        OR definition ~* '\\mparagraph_templates\\M')
    UNION ALL
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid
    WHERE n.nspname='public'
      AND (p.prosrc ~* '\\mthesis_routes\\M'
        OR p.prosrc ~* '\\mexam_questions\\M'
        OR p.prosrc ~* '\\mparagraph_templates\\M')
  ) sub;
  IF ref_count > 0 THEN
    RAISE EXCEPTION 'Phase D1 abort: % references to dead tables found at apply-time', ref_count;
  END IF;
END $$;

DROP TABLE thesis_routes;
DROP TABLE exam_questions;
DROP TABLE paragraph_templates;
