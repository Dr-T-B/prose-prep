# CI integration-test ECONNREFUSED triage — 2026-05-22

## 1. Branch and latest commit before changes

- Branch: `main`
- HEAD before this work: `cc9a1e2` — `fix: align local Supabase migration history with remote`

## 2. Working-tree status before changes

Heavy unrelated noise present (≈50 deleted `docs/*.md` paths, 2 deleted migrations, many untracked migrations + `audit/`, `poetry-companion/`, `roles.sql`, `supabase/validation/`). **All untouched** — staging is path-specific to the two files this triage produced or modified.

## 3. Failing test file and its env-var contract (Phase 3)

- Failing file: [`src/lib/__tests__/planRepository.integration.test.ts`](../src/lib/__tests__/planRepository.integration.test.ts)
- Imports `supabase` from [`@/lib/supabaseClient`](../src/lib/supabaseClient.ts), which re-exports from [`@/integrations/supabase/client`](../src/integrations/supabase/client.ts).
- Env vars read directly by the test:
  - `process.env.INTEGRATION` — gates the entire `describe.skipIf(!RUN)` block (`RUN = process.env.INTEGRATION === "true"`).
  - `process.env.TEST_USER_EMAIL` — passed to `signInWithPassword`.
  - `process.env.TEST_USER_PASSWORD` — passed to `signInWithPassword`.
- Env vars read by the Supabase client module:
  - `import.meta.env.VITE_SUPABASE_URL` (required for the Supabase URL)
  - `import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY` (auth key)
- **Failure-mode amplifier — recorded but not fixed in this change set**: the client falls back to `http://127.0.0.1:54321` and the literal string `"missing-anon-key"` when those env vars are absent (see [`client.ts:34`](../src/integrations/supabase/client.ts:34)). The fallback is only guarded by `import.meta.env.DEV`, so in CI (production-mode vitest) the client constructs silently. This is the proximate reason the failure surfaces as `ECONNREFUSED` from `signInWithPassword` rather than as a clear "missing env" error at startup.
- The test's only guard is `describe.skipIf(!RUN)`. It does not additionally skip when `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` are absent — so with `INTEGRATION=true` but empty credentials, it crashes rather than skips.

## 4. Workflow file path and env wiring as it stood (Phase 4)

- Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — the only workflow file in `.github/workflows`.
- Job: `integration-test` ("Integration tests (live Supabase)"); gated `if: github.ref == 'refs/heads/main' && github.event_name == 'push'`, `needs: [test]`.
- `env:` scope: **job-level** (correct — propagates to all steps).
- Env wiring (verbatim from the file before the actions bump):

  ```yaml
  env:
    INTEGRATION: "true"
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
    TEST_USER_EMAIL: ${{ secrets.INTEGRATION_TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: ${{ secrets.INTEGRATION_TEST_USER_PASSWORD }}
  ```

- Test command: `npx vitest run src/lib/__tests__/planRepository.integration.test.ts --reporter=verbose`.

## 5. `gh secret list` output (Phase 5)

`gh auth status` confirms authentication (account `Dr-T-B`, scopes include `repo` and `workflow`). `gh secret list` returns `[]` — **zero repository-level Actions secrets exist**.

Latest failed CI run (`databaseId: 26306828592`, push to `main`, 2026-05-22T19:07Z) explicitly logs the env values as empty strings just before the failure:

```
env:
  INTEGRATION: true
  VITE_SUPABASE_URL: 
  VITE_SUPABASE_PUBLISHABLE_KEY: 
  TEST_USER_EMAIL: 
  TEST_USER_PASSWORD: 
```

followed by `TypeError: fetch failed` → `code: 'ECONNREFUSED'` from `@supabase/auth-js` `signInWithPassword` — the exact signature in the triage brief.

## 6. Cross-reference table (Phase 6)

