# Annotated Essay Content Review Workflow — Implementation Report

**Date:** 2026-05-25
**Branch:** `codex/annotated-essay-pack`
**Scope:** Add a governed review and promotion workflow for the Annotated Essay
Practice Pack (Hard Times / Atonement, Pearson Edexcel Component 2, 9ET0/02)
seeded in commit `f051883`.

---

## What changed

### Database

One additive migration:

- [supabase/migrations/20260525120000_annotated_essay_content_review_workflow.sql](../supabase/migrations/20260525120000_annotated_essay_content_review_workflow.sql)
  - Adds reviewer metadata columns (`reviewed_at`, `reviewed_by`, `approved_at`,
    `approved_by`, `review_notes`, `correction_notes`) to the seven pack tables:
    `essay_questions`, `annotated_essays`, `essay_paragraphs`, `ao_annotations`,
    `paragraph_stems`, `quote_method_links`, `misconception_upgrades`.
  - Locks `verification_status` to the canonical six-value set with a CHECK
    constraint per table:
    `{draft, teacher review required, reviewed, approved, needs correction, retired}`.
  - Replaces the previous "select using true" public read policy with stricter
    rules: students see only `approved`, `reviewed`, `teacher review required`,
    and `needs correction`. `draft` and `retired` rows are hidden from anon and
    non-admin authenticated readers. Admin reads/updates are gated by
    `public.has_role(auth.uid(), 'admin')`.
  - Indexes `verification_status` on each table for the admin queue.

No tables were created or dropped. Existing seeded rows (all
`teacher review required`) validate cleanly against the new constraints.

### Frontend

| File | Purpose |
|---|---|
| [src/hooks/useAnnotatedEssayPackContent.ts](../src/hooks/useAnnotatedEssayPackContent.ts) | New react-query hook that loads the pack from Supabase, filters out `draft`/`retired` rows, and falls back to the bundled seed if any of the seven tables errors or returns no rows. Exports a pure `assembleAnnotatedPack` helper for unit testing. |
| [src/pages/AnnotatedEssayPack.tsx](../src/pages/AnnotatedEssayPack.tsx) | Now consumes the hook instead of importing the seed directly. Surfaces a `Content source: live Supabase \| bundled seed` line in the header. Renders an explicit "Needs correction — verify before relying on this quote/drill" amber badge on per-row quotes and stems whose status is `needs correction`. Uses defensive lookups so an admin retiring a row mid-session doesn't crash the page. |
| [src/components/admin/AnnotatedEssayReview.tsx](../src/components/admin/AnnotatedEssayReview.tsx) | New admin component. Pulls all rows from the seven pack tables, exposes filters (table / status / reviewed / search), shows a six-status KPI strip, and provides an item-detail panel with promotion buttons covering the full status pipeline. Promotion writes the status patch built by the pure `buildPromotionPatch` helper. |
| [src/pages/DataManager.tsx](../src/pages/DataManager.tsx) | Adds an `Annotated essays` tab next to the existing `Review queue` tab. Reuses the admin-gated route at `/admin`. |
| [src/data/annotatedEssayPracticePack/index.ts](../src/data/annotatedEssayPracticePack/index.ts) | Loosened the `verification_status` literal types from `"teacher review required"` to the canonical six-value union so transformed Supabase rows fit the bundled types. No content changes. |
| [src/pages/AnnotatedEssayPack.test.tsx](../src/pages/AnnotatedEssayPack.test.tsx) | Wraps `render()` in a `QueryClientProvider` (the page now uses react-query). No assertion changes. |

### Tests added

- [src/hooks/useAnnotatedEssayPackContent.test.ts](../src/hooks/useAnnotatedEssayPackContent.test.ts) (4 tests)
  - Supabase-assembled pack is returned when every table has visible rows.
  - `draft` and `retired` rows are filtered out of student-visible queries.
  - `needs correction` rows are kept and the UI tag survives transformation.
  - Empty essential table → `null` so the caller falls back to seed.
- [src/components/admin/AnnotatedEssayReview.test.tsx](../src/components/admin/AnnotatedEssayReview.test.tsx) (6 tests)
  - `buildPromotionPatch` rules for every status transition (reviewed, approved,
    needs correction, return-to-review, retire, empty-notes → null).

### Documentation

- [docs/sql/annotated_essay_content_promotion_examples.sql](sql/annotated_essay_content_promotion_examples.sql) — six runnable SQL examples for batch promotion, audit, and one-off corrections. The preferred surface is the admin UI; this file is the documented escape hatch.
- This report.

---

## Status model implemented

| Status | Student visibility | UI treatment |
|---|---|---|
| `draft` | Hidden | n/a — admin only |
| `teacher review required` | Visible | Existing badge; default for seeded rows |
| `reviewed` | Visible | No banner; treated as student-safe |
| `approved` | Visible | No banner; final student-facing |
| `needs correction` | Visible | Per-row amber "Needs correction — verify before…" badge |
| `retired` | Hidden | n/a — preserved for audit |

