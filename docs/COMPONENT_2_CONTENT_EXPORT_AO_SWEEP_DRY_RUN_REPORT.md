# Component 2 Content Export AO Sweep Dry-Run Report

## 1. Executive summary

This pass created the local Component 2 staging layout, AO sweep tooling, content-shape validation, and a dry-run import report generator. No write import was performed.

Actual canonical exports are not yet present in `staging/component2/`, so content is not ready for write import. The current dry run validates the scaffolding and reports every expected manual export as pending.

## 2. Branch name

`fix/component-2-content-export-ao-sweep-and-import-dry-run`

## 3. Staging project ref

`nxlxunygoccbnzdopqna`

## 4. Drive access/export status

Drive metadata access was checked separately for canonical files, but raw Drive content was not committed. Manual export placeholders and an ignored local staging layout were created instead.

## 5. Files expected

- wp1_complete_workbook/AO2_Prose_Grid.csv
- wp1_complete_workbook/Quote_Bank.csv
- wp1_complete_workbook/Quotes_by_Theme.csv
- wp1_complete_workbook/Master_Comparative_Matrix.csv
- wp1_complete_workbook/Essay_Paragraph_Planner.csv
- wp1_complete_workbook/Model_Paragraph_Frames.csv
- wp1_complete_workbook/Essay_Openings_Thesis_Bank.csv
- wp1_complete_workbook/AO3_Context_Triggers.csv
- wp1_complete_workbook/WP1_Correction_Log.csv
- hard_times_matrix/Hard_Times_Matrix.csv
- hard_times_matrix/WP4_Paragraph_Engine.csv
- hard_times_matrix/WP5_Essay_Generator.csv
- hard_times_matrix/Final_Layer_Exam_Simulation_Marking.csv
- hard_times_matrix/Adaptive_Intelligence_Layer.csv
- atonement_matrix/Atonement_Matrix.csv
- atonement_matrix/AO3_Context_Bank.csv
- atonement_matrix/at_past_papers_reference.csv
- quote_method_source/AO2_Prose_Grid.csv
- quote_method_source/Quote_Bank.csv
- quote_pair_dataset/Quote_Pair_Matrix.csv
- ao3_context_guide/AO3_Context_Library.md
- rubric_candidate/Peer_Assessment_Rubric.md

## 6. Files found

_None._

## 7. Files missing

- wp1_complete_workbook/AO2_Prose_Grid.csv (WP1 corrected workbook: AO2_Prose_Grid)
- wp1_complete_workbook/Quote_Bank.csv (WP1 corrected workbook: Quote_Bank)
- wp1_complete_workbook/Quotes_by_Theme.csv (WP1 corrected workbook: Quotes_by_Theme)
- wp1_complete_workbook/Master_Comparative_Matrix.csv (WP1 corrected workbook: Master_Comparative_Matrix)
- wp1_complete_workbook/Essay_Paragraph_Planner.csv (WP1 corrected workbook: Essay_Paragraph_Planner)
- wp1_complete_workbook/Model_Paragraph_Frames.csv (WP1 corrected workbook: Model_Paragraph_Frames)
- wp1_complete_workbook/Essay_Openings_Thesis_Bank.csv (WP1 corrected workbook: Essay_Openings_Thesis_Bank)
- wp1_complete_workbook/AO3_Context_Triggers.csv (WP1 corrected workbook: AO3_Context_Triggers)
- wp1_complete_workbook/WP1_Correction_Log.csv (WP1 corrected workbook: WP1_Correction_Log)
- hard_times_matrix/Hard_Times_Matrix.csv (Hard Times chapter-to-exam matrix: Hard Times Matrix)
- hard_times_matrix/WP4_Paragraph_Engine.csv (Hard Times chapter-to-exam matrix: WP4 Paragraph Engine)
- hard_times_matrix/WP5_Essay_Generator.csv (Hard Times chapter-to-exam matrix: WP5 Essay Generator)
- hard_times_matrix/Final_Layer_Exam_Simulation_Marking.csv (Hard Times chapter-to-exam matrix: Final Layer - Exam Simulation + Marking)
- hard_times_matrix/Adaptive_Intelligence_Layer.csv (Hard Times chapter-to-exam matrix: Adaptive Intelligence Layer)
- atonement_matrix/Atonement_Matrix.csv (Atonement chapter-to-exam matrix: Atonement Matrix)
- atonement_matrix/AO3_Context_Bank.csv (Atonement chapter-to-exam matrix: AO3 Context Bank)
- atonement_matrix/at_past_papers_reference.csv (Atonement chapter-to-exam matrix: at_past_papers_reference)
- quote_method_source/AO2_Prose_Grid.csv (HT & Atonement quote/method source: AO2_Prose_Grid)
- quote_method_source/Quote_Bank.csv (HT & Atonement quote/method source: Quote_Bank)
- quote_pair_dataset/Quote_Pair_Matrix.csv (Quote Pair Matrix app dataset: primary sheet)
- ao3_context_guide/AO3_Context_Library.md (AO3 Context Library student guide: document export)
- rubric_candidate/Peer_Assessment_Rubric.md (Peer-assessment rubric candidate: document export)

