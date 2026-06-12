import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createEmptyIndex, LocalPdfFile, normalizeLocalPdfPath, PdfSearchIndex } from "./core.ts";

export const DEFAULT_LOCAL_PDF_DIR = "local-pdfs";
export const DEFAULT_INDEX_RELATIVE_PATH = path.join(DEFAULT_LOCAL_PDF_DIR, ".index", "pdf-index.json");

export function resolveRepoPath(repoRoot: string, relativePath: string): string {
  return path.resolve(repoRoot, relativePath);
}

export function hashFile(absolutePath: string): string {
  return createHash("sha256").update(readFileSync(absolutePath)).digest("hex");
}

export function scanLocalPdfFiles(repoRoot = process.cwd(), pdfDir = DEFAULT_LOCAL_PDF_DIR): LocalPdfFile[] {
  const pdfRoot = resolveRepoPath(repoRoot, pdfDir);
  if (!existsSync(pdfRoot)) return [];

  const files: LocalPdfFile[] = [];

  function walk(directory: string) {
    for (const entry of readdirSync(directory)) {
      if (entry === ".index") continue;
      const absolutePath = path.join(directory, entry);
      const stat = statSync(absolutePath);
      if (stat.isDirectory()) {
        walk(absolutePath);
        continue;
      }
      if (!stat.isFile() || path.extname(entry).toLowerCase() !== ".pdf") continue;

      const relativePath = normalizeLocalPdfPath(path.relative(repoRoot, absolutePath));
      files.push({
        absolutePath,
        relativePath,
        filename: path.basename(entry),
        sizeBytes: stat.size,
        modifiedMs: Math.trunc(stat.mtimeMs),
        contentHash: hashFile(absolutePath),
      });
    }
  }

  walk(pdfRoot);
  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

export function loadPdfIndex(repoRoot = process.cwd(), indexRelativePath = DEFAULT_INDEX_RELATIVE_PATH): PdfSearchIndex | null {
  const indexPath = resolveRepoPath(repoRoot, indexRelativePath);
  if (!existsSync(indexPath)) return null;

  const parsed = JSON.parse(readFileSync(indexPath, "utf8")) as PdfSearchIndex;
  return parsed.version ? parsed : null;
}

export function savePdfIndex(
  index: PdfSearchIndex,
  repoRoot = process.cwd(),
  indexRelativePath = DEFAULT_INDEX_RELATIVE_PATH,
): void {
  const indexPath = resolveRepoPath(repoRoot, indexRelativePath);
  mkdirSync(path.dirname(indexPath), { recursive: true });
  writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
}

export function emptyIndexForLocalFolder(repoRoot = process.cwd()): PdfSearchIndex {
  return createEmptyIndex(normalizeLocalPdfPath(path.relative(repoRoot, resolveRepoPath(repoRoot, DEFAULT_LOCAL_PDF_DIR))));
}
