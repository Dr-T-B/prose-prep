# Staging Admin Browser Mutation Validation - 2026-05-25

## Summary

- Repository: `Dr-T-B/prose-prep`
- Local branch: `reconcile/annotated-essay-review-source`
- Local commit SHA: `a7ad73aa3e84cf1caf316832231224c6d945332d`
- Remote branch commit SHA: `987e0eda5e8b116cbb5a91d9bbeebdc93f59b6e9`
- Tree equivalence: local and remote commits share tree `4b220d58e0f32bd5f192bbe46d6a1e02ad43ea66`
- Pushed remote branch URL: `https://github.com/Dr-T-B/prose-prep/tree/reconcile/annotated-essay-review-source`
- Deployment URL used: `https://prose-prep-8bumxz1px-dr-t-bs-projects.vercel.app`
- Deployment type: Vercel Preview, branch-backed from `reconcile/annotated-essay-review-source`
- Supabase staging ref confirmed: `nxlxunygoccbnzdopqna`
- Production touched: No
- Secrets printed or committed: No

## Commit And Push

- Staged only the annotated essay workflow files and reports requested.
- Unrelated local files left unstaged: `src/App.tsx`, `src/components/character-pairing/`, `src/data/characterPairingSeed.ts`, `src/pages/Phase3Dashboard.tsx`, `src/types/characterPairing.ts`.
- `git push` over HTTPS failed twice with GitHub remote `Internal Server Error`.
- Fallback used: GitHub Git Data API created the remote branch commit with the same 14-file tree as the local commit.
- Push result: Succeeded via API; remote branch exists at SHA `987e0eda5e8b116cbb5a91d9bbeebdc93f59b6e9`.

## Target Row

- Table: `paragraph_stems`
- Row id: `ps_ao2_01`
- Reason: non-critical paragraph stem, not part of the already-approved essay chain.
- Mutation method: authenticated admin browser UI only.
- Review note used: `Staging browser validation note — admin mutation path verified.`

## Before State

| Field | Value |
| --- | --- |
| `verification_status` | `teacher review required` |
| `reviewed` | `false` |
| `reviewed_at` | `null` |
| `reviewed_by` | `null` |
| `approved_at` | `null` |
| `approved_by` | `null` |
| `review_notes` | `null` |
| `correction_notes` | `null` |

## After Reviewed

| Field | Value |
| --- | --- |
| `verification_status` | `reviewed` |
| `reviewed` | `true` |
| `reviewed_at` | `2026-05-25 09:22:34.942+00` |
| `reviewed_by` | `0c536f97-e5a0-445b-9582-5baf6ec9cdf4` |
| `approved_at` | `null` |
| `approved_by` | `null` |
| `review_notes` | `Staging browser validation note — admin mutation path verified.` |
| `correction_notes` | `null` |

## After Approved

| Field | Value |
| --- | --- |
| `verification_status` | `approved` |
| `reviewed` | `true` |
| `reviewed_at` | `2026-05-25 09:22:34.942+00` |
| `reviewed_by` | `0c536f97-e5a0-445b-9582-5baf6ec9cdf4` |
| `approved_at` | `2026-05-25 09:25:19.101+00` |
| `approved_by` | `0c536f97-e5a0-445b-9582-5baf6ec9cdf4` |
| `review_notes` | `Staging browser validation note — admin mutation path verified.` |
| `correction_notes` | `null` |

## Browser UI Validation

- `/admin` opened after staging admin login.
- `Annotated essays` tab opened.
- Target row was selected from the review table.
- Review note was entered in the UI.
- `Mark reviewed` was clicked in the UI.
- Supabase confirmed reviewed state and metadata before approval.
- `Approve` was clicked in the UI.
- Supabase confirmed approved state and metadata.
- SQL helper fallback was not used for mutation.

## Non-Admin Denial

- Logged-out browser route check: `/admin` redirected to `/auth`.
- Direct anon no-op update attempt against `paragraph_stems.ps_ao2_01`: blocked by RLS signal, status `200` with zero returned rows.
- Post-denial row check: row remained `approved` with review/approval metadata intact.

## Student-Facing Verification

- `/annotated-essays` loaded without fatal error.
- Page displayed `Content source: live Supabase`.
- Deployed browser network observed only `nxlxunygoccbnzdopqna.supabase.co` among Supabase hosts.
- Raw Supabase errors visible: No.
- `draft` / `retired` status text visible: No.
- Approved status badges visible: Yes.
- Target stem was approved in data but was not the currently surfaced drill stem in the default/AO2 visible drill panel, because the page displays one active drill stem from the current filtered set.

## AO5 Confirmation

- Annotated essay controls observed: `Show all`, `AO1 only`, `AO2 only`, `AO3 only`, `AO4 only`, `Hide annotations`.
- Drill AO focus options observed: `All`, `AO1`, `AO2`, `AO3`, `AO4`.
- AO5 filter/control present: No.
- Note: the page contains explanatory copy saying the pack does not create AO5 scoring fields; that is not a control.

## Checks

- Pre-commit `npm run typecheck`: Passed.
- Pre-commit `npm test -- --run`: Passed, 139 passed and 3 skipped.
- Pre-commit `npm run build`: Passed.
- Pre-commit `npm run lint`: Passed with 0 errors and 24 existing warnings.
- Branch-backed Vercel build: Passed; remote tests reported 139 passed and 3 skipped.
- Post-mutation focused tests: `npm test -- --run src/components/admin/AnnotatedEssayReview.test.tsx src/pages/AnnotatedEssayPack.test.tsx src/hooks/useAnnotatedEssayPackContent.test.ts` passed, 19 passed.

## Defects Found

- GitHub HTTPS push returned remote `Internal Server Error`; resolved by publishing the same commit tree through GitHub Git Data API.
- Headless browser automation needed to invoke the Radix tab `onMouseDown` handler for the `Annotated essays` tab; plain click did not switch tabs in that automation context.
- One paused browser automation process could not be resumed through the tool stdin pipe after the reviewed checkpoint. Approval was completed by attaching to the same authenticated browser session through Chrome debugging.

## Fixes Made

- No application code fixes were required.
- Temporary Vercel protection bypass records created by Codex validation were cleaned up; cleanup probe saw and revoked two Codex-created records.

## Remaining Risks

- Local branch commit SHA differs from the remote branch commit SHA because the normal `git push` path failed and the API-created commit has different commit metadata, although both commits have the same tree.
- Unrelated Phase 3 / character-pairing work remains in the local working tree and is intentionally uncommitted.
- The target row is now approved in staging and should be treated as a real staged content promotion.
- Existing lint warnings and bundle-size warnings remain out of scope for this pass.

## Recommended Next Step

Open a PR from `reconcile/annotated-essay-review-source`, review the branch-backed Vercel preview, and decide whether the single approved `paragraph_stems.ps_ao2_01` staging mutation should remain as the validation marker or be reset for future review drills.
