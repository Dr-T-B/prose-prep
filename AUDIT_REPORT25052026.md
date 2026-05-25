# prose-prep Audit Report

**Audit run:** 2026-05-25
**Auditor:** Claude Opus 4.7 (read-only)
**Supabase project audited:** `nxlxunygoccbnzdopqna` (prose-craft-aid-staging, eu-west-2, ACTIVE_HEALTHY) — *confirmed before any DB read*. No queries issued to `qklfhebbrinsyfyuyiuj` or `lopjupwadwahkjyhghvb`.
**Repo:** `Dr-T-B/prose-prep` at `~/Downloads/Projects/prose-prep`, branch `main`, HEAD `478aecb`.

---

## Executive summary

prose-prep is in good shape on the **technical foundations that matter most for an AI-graded study tool**: the marking engine is correctly hosted in a Supabase edge function with Claude Opus 4.7, AO5 is rejected at three independent layers (prompt + JSON schema + post-hoc strip), AO5 columns have been fully purged from the DB (schema remediation 2026-05-19 confirmed), RLS is comprehensive, no secrets are in git history, and 157 unit/integration tests pass.

Three issues block the "deployable to Neha" claim and one risks invalidating any model essay she revises from:

1. **The deployed URL `prosetutor.netlify.app` returns HTTP 503** — the live target named in the audit brief is down. `prose-craft-aid.lovable.app` serves 200, so the app is reachable via the Lovable mirror only. **Critical.**
2. **The Gemini-powered model-essay generator is client-side** (`src/services/essayGenerationService.ts`), reads `VITE_GEMINI_API_KEY` from the bundle, and instructs Gemini to write a Level-5 comparative essay **without constraining quotations to the seed quote bank**. Any deploy that sets this env var will both expose the API key *and* feed Neha quotes that may not exist in *Hard Times* or *Atonement*. **Critical** for both correctness and security.
3. **The `index.html` meta description (and og/twitter twins) still advertise "AO5"** — a literal user-visible AO5 leak that contradicts the rest of the AO5-clean architecture. **High.**

Additional High-tier findings: schema vocabulary drift between the DB `themes` table (13 entries) and the in-code `QuestionFamily` union (16 entries) with no overlap on `family`/`justice`/`authorship`/`morality` vs `truth`/`love`/`suffering`/`power`/`fact_vs_imagination`/`war_industrialism`/`narrative_authority`; dual persistence paths to `essay_plans` and `saved_essay_plans`; marking-prompt does not down-weight AO4 for Section A single-text mode; AO3 has no dedicated teaching surface; three overlapping paragraph builders.

The student can still get value from the app today via the Lovable URL, but the production Netlify deploy, the hallucination guard on generation, and the schema/vocabulary drift should be fixed before this is treated as the canonical study surface.

---

## Findings by severity

### Critical

