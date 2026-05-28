# Builder Live Plan State Sync Audit

## Executive summary
An audit of the Essay Builder's LIVE PLAN right-panel reveals that its state reactivity is broken due to disconnected state management. The `EssayBuilder` and `ParagraphEngine` components each maintain independent, isolated React states via the `useCurrentPlan()` hook. Consequently, edits made in the Paragraph Engine do not trigger updates in the LIVE PLAN. Furthermore, once paragraph cards are seeded, they mask underlying wizard changes (like picking a new route or question), making the plan appear entirely static. We recommend Option B (Add a lightweight wizard-state summary) as the safest immediate fix, deferring a broader global-state refactor.

## Trigger from student testing
During usability testing, it was observed that the right-panel LIVE PLAN did not reflect wizard selections as the student progressed through question selection, route selection, thesis level, selected quotes/evidence, and paragraph-card refinement.

## Commands run
- `git switch main`
- `git pull --ff-only origin main`
- `git fetch --prune origin`
- `git switch -c audit/builder-live-plan-state-sync`
- File inspection using built-in file viewers and `grep`.

## Files inspected
- `src/pages/EssayBuilder.tsx`
- `src/pages/EssayBuilder.test.tsx`
- `src/components/ParagraphEngine.tsx`
- `src/lib/planLogic.ts`
- `src/lib/planStore.ts`
- `src/lib/builderHandoff.ts`
- `src/lib/paragraphEngine.ts`

## Current LIVE PLAN behaviour
The `LiveOutput` component inside `EssayBuilder.tsx` is responsible for rendering the LIVE PLAN. It receives the `plan` object directly from `EssayBuilder`'s local `useCurrentPlan()` hook. It conditionally renders the selected question, route, thesis, and paragraph cards. 

## Wizard state inventory
- **Step 01 (Question Selection):** Updates `plan.question_id` and `plan.family` in `EssayBuilder`'s local state and persists to `localStorage`.
- **Step 02 (Route Selection):** Updates `plan.route_id` in `EssayBuilder`'s local state and persists to `localStorage`.
- **Step 03 (Thesis Selection):** Updates `plan.thesis_level` in `EssayBuilder`'s local state and persists to `localStorage`.
- **Step 04 (Quote/Evidence Selection):** This is handled via the `ParaEvidencePanel` (which updates `EssayBuilder`'s `selected_quote_ids`) and internally in `ParagraphEngine` (which updates evidence on paragraph cards).

## Paragraph card state inventory
Paragraph cards are seeded and refined within the `ParagraphEngine` component. They are stored in an array of `ParagraphCard` objects under `plan.paragraph_cards`. When the student edits a card's claim, evidence, or comparative direction, the `ParagraphEngine` updates its local `plan` state and pushes the new array to `localStorage`.

## Output formatter state inventory
The `LiveOutput` component renders a fully formatted view. If `plan.paragraph_cards` has items, it renders the static content of those cards (claims, evidence, notes) and hides the dynamic "Paragraph jobs" section. 

## Why LIVE PLAN appears static
1. **Disconnected State Hooks:** Both `EssayBuilder` and `ParagraphEngine` invoke `useCurrentPlan()`. Because `useCurrentPlan()` is implemented using a basic React `useState` initialized from `localStorage`, the two components have completely isolated state instances. When `ParagraphEngine` updates `paragraph_cards`, it writes to `localStorage` but does not trigger a re-render in `EssayBuilder`. Thus, `LiveOutput` never sees the updated cards.
2. **Stale Cards Masking Wizard Changes:** Once paragraph cards are seeded, they are stored in `plan.paragraph_cards`. If the student goes back to Step 01 or 02 and changes the question or route, `EssayBuilder`'s `plan` updates its `question_id` or `route_id`, but the old `paragraph_cards` array remains. Because `LiveOutput` prioritizes rendering `paragraph_cards` if they exist, it displays the stale cards (with hardcoded text from the old route), masking the dynamic changes.

## Option A: saved-plan preview only
Keep LIVE PLAN as saved-plan preview only. No code logic changes. Make the label clearer. (Does not solve the UX friction reported in testing).

## Option B: lightweight wizard-state summary
Add lightweight wizard-state summary to LIVE PLAN. Show current question, route, thesis level, and selected quote count without changing persistence. This provides immediate visual feedback during the wizard steps without needing to overhaul the underlying state architecture.

## Option C: synchronise wizard selections into current plan
Synchronise wizard selections into current plan state. The existing state model (`useCurrentPlan` with isolated `useState` hooks) **does not** cleanly support this. We would need to refactor `useCurrentPlan` to use a global store (e.g., Zustand or React Context) or implement a `storage` event listener to broadcast changes across components.

## Option D: fully reactive Builder preview
Convert LIVE PLAN into a full reactive Builder preview. This requires the same global state refactor as Option C, plus significant rendering updates.

## Option E: defer pending refactor
Defer pending broader Builder state refactor entirely.

## Test warning review
**Warning:** `An update to RecentPlansPanel inside a test was not wrapped in act(...)`
- **Cause:** `RecentPlansPanel` contains a `useEffect` that calls the asynchronous `listCloudPlans()` function, which then calls `setRecent()`.
- **Review:** This is a standard async state update warning in React Testing Library. The tests are finishing before the promise resolves. It is isolated to `RecentPlansPanel` and does not affect the core `LIVE PLAN` logic.
- **Action:** This should be fixed as a separate test-hygiene PR by adding `waitFor` or `act` to the relevant `EssayBuilder` tests.

## AO compliance assessment
The proposed paths have been reviewed against the critical assessment rule. 
- Component 2 Prose uses AO1, AO2, AO3 and AO4 only.
- No AO5 scoring, labels, filters, UI, database fields, route logic, or validation were found or will be introduced in resolving this sync issue.

## Recommendation
**Option B (Add lightweight wizard-state summary)** is recommended. Since the current state model (`useCurrentPlan`) relies on disconnected `useState` hooks rather than a global store, fully synchronizing state (Option C or D) would require a broader refactor. Option B allows us to safely display the current wizard selections (read from `EssayBuilder`'s local state) to solve the immediate UX friction without risking state corruption or needing a large architectural overhaul right now.

## Proposed next implementation PR
**Branch:** `feat/builder-live-plan-wizard-summary`
**Scope:** 
1. Update `LiveOutput` to display a lightweight summary of current wizard selections (question, route, thesis level, and quote count).
2. Explicitly label it to clarify its role during the builder phase.
3. Ensure the summary gracefully handles the presence of seeded paragraph cards.

## Risks and non-goals
- **Risks:** Students might still be confused if the lightweight summary and the paragraph cards appear disconnected.
- **Non-goals:** We will not refactor `useCurrentPlan` to Zustand/Context in the next PR. We will not fix the `RecentPlansPanel` test warning in the next PR.

## What was not changed
- No source files were modified.
- No migrations were created.
- No Supabase data was mutated.
- No AI generation was added.
- No AO5 functionality was introduced.
