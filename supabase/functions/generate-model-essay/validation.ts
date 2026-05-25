// Pure helpers for the generate-model-essay edge function.
// No Deno-specific imports — also consumed by Vitest tests in src/test/.
//
// Scope of this PR (foundation only):
// - Validate request shape and bounds.
// - Build a controlled placeholder response.
// - No live LLM call. No quote generation. AO1–AO4 only.

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

export type PlaceholderResponse = {
  status: 'placeholder';
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

export function buildPlaceholderResponse(input: ValidatedInput): PlaceholderResponse {
  return {
    status: 'placeholder',
    message:
      'Server-side model essay generator foundation. Live generation is not yet wired; this endpoint returns a controlled plan placeholder.',
    echoed: {
      questionTextPreview: input.questionText.slice(0, 120),
      theme: input.theme,
      thesisAxis: input.thesisAxis,
      targetLevel: input.targetLevel,
    },
    essayPlan: {
      thesis:
        'Placeholder thesis axis to be replaced by server-side Anthropic generation in a follow-up PR.',
      paragraphMoves: [
        'Establish thesis with comparative axis',
        'Develop first paragraph movement (AO1/AO2)',
        'Pivot via contextual contrast (AO3)',
        'Sustain comparison and methods commentary (AO4)',
        'Resolve thesis with evaluative final move',
      ],
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
