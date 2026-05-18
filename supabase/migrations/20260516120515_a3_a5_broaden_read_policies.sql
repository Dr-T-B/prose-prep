DROP POLICY IF EXISTS "anon read" ON public.themes;
CREATE POLICY "public read"
  ON public.themes
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "anon read" ON public.ao_readiness;
CREATE POLICY "public read"
  ON public.ao_readiness
  FOR SELECT TO public USING (true);