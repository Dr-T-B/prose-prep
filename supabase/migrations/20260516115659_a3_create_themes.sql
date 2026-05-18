CREATE TABLE IF NOT EXISTS public.themes (
  id          text PRIMARY KEY,
  label       text NOT NULL,
  short       text NOT NULL,
  ht_angle    text NOT NULL,
  at_angle    text NOT NULL,
  ao2         text,
  ao3         text,
  ao4         text,
  sort_order  integer,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon read" ON public.themes;
CREATE POLICY "anon read"
  ON public.themes
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service role write" ON public.themes;
CREATE POLICY "service role write"
  ON public.themes
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);