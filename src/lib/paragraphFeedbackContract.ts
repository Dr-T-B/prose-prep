import type {
  ParagraphFeedbackAoKey,
  ParagraphFeedbackCriterion,
  ParagraphFeedbackRequestValidation,
  ParagraphFeedbackResponse,
  ParagraphFeedbackResponseValidation,
} from "@/types/paragraphFeedback";

export const PARAGRAPH_FEEDBACK_LIMITS = {
  paragraphMin: 80,
  paragraphMax: 2500,
  questionFocusMax: 300,
  themeMax: 120,
  routeContextMax: 1500,
} as const;

export const PARAGRAPH_FEEDBACK_ENDPOINT = "/api/paragraph-feedback";

const FEEDBACK_KEYS = ["ao1", "ao2", "ao3", "ao4"] as const satisfies readonly ParagraphFeedbackAoKey[];
const EXCLUDED_AO_LABEL = ["AO", "5"].join("");

type UnknownRecord = Record<string, unknown>;

const BLOCKED_REQUEST_PATTERNS = [
  /\b(write|generate|draft|compose|create|produce)\b[\s\S]{0,80}\b(full\s+)?essay\b/i,
  /\b(write|generate|draft|compose|create|produce)\b[\s\S]{0,80}\b(sample|model|perfect)\s+(answer|paragraph|response)\b/i,
  /\b(rewrite|rephrase)\b[\s\S]{0,60}\b(paragraph|answer|essay|response)\b/i,
  /\b(full\s+essay|sample\s+answer|model\s+answer|model\s+paragraph|perfect\s+version)\b/i,
];

