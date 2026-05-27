# AO3 Context Route Engine

## Purpose

The AO3 Context Route Engine gives students compact, exam-ready contextual routes for Pearson Edexcel A-Level English Literature Component 2: Prose, focused on Hard Times and Atonement.

It turns context into a planning route: claim, pressure, method link, comparative hinge, sentence model and misuse warning.

## Assessment rule

Component 2 Prose uses AO1, AO2, AO3 and AO4 only.

This engine must not introduce AO5 scoring, filters, labels, database fields, validation or route logic.

## Schema

Source schema used for reconciliation:

- ID
- Theme / Exam Route
- Core AO3 Context Claim
- Hard Times AO3 Context
- Atonement AO3 Context
- Contextual Pressure / Institution
- How Context Shapes Meaning
- AO2 Method Link
- AO4 Comparative Hinge
- Exam-Ready AO3 Sentence
- Misuse / Pitfall to Avoid
- Priority

Local route shape:

```ts
export type Ao3Priority = "CORE" | "HIGH" | "MEDIUM";

export interface Ao3ContextRoute {
  id: string;
  themeExamRoute: string;
  coreContextClaim: string;
  hardTimesContext: string;
  atonementContext: string;
  contextualPressure: string;
  meaningEffect: string;
  ao2MethodLink: string;
  ao4ComparativeHinge: string;
  examReadySentence: string;
  misuseWarning: string;
  priority: Ao3Priority;
}
```

Route IDs use `AO3-XX`. Required fields must be non-empty and must not contain `#REF!` or excluded assessment-objective text.

## Source reconciliation status

Status: strict Google Sheet reconciliation completed.

Source sheet: https://docs.google.com/spreadsheets/d/1Wj9skS1hbxURYoy8JTkbmrYXSXme80iINYjOdkAcLno/edit?usp=sharing

Sheet title: `AO3_complete_matrix_Hard_Times_Atonement`

Final route count: 24.

The local seed now contains:

1. AO3-01 Childhood
2. AO3-02 Education
3. AO3-03 Imagination vs Facts
4. AO3-04 Class
5. AO3-05 Power and Authority
6. AO3-06 Suffering
7. AO3-07 Conflict
8. AO3-08 Love
9. AO3-09 Marriage
10. AO3-10 Women and Female Experience
11. AO3-11 Masculinity
12. AO3-12 Responsibility
13. AO3-13 Guilt
14. AO3-14 Memory
15. AO3-15 Truth and Deception
16. AO3-16 Justice and Injustice
17. AO3-17 Independence and Agency
18. AO3-18 Social Criticism
19. AO3-19 Hope and Endings
20. AO3-20 Morality
21. AO3-21 Compassion and Care
22. AO3-22 Identity
23. AO3-23 Storytelling and Authorship
24. AO3-24 War / Industrialism / Human Cost

The local seed in `src/data/ao3ContextRoutes.ts` now matches the Google Sheet source wording exactly for the required columns.

## Student workflow

In the Essay Builder, the student selects a Component 2 theme/question route. The app then displays matching AO3 Context Routes, ordered with CORE routes first. If no direct match is found, the app falls back to all CORE routes.

Each route gives the student a usable context claim, text-specific context for Hard Times and Atonement, an AO2 method connection, an AO4 comparative hinge and a warning against common misuse.

## Classroom review status

Status: classroom-ready for planning use.

The rendered panel keeps AO3 as argument rather than background by foregrounding a core context claim, text-specific context for both novels, a method link, a comparative hinge, an exam-ready sentence and a misuse warning.

UX readiness: ready for desktop and tablet essay planning. The route tabs are horizontally scrollable on screen, while print output hides the tab strip and prints the selected route panel cleanly.

Known limitations:

- CORE fallback can expose a broad set of routes when no query/route match is found, but only one route panel is open at a time.
- The local seed remains source-locked to the Google Sheet; student-facing wording should not be changed locally unless the source is corrected or there is a genuine rendering/accessibility issue.

## Why AO3 connects to AO2 and AO4

AO3 is strongest when it changes interpretation. In Component 2, context should explain how meanings are made through method and comparison:

- AO2 keeps context attached to writerly choices such as narration, imagery, structure, dialogue and focalisation.
- AO4 keeps context comparative, so Dickens and McEwan are not treated in separate background paragraphs.
- AO1 benefits because the route becomes an argument rather than a detached historical note.

## Import status

Current status: local seed only. The local seed remains the current app source for AO3 routes.

The seed lives in `src/data/ao3ContextRoutes.ts`. No Supabase connection, migration or remote database write has been added.

No Supabase writes or migrations were run during the strict Google Sheet reconciliation pass.

No Supabase writes or migrations were run during the classroom review and UX quality pass.

## Future Supabase plan

Pending explicit approval, a later phase can:

1. Create a Supabase table for AO3 context routes.
2. Add a migration with the typed fields above and guard constraints.
3. Import the cleaned matrix data.
4. Regenerate Supabase types.
5. Wire read-only client loading with local seed fallback.

No remote Supabase write operation should be run until that phase is explicitly approved.
