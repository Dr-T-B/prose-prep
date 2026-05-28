# Matrix UI Action Architecture Audit

## Executive summary
A UI and architecture audit of the Comparative Matrix action buttons was conducted following reports that buttons may be visible but not functioning reliably in the live Vercel environment. The audit revealed that row action buttons ("Copy route", "Send to Essay Builder") are duplicated between desktop and mobile layouts, and rely on synchronous execution and browser APIs (Clipboard, LocalStorage) with limited error feedback. The desktop table relies on a sticky `th` inside an `overflow-x-auto` container, which can cause clipping or unclickable areas depending on z-index stacking contexts.

## Trigger for audit
Live UI inspection suggested that not all Comparative Matrix buttons work reliably in the deployed app.

## Commands run
```bash
git switch main
git pull --ff-only origin main
git fetch --prune origin
git status --short
git switch -c audit/matrix-ui-action-architecture
git log --oneline -n 15
```

## Files inspected
- `src/components/ComparativeMatrix.tsx`
- `src/components/ComparativeMatrix.test.tsx`
- `src/lib/builderHandoff.ts`
- `src/lib/planStore.ts`
- `src/pages/EssayBuilder.tsx`
- `src/lib/planLogic.ts`

## Screenshot-based observations
- Comparative Revision Matrix loads.
- Theme filters render.
- AO/lens filters render.
- Compact Matrix view is active.
- Table rows render.
- “Copy route” appears inside route cells.
- Some buttons may be visible but not functioning or not responding as expected.

## Action inventory

| Action | Location | Expected behaviour | Current implementation | Possible failure mode | Test coverage | Risk |
|---|---|---|---|---|---|---|
| Search input | filter bar | filters routes | Updates state, memoized filter | React state | Good | Low |
| AO buttons | filter bar | filters AO | Updates `aoFilter` state | React state | Good | Low |
| Lens buttons | filter bar | filters lens | Updates `lens` state | React state | None specific | Low |
| Expand all | top controls | expands route cards | Updates `expandedIds` set | React state | Good | Low |
| Collapse all | top controls | collapses route cards | Clears `expandedIds` set | React state | Good | Low |
| Clear filters | top controls | clears filters | Clears states | React state | Good | Low |
| Theme chips | theme row | toggles theme filters | Updates `selectedThemes` array | React state | Good | Low |
| Compact Matrix dropdown | right controls | changes display density | Updates `printMode` state | React state | Good | Low |
| Print compact matrix | right controls | prints matrix | Calls `window.print()` | Fails silently on unsupported devices | Basic | Low |
| Copy route | row action | copies route scaffold | Uses `navigator.clipboard.writeText` with `execCommand` fallback | Permissions blocked; fallback can throw; z-index clipping | Mocked successfully | Medium |
| Send to Essay Builder | row action | local handoff + navigate | Calls `integrateBuilderHandoffsIntoCurrentPlan` and `navigate` | `localStorage` blocked; navigating on catch error | Mocked successfully | Medium |

## Manual testing notes
- Desktop view (`lg:block`) presents row actions inside a sticky `th` element.
- Mobile view (`lg:hidden`) presents row actions inside the expanded accordion body.
- Both sets of buttons are rendered in the DOM, meaning duplicate `aria-label`s exist.
- Test environments generally mock `navigator.clipboard`, so real-world permission denials are not caught during unit tests.

## Clipboard action review
- The `handleCopy` method correctly checks for `navigator?.clipboard?.writeText`.
- It implements a safe fallback using `document.execCommand("copy")` with an invisible textarea.
- If an error occurs, it falls back to an `alert()`.
- **Risk:** If the table cell is affected by stacking context issues or is partially clipped by the `overflow-x-auto` container, clicks might be intercepted by an invisible layer or not register at all.

## Builder handoff action review
- `handleSendToEssayBuilder` wraps handoff in a `try/catch`.
- **Risk:** If `integrateBuilderHandoffsIntoCurrentPlan` throws an error (e.g., due to quota exceeded or blocked `localStorage` in strict privacy modes), the `catch` block logs the error and still executes `navigate("/builder")`. This causes the user to land in the builder without their data, which is highly confusing.

