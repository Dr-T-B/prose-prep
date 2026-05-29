import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMissingProviderFeedback } from "@/lib/paragraphFeedbackContract";
import type { ParagraphFeedbackResponse } from "@/types/paragraphFeedback";
import ParagraphFeedback from "./ParagraphFeedback";

const validParagraph = [
  "Dickens presents utilitarian education as emotionally damaging through Gradgrind's hard language of facts and measurement.",
  "By contrast, McEwan uses Briony's focalised certainty to show how private imagination can distort responsibility, so both writers connect individual judgement to wider social pressure.",
].join(" ");

const routeContext = "Practice Session Summary\nSelected route: Dickens external systems; McEwan private perception.";
const safetyNotice = "AI feedback is unavailable, so no paragraph or route context was stored or logged.";

const successfulFeedback: ParagraphFeedbackResponse = {
  ao1: {
    strength: "The paragraph has a clear comparative argument about responsibility.",
    target: "Make the topic sentence sharper by naming the precise judgement.",
  },
  ao2: {
    strength: "Method is addressed through language and focalisation.",
    target: "Zoom in on one word before explaining effect.",
  },
  ao3: {
    strength: "Context is connected to education and social pressure.",
    target: "Explain how context changes the reader's understanding of method.",
  },
  ao4: {
    strength: "The comparison links both writers through a shared concern.",
    target: "Use one explicit comparative hinge before moving to McEwan.",
  },
  nextTarget: "Revise the topic sentence as one concise comparative claim.",
};

const routeLinkedFeedback: ParagraphFeedbackResponse = {
  ...successfulFeedback,
  routeMatch: {
    strength: "The paragraph follows the selected Dickens-to-McEwan route.",
    target: "Make the final comparative link back to the selected route explicit.",
  },
};

const routeLinkedFeedbackWithSafety: ParagraphFeedbackResponse = {
  ...routeLinkedFeedback,
  safetyNotice,
};

const fetchMock = vi.fn();
const originalClipboard = navigator.clipboard;

function mockFetch(payload: unknown, ok = true) {
  fetchMock.mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(payload),
  });
}

function mockClipboard(writeText = vi.fn().mockResolvedValue(undefined)) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  return writeText;
}

function mockClipboardUnavailable() {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: undefined,
  });
}

function renderPage() {
  return render(<ParagraphFeedback />);
}

function submitValidParagraph(options: { includeRouteContext?: boolean } = { includeRouteContext: true }) {
  fireEvent.change(screen.getByLabelText("Essay question or question focus (optional but recommended)"), {
    target: { value: "How do Dickens and McEwan present responsibility?" },
  });
  fireEvent.change(screen.getByLabelText("Theme (optional)"), {
    target: { value: "responsibility" },
  });
  fireEvent.change(screen.getByLabelText("Paragraph"), {
    target: { value: validParagraph },
  });
  if (options.includeRouteContext) {
    fireEvent.change(screen.getByLabelText("Route context"), {
      target: { value: routeContext },
    });
  }
  fireEvent.click(screen.getByRole("button", { name: "Get AO feedback" }));
}

