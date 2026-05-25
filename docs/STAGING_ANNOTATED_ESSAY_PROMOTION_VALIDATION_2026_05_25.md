# Staging Annotated Essay Promotion Validation

Date: 2026-05-25

## Summary

Validated the annotated essay content lifecycle against staging:

`seeded content -> teacher review required -> reviewed -> approved -> student-facing display`

Staging project ref was confirmed as `nxlxunygoccbnzdopqna`. Production was not touched.

## Branch And Safety

- Branch used: `validation/staging-annotated-essay-promotion`
- Initial branch before validation: `codex/annotated-essay-pack`
- Initial working tree: dirty, with annotated essay review workflow changes plus unrelated local Phase 3 / character-pairing files.
- Unrelated files were not modified as part of this validation pass.

Required files confirmed present:

- `supabase/migrations/20260525120000_annotated_essay_content_review_workflow.sql`
- `docs/ANNOTATED_ESSAY_CONTENT_REVIEW_WORKFLOW_2026_05_25.md`
- `docs/sql/annotated_essay_content_promotion_examples.sql`

## Supabase Target

- Expected staging ref: `nxlxunygoccbnzdopqna`
- `supabase/config.toml`: `project_id = "nxlxunygoccbnzdopqna"`
- `supabase/.temp/project-ref`: `nxlxunygoccbnzdopqna`
- Environment check: Supabase URL and anon keys were present, but secrets were not printed.
- Production touched: No

## Migration

Migration applied to staging: Yes.

Applied file:

- `supabase/migrations/20260525120000_annotated_essay_content_review_workflow.sql`

Migration history was repaired for version `20260525120000` after applying the SQL file.

### Migration Fixes Made During Validation

Two staging defects were found before/during migration verification and fixed:

1. `essay_paragraphs` and `ao_annotations` did not previously have `verification_status` / `reviewed`, but the migration attempted to constrain those columns.
   - Fix: migration now adds `verification_status text not null default 'teacher review required'` and `reviewed boolean not null default false` to all seven review tables if missing.

2. `paragraph_stems` still had a legacy policy named `Public read paragraph_stems` with `using (true)`.
   - Fix: migration now drops that legacy policy before creating the canonical status-filtered public select policy.

## Tables Verified

The following seven tables were verified:

- `essay_questions`
- `annotated_essays`
- `essay_paragraphs`
- `ao_annotations`
- `paragraph_stems`
- `quote_method_links`
- `misconception_upgrades`

Verified:

- review metadata columns exist
- canonical `verification_status` CHECK constraints exist
- RLS is enabled on all seven tables
- public/student select policies exclude `draft` and `retired`
- admin select/update policies are present
- no duplicate copies of the seven tables were created

## Status Distribution Before Promotion

Immediately after migration and before promotion:

| Table | Draft | Teacher Review Required | Reviewed | Approved | Needs Correction | Retired | Total |
|---|---:|---:|---:|---:|---:|---:|---:|
| `annotated_essays` | 0 | 1 | 0 | 0 | 0 | 0 | 1 |
| `ao_annotations` | 0 | 12 | 0 | 0 | 0 | 0 | 12 |
| `essay_paragraphs` | 0 | 6 | 0 | 0 | 0 | 0 | 6 |
| `essay_questions` | 0 | 8 | 0 | 0 | 0 | 0 | 8 |
| `misconception_upgrades` | 0 | 6 | 0 | 0 | 0 | 0 | 6 |
| `paragraph_stems` | 0 | 54 | 0 | 0 | 0 | 0 | 54 |
| `quote_method_links` | 0 | 5 | 0 | 0 | 0 | 0 | 5 |

Unexpected or legacy statuses found: none.

## Promotion

Selected essay package:

- Essay question: `eq_ht_at_children_roles_20260524`
- Annotated essay: `essay_children_roles_level5_20260524`
- Title: `Level 5 Timed Model: Roles of Children`

Promotion method used: documented SQL helper fallback.

Reason admin UI was not used for mutation: staging had no admin row in `public.user_roles`, so there was no available admin-role session to validate authenticated admin updates from the browser. Promotion audit fields used validation actor UUID `00000000-0000-0000-0000-000000000001`.

Rows promoted first to `reviewed`, then to `approved`:

| Table | Rows Promoted |
|---|---:|
| `essay_questions` | 1 |
| `annotated_essays` | 1 |
| `essay_paragraphs` | 6 |
| `ao_annotations` | 12 |
| `paragraph_stems` | 3 |
| `quote_method_links` | 3 |
| `misconception_upgrades` | 3 |

Verified after promotion:

- promoted rows are `approved`
- `reviewed = true`
- `reviewed_at` populated
- `reviewed_by` populated
- `approved_at` populated
- `approved_by` populated
- no unrelated rows were promoted beyond the selected content chain

## Status Distribution After Promotion

