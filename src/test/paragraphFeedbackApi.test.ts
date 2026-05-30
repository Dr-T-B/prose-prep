import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../../api/paragraph-feedback";
import type { ParagraphFeedbackResponse } from "../types/paragraphFeedback";

const serverKeyName = ["OPENAI", "API", "KEY"].join("_");
const providerEndpoint = ["https://api.", "openai", ".com/v1/responses"].join("");
const excludedAoLabel = ["AO", "5"].join("");
const originalProviderKey = process.env[serverKeyName];

const validParagraph = [
  "Dickens presents utilitarian education as emotionally damaging through Gradgrind's hard language of facts and measurement.",
  "By contrast, McEwan uses Briony's focalised certainty to show how private imagination can distort responsibility, so both writers connect individual judgement to wider social pressure.",
].join(" ");

const routeContext = [
  "Practice Session Summary",
  "Theme: responsibility",
  "Selected route: Dickens external systems; McEwan private perception.",
].join("\n");

const fetchMock = vi.fn();

type CapturedResponse = {
  headers: Record<string, string>;
  payload: unknown;
  statusCode: number | null;
};

function createMockResponse() {
  const captured: CapturedResponse = {
    headers: {},
    payload: undefined,
    statusCode: null,
  };
  const jsonResponder = {
    json(payload: unknown) {
      captured.payload = payload;
    },
  };
  const res = {
    setHeader(name: string, value: string) {
      captured.headers[name] = value;
    },
    status(statusCode: number) {
      captured.statusCode = statusCode;
      return jsonResponder;
    },
    json(payload: unknown) {
      if (captured.statusCode === null) captured.statusCode = 200;
      captured.payload = payload;
    },
  };

  return { captured, res };
}

async function postFeedback(body: unknown): Promise<CapturedResponse> {
  const { captured, res } = createMockResponse();
  await handler({ method: "POST", body }, res);
  return captured;
}

function validFeedback(): ParagraphFeedbackResponse {
  return {
    ao1: {
      strength: "The paragraph keeps a clear comparative argument about responsibility.",
      target: "Make the topic sentence name the precise judgement more directly.",
    },
    ao2: {
      strength: "Method is addressed through language and focalisation.",
      target: "Zoom in on one word before explaining its effect.",
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
}

function routeLinkedFeedback(): ParagraphFeedbackResponse {
  return {
    ...validFeedback(),
    routeMatch: {
      strength: "The paragraph follows the selected Dickens-to-McEwan route.",
      target: "Make the final comparative link back to the selected route explicit.",
    },
  };
}

function outputTextPayload(feedback: unknown) {
  return { output_text: typeof feedback === "string" ? feedback : JSON.stringify(feedback) };
}

function nestedOutputTextPayload(feedback: unknown) {
  return {
    output: [
      {
        content: [
          { type: "output_text", text: typeof feedback === "string" ? feedback : JSON.stringify(feedback) },
        ],
      },
    ],
  };
}

function mockProviderPayload(payload: unknown, ok = true) {
  fetchMock.mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(payload),
  });
}

function getProviderRequestBody(): Record<string, unknown> {
  const [, init] = fetchMock.mock.calls[0] as [string, { body?: unknown }];
  return JSON.parse(String(init.body)) as Record<string, unknown>;
}