describe("ParagraphFeedback", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: originalClipboard,
    });
    vi.unstubAllGlobals();
  });

  it("renders the page title and restrictions", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "AI Paragraph Feedback Coach" })).toBeInTheDocument();
    expect(screen.getByText(/AO1-AO4 feedback for one Component 2 paragraph/i)).toBeInTheDocument();
    expect(screen.getByText("Paste one paragraph only.")).toBeInTheDocument();
    expect(screen.getByText("The coach will not write or rewrite your answer.")).toBeInTheDocument();
    expect(screen.getByText("Feedback uses AO1, AO2, AO3 and AO4 only.")).toBeInTheDocument();
  });

  it("renders the textarea and optional context inputs", () => {
    renderPage();

    expect(screen.getByLabelText("Essay question or question focus (optional but recommended)")).toBeInTheDocument();
    expect(screen.getByLabelText("Theme (optional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Paragraph")).toBeInTheDocument();
    expect(screen.getByLabelText("Route context")).toBeInTheDocument();
    expect(screen.getByText("Optional: paste your Rapid Recall practice session summary so the coach can check whether your paragraph follows your selected route.")).toBeInTheDocument();
  });

  it("keeps the submit button disabled for a too-short paragraph", () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("Paragraph"), { target: { value: "Too short." } });

    expect(screen.getByRole("button", { name: "Get AO feedback" })).toBeDisabled();
    expect(screen.getByText(/at least 80 characters/i)).toBeInTheDocument();
  });

  it("does not show the feedback export action before feedback exists", () => {
    renderPage();

    expect(screen.queryByRole("button", { name: "Copy feedback record" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Feedback export record")).not.toBeInTheDocument();
  });

  it("submits valid input and route context to the internal endpoint", async () => {
    mockFetch(successfulFeedback);
    renderPage();

    submitValidParagraph();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/paragraph-feedback",
      expect.objectContaining({ method: "POST" }),
    ));
    const [, requestInit] = fetchMock.mock.calls[0];
    const payload = JSON.parse(String(requestInit.body)) as Record<string, string>;
    expect(payload).toMatchObject({
      paragraph: validParagraph,
      questionFocus: "How do Dickens and McEwan present responsibility?",
      theme: "responsibility",
      routeContext,
    });
  });

  it("omits empty route context from the internal endpoint payload", async () => {
    mockFetch(successfulFeedback);
    renderPage();

    submitValidParagraph({ includeRouteContext: false });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, requestInit] = fetchMock.mock.calls[0];
    const payload = JSON.parse(String(requestInit.body)) as Record<string, string>;
    expect(payload.routeContext).toBeUndefined();
  });

  it("renders structured AO1-AO4 feedback and one next target", async () => {
    mockFetch(successfulFeedback);
    renderPage();

    submitValidParagraph();

    expect(await screen.findByRole("heading", { name: "AO1: argument focus" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AO2: method / word / effect" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AO3: context relevance" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AO4: comparison quality" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Next target" })).toBeInTheDocument();
    expect(screen.getAllByText("Use one explicit comparative hinge before moving to McEwan.").length).toBeGreaterThan(0);
  });

  it("renders route-match feedback when it is returned", async () => {
    mockFetch(routeLinkedFeedback);
    renderPage();

    submitValidParagraph();

    expect(await screen.findByRole("heading", { name: "Route match" })).toBeInTheDocument();
    expect(screen.getAllByText("The paragraph follows the selected Dickens-to-McEwan route.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Make the final comparative link back to the selected route explicit.").length).toBeGreaterThan(0);
  });

  it("renders the feedback export record with submitted context and feedback sections", async () => {
    mockFetch(routeLinkedFeedbackWithSafety);
    renderPage();

    submitValidParagraph();

    const exportRecord = await screen.findByLabelText("Feedback export record");
    expect(screen.getByRole("button", { name: "Copy feedback record" })).toBeInTheDocument();
    expect(exportRecord).toHaveTextContent("Paragraph Feedback Record");
    expect(exportRecord).toHaveTextContent("Question focus: How do Dickens and McEwan present responsibility?");
    expect(exportRecord).toHaveTextContent("Theme: responsibility");
    expect(exportRecord).toHaveTextContent("Route context: Practice Session Summary Selected route: Dickens external systems; McEwan private perception.");
    expect(exportRecord).toHaveTextContent("AO1 - Argument focus Strength: The paragraph has a clear comparative argument about responsibility. Target: Make the topic sentence sharper by naming the precise judgement.");
    expect(exportRecord).toHaveTextContent("AO2 - Method / word / effect Strength: Method is addressed through language and focalisation. Target: Zoom in on one word before explaining effect.");
    expect(exportRecord).toHaveTextContent("AO3 - Context relevance Strength: Context is connected to education and social pressure. Target: Explain how context changes the reader's understanding of method.");
    expect(exportRecord).toHaveTextContent("AO4 - Comparison quality Strength: The comparison links both writers through a shared concern. Target: Use one explicit comparative hinge before moving to McEwan.");
    expect(exportRecord).toHaveTextContent("Route match Strength: The paragraph follows the selected Dickens-to-McEwan route. Target: Make the final comparative link back to the selected route explicit.");
    expect(exportRecord).toHaveTextContent("Next target: Revise the topic sentence as one concise comparative claim.");
    expect(exportRecord).toHaveTextContent(`Safety notice: ${safetyNotice}`);
    expect(exportRecord).not.toHaveTextContent(validParagraph);
  });

  it("copies the feedback export record and confirms success", async () => {
    const writeText = mockClipboard();
    mockFetch(routeLinkedFeedbackWithSafety);
    renderPage();

    submitValidParagraph();

    fireEvent.click(await screen.findByRole("button", { name: "Copy feedback record" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Paragraph Feedback Record")));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("AO4 - Comparison quality"));
    expect(String(writeText.mock.calls[0][0])).not.toContain(validParagraph);
    expect(screen.getByRole("status")).toHaveTextContent("Feedback record copied");
  });

  it("degrades safely when clipboard is unavailable", async () => {
    mockClipboardUnavailable();
    mockFetch(routeLinkedFeedbackWithSafety);
    renderPage();

    submitValidParagraph();

    fireEvent.click(await screen.findByRole("button", { name: "Copy feedback record" }));

    expect(screen.getByRole("status")).toHaveTextContent("Copy unavailable");
    expect(screen.getByLabelText("Feedback export record")).toHaveTextContent("Paragraph Feedback Record");
  });

  it("keeps the feedback export UI free of excluded output sections", async () => {
    mockFetch(routeLinkedFeedbackWithSafety);
    renderPage();
    const excluded = ["AO", "5"].join("");

    submitValidParagraph();

    const exportRecord = await screen.findByLabelText("Feedback export record");
    expect(exportRecord).not.toHaveTextContent(excluded);
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
      expect(exportRecord).not.toHaveTextContent(pattern);
    }
  });

  it("still renders AO1-AO4 feedback safely when route-match feedback is absent", async () => {
    mockFetch(successfulFeedback);
    renderPage();

    submitValidParagraph();

    expect(await screen.findByRole("heading", { name: "AO1: argument focus" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Route match" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Next target" })).toBeInTheDocument();
  });

  it("does not render excluded assessment-objective wording", async () => {
    mockFetch(routeLinkedFeedback);
    const { container } = renderPage();
    const excluded = ["AO", "5"].join("");

    submitValidParagraph();

    await screen.findByRole("heading", { name: "AO1: argument focus" });
    expect(container).not.toHaveTextContent(excluded);
  });

  it("does not add forbidden output section headings", async () => {
    mockFetch(routeLinkedFeedback);
    renderPage();

    submitValidParagraph();

    await screen.findByRole("heading", { name: "AO1: argument focus" });
    const results = screen.getByLabelText("Paragraph feedback results");
    for (const pattern of [/grade/i, /mark/i, /score/i, /model answer/i, /rewritten paragraph/i]) {
      expect(within(results).queryByRole("heading", { name: pattern })).not.toBeInTheDocument();
    }
  });

  it("renders unavailable feedback safely", async () => {
    mockFetch(createMissingProviderFeedback(undefined, { includeRouteMatch: true }));
    renderPage();

    submitValidParagraph();

    expect(await screen.findByText("Safety notice")).toBeInTheDocument();
    expect(screen.getAllByText(/AI feedback is unavailable/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Route match" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Next target" })).toBeInTheDocument();
  });

  it("renders endpoint errors safely", async () => {
    mockFetch({ error: "Feedback is unavailable. Try again with one paragraph." }, false);
    renderPage();

    submitValidParagraph();

    expect(await screen.findByRole("alert")).toHaveTextContent("Feedback unavailable");
    expect(screen.getByRole("alert")).toHaveTextContent("Try again with one paragraph");
  });
});
