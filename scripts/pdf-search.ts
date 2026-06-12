#!/usr/bin/env node
import { searchIndex } from "./pdf-search/core.ts";
import { DEFAULT_INDEX_RELATIVE_PATH, DEFAULT_LOCAL_PDF_DIR, loadPdfIndex } from "./pdf-search/localStore.ts";

function parseLimit(argv: string[]): { query: string; limit: number } {
  const limitFlagIndex = argv.findIndex((arg) => arg === "--limit" || arg === "-n");
  let limit = 8;
  const queryParts = [...argv];

  if (limitFlagIndex >= 0) {
    const rawLimit = queryParts[limitFlagIndex + 1];
    const parsedLimit = Number.parseInt(rawLimit ?? "", 10);
    if (Number.isFinite(parsedLimit) && parsedLimit > 0) limit = parsedLimit;
    queryParts.splice(limitFlagIndex, 2);
  }

  return { query: queryParts.join(" ").trim(), limit };
}

function main() {
  const { query, limit } = parseLimit(process.argv.slice(2));
  if (!query) {
    console.error('Provide a search query, for example: npm run pdf:search -- "AO2 methods in Atonement"');
    process.exitCode = 1;
    return;
  }

  const index = loadPdfIndex();
  if (!index) {
    console.error(`No local PDF index found at ${DEFAULT_INDEX_RELATIVE_PATH}.`);
    console.error(`Run npm run pdf:index after adding PDFs to ${DEFAULT_LOCAL_PDF_DIR}/.`);
    process.exitCode = 1;
    return;
  }

  if (index.chunks.length === 0) {
    console.error(`The local PDF index is empty. Add text-based PDFs to ${DEFAULT_LOCAL_PDF_DIR}/ and run npm run pdf:index.`);
    process.exitCode = 1;
    return;
  }

  const results = searchIndex(index, query, limit);
  if (results.length === 0) {
    console.log(`No results found for "${query}".`);
    return;
  }

  console.log(`Found ${results.length} result(s) for "${query}":\n`);
  for (const result of results) {
    const page = result.pageNumber ? ` p. ${result.pageNumber}` : "";
    console.log(`${result.rank}. ${result.filename}${page} (score ${result.score.toFixed(2)})`);
    console.log(`   ${result.relativePath} · chunk ${result.chunkIndex}`);
    console.log(`   ${result.snippet}\n`);
  }
}

main();
