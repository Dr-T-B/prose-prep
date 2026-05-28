# Comparative Matrix Themes Multiselect UX Audit

## Executive Summary

Following the merge of PR #60 (`ea34087`), this audit evaluates the user experience (UX) and visual design of the newly introduced Comparative Matrix theme multiselect filter. The filter provides a list of toggleable theme buttons (pills/chips) derived dynamically from the `comparative_matrix` rows. 

The current implementation is visually premium, highly functional, and composes cleanly with existing search and AO filters. It complies fully with the Prose Tutor App's design aesthetics and constraint rules (e.g. strictly avoiding AO5).

Our final recommendation is **A. Keep current chip-row implementation**, as it provides optimal discoverability and zero-barrier interaction for A-Level revision students, with minor accessibility (A11y) enhancements proposed for a future non-breaking pass.

---

## Current Implementation Analysis

### 1. Desktop Layout
- **Placement & Flow:** The themes filter is rendered as a full-width (`w-full`) container positioned at the bottom of the existing filter header controls. By placing it on a dedicated row, it avoids crowding the search box, AO toggle buttons, and print/mode selectors.
- **Visual Structure:** It utilizes a subtle background tint (`bg-rule/5` or `rgba(0,0,0,0.05)` equivalent) with a light border (`border-rule/50`). This cleanly groups the themes together, separating them visually from both the top filters and the table/accordion below.
- **Density:** Pills flow and align naturally using `flex flex-wrap items-center gap-1.5`.

### 2. Mobile Wrapping
- **Reflow:** Under mobile and tablet breakpoints (`lg:hidden`), the inline chip row wraps automatically to 2 or 3 lines.
- **Touch Targets:** The buttons use `.rounded-full px-2.5 py-0.5 text-xs`. While visually elegant and readable, the tap target height (approx. 24px) is slightly smaller than the ideal mobile default (44px) but remains highly usable due to the `gap-1.5` padding that prevents accidental double-taps.

### 3. Print Mode Impact
- **Print Safety:** The theme filter container is nested inside the parent `print:hidden` header wrapper. This ensures that no interactive elements, selection states, or reset buttons clutter physical printouts or teacher PDFs.
- **Matrix Integrity:** Printouts cleanly format either the Compact Matrix, Revision Cards, or Teacher Pack without any control interfaces, matching expectation.

### 4. Empty State Clarity
- **Visibility:** When active filters (search query + selected themes + AO selection) yield zero results, the table and accordion are cleanly replaced by a dedicated empty-state block.
- **Copy:** It displays a clear user-friendly prompt: 
  > *"No comparative routes match the current filters. Try clearing a theme or search term."*
- **Actionability:** An explicit, high-contrast button ("Clear all filters") is provided in the center of the block, allowing the student to reset all filter parameters with a single click.

### 5. Reset Behaviour
- **Granular Reset:** A "Reset themes" text button appears on the right side of the theme pill row (`ml-auto`) only when one or more themes are active.
- **Global Reset:** Clicking the main "Clear filters" or the empty-state "Clear all filters" button clears the search query, AO filter, lens filter, and all selected themes.

### 6. Filter Composability
- **Logical Pipeline:** The filters compose with strict **AND** logic between different filter *types* (AO Filter ∩ Theme Filter ∩ Search Query), and **OR** logic *within* the theme filter (matches theme A OR theme B).
- **Search Extension:** The search logic was updated to search within the row's assigned theme tags in addition to regular columns. This prevents confusing states where searching for a theme name (e.g. "childhood") returns no results when a theme pill filter is active.

### 7. Accessibility (A11y) Basics
- **Semantic HTML:** Interactive controls use native `<button>` elements, ensuring keyboard focusability and screen reader interaction.
- **Contrast:** High visual contrast exists between active (`bg-ink text-paper`) and inactive (`border-rule bg-paper text-ink-muted`) pills.
- **A11y Enhancement Opportunity:** Currently, the toggle state is communicated purely via visual color differences. For screen readers, adding `aria-pressed={isSelected}` or `aria-label={`Toggle ${formatThemeLabel(theme)} filter`}` would elevate the control to AAA standard.

---

## Theme Pill Visual Noise & Density

With the current vocabulary of **12 canonical themes** (authorship, childhood, class, education, endings, family, guilt, imagination, justice, memory, morality, war), the filter block occupies exactly **one line** on desktop and **two lines** on mobile. 
- **Noise Assessment:** The pills are not visually noisy. The clean font, generous spacing, and muted gray borders keep the row looking premium and structured.
- **Scalability Limit:** If the theme vocabulary scales beyond 20 items, a raw wrap-around chip list will become a "wall of tags" and begin to push the matrix down the fold. At that stage, grouping or grouping disclosure would be required.

---

## UI Alternatives Comparison

| Alternative | Pros | Cons | Verdict |
| :--- | :--- | :--- | :--- |
| **A. Inline Chip Row** *(Current)* | Max discoverability; zero interaction friction; instant visual cues. | Consumes vertical space on small screens; doesn't scale past 20 tags. | **Recommended** for current scale. |
| **B. Compact Dropdown** | Minimal space usage; keeps header uniform. | Hides options behind a click; poor discoverability for revision categories. | Not recommended (reduces student exploration). |
| **C. Disclosure Panel** | Collapsible drawer; excellent space management on mobile. | Adds an extra click step for desktop users to filter. | Good alternative for a future layout revision. |
| **D. Grouped Chips** | Categorizes themes (e.g., character themes vs plot themes). | Overhead of defining and maintaining metadata groupings. | Overkill for 12 themes. |

---

## AO Compliance Assessment

- **AO Scope:** The filter and the component strictly query and display Edexcel Component 2 Prose elements (AO1/AO2/AO3/AO4).
- **AO5 Guard:** No AO5 options, database projections, UI components, mock entries, or route engine variables exist in the code.
- **Verification:** Searched the codebase and verified that the string `AO5` remains entirely absent from the active logic.

---

## Final Recommendation

**A. Keep current chip-row implementation**

### Rationale
The primary goal of the Prose Tutor App is revision and writing enablement. Students benefit from seeing the full vocabulary of 12 themes directly in front of them, as it sparks ideas for essay planning. Hiding these themes behind a dropdown or disclosure button would lower filter usage and hide the rich vocabulary. 

### Proposed Next Steps (Future Enhancements)
1. Add `aria-pressed` attributes to the theme filter buttons to improve screen reader feedback.
2. If new themes are added in future modules, implement a responsive collapsible panel (Option C) that is expanded by default on desktop but collapsed by default on mobile.

---

## What Was Checked & Verified
- Switched to clean `main` and confirmed squash merge commit `ea34087` is present.
- Ran TypeScript typecheck (`tsc --noEmit`) - passed.
- Ran Vitest unit tests (`npm run test`) - all 362 tests passed, including theme filter specs.
- Built production bundles successfully.
- Code inspection confirmed themes projection and defensive null checking are implemented robustly.
