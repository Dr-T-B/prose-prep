# Questions Bank Live Fallback Behaviour

## Executive summary

Local static seed expansion is now implemented, but live Supabase rows may still override it. This document covers the fallback behaviour and why the deployed page might still show fewer rows than the local seed.

## Current behaviour

- Remote active Supabase rows (`is_active = true`) are preferred when present.
- The local seed acts as a fallback when the Supabase query errors or returns empty.
- Because of this, the deployed Questions page may still show only the remote rows (e.g. 5 questions) instead of the expanded local priority seed (12 questions) if those remote rows still exist.

## Why this is intentional for now

- Avoids mutating live data on production right away.
- Avoids forcing the local seed over remote content without a product decision.
- Preserves current deployed behaviour for stability.
- Keeps remote rows backwards-compatible even if they lack new metadata fields.

## Test coverage added

- **Remote active questions override local seed:** Tested that returned question count matches remote rows, not local seed count.
- **Local seed fallback on error:** Tested that local seed is used when Supabase returns an error, preventing a crash.
- **Local seed fallback on empty active rows:** Tested that local seed is used when Supabase returns no active rows, preventing a crash.
- **Remote rows without metadata still map safely:** Verified in `libraryAdapters.test.ts` that `sourceType`, `authenticityStatus`, `paperCode`, etc., are optional and safely omitted.
- **Local priority questions exist in fallback seed:** Verified that the priority questions are loaded from the seed without AO5 fields.
- **Adapter preserves metadata for local seed questions:** Verified that mapping carries metadata through.
- **Questions UI metadata display remains optional:** Verified that rendering a question without metadata does not display broken badges.

## Risk

The main risk is that users may not see the expanded local question bank until remote data is synced, migrated, or a deliberate content-source mode is introduced.

## Options for the next implementation PR

A. **Remote sync script / admin import**: Write a controlled script or admin workflow to sync reviewed local questions into Supabase.
B. **Supabase migration and seed update**: Add schema fields and seed remote rows through migrations.
C. **Content-source toggle for admin/staging**: Allow staging/local review of local seed even when remote rows exist.
D. **Merge strategy**: Combine remote rows with local seed, deduplicating by ID.
E. **Status warning**: Show an internal/admin warning when remote rows are fewer than local seed rows.

## Recommendation

I recommend **Option C** (Content-source toggle for admin/staging) or **Option E** (Status warning) before executing any remote data writes. Option E is preferred if the app already has an admin or data manager area to highlight the data sync discrepancy. Option C is preferred if staging review of the local seed is urgent.

## AO compliance

- Covers AO1, AO2, AO3, and AO4 only.
- No AO5 functionality introduced.
- No AO5 metadata added or displayed.
- No AO5 UI added.

## What was not changed

- No Supabase writes were executed.
- No migrations were created.
- No remote data was modified.
- No question-bank expansion beyond existing PR #83 seed was added.
- No AI generation was introduced.
- No AO5 functionality was introduced.
