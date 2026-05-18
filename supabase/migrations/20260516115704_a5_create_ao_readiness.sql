CREATE TABLE IF NOT EXISTS public.ao_readiness (
  ao          text PRIMARY KEY
                CHECK (ao IN ('AO1','AO2','AO3','AO4')),
  label       text NOT NULL,
  weight      numeric NOT NULL,
  score       integer NOT NULL DEFAULT 0
                CHECK (score >= 0 AND score <= 100),
  trend       integer NOT NULL DEFAULT 0,
  note        text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ao_readiness ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon read" ON public.ao_readiness;
CREATE POLICY "anon read"
  ON public.ao_readiness
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service role write" ON public.ao_readiness;
CREATE POLICY "service role write"
  ON public.ao_readiness
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);