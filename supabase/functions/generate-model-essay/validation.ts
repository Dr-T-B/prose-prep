// Pure helpers for the generate-model-essay edge function.
// No Deno-specific imports — also consumed by Vitest tests in src/test/.
//
// Scope:
// - Validate request shape and bounds.
// - Build the response envelope (placeholder / limited-evidence) within
//   a single stable contract shape consumed by ProseCompass.
// - Centralise cost-cap constants and redacted error messages so PR D2's
//   provider integration cannot drift on budget or leak raw errors.
// - No live LLM call here. No quote generation. AO1–AO4 only.

// Server-side budget — PR D2 provider integration imports these directly
// so the limits can never drift from the contract.
export const MAX_PROVIDER_CALLS_PER_REQUEST = 1;
export const MAX_OUTPUT_TOKENS = 1500;
export const PROVIDER_TIMEOUT_MS = 20_000;

// Client-facing error copy. Never include provider names, stack traces, or
// upstream error text in responses returned to the browser.
export const SAFE_GENERATOR_ERROR_MESSAGE =
  'The model essay generator is temporarily unavailable. Try again shortly.';

export function buildSafeErrorBody(): { error: string } {
  return { error: SAFE_GENERATOR_ERROR_MESSAGE };
}

export type TargetLevel = 'L4' | 'L5';

export const VALID_TARGET_LEVELS: TargetLevel[] = ['L4', 'L5'];

export const QUESTION_TEXT_MIN = 10;
export const QUESTION_TEXT_MAX = 2000;
export const SHORT_FIELD_MAX = 200;

export type GenerateModelEssayInput = {
  questionText: string;
  theme?: string;
  thesisAxis?: string;
  targetLevel?: TargetLevel;
};

export type ValidatedInput = Required<Pick<GenerateModelEssayInput, 'questionText'>> & {
  theme: string | null;
  thesisAxis: string | null;
  targetLevel: TargetLevel | null;
};

export type ValidationError = { ok: false; status: number; error: string };
export type ValidationOk = { ok: true; value: ValidatedInput };
export type ValidationResult = ValidationOk | ValidationError;

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

export function validateInput(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, status: 400, error: 'Body must be a JSON object' };
  }
  const body = raw as Record<string, unknown>;

  if (!isString(body.questionText)) {
    return { ok: false, status: 400, error: 'questionText is required and must be a string' };
  }
  const questionText = body.questionText.trim();
  if (questionText.length < QUESTION_TEXT_MIN) {
    return {
      ok: false,
      status: 400,
      error: `questionText must be at least ${QUESTION_TEXT_MIN} characters`,
    };
  }
  if (questionText.length > QUESTION_TEXT_MAX) {
    return {
      ok: false,
      status: 400,
      error: `questionText must be at most ${QUESTION_TEXT_MAX} characters`,
    };
  }

  const theme = normaliseShort(body.theme, 'theme');
  if (theme && !theme.ok) return theme;
  const thesisAxis = normaliseShort(body.thesisAxis, 'thesisAxis');
  if (thesisAxis && !thesisAxis.ok) return thesisAxis;

  let targetLevel: TargetLevel | null = null;
  if (body.targetLevel !== undefined && body.targetLevel !== null) {
    if (!isString(body.targetLevel) || !VALID_TARGET_LEVELS.includes(body.targetLevel as TargetLevel)) {
      return {
        ok: false,
        status: 400,
        error: `targetLevel must be one of: ${VALID_TARGET_LEVELS.join(', ')}`,
      };
    }
    targetLevel = body.targetLevel as TargetLevel;
  }

  return {
    ok: true,
    value: {
      questionText,
      theme: theme ? theme.value : null,
      thesisAxis: thesisAxis ? thesisAxis.value : null,
      targetLevel,
    },
  };
}

type ShortFieldOk = { ok: true; value: string };
type ShortFieldResult = ShortFieldOk | ValidationError | null;

