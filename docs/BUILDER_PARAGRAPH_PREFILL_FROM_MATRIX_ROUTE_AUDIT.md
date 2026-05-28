# Builder Paragraph Prefill from Matrix Route Audit

## Executive summary

This audit evaluates the safest technical implementation path for converting an imported **Comparative Matrix** route handoff into a starter body paragraph plan inside the **Essay Builder** (`/builder`).

Our codebase already features a fully functional **Paragraph Engine** (in [ParagraphEngine.tsx](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/components/ParagraphEngine.tsx)) that operates on a card-based structure ([ParagraphCard](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/planStore.ts#L8-L30)) stored locally in `plan.paragraph_cards`. 

We recommend **Option B: explicit paragraph-plan prefill** via a student-triggered button inside the builder's `ExploreIntake` panel. When clicked, this action maps the metadata of the imported matrix handoff directly into a new [ParagraphCard](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/planStore.ts#L8-L30), inserting it into the current plan's card array. This provides an intuitive, student-controlled bridging mechanism that fits the existing local storage design and avoids the risks of automatic state overrides.

---

## Commands run

To verify the current baseline health and compilation status:
1. `npm run test -- --run` — Confirmed all 365 tests pass cleanly.
2. `npm run typecheck` — Confirmed no TypeScript compile errors exist.
3. `npm run build` — Verified successful production build compilation.

---

## Files inspected

- [src/pages/EssayBuilder.tsx](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/pages/EssayBuilder.tsx) — Main workflow container, `ExploreIntake` receiver component, and integration of the step-by-step layout.
- [src/components/ParagraphEngine.tsx](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/components/ParagraphEngine.tsx) — Seeding, mutating, rendering, and rendering-cues of body paragraph cards.
- [src/lib/builderHandoff.ts](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/builderHandoff.ts) — Schema definitions for `BuilderHandoffItem` and plan-merge utilities.
- [src/lib/planStore.ts](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/planStore.ts) — The state models for `EssayPlan` and `ParagraphCard`.
- [src/components/ComparativeMatrix.tsx](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/components/ComparativeMatrix.tsx) — The source of the normalized handoff data.
- [docs/MATRIX_TO_BUILDER_HANDOFF_UX_AUDIT.md](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/docs/MATRIX_TO_BUILDER_HANDOFF_UX_AUDIT.md) — Handoff UX audit notes.
- [docs/MATRIX_TO_ESSAY_BUILDER_INTEGRATION_AUDIT.md](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/docs/MATRIX_TO_ESSAY_BUILDER_INTEGRATION_AUDIT.md) — Initial integration audit notes.

---

## Current Matrix handoff behaviour

- **Source**: When a student clicks "Send to Essay Builder" in the matrix, [createMatrixRouteBuilderHandoff](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/components/ComparativeMatrix.tsx#L653-L686) creates a payload with `id: comparison:matrix:${row.id}`.
- **Delivery**: The payload is stored in the student's active plan `localStorage` under `builder_handoffs`.
- **Deduplication**: Repeated clicks on the same row update the single handoff in-place, while clicks on different rows append multiple distinct handoffs.

---

## Current Essay Builder intake architecture

When a student lands on `/builder`, the `EssayBuilder` page extracts and displays active handoffs from `plan.builder_handoffs` using the `ExploreIntake` panel.
- This panel groups handoffs by module (e.g. "Comparative Route").
- It displays the title, thesis text, and has a button to discard/remove individual handoffs from the queue.

---

## Current paragraph-plan architecture

The application has two parallel paragraph workflows inside the "Paragraphs" step of the Essay Builder:
1. **Evidence Selector Panel**: A legacy step-by-step UI utilizing state vectors (`paraHtIds`, `paraAtIds`) for picking quote IDs to attach to pre-resolved database paragraph jobs.
2. **Paragraph Engine**: A modern, card-based workspace mounted inside the builder as `<ParagraphEngine embedded handoffs={plan.builder_handoffs} />`. It reads and writes cards directly from `plan.paragraph_cards`.
   - The engine automatically seeds 3–5 body cards from the selected question/thesis upon first load if the array is empty.
   - It supports adding blank cards, moving cards, duplicating cards, and deleting cards.

---

## Data available from matrix handoff

The `BuilderHandoffItem` created by the matrix contains the following attributes in its `metadata` field:
- `source`: `"comparative_matrix"`
- `axis`: Theme name/description (e.g. `Difficult circumstances`)
- `thesis`: Thesis starter sentence (e.g. `Both texts...`)
- `hardTimes`: Material arguments for *Hard Times*
- `atonement`: Material arguments for *Atonement*
- `ao2`: Literary method focus (e.g. spatial perspective, narration)
- `ao3`: Contextual anchor points (e.g. Victorian industrialism, WWII)
- `ao4`: Comparative tension link
- `character`, `narrative`, `structure`, `examFit`: Specific lens cues
- `themes`: Theme keyword tags (e.g. `["childhood", "class"]`)

*Note on case naming convention*: The matrix handoff currently serializes custom metadata keys in camelCase (e.g., `hardTimes`, `examFit`), whereas legacy components (such as `ComparativeRoutePlanPanel`) write metadata in snake_case (e.g., `hard_times`, `exam_fit`). The prefill logic must safely handle both.

---

## Option A: intake-only workflow

- **Description**: Leave the handoff as a read-only visual card inside the `ExploreIntake` list. The student must manually read it and type/paste the contents into their paragraph claims or notes.
- **Pros**: Zero risk of overwriting existing paragraph plans; zero implementation complexity.
- **Cons**: High user friction. The student has to manually re-type structured argument details that are already present in the metadata.

---

## Option B: explicit paragraph-plan prefill

- **Description**: Add a "Create paragraph card from route" button inside the `ExploreIntake` panel on each comparative route card. Clicking it parses the handoff metadata, maps it to a new [ParagraphCard](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/planStore.ts#L8-L30), and appends it to `plan.paragraph_cards` (or replaces the list if empty).
- **Pros**:
  - Direct, student-controlled bridge.
  - Seamlessly integrates with the existing **Paragraph Engine** workspace.
  - Non-destructive: doesn't overwrite anything unless explicitly clicked.
  - Standardized mapping avoids duplicating states or adding database fields.
- **Cons**: Requires adding a button and a mapping function in the builder/intake UI.

---

## Option C: essay-plan scaffold prefill

- **Description**: Add a "Create full essay scaffold" button that wipes all current paragraph cards and creates a multi-paragraph plan (e.g., 3 separate cards focusing on HT, AT, and Comparative angles respectively).
- **Pros**: Instantly populates the entire essay outline.
- **Cons**: High risk of accidentally overwriting a student's existing unsaved body paragraph cards. Heavy implementation overhead to parse a single route row into three distinct body cards.

---

## Option D: automatic draft creation

- **Description**: When the student navigates from the matrix to the builder, the app automatically converts the handoff and injects it as a new paragraph card without user prompt.
- **Pros**: Saves one click.
- **Cons**: Highly intrusive. If the student already has cards in progress, auto-injection on mount leads to confusing clutter or duplicate cards.

---

## Option E: AI-assisted paragraph generation

- **Description**: Clicking "Generate Paragraph" sends the route details to an LLM to generate full essay paragraphs.
- **Pros**: Fully automated drafting.
- **Cons**: Violates educational principles (Prose Tutor aims to teach planning, not write essays) and violates offline-first, local-only constraints.

---

## Recommended paragraph-plan mapping

Under **Option B**, we map a `BuilderHandoffItem` (from the matrix) into a [ParagraphCard](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/planStore.ts#L8-L30) using the following schema:

| Target Card Field | Source Handoff Field / Metadata | Example Mapped Value |
| :--- | :--- | :--- |
| `id` | `card_matrix_${handoff.id.replace(":", "_")}_${Date.now()}` | `card_matrix_comparison_matrix_mock-class_1716860000` |
| `title` | `handoff.title` | `Difficult circumstances` |
| `claim` | `metadata.thesis` or `handoff.text` | `Both texts frame difficult circumstances as...` |
| `comparative_direction` | `metadata.ao4` or `metadata.divergence` | `Dickens externalises setting while McEwan internalises perspective.` |
| `evidence_ht_ids` | `[]` (empty) | *Ready for student quotation selection* |
| `evidence_at_ids` | `[]` (empty) | *Ready for student quotation selection* |
| `evidence_cmp_ids` | `[]` (empty) | *Ready for student quotation selection* |
| `method_focus` | `metadata.ao2` | `Focus on industrial settings and perspective.` |
| `context_anchor` | `metadata.ao3` | `Anchor in 1854 Coketown / WWII Dunkirk context.` |
| `notes` | Compiled plain-text details of other metadata: <br>- *Hard Times:* `metadata.hardTimes`<br>- *Atonement:* `metadata.atonement`<br>- *Exam fit:* `metadata.examFit` | `Hard Times: poverty and industrial struggle...` |
| `draft` | `true` | *Toggles the "Draft lane" UI badge* |

*Note*: Prefill logic must cleanly fall back to snake_case equivalent metadata keys (e.g. `hard_times`, `exam_fit`) to maintain compatibility.

---

## AO compliance assessment

- **Scope**: Component 2 Prose continues to target AO1, AO2, AO3, and AO4.
- **Compliance**: The mapping does not introduce any AO5 criteria, labels, evaluations, or tags.

---

## Recommendation

**B. Add explicit paragraph-plan prefill from route**

### Rationale
Option B is the safest, most logical next step. It bridges the Comparative Matrix and the Paragraph Engine by utilizing the existing [ParagraphCard](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/planStore.ts#L8-L30) structure without requiring any schema changes or Supabase migrations. Surfacing this action as an explicit button inside the `ExploreIntake` panel gives students complete ownership of their planning timeline.

---

## Proposed next implementation PR

The next PR (`feat/builder-paragraph-prefill`) should:
1. Implement a client-side utility function to map a matrix `BuilderHandoffItem` to a `ParagraphCard`.
2. Add a "Create paragraph card from route" button inside the `ExploreIntake` panel in [EssayBuilder.tsx](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/pages/EssayBuilder.tsx) for cards of kind `comparison` with source `comparative_matrix`.
3. Clicking this button will append the card to the current plan's `paragraph_cards`, trigger a success toast, and optionally scroll/switch focus to the Paragraph Engine step.
4. Add unit tests to verify:
   - Button renders only for matrix handoffs.
   - Click correctly maps and saves the card.
   - AO compliance (no AO5 fields mapped).

---

## Risks and non-goals

- **Non-goal**: Auto-generating paragraph cards without explicit student click (Option D) is a non-goal.
- **Risk**: A student clicking the button multiple times could stack duplicate cards.
- **Mitigation**: The prefill handler should check if a card with the same root ID (`comparison:matrix:${row.id}`) already exists in `plan.paragraph_cards` and prompt the user before creating another, or focus the existing card.

---

## What was not changed

- No React component source files were modified.
- No database migrations, schemas, or Supabase configurations were changed.
- No third-party AI APIs were introduced.
