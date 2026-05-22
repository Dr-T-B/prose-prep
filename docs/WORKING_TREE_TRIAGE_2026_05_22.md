# Working-Tree Noise Triage — 2026-05-22

> **Classification only.** This session inspected 68 noise entries surfaced by `git status` on `main` at HEAD `ca4784c`. **No file in the working tree was modified, restored, deleted, staged, or otherwise touched, except this report.** Future scoped sessions will operate on one category at a time from the table below.

---

## Header

| Field | Value |
|---|---|
| Branch | `main` |
| HEAD | `ca4784c` (`fix(supabase): fail fast when client env vars are missing`) |
| Supabase project | `nxlxunygoccbnzdopqna` (linkage confirmed via `supabase/config.toml` + `supabase/.temp/project-ref`) |
| Date | 2026-05-22 |
| Total noise items | 68 |

### Classification summary

| Label | Count |
|---|---:|
| SAFE_RESTORE | 0 |
| SAFE_DELETE | 0 |
| STAGE_AS_INTENDED | 12 |
| ACCEPT_DELETION | 2 |
| DEFER | 51 |
| ASK_TAWI | 1 |
| DO_NOT_TOUCH | 2 |

Total: 12 + 2 + 51 + 1 + 2 = **68** items, matching `git status --short | wc -l`.

The bar for `SAFE_*` is intentionally high. Items with high-confidence positive evidence (remote-ledger matches for migrations) are labelled `STAGE_AS_INTENDED` or `ACCEPT_DELETION`. Items lacking direct evidence of intent (the 50 doc deletions) are labelled `DEFER` with grouping notes so a follow-up session can split them quickly.

---

## Inventory summary

| Status code | Count | Notes |
|---|---:|---|
| ` D` (working-tree-only deletion) | 52 | 50 docs + 2 migrations. All 52 are still in `HEAD` and tracked in the index — recoverable with `git restore`. |
| `D ` (staged deletion) | 0 | — |
| `??` (untracked) | 16 | 12 migrations + 4 top-level (`audit/`, `poetry-companion/`, `roles.sql`, `supabase/validation/`). |
| `A ` / `M ` / etc. | 0 | None observed. |
| **Total** | **68** | matches `git status --short | wc -l`. |

Every ` D` path passed both `git ls-files --error-unmatch -- <path>` and `git cat-file -e HEAD:<path>` — so every deletion is reversible in a future session without going to the reflog.

---

## Special-case findings

### `poetry-companion/`
**Nested git repo, ~1.0 MB, 30 files at depth ≤2.** Contains its own `.git/`, `.env`, `bun.lock`, `vite.config.ts`, `package.json`, `src/`, `public/`, `supabase/`, plus a `.lovable/` directory. This is a standalone Lovable scaffold for Component 3 Poetry — an independent project that happens to be checked out inside this working tree. Out of scope for prose-prep per project boundaries; safety constraint also forbids any modification here. Classification: **DO_NOT_TOUCH**. Recommended treatment in future work: either add `poetry-companion/` to `.gitignore` (so it stops showing up in `git status`) or relocate it outside this repo entirely — both are user decisions, not autonomous-cleanup decisions.

### `roles.sql`
**0 bytes. Empty file.** Created 2026-05-19. Despite the original prompt's concern that it could contain critical RLS/role configuration, the file is byte-empty — no role grants, no policies, no schema references. Still classified **DO_NOT_TOUCH** per the hard safety constraint, but the empty content lowers the urgency: this is not a high-criticality artifact waiting to be staged; it's a leftover stub. Future treatment is a user decision (delete vs leave).

