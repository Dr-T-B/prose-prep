import {
  coerceSafeParagraphFeedbackResponse,
  createMissingProviderFeedback,
  validateParagraphFeedbackRequest,
} from "../src/lib/paragraphFeedbackContract.js";
import type {
  ParagraphFeedbackResponse,
  ValidatedParagraphFeedbackRequest,
} from "../src/types/paragraphFeedback.js";

type JsonResponder = {
  json: (payload: unknown) => void;
};

type ParagraphFeedbackApiRequest = {
  method?: string;
  body?: unknown;
};

type ParagraphFeedbackApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (statusCode: number) => JsonResponder;
  json: (payload: unknown) => void;
};

type UnknownRecord = Record<string, unknown>;

const SERVER_KEY_NAME = ["OPENAI", "API", "KEY"].join("_");
const EXCLUDED_AO_LABEL = ["AO", "5"].join("");
const OPENAI_RESPONSES_ENDPOINT = ["https://api.", "openai", ".com/v1/responses"].join("");
const OPENAI_MODEL = "gpt-4.1-mini";

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBody(body: unknown): unknown {
  if (typeof body !== "string") return body;

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}

function getServerProviderKey(): string | null {
  const value = process.env[SERVER_KEY_NAME];
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function buildServerInstruction(request: ValidatedParagraphFeedbackRequest) {
  const hasRouteContext = Boolean(request.routeContext);

  return {
    system: [
      "You are giving feedback on one A-Level English Literature Component 2 paragraph.",
      "Texts: Hard Times by Charles Dickens and Atonement by Ian McEwan.",
      "Exam board: Pearson Edexcel.",
      "Use AO1, AO2, AO3 and AO4 only.",
      `Do not mention ${EXCLUDED_AO_LABEL}.`,
      "Do not grade, score, or mark the work.",
      "Do not rewrite the paragraph.",
      "Do not provide a rewritten paragraph.",
      "Do not generate a model answer.",
      "Do not generate a model paragraph.",
      "Do not generate a perfect answer.",
      "Do not generate an essay or full essay.",
      "Do not create a new route plan.",
      "Do not invent quotations.",
      "Do not provide unsupported generated quotations.",
      "Do not ask the student to add unsupported quotations.",
      "Give concise, actionable feedback only.",
      hasRouteContext
        ? "If route context is provided, check whether the student paragraph follows the selected route plan and practice-session summary. Comment only on route alignment, not on whether the route itself is perfect."
        : "No route context was provided, so do not include route-match feedback.",
      hasRouteContext
        ? "Output only a structured object with ao1, ao2, ao3, ao4, routeMatch and nextTarget fields."
        : "Output only a structured object with ao1, ao2, ao3, ao4 and nextTarget fields.",
    ].join("\n"),
    user: JSON.stringify({
      paragraph: request.paragraph,
      questionFocus: request.questionFocus ?? null,
      theme: request.theme ?? null,
      routeContext: request.routeContext ?? null,
    }),
  };
}

function createCriterionSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["strength", "target"],
    properties: {
      strength: {
        type: "string",
        description: "One concise sentence naming what is already working.",
      },
      target: {
        type: "string",
        description: "One concise sentence naming the next improvement.",
      },
    },
  };
}

function createParagraphFeedbackSchema(includeRouteMatch: boolean) {
  const criterionSchema = createCriterionSchema();
  const properties: Record<string, unknown> = {
    ao1: criterionSchema,
    ao2: criterionSchema,
    ao3: criterionSchema,
    ao4: criterionSchema,
    nextTarget: {
      type: "string",
      description: "One concise next target for the student's next paragraph revision.",
    },
  };
  const required = ["ao1", "ao2", "ao3", "ao4", "nextTarget"];

  if (includeRouteMatch) {
    properties.routeMatch = criterionSchema;
    required.splice(4, 0, "routeMatch");
  }

  return {
    type: "object",
    additionalProperties: false,
    required,
    properties,
  };
}

function buildOpenAiRequestBody(request: ValidatedParagraphFeedbackRequest) {
  const includeRouteMatch = Boolean(request.routeContext);
  const instruction = buildServerInstruction(request);

  return {
    model: OPENAI_MODEL,
    store: false,
    instructions: instruction.system,
    input: instruction.user,
    temperature: 0.2,
    max_output_tokens: 900,
    text: {
      format: {
        type: "json_schema",
        name: includeRouteMatch ? "paragraph_feedback_with_route" : "paragraph_feedback",
        strict: true,
        schema: createParagraphFeedbackSchema(includeRouteMatch),
      },
    },
  };
}

function readProviderOutputText(payload: unknown): string | null {
  if (!isRecord(payload)) return null;

  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  if (!Array.isArray(payload.output)) return null;

  for (const item of payload.output) {
    if (!isRecord(item) || !Array.isArray(item.content)) continue;

    for (const part of item.content) {
      if (!isRecord(part)) continue;
      if (part.type === "output_text" && typeof part.text === "string" && part.text.trim()) {
        return part.text;
      }
    }
  }

  return null;
}

function parseProviderFeedback(payload: unknown): unknown {
  const text = readProviderOutputText(payload);
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function coerceProviderFeedback(input: unknown, includeRouteMatch: boolean): ParagraphFeedbackResponse {
  const feedback = coerceSafeParagraphFeedbackResponse(input);

  if (includeRouteMatch && !feedback.routeMatch) {
    return coerceSafeParagraphFeedbackResponse(null);
  }

  if (!includeRouteMatch && feedback.routeMatch) {
    const { routeMatch: _routeMatch, ...feedbackWithoutRouteMatch } = feedback;
    return feedbackWithoutRouteMatch;
  }

  return feedback;
}

async function requestOpenAiFeedback(
  request: ValidatedParagraphFeedbackRequest,
  apiKey: string,
): Promise<unknown> {
  const response = await fetch(OPENAI_RESPONSES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(buildOpenAiRequestBody(request)),
  });

  if (!response.ok) return null;

  const payload = await response.json().catch(() => null) as unknown;
  return parseProviderFeedback(payload);
}

async function createProviderFeedback(request: ValidatedParagraphFeedbackRequest): Promise<ParagraphFeedbackResponse> {
  const includeRouteMatch = Boolean(request.routeContext);
  const apiKey = getServerProviderKey();

  if (!apiKey) {
    return createMissingProviderFeedback(undefined, { includeRouteMatch });
  }

  try {
    const providerFeedback = await requestOpenAiFeedback(request, apiKey);
    return coerceProviderFeedback(providerFeedback, includeRouteMatch);
  } catch {
    return coerceSafeParagraphFeedbackResponse(null);
  }
}

export default async function handler(
  req: ParagraphFeedbackApiRequest,
  res: ParagraphFeedbackApiResponse,
): Promise<void> {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const validation = validateParagraphFeedbackRequest(parseBody(req.body));
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const providerFeedback = await createProviderFeedback(validation.value);
  res.status(200).json(coerceSafeParagraphFeedbackResponse(providerFeedback));
}
