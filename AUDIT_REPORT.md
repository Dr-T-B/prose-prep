# Prose-Prep PWA — Read-Only Audit Report

- **Repo:** `/Users/tarwindersaran/Downloads/Projects/prose-prep`
- **Branch (HEAD at audit):** `codex/prepare-staging-development`
- **Live URL:** https://prosetutor.netlify.app
- **Supabase project:** `nxlxunygoccbnzdopqna` (staging)
- **Audit date:** 2026-05-16

> NOTE — the repo identifies itself as `prose-prep` while the on-disk parent folder is `prose-craft-aid`. The audit treats them as one project (per the brief).

---

## SECTION 1 — ROUTE & PAGE INVENTORY

Router definition is in `src/App.tsx` (`react-router-dom` v6, `BrowserRouter` + `Routes`). All authenticated routes live inside one `<ProtectedRoute><AppShell /></ProtectedRoute>` element.

| Path | Component file | Data source | Status |
|---|---|---|---|
| `/auth` | `src/pages/Auth.tsx` | Supabase `auth` | LIVE |
| `/login` → `/auth` | `Navigate` | — | LIVE (redirect) |
| `/forgot-password` | `src/pages/ForgotPassword.tsx` | Supabase `auth` | LIVE |
| `/reset-password` | `src/pages/ResetPassword.tsx` | Supabase `auth` | LIVE |
| `/` | `src/pages/Dashboard.tsx` → `src/components/Dashboard.tsx` | Inline mock arrays (`AO_READINESS`, `THEMES`, `QUOTE_PROGRESS`, `EXAM_DATE_ISO`) | MOCK (preview badge present) |
| `/dashboard` → `/` | `Navigate` | — | LIVE (redirect) |
| `/build` → `/builder` | `Navigate` | — | LIVE (redirect) |
| `/builder` | `src/pages/EssayBuilder.tsx` | `ContentProvider` + `planStore` + Supabase persistence | LIVE |
| `/paragraph-builder` | `src/pages/ParagraphBuilderPage.tsx` | Supabase `quote_pairs` (via `useQuery`) | LIVE |
| `/paragraph-engine` | `src/pages/ParagraphEnginePage.tsx` (wrapper) → `src/components/ParagraphEngine.tsx` | `ContentProvider` + `planStore` | LIVE |
| `/timed` | `src/pages/TimedPractice.tsx` | `planStore` + `ContentProvider` | LIVE |
| `/toolkit` | `src/pages/RetrievalToolkit.tsx` | `ContentProvider` | LIVE |
| `/library` | `src/pages/Library.tsx` | `ContentProvider` (counts) | LIVE |
| `/library/quotes` | `src/pages/library/Quotes.tsx` | `ContentProvider` | LIVE |
| `/library/quote-bank` | `src/pages/library/QuoteBank.tsx` | Supabase + `useCurrentPlanCloud` | LIVE |
| `/library/questions` | `src/pages/library/Questions.tsx` | `ContentProvider` | LIVE |
| `/library/thesis` | `src/pages/library/ThesisParagraph.tsx` | `ContentProvider` | LIVE |
| `/library/comparison` | `src/pages/library/Comparison.tsx` | `ContentProvider` | LIVE |
| `/library/context` | `src/pages/library/Context.tsx` | `ContentProvider` | LIVE |
| `/library/glossary` | `src/pages/library/Glossary.tsx` | Inline `GLOSSARY` constant + ContentProvider quote_methods | MOCK (static glossary array) |
| `/library/stems` | `src/pages/library/ParagraphStems.tsx` | `ContentProvider` | LIVE |
| `/drill` | `src/pages/RetrievalDrill.tsx` | Supabase `quotes`/`quote_pairs` | LIVE |
| `/architecture` | `src/pages/TextArchitecture.tsx` | Mostly Supabase but also large inline `BOOKS_HT`/`PARTS_AT` const arrays for structural data | MOCK + LIVE hybrid |
| `/routes` | `src/pages/ComparisonRoutes.tsx` | Supabase | LIVE |
| `/flex` | `src/pages/InterpretiveFlex.tsx` | Supabase | LIVE |
| `/theme-wheel` | `src/components/ThemeWheel.tsx` | **Inline `THEMES` constant — entirely mocked** | MOCK (preview badge present) |
| `/matrix` | `src/components/ComparativeMatrix.tsx` | **Inline `ROWS` constant — entirely mocked** | MOCK (preview badge present) |
| `/session` | `src/pages/TimedWrite.tsx` | Supabase | LIVE (incl. `console.log` on submit) |
| `/learn` | `src/pages/Learn.tsx` | `ContentProvider` + inline `TEXTS` constant | LIVE |
| `/modules` | `src/pages/Modules.tsx` | `ContentProvider` (modules/lessons) | LIVE (often EMPTY — no published modules) |
| `/modules/:moduleSlug/:lessonSlug` | `src/pages/LessonDetail.tsx` | `ContentProvider` | LIVE (depends on modules being seeded) |
| `/practise` | `src/pages/Practise.tsx` | Inline `MODELS`, `ASSESSMENT_OBJECTIVES` | MOCK (no preview badge) |
| `/revise` | `src/pages/Revise.tsx` | Inline glossary array | MOCK (no preview badge) |
| `/compare` | `src/pages/Compare.tsx` | `ContentProvider.comparative_matrix` | LIVE |
| `/admin` | `src/pages/DataManager.tsx` (admin-only) | Supabase | LIVE |
| `*` | `src/pages/NotFound.tsx` | — | LIVE |

### Routes with no nav link (orphan-from-UI)
- `/build` (only as redirect)
- `/dashboard` (only as redirect)
- `/login` (only as redirect)
- `/paragraph-builder` — never linked from nav, only via `?quotePairId=` query
- `/drill`, `/architecture`, `/routes`, `/flex`, `/session`, `/learn`, `/practise`, `/revise`, `/compare` — none of these appear in `buildLinks` or `exploreLinks` in `AppShell.tsx`. All are reachable only by typed URL.
- `/modules/:moduleSlug/:lessonSlug` — only reachable from `/modules` listing.

### Nav links pointing to undefined routes
- None. Every `to=` in `AppShell.tsx` (`/`, `/library`, `/builder`, `/paragraph-engine`, `/timed`, `/toolkit`, `/theme-wheel`, `/matrix`, `/library/*`, `/modules`, `/admin`, `/auth`) resolves to a registered `<Route>`.

