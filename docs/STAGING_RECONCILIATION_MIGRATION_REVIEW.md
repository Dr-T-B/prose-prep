# Staging Reconciliation Migration Review

Date: 2026-05-14

## Scope

This review covers the draft migration:

```text
supabase/migrations/20260429135959_reconcile_staging_schema_chain.sql
```

The file was drafted for local migration-chain preparation only. It was not
applied to staging or production, no Supabase database command was run, and no
database types were regenerated.

## Why This Migration Is Needed

The blocker documents were reviewed:

- `docs/STAGING_MIGRATION_PLAN.md`
- `docs/STAGING_SCHEMA_BLOCKED.md`
- `docs/STAGING_SCHEMA_PREPARATION.md`

They correctly identify that the local migration chain cannot be replayed into
an empty staging database as-is.

The first blocker is
`20260429140000_secure_progress_tables_and_functions.sql`, which references:

- `has_role()` with zero arguments;
- `is_owner()` with zero arguments;
- `trigger_set_updated_at()`.

The canonical chain creates `public.has_role(uuid, public.app_role)` and
`public.is_owner(uuid, text)`. It does not create
`public.trigger_set_updated_at()` inside `supabase/migrations/` before the
blocked migration.

The second blocker is
`20260505010059_expand_drama_themes_and_curation_status.sql`, which assumes
`quote_methods.curation_status` and
`quote_methods_curation_status_check` already exist. Prior local migrations do
not create that column or constraint.

## Diagnosis From Direct Migration Inspection

`20260417115303_ad3baa4f-aadd-4672-a69c-5c25aa86db70.sql` creates
`public.update_updated_at_column()` and `public.is_owner(uuid, text)`, then uses
`update_updated_at_column()` for content and private-state table triggers.

`20260418143855_29349ec3-093e-4d1b-bfb8-217890f6f529.sql` creates
`public.app_role`, `public.user_roles`, and
`public.has_role(uuid, public.app_role)`. It also uses
`update_updated_at_column()` for `saved_views`.

`20260429140000_secure_progress_tables_and_functions.sql` drops and recreates
student-state policies, then tries to revoke `has_role()` and `is_owner()` with
zero arguments and alter `trigger_set_updated_at()`. Those exact objects are
not present earlier in the canonical migration chain.

`20260430000000_security_hardening.sql` already uses catalog guards for updated
at helpers and revokes `public.is_owner(uuid, text)` from `anon` by exact
signature. It intentionally leaves `has_role(uuid, public.app_role)` available
for policy checks.

`20260505010059_expand_drama_themes_and_curation_status.sql` creates or
replaces `public.validate_themes(text[])`, then drops and recreates
`quote_methods_curation_status_check` against `quote_methods.curation_status`.
That column and constraint are not created by the preceding local migrations.

`20260422120000_extend_quote_methods.sql` adds many structured quote fields but
does not add `curation_status`.

`src/stage1/sql/migration_thematic_axis.sql` creates
`trigger_set_updated_at()`, but that SQL file is outside the canonical
`supabase/migrations/` chain.

`sql/core_current_schema.sql` is a reconstructed reference schema, not the
canonical migration chain. It confirms the canonical helper signatures
`has_role(uuid, public.app_role)` and `is_owner(uuid, text)`.

## Strategy Before SQL

The safest available reconciliation is to add a new migration file rather than
edit historical migrations. Because the first blocked migration is timestamped
`20260429140000`, the reconciliation file must sort immediately before it. A
later `20260514...` migration would run too late for an empty staging replay.

The migration:

- creates `public.trigger_set_updated_at()` so the next migration can alter it;
- creates inert zero-argument overloads for `public.has_role()` and
  `public.is_owner()` only to satisfy the historical unguarded revoke
  statements;
- revokes public execution from those inert overloads;
- revokes `public.is_owner(uuid, text)` from `anon` with an exact
  catalog-guarded signature;
- adds a compatibility baseline for `quote_methods.curation_status` and
  `quote_methods_curation_status_check`;
- does not add Drama data.

The zero-argument overloads should receive line-by-line review. They are
compatibility shims, not application helpers.

## Blockers Addressed

The helper-function section addresses the missing
`trigger_set_updated_at()` object and the historical zero-argument helper
references in `20260429140000_secure_progress_tables_and_functions.sql`.

The `quote_methods.curation_status` section addresses the assumptions in
`20260505010059_expand_drama_themes_and_curation_status.sql`.

The SQL comments document that the curation-status compatibility is present so
the Drama-scoped migration can replay. They do not approve the Drama-scope drift
for production use.

## Why Historical Migrations Were Not Edited

Historical migrations were left intact to preserve auditability and avoid
silently rewriting migration history. The new file makes the chain replayable
for staging review while keeping the original blockers visible in the files
that introduced them.

## Idempotence

The migration is intended to be idempotent:

- helper functions use `CREATE OR REPLACE FUNCTION`;
- function hardening uses an exact-signature catalog guard;
- the curation column uses `ADD COLUMN IF NOT EXISTS`;
- the curation constraint is dropped with `DROP CONSTRAINT IF EXISTS` before it
  is recreated.

## Destructive Operations

The migration does not drop tables, delete rows, truncate data, or rewrite
existing content. It drops and recreates only the
`quote_methods_curation_status_check` constraint so the later migration can do
the same operation safely.

## Data Changes

The migration does not insert, update, or delete data. It adds a default for
future `quote_methods.curation_status` values. On a non-empty database, adding a
new column with a default may populate that new column according to PostgreSQL
semantics; this task did not apply the migration anywhere.

## Production Safety

Production was not touched. No Supabase project was connected to, migrated,
seeded, reset, repaired, or otherwise mutated.

The production Supabase ref remains deny-listed for this work. No secrets were
inspected or printed.

## Drama-Scope Drift

The local migration chain includes Drama-scoped schema/data assumptions inside a
Prose app repo. This reconciliation keeps the chain technically replayable for
empty staging, but it does not decide that Drama-scoped migration content
belongs in the Prose product.

The later Drama migration constrains `curation_status` to:

```text
review, core, strong, good, draft
```

The app seed types currently use:

```text
secure, strong, top_band
```

Only `strong` overlaps. That mismatch should be reviewed before the migration
is applied to any shared staging environment.

## Next-PR Testing

In the next PR, after line-by-line SQL review and staging-link confirmation,
test only against the staging project:

1. Confirm local Supabase CLI linkage points to staging only.
2. Run read-only migration-list checks.
3. Apply the reviewed migration chain to empty staging only.
4. Verify expected tables, helpers, policies, and constraints.
5. Regenerate Supabase types only after staging schema verification passes.

## Type Generation

Type generation remains blocked until the reviewed migration is actually
applied to staging and the staging schema is verified.
