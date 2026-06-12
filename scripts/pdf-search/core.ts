export const PDF_INDEX_VERSION = 1 as const;

export type LocalPdfFile = {
  absolutePath: string;
  relativePath: string;
  filename: string;
  sizeBytes: number;
  modifiedMs: number;
  contentHash: string;
};

export type PdfPageText = {
  pageNumber: number;
  text: string;
};

export type PdfIndexDocument = {
  filename: string;
  relativePath: string;
  sizeBytes: number;
  modifiedMs: number;
  contentHash: string;
  chunkCount: number;
};

export type PdfIndexChunk = {
  id: string;
  filename: string;
  relativePath: string;
  pageNumber: number | null;
  chunkIndex: number;
  text: string;
};

export type PdfSearchIndex = {
  version: typeof PDF_INDEX_VERSION;
  generatedAt: string;
  sourceDir: string;
  documents: PdfIndexDocument[];
  chunks: PdfIndexChunk[];
};

export type PdfIndexFailure = {
  filename: string;
  relativePath: string;
  message: string;
};

export type BuildIndexResult = {
  index: PdfSearchIndex;
  indexedFiles: number;
  reusedFiles: number;
  removedFiles: number;
  failures: PdfIndexFailure[];
};

export type SearchResult = {
  rank: number;
  score: number;
  filename: string;
  relativePath: string;
  pageNumber: number | null;
  chunkIndex: number;
  snippet: string;
};

export type ExtractPdfPages = (file: LocalPdfFile) => Promise<PdfPageText[]>;

const DEFAULT_CHUNK_WORDS = 170;
const DEFAULT_OVERLAP_WORDS = 35;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "this",
  "to",
  "was",
  "were",
  "with",
]);

export function createEmptyIndex(sourceDir = "local-pdfs", now = new Date()): PdfSearchIndex {
  return {
    version: PDF_INDEX_VERSION,
    generatedAt: now.toISOString(),
    sourceDir,
    documents: [],
    chunks: [],
  };
}

export function normalizeExtractedText(text: string): string {
  return text
    .replace(/\u0000/g, " ")
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .trim();
}

export function normalizeLocalPdfPath(pathname: string): string {
  return pathname
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .join("/");
}

export function chunkPageText(
  pageText: PdfPageText,
  options: { targetWords?: number; overlapWords?: number } = {},
): Omit<PdfIndexChunk, "id" | "filename" | "relativePath" | "chunkIndex">[] {
  const text = normalizeExtractedText(pageText.text);
  if (!text) return [];

  const words = text.split(/\s+/).filter(Boolean);
  const targetWords = Math.max(40, options.targetWords ?? DEFAULT_CHUNK_WORDS);
  const overlapWords = Math.max(0, Math.min(options.overlapWords ?? DEFAULT_OVERLAP_WORDS, targetWords - 1));

  if (words.length <= targetWords) {
    return [{ pageNumber: pageText.pageNumber, text }];
  }

  const chunks: Omit<PdfIndexChunk, "id" | "filename" | "relativePath" | "chunkIndex">[] = [];
  const step = targetWords - overlapWords;
  for (let start = 0; start < words.length; start += step) {
    const chunkWords = words.slice(start, start + targetWords);
    if (chunkWords.length < Math.min(35, targetWords) && chunks.length > 0) break;
    chunks.push({
      pageNumber: pageText.pageNumber,
      text: chunkWords.join(" "),
    });
  }

  return chunks;
}

export function chunksForDocument(file: LocalPdfFile, pages: PdfPageText[]): PdfIndexChunk[] {
  const chunks: PdfIndexChunk[] = [];
  for (const page of pages) {
    for (const chunk of chunkPageText(page)) {
      const chunkIndex = chunks.length;
      chunks.push({
        id: `${file.contentHash.slice(0, 16)}:${chunkIndex}`,
        filename: file.filename,
        relativePath: normalizeLocalPdfPath(file.relativePath),
        pageNumber: Number.isFinite(page.pageNumber) ? page.pageNumber : null,
        chunkIndex,
        text: chunk.text,
      });
    }
  }
  return chunks;
}

export function fileMatchesDocument(file: LocalPdfFile, document: PdfIndexDocument | undefined): boolean {
  return Boolean(
    document &&
      document.relativePath === normalizeLocalPdfPath(file.relativePath) &&
      document.sizeBytes === file.sizeBytes &&
      document.modifiedMs === file.modifiedMs &&
      document.contentHash === file.contentHash,
  );
}

