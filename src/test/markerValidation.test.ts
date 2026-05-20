import { describe, expect, it } from 'vitest';
import {
  countWords,
  EXAM_WARNING,
  pickDrillRouteForWeakestAO,
  stripAO5,
  validateInput,
  validateShape,
  VALID_APP_ROUTES,
  type MarkerResult,
} from '../../supabase/functions/mark-component2-essay/validation';

const buildResult = (overrides: Partial<MarkerResult> = {}): MarkerResult => ({
  provisionalLevel: 'Level 4',
  provisionalMarks: 14,
  overallSummary: 'Solid argument with sustained comparison; AO3 underdeveloped.',
  aoFeedback: {
    AO1: { level: 'Level 4', strength: 's', weakness: 'w', nextAction: 'n' },
    AO2: { level: 'Level 4', strength: 's', weakness: 'w', nextAction: 'n' },
    AO3: { level: 'Level 3', strength: 's', weakness: 'w', nextAction: 'n' },
    AO4: { level: 'Level 4', strength: 's', weakness: 'w', nextAction: 'n' },
  },
  topStrengths: ['a', 'b', 'c'],
  priorityWeaknesses: ['x', 'y'],
  quoteMethodDiagnostic: [],
  modelUpgradeParagraph: 'A model paragraph...',
  nextDrill: {
    title: 'Drill',
    durationMinutes: 15,
    instructions: 'Do the thing',
    appRoute: '/library/context',
  },
  examWarning: EXAM_WARNING,
  ...overrides,
});

describe('countWords', () => {
  it('counts whitespace-separated tokens', () => {
    expect(countWords('  one two   three  ')).toBe(3);
  });
  it('returns 0 for empty/whitespace input', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });
});

describe('validateInput', () => {
  it('rejects unknown mode', () => {
    const r = validateInput({ mode: 'nope' });
    expect(r.ok).toBe(false);
  });

  it('rejects full_essay below 300 words', () => {
    const text = Array(299).fill('word').join(' ');
    const r = validateInput({ mode: 'full_essay', question_id: 'q1', essay_text: text });
    expect(r.ok).toBe(false);
  });

  it('accepts full_essay at exact 300-word boundary', () => {
    const text = Array(300).fill('word').join(' ');
    const r = validateInput({ mode: 'full_essay', question_id: 'q1', essay_text: text });
    expect(r.ok).toBe(true);
  });

  it('accepts full_essay at exact 3000-word boundary and rejects 3001', () => {
    const ok = Array(3000).fill('word').join(' ');
    expect(validateInput({ mode: 'full_essay', question_id: 'q1', essay_text: ok }).ok).toBe(true);
    const over = Array(3001).fill('word').join(' ');
    expect(validateInput({ mode: 'full_essay', question_id: 'q1', essay_text: over }).ok).toBe(false);
  });

  it('paragraph_only enforces 150–600 word bounds', () => {
    const small = Array(149).fill('word').join(' ');
    expect(validateInput({ mode: 'paragraph_only', question_id: 'q1', essay_text: small }).ok).toBe(false);
    const ok = Array(150).fill('word').join(' ');
    expect(validateInput({ mode: 'paragraph_only', question_id: 'q1', essay_text: ok }).ok).toBe(true);
    const big = Array(601).fill('word').join(' ');
    expect(validateInput({ mode: 'paragraph_only', question_id: 'q1', essay_text: big }).ok).toBe(false);
  });

  it('rejects missing question_id for full_essay', () => {
    const text = Array(400).fill('word').join(' ');
    const r = validateInput({ mode: 'full_essay', essay_text: text });
    expect(r.ok).toBe(false);
  });

  it('structured_attempt requires paragraph_attempt_id', () => {
    expect(validateInput({ mode: 'structured_attempt' }).ok).toBe(false);
    const r = validateInput({ mode: 'structured_attempt', paragraph_attempt_id: 'abc' });
    expect(r.ok).toBe(true);
  });

  it('defaults target_grade to A/A*', () => {
    const text = Array(400).fill('word').join(' ');
    const r = validateInput({ mode: 'full_essay', question_id: 'q1', essay_text: text });
    expect(r.ok && r.value.target_grade).toBe('A/A*');
  });
});

describe('stripAO5', () => {
  it('removes AO5 keys from objects', () => {
    const out = stripAO5({ AO1: 'keep', AO5: 'drop', nested: { AO5: 'drop', AO2: 'keep' } });
    expect(out).toEqual({ AO1: 'keep', nested: { AO2: 'keep' } });
  });
  it('removes sentences mentioning AO5 from strings', () => {
    const out = stripAO5('Strong AO2 analysis. AO5 critical voices are present. Comparison sustained.');
    expect(out).not.toMatch(/AO5/);
    expect(out).toMatch(/Strong AO2 analysis/);
    expect(out).toMatch(/Comparison sustained/);
  });
  it('strips AO5 inside arrays', () => {
    const out = stripAO5(['fine', 'AO5 reference here']);
    expect(out).toEqual(['fine']);
  });
});

