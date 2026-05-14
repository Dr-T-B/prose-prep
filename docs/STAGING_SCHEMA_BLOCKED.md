# Staging Schema Blocked

Date: 2026-05-14

## Scope

This document records why staging schema preparation was blocked before any
database mutation.

- Repository: `Dr-T-B/prose-prep`
- Staging project ref: `nxlxunygoccbnzdopqna`
- Production deny-list ref: `szdgsmpxtifrcmwelqfo`
- Production touched: no
- Migrations applied: no
- Type generation unblocked: no

No secrets were inspected or printed.

## Blocker

The local migration set is not safe to apply to an empty staging database as-is.

`supabase/migrations/20260429140000_secure_progress_tables_and_functions.sql`
references function signatures that are not created by the local migration
history:

```sql
REVOKE EXECUTE ON FUNCTION has_role() FROM anon;
REVOKE EXECUTE ON FUNCTION is_owner() FROM anon;
ALTER FUNCTION trigger_set_updated_at() SET search_path = public;
```

The migration history creates `public.has_role(uuid, public.app_role)` and
`public.is_owner(uuid, text)`, not zero-argument versions. The
`trigger_set_updated_at()` function exists in
`src/stage1/sql/migration_thematic_axis.sql`, which is outside
`supabase/migrations/`, so it is not guaranteed to exist in a fresh staging
database.

`supabase/migrations/20260505010059_expand_drama_themes_and_curation_status.sql`
also assumes `quote_methods.curation_status` and
`quote_methods_curation_status_check` already exist, but the prior local
migration history does not create them.

## Commands Not Run

The following commands were intentionally not run:

```bash
npx supabase db push --linked
npx supabase db reset
npx supabase migration repair
npx supabase functions deploy
npx supabase functions serve
```

Read-only linked staging checks were also not rerun in this pass because the
migration audit reached a stop condition before any database command was
necessary. The current worktree also has no `supabase/.temp/project-ref` file to
reconfirm the active linked project from local CLI metadata.

## Recommended Next Action

Create a staging-only forward reconciliation migration, or a deliberate
staging-only repair plan, that does all of the following:

1. Replaces zero-argument function references with the actual function
   signatures or guards them with catalog checks.
2. Ensures any referenced helper function, including any updated-at trigger
   helper, exists in the canonical migration chain before it is altered.
3. Adds or reconciles `quote_methods.curation_status` before altering its check
   constraint, or removes that migration from the Prose staging chain if it is
   Drama-scope drift.
4. Decides whether Drama-scoped migrations belong in this Prose staging repo.

After that reconciliation, rerun the staging identity and linkage checks, then
rerun the read-only Supabase verification before any `db push --linked`.

