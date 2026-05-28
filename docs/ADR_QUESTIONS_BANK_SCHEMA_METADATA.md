# ADR: Questions Bank Schema Metadata

## Status

Accepted for future implementation; not yet implemented.

## Date

2026-05-28

## Context

* the local seed now contains reviewed priority questions
* live Supabase rows currently override local seed rows when active rows exist
* the source-status warning surfaces this mismatch
* future import/sync requires a clear schema decision
* metadata is necessary to preserve exam-board authenticity, paper code, source type, text pairing, and AO emphasis
* `builderHandoffNotes` is useful but less stable and more internal than academic metadata

## Decision

Adopt a hybrid Supabase metadata model for the Questions Bank.

Future migration should add first-class nullable columns:

* `source_type`
* `authenticity_status`
* `year_source`
* `paper_code`
* `text_pairing`
* `ao_emphasis`

Future migration should also add a nullable JSONB column:

* `metadata`

The JSONB `metadata` column should contain flexible/non-core fields such as:

* `builder_handoff_notes`
* review notes
* import batch identifiers
* validation warnings
* future admin-only metadata

Do not add:

* AO5 fields
* AO5 labels
* AO5 validation
* AO5 route logic
* AO5 UI metadata

## Decision drivers

* academic traceability
* exam-board authenticity control
* student-facing clarity
* future filtering/querying
* backwards compatibility with existing remote rows
* safe incremental migration
* avoiding over-wide schemas
* preserving flexible admin notes
* avoiding ad hoc Supabase writes

## Considered options

### Option A: first-class columns only

Pros: Strong typing and direct queryability.
Cons: Overly rigid, leading to schema bloat when flexible administrative fields (like review notes) are added.

### Option B: JSONB metadata only

Pros: Maximum flexibility without altering table schema for every new metadata field.
Cons: Poor query performance, harder to enforce data integrity for core academic identifiers.

### Option C: local-only metadata

Pros: Requires no Supabase schema changes.
Cons: Prevents server-side filtering, fails to preserve metadata for questions synced from live environments, and offers no centralized remote storage.

### Option D: hybrid first-class columns plus JSONB metadata

Pros: Balances strong typing and queryability for stable academic fields with flexibility for internal administrative notes.
Cons: Slightly more complex schema and adapter mapping.
Decision: This is the chosen option.

## Column decision table

| Future Supabase field   | Representation              | Nullable? | Reason | Student-facing?          | Notes |
| ----------------------- | --------------------------- | --------: | ------ | ------------------------ | ----- |
| `source_type`           | first-class text column     |       Yes | Core academic attribute needed for filtering | Yes                      |       |
| `authenticity_status`   | first-class text column     |       Yes | Essential for traceability and exam-board compliance | Yes/internal hybrid      |       |
| `year_source`           | first-class text column     |       Yes | Core academic attribute for historical context | Yes/internal hybrid      |       |
| `paper_code`            | first-class text column     |       Yes | Specific and stable identifier for exams | Yes                      |       |
| `text_pairing`          | first-class text column     |       Yes | Critical for matching questions to content | Yes                      |       |
| `ao_emphasis`           | first-class text column     |       Yes | Stable assessment objectives needing direct queries | Internal/student support |       |
| `metadata`              | JSONB column                |       Yes | Flexible container for non-core administration | Internal                 |       |
| `builder_handoff_notes` | JSONB key inside `metadata` |       Yes | Too specific/internal for a first-class column | Internal                 |       |

## Metadata JSONB shape

```json
{
  "builder_handoff_notes": "Prefill theme: class; route: social conditioning vs moral responsibility",
  "review_notes": [],
  "import_batch": "questions-bank-priority-2026-05",
  "validation_warnings": []
}
```

* this is a proposed shape, not implemented in this PR
* JSONB keys should be optional
* validators should tolerate missing metadata
* no AO5 keys should be allowed

## Validation rules for future migration/import

* `source_type` must be one of:
  * `official past-paper`
  * `adapted past-paper`
  * `exam-style mock`
  * `speculative practice`
* `official past-paper` requires verified source/year information
* `paper_code` must be `9ET0/02` for this question bank
* `text_pairing` must be `Hard Times / Atonement`
* `ao_emphasis` must contain AO1/AO2/AO3/AO4 only
* reject AO5 anywhere in first-class fields or JSONB metadata
* question IDs must remain stable and unique
* difficulty values must remain within the current allowed set
* remote rows without metadata must remain valid

## Backwards compatibility

* all new fields should be nullable
* existing Supabase rows must continue to load
* adapters must tolerate missing metadata
* Questions UI must not display raw undefined/null values
* source-status warning must continue to work

## Migration implications

The future migration should:

* add nullable columns only
* avoid destructive changes
* avoid immediate bulk imports
* be followed by adapter compatibility checks
* be followed by dry-run import tooling
* include rollback notes
* not run any remote write unless explicitly approved

## Import workflow implications

1. validate local seed entries
2. produce dry-run payload
3. compare against current remote rows
4. review duplicate IDs
5. review metadata classification
6. human approval
7. controlled import/sync
8. post-import verification of `/library/questions`

## Admin UX implications

The admin interface should eventually support:

* local vs remote row counts
* source-status display
* metadata preview
* authenticity review
* dry-run import result
* validation warnings
* post-import audit trail

## Consequences

### Positive consequences

* stable fields are queryable
* flexible metadata remains flexible
* existing rows remain valid
* future admin tooling has a clear target
* authenticity metadata is preserved

### Negative consequences

* slightly more schema complexity
* JSONB validation must be disciplined
* hybrid model needs clear adapter mapping
* future migration still required

## Risks and mitigations

* accidental official-past-paper mislabelling
  * Mitigation: Require manual human review step for `official past-paper` validation and strictly enforce verified source info.
* AO5 contamination
  * Mitigation: Strictly validate that AO5 is not present in both first-class columns and JSONB payload; drop/reject on detection.
* metadata loss during import
  * Mitigation: Dry-run import tooling should output comprehensive diffs before any remote write.
* duplicate IDs
  * Mitigation: The workflow requires a comparison against current remote rows and reviewing duplicate IDs prior to import.
* schema drift between local seed and Supabase
  * Mitigation: Adapter compatibility checks will bridge the gaps, while nullable columns avoid immediate breakages.
* ad hoc remote writes
  * Mitigation: Enforce dry-run payloads and human approval checks prior to execution.
* student-facing clutter
  * Mitigation: Keep raw metadata hidden from the standard Questions UI unless structured for the source-status warning or appropriate labels.

## AO compliance

* Component 2 Prose uses AO1, AO2, AO3, AO4 only
* no AO5 fields should be added
* future validators should reject AO5 in first-class columns and JSONB metadata
* no AO5 UI, filters, labels, route logic, or schema should be introduced

## Proposed next PR

`feat/questions-bank-schema-metadata-migration-draft`

Purpose:
Create a migration draft or local-only migration file adding the approved nullable metadata columns and JSONB column, but do not run Supabase writes or apply remote migrations without explicit approval.

If migration work is not yet approved, use:

`docs/questions-bank-migration-dry-run-plan`

## What was not changed

* no source files changed
* no tests changed
* no migrations created
* no Supabase writes run
* no data imported
* no questions added
* no AI generation added
* no AO5 introduced
