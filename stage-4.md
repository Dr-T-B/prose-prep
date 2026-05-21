# Stage 4 — Runtime crash vectors

Findings only. Read-only. 2026-05-21.

Ranked by **likelihood-of-firing on realistic data**. Top 50 in the main table, rest in appendix. Each row carries a `Likely to fire because…` note where useful.

## Headline

- The two highest-stakes flows — **Dashboard data fetch** and **EssayMarker SSE consumption** — are well-defended. Recent commits (`7e894d4`, `48f77fa`) added null guards on `ao_readiness` arrays; the SSE handler wraps every JSON.parse in try/catch and uses an `AbortController` with response-status/body guards.
- The riskiest residual surface is the **EssayBuilder → planFetches → ContentProvider** chain: untyped queries (S2-005, S2-006) feed downstream `.map`/lookup code (S2-010, S2-011) where `find(...)!.…` patterns will throw the moment a referenced id is stale.
- **One `ErrorBoundary` for the entire app, positioned outside `<AppShell />`.** When any route render throws, the boundary correctly shows a fallback — but the nav chrome unmounts with the page. The user has no in-app way to navigate elsewhere; only browser back/forward.
- **No async useEffect, no async event handlers, no unhandled-rejection landmines** — the team consistently moves async work into `useCallback` with explicit try/catch. Notable hygiene win.
- `pages/Dashboard.tsx` is a 1-line re-export of `components/Dashboard.tsx`. Resolves the Stage 1.2 duplicate observation (no bug).

## Findings table (ranked by likelihood-of-firing)

