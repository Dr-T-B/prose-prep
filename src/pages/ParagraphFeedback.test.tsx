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

const fetchMock = vi.fn();

function mockFetch(payload: unknown, ok = true) {
  fetchMock.mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(payload),
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
    expect(screen.getByText("Use one explicit comparative hinge before moving to McEwan.")).toBeInTheDocument();
  });

  it("renders route-match feedback when it is returned", async () => {
    mockFetch(routeLinkedFeedback);
    renderPage();

    submitValidParagraph();

    expect(await screen.findByRole("heading", { name: "Route match" })).toBeInTheDocument();
    expect(screen.getByText("The paragraph follows the selected Dickens-to-McEwan route.")).toBeInTheDocument();
    expect(screen.getByText("Make the final comparative link back to the selected route explicit.")).toBeInTheDocument();
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
