import { describe, expect, it } from "vitest";

import type { ParagraphFeedbackResponse } from "@/types/paragraphFeedback";
import { formatParagraphFeedbackRecord } from "./paragraphFeedbackExport";

const feedback: ParagraphFeedbackResponse = {
  ao1: {
    strength: "The argument keeps a clear focus on responsibility across both texts.",
    target: "Make the topic sentence name the precise judgement about responsibility.",
  },
  ao2: {
    strength: "The paragraph notices method through language and narrative perspective.",
    target: "Zoom in on one word or narrative choice before moving to effect.",
  },
  ao3: {
    strength: "Context is linked to education and social pressure.",
    target: "Explain how the context changes the reader's understanding of the method.",
  },
  ao4: {
    strength: "The comparison connects Dickens and McEwan through shared concern and contrast.",
    target: "Use one explicit comparative hinge before the second text.",
  },
  nextTarget: "Revise the topic sentence so it makes one sharper comparative claim.",
};

function linesFor(record: string) {
  return record.split("\n");
}

describe("formatParagraphFeedbackRecord", () => {
  it("includes all provided sections in stable order", () => {
    const record = formatParagraphFeedbackRecord({
      questionFocus: "How do Dickens and McEwan present responsibility?",
      theme: "responsibility",
      routeContext: "Practice Session Summary\nSelected route: Dickens systems to McEwan perception.",
      feedback: {
        ...feedback,
        routeMatch: {
          strength: "The paragraph follows the selected route.",
          target: "Make the route link explicit in the final sentence.",
        },
        safetyNotice: "AI feedback is unavailable, so no paragraph or route context was stored or logged.",
      },
    });

    expect(linesFor(record)).toEqual([
      "Paragraph Feedback Record",
      "",
      "Question focus:",
      "How do Dickens and McEwan present responsibility?",
      "Theme:",
      "responsibility",
      "Route context:",
      "Practice Session Summary",
      "Selected route: Dickens systems to McEwan perception.",
      "",
      "AO1 - Argument focus",
      "Strength: The argument keeps a clear focus on responsibility across both texts.",
      "Target: Make the topic sentence name the precise judgement about responsibility.",
      "",
      "AO2 - Method / word / effect",
      "Strength: The paragraph notices method through language and narrative perspective.",
      "Target: Zoom in on one word or narrative choice before moving to effect.",
      "",
      "AO3 - Context relevance",
      "Strength: Context is linked to education and social pressure.",
      "Target: Explain how the context changes the reader's understanding of the method.",
      "",
      "AO4 - Comparison quality",
      "Strength: The comparison connects Dickens and McEwan through shared concern and contrast.",
      "Target: Use one explicit comparative hinge before the second text.",
      "",
      "Route match",
      "Strength: The paragraph follows the selected route.",
      "Target: Make the route link explicit in the final sentence.",
      "",
      "Next target:",
      "Revise the topic sentence so it makes one sharper comparative claim.",
      "",
      "Safety notice:",
      "AI feedback is unavailable, so no paragraph or route context was stored or logged.",
    ]);
  });

  it("omits optional empty context sections cleanly", () => {
    const record = formatParagraphFeedbackRecord({
      questionFocus: "  ",
      theme: "",
      routeContext: "\n",
      feedback,
    });

    expect(record).not.toContain("Question focus:");
    expect(record).not.toContain("Theme:");
    expect(record).not.toContain("Route context:");
    expect(record).toMatch(/^Paragraph Feedback Record\n\nAO1 - Argument focus/);
  });

  it("includes route match only when present", () => {
    expect(formatParagraphFeedbackRecord({ feedback })).not.toContain("Route match");

    const record = formatParagraphFeedbackRecord({
      feedback: {
        ...feedback,
        routeMatch: {
          strength: "The route is followed.",
          target: "Make the selected route clearer.",
        },
      },
    });

    expect(record).toContain("Route match\nStrength: The route is followed.\nTarget: Make the selected route clearer.");
  });

  it("includes safety notice only when present", () => {
    expect(formatParagraphFeedbackRecord({ feedback })).not.toContain("Safety notice:");

    const record = formatParagraphFeedbackRecord({
      feedback: {
        ...feedback,
        safetyNotice: "Feedback provider unavailable; no paragraph or route context was stored.",
      },
    });

    expect(record).toContain("Safety notice:\nFeedback provider unavailable; no paragraph or route context was stored.");
  });

  it("does not add excluded assessment-objective labels", () => {
    const excluded = ["AO", "5"].join("");

    expect(formatParagraphFeedbackRecord({ feedback })).not.toContain(excluded);
  });

  it("does not add forbidden output wording", () => {
    const record = formatParagraphFeedbackRecord({ feedback });

    for (const pattern of [
      /\bgrade\b/i,
      /\bscore\b/i,
      /\bmark\b/i,
      /model answer/i,
      /model-answer/i,
      /\brewrite\b/i,
      /rewritten paragraph/i,
      /full essay/i,
    ]) {
      expect(record).not.toMatch(pattern);
    }
  });
});
