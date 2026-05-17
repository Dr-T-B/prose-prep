# Component 2 Canonical Import README

This repo is for Pearson Edexcel A-Level English Literature Component 2: Prose, paper 9ET0/02, using *Hard Times* and *Atonement*.

## Assessment Rule

Component 2 assesses AO1, AO2, AO3, and AO4 only. AO5 is not assessed for Component 2: Prose.

Any critical debate, alternative reading, or interpretive sophistication must be framed as AO1 argument sophistication, AO2 method-led interpretation, a critical angle, an alternative reading, interpretive extension, interpretive nuance, or argument sophistication. It must not be imported, labelled, scored, or required as AO5.

## Canonical Sources

The approved source list is recorded in `docs/component2_canonical_import_manifest.json`. Import only the canonical resources and tabs named there.

High-priority sources:

- WP1 corrected complete prose workbook with master matrix.
- Component 2 prose workbook workflow guide.
- Hard Times chapter-to-exam matrix.
- Atonement chapter-to-exam matrix, with the `AO5 Critics Bank` tab excluded or renamed before import.
- HT & Atonement quote and AO2 method source.
- Quote pair matrix app dataset.
- AO3 context guide.
- Peer-assessment rubric candidate, only after AO1-AO4 compliance review.

## Excluded Sources

Do not import:

- `Component 2 Prose — Ultimate Edition (Final Unified Textbook)`.
- `Component 2 — Misc — Copy of Component 2 Prose — Ultimate Edition (Final Unified Textbook)`.
- The non-WP1 corrected master workbook except as a comparison fallback.
- The copied WP2 corrected workbook except as a comparison fallback.
- Component 1 Drama resources.

The legacy final textbook is excluded because it has a legacy draft notice and AO5-labelled Component 2 material.

## Staging Export Layout

Until Google Drive credentials are configured, export canonical Drive files manually as CSV or JSON into local staging folders before import:

```text
staging/component2/
  wp1_complete_workbook/
    AO2_Prose_Grid.csv
    Quote_Bank.csv
    Quotes_by_Theme.csv
    Master_Comparative_Matrix.csv
    Essay_Paragraph_Planner.csv
    Model_Paragraph_Frames.csv
    Essay_Openings_Thesis_Bank.csv
    AO3_Context_Triggers.csv
    WP1_Correction_Log.csv
  hard_times_matrix/
  atonement_matrix/
  quote_method_source/
  quote_pair_dataset/
  ao3_context_guide/
  rubric_candidate/
```

Keep raw exports out of production. Treat this folder as local import staging.

## Validation

Run the AO gate before any import or dry-run import:

```bash
npm run validate:component2-ao
npm run scan:component2-staged-content
npm run validate:component2-staged-content
npm run dry-run:component2-import
```

The validator reads `docs/component2_canonical_import_manifest.json`, scans import-relevant files and staging folders, and fails on AO5 contamination in Component 2 assessed content. It allows AO5 only in explicitly excluded/archive/report contexts or where the text clearly states AO5 is not assessed for Component 2.

The staged-content scan checks local files under `staging/component2/` before import. The shape validator confirms expected folders, parseable CSVs, non-empty headers, and recognisable quote/method/comparison headers where files are present. It must reject AO5-named Component 2 columns and must reject any unreframed Atonement `AO5 Critics Bank`.

Implementation status as of the staging interpretive-schema apply pass: live Component 2 app/import paths use interpretive naming, staging project `nxlxunygoccbnzdopqna` has the replacement interpretive schema, Supabase types have been regenerated from staging, and the AO gate passes with zero active blockers.

Component 2 import is now schema-ready on staging, but content exports still need an AO sweep before any write import. No Drive data has been imported yet.

## Dry-Run Import

For the existing quote import path:

```bash
npm run import-quotes
```

For any new canonical import script, run validation first, then dry-run import, then review the generated report before using any write mode.

For the Component 2 canonical content pass:

```bash
npm run dry-run:component2-import
```

This writes `docs/COMPONENT_2_CONTENT_EXPORT_AO_SWEEP_DRY_RUN_REPORT.md` and does not write to Supabase.

## Manual Import Guardrails

- Do not connect to production Supabase for this pass.
- Do not run destructive Supabase commands.
- Do not modify secrets.
- Do not import the legacy textbook or duplicate legacy copy.
- Do not treat `AO5 Critics Bank` as an assessed AO5 tab; exclude it or reframe it as critical interpretations before staging.
- Do not import Component 2 headers that use AO5-named schema fields; use interpretive extension, interpretive stem, interpretive tension, interpretive judgement, or AO1 sophistication naming instead.
