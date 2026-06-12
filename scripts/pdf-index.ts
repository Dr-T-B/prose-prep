#!/usr/bin/env node
import { buildSearchIndex } from "./pdf-search/core.ts";
import { DEFAULT_INDEX_RELATIVE_PATH, DEFAULT_LOCAL_PDF_DIR, loadPdfIndex, savePdfIndex, scanLocalPdfFiles } from "./pdf-search/localStore.ts";
import { extractPdfPages } from "./pdf-search/pdfjsExtractor.ts";

async function main() {
  const files = scanLocalPdfFiles();
  if (files.length === 0) {
    console.error(`No PDFs found in ${DEFAULT_LOCAL_PDF_DIR}/.`);
    console.error("Add one or more .pdf files there, then run npm run pdf:index again.");
    process.exitCode = 1;
    return;
  }

  const existingIndex = loadPdfIndex();
  const result = await buildSearchIndex({
    sourceDir: DEFAULT_LOCAL_PDF_DIR,
    files,
    existingIndex,
    extractPages: extractPdfPages,
  });

  savePdfIndex(result.index);

  console.log(`Indexed ${result.index.documents.length} PDF(s), ${result.index.chunks.length} chunk(s).`);
  console.log(`Changed: ${result.indexedFiles}; reused: ${result.reusedFiles}; removed: ${result.removedFiles}.`);
  console.log(`Index written to ${DEFAULT_INDEX_RELATIVE_PATH}.`);

  if (result.failures.length > 0) {
    console.error("\nSome PDFs could not be parsed:");
    for (const failure of result.failures) {
      console.error(`- ${failure.relativePath}: ${failure.message}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
