import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
const printMock = vi.fn();
const originalClipboard = navigator.clipboard;
const originalPrint = window.print;

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

function renderPage(initialPath = "/paragraph-feedback") {
  return render(
    <MemoryRouter
      initialEntries={[initialPath]}
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <ParagraphFeedback />
    </MemoryRouter>,
  );
}

function submitValidParagraph(
  options: { includeQuestionFocus?: boolean; includeTheme?: boolean; includeRouteContext?: boolean } = {},
) {
  const { includeQuestionFocus = true, includeTheme = true, includeRouteContext = true } = options;

  if (includeQuestionFocus) {
    fireEvent.change(screen.getByLabelText("Question focus (optional but recommended)"), {
      target: { value: "How do Dickens and McEwan present responsibility?" },
    });
  }
  if (includeTheme) {
    fireEvent.change(screen.getByLabelText("Theme or concern (optional)"), {
      target: { value: "responsibility" },
    });
  }
  fireEvent.change(screen.getByLabelText("Student paragraph"), {
    target: { value: validParagraph },
  });
  if (includeRouteContext) {
    fireEvent.change(screen.getByLabelText("Route context (optional)"), {
      target: { value: routeContext },
    });
  }
  fireEvent.click(screen.getByRole("button", { name: "Get AO feedback" }));
}

