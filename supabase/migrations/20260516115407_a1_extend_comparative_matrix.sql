ALTER TABLE public.comparative_matrix
  ADD COLUMN IF NOT EXISTS ao2 text,
  ADD COLUMN IF NOT EXISTS ao3 text,
  ADD COLUMN IF NOT EXISTS ao4 text,
  ADD COLUMN IF NOT EXISTS thesis text,
  ADD COLUMN IF NOT EXISTS character text,
  ADD COLUMN IF NOT EXISTS narrative text,
  ADD COLUMN IF NOT EXISTS structure text,
  ADD COLUMN IF NOT EXISTS exam_fit text;