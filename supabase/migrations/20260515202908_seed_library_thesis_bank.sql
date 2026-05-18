INSERT INTO library_thesis_bank
  (thesis_text, question_focus, source_text, paired_text, theme_tags, ao_tags, grade_band, argument_type)
SELECT
  t.thesis_text,
  t.theme_family                                  AS question_focus,
  'both'                                          AS source_text,
  'Hard Times / Atonement'                        AS paired_text,
  ARRAY[t.theme_family, t.route_id]               AS theme_tags,
  ARRAY['AO1', 'AO4']                             AS ao_tags,
  t.level                                         AS grade_band,
  CASE t.level
    WHEN 'B'   THEN 'basic-assertion'
    WHEN 'A'   THEN 'developed-comparison'
    WHEN 'A*'  THEN 'conceptual-synthesis'
  END                                             AS argument_type
FROM theses t
ON CONFLICT DO NOTHING;