### Page files NOT registered in router
- `src/pages/Index.tsx` (7-line stub linking to `/`) — never imported.
- `src/pages/ThesisRouteDetailPage.tsx` — fully implemented, queries `thesis_routes` by `routeCode`, but never imported in `App.tsx`. Dead route.

---

## SECTION 2 — SUPABASE SCHEMA AUDIT

51 base tables + 2 views in `public`. **All 51 base tables have `relrowsecurity = true`.**

### Tables flagged: RLS enabled but NO policies — **NONE**
Every table that returned rows from `pg_class.relrowsecurity = true` also has at least one matching `pg_policies` row. Specifically reviewed tables (and their commands present):

- `ao5_tensions`: SELECT/INSERT/UPDATE/DELETE — ok
- `character_cards`: SELECT/INSERT/UPDATE/DELETE — ok
- `comparative_matrix`: SELECT/INSERT/UPDATE/DELETE — ok
- `drama_scene_*` (8 tables) and `drama_scenes`: **SELECT only** (no INSERT/UPDATE/DELETE) — read-only by design but worth confirming admin writes happen via service role.
- `essay_plans`: SELECT/INSERT/UPDATE/DELETE — ok (per-user)
- `exam_questions`, `glossary_terms`, `paragraph_templates`, `quote_pairs`, `thesis_routes`: SELECT + ALL — ok
- `import_logs`: SELECT/INSERT only (no UPDATE/DELETE) — likely intentional.
- `lesson_progress`, `lessons`, `modules`, `resources`, `routes`, `theses`, `theme_maps`, `symbol_entries`, `paragraph_jobs`, `paragraph_stems`, `questions`, `quote_methods`: full CRUD — ok
- `library_*` (5 tables): SELECT/INSERT/UPDATE/DELETE — ok
- `paragraph_attempt_quote_links`: only SELECT/INSERT (no UPDATE/DELETE) — flag below.
- `paragraph_attempts`: SELECT/INSERT/UPDATE only (no DELETE) — flag below.
- `profiles`: SELECT/INSERT/UPDATE only (no DELETE) — fine.
- `quotes`: only `anon SELECT` — **flag: no INSERT/UPDATE/DELETE policy at all.** Only readable by anon.
- `reflection_entries`, `saved_essay_plans`, `timed_sessions`: ALL (owner) — ok
- `retrieval_items`, `retrieval_responses`: ALL (owner) — ok
- `retrieval_sessions`: SELECT/INSERT/UPDATE only (no DELETE) — flag below.
- `routes`: SELECT/INSERT/UPDATE/DELETE — ok
- `saved_views`: full CRUD — ok
- `staged_changes`: full CRUD — ok
- `student_quote_pair_mastery`: SELECT/INSERT/UPDATE only (no DELETE) — flag below.
- `user_roles`: ALL (admin) + SELECT (own) — ok

### Tables missing RLS entirely
**None.** Every public.r relation has `relrowsecurity = true`.

### Compact schema blocks per table (column:type, `?` = nullable)