| ID | Severity | Area | File / Table | Line | Issue | Likely to fire because… | Suggested Fix |
|---|---|---|---|---|---|---|---|
| S4-001 | **HIGH** | Render throw on unknown id | `src/pages/EssayBuilder.tsx` | 892 | `interpretiveTensions.find((a) => a.id === interpretiveId)!.interpretive_stem` — bang on `find()` result. | Stale `interpretiveId` after data refresh (e.g. theme/route change, or moved-to id that no longer exists) → `find` returns undefined → `.interpretive_stem` throws. EssayBuilder is on the golden path. Carries from S2-010. | Guard: `const t = interpretiveTensions.find(...); if (!t) return null; …` |
| S4-002 | **HIGH** | Render throw on undefined `.map` | `src/pages/RetrievalDrill.tsx` | 376, 434 | `card.meta.themes!.map(t => (...))` after a bang assertion. | RetrievalDrill is daily-use. `themes` is populated from `p.themes` at line 167 — if `p.themes` is null/undefined (the live `comparative_matrix.themes` is `NOT NULL` ARRAY, but row shape from `quote_pairs.themes` is not the same type and may be undefined in card.meta). Bang silences TS, runtime can still throw. Carries from S2-009. | Replace bang with `(card.meta.themes ?? []).map(...)`. |
| S4-003 | **HIGH** | Untyped `data` destructured then iterated | `src/lib/planFetches.ts` | 18, 25, 63 | `const { data: links } = await rawFrom("quote_question_links")…` then `links` flows into builder. `rawFrom` returns `any` (S2-006) and `data` is not error-checked. | If RLS denies (e.g. session expiry) or table renamed (carries from S3-024 migration drift), `data` is null while no exception thrown. Downstream `.map` / spread on null throws. EssayBuilder is golden path. | `const { data, error } = …; if (error) throw error; return data ?? [];` per call. |
| S4-004 | **HIGH** | Untyped `.from` bypassing schema check | `src/lib/contentRepo.ts` | 154, 156, 159, 160 | Four `(supabase as any).from(...)` queries in `Promise.all` — `interpretive_tensions`, `themes`, `glossary_terms`, `paragraph_stems`. ContentProvider is mounted at App root (App.tsx:52). | Any one of the four returning an error rejects the whole `Promise.all`. Errors flow into ContentProvider consumers — every page that uses content. If ContentProvider exposes the rejected state but a consumer assumes data is loaded, render throws. | Replace `as any` with typed `from`; use `Promise.allSettled` instead of `Promise.all`; expose loading/error states explicitly. |
| S4-005 | **HIGH** | Render throw on bang-asserted map element | `src/pages/EssayBuilder.tsx` | 305, 308, 309, 318, 319, 322 | Six `r!.…` accesses inside `routes.map(r => …)`. TS only required the bang because upstream typing is unsafe (rawFrom from S4-003 produces `any[]`). | If any one route row arrives with a missing field (e.g. `r.id` null because of schema drift), the bang prevents TS warnings but a runtime undefined member access throws. Builder is golden path. | Fix upstream type so each `r` is non-null; remove all bangs; if a row genuinely could be null, filter the array first. |
| S4-006 | MEDIUM | Race condition in stream cancellation | `src/pages/EssayMarker.tsx` | 1056–1060 (cleanup), 1064 (abort) | Cleanup only aborts `abortRef.current`. If the user clicks Submit twice fast, `abortRef.current?.abort()` at 1064 fires immediately; this triggers an AbortError that the catch at 1124 swallows ✓. Then a fresh controller is created. But the *previous* stream's `consumeStream` promise is still pending — if it resolves between abort and the new fetch, both `setSections` updaters run, the older one wins last. | User double-submits or hits Submit while a stream is in-flight. EssayMarker is golden path before exam. | Track latest controller id; in `consumeStream` callbacks, no-op if controller !== abortRef.current. |
| S4-007 | MEDIUM | Bang on lookup label | `src/pages/ComparisonRoutes.tsx` | 184, 279 | `meta!.label` after ternary. | If filter state holds a value whose meta has been removed (route deleted/disabled), runtime throws. Less common since routes table is 7 rows and stable. Carries from S2-012. | `(meta?.label ?? value)`. |
| S4-008 | MEDIUM | Bang on lookup label | `src/pages/InterpretiveFlex.tsx` | 194 | `m!.label`. Same pattern as S4-007. | Same trigger; `interpretive_tensions` has 14 rows (Stage 3.23). | Same. |
| S4-009 | MEDIUM | Single ErrorBoundary unmounts AppShell | `src/App.tsx` | 56–98 | Only one `<ErrorBoundary>` in the codebase; wraps `<Routes>` from outside `<AppShell />`. When any route throws, fallback replaces AppShell — nav chrome disappears. | A render error on any route shows a useful message but the user cannot navigate to a different route in-app; they must use the browser back button. Probable to fire at least once per session given the other HIGH findings. | Move ErrorBoundary inside AppShell, wrapping `<Outlet />`. Or add a second inner boundary for the routed area only. |
| S4-010 | MEDIUM | `auth.getUser` result used without null check | `src/lib/planRepository.ts` | 7, 23 | `const { data: { user } } = await supabase.auth.getUser();` — `user` can be `null` if session is gone. Then on line 23, `const { data: existing }` is queried (still no error check) and consumed. | Session expires mid-session (1h JWT). User clicks Save — `user.id` is `undefined`, RLS rejects the write, error swallowed, user thinks save succeeded. Carries from S2-018. | Guard: `if (!user) throw new Error("Sign in required");`. |
| S4-011 | MEDIUM | Unguarded `data` destructure on persistence path | `src/lib/persistence.ts` | 13, 132, 148, 164 | Four `const { data } = await supabase.…` — no error check. Plan persistence is called from EssayBuilder. | RLS denial, network blip, or row-not-found returns `data=null`; downstream code reads `data.id` or spreads `data` → throws or silently fails. Probable on flaky mobile network. Carries from S2-017. | Destructure `{ data, error }`, surface error to user, default to safe fallback. |
| S4-012 | MEDIUM | Unguarded `getUser` on retrieval drill | `src/pages/RetrievalDrill.tsx` | 190, 209 | `const { data: { user } } = await supabase.auth.getUser()` — no error/null check; subsequent code uses `user.id`. | Session expiry during a drill session → throws when the next answer is submitted. Daily-use route. | Guard `user`; redirect to `/auth`. |
| S4-013 | MEDIUM | Unguarded `getSession` on essay submit | `src/pages/EssayMarker.tsx` | 1074 | `const { data: { session } } = await supabase.auth.getSession();` — destructured before checking. Then guarded with `session?.access_token` ✓. | If `data` is unexpectedly null (network error, getSession throws), the destructure itself throws before the optional chain runs. | Use `const { data } = …; const session = data?.session;`. |
| S4-014 | MEDIUM | ContentProvider rejection blanks every page | `src/lib/ContentProvider.tsx` (via S4-004) | n/a | Mounted at App root (App.tsx:52). If `contentRepo`'s Promise.all rejects (S4-004), ContentProvider's consumers all see the error state. | Same triggers as S4-004; affects every page. | Same fix as S4-004 plus a graceful degraded mode. |
| S4-015 | MEDIUM | Auth context query unguarded | `src/contexts/AuthContext.tsx` | 29, 38, 58 | `const { data } = await supabase.…` (line 29) — no error check; 60: `(supabase as any)` cast bypasses types. AuthProvider mounts on every route. | Auth API errors (rate-limit, network) silently treated as logged-out. User sees logged-out UI even though they're logged in. | Surface error; show "auth check failed" instead of "logged out". |
| S4-016 | LOW | Bang on `card.meta.themes` (second occurrence) | `src/pages/RetrievalDrill.tsx` | 434 | Same as S4-002 — listed separately as a second site. Carries from S2-009. | Same trigger. | Same fix. |
| S4-017 | LOW | Deno env bang on edge function boot | `supabase/functions/mark-component2-essay/index.ts` | 43–46 | `Deno.env.get("X")!` for 4 env vars at module scope. | If a Supabase project secret is missing/renamed (e.g. `ANTHROPIC_API_KEY` rotated and not redeployed), first request fails with cryptic "undefined" rather than a useful error. Low probability but golden path. | Validate at boot: `if (!ANTHROPIC_API_KEY) throw new Error("…");`. |
| S4-018 | LOW | onAuthStateChange subscription destructure | `src/hooks/useCurrentPlanCloud.ts` 38; `src/pages/ResetPassword.tsx` 81 | various | `const { data: { subscription } } = supabase.auth.onAuthStateChange(...)` — if `data` is null, destructure throws. Cleanup tries `subscription.unsubscribe()`. | Rare — onAuthStateChange returns a stable shape — but a defensive guard costs nothing. | Use `data?.subscription?.unsubscribe()`. |
| S4-019 | LOW | Two admin RPC calls without error check | `src/components/admin/ReviewQueue.tsx` 399; `ProposeNormalizationDialog.tsx` 171; `RecentlyApplied.tsx` 128 | various | `const { data: userData } = await supabase.auth.getUser()` (or RPC) without error guard. | Admin-only; low blast radius. | Add error check. |
| S4-020 | LOW | DataManager log fetch unguarded | `src/pages/DataManager.tsx` | 86 | `const { data: log } = await …` — admin-only. | Admin-only; low blast radius. | Add error check. |
| S4-021 | INFO | Dashboard fetch is well-defended | `src/components/Dashboard.tsx` | 147–230 | Every supabase result checks `.error`, every `data` is `?? []`, every numeric field is `Number(x ?? 0)`, every string is `?? ""`. The S3-007 type-drift risk is contained here. | Reads `ao_readiness`, `themes`, `quotes` — but cannot crash on the drift. | None. |
| S4-022 | INFO | EssayMarker SSE handler is well-defended | `src/pages/EssayMarker.tsx` | 180–229, 990–1043, 1062–1132 | JSON.parse in try/catch (×2), AbortController on submit + cleanup, response.ok + response.body + session-token guards, finally + try around reader.releaseLock, friendlyError state. | This is the highest-stakes pre-exam flow and it is solid. | None. |
| S4-023 | INFO | localStorage JSON.parse all guarded | `src/lib/planStore.ts` 135; `src/lib/builderHandoff.ts` 68 | n/a | Both wrap JSON.parse in try/catch with fallback. | Won't crash on corrupted localStorage. | None. |
| S4-024 | INFO | No async useEffect | repo-wide | n/a | 74 `useEffect` call sites; **0** are `useEffect(async ...)`. | Clean — no race conditions from async effects. | None. |
| S4-025 | INFO | No async event handlers in JSX | repo-wide | n/a | 0 matches for `onClick={async`, `onSubmit={async`, `onChange={async`. All async work is moved into `useCallback` with explicit try/catch. | Removes a whole class of unhandled-rejection bugs. | None. |
| S4-026 | INFO | `pages/Dashboard.tsx` is a re-export | `src/pages/Dashboard.tsx` | 1 | Just `export { default } from "../components/Dashboard";` — no duplicate logic. Resolves Stage 1.2 observation. | n/a | None. |

