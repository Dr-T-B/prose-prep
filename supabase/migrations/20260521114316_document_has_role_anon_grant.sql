-- S3-011 follow-up: document why public.has_role(uuid, app_role) remains
-- callable by anon. Audited 2026-05-21.
--
-- Many RLS policies in this DB use has_role inside OR predicates, e.g.
--   USING (published = true OR public.has_role(auth.uid(), 'admin'::app_role))
-- Postgres does not guarantee short-circuit evaluation of OR in RLS
-- predicates, so the function must remain EXECUTEable by every role that
-- can SELECT the affected tables — including anon for any public-read
-- table reached through ProtectedRoute allowAnonymous in the frontend.
--
-- Prior migrations established this on purpose:
--   20260429010000_fix_critical_rls_and_student_progress.sql
--   20260516223100_tighten_function_execute_grants.sql
-- The 20260521113124 attempt to REVOKE FROM anon was a no-op because
-- anon inherits EXECUTE from PUBLIC, and revoking from PUBLIC would
-- break anon SELECTs against those tables.
--
-- Trade-off accepted: low-impact unauthenticated probing of role
-- assignments via /rest/v1/rpc/has_role is preferred over breaking
-- anonymous browsing 11 days before the 2026-06-01 exam.
--
-- Post-exam, revisit with a transactional test (SET LOCAL ROLE anon
-- against representative public-read tables) before any revoke attempt.

comment on function public.has_role(uuid, public.app_role) is
  'EXECUTE intentionally granted to anon via PUBLIC. Required by RLS policies that use has_role inside OR predicates (e.g. published = true OR has_role(...)). See migration 20260521114253 for full rationale.';