```
ao5_tensions(9):  id:text, focus:text, dominant_reading:text, alternative_reading:text, safe_stem:text, best_use:ARRAY, level_tag:text, created_at:timestamptz, updated_at:timestamptz
character_cards(12):  id:text, source_text:text, name:text, one_line:text, themes:ARRAY, core_function:text?, complication:text?, structural_role:text?, comparative_link:text?, common_misreading:text?, created_at:timestamptz, updated_at:timestamptz
comparative_matrix(11):  id:text, axis:text, hard_times:text, atonement:text, divergence:text, themes:ARRAY, created_at:timestamptz, updated_at:timestamptz, level_band:text?, is_active:boolean, sort_order:integer?
drama_scene_ao1_arguments(2):  scene_id:text, argument:text
drama_scene_ao2_methods(3):  scene_id:text, method:text, effect:text?
drama_scene_ao3_context(6):  id:text, scene_id:text?, context_point:text, context_type:text?, exam_use:text?, sort_order:integer?
drama_scene_ao4_connections(5):  id:text, scene_id:text?, linked_scene_act_scene:text?, comparison_point:text, sort_order:integer?
drama_scene_ao5_readings(5):  id:text, scene_id:text?, lens:text?, interpretation:text, sort_order:integer?
drama_scene_characters(5):  scene_id:text, character_name:text, play:text, function_in_scene:text?, is_present:boolean?
drama_scene_essay_uses(2):  scene_id:text, essay_use:text
drama_scene_themes(3):  scene_id:text, theme_family:text, strength:text?
drama_scenes(15):  id:text, play:text, act:int, scene:int, act_scene:text, scene_title:text, scene_summary:text?, dramatic_function:text?, revision_priority:text?, exam_value:int?, best_paragraph_position:text?, is_active:bool?, sort_order:int?, created_at?, updated_at?
essay_plans(17):  id:uuid, user_id:uuid, client_plan_id:text?, question_id:text?, family:text?, route_id:text?, thesis_level:text, thesis_id:text?, selected_quote_ids:jsonb, ao5_enabled:bool, selected_ao5_ids:jsonb, notes:text?, paragraph_cards:jsonb, builder_handoffs:jsonb, created_at, updated_at, is_current:bool
exam_questions(10):  id:uuid, question_text:text, question_family:text?, exam_year:int?, paper:text?, component:text?, source_text:text?, published:bool, created_at, updated_at
glossary_terms(9):  id:text, term:text, definition:text, source_text:text?, category:text?, level_tag:text?, created_at, updated_at, is_active:bool
import_logs(10):  id:uuid, dataset:text, filename:text?, inserted_count:int, updated_count:int, skipped_count:int, error_count:int, errors:jsonb?, imported_by:uuid?, created_at
lesson_progress(9):  id:uuid, user_id:uuid, lesson_id:uuid, status:text, progress_pct:int, last_viewed_at, completed_at?, created_at, updated_at
lessons(10):  id:uuid, module_id:uuid, slug:text, title:text, body:text?, position:int, estimated_minutes:int?, published:bool, created_at, updated_at
library_comparative_pairings(25):  id:uuid, pairing_title:text?, source_text:text?, text_a:text, text_b:text, quote_a:text?, quote_b:text?, comparison_focus:text, theme_tags:ARRAY, method_links:ARRAY, context_links:ARRAY, ao_tags:ARRAY, argument_summary:text?, exam_use:text?, notes:text?, metadata:jsonb, content_hash:text?, source_dataset:text?, source_sheet:text?, source_row_number:int?, import_log_id:uuid?, created_by:uuid?, updated_by:uuid?, created_at, updated_at
library_context_bank(20):  similar audit-track shape (context_point, theme_tags, ao_tags, exam_use, metadata, source_*, audit cols)
library_paragraph_frames(25):  frame_text + opening_stem/comparison_stem/ao2_stem/ao3_stem/ao4_stem/ao5_stem + tags + audit cols
library_questions(26):  question_text, paper, section, source_text, paired_text, *_tags, mark_value, difficulty_level, exam_series, question_type, audit cols
library_quotes(28):  quote_text, source_text, author, character_name, speaker, chapter, part, location_ref, *_tags, difficulty_level, exam_relevance, analysis, audit cols
library_thesis_bank(20):  thesis_text, question_focus, source_text, paired_text, *_tags, grade_band, argument_type, audit cols
modules(8):  id:uuid, slug:text, title:text, summary:text?, position:int, published:bool, created_at, updated_at
paragraph_attempt_quote_links(5):  id:uuid, paragraph_attempt_id:uuid, quote_pair_id:uuid, role:text, created_at
paragraph_attempts(25):  id:uuid, student_id:uuid, exam_question_id:uuid?, thesis_route_id:uuid?, quote_pair_id:uuid?, paragraph_template_id:uuid?, paragraph_position:int?, paragraph_function:text?, draft_status:text, topic_sentence:text?, hard_times_analysis:text?, atonement_analysis:text?, ao4_comparison:text?, ao3_context_integration:text?, ao5_evaluation:text?, final_paragraph:text?, ao{1..5}_self_score:int?, feedback_summary:text?, improvement_target:text?, created_at, updated_at
paragraph_jobs(10):  id:text, question_family:text, route_id:text, job_title:text, text1_prompt:text, text2_prompt:text, divergence_prompt:text, judgement_prompt:text, created_at, updated_at
paragraph_stems(14):  id:text, stem_text:text, function:text, ao:ARRAY, source_text:text?, best_themes:ARRAY, level_band:text, is_active:bool, sort_order:int, curation_status:text?, created_at, updated_at, text_focus:text?, example_use:text?
paragraph_templates(8):  id:uuid, template_name:text, template_body:text?, paragraph_function:text?, grade_level:text?, published:bool, created_at, updated_at
profiles(8):  id:uuid, user_id:uuid, display_name?, avatar_url?, school_year?, bio?, created_at, updated_at
questions(10):  id:text, family:text, stem:text, primary_route_id:text, secondary_route_id:text, likely_core_methods:ARRAY, level_tag:text, created_at, updated_at, is_active:bool
quote_methods(32):  id:text, source_text:text, quote_text:text, method:text, best_themes:ARRAY, effect_prompt:text, meaning_prompt:text, level_tag:text, …+ 24 enrichment cols incl. b_mode_rank, ao_priority, retrieval_priority, etc.
quote_pairs(23):  id:uuid, quote_pair_code:text, theme_label:text, hard_times_quote:text, atonement_quote:text, locations, methods, key_word_image_focus, effect_on_meaning, structural_function, ao3_*, ao4_comparison_type, how_they_compare, why_useful_in_essay, student_action, ao5_tension, created_at, updated_at
quotes(13):  id:uuid, text:text, attribution:text, location:text?, source:text, word_analysis:text?, a_star_insight:text?, anchor_id:text?, paired_anchor_id:text?, is_verified:bool, ao_tags:ARRAY, theme_tags:ARRAY, created_at
reflection_entries(8):  id:uuid, user_id?, device_id?, session_id:uuid, checklist:jsonb, first_failure_point:text?, created_at, updated_at
resources(11):  id:uuid, module_id?, lesson_id?, title, description?, url?, resource_type:text, position:int, published:bool, created_at, updated_at
retrieval_items(13):  id:uuid, user_id, item_type, item_id, ease_factor:numeric, interval_days:int, repetitions:int, next_review_at, last_reviewed_at?, total_reviews, correct_reviews, created_at, updated_at
retrieval_responses(13):  id:uuid, session_id, user_id?, retrieval_item_id?, item_type, item_id, quality:int, recalled_correctly:bool, response_time_ms?, new_ease_factor?, new_interval_days?, new_repetitions?, created_at
retrieval_sessions(12):  id:uuid, user_id?, device_id?, session_type:text, total_items:int, correct_items:int, duration_seconds?, completed:bool, started_at, ended_at?, created_at, updated_at
routes(10):  id:text, name:text, core_question:text, hard_times_emphasis:text, atonement_emphasis:text, comparative_insight:text, best_use:text, level_tag:text, created_at, updated_at
saved_essay_plans(16):  id:uuid, user_id?, device_id?, title?, question_id?, route_id?, family?, thesis_level?, thesis_id?, paragraph_job_ids:ARRAY, selected_quote_ids:ARRAY, selected_ao5_ids:ARRAY, ao5_enabled:bool, created_at, updated_at, paragraph_cards:jsonb
saved_views(10):  id:uuid, user_id, name:text, dataset:text, q:text, from:text, to:text, is_default:bool, created_at, updated_at
staged_changes(29):  id:uuid, proposal_type:text, target_table:text, target_record_id:text, changed_fields:ARRAY, original_snapshot:jsonb, proposed_patch:jsonb, source_*, note?, status:text, apply_error:text?, proposed_by/at, reviewed_by/at, created_at, updated_at, operation:text, normalized_payload, source_payload, validation_status, validation_errors, applied_at?, source_row_number?, import_log_id?, content_hash?, dedupe_key?
student_quote_pair_mastery(17):  id:uuid, student_id, quote_pair_id, mastery_status:text, confidence_score:int?, last_practised_at?, used_in_*_count:int, ao{2..5}_secure:bool, needs_review:bool, next_action?, created_at, updated_at
symbol_entries(7):  id:text, source_text, name, one_line, themes:ARRAY, created_at, updated_at
theme_maps(5):  id:text, family:text, one_line:text, created_at, updated_at
theses(10):  id:text, route_id:text, theme_family:text, level:text, thesis_text:text, paragraph_job_1_label:text, paragraph_job_2_label:text, paragraph_job_3_label:text?, created_at, updated_at
thesis_routes(20):  id:uuid, route_code:text, theme_id?, theme_label?, route_title:text, exam_question_family?, grade_level?, core_argument?, thesis_sentence?, conceptual_upgrade?, ao3_context_frame?, ao5_tension?, paragraph_sequence:jsonb?, recommended_quote_pairs:ARRAY?, common_risk?, examiner_value?, route_status?, published:bool, created_at, updated_at
timed_sessions(14):  id:uuid, user_id?, device_id?, plan_id:uuid?, mode_id:text, duration_minutes:int, response_text:text, word_count:int, completed:bool, expired:bool, started_at, ended_at?, created_at, updated_at
user_roles(4):  id:uuid, user_id:uuid, role:USER-DEFINED enum, created_at
```

