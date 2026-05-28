# Question Bank Controlled Import Runbook

## 1. Purpose and safety boundary

This runbook is the operator guide for the first controlled import of reviewed Component 2 question-bank payloads into Supabase.

It covers only the local-only question-bank importer. Do not mix in the quote-bank JSON folder, quote import scripts, model paragraph packs, annotated essay packs, or any other content pipeline during this operation.

Do not run a real Supabase write until:

- `main` is clean and verified.
- Dry-run passes.
- The report is reviewed.
- The approval artifact is generated from the same commit and branch.
- The payload checksum matches.
- Existing-ID and source/import-ID conflict checks pass.
- The receipt path is preflighted.
- The operator deliberately supplies `--write`.

The default command path remains dry-run only. A Supabase insert must require `--write`, a valid approval artifact, matching checksum, matching commit/branch metadata, a fresh dry-run pass, existing/source conflict checks, and receipt preflight.

## 2. Prerequisites

- Work from a local checkout of `Dr-T-B/prose-prep`.
- Use `main`, not a feature branch, for the real controlled import.
- Confirm PR #93 or its equivalent local-only importer changes are already merged.
- Have staging or production Supabase credentials available only in the local shell:
  - `SUPABASE_URL` or `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Confirm the target Supabase project before exporting credentials.
- Prepare a reviewed source/import ID file before write mode. Use one ID per line, or a JSON array of strings.
- Do not commit credentials, transcripts containing secrets, or raw `.env` files.

Suggested working paths:

```bash
docs/import-inputs/question-bank-source-ids.txt
docs/import-approvals/question-bank-import-approval-<commit-sha>.md
docs/import-reports/question-bank-dry-run-report-<commit-sha>.md
docs/import-receipts/question-bank-import-receipt-<commit-sha>.md
docs/import-transcripts/question-bank-import-transcript-<commit-sha>.md
```

## 3. Commands that are allowed

These commands are allowed during the controlled import:

```bash
git fetch origin
git switch main
git pull origin main
git status --short
mkdir -p docs/import-inputs docs/import-approvals docs/import-reports docs/import-receipts docs/import-transcripts
npm run typecheck
npm run lint
npm run test
npm run questions:dry-run
npm run questions:dry-run:report
npm run questions:dry-run:approve -- --approved-by "Dr T" --out docs/import-approvals/question-bank-import-approval-<commit-sha>.md
npm run questions:import:local
npm run questions:import:local -- --approval-artifact docs/import-approvals/question-bank-import-approval-<commit-sha>.md --approved-by "Dr T" --source-ids docs/import-inputs/question-bank-source-ids.txt
npm run questions:import:local -- --approval-artifact docs/import-approvals/question-bank-import-approval-<commit-sha>.md --approved-by "Dr T" --source-ids docs/import-inputs/question-bank-source-ids.txt --receipt-out docs/import-receipts/question-bank-import-receipt-<commit-sha>.md --write
```

The final command is the only command in this runbook that may write to Supabase. Run it only after the deliberate approval checkpoint in section 10.

## 4. Commands that are forbidden

Do not run any of the following during this operation:

```bash
npm run import-quotes
npm run import-quotes:write
npm run questions:import
supabase db push
supabase db reset
supabase migration up
```

Also forbidden:

- Direct SQL `insert`, `upsert`, `update`, `delete`, or `truncate` against the `questions` table.
- Browser/admin UI mutation paths for question import.
- Running the importer in CI, Vercel, or any unattended environment.
- Editing generated approval artifacts by hand.
- Adding `--write` to any command before the final approval checkpoint.
- Using `--allow-warnings` unless a separate reviewer has explicitly approved the warnings in writing.
- Using an empty `--source-ids` file merely to satisfy the gate. An empty file is acceptable only if the reviewer has explicitly confirmed there are no source/import IDs to guard.

## 5. Pre-import verification

Start from `main` and verify the local tree:

```bash
git fetch origin
git switch main
git pull origin main
git status --short
npm run typecheck
npm run lint
npm run test
```

Expected status before creating import artifacts or source-ID files:

```bash
?? docs/CODEX_AUDIT_REPORT_VERIFICATION_2026_05_25.md
```

If any other tracked or untracked file appears, stop and identify it before continuing.

Create the local artifact directories:

```bash
mkdir -p docs/import-inputs docs/import-approvals docs/import-reports docs/import-receipts docs/import-transcripts
```

Confirm no migrations or UI write paths are part of this operation:

```bash
git log --oneline -5
npm run questions:import:local
```

The importer command above must print `DRY RUN ONLY` and `No Supabase writes were performed.`

## 6. Generate dry-run report

Generate and review the dry-run:

```bash
npm run questions:dry-run
npm run questions:dry-run:report
```

Save a reviewed copy of the report:

```bash
npm run questions:dry-run:report > docs/import-reports/question-bank-dry-run-report-<commit-sha>.md
```

The report must show:

- `Validation errors: 0`
- `Warnings: 0`
- `AO compliance: passed`
- `Duplicate generated IDs: none`
- `Import readiness: REVIEWABLE, NOT IMPORTABLE`
- `No Supabase writes were performed.`

If the report changes unexpectedly, stop. Do not approve or write.

## 7. Generate approval artifact

Generate the approval artifact from the same `main` commit that produced the reviewed dry-run report:

```bash
npm run questions:dry-run:approve -- --approved-by "Dr T" --out docs/import-approvals/question-bank-import-approval-<commit-sha>.md
```

The command must print:

```text
Approval artifact written: docs/import-approvals/question-bank-import-approval-<commit-sha>.md
No Supabase writes were performed.
No migrations were performed.
```

If the command fails, stop. Do not edit the artifact by hand.

## 8. Review checksum, commit SHA and branch metadata

Open the approval artifact and verify these fields:

```text
Status: APPROVED_FOR_IMPORT_IMPLEMENTATION_ONLY
Import status: NOT IMPORTED
Supabase writes performed: NO
Migrations performed: NO
- generatedPayloadCount: 12
- payloadChecksum: <checksum>
- approvedBranch: main
- approvedCommitSha: <current-main-commit-sha>
- generatedAt: <timestamp>
```

Then verify the current checkout still matches the artifact:

```bash
git branch --show-current
git rev-parse HEAD
npm run questions:import:local -- --approval-artifact docs/import-approvals/question-bank-import-approval-<commit-sha>.md --approved-by "Dr T" --source-ids docs/import-inputs/question-bank-source-ids.txt
```

The approval preflight must pass and must still say no Supabase writes were performed. If the branch, commit SHA, payload checksum, generated count, or approval name does not match, stop and regenerate from a clean `main`.

## 9. Execute importer in dry-run mode

Run the importer without an approval artifact first:

```bash
npm run questions:import:local
```

Expected result:

- It prints `DRY RUN ONLY`.
- It prints the planned insert IDs.
- It prints the payload checksum.
- It performs no Supabase writes.

Then run approval preflight with Supabase credentials and source IDs, still without `--write`:

```bash
npm run questions:import:local -- --approval-artifact docs/import-approvals/question-bank-import-approval-<commit-sha>.md --approved-by "Dr T" --source-ids docs/import-inputs/question-bank-source-ids.txt
```

Expected result:

- Existing-ID conflict check has run through the Supabase client.
- Source/import-ID conflict check has run from `--source-ids`.
- The fresh payload checksum matches the artifact.
- The commit and branch match the artifact.
- It prints `Approval preflight passed.`
- It prints `No Supabase writes were performed.`

If the command reports a blocker, stop. Do not bypass the blocker.

## 10. Execute importer in write mode only after deliberate approval

Before running write mode, say out loud or record in the transcript:

```text
I am on main.
The dry-run report passed and was reviewed.
The approval artifact was generated from this exact commit and branch.
The payload checksum matches.
Existing-ID and source/import-ID checks have run and are clean.
The receipt path is new and will be preflighted.
I am now deliberately supplying --write.
```

Run exactly one write command:

```bash
npm run questions:import:local -- --approval-artifact docs/import-approvals/question-bank-import-approval-<commit-sha>.md --approved-by "Dr T" --source-ids docs/import-inputs/question-bank-source-ids.txt --receipt-out docs/import-receipts/question-bank-import-receipt-<commit-sha>.md --write
```

The importer must block if:

- The approval artifact is missing.
- `approvedBy` is missing or mismatched.
- `payloadChecksum` is missing or mismatched.
- `approvedCommitSha` is missing or mismatched.
- `approvedBranch` is missing or mismatched.
- Fresh dry-run validation has errors or warnings.
- Existing-ID conflicts exist.
- Source/import-ID conflict check has not run.
- Source/import-ID conflicts exist.
- The receipt path already exists or cannot be created.
- The command is running in CI or Vercel.

If the write command fails, do not rerun with changed flags. Go to failure handling.

## 11. Capture import receipt

On success, the importer writes the receipt path supplied by `--receipt-out`.

Verify the receipt contains:

```text
Question Bank Import Receipt
Import status: IMPORTED
Supabase writes performed: YES
Migrations performed: NO
Inserted count: 12
Inserted IDs: <the expected IDs>
Approved by: Dr T
Approval artifact: docs/import-approvals/question-bank-import-approval-<commit-sha>.md
Commit SHA: <current-main-commit-sha>
Timestamp: <timestamp>
```

Commit the receipt and approval/report artifacts in a follow-up documentation commit only after secrets have been checked and removed from any transcript.

## 12. Post-import verification

Verify the inserted rows in Supabase using the Supabase SQL editor or an approved read-only database client.

Suggested SQL:

```sql
select
  id,
  family,
  level_tag,
  source_type,
  authenticity_status,
  paper_code,
  text_pairing,
  ao_emphasis,
  metadata ->> 'import_batch' as import_batch
