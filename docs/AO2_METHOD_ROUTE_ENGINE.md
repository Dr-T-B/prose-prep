# AO2 Method Route Engine

## Purpose

The AO2 Method Route Engine is the source-locked method layer for Pearson Edexcel A-Level English Literature Component 2: Prose, comparing *Hard Times* and *Atonement*.

It gives students compact planning routes for language, form and structure: method, best evidence zone, AO2 effect, comparative hinge, best themes and an exam sentence stem.

## Component 2 Assessment Rule

Component 2 Prose uses AO1, AO2, AO3 and AO4 only. This engine must not add AO5 scoring, labels, filters, database fields, validation rules or route logic.

## Source

Canonical source sheet:

https://docs.google.com/spreadsheets/d/1R1dKX779toLd_WZzlW9FZ8VGnDXbDfs62tvyua_aGPQ

Sheet title:

`AO2_complete_matrix_Hard_Times_Atonement`

Primary tab used:

`Final AO2 Matrix`

The Google Sheet was exported locally to `/tmp/prose-prep-ao2/AO2_complete_matrix_Hard_Times_Atonement.xlsx` for reconciliation. The temporary export was not committed.

## Source Schema

The Google Sheet columns matched the expected schema exactly:

- Route ID
- AO2 route
- Hard Times: method
- Hard Times: best evidence zone
- Hard Times: AO2 effect
- Atonement: method
- Atonement: best evidence zone
- Atonement: AO2 effect
- Comparative AO4 hinge
- Best themes
- Exam sentence stem
- Priority

## Reconciliation Status

Strict source reconciliation is complete for local app use.

- Final route count: 24
- Route IDs: `AO2-01` through `AO2-24`
- Source priority values: `CORE`, `HIGH`, `MEDIUM`
- No missing route IDs
- No duplicate route IDs
- No `#REF!` residue
- No AO5 references

The local seed lives in `src/data/ao2MethodRoutes.ts` and preserves the Google Sheet wording for required columns.

## Local-Only Status

This is a local seed and utility layer only:

- Types: `src/types/ao2MethodRoutes.ts`
- Seed data: `src/data/ao2MethodRoutes.ts`
- Utilities: `src/lib/ao2MethodRoutes.ts`
- Optional panel: `src/components/Ao2MethodRoutePanel.tsx`

No Supabase writes were run. No migrations were created or applied.

## Relationship To AO3, AO4 And Route Combinations

AO2 explains how language, form and structure create meaning. AO3 explains contextual pressure. AO4 turns the planning route into comparative judgement.

The AO Route Combination Engine now resolves AO2 route IDs against this source-locked AO2 dataset rather than interim local `QUOTE_METHODS` material. AO3 references resolve against the source-locked AO3 Context Route Engine, and AO4 references resolve against the source-locked AO4 Comparative Route Engine.

## Future Work

Recommended next phase:

- Source-lock AO1 conceptual thesis routes.
- Reconcile the AO Route Combination Engine against source-locked AO1 once available.
- Prepare any future database-backed plan as a dry-run only until explicit Supabase approval is given.
