-- ────────────────────────────────────────────────────────
-- phase6_ao_readiness_user_id
--
-- Adds user_id to ao_readiness so the table becomes per-student.
-- Existing 4 generic rows (AO1-AO4) are assigned to the canonical
-- owner: tarwinder.saran@gmail.com (0c536f97-e5a0-445b-9582-5baf6ec9cdf4).
-- Composite PK (ao, user_id) lets each user have their own AO1-AO4 set.
--
-- Pre-flight state confirmed 2026-05-19:
--   State A: user_id column does not exist
--   4 existing rows (one per AO1..AO4)
--   Current PK is single-column on (ao); CHECK constraints on ao and score
--   2 users in auth.users; user chose 0c536f97-... for backfill
-- ────────────────────────────────────────────────────────

BEGIN;

-- Step 1: add user_id as nullable so existing rows can be backfilled
ALTER TABLE public.ao_readiness
  ADD COLUMN user_id uuid;

-- Step 2: backfill the 4 existing rows with the chosen owner UUID
UPDATE public.ao_readiness
SET user_id = '0c536f97-e5a0-445b-9582-5baf6ec9cdf4'
WHERE user_id IS NULL;

-- Step 3: enforce NOT NULL now that all rows are populated
ALTER TABLE public.ao_readiness
  ALTER COLUMN user_id SET NOT NULL;

-- Step 4: add FK to auth.users with cascade delete
ALTER TABLE public.ao_readiness
  ADD CONSTRAINT ao_readiness_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 5: drop single-column PK on (ao) and rebuild as composite (ao, user_id)
ALTER TABLE public.ao_readiness
  DROP CONSTRAINT ao_readiness_pkey;

ALTER TABLE public.ao_readiness
  ADD CONSTRAINT ao_readiness_pkey PRIMARY KEY (ao, user_id);

COMMENT ON COLUMN public.ao_readiness.user_id IS
  'FK to auth.users(id). Added 2026-05-19 to make ao_readiness per-student. Existing 4 rows backfilled to tarwinder.saran.';

COMMIT;
