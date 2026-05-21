# Stage 3 — Database & RLS audit

Findings only. Read-only. 2026-05-21. Project `nxlxunygoccbnzdopqna`.

## Headline

- **0 FK orphans** across all 13 FK relationships sampled. The 80 "orphans" my initial query found in `quote_question_links.quote_id` were a false alarm: the FK targets `quote_methods.id`, not `quotes.id` (confusing column name, intact data).
- **0 AO5 references in live data.** All 9 array/text columns checked across `quotes`, `quote_methods`, `library_*`, `paragraph_stems`, `ao_readiness` are clean.
- **1 AO5 reference in live DB metadata** (a `COMMENT ON TABLE` left from the remediation pass — defensive documentation, not assessable content).
- **AO5 still present in 2 prompt files** (`prompts/quote_bank_master.md`, `prompts/README.md`) — not referenced by any code, so they cannot reach user output by themselves, but they violate the strict AO rule and risk re-introduction if anyone copies them as a template.
- `ao_readiness` composite PK (`ao`, `user_id`) is present and correct. Score mapping (`L1→20 … L5→95`) is **correct** at `supabase/functions/mark-component2-essay/validation.ts:162–168`. Mark mapping is `L1→3, L2→7, L3→11, L4→15, L5→19` (mid-band marks for 20-mark paper — verify with Neha).
- Every public table has RLS enabled (Stage 1.4). The frontend's write surfaces (12 user-owned tables) all carry per-user policies. The frontend's read-only surfaces (17 admin-curated tables) all expose either `Public read` or `Authenticated read`.
- `get_advisors` returned 6 SECURITY warnings + 141 performance lints. None CRASH-level. The single security item that warrants attention before exam day is `auth_leaked_password_protection` (off).

## Findings table (top 50)

