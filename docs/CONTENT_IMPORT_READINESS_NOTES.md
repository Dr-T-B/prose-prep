# Content Import Readiness Notes

## Current State

Staging prose content is still incomplete, and legacy Component 1 drama schema remains present. Do not delete legacy drama tables as part of audit remediation; they may still be useful for migration comparison and historical audit context.

Empty or incomplete prose content tables needing planned import work include:

- `library_quotes`
- `library_questions`
- `quote_pairs`
- `thesis_routes`
- `paragraph_stems`
- `glossary_terms`

## Before Content Import

Content import should wait until:

- CI is green.
- Supabase advisors are clear or accepted with documented rationale.
- Dashboard theme mapping is corrected and verified.
- Schema/type generation is verified against staging.
- RLS has been checked for both anonymous published reads and authenticated private data.

## Readiness Label

Ready with notes.
