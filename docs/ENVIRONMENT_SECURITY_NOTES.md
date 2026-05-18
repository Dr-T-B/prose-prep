# Environment Security Notes

Service-role keys must never be used in frontend code, committed to git, or added to Netlify client-side environment variables. The Vite app should receive only:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Admin scripts that genuinely require elevated access should use separate local-only environment files, for example:

- `.env.local`
- `.env.admin.local`

Both names are covered by the repository `.gitignore` patterns. Keep service-role keys out of any `VITE_` variable because Vite exposes those values to browser code.

For Netlify, configure only browser-safe public values for the frontend build. Store any service-role key only in backend-only/serverless contexts that do not ship to the client.
