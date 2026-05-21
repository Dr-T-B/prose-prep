# Stage 5 — Route-by-route smoke audit

Findings only. Read-only. 2026-05-21.

## Headline

- **1 route is functionally dead: `/library/thesis/:routeCode`** — `ThesisRouteDetailPage` queries `thesis_routes`, which **does not exist** in the live DB (`to_regclass('public.thesis_routes')` returns null). React Query catches the throw, so the page renders "Route not found" for *every* `routeCode` regardless of input. Marked **CRASH** because the route's primary function is permanently broken; visually it degrades rather than triggers ErrorBoundary.
- **4 routes are DEGRADED at empty-state** — their primary tables exist but are at 0 rows in production: `RetrievalDrill` (retrieval_items=0), `ParagraphBuilderPage` (paragraph_attempts=0, student_quote_pair_mastery=0), `Practise` (no direct DB read; depends on retrieval/paragraph data), `Modules`/`LessonDetail` (lesson_progress=0 — content loads, progress UI shows zero).
- **The Dashboard golden path is SAFE** — recent commits hardened ao_readiness handling.
- **The Essay Marker (the pre-exam priority) is SAFE** — well-defended SSE flow (S4-022).
- **15 tables are loaded together at App-mount** through `contentRepo.ts:149-163` (ContentProvider). If that Promise.all rejects (any one of the 15), every consuming page receives an error — but ContentProvider's consumers all read through context, so most pages render empty state rather than crash. (S4-004 is HIGH but downgraded to MEDIUM in practice for end-state route stability.)

## Per-route table

Columns: `Route | Path | Component | Tables/queries used | Empty-result | Null-data | Error | Stage 4 IDs | Stage 2/3 IDs | Verdict`