### `audit/`
**~108 KB, 7 markdown files.** `AUDIT_REPORT.md` plus `stage-1.md` … `stage-6.md`, all dated 2026-05-21. The audit report itself opens with `> Read-only audit. ... Do not commit this file.` and explicitly self-instructs: *"the file is written but not staged or committed."* So the directory is **intentionally untracked output** of a prior audit pass. Tracked docs reference `audit/` and `audit/AUDIT_REPORT.md` as a known on-disk artifact. Classification: **DEFER** — the right cleanup move is to add `audit/` to `.gitignore` so the noise disappears from `git status`, but that's a deliberate `.gitignore` edit, not a `restore`/`delete`. Worth handling in its own session.

### `supabase/validation/`
**Single file, 8 KB.** `builder_content_contract.sql` — read-only SQL with four named validation checks (`unsupported_level_values`, `unsupported_active_families`, `missing_required_fields`, `active_question_route_gaps`). The path is referenced in four tracked docs from the 2026-05-22 work (`CLIENT_FAILFAST_REFACTOR`, `EDUCATION_QUOTE_METHOD_BALANCE_CURATION`, `CI_INTEGRATION_TEST_TRIAGE`, `MIGRATION_HISTORY_DRIFT_RESOLUTION`). No `package.json` script or workflow currently invokes it. Classification: **ASK_TAWI** — the SQL is plausibly the canonical Builder content-contract validation suite that *should* be tracked, but it might also be ad-hoc tooling that was meant to stay local. The contents are non-trivial and would carry no obvious harm if committed, but the directory itself has never existed in main's history, so it needs a yes/no from Tawi before staging.

### The 12 untracked migrations as a group
All 12 untracked migration files in `supabase/migrations/` correspond **exactly** to entries already present on the remote ledger (`supabase migration list --linked`, 2026-05-22; "Local | Remote" columns are equal for every row, no drift). Breakdown:

- **10 schema-remediation migrations** dated 2026-05-19 (`drop_dead_tables`, `paragraph_attempts` FKs, missing columns, ao_readiness, ao5 cleanup, themes consolidation, dead-table drops, validate_themes drop, theme vocabulary canonicalisation). Each was committed on side branch `fix/supabase-migration-history-reconciliation` (commits `c0c0a78`, `bece3aa`, `9303cca`, `37773b1`, `ab18c81`, `ae4b4b6`, `4423673`) but **the side branch was never merged into `main`**. The migrations are applied remotely (memory: "Sessions A–D + theme canonicalisation done 2026-05-19"); only the file-tracking is missing.
- **2 anon-grant migrations** dated 2026-05-21 (`20260521113124_revoke_has_role_from_anon.sql`, `20260521114316_document_has_role_anon_grant.sql`). No prior git history; these are the timestamp-aligned versions of the deleted `20260521113113` / `20260521114253` pair. Both target timestamps are on the remote ledger; the deleted ones are not.

Strong **STAGE_AS_INTENDED** group: the goal of committing these is to bring the migration ledger on disk into line with what's already applied on the linked project. Worth its own scoped session because the staging involves the *deletion pair* below in the same commit (the deletions must be accepted in the same step the untracked file is staged, or else the next dry-run will still report drift).

---

## Stale-reference scan

References to the deleted Supabase project `szdgsmpxtifrcmwelqfo` and/or the predecessor name `prose-craft-aid` are present in the following deleted-from-working-tree docs (still in HEAD, so recoverable but carry stale context):

