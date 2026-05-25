# Structural Audit — 2026-05-25

The owner's frustration is justified. The app has grown by accretion and the surface area now exceeds the user's mental model by a wide margin. This audit reports what is actually there (routes, navigation, DB) and proposes a target information architecture that collapses the tool catalog into a small set of user-facing concepts. The execution plan is phased and explicit — no patches, no speculative refactors.

---

## TL;DR

- **29 student-facing routes** (excluding auth + admin + redirects), exposed flat in a single horizontal scroll bar.
- **~40 page components** under `src/pages/`, including 8 under `/library`.
- **46 database tables**, of which only ~28 are actively read or written by the app. ~5 are dead, ~8 are consolidation candidates.
- **Five clear duplicate clusters** in the routes (paragraph-drafting × 4, comparison views × 4, quote browsing × 3, practice × 4, study paths × 2).
- **Navigation is a tool catalog, not a user journey.** The dashboard is read-only and surfaces no CTAs to the rest of the app.
- **At least one orphan in the nav itself**: `/library/quote-bank` ("Method Bank") exists in the nav but isn't linked from the Library landing.

Target state: **6–8 top-level destinations** that match the actual user workflow, with internal tabs/views replacing the current sprawl of separate URLs.

---

## Section 1 — What's actually there

### 1.1 Route inventory (29 student-facing routes)

Grouped by functional cluster, not by current nav order.

| Cluster | Routes | Apparent intent |
| --- | --- | --- |
| **Planning / orientation** | `/`, `/learn`, `/modules`, `/modules/:m/:l` | Land, choose a study track, follow a lesson |
| **Library / reference** | `/library`, `/library/quotes`, `/library/quote-bank`, `/library/questions`, `/library/thesis`, `/library/comparison`, `/library/context`, `/library/glossary`, `/library/stems` | Browse curated content |
| **Retrieval** | `/toolkit`, `/drill` | Active recall practice |
| **Planning an essay** | `/builder`, `/compass` | Plan a comparative essay |
| **Writing paragraphs / essays** | `/paragraph-builder`, `/paragraph-engine`, `/phase4` | Draft paragraphs / pieces |
| **Marking & exemplars** | `/essay-marker`, `/annotated-essays` | Get AI feedback / read exemplars |
| **Practice** | `/timed`, `/practise`, `/revise` | Time-bound or quiz practice |
| **Context / comparison views** | `/architecture`, `/routes`, `/flex`, `/theme-wheel`, `/matrix`, `/compare` | Visualise text structure or compare texts |
| **Admin** | `/admin`, `/admin/character-pairings` | Content staging, prototypes |

That's 9 clusters today. A coherent app needs ~6–8 top-level destinations max.

### 1.2 Duplicate clusters (the loudest signal)

These are the routes the user is paying for twice or more:

| Concept | Current routes | Notes |
| --- | --- | --- |
| **Draft a paragraph** | `/paragraph-builder`, `/paragraph-engine`, `/phase4` (Construction Engine) | Three different surfaces; dividing line between them is unclear from the code. |
| **Plan a full essay** | `/builder`, `/compass` | `/builder` is manual, `/compass` is AI-assisted. Same task, two URLs. |
| **Browse quotes** | `/library/quotes`, `/library/quote-bank`, `/toolkit` | Three quote-browsing UIs. `/library/quote-bank` is orphaned from the Library landing entirely. |
| **Compare texts** | `/matrix`, `/compare`, `/routes`, `/library/comparison`, `/theme-wheel`, `/flex` | Six pages presenting variants of "compare the two texts". |
| **Practice** | `/timed`, `/drill`, `/practise`, `/revise` | Four distinct practice surfaces. |
| **Study path** | `/learn`, `/modules` | Two parallel entry points to "follow a study sequence". |

### 1.3 Navigation pathology (from `src/components/AppShell.tsx`)