| Env var name (consumed by test/client) | Workflow `env:` line | Secret name referenced | Secret exists in repo? |
|---|---|---|---|
| `process.env.INTEGRATION` (test gate) | `INTEGRATION: "true"` | — (literal) | n/a |
| `import.meta.env.VITE_SUPABASE_URL` (client) | `VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}` | `VITE_SUPABASE_URL` | ❌ no |
| `import.meta.env.VITE_SUPABASE_ANON_KEY` ∥ `…PUBLISHABLE_KEY` (client) | `VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}` | `VITE_SUPABASE_PUBLISHABLE_KEY` | ❌ no |
| `process.env.TEST_USER_EMAIL` (test) | `TEST_USER_EMAIL: ${{ secrets.INTEGRATION_TEST_USER_EMAIL }}` | `INTEGRATION_TEST_USER_EMAIL` | ❌ no |
| `process.env.TEST_USER_PASSWORD` (test) | `TEST_USER_PASSWORD: ${{ secrets.INTEGRATION_TEST_USER_PASSWORD }}` | `INTEGRATION_TEST_USER_PASSWORD` | ❌ no |

Name wiring is internally consistent — no spelling mismatch between the workflow's `secrets.X` reference and the env var the test/client consume. The failure is **not** a secret-name mismatch; the secrets simply do not exist.

## 7. Stale-reference scan (Phase 7)

`git grep` (tracked files only — avoids `node_modules`/`dist`/`.git`) found:

- `BACKEND_STATUS.md:12` — describes `szdgsmpxtifrcmwelqfo` as the retired production project. **Historical context, not active.**
- `scripts/validateStagingSchema.ts:69` — `const PRODUCTION_REF = 'szdgsmpxtifrcmwelqfo'`. This constant is used by the staging-vs-production guardrail to **reject** the deleted project's ref. **Intentional, not stale.**
- `README.md:259` — historical Lovable URL.
- `docs/COMPONENT_2_AO5_FORWARD_MIGRATION_DRAFT.sql`, `docs/Use this in **Codex** for the next pass.md`, `docs/component2_ao5_schema_remediation_map.json` — historical migration drafts mentioning `prose-craft-aid-staging` (the human-readable name of `nxlxunygoccbnzdopqna`).

None of these are in the active CI / secret-resolution path. Removing them would expand scope and risk losing audit context. Documented in `docs/CI_SECRETS.md` as "stale references — do not use" so Tawi does not seed secrets with them.

## 8. Mode classification (Phase 8)

**Primary mode: B — Workflow passes env but the referenced secrets are empty/absent.**

Reasoning:
- Workflow wiring is internally consistent (Phase 6 table).
- `gh secret list` returns `[]`; the live runner log shows all four env values as the empty string.
- The Supabase client's silent localhost fallback (Phase 3) deterministically converts "empty URL" into `ECONNREFUSED` at the `signInWithPassword` boundary — matching the reported signature exactly.

Mode A (env not propagating) is ruled out: env is propagating, it is just empty. Mode C (name mismatch) is ruled out by Phase 6 — every `secrets.X` is consumed under its expected name. Mode D (stale hard-coded URL) is ruled out — no hard-coded Supabase URL in the active client/workflow path.

Two minor latent issues are recorded but **not fixed in this change set** because each would expand scope past "one focused fix" and each touches code outside the CI-config boundary:

- The client's localhost fallback in [`client.ts:34`](../src/integrations/supabase/client.ts:34) masks missing-env misconfiguration in non-DEV builds.
- The integration test does not double-guard on the presence of `TEST_USER_EMAIL`/`TEST_USER_PASSWORD`.

Both are flagged as Phase 13 follow-ups.

## 9. Implementation performed (Phase 9)

Single focused change set:

1. **New file** [`docs/CI_SECRETS.md`](./CI_SECRETS.md) — Tawi-facing checklist of the four required secret names, exact value sources in the Supabase Dashboard for project `nxlxunygoccbnzdopqna`, an explicit warning against using the deleted `szdgsmpxtifrcmwelqfo` reference, and verification steps.

2. **No YAML edits to env/secret wiring** — Phase 6 confirmed the workflow's references are correct. Editing them would introduce a new spelling for Tawi to track without fixing anything.

3. **No code edits** to the client or the test — out of scope for this triage; see Phase 13 follow-ups.

## 10. Node 24 action bump (Phase 10)

**Performed.** `actions/checkout@v4 → @v5` and `actions/setup-node@v4 → @v5` in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), each occurrence updated in both the `test` and `integration-test` jobs. Four trivial single-token edits; no inputs changed; matrix not affected.