### Views (read-only; no RLS row in pg_class with relkind='r')
```
v_student_quote_pair_progress  (joins student_quote_pair_mastery + quote_pairs)
v_student_recent_paragraphs    (paragraph_attempts + quote_pairs join)
retrieval_due_today            (retrieval_items + items)
```

### Schema flags / risks
1. **`quotes` table:** only an `anon SELECT` policy. INSERT/UPDATE/DELETE blocked for everyone via API — admin edits must rely on service role keys. Worth confirming this is intentional vs. an oversight (other quote-like tables have authenticated admin writes).
2. **`drama_scene_*` group:** read-only via API (only `SELECT` policy for `authenticated`). Same pattern as above — admin writes must go through SQL or service role.
3. **`paragraph_attempts`, `paragraph_attempt_quote_links`, `student_quote_pair_mastery`:** missing DELETE policies — students can never undo a row. Likely intentional but flag for retention/cleanup story.
4. **`retrieval_sessions`:** no DELETE policy.
5. **Table sprawl:** two parallel data models exist:
   - Tier-1 system: `routes`, `theses`, `questions`, `quote_methods`, `comparative_matrix` (text PKs, used by ContentProvider/builder).
   - Tier-2 "library" system: `library_quotes`, `library_thesis_bank`, `library_questions`, `library_paragraph_frames`, `library_context_bank`, `library_comparative_pairings` (uuid PKs, audit columns).
   The codebase consumes tier-1 in most pages and tier-2 only in `RetrievalDrill`, `ParagraphBuilderPage`, `ReviewQueue`, and tier1 import scripts. Significant duplication of intent. Flag for consolidation roadmap.
6. **Unused tables relative to client code:** `drama_scenes` and the eight `drama_scene_*` children appear in Supabase types but no `src/pages/` or `src/components/` (non-admin) imports them. Possibly back-end-only or future feature. Confirm.
7. **`profiles.id` and `profiles.user_id`:** both uuid, both present — likely `id` is the row id and `user_id` the auth FK; verify uniqueness/FK constraints externally.

---

## SECTION 3 — COMPONENT HEALTH

