Use this as a manual smoke-test script after PR #126 has deployed to production.

# Prose-prep Production Smoke Test — PR #126

## Purpose

Verify that the new Essay Feedback question workflow works safely in production after PR #126.

Feature under test:

* Existing practice question selection
* Custom essay question input
* Theme-generated essay questions
* Selected question passed into Essay Feedback
* AI feedback remains formative-only and AO1–AO4 only

Production app:

`https://prose-prep.vercel.app`

Latest expected `main`:

`70177df62cf26be61a7738ec107c8440b2d7b36c`

---

# A. Pre-test setup

## A1. Browser setup

Use one normal browser window and one mobile-width/responsive check if possible.

Recommended:

* Chrome desktop
* Chrome DevTools mobile view, or phone browser

Before testing:

* Hard refresh the app.
* Open DevTools Console if possible.
* Watch for red runtime errors.
* Do not use local/dev URLs.
* Do not run Supabase commands.

Result:

* [ ] Production app opens.
* [ ] No blank screen.
* [ ] No obvious console crash.
* [ ] Navigation is visible.

Notes:

```text
Browser:
Device:
Time:
Tester:
```

---

# B. Basic production route check

Open each route directly.

| Route                 | Expected result          | Pass |
| --------------------- | ------------------------ | ---- |
| `/`                   | Home/dashboard loads     | [ ]  |
| `/matrix`             | Comparative Matrix loads | [ ]  |
| `/rapid-recall`       | Rapid Recall loads       | [ ]  |
| `/paragraph-feedback` | Paragraph Feedback loads | [ ]  |
| `/essay-marker`       | Essay Feedback loads     | [ ]  |

Global checks:

* [ ] Navigation works between pages.
* [ ] No AO5 appears in visible student-facing UI.
* [ ] No page shows a blank screen.
* [ ] No page shows a fatal error.

Notes:

```text
```

---

# C. Essay Feedback page — initial load

Open:

`/essay-marker`

Expected:

* Page is labelled as **Essay Feedback** or equivalent.
* Page does not present itself as official marking.
* Page explains that feedback is formative.
* Page references AO1–AO4 only.
* It does not mention AO5 as part of Component 2.
* It does not promise marks, grades, levels, bands, scores, model answers, or rewrites.

Pass checks:

* [ ] Page loads.
* [ ] Page title/heading is Essay Feedback or formative equivalent.
* [ ] AO1–AO4 wording is visible.
* [ ] No AO5 appears in student-facing content.
* [ ] No “mark my essay” wording appears.
* [ ] No “score”, “grade”, “level”, “band”, or “top band” promise appears.
* [ ] No “model answer” or “rewrite” promise appears.

Notes:

```text
```

---

# D. Existing question mode

## D1. Select existing question mode

On `/essay-marker`, select:

**Existing question**

Expected:

* Existing/practice question list appears.
* It is clear these are practice/sample questions.
* Selecting a question works.
* The selected question appears clearly above the answer box.

Pass checks:

* [ ] Existing question mode is visible.
* [ ] Existing question list appears.
* [ ] At least one question can be selected.
* [ ] Selected question appears above or near the answer box.
* [ ] No layout break on desktop.
* [ ] No AO5/marks/grades/levels/bands wording appears.

Selected question:

```text
Paste selected existing question here:
```

---

## D2. Submit a short answer with existing question

Use this short test answer:

```text
Both Dickens and McEwan present childhood as shaped by adult power. In Hard Times, Gradgrind's schoolroom reduces children to facts, showing how industrial society can damage imagination. In Atonement, Briony's childhood imagination gives her power, but it also causes harm because she misunderstands adult relationships. Both writers suggest that childhood is not innocent in a simple way: it is shaped by social systems, family authority and the limits of perception.
```

Submit for feedback.

Expected:

* The form submits without crashing.
* Feedback returns or safe provider-state message appears.
* If feedback returns, it is formative-only.
* Feedback refers to AO1–AO4 only.
* No official mark/grade/level/band/score appears.
* No model answer, full rewrite, or full essay appears.

Pass checks:

* [ ] Submission works.
* [ ] No blank screen.
* [ ] Feedback returns, or provider-state failure is handled safely.
* [ ] Feedback is AO1–AO4 only.
* [ ] No AO5.
* [ ] No marks.
* [ ] No scores.
* [ ] No grades.
* [ ] No levels.
* [ ] No bands/top-band wording.
* [ ] No model answer.
* [ ] No rewrite/full essay.

