# Staging Schema Preparation

Date: 2026-05-14

## Scope

Prepare, or safely block preparation of, the staging Supabase schema for the
Prose app.

- Repository: `Dr-T-B/prose-prep`
- Staging project ref used for safety checks: `nxlxunygoccbnzdopqna`
- Production deny-list ref: `szdgsmpxtifrcmwelqfo`
- Production used: no
- Database types regenerated: no

## Repository Identity

Confirmed.

Evidence:

- Git remote is `https://github.com/Dr-T-B/prose-prep.git`.
- `docs/REPO_IDENTITY.md` identifies `prose-prep` as the staging/development
  repo.
- `BACKEND_STATUS.md` says staging configuration points to
  `nxlxunygoccbnzdopqna` and production is not authorized from this repo.

## Supabase Linkage

Partially confirmed.

`supabase/config.toml` points to:

```text
nxlxunygoccbnzdopqna
```

It does not point to:

```text
szdgsmpxtifrcmwelqfo
```

`supabase/.temp/project-ref` is not currently present in this worktree.
`supabase/.temp/` is ignored by `.gitignore`.

Because the migration audit found a stop-condition blocker, no Supabase linked
database command was run in this pass.

## Environment Safety

Confirmed.

`.env.example` contains placeholder staging values only:

```env
VITE_SUPABASE_URL=STAGING_SUPABASE_URL_HERE
VITE_SUPABASE_ANON_KEY=STAGING_SUPABASE_ANON_KEY_HERE
```

`.env`, `.env.local`, and `.env.*.local` are ignored. Real local env files were
not inspected.

A committed-repo search found `szdgsmpxtifrcmwelqfo` only in safety/audit
documentation, not in runtime config, app code, scripts, or deploy config.

## Migration Plan Summary

See `docs/STAGING_MIGRATION_PLAN.md`.

The local migration set was audited in order. It is currently blocked for empty
staging because:

- `20260429140000_secure_progress_tables_and_functions.sql` references
  zero-argument function signatures and `trigger_set_updated_at()` that are not
  created in the canonical migration chain.
- `20260505010059_expand_drama_themes_and_curation_status.sql` assumes a
  `quote_methods.curation_status` column and check constraint that prior local
  migrations do not create.

## Migration Application Result

Migrations were not applied.

The allowed command below was not run:

```bash
npx supabase db push --linked
```

No destructive commands were run.

## Schema Verification Result

No linked schema verification was run in this pass because the migration audit
blocked before any database command.

Expected tables were therefore not verified in this run.

Expected tables found: not checked.

Expected tables missing: not checked.

## Type Generation

Type generation remains blocked until staging has a verified, structurally
usable schema.

## App Checks

Run with the available default runtime:

```text
node v24.10.0
npm 11.6.0
```

Node 22.x was not available in this shell.

Results:

- `npm run test`: passed. 12 test files passed, 1 skipped; 64 tests passed, 3
  skipped.
- `npm run lint`: passed with 24 existing warnings and 0 errors.
- `npm run build`: passed. Vite emitted the existing Browserslist freshness
  notice and a large chunk-size warning.
- `typecheck`: no `typecheck` script exists in `package.json`.

## Remaining Manual Actions

1. Reconcile the blocked migrations with a staging-safe forward migration or
   explicit staging repair plan.
2. Reconfirm `supabase/.temp/project-ref` points to
   `nxlxunygoccbnzdopqna`, or relink using the staging ref only.
3. Run read-only staging checks:

```bash
npx supabase migration list --linked
npx supabase inspect db table-stats --linked
```

4. If and only if the migration plan is clean and the linked project is
   confirmed as staging, run:

```bash
npx supabase db push --linked
```

5. Rerun schema verification and only then unblock Supabase type generation.