| File | Mock/Live | Preview badge? | Key issues |
|---|---|---|---|
| `src/components/AppShell.tsx` | LIVE (auth + nav) | n/a | `getAppMode` exported but only used internally — minor; comprehensive nav links exist; many real routes (drill/architecture/routes/flex/practise/revise/learn/compare) absent from nav. |
| `src/components/AoSelfMark.tsx` | MOCK demo | YES ("Preview — Mock Data") | Uses off-token Tailwind classes (`bg-amber-400`, `text-slate-900`, `border-slate-700`, etc.). `console.log` is acceptable per brief but still noted. |
| `src/components/Dashboard.tsx` | MOCK | YES ("Preview — mock data") | All data hardcoded inside the file (`AO_READINESS`, `THEMES`, `QUOTE_PROGRESS`, exam date). No Supabase wiring. |
| `src/components/ComparativeMatrix.tsx` | MOCK | YES | Inline `ROWS: Row[]` array; not wired to `comparative_matrix` table even though that table exists with the right shape. |
| `src/components/ThemeWheel.tsx` | MOCK | YES | Inline `THEMES` array; massive use of off-token Tailwind colours (`text-stone-500`, `bg-stone-900`, `border-amber-500`, `text-amber-700`, etc.) and hardcoded SVG hex fills (`#1c1917`, `#fafaf9`, `#a8a29e`, `#44403c`, `#78716c`, `#e7e5e4`, `#f5f5f4`). Also uses `bg-white`. |
| `src/components/ParagraphEngine.tsx` | LIVE | n/a | Long file (1223 lines); two `style={{ backgroundColor: \`hsl(var(${colorVar}))\` }}` uses are token-derived (acceptable). |
| `src/components/QuotePicker.tsx` | LIVE | n/a | Off-token classes: `bg-amber-100 text-amber-800 border-amber-300`. |
| `src/components/ProtectedRoute.tsx` | LIVE | n/a | Clean. |
| `src/components/NavLink.tsx` | LIVE | n/a | **Component appears to be unused.** No file imports `from "@/components/NavLink"` or `"./NavLink"`; pages import `NavLink` directly from `react-router-dom`. Orphan candidate. |
| `src/components/LocalOnlyNotice.tsx` | LIVE | n/a | Used by EssayBuilder, ParagraphEngine, persistence. |
| `src/pages/Index.tsx` | LIVE stub | n/a | **Not registered in router.** Dead page. |
| `src/pages/Dashboard.tsx` | re-export only | n/a | Single line `export { default } from "../components/Dashboard"`. OK. |
| `src/pages/Auth.tsx` | LIVE | n/a | OK. |
| `src/pages/ForgotPassword.tsx` | LIVE | n/a | Uses `text-green-500` (off-token). |
| `src/pages/ResetPassword.tsx` | LIVE | n/a | Not deeply audited. |
| `src/pages/EssayBuilder.tsx` | LIVE | n/a | Multiple `bg-white` (lines 608, 746). Long file (994 lines). |
| `src/pages/ParagraphEnginePage.tsx` | wrapper only | n/a | OK. |
| `src/pages/ParagraphBuilderPage.tsx` | LIVE | n/a | Uses `border` w/o token, but mostly OK. Not in nav. |
| `src/pages/TimedPractice.tsx` | LIVE | n/a | OK. |
| `src/pages/TimedWrite.tsx` | LIVE | n/a | Heavy use of hardcoded hex/rgba palettes for difficulty bands; off-token classes (`bg-amber-400`, `text-emerald-400`, `text-slate-900`, `text-red-400`); contains `console.log('AoSelfMark submitted', scores)` (line 176). |
| `src/pages/RetrievalToolkit.tsx` | LIVE | n/a | Off-token classes (`border-amber-300 bg-amber-50`, `border-blue-200 bg-blue-50`). |
| `src/pages/RetrievalDrill.tsx` | LIVE | n/a | Heavy off-token palette throughout (emerald/amber/red 400/500). |
| `src/pages/Library.tsx` | LIVE | n/a | Uses `countKey: "characters"` for Context card — content provider must expose a `characters` array. |
| `src/pages/library/Quotes.tsx` | LIVE | n/a | Not deeply audited. |
| `src/pages/library/QuoteBank.tsx` | LIVE | n/a | Uses `useCurrentPlanCloud`. |
| `src/pages/library/Questions.tsx` | LIVE | n/a | OK. |
| `src/pages/library/ThesisParagraph.tsx` | LIVE | n/a | OK. |
| `src/pages/library/Comparison.tsx` | LIVE | n/a | Uses `style={{ borderColor: "hsl(var(--hard-times))" }}` — token-backed, acceptable. |
| `src/pages/library/Context.tsx` | LIVE | n/a | OK. |
| `src/pages/library/Glossary.tsx` | MOCK + LIVE | NO | Hardcoded `GLOSSARY` constant (~14 entries). Should pull from `glossary_terms` table (which exists in Supabase). No preview badge despite being mock. |
| `src/pages/library/ParagraphStems.tsx` | LIVE | n/a | Off-token `border-amber-300/text-amber-700/border-blue-200/text-blue-700/border-green-200/text-green-700/bg-rose-50`. |
| `src/pages/Learn.tsx` | LIVE | n/a | Inline `TEXTS` (text metadata) acceptable; rest from ContentProvider. |
| `src/pages/Modules.tsx` | LIVE | n/a | OK. |
| `src/pages/LessonDetail.tsx` | LIVE | n/a | OK. |
| `src/pages/Practise.tsx` | MOCK | NO | Inline `MODELS` and `ASSESSMENT_OBJECTIVES`. Off-token AO_COLOUR map. **Not in nav.** Should display preview badge or be removed. |
| `src/pages/Revise.tsx` | MOCK | NO | Inline glossary; **not in nav**. Should display preview badge or be removed. |
| `src/pages/Compare.tsx` | LIVE | n/a | Uses `comparative_matrix` from ContentProvider; **not in nav**. |
| `src/pages/ComparisonRoutes.tsx` | LIVE | n/a | Uses many hardcoded hex `#2dd4bf #f59e0b #a78bfa #fb7185 #64748b` and `rgba(...)`; many `style={{ color, background }}` patterns. **Not in nav.** |
| `src/pages/InterpretiveFlex.tsx` | LIVE | n/a | Same hex/rgba palette pattern as ComparisonRoutes; many inline styles. **Not in nav.** |
| `src/pages/TextArchitecture.tsx` | LIVE + MOCK | NO | Uses live data, but `BOOKS_HT/PARTS_AT/LEVEL_META/TEXT_META` are inline mock arrays for structural metadata. Same hardcoded hex palette. **Not in nav.** |
| `src/pages/ThesisRouteDetailPage.tsx` | LIVE | n/a | **Not registered in router.** Dead page. Uses generic `text-muted-foreground` (acceptable). |
| `src/pages/DataManager.tsx` | LIVE | n/a | Admin only. |
| `src/pages/NotFound.tsx` | LIVE | n/a | Uses `text-muted-foreground bg-muted` (token-based). `console.error` on 404 is acceptable diagnostic. |
| `src/components/admin/*` | LIVE | n/a | Tightly coupled to Supabase. Some use `dark:` variants (`text-emerald-600 dark:text-emerald-400`) — off-token. `ImportHistory.tsx` is huge (1600+ lines). |
| `src/components/ui/*` (shadcn) | n/a | n/a | shadcn-generated; standard `bg-black/80` overlays in dialog/sheet/drawer; standard recharts pseudo-selectors with `#ccc/#fff` (acceptable). |

### Console statements found
- `src/components/AoSelfMark.tsx` — none in this scan path; brief noted it as acceptable.
- `src/pages/TimedWrite.tsx:176` — `console.log('AoSelfMark submitted', scores)` — **should be removed for production.**
- `src/pages/NotFound.tsx:8` — `console.error("404 Error: ...")` — acceptable diagnostic.

### Cross-app references checked
- `prose-tutor` paths: **none found.**
- `@tanstack/react-router`: **none found.** App uses `react-router-dom` v6 only.
- `prose-craft-aid` references: not searched in src; harmless if any exist as docs.

### Broken / suspicious imports
- None broken (typecheck passes — see Section 5).
- `src/lib/supabaseClient.ts` is a 2-line shim (`export { supabase } from "@/integrations/supabase/client"`). Comment claims "ProtectedRoute.tsx imports from here" — but `ProtectedRoute.tsx` does **not** import it; nothing imports it. Orphan.

---

## SECTION 4 — DESIGN TOKEN COMPLIANCE

Canonical tokens approved: `bg-paper`, `text-ink`, `text-ink-muted`, `border-rule`, `bg-hard-times`, `bg-atonement`, `text-ao1..text-ao5`, `font-serif`. Plus shadcn `bg-primary/text-primary-foreground/bg-muted/text-muted-foreground/text-background/text-foreground` (which are token-backed via CSS variables in `index.css`).

### Hardcoded hex colour violations
File · line · value