| Path | szdgsmpxtifrcmwelqfo | prose-craft-aid |
|---|:--:|:--:|
| `docs/CODEX_AUDIT_RECOMMENDATIONS_IMPLEMENTATION_REPORT.md` | ✓ |  |
| `docs/CODEX_STAGING_AUDIT.md` |  | ✓ |
| `docs/COMPONENT_2_AO5_SCHEMA_REMEDIATION_PLAN.md` |  | ✓ |
| `docs/COMPONENT_2_STAGING_INTERPRETIVE_SCHEMA_APPLY_REPORT.md` |  | ✓ |
| `docs/IMPORT_READINESS_REPORT_2026-05-14.md` | ✓ |  |
| `docs/INACTIVE_FAMILY_TRIAGE_2026_05_22.md` |  | ✓ |
| `docs/PR14_SAFETY_VERIFICATION.md` |  | ✓ |
| `docs/REPO_IDENTITY.md` | ✓ | ✓ |
| `docs/STAGING_MIGRATION_PLAN.md` | ✓ |  |
| `docs/STAGING_READ_VALIDATION_REPORT.md` | ✓ |  |
| `docs/STAGING_SCHEMA_BLOCKED.md` | ✓ |  |
| `docs/STAGING_SCHEMA_LINK_VERIFICATION.md` | ✓ | ✓ |
| `docs/STAGING_SCHEMA_PREPARATION.md` | ✓ |  |
| `docs/SUPABASE_MIGRATION_HISTORY_RECONCILIATION_REPORT.md` | ✓ | ✓ |
| `docs/ao5-audit-2026-05-12.md` | ✓ | ✓ |
| `docs/component-2-spec-verification.md` |  | ✓ |
| `docs/contamination-audit-2026-05-12.md` | ✓ | ✓ |

(17 distinct docs.) None of the 16 untracked items contains either reference; `roles.sql` is empty. Stale references in currently-tracked files (`README.md`, `BACKEND_STATUS.md`, `docs/CI_SECRETS.md`, `docs/CI_INTEGRATION_TEST_TRIAGE_2026_05_22.md`, `scripts/validateStagingSchema.ts`, `docs/component2_ao5_schema_remediation_map.json`, `docs/COMPONENT_2_AO5_FORWARD_MIGRATION_DRAFT.sql`, `docs/Use this in **Codex** for the next pass.md`) are out of scope for this triage but are worth a separate sweep.

Carrying a stale reference is a **signal**, not a verdict. The 17 docs above are stronger candidates for an `ACCEPT_DELETION` follow-up session than the other 33 deleted docs, but each still needs Tawi's eyes before the deletion is committed — many are post-incident reports whose historical accuracy may still matter even if their project ID is stale. Listed in the DEFER section below for now.

---

## Migration pair swap (highest-confidence cleanup target)

The deletion pair and untracked pair below correspond to the same two logical migrations at different timestamps. The remote ledger shows the *new* timestamps as applied; the *old* timestamps are not on the ledger.

| Logical migration | Deleted (` D`, NOT on remote) | Untracked (`??`, ON remote) | SQL diff |
|---|---|---|---|
| revoke `has_role` from anon | `supabase/migrations/20260521113113_revoke_has_role_from_anon.sql` | `supabase/migrations/20260521113124_revoke_has_role_from_anon.sql` | byte-identical |
| document `has_role` anon grant | `supabase/migrations/20260521114253_document_has_role_anon_grant.sql` | `supabase/migrations/20260521114316_document_has_role_anon_grant.sql` | differs by 1 line (timestamp reference in doc-comment is updated to the new sibling timestamp) |

The pattern matches the prior reconciliation in commit `cc9a1e2` ("rename `20260522130000` → `20260522103943` to match the already-applied remote migration timestamp"). The same swap on the 2026-05-21 pair appears to have been performed on disk but not committed. Treat as a single coordinated cleanup: stage the two untracked files and accept the two deletions in one commit.

---

## Per-item classification table

Sorted by classification label (STAGE_AS_INTENDED → ACCEPT_DELETION → ASK_TAWI → DO_NOT_TOUCH → DEFER), then by path.

### STAGE_AS_INTENDED — 12 items