Notes:

```text
```

---

# E. Custom question mode

## E1. Empty custom question validation

Select:

**My own question**

Leave the custom question field empty.

Try to submit or proceed.

Expected:

* Empty custom question is blocked.
* User receives a clear validation message.
* No crash.
* No feedback request should be sent.

Pass checks:

* [ ] Custom question mode appears.
* [ ] Empty question is blocked.
* [ ] Clear validation message appears.
* [ ] No crash.
* [ ] Button remains usable after validation.

Validation message seen:

```text
```

---

## E2. Non-comparative custom question warning

Enter this weak/non-comparative question:

```text
How does Dickens present education?
```

Expected:

* The question is not blocked purely because it is weak.
* A gentle warning appears, similar to:
  “For Edexcel Component 2, stronger practice questions usually ask you to compare both texts and relate ideas to context.”
* User can still proceed if they want.

Pass checks:

* [ ] Warning appears.
* [ ] Warning is gentle, not a hard block.
* [ ] No crash.
* [ ] User can continue.
* [ ] No unsafe marking language appears.

Notes:

```text
```

---

## E3. Strong custom question submission

Replace the question with:

```text
Compare the ways in which Dickens and McEwan present childhood as shaped by adult authority. You must relate your discussion to relevant contextual factors.
```

Expected:

* Warning should disappear or become less prominent.
* Selected custom question appears above the answer box.
* The answer can be submitted for feedback.
* Feedback remains formative-only.

Use this answer:

```text
Dickens and McEwan both present childhood as vulnerable to adult authority, but they do so in different ways. In Hard Times, Gradgrind's educational system treats children as products of industrial utility, so childhood is controlled by public institutions and utilitarian values. In Atonement, Briony's childhood is shaped more privately by family status, class assumptions and the adult world she only partly understands. Both texts suggest that children are not naturally free: they are formed by the expectations, silences and pressures of adults around them.
```

Pass checks:

* [ ] Strong custom question is accepted.
* [ ] Selected question appears above answer box.
* [ ] Submission works.
* [ ] Feedback returns or safe provider-state message appears.
* [ ] Feedback references the custom question.
* [ ] Feedback is AO1–AO4 only.
* [ ] No AO5.
* [ ] No marks/scores/grades/levels/bands.
* [ ] No model answer/rewrite/full essay.

Notes:

```text
```

---

# F. Generate from theme mode

## F1. Generate from preset theme

Select:

**Generate from theme**

Choose theme:

```text
memory
```

Expected:

* 3–5 questions are generated.
* Questions are local/template-style, not AI-generated live.
* Questions are Edexcel Component 2 comparative style.
* Questions mention comparing both texts or Dickens/McEwan.
* Questions include contextual factors.
* Generated questions are selectable.

Pass checks:

* [ ] Theme mode appears.
* [ ] Theme can be selected.
* [ ] 3–5 questions are generated.
* [ ] Generated questions are comparative.
* [ ] Generated questions mention context.
* [ ] Generated question can be selected.
* [ ] Selected generated question appears above the answer box.

Paste generated questions:

```text
1.
2.
3.
4.
5.
```

---

## F2. Submit answer with generated question

Select one generated question.

Use this answer:

```text
Both writers present memory as unstable and morally important. In Hard Times, memory is connected to emotional deprivation: Louisa looks back on her childhood and recognises how little imaginative or emotional freedom she was given. In Atonement, memory becomes part of storytelling and guilt, because Briony's later version of events tries to reshape the damage caused by her childhood mistake. Dickens uses memory to criticise utilitarian education, while McEwan uses it to question whether narrative can repair harm.
```

Submit for feedback.

Expected:

* The generated question is passed into feedback.
* Feedback refers to the selected generated question.
* Output remains formative-only.

Pass checks:

* [ ] Submission works.
* [ ] Feedback returns or provider-state failure is handled safely.
* [ ] Feedback references the generated question/theme.
* [ ] Feedback is AO1–AO4 only.
* [ ] No AO5.
* [ ] No marks/scores/grades/levels/bands.
* [ ] No model answer/rewrite/full essay.

Notes:

```text
```

---

## F3. Generate from typed theme

If there is a typed theme field, enter:

```text
misunderstanding
```

Generate questions.

Expected:

* 3–5 questions are generated.
* Questions are comparative and Component 2 style.
* No unsafe wording appears.

