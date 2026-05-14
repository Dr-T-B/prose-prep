# Staging Supabase Types Regeneration Report

## Target

- Repo: `/Users/tarwindersaran/Downloads/Projects/prose-prep`
- Branch: `codex/prepare-staging-schema`
- Staging Supabase ref: `nxlxunygoccbnzdopqna`
- Production touched: No

## Safety confirmations

- Staging linkage confirmed: Yes. `supabase/config.toml` has `project_id = "nxlxunygoccbnzdopqna"` and `supabase/.temp/project-ref` contains `nxlxunygoccbnzdopqna`.
- Production touched: No
- Secrets inspected: No
- Content imported: No
- `db reset` run: No

## Pre-generation state

- Previous schema/report commit: `410dbf6` (`Prepare staging schema for Prose content import`)
- Migration list matched: Yes. `npx supabase migration list --linked` showed matching local and remote entries including `20260514210803` and `20260514212610`.
- `quote_methods.curation_status` staging constraint: `CHECK ((curation_status = ANY (ARRAY['secure'::text, 'strong'::text, 'top_band'::text])))`
- `quote_methods` row count: `0`
- Public base table row-count status: All 49 public base tables reported `n_live_tup = 0` through `pg_stat_user_tables`.

## Type generation

- Command used: `npx supabase gen types typescript --project-id nxlxunygoccbnzdopqna --schema public > src/integrations/supabase/types.ts`
- Output file: `src/integrations/supabase/types.ts`
- Existing type file reused: Yes. README documents this as the generated database types file, and `src/types/database.types.ts` re-exports from it.
- Duplicate type file created: No

## Expected schema/type alignment

`quote_methods.curation_status` staging constraint values:

- `secure`
- `strong`
- `top_band`

Generated TypeScript note:

- Supabase CLI generated `quote_methods.curation_status` as `string | null`.
- This is expected for a `text` column constrained by a CHECK constraint; the CLI does not emit CHECK constraint literals as a TypeScript union.
- The allowed values were therefore verified against staging SQL rather than encoded as a generated literal union.

## Type diff summary

- Files changed:
  - `src/integrations/supabase/types.ts`
- Important generated changes:
  - Refreshed generated types from staging project `nxlxunygoccbnzdopqna`.
  - Added staging tables/views/functions that were missing from the previous generated file, including Drama scene tables, Tier 1 library tables, retrieval tables/views, `student_quote_pair_mastery`, and `thesis_routes`.
  - Added `quote_methods.curation_status` to generated `Row`, `Insert`, and `Update` shapes as `string | null` / optional `string | null`.
- Unexpected generated changes: None requiring code changes. The diff was large because Supabase types had not been regenerated after the full staging migration chain was applied.

## Local checks

- `npm run test`: PASS, 64 passed / 3 skipped.
- `npm run lint`: PASS, 24 warnings / 0 errors.
- `npm run build`: PASS. Build completed with existing Browserslist data-age and chunk-size warnings.
- Typecheck: Typecheck not run: no `typecheck` script exists.

## Final status

PASS - Supabase types regenerated from staging and local checks passed.

Note: the generated type for `quote_methods.curation_status` does not show `secure | strong | top_band` as a TypeScript union because the underlying column is `text` with a CHECK constraint, not a Postgres enum.

## Next recommended action

1. Open a PR for staging schema preparation.
2. After review, perform dry-run content import validation.
3. Do not import real content until the dry-run validation passes.
