# Component 2 Canonical Import + AO5 Rejection Report

Date: 2026-05-17  
Repository inspected: `Dr-T-B/prose-prep` at `/Users/tarwindersaran/Downloads/Projects/prose-prep`  
Branch: `fix/component-2-canonical-import-ao5-rejection`

## Executive Summary

This pass created a canonical Component 2 import manifest, a non-destructive import README, and a strict AO5 rejection validator for Pearson Edexcel A-Level English Literature Component 2: Prose.

The Google Drive audit document was fetched through the Google Drive connector and confirms the attached prompt's central rule: Component 2 Prose must use AO1, AO2, AO3, and AO4 only. AO5 must not appear as an assessed objective, marking criterion, required essay feature, dashboard measure, or dataset field.

No production database was touched. No raw Drive content was imported. The validator was run and currently fails, as intended, because existing legacy schema/import surfaces still contain AO5-bearing names.

## Current Data Architecture Summary

The app is a Vite + React + TypeScript project with Supabase-backed content tables and local fallback data.

Key architecture inspected:

- `src/data/seed.ts` contains local fallback curriculum records, including legacy `AO5_TENSIONS`.
- `src/lib/contentRepo.ts` reads from Supabase tables and falls back to local bundles.
- `src/lib/datasets.ts` drives the admin CSV Data Manager registry.
- `src/lib/csvImport.ts` handles generic CSV parsing/coercion/upsert.
- `src/lib/tier1LibraryImport.ts` normalizes Tier 1 library CSV-style rows.
- `scripts/importQuotes.ts` is a dry-run-by-default quote import path.
- `scripts/validateStagingSchema.ts` is a read-only Supabase staging schema validator.
- `supabase/migrations/**` and `sql/**` hold historical/current schema definitions.

## Files Inspected

Broad AO/search pass covered `src`, `scripts`, `supabase`, `sql`, `prompts`, `docs`, `index.html`, `tailwind.config.ts`, and `package.json`.

Important files inspected directly:

- `package.json`
- `scripts/importQuotes.ts`
- `scripts/validateStagingSchema.ts`
- `src/lib/tier1LibraryImport.ts`
- `src/lib/csvImport.ts`
- `src/lib/datasets.ts`
- `src/types/thesisRoutes.ts`
- `src/data/seed.ts`
- `prompts/README.md`
- `prompts/quote_bank_master.md`
- `docs/component-2-spec-verification.md`
- Google Drive audit: `Component 2 Prose — Canonical Drive Audit (2026-05-17)`

Search totals:

- Broad AO5-related search: 535 line hits across 70 files.
- Final validator scan: 63 files.
- Validator-allowed AO5 references: 20.
- Validator-blocked AO5 references: 31.

## AO5 Occurrence Classification

### A. Must Remove

These are blocked by the new validator because they could allow AO5 into Component 2 import or assessed content paths:

- `prompts/README.md`: one quality note still says weak chunks may have "thin AO5".
- `prompts/quote_bank_master.md`: example schema includes AO5 readings and `ao_priority: ["AO1", "AO2", "AO5"]`.
- `scripts/validateStagingSchema.ts`: expected staging table list still includes AO5 tables.
- `src/lib/datasets.ts`: admin import registry still includes and labels `ao5_tensions`.
- `src/lib/tier1LibraryImport.ts`: header alias still accepts `ao5_stem`.
- `supabase/functions/apply-staged-change/index.ts`: staged-change allowlist still includes `ao5_tensions`.

### B. Must Rename/Reframe

These are pedagogically reusable but should be reframed as interpretive or AO1 sophistication rather than AO5:

- `src/data/seed.ts`: `AO5_TENSIONS` fallback data.
- `sql/core_current_schema.sql`: `ao5_tensions` schema snapshot.
- `sql/minimal_seed_data.sql`: seed rows for `ao5_tensions`.
- `supabase/migrations/20260425000000_create_quote_pairs.sql`: `ao5_tension`.
- `supabase/migrations/20260426000000_create_missing_content_tables.sql`: `ao5_tension`.
- `supabase/migrations/20260427110000_paragraph_attempts_and_quote_pair_mastery.sql`: `ao5_evaluation`, `ao5_self_score`.
- `supabase/migrations/20260427113000_dashboard_next_best_action.sql`: `ao5_self_score`.
- `supabase/migrations/20260428020000_add_retrieval_tables.sql`: retrieval item type and joins for `ao5_tension`.