```
src/components/ThemeWheel.tsx:679  #1c1917, #e7e5e4, #f5f5f4
src/components/ThemeWheel.tsx:680  #a8a29e
src/components/ThemeWheel.tsx:694  #fafaf9, #1c1917
src/components/ThemeWheel.tsx:706  #fafaf9
src/components/ThemeWheel.tsx:707  #a8a29e
src/components/ThemeWheel.tsx:715  #44403c
src/components/ThemeWheel.tsx:724  #78716c
src/components/ThemeWheel.tsx:733  #a8a29e
src/pages/ComparisonRoutes.tsx:32-52   #2dd4bf #f59e0b #a78bfa #fb7185 #64748b (color/bg/border literals in tier maps)
src/pages/ComparisonRoutes.tsx:331  #64748b
src/pages/InterpretiveFlex.tsx:35-43   #2dd4bf #f59e0b #a78bfa #fb7185
src/pages/InterpretiveFlex.tsx:407  #f59e0b
src/pages/TimedWrite.tsx:56-58, 147, 525   #2dd4bf #f59e0b #a78bfa #ef4444 #94a3b8
src/pages/TextArchitecture.tsx:43-63   #2dd4bf #f59e0b #a78bfa #fb7185
src/pages/TextArchitecture.tsx:480, 555  #f59e0b
src/index.css:159 (print)        color: #111
src/index.css:196 (print)        background: #fff
src/index.css:198, 237 (print)   border #bbb
src/index.css:218 (print)        color: #000
src/index.css:224 (print)        color: #444
src/index.css:238 (print)        color: #222
```
Print-block hex values in `index.css` are inside `@media print` rules — historically acceptable to bypass theme tokens for printer fidelity, but flag for review.

### rgb / rgba / oklch / hsl literal violations
- `src/pages/ComparisonRoutes.tsx`: many `rgba(45,212,191,…)`, `rgba(245,158,11,…)`, `rgba(167,139,250,…)`, `rgba(251,113,133,…)`, `rgba(100,116,139,…)` literals across LEVEL_META, TIER_META, HT_CLR, AT_CLR, DIV_CLR.
- `src/pages/InterpretiveFlex.tsx`: same `rgba(...)` palette pattern.
- `src/pages/TimedWrite.tsx`: same `rgba(...)` palette pattern.
- `src/pages/TextArchitecture.tsx`: same `rgba(...)` palette pattern; line 479 `'1px solid rgba(245,158,11,0.2)'`.
- `src/index.css`: `hsl(...)` literals are CSS variable definitions — acceptable.
- `src/components/ParagraphEngine.tsx:811, 1085`: `hsl(var(--…))` derived from tokens — **acceptable**.
- `src/pages/library/Comparison.tsx:40, 44`: `hsl(var(--hard-times))`, `hsl(var(--atonement))` — **acceptable**.
- Various admin badge classes use `bg-[hsl(var(--success))]`, `bg-[hsl(var(--warning,38_92%_50%))]` — token-backed (with fallback). Acceptable.

### Off-token Tailwind class violations
File · line · class

```
src/components/AoSelfMark.tsx:146           bg-amber-400 text-slate-900 hover:bg-amber-300
src/components/QuotePicker.tsx:160          bg-amber-100 text-amber-800 border-amber-300
src/components/ThemeWheel.tsx:635-894       text-stone-500/600/700/800/50 bg-stone-900/100/50 border-stone-300/400/700/900 border-amber-500 text-amber-700 bg-white
src/components/ui/{alert-dialog,sheet,drawer,dialog}.tsx  bg-black/80 (overlay; standard shadcn)
src/components/ui/toast.tsx:70              text-red-300/50 hover:text-red-50 ring-red-400 ring-offset-red-600
src/components/admin/ImportHistory.tsx:1093,1119  border-emerald-500/40 text-emerald-600 dark:text-emerald-400; border-amber-500/40 text-amber-600 dark:text-amber-400
src/pages/ComparisonRoutes.tsx:126-127,169,268,367  border-red-500/30 text-red-400 text-amber-400 bg-indigo-500/10 text-indigo-400
src/pages/Practise.tsx:75-78,153-154        border-blue-300 text-blue-700 border-green-300 text-green-700 border-amber-300 text-amber-700 border-purple-300 text-purple-700 border-rose-200 bg-rose-50/40 text-rose-600
src/pages/TimedWrite.tsx:311,328,344,348,379,384,407,411,432,436,450,454,464,479,494,495,504,506,532,533,541,582,583  text-amber-400 bg-amber-400 text-slate-900 text-red-400 border-emerald-400 bg-emerald-400 border-amber-400 bg-amber-400/10 text-emerald-400 text-amber-400 bg-teal-400/10 text-teal-400 bg-slate-400/10 text-slate-400 hover:text-amber-400 border-red-500/30 text-red-400
src/pages/InterpretiveFlex.tsx:131-132,176,220-223,272,310,341,388,390  border-red-500/30 text-red-400 text-amber-400 bg-indigo-500/10 text-indigo-400 bg-slate-500/10 text-slate-400 border-amber-400/60 bg-amber-400/10 text-amber-400 border-amber-400/30 border-amber-400/20 bg-amber-400/05
src/pages/RetrievalDrill.tsx:305,376,387,388,434,442,454,458,462,478,494,495,504,523,524  bg-amber-400 bg-indigo-500/10 text-indigo-400 bg-emerald-500/10 border-emerald-400/60 text-emerald-300 bg-red-500/10 border-red-400/60 text-red-300 hover:border-amber-400/50 hover:text-amber-400 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 bg-amber-500/10 border-amber-500/30 text-amber-400 bg-red-500/10 border-red-500/30 text-red-400 text-emerald-400 text-amber-400 text-red-400 border-red-500/20 text-red-400/70
src/pages/RetrievalToolkit.tsx:331-332      border-amber-300 bg-amber-50 text-amber-700 border-blue-200 bg-blue-50 text-blue-700
src/pages/ForgotPassword.tsx:73             text-green-500
src/pages/TextArchitecture.tsx:154,268,317-318,560,317  text-amber-400 border-red-500/30 text-red-400 bg-teal-500/10 border-teal-400/60 text-teal-400 bg-rose-500/10 border-rose-400/60 text-rose-400 bg-indigo-500/10 text-indigo-400
src/pages/EssayBuilder.tsx:608,746          bg-white print:bg-white   bg-white
src/pages/library/ParagraphStems.tsx:33-40  border-amber-300 text-amber-700 border-blue-200 text-blue-700 border-green-200 text-green-700 bg-rose-50 border-rose-200 text-rose-700
```

### Inline `style={{ color/background/borderColor: ... }}`
Files with widespread off-token inline styles (literal hex/rgba):
- `src/pages/ComparisonRoutes.tsx` lines 204, 223, 231, 240–241, 306, 362, 384, 391, 399, 400.
- `src/pages/InterpretiveFlex.tsx` lines 218, 235, 236, 240, 241, 245, 246, 332, 366, 373, 374, 407, 412, 435, 436, 481, 510, 511.
- `src/pages/TimedWrite.tsx:536`.
- `src/pages/TextArchitecture.tsx` lines 335, 336, 364, 365, 443, 449, 479, 480, 543, 549, 555.
- `src/pages/library/Comparison.tsx` lines 40, 44 use `hsl(var(--hard-times|atonement))` — token-backed, **acceptable**.
- `src/components/ParagraphEngine.tsx:811, 1085` token-backed `hsl(var(--…))` — **acceptable**.

