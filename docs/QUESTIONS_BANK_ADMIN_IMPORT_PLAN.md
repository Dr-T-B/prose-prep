# Questions Bank Admin Import Plan

## Executive summary
The expanded Pearson Edexcel Component 2 Prose question bank currently exists locally within the priority seed. However, live Supabase rows currently override this local data if active remote rows exist. This document defines safe, controlled ways to bring the reviewed local questions into remote content without ad hoc writes, and proposes an architecture for syncing metadata while preserving integrity.

## Current state
- The local seed has been expanded with reviewed priority question entries (e.g. from the Childhood/Class drafts).
- The local seed supports extended metadata such as source types and authenticity status.
- A source-status warning UI exists on the main branch, which alerts when active remote Supabase rows override a larger local fallback seed.
- Supabase currently remains the live source when active rows (`is_active = true`) exist, to prevent breaking production changes.
- No remote writes or migrations have yet been approved or performed.

## Problem to solve
- The deployed `/library/questions` page may show fewer live questions than what is available in the local seed, because remote rows override local fallbacks.
- The app needs a controlled, reviewable mechanism to sync or import these new questions into Supabase.
- Crucial academic metadata must not be lost or misrepresented during import.
- The official/exam-style classification must remain perfectly clear so that students are not presented with speculative mocks framed as official past papers.

## Non-goals
- No Supabase writes in this PR.
- No migrations in this PR.
- No import script in this PR.
- No extra questions in this PR.
- No content-source toggle in this PR.
- No AI generation.
- No AO5 functionality introduced.

## Existing local metadata fields

| Local field | Purpose | Student-facing? | Recommended Supabase representation | Notes |
| ----------- | ------- | --------------- | ----------------------------------- | ----- |
| `sourceType` | Defines origin (e.g. official past-paper vs mock) | Yes | First-class column (`source_type`) | High risk if lost; crucial for academic transparency. |
| `authenticityStatus` | Explains verification (e.g. not official) | Yes | First-class column (`authenticity_status`) | Necessary alongside `sourceType` for clarity. |
| `yearSource` | The past-paper year or internal mock batch | Yes | First-class column (`year_source`) | Needed for filtering or history checking. |
| `paperCode` | The exam paper code (e.g. 9ET0/02) | Yes | First-class column (`paper_code`) | Identifies syllabus scope. |
| `textPairing` | The books being compared | Yes | First-class column (`text_pairing`) | Core identifying data. |
| `aoEmphasis` | Main AO weighting (e.g. AO1/AO4) | Yes (often implicit) | First-class column (`ao_emphasis`) | Essential for correct matrix/essay routing. |
| `builderHandoffNotes` | Suggested prefill data for the Builder | No | JSONB (`metadata`) or local-only | Unstable, admin/internal-only review notes. |

## Current Supabase question model
Based on current adapters (`libraryAdapters.ts`) and typescript interfaces, the current remote `questions` table model likely supports the core application routing but lacks strict constraint-backed metadata.

Known existing or expected fields:
- `id` (string/UUID)
- `family` (string/enum)
- `stem` (string)
- `primary_route_id` (string)
- `secondary_route_id` (string)
- `likely_core_methods` (string array/JSONB)
- `level_tag` (string/enum)

Unknown/unverified fields (or currently loosely typed):
- It is not fully verified if `source_type`, `authenticity_status`, `year_source`, `paper_code`, `text_pairing`, `ao_emphasis`, or `builder_handoff_notes` are physically present as structured columns in Supabase, or if they are entirely missing. The adapters permit them as optional fields.

Risks from relying on assumptions:
- Blindly importing into the table may silently drop metadata fields if the columns do not exist.
- If they do not exist, a schema migration is strictly required.

## Option A: first-class Supabase columns
Adding all new local metadata fields as first-class columns (`source_type`, `authenticity_status`, `year_source`, `paper_code`, `text_pairing`, `ao_emphasis`, `builder_handoff_notes`).

- **Advantages:** Full type safety; easiest to query, filter, and review natively in the Supabase dashboard; robust constraint enforcement.
- **Disadvantages:** Wide schema; requires multiple migrations; some fields (like builder notes) might change structure over time.
- **Migration risk:** Low to moderate, as long as new columns are nullable to support legacy rows.
- **Query/filter benefits:** High; native Postgres filtering.
- **Type-safety benefits:** High; maps exactly to TypeScript types.
- **Long-term maintainability:** Stable for core fields, possibly brittle for internal notes.
- **Data-review implications:** Easy to review in table format.

## Option B: JSONB metadata column
Adding a single `metadata` or `question_metadata` JSONB column to hold all the new fields.

- **Advantages:** Extremely flexible; doesn't require schema migrations if fields are added or changed later.
- **Disadvantages:** Harder to query/index specific keys; hides structure; bypasses Postgres constraints.
- **Migration risk:** Low; only one column to add.
- **Flexibility:** Very high.
- **Type-safety trade-offs:** Low; requires application-level validation (e.g. Zod).
- **Query/filter limitations:** Requires `->>` operators which are harder to index/query natively without effort.
- **Validation requirements:** Must validate payload strictly before insertion.

## Option C: local-only metadata, remote core fields only
Keep metadata in the local seed or docs, and sync only fields that already exist remotely in Supabase.

