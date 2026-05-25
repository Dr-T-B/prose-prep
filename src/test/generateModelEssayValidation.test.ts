import { describe, expect, it } from 'vitest';
import {
  buildPlaceholderResponse,
  QUESTION_TEXT_MAX,
  QUESTION_TEXT_MIN,
  validateInput,
} from '../../supabase/functions/generate-model-essay/validation';

const validQuestion = 'Compare how the writers present power across both texts.';

describe('generate-model-essay validateInput', () => {
  it('rejects non-object body', () => {
    const r = validateInput('nope');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it('rejects missing questionText', () => {
    const r = validateInput({});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/questionText/);
  });

  it('rejects too-short questionText', () => {
    const r = validateInput({ questionText: 'short' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(new RegExp(`${QUESTION_TEXT_MIN}`));
  });

  it('rejects too-long questionText', () => {
    const r = validateInput({ questionText: 'a'.repeat(QUESTION_TEXT_MAX + 1) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(new RegExp(`${QUESTION_TEXT_MAX}`));
  });

  it('rejects unknown targetLevel', () => {
    const r = validateInput({ questionText: validQuestion, targetLevel: 'L7' });
    expect(r.ok).toBe(false);
  });

  it('accepts a well-formed body and normalises optional fields', () => {
    const r = validateInput({
      questionText: validQuestion,
      theme: '  power  ',
      thesisAxis: '',
      targetLevel: 'L5',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.questionText).toBe(validQuestion);
      expect(r.value.theme).toBe('power');
      expect(r.value.thesisAxis).toBeNull();
      expect(r.value.targetLevel).toBe('L5');
    }
  });
});

describe('generate-model-essay buildPlaceholderResponse', () => {
  it('returns a placeholder payload with AO1–AO4 only and client-side LLM disabled', () => {
    const r = validateInput({ questionText: validQuestion, targetLevel: 'L4' });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const payload = buildPlaceholderResponse(r.value);
    expect(payload.status).toBe('placeholder');
    expect(payload.safety.clientSideLLM).toBe(false);
    expect(payload.safety.serverSideProviderPlanned).toBe('anthropic');
    expect(payload.essayPlan.assessmentObjectives).toEqual(['AO1', 'AO2', 'AO3', 'AO4']);
    expect(payload.essayPlan.quotePolicy).toBe('verified_quote_bank_only');
    expect(JSON.stringify(payload)).not.toMatch(/AO5/);
  });
});