- **28 nav items** in a flat horizontal scroll. No grouping, no hierarchy.
- **Mislabelled** entry: AppShell lists `/library/quote-bank` as "Method Bank"; `src/pages/Library.tsx` defines 7 categories and never links to it. The category that *is* linked from the landing (`/library/comparison`) doesn't appear in the AppShell at all. Two different IAs are running in parallel.
- **Dashboard has no CTAs.** It's a beautifully populated summary of stats and a "Next Task Panel" — and the panel describes what to do but doesn't link anywhere.
- **`/learn` double-bounces.** Its text cards link to `/library`, where the user has to pick a category and click again.
- **Orphans only reachable from admin or by typing the URL**: `/admin/character-pairings` (Phase3Dashboard) is a leftover prototype.

### 1.4 DB inventory (46 tables, ~28 live)

| Status | Approx. count | Examples |
| --- | --- | --- |
| **Alive** (read or written from app) | ~28 | `quotes`, `quote_methods`, `routes`, `theses`, `questions`, `themes`, `comparative_matrix`, `saved_essay_plans`, `timed_sessions`, `essay_marker_results`, `paragraph_attempts`, `glossary_terms`, `quote_method_links`, `quote_question_links`, `retrieval_sessions`/`items`/`responses`, `profiles`, `user_roles`, `staged_changes`, `import_logs`, `ao_readiness`, `interpretive_tensions`, `student_quote_pair_mastery` … |
| **Unused but recent** | ~3 | `modules`, `lessons`, `reflection_entries` |
| **Dead** | ~5 | `lesson_progress`, several "experimental" tables with zero reads anywhere in the app code |
| **Stubs** | ~3 | `exam_questions`, `thesis_routes`, `paragraph_templates` — created to back FKs, no direct app reads |
| **Consolidation candidates** | ~8 | `quote_pairs` ↔ `quote_methods` (parallel content stacks; deferred normalisation logged 2026-05-19), `essay_plans` ↔ `saved_essay_plans` (two essay-plan surfaces), `past_paper_questions` ↔ `exam_questions` (compete for the same role), `annotated_essays` + `ao_annotations` (unused but recently added) |

**The DB shape encodes the same growth-by-accretion as the UI.** Two parallel quote content stacks, two parallel essay-plan stacks, several stubs with no direct usage, and a "modules / lessons / lesson_progress" subtree that was never wired to the user.

---

## Section 2 — Root causes

The audits surface three structural causes that explain the symptoms. These are the things to fix; everything else is downstream.

1. **No top-down information architecture.** Features were added as standalone routes. Each new tool became a new URL and a new nav item. There is no notion of "this is the same user task as that one".

2. **Two content models running in parallel.** `quote_methods` (the original) and `quote_pairs` (added later for comparative work) coexist with no single canonical retrieval shape. The same is true of `essay_plans` vs `saved_essay_plans`. This is the *cause* of the duplicate UI pages — different pages were written to consume different tables, instead of one page consuming a unified shape.

3. **Dashboard ≠ launchpad.** The dashboard is the highest-traffic page, and it surfaces stats but no actions. Every other page becomes a nav-bar item by necessity, because that's the only path to it. Fix the dashboard's role and the nav can shrink dramatically.

---

## Section 3 — Target IA

Proposed user-facing model. The user's *actual* workflow for a Component 2 comparative essay is approximately: Learn → Find evidence → Plan → Write → Mark → Revise.

Six top-level destinations match that. Admin is the seventh. Everything else is a tab, panel, or sub-view *inside* one of them.

