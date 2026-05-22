-- Theme vocabulary canonicalisation
-- Decisions A1, B4-mix, C3, D1, E1 — see theme_vocabulary_canonicalisation_worksheet.md
--
-- Live pre-flight 2026-05-19 confirmed:
--   PF-1 12 canonical themes; PF-2 7 routes; PF-3 22 quote_pair_codes;
--   PF-4 12 route-tagged thesis rows (all single-route).
--
-- Coverage delta vs. original prompt (live data audit):
--   'repression and feeling' (6 rows in quote_methods.best_themes) intentionally
--   NOT in alias table — dropped consistent with B4 sub-theme drops.
--
-- Morality theme (sort_order=13) inserted with PLACEHOLDER literary content;
-- final HT/AT/AO content authored as separate task (per user decision).

BEGIN;

-- ============================================================================
-- PHASE A1: Add morality as canonical theme #13 (placeholder content)
-- ============================================================================
INSERT INTO themes (id, label, short, ht_angle, at_angle, ao2, ao3, ao4, sort_order, synthesis)
VALUES (
  'morality',
  'Morality, Sympathy & Human Feeling',
  'Morality',
  'TODO: Hard Times angle on morality, sympathy & human feeling (author separately)',
  'TODO: Atonement angle on morality, sympathy & human feeling (author separately)',
  NULL, NULL, NULL,
  13,
  'TODO: Synthesis sentence comparing Dickens and McEwan (author separately)'
);

-- ============================================================================
-- PHASE C3: route_id column on library_thesis_bank + strip route-X
-- ============================================================================
ALTER TABLE library_thesis_bank
  ADD COLUMN route_id text REFERENCES routes(id) ON DELETE SET NULL;

UPDATE library_thesis_bank
SET route_id = (
  SELECT t FROM unnest(theme_tags) AS t WHERE t LIKE 'route-%' LIMIT 1
)
WHERE EXISTS (SELECT 1 FROM unnest(theme_tags) AS t WHERE t LIKE 'route-%');

UPDATE library_thesis_bank
SET theme_tags = COALESCE((
  SELECT array_agg(t) FROM unnest(theme_tags) AS t WHERE t NOT LIKE 'route-%'
), '{}'::text[])
WHERE EXISTS (SELECT 1 FROM unnest(theme_tags) AS t WHERE t LIKE 'route-%');

-- ============================================================================
-- Build theme_alias temp table
-- ============================================================================
CREATE TEMP TABLE theme_alias (
  alias text PRIMARY KEY,
  canonical text NOT NULL
);

INSERT INTO theme_alias (alias, canonical) VALUES
  ('class','class'),('guilt','guilt'),('education','education'),('childhood','childhood'),
  ('imagination','imagination'),('gender','gender'),('family','family'),('memory','memory'),
  ('justice','justice'),('war','war'),('authorship','authorship'),('endings','endings'),
  ('morality','morality'),
  ('systems','war'),('industrialism','war'),('industrialisation','war'),('dehumanisation','war'),
  ('War and industrial systems','war'),('war and its consequences','war'),
  ('violence','war'),('violence and human cost','war'),('the body','war'),
  ('narrative authority','authorship'),('truth and fiction','authorship'),
  ('truth and perception','authorship'),('truth','authorship'),('narrative','authorship'),
  ('narrative form','authorship'),('narrative truth','authorship'),
  ('power of the narrative','authorship'),('perception','authorship'),
  ('utilitarianism','education'),('Education and utilitarianism','education'),
  ('imagination and its dangers','imagination'),('fact vs fancy','imagination'),
  ('self-deception','imagination'),('imagination vs fact','imagination'),
  ('imagination vs rationality','imagination'),('Imagination vs rationality','imagination'),
  ('time','endings'),('time and memory','endings'),
  ('social critique','class'),('social injustice','class'),('Class and power','class'),
  ('Childhood and moral formation','childhood'),('innocence','childhood'),
  ('guilt and atonement','guilt'),('responsibility','guilt'),('moral responsibility','guilt'),
  ('crime','justice'),('Justice, punishment and atonement','justice'),
  ('Memory and narrative reconstruction','memory'),
  ('marriage','gender'),('love','gender'),('love and desire','gender'),('power','gender');

-- ============================================================================
-- Apply theme_alias to 11 array columns
-- ============================================================================
UPDATE character_cards SET themes = COALESCE((
  SELECT array_agg(DISTINCT ta.canonical) FROM unnest(themes) AS t JOIN theme_alias ta ON ta.alias = t
), '{}'::text[]);

UPDATE comparative_matrix SET themes = COALESCE((
  SELECT array_agg(DISTINCT ta.canonical) FROM unnest(themes) AS t JOIN theme_alias ta ON ta.alias = t
), '{}'::text[]);

UPDATE glossary_terms SET theme_links = COALESCE((
  SELECT array_agg(DISTINCT ta.canonical) FROM unnest(theme_links) AS t JOIN theme_alias ta ON ta.alias = t
), '{}'::text[]);

UPDATE library_context_bank SET theme_tags = COALESCE((
  SELECT array_agg(DISTINCT ta.canonical) FROM unnest(theme_tags) AS t JOIN theme_alias ta ON ta.alias = t
), '{}'::text[]);

UPDATE library_paragraph_frames SET theme_tags = COALESCE((
  SELECT array_agg(DISTINCT ta.canonical) FROM unnest(theme_tags) AS t JOIN theme_alias ta ON ta.alias = t
), '{}'::text[]);

