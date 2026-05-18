
-- Gap A: Add is_active column to glossary_terms
-- Matches the query pattern: .eq("is_active", true) in contentRepo.ts
ALTER TABLE glossary_terms
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Ensure the updated_at column stays maintained (existing rows get DEFAULT true, which is correct)