| # | Destination | Replaces | Surface |
| --- | --- | --- | --- |
| 1 | **Dashboard** | `/` | Same URL, but with CTAs that link to the destinations below. Read-only data stays; "Next task" gets an actual button. |
| 2 | **Library** | `/library` + all 8 `/library/*` + `/architecture` + `/library/context` + `/library/glossary` | One URL, internal tabs: Quotes, Characters & Symbols, Themes, Glossary, Questions, Exemplars. The "Method Bank" view is a filter on Quotes, not a separate page. |
| 3 | **Compare** | `/matrix`, `/compare`, `/routes`, `/library/comparison`, `/theme-wheel`, `/flex` | One URL, internal tabs: Matrix (table), Wheel (graph), Routes (axes), Tensions (interpretive). Sourced from the same `comparative_matrix` table. |
| 4 | **Plan** | `/builder`, `/compass` | One URL with a mode toggle (manual / AI-assisted). Same `essayPlan` data shape underneath. `/compass` becomes "Plan → AI assist". |
| 5 | **Write** | `/paragraph-builder`, `/paragraph-engine`, `/phase4` | One URL with workspace modes (single paragraph, full essay, AO-validated). Pick the dominant implementation and retire the other two. |
| 6 | **Mark & exemplars** | `/essay-marker`, `/annotated-essays` | One URL, internal tabs: Mark my essay, Annotated exemplars. They're the same activity (AO-aligned reading) from two sides. |
| 7 | **Practice** | `/timed`, `/practise`, `/revise`, `/drill`, `/toolkit` | One URL with mode tabs: Timed (write under exam conditions), Drills (retrieval recall), Quick recall (glossary quiz), Modelling (read paragraph exemplars). `/toolkit` is a retrieval drill, not a separate concept. |
| 8 | **Admin** | `/admin`, `/admin/character-pairings` | Same URL. The character-pairings prototype either lands in Library/Characters or gets deleted. |

**Result: 8 top-level destinations vs the current 29.** No user-facing capability is removed; each is reachable via a clear, named tab inside its parent destination.

What gets dropped entirely (no surface, no replacement needed):

- **`/learn`** — its job (point users at the Library) is done by the dashboard's actual CTAs once they exist.
- **`/modules` + `/modules/:m/:l`** — the underlying DB tables (`modules`, `lessons`, `lesson_progress`) have no live usage. If the module/lesson concept is reactivated later, it should live as a tab in Plan or as a curated "study sequence" feature inside the dashboard.
- **`/admin/character-pairings`** — Phase 3 prototype, no nav link, no recent activity.

---

## Section 4 — Route consolidation plan

Specific moves. Each is independently shippable; nothing here is "rewrite the app".

### 4.1 Cut (delete page + remove route)

These have no live owner and no nav surface:

- `/admin/character-pairings` → delete `Phase3Dashboard.tsx`. Move any salvageable scaffolding into Library/Characters if it exceeds what's already there. (Confirm with owner first; flagged "likely dead".)
- `/modules`, `/modules/:m/:l` → delete `Modules.tsx`, `LessonDetail.tsx`. Tables `modules`, `lessons`, `lesson_progress` get dropped in §5.

### 4.2 Merge into Compare (`/compare`)

Single destination consuming `comparative_matrix`. Internal tabs replace separate routes:

- `/matrix` → tab: "Matrix"
- `/routes` → tab: "Routes"
- `/library/comparison` → tab: "Axes" or merge into Matrix
- `/theme-wheel` → tab: "Wheel"
- `/flex` → tab: "Tensions" (interpretive readings)

Old URLs become redirects to `/compare?tab=…` for a deprecation window, then removed.

### 4.3 Merge into Library (`/library`)

The Library landing becomes the IA owner of everything currently under `/library/*` and the context/glossary routes. Tabs:

- Quotes (consumes a single normalised quote table — see §5)
- Characters & Symbols (consolidates `/architecture` + `/library/context`)
- Themes
- Glossary (`/library/glossary`)
- Questions (`/library/questions`)
- Paragraph stems (`/library/stems`)
- Thesis & paragraph frames (`/library/thesis`)
- Exemplars (move `/annotated-essays` here if Mark stays separate; see 4.5)

`/library/quote-bank` is deleted as a separate page. Its "method-first" view becomes a filter pill on the Quotes tab.