from public.questions
where metadata ->> 'import_batch' = 'questions-bank-priority-2026-05'
order by id;
```

Expected result:

- 12 rows.
- IDs match the import receipt exactly.
- `paper_code` is `9ET0/02` for every row.
- `text_pairing` is `Hard Times / Atonement` for every row.
- `source_type` is `exam-style mock` for the first controlled import payload set.
- `authenticity_status` does not claim official status.
- `ao_emphasis` references only AO1, AO2, AO3, or AO4.
- `metadata.import_batch` is `questions-bank-priority-2026-05`.

Also run the local dry-run-only command again:

```bash
npm run questions:import:local
```

This command must still be dry-run only and must not perform Supabase writes.

## 13. Failure handling

If any gate fails:

1. Stop immediately.
2. Save the command output in the operator transcript.
3. Do not edit the approval artifact by hand.
4. Do not add permissive flags.
5. Do not switch branches to make the artifact match.
6. Do not run direct SQL writes.
7. Identify which gate failed.
8. Fix the underlying source, branch, artifact, credentials, source IDs, or receipt path issue.
9. Restart from pre-import verification.

Common failure responses:

- Missing credentials: confirm the target Supabase project and re-export credentials locally.
- Checksum mismatch: regenerate dry-run report and approval artifact from the same clean commit.
- Commit or branch mismatch: return to clean `main`, pull, and regenerate the approval artifact.
- Existing-ID conflict: stop and review whether rows already exist; do not import duplicates.
- Source/import-ID conflict check not run: supply the reviewed `--source-ids` file.
- Source/import-ID conflict exists: resolve the conflicting local/source IDs before writing.
- Receipt path exists: choose a new receipt path; do not overwrite an existing receipt.

## 14. Rollback / remediation notes

The preferred rollback is a reviewed remediation plan, not an ad hoc delete.

Before the first controlled write, export or capture the current question rows from Supabase. At minimum, capture:

```sql
select *
from public.questions
order by id;
```

If the import succeeds but post-import verification fails:

- Stop using the importer.
- Preserve the receipt, approval artifact, dry-run report, and transcript.
- Identify the inserted IDs from the receipt.
- Decide remediation in a separate reviewed task.
- Prefer a targeted correction PR or controlled delete script with the same level of review.
- Do not run manual `delete from public.questions` during the import session.

If duplicate or incorrect rows are discovered, use the receipt as the source of truth for which IDs were inserted.

## 15. Operator transcript template

Use this template during the controlled import. Remove secrets before committing or sharing the transcript.

```text
# Question Bank Controlled Import Transcript

Date:
Operator:
Supabase project:
Branch:
Commit SHA:

## Pre-import verification
git fetch origin:
git switch main:
git pull origin main:
git status --short:
npm run typecheck:
npm run lint:
npm run test:

## Source IDs
Source IDs file:
Reviewer confirmation that source/import-ID file is complete:

## Dry-run report
Command:
Report path:
Validation errors:
Warnings:
AO compliance:
Payload count:
Payload checksum:
Reviewer sign-off:

## Approval artifact
Command:
Artifact path:
approvedBy:
approvedBranch:
approvedCommitSha:
generatedAt:
generatedPayloadCount:
payloadChecksum:

## Importer dry-run / approval preflight
Command:
Existing-ID check result:
Source/import-ID check result:
Approval preflight result:

## Deliberate write checkpoint
Operator statement recorded:
Receipt path:
Final write command:

## Import result
Inserted count:
Inserted IDs:
Receipt path:

## Post-import verification
SQL query run:
Row count:
ID match with receipt:
Metadata verification:
AO verification:

## Failure notes, if any
Gate that failed:
Action taken:
Next reviewed task:
```
