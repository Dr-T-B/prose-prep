// Pure helpers for the mark-component2-essay edge function.
// No Deno-specific imports — also consumed by Vitest tests in src/test/.

export type EssayMode = 'full_essay' | 'paragraph_only' | 'structured_attempt';

export type AOKey = 'AO1' | 'AO2' | 'AO3' | 'AO4';

export type LevelLabel = 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5';

export const AO_KEYS: AOKey[] = ['AO1', 'AO2', 'AO3', 'AO4'];

export const VALID_LEVELS: LevelLabel[] = [
  'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5',
];

export const EXAM_WARNING =
  'This is diagnostic guidance only and does not constitute an official Pearson Edexcel mark or grade.';

export const VALID_APP_ROUTES = [
  '/builder',
  '/paragraph-builder',
  '/paragraph-engine',
  '/drill',
  '/flex',
  '/library/context',
  '/library/quote-bank',
  '/library/quotes',
  '/library/glossary',
  '/library/stems',
  '/library/thesis',
  '/compare',
  '/matrix',
  '/routes',
  '/theme-wheel',
] as const;

export type RawInput = {
  mode?: unknown;
  question_id?: unknown;
  essay_text?: unknown;
  target_grade?: unknown;
  paragraph_attempt_id?: unknown;
};

export type ValidatedInput =
  | {
      mode: 'full_essay';
      question_id: string;
      essay_text: string;
      word_count: number;
      target_grade: string;
    }
  | {
      mode: 'paragraph_only';
      question_id: string;
      essay_text: string;
      word_count: number;
      target_grade: string;
    }
  | {
      mode: 'structured_attempt';
      paragraph_attempt_id: string;
      target_grade: string;
    };

export type ValidationResult =
  | { ok: true; value: ValidatedInput }
  | { ok: false; error: string };

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function validateInput(raw: RawInput): ValidationResult {
  const mode = raw.mode;
  if (mode !== 'full_essay' && mode !== 'paragraph_only' && mode !== 'structured_attempt') {
    return { ok: false, error: 'mode must be one of: full_essay, paragraph_only, structured_attempt' };
  }

  const target_grade = typeof raw.target_grade === 'string' && raw.target_grade.trim()
    ? raw.target_grade
    : 'A/A*';

  if (mode === 'structured_attempt') {
    if (typeof raw.paragraph_attempt_id !== 'string' || !raw.paragraph_attempt_id) {
      return { ok: false, error: 'paragraph_attempt_id is required for structured_attempt mode' };
    }
    return {
      ok: true,
      value: {
        mode,
        paragraph_attempt_id: raw.paragraph_attempt_id,
        target_grade,
      },
    };
  }

  if (typeof raw.question_id !== 'string' || !raw.question_id) {
    return { ok: false, error: 'question_id is required' };
  }
  if (typeof raw.essay_text !== 'string' || !raw.essay_text.trim()) {
    return { ok: false, error: 'essay_text is required' };
  }
  const word_count = countWords(raw.essay_text);
  if (mode === 'full_essay') {
    if (word_count < 300 || word_count > 3000) {
      return { ok: false, error: `essay_text must be 300–3000 words (got ${word_count})` };
    }
  } else {
    if (word_count < 150 || word_count > 600) {
      return { ok: false, error: `essay_text must be 150–600 words for paragraph_only (got ${word_count})` };
    }
  }
  return {
    ok: true,
    value: {
      mode,
      question_id: raw.question_id,
      essay_text: raw.essay_text,
      word_count,
      target_grade,
    },
  };
}

export const LEVEL_TO_MARKS: Record<LevelLabel, number> = {
  'Level 1': 3,
  'Level 2': 7,
  'Level 3': 11,
  'Level 4': 15,
  'Level 5': 19,
};

export const LEVEL_TO_READINESS_SCORE: Record<LevelLabel, number> = {
  'Level 1': 20,
  'Level 2': 40,
  'Level 3': 60,
  'Level 4': 80,
  'Level 5': 95,
};

export function isLevelLabel(value: unknown): value is LevelLabel {
  return typeof value === 'string' && (VALID_LEVELS as string[]).includes(value);
}

// Recursively strip AO5 from any string field and remove any object key matching AO5.
// Defence in depth: the system prompt forbids AO5, but if the model leaks it we drop it
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
      if (/^ao5$/i.test(k)) continue;
      out[k] = stripAO5(v);
    }
    return out as unknown as T;
  }
  if (typeof value === 'string') {
    // Remove sentences/clauses that mention AO5.
    return value
      .replace(/(^|[.!?])\s*[^.!?]*\bAO5\b[^.!?]*([.!?]|$)/gi, '$1')
      .replace(/\bAO5\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim() as unknown as T;
  }
  return value;
}

export type AOFeedback = {
  level: LevelLabel;
  strength: string;
  weakness: string;
  nextAction: string;
};

export type QuoteDiagnostic = {
  quote: string;
  status: 'verified' | 'unverified' | 'paraphrased';
  note: string;
};