### 4.4 Merge into Plan (`/plan`, replaces `/builder`)

- `/builder` becomes `/plan` (or stays `/builder`; pick one).
- `/compass` is deleted as a top-level route. The compass form re-mounts as a mode panel inside `/plan` with a "✨ AI assist" toggle.
- Both consume the same `essayPlan` data shape and the same `generate-model-essay` endpoint.

### 4.5 Merge into Write (`/write`, replaces `/paragraph-builder`)

Pick the dominant implementation among `/paragraph-builder`, `/paragraph-engine`, `/phase4` and keep that one. The other two get deleted. Workspace modes (single paragraph, full essay, AO-validated) become tabs inside the kept page.

This is the highest-risk consolidation because the three components have diverged in behaviour. A pre-cut step: write a one-page comparison of what each of the three actually does that the others don't, then decide which to keep.

### 4.6 Merge into Mark (`/mark`)

- `/essay-marker` becomes `/mark`.
- `/annotated-essays` becomes a tab inside `/mark` (or inside `/library` — see 4.3).

### 4.7 Merge into Practice (`/practice`)

- `/timed`, `/practise`, `/revise`, `/drill`, `/toolkit` collapse into `/practice` with mode tabs.
- `/toolkit` is currently the most powerful retrieval surface; its functionality becomes the "Drills" tab.

### 4.8 Fix Dashboard

Make the existing "Next Task Panel" link to a real destination. Add primary CTAs to the dashboard for: Plan an essay, Mark an essay, Open the Library, Start a drill. This is the *enabling* change that lets the nav shrink — once the dashboard is a launchpad, the nav doesn't have to expose every tool.

---

## Section 5 — DB consolidation plan

Each move below is a migration. Numbered to keep them independently reviewable.

### 5.1 Drop dead tables (low risk)

- `lesson_progress` — no app reads, no nav surface after §4.1.
- `reflection_entries` — no app reads.
- `theme_maps` — no app reads (canonicalisation work landed elsewhere).
- Confirm and drop: `essay_plans`, `essay_paragraphs`, `essay_questions`, `character_cards`, `misconception_upgrades` if grep confirms zero reads.

### 5.2 Normalise the quote content stack (medium risk — but the highest-leverage change)

The deferred `quote_pairs` ↔ `quote_methods` split is the *cause* of having three quote-browsing UIs. Resolution path:

