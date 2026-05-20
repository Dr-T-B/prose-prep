-- Capture fix applied directly to live DB during smoke test.
-- label and weight must be nullable because the edge function
-- upsert deliberately omits them to avoid overwriting existing
-- dashboard display values.
ALTER TABLE public.ao_readiness
  ALTER COLUMN label DROP NOT NULL;
ALTER TABLE public.ao_readiness
  ALTER COLUMN weight DROP NOT NULL;
