import { describe, expect, it } from "vitest";

import {
  CURATED_ESSAY_THEMES,
  generateEssayQuestionsFromTheme,
  getQuestionStyleWarning,
  isSafeEssayQuestionTheme,
} from "./essayQuestionGeneration";

const excludedAo = ["AO", "5"].join("");

function expectSafeQuestionText(question: string) {
  expect(question).toMatch(/Compare/i);
  expect(question).toMatch(/contextual factors/i);
  expect(question).toMatch(/Hard Times|Atonement|two chosen texts|Dickens|McEwan/i);
  expect(question).not.toMatch(new RegExp(`\\b${excludedAo}\\b`, "i"));
  expect(question).not.toMatch(/\b(mark|marks|score|scores|grade|grades|level|levels|band|bands)\b/i);
  expect(question).not.toMatch(/model answer|rewrite|rewritten paragraph|full essay/i);
}

describe("essay question generation", () => {
  it("exports the curated Component 2 themes", () => {
    expect(CURATED_ESSAY_THEMES).toEqual(expect.arrayContaining([
      "childhood",
      "education",
      "memory",
      "social criticism",
    ]));
  });

  it("returns local Component 2 style questions for a curated theme", () => {
    const result = generateEssayQuestionsFromTheme("memory");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.theme).toBe("Memory");
    expect(result.questions).toHaveLength(5);
    result.questions.forEach(expectSafeQuestionText);
  });

  it("returns 3-5 questions when a count is requested", () => {
    const result = generateEssayQuestionsFromTheme("guilt", 3);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.questions).toHaveLength(3);
    result.questions.forEach(expectSafeQuestionText);
  });

  it("rejects blank or unsafe theme input", () => {
    expect(generateEssayQuestionsFromTheme(" ").ok).toBe(false);
    expect(isSafeEssayQuestionTheme(`memory ${excludedAo}`)).toBe(false);
    expect(isSafeEssayQuestionTheme("model answer about guilt")).toBe(false);
  });

  it("warns when a custom question is not comparative/contextual enough", () => {
    expect(getQuestionStyleWarning("How is childhood presented?")).toBe(
      "For Edexcel Component 2, stronger practice questions usually ask you to compare both texts and relate ideas to context.",
    );
  });

  it("does not warn for Component 2 comparative wording", () => {
    expect(getQuestionStyleWarning(
      "Compare how Dickens and McEwan present childhood in Hard Times and Atonement. You must relate your discussion to relevant contextual factors.",
    )).toBeNull();
  });
});
