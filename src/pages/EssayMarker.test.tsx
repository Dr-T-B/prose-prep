import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import EssayMarker from "./EssayMarker";

const mockState = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  getSessionMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "student-1", email: "student@example.com" },
    loading: false,
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: mockState.getSessionMock,
    },
    from: mockState.fromMock,
  },
}));

const practiceQuestions = [
  {
    id: "q-education",
    family: "education",
    stem: "Compare the ways in which the writers of your two chosen texts present education. You must relate your discussion to relevant contextual factors.",
  },
  {
    id: "q-memory",
    family: "memory",
    stem: "Compare how Dickens and McEwan present memory in Hard Times and Atonement. You must relate your discussion to relevant contextual factors.",
  },
];

const validAnswer = Array.from(
  { length: 42 },
  () => "Dickens and McEwan compare childhood through narrative method, contextual pressure and changing social expectations in ways that shape the reader's response.",
).join(" ");

const safeSections = [
  `<section:examWarning>Formative guidance only: use this as practice feedback, not an official assessment judgement.</section:examWarning>`,
  `<section:summary>The response keeps a clear comparative focus on both texts. It links method to meaning and begins to connect ideas to context. The next practice step is to make each comparison more precise.</section:summary>`,
  `<section:AO1>{"diagnosticLabel":"argument clarity","strength":"The argument stays focused on the question.","nextStep":"Make the opening judgement more exact."}</section:AO1>`,
  `<section:AO2>{"diagnosticLabel":"method analysis","strength":"The answer notices narrative method in both texts.","nextStep":"Zoom in on one word or structural choice before explaining effect."}</section:AO2>`,
  `<section:AO3>{"diagnosticLabel":"context integration","strength":"Context is linked to social pressure.","nextStep":"Show how context changes the reader's understanding of method."}</section:AO3>`,
  `<section:AO4>{"diagnosticLabel":"comparison","strength":"The comparison connects Dickens and McEwan through a shared concern.","nextStep":"Use one explicit comparative hinge before moving between texts."}</section:AO4>`,
  `<section:strengths>["Clear question focus","Relevant comparison","Useful contextual awareness"]</section:strengths>`,
  `<section:priorityTargets>["Sharpen the thesis","Embed context through method","Make comparison more continuous"]</section:priorityTargets>`,
  `<section:quoteMethodDiagnostic>[]</section:quoteMethodDiagnostic>`,
  `<section:revisionPrompts>["Where does method shape meaning?","How does context alter interpretation?","What changes between the two writers?"]</section:revisionPrompts>`,
  `<section:nextStep>Revise one paragraph so that method, context and comparison work together.</section:nextStep>`,
];

function createQuery(table: string) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.in = vi.fn(() => chain);
  chain.order = vi.fn(() => {
    if (table === "questions") return Promise.resolve({ data: practiceQuestions, error: null });
    return chain;
  });
  chain.limit = vi.fn(() => Promise.resolve({ data: [], error: null }));
  chain.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
  chain.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
  chain.insert = vi.fn(() => Promise.resolve({ error: null }));
  return chain;
}