export async function buildSearchIndex(params: {
  sourceDir?: string;
  files: LocalPdfFile[];
  existingIndex?: PdfSearchIndex | null;
  extractPages: ExtractPdfPages;
  now?: Date;
}): Promise<BuildIndexResult> {
  const sourceDir = params.sourceDir ?? "local-pdfs";
  const now = params.now ?? new Date();
  const existingIndex = params.existingIndex?.version === PDF_INDEX_VERSION ? params.existingIndex : null;
  const existingDocuments = new Map(existingIndex?.documents.map((document) => [document.relativePath, document]) ?? []);
  const existingChunksByPath = new Map<string, PdfIndexChunk[]>();

  for (const chunk of existingIndex?.chunks ?? []) {
    const chunks = existingChunksByPath.get(chunk.relativePath) ?? [];
    chunks.push(chunk);
    existingChunksByPath.set(chunk.relativePath, chunks);
  }

  const documents: PdfIndexDocument[] = [];
  const chunks: PdfIndexChunk[] = [];
  const failures: PdfIndexFailure[] = [];
  let indexedFiles = 0;
  let reusedFiles = 0;

  for (const file of params.files) {
    const relativePath = normalizeLocalPdfPath(file.relativePath);
    const existingDocument = existingDocuments.get(relativePath);

    if (fileMatchesDocument(file, existingDocument)) {
      const reusedChunks = existingChunksByPath.get(relativePath) ?? [];
      documents.push(existingDocument);
      chunks.push(...reusedChunks);
      reusedFiles += 1;
      continue;
    }

    try {
      const pages = await params.extractPages({ ...file, relativePath });
      const documentChunks = chunksForDocument({ ...file, relativePath }, pages);
      documents.push({
        filename: file.filename,
        relativePath,
        sizeBytes: file.sizeBytes,
        modifiedMs: file.modifiedMs,
        contentHash: file.contentHash,
        chunkCount: documentChunks.length,
      });
      chunks.push(...documentChunks);
      indexedFiles += 1;
    } catch (error) {
      failures.push({
        filename: file.filename,
        relativePath,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const currentPaths = new Set(params.files.map((file) => normalizeLocalPdfPath(file.relativePath)));
  const removedFiles = [...existingDocuments.keys()].filter((relativePath) => !currentPaths.has(relativePath)).length;

  documents.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  chunks.sort((a, b) => a.relativePath.localeCompare(b.relativePath) || a.chunkIndex - b.chunkIndex);

  return {
    index: {
      version: PDF_INDEX_VERSION,
      generatedAt: now.toISOString(),
      sourceDir,
      documents,
      chunks,
    },
    indexedFiles,
    reusedFiles,
    removedFiles,
    failures,
  };
}

export function tokenizeForSearch(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

export function makeSnippet(text: string, queryTokens: string[], maxLength = 260): string {
  const clean = normalizeExtractedText(text).replace(/\n/g, " ");
  if (clean.length <= maxLength) return clean;

  const lower = clean.toLowerCase();
  const firstHit = queryTokens
    .map((token) => lower.indexOf(token.toLowerCase()))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  const center = firstHit >= 0 ? firstHit : 0;
  const start = Math.max(0, center - Math.floor(maxLength / 3));
  const end = Math.min(clean.length, start + maxLength);
  const snippet = clean.slice(start, end).trim();
  return `${start > 0 ? "... " : ""}${snippet}${end < clean.length ? " ..." : ""}`;
}

export function searchIndex(index: PdfSearchIndex, query: string, limit = 10): SearchResult[] {
  const queryTokens = tokenizeForSearch(query);
  if (queryTokens.length === 0) return [];

  const documentFrequency = new Map<string, number>();
  const chunkTokens = index.chunks.map((chunk) => {
    const tokens = tokenizeForSearch(`${chunk.filename} ${chunk.text}`);
    const unique = new Set(tokens);
    for (const token of unique) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    }
    return tokens;
  });

  const chunkCount = Math.max(index.chunks.length, 1);
  const normalizedQuery = normalizeExtractedText(query).toLowerCase();
  const scored = index.chunks
    .map((chunk, chunkPosition) => {
      const tokens = chunkTokens[chunkPosition];
      const tokenCounts = new Map<string, number>();
      for (const token of tokens) tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + 1);

      let score = 0;
      for (const token of queryTokens) {
        const termFrequency = tokenCounts.get(token) ?? 0;
        if (termFrequency === 0) continue;
        const df = documentFrequency.get(token) ?? 0;
        const idf = Math.log(1 + (chunkCount - df + 0.5) / (df + 0.5));
        score += (1 + Math.log(termFrequency)) * idf;
      }

      const haystack = `${chunk.filename} ${chunk.relativePath} ${chunk.text}`.toLowerCase();
      if (normalizedQuery.length > 3 && haystack.includes(normalizedQuery)) score += 2.5;
      if (queryTokens.every((token) => haystack.includes(token))) score += 1.25;
      if (chunk.filename.toLowerCase().includes(queryTokens[0])) score += 0.5;

      return { chunk, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.chunk.relativePath.localeCompare(b.chunk.relativePath));

  return scored.slice(0, limit).map(({ chunk, score }, indexPosition) => ({
    rank: indexPosition + 1,
    score,
    filename: chunk.filename,
    relativePath: chunk.relativePath,
    pageNumber: chunk.pageNumber,
    chunkIndex: chunk.chunkIndex,
    snippet: makeSnippet(chunk.text, queryTokens),
  }));
}
