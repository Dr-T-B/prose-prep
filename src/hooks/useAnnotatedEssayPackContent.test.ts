import { describe, expect, it } from "vitest";
import {
  assembleAnnotatedPack,
} from "./useAnnotatedEssayPackContent";
import { annotatedEssayPracticePack } from "@/data/annotatedEssayPracticePack";

// Helper: take the bundled seed and convert it back into Supabase-row shape
// (plain objects with verification_status overrides).
function seedAsRows(overrides: Partial<Record<string, string>> = {}) {
  const status = (key: string, fallback = "approved") =>
    overrides[key] ?? fallback;
  const stamp = (
    rows: Array<Record<string, unknown>>,
    key: string,
  ): Array<Record<string, unknown>> =>
    rows.map((r) => ({ ...r, verification_status: status(key) }));
  return {
    essay_questions: stamp(
      annotatedEssayPracticePack.essay_questions.map((q) => ({
        ...q,
        year: q.year,
      })) as Array<Record<string, unknown>>,
      "essay_questions",
    ),
    annotated_essays: stamp(
      annotatedEssayPracticePack.annotated_essays as unknown as Array<Record<string, unknown>>,
      "annotated_essays",
    ),
    essay_paragraphs: stamp(
      annotatedEssayPracticePack.essay_paragraphs as unknown as Array<Record<string, unknown>>,
      "essay_paragraphs",
    ),
    ao_annotations: stamp(
      annotatedEssayPracticePack.ao_annotations as unknown as Array<Record<string, unknown>>,
      "ao_annotations",
    ),
    paragraph_stems: stamp(
      annotatedEssayPracticePack.paragraph_stems as unknown as Array<Record<string, unknown>>,
      "paragraph_stems",
    ),
    quote_method_links: stamp(
      annotatedEssayPracticePack.quote_method_links as unknown as Array<Record<string, unknown>>,
      "quote_method_links",
    ),
    misconception_upgrades: stamp(
      annotatedEssayPracticePack.misconception_upgrades as unknown as Array<Record<string, unknown>>,
      "misconception_upgrades",
    ),
  };
}

describe("assembleAnnotatedPack", () => {
  it("returns a Supabase-sourced pack when every table has student-visible rows", () => {
    const result = assembleAnnotatedPack(seedAsRows());
    expect(result).not.toBeNull();
    expect(result!.source).toBe("supabase");
    expect(result!.pack.essay_questions.length).toBe(
      annotatedEssayPracticePack.essay_questions.length,
    );
    expect(result!.pack.annotated_essays.length).toBeGreaterThan(0);
  });

  it("filters out draft and retired rows from student-visible queries", () => {
    const rows = seedAsRows();
    const draftId = String(rows.paragraph_stems[0].id);
    const retiredId = String(rows.paragraph_stems[1].id);
    const retiredParagraphId = String(rows.essay_paragraphs[0].id);
    const draftAnnotationId = String(rows.ao_annotations[0].id);
    rows.paragraph_stems[0] = { ...rows.paragraph_stems[0], verification_status: "draft" };
    rows.paragraph_stems[1] = { ...rows.paragraph_stems[1], verification_status: "retired" };
    rows.essay_paragraphs[0] = { ...rows.essay_paragraphs[0], verification_status: "retired" };
    rows.ao_annotations[0] = { ...rows.ao_annotations[0], verification_status: "draft" };
    const pack = assembleAnnotatedPack(rows)!.pack;
    const visibleStemIds = new Set(pack.paragraph_stems.map((s) => s.id));
    const visibleParagraphIds = new Set(pack.essay_paragraphs.map((p) => p.id));
    const visibleAnnotationIds = new Set(pack.ao_annotations.map((a) => a.id));
    expect(visibleStemIds.has(draftId)).toBe(false);
    expect(visibleStemIds.has(retiredId)).toBe(false);
    expect(visibleParagraphIds.has(retiredParagraphId)).toBe(false);
    expect(visibleAnnotationIds.has(draftAnnotationId)).toBe(false);
  });

  it("maps live paragraph_stems ao and level_band columns into UI fields", () => {
    const rows = seedAsRows();
    rows.paragraph_stems[0] = {
      ...rows.paragraph_stems[0],
      ao_focus: undefined,
      difficulty_level: undefined,
      ao: ["AO1", "AO4"],
      level_band: "top_band",
    };

    const stem = assembleAnnotatedPack(rows)!.pack.paragraph_stems[0];
    expect(stem.ao_focus).toEqual(["AO1", "AO4"]);
    expect(stem.difficulty_level).toBe("top_band");
  });

  it("keeps 'needs correction' rows so the UI can warn (not hide them)", () => {
    const rows = seedAsRows();
    const flaggedId = String(rows.quote_method_links[0].id);
    rows.quote_method_links[0] = {
      ...rows.quote_method_links[0],
      verification_status: "needs correction",
    };
    const quotes = assembleAnnotatedPack(rows)!.pack.quote_method_links;
    const flagged = quotes.find((q) => q.id === flaggedId);
    expect(flagged).toBeDefined();
    expect(flagged!.verification_status).toBe("needs correction");
  });

  it("returns null when an essential table is empty so the caller can fall back to seed", () => {
    const rows = seedAsRows();
    rows.essay_questions = [];
    expect(assembleAnnotatedPack(rows)).toBeNull();
  });
});
