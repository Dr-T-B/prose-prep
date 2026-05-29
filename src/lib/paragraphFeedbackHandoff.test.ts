import { describe, expect, it } from "vitest";

import {
  PARAGRAPH_FEEDBACK_PATH,
  buildParagraphFeedbackHandoffUrl,
  readParagraphFeedbackHandoff,
} from "./paragraphFeedbackHandoff";

describe("paragraph feedback handoff helpers", () => {
  it("builds a feedback coach URL with safe planning context only", () => {
    const href = buildParagraphFeedbackHandoffUrl({
      questionFocus: "relationships damaged by misunderstanding",
      theme: "relationships",
      routeContext: "Practice Session Summary\nSelected route: thesis to comparison.",
    });
    const url = new URL(href, "http://localhost");

    expect(url.pathname).toBe(PARAGRAPH_FEEDBACK_PATH);
    expect(url.searchParams.get("questionFocus")).toBe("relationships damaged by misunderstanding");
    expect(url.searchParams.get("theme")).toBe("relationships");
    expect(url.searchParams.get("routeContext")).toBe("Practice Session Summary\nSelected route: thesis to comparison.");
    expect(url.searchParams.has("paragraph")).toBe(false);
  });

  it("reads only the safe handoff params from a URL search string", () => {
    const params = new URLSearchParams({
      questionFocus: "memory and guilt",
      theme: "memory",
      routeContext: "Route notes only.",
      paragraph: "Student paragraph should not be read.",
      score: "12",
      grade: "A",
      [["ao", "5"].join("")]: "ignored",
    });

    expect(readParagraphFeedbackHandoff(`?${params.toString()}`)).toEqual({
      questionFocus: "memory and guilt",
      theme: "memory",
      routeContext: "Route notes only.",
    });
  });

  it("returns the bare feedback coach path when no safe context is present", () => {
    expect(buildParagraphFeedbackHandoffUrl({})).toBe(PARAGRAPH_FEEDBACK_PATH);
    expect(readParagraphFeedbackHandoff("?paragraph=ignored")).toEqual({});
  });
});
