# Staging Read-Only Validation Report

**Date:** 2026-05-15
**Project:** Supabase staging (`nxlxunygoccbnzdopqna`)
**Auth used:** anon key (RLS-limited)
**URL host:** nxlxunygoccbnzdopqna.supabase.co

## Summary

| Status | Count |
|--------|-------|
| PASS   | 4 |
| FAIL   | 0 |
| WARN   | 0 |
| SKIP   | 1 |

## Checks

| Check | Status | Detail |
|-------|--------|--------|
| All 49 expected tables exist | PASS | Checked 49 tables |
| All tables readable | PASS |  |
| All tables at 0 rows | PASS | Counted via anon (RLS-filtered counts) |
| quote_methods has all required columns | PASS | Verified 25 columns |
| RLS enabled on critical tables | SKIP | Need both SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_ANON_KEY in .env to anon-probe. Verify via Supabase Studio: Database → Tables → check the RLS toggle on quote_methods, saved_essay_plans, timed_sessions, reflection_entries. |

## Notes

- This script is read-only. It only calls `.select()` on Supabase tables.
- Production project ref `szdgsmpxtifrcmwelqfo` is on the deny-list and the script aborts if the URL contains it.
- The RLS check is structurally limited: with empty tables, anon-key SELECT returns 0 rows whether RLS is enabled or not. Confirm RLS via Supabase Studio.
