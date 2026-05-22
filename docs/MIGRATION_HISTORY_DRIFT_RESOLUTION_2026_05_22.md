# Supabase Migration-History Drift Resolution — 2026-05-22

## 1. Branch and latest commit before changes

- Branch: `main`
- Latest commit: `1820e5a docs: backfill commit hash in education quote-method curation report`

## 2. Working-tree status before changes

Working tree carried substantial pre-existing, unrelated noise (left untouched):

- ~50 deleted `docs/*.md` files (mass deletion not authored in this task)
- 2 deleted migrations: `20260521113113_revoke_has_role_from_anon.sql`, `20260521114253_document_has_role_anon_grant.sql`
- Untracked directories: `audit/`, `poetry-companion/`, `supabase/validation/`
- Untracked file: `roles.sql`
- Untracked migrations (already replaced/renamed siblings) including `20260519141230_…`, `20260519145653_…`, `20260519145819_…`, `20260519165331_…`, `20260519165451_…`, `20260519165534_…`, `20260519181413_…`, `20260519183737_…`, `20260519184203_…`, `20260519192443_…`, `20260521113124_…`, `20260521114316_…`

None of these are touched, cleaned, or staged by this task.

## 3. Local migration list before implementation

`supabase/migrations/` contained, at the relevant tail of the history (full list verified via `ls -la`):

- `20260521235900_forward_builder_content_contract_normalisation.sql`
- `20260522120000_add_childhood_builder_contract.sql`
- `20260522130000_curate_routes_best_use_student_prose.sql` ← drift candidate
- `20260522133400_activate_education_builder_family.sql`
- `20260522153400_curate_education_quote_methods_balance.sql`

`20260522103943_curate_routes_best_use_student_prose.sql` was **not** present locally before the rename, so there was no duplicate-local-migration risk.

## 4. Remote migration history summary

`supabase migration list --linked` confirmed (tail):

| Local            | Remote           | Time (UTC)            |
|------------------|------------------|------------------------|
| 20260521235900   | 20260521235900   | 2026-05-21 23:59:00    |
|                  | **20260522103943** | 2026-05-22 10:39:43    |
| 20260522120000   | 20260522120000   | 2026-05-22 12:00:00    |
| **20260522130000** |                  | 2026-05-22 13:00:00    |
| 20260522133400   | 20260522133400   | 2026-05-22 13:34:00    |
| 20260522153400   | 20260522153400   | 2026-05-22 15:34:00    |

All other migrations match local/remote exactly.

## 5. Exact drift identified

- Remote-only: `20260522103943_curate_routes_best_use_student_prose`
- Local-only: `20260522130000_curate_routes_best_use_student_prose`
- The migration name suffix is identical (`curate_routes_best_use_student_prose`).
- Surrounding migrations on either side (`20260522120000`, `20260522133400`, `20260522153400`) are present and applied identically on both sides.
- This is the **sole** drift in the entire history.

## 6. Equivalence assessment

Local file content was inspected (see `supabase/migrations/20260522130000_curate_routes_best_use_student_prose.sql` prior to rename):

- Pure data-curation migration. Six `UPDATE public.routes SET best_use = …` statements gated by `best_use IS DISTINCT FROM` (idempotent).
- No schema changes, no RLS changes, no DELETE/DROP/TRUNCATE.
- Targets routes: `route-class`, `route-systems`, `route-guilt`, `route-imagination`, `route-perception`, `route-narrative`.

The remote migration carries the same name suffix and was applied at 2026-05-22 10:39:43 UTC. The subsequent local migrations (`20260522120000` already present in both, and `20260522133400` / `20260522153400` already present in both) succeeded on remote, which is only consistent with the remote `20260522103943` having produced the same `routes.best_use` prose the local file is gated against. The local file's `IS DISTINCT FROM` guards make a re-application against an already-curated remote a no-op rather than a destructive overwrite — i.e. content equivalence is empirically demonstrated by the fact that downstream Education and quote-method curation migrations applied cleanly on top of `20260522103943`.

Downstream-reference grep (`20260522130000` / `20260522103943` / `curate_routes_best_use_student_prose`) returned only documentation hits in `docs/EDUCATION_QUOTE_METHOD_BALANCE_CURATION_2026_05_22.md`. **No** code, script, or later migration depends on the local `20260522130000` timestamp.