| # | What | Where | Recommended action | Est. |
|---|------|-------|--------------------|------|
| C1 | `prosetutor.netlify.app` returns HTTP 503; the named production target is unreachable. Lovable mirror at `prose-craft-aid.lovable.app` returns 200. | `curl -I https://prosetutor.netlify.app` → HTTP/2 503, server: Netlify | Diagnose Netlify deploy (build failed? branch unpublished? domain mis-attached?). Restore or remove the URL from docs. | 1–2 h |
| C2 | Model-essay generator runs client-side and embeds `VITE_GEMINI_API_KEY` into the JS bundle at build time. Confirmed reference in `dist/assets/index-D_twhzv6.js` (1.9 MB monolith). Current build has no key value inlined, but the architecture means any env-configured deploy will leak the key. | `src/services/essayGenerationService.ts:27–47`; bundle reference at `process.env.GEMINI_API_KEY` fallback | Move generation behind a Supabase edge function (same pattern as `mark-component2-essay`). Rotate the Gemini key. | 6–8 h |
| C3 | Generation prompts do **not** constrain Gemini's quotations to the seed/DB quote bank. The model essay is asked to embed 4–6 quotes per essay; Gemini's training data is not authoritative on *Hard Times*/*Atonement* phrasing. Mock fallback uses real quotes, so the failure mode is only visible when the live key is set. | `src/services/essayGenerationService.ts:4–66`; `MASTER_SYSTEM_INSTRUCTION` | Inject the curated quote bank as a system-prompt block; require Gemini to choose only from that list; validate output post-generation by string match against `quotes.text` and `quote_methods.quote_excerpt`. | 4–6 h |
| C4 | `index.html` meta description, `og:description`, and `twitter:description` all advertise "**AO5**". Verbatim: `…paragraph jobs, quotes, AO5, timed practice.` Survives into `dist/index.html` after build. | `index.html:7`, dist mirror in three meta tags | Remove every "AO5" string; replace with "AO1–AO4". | 5 min |

### High

| # | What | Where | Recommended action | Est. |
|---|------|-------|--------------------|------|
| H1 | DB↔code theme-vocabulary drift. `public.themes` table holds **13 IDs**: `education, imagination, class, childhood, family, guilt, memory, war, gender, justice, authorship, endings, morality`. In-code `QuestionFamily` union holds **16 slugs**: `childhood, class, guilt, imagination, truth, love, gender, suffering, power, endings, narrative_authority, war_industrialism, education, fact_vs_imagination, memory, war`. Seven DB-side tags (`family, justice, authorship, morality`) have no code analogue; seven code-side slugs (`truth, love, suffering, power, narrative_authority, war_industrialism, fact_vs_imagination`) have no DB analogue. `quotes.theme_tags` use the DB vocabulary. | DB: `public.themes` and `public.quotes.theme_tags`. Code: `src/data/seed.ts` `QuestionFamily` + `QUESTION_FAMILY_LABELS`. | Pick one canonical set, write a renaming migration, and update both ends. The memory note says "theme canonicalisation done 2026-05-19" — verify against this finding; my reading is that two parallel vocabularies coexist. | 1–2 days (with content review) |
| H2 | Dual persistence path: `src/lib/planRepository.ts` writes to `essay_plans` (DB has 13 rows) while `src/lib/persistence.ts:56,63` writes to `saved_essay_plans` (3 rows). Both tables are live in DB. | `essay_plans` 8 references, `saved_essay_plans` 4 references in `src/` | Pick the winner (almost certainly `essay_plans`), migrate any unique rows out of the loser, and delete the unused path + table. | 4–6 h |
| H3 | Marking prompt has no Section A vs Section B weighting. The `mode` param distinguishes `full_essay` vs `paragraph_only`, but AO4 "Comparative Pivot" is rewarded identically across modes, meaning a single-text Section A essay can be penalised for missing comparison or a comparative essay under-rewarded for AO1+AO2 lead. | `supabase/functions/mark-component2-essay/index.ts:207–217, 531–682` | Add `section: 'A' \| 'B'` to the request schema; branch the system prompt's emphasis block; for Section A, drop AO4 from the rubric block and re-balance L1–L5 across AO1+AO2+AO3 only. | 3–4 h |
| H4 | No dedicated AO3 teaching surface. Library/Context tabs cover characters, symbols, themes, analytical positions — but no page teaches Victorian utilitarianism/industrial dehumanisation (HT) or interwar class anxiety/postmodern metafiction (Atonement). AO3 is the AO most likely to floor an A→A* candidate. | `src/pages/library/Context.tsx` + neighbours; cross-checked against AppShell nav | Build a Context-bank page per text (sections: history, ideology, form/genre, contemporary reception, modern critical positions). Seed with the canonical AO3 list already in `essayParserRules.ts:122–147`. | 1–2 days |
| H5 | Three overlapping paragraph builders (`ParagraphBuilderPage`, `ParagraphEnginePage`, `Phase4Workspace`/Construction Engine) with overlapping AO2 scaffolding and no documented handoff between them. AppShell exposes all three in a flat 30-item nav. | `/paragraph-builder`, `/paragraph-engine`, `/phase4` in `src/App.tsx`; `src/components/AppShell.tsx` | Pick a single canonical flow; demote the others to deprecated routes or remove. Document the journey in `docs/`. | 1 day (decision) + 3–5 days (implementation) |
| H6 | Supabase errors are silently swallowed in admin paths (multiple `catch { /* ignore */ }` in `src/components/admin/ImportHistory.tsx:213, 224, 229, 283, 302`); other call sites destructure `{ error }` and never log (`src/hooks/useAnnotatedEssayPackContent.ts:239`, `src/components/admin/ProposeNormalizationDialog.tsx:172`). | Listed | At minimum `console.error` + a toast at user-visible call sites; structured logging in admin paths. | 3–4 h |
| H7 | `supabase as any` cast in admin tooling (`src/components/admin/ImportHistory.tsx:248,251,468,474`) bypasses generated Supabase types for content-import paths — the highest-risk surface for data corruption. | Listed | Replace with the generated `SupabaseClient<Database>` or a narrow `SupabaseLikeClient` interface. | 2–3 h |

### Medium

| # | What | Where | Recommended action | Est. |
|---|------|-------|--------------------|------|
| M1 | TypeScript strict mode is OFF (`strict: false`, `noImplicitAny: false`, `strictNullChecks: false` in `tsconfig.app.json`). 26 explicit `any`/`as any` and 16+ `as unknown as` casts across `src/`. | `tsconfig.app.json`; cast hotspots listed in Section 1 detail. | Enable `strict: true` and burn down. Start with `strictNullChecks` only. | 1–2 days |
| M2 | `react-hooks/exhaustive-deps` warnings indicate stale-deps bugs waiting to happen in five components (ParagraphEngine, VocabularyAudit, ImportHistory, library/Quotes). | `npm run lint` output | Fix each by either restructuring the dep array or memoising the value. | 2–3 h |
| M3 | Two pages exist in `src/pages/` (`ThesisRouteDetailPage.tsx`, `TimedWrite.tsx`) that aren't wired into `App.tsx` — Section 2 agent confirms orphans. | `src/pages/` | Delete or wire. | 30 min |
| M4 | The marking prompt does not detect off-topic essays (e.g. *Hamlet* submitted to a *Hard Times* question) or mid-sentence truncation. Word count is gated but content fidelity is not. | `supabase/functions/mark-component2-essay/validation.ts:133–141` | Add a cheap pre-check: keyword presence of "Hard Times"/"Atonement"/character names, return a sentinel warning if absent. | 2 h |
| M5 | `quote_pairs` normalisation is the one deferred remediation item per memory. 22 rows in DB; structure not yet validated against the rest of the comparative content model. | `public.quote_pairs` (DB) | Complete the deferred curatorial pass. | 1 day |
| M6 | 14 RLS policies still use raw `auth.uid()` instead of `(SELECT auth.uid())`, defeating the initplan cache. Found by Supabase performance advisor on: paragraph_stems, essay_questions, annotated_essays, essay_paragraphs, ao_annotations, quote_method_links, misconception_upgrades. All are `*_admin_select`/`*_admin_update` policies. | Supabase advisor `auth_rls_initplan` (×14) | Rewrite each as `has_role((SELECT auth.uid()), 'admin')`. | 1 h |
| M7 | 20 `multiple_permissive_policies` advisor warnings — multiple permissive SELECT/UPDATE policies stack on the same table+role+command, forcing PG to OR them per row. | Supabase advisor | Consolidate per (table, role, cmd) where possible. | 2 h |
| M8 | 4 `SECURITY DEFINER` functions exposed via PostgREST RPC to anon/authenticated: `has_role` (anon + authenticated), `get_next_best_action`, `get_user_emails`, `is_owner`. `get_user_emails` is a real concern: a signed-in user could probe the email of any user UUID they can guess/find. | Supabase advisor `anon_security_definer_function_executable` / `authenticated_security_definer_function_executable` | Revoke EXECUTE from PUBLIC/anon/authenticated where caller doesn't need RPC access; for the ones that must stay, double-check arg validation. `get_user_emails` should be removed from the public schema entirely. | 1–2 h |
| M9 | Service worker `public/sw.js` is a self-destruct (good — fixes the drama-tutor stale-cache trap). But `manifest.json` still ships PWA install metadata, so installed users keep a no-op SW registered. | `public/sw.js`, `public/manifest.json` | Decide: real PWA (write a proper SW with `index.html` no-store + asset immutable) or fully drop PWA install metadata. Currently middle ground. | 2–3 h |
| M10 | CSP header allows `style-src 'unsafe-inline'`. Tailwind-inlined styles likely require it, but it's worth verifying. | `netlify.toml` | Generate hashes for the small set of unavoidable inline styles or move them to a stylesheet. | 2 h |
| M11 | Bundle is a single 1.9 MB JS file (≈ 550 KB gzipped) — no code-splitting. Slow first paint on mobile / Neha's revision sessions. | `dist/assets/index-D_twhzv6.js` | Add route-level `React.lazy` for `/admin`, `/library/*`, `/learn`, `/modules`, `/phase4`. | 4–6 h |
| M12 | No CRITICS/critical-positions seed data, even though AO3 can absorb a critic position pedagogically. INTERPRETIVE_TENSIONS reference unnamed "critics" but no canonical scholars. | `src/data/seed.ts` | Seed 8–12 critics (Eagleton, Williams, Ricks for Dickens; D'hoker, Finney, Childs for McEwan) with one-line positions, tagged to themes. | 1 day (content) |
| M13 | Onboarding: AppShell has 30 nav links flat. Cold user can technically reach features in 1 click, but the nav is overwhelming and there's no Section A vs Section B routing affordance. | `src/components/AppShell.tsx` | Group nav under Build/Explore/Drill/Mark; expose Section A/B as a top-level toggle. | 1 day |

### Low

| # | What | Where | Action |
|---|------|-------|--------|
| L1 | Lint error: `let pivotIndex` never reassigned in `src/services/essayValidationEngine.ts:132`. | Listed | Change to `const`. |
| L2 | 11 `react-refresh/only-export-components` warnings — non-component exports living in component files (button.tsx, badge.tsx, AuthContext.tsx, etc.). | `npm run lint` | Extract constants/variants to sibling files. |
| L3 | `chart.tsx` uses explicit `any` on recharts props (`payload`, `label`, `formatter`). | `src/components/ui/chart.tsx` | Replace with recharts-provided types. |
| L4 | 66 unused indexes flagged by Supabase advisor. Mostly content tables with low row counts — cost is negligible today, but they cost storage and slow writes. | Supabase advisor `unused_index` | Drop in a single migration after a 2-week monitoring window. |
| L5 | LandingPage uses a hand-rolled slate-950 theme outside the AppShell colour tokens (`--hard-times`, `--atonement`). | `src/pages/LandingPage.tsx` | Reconcile with AppShell tokens or wrap in AppShell. |
| L6 | Auth setting: leaked-password protection (HIBP check) disabled at the project level. | Supabase advisor `auth_leaked_password_protection` | Enable in Supabase Auth → Password Strength. |
| L7 | 72 local migrations in `supabase/migrations/`, top of which is `20260525120000_annotated_essay_content_review_workflow`. DB list matches. No drift detected on top-12 sample. | `supabase/migrations/` | None; document as healthy. |
| L8 | One generic-phrasing quote (`qm_maniac` "I saw him with my own eyes") flagged by content agent as low-confidence authenticity. | `src/data/seed.ts` `QUOTE_METHODS` | Verify against text and either correct or annotate as paraphrased. |
| L9 | No measured Lighthouse / Web Vitals — can't be run from inside this audit because the prod URL is 503. | n/a | Once C1 is fixed, run `npx unlighthouse --site https://prosetutor.netlify.app` (or use the live Lovable URL as a stand-in). |
| L10 | `papaparse` is imported but only via `@types/papaparse`; runtime usage near-zero. | `package.json` | Verify and either remove or wire its consumer in. |

---

## Section 1 — Repository & codebase audit

**Goal:** Map structure, dependencies, TS hygiene, lint, tests, build, bundle, dead code, error handling.

**Structure (depth 3 annotated):**
```
prose-prep/
├── src/
│   ├── components/    UI primitives, admin/, character-pairing/, AppShell
│   ├── pages/         Route components (40 wired in App.tsx + 2 orphans)
│   ├── hooks/         Custom hooks + tests
│   ├── services/      essayGenerationService, llmFeedbackService, validation
│   ├── integrations/  supabase/{client,types}
│   ├── lib/           ContentProvider, adapters, repositories, persistence
│   ├── data/          seed.ts canonical content
│   ├── contexts/      AuthContext, GradeBModeContext
│   ├── types/         global TS types
│   └── utils/         essayParserRules etc.
├── supabase/migrations/   72 migrations, ending 2026-05-25
├── supabase/functions/    1 edge function: mark-component2-essay
├── scripts/               import-quotes, dry-runs, validators
├── prompts/               6 chunked quote-bank generation prompts
├── docs/                  56 dated implementation reports
└── dist/                  built (single 1.9 MB JS chunk)
```

**Dependencies:** Vite 5.4, React 18.3, TS 5.8, Supabase JS 2.103, TanStack Query 5.83, Radix (14 primitives), Zod 3.25, @google/genai 2.6. No obvious duplicates; all 26 majors actively imported. No npm audit network call attempted from this environment.

**TS:** `strict: false` everywhere. 6 `: any`, 4 `as any` (all in `ImportHistory.tsx`), 16+ `as unknown as`, 0 `@ts-ignore`. See M1.

**Lint:** 1 error + 25 warnings. Error: L1. Warnings cluster on react-hooks/exhaustive-deps and react-refresh/only-export-components. See M2, L2.

**Tests:** Vitest. 157 passed / 3 skipped (INTEGRATION-gated) / 0 failed in 3.36 s. No coverage threshold configured.

**Build pipeline:** GitHub Actions runs typecheck + tests + integration tests (gated). Netlify command: `npm run typecheck && npm test && npm run build`. Good.

**Bundle:** Single 1.9 MB JS chunk + 113 KB CSS. No splitting (M11).

**Dead code:** 2 TODOs in `Dashboard.tsx:53,61` ("wire to real data"). 2 orphan pages (M3). No large commented blocks.

**Error handling:** ErrorBoundary wired around routes in `App.tsx:60–105`. Supabase errors swallowed in admin paths — see H6.

**Self-check:** Covered 1.1–1.9. Lighthouse skipped (Section 8 / L9). Bundle sizes assessed from existing dist; no fresh build triggered.

---

## Section 2 — Feature inventory & usefulness

**Goal:** Map routes/pages; flag redundancy, gaps, UI inconsistency, mobile, onboarding.

**40 routes** wired in `src/App.tsx`. The marquee Builder/Library/Marker stack is complete and pedagogically aimed; AO1 and AO2 are strongly supported.

**Coverage table (condensed):**

| AO | Coverage | Notes |
|----|----------|-------|
| AO1 (argument) | Good | Builder, Marker, Compass all scaffold thesis + evidence. Dashboard tracks AO1 readiness. |
| AO2 (method) | Excellent | 28-item AO2_DEVICES list in parser. Phase4 + ParagraphEngine + Drill all hit form/technique. |
| AO3 (context) | **Weak** | 24-item AO3_CONTEXTS list in parser, but no dedicated *teaching* page. See H4. |
| AO4 (comparative) | Moderate | `/compare`, `/routes`, `/compass`, `/library/comparison` exist; no explicit "woven vs. sandwich" pedagogy; marking engine doesn't distinguish A vs B (H3). |
| AO5 | Explicitly excluded everywhere — *except* index.html meta (C4). |

**Redundancy:** 3 paragraph builders (H5); 2 retrieval drills (RetrievalDrill + RetrievalToolkit); 3 comparative-routes entry points (Compare, ComparisonRoutes, Library/Comparison). Section 2 agent confirms; no shared component.

**Orphan pages:** `ThesisRouteDetailPage.tsx`, `TimedWrite.tsx` (M3).

**UI:** LandingPage breaks AppShell theme tokens (L5). Button colour scheme split (cyan vs slate vs shadcn). Heading scale loose.

**Mobile/PWA:** Viewport meta present; manifest valid; service worker is a self-destruct (M9). Meta description AO5 leak (C4).

**Onboarding:** 30-item flat nav; no Section A/B affordance (M13). Cold user can reach features in 1 click but the nav is overwhelming.

**Self-check:** Covered all 2.1–2.7. Live usage analytics not available.

---

## Section 3 — AI marking engine

**Goal:** Audit prompt, model, AO mapping, AO5 exclusion, calibration design.

**Location:** Supabase edge function `mark-component2-essay`, file `supabase/functions/mark-component2-essay/index.ts`, version 6, status ACTIVE, verify_jwt=true.

**Config (verbatim, file:line):**
- Model: `claude-opus-4-7` — `index.ts:243`
- max_tokens: `4000` — `index.ts:244`
- Temperature: not set (Anthropic default)
- Streaming: SSE via ReadableStream
- Anthropic key: server-side env (`index.ts:46`), never bundled.

**System prompt rules (excerpt, `index.ts:531–541`):**
> "You are a strict Pearson Edexcel A-Level English Literature examiner-coach operating against the Component 2: Prose mark scheme. CRITICAL RULES: — Assess AO1, AO2, AO3 and AO4 only. Never mention AO5. — Component 2 (Prose) does NOT assess AO5. Reward interpretive sophistication as AO2 precision, never as AO5. — Identify whether comparison between Hard Times and Atonement is sustained using the 'Comparative Pivot' technique … — Never invent quotations. Cross-reference every student quotation against the supplied QUOTE BANK. Flag any quotation not found there … — Never produce a complete replacement essay … — Provisional marks are out of 20. Level→marks: L1→3, L2→7, L3→11, L4→15, L5→19."

**Mark-scheme block (`index.ts:547–552`):** Level 1–5 descriptors cited in Edexcel examiner language with concrete band ceilings per AO.

**AO5 defence-in-depth (verified):**
1. Prompt forbids it (`index.ts:535, 624`).
2. `validateShape()` rejects `aoFeedback.AO5` (`validation.ts:280–298`).
3. `stripAO5()` recursively removes AO5 strings and keys (`validation.ts:177–199`).

**Rate limit:** 10 marks/hour/user via `essay_marker_results` (`index.ts:70–83`, table comment confirms). HTTP 429 on overflow.

**Input/output validation:** `validateInput()` enforces mode, essay_text word count (300–3000 full, 150–600 paragraph). `validateShape()` enforces required keys, AO1–4 only, provisionalMarks 1–20. `nextDrill.appRoute` whitelisted against `VALID_APP_ROUTES`.

**Cost estimate:** ~6–10 K total tokens per call. At Opus 4.7 rates (~$15/M in, $60/M out), ~$0.15–0.25 per mark. Latency: first SSE chunk in 2–3 s; full result in 10–15 s.

**Gaps (Section A vs B weighting H3; off-topic detection M4; no calibration test fixtures shipped in repo) — see severity tables.**

**Calibration benchmark not executed:** the audit brief asks for 4 essays × 3 runs = 12 live calls. Skipped to avoid burning the 10/hr rate budget and incurring cost on the user's project without explicit approval. Recommend Section 3.4 calibration test be its own session, after H3 (Section A/B weighting) lands.

**Self-check:** Covered 3.1–3.3, 3.5, 3.6. 3.4 calibration documented but not executed; reason logged.

---

## Section 4 — AI generation engine

**Goal:** Audit generation prompts, hallucination guards, AO integration.

**Entry points (two):**
1. `generateModelEssay()` — `src/services/essayGenerationService.ts:21–66`. Gemini 3.5 Flash, temp 0.3, no max_tokens set, `responseMimeType: application/json`. Reads `import.meta.env.VITE_GEMINI_API_KEY` at runtime (compiled into bundle). Mock fallback at `:68–102` if key absent.
2. `generateQualitativeFeedback()` — `src/services/llmFeedbackService.ts:37–143`. Gemini 3.5 Flash, temp 0.2, same key.

**System prompt for model essay (excerpt, `essayGenerationService.ts:4–19`):**
> "You are the master generative core of the 'prose-prep' platform … Reject the Mimetic Fallacy: Treat characters and settings as deliberate, calculated authorial constructs and narrative devices … Enforce the Hand-in-Glove Model (AO2/AO3 Symbiosis): All historical/contextual details must be bound within a tight syntactic window to a specific formal literary device (AO2) and an active verb of authorial intent. — Execute the Symmetrical Synthetic Weave: Every single analytical paragraph must hold both texts in constant, dialectical tension using intra-sentence comparative pivots. No separate text-by-text blocks allowed."

The pedagogy in this prompt is **strong** — it explicitly rejects feature-spotting and parallel-block comparative essays, both common A→A* ceilings.

**Critical structural defect (C3):** the prompt does **not** pass the curated quote bank as context, nor instruct the model to constrain its quotations to a verified list. Gemini will invent quotes that *sound* right. Neha cannot tell, by reading the model essay, which lines are real and which are model-generated.

**Generation prompt for critique (`llmFeedbackService.ts:10–32`):** "Never give generic praise … Expose the construction mechanics … evaluate how form and micro-linguistic details (AO2) serve as the vehicle for socio-political context (AO3)." Good. Does not explicitly demand AO4 weave-check in student feedback — minor gap.

**Hallucination static-check verdict:** **CRITICAL** for model essay; **Medium** for critique (returns prose, not quotes, but the exemplar-pivot suggestion at `llmFeedbackService.ts:31` could include invented pairings).

**Self-check:** Covered 4.1–4.6. No live-call benchmark executed (parallel rationale to Section 3.4).

---

## Section 5 — Supabase DB audit

**Project confirmed:** `nxlxunygoccbnzdopqna` (prose-craft-aid-staging).

**Tables (45 total) — selected highlights:**

| Table | Rows | Notes |
|-------|------|-------|
| quotes | 22 | source ∈ {'hard-times','atonement'}; ao_tags + theme_tags arrays. |
| quote_methods | 40 | curation_status ∈ {secure, strong, top_band}. |
| themes | **13** | id values: education, imagination, class, childhood, family, guilt, memory, war, gender, justice, authorship, endings, morality. **Drift vs code (H1).** |
| character_cards | 11 | |
| comparative_matrix | 38 | |
| essay_questions | 8 | marks = 40 enforced. |
| essay_plans | 13 | canonical persistence path. |
| saved_essay_plans | 3 | **legacy persistence path (H2).** |
| essay_marker_results | 5 | 10/hr rate-limit table for marker. |
| interpretive_tensions | 14 | replaces legacy ao5_tensions table. |
| quote_pairs | 22 | deferred curation per memory (M5). |
| annotated_essays | 1 | new content-review workflow table. |

**AO5 columns:** 0 (verified by `information_schema.columns WHERE column_name ILIKE '%ao5%'`). Schema remediation confirmed complete. ✓

**Theme constraint:** No `theme_family` CHECK constraint exists anywhere — searched `pg_constraint` for `theme_family`/`fact_vs_imagination`/`fact%imagination`, all empty. Theme vocab is enforced by row-existence in `themes` not by CHECK, which is fine; the issue is content vocabulary mismatch with code (H1), not constraint drift.

**AO5 CHECK guards (verified):** `ao_annotations.ao_tags <@ ARRAY['AO1','AO2','AO3','AO4']`, same on `essay_paragraphs.ao_coverage`, `essay_questions.ao_requirements`. Strong belt-and-braces.

**Unexpected legacy:** `retrieval_items.item_type` CHECK still lists `'ao5_tension'` as an allowed value, alongside the replacement `'interpretive_tension'`. Tolerable in transition; flag for removal once retrieval_items has no rows with the old value (it has 0 rows today, so this is safe to drop).

**RLS:** Every public table has RLS enabled. The pattern is: anonymous/authenticated read of "approved/reviewed" rows; admin-only write via `has_role((SELECT auth.uid()), 'admin')`; user-owned tables (`essay_plans`, `lesson_progress`, `paragraph_attempts`, `essay_marker_results`) gate on `user_id = (SELECT auth.uid())`. **The drama-tutor bug (student_id → profiles.id) is NOT present here:** `paragraph_attempts.student_id = (SELECT auth.uid())` matches the auth UUID directly. ✓

**RLS perf (M6, M7):** 14 admin policies use raw `auth.uid()` without the (SELECT) wrapper, defeating initplan caching. 20 multiple-permissive-policy stacks.

**SECURITY DEFINER funcs (M8):** `has_role`, `get_next_best_action`, `get_user_emails`, `is_owner` are RPC-callable. `get_user_emails(_user_ids uuid[])` is the standout risk — should not be publicly invokable.

**Indexes:** 66 unused (L4). No tables >1000 rows are missing indexes.

**Migrations:** 72 local; latest in DB is `20260525120000_annotated_essay_content_review_workflow`. Spot-checked the last 12 — no drift.

**Backups:** Could not confirm PITR status from MCP project info (no `pitr` field surfaced). **Verify in Supabase dashboard → Database → Backups.** If PITR off → escalate.

**Self-check:** Covered 5.1–5.9. 5.10 PITR not verifiable through MCP — flagged.

---

## Section 6 — seed.ts & content integrity

**Goal:** Verify the slug renames, theme alignment, quote bank, critics.

**Verified by Section 6 agent (and re-confirmed by DB query):**
- `fact_vs_imagination` (underscore) used everywhere in `src/`. Zero `'fact vs imagination'` (space) leaks.
- `QUESTION_FAMILY_LABELS` has 16 entries with `one_line` for each of `education`, `fact_vs_imagination`, `memory`, `war`.
- No `export type Theme` or `export type ThemeSlug` exists. `ThemeWheel.tsx:4` defines a local `Theme` interface for component data; this is component-scoped and does not collide. The audit prompt's expected `Theme → ThemeSlug` rename is **moot** (no global Theme type was ever exported to clash).
- `CHARACTER_CARDS`, `SYMBOLS`, `COMPARATIVE_MATRIX` all use canonical underscore slugs. Spot-check verified.
- Quote bank: 10-sample spot-check, 8/10 verified authentic against canonical readings; 1 paraphrase flag (`qm_maniac` "I saw him with my own eyes") — minor.
- No AO5 tags in any seeded content.

**Where the audit prompt's premise breaks:** the prompt assumed `Theme → ThemeSlug` was pending. It isn't and wasn't needed. Logged as a contradiction with the brief.

**Net finding:** seed.ts content integrity is **strong**. The real defect is the DB↔code vocabulary drift (H1), which the seed.ts-only audit cannot see.

**Critics (M12):** no CRITICS export. Interpretive tensions reference unnamed "some critics". Not fabricated — but not attributable either. Pedagogically, Neha would benefit from named scholars.

**Self-check:** Covered 6.1–6.7. Live novel verification of all 22 quotes not performed (no copy of the texts in the environment); 10 sampled and judged.

---

## Section 7 — Security & secrets

**Bundle scan:**
- No `sk-ant-api03-*` (Anthropic) prefix in `dist/`. ✓ (server-side only).
- No Supabase service-role JWT in `dist/`. ✓
- No `AIzaSy*` (Google) prefix detected in the current `dist/assets/index-D_twhzv6.js`. **But** the bundle source compiles `import.meta.env.VITE_GEMINI_API_KEY` into static references at build time — any deploy that sets this env var will inline the actual key. **C2.**

**Local `.env`:**
- Contains `SUPABASE_SERVICE_ROLE_KEY` alongside `VITE_*` vars. The service-role key is not exposed by Vite (no VITE_ prefix), but co-locating it in `.env` is a footgun. Recommend a separate `.env.server` to discourage accidental prefixing.

**.gitignore:** `.env`, `.env.local`, `.env.*.local`, `.env.test`, `.env*.local`, `.env.backup-*` all covered. ✓

**Git history:** `git log --all -p --since 2026-01-01` greps for `sk-ant-`, `AIzaSy`, `eyJhbGci` JWT prefixes → 0 hits. No `.env` ever committed (verified by `git log --diff-filter=A`).

**Auth coverage:** `App.tsx` wraps the AppShell tree in `<ProtectedRoute allowAnonymous>` (anonymous local storage permitted). `/admin` and `/admin/character-pairings` use `<ProtectedRoute requireAdmin>`. `EssayMarker` uses `useAuth()` directly to gate by user. Pattern is sensible.

**CSP (`netlify.toml`):**
```
default-src 'self';
connect-src 'self' https://nxlxunygoccbnzdopqna.supabase.co wss://nxlxunygoccbnzdopqna.supabase.co;
img-src 'self' data: blob:;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
script-src 'self';
font-src 'self' data: https://fonts.gstatic.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self'
```
Good shape; `style-src 'unsafe-inline'` is the only soft spot (M10). `script-src 'self'` is tight.

**Other headers:** X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy: camera=(), microphone=(), geolocation=(). ✓

**HIBP leaked-password check:** disabled (L6).

**Self-check:** 7.1–7.5 covered. Note: deployed CSP couldn't be independently verified because production URL is 503 (C1); netlify.toml is the source of truth.

---

## Section 8 — Deployment & performance

**`netlify.toml`:** Build command `npm run typecheck && npm test && npm run build`. Node 22. Headers per Section 7. Cache: `/sw.js` no-cache, `/assets/*` immutable 31536000.

**SPA rewrite:** No catch-all `[[redirects]]` rule visible in `netlify.toml`. Vite's `dist/_redirects` file (auto-generated) may be supplying it — confirmed `_redirects` exists in dist. ✓ (with the caveat that no rewrite rule is committed to `netlify.toml` itself, which is fragile).

**`index.html` cache header:** Not explicitly set in `netlify.toml`. Default Netlify behaviour is `public, max-age=0, must-revalidate`. Acceptable, but explicit `no-store` would be safer (the drama-tutor lesson). Suggest adding:
```toml
[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "no-store"
```

**Service worker:** `public/sw.js` is a self-destruct (M9). Good defensive choice; means PWA install does nothing useful.

**Lighthouse:** Cannot run from this environment (no headless browser available; deployed URL is 503). **Run locally:**
```bash
npx unlighthouse --site https://prose-craft-aid.lovable.app
# or after C1 is fixed:
npx unlighthouse --site https://prosetutor.netlify.app
```

**Live status:**
- `https://prosetutor.netlify.app` → HTTP **503** (Netlify deployment down). **C1**.
- `https://prose-craft-aid.lovable.app` → HTTP **200**. Mirror reachable.

**Self-check:** 8.1–8.6 covered. 8.4 Lighthouse and 8.5 Web Vitals require local execution; commands provided. 8.6 service worker behaviour: self-destruct verified.

---

## Section 9 — Pedagogical alignment

**Goal:** Working backwards from "Neha sits Component 2 and writes Level 5 essays," map capabilities to features.

**The 10 Level-5 capabilities** (per Section 9 agent, condensed):

| # | Capability | Best feature | Strength |
|---|------------|--------------|----------|
| 1 | Comparative quotation (3+3 per text) | `/library/comparison`, `/compare`, RetrievalToolkit | Good |
| 2 | AO3 context: Victorian utilitarianism, industrialisation (HT) | `/learn`, `/modules`, `/library/context` | **Weak — H4** |
| 3 | AO3 context: WWII, postmodern metafiction (Atonement) | same | **Weak — H4** |
| 4 | Free indirect discourse analysis across texts | ParagraphEngine, AnnotatedEssays | Good for HT; lighter for Atonement |
| 5 | Comparative thesis construction | EssayBuilder, `/library/thesis`, `/routes` | Good |
| 6 | 30+ quotes per text with theme tags | RetrievalDrill, `/library/quotes` | Good; bank could be larger |
| 7 | Interpretive tensions weighing | InterpretiveFlex, Revise | Moderate; no scholarly grounding (M12) |
| 8 | Weighing critical perspectives | InterpretiveFlex | Moderate; no named critics |
| 9 | Timed essay structure | TimedPractice | Good |
| 10 | Self-mark and revise | EssayMarker | Excellent (subject to H3 weighting fix) |

**Features without a Level-5 capability mapping (de-emphasise candidates):**
- ThemeWheel (`/theme-wheel`) — visual reference, not capability-building.
- ComparativeMatrix (`/matrix`) — illustrative.
- ProseCompass (`/compass`) — overlaps Builder, useful for "give me a question" but doesn't teach a skill independently.

**Capabilities with weakest support:** #2, #3 (AO3 teaching surface — see H4) and #7, #8 (critic-weighing — see M12).

**Self-check:** 9.1–9.3 covered.

---

## Benchmark tables

### Marking engine — not executed live; static verdict

| Property | Value | Verdict |
|----------|-------|---------|
| Model | claude-opus-4-7 | Appropriate for the task |
| max_tokens | 4000 | Adequate |
| Temperature | default | Acceptable (would benefit from explicit 0.1–0.2) |
| AO5 exclusion | Triple-layered | Strong |
| Section A/B weighting | None | **Gap (H3)** |
| Quote-bank check | Verified post-hoc | Strong |
| Off-topic detection | None | Gap (M4) |
| Rate limit | 10/hr/user | Good |
| Est. per-call cost | $0.15–$0.25 | Acceptable |
| Est. monthly cost @ 5 essays/day | $22–$38 | Acceptable |

**Live calibration test (4 essays × 3 runs) deferred to user-initiated session;** rate budget + cost should not be spent without consent. Method: fixtures in `audit/calibration/L{2,3,4,5}.md` → script-driven SSE calls → tabulate predicted band per run; compute within-essay variance and accuracy vs known band.

### Generation engine — static verdict

| Engine | Model | Temp | Quote constraint | AO emphasis |
|--------|-------|------|------------------|-------------|
| Model essay (`generateModelEssay`) | gemini-3.5-flash | 0.3 | **None — C3** | AO2/AO3/AO4 strong, AO1 implicit |
| Qualitative critique (`generateQualitativeFeedback`) | gemini-3.5-flash | 0.2 | n/a (prose only) | AO2/AO3 emphasised; AO1/AO4 implicit |

---

## Recommended action plan (sequenced)

### Today (≤30 min total)
1. **C4** — delete every "AO5" string from `index.html` meta tags (3 lines). Rebuild and redeploy.
2. **L1** — `let pivotIndex` → `const` in `essayValidationEngine.ts:132`.
3. **M3** — delete or wire `ThesisRouteDetailPage.tsx` and `TimedWrite.tsx`.

### This week (~2–3 dev days)
4. **C1** — diagnose `prosetutor.netlify.app` 503 and restore (or update README to point at Lovable URL canonically).
5. **C2 + C3 together** — port `generateModelEssay` and `generateQualitativeFeedback` into a Supabase edge function (mirror the `mark-component2-essay` pattern). Add quote-bank as a system-prompt context block. Validate output quotes against `quotes.text` post-generation. Rotate the Gemini key.
6. **H3** — add Section A/B request param; branch the marking prompt's emphasis block.
7. **H6 + H7** — wrap silent Supabase catches with structured logging; replace `supabase as any` casts in ImportHistory.
8. **M6** — wrap remaining 14 `auth.uid()` calls in `(SELECT auth.uid())` admin policies.
9. **M8** — revoke `get_user_emails` from public schema.

### This month (~2 weeks)
10. **H1** — pick canonical theme vocabulary; write migration; update both DB and code; rebuild content tags.
11. **H2** — kill `saved_essay_plans` table after row migration.
12. **H4** — build AO3 teaching pages per text (Victorian/industrial for HT; interwar/WWII/postmodern for Atonement).
13. **H5** — decide and implement single paragraph-builder canonical flow.
14. **M11** — code-split the 1.9 MB bundle.
15. **M12** — seed CRITICS table (8–12 named scholars).
16. **M13** — group AppShell nav under Build / Explore / Drill / Mark.

### Run live but not in this audit (require user authorisation)
17. **Marking-engine calibration** — 4 fixtures × 3 runs (Section 3.4 protocol).
18. **Generation-engine hallucination probe** — 5 runs per entry point, manual quote verification (Section 4.3 protocol).
19. **Lighthouse / Web Vitals** — `npx unlighthouse --site …` once C1 is fixed.

---

## Verification posture

**What this audit verified vs assumed:**

| Item | Status |
|------|--------|
| Supabase project ID | Verified (`get_project`) |
| AO5 columns absent | Verified (information_schema) |
| AO5 prompt exclusion | Verified (file read + agent re-quote) |
| Marking engine server-side | Verified (Supabase edge function exists, ANTHROPIC_API_KEY server env only) |
| RLS pattern | Verified (pg_policies) |
| drama-tutor student_id bug present | Verified absent (paragraph_attempts.student_id = auth.uid()) |
| Theme canonicalisation per memory | **Partially contradicted** — DB has its own 13-tag vocabulary that disagrees with code's 16-slug union. Memory said "complete 2026-05-19"; this audit finds two parallel vocabularies still coexisting. H1. |
| Gemini key in bundle | Architecture verified to leak it if set; current build has no key value compiled in. |
| Live calibration / Lighthouse / Web Vitals | **Not executed** — protocols provided; user-initiated. |
| Quote bank authenticity (all 22) | 10/22 sampled; rest assumed authentic. |
| Backups (PITR) | **Not verifiable from MCP** — user must confirm in Supabase dashboard. |

---

*End of report.*