---

## SECTION 5 — TYPESCRIPT HEALTH

Command: `cd /Users/tarwindersaran/Downloads/Projects/prose-prep && npx tsc --noEmit`

Output: **(empty)** — exit code 0.

- Errors: **0**
- Warnings: **0**
- Files affected: **0**

---

## SECTION 6 — DEPENDENCY AUDIT

### `dependencies` (declared in package.json)
@hookform/resolvers, all `@radix-ui/*` (28 packages), @supabase/supabase-js, @tanstack/react-query, @types/papaparse (note: in dependencies, not devDependencies — minor smell), class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, input-otp, lucide-react, next-themes, papaparse, react, react-day-picker, react-dom, react-hook-form, react-markdown, react-resizable-panels, react-router-dom, recharts, sonner, tailwind-merge, tailwindcss-animate, vaul, zod.

### `devDependencies`
@eslint/js, @tailwindcss/typography, @testing-library/jest-dom, @testing-library/react, @types/node, @types/react, @types/react-dom, @vitejs/plugin-react-swc, autoprefixer, eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, jsdom, lovable-tagger, postcss, tailwindcss, typescript, typescript-eslint, vite, dotenv, tsx, vitest.

### Declared but NOT imported anywhere in `src/`
- `dotenv` — used only by `scripts/importQuotes.ts` (not under src/). OK as devDep.
- `tsx` — script runner; OK as devDep.
- `jsdom` — used by vitest config; OK as devDep.
- `@tailwindcss/typography` — declared but not referenced in `tailwind.config.ts` plugins. **Likely orphan** (verify).
- `lovable-tagger` — only used in `vite.config.ts` (`componentTagger()`). OK.
- `tailwindcss-animate` — used as Tailwind plugin in `tailwind.config.ts` (not directly imported in src/). OK.
- `next-themes` — only one src import (sonner toaster wrapper). OK but light usage.
- `vaul` — one import (drawer). OK.
- `react-day-picker` — one import (calendar). OK.
- `recharts` — one import (chart). OK.
- `cmdk` — one import (command palette). OK.
- `input-otp` — one import. OK.
- `react-resizable-panels` — one import. OK.
- `embla-carousel-react` — one import (carousel). OK.
- `react-markdown` — used in LessonDetail. OK.

### Imports in `src/` for packages NOT in package.json
None detected. All external imports resolve to declared deps.

### Duplicate / overlapping functionality
- **Two toast systems shipped:** `sonner` (`@/components/ui/sonner`) and shadcn `useToast` / `toaster` (`@/hooks/use-toast` + `@radix-ui/react-toast` + `@/components/ui/toast`). Both `<Toaster />` and `<Sonner />` are rendered in `App.tsx`. Pick one.
- **Two date libraries de-facto:** `date-fns` is the only direct import (one file), `react-day-picker` brings its own date utilities. Acceptable.
- **Two icon libs candidates?** Only `lucide-react` is used. OK.
- **Two router shapes:** `src/components/NavLink.tsx` is a forwardRef wrapper for react-router-dom's NavLink that no one imports. Removing it would clean up the surface.
- **Two Supabase client paths:** `src/lib/supabaseClient.ts` shim re-exports `@/integrations/supabase/client`; **no one imports the shim.** Likely safe to delete.

### Recognisably outdated / stale
- `react@^18.3.1` and `@types/react@^18.3.23` — fine for Nov 2025; React 19 not adopted (intentional given Vite SWC plugin and existing surface).
- `react-router-dom@^6.30.1` — major v7 not adopted.
- `react-day-picker@^8.10.1` — v9 is current; minor.
- `@types/papaparse` is listed under `dependencies` rather than `devDependencies`. Cosmetic.
- `lovable-tagger` — vendor-specific, only active in dev mode (per vite.config.ts gate); not a risk.

---

## SECTION 7 — NETLIFY & BUILD CONFIG

### `netlify.toml`
```
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```
- Build command + publish dir correct for Vite.
- Node 22 matches `.nvmrc` and `package.json` `engines`.
- No `[[redirects]]` block — but `public/_redirects` provides SPA fallback (`/* /index.html 200`). OK.

### `vite.config.ts`
- `host: "::"`, `port: 8080`. HMR overlay disabled.
- Path alias `@` → `./src` ✓.
- Dedupes react/react-dom + tanstack/query — defensive against duplicate React copies in Lovable previews. Acceptable.
- `lovable-tagger` only loaded in `mode === "development"` — production builds clean.

### `public/_redirects`
```
/* /index.html 200
```
SPA fallback present and correct.

### `public/sw.js`
A `sw.js` file exists in `public/` — but `src/main.tsx` actively **unregisters** any installed service worker. This is intentional cleanup but worth noting (the file still ships and is fetchable; cache headers say `no-cache`). Confirm whether `sw.js` should be deleted from `public/`.

### `VITE_*` env var coverage
Used in `src/`:
- `VITE_SUPABASE_URL` (src/integrations/supabase/client.ts)
- `VITE_SUPABASE_ANON_KEY` (src/integrations/supabase/client.ts)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (deprecated fallback in client.ts)

Present in `.env.local`:
- `VITE_SUPABASE_URL` ✓
- `VITE_SUPABASE_ANON_KEY` ✓
- `VITE_SUPABASE_PUBLISHABLE_KEY` is commented out (deprecated). ✓

Present in `.env` (local default):
- `VITE_SUPABASE_URL` ✓
- `VITE_SUPABASE_ANON_KEY` ✓
- **`SUPABASE_SERVICE_ROLE_KEY`** is present in `.env`. Service-role key is a secret and should not be committed. **CRITICAL: confirm `.env` is git-ignored** and rotate the key if `.env` was ever pushed. (`.gitignore` exists at repo root — verify it covers `.env`.)

---

## SECTION 8 — ORPHAN & DEAD CODE

