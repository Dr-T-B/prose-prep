# AO Route Combination Engine

## Purpose

The AO Route Combination Engine is a local planning layer for Pearson Edexcel A-Level English Literature Component 2: Prose. It suggests coherent essay pathways that connect:

- AO1 conceptual thesis route
- AO2 method routes
- AO3 context routes
- AO4 comparative hinge routes

The first version is a focused pilot for planning rather than a complete syllabus matrix.

## Component 2 Assessment Rule

Component 2 Prose uses AO1, AO2, AO3 and AO4 only. The route-combination layer must not add any additional assessment-objective scoring, labels, filters, validation rules, database fields or route logic.

## Local-Only Status

This phase is local seed only:

- Route combinations live in `src/data/aoRouteCombinations.ts`.
- Route-combination utilities live in `src/lib/aoRouteCombinations.ts`.
- The student-facing planner panel lives in `src/components/AoRouteCombinationPanel.tsx`.
- No Supabase migrations were created or applied.
- No Supabase schema, data or migration-ledger writes were run.

## Pilot Themes

The pilot route set covers:

- Childhood
- Education
- Class
- Truth and Deception
- Gender / Women
- Setting / Place
- War / Industrialism
- Guilt / Responsibility
- Memory / Authorship
- Marriage / Relationships

Each route combination links to source-locked AO1, AO2, AO3 and AO4 routes.

AO1 and AO2 are now source-locked as well. The pilot combinations have been reconciled from interim AO1 route IDs and quote/method IDs to valid AO1 and AO2 route IDs.

## Relationship To AO Engines

The AO1 Concept Route Engine is source-locked. Route combinations use AO1 route IDs from `src/data/ao1ConceptRoutes.ts`, sourced from:

https://docs.google.com/spreadsheets/d/12RrUKOYKhbUQ9YLrGj0adb4ueAWLMwuYUjDBJem25t8

The AO2 Method Route Engine is source-locked too. Route combinations use AO2 route IDs from `src/data/ao2MethodRoutes.ts`, sourced from:

https://docs.google.com/spreadsheets/d/1R1dKX779toLd_WZzlW9FZ8VGnDXbDfs62tvyua_aGPQ

The AO3 Context Route Engine remains the source-locked context layer. Route combinations use AO3 route IDs from that engine and resolve them through `getResolvedAoRouteCombination`.

The AO4 Comparative Route Engine is also source-locked. Route combinations use AO4 route IDs from `src/data/ao4ComparativeRoutes.ts`, sourced from:

https://docs.google.com/spreadsheets/d/1v3RF1UuduQfRi4ZXr_dgsRu6ujSNBYzTwZ10x8R7X1o

This keeps AO3 integrated into argument:

- AO1 gives the conceptual claim.
- AO2 shows how language, form and structure create meaning.
- AO3 explains the contextual pressure shaping that meaning.
- AO4 turns the route into a comparative judgement across *Hard Times* and *Atonement*.

## Current Resolution Model

The app can currently resolve:

- AO1 route IDs against `ao1ConceptRoutes`
- AO2 route IDs against `ao2MethodRoutes`
- AO3 route IDs against `ao3ContextRoutes`
- AO4 route IDs against `ao4ComparativeRoutes`

AO1, AO2, AO3 and AO4 are now source-locked local route datasets.

## AO1 Pilot Mapping Status

The 10 pilot combinations now resolve AO1 IDs against `ao1ConceptRoutes`:

- `aorc_childhood_formation`: `AO1-001`
- `aorc_education_fact_story`: `AO1-002`
- `aorc_class_credibility`: `AO1-004`
- `aorc_truth_storytelling`: `AO1-015`
- `aorc_gender_women_agency`: `AO1-010`
- `aorc_setting_place_systems`: `AO1-018`
- `aorc_war_industrialism_cost`: `AO1-024`
- `aorc_guilt_responsibility_repair`: `AO1-013`
- `aorc_memory_authorship_repair`: `AO1-021`
- `aorc_marriage_relationships`: `AO1-009`

## AO2 Pilot Mapping Status

The 10 pilot combinations now resolve AO2 IDs against `ao2MethodRoutes`:

- `aorc_childhood_formation`: `AO2-15`, `AO2-04`, `AO2-07`
- `aorc_education_fact_story`: `AO2-15`, `AO2-11`, `AO2-07`
- `aorc_class_credibility`: `AO2-06`, `AO2-08`, `AO2-18`
- `aorc_truth_storytelling`: `AO2-03`, `AO2-04`, `AO2-11`, `AO2-23`
- `aorc_gender_women_agency`: `AO2-09`, `AO2-06`, `AO2-17`
- `aorc_setting_place_systems`: `AO2-01`, `AO2-09`, `AO2-18`, `AO2-20`
- `aorc_war_industrialism_cost`: `AO2-02`, `AO2-14`, `AO2-19`, `AO2-22`
- `aorc_guilt_responsibility_repair`: `AO2-07`, `AO2-16`, `AO2-17`, `AO2-24`
- `aorc_memory_authorship_repair`: `AO2-11`, `AO2-23`, `AO2-24`, `AO2-13`
- `aorc_marriage_relationships`: `AO2-06`, `AO2-09`, `AO2-16`, `AO2-17`

## Future Work

Recommended next phase:

- Classroom pilot the fully source-locked route-combination flow.
- Review whether combination entries should eventually support multiple AO1 concept routes.
- Add import/dry-run tooling for a future database-backed version if needed.
- Import to Supabase only after explicit approval.
