# Builder Output Quality Audit

## Executive summary

This audit evaluates the output systems of the **Essay Builder** (`/builder`) and identifies the safest architectural path for exporting, copying, and printing a clean essay-plan document that fully reflects the student's active body paragraph planning cards.

Currently, both the clipboard copy action (`handleCopy` calling [renderPlanText](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/planLogic.ts#L258-L310)) and the live/print panel ([LiveOutput](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/pages/EssayBuilder.tsx#L1066-L1158)) format the read-only database seeds (`paragraph_jobs`) instead of the student's actual edited cards stored in `plan.paragraph_cards`. As a result, route prefill cards (such as those imported from the Comparative Matrix) and any student customizations are completely omitted from both clipboard copy and print layouts.

To resolve this, we recommend **Option D: combined copy and print output**. By updating the shared plan formatting logic, we can ensure that when `plan.paragraph_cards` are present, both the clipboard plain-text/markdown string and the print/preview layout display the active cards with their corresponding claims, text-specific points, and AO2/AO3/AO4 cues.

---

## Commands run

To verify baseline compilation, build validity, and test correctness:
1. `npm run test -- --run` — Verified that all 366 tests pass successfully.
2. `npm run typecheck` — Confirmed the TypeScript compilation has zero errors.
3. `npm run build` — Verified production compilation completes successfully.

---

## Files inspected

- [src/lib/planLogic.ts](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/planLogic.ts) — Houses `renderPlanText` which serializes the current plan for clipboard copying.
- [src/pages/EssayBuilder.tsx](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/pages/EssayBuilder.tsx) — Contains the `LiveOutput` preview/print component and layout styles.
- [src/components/ParagraphEngine.tsx](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/components/ParagraphEngine.tsx) — Modifies and stores active cards in `plan.paragraph_cards`.
- [src/lib/paragraphEngine.ts](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/paragraphEngine.ts) — The library helper driving card seeding and metrics.
- [src/lib/planStore.ts](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/planStore.ts) — The plan store models defining `ParagraphCard` and `EssayPlan`.

---

## Current Builder output behaviour

1. **Clipboard Copy**: The "Copy plan" button calls `handleCopy` which invokes `renderPlanText` to create a plain-text outline. It currently reads the database-seeded `paragraph_jobs` associated with the route, printing static prompts rather than student-customized cards.
2. **Print View**: The "Print" button triggers `window.print()`. The page hides the left action column (`no-print`) and prints the right `LiveOutput` preview. Like the copy helper, `LiveOutput` maps the database seeds rather than `plan.paragraph_cards`.
3. **Missing Card Data**: Any route-derived paragraph cards created by the "Create paragraph card" prefill action inside `ExploreIntake` are ignored by the exporters. Claims, comparative directions, methods, and contexts customized by the student are completely missing from the outputs.

---

## Paragraph card output readiness

- The [ParagraphCard](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/planStore.ts#L8-L30) structure is fully mature and holds all student-owned and prefilled content.
- All cards contain fields like `title`, `claim`, `comparative_direction`, `method_focus`, `context_anchor`, and `notes` which are ready to be serialized.

---

## Route-derived card output readiness

- Cards derived from the Comparative Matrix carry the identifier namespace `paragraph:matrix:comparison:matrix:${row.id}`.
- These cards store the complete comparative route and arguments in their claim, direction, method, and context fields, which makes them immediately ready for extraction and formatted output.

---

## Option A: keep current output

- **Description**: Leave the current copy and print formatters unchanged.
- **Pros**: Zero development effort.
- **Cons**: Severe usability defect. Student planning edits and Comparative Matrix imports are completely lost upon copy/print.

---

## Option B: copy essay-plan export

- **Description**: Rewrite `renderPlanText` in `planLogic.ts` to check if `plan.paragraph_cards` has items. If present, serialize these cards in a clean markdown/plain-text structure for clipboard copying.
- **Pros**: Resolves the copy discrepancy, giving students a clean outline to paste into external editors like Google Docs.
- **Cons**: Print output remains disconnected and prints static database jobs.

---

## Option C: print essay-plan view

- **Description**: Update the `LiveOutput` preview in `EssayBuilder.tsx` to render the student's active `plan.paragraph_cards` instead of `paragraph_jobs` when cards are present.
- **Pros**: Prints the actual customized plan.
- **Cons**: The clipboard copy function remains broken.

---

## Option D: combined copy and print output

- **Description**: Apply updates to both `renderPlanText` (for copy) and `LiveOutput` (for print) so that both render actual card content when `plan.paragraph_cards` contains items.
- **Pros**: 
  - Resolves both copy and print bugs simultaneously.
  - Minimal scope creep: both formatters already exist and can be updated using the same data pathways.
  - Highly cohesive user experience.
- **Cons**: Requires modifying both `planLogic.ts` and `EssayBuilder.tsx`.

---

## Option E: AI-assisted essay generation

- **Description**: Use an LLM to generate full essay text from the paragraph cards.
- **Pros**: Automates writing.
- **Cons**: Deviates from pedagogical goals (teaching students to plan and write themselves) and violates offline-first/local-only design constraints.

---

## Recommended output format

For both plain-text copy and HTML print previews, we recommend formatting each paragraph card in `plan.paragraph_cards` as follows:

```markdown
# Essay Plan

Question:
[question stem if available]

Thesis:
[thesis_text]

Paragraph 1 — [card.title]
Claim:
[card.claim]

Comparative direction:
[card.comparative_direction]

Hard Times:
[Extracted from card.notes: e.g., Dickens' settings...]

Atonement:
[Extracted from card.notes: e.g., McEwan's narrative errors...]

AO2 — Method:
[card.method_focus]

AO3 — Context:
[card.context_anchor]

Next step:
Add quotations and convert into timed paragraph prose.

Repeat for each paragraph card.

Final checklist:
- AO1: argument is sustained
- AO2: methods are analysed
- AO3: contexts are integrated
- AO4: comparison remains active
```

---

## AO compliance assessment

- **Scope**: All outputs will strictly conform to the AO1, AO2, AO3, and AO4 requirements of Pearson Edexcel Component 2 Prose.
- **Compliance**: No AO5 metadata, labels, checklists, or elements will be written or rendered in the exported outputs.

---

## Recommendation

**D. Add combined copy and print output**

### Rationale
Since the copy helper and print view already exist and share the same plan state model, updating them together is a low-risk, high-value adjustment. It ensures that students get consistent, high-quality outputs whether they print their plans directly or copy them to work in external writing suites.

---

## Proposed next implementation PR

The next PR (`feat/builder-output-quality`) should:
1. Update `renderPlanText` in [planLogic.ts](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/lib/planLogic.ts) to detect `plan.paragraph_cards`. If present, render the cards instead of the static database `jobs`.
2. Update the `LiveOutput` component inside [EssayBuilder.tsx](file:///Users/tarwindersaran/Downloads/Projects/prose-prep/src/pages/EssayBuilder.tsx) to map the active `plan.paragraph_cards` when available.
3. If quotes have been selected on the card (e.g. `evidence_ht_ids`, `evidence_at_ids`), extract their text and append them under the text-specific headings in the print view.
4. Add unit tests in `src/pages/EssayBuilder.test.tsx` and `src/lib/planLogic.test.ts` (or similar) verifying:
   - Clipboard copy formats active cards and notes.
   - Live/print preview renders active cards.
   - AO compliance (no AO5 content in either output).

---

## Risks and non-goals

- **Non-goal**: Changing the Supabase schema or performing remote writes is a non-goal.
- **Risk**: If the student hasn't created or edited any paragraph cards, the output could appear blank.
- **Mitigation**: Fall back to the current database-seeded `paragraph_jobs` if `plan.paragraph_cards` is empty or undefined. This ensures a fallback is always present.

---

## What was not changed

- No React source code or formatting files were modified.
- No Supabase schemas or migration scripts were created.
- No AI services or third-party connections were introduced.
