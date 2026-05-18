-- Align paragraph_stems columns to match ParagraphStem TypeScript interface in contentRepo.ts
-- DB had: stem_type, ao_tag (text), source_text, theme_tags, grade_band, curation_status
-- TS expects: function, ao (text[]), text_focus, best_themes, level_band, example_use

-- 1. stem_type → "function" (reserved word, must be quoted)
ALTER TABLE paragraph_stems RENAME COLUMN stem_type TO "function";

-- 2. ao_tag (text nullable) → ao (text[] NOT NULL DEFAULT '{}')
ALTER TABLE paragraph_stems RENAME COLUMN ao_tag TO ao;
ALTER TABLE paragraph_stems
  ALTER COLUMN ao TYPE text[]
  USING CASE WHEN ao IS NULL THEN '{}'::text[] ELSE ARRAY[ao] END;
ALTER TABLE paragraph_stems ALTER COLUMN ao SET DEFAULT '{}';
ALTER TABLE paragraph_stems ALTER COLUMN ao SET NOT NULL;

-- 3. theme_tags → best_themes (type unchanged: text[])
ALTER TABLE paragraph_stems RENAME COLUMN theme_tags TO best_themes;

-- 4. grade_band → level_band
ALTER TABLE paragraph_stems RENAME COLUMN grade_band TO level_band;

-- 5. Add missing columns from TS interface
ALTER TABLE paragraph_stems ADD COLUMN IF NOT EXISTS text_focus text;
ALTER TABLE paragraph_stems ADD COLUMN IF NOT EXISTS example_use text;

-- 6. Fix sort_order: TS says number (not nullable), table is empty so safe
ALTER TABLE paragraph_stems ALTER COLUMN sort_order SET DEFAULT 0;
UPDATE paragraph_stems SET sort_order = 0 WHERE sort_order IS NULL;
ALTER TABLE paragraph_stems ALTER COLUMN sort_order SET NOT NULL;

-- 7. "function" NOT NULL (TS: string), level_band NOT NULL (TS: string)
ALTER TABLE paragraph_stems ALTER COLUMN "function" SET DEFAULT '';
ALTER TABLE paragraph_stems ALTER COLUMN "function" SET NOT NULL;
ALTER TABLE paragraph_stems ALTER COLUMN level_band SET DEFAULT '';
ALTER TABLE paragraph_stems ALTER COLUMN level_band SET NOT NULL;