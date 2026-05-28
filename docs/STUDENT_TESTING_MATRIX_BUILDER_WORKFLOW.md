# Live Student Testing Script — Matrix to Builder Workflow

## Purpose of the test
This is a usability test, not a knowledge test. The student is testing the app to ensure the workflow is intuitive and effective for revision ahead of the Component 2 Prose exam on 01/06/2026. Explain to the student that any confusion or mistakes they make are valuable data indicating where the app needs improvement, not a reflection of their academic ability.

## Student profile
Target user:
- A-Level English Literature student
- Pearson Edexcel Component 2 Prose
- Texts: Hard Times and Atonement
- Current working level: B/A boundary (grading scale: A*, A, B, C, D)
- Target: A/A*

## Test setup
- **Device used:** [e.g., iPad / MacBook / Windows Laptop]
- **Browser:** [e.g., Safari / Chrome / Edge]
- **Screen size:** [e.g., 13-inch / tablet landscape]
- **Authenticated:** [Yes / No]
- **Starting page:** `/matrix` (Comparative Matrix)
- **Time allowed:** 30–45 minutes
- **Question policy:** The student is encouraged to "think aloud" but the observer should only answer questions if the student is completely blocked from continuing.

## Pre-test questions
Ask the student before beginning:
1. What do you think a Comparative Matrix is for?
2. What would you expect a “route” to help you do?
3. What kind of essay question are you currently least confident with?
4. What do you normally need help with: ideas, quotes, structure, AO2, AO3, or comparison?

---

## Task 1 — Find a useful route
**Instruction to student:**
“Open the Comparative Matrix. Find a route that would help you answer a question about childhood, education, class, guilt, memory, or family.”

**Observe:**
- Does the student notice the theme filters?
- Does the student use the search bar?
- Does the student understand the AO/lens controls?
- How long does it take to find a route?
- Does the chosen route make sense for their selected topic?

**Success criteria:**
- Student selects a relevant route within 2–3 minutes.
- Student can explain why the route is useful.

## Task 2 — Use filters deliberately
**Instruction:**
“Now narrow the matrix using one theme and one other control.”

**Observe:**
- Does the student understand what the selected theme chips do?
- Can they easily figure out how to clear filters?
- Do they recover smoothly if a combination yields "no results"?

**Success criteria:**
- Student can filter and clear without intervention or help.

## Task 3 — Copy route
**Instruction:**
“Use Copy route and paste the result into a blank note or document.”

**Observe:**
- Does the student understand what the Copy route function does?
- Is the copied scaffold readable in their external document?
- Does the student inherently know how to use it?

**Ask:**
“What would you do next with this copied route?”

**Success criteria:**
- Copied text is understandable and correctly formatted.
- Student identifies it as an essay-plan scaffold, not a finished paragraph.

## Task 4 — Send route to Essay Builder
**Instruction:**
“Now send a different route to the Essay Builder.”

**Observe:**
- Does the student distinguish the difference between "Copy route" and "Send to Essay Builder"?
- Do they understand that they have moved into a dedicated planning workspace?
- Does the ExploreIntake view make sense to them?

**Success criteria:**
- Student successfully lands in the Essay Builder.
- Student can clearly identify the imported route within the UI.

## Task 5 — Create paragraph card
**Instruction:**
“Create a paragraph card from the imported route.”

**Observe:**
- Does the student easily find the button to create a card?
- Does the button wording make immediate sense?
- Does the newly created card appear exactly where they expect it to?
- Does the student intuitively understand the card is editable?

**Success criteria:**
- Student creates a card without help.
- Student can explain what the card is for in the context of their essay.

## Task 6 — Improve the paragraph card
**Instruction:**
“Edit the card so it becomes more useful for an essay plan.”

**Student should add or improve:**
- A clearer claim
- One *Hard Times* detail
- One *Atonement* detail
- One AO2 method point
- One AO3 context point
- One AO4 comparison point

**Observe:**
- Which input fields are clear to the student?
- Which fields cause hesitation or confuse the student?
- Does the student accurately understand the distinction between AO2, AO3, and AO4 inputs?

**Success criteria:**
- The paragraph card becomes noticeably more specific and actionable.
- Student can explain how this card would directly support drafting a paragraph.

## Task 7 — Copy or print essay plan
**Instruction:**
“Now copy or print the essay plan.”

**Observe:**
- Does the active paragraph card appear correctly in the final output?
- Is the layout of the output useful for active revision?
- Does the student recognise and understand the AO checklist?
- **Crucial:** Does the output successfully exclude AO5?

**Success criteria:**
- Output contains the active card.
- Student explicitly states the output is usable for revision or paragraph writing.

---

## Post-test questions
Ask the student:
1. What was the easiest part of the workflow?
2. What was the most confusing part?
3. Did “Copy route” and “Send to Essay Builder” feel different enough?
4. Did the paragraph card help you understand what to write?
5. Would you use this before writing a timed essay?
6. What wording would you change to make it clearer?
7. What would make the final output more useful?
8. Did anything feel like a finished answer rather than a plan?

---

## Scoring rubric

| Area | 0 = Failed | 1 = Needed help | 2 = Independent |
|---|---|---|---|
| Finds Comparative Matrix route | | | |
| Uses theme filter | | | |
| Uses search/AO/lens controls | | | |
| Understands Copy route | | | |
| Understands Send to Essay Builder | | | |
| Creates paragraph card | | | |
| Edits paragraph card | | | |
| Copies/prints essay plan | | | |
| Understands AO2/AO3/AO4 | | | |
| Avoids treating output as finished essay | | | |

## Pass/fail threshold

**Ready for wider use if:**
- No critical task scores 0.
- At least 7 out of 10 areas score 2.
- Student can accurately explain the workflow in their own words.
- Output is judged useful for essay planning.

**Needs refinement if:**
- Student confuses Copy route and Send to Essay Builder.
- Student cannot find the imported route in the Builder.
- Student does not understand the purpose of the paragraph card.
- Copied/printed output feels incomplete or confusing.

---

## Observer notes template
- **Date:** 
- **Tester:** 
- **Student (Initials):** 
- **Device:** 
- **Task timings (approx):** 
- **Observed confusion (where/when):** 
- **Direct student quotes:** 
- **Bugs found:** 
- **Suggested improvements:** 
- **Priority rating (Low/Med/High):** 

---

## Bug / improvement log

| Issue | Severity | Evidence | Suggested fix | Priority |
|---|---|---|---|---|
| | | | | |
| | | | | |

*Severity Scale:*
- **Critical:** Blocks task completion
- **Major:** Student needs help
- **Minor:** Wording/layout issue
- **Enhancement:** Nice-to-have

---

## Final recommendation after test
*(Choose one based on observation)*
- [ ] **A.** Ready for regular student use
- [ ] **B.** Minor wording/UI polish needed
- [ ] **C.** Paragraph card format needs refinement
- [ ] **D.** Output format needs refinement
- [ ] **E.** Workflow needs redesign before student use

---

## Non-goals
During this specific testing session:
- No AI generation features are tested.
- No Supabase database writes are tested.
- No AO5 criteria are tested or supported.
- No marking accuracy is tested.
- No timed essay performance is measured.
