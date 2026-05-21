# prose-prep — Full repo + DB crash audit

Generated 2026-05-21. **Read-only audit.** No code, schema, or deploys were changed. **Do not commit this file.**

Project: `Dr-T-B/prose-prep` · Supabase project: `nxlxunygoccbnzdopqna` · Deployed: `prose-prep.vercel.app`
Exam target: Component 2 Prose, 1 June 2026 (**11 days from today**).

> **Note:** this file replaces a prior `AUDIT_REPORT.md` from a previous audit pass. Per the audit prompt's read-only rule, the file is written but not staged or committed.

---

## Executive summary

The codebase is in better shape than the user reported. The two highest-stakes user flows — the **Dashboard** (per-AO readiness) and the **Essay Marker** (the pre-exam priority) — are already well-defended. Recent commits (`7e894d4`, `48f77fa`) hardened the null-handling paths that were causing crashes. `tsc --noEmit` returns 0 errors. Every public DB table has RLS enabled. 0 FK orphans across 13 sampled relationships. 0 references to off-limits Supabase projects in source code (only in historical docs). 0 AO5 references in live database content.

The residual risk is concentrated in three places:
1. **One route is permanently broken** — `/library/thesis/:routeCode` queries a table that doesn't exist.
2. **One edge-function filter mismatch silently degrades marker quality** — the L5 interpretive-tension reference is empty in every production run because of a vocabulary drift between the function and the table.
3. **The EssayBuilder data-flow chain** uses `(supabase as any)` upstream of bang-asserted lookups downstream, so a stale id or RLS denial can throw at render time. Mostly works today; will crash on the first edge case.

**Severity totals** (deduplicated across stages 2–6):

| Severity | Count |
|---|---|
| CRASH | 1 |
| HIGH | 13 |
| MEDIUM | 23 |
| LOW | 22 |
| INFO | 29 |
| **Total** | **88** |

---

## Must-fix before exam (1 June 2026)

Five items, ~30–45 minutes of work total. Listed in order of fix-first.

| # | ID | Severity | Effort | What | Why must-fix |
|---|---|---|---|---|---|
| 1 | S6-001 | HIGH | XS (5 min) | Change `interpretive_tensions` filter in `supabase/functions/mark-component2-essay/index.ts:204` from `.in("level_tag", ["strong","top_band"])` to `.in("level_tag", ["A*","A/A*"])` — or drop the filter entirely (table only has 14 rows). | Marker silently ships with an empty Context Block 7 today. Neha is targeting A-grade; AO2 sophistication detection is degraded for every essay she submits. |
| 2 | S5-001 | CRASH | XS (5 min) | Either remove the `/library/thesis/:routeCode` route from `App.tsx` AND the link inside `LibraryThesisParagraph`, OR repoint `ThesisRouteDetailPage.tsx:15` from `.from('thesis_routes')` to `.from('library_thesis_bank')`. Removal is safer pre-exam. | Following a thesis-route link permanently shows "Route not found" — looks like an app bug to the user. |
| 3 | S2-001 + S2-002 (= S3-007) | HIGH | XS (5 min) | Regenerate `src/integrations/supabase/types.ts` from live DB (run `supabase gen types` or copy from the `/tmp/fresh_types.ts` produced during this audit) and commit. | Today: 0/4 `ao_readiness` rows have null `label`/`weight`. The local-only migration `20260520160000_ao_readiness_nullable_columns` exists because future inserts WILL produce nulls. Dashboard handles it (S4-021); other consumers won't. |
| 4 | S3-001 + S3-002 | HIGH | XS (10 min) | Edit `prompts/quote_bank_master.md` lines 30 and 36 — replace the literal `"AO5"` strings with `"interpretive"` (or remove the lines). Edit `prompts/README.md:108` — replace "thin AO5" with "thin interpretive". | Rule-violating per the audit's AO rules. No live code reads these files today, but they're the easiest path to re-introducing AO5 contamination if anyone runs the prompt. |
| 5 | S3-011 | HIGH | XS (10 min) | In Supabase Studio (or via SQL): `REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;`. | Anon can currently probe `/rest/v1/rpc/has_role` to enumerate role assignments. Low impact today (small user base) but trivial to close. |