const FORBIDDEN_RESPONSE_PATTERNS = [
  new RegExp(`\\b${EXCLUDED_AO_LABEL}\\b`, "i"),
  /\bAO\s*5\b/i,
  /\b(grade|graded|grading|mark|marks|marked|marking|score|scores|scored|scoring)\b/i,
  /\b(model\s+(answer|paragraph|response)|perfect\s+version|full\s+essay|rewritten\s+paragraph)\b/i,
  /\b(here(?:'s| is)\s+(a|the)\s+better|rewrite(n|s)?\s+version)\b/i,
];

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown, fieldName: string, maxLength: number): { ok: true; value?: string } | { ok: false; error: string } {
  if (value === undefined || value === null || value === "") return { ok: true };
  if (typeof value !== "string") return { ok: false, error: `${fieldName} must be text.` };

  const trimmed = value.trim();
  if (!trimmed) return { ok: true };
  if (trimmed.length > maxLength) return { ok: false, error: `${fieldName} must be ${maxLength} characters or fewer.` };

  return { ok: true, value: trimmed };
}

export function hasBlockedParagraphFeedbackIntent(text: string): boolean {
  return BLOCKED_REQUEST_PATTERNS.some((pattern) => pattern.test(text));
}

export function validateParagraphFeedbackRequest(input: unknown): ParagraphFeedbackRequestValidation {
  if (!isRecord(input)) {
    return { ok: false, error: "Submit one paragraph for feedback." };
  }

  if (typeof input.paragraph !== "string") {
    return { ok: false, error: "Paragraph is required." };
  }

  const paragraph = input.paragraph.trim();
  if (!paragraph) {
    return { ok: false, error: "Paragraph is required." };
  }
  if (paragraph.length < PARAGRAPH_FEEDBACK_LIMITS.paragraphMin) {
    return { ok: false, error: `Paragraph must be at least ${PARAGRAPH_FEEDBACK_LIMITS.paragraphMin} characters.` };
  }
  if (paragraph.length > PARAGRAPH_FEEDBACK_LIMITS.paragraphMax) {
    return { ok: false, error: `Paragraph must be ${PARAGRAPH_FEEDBACK_LIMITS.paragraphMax} characters or fewer.` };
  }

  const questionFocus = optionalText(input.questionFocus, "Question focus", PARAGRAPH_FEEDBACK_LIMITS.questionFocusMax);
  if (!questionFocus.ok) return questionFocus;

  const theme = optionalText(input.theme, "Theme", PARAGRAPH_FEEDBACK_LIMITS.themeMax);
  if (!theme.ok) return theme;

  const routeContext = optionalText(input.routeContext, "Route context", PARAGRAPH_FEEDBACK_LIMITS.routeContextMax);
  if (!routeContext.ok) return routeContext;

  const intentText = [paragraph, questionFocus.value, theme.value, routeContext.value].filter(Boolean).join("\n");
  if (hasBlockedParagraphFeedbackIntent(intentText)) {
    return { ok: false, error: "This coach can only give feedback on one paragraph, not produce extended writing." };
  }

  return {
    ok: true,
    value: {
      paragraph,
      ...(questionFocus.value ? { questionFocus: questionFocus.value } : {}),
      ...(theme.value ? { theme: theme.value } : {}),
      ...(routeContext.value ? { routeContext: routeContext.value } : {}),
    },
  };
}

function hasUnsafeResponseText(text: string): boolean {
  return FORBIDDEN_RESPONSE_PATTERNS.some((pattern) => pattern.test(text));
}

function readCriterion(value: unknown, label: string): ParagraphFeedbackCriterion | string {
  if (!isRecord(value)) return `${label} feedback must be structured.`;
  if (typeof value.strength !== "string" || !value.strength.trim()) {
    return `${label} strength is required.`;
  }
  if (typeof value.target !== "string" || !value.target.trim()) {
    return `${label} target is required.`;
  }

  const strength = value.strength.trim();
  const target = value.target.trim();
  if (hasUnsafeResponseText(strength) || hasUnsafeResponseText(target)) {
    return `${label} feedback did not meet the safety contract.`;
  }

  return { strength, target };
}

export function validateParagraphFeedbackResponse(input: unknown): ParagraphFeedbackResponseValidation {
  if (!isRecord(input)) {
    return { ok: false, error: "Feedback response must be structured." };
  }

  const normalized = {} as Record<ParagraphFeedbackAoKey, ParagraphFeedbackCriterion>;
  for (const key of FEEDBACK_KEYS) {
    const criterion = readCriterion(input[key], key.toUpperCase());
    if (typeof criterion === "string") return { ok: false, error: criterion };
    normalized[key] = criterion;
  }

  const routeMatch = input.routeMatch === undefined
    ? undefined
    : readCriterion(input.routeMatch, "Route match");
  if (typeof routeMatch === "string") return { ok: false, error: routeMatch };

  if (typeof input.nextTarget !== "string" || !input.nextTarget.trim()) {
    return { ok: false, error: "Next target is required." };
  }

  const nextTarget = input.nextTarget.trim();
  const safetyNotice = typeof input.safetyNotice === "string" ? input.safetyNotice.trim() : undefined;
  const combined = [
    normalized.ao1.strength,
    normalized.ao1.target,
    normalized.ao2.strength,
    normalized.ao2.target,
    normalized.ao3.strength,
    normalized.ao3.target,
    normalized.ao4.strength,
    normalized.ao4.target,
    routeMatch?.strength,
    routeMatch?.target,
    nextTarget,
    safetyNotice,
  ].filter(Boolean).join("\n");

  if (hasUnsafeResponseText(combined)) {
    return { ok: false, error: "Feedback response did not meet the safety contract." };
  }

  return {
    ok: true,
    value: {
      ao1: normalized.ao1,
      ao2: normalized.ao2,
      ao3: normalized.ao3,
      ao4: normalized.ao4,
      ...(routeMatch ? { routeMatch } : {}),
      nextTarget,
      ...(safetyNotice ? { safetyNotice } : {}),
    },
  };
}

export function createUnsafeParagraphFeedbackFallback(): ParagraphFeedbackResponse {
  const message = "Feedback unavailable because the response did not meet the safety contract.";
  return {
    ao1: { strength: message, target: message },
    ao2: { strength: message, target: message },
    ao3: { strength: message, target: message },
    ao4: { strength: message, target: message },
    nextTarget: "Try again with one paragraph and no request for a sample answer.",
    safetyNotice: message,
  };
}

export function createMissingProviderFeedback(
  reason = "AI feedback is unavailable because the server feedback provider is not configured.",
  options: { includeRouteMatch?: boolean } = {},
): ParagraphFeedbackResponse {
  return {
    ao1: {
      strength: reason,
      target: "Check that the topic sentence makes a clear argument about the question focus.",
    },
    ao2: {
      strength: reason,
      target: "Select one precise method or word choice and explain its effect.",
    },
    ao3: {
      strength: reason,
      target: "Link context only where it changes the meaning of the paragraph.",
    },
    ao4: {
      strength: reason,
      target: "Make the comparison explicit rather than leaving each text separate.",
    },
    ...(options.includeRouteMatch ? {
      routeMatch: {
        strength: reason,
        target: "Compare your paragraph against the selected route and make one route link explicit.",
      },
    } : {}),
    nextTarget: "Try again with one paragraph after the feedback provider is enabled.",
    safetyNotice: `${reason} No paragraph or route context was stored or logged.`,
  };
}

export function coerceSafeParagraphFeedbackResponse(input: unknown): ParagraphFeedbackResponse {
  const validation = validateParagraphFeedbackResponse(input);
  return validation.ok ? validation.value : createUnsafeParagraphFeedbackFallback();
}
