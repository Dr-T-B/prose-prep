# Component 2 Local Staging

This folder is for local staging of Pearson Edexcel A-Level English Literature Component 2: Prose exports only.

Raw exported content should not be committed unless explicitly reviewed and intended for this private repo. Production writes are forbidden from this staging area, and write import is out of scope for the current dry-run pass.

Component 2 Prose assesses AO1, AO2, AO3 and AO4 only. AO5-labelled Component 2 content must be rejected before import. The Atonement `AO5 Critics Bank` tab must be excluded or reframed before staging, and any reframed version must remove AO5 labels before it is used.

Run validation before any dry-run import:

```bash
npm run validate:component2-ao
npm run scan:component2-staged-content
npm run validate:component2-staged-content
npm run dry-run:component2-import
```

Expected manual export layout:

```text
staging/component2/wp1_complete_workbook/
staging/component2/hard_times_matrix/
staging/component2/atonement_matrix/
staging/component2/quote_method_source/
staging/component2/quote_pair_dataset/
staging/component2/ao3_context_guide/
staging/component2/rubric_candidate/
```

Place only approved canonical exports from `docs/component2_canonical_import_manifest.json` in these folders. Do not place excluded legacy textbooks, duplicate workbooks, Component 1 Drama resources, or unreframed AO5-labelled tabs here.