| Table | Draft | Teacher Review Required | Reviewed | Approved | Needs Correction | Retired | Total |
|---|---:|---:|---:|---:|---:|---:|---:|
| `annotated_essays` | 0 | 0 | 0 | 1 | 0 | 0 | 1 |
| `ao_annotations` | 0 | 0 | 0 | 12 | 0 | 0 | 12 |
| `essay_paragraphs` | 0 | 0 | 0 | 6 | 0 | 0 | 6 |
| `essay_questions` | 0 | 7 | 0 | 1 | 0 | 0 | 8 |
| `misconception_upgrades` | 0 | 3 | 0 | 3 | 0 | 0 | 6 |
| `paragraph_stems` | 0 | 51 | 0 | 3 | 0 | 0 | 54 |
| `quote_method_links` | 0 | 2 | 0 | 3 | 0 | 0 | 5 |

## Student-Facing Verification

Local route smoke:

- `http://127.0.0.1:8092/annotated-essays`: HTTP 200

Source/route checks confirmed:

- content source line exists: `Content source: live Supabase | bundled seed`
- promoted/review statuses render as student-facing status badges
- AO controls are AO1, AO2, AO3, AO4
- no AO5 filter appears
- hide/self-test mode exists
- needs-correction warning UI exists for affected quote/stem rows

Anon REST smoke against staging confirmed:

- promoted question is visible as `approved`
- promoted essay is visible as `approved`
- six promoted paragraphs are visible
- twelve promoted AO annotations are visible
- three linked promoted paragraph stems are visible with live `ao` / `level_band` data
- zero AO5 rows
- no `draft` or `retired` question rows are visible in ordinary student query results

## Admin Review Verification

Local route smoke:

- `http://127.0.0.1:8092/admin`: HTTP 200

Static/source verification confirmed:

- `DataManager` includes an `Annotated essays` tab
- `AnnotatedEssayReview` is wired into that tab
- review statuses are represented: `draft`, `teacher review required`, `reviewed`, `approved`, `needs correction`, `retired`
- item selection uses composite `table::id` parsing
- `review_notes` and `correction_notes` fields are present
- promotion buttons exist for reviewed, approved, needs correction, return to review, draft, and retired

Focused tests verified promotion patch rules.

Limitation: authenticated browser mutation through `/admin -> Annotated essays` could not be completed because staging had no admin-role user row available in `public.user_roles`. The controlled SQL helper fallback was therefore used for promotion.

## AO Rule Confirmation

Pearson Edexcel Component 2 remains AO1-AO4 only.

Verified:

- no AO5 rows in `essay_questions.ao_requirements`
- no AO5 rows in `essay_paragraphs.ao_coverage`
- no AO5 rows in `ao_annotations.ao_tags`
- no AO5 rows in `paragraph_stems.ao`
- student UI source contains AO1-AO4 controls and no AO5 filter

## RLS / Security Observations

- RLS is enabled on all seven annotated essay content tables.
- Public/student read policies allow only `approved`, `reviewed`, `teacher review required`, and `needs correction`.
- `draft` and `retired` are excluded by RLS and by the frontend assembly helper.
- Admin select/update policies require `public.has_role(auth.uid(), 'admin')`.
- No service-role key is used in frontend validation.
- The legacy unrestricted `paragraph_stems` public read policy was removed during this pass.

## Defects Found And Fixed

1. Migration assumed `verification_status` existed on `essay_paragraphs` and `ao_annotations`.
   - Fixed migration to add missing status/review columns.

2. Legacy unrestricted `paragraph_stems` public read policy remained active.
   - Fixed migration to drop `Public read paragraph_stems`.

3. Student hook mapped live `paragraph_stems` incorrectly.
   - Fixed `ao` -> `ao_focus` and `level_band` -> `difficulty_level` mapping.

4. Student hook did not filter draft/retired paragraphs and AO annotations.
   - Fixed assembler to filter `essay_paragraphs` and `ao_annotations` by student-visible status.

5. Admin approval patch did not stamp `reviewed_by` when approving directly.
   - Fixed `buildPromotionPatch` to set `reviewed_by` during approval.

6. Student-facing status text was present but not consistently badged across selected essay/question/stem surfaces.
   - Fixed the annotated essay page to render review status badges for the package, selected question, selected essay, question routes, stems, and needs-correction warnings.

## Tests Run

Commands and results:

- `npm test -- useAnnotatedEssayPackContent.test.ts AnnotatedEssayPack.test.tsx AnnotatedEssayReview.test.tsx`
  - Passed: 18 tests
- `npm test -- --run`
  - Passed: 138 tests
  - Skipped: 3 tests
  - Failed: 0 tests
- `npm run typecheck`
  - Passed
- `npm run build`
  - Passed
  - Existing warnings: browserslist data age, chunk size
- `npm run lint`
  - Passed with 24 existing warnings
  - No warnings remain in touched annotated essay files after cleanup

## Remaining Risks

- Admin UI mutation still needs a true signed-in staging admin account for full browser verification.
- `paragraph_stems` contains broader app rows beyond the 16 annotated-pack stems because the workflow extends the existing table. This is expected but should be kept in mind when interpreting status counts.
- Promotion used a validation actor UUID because no admin role row was available; replace with real user UUIDs during ordinary teacher/admin review.

## Recommended Next Step

Create or confirm a staging admin user with `public.user_roles.role = 'admin'`, then repeat the admin UI mutation path for one non-critical `teacher review required` row: add review notes, save, mark reviewed, mark approved, and confirm the same row updates in Supabase and student UI.
