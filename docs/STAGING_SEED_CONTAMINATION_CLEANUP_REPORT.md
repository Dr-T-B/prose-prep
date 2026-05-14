# Staging Seed Contamination Cleanup Report

## Target

- Repo: `/Users/tarwindersaran/Downloads/Projects/prose-prep`
- Staging Supabase ref: `nxlxunygoccbnzdopqna`
- Production touched: No

## Safety confirmations

- Staging linkage confirmed: Yes, `supabase/config.toml` and `supabase/.temp/project-ref` both identify `nxlxunygoccbnzdopqna`.
- Production touched: No
- Secrets inspected: No
- Types regenerated: No
- Content imported: No
- Historical migrations edited: No

## Contamination source

- Migration file: `supabase/migrations/20240504000000_drama_scene_schema.sql`
- Tables affected:
  - `public.drama_scenes`
  - `public.drama_scene_themes`
  - `public.drama_scene_characters`
  - `public.drama_scene_ao2_methods`
  - `public.drama_scene_essay_uses`
  - `public.drama_scene_ao1_arguments`
  - `public.drama_scene_ao5_readings`
- Rows identified:
  - `public.drama_scenes`: 1 row, `id = 'hamlet_3_1'`, `play = 'hamlet'`, `act_scene = '3.1'`, `scene_title = 'Surveillance, Suicide, and Ophelia'`
  - `public.drama_scene_themes`: 6 rows where `scene_id = 'hamlet_3_1'`
  - `public.drama_scene_characters`: 4 rows where `scene_id = 'hamlet_3_1'` and `play = 'hamlet'`
  - `public.drama_scene_ao2_methods`: 5 rows where `scene_id = 'hamlet_3_1'`
  - `public.drama_scene_essay_uses`: 7 rows where `scene_id = 'hamlet_3_1'`
  - `public.drama_scene_ao1_arguments`: 1 row where `scene_id = 'hamlet_3_1'`
  - `public.drama_scene_ao5_readings`: 3 rows where `scene_id = 'hamlet_3_1'` and `id` is one of `hamlet_3_1_ao5_psychoanalytic`, `hamlet_3_1_ao5_feminist`, `hamlet_3_1_ao5_political`

## Cleanup migration

- New migration file: `supabase/migrations/20260514210803_remove_poc_drama_seed_rows.sql`
- Cleanup strategy: Delete child rows tied to `scene_id = 'hamlet_3_1'` first, then delete the parent `drama_scenes` row using `id`, `play`, `act`, `scene`, `act_scene`, and `scene_title` as narrow stable predicates.
- Broad deletes used: No
- Schema objects changed: No

## Verification

- Before-cleanup row counts:
  - `drama_scenes`: 1
  - `drama_scene_themes`: 6
  - `drama_scene_characters`: 4
  - `drama_scene_ao2_methods`: 5
  - `drama_scene_essay_uses`: 7
  - `drama_scene_ao1_arguments`: 1
  - `drama_scene_ao5_readings`: 3
  - `drama_scene_ao3_context`: 0
  - `drama_scene_ao4_connections`: 0
- After-cleanup row counts:
  - `drama_scenes`: 0
  - `drama_scene_themes`: 0
  - `drama_scene_characters`: 0
  - `drama_scene_ao2_methods`: 0
  - `drama_scene_essay_uses`: 0
  - `drama_scene_ao1_arguments`: 0
  - `drama_scene_ao5_readings`: 0
  - `drama_scene_ao3_context`: 0
  - `drama_scene_ao4_connections`: 0
- Proof-of-concept Drama rows removed: Yes
- Schema-only state verified: Yes, all 49 public base tables report `row_count = 0`.
- RLS still enabled: Yes, all nine `public.drama_scene*` / `public.drama_scenes` tables report `relrowsecurity = true`.
- Migration list matches: Yes, `20260514210803` is present locally and remotely.

## Known warning retained

`quote_methods.curation_status` mismatch remains unresolved.

Migration allows:

- `review`
- `core`
- `strong`
- `good`
- `draft`

Prose seed/app types use:

- `secure`
- `strong`
- `top_band`

This must be resolved before content import or before treating staging as representative.

## Local checks

- `npm run test`: PASS, 64 tests passed and 3 skipped across 13 files.
- `npm run lint`: PASS with 24 existing warnings and 0 errors.
- `npm run build`: PASS with Vite chunk-size and Browserslist data-age warnings.
- Typecheck: Typecheck not run: no typecheck script exists.

## Final status

PASS — proof-of-concept seed rows removed and staging is schema-only.

## Next recommended action

Resolve the `quote_methods.curation_status` mismatch before content import or before treating staging as representative. Do not regenerate Supabase types until staging schema is confirmed clean.
