# Supabase Annotated Essay Data Wiring

Date: 24 May 2026

## Scope

The Annotated Essay page now loads the Hard Times / Atonement Component 2 practice pack from Supabase and keeps the bundled seed pack as a fallback. This is a data-wiring pass only; the student-facing UI and AO overlay workflow are intentionally preserved.

## Existing Bundled Data

Bundled fallback content lives in:

- `src/data/annotatedEssayPracticePack/index.ts`

The page previously read this file directly. It now uses it as initial render state and fallback content if Supabase has no live rows or a query fails.

## Supabase Tables Used

No duplicate tables were created. The implementation reads the existing migrated tables:

- `essay_questions`
- `annotated_essays`
- `essay_paragraphs`
- `ao_annotations`
- `paragraph_stems`
- `quote_method_links`
- `misconception_upgrades`

The `paragraph_stems` table is the existing table extended by the earlier migration, not a replacement table.

## Data Access Layer

Live loading is centralised in:

- `src/lib/prose/annotatedEssays.ts`

Repository functions include:

- `getEssayQuestions()`
- `getEssayQuestionById(id)`
- `getAnnotatedEssaysByQuestionId(questionId)`
- `getEssayParagraphs(essayId)`
- `getAoAnnotations(essayId)`
- `getParagraphStems(filters)`
- `getQuoteMethodLinks(filters)`
- `loadAnnotatedEssayPracticePack()`

The page imports `loadAnnotatedEssayPracticePack()` and renders from the returned pack shape. Raw Supabase queries are not embedded in the React component.

## Ordering

Stable ordering is applied in the repository:

- questions: theme, question family, year
- essays: created date, title
- paragraphs: paragraph number
- annotations: annotation order
- paragraph stems: theme, sort order
- quote-method links: theme, created date

## Fallback Behaviour

The page renders bundled seed content immediately. On mount, it attempts to load Supabase content.

- If Supabase returns essay questions, the page switches to live Supabase data.
- If Supabase returns no essay questions, bundled seed data remains visible.
- If a query fails, bundled seed data remains visible.
- Developer diagnostics are shown only in development mode.
- Raw database errors are not exposed to student-facing production UI.

## Status Handling

The UI displays status badges for:

- teacher review required
- reviewed
- approved
- draft / incomplete

Teacher-review-required content remains visible but is labelled clearly. It is not silently treated as final.

## Assessment Objective Rule

The live mapper filters Component 2 AO arrays to AO1, AO2, AO3 and AO4 only. The page does not create AO5 filters or AO5 scoring logic.

Interpretive sophistication should continue to be stored outside formal Component 2 AO scoring, using labels such as interpretive nuance or critical perspective.

## Types

Generated Supabase types were stale before this pass. They were regenerated with:

```bash
supabase gen types typescript --project-id nxlxunygoccbnzdopqna > src/integrations/supabase/types.ts
```

The regenerated types now include the annotated essay tables and the extended paragraph stem columns.

## Security Notes

Client-side loading uses the existing anon Supabase client from:

- `src/integrations/supabase/client.ts`

No service-role key is used or committed. The earlier migration enables RLS and select policies for anon/authenticated reads on the annotated essay content tables. This is suitable for the current private/student-facing content model, provided future unpublished/private content is not inserted into these public-read tables without an additional policy layer.

## Tests

Added or updated tests for:

- Supabase repository question loading
- selected-question essay loading
- paragraph ordering
- annotation ordering
- paragraph stem filtering
- fallback when Supabase has no essay question rows
- live page rendering
- AO toggles
- teacher-review-required badge display
- fallback seed rendering

## Remaining Risks

- The live tables currently expose review-required content via public select policies. This matches the stated requirement to show it visibly, but any future truly private drafts need stricter RLS or a separate staging workflow.
- The page loads the annotated essay pack as a bundle of related tables. If the content grows substantially, pagination or per-question lazy loading may become useful.
- Some quote anchors still require teacher verification before content is promoted from review-required status.

## Recommended Next Step

Run a teacher content review, then update reviewed/approved statuses in Supabase for verified rows. After that, add an admin workflow for promoting annotated essay content without direct SQL updates.

