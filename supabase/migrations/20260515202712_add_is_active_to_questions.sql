-- Add is_active boolean to questions table.
-- contentRepo.ts queries: .from("questions").select("*").eq("is_active", true)
-- Without this column the query errors and falls back to local seed data.
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;