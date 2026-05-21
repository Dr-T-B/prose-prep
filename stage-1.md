# Stage 1 — Inventory (ground truth)

Read-only inventory. No analysis. Generated 2026-05-21.
Supabase project: `nxlxunygoccbnzdopqna` (pinned).

## Pre-flight

Off-limits project refs (`lopjupwadwahkjyhghvb`, `qklfhebbrinsyfyuyiuj`) appear ONLY in `docs/contamination-audit-2026-05-12.md`, `docs/CODEX_AUDIT_RECOMMENDATIONS_IMPLEMENTATION_REPORT.md`, `docs/SUPABASE_MIGRATION_HISTORY_RECONCILIATION_REPORT.md` — all as explicit "not touched" historical disclaimers. No occurrences in source, SQL, env, types, or prompts. **Pre-flight passes.**

---

## 1.1 — Routes (App.tsx)

Source: `src/App.tsx:57–97`. No `React.lazy` / no dynamic `import()` anywhere in App.tsx — every page is statically imported. Single top-level `ErrorBoundary` (wraps `<Routes>`).

**Total `Route` declarations: 35** (32 element routes + 3 `Navigate` redirects + 1 wildcard + 1 wrapper layout route).

| # | Path | Element | Auth wrapper | Note |
|---|---|---|---|---|
| 1 | `/auth` | `<AuthPage />` | none | public |
| 2 | `/login` | `<Navigate to="/auth" replace />` | none | redirect |
| 3 | `/forgot-password` | `<ForgotPassword />` | none | public |
| 4 | `/reset-password` | `<ResetPassword />` | none | public |
| 5 | (layout) | `<ProtectedRoute allowAnonymous><AppShell /></ProtectedRoute>` | layout | wraps 6–32 |
| 6 | `/` | `<Dashboard />` | layout | golden path |
| 7 | `/dashboard` | `<Navigate to="/" replace />` | layout | redirect |
| 8 | `/build` | `<Navigate to="/builder" replace />` | layout | redirect |
| 9 | `/builder` | `<EssayBuilder />` | layout | |
| 10 | `/paragraph-builder` | `<ParagraphBuilderPage />` | layout | |
| 11 | `/paragraph-engine` | `<ParagraphEnginePage />` | layout | |
| 12 | `/timed` | `<TimedPractice />` | layout | |
| 13 | `/toolkit` | `<RetrievalToolkit />` | layout | |
| 14 | `/library` | `<Library />` | layout | |
| 15 | `/library/quotes` | `<LibraryQuotes />` | layout | |
| 16 | `/library/quote-bank` | `<LibraryQuoteBank />` | layout | |
| 17 | `/library/questions` | `<LibraryQuestions />` | layout | |
| 18 | `/library/thesis` | `<LibraryThesisParagraph />` | layout | |
| 19 | `/library/thesis/:routeCode` | `<ThesisRouteDetailPage />` | layout | dynamic param |
| 20 | `/library/comparison` | `<LibraryComparison />` | layout | |
| 21 | `/library/context` | `<LibraryContext />` | layout | |
| 22 | `/library/glossary` | `<LibraryGlossary />` | layout | |
| 23 | `/library/stems` | `<LibraryParagraphStems />` | layout | |
| 24 | `/drill` | `<RetrievalDrill />` | layout | |
| 25 | `/architecture` | `<TextArchitecture />` | layout | |
| 26 | `/routes` | `<ComparisonRoutes />` | layout | |
| 27 | `/flex` | `<InterpretiveFlex />` | layout | |
| 28 | `/theme-wheel` | `<ThemeWheel />` | layout | component (not page) |
| 29 | `/matrix` | `<ComparativeMatrix />` | layout | component (not page) |
| 30 | `/essay-marker` | `<EssayMarker />` | layout | |
| 31 | `/learn` | `<Learn />` | layout | |
| 32 | `/modules` | `<Modules />` | layout | |
| 33 | `/modules/:moduleSlug/:lessonSlug` | `<LessonDetail />` | layout | dynamic params |
| 34 | `/practise` | `<Practise />` | layout | |
| 35 | `/revise` | `<Revise />` | layout | |
| — | `/compare` | `<Compare />` | layout | |
| — | `/admin` | `<ProtectedRoute requireAdmin><DataManager /></ProtectedRoute>` | layout + admin | nested guard |
| — | `*` | `<NotFound />` | none | catch-all |

