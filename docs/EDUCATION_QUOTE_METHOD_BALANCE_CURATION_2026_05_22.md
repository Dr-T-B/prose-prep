# Education Quote-Method Balance Curation - 2026-05-22

## Purpose and scope

This was a narrow content-quality pass for the active Education Builder family. The goal was to improve cross-text quote-method balance so Education evidence is not one-sided toward `Hard Times`.

No schema, RLS, generated types, deployment, `--include-all`, database reset, migration repair, destructive SQL, unrelated family activation, `hope` activation, `settings` activation, route-gender change, route change, or education-question copy change was performed.

## Branch and commit checked

- Branch: `main`
- Latest commit checked at start: `3f19610 docs: verify education Builder UI activation`
- Activation commit present: `242d457 Activate education Builder family`
- Working tree note: the repo had substantial pre-existing unrelated noise, including deleted tracked docs and untracked audit/migration material. This pass did not stage or modify that unrelated noise.
- Curation commit: `TBD - backfilled after commit`

## Files inspected

- `docs/EDUCATION_BUILDER_FAMILY_ACTIVATION_2026_05_22.md` from `HEAD` because the working tree copy was deleted before this pass
- `docs/EDUCATION_BUILDER_UI_VERIFICATION_2026_05_22.md`
- `docs/INACTIVE_FAMILY_TRIAGE_2026_05_22.md` from `HEAD` because the working tree copy was deleted before this pass
- `supabase/migrations/20260522133400_activate_education_builder_family.sql`
- `src/pages/EssayBuilder.tsx`
- `src/components/QuotePicker.tsx`
- `src/lib/contentRepo.ts`
- `src/lib/planLogic.ts`
- `src/lib/planFetches.ts`
- `src/data/seed.ts`
- `supabase/validation/builder_content_contract.sql`

## Code-path findings

- The main Builder evidence grouping uses `findQuotesForFamily(plan.family, content)`, which filters active `quote_methods` rows by `best_themes`.
- The per-paragraph `QuotePicker` first fetches `quote_question_links` for the selected question and source text, then falls back to `quote_methods.best_themes` overlap with route themes when fewer than five linked rows are found.
- Active display is controlled by `contentRepo.ts`, which fetches `quote_methods` with `is_active = true`.
- For the Education toolkit to be directly balanced, Atonement rows need the `education` tag in `quote_methods.best_themes`. For the paragraph evidence picker to surface them immediately, they should also be linked to `q-education`.

## Pre-curation balance

Remote read-only checks against `nxlxunygoccbnzdopqna` showed:

| Surface | Hard Times | Atonement |
|---|---:|---:|
| Active direct `best_themes` education quote rows | 14 | 0 |
| Active `q-education` linked quote rows | 6 | 2 |

The 14 direct Education rows were all existing `Hard Times` rows: `qm_ht_01`, `qm_ht_03`, `qm_ht_05`, `qm_ht_06`, `qm_ht_08`, `qm_ht_09`, `qm_ht_10`, `qm_ht_12`, `qm_ht_13`, `qm_ht_14`, `qm_ht_16`, `qm_ht_17`, `qm_ht_19`, `qm_ht_20`.

The two existing Atonement question-linked rows were `qm_at_06` and `qm_at_16`, but neither had direct `education` tagging before this pass.

## Curation decision

Retagged existing active Atonement rows rather than inserting new quote-method rows:

| Row | Decision | Education fit |
|---|---|---|
| `qm_at_01` | Add `education`; add `q-education` link | Briony's child formation and desire to order the world |
| `qm_at_06` | Add `education`; keep existing `q-education` link | Drafting mistaken for atonement; writing as moral learning |
| `qm_at_08` | Add `education`; add `q-education` link | False certainty and self-taught interpretation without humility |
| `qm_at_13` | Add `education`; add `q-education` link | Motivated misreading; learning to see clearly |
| `qm_at_16` | Add `education`; keep existing `q-education` link | Child author constructing scenes from telling details |
| `qm_at_17` | Add `education`; add `q-education` link | Childlike approach to truth and writerly maturation |

Rows deliberately left untouched: the existing 14 `Hard Times` education rows; all route, question, thesis, paragraph-job, comparative-matrix, and interpretive-tension rows; weaker Atonement rows whose education link was primarily guilt, ending, war, or love rather than formation, interpretation, or moral learning.

## Migration

Created:

`supabase/migrations/20260522153400_curate_education_quote_methods_balance.sql`

