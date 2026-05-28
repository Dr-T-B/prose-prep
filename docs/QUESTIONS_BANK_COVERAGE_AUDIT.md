# Questions Bank Coverage Audit

## Executive summary
The live Questions page currently shows only 5 entries because the application is fetching active rows from the remote Supabase `questions` table, which presently contains exactly 5 active rows. This small remote dataset shadows the 33 comprehensive questions defined locally in the `src/data/seed.ts` fallback. To expand this into a full Component 2 Prose question bank, we must address missing metadata fields (authenticity, year, paper code) and establish verified past-paper coverage before performing database schema migrations or writing new rows.

## Trigger for audit
Live UI inspection of `/library/questions` revealed only 5 entries (covering Class, Guilt, Imagination, Childhood, and Education), which is insufficient for full Component 2 exam preparation.

## Commands run
```bash
git switch main
git pull --ff-only origin main
git fetch --prune origin
git status --short
git switch -c audit/questions-bank-coverage
```

## Files inspected
- `src/pages/library/Questions.tsx` (the Questions page UI)
- `src/lib/ContentProvider.tsx` (exposes content bundle via React context)
- `src/lib/contentRepo.ts` (fetches from Supabase with local fallback)
- `src/lib/libraryAdapters.ts` (maps raw DB/seed rows to UI-friendly types)
- `src/data/seed.ts` (contains 33 fallback questions across 12 theme families)

## Current Questions page behaviour
The `Questions.tsx` page retrieves the content bundle using `useContent()`. The data is mapped via `toLibraryQuestions()`. The UI displays a `QuestionCard` for each question, showing its theme family, difficulty level band, question stem, primary route, secondary route, and likely methods. It includes a "Use in Builder" button which calls `queueBuilderHandoff` and navigates to the Essay Builder.

## Current 5-question source
The 5 questions originate from the live Supabase database. The `loadContent()` function in `src/lib/contentRepo.ts` runs the query `supabase.from("questions").select("*").eq("is_active", true)`. If Supabase returns any active rows, the application uses them and ignores the 33 questions defined locally in `src/data/seed.ts` (`LOCAL_BUNDLE.questions`). The 5 questions seen live are manual entries in Supabase.

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
| `year` | Not present | Yes | Needed for past-paper questions |
| `paper code` | Not present | Yes | Needed to identify 9ET0/02 |
| `source type` | Not present | Yes | Official vs adapted vs mock |
| `exam-board authenticity` | Not present | Yes | To verify Pearson Edexcel authenticity |
| `builder handoff metadata` | Implicit | Yes | Managed dynamically via `handoffFromQuestion` |

## Current coverage gaps
1. **Database coverage**: The live database only has 5 active questions, whereas the local seed contains 33 (covering 12 theme families).
2. **Authenticity metadata**: Neither the local seed nor the database schema supports tracking whether a question is an official past-paper question, what year it was from, or if it is an adapted/mock question.
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
Update `src/data/seed.ts` with metadata fields and more questions. Would require temporarily disabling the Supabase fetch or manually syncing the local seed to the remote database.

## Option B: Supabase-backed question bank
Add missing columns to Supabase and insert rows. Requires database migrations and writes.

## Option C: hybrid local-first expansion
Build the full canonical question bank locally first with new schema fields, test it, then migrate to Supabase later.

## Option D: docs-only question bank draft first
Draft the full question set with authenticity metadata in a Markdown document for review before performing any code or schema changes.

## Option E: defer pending official verification
Wait until official past papers are provided and verified before proceeding.

## AO compliance assessment
Component 2 Prose strictly assesses AO1, AO2, AO3, and AO4. There are no mentions of AO5 in the local seed, the current UI, or the schema. All planned expansions must continue to strictly avoid AO5 scoring, labels, filters, fields, and logic.

## Recommendation
**Option D: docs-only question bank draft first**
Because exact official past-paper coverage is uncertain and the current schema lacks the necessary fields to store authenticity and past-paper metadata, the safest path is to draft the full question bank in docs first. This allows us to verify Pearson Edexcel authenticity, define the exact schema changes needed, and review the questions thoroughly before committing to code changes, Supabase schema migrations, or data writes.

## Proposed next implementation PR
**Branch**: `docs/draft-question-bank-c2`
**Goal**: Draft a comprehensive Markdown document listing the full proposed Component 2 Prose question bank, including year, source type, and paper code.

## Risks and non-goals
- **Risk**: Deleting the 5 active questions in Supabase to force the local fallback might temporarily disrupt users if the local seed has undiscovered issues.
- **Non-goal**: Changing the Supabase schema or writing data in this audit.
- **Non-goal**: Modifying product behaviour or adding AI generation.
- **Non-goal**: Introducing AO5.

## What was not changed
- No source files were modified.
- No migrations were created.
- No Supabase data was mutated.