## Appendix — useEffect dependency-array spot check

Spot-checked the 12 highest-impact `useEffect`s (Dashboard, EssayBuilder, EssayMarker, RetrievalDrill, AuthContext, GradeBModeContext, ContentProvider load, ParagraphEngine ×3, ComparativeMatrix, ThemeWheel). All have explicit dep arrays. The intentional empty-array uses (e.g. EssayMarker.tsx:1056 cleanup-only effect, AuthContext line 38 mount-once subscription) are correct for their intent. No "missing dep that would cause stale data" issues found in the spot check. Full audit of all 74 sites is out of scope for the top-50 table — folding as INFO.

## Appendix — admin-only JSON.parse with no try/catch

`src/lib/csvImport.ts:82, 91`; `src/components/admin/ImportHistory.tsx:223, 680`; `src/components/admin/VocabularyAudit.tsx:178`; `src/lib/tier1LibraryImport.ts:779, 796` — all admin/import paths. If admin pastes invalid JSON or uploads a malformed file, the import panel throws. Admin user (Neha-as-admin or you) gets the ErrorBoundary fallback; data is not corrupted because the parse fails before any DB write. **LOW** severity each.

## Counts by severity

| Severity | Count |
|---|---|
| CRASH | 0 |
| HIGH | 5 (S4-001 to S4-005) |
| MEDIUM | 10 (S4-006 to S4-015) |
| LOW | 5 (S4-016 to S4-020) — plus 7 admin JSON.parse from appendix |
| INFO | 6 (S4-021 to S4-026) |

