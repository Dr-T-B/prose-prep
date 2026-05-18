# Supabase Migration History Reconciliation Report

Date: 2026-05-18
Repository: `Dr-T-B/prose-prep`
Branch: `fix/supabase-migration-history-reconciliation`
Supabase target project (read-only via MCP): `nxlxunygoccbnzdopqna` (prose-craft-aid-staging)
Projects explicitly NOT touched: `szdgsmpxtifrcmwelqfo`, `lopjupwadwahkjyhghvb`, `qklfhebbrinsyfyuyiuj`

## 1. Objective

Reconcile local and remote Supabase migration history so that the two new
audit migrations (`20260518133000_remove_drama_scene_contamination_from_prose_db.sql`
and `20260518134000_seed_component2_audit_recommendation_content.sql`) can be
safely dry-run and later applied through the normal workflow.

## 2. Baseline drift

Initial state (branch `main`, pre-reconciliation):

- Local migration count: **44** (42 pre-existing tracked + 2 new audit, untracked)
- Remote migration count (`supabase_migrations.schema_migrations`): **49**

### Remote versions missing locally (12)

Each of these was applied to remote directly through Supabase Studio / Lovable
and was never committed under its `version` timestamp in any local branch
(`git log --all -- supabase/migrations/<version>*` returned no commits).

| Version           | Name                                    |
|-------------------|-----------------------------------------|
| 20260515195312    | add_is_active_to_glossary_terms         |
| 20260515195327    | create_paragraph_stems                  |
| 20260515202707    | align_paragraph_stems_to_ts_interface   |
| 20260515202712    | add_is_active_to_questions              |
| 20260515202803    | seed_questions                          |
| 20260515202908    | seed_library_thesis_bank                |
| 20260515202915    | seed_library_context_bank               |
| 20260515232330    | create_quotes_table                     |
| 20260516115407    | a1_extend_comparative_matrix            |
| 20260516115659    | a3_create_themes                        |
| 20260516115704    | a5_create_ao_readiness                  |
| 20260516120515    | a3_a5_broaden_read_policies             |

### Local versions not on remote (7)

| Version           | Name                                    | Disposition                         |
|-------------------|-----------------------------------------|-------------------------------------|
| 20260515000001    | align_paragraph_stems_to_ts_interface   | duplicate of remote `20260515202707` |
| 20260515000002    | add_is_active_to_questions              | duplicate of remote `20260515202712` |
| 20260515000003    | seed_questions                          | duplicate of remote `20260515202803` |
| 20260515000004    | seed_library_thesis_bank                | duplicate of remote `20260515202908` |
| 20260515000005    | seed_library_context_bank               | duplicate of remote `20260515202915` |
| 20260518133000    | remove_drama_scene_contamination        | new audit migration (keep)          |
| 20260518134000    | seed_component2_audit_recommendation    | new audit migration (keep)          |

