# Builder UI Verification — Post `routes.best_use` Curation

**Date:** 2026-05-22
**Branch:** `main`
**Latest commit checked:** `43c8323 — Curate routes.best_use into student-facing prose`
**Supabase project ref:** `nxlxunygoccbnzdopqna` (staging)
**Predecessor report:** [`BUILDER_UI_VERIFICATION_2026_05_22.md`](docs/BUILDER_UI_VERIFICATION_2026_05_22.md) — same date, captured the pre-curation state against commit `4a9fdf8` and flagged the raw slug-list shape this pass re-verifies.
**Scope:** Verify the Builder "Why this fits" panel renders student-facing prose for all active families after the curation migration in `43c8323`. **No database, schema, RLS, generated-types, deployment, migration-repair, destructive-SQL, or active-family-status changes were made.**

---

## 1. Repository state

| | |
|---|---|
| Branch | `main` |
| Top commits | `43c8323` Curate routes.best_use into student-facing prose · `4b4bd26` Add childhood as fourth supported Builder family · `4a9fdf8` Fix Builder content contract via forward migration |
| Working-tree status | ~50 pre-existing **doc deletions** under `docs/` (unrelated to this task — `BLOCKERS.md`, `STAGING_*`, `COMPONENT_2_*` etc.). **Left untouched per brief.** No other untracked or modified files prior to this report. |

## 2. Files inspected

- [src/pages/EssayBuilder.tsx](src/pages/EssayBuilder.tsx) — render path (Builder lives at `src/pages/EssayBuilder.tsx`, not `src/components/EssayBuilder.tsx` as the brief referenced)
- [src/lib/ContentProvider.tsx](src/lib/ContentProvider.tsx) — bundle source / fallback semantics
- [src/lib/contentRepo.ts](src/lib/contentRepo.ts) — `pick<Route>(...)` passes `routes` through unchanged ([line 206](src/lib/contentRepo.ts:206))
- [src/lib/planLogic.ts](src/lib/planLogic.ts) — `getRoute(id, content)` route resolver ([line 24](src/lib/planLogic.ts:24))
- [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts) — confirms `routes.best_use: string` (not array) ([line 1729](src/integrations/supabase/types.ts:1729))
- `src/App.tsx` — Builder mounted at `/builder`

## 3. Builder render-path confirmation

The "Why this fits" panel renders `routes.best_use` raw with **no transform, fallback, or post-processing layer**:

- [src/pages/EssayBuilder.tsx:323-324](src/pages/EssayBuilder.tsx:323) —
  ```tsx
  <p className="meta-mono mb-1">Why this fits</p>
  <p className="text-xs text-ink leading-relaxed">{r.best_use}</p>
  ```
- `r` is `primaryRoute` or `secondaryRoute`, resolved via `getRoute(question.primary_route_id, content)` / `getRoute(question.secondary_route_id, content)` ([EssayBuilder.tsx:111-112](src/pages/EssayBuilder.tsx:111)).
- `content` comes from `useContent()` → `ContentProvider` → `loadContent()`, which calls `pick<Route>("routes", routes, LOCAL_BUNDLE.routes)` with **no `best_use` mapping** ([contentRepo.ts:206](src/lib/contentRepo.ts:206)). The `Array.isArray(...best_use...)` coercion at [contentRepo.ts:219](src/lib/contentRepo.ts:219) applies only to `interpretive_tensions`, a different table where `best_use` is `string[]`.
- A local-seed fallback (`localContentBundle`) exists in `ContentProvider`, so if the remote query fails the UI degrades to seed data; this pass verified the **remote bundle** was rendering (data observed in UI matches DB rows below).

## 4. Active routes (DB query)

`select id, name, best_use from public.routes` against staging:

| Route id | `best_use` style | Reachable from active question? |
|---|---|---|
| `route-class` | Polished prose ("Best used when the question asks…") | ✅ class primary |
| `route-gender` | **Raw slug list** — `"gender, female_relationships, changing_relationships, love, marriage"` | ❌ **not reachable** — no active question references it |
| `route-guilt` | Polished prose | ✅ guilt primary |
| `route-imagination` | Polished prose | ✅ childhood + imagination primary |
| `route-narrative` | Polished prose | ✅ childhood + guilt secondary |
| `route-perception` | Polished prose | ✅ imagination secondary |
| `route-systems` | Polished prose | ✅ class secondary |

Active question → route map (from `select … from public.questions where coalesce(is_active, true) = true`):

| Family | Primary route | Secondary route |
|---|---|---|
| childhood | route-imagination | route-narrative |
| class | route-class | route-systems |
| guilt | route-guilt | route-narrative |
| imagination | route-imagination | route-perception |

Six distinct active routes — exactly matches the previous validation report's "Active Builder route count: 6". **`route-gender` is not in the active set.**

## 5. UI verification — "Why this fits" per active family

`npm run dev` (vite, port 8080) launched against the staging Supabase project. The Builder was driven via `preview_*` tools (no manual clicks). For each family, the family chip was clicked, the lone active question stem was clicked, and the rendered "Why this fits" text was scraped verbatim from the DOM for both Recommended and Alternative route cards.

### childhood
- **Question:** *Compare how Dickens and McEwan present childhood as a site of formation rather than innocence.*
- **Recommended — Imagination vs Rationality:**
  > Best used when the question pits imagination against rational or empirical systems — Gradgrind's facts-only schooling against Briony's "labyrinth of construction" — and asks where each novel locates the greater danger: the system that suppresses fancy, or the unsupervised mind that elaborates it.
