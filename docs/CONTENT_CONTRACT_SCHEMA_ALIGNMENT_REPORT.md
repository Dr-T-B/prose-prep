# Content Contract Schema Alignment Report

## Target

- Repo: `/Users/tarwindersaran/Downloads/Projects/prose-prep`
- Branch: `codex/prepare-staging-schema`
- PR: `https://github.com/Dr-T-B/prose-prep/pull/2`
- Staging Supabase ref: `nxlxunygoccbnzdopqna`
- Production touched: No

## Starting blocker

PR #2 review found that regenerated staging schema/types did not match app, prompt, and import expectations for content-table metadata.

- `quote_methods.is_active` missing: Yes
- `quote_methods.sort_order` missing: Yes
- `comparative_matrix.level_band` missing: Yes
- `comparative_matrix.is_active` missing: Yes
- `comparative_matrix.sort_order` missing: Yes

## Contract inspection

- Runtime references:
  - `src/lib/contentRepo.ts` queries `quote_methods.eq("is_active", true)`.
  - `src/lib/planFetches.ts` queries `quote_methods.eq("is_active", true)`.
  - `src/pages/ComparisonRoutes.tsx` selects `comparative_matrix.level_band`, filters by `is_active`, and orders by `sort_order`.
  - `src/pages/EssayBuilder.tsx`, `src/pages/RetrievalToolkit.tsx`, `src/lib/paragraphEngine.ts`, and `src/lib/libraryAdapters.ts` consume `comparative_matrix.level_band`.
- Prompt/import expectations:
  - `prompts/quote_bank_master.md` requires quote-bank output objects to include `is_active` and `sort_order`.
  - The prompt chunks and `prompts/README.md` pre-allocate quote `sort_order` values.
  - `scripts/importQuotes.ts` imports `quote_methods`; it does not currently emit `is_active` or `sort_order`, so the schema defaults keep existing import behaviour safe.
- Defining migrations:
  - `supabase/migrations/20260417115303_ad3baa4f-aadd-4672-a69c-5c25aa86db70.sql` originally creates `quote_methods` and `comparative_matrix`.
  - Later migrations extend `quote_methods`, including `20260422120000_extend_quote_methods.sql`, `20260425000001_quote_methods_source_row_key.sql`, and `20260514212610_align_quote_methods_curation_status.sql`.
- Test coverage:
  - `src/lib/contentRepo.test.ts` covers content fallback behaviour, but does not assert this exact metadata-column query contract.
  - No dedicated test currently covers `ComparisonRoutes.tsx` staging query fields.

## Decision

- Fix selected: Add forward schema migration.

This is the correct fix because the existing app and content workflow still deliberately use these metadata fields. Removing them would weaken active-row filtering, deterministic content ordering, prompt validation, and comparative-matrix tiering.

## Migration

- Migration file: `supabase/migrations/20260514223610_add_content_contract_metadata_columns.sql`
- Tables changed:
  - `public.quote_methods`
  - `public.comparative_matrix`
- Columns added:
  - `quote_methods.is_active boolean not null default true`
  - `quote_methods.sort_order integer`
  - `comparative_matrix.level_band text`
  - `comparative_matrix.is_active boolean not null default true`
  - `comparative_matrix.sort_order integer`
- Data imported: No
- Existing data deleted: No
- Historical migrations edited: No

## Staging verification

- Migration applied: Yes, via `npx supabase db push` against linked staging ref `nxlxunygoccbnzdopqna`.
- `quote_methods` columns verified: `is_active`, `sort_order`
- `comparative_matrix` columns verified: `level_band`, `is_active`, `sort_order`
- `quote_methods` row count: `0`
- `comparative_matrix` row count: `0`
- All public base tables remain empty: Yes. Dynamic count query over public base tables returned no non-empty tables.

## Type regeneration

- Command used: `npx supabase gen types typescript --project-id nxlxunygoccbnzdopqna --schema public > src/integrations/supabase/types.ts`
- Output file: `src/integrations/supabase/types.ts`
- Required fields now present in generated types: Yes
  - `quote_methods.Row.is_active`
  - `quote_methods.Row.sort_order`
  - `quote_methods.Insert.is_active`
  - `quote_methods.Insert.sort_order`
  - `quote_methods.Update.is_active`
  - `quote_methods.Update.sort_order`
  - `comparative_matrix.Row.level_band`
  - `comparative_matrix.Row.is_active`
  - `comparative_matrix.Row.sort_order`
  - `comparative_matrix.Insert.level_band`
  - `comparative_matrix.Insert.is_active`
  - `comparative_matrix.Insert.sort_order`
  - `comparative_matrix.Update.level_band`
  - `comparative_matrix.Update.is_active`
  - `comparative_matrix.Update.sort_order`
- Unexpected type changes: None identified; regenerated diff is limited to the new metadata columns.

## Local checks

- `npm run test`: PASS, 64 passed / 3 skipped.
- `npm run lint`: PASS, 24 warnings / 0 errors.
- `npm run build`: PASS, with existing Browserslist age and chunk-size warnings.
- Typecheck: Typecheck not run: no `typecheck` script exists.

## Final status

PASS - app/import/prompt contract is aligned with staging schema/types.

## Next action

- Rerun PR #2 review.
- Do not merge until review passes.
- Do not import real content yet.