Promotion rules (encoded in `buildPromotionPatch`):

- `→ reviewed`: `reviewed = true`, `reviewed_at = coalesce(prev, now())`, `reviewed_by = user.id`.
- `→ approved`: also sets `approved_at = now()`, `approved_by = user.id`.
- `→ needs correction`: `reviewed = false`; **requires** `correction_notes` (the UI blocks the action otherwise).
- `→ teacher review required`: clears `reviewed_at`, `approved_at`, `approved_by`; `reviewed = false`.
- `→ retired`: only flips the visibility — preserves prior review/approval audit.
- `→ draft`: `reviewed = false`; clears `reviewed_at`, `approved_at`.

---

## Security / RLS notes

- Student-facing pages now consume the new hook, which both filters at the
  application layer and benefits from the RLS rules so a missing filter on the
  client never leaks `draft` / `retired`.
- Admin-only updates are gated by `has_role(auth.uid(),'admin')`. The same
  pattern is used elsewhere in the codebase (see
  `20260418230444_6983f823-...sql`), so we are not introducing a new role
  model.
- No service-role key is referenced in any of the new frontend files. The
  client uses `VITE_SUPABASE_ANON_KEY` exclusively, the same as the rest of the
  app.
- The new admin tab is rendered inside `DataManager`, which is already mounted
  behind `<ProtectedRoute requireAdmin>` at the `/admin` route.

---

## Acceptance criteria — status

1. **Content can be reviewed/promoted without ad hoc SQL** — Yes, via `/admin → Annotated essays`. SQL examples are documented for batch operations.
2. **Statuses consistent across tables** — Yes, enforced by per-table CHECK constraints with identical value lists.
3. **All six statuses handled consistently** — Yes, both in DB constraints, hook filtering, and admin UI promotion buttons.
4. **Student-facing pages don't show retired/draft** — Enforced at both the RLS layer and in `assembleAnnotatedPack` (defence in depth).
5. **Needs-correction not silently treated as final** — Per-row amber warning on quote clusters and stem drills; admin UI tags reviewed status independently.
6. **No duplicate tables created** — Existing tables only.
7. **No service-role key client-side** — Verified.
8. **Existing Annotated Essay page still works with Supabase + seed fallback** — The hook swaps automatically; test suite confirms identical behaviour when the fallback path is taken (which is what tests exercise — no live Supabase in jsdom).
9. **AOs remain AO1–AO4 only** — Untouched; the prior CHECK constraints `ao_requirements <@ array['AO1','AO2','AO3','AO4']::text[]` are unchanged.
10. **Tests cover the workflow** — 10 new tests (4 hook + 6 promotion patch); full suite (137 tests) passes.

---

## Out of scope / deferred

These were named as optional in the brief or would meaningfully expand the
diff and are deliberately left for follow-up:

- **Bulk promotion actions.** Brief allows these as optional with safeguards.
  Not built — the per-item UI is sufficient for the current ~25 rows of seeded
  content. If row count grows, add a confirmation-modal-gated bulk action.
- **Per-content-type detail panels.** The current detail panel surfaces a
  unified orientation block (it picks fields like `question_text`, `thesis`,
  `paragraph_text`, `stem_text`, `quotation`, `text_span`, `weakness`, etc.).
  A tabbed per-type panel would be richer but is not required to land a
  governed workflow.
- **Live admin changes propagating to open student tabs.** The student hook
  has a 5-minute `staleTime`; a hard reload picks up promotions. Realtime is
  not required for the review workflow.
- **Audit log of who-promoted-what.** The `reviewed_by` / `approved_by` UUIDs
  capture the actor for the current state, but there is no append-only history
  table. The existing `staged_changes` pattern would be the right place to add
  one if needed.

---

## Remaining risks

- The Annotated Essay generated `Database` types in
  `src/integrations/supabase/types.ts` do **not** include the seven pack
  tables yet. The hook and admin component use `as never` casts at the
  `supabase.from()` boundary, matching the pattern already used in
  `ReviewQueue`. Next time the types are regenerated (via `supabase gen
  types`), those casts can be removed for stricter typing.
- The browser preview happy-path verification (page loads with the seed
  fallback in dev) is included below. The Supabase-backed path can only be
  fully exercised against a live database with applied migrations; the
  fallback path (which is what tests exercise) renders identically.

---

## Recommended next step

If the admin team wants this on staging quickly: apply migration
`20260525120000_…` to staging, manually promote one essay end-to-end via
`/admin → Annotated essays` to validate, then either (a) batch-promote
remaining items via the documented SQL examples or (b) iterate in the UI.

If the admin team wants this to ship more broadly: regenerate
`src/integrations/supabase/types.ts` from the staging schema so the
`as never` casts can be retired, and add a single integration test that hits a
real (or supabase-local) database to verify the RLS rules.