describe("paragraph feedback API provider", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    delete process.env[serverKeyName];
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    if (originalProviderKey === undefined) delete process.env[serverKeyName];
    else process.env[serverKeyName] = originalProviderKey;
    vi.unstubAllGlobals();
  });

  it("returns the safe missing-provider fallback without calling fetch when the server key is missing", async () => {
    const response = await postFeedback({ paragraph: validParagraph, routeContext });

    expect(response.statusCode).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    const payload = response.payload as ParagraphFeedbackResponse;
    expect(payload.ao1.strength).toMatch(/server feedback provider is not configured/i);
    expect(payload.routeMatch?.target).toMatch(/selected route/i);
    expect(JSON.stringify(payload)).not.toMatch(new RegExp(excludedAoLabel, "i"));
  });

  it("returns valid structured AO1-AO4 provider feedback", async () => {
    process.env[serverKeyName] = "test-provider-key";
    mockProviderPayload(outputTextPayload(validFeedback()));

    const response = await postFeedback({
      paragraph: validParagraph,
      questionFocus: "How do Dickens and McEwan present responsibility?",
      theme: "responsibility",
    });

    expect(response.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(providerEndpoint, expect.objectContaining({ method: "POST" }));
    const [, init] = fetchMock.mock.calls[0] as [string, { headers?: Record<string, string> }];
    expect(init.headers).toMatchObject({ Authorization: "Bearer test-provider-key" });

    const providerRequest = getProviderRequestBody();
    expect(providerRequest.model).toBe("gpt-4.1-mini");
    expect(providerRequest.store).toBe(false);
    expect(providerRequest.text).toMatchObject({
      format: { type: "json_schema", strict: true },
    });
    expect(JSON.parse(String(providerRequest.input))).toEqual({
      paragraph: validParagraph,
      questionFocus: "How do Dickens and McEwan present responsibility?",
      theme: "responsibility",
      routeContext: null,
    });

    const payload = response.payload as ParagraphFeedbackResponse;
    expect(payload.ao1.strength).toContain("comparative argument");
    expect(payload.ao2.target).toContain("Zoom in");
    expect(payload.ao3.target).toContain("context");
    expect(payload.ao4.strength).toContain("comparison");
    expect(payload.nextTarget).toContain("topic sentence");
    expect(payload.routeMatch).toBeUndefined();
    expect(JSON.stringify(payload)).not.toMatch(new RegExp(excludedAoLabel, "i"));
    expect(JSON.stringify(payload)).not.toMatch(/\b(grade|score|mark|band)\b|top[-\s]?band|model answer|rewrite|full essay/i);
  });

  it("includes route-match feedback when route context exists", async () => {
    process.env[serverKeyName] = "test-provider-key";
    mockProviderPayload(nestedOutputTextPayload(routeLinkedFeedback()));

    const response = await postFeedback({ paragraph: validParagraph, routeContext });

    expect(response.statusCode).toBe(200);
    const providerRequest = getProviderRequestBody();
    const providerInput = JSON.parse(String(providerRequest.input)) as Record<string, unknown>;
    expect(providerInput).toEqual({
      paragraph: validParagraph,
      questionFocus: null,
      theme: null,
      routeContext,
    });
    for (const unsafeKey of ["grade", "score", "mark", "modelAnswer", "rewrittenParagraph", "fullEssay"]) {
      expect(providerInput[unsafeKey]).toBeUndefined();
    }
    expect(JSON.stringify(providerRequest)).toContain(excludedAoLabel);
    expect(JSON.stringify(providerRequest)).toContain("routeMatch");

    const payload = response.payload as ParagraphFeedbackResponse;
    expect(payload.routeMatch?.strength).toContain("selected Dickens-to-McEwan route");
    expect(JSON.stringify(payload)).not.toMatch(new RegExp(excludedAoLabel, "i"));
  });

  it.each([
    ["malformed JSON", outputTextPayload("{not valid json")],
    ["missing required fields", outputTextPayload({ ao1: validFeedback().ao1 })],
    ["unsafe model text", outputTextPayload({
      ...validFeedback(),
      ao2: {
        strength: `The ${excludedAoLabel} point is present.`,
        target: "This target should be rejected.",
      },
    })],
    ["unsafe band text", outputTextPayload({
      ...validFeedback(),
      nextTarget: "This is moving into top band territory.",
    })],
  ])("fails safely for %s", async (_label, providerPayload) => {
    process.env[serverKeyName] = "test-provider-key";
    mockProviderPayload(providerPayload);

    const response = await postFeedback({ paragraph: validParagraph, routeContext });

    expect(response.statusCode).toBe(200);
    const payload = response.payload as ParagraphFeedbackResponse;
    expect(payload.ao1.strength).toMatch(/safety contract/i);
    expect(payload.safetyNotice).toMatch(/safety contract/i);
    expect(payload.routeMatch).toBeUndefined();
    expect(JSON.stringify(payload)).not.toMatch(new RegExp(excludedAoLabel, "i"));
  });

  it.each([
    ["HTTP failure", () => mockProviderPayload({ error: "provider rejected request" }, false)],
    ["fetch rejection", () => fetchMock.mockRejectedValue(new Error("provider secret failure"))],
  ])("returns a generic safe fallback for %s", async (_label, setupProviderFailure) => {
    process.env[serverKeyName] = "test-provider-secret";
    setupProviderFailure();

    const response = await postFeedback({ paragraph: validParagraph });

    expect(response.statusCode).toBe(200);
    const serializedPayload = JSON.stringify(response.payload);
    expect(serializedPayload).toContain("Feedback unavailable because the response did not meet the safety contract.");
    expect(serializedPayload).not.toContain("test-provider-secret");
    expect(serializedPayload).not.toContain("provider secret failure");
    expect(serializedPayload).not.toMatch(new RegExp(excludedAoLabel, "i"));
  });
});