## 8. AO sweep results

- Scanned files: 6
- Allowed guardrail references: 2
- Interpretive reframing candidates: 0
- Excluded files staged: 0
- Hard blockers: 0
- Result: passed

## 9. Content-shape validation results

- Present expected files: 0
- Missing/manual-export files: 22
- Parsed CSV files: 0
- Unexpected files: 6
- Warnings: 6
- Errors: 0
- Result: passed

## 10. Dry-run import mapping

- wp1_complete_workbook/AO2_Prose_Grid.csv: missing; target tables: quote_methods, library_quotes
- wp1_complete_workbook/Quote_Bank.csv: missing; target tables: quote_methods, library_quotes
- wp1_complete_workbook/Quotes_by_Theme.csv: missing; target tables: quote_methods, library_quotes
- wp1_complete_workbook/Master_Comparative_Matrix.csv: missing; target tables: comparative_matrix, library_comparative_pairings
- wp1_complete_workbook/Essay_Paragraph_Planner.csv: missing; target tables: routes, questions, paragraph_jobs
- wp1_complete_workbook/Model_Paragraph_Frames.csv: missing; target tables: library_paragraph_frames
- wp1_complete_workbook/Essay_Openings_Thesis_Bank.csv: missing; target tables: theses, library_thesis_bank
- wp1_complete_workbook/AO3_Context_Triggers.csv: missing; target tables: library_context_bank
- wp1_complete_workbook/WP1_Correction_Log.csv: missing; target tables: review only
- hard_times_matrix/Hard_Times_Matrix.csv: missing; target tables: library_questions, library_context_bank, comparative_matrix
- hard_times_matrix/WP4_Paragraph_Engine.csv: missing; target tables: library_paragraph_frames
- hard_times_matrix/WP5_Essay_Generator.csv: missing; target tables: library_thesis_bank, questions
- hard_times_matrix/Final_Layer_Exam_Simulation_Marking.csv: missing; target tables: library_questions
- hard_times_matrix/Adaptive_Intelligence_Layer.csv: missing; target tables: routes, paragraph_jobs
- atonement_matrix/Atonement_Matrix.csv: missing; target tables: library_questions, library_context_bank, comparative_matrix
- atonement_matrix/AO3_Context_Bank.csv: missing; target tables: library_context_bank
- atonement_matrix/at_past_papers_reference.csv: missing; target tables: library_questions, questions
- quote_method_source/AO2_Prose_Grid.csv: missing; target tables: quote_methods, library_quotes
- quote_method_source/Quote_Bank.csv: missing; target tables: quote_methods, library_quotes
- quote_pair_dataset/Quote_Pair_Matrix.csv: missing; target tables: quote_pairs, library_comparative_pairings
- ao3_context_guide/AO3_Context_Library.md: missing; target tables: library_context_bank
- rubric_candidate/Peer_Assessment_Rubric.md: missing; target tables: library_questions

## 11. Intended target tables

- comparative_matrix
- library_comparative_pairings
- library_context_bank
- library_paragraph_frames
- library_questions
- library_quotes
- library_thesis_bank
- paragraph_jobs
- questions
- quote_methods
- quote_pairs
- routes
- theses

## 12. Blocked files

_None._

## 13. Files safe for later import

_None._

## 14. Whether Supabase was written to

No. This script does not create a Supabase client and does not perform database writes.

## 15. Verification results

Initial required gates before scaffolding:

- `npm run validate:component2-ao`: passed
- `npm run typecheck`: passed

Dry-run script result:

- `npm run dry-run:component2-import`: passed and wrote this report

Full final verification is recorded after this report is regenerated.

## 16. Remaining blockers

- Canonical Drive exports are not yet present locally.
- Manual content export and AO sweep remain pending.
- Missing files must be exported from the approved manifest sources only.
- Atonement `AO5 Critics Bank` must remain excluded unless fully reframed without AO5 labels.
- Local and remote Supabase migration history have unrelated drift from the prior pass.

## 17. Exact next branch/task recommendation

`fix/component-2-manual-export-stage-and-clean-dry-run`

Export the approved canonical files into `staging/component2/`, rerun the AO scan and shape validator, then rerun the dry-run import report. Do not run a write import until every required export is present, AO-clean, shape-valid, and dry-run mapped cleanly.

## Manifest source count

- Canonical sources: 8
- Excluded sources: 5
