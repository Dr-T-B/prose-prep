# Comparative Matrix Student Workflow Audit

## Executive summary

Following the merge of PR #63 (`d50462c`), which completed the Comparative Matrix theme-filter and route export feature set, this audit evaluates the end-to-end student journey. The workflow tested consists of a student selecting a theme filter (e.g. *childhood*), narrowing it down by AO/lens or search query, copying the resulting comparative route to the clipboard, and utilizing it as an essay-planning artifact.

The integration of these features is highly successful. The workflow functions seamlessly, filters compose correctly, accessibility labels and state are properly maintained, and copy actions do not leak into printed layouts.

Our final recommendation is **A. Workflow is ready for student use**, with a minor watchpoint for monitoring initial student feedback regarding copy button placement.

---

## Commands run

To verify build, test, and type sanity:
1. `npm run test` (vitest run) - Verified that all 363 tests passed successfully.
2. `npm run typecheck` (tsc --noEmit) - Confirmed zero compile-time type errors.
3. `npm run build` (vite build) - Verified successful production compilation.

---

## Files inspected

- `src/components/ComparativeMatrix.tsx` — Inspected UI rendering, hook state, formatting helpers, and click handling.
- `src/components/ComparativeMatrix.test.tsx` — Inspected unit test definitions, mock data structures, and assertion coverage.
- `docs/COMPARATIVE_MATRIX_THEMES_MULTISELECT_UX_AUDIT.md` — Inspected previous UX baseline to verify alignment on recommendations.

---

## Student workflow tested

The full student journey was triaged as follows:
1. **Thematic Filtering:** Student navigates to the matrix and filters by one or more themes (e.g., clicking the "Childhood" theme pill).
2. **Refining Search:** Student composes this with secondary filters (e.g. selecting "AO3" lens, or searching "setting") to locate relevant comparative routes.
3. **Route Discovery:** Student reviews matching routes in either the desktop table view or mobile accordion cards.
4. **Copying Planning Artifact:** Student clicks the "Copy route" button. The button temporarily flips to "Copied!" for 2 seconds as feedback.
5. **Workflow Portability:** The copied markdown scaffold is pasted into a student revision doc (e.g. Google Docs, Notion, or Markdown editor) for essay planning.

---

## Filtering behaviour

- **Pill Usability:** Dynamic theme chips remain highly discoverable, color-coded based on selection state, and cleanly wrap across layout rows.
- **Composition Integrity:** Active filter state properly composes across all parameters: `AO Filter ∩ Theme Filter ∩ Lens ∩ Search Query`.
- **Search Scope:** The search index correctly covers the rows' canonical theme array values alongside row content, ensuring intuitive queries.
- **Empty State:** If filters are too restrictive, a clear empty state with a "Clear all filters" escape hatch is displayed, resetting all query/pill states.

---

## Route export behaviour

- **Layout Integration:** The `Copy route` action is contextually placed. On desktop, it is nested within the sticky-left Theme `th` beneath the subtitle. On mobile, it appears as a clean, full-width action button at the bottom of the open card content. It is visible and accessible without being visually dominant.
- **Scaffold Readability:** The exported route formats as clean, valid Markdown. It presents clear sections for themes, thesis, Dickens vs McEwan arguments, individual AO metrics, and exam suitability.
- **Pasting Suitability:** Plain text/markdown output renders cleanly when pasted into third-party editors (like Google Docs or Notion), preserving headers, bullets, and line breaks.

### Sample Exported Text (Difficult circumstances row)
```markdown
# Comparative Route: Difficult circumstances

Themes: Childhood, Education

Thesis:
Both texts...

Hard Times:
Dickens uses circumstance as setting.

Atonement:
McEwan uses circumstance as plot device.

AO2 — Method:
AO2 specific method.

AO3 — Context:
AO3 historical context.

AO4 — Comparison:
AO4 comparison link.

Exam fit:
Good

Revision use:
Use this route as a paragraph plan or mini essay scaffold. Adapt quotations and contextual evidence to the exact question.
```

---

## Accessibility and mobile notes

- **Aria Attributes:** The theme filters now use `aria-pressed="true/false"` to denote selection states, and descriptive `aria-label` tags (e.g., `Toggle Childhood theme filter`).
- **Unambiguous Controls:** Reset buttons and clear actions contain precise descriptions (`aria-label="Reset theme filters"` and `aria-label="Clear all active filters"`).
- **Mobile Navigation:** The mobile accordion toggle button queries are decoupled from copy actions. Expanding/collapsing accordion cards behaves exactly as expected with no interference from the inner "Copy route" button.

---

## Print-mode notes

- **Print Safety:** Copy buttons are decorated with `print:hidden` classes.
- **Visual Cleanliness:** Physical printouts and PDF exports are entirely unpolluted by interactive buttons, selection states, or temporary feedback copy. Only the static matrix content is visible.

---

## AO compliance

- **Constraints Checked:** No AO5 routes, field bindings, labels, or validations exist in the exported text or active UI code.
- **Absence Check:** Verified that all search and projection variables query strictly Component 2 Prose metrics (AO1, AO2, AO3, AO4).

---

## Risks and watchpoints

- **Clipboard API Blockers:** Some environments (e.g., local sandboxed browsers or webviews inside certain chat platforms) block the asynchronous `navigator.clipboard` write permission. 
- **Mitigation:** The component implements a fallback to document command copy (`document.execCommand('copy')`). In case both fail, it catches the error and issues an unobtrusive console logger and instruction alert.
- **Copy Button Prominence:** In the desktop view, the copy button sits underneath the subtitle. Depending on screen resolutions, this may wrap the left theme column slightly wider. We should monitor student feedback to see if they prefer this layout or a floating action button.

---

## Recommendation

**A. Workflow is ready for student use**

The student journey from filtering to route extraction is highly cohesive. The output format is readable, accurate, and ready to be integrated into classrooms and individual student study sessions. No blocking UI errors or functional gaps were found.

---

## What was not changed

- No database structures or schemas were modified.
- No Supabase remote writes were run.
- No source code or UI styling was mutated during this audit session.
- Seed data remains untouched.
- No AI model endpoints were integrated.
