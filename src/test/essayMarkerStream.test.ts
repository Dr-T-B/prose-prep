import { describe, expect, it } from "vitest";
import { parseSectionsDelta, type SectionState } from "../pages/EssayMarker";

const emptySections = (): SectionState => ({
  examWarning: null,
  summary: null,
  AO1: null,
  AO2: null,
  AO3: null,
  AO4: null,
  strengths: null,
  priorityTargets: null,
  quoteMethodDiagnostic: null,
  revisionPrompts: null,
  nextStep: null,
  teacherNotes: null,
});

describe("parseSectionsDelta", () => {
  it("parses two closed sections from an accumulated stream", () => {
    const text =
      "<section:examWarning>Formative guidance only: use this as practice feedback, not an official assessment judgement.</section:examWarning>" +
      "<section:summary>Useful comparative direction.</section:summary>";
    const delta = parseSectionsDelta(text, emptySections());
    expect(delta.examWarning).toBe(
      "Formative guidance only: use this as practice feedback, not an official assessment judgement.",
    );
    expect(delta.summary).toBe("Useful comparative direction.");
  });

  it("parses AO sections as objects", () => {
    const text =
      '<section:AO1>{"diagnosticLabel":"argument clarity","strength":"s","nextStep":"n"}</section:AO1>';
    const delta = parseSectionsDelta(text, emptySections());
    expect(delta.AO1).toEqual({
      diagnosticLabel: "argument clarity",
      strength: "s",
      nextStep: "n",
    });
  });

  it("parses array sections", () => {
    const text = '<section:strengths>["a","b","c"]</section:strengths>';
    const delta = parseSectionsDelta(text, emptySections());
    expect(delta.strengths).toEqual(["a", "b", "c"]);
  });

  it("returns empty delta when only an opening tag has streamed", () => {
    const delta = parseSectionsDelta(
      '<section:AO1>{"diagnosticLabel":"argument clarity"',
      emptySections(),
    );
    expect(delta).toEqual({});
  });

  it("skips sections already present in prev", () => {
    const prev = { ...emptySections(), summary: "old" };
    const text =
      "<section:summary>fresh</section:summary>" +
      "<section:nextStep>Revise one comparative topic sentence.</section:nextStep>";
    const delta = parseSectionsDelta(text, prev);
    expect(delta.summary).toBeUndefined();
    expect(delta.nextStep).toBe("Revise one comparative topic sentence.");
  });

  it("skips sections with malformed JSON without throwing", () => {
    const text = '<section:AO1>{"diagnosticLabel":}</section:AO1>';
    expect(() => parseSectionsDelta(text, emptySections())).not.toThrow();
    const delta = parseSectionsDelta(text, emptySections());
    expect(delta.AO1).toBeUndefined();
  });

  it("ignores unsafe streamed sections instead of rendering them", () => {
    const text = [
      "<section:summary>This would be a grade A response.</section:summary>",
      '<section:AO1>{"level":"Level 4","strength":"s","nextStep":"n"}</section:AO1>',
      "<section:modelUpgradeParagraph>A rewritten paragraph.</section:modelUpgradeParagraph>",
    ].join("");
    const delta = parseSectionsDelta(text, emptySections());
    expect(delta.summary).toBeUndefined();
    expect(delta.AO1).toBeUndefined();
    expect(delta).not.toHaveProperty("modelUpgradeParagraph");
  });

  it("parses revision prompts and next step", () => {
    const text = [
      '<section:revisionPrompts>["p1","p2","p3"]</section:revisionPrompts>',
      "<section:nextStep>Revise the comparison.</section:nextStep>",
    ].join("");
    const delta = parseSectionsDelta(text, emptySections());
    expect(delta.revisionPrompts).toEqual(["p1", "p2", "p3"]);
    expect(delta.nextStep).toBe("Revise the comparison.");
  });
});
