# Forward Builder Content-Contract Apply — 2026-05-21

## Executive Summary

A new forward-only Builder content-contract migration was created, dry-run verified, and applied to the linked Supabase project `nxlxunygoccbnzdopqna`. Active Builder families are now exactly `{class, guilt, imagination}`, all level vocabulary is canonical (`secure` / `strong` / `top_band`), and the three canonical Builder questions exist as active rows with valid route references. Post-apply validation returns zero unsupported active families, zero unsupported level values, zero broken active-question route references, and zero missing required fields.

## Why a Forward Migration Was Needed

The previous Builder content-contract migration `20260521231500_builder_content_contract_normalisation.sql` was content-valid but could not be applied because four older local-only replay / source-capture migrations remained unpushed in `supabase/migrations/`. The Supabase CLI flags every local migration that is absent from the remote `supabase_migrations.schema_migrations` ledger as pending, regardless of timestamp ordering. Creating a new file timestamped *after* the latest remote-applied migration does not by itself exclude older local-only files from the push set — the only safe path to a clean single-migration push (without `--include-all`, without `migration repair`, without `db reset`) is to move the blocking files out of `supabase/migrations/` into an archive folder. The four blockers plus the prior `20260521231500` (whose logic was copied into the new forward file) were archived locally.

## New Migration Created

- `supabase/migrations/20260521235900_forward_builder_content_contract_normalisation.sql`

Timestamp is strictly after the latest remote-applied migration (`20260521114316`) and after the superseded `20260521231500`.

## Archived / Superseded Migrations

All five were **moved, not deleted**, to `supabase/migrations_archived/` with a `.superseded.sql` suffix. They remain on disk for audit/replay traceability:

- `supabase/migrations_archived/20260515202802_seed_component2_routes_for_questions.superseded.sql`
- `supabase/migrations_archived/20260519190000_seed_canonical_themes_for_replay.superseded.sql`
- `supabase/migrations_archived/20260519191000_seed_library_thesis_bank_route_tags_for_replay.superseded.sql`
- `supabase/migrations_archived/20260520160000_ao_readiness_nullable_columns.superseded.sql`
- `supabase/migrations_archived/20260521231500_builder_content_contract_normalisation.superseded.sql` (logic copied into the new forward file)

## Migration Safety Review

The new migration:

- **Idempotent** — every UPDATE is guarded by `WHERE level_tag IN (...legacy values)` or `WHERE family NOT IN (...canonical)`; re-running produces no further row changes once the canonical state is reached. The three canonical Builder INSERTs use `ON CONFLICT (id) DO UPDATE`.
- **Non-destructive** — no `DELETE`, no `DROP`, no `TRUNCATE`. Unsupported families are flipped to `is_active = false`, not removed.
- **Scope-limited** — only Builder content-contract normalisation: level vocabulary on 11 tables, question `is_active` gating, and the three canonical Builder questions.
- **No RLS changes**, no policy / grant changes.
- **No type regeneration**.
- **No deploys**.

## Pre-Apply Validation (read-only, against linked remote)

Active families before apply (15 unsupported, 0 supported):

```
changing_relationships, conflict, critique_of_society, difficult_circumstances,
education, female_relationships, friendship, hope, important_choices,
independence, love, marriage, role_models, roles_of_children, settings
```

- Unsupported active families: **15** (none of `class` / `guilt` / `imagination` were present)
- Unsupported level-value groups: **14** distinct (source, value) combinations across `routes`, `questions`, `theses`, `glossary_terms`, `interpretive_tensions`, `paragraph_stems`, `comparative_matrix` — values included `A`, `A*`, `A/A*`, `B`, `B/A`, `core`, `advanced`
- Broken active-question route references: **0**
- Missing required active Builder fields: **0**

## Dry-Run Result

```
$ npx supabase db push --dry-run --linked
DRY RUN: migrations will *not* be pushed to the database.
Connecting to remote database...
Would push these migrations:
 • 20260521235900_forward_builder_content_contract_normalisation.sql
Finished supabase db push.
```

