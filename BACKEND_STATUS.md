# Backend Status

## Current position

This repository is a staging/development copy. It must not connect to, mutate,
migrate, seed, reset, invoke Edge Functions against, or overwrite production
Supabase.

Staging configuration is held in `supabase/config.toml` and points at
`nxlxunygoccbnzdopqna`.

Production Supabase ref `szdgsmpxtifrcmwelqfo` is retained here only as a
deny-list/safety identifier. It is not authorised for development work from
this repository.

## Package manager

**npm is canonical.** `package.json` declares `"packageManager": "npm@11.6.2"`
and the deploy configs (`netlify.toml`, `vercel.json`) assume `npm run build`.
The previous `bun.lock` has been removed; do not re-introduce Bun or Yarn
lockfiles. Always install with `npm install`.

## Required environment variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

See `.env.example`. It contains placeholders only. Do not commit real Supabase
keys, JWTs, database passwords, service-role keys, or access tokens.

## Current app behaviour

### Anonymous users

- Essay-plan persistence is local-only (browser storage).
- Anon writes to `timed_sessions`, `saved_essay_plans`, `reflection_entries`,
  and the retrieval tables are blocked by RLS.

### Signed-in users

- Saves persist through the configured staging Supabase project only after
  staging credentials are supplied locally.

## Outstanding manual steps

Tracked in [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md). Before
any database work, confirm the target is staging and that production is not
linked in the local Supabase CLI metadata.