The five `20260515000001..005` files were committed in `e1d43b7` (branch
`port/prose-tutor-components`, surfaced into `main`'s working tree). Their SQL
is functionally equivalent to the remote `20260515202707..202915` migrations
that Studio/Lovable applied with a different (later) timestamp. Pushing the
five locally-timestamped duplicates would either fail (DDL already applied
remotely under the other timestamps) or pollute `schema_migrations` with
phantom version rows.

## 3. Actions taken

All actions were limited to the local `supabase/migrations/` directory. No
`supabase migration repair` was run. No production data was altered. No
schema-changing SQL was invented — every restored migration body was copied
byte-faithfully from `supabase_migrations.schema_migrations.statements` on
the linked project.

### 3.1 Created 12 missing local migration files

Each file's content is the exact statement string applied to remote, retrieved
via the read-only Supabase MCP. No edits.

```
supabase/migrations/20260515195312_add_is_active_to_glossary_terms.sql
supabase/migrations/20260515195327_create_paragraph_stems.sql
supabase/migrations/20260515202707_align_paragraph_stems_to_ts_interface.sql
supabase/migrations/20260515202712_add_is_active_to_questions.sql
supabase/migrations/20260515202803_seed_questions.sql
supabase/migrations/20260515202908_seed_library_thesis_bank.sql
supabase/migrations/20260515202915_seed_library_context_bank.sql
supabase/migrations/20260515232330_create_quotes_table.sql
supabase/migrations/20260516115407_a1_extend_comparative_matrix.sql
supabase/migrations/20260516115659_a3_create_themes.sql
supabase/migrations/20260516115704_a5_create_ao_readiness.sql
supabase/migrations/20260516120515_a3_a5_broaden_read_policies.sql
```

### 3.2 Deleted 5 duplicate local migration files

```
supabase/migrations/20260515000001_align_paragraph_stems_to_ts_interface.sql
supabase/migrations/20260515000002_add_is_active_to_questions.sql
supabase/migrations/20260515000003_seed_questions.sql
supabase/migrations/20260515000004_seed_library_thesis_bank.sql
supabase/migrations/20260515000005_seed_library_context_bank.sql
```

These were `git rm`'d to remove tracked duplicates that would otherwise
attempt to re-apply DDL already present on remote.

### 3.3 Audit migrations unchanged

```
supabase/migrations/20260518133000_remove_drama_scene_contamination_from_prose_db.sql
supabase/migrations/20260518134000_seed_component2_audit_recommendation_content.sql
```

Byte-identical to what Codex produced in the prior audit implementation pass.

## 4. Post-reconciliation state

Local migration count: **51**
Remote migration count: **49**

Diff (computed against the live `supabase_migrations.schema_migrations` table):

- **Local versions not on remote**: `20260518133000`, `20260518134000` (exactly the two expected new audit migrations).
- **Remote versions not on local**: none.

This is the same shape a clean `npx supabase db push --dry-run` would print:
two pending migrations, no drift.

## 5. Result of `npx supabase db push --dry-run`

The CLI dry-run **could not be executed from this host** because
`api.supabase.com/v1/projects/<ref>/cli/login-role` returns
`TLS handshake timeout` repeatedly:

```
Initialising login role...
failed to initialise login role: Post "https://api.supabase.com/v1/projects/nxlxunygoccbnzdopqna/cli/login-role":
  net/http: TLS handshake timeout
```

`ping api.supabase.com` succeeds (38 ms RTT), so DNS and the network path are
fine. HTTPS to the Supabase management API is the failing layer — likely a
transient API issue or local proxy/firewall behavior. This is **not** related
to migration drift.

The data-layer equivalent of the dry-run was performed via the read-only
Supabase MCP `execute_sql`:

```sql
select version from supabase_migrations.schema_migrations order by version;
```

The result was diffed against the local `supabase/migrations/` filenames. The
only delta is the two audit migrations. Once the management-API reachability
issue clears, `npx supabase db push --dry-run` should print exactly:

```
20260518133000_remove_drama_scene_contamination_from_prose_db.sql
20260518134000_seed_component2_audit_recommendation_content.sql
```

and nothing else as pending.

## 6. Local verification suite

All local commands run on this branch with the reconciled migrations directory:

- `npm run typecheck` — passed (no output, exit 0).
- `npm test` — **79 passed, 3 skipped** (integration suite skip, expected).
- `npm run build` — passed; existing Browserslist and chunk-size warnings unchanged.
- `npm run validate:component2-ao` — passed; **0 blocked AO5 references**; 140 allowed/guardrail references classified.
- `npm run scan:component2-staged-content` — passed; **0 hard blockers**; 2 allowed guardrail hits in `staging/component2/README.md`.
- `npm run validate:component2-staged-content` — passed with 0 errors; reports 22 manual canonical-export files still missing (unrelated to migration history; tracked under Phase 5).
- `npm run dry-run:component2-import` — passed; no Supabase writes; report rewritten at `docs/COMPONENT_2_CONTENT_EXPORT_AO_SWEEP_DRY_RUN_REPORT.md`.

## 7. Rules followed

- No `supabase db push` (apply) executed.
- No `supabase migration repair`, `db reset`, or any destructive command executed.
- No production data altered.
- No schema-changing SQL invented — restored bodies are byte-faithful copies of the SQL Supabase itself recorded as applied.
- The two new audit migration files are unchanged.
- Other Supabase projects (`szdgsmpxtifrcmwelqfo`, `lopjupwadwahkjyhghvb`, `qklfhebbrinsyfyuyiuj`) untouched.
- No RLS policies weakened (restored migrations re-create the same RLS the remote already enforces).

## 8. Residual risks

1. **Management-API reachability**: `npx supabase db push --dry-run` cannot currently complete because `api.supabase.com` HTTPS is unreachable from this host. The data-layer verification in §4 is equivalent in content but should be confirmed by a clean CLI dry-run before Phase 2 (apply).
2. **Branch divergence from main**: The five `20260515000001..005` migrations were tracked on `main` (via commit `e1d43b7`). This branch deletes them. Reviewers should confirm those deletions are acceptable before merge — they are not used by any Supabase environment because remote applied the equivalent DDL under the later `20260515202xxx` timestamps.
3. **Phase 5 canonical exports** still report 22 missing files. That is a separate workstream (manual exports under `staging/component2/`) and is not a blocker for Phase 2.

## 9. Final recommendation

**SAFE TO APPLY AUDIT MIGRATIONS** — conditional on one final check.

The migration directory is reconciled at the data layer. Before running
`npx supabase db push` (Phase 2), the operator should:

1. Re-run `npx supabase db push --dry-run` from a host with working
   `api.supabase.com` HTTPS reachability, and confirm only
   `20260518133000` and `20260518134000` are listed as pending.
2. Then proceed with Phase 2 per the project plan.

If the CLI dry-run reports any other migration as pending, **do not apply**;
re-open this report.