Exactly one migration listed. None of the four banned replay files appeared; the superseded `20260521231500` did not appear (now archived).

## Apply Result

```
$ npx supabase db push --linked --yes
Connecting to remote database...
Applying migration 20260521235900_forward_builder_content_contract_normalisation.sql...
Finished supabase db push.
```

Confirmed by `npx supabase migration list --linked` — the new ledger entry is:

```
20260521235900 | 20260521235900 | 2026-05-21 23:59:00
```

## Post-Apply Validation

Active families after apply:

```
class       | 1
guilt       | 1
imagination | 1
```

Canonical Builder questions row check:

```
q-builder-class-contract        | class       | top_band | active | route-class       | route-systems
q-builder-guilt-contract        | guilt       | top_band | active | route-guilt       | route-narrative
q-builder-imagination-contract  | imagination | top_band | active | route-imagination | route-perception
```

- Unsupported active families: **0**
- Unsupported level values: **0**
- Broken active-question route references: **0**
- Missing required active Builder fields: **0**

## App Checks

- `npm run typecheck` — **Pass** (`tsc --noEmit` clean)
- `npm run test` — **Pass** (`vitest run`: 15 files / 120 tests passed, 1 file / 3 tests skipped — pre-existing `planRepository.integration.test.ts` skips, unrelated)
- `npm run build` — **Pass** (vite production build succeeded; only the pre-existing >500 kB chunk-size warning, unrelated)

## Remote Safety

- `db push` run: **Yes** (forward migration only)
- `--include-all` used: **No**
- `db reset` run: **No**
- `migration repair` run: **No**
- Destructive SQL run: **No**
- RLS policy changes made: **No**
- Supabase type regeneration: **No**
- App deployment: **No**

## Remaining Risks

1. **Unsupported exam-topic questions are preserved but inactive.** 15 question rows from prior families (`changing_relationships`, `conflict`, `critique_of_society`, `difficult_circumstances`, `education`, `female_relationships`, `friendship`, `hope`, `important_choices`, `independence`, `love`, `marriage`, `role_models`, `roles_of_children`, `settings`) remain in the table with `is_active = false`. They are out of the Builder surface but not removed; future content work can reactivate or prune them.
2. **`childhood` family lacks a paragraph job** unless separately repaired (carried forward from prior reports). Out of scope for this migration.
3. **Broader theme taxonomy remains mixed.** The level-vocabulary canonicalisation here covers the 11 contract tables; non-level fields (themes, tags) are not touched.
4. **Known RLS drift remains outside this task** (referenced in earlier dry-run / RLS-drift reviews). Not modified.
5. **The five archived migrations remain on disk in `supabase/migrations_archived/`.** They are intentionally unpushed. If the underlying replay/source-capture intent is still needed, future content work must reauthor as forward-only migrations or replay through a separate ingest path — they must not be moved back into `supabase/migrations/` without explicit review.
6. **The Supabase CLI version is one minor behind** (v2.98.2 installed, v2.101.0 available). Not material to this task; flagged for hygiene.

## Recommended Next Prompt

> Builder content-contract verification in the running app. With the forward migration `20260521235900_forward_builder_content_contract_normalisation.sql` applied, exercise the Builder UI end-to-end against the three canonical questions (`q-builder-class-contract`, `q-builder-guilt-contract`, `q-builder-imagination-contract`) using the Claude preview tools. Confirm the Builder surface lists exactly `{class, guilt, imagination}`; that each question loads its primary and secondary routes; that thesis, paragraph-job, quote-method, comparative-matrix, and interpretive-tension panels render without empty states; and that level-band filters resolve to `secure` / `strong` / `top_band` only. Do **not** modify schema, RLS, or content; report a UI/UX defect list or a clean pass. Out of scope: the `childhood` paragraph-job gap, theme taxonomy normalisation, and the five archived migrations.