- Define the canonical retrieval shape (the one [PR #31 design doc](PR_D3_EVIDENCE_SOURCE_DESIGN_2026_05_25.md) sketches: `id, text, sourceText, theme, method, evidenceRef`).
- Backfill or migrate `quote_pairs` rows into the canonical shape (likely a view + a follow-up table rename).
- Cut the duplicated UI in §4.3.

This is the migration the PR D3 design doc was already pointing at. Doing it unblocks the UI consolidation in §4.3.

### 5.3 Resolve essay-plan duplication (medium risk)

- `essay_plans` ↔ `saved_essay_plans`: pick the live one (`saved_essay_plans`, which is the table the builder writes to), and drop the other.

### 5.4 Resolve question-table duplication (low risk)

- `past_paper_questions` is a stub with no migration of its own and no reads. Drop.
- Keep `questions` and `exam_questions` only if they serve genuinely different purposes; otherwise consolidate.

### 5.5 Stub tables (low risk, after §4.5 settles)

- `exam_questions`, `thesis_routes`, `paragraph_templates` exist to back FKs on `paragraph_attempts`. After the Write consolidation in §4.5, decide whether they still serve a purpose or whether the FKs should be widened.

---

## Section 6 — Phased execution

Sequencing matters because the riskier moves depend on the safer ones being done first.

### Phase 1 — Cut (1 PR, low risk)

- Delete `/admin/character-pairings`, `/learn`, `/modules`, `/modules/:m/:l`.
- Delete the orphan nav entry `/library/quote-bank` from AppShell; the page itself can stay one PR longer until §4.3 lands.
- Drop the genuinely dead tables in §5.1.
- Outcome: 29 routes → 25, no user-visible regression.

### Phase 2 — Compare consolidation (1 PR, low risk)

- Build `/compare` with tabs. Move `/matrix`, `/routes`, `/library/comparison`, `/theme-wheel`, `/flex` content under it. Old URLs redirect to `/compare?tab=…` for a deprecation window.
- Outcome: 25 → 20.

### Phase 3 — Practice consolidation (1 PR, low risk)

- Build `/practice` with mode tabs. Fold `/timed`, `/practise`, `/revise`, `/drill`, `/toolkit`.
- Outcome: 20 → 16.

### Phase 4 — Library consolidation (1 PR, medium risk)

- Move `/library/*` sub-routes into Library tabs. Fold `/architecture` and the context routes in. Delete `/library/quote-bank`.
- Outcome: 16 → 9 (Library now owns one URL with 7 tabs).

### Phase 5 — Quote-stack normalisation (1 migration + 1 follow-up PR, medium risk)

- §5.2. This is what makes the Library Quote tab self-consistent.
- Run alongside Phase 4 in the same PR if confident; otherwise sequence afterwards.

### Phase 6 — Plan + Write consolidation (1 PR each, the riskier ones)

- Plan: fold `/compass` into `/builder` as an AI-assist mode.
- Write: pick one of `/paragraph-builder` / `/paragraph-engine` / `/phase4`, kill the other two.
- Outcome: 9 → 8.

### Phase 7 — Dashboard as launchpad (1 PR)

- Add CTAs to the dashboard surfaces. Cut nav items that are now reachable via dashboard CTA.

**Total: ~7 PRs to go from 29 → 8 user-facing destinations.** Each is reviewable on its own; none requires a flag-day cutover.

---

## Section 7 — Things this audit deliberately did not do

- **Did not measure latency.** Some claims in PR #31 (DB hop "tens of ms", bundle size "well under any realistic limit") are still unmeasured. Worth a 10-minute pass with the actual numbers before Phase 5.
- **Did not pick the survivor among `/paragraph-builder` / `/paragraph-engine` / `/phase4`.** That decision needs eyes on the three components side-by-side; it's not safe to pick from the audit alone.
- **Did not audit tests.** The cuts in §4 will orphan tests. Each cut PR removes the corresponding test files.
- **Did not audit AppShell mobile behaviour.** The 28-item horizontal scroll is symptomatic, but the audit didn't measure the mobile breakpoint pain.
- **Did not propose D3 / D4 product scope changes.** The D3 evidence-source design ([PR #31](https://github.com/Dr-T-B/prose-prep/pull/31)) is still valid; this audit is upstream of it. Once §5.2 lands, the D3 design's "evidence source" question becomes much smaller (the answer becomes "the one normalised quote table").

---

## Section 8 — Recommendation

Stop adding routes. Stop adding tables. Land **Phase 1 (cut)** first as a single PR — it's safe, it cuts the surface by ~14% with zero functional loss, and it gives the rest of the plan momentum. Then sequence Phases 2 → 7 in order. PR D3 (the evidence-source design) stays parked until §5.2 lands; at that point most of the D3 question dissolves.

Open questions for the project owner before starting Phase 1:

1. Confirm `/learn`, `/modules`, `/modules/:m/:l`, `/admin/character-pairings` are deletable (no live student traffic, no curriculum dependency).
2. Confirm `lesson_progress`, `reflection_entries`, `theme_maps` can be dropped from the DB.
3. Among `/paragraph-builder`, `/paragraph-engine`, `/phase4` — which is the one you want to keep? (Phase 6 input; not urgent yet.)
4. The dashboard rewrite (Phase 7) is the smallest code change but the largest UX change. Are CTAs on the dashboard acceptable, or do you want to keep it as a stats-only surface?
