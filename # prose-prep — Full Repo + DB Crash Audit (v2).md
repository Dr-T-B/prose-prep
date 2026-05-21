# prose-prep — Full Repo + DB Crash Audit (v2)

Read-only audit. Findings only. No fixes, no migrations, no deploys.

## Runtime

- **Model:** your call. Opus is recommended for the cross-file reasoning in
  Stages 4–6; Sonnet is acceptable for Stages 1–3. Do not silently switch
  mid-audit.
- **Permissions:** do NOT use `--dangerously-skip-permissions`. Run with
  an explicit allowlist:
  - Read, Grep, Glob — always allowed.
  - Bash — allowed only for: `git`, `npx tsc`, `npm ls`, `grep`, `rg`, `ls`,
    `cat`, `wc`. No `git push`, no `npm install` without asking, no `rm`.
  - Supabase MCP — read-only tools only:
    `list_tables`, `list_migrations`, `list_extensions`, `list_edge_functions`,
    `get_edge_function`, `get_advisors`, `get_logs`, `execute_sql` (SELECT
    only), `generate_typescript_types`. Forbidden: `apply_migration`,
    `deploy_edge_function`, `create_branch`, `merge_branch`,
    `reset_branch`, any DDL/DML via `execute_sql`.
  - Write — forbidden except for the two output paths declared below
    (`audit/stage-N.md` and `AUDIT_REPORT.md`).
  - Edit — forbidden for the duration of the audit.

## Context

- Repo: `Dr-T-B/prose-prep`
- Local: `~/Downloads/Projects/prose-prep`
- Supabase project (the ONLY one to touch): `nxlxunygoccbnzdopqna`
- Deployed: `prose-prep.vercel.app`
- Stack: Vite + React + TypeScript + Supabase + Vercel
- Exam: Component 2 Prose, Mon 1 June 2026 (11 days from 2026-05-21)

**Off-limits Supabase projects — never touch, never query, never reference
in any tool call:**
- `lopjupwadwahkjyhghvb` (drama-tutor)
- `qklfhebbrinsyfyuyiuj` (year-9)

**Pre-flight check (do this before Stage 1):** grep the repo for both
project ref strings above. If either appears outside a comment, surface
it immediately as a CRASH-level finding and ask before proceeding.

**AO rules for Component 2 — never violate:**
- Assesses **AO1, AO2, AO3, AO4** only.
- **AO5 is NOT assessed.** Any AO5 reference in DB, seed data, types, UI,
  prompts, or comments is a HIGH-severity bug (CRASH if it reaches user
  output).

## Problem

The app is crashing in too many places. I need a complete, systematic
audit of both the codebase AND the live database to find every code
error, null-safety hole, schema mismatch, and crash vector — not just
the ones I've already hit.

## Operating rules — read these before you start

1. **Think aloud.** Before each file read, each DB query, each
   conclusion: state what you are doing and why in one short line. No
   silent tool calls beyond trivial follow-up reads.

2. **Ignore historic memory.** This includes: anything you "remember"
   about this repo, CLAUDE.md, prior session notes, PR descriptions,
   README claims, commit messages, AND the auto-memory `MEMORY.md`
   injected by the harness. Verify every fact by reading the actual
   file or querying the live DB. If code contradicts docs, the code
   wins — flag the doc as stale.

3. **Stages are mandatory and sequential.** No skipping. No merging. Do
   not start Stage N+1 until Stage N is signed off by me.

4. **Persist as you go.** At the end of each stage, write the stage's
   findings table to `audit/stage-N.md` in the repo (this folder is
   the only place writes are allowed outside `AUDIT_REPORT.md`). This
   exists so we don't lose work if the session truncates.

5. **Pause after every stage.** At the end of each stage:
   - Write the stage summary (findings + open questions + counts by
     severity) to `audit/stage-N.md`.
   - Emit a self-verification checklist in chat — one line per
     numbered task in that stage, marked `[x] done` / `[ ] not done`
     with a one-line note. If any box is unchecked, return to the
     stage and finish before pausing.
   - STOP. Output: `Stage N complete. Awaiting approval to proceed.`
     Do not continue until I reply.

6. **No fixes during the audit.** Read-only. Do not edit code, run
   migrations, deploy, or mutate the DB. Findings only.

7. **One finding per row.** Use this format throughout — stable IDs so
   later stages can cite earlier ones:

   `| ID | Severity | Area | File / Table | Line / Column | Issue | Evidence | Suggested Fix |`

   IDs are `S{stage}-{nnn}` (e.g. `S2-014`).

   **Severity definitions:**
   - **CRASH** — will throw / blank-screen on the golden path with
     realistic seed data. Reproducible.
   - **HIGH** — will throw on a plausible edge case (empty array, null
     join, missing FK), OR breaks an AO rule, OR exposes secrets.
   - **MEDIUM** — degrades correctness or UX but does not crash (wrong
     score, stale data, missed RLS on a low-risk table).
   - **LOW** — code smell, dead code, minor type drift, unused export.
   - **INFO** — observation worth recording, no action required.

