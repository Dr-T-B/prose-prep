# Local PDF Search Folder

Put teacher-owned, student-safe, or otherwise authorised PDFs in this folder when you want to index them locally.

The PDFs themselves and the generated index under `.index/` are ignored by git. Do not commit copyrighted exam-board PDFs, private student work, mark schemes, worksheets, or extracted text unless you have a clear right to do so.

Typical workflow:

```bash
npm run pdf:index
npm run pdf:search -- "AO2 methods in Atonement"
```

Known limitation: scanned/image-only PDFs need OCR first. This local search tool extracts embedded text only.
