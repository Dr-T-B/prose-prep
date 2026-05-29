import { describe, expect, it } from "vitest";

import {
  PARAGRAPH_FEEDBACK_LIMITS,
  createMissingProviderFeedback,
  validateParagraphFeedbackRequest,
  validateParagraphFeedbackResponse,
} from "./paragraphFeedbackContract";
import type { ParagraphFeedbackResponse } from "@/types/paragraphFeedback";

const validParagraph = [
  "Dickens presents Louisa's education as emotionally damaging because Gradgrind's language turns childhood into a system of control.",
  "By contrast, McEwan shows Briony's imaginative certainty shaping harm through focalised narration, so both writers connect private feeling to wider social pressures.",
].join(" ");

function validFeedback(): ParagraphFeedbackResponse {
  return {
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
}

describe("paragraph feedback request validation", () => {
  it("rejects an empty paragraph", () => {
    expect(validateParagraphFeedbackRequest({ paragraph: "" })).toEqual({
      ok: false,
      error: "Paragraph is required.",
    });
  });

  it("rejects a too-short paragraph", () => {
    const result = validateParagraphFeedbackRequest({ paragraph: "Too short." });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain(String(PARAGRAPH_FEEDBACK_LIMITS.paragraphMin));
  });

  it("rejects an overlong paragraph", () => {
    const result = validateParagraphFeedbackRequest({
      paragraph: "a".repeat(PARAGRAPH_FEEDBACK_LIMITS.paragraphMax + 1),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain(String(PARAGRAPH_FEEDBACK_LIMITS.paragraphMax));
  });

  it("rejects obvious extended-writing intent", () => {
    const result = validateParagraphFeedbackRequest({
      paragraph: validParagraph,
      questionFocus: "Please write a full essay about responsibility.",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/only give feedback/i);
  });
});

describe("paragraph feedback response validation", () => {
  it("accepts valid AO1-AO4 structured feedback", () => {
    const result = validateParagraphFeedbackResponse(validFeedback());

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.nextTarget).toContain("comparative claim");
  });

  it("rejects excluded assessment-objective labels", () => {
    const excluded = ["AO", "5"].join("");
    const feedback = validFeedback();
    feedback.ao1.target = `${excluded} should be addressed.`;

    expect(validateParagraphFeedbackResponse(feedback).ok).toBe(false);
  });

  it("rejects grade, score and mark style output", () => {
    for (const unsafeText of ["This would be a top grade.", "Score: 18.", "Mark: 16."]) {
      const feedback = validFeedback();
      feedback.nextTarget = unsafeText;

      expect(validateParagraphFeedbackResponse(feedback).ok).toBe(false);
    }
  });

  it("rejects model or rewrite style output", () => {
    for (const unsafeText of ["Here is a model paragraph.", "This is a rewritten paragraph."]) {
      const feedback = validFeedback();
      feedback.ao2.strength = unsafeText;

      expect(validateParagraphFeedbackResponse(feedback).ok).toBe(false);
    }
  });

  it("returns a safe missing-provider fallback", () => {
    const fallback = createMissingProviderFeedback();
    const result = validateParagraphFeedbackResponse(fallback);

    expect(result.ok).toBe(true);
    expect(fallback.safetyNotice).toMatch(/unavailable/i);
    expect(fallback.nextTarget).toMatch(/one paragraph/i);
  });

  it("keeps browser source free of provider imports and server key names", () => {
    const clientSources = import.meta.glob("../**/*.{ts,tsx}", {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>;
    const serverKeyPattern = new RegExp(["OPENAI", "API", "KEY"].join("_"));
    const providerPackage = ["open", "ai"].join("");
    const providerImportPattern = new RegExp(`from\\s+["']${providerPackage}["']`, "i");
    const providerCtorPattern = /new\s+OpenAI\s*\(/i;
    const providerHostPattern = /api\.openai\.com/i;

    for (const [path, source] of Object.entries(clientSources)) {
      expect(source, path).not.toMatch(serverKeyPattern);
      expect(source, path).not.toMatch(providerImportPattern);
      expect(source, path).not.toMatch(providerCtorPattern);
      expect(source, path).not.toMatch(providerHostPattern);
    }
  });
});
