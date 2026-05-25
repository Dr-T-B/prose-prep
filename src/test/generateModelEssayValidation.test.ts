import { describe, expect, it } from 'vitest';
import {
  buildLimitedEvidenceResponse,
  buildPlaceholderResponse,
  buildSafeErrorBody,
  MAX_OUTPUT_TOKENS,
  MAX_PROVIDER_CALLS_PER_REQUEST,
  PROVIDER_TIMEOUT_MS,
  QUESTION_TEXT_MAX,
  QUESTION_TEXT_MIN,
  SAFE_GENERATOR_ERROR_MESSAGE,
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

describe('generate-model-essay buildLimitedEvidenceResponse', () => {
  it('returns the same outer contract as the placeholder, with limited_evidence status', () => {
    const r = validateInput({ questionText: validQuestion, theme: 'memory' });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const payload = buildLimitedEvidenceResponse(r.value, 'no verified quotes for theme=memory');
    expect(payload.status).toBe('limited_evidence');
    expect(payload.echoed.theme).toBe('memory');
    expect(payload.essayPlan.assessmentObjectives).toEqual(['AO1', 'AO2', 'AO3', 'AO4']);
    expect(payload.essayPlan.quotePolicy).toBe('verified_quote_bank_only');
    expect(payload.safety.clientSideLLM).toBe(false);
    expect(payload.safety.quoteConstraint).toMatch(/Limited evidence/);
    expect(payload.safety.quoteConstraint).toMatch(/No generated quotations/);
    expect(JSON.stringify(payload)).not.toMatch(/AO5/);
  });

  it('shares the response shape with the placeholder builder', () => {
    const r = validateInput({ questionText: validQuestion });
    if (!r.ok) throw new Error('precondition failed');
    const a = buildPlaceholderResponse(r.value);
    const b = buildLimitedEvidenceResponse(r.value, 'sparse bank');
    expect(Object.keys(a).sort()).toEqual(Object.keys(b).sort());
    expect(Object.keys(a.essayPlan).sort()).toEqual(Object.keys(b.essayPlan).sort());
    expect(Object.keys(a.safety).sort()).toEqual(Object.keys(b.safety).sort());
    expect(Object.keys(a.echoed).sort()).toEqual(Object.keys(b.echoed).sort());
  });
});

describe('generate-model-essay safe error body', () => {
  it('returns a generic message with no provider name or stack detail', () => {
    const body = buildSafeErrorBody();
    expect(body.error).toBe(SAFE_GENERATOR_ERROR_MESSAGE);
    expect(body.error).not.toMatch(/anthropic|openai|gemini|stack|undefined|TypeError/i);
  });
});

describe('generate-model-essay server-side budget constants', () => {
  it('enforces one provider call per request and a bounded output size', () => {
    expect(MAX_PROVIDER_CALLS_PER_REQUEST).toBe(1);
    expect(MAX_OUTPUT_TOKENS).toBeGreaterThan(0);
    expect(MAX_OUTPUT_TOKENS).toBeLessThanOrEqual(4000);
    expect(PROVIDER_TIMEOUT_MS).toBeGreaterThan(0);
    expect(PROVIDER_TIMEOUT_MS).toBeLessThanOrEqual(60_000);
  });
});
