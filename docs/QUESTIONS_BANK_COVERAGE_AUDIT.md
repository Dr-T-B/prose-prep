# Questions Bank Coverage Audit

## Executive summary
At the original audit time, the live Questions page showed only 5 entries because the application fetched active rows from the remote Supabase `questions` table before falling back to the 33 broader questions defined locally in `src/data/seed.ts`. That exact live count should be reverified before any data import decision, but the architectural issue remains: any non-empty remote `questions` result shadows the local fallback.

Post-amendment status: main now includes `supabase/migrations/20260528131629_add_question_bank_metadata.sql`, which adds question-bank metadata columns for source type, authenticity status, source year/note, paper code, text pairing, AO emphasis, and flexible metadata. The schema gap identified in the original audit is therefore no longer a "missing columns" blocker in the repository. The remaining blockers are verified past-paper coverage, metadata population, import validation, and confirming the runtime database state before any write.

## Trigger for audit
Live UI inspection of `/library/questions` revealed 5 entries at audit time (covering Class, Guilt, Imagination, Childhood, and Education), which was insufficient for full Component 2 exam preparation. This amendment did not rerun a live Supabase read; treat the exact count as historical until reverified.

## Commands run
```bash
git switch main
git pull --ff-only origin main
git fetch --prune origin
git status --short
git switch -c audit/questions-bank-coverage
git rebase origin/main
npm run validate:component2-ao
git diff --check
```

## Files inspected
- `src/pages/library/Questions.tsx` (the Questions page UI)
- `src/lib/ContentProvider.tsx` (exposes content bundle via React context)
- `src/lib/contentRepo.ts` (fetches from Supabase with local fallback)
- `src/lib/libraryAdapters.ts` (maps raw DB/seed rows to UI-friendly types)
- `src/data/seed.ts` (contains 33 fallback questions across 12 theme families)
- `supabase/migrations/20260528131629_add_question_bank_metadata.sql` (adds metadata columns to `questions`)
- `src/integrations/supabase/types.ts` (generated types now include the metadata fields)

## Current Questions page behaviour
The `Questions.tsx` page retrieves the content bundle using `useContent()`. The data is mapped via `toLibraryQuestions()`. The UI displays a `QuestionCard` for each question, showing its theme family, difficulty level band, question stem, primary route, secondary route, and likely methods. It includes a "Use in Builder" button which calls `queueBuilderHandoff` and navigates to the Essay Builder.

## Original 5-question source
The 5 questions observed at audit time originated from the live Supabase database. The `loadContent()` function in `src/lib/contentRepo.ts` runs the query `supabase.from("questions").select("*").eq("is_active", true)`. If Supabase returns any active rows, the application uses them and ignores the 33 questions defined locally in `src/data/seed.ts` (`LOCAL_BUNDLE.questions`). The exact current live row count should be rechecked with a read-only query before any import or cleanup plan.

## Current question schema

| Field | Current use | Required for full bank? | Notes |
|---|---|---|---|
| `id` | Unique identifier | Yes | |
| `family/theme` | Groups questions by theme | Yes | Matches `QuestionFamily` |
| `difficulty` | Displays difficulty band | Yes | Values: `secure`, `strong`, `top_band` |
| `question text` | Displays the question stem | Yes | Displayed via `stem` field |
| `primary route` | Connects to a primary route | Yes | Connects to `routes` via `primary_route_id` |
| `secondary route` | Connects to a secondary route | Yes | Connects to `routes` via `secondary_route_id` |
| `likely methods` | Displays suggested methods | Yes | Stored as `string[]` |
| `year/source note` | Schema column now exists | Yes | `year_source`; still needs population and verification. |
| `paper code` | Schema column now exists | Yes | `paper_code`; needed to identify 9ET0/02. |
| `source type` | Schema column now exists | Yes | `source_type`; official/adapted/mock/speculative classification. |
| `exam-board authenticity` | Schema column now exists | Yes | `authenticity_status`; still needs source-backed review. |
| `text pairing` | Schema column now exists | Yes | `text_pairing`; e.g. Hard Times / Atonement. |
| `AO emphasis` | Schema column now exists | Yes | `ao_emphasis`; must remain AO1/AO2/AO3/AO4 only. |
| `builder/admin metadata` | Schema column now exists | Yes | `metadata` JSONB can hold review/import/handoff notes; UI handoff remains dynamic. |