### C. Valid Reference to Another Component

These are valid where they are clearly Component 1 Drama, not Component 2 Prose:

- `prompts/quote_bank_master.md` and `prompts/README.md` are Hamlet/Duchess quote-bank prompts for Component 1 Drama.
- `supabase/migrations/20240504000000_drama_scene_schema.sql` and `20260514210803_remove_poc_drama_seed_rows.sql` reference `drama_scene_ao5_readings`.

### D. Legacy/Archival Only

These document prior audits, corrections, or archived material and should not be imported as live Component 2 content:

- `docs/ao5-audit-2026-05-12.md`
- `docs/archived-ao5-glossary-2026-05-13.md`
- `docs/contamination-audit-2026-05-12.md`
- `docs/stage3-workbook-corrections-2026-05-12.md`
- other staging/readiness reports containing historical AO5 notes

### E. Unclear / Manual Review

These should not be changed casually because they are generated types, old migration history, or schema snapshots:

- `src/integrations/supabase/types.ts`
- historical `supabase/migrations/**` that define existing schema
- `sql/core_current_schema.sql`
- legacy app surfaces using `ao5_prompt`, `ao5_enabled`, `selected_ao5_ids`, or `ao5_tensions`

## Changes Made

Created:

- `docs/component2_canonical_import_manifest.json`
- `docs/COMPONENT_2_IMPORT_README.md`
- `scripts/validate-component2-ao-model.mjs`
- `docs/COMPONENT_2_CANONICAL_IMPORT_AO5_REJECTION_REPORT.md`

Updated:

- `package.json` adds `validate:component2-ao`.

## Canonical Drive Resources Approved

Approved for canonical import planning:

- WP1 corrected complete prose workbook with master matrix.
- `THE COMPONENT 2 PROSE WORKBOOK SYSTEM`.
- Hard Times chapter-to-exam matrix.
- Atonement chapter-to-exam matrix, only after AO5 tab correction/exclusion.
- HT & Atonement quote/AO2 method source.
- Quote Pair Matrix app dataset.
- AO3 Context Library student guide.
- Level 5 peer-assessment rubric candidate after AO1-AO4 compliance check.

## Drive Resources Explicitly Excluded

Excluded:

- `Component 2 Prose — Ultimate Edition (Final Unified Textbook)`.
- `Component 2 — Misc — Copy of Component 2 Prose — Ultimate Edition (Final Unified Textbook)`.
- Non-WP1 corrected master workbook except as comparison fallback.
- Copy of WP2 corrected workbook except as comparison fallback.
- Component 1 Drama resources.

## Import Readiness Status

Status: not ready for write import.

Ready:

- Canonical source manifest exists.
- Staging export layout is documented.
- AO5 rejection validator exists and runs.
- Validation command is exposed as `npm run validate:component2-ao`.

Blocked:

- No canonical Drive data has been exported into `staging/component2`.
- The AO validator blocks 31 existing AO5-bearing import/schema references.
- Atonement `AO5 Critics Bank` must be excluded or renamed before import.
- Existing Supabase schema history still contains AO5-named columns/tables; these need a dedicated non-destructive migration plan if renamed.

## Verification Results

- `npm run lint`: passed with 23 existing warnings.
- `npm run test`: passed, 79 tests passed and 3 integration tests skipped.
- `npm run build`: passed; build warns about stale Browserslist data and a large JS chunk.
- `npm run typecheck`: passed.
- `node scripts/validate-component2-ao-model.mjs`: failed as designed with 31 blocked AO5 references.

## Remaining Manual Actions

1. Export canonical Google Sheets/Docs into `staging/component2` using the README layout.
2. Run targeted AO5 sweeps inside every exported canonical sheet/tab before import.
3. Exclude or reframe the Atonement `AO5 Critics Bank` tab.
4. Decide whether to preserve historical migrations as legacy records or add a forward-only migration to introduce AO1/interpretive replacement names.
5. Split Component 1 Drama prompt assets away from Component 2 import paths, or explicitly allowlist them outside the Component 2 validator scope.
6. Re-run `node scripts/validate-component2-ao-model.mjs` before any dry-run import.
