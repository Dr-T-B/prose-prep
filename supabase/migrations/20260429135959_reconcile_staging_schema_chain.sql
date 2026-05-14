-- Reconcile the canonical migration chain for staging-safe setup.
--
-- This migration intentionally sits immediately before
-- 20260429140000_secure_progress_tables_and_functions.sql because that
-- historical migration contains unguarded references that must exist before an
-- empty staging database can replay the chain.
--
-- It is compatibility-only:
-- - no Supabase project is contacted by this file;
-- - no data is inserted, deleted, or rewritten;
-- - historical migrations are left intact for reviewability.

-- ---------------------------------------------------------------------------
-- 1. Updated-at trigger helper expected by the next hardening migration.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_set_updated_at() FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- 2. Inert compatibility shims for historical zero-argument references.
-- ---------------------------------------------------------------------------
-- The canonical helpers are public.has_role(uuid, public.app_role) and
-- public.is_owner(uuid, text). The following zero-argument overloads are not
-- used by application policies; they exist only so the next migration's
-- unqualified hardening statements can resolve while preserving the original
-- migration file.
CREATE OR REPLACE FUNCTION public.has_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT false;
$$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT false;
$$;

REVOKE ALL ON FUNCTION public.has_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_owner() FROM PUBLIC;

-- The two-argument has_role helper is intentionally left alone here. A later
-- security-hardening migration documents that authenticated/admin policy checks
-- still depend on it. Revoke the canonical ownership helper from anon if it is
-- present, using the exact signature created by the migration chain.
DO $$
BEGIN
  IF to_regprocedure('public.is_owner(uuid, text)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.is_owner(uuid, text) FROM anon';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. quote_methods.curation_status compatibility baseline.
-- ---------------------------------------------------------------------------
-- 20260505010059_expand_drama_themes_and_curation_status.sql assumes this
-- column and constraint already exist. The allowed values below match that
-- later migration so it can drop and recreate the constraint during an empty
-- staging replay. This does not add Drama data.
ALTER TABLE IF EXISTS public.quote_methods
  ADD COLUMN IF NOT EXISTS curation_status text DEFAULT 'strong';

ALTER TABLE IF EXISTS public.quote_methods
  ALTER COLUMN curation_status SET DEFAULT 'strong';

ALTER TABLE IF EXISTS public.quote_methods
  DROP CONSTRAINT IF EXISTS quote_methods_curation_status_check;

ALTER TABLE IF EXISTS public.quote_methods
  ADD CONSTRAINT quote_methods_curation_status_check
  CHECK (curation_status = ANY (ARRAY['review', 'core', 'strong', 'good', 'draft']::text[]));

COMMENT ON COLUMN public.quote_methods.curation_status IS
  'Compatibility baseline for staging migration replay. Review Drama-scope curation values before production use.';
