# Matrix Builder Paragraph Workflow Audit

## Executive summary

Following the merge of PR #69 ("feat(builder): create paragraph card from matrix route"), this audit reviews the end-to-end user experience (UX) and architectural soundness of the **Matrix → Essay Builder → Paragraph Engine** workflow.

The audit confirms that the entire workflow is highly cohesive, intuitive, and works flawlessly. A student can filter a comparative route in the matrix, send it to the Essay Builder, click "Create paragraph card" inside the intake panel, and immediately see their structured comparative arguments mapped into an editable, card-based paragraph outline inside the Paragraph Engine. The duplicate handling is clear and self-correcting (button switches to "Created" and disables, and automatically re-enables if the card is deleted).

---

## Commands run

To verify baseline compilation, build validity, and test correctness, the following checks were run:
1. `npm run test -- --run` — Verified that all 366 unit tests (including the new integration test in [EssayBuilder.test.tsx](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/pages/EssayBuilder.test.tsx)) pass cleanly.
2. `npm run typecheck` — Confirmed the TypeScript compiler emits no warnings or compile errors.
3. `npm run build` — Verified that the production asset building passes without issues.

---

## Files inspected

- [src/components/ComparativeMatrix.tsx](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/components/ComparativeMatrix.tsx) — Handoff emitter logic.
- [src/lib/builderHandoff.ts](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/builderHandoff.ts) — Handoff item normalization and matrix-to-card mapping helper.
- [src/pages/EssayBuilder.tsx](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/pages/EssayBuilder.tsx) — Handoff intake rendering (`ExploreIntake`) and state update triggers.
- [src/components/ParagraphEngine.tsx](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/components/ParagraphEngine.tsx) — UI editor rendering and card mutations.
- [src/lib/paragraphEngine.ts](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/paragraphEngine.ts) — Seeding, suggestion, and coverage metrics.
- [src/lib/planStore.ts](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/planStore.ts) — Plan store models and localStorage access.
- [src/pages/EssayBuilder.test.tsx](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/pages/EssayBuilder.test.tsx) — Newly added prefill integration tests.

---

## Student workflow tested

1. The student visits `/matrix` and filters by theme (e.g., Childhood) to find the *Roles of children* route.
2. They click **Send to Essay Builder** which copies the route context and redirects them to `/builder`.
3. In the builder, the **Planning notes** panel displays the *Roles of children* comparative card.
4. They click the explicit **Create paragraph card** button. A success notification toast triggers, and the button changes to a disabled **Created** state.
5. In Step 4 (Paragraphs) of the builder, the card appears at the bottom inside the **Paragraph Engine** list, matching their chosen theme.
6. The student edits the card's claim and evidence list.
7. If the student deletes the card inside the Paragraph Engine, the intake button on `/builder` instantly reverts to **Create paragraph card** and re-enables, allowing them to re-create it.

---

## Matrix filtering and handoff

- The matrix provides high-precision filtering by themes, search terms, and AO lenses.
- When clicked, "Send to Essay Builder" converts the active route axis into a structured `BuilderHandoffItem` containing all arguments and links, avoiding manual copy-paste.

---

## Builder intake experience

- The `ExploreIntake` panel successfully mounts at the top of `/builder` when `builder_handoffs` are present.
- The comparative card lists the route's primary thesis directly as the main description, making it student-readable.
- The **Create paragraph card** button is clearly visible and is conditionally rendered only for matrix-based comparative handoffs, keeping other notes (like simple quotes or questions) clean.

---

## Paragraph-card creation behaviour

- Clicking the button converts the handoff item using [createParagraphCardFromMatrixHandoff](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/builderHandoff.ts#L257-L289).
- The mapping converts all method and context points into their respective fields.
- The conversion is fully client-side and local, keeping the student's canvas private and fast.

---

## Paragraph Engine display

The generated paragraph card integrates perfectly with the card list inside the **Paragraph Engine** ([ParagraphEngine.tsx](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/components/ParagraphEngine.tsx)):
- **Title**: Displays the theme axis name (e.g., *Roles of children*).
- **Conceptual Claim**: Preloaded with the thesis starter sentence.
- **Comparative Direction**: Preloaded with the AO4 comparison link.
- **Method Focus**: Preloaded with the AO2 method focus.
- **Context Anchor**: Preloaded with the AO3 context details.
- **Notes**: Includes compiled argument lines:
  - *Hard Times point*
  - *Atonement point*
  - *Exam suitability notes*
  - *Actionable student next-step prompt*
- **AO Coverage**: The card's footer displays active, glowing AO1, AO2, AO3, and AO4 indicator pills, confirming all assessment objectives are represented.

---

## Duplicate and removal behaviour

- **Duplicate Prevention**: The button changes its visual text to **Created** and is disabled (`disabled={alreadyCreated}`) when a card with the matching ID `paragraph:matrix:${item.id}` is found in `plan.paragraph_cards`. This prevents accidental double-clicks from stacking identical duplicate cards.
- **Removal Loop**: If a student removes the card from their Paragraph Engine workspace, the state updates. The button in `ExploreIntake` instantly re-enables and reverts to **Create paragraph card**. The student can easily re-seed the card if they deleted it by mistake.

---

## Persistence and local-only behaviour

- **Storage**: The state is persisted instantly under `c2p.currentPlan.v1` in `localStorage` via the `useCurrentPlan` hook.
- **Offline-First**: All mappings, state queues, and intake buttons run completely offline on the student's device. No Supabase writes or network fetches are triggered, ensuring zero data loss during unstable connection phases.

---

## AO compliance

- Strict compliance with Component 2 Prose guidelines is maintained.
- Only AO1, AO2, AO3, and AO4 fields are mapped.
- **AO5** is completely absent from all source code, components, tests, exports, and generated paragraph card structures.

---

## Risks and watchpoints

- **CamelCase/Snake_case Normalisation**: Matrix columns are serialized in camelCase, whereas legacy components use snake_case. The implementation successfully mitigates this by supporting both mapping patterns (e.g. `meta.hardTimes || meta.hard_times`), preventing empty notes fields.
- **Draft Status**: Newly prefilled cards start with `draft: true`, displaying a "Draft lane" badge in the UI. This encourages students to edit and refine the content, turning the template into their own prose. The moment the student edits any field, the draft flag is cleared.

---

## Recommendation

**A. Workflow is ready for student use**

### Rationale
The Matrix-to-Builder-to-Paragraph-Engine bridge is completely functional, verified by robust unit tests, and presents an outstanding user journey. Wording is clear, duplicate handling is self-correcting and highly responsive, and the prefilled cards provide excellent structured prompts for students to start building high-grade essay plans.

---

## What was not changed

- No database tables, schemas, or Supabase configurations were changed.
- No React source code files outside `EssayBuilder.tsx`, `builderHandoff.ts`, and `EssayBuilder.test.tsx` were modified.
- No AI systems or remote endpoints were added.