describe("ParagraphFeedback", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    printMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "print", {
      configurable: true,
      value: printMock,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: originalClipboard,
    });
    Object.defineProperty(window, "print", {
      configurable: true,
      value: originalPrint,
    });
    vi.unstubAllGlobals();
  });

  it("renders the page title and restrictions", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "AI Paragraph Feedback Coach" })).toBeInTheDocument();
    expect(screen.getByText(/AO1, AO2, AO3 and AO4 feedback for one student-written Component 2 paragraph/i)).toBeInTheDocument();
    expect(screen.getByText("Paste only your own completed paragraph.")).toBeInTheDocument();
    expect(screen.getByText("Route context is optional planning support.")).toBeInTheDocument();
    expect(screen.getByText("Feedback uses AO1, AO2, AO3 and AO4 only.")).toBeInTheDocument();
    expect(screen.getByText("No mark, grade, score, model answer, rewrite or full essay will be generated.")).toBeInTheDocument();
  });

  it("renders the textarea and optional context inputs", () => {
    renderPage();

    expect(screen.getByLabelText("Question focus (optional but recommended)")).toBeInTheDocument();
    expect(screen.getByLabelText("Theme or concern (optional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Student paragraph")).toBeInTheDocument();
    expect(screen.getByLabelText("Route context (optional)")).toBeInTheDocument();
    expect(screen.getByText(/Paste only your own student-written paragraph/i)).toBeInTheDocument();
    expect(screen.getByText(/Optional: use a Rapid Recall route plan or practice session summary/i)).toBeInTheDocument();
    expect(screen.getByText(/This context is not saved by this page/i)).toBeInTheDocument();
  });

  it("prefills safe handoff context while leaving the paragraph manual and empty", () => {
    const params = new URLSearchParams({
      questionFocus: "relationships damaged by misunderstanding",
      theme: "relationships",
      routeContext: "Practice Session Summary\nSelected route: thesis to comparison.",
    });

    renderPage(`/paragraph-feedback?${params.toString()}`);

    expect(screen.getByLabelText("Question focus (optional but recommended)")).toHaveValue("relationships damaged by misunderstanding");
    expect(screen.getByLabelText("Theme or concern (optional)")).toHaveValue("relationships");
    expect(screen.getByLabelText("Route context (optional)")).toHaveValue("Practice Session Summary\nSelected route: thesis to comparison.");
    expect(screen.getByLabelText("Student paragraph")).toHaveValue("");
  });

  it("ignores unsafe handoff params and does not prefill paragraph text", () => {
    const params = new URLSearchParams({
      questionFocus: "memory and guilt",
      theme: "memory",
      routeContext: "Safe route context only.",
      paragraph: validParagraph,
      rewrittenParagraph: "A rewritten paragraph that must be ignored.",
      modelAnswer: "A sample response that must be ignored.",
      fullEssay: "An essay that must be ignored.",
      score: "10",
      mark: "20",
      grade: "A",
      [["ao", "5"].join("")]: "ignored",
    });

    renderPage(`/paragraph-feedback?${params.toString()}`);

    expect(screen.getByLabelText("Question focus (optional but recommended)")).toHaveValue("memory and guilt");
    expect(screen.getByLabelText("Theme or concern (optional)")).toHaveValue("memory");
    expect(screen.getByLabelText("Route context (optional)")).toHaveValue("Safe route context only.");
    expect(screen.getByLabelText("Student paragraph")).toHaveValue("");
  });

  it("keeps the submit button disabled for a too-short paragraph", () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("Student paragraph"), { target: { value: "Too short." } });

    expect(screen.getByRole("button", { name: "Get AO feedback" })).toBeDisabled();
    expect(screen.getByText(/at least 80 characters/i)).toBeInTheDocument();
  });

  it("does not show feedback export or print actions before feedback exists", () => {
    renderPage();

    expect(screen.queryByRole("button", { name: "Copy feedback record" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Print feedback record" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Feedback export record")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Revision action")).not.toBeInTheDocument();
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
    expect(screen.getAllByRole("heading", { name: "Next target" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Use one explicit comparative hinge before moving to McEwan.").length).toBeGreaterThan(0);
  });

  it("renders route-match feedback when it is returned", async () => {
    mockFetch(routeLinkedFeedback);
    renderPage();

    submitValidParagraph();

    expect((await screen.findAllByRole("heading", { name: "Route match" })).length).toBeGreaterThan(0);
    expect(screen.getAllByText("The paragraph follows the selected Dickens-to-McEwan route.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Make the final comparative link back to the selected route explicit.").length).toBeGreaterThan(0);
  });

  it("renders the polished feedback export record with submitted context and feedback sections", async () => {
    mockFetch(routeLinkedFeedbackWithSafety);
    renderPage();

    submitValidParagraph();

    const exportRecord = await screen.findByLabelText("Feedback export record");
    expect(within(exportRecord).getByRole("button", { name: "Copy feedback record" })).toBeInTheDocument();
    expect(within(exportRecord).getByRole("button", { name: "Print feedback record" })).toBeInTheDocument();
    expect(exportRecord).toHaveTextContent("Paragraph Feedback Record");
    expect(exportRecord).toHaveTextContent("Question focus");
    expect(exportRecord).toHaveTextContent("How do Dickens and McEwan present responsibility?");
    expect(exportRecord).toHaveTextContent("Theme");
    expect(exportRecord).toHaveTextContent("responsibility");
    expect(exportRecord).toHaveTextContent("Route context");
    expect(exportRecord).toHaveTextContent("Practice Session Summary Selected route: Dickens external systems; McEwan private perception.");
    expect(exportRecord).toHaveTextContent("AO1 - Argument focus");
    expect(exportRecord).toHaveTextContent("The paragraph has a clear comparative argument about responsibility.");
    expect(exportRecord).toHaveTextContent("Make the topic sentence sharper by naming the precise judgement.");
    expect(exportRecord).toHaveTextContent("AO2 - Method / word / effect");
    expect(exportRecord).toHaveTextContent("Method is addressed through language and focalisation.");
    expect(exportRecord).toHaveTextContent("Zoom in on one word before explaining effect.");
    expect(exportRecord).toHaveTextContent("AO3 - Context relevance");
    expect(exportRecord).toHaveTextContent("Context is connected to education and social pressure.");
    expect(exportRecord).toHaveTextContent("Explain how context changes the reader's understanding of method.");
    expect(exportRecord).toHaveTextContent("AO4 - Comparison quality");
    expect(exportRecord).toHaveTextContent("The comparison links both writers through a shared concern.");
    expect(exportRecord).toHaveTextContent("Use one explicit comparative hinge before moving to McEwan.");
    expect(exportRecord).toHaveTextContent("Route match");
    expect(exportRecord).toHaveTextContent("The paragraph follows the selected Dickens-to-McEwan route.");
    expect(exportRecord).toHaveTextContent("Make the final comparative link back to the selected route explicit.");
    expect(exportRecord).toHaveTextContent("Next target");
    expect(exportRecord).toHaveTextContent("Revise the topic sentence as one concise comparative claim.");
    expect(exportRecord).toHaveTextContent("Safety notice");
    expect(exportRecord).toHaveTextContent(safetyNotice);
    expect(exportRecord).not.toHaveTextContent(validParagraph);
  });

  it("omits optional empty context, route-match, and safety sections cleanly from the export record", async () => {
    mockFetch(successfulFeedback);
    renderPage();

    submitValidParagraph({ includeQuestionFocus: false, includeTheme: false, includeRouteContext: false });

    const exportRecord = await screen.findByLabelText("Feedback export record");
    expect(exportRecord).not.toHaveTextContent("Question focus");
    expect(exportRecord).not.toHaveTextContent("Theme");
    expect(exportRecord).not.toHaveTextContent("Route context");
    expect(exportRecord).not.toHaveTextContent("Route match");
    expect(exportRecord).not.toHaveTextContent("Safety notice");
    expect(exportRecord).toHaveTextContent("AO1 - Argument focus");
    expect(exportRecord).toHaveTextContent("Next target");
  });

  it("renders a static revision action area after feedback exists", async () => {
    mockFetch(routeLinkedFeedbackWithSafety);
    renderPage();

    submitValidParagraph();

    const exportRecord = await screen.findByLabelText("Feedback export record");
    const revisionAction = within(exportRecord).getByLabelText("Revision action");
    expect(revisionAction).toHaveTextContent("Revision action");
    expect(revisionAction).toHaveTextContent("What I will improve next:");
    expect(revisionAction).toHaveTextContent("One sentence I will redraft:");
    expect(within(revisionAction).queryByRole("textbox")).not.toBeInTheDocument();
    expect(within(revisionAction).queryByRole("button")).not.toBeInTheDocument();
  });

  it("prints the feedback record without making another feedback request", async () => {
    mockFetch(routeLinkedFeedbackWithSafety);
    renderPage();

    submitValidParagraph();

    fireEvent.click(await screen.findByRole("button", { name: "Print feedback record" }));

    expect(printMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("copies the feedback export record and confirms success", async () => {
    const writeText = mockClipboard();
    mockFetch(routeLinkedFeedbackWithSafety);
    renderPage();

    submitValidParagraph();

    fireEvent.click(await screen.findByRole("button", { name: "Copy feedback record" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Paragraph Feedback Record")));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("AO4 - Comparison quality"));
    const copiedRecord = String(writeText.mock.calls[0][0]);
    expect(copiedRecord).not.toContain(validParagraph);
    expect(copiedRecord).not.toContain("Revision action");
    expect(copiedRecord).not.toContain("What I will improve next");
    expect(copiedRecord).not.toContain("One sentence I will redraft");
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

  it("degrades safely when clipboard writing fails", async () => {
    const writeText = mockClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    mockFetch(routeLinkedFeedbackWithSafety);
    renderPage();

    submitValidParagraph();

    fireEvent.click(await screen.findByRole("button", { name: "Copy feedback record" }));

    await waitFor(() => expect(writeText).toHaveBeenCalled());
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
    expect(screen.getAllByRole("heading", { name: "Next target" }).length).toBeGreaterThan(0);
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

    expect((await screen.findAllByText("Safety notice")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/AI feedback is unavailable/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "Route match" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "Next target" }).length).toBeGreaterThan(0);
  });

  it("renders endpoint errors safely", async () => {
    mockFetch({ error: "Feedback is unavailable. Try again with one paragraph." }, false);
    renderPage();

    submitValidParagraph();

    expect(await screen.findByRole("alert")).toHaveTextContent("Feedback unavailable");
    expect(screen.getByRole("alert")).toHaveTextContent("Try again with one paragraph");
  });
});
