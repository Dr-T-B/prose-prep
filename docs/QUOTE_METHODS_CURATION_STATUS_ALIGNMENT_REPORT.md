# Quote Methods Curation Status Alignment Report

## Target

- Repo: `/Users/tarwindersaran/Downloads/Projects/prose-prep`
- Branch: `codex/prepare-staging-schema`
- Staging Supabase ref: `nxlxunygoccbnzdopqna`
- Production touched: No

## Safety confirmations

- Staging linkage confirmed: Yes. `supabase/config.toml` has `project_id = "nxlxunygoccbnzdopqna"` and `supabase/.temp/project-ref` contains `nxlxunygoccbnzdopqna`.
- Production touched: No
- Secrets inspected: No
- Types regenerated: No
- Content imported: No
- Historical migrations edited: No
- `db reset` run: No

## Starting issue

Database/migration allowed:

- `review`
- `core`
- `strong`
- `good`
- `draft`

App/seed/types used:

- `secure`
- `strong`
- `top_band`

Starting staging constraint:

```sql
CHECK ((curation_status = ANY (ARRAY['review'::text, 'core'::text, 'strong'::text, 'good'::text, 'draft'::text])))
```

## Repo inspection

- Migration references:
  - `supabase/migrations/20260429135959_reconcile_staging_schema_chain.sql` added the compatibility `curation_status` column/default and constrained it to `review`, `core`, `strong`, `good`, `draft`.
  - `supabase/migrations/20260505010059_expand_drama_themes_and_curation_status.sql` recreated the same old check constraint.
- Seed/content references:
  - `src/data/seed.ts` declares `Level = "secure" | "strong" | "top_band"` and uses those values for `QuoteMethod.curation_status`.
  - `scripts/importQuotes.ts` maps source grade priority into `secure`, `strong`, and `top_band`.
  - `prompts/quote_bank_master.md` still listed `strong | good | draft`; this was updated.
- TypeScript/type references:
  - `src/lib/libraryAdapters.ts` declares `LibraryLevel = "secure" | "strong" | "top_band"` and exposes `curation_status?: LibraryLevel`.
  - `src/data/seed.ts` exposes `curation_status: Level`.
- UI references:
  - `src/pages/RetrievalToolkit.tsx` ranks `top_band`, `strong`, and all other values as lower-tier fallback.
  - `src/pages/TextArchitecture.tsx`, `src/pages/ComparisonRoutes.tsx`, `src/pages/library/Glossary.tsx`, and `src/pages/library/Comparison.tsx` label/display `secure`, `strong`, and `top_band`.
- Test references:
  - No tests expected `review`, `core`, `good`, or `draft` for `quote_methods.curation_status`.
  - Existing tests cover adjacent library/level behavior using `secure`, `strong`, and `top_band`.

## Canonical decision

Canonical `quote_methods.curation_status` values:

- `secure`
- `strong`
- `top_band`

Decision rationale:

The app code, seed data, import mapping, TypeScript unions, and UI labels all consistently use the educational quality-band vocabulary `secure`, `strong`, and `top_band`. The old database values were introduced as a staging compatibility baseline and then repeated by a later migration. Staging is empty, so there is no data remapping burden. `review`, `core`, `good`, and `draft` are deprecated for `quote_methods.curation_status`; no existing rows required migration.

## Changes made

- Schema migration: `supabase/migrations/20260514212610_align_quote_methods_curation_status.sql`
  - Drops `quote_methods_curation_status_check` if present.
  - Adds `quote_methods_curation_status_check` allowing only `secure`, `strong`, and `top_band`.
  - Updates the column comment to document the canonical vocabulary.
- App/type updates: None needed.
- Seed/content template updates: `prompts/quote_bank_master.md` now documents `secure | strong | top_band`.
- Test updates: None needed.
- Documentation updates: This report.

## Staging verification

- Migration applied: Yes. `npx supabase db push` applied only `20260514212610_align_quote_methods_curation_status.sql`.
- Final database constraint:

```sql
CHECK ((curation_status = ANY (ARRAY['secure'::text, 'strong'::text, 'top_band'::text])))
```

- `quote_methods` row count: `0`
- All public base tables row count: `49 / 49` public base tables verified at `0` rows.
- Migration list matches: Yes. Local and remote both include `20260514212610`.

## Local checks

- `npm run test`: PASS, 64 passed / 3 skipped.
- `npm run lint`: PASS, 24 existing warnings / 0 errors.
- `npm run build`: PASS. Build completed with existing Browserslist and chunk-size warnings.
- Typecheck: Not run. No `typecheck` script exists.

## Working tree

Changed/untracked files:

- `prompts/quote_bank_master.md`
- `supabase/migrations/20260514210803_remove_poc_drama_seed_rows.sql`
- `supabase/migrations/20260514212610_align_quote_methods_curation_status.sql`
- `docs/STAGING_SEED_CONTAMINATION_CLEANUP_REPORT.md`
- `docs/STAGING_MIGRATION_APPLY_REPORT.md`
- `docs/QUOTE_METHODS_CURATION_STATUS_ALIGNMENT_REPORT.md`

## Final status

PASS - schema/app/seed status vocabulary aligned and verified on staging.

## Next recommended action

1. Commit the migration/report files together.
2. Regenerate Supabase types from staging in a separate task.
3. Then perform a dry-run content import validation before importing real content.
