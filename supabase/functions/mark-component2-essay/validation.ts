// Pure helpers for the mark-component2-essay edge function.
// No Deno-specific imports - also consumed by Vitest tests in src/test/.

export type EssayMode = 'full_essay' | 'paragraph_only' | 'structured_attempt';

export type AOKey = 'AO1' | 'AO2' | 'AO3' | 'AO4';

export const AO_KEYS: AOKey[] = ['AO1', 'AO2', 'AO3', 'AO4'];

export const EXAM_WARNING =
  'Formative guidance only: use this as practice feedback, not an official assessment judgement.';

export type RawInput = {
  mode?: unknown;
  question_id?: unknown;
  question_stem?: unknown;
  essay_text?: unknown;
  paragraph_attempt_id?: unknown;
};

export type ValidatedInput =
  | {
      mode: 'full_essay' | 'paragraph_only';
      question_id?: string;
      question_stem?: string;
      essay_text: string;
      word_count: number;
    }
  | {
      mode: 'structured_attempt';
      paragraph_attempt_id: string;
    };

export type ValidationResult =
  | { ok: true; value: ValidatedInput }
  | { ok: false; error: string };

const FORBIDDEN_QUESTION_TEXT = [
  new RegExp('\\bAO' + '5\\b', 'i'),
  /\bAO\s*5\b/i,
  /\b(?:mark|marks|marked|marking)\b/i,
  /\b(?:score|scores|scored|scoring)\b/i,
  /\b(?:grade|graded|grading)\b/i,
  /\b(?:top[-\s]?band|band\s*[1-5]|upper\s+band|lower\s+band|bands?)\b/i,
  /\blevel\s*[1-5]?\b/i,
  /model\s+answer/i,
  /\brewrite\b/i,
  /rewritten\s+paragraph/i,
  /full\s+essay/i,
];