| Path | Status | Evidence | Recommended next step |
|---|---|---|---|
| `supabase/migrations/20260519141230_drop_dead_tables.sql` | `??` | On remote ledger; was committed on `fix/supabase-migration-history-reconciliation` (`c0c0a78`) but never merged to `main`. SQL body matches the applied migration per memory note "Sessions A–D done 2026-05-19". | Stage in a coordinated migration-reconciliation commit (see Follow-up session #1). |
| `supabase/migrations/20260519145653_fix_paragraph_attempts_type_and_fks.sql` | `??` | On remote ledger; committed on side branch (`bece3aa`), never merged. | Same — Follow-up session #1. |
| `supabase/migrations/20260519145819_add_missing_columns.sql` | `??` | On remote ledger; committed on side branch (`bece3aa`), never merged. | Same — Follow-up session #1. |
| `supabase/migrations/20260519165331_phase6_ao_readiness_user_id.sql` | `??` | On remote ledger; committed on side branch (`9303cca`), never merged. | Same — Follow-up session #1. |
| `supabase/migrations/20260519165451_phase8a_recreate_views_without_ao5.sql` | `??` | On remote ledger; committed on side branch (`9303cca`), never merged. | Same — Follow-up session #1. |
| `supabase/migrations/20260519165534_phase8b_drop_ao5_columns.sql` | `??` | On remote ledger; committed on side branch (`9303cca`), never merged. | Same — Follow-up session #1. |
| `supabase/migrations/20260519181413_phase7_themes_consolidation.sql` | `??` | On remote ledger; committed on side branch (`37773b1`), never merged. | Same — Follow-up session #1. |
| `supabase/migrations/20260519183737_phase_d1_drop_dead_tables.sql` | `??` | On remote ledger; committed on side branch (`ab18c81`), never merged. | Same — Follow-up session #1. |
| `supabase/migrations/20260519184203_phase_d2_drop_validate_themes.sql` | `??` | On remote ledger; committed on side branch (`ae4b4b6`), never merged. | Same — Follow-up session #1. |
| `supabase/migrations/20260519192443_theme_vocabulary_canonicalisation.sql` | `??` | On remote ledger; committed on side branch (`4423673`), never merged. | Same — Follow-up session #1. |
| `supabase/migrations/20260521113124_revoke_has_role_from_anon.sql` | `??` | On remote ledger; byte-identical to deleted `…113113` (timestamp swap). | Stage together with accepting the `…113113` deletion — Follow-up session #1. |
| `supabase/migrations/20260521114316_document_has_role_anon_grant.sql` | `??` | On remote ledger; sibling of deleted `…114253` (differs only by referencing the new timestamp). | Stage together with accepting the `…114253` deletion — Follow-up session #1. |

(12 rows.)

### ACCEPT_DELETION — 2 items

| Path | Status | Evidence | Recommended next step |
|---|---|---|---|
| `supabase/migrations/20260521113113_revoke_has_role_from_anon.sql` | ` D` | Timestamp **not** on remote ledger; superseded by `…113124` (which is on the ledger and present untracked, byte-identical). | Accept deletion in the same commit that stages the `…113124` sibling — Follow-up session #1. |
| `supabase/migrations/20260521114253_document_has_role_anon_grant.sql` | ` D` | Timestamp **not** on remote ledger; superseded by `…114316` (which is on the ledger and present untracked; diff is the doc-comment timestamp ref). | Same — Follow-up session #1. |

### ASK_TAWI — 1 item

| Path | Status | Evidence | Question for Tawi |
|---|---|---|---|
| `supabase/validation/builder_content_contract.sql` | `??` | New file, 8 KB, defines four read-only Builder content-contract validation queries (`unsupported_level_values`, `unsupported_active_families`, `missing_required_fields`, `active_question_route_gaps`). Path referenced by name in 4 tracked docs from 2026-05-22. No `package.json` script or `.github/workflows/` reference. Directory `supabase/validation/` has no prior git history. | **Should `supabase/validation/builder_content_contract.sql` be tracked as the canonical Builder content-contract validation suite (commit it), or is it ad-hoc tooling meant to remain local (`.gitignore` it)?** |

### DO_NOT_TOUCH — 2 items

| Path | Status | Evidence | Recommended next step |
|---|---|---|---|
| `poetry-companion/` | `??` | Nested git repo (~1 MB, 30 files). Lovable scaffold for Component 3 Poetry — out of scope per project boundaries. Hard safety constraint forbids modification. | Tawi-only decision: add to `.gitignore` to stop the noise, OR relocate the directory outside this repo. Not an autonomous-cleanup target. |
| `roles.sql` | `??` | 0 bytes, empty. Hard safety constraint forbids modification. Despite the original concern, contains no SQL. | Tawi-only decision: leave or delete. Not an autonomous-cleanup target. |

### DEFER — 50 items

All 50 working-tree-only deletions of docs. Each is recoverable with `git restore`. None is staged. There is no positive evidence of intentional removal (no commit message, no PR), but the simultaneous appearance of 50 deletions in the working tree suggests *some* deliberate action happened locally — possibly a manual `rm -rf docs/` for a `prose-craft-aid → prose-prep` doc cleanup that was never finished. Per the guiding principle (high bar for `SAFE_*`), every doc deletion is `DEFER` pending Tawi's review.

Within this group there are two clearly distinct sub-groups for follow-up scoping:

**DEFER (a) — 17 docs with stale `szdgsmpxtifrcmwelqfo` or `prose-craft-aid` references.** Strongest candidates for `ACCEPT_DELETION` in a follow-up. Listed in the stale-reference table above. Recommended next step: tight session that reviews these 17 docs side-by-side and decides accept-vs-restore for each.

**DEFER (b) — 33 docs without stale references.** Candidates for `SAFE_RESTORE` in a follow-up. Many are recent post-2026-05-18 reports that document on-main work (Builder UI verification, education activation, content-contract apply, etc.) and were presumably deleted by accident. Recommended next step: tight session that lists each file's last-commit message and asks: does the document still describe a current truth on `main`?

Full table (sorted alphabetically, all `DEFER`):

| Path | Status | Last commit | Stale ref? |
|---|---|---|---|
| `docs/AUDIT_FIX_REPORT_2026_05_16.md` | ` D` | `3ca0226` 2026-05-18 | – |
| `docs/AUTH_SECURITY_DECISION_2026_05_16.md` | ` D` | `3ca0226` 2026-05-18 | – |
| `docs/BLOCKERS.md` | ` D` | `bb215a7` 2026-05-14 | – |
| `docs/BROWSER_SMOKE_REMEDIATION_REPORT_2026_05_16.md` | ` D` | `3ca0226` 2026-05-18 | – |
| `docs/BROWSER_SMOKE_SUPABASE_ADVISOR_DECISION_REPORT_2026_05_16.md` | ` D` | `3ca0226` 2026-05-18 | – |
| `docs/BUILDER_UI_VERIFICATION_POST_CURATION_2026_05_22.md` | ` D` | `91f8a12` 2026-05-22 | – |
| `docs/CODEX_AUDIT_RECOMMENDATIONS_IMPLEMENTATION_REPORT.md` | ` D` | `7156808` 2026-05-18 | szdgsmpxtifrcmwelqfo |
| `docs/CODEX_STAGING_AUDIT.md` | ` D` | `bb215a7` 2026-05-14 | prose-craft-aid |
| `docs/COMPONENT_2_AO5_SCHEMA_REMEDIATION_IMPLEMENTATION_REPORT.md` | ` D` | `3ca0226` 2026-05-18 | – |
| `docs/COMPONENT_2_AO5_SCHEMA_REMEDIATION_PLAN.md` | ` D` | `3ca0226` 2026-05-18 | prose-craft-aid |
| `docs/COMPONENT_2_CANONICAL_IMPORT_AO5_REJECTION_REPORT.md` | ` D` | `3ca0226` 2026-05-18 | – |
| `docs/COMPONENT_2_CONTENT_EXPORT_AO_SWEEP_DRY_RUN_REPORT.md` | ` D` | `7156808` 2026-05-18 | – |
| `docs/COMPONENT_2_IMPORT_README.md` | ` D` | `3ca0226` 2026-05-18 | – |
| `docs/COMPONENT_2_STAGING_INTERPRETIVE_SCHEMA_APPLY_REPORT.md` | ` D` | `3ca0226` 2026-05-18 | prose-craft-aid |
| `docs/CONTENT_CONTRACT_SCHEMA_ALIGNMENT_REPORT.md` | ` D` | `c8d3518` 2026-05-14 | – |
| `docs/CONTENT_IMPORT_READINESS_NOTES.md` | ` D` | `3ca0226` 2026-05-18 | – |
| `docs/DEPLOYMENT_CHECKLIST.md` | ` D` | `bb215a7` 2026-05-14 | – |
| `docs/EDUCATION_BUILDER_FAMILY_ACTIVATION_2026_05_22.md` | ` D` | `2d49a21` 2026-05-22 | – |
| `docs/ENVIRONMENT_SECURITY_NOTES.md` | ` D` | `3ca0226` 2026-05-18 | – |
| `docs/FORWARD_BUILDER_CONTENT_CONTRACT_APPLY_2026_05_21.md` | ` D` | `4a9fdf8` 2026-05-22 | – |
| `docs/IMPLEMENTATION_SEQUENCE.md` | ` D` | `bb215a7` 2026-05-14 | – |
| `docs/IMPORT_READINESS_REPORT_2026-05-14.md` | ` D` | `d924821` 2026-05-15 | szdgsmpxtifrcmwelqfo |
| `docs/INACTIVE_FAMILY_TRIAGE_2026_05_22.md` | ` D` | `4c023cc` 2026-05-22 | prose-craft-aid |
| `docs/POST_REMEDIATION_DEPLOY_SMOKE_REPORT_2026_05_16.md` | ` D` | `3ca0226` 2026-05-18 | – |
| `docs/PR14_SAFETY_VERIFICATION.md` | ` D` | `bb215a7` 2026-05-14 | prose-craft-aid |
| `docs/PR2_STAGING_SCHEMA_MERGE_REPORT.md` | ` D` | `8278d73` 2026-05-14 | – |
| `docs/PR2_STAGING_SCHEMA_REVIEW_REPORT.md` | ` D` | `c8d3518` 2026-05-14 | – |
| `docs/PR2_STAGING_SCHEMA_REVIEW_RERUN_REPORT.md` | ` D` | `c8d3518` 2026-05-14 | – |
| `docs/QUOTE_METHODS_CURATION_STATUS_ALIGNMENT_REPORT.md` | ` D` | `c8d3518` 2026-05-14 | – |
| `docs/REPO_IDENTITY.md` | ` D` | `bb215a7` 2026-05-14 | both |
| `docs/STAGING_MIGRATION_APPLY_REPORT.md` | ` D` | `c8d3518` 2026-05-14 | – |
| `docs/STAGING_MIGRATION_PLAN.md` | ` D` | `c8d3518` 2026-05-14 | szdgsmpxtifrcmwelqfo |
| `docs/STAGING_READ_VALIDATION_REPORT.md` | ` D` | `e1d43b7` 2026-05-15 | szdgsmpxtifrcmwelqfo |
| `docs/STAGING_RECONCILIATION_MIGRATION_REVIEW.md` | ` D` | `c8d3518` 2026-05-14 | – |
| `docs/STAGING_SCHEMA_BLOCKED.md` | ` D` | `c8d3518` 2026-05-14 | szdgsmpxtifrcmwelqfo |
| `docs/STAGING_SCHEMA_LINK_VERIFICATION.md` | ` D` | `bb215a7` 2026-05-14 | both |
| `docs/STAGING_SCHEMA_PREPARATION.md` | ` D` | `c8d3518` 2026-05-14 | szdgsmpxtifrcmwelqfo |
| `docs/STAGING_SEED_CONTAMINATION_CLEANUP_REPORT.md` | ` D` | `c8d3518` 2026-05-14 | – |
| `docs/STAGING_SUPABASE_TYPES_REGENERATION_REPORT.md` | ` D` | `c8d3518` 2026-05-14 | – |
| `docs/STUDENT_PILOT_CHECKLIST.md` | ` D` | `bb215a7` 2026-05-14 | – |
| `docs/SUPABASE_MIGRATION_HISTORY_RECONCILIATION_REPORT.md` | ` D` | `7156808` 2026-05-18 | both |
| `docs/SUPABASE_SECURITY_FIX_NOTES_2026_05_16.md` | ` D` | `3ca0226` 2026-05-18 | – |
| `docs/SUPABASE_STAGING_PLAN.md` | ` D` | `bb215a7` 2026-05-14 | – |
| `docs/ao5-audit-2026-05-12.md` | ` D` | `bb215a7` 2026-05-14 | both |
| `docs/archived-ao5-glossary-2026-05-13.md` | ` D` | `bb215a7` 2026-05-14 | – |
| `docs/component-2-spec-verification.md` | ` D` | `bb215a7` 2026-05-14 | prose-craft-aid |
| `docs/contamination-audit-2026-05-12.md` | ` D` | `bb215a7` 2026-05-14 | both |
| `docs/runtime_table_import_plan.md` | ` D` | `bb215a7` 2026-05-14 | – |
| `docs/stage3-workbook-corrections-2026-05-12.md` | ` D` | `bb215a7` 2026-05-14 | – |
| `docs/tier1-library-import-smoke-test.md` | ` D` | `bb215a7` 2026-05-14 | – |

Plus 1 more `DEFER` entry not in the doc list:

| Path | Status | Evidence | Recommended next step |
|---|---|---|---|
| `audit/` (directory, 7 files, ~108 KB) | `??` | `AUDIT_REPORT.md` opens with "Do not commit this file" — intentionally untracked audit output. Referenced by name in 4 tracked docs. | Add `audit/` to `.gitignore` in its own session. Not a restore/delete decision. |

Total DEFER: **51** (50 doc deletions in the table above + 1 untracked directory entry `audit/`).

- 12 STAGE_AS_INTENDED + 2 ACCEPT_DELETION + 1 ASK_TAWI + 2 DO_NOT_TOUCH + 51 DEFER = **68** ✓ (matches `git status --short | wc -l`).

---

## Suggested follow-up sessions

Ordered by ease + safety + impact. Each is a single tightly-scoped prompt.

### #1 — Migration-ledger reconciliation (HIGHEST PRIORITY, lowest risk)
**Scope:** 12 STAGE_AS_INTENDED + 2 ACCEPT_DELETION (14 files total, all under `supabase/migrations/`).
**Action:** Stage the 12 untracked files; accept the 2 deletions; commit as a single `chore(migrations): reconcile main with applied remote ledger` commit. No `supabase db push`, no `supabase migration repair`, no schema/RLS changes. Run `supabase migration list --linked` before and after to confirm "Remote database is up to date." both times.
**Risk:** Low — every file's correspondence to the remote ledger has been verified in this triage.

### #2 — Stale-reference doc deletion review (medium risk)
**Scope:** The 17 `DEFER (a)` docs that carry `szdgsmpxtifrcmwelqfo` or `prose-craft-aid` references.
**Action:** Tawi reviews each, decides ACCEPT_DELETION vs SAFE_RESTORE per doc. Future session executes the decision.
**Risk:** Medium — each doc carries historical context; deleting it is fine if the information is captured elsewhere (or no longer relevant), but a blanket delete could lose post-incident context.

### #3 — Recent-doc restore review (low risk)
**Scope:** The 33 `DEFER (b)` docs without stale references, especially the post-2026-05-18 ones that document current on-`main` work (`BUILDER_UI_VERIFICATION_POST_CURATION_2026_05_22.md`, `EDUCATION_BUILDER_FAMILY_ACTIVATION_2026_05_22.md`, `FORWARD_BUILDER_CONTENT_CONTRACT_APPLY_2026_05_21.md`, etc.).
**Action:** Default `git restore` for each, unless review reveals it's actually obsolete.
**Risk:** Low — restoring a doc only re-introduces what's already in HEAD.

### #4 — `audit/` and `poetry-companion/` `.gitignore` hygiene
**Scope:** Two directories that should no longer appear in `git status`.
**Action:** Add `audit/` and `poetry-companion/` to `.gitignore`. Tawi-approval gate; this is the kind of `.gitignore` edit that has been explicitly forbidden in prior sessions, so it must be a deliberate top-level decision.
**Risk:** Low.

### #5 — `supabase/validation/` decision
**Scope:** The one ASK_TAWI file — `supabase/validation/builder_content_contract.sql`.
**Action:** Per Tawi's answer to the question above: either stage the file (and possibly wire it into a `package.json` script or CI workflow) or add `supabase/validation/` to `.gitignore`.
**Risk:** Low.

---

## Residual risk

- **The 50 doc deletions have no recorded intent.** No commit, no PR, no message in any prior triage report explains *why* `docs/` was wiped in the working tree. The classification is `DEFER` precisely because the absence of evidence is significant: a future cleanup session must be careful not to assume the bulk deletion was either intentional or accidental.
- **`roles.sql` is empty.** Empty files often indicate aborted writes by tooling (a `touch` without follow-up, an interrupted `> roles.sql` redirection). The hard safety constraint forbids touching it in this session; a future session should establish whether it's a placeholder for forthcoming role configuration or a leftover stub.
- **`audit/AUDIT_REPORT.md` self-instructs "do not commit"**, but a future `.gitignore` addition is still needed to remove the noise from `git status`. The audit's content is high-value pre-exam context; the directory itself is not the cleanup target.
- **`supabase/validation/` is referenced by 4 tracked docs** as if it were a known, expected on-disk artifact. If it's *not* meant to be tracked, those references should likely be updated to be explicit about its untracked status.
- **The `cc9a1e2` migration-history-alignment pattern was applied to `20260522103943` but not the `20260521*` pair.** The triage assumes the same pattern applies, but it has been left half-finished for a non-obvious reason; Follow-up session #1 should reverify the remote ledger one more time before staging.

---

## Confirmation block — what this session did NOT do

The following hard safety constraints were honoured for the entire session:

- ✗ No `git clean` in any form.
- ✗ No `git restore .`, `git checkout -- .`, `git reset --hard`, or any sweeping reset.
- ✗ No `git restore` on any individual file.
- ✗ No `git rm` or `git rm --cached` on any file.
- ✗ No deletion of any file or directory in the working tree.
- ✗ No modification to `.gitignore`.
- ✗ No `git mv`, rename, or move of any file.
- ✗ No touch (in any sense — read or otherwise) inside `poetry-companion/` beyond an `ls -la` of its top level (read-only inspection of directory listing only, no file inside `poetry-companion/` was opened or modified).
- ✗ No touch on `roles.sql` beyond `ls -la` and `wc -l` (read-only metadata; the file is 0 bytes so `wc -l` reports 0).
- ✗ No modification to any file in `supabase/` (only `git show` and direct `Read` of `supabase/config.toml`, `supabase/.temp/project-ref`, and `supabase/validation/builder_content_contract.sql` — all read-only).
- ✗ No `supabase migration repair`, `supabase db reset`, or `supabase db push` (not even `--dry-run`).
- ✗ No migrations applied, created, or edited.
- ✗ No schema, RLS, types, deploy, or content changes.
- ✗ No `gh secret set` / `gh secret delete`.
- ✗ No `git push`, force-push, history rewrite, or amended commits.
- ✗ Nothing staged other than this report.
- ✗ No other Supabase project touched (`qklfhebbrinsyfyuyiuj` and `lopjupwadwahkjyhghvb` were not contacted).
- ✗ No integration test suite run.

Only one file was created in this session: this report (`docs/WORKING_TREE_TRIAGE_2026_05_22.md`). The only mutating commands run were the eventual `git add` and `git commit` for the report itself.