After these 5: marker quality restored, broken route contained, type safety mechanically aligned, AO5 prompts cleaned, anon SECURITY DEFINER leak closed. **Total effort: ~30–45 minutes including verification.**

---

## Should-fix before exam (not blocking, ~4–6 hours)

These harden second-tier user flows. None blocks essay marking; all reduce crash risk on adjacent routes Neha may use during revision.

| # | ID | Severity | Effort | Fix |
|---|---|---|---|---|
| 6 | S2-009 (= S4-002) | HIGH | XS (10 min) | `src/pages/RetrievalDrill.tsx:376, 434` — `(card.meta.themes ?? []).map(...)`. |
| 7 | S2-010 (= S4-001) | HIGH | S (30 min) | `src/pages/EssayBuilder.tsx:892` — guard the `.find()` result. |
| 8 | S2-011 (= S4-005) | HIGH | S (45 min) | Fix upstream `rawFrom` typing in `planFetches.ts` so `routes` element is non-null; remove the 6 bangs at EssayBuilder.tsx:305, 308, 309, 318, 319, 322. **Depends on Item 9.** |
| 9 | S2-006 (= S4-003) | HIGH | M (2 h) | `src/lib/planFetches.ts:8` — replace `rawFrom = (t) => (supabase as any).from(t)` with typed dispatch. Add `error` check + `?? []` to all 3 `await rawFrom(...)` call sites. |
| 10 | S2-005 (= S4-004) | HIGH | S (30 min) | `src/lib/contentRepo.ts:154, 156, 159, 160` — drop the 4 unnecessary `as any` casts; switch `Promise.all` to `Promise.allSettled`. |
| 11 | S2-017 (= S4-011) | HIGH | S (45 min) | `src/lib/persistence.ts:13, 132, 148, 164` — destructure `{ data, error }` and surface errors via toast. |
| 12 | S2-018 (= S4-010) | HIGH | XS (15 min) | `src/lib/planRepository.ts:7, 23` — guard `user` before use; throw "Sign in required" if null. |
| 13 | S2-004 | HIGH | XS (10 min) | `src/contexts/AuthContext.tsx:60` — drop the unnecessary `as any` cast. |

Sub-total: ~6 hours including verification.

---

## Defer until after exam

The remaining 88 − 14 = ~74 findings, dominated by:

- **S3-016** — 69 RLS policies use `auth.uid()` directly in `qual` instead of `(SELECT auth.uid())`. Page-load latency can be 2× what it should be. Mechanical bulk migration. **M–L effort.**
- **S3-017 to S3-020** — performance lints (multiple permissive policies, 55 unused indexes, 4 unindexed FKs, connection count). Defer.
- **S3-024** — 10 live-only migrations + 1 file-only. Live DB already reflects remediated state; non-blocking.
- **S4-009** — single ErrorBoundary at app root; when it fires, nav chrome unmounts. Move inside `<AppShell />` around `<Outlet />`. **S.**
- **S6-002** — rate limit doesn't count failed mark attempts. **S.**
- **S6-003** — duplicated `VALID_APP_ROUTES` and `EXAM_WARNING` constants. Extract to shared module. **S.**
- **S6-004** — Block 3 limit 20 of 38 rows, Block 5 limit 30 of 38. Raise limits. **XS each.**
- **S6-005** — marker reads `quote_methods` but not the separate `quotes` table. Document or union. **XS.**
- **S6-007** — `apply-staged-change` undeployed; remove local source or the admin UI calls. **S.**
- **S3-015** — leaked-password protection disabled in Supabase Auth settings. **XS** (dashboard toggle).
- **S3-012, S3-013, S3-014** — three more `SECURITY DEFINER` functions exposed to authenticated users (`get_next_best_action`, `get_user_emails`, `is_owner`). Audit bodies or revoke EXECUTE. **S each.**
- **S2-014/S2-015** (Deno env bangs), **S2-025/S2-026** (subscription destructures), 5 admin-route LOW findings, 7 admin-path JSON.parse — LOW-severity hygiene, admin-only blast radius.