### `src/` files not imported anywhere AND not router entry points
- `src/pages/Index.tsx` — 7-line placeholder; not in router; not imported.
- `src/pages/ThesisRouteDetailPage.tsx` — fully built page that queries `thesis_routes` by `routeCode`; **not registered** in `App.tsx`. No nav link. Likely intended for `/routes/:routeCode` but never wired up.
- `src/components/NavLink.tsx` — wrapper component; nothing in src imports `from "./NavLink"` or `"@/components/NavLink"` (only the module path `react-router-dom` is used).
- `src/lib/supabaseClient.ts` — 2-line shim claiming to support `ProtectedRoute.tsx`, but `ProtectedRoute.tsx` imports from `@/contexts/AuthContext` instead. Nothing imports the shim.
- `src/data/quotes/ht/.gitkeep`, `src/data/quotes/at/.gitkeep` — empty directories preserved by `.gitkeep` (no actual data files inside).
- `src/integrations/.DS_Store`, `src/components/.DS_Store`, etc. — macOS metadata files committed. Should be `.gitignore`-d.

### Stage1 directory
- **`src/stage1/` exists** with five `.jsx` files (`ThesisBuilder.jsx`, `AxisLibrary.jsx`, `AxisDetail.jsx`, `Dashboard.jsx`, `SplitScreenCompare.jsx`, `AxisLibraryArtifact.jsx`) plus a `sql/` subfolder with `seed_thematic_axis.sql`, `migration_thematic_axis.sql`. **Nothing in src/ imports anything from `src/stage1/`.** Pure historical snapshot. Candidate for archival outside the build path.

### Empty / near-empty files (< 10 lines of meaningful code)
- `src/pages/Index.tsx` (7 lines, dead).
- `src/pages/Dashboard.tsx` (1 line — re-export only; OK because it's the route entry).
- `src/pages/ParagraphEnginePage.tsx` (5 lines — wrapper; OK because it's the route entry).
- `src/main.tsx` (12 lines — entry; OK).
- `src/lib/supabaseClient.ts` (2 lines, dead).
- All `.gitkeep` files.

### Commented-out blocks > 5 lines
None large enough flagged in the surface scan. Files with prominent multi-line `/** … */` doc-comments are documentation, not commented-out code.

### Other dead-ish references
- `LessonDetail`-driven `/modules/:moduleSlug/:lessonSlug` route depends on `modules` table being seeded; `modules` table currently has 0 rows in many environments — page shows empty state but no preview badge.
- `data/quotes/ht/` and `data/quotes/at/` directories are empty placeholders for an import workflow (`scripts/importQuotes.ts`); intentional but worth confirming workflow is still relevant.

---

## PRIORITY ACTIONS

| Priority | Section | Issue | Effort |
|---|---|---|---|
| CRITICAL | 7 | `SUPABASE_SERVICE_ROLE_KEY` is present in `.env`. Confirm `.env` is git-ignored (and rotate the key if it ever entered git history). | XS |
| CRITICAL | 2 | `quotes` table has only `anon SELECT` policy — no INSERT/UPDATE/DELETE policies for any role. Any non-service-role write attempts will silently fail. Confirm intent or add admin policies. | S |
| HIGH | 1, 3 | Real, fully functional pages are unreachable from any nav: `/drill`, `/architecture`, `/routes`, `/flex`, `/session`, `/learn`, `/practise`, `/revise`, `/compare`, `/paragraph-builder`. Add nav entries or remove. | S |
| HIGH | 1, 8 | `ThesisRouteDetailPage.tsx` is fully built but not registered in `App.tsx` (likely intended `/routes/:routeCode`). Either wire it up or delete. | XS |
| HIGH | 3 | `ComparativeMatrix.tsx`, `ThemeWheel.tsx`, and `Dashboard.tsx` are all-mock surfaces wired into routes (`/matrix`, `/theme-wheel`, `/`). The Supabase tables exist (`comparative_matrix`, `theme_maps`, etc.). Replace mocks with live wiring. | M |
| HIGH | 4 | Dozens of off-token Tailwind classes and hardcoded hex/rgba palettes in `TimedWrite`, `RetrievalDrill`, `ComparisonRoutes`, `InterpretiveFlex`, `TextArchitecture`, `Practise`, `library/ParagraphStems`. Migrate to design tokens (or extend tokens to cover semantic states). | L |
| HIGH | 3 | Two toast systems active (`sonner` + shadcn `useToast`). Pick one and remove the other to drop ~3 packages and one provider. | S |
| MEDIUM | 3 | `Practise.tsx` and `Revise.tsx` are mock-content pages with no preview badge AND no nav link. Add badge or remove. | XS |
| MEDIUM | 3 | `library/Glossary.tsx` uses inline 14-entry `GLOSSARY` constant; `glossary_terms` Supabase table exists with the right shape. Wire to live data. | S |
| MEDIUM | 3 | `console.log('AoSelfMark submitted', scores)` left in `TimedWrite.tsx:176`. Remove or gate behind `import.meta.env.DEV`. | XS |
| MEDIUM | 8 | `src/stage1/` (6 jsx + sql) is dead historical code shipping in the source tree. Move outside `src/` or delete. | XS |
| MEDIUM | 8 | Orphan files: `src/pages/Index.tsx`, `src/components/NavLink.tsx`, `src/lib/supabaseClient.ts`. Delete or reuse. | XS |
| MEDIUM | 7 | `public/sw.js` ships but `main.tsx` actively unregisters service workers. Decide PWA stance and either delete `sw.js` or wire registration. | S |
| MEDIUM | 2 | Schema duplication between Tier-1 (`questions/quote_methods/theses`) and Tier-2 (`library_*`) systems. Decide consolidation roadmap. | L |
| LOW | 6 | `@types/papaparse` is in `dependencies`; should be a devDependency. | XS |
| LOW | 8 | macOS `.DS_Store` files committed in `src/`. Add to `.gitignore` and remove from index. | XS |
| LOW | 4 | `EssayBuilder.tsx` has `bg-white print:bg-white` (lines 608, 746). Replace with `bg-paper` token. | XS |
| LOW | 4 | Print-mode hex literals in `index.css` (#111, #fff, #bbb, #000, #444, #222) — review whether print should also use tokens. | S |
| LOW | 6 | Single-use packages (`vaul`, `next-themes`, `react-day-picker`, `recharts`, `embla-carousel-react`, `cmdk`, `input-otp`, `react-resizable-panels`) — confirm those one-call-site UI primitives are actually used by users; otherwise drop the components and packages. | M |
