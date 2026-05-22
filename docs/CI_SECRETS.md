# CI / GitHub Actions secrets

This document lists the GitHub Actions secrets the `Integration tests (live Supabase)`
job in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) requires.

The integration job runs only on `push` to `main` and authenticates against the
linked staging Supabase project `nxlxunygoccbnzdopqna`. When any of these
secrets are missing, the workflow still runs but passes empty strings as env
vars; the Supabase client then falls back to `http://127.0.0.1:54321` (see
[`src/integrations/supabase/client.ts`](../src/integrations/supabase/client.ts))
and `signInWithPassword` fails with `TypeError: fetch failed` / `ECONNREFUSED`.

## Required secrets

Set each of the following in **GitHub → Settings → Secrets and variables → Actions → New repository secret**. Names must match exactly (workflow looks them up verbatim).

| Secret name | Value source | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → project `nxlxunygoccbnzdopqna` → **Project Settings → API → Project URL** | Must be the full `https://nxlxunygoccbnzdopqna.supabase.co` URL — no trailing slash, no path. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → project `nxlxunygoccbnzdopqna` → **Project Settings → API → Project API keys → `anon` `public`** | Workflow currently passes the anon key under the `PUBLISHABLE_KEY` name; the client accepts either `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`. |
| `INTEGRATION_TEST_USER_EMAIL` | Pre-provisioned staging auth user (Supabase Dashboard → **Authentication → Users**) | Used only by the integration suite; must exist in the staging project. |
| `INTEGRATION_TEST_USER_PASSWORD` | Password for the above user | Stored as a secret only; never echoed. |

`gh secret list` as of 2026-05-22 returns `[]` — none of the above are currently
set in the repository. All four must be created before the integration job can pass.

## Stale references — do not use

Any reference to Supabase project `szdgsmpxtifrcmwelqfo` (the deleted
`prose-craft-aid` production project, removed 2026-05-19) is **stale** and must
not be used as a secret value. Historical mentions exist in
`BACKEND_STATUS.md` and `scripts/validateStagingSchema.ts` (where it appears as
the old `PRODUCTION_REF` constant for guardrail comparisons); these are
intentional context markers, not active references.

## Verification

After setting the four secrets, re-trigger CI by pushing any commit to `main`
(or re-running the latest failed `CI` workflow run via the Actions UI). The
integration job should:

1. Show non-empty values in the `env:` group of the **Run integration tests**
   step (values themselves are masked).
2. Authenticate successfully against `nxlxunygoccbnzdopqna.supabase.co`.
3. Complete the three `planRepository integration` tests.

If it still fails with `ECONNREFUSED`, recheck the `VITE_SUPABASE_URL` value:
it must begin with `https://` and contain no trailing whitespace.
