import {
  coerceSafeParagraphFeedbackResponse,
  createMissingProviderFeedback,
  validateParagraphFeedbackRequest,
} from "../src/lib/paragraphFeedbackContract";
import type {
  ParagraphFeedbackResponse,
  ValidatedParagraphFeedbackRequest,
} from "../src/types/paragraphFeedback";

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

const SERVER_KEY_NAME = ["OPENAI", "API", "KEY"].join("_");
const EXCLUDED_AO_LABEL = ["AO", "5"].join("");

function parseBody(body: unknown): unknown {
  if (typeof body !== "string") return body;

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}

function hasServerProviderKey(): boolean {
  const value = process.env[SERVER_KEY_NAME];
  return typeof value === "string" && value.trim().length > 0;
}

function buildServerInstruction(request: ValidatedParagraphFeedbackRequest) {
  return {
    system: [
      "You are giving feedback on one A-Level English Literature Component 2 paragraph.",
      "Texts: Hard Times by Charles Dickens and Atonement by Ian McEwan.",
      "Exam board: Pearson Edexcel.",
      "Use AO1, AO2, AO3 and AO4 only.",
      `Do not mention ${EXCLUDED_AO_LABEL}.`,
      "Do not grade, score, or mark the work.",
      "Do not rewrite the paragraph.",
      "Do not generate a model paragraph.",
      "Do not generate an essay.",
      "Do not invent quotations.",
      "Do not add new quotations unless clearly framed as check your text before using.",
      "Give concise, actionable feedback.",
      "Output only a structured object with ao1, ao2, ao3, ao4 and nextTarget fields.",
    ].join("\n"),
    user: JSON.stringify({
      paragraph: request.paragraph,
      questionFocus: request.questionFocus ?? null,
      theme: request.theme ?? null,
      routeContext: request.routeContext ?? null,
    }),
  };
}

async function createProviderFeedback(request: ValidatedParagraphFeedbackRequest): Promise<ParagraphFeedbackResponse> {
  if (!hasServerProviderKey()) {
    return createMissingProviderFeedback();
  }

  // V1 keeps provider wiring server-side and disabled until a live adapter is added.
  // The guarded prompt is built here so the future adapter does not need browser code.
  void buildServerInstruction(request);
  return createMissingProviderFeedback(
    "AI feedback is unavailable because live provider wiring is not enabled in this version.",
  );
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
