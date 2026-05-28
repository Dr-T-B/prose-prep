# Matrix to Essay Builder Integration Audit

## Executive summary

Following the completion of the Comparative Matrix theme-filter and route export feature set (PR #60, PR #62, PR #63), this audit evaluates the architectural options for connecting Comparative Matrix route exports directly into the Essay Builder / paragraph planning workflow.

Our analysis shows that a fully functional **Essay Builder** (`/builder`) and **Builder Handoff** infrastructure (`src/lib/builderHandoff.ts`) already exist in the codebase. This infrastructure uses a lightweight, `localStorage`-backed plan storage model (`planStore.ts`) to attach explore notes (`BuilderHandoffItem`) to the student's active essay plan.

Consequently, our final recommendation is **C. Add "Send to Essay Builder" using localStorage/sessionStorage**. This path leverages the existing `BuilderHandoffItem` normalization and `localStorage` plan store queueing, allowing a seamless redirection from `/matrix` to `/builder` with zero schema changes or new database mutations.

---

## Commands run

To verify baseline health of all routing, type systems, and test coverage:
1. `npm run test` (vitest run) - Verified that all 363 unit tests pass.
2. `npm run typecheck` (tsc --noEmit) - Confirmed zero compile-time type errors.
3. `npm run build` (vite build) - Checked that production code bundles successfully.

---

## Files inspected

- `src/components/ComparativeMatrix.tsx` — Current implementation of the matrix page, columns, query projections, and local copy helper.
- `src/lib/builderHandoff.ts` — The data structures (`BuilderHandoffItem`) and methods for queueing and consuming imported exploration objects.
- `src/lib/planStore.ts` — Persistent local storage structures (`EssayPlan`, `KEY_CURRENT`, `useCurrentPlan`) that manage the current student plan.
- `src/pages/EssayBuilder.tsx` — The page component hosting the step-by-step essay planning process, including the `ExploreIntake` panel that renders attached handoff notes.
- `src/App.tsx` — Page route declarations to confirm element paths for `/matrix` and `/builder`.

---

## Current Comparative Matrix export behaviour

- **Trigger:** A button labeled `Copy route` sits inside each desktop table row header (`th`) and at the bottom of each mobile accordion card body.
- **Copy Mechanism:** Invokes `formatComparativeRouteExport` to stringify the row fields (axis, themes, thesis, Dickens/McEwan arguments, and individual AO2/AO3/AO4 cues) into a markdown-formatted plain-text plan.
- **Delivery:** Writes this text to the device clipboard using the async `navigator.clipboard` API (falling back to a temporary textarea copy block if blocked by browser settings).
- **Current Limitation:** The student must manually navigate away from `/matrix` to the Essay Builder and manually paste the copied text.

---

## Current Essay Builder / paragraph-plan architecture

- **Routing:** The Essay Builder page is mounted at `/builder` (with a redirect from `/build`).
- **State Management:** Controlled via a react hook `useCurrentPlan()` which stores the state in `localStorage` under key `c2p.currentPlan.v1` and serializes it as an `EssayPlan` object.
- **Handoff System:** The `EssayPlan` type natively supports `builder_handoffs: BuilderHandoffItem[]`. Any module (such as the Retrieval Toolkit or Questions library) can queue planning notes by executing:
  ```typescript
  integrateBuilderHandoffsIntoCurrentPlan([item]);
  ```
- **Builder Consumption:** When `/builder` mounts, the component automatically reads the current plan from storage and renders all active handoff notes inside the `ExploreIntake` component.

---

## Data handoff requirements

To cleanly seed the Essay Builder from a Comparative Matrix row, the handoff payload must contain:
1. **Identifier:** Unique ID (`comparison:matrix:${row.id}`) to prevent duplicate stacks.
2. **Metadata:** Row content map (axis, themes, thesis, hardTimes, atonement, ao2, ao3, ao4, character, narrative, structure, examFit).
3. **Themes Context:** Associated theme IDs so the builder can auto-select or suggest matching question families.
4. **Scaffold Text:** The formatted markdown route export block.

---

## Option A: clipboard-only workflow

- **Description:** Leave the current implementation as is. The student copies the comparative route and pastes it manually into a custom text box in the builder or in Google Docs.
- **Pros:** Completely zero-code, zero-risk. 
- **Cons:** High user friction. It doesn't guide the student into the application's built-in step-by-step builder, missing an opportunity for a cohesive workflow.

---

## Option B: URL parameter handoff

- **Description:** Add a "Send to Essay Builder" button that redirects the student to `/builder?import_type=matrix&matrix_id=mock-class`. The builder then fetches the row and imports it.
- **Pros:** Stateless, easily shareable.
- **Cons:** Passing full route details in URL query parameters can easily hit browser character limits and is prone to encoding issues.

---

## Option C: localStorage/sessionStorage handoff

- **Description:** Clicking "Send to Essay Builder" converts the row into a `BuilderHandoffItem`, inserts it into the active plan via `integrateBuilderHandoffsIntoCurrentPlan`, and uses react-router's `useNavigate` to push the user to `/builder`.
- **Pros:** 
  - Fits **100%** into the existing, verified handoff architecture.
  - No new database schemas, database writes, or Supabase mutations required.
  - Automatically loads notes into the `ExploreIntake` panel at the top of the Essay Builder page.
  - Immediate, smooth redirection.
- **Cons:** Planning notes remain local to the device (consistent with the current application state model).

---

## Option D: Supabase saved-plan persistence

- **Description:** Directly insert or update a row in the `saved_essay_plans` table on Supabase.
- **Pros:** Device-agnostic persistence.
- **Cons:** Requires network overhead, user authentication states, and database writes. Violates the offline-first design constraints of this phase.

---

## Option E: AI-assisted generation

- **Description:** Send the route export text to an LLM endpoint to generate a full essay or draft paragraphs immediately.
- **Pros:** Fully automated drafting.
- **Cons:** Complex implementation, API key requirements, and diverges from the Prose Tutor's core educational goal: teaching students *how* to draft plans rather than generating essays for them.

---

## AO compliance assessment

- **Scope:** Component 2 Prose continues to operate strictly on AO1/AO2/AO3/AO4.
- **Compliance:** This integration will only pass existing database columns. No `ao5` markers, scoring, labels, or fields will be introduced.

---

## Recommendation

**C. Add “Send to Essay Builder” using localStorage/sessionStorage**

### Rationale
Because the Essay Builder and `localStorage` handoff systems are already mature and active in the codebase, Option C is the natural, safest, and most elegant choice. It requires no database changes and delivers the premium, seamless user flow desired: the student finds a route, clicks a button, and is immediately dropped into the builder with their planning notes already attached.

---

## Proposed next implementation PR

The next PR (`feat/matrix-to-builder-handoff`) should:
1. Update `src/components/ComparativeMatrix.tsx` to add a "Send to Essay Builder" button on each row next to the "Copy route" button.
2. Implement a handoff builder function in `ComparativeMatrix.tsx`:
   ```typescript
   function handoffFromMatrixRow(row: Row): BuilderHandoffItem {
     return {
       id: `comparison:matrix:${row.id}`,
       kind: "comparison",
       originModule: "comparison",
       label: "Comparative Route",
       title: row.theme,
       text: formatComparativeRouteExport(row),
       family: row.themes && row.themes.length > 0 ? row.themes[0] : undefined,
       metadata: {
         axis: row.theme,
         hardTimes: row.hardTimes,
         atonement: row.atonement,
         thesis: row.thesis,
         ao2: row.ao2,
         ao3: row.ao3,
         ao4: row.ao4,
         examFit: row.examFit,
       }
     };
   }
   ```
3. Use the `useNavigate` hook from `react-router-dom` to transition from `/matrix` to `/builder` after calling `integrateBuilderHandoffsIntoCurrentPlan([item])`.
4. Update unit tests to verify that clicking "Send to Essay Builder" correctly modifies the plan store and redirects the user.

---

## Risks and non-goals

- **Non-goal:** Persisting these exports to Supabase (Option D) is a non-goal for this phase.
- **Risk:** Accumulating too many handoff items in the active plan.
- **Mitigation:** The `ExploreIntake` component in the builder already has a "Clear" button that allows students to purge notes when starting a new essay.

---

## What was not changed

- No source files were modified.
- No database migrations, schemas, or Supabase configurations were changed.
- No AI systems or third-party APIs were introduced.