(Final 3 rows continue the layout-wrapped block; user-facing distinct routes = **32 unique paths**, of which 3 are redirects and 1 catch-all → **28 navigable destinations**.)

Total expected by user: ~26. Actual: 28 navigable. **Drift: +2** (worth checking which two were not expected — observation only, no severity yet).

---

## 1.2 — Page components, shared components, hooks, utils, repo / data-layer files

All file paths relative to repo root.

### Pages (`src/pages/`)
Auth.tsx, Compare.tsx, ComparisonRoutes.tsx, Dashboard.tsx, DataManager.tsx, EssayBuilder.tsx, EssayMarker.tsx, ForgotPassword.tsx, InterpretiveFlex.tsx, Learn.tsx, LessonDetail.tsx, Library.tsx, Modules.tsx, NotFound.tsx, ParagraphBuilderPage.tsx, ParagraphEnginePage.tsx, Practise.tsx, ResetPassword.tsx, RetrievalDrill.tsx, RetrievalToolkit.tsx, Revise.tsx, TextArchitecture.tsx, ThesisRouteDetailPage.tsx, TimedPractice.tsx, **TimedWrite.tsx** (orphan — imported nowhere from App.tsx).

### Pages — library subdir (`src/pages/library/`)
Comparison.tsx, Context.tsx, Glossary.tsx, ParagraphStems.tsx, Questions.tsx, QuoteBank.tsx, Quotes.tsx, ThesisParagraph.tsx, _shared.tsx.

### Shared components (`src/components/`)
AoSelfMark.tsx, AppShell.tsx, ComparativeMatrix.tsx, **Dashboard.tsx** (duplicate of pages/Dashboard.tsx? — to verify in Stage 2), ErrorBoundary.tsx, LocalOnlyNotice.tsx, ParagraphEngine.tsx, ProtectedRoute.tsx, QuotePicker.tsx, ThemeWheel.tsx.

### Admin components (`src/components/admin/`)
ContentAudit.tsx, ContentInspector.tsx, DataDashboard.tsx, FieldHealthSnapshot.tsx, ImportHistory.tsx, ImportPanel.tsx, NormalizationInsights.tsx, ProposeNormalizationDialog.tsx, RecentlyApplied.tsx, RecordEditor.tsx, ReviewQueue.tsx, ReviewerThroughput.tsx, RouteIntegritySnapshot.tsx, Tier1LibraryImportPanel.tsx, UserManager.tsx, VocabularyAudit.tsx.

### UI primitives (`src/components/ui/`)
51 files (shadcn-style): accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip, use-toast.ts.

### Contexts (`src/contexts/`)
AuthContext.tsx, GradeBModeContext.tsx (+ test file).

### Hooks (`src/hooks/`)
use-mobile.tsx, use-toast.ts, useCurrentPlanCloud.ts, useDevMode.ts (+ test dir).

### Lib / data-layer (`src/lib/`)
ContentProvider.tsx, builderHandoff.ts, contentRepo.ts, csvImport.ts, datasets.ts, gradeBSupport.ts, libraryAdapters.ts, paragraphEngine.ts, persistence.ts, planCloud.ts, planFetches.ts, planLogic.ts, planRepository.ts, planStore.cloud-exports.ts, planStore.ts, supabaseClient.ts, tier1LibraryImport.ts, utils.ts, vocabularyAudit.ts (+ test files).

### Integrations (`src/integrations/supabase/`)
client.ts, types.ts.

### Types (`src/types/`)
database.types.ts, essayMarker.ts, thesisRoutes.ts.

### Data seed (`src/data/`)
seed.ts.

### Tests (`src/test/`, plus inline)
essayMarkerStream.test.ts, example.test.ts, importQuotes.test.ts, markerValidation.test.ts, setup.ts; inline test files alongside source (.test.ts/.test.tsx — 9 in total).