Pass checks:

* [ ] Typed theme accepted.
* [ ] 3–5 questions generated.
* [ ] Questions are comparative.
* [ ] Questions mention contextual factors.
* [ ] Question can be selected.

Notes:

```text
```

---

# G. Safety wording sweep on Essay Feedback page

While staying on `/essay-marker`, scan the visible UI after using all three modes.

The page must not show student-facing unsafe wording.

Check absent:

* [ ] AO5
* [ ] mark my essay
* [ ] official mark
* [ ] score
* [ ] grade
* [ ] level
* [ ] band
* [ ] top band
* [ ] model answer
* [ ] rewrite
* [ ] full essay
* [ ] model upgrade paragraph

Allowed wording:

* [ ] Essay Feedback
* [ ] check my answer
* [ ] formative feedback
* [ ] AO1–AO4 guidance
* [ ] revision targets
* [ ] strengths
* [ ] priority targets
* [ ] quotation diagnostics
* [ ] next step

Notes:

```text
```

---

# H. Mobile layout check

Use phone or responsive browser mode.

Open:

`/essay-marker`

Test:

* Existing question mode
* My own question mode
* Generate from theme mode
* answer textarea
* submit button
* generated question selection

Expected:

* No horizontal scrolling.
* Controls are readable.
* Question source selector is usable.
* Textareas are usable.
* Generated question cards/buttons are tappable.
* Selected question remains visible.
* Submit button remains accessible.

Pass checks:

* [ ] Mobile page loads.
* [ ] Question source selector works.
* [ ] Existing question selection works.
* [ ] Custom question input works.
* [ ] Theme generation works.
* [ ] Generated question selection works.
* [ ] Answer box usable.
* [ ] Submit button usable.
* [ ] No layout break.
* [ ] No blank screen.

Notes:

```text
```

---

# I. Navigation regression check

From `/essay-marker`, navigate to:

| Page                  | Expected                       | Pass |
| --------------------- | ------------------------------ | ---- |
| `/rapid-recall`       | Rapid Recall still loads       | [ ]  |
| `/paragraph-feedback` | Paragraph Feedback still loads | [ ]  |
| `/matrix`             | Matrix still loads             | [ ]  |
| `/`                   | Home/dashboard still loads     | [ ]  |

Check:

* [ ] Nav labels still make sense.
* [ ] No new route crash.
* [ ] No AO5 visible.
* [ ] No unsafe feedback wording appears outside Essay Feedback.

Notes:

```text
```

---

# J. Provider-state behaviour

Depending on whether production provider keys are configured, one of these should happen:

## If provider is available

Expected:

* Feedback returns normally.
* Feedback is formative-only.
* Feedback references the submitted question and answer.
* Output is AO1–AO4 only.

Pass:

* [ ] Feedback returned normally.
* [ ] Feedback is formative-only.
* [ ] No unsafe wording.

## If provider is unavailable

Expected:

* User sees a safe unavailable/provider message.
* No crash.
* No blank screen.
* Button/form remains usable.
* No unsafe fallback content appears.

Pass:

* [ ] Safe unavailable message shown.
* [ ] No crash.
* [ ] No blank screen.
* [ ] Form remains usable.

Notes:

```text
```

---

# K. Final result

## Verdict

Choose one:

* [ ] PASS — production feature is ready to use
* [ ] PASS WITH MINOR ISSUES — usable, but needs small cleanup
* [ ] FAIL — do not rely on feature yet

## Summary

```text
Overall result:

Main issues found:

Routes tested:

Provider available or unavailable:

Any screenshots captured:

```

## Blocking issues

List any blocker here:

```text
1.
2.
3.
```

A blocker includes:

* blank screen
* submit crash
* selected question not passed into feedback
* custom question unusable
* generated questions cannot be selected
* AO5 appears in student-facing Component 2 flow
* marks/grades/levels/bands/scores appear in Essay Feedback
* model answer/rewrite/full essay appears
* provider failure causes crash instead of safe message

## Minor issues

```text
1.
2.
3.
```

## Final confirmation

* [ ] Existing question mode tested.
* [ ] Custom question mode tested.
* [ ] Theme-generated question mode tested.
* [ ] AI feedback/provision state tested.
* [ ] AO1–AO4 only confirmed.
* [ ] Formative-only feedback confirmed.
* [ ] No Supabase commands run.
* [ ] No production/staging data manually changed.
