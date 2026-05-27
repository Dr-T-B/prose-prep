# AO1 Concept Route Engine

## Purpose

The AO1 Concept Route Engine is the source-locked conceptual thesis layer for Pearson Edexcel A-Level English Literature Component 2: Prose, comparing *Hard Times* and *Atonement*.

It gives students compact thesis routes for argument, text-specific conceptual direction, comparative judgement and an intro-ready thesis sentence starter.

## Component 2 Assessment Rule

Component 2 Prose uses AO1, AO2, AO3 and AO4 only. This engine must not add AO5 scoring, labels, filters, database fields, validation rules or route logic.

## Source

Canonical source sheet:

https://docs.google.com/spreadsheets/d/12RrUKOYKhbUQ9YLrGj0adb4ueAWLMwuYUjDBJem25t8

Sheet title:

`AO1_complete_matrix_Hard_Times_Atonement`

Primary tab used:

`Final AO1 Matrix`

The Google Sheet was exported locally to `/tmp/prose-prep-ao1/AO1_complete_matrix_Hard_Times_Atonement.xlsx` for reconciliation. The temporary export was not committed.

## Source Schema

The live Google Sheet columns differed from the initially expected schema. The `Final AO1 Matrix` tab has title rows before the table, and the actual source columns are:

- Route ID
- Priority
- Theme / Focus
- Likely exam stems
- Core AO1 argument
- Hard Times conceptual route
- Atonement conceptual route
- Comparative hinge / judgement
- Thesis sentence starter

The expected prompt columns `Master Cluster`, `Core Concept / Theme`, `Concept Upgrade Move`, the three paragraph-claim columns and `Common Failure to Avoid` were not present in the canonical sheet. The local model preserves the actual source columns rather than inventing missing fields.

## Reconciliation Status

Strict source reconciliation is complete for local app use.

- Final route count: 24
- Route IDs: `AO1-001` through `AO1-024`
- Source priority values: `CORE`, `HIGH`, `MEDIUM`
- No missing route IDs
- No duplicate route IDs
- No `#REF!` residue
- No AO5 references in local route data

The local seed lives in `src/data/ao1ConceptRoutes.ts` and preserves the Google Sheet wording for required columns.

## Local-Only Status

This is a local seed and utility layer only:

- Types: `src/types/ao1ConceptRoutes.ts`
- Seed data: `src/data/ao1ConceptRoutes.ts`
- Utilities: `src/lib/ao1ConceptRoutes.ts`
- Optional panel: `src/components/Ao1ConceptRoutePanel.tsx`

No Supabase writes were run. No migrations were created or applied.

## Relationship To AO2, AO3, AO4 And Route Combinations

AO1 supplies the conceptual line of argument. AO2 explains how method creates meaning. AO3 explains contextual pressure. AO4 turns the line of argument into comparative judgement.

The AO Route Combination Engine now resolves AO1 route IDs against this source-locked AO1 dataset rather than interim `ROUTES` material from `src/data/seed.ts`. AO2 references resolve against the source-locked AO2 Method Route Engine, AO3 references resolve against the source-locked AO3 Context Route Engine, and AO4 references resolve against the source-locked AO4 Comparative Route Engine.

## Future Work

Recommended next phase:

- Classroom pilot the fully source-locked AO1/AO2/AO3/AO4 route-combination flow.
- Collect teacher/student feedback on route usefulness and wording.
- Prepare optional dry-run import planning only after the local classroom-ready route set is stable.
- Keep any Supabase import as a later explicit-approval phase.
