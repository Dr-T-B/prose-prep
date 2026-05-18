
-- Gap B: Create paragraph_stems table
-- Table exists in production but was never migrated to staging.
-- Schema derived from: library_paragraph_frames columns, quote_methods patterns,
-- and production audit which confirmed the table with 0 rows (AO5-check).
CREATE TABLE IF NOT EXISTS paragraph_stems (
  id              text PRIMARY KEY,
  stem_text       text NOT NULL,
  stem_type       text,          -- 'opening' | 'method' | 'context' | 'comparison' | 'judgement' | 'closing'
  ao_tag          text,          -- 'AO1' | 'AO2' | 'AO3' | 'AO4'  (AO5 is NOT assessed in Component 2)
  source_text     text,          -- 'HT' | 'AT' | 'both'
  theme_tags      text[] NOT NULL DEFAULT '{}',
  grade_band      text,          -- 'A*' | 'A' | 'B'
  is_active       boolean NOT NULL DEFAULT true,
  sort_order      integer,
  curation_status text    DEFAULT 'strong',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- RLS: matches pattern of quote_methods, character_cards, theme_maps
ALTER TABLE paragraph_stems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read paragraph_stems"
  ON paragraph_stems FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert paragraph_stems"
  ON paragraph_stems FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update paragraph_stems"
  ON paragraph_stems FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete paragraph_stems"
  ON paragraph_stems FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Performance index on most common query predicates
CREATE INDEX IF NOT EXISTS idx_paragraph_stems_active_ao
  ON paragraph_stems (is_active, ao_tag, source_text);