export type NextDrill = {
  title: string;
  durationMinutes: number;
  instructions: string;
  appRoute: string;
};

export type MarkerResult = {
  provisionalLevel: LevelLabel;
  provisionalMarks?: number;
  overallSummary: string;
  aoFeedback: Record<AOKey, AOFeedback>;
  topStrengths: string[];
  priorityWeaknesses: string[];
  quoteMethodDiagnostic: QuoteDiagnostic[];
  modelUpgradeParagraph: string;
  nextDrill: NextDrill;
  examWarning: string;
};

export type ShapeCheck = { ok: true; value: MarkerResult } | { ok: false; errors: string[] };

const REQUIRED_TOP_KEYS = [
  'provisionalLevel',
  'overallSummary',
  'aoFeedback',
  'topStrengths',
  'priorityWeaknesses',
  'quoteMethodDiagnostic',
  'modelUpgradeParagraph',
  'nextDrill',
  'examWarning',
];

export function validateShape(
  candidate: unknown,
  opts: { allowMissingProvisionalMarks: boolean },
): ShapeCheck {
  const errors: string[] = [];
  if (!candidate || typeof candidate !== 'object') {
    return { ok: false, errors: ['result is not an object'] };
  }
  const obj = candidate as Record<string, unknown>;

  for (const key of REQUIRED_TOP_KEYS) {
    if (!(key in obj)) errors.push(`missing key: ${key}`);
  }

  if (!opts.allowMissingProvisionalMarks) {
    if (typeof obj.provisionalMarks !== 'number') {
      errors.push('provisionalMarks must be a number');
    } else if (obj.provisionalMarks < 1 || obj.provisionalMarks > 20) {
      errors.push('provisionalMarks must be between 1 and 20');
    }
  } else if ('provisionalMarks' in obj && obj.provisionalMarks !== undefined && typeof obj.provisionalMarks !== 'number') {
    errors.push('provisionalMarks, if present, must be a number');
  }

  if (!isLevelLabel(obj.provisionalLevel)) errors.push('provisionalLevel must be Level 1..5');
  if (typeof obj.overallSummary !== 'string' || !obj.overallSummary.trim()) errors.push('overallSummary must be non-empty string');

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
      if (!isLevelLabel(e.level)) errors.push(`aoFeedback.${k}.level invalid`);
      for (const f of ['strength', 'weakness', 'nextAction']) {
        if (typeof e[f] !== 'string' || !(e[f] as string).trim()) {
          errors.push(`aoFeedback.${k}.${f} must be non-empty string`);
        }
      }
    }
    // Reject AO5 leaks at the shape-validation boundary.
    if ('AO5' in (ao as Record<string, unknown>)) {
      errors.push('aoFeedback.AO5 must not be present (Component 2 does not assess AO5)');
    }
  }

  if (!Array.isArray(obj.topStrengths) || obj.topStrengths.length === 0) errors.push('topStrengths must be non-empty array');
  if (!Array.isArray(obj.priorityWeaknesses) || obj.priorityWeaknesses.length === 0) errors.push('priorityWeaknesses must be non-empty array');
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

  if (typeof obj.modelUpgradeParagraph !== 'string' || !obj.modelUpgradeParagraph.trim()) {
    errors.push('modelUpgradeParagraph must be non-empty string');
  }

  const nd = obj.nextDrill as Record<string, unknown> | undefined;
  if (!nd || typeof nd !== 'object') {
    errors.push('nextDrill must be an object');
  } else {
    if (typeof nd.title !== 'string' || !nd.title.trim()) errors.push('nextDrill.title required');
    if (typeof nd.durationMinutes !== 'number') errors.push('nextDrill.durationMinutes required');
    if (typeof nd.instructions !== 'string' || !nd.instructions.trim()) errors.push('nextDrill.instructions required');
    if (typeof nd.appRoute !== 'string' || !(VALID_APP_ROUTES as readonly string[]).includes(nd.appRoute)) {
      errors.push(`nextDrill.appRoute must be one of: ${VALID_APP_ROUTES.join(', ')}`);
    }
  }

  if (obj.examWarning !== EXAM_WARNING) {
    errors.push('examWarning must match the canonical string exactly');
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: candidate as MarkerResult };
}

// Map the weakest AO (by lowest level) to the best drill route.
export function pickDrillRouteForWeakestAO(ao: Record<AOKey, AOFeedback>): string {
  const levelRank: Record<LevelLabel, number> = {
    'Level 1': 1, 'Level 2': 2, 'Level 3': 3, 'Level 4': 4, 'Level 5': 5,
  };
  let weakest: AOKey = 'AO1';
  let weakestRank = 6;
  for (const k of AO_KEYS) {
    const r = levelRank[ao[k].level];
    if (r < weakestRank) {
      weakestRank = r;
      weakest = k;
    }
  }
  return DRILL_ROUTE_BY_AO[weakest];
}

export const DRILL_ROUTE_BY_AO: Record<AOKey, string> = {
  AO1: '/paragraph-builder',
  AO2: '/flex',
  AO3: '/library/context',
  AO4: '/compare',
};
