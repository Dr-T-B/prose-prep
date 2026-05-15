# Staging Read-Only Validation Report

**Date:** 2026-05-15
**Project:** Supabase staging (`nxlxunygoccbnzdopqna`)
**Auth used:** service-role
**URL host:** nxlxunygoccbnzdopqna.supabase.co

## Summary

| Status | Count |
|--------|-------|
| PASS   | 3 |
| FAIL   | 0 |
| WARN   | 2 |
| SKIP   | 0 |

## Checks

| Check | Status | Detail |
|-------|--------|--------|
| All 49 expected tables exist | PASS | Checked 49 tables |
| All tables readable | PASS |  |
| All tables at 0 rows | WARN | Non-zero: character_cards=11, comparative_matrix=28, profiles=1, quote_methods=40, theme_maps=12 |
| quote_methods has all required columns | PASS | Verified 25 columns |
| RLS enabled on critical tables | WARN | Anon-probe results: quote_methods: reachable (empty); saved_essay_plans: denied/blocked; timed_sessions: denied/blocked; reflection_entries: denied/blocked. Confirm RLS=ON in Supabase Studio (read-only check cannot prove enforcement on empty tables). |

## Notes

- This script is read-only. It only calls `.select()` on Supabase tables.
- Production project ref `szdgsmpxtifrcmwelqfo` is on the deny-list and the script aborts if the URL contains it.
- The RLS check is structurally limited: with empty tables, anon-key SELECT returns 0 rows whether RLS is enabled or not. Confirm RLS via Supabase Studio.