Rationale: both v5 majors run on Node 24 and accept the same inputs this workflow uses (`node-version-file`, `cache`). The Node 20 → 24 forced-default on 2026-06-02 would otherwise convert the existing deprecation warning into a job-runtime failure.

## 11. Local check results (Phase 11)

All run on the working-tree copy with the changes applied:

| Check | Command | Result |
|---|---|---|
| Type-check | `npm run typecheck` (= `tsc --noEmit`) | ✅ clean — no diagnostics |
| Unit tests | `INTEGRATION= npm test` (= `vitest run`) | ✅ 120 passed, 3 skipped (1 file skipped). The 3 skipped tests are the `planRepository integration` suite — `describe.skipIf(!RUN)` evaluated to true because `INTEGRATION` was unset. The integration suite was **not executed**. |
| Build | `npm run build` (= `vite build`) | ✅ built in 3.14s; unrelated pre-existing warnings (`browserslist` 11-months old; chunk >500 kB). |

The integration suite's `describe.skipIf` guard was explicitly verified by the unit-test run: with `INTEGRATION` unset the suite is gracefully skipped, with no Supabase calls. This honors the "must NOT run the integration suite" constraint.

## 12. Secrets checklist for Tawi (embedded copy)

Set in **GitHub → Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Value source | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project `nxlxunygoccbnzdopqna` → Settings → API → Project URL | Full URL `https://nxlxunygoccbnzdopqna.supabase.co`. No trailing slash, no path. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Same project → Settings → API → Project API keys → `anon` `public` | Workflow currently uses the `PUBLISHABLE_KEY` name; the client accepts either this or `VITE_SUPABASE_ANON_KEY`. |
| `INTEGRATION_TEST_USER_EMAIL` | Staging Supabase Auth user (Authentication → Users) | Must already exist in the staging project. |
| `INTEGRATION_TEST_USER_PASSWORD` | Password for the above user | — |

After all four are set, push any commit to `main` (or re-run the latest failed `CI` run in the Actions UI). Expected outcome: the integration job's env group shows non-empty masked values; auth succeeds; the three `planRepository integration` tests complete.

## 13. Residual risk and follow-ups Tawi must perform manually

**Manual action required to fix the failure:**
1. Set the four secrets above in the GitHub UI. (Claude Code cannot do this safely — it has no way to receive secret values.)

**Recommended follow-ups (not in this change set):**
2. Tighten [`src/integrations/supabase/client.ts`](../src/integrations/supabase/client.ts:34) to also throw on missing env in `import.meta.env.MODE !== 'development'` (or unconditionally) — the silent localhost fallback in non-DEV builds is what converted "missing CI secrets" into a Supabase-flavoured runtime error instead of a clear startup error. Out of scope here because it touches the runtime client path.
3. Add a defensive `if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) test.skip(...)` to [`planRepository.integration.test.ts:35`](../src/lib/__tests__/planRepository.integration.test.ts:35) so a future missing-secrets state produces a skipped test instead of a fetch error.

**Other residual risk:**
- The `chore(actions): bump to @v5` portion is small but unverified locally — GitHub Actions resolves these at run time. If `actions/checkout@v5` or `actions/setup-node@v5` is unavailable on the runner image (it should be), the workflow would surface a clear "unable to resolve action" error rather than the current ECONNREFUSED; trivial to revert if needed.

## 14. Confirmation of constraints honored

Confirmed: **none of the following were performed in this triage.**

- `supabase migration repair` — not run.
- `supabase db reset` — not run.
- `--include-all` — not used.
- Migration apply / new content migration — not done.
- Schema, RLS, generated-types changes — none.
- Deploy — none.
- Builder family / route / question / content row mutations — none.
- `gh secret set` / `gh secret delete` — not run (read-only `gh secret list` and `gh auth status` only).
- Integration test suite execution against live Supabase — not done. Local `npm test` ran with `INTEGRATION` unset; the integration `describe` block was skipped by its own `skipIf` guard.
- `git push` — not run.
- Force-push / history rewrite — not run.
- Touching Supabase projects other than `nxlxunygoccbnzdopqna` — not done. `qklfhebbrinsyfyuyiuj` and `lopjupwadwahkjyhghvb` were not interacted with.
- Editing/staging unrelated working-tree files — the heavy pre-existing noise in `git status` was left exactly as found; the commit stages only the two files this triage produced/modified.
