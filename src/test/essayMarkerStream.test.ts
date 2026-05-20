import { describe, expect, it } from "vitest";
import { parseSectionsDelta, type SectionState } from "../pages/EssayMarker";

const emptySections = (): SectionState => ({
  examWarning: null,
  provisionalLevel: null,
  provisionalMarks: null,
  overallSummary: null,
  AO1: null,
  AO2: null,
  AO3: null,
  AO4: null,
  topStrengths: null,
  priorityWeaknesses: null,
  quoteMethodDiagnostic: null,
  modelUpgradeParagraph: null,
  nextDrill: null,
});

describe("parseSectionsDelta", () => {
  it("parses two closed sections from an accumulated stream", () => {
    const text =
      "<section:examWarning>This is diagnostic guidance only and does not constitute an official Pearson Edexcel mark or grade.</section:examWarning>" +
      '<section:provisionalLevel>Level 4</section:provisionalLevel>';
    const delta = parseSectionsDelta(text, emptySections());
    expect(delta.examWarning).toBe(
      "This is diagnostic guidance only and does not constitute an official Pearson Edexcel mark or grade.",
    );
    expect(delta.provisionalLevel).toBe("Level 4");
  });

  it("parses provisionalMarks as an integer", () => {
    const delta = parseSectionsDelta(
      "<section:provisionalMarks>17</section:provisionalMarks>",
      emptySections(),
    );
    expect(delta.provisionalMarks).toBe(17);
  });

  it("parses AO sections as objects", () => {
    const text =
      '<section:AO1>{"level":"Level 4","strength":"s","weakness":"w","nextAction":"n"}</section:AO1>';
    const delta = parseSectionsDelta(text, emptySections());
    expect(delta.AO1).toEqual({
      level: "Level 4",
      strength: "s",
      weakness: "w",
      nextAction: "n",
    });
  });

  it("parses array sections", () => {
    const text = '<section:topStrengths>["a","b","c"]</section:topStrengths>';
    const delta = parseSectionsDelta(text, emptySections());
    expect(delta.topStrengths).toEqual(["a", "b", "c"]);
  });

  it("returns empty delta when only an opening tag has streamed", () => {
    const delta = parseSectionsDelta(
      '<section:AO1>{"level":"Level 4"',
      emptySections(),
    );
    expect(delta).toEqual({});
  });

  it("skips sections already present in prev", () => {
    const prev = { ...emptySections(), provisionalLevel: "Level 3" };
    const text =
      "<section:provisionalLevel>Level 5</section:provisionalLevel>" +
      "<section:overallSummary>fresh</section:overallSummary>";
    const delta = parseSectionsDelta(text, prev);
    expect(delta.provisionalLevel).toBeUndefined();
    expect(delta.overallSummary).toBe("fresh");
  });

  it("skips sections with malformed JSON without throwing", () => {
    const text = '<section:AO1>{"level":}</section:AO1>';
    expect(() => parseSectionsDelta(text, emptySections())).not.toThrow();
    const delta = parseSectionsDelta(text, emptySections());
    expect(delta.AO1).toBeUndefined();
  });

  it("parses nextDrill object", () => {
    const text =
      '<section:nextDrill>{"title":"t","durationMinutes":15,"instructions":"i","appRoute":"/compare"}</section:nextDrill>';
    const delta = parseSectionsDelta(text, emptySections());
    expect(delta.nextDrill).toEqual({
      title: "t",
      durationMinutes: 15,
      instructions: "i",
      appRoute: "/compare",
    });
  });
});
