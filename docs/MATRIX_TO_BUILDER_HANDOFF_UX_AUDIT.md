# Matrix to Builder Handoff UX Audit

## Executive summary

Following the implementation of the "Send to Essay Builder" route integration (PR #66), this audit evaluates the user experience (UX) and architectural coherence of the handoff workflow from the **Comparative Revision Matrix** (`/matrix`) to the **Essay Builder** (`/builder`).

The audit confirms that the handoff works seamlessly. By utilizing the local `planStore`'s `builder_handoffs` queue, a student can select a comparative route from the matrix, click a button, and immediately transition into the step-by-step essay planner. The route context, including argument axis, thesis starter, and AO2/AO3/AO4 cues, is cleanly integrated and displayed inside the builder's `ExploreIntake` panel without causing layout fragmentation.

---

## Commands run

To verify baseline health, type safety, and test compliance of the implementation, the following local verification checks were executed:
1. `npm run test -- --run` — Verified that all 365 tests across 40 suites (including the new matrix handoff and navigation tests) pass successfully.
2. `npm run typecheck` — Confirmed the TypeScript compilation is clean and contains zero type errors.
3. `npm run build` — Verified that the production asset compilation builds successfully.

---

## Files inspected

- `src/components/ComparativeMatrix.tsx` — Button rendering, local state handlers (`handleSendToEssayBuilder`), and payload creation helper (`createMatrixRouteBuilderHandoff`).
- `src/components/ComparativeMatrix.test.tsx` — Test coverage verifying button rendering, accessible labels, navigation triggers, and payload shape.
- `src/lib/builderHandoff.ts` — Integration utilities (`integrateBuilderHandoffsIntoCurrentPlan`) and handoff schemas.
- `src/lib/planStore.ts` — Persistent local storage structures managing the current plan.
- `src/pages/EssayBuilder.tsx` — The `/builder` page containing the `ExploreIntake` receiver component.
- `docs/MATRIX_TO_ESSAY_BUILDER_INTEGRATION_AUDIT.md` — The previously approved architectural design.

---

## Student journey tested

1. The student navigates to the **Comparative Revision Matrix** (`/matrix`).
2. They apply filters (e.g. theme filters like "Childhood" or "Class", or search terms like "Coketown").
3. They select a route (e.g. *Difficult circumstances*).
4. They click the new action button: **Send to Essay Builder**.
5. The app automatically pushes the route as a `BuilderHandoffItem` into local storage and navigates to the **Essay Builder** (`/builder`).
6. At the top of `/builder`, the `ExploreIntake` panel automatically appears and lists the route details, showing its thesis starter as a readable prompt.
7. The student can now plan their paragraphs while referencing the comparative route structure.
8. If the student goes back to `/matrix` and clicks "Send to Essay Builder" again on the same route, it is updated cleanly in-place. If they click it on a different route, it adds a new helper item.

---

## Comparative Matrix action clarity

The two primary actions on each matrix row are distinct and clear:
- **Copy route**: Copies the full plain-text markdown route scaffold to the clipboard. The button changes to "Copied!" for 2 seconds to give the student visual feedback. It is ideal if the student is writing their essay in an external tool like Google Docs or Microsoft Word.
- **Send to Essay Builder**: Normalizes the row into a handoff payload and navigates the student directly to `/builder`. It is ideal for students who want to build their paragraph plans inside the application's built-in step-by-step editor.

In desktop view, the buttons stack vertically under the row subtitle, which keeps the table structure clean. In mobile accordion view, they arrange side-by-side in a balanced 2-column grid.

---

## Builder landing experience

The transition from `/matrix` to `/builder` is instantaneous and smooth. The student is not left wondering if the action worked, because the `ExploreIntake` panel mounts at the top of the builder page immediately. This panel acts as an intake bay, letting the student know that their comparative matrix route is now guiding their active essay plan.

---

## ExploreIntake readability

The imported matrix route is rendered in `ExploreIntake` under the label **Comparative Route**:
- **Title**: Displays the theme axis name (e.g. `Difficult circumstances`).
- **Description**: Displays the thesis starter (e.g. `Both texts...`), which gives the student a direct starting prompt to begin writing their introductory paragraph.
- **Metadata**: Behind the scenes, the full markdown export and specific method/context notes are stored in the handoff.
- **Actions**: The student can click "Remove" on the card to discard this specific route, or click the global "Clear" button to wipe the workspace and start fresh.

---

## Duplicate handoff behaviour

Because the handoff item's ID is set deterministically using the matrix row's unique identifier (`comparison:matrix:${row.id}`), duplicate clicks on the same row do not stack multiple identical cards in the intake queue. Instead, the existing entry is updated. 

However, if a student explicitly chooses to import *different* rows (e.g. a row for *Difficult circumstances* and a row for *Imagination*), both are safely appended, allowing the student to reference multiple comparative angles simultaneously.

---

## Mobile and accessibility notes

- **Button Layout**: Wide-screen uses stacked layout; mobile view uses `grid-cols-2` to maximize screen real estate and prevent horizontal wrapping issues.
- **Screen Reader Support**: Both action buttons feature clear, screen-reader-accessible labels that explicitly mention the target axis theme, for example:
  - `Copy comparative route for Difficult circumstances`
  - `Send comparative route for Difficult circumstances to Essay Builder`
- **Error Resilience**: If the student's browser blocks local storage, the navigation handles the fallback gracefully and redirects to `/builder` without throwing runtime crashes.

---

## AO compliance

In accordance with Component 2 Prose rules:
- Only **AO1** (axis title), **AO2** (method arguments), **AO3** (context arguments), and **AO4** (comparative links) are extracted from the matrix and written to the handoff item.
- No **AO5** markers, scoring fields, UI selectors, or logic are present in the code, imports, payload metadata, or tests.

---

## Risks and watchpoints

- **Queue Bloat**: If a student imports a large number of different routes over time, the `ExploreIntake` header could grow vertically. This is mitigated by the highly visible "Remove" and "Clear" buttons, which empower students to manage their own planning canvas.
- **State Longevity**: Local handoff plans remain on the device. Students should be reminded (via the existing UI copy) that remote cloud-saved plans only save the core essay plans, not the temporary exploration notes queue.

---

## Recommendation

**A. Handoff UX is ready for student use**

### Rationale
The integration is extremely clean, uses existing components without requiring redesign, provides clear accessibility cues, handles duplicates cleanly, and respects the mobile-first layouts of the app. The transition is fast and intuitive.

---

## What was not changed

- No database schemas, Supabase migrations, or remote table structures were changed.
- No React source code outside `ComparativeMatrix.tsx` and `ComparativeMatrix.test.tsx` was modified.
- No AI systems, third-party libraries, or complex layout wrappers were introduced.