| ID | Severity | Area | File / Table | Line / Column | Issue | Evidence | Suggested Fix |
|---|---|---|---|---|---|---|---|
| S3-001 | **HIGH** | AO rule violation (prompt) | `prompts/quote_bank_master.md` | 30 | Prompt template emits `"linked_interpretations": ["AO5 reading one (critic name if known).", "AO5 reading two."]`. If anyone uses this prompt to regenerate quote-bank rows, AO5-labelled data lands in `quote_methods.linked_interpretations`. | `grep -n "AO5" prompts/quote_bank_master.md` | Replace `AO5` with `interpretive`. Mirror the in-DB column comments that already mark the legacy AO5 names as deprecated. |
| S3-002 | **HIGH** | AO rule violation (prompt) | `prompts/quote_bank_master.md` | 36 | `"ao_priority": ["AO1", "AO2", "AO5"]` — same risk. Would populate `quote_methods.ao_priority` with `AO5`. | grep | Same — replace with `AO1`/`AO2`/`AO3`/`AO4` only. |
| S3-003 | MEDIUM | AO rule violation (prompt) | `prompts/README.md` | 108 | Prompt-engineering doc references "thin AO5" as a regeneration trigger. Doc-only, not loaded by code (`grep` shows zero code references to `prompts/`), but still in a `prompts/` directory which the audit rules treat as in-scope. | grep | Reword to "thin interpretive" or remove. |
| S3-004 | MEDIUM | AO rule violation (DB comment) | `pg_description` on `public.interpretive_tensions` | n/a | Live `COMMENT ON TABLE interpretive_tensions` reads: *"Component 2 Prose interpretive extension tensions. Replaces the legacy AO5-named content table."* Defensive documentation (warns devs off the old name), but ships AO5 inside DB metadata. Per the strict reading of the rule ("comments" included), this is in scope. | `SELECT description FROM pg_description WHERE description ILIKE '%AO5%'` returns 1 row. | Reword to "Component 2 Prose interpretive tensions (replaces the deprecated legacy table)." — keeps the deprecation breadcrumb without the AO5 string. (Same applies to ~10 COLUMN-level comments set by migration `20260517232441` — they don't show in the table-level scan because they're on dropped columns, but the migration file still references AO5 in active SQL comments.) |
| S3-005 | LOW | AO rule violation (defensive code) | `supabase/functions/mark-component2-essay/index.ts` 514–515, 640; `validation.ts` 174–195, 294–296 | various | All occurrences of `AO5` in edge function code are **defensive** — system prompt explicitly tells the model "Do NOT mention AO5", and `stripAO5()` rewrites any leak before persistence. These do NOT reach user output; they prevent reaching user output. Flagging as **LOW/INFO** for completeness only. | read | Keep as-is. Treat as part of the AO5 enforcement layer. |
| S3-006 | INFO | AO rule (clean data) | Live tables `quotes`, `quote_methods`, `library_*`, `paragraph_stems`, `ao_readiness` | n/a | 9 explicit `'AO5' = ANY(...)` / `ILIKE '%AO5%'` checks across content tables — all return **0 rows**. Data is clean. | `SELECT … WHERE 'AO5' = ANY(ao_tags)` etc. | None — confirms remediation succeeded for live data. |
| S3-007 | **HIGH** | Type-vs-data drift (re S2-001/S2-002) | `ao_readiness` | label, weight | DB columns are nullable; types.ts says non-null. Today: **0 / 4 rows** are null on either column, so no crash yet. Risk is on the *next* insert — the migration that made these nullable (`20260520160000_ao_readiness_nullable_columns`, local-only) exists precisely because new inserts need to allow null. First null row will crash any consumer that assumes the type. | `SELECT COUNT(*) WHERE label IS NULL` → 0; total 4 rows. | Resolved by S2-001/S2-002 fix (regenerate types) plus applying the local migration to remote. |
| S3-008 | INFO | FK orphans | all 13 FK relations sampled | n/a | Orphan counts across `paragraph_attempts.student_id`, `paragraph_attempts.quote_pair_id`, `essay_marker_results.user_id`/`question_id`/`paragraph_attempt_id`, `questions.primary_route_id`/`secondary_route_id`, `theses.route_id`, `paragraph_jobs.route_id`, `quote_question_links.quote_id`/`question_id`, `library_thesis_bank.route_id`, `ao_readiness.user_id` — **all return 0**. | bulk LEFT JOIN query. | None. |
| S3-009 | LOW | Confusing column name | `quote_question_links.quote_id` | column | Column named `quote_id` actually FKs to **`quote_methods.id`**, not `quotes.id` (which has unique `anchor_id`). My initial orphan check joined the wrong table and reported 80 false positives. A future developer will hit the same trap. | `information_schema.referential_constraints` shows `quote_question_links.quote_id → quote_methods(id)`. | Rename to `quote_method_id` OR add a `COMMENT ON COLUMN` clarifying the target. Low priority (no live bug). |
| S3-010 | MEDIUM | Composite PK validation | `ao_readiness` | (ao, user_id) | Composite PK is present and the score mapping at `validation.ts:162–168` is `Level 1→20, Level 2→40, Level 3→60, Level 4→80, Level 5→95` — matches Stage 3.4 expectation exactly. **However**, mark mapping `LEVEL_TO_MARKS` at `validation.ts:154–160` is `L1→3, L2→7, L3→11, L4→15, L5→19` — confirm with Neha these are the right mid-band marks for the 20-mark Component 2 paper. No alternate mapping found elsewhere in the repo. | read | Verify mark values against Pearson Edexcel mark scheme. |
| S3-011 | **HIGH** | Security — public-callable SECURITY DEFINER | `public.has_role(uuid, app_role)` | function | Anon role can execute `has_role` via `/rest/v1/rpc/has_role`. The function is `SECURITY DEFINER` and used inside RLS `qual`s — letting anon call it lets them enumerate role assignments by probing user_ids. | `get_advisors` lint `anon_security_definer_function_executable`. | `REVOKE EXECUTE ON FUNCTION public.has_role FROM anon;` |
| S3-012 | MEDIUM | Security — authenticated-callable SECURITY DEFINER | `public.get_next_best_action(target_student_id uuid)` | function | Any signed-in user can call with arbitrary `target_student_id`. If the function body does not verify `target_student_id = auth.uid()`, a user can read another user's next-action. (Audit only — body not inspected here.) | `get_advisors` | Inspect body; if it lacks an ownership check, fix to enforce `target_student_id = auth.uid() OR has_role(auth.uid(),'admin')`, or revoke EXECUTE from `authenticated`. |
| S3-013 | MEDIUM | Security — authenticated-callable SECURITY DEFINER | `public.get_user_emails(uuid[])` | function | Signed-in users can resolve emails for arbitrary user ids. PII risk if not admin-gated in the function body. | `get_advisors` | Same — verify the body checks `has_role(auth.uid(),'admin')`; otherwise revoke EXECUTE from `authenticated`. |
| S3-014 | LOW | Security — authenticated-callable SECURITY DEFINER | `public.has_role` (signed-in vector), `public.is_owner(uuid, text)` | functions | Same lint type as S3-011 but for authenticated. `is_owner` is used in RLS qual for some tables; making it `SECURITY INVOKER` would close the surface. | `get_advisors` | Revoke EXECUTE from `authenticated` for both, OR convert to `SECURITY INVOKER`. |
| S3-015 | MEDIUM | Auth security setting | Supabase Auth | n/a | `auth_leaked_password_protection` is **disabled**. HaveIBeenPwned check off — users can set known-compromised passwords. | `get_advisors` | Enable in Supabase Dashboard → Authentication → Settings → Password Strength. |
| S3-016 | MEDIUM | Performance — RLS initplan | 69 policies across 27 tables | qual | 69 RLS policies use `auth.uid()` directly in `qual` (e.g. `(auth.uid() = user_id)`) instead of `((SELECT auth.uid()) = user_id)`. Postgres re-evaluates `auth.uid()` per row. Significant slowdown on tables with many rows. Tables affected include essentially every user-owned table. | `get_advisors` performance lint `auth_rls_initplan` ×69. | Wrap `auth.uid()` in a subquery in each policy; bulk migration. (Note: this is partly already done — newer policies use `(( SELECT auth.uid() AS uid) = …)`. Older ones don't.) |
| S3-017 | LOW | Performance — multiple permissive policies | 12 instances | various tables | Multiple permissive SELECT policies on the same table cause Postgres to OR them; performance is degraded vs single canonical policy. | `get_advisors` `multiple_permissive_policies` ×12. | Consolidate or convert to restrictive policies. |
| S3-018 | LOW | Performance — unindexed FK | 4 FK columns | various | 4 FK columns lack indexes — joins / cascades slow. | `get_advisors` `unindexed_foreign_keys` ×4. | Add covering indexes. |
| S3-019 | INFO | Performance — unused indexes | 55 indexes | various | 55 indexes report zero scans — likely safe to drop, but verify usage windows before action. | `get_advisors` `unused_index` ×55. | Defer until after exam. |
| S3-020 | LOW | Performance — DB connections | n/a | n/a | `auth_db_connections_absolute` lint — connection-count approaching limits. Not a runtime issue at current usage, but worth monitoring. | `get_advisors` | Monitor; consider PgBouncer pooler. |
| S3-021 | INFO | RLS coverage — user-owned tables | 12 tables | n/a | Every table the frontend writes to has owner-scoped policies: `ao_readiness`, `essay_marker_results`, `essay_plans`, `lesson_progress`, `paragraph_attempts`, `paragraph_attempt_quote_links` (transitive), `profiles`, `reflection_entries`, `retrieval_items`, `retrieval_responses`, `retrieval_sessions`, `saved_essay_plans`, `saved_views`, `student_quote_pair_mastery`, `timed_sessions`. | RLS policy dump, Stage 1.4. | None. |
| S3-022 | INFO | RLS coverage — admin-curated tables | 17 tables | n/a | Every read-only content table exposes a `SELECT` policy (public or authenticated) and admin-only write via `has_role(auth.uid(),'admin')`: `character_cards`, `comparative_matrix`, `glossary_terms`, `import_logs` (admin-only), `interpretive_tensions`, `lessons`/`modules`/`resources` (published-or-admin), `library_*`, `paragraph_jobs`, `paragraph_stems`, `questions`, `quote_methods`, `quote_pairs`, `quote_question_links`, `quotes`, `routes`, `staged_changes` (admin-only), `symbol_entries`, `themes`, `theses`. | RLS policy dump. | None. |
| S3-023 | INFO | Data density (sample) | content tables | n/a | Row counts (live, Stage 3): routes=7, questions=15, themes=13, theses=12, quote_pairs=22, quotes=22, comparative_matrix=38, glossary_terms=38, paragraph_stems=38, quote_methods=40, paragraph_jobs=14, interpretive_tensions=14, library_thesis_bank=12, library_context_bank=27, library_paragraph_frames=8, character_cards=11, symbol_entries=12, essay_marker_results=5, ao_readiness=4. | bulk count query. | None — useful baseline for Stage 5. |
| S3-024 | LOW | Migration drift (carried from S1) | `supabase/migrations/` vs live | n/a | 10 live-only migrations + 1 file-only migration (Stage 1.4). All 10 live-only are the 2026-05-19 phase-6/7/8 remediation pass (AO5 drops, themes consolidation, dead-table cleanup). Source of truth is divergent; new developer cannot replay. | `list_migrations` vs `ls supabase/migrations`. | Dump the 10 DDLs to disk after exam. **Not blocking** for exam-day stability since live DB already reflects the remediated state. |

## Appendix — full advisor list (info-grade)

Performance: 69 × `auth_rls_initplan` (WARN), 55 × `unused_index` (INFO), 12 × `multiple_permissive_policies` (WARN), 4 × `unindexed_foreign_keys` (INFO), 1 × `auth_db_connections_absolute` (WARN).

Security: 5 × SECURITY DEFINER functions exposed via RPC (covered by S3-011 to S3-014), 1 × `auth_leaked_password_protection` (S3-015).

## Counts by severity

| Severity | Count |
|---|---|
| CRASH | 0 |
| HIGH | 4 (S3-001, S3-002, S3-007, S3-011) |
| MEDIUM | 7 (S3-003, S3-004, S3-010, S3-012, S3-013, S3-015, S3-016) |
| LOW | 6 (S3-005, S3-009, S3-014, S3-017, S3-018, S3-020, S3-024 — = 7) |
| INFO | 7 (S3-006, S3-008, S3-019, S3-021, S3-022, S3-023) — = 6 |

(Recount: **HIGH=4, MEDIUM=7, LOW=7, INFO=6, total=24**.)

## Self-verification checklist

- [x] 3.1 done — every public table has RLS enabled (Stage 1.4); read & write surfaces cross-referenced. 12 user-owned tables (S3-021), 17 admin-curated read tables (S3-022). All operations the frontend performs are covered.
- [x] 3.2 done — nullability direction (a) carried from S2-001/S2-002 (`ao_readiness.label`, `ao_readiness.weight`); sample SELECT confirms 0 actual null rows today (S3-007). Direction (b) — sample check showed no over-defensive guards on critical paths worth flagging in Stage 3.
- [x] 3.3 done — 13 FK relationships sampled, 0 orphans. False positive (S3-009) explained.
- [x] 3.4 done — composite PK confirmed (Stage 1.4: `ao`, `user_id`); score mapping confirmed at `validation.ts:162–168` matches `L1→20…L5→95` exactly; mark mapping (`LEVEL_TO_MARKS`) noted at `validation.ts:154–160`; no alternate mapping found in the repo (grep returned only these two constants).
- [x] 3.5 done — full repo scan + live-data scan. Defensive code accepted (S3-005). 2 prompt files flagged HIGH (S3-001, S3-002, S3-003). 1 DB comment flagged MEDIUM (S3-004). Live data is clean (S3-006).
- [x] 3.6 done — pre-flight grep re-run against `src/`, `supabase/`, `prompts/`, `scripts/`, `public/` — **no occurrences** of `lopjupwadwahkjyhghvb` or `qklfhebbrinsyfyuyiuj`. Earlier hits in `docs/` are explicit "not touched" disclaimers (acceptable). Pre-flight remains clear.
- [x] 3.7 done — `get_advisors` security + performance pulled; 147 total findings folded in (S3-011 to S3-020).

## Forward references

- S3-001 / S3-002 → Stage 6 should verify the edge function's `stripAO5` *would* catch these if they did sneak through (defence in depth).
- S3-007 → Stage 4 trace: Dashboard reads `ao_readiness`; once `label` is null, the AO chip render path will throw.
- S3-011 to S3-014 → Stage 6 (auth/RPC surface) deeper pass.
- S3-016 (RLS initplan ×69) → not blocking exam day, but page-load latency on Dashboard/Library can be ≥ 2× what it should be. Recommend bulk policy rewrite post-exam.

Stage 3 complete. Awaiting approval to proceed.