UPDATE library_thesis_bank SET theme_tags = COALESCE((
  SELECT array_agg(DISTINCT ta.canonical) FROM unnest(theme_tags) AS t JOIN theme_alias ta ON ta.alias = t
), '{}'::text[]);

UPDATE paragraph_jobs SET recommended_themes = COALESCE((
  SELECT array_agg(DISTINCT ta.canonical) FROM unnest(recommended_themes) AS t JOIN theme_alias ta ON ta.alias = t
), '{}'::text[]);

UPDATE paragraph_stems SET best_themes = COALESCE((
  SELECT array_agg(DISTINCT ta.canonical) FROM unnest(best_themes) AS t JOIN theme_alias ta ON ta.alias = t
), '{}'::text[]);

UPDATE quote_methods SET best_themes = COALESCE((
  SELECT array_agg(DISTINCT ta.canonical) FROM unnest(best_themes) AS t JOIN theme_alias ta ON ta.alias = t
), '{}'::text[]);

UPDATE quotes SET theme_tags = COALESCE((
  SELECT array_agg(DISTINCT ta.canonical) FROM unnest(theme_tags) AS t JOIN theme_alias ta ON ta.alias = t
), '{}'::text[]);

UPDATE symbol_entries SET themes = COALESCE((
  SELECT array_agg(DISTINCT ta.canonical) FROM unnest(themes) AS t JOIN theme_alias ta ON ta.alias = t
), '{}'::text[]);

-- ============================================================================
-- Single-value columns (defensive; live data confirmed already canonical)
-- ============================================================================
UPDATE theses SET theme_family = (
  SELECT canonical FROM theme_alias WHERE alias = theses.theme_family
) WHERE theme_family IN (SELECT alias FROM theme_alias);

UPDATE saved_essay_plans SET family = (
  SELECT canonical FROM theme_alias WHERE alias = saved_essay_plans.family
) WHERE family IN (SELECT alias FROM theme_alias);

-- ============================================================================
-- PHASE E1: Per-row quote_pairs.theme_label
-- ============================================================================
UPDATE quote_pairs SET theme_label = 'class'
WHERE quote_pair_code IN ('qp_class_injustice_01','qp_class_injustice_02','qp_systems_power_01');

UPDATE quote_pairs SET theme_label = 'education'
WHERE quote_pair_code = 'qp_education_childhood_01';

UPDATE quote_pairs SET theme_label = 'childhood'
WHERE quote_pair_code IN ('qp_education_childhood_02','qp_role_models_01');

UPDATE quote_pairs SET theme_label = 'endings'
WHERE quote_pair_code IN ('qp_endings_resolution_01','qp_endings_resolution_02','qp_guilt_damage_02');

UPDATE quote_pairs SET theme_label = 'gender'
WHERE quote_pair_code IN ('qp_gender_constraint_01','qp_gender_constraint_02','qp_love_choice_01');

UPDATE quote_pairs SET theme_label = 'guilt'
WHERE quote_pair_code IN ('qp_guilt_damage_01','qp_moral_responsibility_01','qp_moral_responsibility_02','qp_systems_power_02');

UPDATE quote_pairs SET theme_label = 'imagination'
WHERE quote_pair_code IN ('qp_fact_imagination_01','qp_fact_imagination_02');

UPDATE quote_pairs SET theme_label = 'authorship'
WHERE quote_pair_code IN ('qp_narrative_truth_01','qp_narrative_truth_02');

UPDATE quote_pairs SET theme_label = 'war'
WHERE quote_pair_code IN ('qp_violence_cost_01','qp_violence_cost_02');

-- ============================================================================
-- Validation
-- ============================================================================
DO $$
DECLARE bad_count int;
BEGIN
  SELECT count(*) INTO bad_count FROM quote_pairs
  WHERE theme_label NOT IN (SELECT id FROM themes);
  IF bad_count > 0 THEN
    RAISE EXCEPTION 'quote_pairs has % rows with non-canonical theme_label', bad_count;
  END IF;
END $$;

DO $$
DECLARE non_canonical int;
BEGIN
  SELECT count(*) INTO non_canonical FROM (
    SELECT unnest(themes) AS t FROM character_cards
    UNION ALL SELECT unnest(themes) FROM comparative_matrix
    UNION ALL SELECT unnest(theme_links) FROM glossary_terms
    UNION ALL SELECT unnest(theme_tags) FROM library_context_bank
    UNION ALL SELECT unnest(theme_tags) FROM library_paragraph_frames
    UNION ALL SELECT unnest(theme_tags) FROM library_thesis_bank
    UNION ALL SELECT unnest(recommended_themes) FROM paragraph_jobs
    UNION ALL SELECT unnest(best_themes) FROM paragraph_stems
    UNION ALL SELECT unnest(best_themes) FROM quote_methods
    UNION ALL SELECT unnest(theme_tags) FROM quotes
    UNION ALL SELECT unnest(themes) FROM symbol_entries
  ) sub WHERE t IS NOT NULL AND t <> '' AND t NOT IN (SELECT id FROM themes);
  IF non_canonical > 0 THEN
    RAISE EXCEPTION 'Array columns still have % non-canonical theme values', non_canonical;
  END IF;
END $$;

DO $$
DECLARE rt_count int;
BEGIN
  SELECT count(*) INTO rt_count FROM library_thesis_bank WHERE route_id IS NOT NULL;
  IF rt_count <> 12 THEN
    RAISE EXCEPTION 'Expected 12 library_thesis_bank rows with route_id, found %', rt_count;
  END IF;
END $$;

DROP TABLE theme_alias;

COMMIT;