function normaliseShort(raw: unknown, fieldName: string): ShortFieldResult {
  if (raw === undefined || raw === null) return null;
  if (!isString(raw)) {
    return { ok: false, status: 400, error: `${fieldName} must be a string` };
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > SHORT_FIELD_MAX) {
    return {
      ok: false,
      status: 400,
      error: `${fieldName} must be at most ${SHORT_FIELD_MAX} characters`,
    };
  }
  return { ok: true, value: trimmed };
}

// Response envelope is a single stable shape. Every successful (HTTP 200)
// response — placeholder, real generation, or limited-evidence fallback —
// satisfies this contract so the ProseCompass UI does not need to switch on
// `status`. The `status` discriminator is metadata for telemetry and for
// future renderer enhancements.
export type GenerateModelEssayStatus = 'placeholder' | 'ok' | 'limited_evidence';

export type GenerateModelEssayResponse = {
  status: GenerateModelEssayStatus;
  message: string;
  echoed: {
    questionTextPreview: string;
    theme: string | null;
    thesisAxis: string | null;
    targetLevel: TargetLevel | null;
  };
  essayPlan: {
    thesis: string;
    paragraphMoves: string[];
    quotePolicy: 'verified_quote_bank_only';
    assessmentObjectives: ['AO1', 'AO2', 'AO3', 'AO4'];
  };
  safety: {
    clientSideLLM: false;
    serverSideProviderPlanned: 'anthropic';
    quoteConstraint: string;
  };
};

// Backwards-compatible alias for the ProseCompass UI import.
export type PlaceholderResponse = GenerateModelEssayResponse;

function buildEchoed(input: ValidatedInput): GenerateModelEssayResponse['echoed'] {
  return {
    questionTextPreview: input.questionText.slice(0, 120),
    theme: input.theme,
    thesisAxis: input.thesisAxis,
    targetLevel: input.targetLevel,
  };
}

const DEFAULT_PARAGRAPH_MOVES: GenerateModelEssayResponse['essayPlan']['paragraphMoves'] = [
  'Establish thesis with comparative axis',
  'Develop first paragraph movement (AO1/AO2)',
  'Pivot via contextual contrast (AO3)',
  'Sustain comparison and methods commentary (AO4)',
  'Resolve thesis with evaluative final move',
];

export function buildPlaceholderResponse(input: ValidatedInput): GenerateModelEssayResponse {
  return {
    status: 'placeholder',
    message:
      'Server-side model essay generator foundation. Live generation is not yet wired; this endpoint returns a controlled plan placeholder.',
    echoed: buildEchoed(input),
    essayPlan: {
      thesis:
        'Placeholder thesis axis to be replaced by server-side Anthropic generation in a follow-up PR.',
      paragraphMoves: DEFAULT_PARAGRAPH_MOVES,
      quotePolicy: 'verified_quote_bank_only',
      assessmentObjectives: ['AO1', 'AO2', 'AO3', 'AO4'],
    },
    safety: {
      clientSideLLM: false,
      serverSideProviderPlanned: 'anthropic',
      quoteConstraint:
        'No generated quotations until quote-bank exact-match validation is implemented.',
    },
  };
}

// Returned by PR D2 when the request is valid but the quote bank cannot
// support the requested theme/axis combination. Same outer shape — never
// fabricates quotations, always preserves the AO1–AO4 contract.
export function buildLimitedEvidenceResponse(
  input: ValidatedInput,
  reason: string,
): GenerateModelEssayResponse {
  return {
    status: 'limited_evidence',
    message:
      'The quote bank does not yet contain sufficient verified evidence for this request. Returning a plan-only response with no generated quotations.',
    echoed: buildEchoed(input),
    essayPlan: {
      thesis:
        'Plan-only thesis returned because the quote bank lacks sufficient verified evidence for this question.',
      paragraphMoves: DEFAULT_PARAGRAPH_MOVES,
      quotePolicy: 'verified_quote_bank_only',
      assessmentObjectives: ['AO1', 'AO2', 'AO3', 'AO4'],
    },
    safety: {
      clientSideLLM: false,
      serverSideProviderPlanned: 'anthropic',
      quoteConstraint: `Limited evidence: ${reason}. No generated quotations.`,
    },
  };
}