## Current coverage gaps
1. **Database coverage**: The live database showed only 5 active questions at audit time, whereas the local seed contains 33 (covering 12 theme families). Reverify the current remote count before acting.
2. **Metadata population**: The repository schema now supports source/authenticity metadata, but the question rows still need verified values before being treated as a full bank.
3. **Past-paper coverage**: We currently lack verified Pearson Edexcel 9ET0/02 past-paper questions for the Hard Times / Atonement pairing (Theme: Childhood).

## Required Component 2 coverage
We need a full question bank for:
- **Board**: Pearson Edexcel A-Level English Literature
- **Component**: Component 2: Prose (Paper 9ET0/02)
- **Theme**: Childhood
- **Text pairing**: Hard Times & Atonement

Coverage must include:
- Known past-paper question stems where verifiable.
- Mock/exam-style stems for coverage gaps.
- Tier 1 recurring themes: childhood, education, class, family, gender, guilt, memory, imagination, violence/war, setting/place, relationships, responsibility/morality, endings, narrative truth/authorship.

## Official vs exam-style classification rules
To preserve academic integrity, questions should be strictly classified as:
- **official past-paper**: Exact wording from a Pearson Edexcel 9ET0/02 past paper.
- **adapted past-paper**: Slightly modified from a past paper to fit a different focus.
- **exam-style mock**: Specifically designed to mimic the board's style for a high-priority theme.
- **speculative practice**: Designed for targeted skill-building or exploring niche themes.

## Option A: local static question expansion
Update `src/data/seed.ts` with metadata-aligned fields and more questions. Would require either a local-first product decision or a later sync/import path so the remote dataset no longer shadows fuller local coverage.

## Option B: Supabase-backed question bank
Use the existing metadata columns and insert/update verified rows. This no longer requires a new metadata schema migration, but it still requires careful import validation, remote-state verification, and explicit approval before any Supabase write.

## Option C: hybrid local-first expansion
Build the full canonical question bank locally first using the existing metadata shape, test it, then import to Supabase later.

## Option D: docs-only question bank draft first
Draft the full question set with authenticity metadata in a Markdown document for review before performing any code or schema changes.

## Option E: defer pending official verification
Wait until official past papers are provided and verified before proceeding.

## AO compliance assessment
Component 2 Prose strictly assesses AO1, AO2, AO3, and AO4. There are no mentions of AO5 in the local seed, the current UI, or the schema. All planned expansions must continue to strictly avoid AO5 scoring, labels, filters, fields, and logic.

## Recommendation
**Option D: docs-only question bank draft first**
Because exact official past-paper coverage is uncertain, the safest path is still to draft the full question bank in docs first. The draft should use the metadata columns that now exist in main (`source_type`, `authenticity_status`, `year_source`, `paper_code`, `text_pairing`, `ao_emphasis`, and `metadata`) and should verify Pearson Edexcel authenticity before committing to imports or remote data writes.

## Proposed next implementation PR
**Branch**: `docs/draft-question-bank-c2`
**Goal**: Draft a comprehensive Markdown document listing the full proposed Component 2 Prose question bank, including source type, authenticity status, year/source note, paper code, text pairing, and AO1/AO2/AO3/AO4-only emphasis.

## Risks and non-goals
- **Risk**: If the runtime database still has only a small active question set, deleting or deactivating those rows to force local fallback might disrupt users if the local seed has undiscovered issues.
- **Non-goal**: Changing the Supabase schema or writing data in this audit.
- **Non-goal**: Modifying product behaviour or adding AI generation.
- **Non-goal**: Introducing AO5.

## What was not changed
- No source files were modified.
- No migrations were created.
- No Supabase data was mutated.