| # | Path | Component | Tables / queries used | Empty-result | Null-data | Error | Stage 4 | Stage 2/3 | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `/auth` | `AuthPage` | none (supabase.auth) | n/a | shows form | inline error | — | — | **SAFE** |
| 2 | `/login` | `<Navigate>` redirect → `/auth` | none | n/a | n/a | n/a | — | — | **SAFE** |
| 3 | `/forgot-password` | `ForgotPassword` | none (supabase.auth) | n/a | shows form | inline error | — | — | **SAFE** |
| 4 | `/reset-password` | `ResetPassword` | none (supabase.auth.onAuthStateChange) | n/a | shows form | unguarded subscription destructure | — | S2-025 | **SAFE** (LOW risk on cleanup) |
| 5 | `/` | `Dashboard` (via re-export → `Component2Dashboard`) | `ao_readiness`, `themes`, `quotes` | ao=0/4 rows → empty AO chips; themes=13/quotes=22 populated | `?? []`, `Number(… ?? 0)`, `?? ""` — all guarded | per-result `error` checked, message rendered | S4-021 (defended) | S3-007 (type drift contained) | **SAFE** |
| 6 | `/dashboard` | `<Navigate>` → `/` | none | n/a | n/a | n/a | — | — | **SAFE** |
| 7 | `/build` | `<Navigate>` → `/builder` | none | n/a | n/a | n/a | — | — | **SAFE** |
| 8 | `/builder` | `EssayBuilder` | via ContentProvider (15 tables) + `planFetches` (`quote_question_links`, `quote_methods`) + `planRepository` (`essay_plans`) | essay_plans=6; non-zero everywhere | upstream `rawFrom` is `any`; bangs at 305-322, 892 | unguarded `data` in planFetches; auth error swallowed in planRepository | S4-001, S4-003, S4-005, S4-010, S4-011 | S2-006, S2-010, S2-011, S2-016, S2-018 | **CRASH-risk** on stale ids; **DEGRADED** otherwise |
| 9 | `/paragraph-builder` | `ParagraphBuilderPage` | `paragraph_attempts` (0 rows), `quote_pairs` (22), `student_quote_pair_mastery` (0) | history shows "no attempts"; mastery shows "0 mastered" | depends on file; spot-read shows `?? []` on key lists | not exhaustively checked | (none specific) | — | **DEGRADED** (empty state) |
| 10 | `/paragraph-engine` | `ParagraphEnginePage` → `ParagraphEngine` | via ContentProvider | renders interactively, no DB writes from this page | — | — | (ContentProvider via S4-014) | S2-019 | **SAFE** |
| 11 | `/timed` | `TimedPractice` | via ContentProvider + `persistence.ts` `timed_sessions` (1 row) | persistable; runs even with no DB read | unguarded `data` in persistence | persistence errors swallowed | S4-011 | S2-017 | **DEGRADED** (silent persist failures possible) |
| 12 | `/toolkit` | `RetrievalToolkit` | via ContentProvider | — | — | — | (via S4-014) | — | **SAFE** |
| 13 | `/library` | `Library` | via ContentProvider | — | — | — | — | — | **SAFE** |
| 14 | `/library/quotes` | `LibraryQuotes` | via ContentProvider (quote_methods=40) | populated | guarded in shared adapter | — | — | — | **SAFE** |
| 15 | `/library/quote-bank` | `LibraryQuoteBank` | `quotes` (22 rows) | populated | partial guards | — | — | — | **SAFE** |
| 16 | `/library/questions` | `LibraryQuestions` | via ContentProvider (questions=15) | populated | guarded | — | — | — | **SAFE** |
| 17 | `/library/thesis` | `LibraryThesisParagraph` | via `libraryAdapters` → ContentProvider (theses=12, library_thesis_bank=12) | populated | guarded | — | — | — | **SAFE** |
| 18 | `/library/thesis/:routeCode` | `ThesisRouteDetailPage` | `thesis_routes` ⚠ **TABLE DOES NOT EXIST** | n/a — never populated | React Query throws inside `queryFn`; `data` is undefined; page shows "Route not found" forever | error swallowed by React Query; never bubbles to UI | new S5-001 | — | **CRASH** |
| 19 | `/library/comparison` | `LibraryComparison` | via ContentProvider (comparative_matrix=38) | populated | guarded | — | — | — | **SAFE** |
| 20 | `/library/context` | `LibraryContext` | via ContentProvider (library_context_bank=27 — but read through wrapper; verify in Stage 6 follow-up) | populated | guarded | — | — | — | **SAFE** |
| 21 | `/library/glossary` | `LibraryGlossary` | via ContentProvider (glossary_terms=38) | populated | guarded | — | — | — | **SAFE** |
| 22 | `/library/stems` | `LibraryParagraphStems` | via ContentProvider (paragraph_stems=38) | populated | guarded | — | — | — | **SAFE** |
| 23 | `/drill` | `RetrievalDrill` | `quote_methods` (40), `quote_pairs` (22), `retrieval_items` (0), `retrieval_sessions` (0), `retrieval_responses` (0) | "no items due" empty state expected | bangs at 376, 434 on `card.meta.themes!.map` | unguarded `auth.getUser` at 190, 209 | S4-002, S4-012, S4-016 | S2-009, S2-021 | **DEGRADED** (empty SRS data); CRASH-risk if any quote_pair row has null themes |
| 24 | `/architecture` | `TextArchitecture` | `character_cards` (11), `symbol_entries` (12), `lessons` (16), `modules` (4) | populated | — | — | — | — | **SAFE** |
| 25 | `/routes` | `ComparisonRoutes` | `comparative_matrix` (38), `routes` (7) | populated | bangs at 184, 279 on `meta!.label` | — | S4-007 | S2-012 | **SAFE** (CRASH only on filter state pointing at removed row) |
| 26 | `/flex` | `InterpretiveFlex` | `glossary_terms` (38), `interpretive_tensions` (14) — `(supabase as any)` cast | populated | bang at 194 `m!.label` | unguarded `(supabase as any)` cast | S4-008 | S2-007, S2-013 | **SAFE** |
| 27 | `/theme-wheel` | `ThemeWheel` (component, not page) | `quotes` (22) | populated | — | — | — | — | **SAFE** |
| 28 | `/matrix` | `ComparativeMatrix` (component, not page) | `comparative_matrix` (38) | populated | — | — | — | — | **SAFE** |
| 29 | `/essay-marker` | `EssayMarker` | `essay_marker_results` (5), `paragraph_attempts` (0), `questions` (15) + edge function `mark-component2-essay` | history shows 5 marks; attempt-history empty | `(data ?? []).map` everywhere ✓; `session?.access_token` guard ✓ | full try/catch around submit; AbortController; response.ok + body guards | S4-022 (defended) | — | **SAFE** — golden path for exam prep |
| 30 | `/learn` | `Learn` | via ContentProvider | — | — | — | — | — | **SAFE** |
| 31 | `/modules` | `Modules` | via ContentProvider (modules=4, lessons=16); also `lesson_progress` (0) for progress UI | progress empty; module list populated | — | — | — | — | **DEGRADED** (progress UI all zero — content fine) |
| 32 | `/modules/:moduleSlug/:lessonSlug` | `LessonDetail` | via ContentProvider; reads lesson_progress (0) | content populated; "not started" everywhere | — | — | — | — | **DEGRADED** (progress empty) |
| 33 | `/practise` | `Practise` | via ContentProvider; no direct `.from()` calls | depends on contentRepo; likely shows retrieval/paragraph CTAs whose targets are empty | — | — | — | — | **DEGRADED** (downstream empty state) |
| 34 | `/revise` | `Revise` | via ContentProvider | — | — | — | — | — | **SAFE** |
| 35 | `/compare` | `Compare` | via ContentProvider | — | — | — | — | — | **SAFE** |
| 36 | `/admin` | `DataManager` (admin-only via `<ProtectedRoute requireAdmin>`) | `import_logs` (0), `staged_changes` (0) | both empty | unguarded `data: log` at 86 | — | S4-020 | S2-020, S2-023, S3-021 | **DEGRADED** (empty admin panels) |
| 37 | `*` | `NotFound` | none | n/a | — | — | — | — | **SAFE** |

