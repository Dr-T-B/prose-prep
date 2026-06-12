import { readFileSync } from "node:fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { ExtractPdfPages, LocalPdfFile, PdfPageText, normalizeExtractedText } from "./core.ts";

type PdfTextItem = {
  str?: string;
  hasEOL?: boolean;
};

export const extractPdfPages: ExtractPdfPages = async (file: LocalPdfFile): Promise<PdfPageText[]> => {
  const data = new Uint8Array(readFileSync(file.absolutePath));
  const document = await getDocument({
    data,
    disableFontFace: true,
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  const pages: PdfPageText[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => {
        const textItem = item as PdfTextItem;
        return `${textItem.str ?? ""}${textItem.hasEOL ? "\n" : " "}`;
      })
      .join("");
    pages.push({ pageNumber, text: normalizeExtractedText(text) });
  }

  return pages;
};