The migration is forward-only and idempotent where practical:

- appends `education` to `best_themes` for the six selected active Atonement rows only;
- inserts four missing `quote_question_links` rows with stable UUIDs;
- uses `ON CONFLICT (quote_id, question_id) DO UPDATE` for safe reruns;
- performs no DDL and no destructive operations.

## Remote application

Normal repo dry-run was blocked by the pre-existing migration-history mismatch:

- remote has `20260522103943_curate_routes_best_use_student_prose`
- local has `20260522130000_curate_routes_best_use_student_prose.sql`

No migration repair was performed. A temporary Supabase workdir was used instead, mirroring the remote history with `20260522103943`, excluding local-only duplicate `20260522130000`, and including only the new curation migration.

Dry-run showed exactly one pending migration:

```text
Would push these migrations:
 • 20260522153400_curate_education_quote_methods_balance.sql
```

Apply completed:

```text
Applying migration 20260522153400_curate_education_quote_methods_balance.sql...
Finished supabase db push.
```

## Post-curation validation

| Check | Result |
|---|---:|
| Active families | `childhood`, `class`, `education`, `guilt`, `imagination` |
| Unsupported active families | 0 |
| Unsupported level values | 0 |
| Broken active-question route refs | 0 |
| Missing required active surface fields | 0 |
| Raw slug-list `best_use` values on active routes | 0 |
| Duplicate active quote texts | 0 |
| Recent non-candidate non-Atonement quote changes | 0 |

Post-curation quote balance:

| Surface | Hard Times | Atonement |
|---|---:|---:|
| Active direct `best_themes` education quote rows | 14 | 6 |
| Active `q-education` linked quote rows | 6 | 6 |

`q-education` remained active and unchanged:

- stem: `Compare the ways Dickens and McEwan present the role of education.`
- primary route: `route-imagination`
- secondary route: `route-perception`
- level: `top_band`

The existing `Hard Times` education rows remained intact with their prior `updated_at` values.

## Builder/UI verification

The dev server ran at:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

The Codex in-app Browser control tool was not exposed after tool discovery, so verification used local headless Google Chrome via Playwright.

Results:

- `/builder` loaded successfully.
- Family chips rendered: `Childhood`, `Class`, `Education`, `Guilt`, `Imagination`.
- Each existing active family still rendered a question surface.
- Selecting Education rendered the education question.
- Recommended route rendered as `Imagination vs Rationality`.
- Alternative route rendered as `Reality, Perception and Misreading`.
- `Why this fits` rendered prose including `Best used when...`, not raw slugs.
- Thesis rendered beginning `Both Hard Times and Atonement present education as moral formation...`.
- Paragraph job rendered as `Education as moral formation`.
- Hard Times evidence rendered, including `Now, what I want is, Facts.`
- Atonement evidence rendered all six curated education rows.
- Browser console errors: 0.

## Local checks

| Command | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run test` | Passed: 15 files passed, 1 skipped; 120 tests passed, 3 skipped |
| `npm run build` | Passed |

Build warnings: stale Browserslist/caniuse-lite data and the pre-existing production chunk-size warning.

## Files changed

- `supabase/migrations/20260522153400_curate_education_quote_methods_balance.sql`
- `docs/EDUCATION_QUOTE_METHOD_BALANCE_CURATION_2026_05_22.md`

The attached prompt file outside the repo was also refined before execution with additional guardrails, but it was not part of this repo commit.

## Safety confirmation

This pass did not:

- change schema
- change RLS
- regenerate Supabase types
- deploy
- use `--include-all`
- run `db reset`
- run `migration repair`
- run destructive SQL
- activate any other family
- activate `hope`
- activate `settings`
- modify route-gender
- modify route records
- alter the education question row
- attempt broader taxonomy cleanup
- attempt known RLS drift cleanup
- stage unrelated working-tree files

## Remaining risks

- Local/remote migration history still contains the pre-existing `20260522103943` remote vs `20260522130000` local timestamp drift.
- The wider working tree still contains substantial unrelated pre-existing noise.
- Education now has meaningful Atonement direct coverage, but future content work could still improve top-band ranking copy, methods, and comparative prompts for the newly tagged rows.

## Recommended next phase

Run a small Education evidence-ranking polish pass only if classroom use shows the order or method prompts need refinement. Otherwise, leave Education stable and address the migration-history drift as a separate housekeeping task with explicit approval.
