import { describe, expect, it } from "vitest";
import {
  buildSearchIndex,
  chunkPageText,
  createEmptyIndex,
  LocalPdfFile,
  normalizeLocalPdfPath,
  searchIndex,
} from "../../scripts/pdf-search/core.ts";

const baseFile: LocalPdfFile = {
  absolutePath: "synthetic-fixtures/atone.pdf",
  relativePath: "local-pdfs/atone.pdf",
  filename: "atone.pdf",
  sizeBytes: 100,
  modifiedMs: 123,
  contentHash: "abc123abc123abc123abc123abc123abc123",
};

describe("local PDF search core", () => {
  it("normalises PDF metadata paths without absolute or parent segments", () => {
    expect(normalizeLocalPdfPath("//local-pdfs/../mark-schemes/sample.pdf")).toBe("local-pdfs/mark-schemes/sample.pdf");
    expect(normalizeLocalPdfPath("local-pdfs\\AQA\\sample.pdf")).toBe("local-pdfs/AQA/sample.pdf");
  });

  it("chunks page text with overlap and preserves page numbers", () => {
    const words = Array.from({ length: 95 }, (_, index) => `word${index + 1}`).join(" ");
    const chunks = chunkPageText({ pageNumber: 7, text: words }, { targetWords: 40, overlapWords: 10 });

    expect(chunks).toHaveLength(3);
    expect(chunks[0].pageNumber).toBe(7);
    expect(chunks[0].text).toContain("word1");
    expect(chunks[1].text).toContain("word31");
    expect(chunks[2].text).toContain("word61");
  });

  it("builds an empty index for empty local folders", async () => {
    const result = await buildSearchIndex({
      files: [],
      existingIndex: createEmptyIndex(),
      extractPages: async () => [],
      now: new Date("2026-06-12T12:00:00.000Z"),
    });

    expect(result.index.documents).toEqual([]);
    expect(result.index.chunks).toEqual([]);
    expect(result.index.generatedAt).toBe("2026-06-12T12:00:00.000Z");
  });

  it("records malformed or unreadable PDF failures without storing chunks", async () => {
    const result = await buildSearchIndex({
      files: [baseFile],
      extractPages: async () => {
        throw new Error("PDF parse failed");
      },
    });

    expect(result.index.documents).toEqual([]);
    expect(result.index.chunks).toEqual([]);
    expect(result.failures).toEqual([
      {
        filename: "atone.pdf",
        relativePath: "local-pdfs/atone.pdf",
        message: "PDF parse failed",
      },
    ]);
  });

  it("ranks keyword matches with source-grounded metadata", async () => {
    const result = await buildSearchIndex({
      files: [baseFile],
      extractPages: async () => [
        {
          pageNumber: 12,
          text: "McEwan uses free indirect discourse and Briony's focalisation to expose unreliable judgement.",
        },
        {
          pageNumber: 13,
          text: "This page discusses context and publication history with little attention to method.",
        },
      ],
    });

    const results = searchIndex(result.index, "Briony focalisation method", 3);

    expect(results[0]).toMatchObject({
      rank: 1,
      filename: "atone.pdf",
      relativePath: "local-pdfs/atone.pdf",
      pageNumber: 12,
    });
    expect(results[0].snippet).toContain("Briony's focalisation");
  });

  it("reuses unchanged indexed PDFs and removes deleted PDFs from the next index", async () => {
    const original = await buildSearchIndex({
      files: [baseFile],
      extractPages: async () => [{ pageNumber: 1, text: "AO2 narrative structure and method." }],
    });

    const next = await buildSearchIndex({
      files: [baseFile],
      existingIndex: original.index,
      extractPages: async () => {
        throw new Error("should not reparse unchanged file");
      },
    });

    expect(next.reusedFiles).toBe(1);
    expect(next.index.chunks).toHaveLength(1);

    const removed = await buildSearchIndex({
      files: [],
      existingIndex: original.index,
      extractPages: async () => [],
    });

    expect(removed.removedFiles).toBe(1);
    expect(removed.index.documents).toEqual([]);
  });
});
