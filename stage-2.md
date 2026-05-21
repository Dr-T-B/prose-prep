# Stage 2 — Type system integrity

Findings only. Read-only. 2026-05-21.

## Headline

- `npx tsc --noEmit` → exit code **0**. Zero TypeScript errors. **But** type safety is partially defeated by 11 `(supabase as any)` casts that bypass the generated schema, and the generated types drift from the live DB on `ao_readiness`.
- `src/types/database.types.ts` is a single-line re-export of `@/integrations/supabase/types` — confirmed generated types live at `src/integrations/supabase/types.ts`.
- Full `generate_typescript_types` output diffed against the committed file: **2 column drifts**, both on `ao_readiness`.

## Findings table

| ID | Severity | Area | File / Table | Line | Issue | Evidence | Suggested Fix |
|---|---|---|---|---|---|---|---|
| S2-001 | **HIGH** | Type drift | `src/integrations/supabase/types.ts` / `ao_readiness` | 20, 26 | `Row.label` typed as `string` but live DB column is **NULLABLE**. Any consumer assuming non-null can throw on `.toLowerCase()` / template interpolation when null. Dashboard reads ao_readiness on golden path. | `diff` of fresh `generate_typescript_types` vs committed file; live `information_schema.columns` reports `is_nullable=YES`. Local-only migration `20260520160000_ao_readiness_nullable_columns` exists but live schema is already nullable, so this is a stale types file. | Regenerate `types.ts` from live DB and commit, OR apply the local migration so source and remote agree. (Recent commit `7e894d4` partially addressed this for arrays; scalar drift remains.) |
| S2-002 | **HIGH** | Type drift | `src/integrations/supabase/types.ts` / `ao_readiness` | 26, 36, 46 | `Row.weight` typed as `number` but live DB column is **NULLABLE**. Same risk profile as S2-001. | Same source as S2-001 — live `weight` `is_nullable=YES`; types.ts says `number`. | Same fix as S2-001 (single regeneration covers both). |
| S2-003 | INFO | Type check | repo-wide | n/a | `npx tsc --noEmit` returns exit 0 with 0 diagnostics. | Direct run, this audit. | Maintain; add to CI if not already. |
| S2-004 | **HIGH** | `as any` escape | `src/contexts/AuthContext.tsx` | 60 | `(supabase as any)` cast bypasses generated types on an auth-adjacent call. The auth context is mounted on **every** route via `<AuthProvider>` (App.tsx:55); breakage here blanks the entire app. | grep | Replace with a typed call; if the call genuinely needs an untyped path (RPC not in `types.ts`), narrow the cast to that single statement. |
| S2-005 | **HIGH** | `as any` escape | `src/lib/contentRepo.ts` | 154, 156, 159, 160 | Four `(supabase as any).from(...)` calls on `interpretive_tensions`, `themes`, `glossary_terms`, `paragraph_stems`. All four tables ARE present in `types.ts` (Stage 1.4) — the casts are unnecessary and disable column/typo checking on the hot path that powers ContentProvider, used by every page. | grep | Drop the `as any` — `supabase.from('themes')` etc. is already typed. |
| S2-006 | **HIGH** | `as any` escape | `src/lib/planFetches.ts` | 8 | `const rawFrom = (table: string) => (supabase as any).from(table);` — generic untyped wrapper used by **every** plan fetch in the builder pipeline. All return values lose schema typing. | grep | Replace with typed dispatch per table, or at minimum narrow to a union of known table names. |
| S2-007 | MEDIUM | `as any` escape | `src/pages/InterpretiveFlex.tsx` | 87 | `(supabase as any).from('interpretive_tensions')` — table is typed; cast is unnecessary and hides any column-name typo. | grep | Drop the cast. |
| S2-008 | MEDIUM | `as any` escape | `src/components/admin/ImportHistory.tsx` | 248, 434, 527, 969 | Four `(supabase as any)` / `(supabase.rpc as any)` casts in admin-only file. Admin surface ⇒ lower blast radius, but `(supabase.rpc as any)("get_user_emails", …)` defeats arg typing on an RPC that handles emails. | grep | Type the RPC signature; remove unnecessary casts. |
| S2-009 | **HIGH** | Non-null assertion on possibly-undefined array | `src/pages/RetrievalDrill.tsx` | 376, 434 | `card.meta.themes!.map(...)` — bang asserts non-undefined, then `.map`s. If `themes` is undefined the bang silences TS but `.map` throws at runtime ("Cannot read properties of undefined (reading 'map')"). | grep | Replace with `(card.meta.themes ?? []).map(...)`. |
| S2-010 | **HIGH** | Non-null assertion in `.find()` chain | `src/pages/EssayBuilder.tsx` | 892 | `interpretiveTensions.find((a) => a.id === interpretiveId)!.interpretive_stem` — `.find` returns `T \| undefined`; bang + dot will throw `TypeError` if the id doesn't match (e.g. stale selection after data refresh). EssayBuilder is on the golden path. | grep | Guard the find: `const t = interpretiveTensions.find(...); if (!t) return null; …t.interpretive_stem`. |
| S2-011 | MEDIUM | Non-null on map element | `src/pages/EssayBuilder.tsx` | 305, 308, 309, 318, 319, 322 | Six `r!.…` calls inside a `.map(r => …)` body where `r` is iterated from a `routes` array. TS only requires the bang if `r` is typed as `T \| undefined`. This indicates the array element type itself is nullable — confirming earlier `as any` / unsafe upstream typing. | grep | Fix the upstream type (likely from `planFetches.ts:8` rawFrom) so the array element is non-null, then drop all six bangs. |
| S2-012 | MEDIUM | Non-null on lookup result | `src/pages/ComparisonRoutes.tsx` | 184, 279 | `meta!.label` after a ternary — `meta` is the result of a lookup that returns `T \| undefined`. If a UI filter is set to a value whose meta is no longer in the lookup table, this throws. | grep | Add fallback: `(meta?.label ?? value)`. |
| S2-013 | MEDIUM | Non-null on lookup result | `src/pages/InterpretiveFlex.tsx` | 194 | `m!.label` — same pattern as S2-012. | grep | Add `?.` fallback. |
| S2-014 | LOW | Deno env bang assertion | `supabase/functions/mark-component2-essay/index.ts` | 43–46 | Four `Deno.env.get("…")!` at module scope. If any of `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` is missing in the function's environment, the function imports cleanly but blows up only when the first request lands. | grep | Validate env at boot with explicit error: `const X = Deno.env.get("X"); if (!X) throw new Error("Missing X");` — surfaces faster, returns a useful error. |
| S2-015 | LOW | Deno env bang assertion | `supabase/functions/apply-staged-change/index.ts` | 277–279 | Same pattern. (Function is currently undeployed — Stage 1.3 — so blast radius is zero unless/until deployed.) | grep | Same fix as S2-014. |
| S2-016 | **HIGH** | Unguarded `data` destructure | `src/lib/planFetches.ts` | 18, 25, 63 | Three `const { data } = await rawFrom(...)` calls with **no error check**. `rawFrom` is `(supabase as any).from(...)`, so the returned shape isn't even known to TS. If the table/column changes or RLS rejects, `data` may be `null` while no exception is thrown; downstream `.map`/spread can crash. Powers EssayBuilder's quote/method/link lookups. | grep + read | Destructure `{ data, error }`, log/throw on error, default `data ?? []`. |
| S2-017 | **HIGH** | Unguarded `data` destructure | `src/lib/persistence.ts` | 13, 132, 148, 164 | Four `const { data } = await supabase.…` patterns with no error check. Persistence touches user-bound rows; if RLS denies a SELECT, error is non-null and data is null but the code proceeds as if data were valid. | grep + read | Same as S2-016. |
| S2-018 | **HIGH** | Unguarded `data` destructure | `src/lib/planRepository.ts` | 7, 23 | `const { data: { user } }` then `const { data: existing }` — both consumed without checking error. If session is expired, `user` is `undefined` and the unhelpful "Cannot read properties of undefined" surfaces inside a writeback path. | grep + read | Guard both. The auth.getUser path in particular MUST handle null user before persisting. |
| S2-019 | MEDIUM | Unguarded `data` destructure | `src/lib/contentRepo.ts` | Promise.all block at 154+ | Multiple `(supabase as any).from(...)` requests are spread into `Promise.all([...])`. Caller-side handling depends on the consumer; if any one query rejects under RLS, the whole Promise rejects. Combined with S2-005, this is the ContentProvider hot path. | read | Replace `as any` (S2-005) and add per-query error handling or `Promise.allSettled`. |
| S2-020 | MEDIUM | Unguarded `data` destructure | `src/pages/DataManager.tsx` | 86 | Admin-only, but `const { data: log } = await supabase…` with no error guard. Less blast radius (admin route) but same anti-pattern. | grep | Add `error` check. |
| S2-021 | MEDIUM | Unguarded `data` destructure | `src/pages/RetrievalDrill.tsx` | 190, 209 | `const { data: { user } } = await supabase.auth.getUser()` twice. If session is gone, `user` is undefined and subsequent writes silently address "no user" or throw. Drill is a daily-use route. | grep | Guard `user` before proceeding; redirect to `/auth` if missing. |
| S2-022 | MEDIUM | Unguarded `data` destructure | `src/contexts/AuthContext.tsx` | 29 | `const { data } = await supabase…` — auth context. If this errors silently, downstream `auth.uid()` based UI may render wrong. Used everywhere. | grep | Surface error; treat as logged-out on failure. |
| S2-023 | MEDIUM | Unguarded `data` destructure | `src/components/admin/ReviewQueue.tsx` | 399; `src/components/admin/ProposeNormalizationDialog.tsx` 171; `src/components/admin/RecentlyApplied.tsx` 128 | Three admin-surface calls with `const { data: userData } = await supabase.auth.getUser()` (or RPC) and no error guard. | grep | Same. |
| S2-024 | LOW | Unguarded `data` destructure | `src/pages/EssayMarker.tsx` | 547, 573, 1074 | Uses `useQuery` for the marker-history rows (which exposes `isError`/`isLoading` properly), but `auth.getSession()` at 1074 destructures `{ data: { session } }` without checking error. If session check errors, the marker submission throws an unhandled-rejection inside an `onClick` handler. | grep | Guard the session call; show toast on failure. |
| S2-025 | LOW | Unguarded `data` destructure | `src/pages/ResetPassword.tsx` | 81 | `const { data: subscription } = supabase.auth.onAuthStateChange(...)` — destructures the subscription handle but never checks for null. Cleanup `subscription.unsubscribe()` will throw on unmount if it's null. | grep | Guard or use optional chaining on cleanup. |
| S2-026 | LOW | Unguarded `data` destructure | `src/hooks/useCurrentPlanCloud.ts` | 38 | `const { data: { subscription } } = supabase.auth.onAuthStateChange(...)` — same pattern. | grep | Same. |
| S2-027 | INFO | Type re-export | `src/types/database.types.ts` | 1 | Single-line re-export of `Database`/`Json` from `@/integrations/supabase/types`. No drift — purely an alias. | direct read | Keep as-is or fold into `types.ts` consumers directly. |
| S2-028 | INFO | Two Supabase client modules | `src/integrations/supabase/client.ts` + `src/lib/supabaseClient.ts` | n/a | Two files create / re-export a Supabase client — needs Stage 5 to confirm both are used and whether one is a stale alias. | Stage 1.2 observation | Verify and consolidate. |