- **Alternative — Narrative Authority, Authorship and Truth:**
  > Best used when the question interrogates narrative authority itself — Dickens's overt narrator-judge of Coketown against McEwan's metafictional disclosure that Briony has authored the consoling version we just read — and asks whether telling can ever stand in for truth or repair.
- **Result:** ✅ PASS — polished prose, no slug list.

### class
- **Question:** *Compare how Dickens and McEwan present class as a force that shapes whose voices are believed.*
- **Recommended — Class, Power and Social Structure:**
  > Best used when the question asks how Dickens and McEwan present class as a structural force that determines whose voice is heard and whose suffering is believed — Stephen Blackpool's exclusion from speech and justice set against Robbie's destruction by the Tallises' class-coded misreading.
- **Alternative — War, Industrialism and the Crushing of the Individual:**
  > Best used when the question turns on how Dickens and McEwan dramatise the individual crushed by large impersonal systems — Coketown's mechanised industrial order and the 1940 retreat to Dunkirk — and on how each novel measures private feeling against historical force.
- **Result:** ✅ PASS.

### guilt
- **Question:** *Compare how Dickens and McEwan present guilt and the possibility of moral repair.*
- **Recommended — Guilt, Responsibility and Moral Consequence:**
  > Best used when the question asks how Dickens and McEwan present guilt as both a private moral burden and a structural force shaping memory, judgement and attempted repair — Louisa's collapse before her father and Briony's lifelong act of fictive atonement.
- **Alternative — Narrative Authority, Authorship and Truth:**
  > Best used when the question interrogates narrative authority itself — Dickens's overt narrator-judge of Coketown against McEwan's metafictional disclosure that Briony has authored the consoling version we just read — and asks whether telling can ever stand in for truth or repair.
- **Result:** ✅ PASS.

### imagination
- **Question:** *Compare how Dickens and McEwan present imagination as both necessary and dangerous.*
- **Recommended — Imagination vs Rationality:**
  > Best used when the question pits imagination against rational or empirical systems — Gradgrind's facts-only schooling against Briony's "labyrinth of construction" — and asks where each novel locates the greater danger: the system that suppresses fancy, or the unsupervised mind that elaborates it.
- **Alternative — Reality, Perception and Misreading:**
  > Best used when the question concerns how reality is distorted by imposed or self-generated frameworks — Gradgrind's calculus of fact and Briony's child-novelist misreading of the fountain and library scenes — and how each text exposes interpretation itself as the source of harm.
- **Result:** ✅ PASS.

## 6. Raw slug-list scan across active UI

**No active Builder route renders a raw comma-separated slug list.** All eight rendered panels (4 families × {Recommended, Alternative}) begin with "Best used when the question…" and read as student-facing prose. This resolves the note logged in the predecessor report (commit `4a9fdf8`, same filename, pre-curation).

## 7. Local check results

| Script | Result |
|---|---|
| `npm run typecheck` | ✅ Pass (clean exit from `tsc --noEmit`, no output) |
| `npm run test` | ✅ Pass — **120 passed, 3 skipped** (15 files passed, 1 skipped) — matches prior baseline |
| `npm run build` | ✅ Pass — vite production build; 2 851 modules transformed; one pre-existing non-fatal chunk-size warning (`index-*.js` ≈ 1.52 MB) — not introduced by this task |

Runtime console errors observed during dev-server use: only `404 Error: User attempted to access non-existent route: /essay-builder` — caused by an initial path typo (the route is `/builder`) before correct navigation. No real defects.

## 8. Files changed

- **Added:** `docs/BUILDER_UI_VERIFICATION_POST_CURATION_2026_05_22.md` (this report)
- No application code modified — verification-only outcome.

## 9. Commit hash

`988c6be` — `docs: verify Builder best_use UI prose post-curation` (verification-only, single-file diff).

## 10. Constraint confirmation

No changes were made to:
- database schema · RLS · generated TypeScript types · deployment configuration · migration history / repair state · active-family or active-route status · `--include-all` flags · `db reset` · destructive SQL.
- No new migrations were authored.
- The only working-tree change introduced by this task is the addition of this report.

## 11. Remaining risks / follow-up

1. **`route-gender` still contains a raw slug list** (`"gender, female_relationships, changing_relationships, love, marriage"`). It is **not reachable from any active question** today, so it does not affect the student-facing Builder UI. If/when the `gender` family is reactivated, this row would resurface the same defect the `43c8323` migration fixed for the other six active routes. **Recommendation:** include `route-gender.best_use` in the next curation pass, or delete the row if it will remain permanently inactive. Out of scope here per brief ("do not attempt to fix inactive families").
2. **Working-tree noise unrelated to this task:** ~50 deleted `docs/*.md` files remain unstaged. They predate this task and were intentionally left untouched. Worth reconciling in a separate housekeeping commit so future verification runs start from a clean tree.
3. **Local seed fallback parity:** the local seed (`src/data/seed.ts`) ships its own pre-curated best_use strings, so a remote-fetch failure currently degrades to readable prose. If the seed and DB ever drift, the UI may render different prose offline vs. online for the same route id. Not actionable now but worth a parity check at the next data refresh.

---

## Success criteria — met

- ✅ Active Builder UI renders student-facing prose in "Why this fits" panel
- ✅ No active Builder route shows raw comma-separated slug lists
- ✅ `typecheck`, `test`, `build` all pass — no new failures
- ✅ No database / schema work performed
- ✅ Result documented in this report