## Print action review
- `window.print()` is executed on click.
- Buttons are appropriately hidden in print mode using `print:hidden`.
- **Risk:** `printMode` state controls classes like `print:block` and `print:hidden` correctly. No major risks identified here.

## Layout and table architecture review
- Row action buttons ("Copy route" and "Send to Essay Builder") are defined twice: once in the desktop `<table ...>` and once in the mobile `<article>`.
- The desktop table sits in a `<div className="hidden overflow-x-auto ...">`.
- The `th` cell holding the row actions uses `sticky left-0 z-10`.
- **Risk:** Placing interactive controls inside a sticky table cell that also scrolls can lead to hit-testing issues in some browsers (e.g. Safari iOS). If the z-index isn't strictly managed, elements might become unclickable.

## Test coverage review
- A. **Are all button handlers defined in one large component?** Yes, all handlers are defined inside `ComparativeMatrix`.
- B. **Are action buttons duplicated between desktop and mobile render paths?** Yes.
- C. **Are tests exercising the same DOM structure as production?** Tests are using JSDOM, which does not simulate real layout, z-index, or `overflow-x-auto` hit testing.
- D. **Are table-cell buttons affected by clipping/overflow?** Very likely, given reports of buttons not responding.
- E. **Are actions relying on browser APIs that can fail silently?** Yes (clipboard, localStorage).
- F. **Is feedback visible enough after click?** Navigation is instant, but failures use native alerts or silent console logs.
- G. **Are buttons disabled accidentally?** No.
- H. **Are duplicate action IDs or ambiguous accessible names causing test blind spots?** Yes, duplicate `aria-label`s exist because both desktop and mobile buttons are rendered at the same time.
- I. **Does compact/table mode hide or truncate controls?** Controls can be truncated if the `th` column doesn't match content size.
- J. **Does Vercel/auth/protected preview behaviour differ from local tests?** Yes, strict browser policies inside Vercel's wrapper iframe might block clipboard or localStorage.

## Failure modes identified
1. **Z-index / Stacking Context Clipping:** Buttons in the sticky `th` might not receive pointer events if `overflow-x-auto` or other DOM elements intercept the click.
2. **Duplicate DOM Nodes:** Both mobile and desktop action buttons are rendered simultaneously. While one is visually hidden by CSS, accessibility tools and tests might interact with the wrong one.
3. **Silent Handoff Failure:** Navigating to the builder even when handoff fails leaves the user stranded without data.
4. **Clipboard Permissions:** Using clipboard in cross-origin iframes (like Vercel preview) may fail and trigger the fallback alert.

## Recommended fixes
Extract the row action buttons into a shared `<ComparativeRouteActions />` component to ensure consistent behaviour. Remove the duplicate rendering if possible, or implement a responsive layout that changes the CSS rather than duplicating DOM nodes. Additionally, stop navigating to the builder if `integrateBuilderHandoffsIntoCurrentPlan` fails, and add an inline error message instead of an `alert()`.

## Proposed implementation PR
**Recommendation:** B. Refactor row actions into a shared component

**Next PR:** `refactor(matrix): extract route action controls`
- extract `handleCopy` and `handleSendToEssayBuilder` logic into a shared hook or component.
- ensure buttons are only rendered once per row, or clearly manage visibility.
- abort `navigate("/builder")` if handoff throws.
- replace `alert()` with inline UI feedback.
- no Supabase writes, no migrations, no AI, no AO5.

## AO compliance assessment
- Checked against Component 2 Prose requirements.
- The UI handles AO2, AO3, and AO4.
- AO5 is explicitly not included, adhering to the critical rule.
- No AO5 functionality or references were found in the exported data payloads.

## Risks and non-goals
- This audit does not modify any source code.
- We did not write a migration or update Supabase schemas.

## What was not changed
- `src/components/ComparativeMatrix.tsx` remains untouched.
- Test files remain untouched.
- Builder handoff logic remains untouched.