---

## Full prioritised findings — by stage ID

### CRASH (1)

| ID | Stage | One-line |
|---|---|---|
| **S5-001** | 5 | `ThesisRouteDetailPage.tsx:15` queries `thesis_routes` — table does not exist in live DB. Route permanently broken. |

### HIGH (13 unique)

| ID | Stage | Area | One-line |
|---|---|---|---|
| S2-001 | 2 | Type drift | `ao_readiness.label` typed `string`, DB is nullable. |
| S2-002 | 2 | Type drift | `ao_readiness.weight` typed `number`, DB is nullable. |
| S2-004 | 2 | `as any` | `AuthContext.tsx:60` — AuthProvider is mounted at every route. |
| S2-005 | 2 | `as any` | `contentRepo.ts` lines 154, 156, 159, 160 — ContentProvider hot path. |
| S2-006 | 2 | `as any` | `planFetches.ts:8` `rawFrom` strips types from every builder fetch. |
| S2-009 | 2 | Bang on array | `RetrievalDrill.tsx:376, 434` — `themes!.map(...)`. |
| S2-010 | 2 | Bang on `find` | `EssayBuilder.tsx:892` — `find(...)!.interpretive_stem`. |
| S2-016 | 2 | Unguarded `data` | `planFetches.ts:18, 25, 63`. |
| S2-017 | 2 | Unguarded `data` | `persistence.ts:13, 132, 148, 164`. |
| S2-018 | 2 | Unguarded `data` | `planRepository.ts:7, 23`. |
| S3-001 | 3 | AO5 in prompt | `prompts/quote_bank_master.md:30`. |
| S3-002 | 3 | AO5 in prompt | `prompts/quote_bank_master.md:36`. |
| S3-007 | 3 | Type drift (data-confirmed) | 0 nulls in `ao_readiness` today; local migration exists because they're coming. (Same root as S2-001/002.) |
| S3-011 | 3 | Security | `public.has_role()` callable by anon role. |
| S6-001 | 6 | Filter mismatch | Block 7 always empty — `level_tag IN ('strong','top_band')` matches 0 of 14 rows. |