8. **Evidence required.** Every finding must cite an exact file path
   + line number, OR the exact DB object + the SELECT you ran. No
   vague claims, no "looks like", no "probably".

9. **Carry findings forward.** Later stages MUST reference earlier
   stage IDs when relevant (e.g. a Stage 5 route entry citing the
   Stage 4 crash vectors that live on it).

10. **Bound your output.** Cap each stage's main table at the 50 most
    important findings; put the rest in an appendix table in the same
    `audit/stage-N.md` file. "Important" = highest severity first,
    then highest blast radius.

---

## Stage 1 — Inventory (ground truth)

Objective: Build a complete, verified map of what actually exists.
Do not analyse yet — just inventory.

Tasks:
- 1.1  List every route registered in `App.tsx` with its path, element,
       and lazy-loaded chunk if any. Report the total count. (I'll
       confirm whether it matches my expectation of ~26.)
- 1.2  List every page component, shared component, hook, util, and
       repo / data-layer file. Group by directory.
- 1.3  List every edge function in `supabase/functions/`. For each,
       note the entry file and any imported helpers.
- 1.4  Using the Supabase MCP pinned to `nxlxunygoccbnzdopqna`, list:
       - every table with columns, types, nullability, defaults, PKs;
       - every RLS policy (table, name, command, qual, with-check);
       - every migration in `supabase/migrations/` vs `list_migrations`
         output — flag drift in either direction.
- 1.5  List every secret/env var read by edge functions vs declared in
       `.env*` files vs (from observation) what the deployed function
       expects. Do not print values — names only.

Deliverable: 5 plain lists in `audit/stage-1.md`. No opinions yet.

PAUSE. Self-verify. Await approval.

---

## Stage 2 — Type system integrity

Objective: Find every mismatch between TypeScript types and reality.

Tasks:
- 2.1  Run `npx tsc --noEmit` and capture every error. If `node_modules`
       is missing, stop and ask before running `npm install`.
- 2.2  Diff `src/integrations/supabase/types.ts` (or wherever generated
       types live — confirm path) against the live schema from Stage 1.
       Flag every drift: missing column, wrong nullability, wrong type,
       removed table still typed, new table not typed, wrong enum
       values.
- 2.3  Find every `as any`, `@ts-ignore`, `@ts-expect-error`, and
       non-null assertion (`!`) — list each with file:line and one-line
       context.
- 2.4  Find every place where DB query results are used without
       checking `error` or guarding `data` for null / empty array.

Deliverable: findings table in `audit/stage-2.md`.

PAUSE. Self-verify. Await approval.

---

## Stage 3 — Database & RLS audit

Objective: Find schema problems and access-control bugs.

Tasks:
- 3.1  For every table, confirm RLS is enabled and policies exist for
       the operations the frontend actually performs (cross-reference
       with the component list from Stage 1.2).
- 3.2  Find **nullability mismatches between code and DB** in both
       directions:
       (a) columns the frontend treats as required (no null guard,
           non-optional in types) but the DB declares nullable;
       (b) columns the DB declares NOT NULL but the frontend defensively
           treats as nullable (lower priority — note as INFO).
       Run sample SELECTs to spot rows that exhibit (a) in practice.
- 3.3  For every FK relationship, check for orphaned rows with a
       targeted SELECT. List counts.
- 3.4  Audit `ao_readiness` specifically:
       - composite PK present and used correctly?
       - score mapping (L1→20, L2→40, L3→60, L4→80, L5→95) — find the
         code that implements this and verify the constants. Flag any
         off-by-one or alternate mapping elsewhere in the repo.
- 3.5  Search the entire repo (code, migrations, seed SQL, types,
       prompts, UI strings) for any reference to `AO5` / `ao5` /
       `ao_5`. Flag every one. Per the AO rules above this is HIGH or
       CRASH.
- 3.6  Grep the entire repo for the strings `lopjupwadwahkjyhghvb` and
       `qklfhebbrinsyfyuyiuj`. Any occurrence outside a comment is a
       CRASH finding — surface immediately.
- 3.7  Run `get_advisors` (security + performance) on the Supabase
       project and fold results into the findings table.

Deliverable: findings table in `audit/stage-3.md`.

PAUSE. Self-verify. Await approval.

---

## Stage 4 — Runtime crash vectors

Objective: Find every code path that can throw at runtime, ranked by
likelihood of firing on realistic data.

Tasks:
- 4.1  Trace data flow DB → repo → hook → component for each route's
       primary data source. Find every property access on a value that
       could be null/undefined.