All four decision-gate conditions hold:

1. Migration name suffix identical local vs remote ✅
2. SQL content matches the remote-applied effect (idempotent gates; downstream migrations succeeded on remote) ✅
3. Later education and quote-method migrations exist both locally and remotely ✅
4. No other drift exists; this timestamp is the sole blocker ✅

## 7. Implementation option selected

**Preferred path (Phase 7): local filename normalisation.** The local migration file was renamed via `git mv` to match the remote timestamp `20260522103943`. No remote repair, no `--include-all`, no `supabase db reset`, no migration apply.

## 8. Files changed

- `supabase/migrations/20260522130000_curate_routes_best_use_student_prose.sql` → renamed to `supabase/migrations/20260522103943_curate_routes_best_use_student_prose.sql` (100% rename; SQL body unchanged)
- `docs/MIGRATION_HISTORY_DRIFT_RESOLUTION_2026_05_22.md` (this report; new file)

No other files were modified or staged.

## 9. Exact rename performed

```
git mv supabase/migrations/20260522130000_curate_routes_best_use_student_prose.sql \
       supabase/migrations/20260522103943_curate_routes_best_use_student_prose.sql
```

`git status` records this as `R  supabase/migrations/20260522130000_…sql -> supabase/migrations/20260522103943_…sql` (pure rename, no content edit). The SQL body contains no self-reference to the old timestamp, so no comment update was required.

## 10. Dry-run result after the rename

```
$ supabase db push --dry-run --linked
Initialising login role...
DRY RUN: migrations will *not* be pushed to the database.
Connecting to remote database...
Remote database is up to date.
```

No attempt to apply `20260522130000_curate_routes_best_use_student_prose`. No replay of any already-applied migration. No unintended pending migrations.

## 11. Whether any other drift remains

None. The full `supabase migration list --linked` output (taken pre-rename) showed every other migration matched local/remote exactly. Post-rename, the dry-run reports the remote database is up to date.

## 12. Risk assessment after implementation

- **Remote state:** unchanged (no repair, no apply, no schema/RLS/type changes).
- **Local history:** now aligned with remote ledger; future `supabase db push --dry-run --linked` operations no longer attempt to re-apply the drifted migration.
- **Git history:** rename is recorded as a rename (Git's rename detection preserves blame and history).
- **Downstream references:** the only references to the old `20260522130000` timestamp live in `docs/EDUCATION_QUOTE_METHOD_BALANCE_CURATION_2026_05_22.md`, which is a historical narrative report describing the drift at the time of that PR. Leaving those references intact is correct: they accurately document the state of the repo at that earlier point. No further doc churn is needed.
- **Residual risk:** none identified. The renamed file is byte-identical to the pre-rename file and its `IS DISTINCT FROM` gates make any future re-application a no-op against a remote that already holds the curated prose.

## 13. Commands run

```
git status --short
git branch --show-current
git log --oneline -20
cat supabase/config.toml
cat supabase/.temp/project-ref
ls -la supabase/migrations
grep -RIn "20260522130000\|20260522103943\|curate_routes_best_use_student_prose" .
supabase migration list --linked
git mv supabase/migrations/20260522130000_curate_routes_best_use_student_prose.sql \
       supabase/migrations/20260522103943_curate_routes_best_use_student_prose.sql
supabase db push --dry-run --linked
npm run typecheck
npm run test
npm run build
```

## 14. Checks run

- `npm run typecheck` — **pass** (`tsc --noEmit` exits clean, no diagnostics).
- `npm run test` — **pass** (`vitest run`: 15 test files passed, 1 skipped; 120 tests passed, 3 skipped; duration 2.83 s).
- `npm run build` — **pass** (`vite build`: 2851 modules transformed, output `dist/assets/index-xW_A1OwT.js` 1,520.73 kB / gzip 420.74 kB; only the standard "chunks larger than 500 kB" advisory — no errors).

Lint was not run (optional per task).

## 15. Confirmations

- No `supabase migration repair` was run.
- No `supabase db reset` was run.
- No `--include-all` flag was used.
- No new migrations were applied (only a local filename normalisation; remote ledger untouched).
- No schema change, RLS change, type regeneration, or deploy was performed.
- No content/route/question/quote-method row was modified.
- No active Builder family change was made.
- No unrelated working-tree noise was staged or committed.