### Appendix — full enumerable list (no new IDs; for completeness)

**All `(supabase as any)` occurrences:** 11 (lines: AuthContext.tsx:60, ImportHistory.tsx:248, 434, 527, 969, contentRepo.ts:154, 156, 159, 160, planFetches.ts:8, InterpretiveFlex.tsx:87). Already captured in S2-004–S2-008.

**All `!.` non-null assertions in non-test src/:** 12 (RetrievalDrill.tsx ×2, EssayBuilder.tsx ×7, ComparisonRoutes.tsx ×2, InterpretiveFlex.tsx ×1). Already captured in S2-009–S2-013. *Plus* 7 `Deno.env.get(...)!` in edge functions — captured in S2-014/S2-015.

**No occurrences of:** `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck` anywhere in `src/` or `supabase/functions/`.

**Confirmed clean (sampled):** `paragraph_stems`, `themes`, `comparative_matrix`, `essay_marker_results`, `essay_plans`, `glossary_terms`, `interpretive_tensions`, `paragraph_attempts`, `profiles`, `quote_pairs`, `quotes`, `theses`, `timed_sessions` — types.ts matches live DB column-for-column on these. Only `ao_readiness` drifts.

## Counts by severity

| Severity | Count |
|---|---|
| CRASH | 0 |
| HIGH | 8 (S2-001, S2-002, S2-004, S2-005, S2-006, S2-009, S2-010, S2-016, S2-017, S2-018 — adjust: 10) |
| MEDIUM | 8 (S2-007, S2-008, S2-011, S2-012, S2-013, S2-019, S2-020, S2-021, S2-022, S2-023 — adjust: 10) |
| LOW | 5 (S2-014, S2-015, S2-024, S2-025, S2-026) |
| INFO | 3 (S2-003, S2-027, S2-028) |