function mockFeedbackStream() {
  const encoder = new TextEncoder();
  return {
    ok: true,
    status: 200,
    body: new ReadableStream({
      start(controller) {
        for (const chunk of safeSections) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    }),
    json: vi.fn().mockResolvedValue({}),
  };
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <EssayMarker />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function submitAnswer() {
  fireEvent.change(screen.getByLabelText("Your answer"), {
    target: { value: validAnswer },
  });
  fireEvent.click(screen.getByRole("button", { name: "Check my answer" }));
}

async function submittedPayload() {
  await waitFor(() => expect(mockState.fetchMock).toHaveBeenCalled());
  const [, init] = mockState.fetchMock.mock.calls[0];
  return JSON.parse(String(init.body)) as Record<string, string>;
}

function expectSelectedQuestionAboveAnswer(question: string) {
  const summary = screen.getByText("Selected question").closest("div");
  expect(summary).not.toBeNull();
  expect(summary).toHaveTextContent(question);
  const answerBox = screen.getByLabelText("Your answer");
  expect(summary!.compareDocumentPosition(answerBox) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
}

describe("EssayMarker question source flow", () => {
  beforeEach(() => {
    mockState.fetchMock.mockReset();
    mockState.getSessionMock.mockResolvedValue({ data: { session: { access_token: "jwt" } } });
    mockState.fromMock.mockImplementation((table: string) => createQuery(table));
    vi.stubGlobal("fetch", mockState.fetchMock);
    mockState.fetchMock.mockResolvedValue(mockFeedbackStream());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads existing sample practice questions and submits the selected question id", async () => {
    renderPage();

    expect(await screen.findByText("2 sample practice questions available.")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/present education/i));
    expectSelectedQuestionAboveAnswer(practiceQuestions[0].stem);
    submitAnswer();

    const payload = await submittedPayload();
    expect(payload).toMatchObject({
      mode: "full_essay",
      question_id: "q-education",
      essay_text: validAnswer,
    });
    expect(payload.question_stem).toBeUndefined();
  });

  it("accepts a user-written custom question", async () => {
    renderPage();
    const question = "Compare how Dickens and McEwan present guilt in Hard Times and Atonement. You must relate your discussion to relevant contextual factors.";

    fireEvent.click(screen.getByLabelText("My own question"));
    fireEvent.change(screen.getByLabelText("Essay question"), {
      target: {
        value: question,
      },
    });
    expectSelectedQuestionAboveAnswer(question);
    submitAnswer();

    const payload = await submittedPayload();
    expect(payload.question_stem).toBe(question);
    expect(payload.question_id).toBeUndefined();
  });

  it("blocks an empty custom question", () => {
    renderPage();

    fireEvent.click(screen.getByLabelText("My own question"));
    fireEvent.change(screen.getByLabelText("Your answer"), {
      target: { value: validAnswer },
    });
    fireEvent.click(screen.getByRole("button", { name: "Check my answer" }));

    expect(screen.getByText("Type or paste your essay question first.")).toBeInTheDocument();
    expect(mockState.fetchMock).not.toHaveBeenCalled();
  });

  it("shows the Component 2 warning for non-comparative custom wording", () => {
    renderPage();

    fireEvent.click(screen.getByLabelText("My own question"));
    fireEvent.change(screen.getByLabelText("Essay question"), {
      target: { value: "How is childhood presented?" },
    });

    expect(screen.getByText(
      "For Edexcel Component 2, stronger practice questions usually ask you to compare both texts and relate ideas to context.",
    )).toBeInTheDocument();
  });

  it("selects a generated local question and submits it for feedback", async () => {
    renderPage();

    fireEvent.click(screen.getByLabelText("Generate from theme"));
    fireEvent.click(screen.getByRole("button", { name: "Generate practice questions" }));
    const generatedOptions = screen.getAllByRole("radio", { name: /Compare/i });
    fireEvent.click(generatedOptions[1]);
    const chosenQuestion = generatedOptions[1].textContent?.trim() ?? "";
    expectSelectedQuestionAboveAnswer(chosenQuestion);
    submitAnswer();

    const payload = await submittedPayload();
    expect(payload.question_stem).toBe(chosenQuestion);
    expect(payload.question_stem).toMatch(/contextual factors/i);
    expect(payload.question_id).toBeUndefined();
  });

  it("renders formative AO1-AO4 feedback without unsafe student-facing output", async () => {
    const { container } = renderPage();

    fireEvent.click(await screen.findByLabelText(/present education/i));
    submitAnswer();

    const results = await screen.findByLabelText("Essay feedback results");
    expect(within(results).getByText("AO1")).toBeInTheDocument();
    expect(within(results).getByText("AO2")).toBeInTheDocument();
    expect(within(results).getByText("AO3")).toBeInTheDocument();
    expect(within(results).getByText("AO4")).toBeInTheDocument();

    const excludedAo = ["AO", "5"].join("");
    expect(container).not.toHaveTextContent(excludedAo);
    for (const pattern of [
      /\bmarks?\b/i,
      /\bscores?\b/i,
      /\bgrades?\b/i,
      /\blevels?\b/i,
      /\bbands?\b/i,
      /model answer/i,
      /\brewrite\b/i,
      /full essay/i,
    ]) {
      expect(results).not.toHaveTextContent(pattern);
    }
  });
});