- 4.2  Find every `.map` / `.filter` / `.reduce` / spread on a value
       not statically guaranteed to be an array.
- 4.3  Find every `JSON.parse` without try/catch.
- 4.4  Find every async function whose errors are not caught at the
       call site or by a wrapping boundary.
- 4.5  Find every fetch / SSE call without abort, timeout, or error
       handling. Note SSE reconnect behaviour separately.
- 4.6  Find every `useEffect` with a missing or wrong dependency
       array. Distinguish "missing dep that would cause stale data"
       from "missing dep that's deliberately omitted".
- 4.7  Find every route in `App.tsx` that is NOT wrapped in an
       `ErrorBoundary` (or whose boundary cannot catch the failure
       mode in question).

Output rules: rank by likelihood-of-firing. Top 50 in the main table
with explicit "likely to fire because…" notes; rest in an appendix.

Deliverable: ranked findings table in `audit/stage-4.md`.

PAUSE. Self-verify. Await approval.

---

## Stage 5 — Route-by-route smoke audit

Objective: For each route from Stage 1.1, confirm it can render with
realistic data and identify what would crash it.

Tasks:
- 5.1  For each route, read the page component and its direct children.
       Produce one row with columns:
       `Route | Path | Component | Tables/queries used | Required props | Empty-result behaviour | Null-data behaviour | Error behaviour | Stage 4 IDs that live here | Stage 2/3 IDs that live here | Verdict`
       Verdict ∈ `SAFE | DEGRADED | CRASH | UNKNOWN`.
- 5.2  Flag any route whose data dependency does not exist in the DB
       (Stage 1.4 schema), or exists but is empty in production (run
       a `SELECT count(*)`).

Deliverable: one-row-per-route table in `audit/stage-5.md`.

PAUSE. Self-verify. Await approval.

---

## Stage 6 — Edge function audit

Objective: Audit `mark-component2-essay` end-to-end; scope-check any
other edge functions found in Stage 1.3.

Tasks:
- 6.1  Read `supabase/functions/mark-component2-essay/index.ts` in full.
- 6.2  Verify all 7 data-injection blocks (questions, routes,
       comparative_matrix, theses, glossary_terms, quote_methods,
       interpretive_tensions) query the correct tables with the
       correct shapes. Confirm against Stage 1.4 schema.
- 6.3  Verify the SSE section-tag protocol
       (`<section:NAME>…</section:NAME>`) matches the frontend parser.
       Find any drift between producer and consumer.
- 6.4  Verify the rate limit (10 / user / hour via
       `essay_marker_results`) is correctly implemented — query the
       table and confirm the limit math.
- 6.5  Verify the `QuoteDiagnostic` shape (`{ quote, status, note }`)
       is enforced on both producer and consumer.
- 6.6  Confirm model string is `claude-opus-4-7` (or whichever current
       ID — flag if drifted) and `max_tokens` handling is correct.
- 6.7  Find any place where secrets could leak to the client bundle
       (env vars referenced without `SUPABASE_` server prefix
       discipline, secrets in error messages returned to the client,
       etc.).
- 6.8  For every OTHER edge function listed in Stage 1.3, do a
       lightweight pass: list inputs, outputs, secrets read, and the
       single most likely failure mode. Mark out-of-scope deeper
       audits as INFO.

Deliverable: findings table in `audit/stage-6.md`.

PAUSE. Self-verify. Await approval.

---

## Stage 7 — Consolidated report + remediation plan

Objective: One document I can act on.

Tasks:
- 7.1  Merge all findings from Stages 2–6 into a single prioritised
       list, sorted: CRASH → HIGH → MEDIUM → LOW → INFO. Preserve
       stage IDs so each item is traceable.
- 7.2  For each CRASH and HIGH item, propose the minimum fix and an
       effort estimate (XS / S / M / L). Note dependencies between
       fixes.
- 7.3  Identify any finding that blocks Neha from using the app for
       daily essay marking between now and 1 June 2026. Call this set
       out as a "must-fix-before-exam" subsection.
- 7.4  Write the report to `AUDIT_REPORT.md` in the repo root. Do not
       commit. Do not stage. Just write the file.

Deliverable: `AUDIT_REPORT.md` + a one-screen summary in chat
(counts by severity, top 5 must-fix items, total estimated effort).

PAUSE. Self-verify. Done.

---

## Final reminders

- No fixes in this session. Audit only.
- If you discover something so dangerous it must be fixed immediately
  (exposed secret, data-loss risk, off-limits-project reference in
  live code), STOP the audit, surface it in chat, and ask before
  continuing.
- If any stage uncovers facts that invalidate an earlier stage,
  return to the earlier stage and re-verify before proceeding.
- If you find yourself wanting to skip a self-verify checklist
  because "it's obvious it's done" — that's exactly when you must
  emit it.