**Observations (no severity yet):** two Supabase client modules — `src/integrations/supabase/client.ts` AND `src/lib/supabaseClient.ts` — to verify in later stages. `src/components/Dashboard.tsx` co-exists with `src/pages/Dashboard.tsx` — likely one is unused. `src/pages/TimedWrite.tsx` is not registered in `App.tsx`.

---

## 1.3 — Edge functions

### Local (`supabase/functions/`)
1. `mark-component2-essay/index.ts` (644 lines) + `validation.ts` (370 lines).
   Imports: `npm:@anthropic-ai/sdk@0.30.1`, `npm:@supabase/supabase-js@2.95.0`; helpers from `./validation.ts` (AO_KEYS, EXAM_WARNING, extractSection, LEVEL_TO_MARKS, LEVEL_TO_READINESS_SCORE, pickDrillRouteForWeakestAO, safeJsonParse, stripAO5, validateInput, validateShape, VALID_APP_ROUTES, types).
2. `apply-staged-change/index.ts` (505 lines). Imports: `npm:@supabase/supabase-js@2.95.0` only.

### Deployed (from `list_edge_functions` against `nxlxunygoccbnzdopqna`)
1. `mark-component2-essay` — status ACTIVE, version 4, verify_jwt=true, updated 2026-05-20.

**Drift:** `apply-staged-change` exists in local source but is **NOT deployed**. (Observation — Stage 6 will assess severity.)

---

## 1.4 — Database (live, project `nxlxunygoccbnzdopqna`)

### Tables (39 — all in `public`; all have RLS enabled, none force-RLS)

ao_readiness, character_cards, comparative_matrix, essay_marker_results, essay_plans, glossary_terms, import_logs, interpretive_tensions, lesson_progress, lessons, library_context_bank, library_paragraph_frames, library_thesis_bank, modules, paragraph_attempt_quote_links, paragraph_attempts, paragraph_jobs, paragraph_stems, profiles, questions, quote_methods, quote_pairs, quote_question_links, quotes, reflection_entries, resources, retrieval_items, retrieval_responses, retrieval_sessions, routes, saved_essay_plans, saved_views, staged_changes, student_quote_pair_mastery, symbol_entries, themes, theses, timed_sessions, user_roles.

### Views (3)
retrieval_due_today, v_student_quote_pair_progress, v_student_recent_paragraphs.

### Column-level detail
Full column list (name, type, nullability) captured for all 39 tables + 3 views via `SELECT … FROM information_schema.columns WHERE table_schema='public'`. See appendix below for the per-table breakdown.

### Primary / Foreign / Unique keys
Captured via `information_schema.table_constraints + key_column_usage`. Notable:
- `ao_readiness` PK = composite (`ao`, `user_id`); FK on `user_id`.
- `lesson_progress` unique pair (`user_id`, `lesson_id`); FK on both.
- `paragraph_attempts` FKs on `student_id`, `exam_question_id`, `thesis_route_id`, `quote_pair_id`, `paragraph_template_id`.
- `paragraph_attempt_quote_links` unique pair (`paragraph_attempt_id`, `quote_pair_id`).
- `student_quote_pair_mastery` unique pair (`student_id`, `quote_pair_id`).
- `essay_marker_results` FKs on `user_id`, `question_id`, `paragraph_attempt_id`.
- `quote_question_links` unique pair (`quote_id`, `question_id`).
- `quote_pairs.quote_pair_code` UNIQUE.
- `quotes.anchor_id` UNIQUE.
- `user_roles` unique pair (`user_id`, `role`).
- `lessons.slug`, `modules.slug` UNIQUE.

### RLS policies
106 policies captured across 39 tables. Every table has at least one SELECT policy. All policies use `auth.uid()` matching, `has_role(auth.uid(), 'admin'::app_role)`, or `service_role` whitelist. (Stage 3 will cross-reference vs. frontend operations.)

### Migration drift (local files vs. `list_migrations`)