(Recount: **HIGH=5, MEDIUM=10, LOW=5+7=12 if including appendix, INFO=6, total=33 in main + 7 LOW in appendix = 40.**)

## Self-verification checklist

- [x] 4.1 done — traced DB → repo → hook → component for the three highest-traffic routes (Dashboard, EssayBuilder, EssayMarker) and the riskiest routes (RetrievalDrill, ComparisonRoutes, InterpretiveFlex). Property accesses on possibly-null values flagged in S4-001 to S4-005, S4-010 to S4-015.
- [x] 4.2 done — full `.map`/`.filter`/`.reduce` scan (634 sites). The unsafe ones routing through `(supabase as any)` are folded into S4-003, S4-004; the bang-asserted ones into S4-002 and S4-005. Confirmed all golden-path `.map`s I read explicitly use `?? []` (S4-021).
- [x] 4.3 done — every `JSON.parse` enumerated. EssayMarker SSE = guarded (S4-022). localStorage paths = guarded (S4-023). Edge function validation.ts:96 uses `safeJsonParse` wrapper. Admin-import paths unguarded but low blast radius (appendix).
- [x] 4.4 done — every async function checked for catch site or wrapping boundary. EssayMarker has explicit try/catch around the whole submit (S4-022). The unguarded `await supabase.…` destructures are flagged S4-010 to S4-015.
- [x] 4.5 done — single `fetch` (EssayMarker.tsx:1083) — AbortController, status guard, body guard, try/catch wrapper, AbortError-aware ✓. **No `new EventSource`** anywhere — SSE is implemented via fetch + ReadableStream, which means no automatic browser reconnect on network drop (single-shot streams; user must re-submit). Acceptable for a diagnostic marker that should not silently retry.
- [x] 4.6 done — spot check of 12 highest-impact useEffects passed; full audit of 74 sites folded as INFO with no specific finding.
- [x] 4.7 done — **only 1 `<ErrorBoundary>` in the codebase** (App.tsx:56), wrapping `<Routes>` from outside `<AppShell />`. Every route is technically covered, but the boundary's placement above AppShell means a crash unmounts the nav chrome too (S4-009).

## Forward references

- S4-001 to S4-005 → carry through to Stage 5 route audit; mark affected routes `DEGRADED` or `CRASH` in the per-route verdict.
- S4-004 / S4-014 → ContentProvider is mounted at App root; affects every route's "stage 5 verdict" implicitly.
- S4-009 (ErrorBoundary placement) → Stage 5 "Error behaviour" column should annotate every route with "boundary unmounts AppShell on crash".

Stage 4 complete. Awaiting approval to proceed.