const PROMPT_CONTROL_QUESTION_TEXT = [
  /<\s*\/?\s*section\b/i,
  /<\s*\/?\s*(system|assistant|user|message|prompt)\b/i,
  /\b(?:system|developer|assistant|user)\s*:/i,
  /\b(?:ignore|override|disregard)\s+(?:the\s+)?(?:previous|above|earlier|system|developer)\s+(?:instructions?|rules?|prompt)\b/i,
  /\b(?:you are now|act as|pretend to be)\b/i,
  /\b(?:return|output|emit)\s+only\b/i,
  /```/,
];

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function extractSection(text: string, name: string): string | null {
  const re = new RegExp(
    `<section:${name}>([\\s\\S]*?)<\\/section:${name}>`,
    'i',
  );
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

export function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normaliseQuestionStem(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function optionalQuestionStem(value: unknown): { ok: true; value?: string } | { ok: false; error: string } {
  if (value === undefined || value === null || value === '') return { ok: true };
  if (typeof value !== 'string') return { ok: false, error: 'question_stem must be text' };
  const trimmed = normaliseQuestionStem(value);
  if (!trimmed) return { ok: true };
  if (trimmed.length > 500) return { ok: false, error: 'question_stem must be 500 characters or fewer' };
  if (FORBIDDEN_QUESTION_TEXT.some((pattern) => pattern.test(trimmed))) {
    return { ok: false, error: 'question_stem must be a formative Component 2 practice question' };
  }
  if (PROMPT_CONTROL_QUESTION_TEXT.some((pattern) => pattern.test(trimmed))) {
    return { ok: false, error: 'question_stem must be a formative Component 2 practice question' };
  }
  return { ok: true, value: trimmed };
}

export function validateInput(raw: RawInput): ValidationResult {
  const mode = raw.mode;
  if (mode !== 'full_essay' && mode !== 'paragraph_only' && mode !== 'structured_attempt') {
    return { ok: false, error: 'mode must be one of: full_essay, paragraph_only, structured_attempt' };
  }

  if (mode === 'structured_attempt') {
    if (typeof raw.paragraph_attempt_id !== 'string' || !raw.paragraph_attempt_id) {
      return { ok: false, error: 'paragraph_attempt_id is required for structured_attempt mode' };
    }
    return {
      ok: true,
      value: {
        mode,
        paragraph_attempt_id: raw.paragraph_attempt_id,
      },
    };
  }

  const questionId = typeof raw.question_id === 'string' && raw.question_id.trim()
    ? raw.question_id.trim()
    : undefined;
  const questionStem = optionalQuestionStem(raw.question_stem);
  if (!questionStem.ok) return questionStem;

  if (!questionId && !questionStem.value) {
    return { ok: false, error: 'question_id or question_stem is required' };
  }
  if (questionId && questionStem.value) {
    return { ok: false, error: 'Provide question_id or question_stem, not both' };
  }
  if (typeof raw.essay_text !== 'string' || !raw.essay_text.trim()) {
    return { ok: false, error: 'essay_text is required' };
  }

  const word_count = countWords(raw.essay_text);
  if (mode === 'full_essay') {
    if (word_count < 300 || word_count > 3000) {
      return { ok: false, error: `essay_text must be 300-3000 words (got ${word_count})` };
    }
  } else if (word_count < 150 || word_count > 600) {
    return { ok: false, error: `essay_text must be 150-600 words for paragraph_only (got ${word_count})` };
  }

  return {
    ok: true,
    value: {
      mode,
      ...(questionId ? { question_id: questionId } : {}),
      ...(questionStem.value ? { question_stem: questionStem.value } : {}),
      essay_text: raw.essay_text,
      word_count,
    },
  };
}

// Recursively strip AO-5 from any string field and remove any object key matching AO-5.
// Defence in depth: the system prompt forbids AO-5, but if the model leaks it we drop it
// before returning the response and before persisting.
export function stripAO5<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map(stripAO5)
      .filter((v) => v !== undefined && !(typeof v === 'string' && v.trim() === '')) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (/^ao[5]$/i.test(k)) continue;
      out[k] = stripAO5(v);
    }
    return out as unknown as T;
  }
  if (typeof value === 'string') {
    return value
      .replace(/(^|[.!?])\s*[^.!?]*\bAO5\b[^.!?]*([.!?]|$)/gi, '$1')
      .replace(/\bAO5\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim() as unknown as T;
  }
  return value;
}

export type AOFeedback = {
  diagnosticLabel: string;
  strength: string;
  nextStep: string;
};

export type QuoteDiagnostic = {
  quote: string;
  status: 'verified' | 'unverified' | 'paraphrased';
  note: string;
};

export type MarkerResult = {
  summary: string;
  aoFeedback: Record<AOKey, AOFeedback>;
  strengths: string[];
  priorityTargets: string[];
  quoteMethodDiagnostic: QuoteDiagnostic[];
  revisionPrompts: string[];
  nextStep: string;
  teacherNotes?: string;
  examWarning: string;
};

export type ShapeCheck = { ok: true; value: MarkerResult } | { ok: false; errors: string[] };

const REQUIRED_TOP_KEYS = [
  'summary',
  'aoFeedback',
  'strengths',
  'priorityTargets',
  'quoteMethodDiagnostic',
  'revisionPrompts',
  'nextStep',
  'examWarning',
];

const FORBIDDEN_STUDENT_OUTPUT_KEYS = [
  'provisionalLevel',
  'provisionalMarks',
  'level',
  'mark',
  'marks',
  'band',
  'bands',
  'topBand',
  'score',
  'scores',
  'grade',
  'modelUpgradeParagraph',
  'modelAnswer',
  'rewrittenParagraph',
  'fullEssay',
];

const FORBIDDEN_STUDENT_OUTPUT_TEXT = [
  /\b(?:mark|marks|marked|marking)\b/i,
  /\b(?:score|scores|scored|scoring)\b/i,
  /\b(?:grade|graded|grading)\b/i,
  /\b(?:top[-\s]?band|band\s*[1-5]|level\s*[1-5]\s+band|upper\s+band|lower\s+band|bands?)\b/i,
  /\blevel\s*[1-5]\b/i,
  /model\s+upgrade\s+paragraph/i,
  /model\s+answer/i,
  /\brewrite\b/i,
  /rewritten\s+paragraph/i,
  /full\s+essay/i,
  new RegExp('\\bAO' + '5\\b', 'i'),
];

function collectUnsafeText(value: unknown, path = 'result', errors: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectUnsafeText(entry, `${path}[${index}]`, errors));
    return errors;
  }
  if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (FORBIDDEN_STUDENT_OUTPUT_KEYS.some((forbidden) => forbidden.toLowerCase() === key.toLowerCase())) {
        errors.push(`${path}.${key} is not allowed in formative feedback output`);
      }
      if (new RegExp('^ao' + '5$', 'i').test(key)) {
        errors.push(`${path}.${key} is not allowed for Component 2`);
      }
      collectUnsafeText(entry, `${path}.${key}`, errors);
    }
    return errors;
  }
  if (typeof value === 'string') {
    for (const pattern of FORBIDDEN_STUDENT_OUTPUT_TEXT) {
      if (pattern.test(value)) {
        errors.push(`${path} contains disallowed student-facing wording`);
        break;
      }
    }
  }
  return errors;
}

export function validateShape(candidate: unknown): ShapeCheck {
  const errors: string[] = [];
  if (!candidate || typeof candidate !== 'object') {
    return { ok: false, errors: ['result is not an object'] };
  }
  const obj = candidate as Record<string, unknown>;

  for (const key of REQUIRED_TOP_KEYS) {
    if (!(key in obj)) errors.push(`missing key: ${key}`);
  }

  collectUnsafeText(obj, 'result', errors);

  if (typeof obj.summary !== 'string' || !obj.summary.trim()) errors.push('summary must be non-empty string');

  const ao = obj.aoFeedback;
  if (!ao || typeof ao !== 'object') {
    errors.push('aoFeedback must be an object');
  } else {
    for (const k of AO_KEYS) {
      const entry = (ao as Record<string, unknown>)[k];
      if (!entry || typeof entry !== 'object') {
        errors.push(`aoFeedback.${k} missing`);
        continue;
      }
      const e = entry as Record<string, unknown>;
      for (const f of ['diagnosticLabel', 'strength', 'nextStep']) {
        if (typeof e[f] !== 'string' || !(e[f] as string).trim()) {
          errors.push(`aoFeedback.${k}.${f} must be non-empty string`);
        }
      }
    }
    if (('AO' + '5') in (ao as Record<string, unknown>)) {
      errors.push('aoFeedback.AO' + '5 must not be present (Component 2 does not assess AO' + '5)');
    }
  }

  if (!Array.isArray(obj.strengths) || obj.strengths.length === 0) errors.push('strengths must be non-empty array');
  if (!Array.isArray(obj.priorityTargets) || obj.priorityTargets.length === 0) errors.push('priorityTargets must be non-empty array');
  if (!Array.isArray(obj.quoteMethodDiagnostic)) {
    errors.push('quoteMethodDiagnostic must be an array');
  } else {
    const allowedStatuses = ['verified', 'unverified', 'paraphrased'];
    (obj.quoteMethodDiagnostic as unknown[]).forEach((item, i) => {
      if (!item || typeof item !== 'object') {
        errors.push(`quoteMethodDiagnostic[${i}] must be an object`);
        return;
      }
      const it = item as Record<string, unknown>;
      if (typeof it.quote !== 'string' || !it.quote.trim()) {
        errors.push(`quoteMethodDiagnostic[${i}].quote must be a non-empty string`);
      }
      if (typeof it.status !== 'string' || !allowedStatuses.includes(it.status)) {
        errors.push(`quoteMethodDiagnostic[${i}].status must be one of: ${allowedStatuses.join(', ')}`);
      }
      if (typeof it.note !== 'string') {
        errors.push(`quoteMethodDiagnostic[${i}].note must be a string`);
      }
    });
  }

  if (!Array.isArray(obj.revisionPrompts) || obj.revisionPrompts.length === 0) errors.push('revisionPrompts must be non-empty array');
  if (typeof obj.nextStep !== 'string' || !obj.nextStep.trim()) errors.push('nextStep must be non-empty string');

  if ('teacherNotes' in obj && typeof obj.teacherNotes !== 'string') {
    errors.push('teacherNotes, if present, must be a string');
  }

  if (obj.examWarning !== EXAM_WARNING) {
    errors.push('examWarning must match the canonical string exactly');
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: candidate as MarkerResult };
}