- **Advantages:** Zero schema migration risk; fastest to implement.
- **Disadvantages:** Completely loses authenticity/source clarity in production.
- **Risk of losing authenticity/source clarity:** High; live app will not know which questions are official vs mock.
- **Acceptable for student-facing app:** No, it is unacceptable. Students must know whether a question is an official past-paper or a speculative mock.

## Option D: hybrid approach
- **First-class columns** for stable, student-facing academic fields: `source_type`, `authenticity_status`, `year_source`, `paper_code`, `text_pairing`, `ao_emphasis`.
- **JSONB metadata** for less stable review or internal admin notes: `builder_handoff_notes`.

- **Advantages:** Balances strict academic constraints with flexible tooling notes.
- **Disadvantages:** Slightly more complex migration (both columns and JSONB).
- **Migration complexity:** Moderate.
- **Likely best long-term shape:** Yes, as it enforces schema rules on exam-board data while letting builder hints evolve.

## Option E: admin import workflow without schema changes
Create a temporary admin/import workflow that imports only compatible core fields (stem, level, family, routes) into Supabase while leaving the advanced metadata to be read from a local UI toggle.

- **Why it may be useful short-term:** Bypasses migrations to get new questions live faster.
- **Why it is incomplete:** Fundamentally fractures the source of truth; live questions won't have their safety metadata attached permanently.
- **Safeguards needed:** Strict toggle guards; would need UI hacks to marry remote rows to local JSON definitions.

## Recommendation
**Option D: hybrid approach.**

- Stable academic metadata (`source_type`, `authenticity_status`, `paper_code`, `text_pairing`, `year_source`, `ao_emphasis`) deserves first-class columns because they are critical for student clarity, filtering, and exam-board compliance.
- Flexible internal notes (`builder_handoff_notes`) can live in JSONB (or remain local), allowing future admin tooling to evolve without forcing every scratchpad note into a column.
- This preserves query and filter ability while avoiding an overly wide, brittle schema.

## Proposed phased implementation

### Phase 1: schema design PR
Docs or migration draft only; no data import.
Define final fields and TypeScript types confirming the Option D hybrid schema.

### Phase 2: migration PR
Add the approved fields to the Supabase schema using backwards-compatible nullable defaults.
No bulk content import is executed in this phase.

### Phase 3: adapter compatibility PR
Update adapters (`libraryAdapters.ts`) and types so that remote rows returning with new metadata map cleanly into the UI. Keep old rows working without breaking.

### Phase 4: dry-run import tool PR
Create a local dry-run validator script that compares local seed entries against remote-compatible payloads. Ensure no remote writes happen by default. It just outputs what *would* change.

### Phase 5: reviewed import PR
Only after explicit human approval of the dry-run, run the reviewed question rows into Supabase to bring production up to parity with the local seed.

## Data validation rules
For any future import to be valid, it must enforce:
- Stable, unique IDs.
- No duplicate IDs.
- No AO5 anywhere.
- Paper code must be exactly `9ET0/02`.
- Text pairing must be exactly `Hard Times / Atonement`.
- Source type must be one of:
  - `official past-paper`
  - `adapted past-paper`
  - `exam-style mock`
  - `speculative practice`
- If `source_type` is `official past-paper`, it must require a verified source/year.
- Mock/speculative entries must not claim official status in `authenticity_status`.
- Difficulty must use existing allowed values (`secure`, `strong`, `top_band`).
- Routes must reference existing, valid route IDs.
- Likely methods must be present and meaningful.

## Safety checks before any future Supabase write
- Backup/export current remote rows.
- Run a dry-run diff and inspect.
- Perform a duplicate ID check.
- Perform a schema compatibility check against production.
- Verify the local test suite passes.
- Ensure strict typechecking via TypeScript.
- Perform manual human review of the exact JSON payload.
- Require explicit human approval.
- Document a rollback plan (e.g., down migrations or restoring the backup).

## Admin UX implications
A future admin area will likely need to:
- Preview local vs remote question counts.
- Inspect exact field differences between local seed and remote row.
- Review question metadata clearly.
- Flag any missing source authenticity before allowing an import.
- Run a "dry-run import" to see what would change before executing a write.
- Display post-import source status (as already started in PR #85).

## Risks
- **Metadata loss**: If an import script maps fields incorrectly or hits a schema missing columns.
- **Accidental official-past-paper mislabelling**: Mocks could accidentally be published as official past papers if validation isn't strict.
- **Duplicate questions**: If stable IDs change or logic inserts instead of upserts.
- **Breaking current remote rows**: If new columns aren't nullable.
- **Migration drift**: Disconnect between local types, Supabase types, and actual database schema.
- **Ad hoc Supabase writes**: Running SQL manually outside of migrations/scripts.
- **Overcomplicating schema too early**: Adding too many columns instead of a hybrid JSONB approach.
- **AO contamination risk**: Accidentally importing AO5 fields.

## AO compliance assessment
- Component 2 uses AO1, AO2, AO3, AO4 only.
- No AO5 fields, labels, filters, UI, route logic, or validation should be added or imported.
- Any future import validation script must actively reject any payload containing AO5 keys or values.

## Proposed next PR
**`docs/questions-bank-schema-decision-record`**

Purpose: Create an Architecture Decision Record (ADR) choosing the exact Supabase metadata representation before writing any database migrations. This solidifies the choice of Option D (or another option) formally.

## What was not changed
- No source files changed.
- No tests changed.
- No migrations created.
- No Supabase writes run.
- No data imported.
- No questions added.
- No AI generation added.
- No AO5 introduced.