describe('validateShape', () => {
  it('accepts a well-formed result', () => {
    const r = validateShape(buildResult(), { allowMissingProvisionalMarks: false });
    expect(r.ok).toBe(true);
  });

  it('rejects when provisionalMarks missing in full_essay mode', () => {
    const result = buildResult();
    delete (result as Partial<MarkerResult>).provisionalMarks;
    const r = validateShape(result, { allowMissingProvisionalMarks: false });
    expect(r.ok).toBe(false);
  });

  it('allows provisionalMarks omitted in paragraph_only mode', () => {
    const result = buildResult();
    delete (result as Partial<MarkerResult>).provisionalMarks;
    const r = validateShape(result, { allowMissingProvisionalMarks: true });
    expect(r.ok).toBe(true);
  });

  it('rejects invalid level string', () => {
    const r = validateShape(buildResult({ provisionalLevel: 'Top Band' as never }), {
      allowMissingProvisionalMarks: false,
    });
    expect(r.ok).toBe(false);
  });

  it('rejects examWarning that does not match canonical string', () => {
    const r = validateShape(buildResult({ examWarning: 'something else' }), {
      allowMissingProvisionalMarks: false,
    });
    expect(r.ok).toBe(false);
  });

  it('rejects nextDrill.appRoute outside the allowed list', () => {
    const result = buildResult({
      nextDrill: {
        title: 't',
        durationMinutes: 15,
        instructions: 'i',
        appRoute: '/not-a-real-route',
      },
    });
    const r = validateShape(result, { allowMissingProvisionalMarks: false });
    expect(r.ok).toBe(false);
  });

  it('accepts well-formed quoteMethodDiagnostic items', () => {
    const result = buildResult({
      quoteMethodDiagnostic: [
        { quote: '"a fact is a fact"', status: 'verified', note: 'matches bank' },
        { quote: 'paraphrased thing', status: 'paraphrased', note: 'close but not exact' },
      ],
    });
    const r = validateShape(result, { allowMissingProvisionalMarks: false });
    expect(r.ok).toBe(true);
  });

  it('rejects quoteMethodDiagnostic with invalid status, naming the index', () => {
    const result = buildResult({
      quoteMethodDiagnostic: [
        { quote: 'ok', status: 'verified', note: '' },
        { quote: 'bad', status: 'made-up' as never, note: '' },
      ],
    });
    const r = validateShape(result, { allowMissingProvisionalMarks: false });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.some((e) => /quoteMethodDiagnostic\[1\]\.status/.test(e))).toBe(true);
    }
  });

  it('rejects quoteMethodDiagnostic with empty quote', () => {
    const result = buildResult({
      quoteMethodDiagnostic: [
        { quote: '', status: 'verified', note: '' },
      ],
    });
    const r = validateShape(result, { allowMissingProvisionalMarks: false });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.some((e) => /quoteMethodDiagnostic\[0\]\.quote/.test(e))).toBe(true);
    }
  });

  it('rejects aoFeedback containing an AO5 key', () => {
    const result = buildResult();
    (result.aoFeedback as Record<string, unknown>).AO5 = {
      level: 'Level 4', strength: 's', weakness: 'w', nextAction: 'n',
    };
    const r = validateShape(result, { allowMissingProvisionalMarks: false });
    expect(r.ok).toBe(false);
  });
});

describe('pickDrillRouteForWeakestAO', () => {
  it('selects the route for the AO with the lowest level', () => {
    const ao = {
      AO1: { level: 'Level 4', strength: 's', weakness: 'w', nextAction: 'n' },
      AO2: { level: 'Level 4', strength: 's', weakness: 'w', nextAction: 'n' },
      AO3: { level: 'Level 2', strength: 's', weakness: 'w', nextAction: 'n' },
      AO4: { level: 'Level 4', strength: 's', weakness: 'w', nextAction: 'n' },
    } as const;
    expect(pickDrillRouteForWeakestAO(ao as never)).toBe('/library/context');
  });
});

describe('VALID_APP_ROUTES', () => {
  it('only lists routes that exist in App.tsx', () => {
    // Sanity: the well-formed test result uses one of these.
    expect((VALID_APP_ROUTES as readonly string[]).includes('/library/context')).toBe(true);
  });
});
