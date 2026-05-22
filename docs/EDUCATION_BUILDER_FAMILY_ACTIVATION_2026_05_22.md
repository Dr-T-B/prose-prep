# Education Builder Family Activation - 2026-05-22

## 1. Purpose and scope

Activate `education` as the fifth supported Essay Builder question family for Pearson Edexcel A-Level English Literature Component 2: Prose (`Hard Times` and `Atonement`).

Scope was intentionally narrow: close the education Builder content-contract gaps, activate the existing education question row, validate the contract, confirm the Builder path, run local checks, and stop.

No schema, RLS, type generation, deployment, destructive SQL, `db reset`, `migration repair`, or `--include-all` work was performed.

## 2. Files inspected

- `supabase/migrations/20260522120000_add_childhood_builder_contract.sql`
- `docs/CHILDHOOD_BUILDER_FAMILY_ADD_2026_05_22.md`
- `docs/INACTIVE_FAMILY_TRIAGE_2026_05_22.md`
- `supabase/validation/builder_content_contract.sql`
- `supabase/migrations/20260522130000_curate_routes_best_use_student_prose.sql`
- `src/pages/EssayBuilder.tsx`
- `src/lib/contentRepo.ts`
- `src/lib/planLogic.ts`
- `src/data/seed.ts`
- Remote tables read through safe `select` queries: `questions`, `routes`, `theses`, `paragraph_jobs`, `quote_methods`, `comparative_matrix`, `interpretive_tensions`, `supabase_migrations.schema_migrations`.

## 3. Pre-activation education status

| Surface | Education status before migration |
|---|---:|
| `questions` | 1 inactive row: `q-education` |
| `routes` | Valid primary `route-imagination`, valid secondary `route-perception` |
| `theses` | 0 |
| `paragraph_jobs` | 0 |
| Active `quote_methods` | 14 |
| `comparative_matrix` rows | 6 |
| `interpretive_tensions` rows | 4 |

The inactive question row was:

| id | family | stem | primary | secondary | level |
|---|---|---|---|---|---|
| `q-education` | `education` | Compare the ways Dickens and McEwan present the role of education. | `route-imagination` | `route-perception` | `top_band` |

Both linked routes already had student-facing `best_use` prose and no raw slug-list copy.

## 4. Content gaps found

The inactive-family triage was confirmed against the remote project: education already had strong supporting content but failed the active Builder contract because it had no thesis row and no paragraph-job row.

No unsupported level values, route mismatch, unsupported route reference, or raw active-route `best_use` issue was found for education.

## 5. Migration name

`supabase/migrations/20260522133400_activate_education_builder_family.sql`

## 6. Rows inserted or updated

| Table | Row | Operation |
|---|---|---|
| `public.theses` | `thesis-education-astar` | Insert/upsert |
| `public.paragraph_jobs` | `pj-education-1a` | Insert/upsert |
| `public.questions` | `q-education` | Update existing row: `is_active = true` |

The migration keeps education routed through `route-imagination` / `route-perception`. It does not create a duplicate question row.

## 7. Remote application result

Initial `supabase db push --dry-run --linked` from the repo was blocked by a pre-existing migration-history mismatch:

- remote contains `20260522103943_curate_routes_best_use_student_prose`
- local committed file is `20260522130000_curate_routes_best_use_student_prose.sql`

The remote `20260522103943` row was inspected and confirmed to be the route-curation migration already represented locally as `20260522130000`.

To keep this activation narrow, a temporary Supabase workdir was created outside the repo with:

- remote history mirrored as `20260522103943`
- the local-only duplicate `20260522130000` excluded
- the new education migration included

Dry-run from that temporary workdir showed exactly one pending migration:

```text
Would push these migrations:
 • 20260522133400_activate_education_builder_family.sql
```

Apply then completed:

```text
Applying migration 20260522133400_activate_education_builder_family.sql...
Finished supabase db push.
```

No `--include-all`, `db reset`, or migration repair was used.

## 8. Post-activation validation results

Active families are now exactly:

| family | active_questions |
|---|---:|
| `childhood` | 1 |
| `class` | 1 |
| `education` | 1 |
| `guilt` | 1 |
| `imagination` | 1 |

Contract checks:

| Check | Result |
|---|---:|
| Unsupported active families | 0 |
| Unsupported level values | 0 |
| Broken active-question route references | 0 |
| Missing required active fields | 0 |
| Active Builder route count | 6 |
| Raw slug-list `best_use` values on active routes | 0 |

Education-specific coverage:

| Surface | Count |
|---|---:|
| Active education question | 1 |
| Valid education route refs | 1 |
| Education theses | 1 |
| Education paragraph jobs | 1 |
| Active education quote methods | 14 |
| Education comparative matrix rows | 6 |
| Education interpretive tensions | 4 |

## 9. Builder UI verification notes

No frontend allowlist change was required.

`src/pages/EssayBuilder.tsx` derives visible family chips from `content.questions`, and `src/lib/contentRepo.ts` fetches only `questions` where `is_active = true`. Since `q-education` is now active and `QuestionFamily` / `QUESTION_FAMILY_LABELS` in `src/data/seed.ts` already include `education`, Education will appear in the Builder family-chip flow as `Education`.

The selected question resolves:

- recommended route: `route-imagination`
- alternative route: `route-perception`
- thesis: `thesis-education-astar`
- paragraph job: `pj-education-1a`
- comparison rows, quote methods and interpretive tensions from the existing education-tagged content

The in-app browser control surface was not available in this session after tool discovery, so verification was done through the data-driven Builder code path plus remote validation queries rather than a visual browser click-through.

## 10. Local check results

| Command | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run test` | Pass: 120 passed, 3 skipped |
| `npm run build` | Pass: built in 3.14s; existing chunk-size and Browserslist warnings only |

## 11. Safety confirmation

This pass did not:

- change schema
- change RLS
- regenerate Supabase types
- deploy
- use `--include-all`
- run `db reset`
- run `migration repair`
- run destructive SQL
- alter unrelated families
- activate `hope`
- activate `settings`
- modify route-gender
- attempt broader taxonomy cleanup
- attempt known RLS drift cleanup

Only education-scoped data/content-contract rows were changed remotely.

## 12. Remaining risks

1. The repo still has pre-existing unrelated working-tree noise, including deleted historical docs and migration timestamp drift around the route-curation migration. This activation did not modify or stage that noise.
2. Local/remote migration history still shows the pre-existing `20260522103943` remote versus `20260522130000` local timestamp mismatch. It is not fixed here because migration repair was explicitly out of scope.
3. Education quote-method coverage is currently Hard Times-heavy. The contract passes, but a later curation pass should add or retag Atonement-side quote-method rows so the Toolkit surface feels more balanced.
4. `route-gender.best_use` remains out of scope because gender is inactive and the prompt explicitly excluded route-gender.

## 13. Recommended next phase

Run a focused education UX curation pass after this activation settles:

- add or retag Atonement-side quote-method rows for education
- optionally add strong/secure education thesis variants if the Builder should offer more than the top-band route
- then address the local/remote migration timestamp drift in a separate housekeeping task, with explicit permission if repair or history reconciliation is needed

## 14. Commit status

Pending at report creation time. If a commit-hash backfill is needed, it should be added in a follow-up documentation-only commit rather than amending.