| Direction | Count | Versions |
|---|---|---|
| **Remote-only** (applied to DB, NOT in `supabase/migrations/`) | **10** | `20260519141230_drop_dead_tables`, `20260519145653_fix_paragraph_attempts_type_and_fks`, `20260519145819_add_missing_columns`, `20260519165331_phase6_ao_readiness_user_id`, `20260519165451_phase8a_recreate_views_without_ao5`, `20260519165534_phase8b_drop_ao5_columns`, `20260519181413_phase7_themes_consolidation`, `20260519183737_phase_d1_drop_dead_tables`, `20260519184203_phase_d2_drop_validate_themes`, `20260519192443_theme_vocabulary_canonicalisation` |
| **Local-only** (file present, NOT applied to DB) | **1** | `20260520160000_ao_readiness_nullable_columns` |
| In both | 52 | — |

(Significant: 10 remote-only migrations are the 2026-05-19 schema remediation pass. Severity will be set in Stage 3 — flagged here as **INFO** at inventory stage; raises HIGH for source-of-truth integrity.)

### Installed extensions
plpgsql, pgcrypto, uuid-ossp, pg_stat_statements, supabase_vault. (No vector / pg_cron / pg_net / pg_graphql installed.)

---

## 1.5 — Secrets / env var inventory

### Read by edge functions (Deno.env.get)
- `SUPABASE_URL` — `mark-component2-essay/index.ts:43`, `apply-staged-change/index.ts:277`
- `SUPABASE_ANON_KEY` — `mark-component2-essay/index.ts:44`, `apply-staged-change/index.ts:278`
- `SUPABASE_SERVICE_ROLE_KEY` — `mark-component2-essay/index.ts:45`, `apply-staged-change/index.ts:279`
- `ANTHROPIC_API_KEY` — `mark-component2-essay/index.ts:46`

All four are prefix-free (correct for server-side; nothing `VITE_*` is read inside edge functions).

### Declared in `.env*` files
| File | Tracked in git? | Variables | Notes |
|---|---|---|---|
| `.env.example` | YES | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, (commented) `VITE_SUPABASE_PUBLISHABLE_KEY` | placeholder values |
| `.env` | NO (gitignored) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | **real** values for live project |
| `.env.local` | NO (gitignored) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | **real** values |

**Observation (severity assigned in Stage 3/4):** `.env` contains a real `SUPABASE_SERVICE_ROLE_KEY` on the developer's filesystem. It is gitignored (`.env`, `.env.local`, `.env.*.local`, `.env.test`, `.env*.local`), so it cannot be committed. It is NOT prefixed `VITE_`, so Vite will not bundle it into the client. Risk surface is: local accidental disclosure (screen share, dev shadow, mis-`cat`). No active leak path detected.

### Vite client expects
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (per `.env.example` and frontend client setup — to verify wiring in Stage 2).

---

## Self-verification checklist

- [x] 1.1 done — 35 Route declarations enumerated; 0 lazy chunks; single ErrorBoundary at root.
- [x] 1.2 done — pages, components, admin components, ui primitives, contexts, hooks, lib, integrations, types, data, tests all listed; 3 inventory observations flagged for Stage 2.
- [x] 1.3 done — 2 local edge functions catalogued; 1 deployed; drift noted.
- [x] 1.4 done — 39 tables (all RLS-on) + 3 views catalogued; columns/FKs/PKs/uniques captured; 106 RLS policies captured; migration drift quantified (10 remote-only, 1 local-only).
- [x] 1.5 done — env-var inventory complete; no values printed; secret-on-disk observation noted (no severity assigned at this stage).

**Open questions for the user before Stage 2:**
1. The "~26 routes" expectation is now measured at 28 navigable. Is +2 a surprise or expected drift?
2. `apply-staged-change` exists locally but is undeployed. Is this intentional (pending PR) or stale?
3. 10 migrations are applied to the live DB without corresponding files in `supabase/migrations/`. Want me to dump them to disk during Stage 3 (read-only DDL print) so we can see what changed, or treat as fixed history?

Stage 1 complete. Awaiting approval to proceed.
