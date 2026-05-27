# AO4 Comparative Route Engine

## Purpose

The AO4 Comparative Route Engine is the source-locked comparative judgement layer for Pearson Edexcel A-Level English Literature Component 2: Prose, comparing *Hard Times* and *Atonement*.

It gives students compact planning routes for similarity, difference and conceptual hinges so comparison becomes an argument rather than a bolt-on paragraph ending.

## Component 2 Assessment Rule

Component 2 Prose uses AO1, AO2, AO3 and AO4 only. This engine must not add any additional assessment-objective scoring, labels, filters, database fields, validation rules or route logic.

## Source

Canonical source sheet:

https://docs.google.com/spreadsheets/d/1v3RF1UuduQfRi4ZXr_dgsRu6ujSNBYzTwZ10x8R7X1o

Sheet title:

`AO4_complete_matrix_Hard_Times_Atonement`

The sheet was exported locally as a temporary CSV for reconciliation. The temporary CSV was not committed.

## Source Schema

The Google Sheet columns matched the expected schema:

- Route ID
- Theme / Exam Trigger
- Comparative Thesis (AO4 judgement)
- Hard Times: comparison point
- Atonement: comparison point
- Similarity
- Difference
- AO4 hinge / conceptual bridge
- Best evidence zones
- Paragraph route
- Exam sentence stem
- Priority

## Reconciliation Status

Strict source reconciliation is complete for local app use.

- Final route count: 24
- Route IDs: `AO4-01` through `AO4-24`
- Source priority values: `Tier 1`, `Tier 2`
- No missing route IDs
- No duplicate route IDs
- No `#REF!` residue
- No excluded assessment-objective references

The local seed lives in `src/data/ao4ComparativeRoutes.ts` and preserves the Google Sheet wording for required columns.

## Local-Only Status

This is a local seed and utility layer only:

- Types: `src/types/ao4ComparativeRoutes.ts`
- Seed data: `src/data/ao4ComparativeRoutes.ts`
- Utilities: `src/lib/ao4ComparativeRoutes.ts`
- Optional panel: `src/components/Ao4ComparativeRoutePanel.tsx`

No Supabase writes were run. No migrations were created or applied.

## Relationship To AO3 And Route Combinations

AO3 explains contextual pressure. AO4 turns the planning route into comparative judgement.

The AO Route Combination Engine now resolves AO4 route IDs against the source-locked AO4 dataset rather than the older interim `COMPARATIVE_MATRIX` seed. AO3 references still resolve against the source-locked AO3 Context Route Engine.

## Future Work

Recommended next phase:

- Source-lock AO1 conceptual thesis routes.
- Source-lock AO2 method routes.
- Reconcile route-combination pilot entries against those AO1/AO2 datasets.
- Prepare a dry-run import plan for Supabase only after explicit approval.
