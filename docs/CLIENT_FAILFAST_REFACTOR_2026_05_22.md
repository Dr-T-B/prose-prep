# Supabase Client Fail-Fast Refactor — 2026-05-22

## 1. Branch and starting HEAD

- Branch: `main`
- Starting HEAD: `54b79bb` ("docs(ci): document required integration test secrets; bump actions to Node 24")
- Two prior unpushed commits on `main` (`cc9a1e2`, `54b79bb`) — left untouched, not rebased, not amended.

## 2. Working-tree status summary

Unrelated working-tree noise was present at session start and remains untouched:

- ~52 `D` (deleted) docs under `docs/` from prior cleanup sessions
- 2 `D` migration files under `supabase/migrations/`
- Untracked: `audit/`, `poetry-companion/`, `roles.sql`, ~11 untracked migration files under `supabase/migrations/`, `supabase/validation/`

Only the files in §9 were staged for this change.

## 3. Phase 3 — Client construction flow (before)

`src/integrations/supabase/client.ts` (41 lines) at HEAD `54b79bb`:

- **Env reads (lines 4–6):** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY ?? VITE_SUPABASE_PUBLISHABLE_KEY`
- **Existing guard (lines 13–19):** Throws on missing env vars **only if `import.meta.env.DEV` is truthy**
- **Silent fallback (line 34):** `createClient<Database>(supabaseUrl ?? "http://127.0.0.1:54321", supabaseAnonKey ?? "missing-anon-key", …)`
- **Construction:** unconditional at module load, named export `supabase` (singleton)
- **Bug:** the `&& import.meta.env.DEV` gate meant production builds and CI (DEV=false) silently constructed against `127.0.0.1:54321` with the literal key `"missing-anon-key"`. This was the proximate cause of the recent CI `ECONNREFUSED` incident — missing GitHub Actions secrets resolved to empty strings, the throw was suppressed, and `signInWithPassword` failed at the network layer pointing at Supabase rather than at the missing config.

## 4. Phase 4 — Other Supabase client modules

`git grep -nE "createClient|@supabase/supabase-js"` surfaced:

| File | Role | Same anti-pattern? |
|---|---|---|
| `src/integrations/supabase/client.ts` | Browser SPA client (the target) | Yes — fixed |
| `src/lib/supabaseClient.ts` | Re-export shim (`export { supabase } from "@/integrations/supabase/client"`) | N/A — no construction |
| `scripts/importQuotes.ts` | Node script, service-role | No — reads non-VITE env vars, no localhost fallback |
| `scripts/validateStagingSchema.ts` | Node script | No — no localhost fallback |
| `supabase/functions/apply-staged-change/index.ts` | Deno edge function | No — different runtime, different env model |
| `supabase/functions/mark-component2-essay/index.ts` | Deno edge function | No — same as above |

Only `src/integrations/supabase/client.ts` has the silent-localhost-fallback anti-pattern. No other client was edited.

## 5. Phase 5 — Consumers of the client

`git grep` for imports of `@/integrations/supabase/client` (and the re-export shim `@/lib/supabaseClient`) in `src/**`: **35 source files** import the client at module-load time (top-level imports). All of them now execute the new fail-fast logic at *their* import time — but production/CI builds always supply env vars (or should, per `docs/CI_SECRETS.md`), and the vitest setup file (§6) pre-injects test values, so no consumer path breaks.

## 6. Phase 6 — How tests survive client construction

`vitest.config.ts` references `setupFiles: ["./src/test/setup.ts"]`. That setup file (lines 6–11) mutates `import.meta.env` *before* any test file imports the client:

```ts
if (!import.meta.env.VITE_SUPABASE_URL) {
  import.meta.env.VITE_SUPABASE_URL = "http://localhost:54321";
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  import.meta.env.VITE_SUPABASE_ANON_KEY = "test-anon-key";
}
```

Additionally, 3 test files (`src/lib/contentRepo.test.ts`, `src/pages/Dashboard.test.tsx`, `src/hooks/__tests__/useCurrentPlanCloud.test.ts`) declare `vi.mock("@/integrations/supabase/client", …)` / `vi.mock("@/lib/supabaseClient", …)`. Vitest hoists `vi.mock` calls above imports, so for those files the real module never loads.

Net effect: the new eager throw cannot fire in vitest. No test file was modified.

## 7. Phase 7 — Local-Supabase workflow status

`git grep -nE "supabase start|127\.0\.0\.1:54321|localhost:54321"` plus checks of `package.json` and `supabase/`:

- No `supabase start` reference anywhere (only doc mentions of the fallback URL)
- No npm scripts beginning with `"supabase"` in `package.json`
- No `supabase/seed.sql` or seed runner
- No Vite proxy entry for `:54321` in `vite.config.ts`
- The only meaningful `127.0.0.1:54321` references were the bug itself (`client.ts:34`) and the existing forensic notes in `docs/CI_SECRETS.md` and `docs/CI_INTEGRATION_TEST_TRIAGE_2026_05_22.md`
- The `src/test/setup.ts` injection uses `localhost:54321` only as a placeholder so the module-load guard passes; no test actually contacts that URL

**Conclusion:** no legitimate local-Supabase workflow exists. The localhost fallback was never a feature — it was always a footgun.

## 8. Strategy chosen — Strategy 1 (eager throw, no localhost path)

Reasoning:

- Phase 7 found zero evidence of a local-Supabase workflow → no opt-in to preserve
- Phase 6 confirms tests survive eager throw via `src/test/setup.ts` pre-injection plus targeted `vi.mock` in 3 files
- `vite.config.ts` is SPA-only (no SSR, no prerender) → `npm run build` is pure bundling and never executes the module-level throw at build time. The local `.env.local` had real staging credentials, but a build would succeed even without it because Vite simply inlines `undefined` strings; the throw fires at *runtime* in the browser, which is the desired behavior
- Adding the `VITE_USE_LOCAL_SUPABASE` opt-in (Strategy 2) would design for a workflow that doesn't exist — violates the "no hypothetical features" rule
- Strategy 4 (conditional fail-fast) would re-introduce the silent-fallback-by-default behavior in some environment; that is the exact anti-pattern we are removing
- Strategy 3 (lazy throw) moves the error further from the root cause without solving anything Strategy 1 doesn't already solve

Strategy 1 is the smallest behavioral change that eliminates the silent default fallback, produces a descriptive error, preserves all 120 tests unmodified, and removes the localhost path entirely.

## 9. Files edited — line-level diff summary

### `src/integrations/supabase/client.ts`

- **Line 10:** missing-key label updated to `"VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)"` so the error names both accepted keys without breaking the precedence rule
- **Line 13:** removed `&& import.meta.env.DEV` gate — throw now fires in every mode (dev, test-prod, prod, CI)
- **Lines 14–19:** rewrote error message to name the missing var(s), point at `.env.example` / `.env.local` for dev, and at `docs/CI_SECRETS.md` for CI
- **Lines 21–28:** removed the `import.meta.env.DEV` gate from the `VITE_SUPABASE_PUBLISHABLE_KEY` deprecation `console.warn` so the warning now surfaces in every environment that still uses the deprecated name (the warning is informational and side-effect-only, so this is safe)
- **Line 34:** removed `?? "http://127.0.0.1:54321"` and `?? "missing-anon-key"` fallbacks — now `createClient<Database>(supabaseUrl, supabaseAnonKey, …)` (both arguments are guaranteed non-empty by the throw above)

No other client files, no `.env.example`, no `docs/CI_SECRETS.md` edits (no opt-in flag introduced, so those docs are still accurate as-is for the CI-secrets path).

## 10. New error message (verbatim)

```
[ProseCraft] Missing Supabase environment variable(s): <names joined by ", ">. For local development, copy .env.example to .env (or .env.local) and fill in staging Supabase credentials. For CI, set these as GitHub Actions secrets — see docs/CI_SECRETS.md.
```

Where `<names joined by ", ">` is some non-empty subset of `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)`.

## 11. Local check results

| Command | Result |
|---|---|
| `npm run typecheck` | ✅ Pass — `tsc --noEmit` clean |
| `npm run test` | ✅ 120 unit tests passed, 3 integration tests self-skipped (gated on `INTEGRATION=true`), 0 failures, no test files modified |
| `npm run build` | ✅ Built in 3.15s — `dist/assets/index-DusG2YzN.js 1,521.05 kB` (gzip 420.93 kB). No env-var workaround needed; local `.env.local` already had staging credentials |

## 12. Residual risk

- **Module-load throw blast radius:** all 35 consumers now propagate the throw at their import time. In production this means the bundle fails to initialize and the page is blank — that is the intended signal, and is materially better than silently routing auth calls at `127.0.0.1:54321`. A bare error page in the Vercel deployment with the verbatim message in the console is sufficient to diagnose missing env vars in seconds.
- **CI behaviour:** when `gh secret list` is still empty (current state per `docs/CI_SECRETS.md`), the integration job will now fail at module-load with the descriptive error rather than later at `signInWithPassword` with `ECONNREFUSED`. This is the desired change — fail earlier and louder.
- **Edge-function clients:** out of scope. The Deno edge functions in `supabase/functions/*` read their own env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.) and do not have a localhost fallback. They are unaffected.
- **Backward-compat for `VITE_SUPABASE_PUBLISHABLE_KEY`:** preserved (precedence unchanged); deprecation `console.warn` is now visible in all environments instead of only DEV, which is a minor surface change but informational only.
- **First-time local dev without `.env`:** developer sees the descriptive error immediately on `npm run dev`, naming the missing vars and pointing at `.env.example`. Strictly better UX than the old silent-localhost behavior.

## 13. Confirmation of no out-of-scope side effects

This change set contains **no**:

- Migration changes, `supabase db reset`, `--include-all`, or applied migrations
- Schema, RLS, public data row, or generated types changes
- Deploy actions
- Active Builder family / route / question / content row changes
- `gh secret set` / `gh secret delete` / GitHub Actions secret mutations
- Integration test suite runs against live Supabase (only the self-skipping vitest path ran)
- `git push`, force-push, history rewrite, or commit amendments
- Edits to unrelated working-tree files (the deleted-docs and untracked migrations remain untouched)
- Touches to any Supabase project other than `nxlxunygoccbnzdopqna` (not `qklfhebbrinsyfyuyiuj`, not `lopjupwadwahkjyhghvb`)
- Env-var renames or changes to the `VITE_SUPABASE_ANON_KEY ?? VITE_SUPABASE_PUBLISHABLE_KEY` precedence
- New dependencies
- Test file modifications (zero `src/**/*.test.*` or `src/test/setup.ts` edits)