(Recount: **HIGH=10, MEDIUM=10, LOW=5, INFO=3, total=28**.)

## Self-verification checklist

- [x] 2.1 done — `npx tsc --noEmit` ran, exit 0, no diagnostics. Verified `node_modules/.bin/tsc` present (no `npm install` needed).
- [x] 2.2 done — generated types from live DB via `generate_typescript_types`, full diff against `src/integrations/supabase/types.ts` produced. Only 2 column drifts (S2-001, S2-002), both `ao_readiness`.
- [x] 2.3 done — exhaustive scan for `as any` (11 occurrences in 6 files), `@ts-ignore` (0), `@ts-expect-error` (0), `@ts-nocheck` (0), and `!.` non-null assertions (12 in non-test src, 7 in edge functions).
- [x] 2.4 done — every `const { data }` destructure in `src/` and `supabase/functions/` enumerated; ones without `error` companion flagged with severity scaled to blast radius.

## Forward references for later stages

- S2-001 / S2-002 → likely Stage 4 crash vectors on `Dashboard` AO chip rendering (where `ao_readiness` rows are read).
- S2-006 (`planFetches.ts` rawFrom untyped) → primary upstream of the S2-011 bangs in `EssayBuilder.tsx`.
- S2-016 / S2-017 / S2-018 → likely Stage 4 entries when tracing builder + persistence flows.
- S2-019 (ContentProvider chain) → likely Stage 5 entry for every route that consumes ContentProvider (≈ every page).

Stage 2 complete. Awaiting approval to proceed.
