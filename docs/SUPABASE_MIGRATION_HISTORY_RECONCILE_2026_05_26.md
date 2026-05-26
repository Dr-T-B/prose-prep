# Supabase Migration History Reconciliation - 2026-05-26

## Scope

This was a repo-only reconciliation pass for Supabase migration history drift.
No Supabase write operations were run, and no remote schema, data, migration
ledger, RLS policy, edge function, or generated type was changed.

## Renamed local exact-match migrations

The following local migration files were renamed to match the already-applied
remote migration versions identified by the read-only drift audit:

| Previous local file | Remote-applied filename now used locally |
|---|---|
| `20260525204715_drop_timed_sessions_plan_id_fk.sql` | `20260525204748_drop_timed_sessions_plan_id_fk.sql` |
| `20260525205028_essay_questions_year_tagging.sql` | `20260525205055_essay_questions_year_tagging.sql` |
| `20260525205433_reconcile_saved_essay_plans.sql` | `20260525195545_reconcile_saved_essay_plans.sql` |
| `20260525205453_seed_model_essay_marriage_2022.sql` | `20260525205719_seed_model_essay_marriage_2022.sql` |
| `20260525233312_add_2024_q1_female_relationships.sql` | `20260525223724_add_2024_q1_female_relationships.sql` |

Only filenames changed. The SQL bodies were preserved.

## Deliberately not added

### `20260524222952_create_annotated_essay_practice_pack.sql`

The audit evidence says this remote-only migration is a normalized SQL duplicate
of local `20260524193000_create_annotated_essay_practice_pack.sql`, while the
remote ledger also contains `20260524193000`.

This pass leaves `20260524193000_create_annotated_essay_practice_pack.sql`
untouched and does not add a second local copy under `20260524222952`. Adding a
duplicate file would cause local replay/reset flows to execute the same schema
migration twice. Renaming the existing local file would also be unsafe because it
would make the repo lose the local counterpart for the remote-applied
`20260524193000` version.

### `20260523170000_optimize_performance.sql`

The audit describes this remote-only migration as a dynamic performance
optimization that rewrites RLS policies and creates missing foreign-key indexes.
No exact SQL text for the remote-applied migration was found in the local repo
or branch-history search during this pass.

Because the exact statements were not available, this pass does not invent or
reconstruct the migration. It should only be added after a read-only source of
the original remote statements is available.

## Why Supabase writes were not run

The remote project is the current source of truth, and the goal of this pass is
to make the repository better reflect that state without mutating the live
database. Running `supabase db push`, `supabase migration up`, `supabase
migration repair`, `supabase db reset`, `supabase db pull`, `supabase migration
fetch`, `supabase migration squash`, or any equivalent remote mutation would
change the risk profile from repo reconciliation to database-history surgery.

## Remaining risks

- Local migration history still does not contain a faithful file for remote
  version `20260523170000`; future DB migration authoring should remain paused
  until the exact SQL is recovered from a read-only source.
- Remote version `20260524222952` remains intentionally undocumented as a local
  executable migration file because duplicating the local schema migration would
  change local replay behavior.
- This pass relies on prior audit evidence that the five renamed files are
  normalized SQL exact-matches for their remote counterparts.
