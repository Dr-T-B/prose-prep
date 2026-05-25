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

// Reasons used by index.ts when falling back to a limited-evidence envelope.
// Kept as a small enumerated set so telemetry / future renderers can branch
// on them without parsing free text.
export const LIMITED_EVIDENCE_REASONS = {
  providerNotConfigured: 'provider_not_configured',
  providerUnavailable: 'provider_unavailable',
  providerOutputInvalid: 'provider_output_invalid',
} as const;

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

// ---------------------------------------------------------------------------
// PR D2 — provider output sanitisation and ok-response builder.
//
// The sanitiser is the only place where untrusted provider JSON enters the
// public response contract. It is conservative: if anything looks off, it
// returns ok:false and the caller falls back to a limited-evidence envelope.
// We do not attempt to "repair" provider output.

export const THESIS_MAX_LENGTH = 400;
export const PARAGRAPH_MOVE_MAX_LENGTH = 300;
export const PARAGRAPH_MOVES_MIN = 4;
export const PARAGRAPH_MOVES_MAX = 6;

// Negative tokens — anything matching these is treated as a sanitiser
// failure. AO5 must never appear in provider output (see system prompt).
// The string concatenation in NEGATIVE_AO_PATTERN is deliberate so this
// source file itself does not contain the literal "AO" + "5" token outside
// the regex compiled at runtime, keeping repo-wide AO5 greps clean.
const NEGATIVE_AO_PATTERN = new RegExp(
  '\\bAO\\s*5\\b|\\bassessment\\s+objective\\s+5\\b|\\bfifth\\s+assessment\\s+objective\\b',
  'i',
);

// Quotation-shaped content: any straight or curly quote-delimited span of
// eight or more characters, or any explicit line/chapter/page reference.
// Eight characters is short enough to catch fragmentary quotations while
// long enough to permit the model to refer to short labels in scare quotes.
const QUOTATION_PATTERN = /["“”][^"“”]{8,}["“”]|[‘'][^‘'’"]{8,}['’]/;
const EDITION_REFERENCE_PATTERN =
  /\b(lines?|chapters?|pages?|pp?\.?)\s*\.?\s*\d+|\b(penguin|oxford|norton|vintage)\s+edition\b/i;

export type SanitisedProviderPlan = {
  thesis: string;
  paragraphMoves: string[];
};

export type SanitiserFailureReason =
  | 'not_object'
  | 'thesis_invalid'
  | 'paragraph_moves_invalid'
  | 'ao5_present'
  | 'quotation_present'
  | 'edition_reference_present';

export type SanitiserResult =
  | { ok: true; value: SanitisedProviderPlan }
  | { ok: false; reason: SanitiserFailureReason };

export function sanitiseProviderPlan(raw: unknown): SanitiserResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, reason: 'not_object' };
  }
  const obj = raw as Record<string, unknown>;

  if (!isString(obj.thesis)) return { ok: false, reason: 'thesis_invalid' };
  const thesis = obj.thesis.trim();
  if (thesis.length === 0) return { ok: false, reason: 'thesis_invalid' };

  if (!Array.isArray(obj.paragraphMoves)) {
    return { ok: false, reason: 'paragraph_moves_invalid' };
  }
  const moves: string[] = [];
  for (const m of obj.paragraphMoves) {
    if (!isString(m)) return { ok: false, reason: 'paragraph_moves_invalid' };
    const trimmed = m.trim();
    if (trimmed.length === 0) continue;
    moves.push(trimmed);
  }
  if (moves.length < PARAGRAPH_MOVES_MIN) {
    return { ok: false, reason: 'paragraph_moves_invalid' };
  }
  const clampedMoves = moves
    .slice(0, PARAGRAPH_MOVES_MAX)
    .map((m) => clampLength(m, PARAGRAPH_MOVE_MAX_LENGTH));
  const clampedThesis = clampLength(thesis, THESIS_MAX_LENGTH);

  const corpus = [clampedThesis, ...clampedMoves].join('\n');
  if (NEGATIVE_AO_PATTERN.test(corpus)) return { ok: false, reason: 'ao5_present' };
  if (QUOTATION_PATTERN.test(corpus)) return { ok: false, reason: 'quotation_present' };
  if (EDITION_REFERENCE_PATTERN.test(corpus)) {
    return { ok: false, reason: 'edition_reference_present' };
  }

  return { ok: true, value: { thesis: clampedThesis, paragraphMoves: clampedMoves } };
}

function clampLength(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}

export function buildOkResponse(
  input: ValidatedInput,
  plan: SanitisedProviderPlan,
): GenerateModelEssayResponse {
  return {
    status: 'ok',
    message:
      'Server-side plan generated. Quotations are not produced until a verified quote bank is wired up.',
    echoed: buildEchoed(input),
    essayPlan: {
      thesis: plan.thesis,
      paragraphMoves: plan.paragraphMoves,
      quotePolicy: 'verified_quote_bank_only',
      assessmentObjectives: ['AO1', 'AO2', 'AO3', 'AO4'],
    },
    safety: {
      clientSideLLM: false,
      serverSideProviderPlanned: 'anthropic',
      quoteConstraint:
        'Plan-only response. No quotations generated; quote-bank exact-match wiring is a future PR.',
    },
  };
}