## New finding (route-specific)

| ID | Severity | Area | File | Line | Issue | Evidence | Suggested Fix |
|---|---|---|---|---|---|---|---|
| S5-001 | **CRASH** | Nonexistent table | `src/pages/ThesisRouteDetailPage.tsx` | 15 | `supabase.from('thesis_routes')` — table does not exist in the live DB. The route `/library/thesis/:routeCode` permanently shows "Route not found" regardless of `routeCode`. The throw is caught inside React Query's `queryFn`, so the user sees a degraded message; the network tab shows a 404/relation-not-found on every visit. The route IS linked from `/library/thesis` (LibraryThesisParagraph). | `to_regclass('public.thesis_routes')` returns null; Stage 1.4 enumerates 39 tables and `thesis_routes` is not among them. | (Pick one of two) **(a)** Repoint the query to the live equivalent: `library_thesis_bank` joined to `routes` by `route_id` keyed on `routeCode` (the link in LibraryThesisParagraph already uses route codes). **(b)** Remove the route from App.tsx and the link from LibraryThesisParagraph until the data model is finalised. Option (b) is safer pre-exam. |

## Verdict counts

| Verdict | Count |
|---|---|
| SAFE | 22 |
| DEGRADED | 7 (#9 ParagraphBuilder, #11 TimedPractice, #23 RetrievalDrill, #31 Modules, #32 LessonDetail, #33 Practise, #36 DataManager) |
| CRASH | 2 (#8 EssayBuilder CRASH-risk on stale ids; #18 ThesisRouteDetailPage permanently dead) |
| UNKNOWN | 0 |

(#8 EssayBuilder is "CRASH-risk" — would crash on a specific data condition but mostly works. Listed as CRASH to surface; expected day-to-day verdict is DEGRADED.)

## Self-verification checklist

- [x] 5.1 done — all 37 Route entries from Stage 1.1 enumerated. Each has tables, empty/null/error behaviour, cross-references to Stage 2/3/4 findings, and a verdict.
- [x] 5.2 done — every table-bearing route's data dependency cross-checked against Stage 1.4 schema. **One missing table found** (`thesis_routes`, S5-001). For empty production tables (retrieval_*, paragraph_attempts, lesson_progress, paragraph_attempt_quote_links, student_quote_pair_mastery, saved_views, staged_changes, import_logs), affected routes are flagged DEGRADED.

## Forward references

- S5-001 → Stage 7 must-fix-before-exam list. (If Neha is unlikely to use this route, demote to HIGH. Otherwise CRASH stays.)
- Empty-state routes (Modules, LessonDetail, Practise, DataManager) → not blocking for essay marking; safe to leave for after exam.
- ParagraphBuilderPage and TimedPractice — depend on user actually generating data; pre-seeding `paragraph_attempts` / `timed_sessions` for Neha would lift them out of DEGRADED.

Stage 5 complete. Awaiting approval to proceed.