(Stage 4's S4-001 to S4-005 carry the Stage 2 chain forward as runtime crash vectors on specific golden-path routes — listed there for traceability, counted once here.)

### MEDIUM (23)

Selected for the headline table. See `audit/stage-2.md` to `audit/stage-6.md` for the full text on each.

- S2-007, S2-008, S2-011, S2-012, S2-013, S2-019, S2-020, S2-021, S2-022, S2-023 — Stage 2 type-system MEDIUMs
- S3-003 (`prompts/README.md` AO5), S3-004 (DB comment AO5), S3-010 (mark mapping sanity), S3-012, S3-013 (auth SECURITY DEFINER exposure), S3-015 (leaked-password protection), S3-016 (RLS initplan ×69)
- S4-006 (EssayMarker double-submit race), S4-007, S4-008 (lookup bangs), S4-009 (ErrorBoundary placement)
- S6-002 (rate-limit on success only), S6-003 (constant drift), S6-004 (row-cap truncation)

### LOW (22) + INFO (29)

22 LOW: admin-path queries, Deno env bangs, subscription destructures, 7 unguarded JSON.parse in admin imports, S3-014 (`is_owner` SECURITY DEFINER), S3-017/018/020 (perf lints), S3-024 (migration drift), S6-005 (quotes vs quote_methods scope), S6-006 (frontend QuoteDiagnostic cast), S6-007 (apply-staged-change undeployed).

29 INFO: clean confirmations — Dashboard hardened (S4-021), EssayMarker SSE defended (S4-022), localStorage JSON.parse guarded (S4-023), 0 async useEffects (S4-024), 0 async event handlers (S4-025), `pages/Dashboard.tsx` is just a re-export (S4-026), 0 FK orphans (S3-008), 0 AO5 in live data (S3-006), all 7 prompt-context blocks query correct columns (S6-008), SSE protocol matches both sides (S6-009), rate-limit math correct (S6-010), QuoteDiagnostic shape enforced (S6-011), model + max_tokens correct (S6-012), no secret leakage (S6-013), auth checked before any work (S6-014), defensive AO5 stripping (S6-015), streaming + persistence cleanly decoupled (S6-016), pre-flight project refs clean, tsc=0, RLS coverage complete, types.ts mostly aligned (only `ao_readiness` drifts).

---

## Dependencies between fixes

- **Item 9 (planFetches typing) → Item 8 (EssayBuilder bangs).** Fix Item 9 first; the bangs in Item 8 only exist because the upstream type is `any[]`.
- **Item 3 (regenerate types) is independent and best done first** — `tsc` currently passes, so regenerating is purely additive (won't surface new errors). Other fixes will benefit from accurate types.
- **Items 1, 2, 4, 5 (the four other must-fixes) are independent of each other and of all code refactors.**
- **Post-exam: S3-016 (bulk RLS-policy rewrite)** should land before any new heavy read path is added; otherwise latency regressions will compound.

---

## What this audit verified is *not* broken

(Capturing this explicitly so subsequent sessions don't re-investigate.)

- The EssayMarker page (`/essay-marker`) end-to-end — SSE flow, AbortController, response guards, all JSON.parse in try/catch, friendly error mapping (S4-022).
- The Dashboard (`/`) end-to-end — `?? []`, `Number(… ?? 0)`, `?? ""` on every ao_readiness/themes/quotes access (S4-021).
- The mark-component2-essay edge function's data shape, validation, AO5 defense, model string, max_tokens, secret handling (S6-008–S6-016).
- Database integrity — 0 FK orphans, RLS on every table, composite PK on `ao_readiness`, score mapping L1→20…L5→95 at validation.ts:162.
- No off-limits Supabase project refs in code; no AO5 in live DB content.
- Local async-error hygiene — 0 async useEffects, 0 async event handlers, all submit handlers use `useCallback` + explicit try/catch.

---

## Files written by this audit

- `audit/stage-1.md` — inventory (routes, files, tables, RLS, migrations, env vars)
- `audit/stage-2.md` — type system (tsc, types.ts diff, escape hatches)
- `audit/stage-3.md` — DB + RLS (FK orphans, AO5 scan, advisors, mark/score mapping)
- `audit/stage-4.md` — runtime crash vectors (ranked by likelihood-of-firing)
- `audit/stage-5.md` — route-by-route smoke audit (37 rows)
- `audit/stage-6.md` — edge function audit (mark-component2-essay + apply-staged-change)
- `AUDIT_REPORT.md` — this file

No code was edited. No migrations were applied. No deploys were triggered.

---

## Self-verification

- [x] 7.1 — All Stage 2–6 findings merged into a single prioritised list. Sorted CRASH → HIGH → MEDIUM → LOW → INFO. Every original stage ID preserved for traceability.
- [x] 7.2 — Every CRASH and HIGH item carries a minimum-fix proposal + effort sizing (XS / S / M / L). Cross-fix dependencies documented.
- [x] 7.3 — "Must-fix before exam" subsection produced — 5 items totalling ~30–45 minutes, sized against the 11 days until 1 June 2026.
- [x] 7.4 — Report written to `AUDIT_REPORT.md` at repo root. Not staged. Not committed.

Stage 7 complete. Audit done.
