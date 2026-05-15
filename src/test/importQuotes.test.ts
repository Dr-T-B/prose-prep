/**
 * Tests for the dry-run / write gate on scripts/importQuotes.ts
 *
 * Goal: prove that
 *   1. Dry-run mode never calls .insert / .update / .upsert / .delete
 *   2. Classification (would-insert / would-update / would-skip) is correct
 *   3. The write path is gated and unreachable without writeMode=true
 *   4. Invalid input (missing quote_text / text_name) yields a validation
 *      error in the summary, never a DB write or unhandled exception
 */

import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  parseArgs,
  validateQuote,
  classifyRows,
  toDbRow,
  upsertQuotes,
  formatDryRunSummary,
  type MergedQuote,
  type ClassifyResult,
} from '../../scripts/importQuotes';

// ---------------------------------------------------------------------------
// Mock Supabase client — every write method is a spy that fails the test if
// called. The read method returns a configurable existing-rows array.
// ---------------------------------------------------------------------------

function makeMockSupabase(existing: Array<{ id: string; source_text: string; quote_text: string }> = []) {
  const insertSpy = vi.fn(async () => ({ error: null }));
  const updateSpy = vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) }));
  const upsertSpy = vi.fn(async () => ({ error: null }));
  const deleteSpy = vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) }));
  const selectSpy = vi.fn(async () => ({ data: existing, error: null }));

  const client = {
    from: vi.fn(() => ({
      insert: insertSpy,
      update: updateSpy,
      upsert: upsertSpy,
      delete: deleteSpy,
      select: selectSpy,
    })),
  } as unknown as SupabaseClient;

  return { client, insertSpy, updateSpy, upsertSpy, deleteSpy, selectSpy };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function quote(overrides: Partial<MergedQuote> = {}): MergedQuote {
  return {
    text_name: 'Hard Times',
    quote_text: 'Now, what I want is, Facts.',
    b_mode_rank: 1,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('defaults to dry-run when --write is not present', () => {
    expect(parseArgs([])).toEqual({ write: false });
    expect(parseArgs(['scripts/importQuotes.ts'])).toEqual({ write: false });
    expect(parseArgs(['--verbose'])).toEqual({ write: false });
  });

  it('enables write mode only with --write', () => {
    expect(parseArgs(['--write'])).toEqual({ write: true });
    expect(parseArgs(['something', '--write', 'else'])).toEqual({ write: true });
  });
});

// ---------------------------------------------------------------------------
// validateQuote — invalid input fails safely
// ---------------------------------------------------------------------------

describe('validateQuote', () => {
  it('accepts a complete quote with no errors', () => {
    expect(validateQuote(quote())).toEqual([]);
  });

  it('flags missing quote_text', () => {
    const errs = validateQuote(quote({ quote_text: '' }), 'HT01');
    expect(errs).toHaveLength(1);
    expect(errs[0]).toMatchObject({ source: 'HT01', reason: expect.stringContaining('quote_text') });
  });

  it('flags whitespace-only quote_text', () => {
    const errs = validateQuote(quote({ quote_text: '   ' }), 'HT02');
    expect(errs.some((e) => e.reason.includes('quote_text'))).toBe(true);
  });

  it('flags a quote object missing quote_text entirely', () => {
    const partial: Partial<MergedQuote> = { text_name: 'Hard Times' };
    const errs = validateQuote(partial, 'HT03');
    expect(errs.some((e) => e.reason.includes('quote_text'))).toBe(true);
  });

  it('flags missing text_name', () => {
    const errs = validateQuote(quote({ text_name: '' }), 'AT01');
    expect(errs.some((e) => e.reason.includes('text_name'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// classifyRows — would-insert / would-update / would-skip
// ---------------------------------------------------------------------------

describe('classifyRows', () => {
  it('classifies all rows as inserts when DB is empty', () => {
    const rows = [
      toDbRow(quote({ b_mode_rank: 1, quote_text: 'A' })),
      toDbRow(quote({ b_mode_rank: 2, quote_text: 'B' })),
    ];
    const result = classifyRows(rows, []);
    expect(result.toInsert).toHaveLength(2);
    expect(result.toUpdate).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });

  it('classifies matching rows as updates', () => {
    const rows = [
      toDbRow(quote({ b_mode_rank: 1, quote_text: 'A' })),
      toDbRow(quote({ b_mode_rank: 2, quote_text: 'B' })),
    ];
    const existing = [
      { id: 'existing-id-1', source_text: 'Hard Times', quote_text: 'A' },
    ];
    const result = classifyRows(rows, existing);
    expect(result.toInsert).toHaveLength(1);
    expect(result.toInsert[0].quote_text).toBe('B');
    expect(result.toUpdate).toHaveLength(1);
    expect(result.toUpdate[0].id).toBe('existing-id-1');
    expect(result.skipped).toHaveLength(0);
  });

  it('skips within-batch duplicates (same source_text + quote_text)', () => {
    const rows = [
      toDbRow(quote({ b_mode_rank: 1, quote_text: 'dup' })),
      toDbRow(quote({ b_mode_rank: 2, quote_text: 'dup' })),
      toDbRow(quote({ b_mode_rank: 3, quote_text: 'unique' })),
    ];
    const result = classifyRows(rows, []);
    expect(result.toInsert).toHaveLength(2);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].reason).toMatch(/duplicate/i);
  });

  it('combines all three categories correctly', () => {
    const rows = [
      toDbRow(quote({ b_mode_rank: 1, quote_text: 'existing' })), // → update
      toDbRow(quote({ b_mode_rank: 2, quote_text: 'new' })),      // → insert
      toDbRow(quote({ b_mode_rank: 3, quote_text: 'new' })),      // → skip (dupe)
    ];
    const existing = [
      { id: 'x1', source_text: 'Hard Times', quote_text: 'existing' },
    ];
    const result = classifyRows(rows, existing);
    expect(result.toInsert).toHaveLength(1);
    expect(result.toUpdate).toHaveLength(1);
    expect(result.skipped).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Write gate — defence in depth
// ---------------------------------------------------------------------------

describe('upsertQuotes write gate', () => {
  const emptyClassified: ClassifyResult = { toInsert: [], toUpdate: [], skipped: [] };

  it('throws when called with writeMode=false (gate is enforced inside the function)', async () => {
    const { client, insertSpy, updateSpy, upsertSpy, deleteSpy } = makeMockSupabase();
    await expect(upsertQuotes(client, emptyClassified, false)).rejects.toThrow(/writeMode/i);
    expect(insertSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(upsertSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('performs inserts and updates when writeMode=true', async () => {
    const { client, insertSpy, updateSpy } = makeMockSupabase();
    const row1 = toDbRow(quote({ b_mode_rank: 1, quote_text: 'A' }));
    const row2 = toDbRow(quote({ b_mode_rank: 2, quote_text: 'B' }));
    const classified: ClassifyResult = {
      toInsert: [row1],
      toUpdate: [{ id: 'x1', row: row2 }],
      skipped: [],
    };
    const result = await upsertQuotes(client, classified, true);
    expect(insertSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ inserted: 1, updated: 1, errors: 0 });
  });
});

// ---------------------------------------------------------------------------
// End-to-end dry-run path: classification + summary, no writes
// ---------------------------------------------------------------------------

describe('dry-run end-to-end (no writes)', () => {
  it('produces a correct summary and never calls write methods', async () => {
    // Simulate what main() does, without env / files.
    const quotes: MergedQuote[] = [
      quote({ b_mode_rank: 1, quote_text: 'Existing quote' }),
      quote({ b_mode_rank: 2, quote_text: 'Brand new quote' }),
      quote({ b_mode_rank: 3, quote_text: 'Brand new quote' }),       // dupe
      quote({ b_mode_rank: 4, quote_text: '' }),                       // invalid
    ];

    const validationErrors = quotes.flatMap((q, i) => validateQuote(q, `quote-${i}`));
    const valid = quotes.filter((q) => validateQuote(q).length === 0);
    const rows = valid.map(toDbRow);

    const { client, insertSpy, updateSpy, upsertSpy, deleteSpy, selectSpy } = makeMockSupabase([
      { id: 'x1', source_text: 'Hard Times', quote_text: 'Existing quote' },
    ]);

    // Mimic the read fetch (.select on quote_methods)
    const { data: existing } = await client.from('quote_methods').select('id, source_text, quote_text');
    const classified = classifyRows(rows, existing as Array<{ id: string; source_text: string; quote_text: string }>);

    expect(classified.toInsert).toHaveLength(1);
    expect(classified.toUpdate).toHaveLength(1);
    expect(classified.skipped).toHaveLength(1);
    expect(validationErrors).toHaveLength(1);
    expect(validationErrors[0].reason).toMatch(/quote_text/);

    // The dry-run path NEVER touches write methods.
    expect(insertSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(upsertSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
    // Read is allowed.
    expect(selectSpy).toHaveBeenCalled();

    const summary = formatDryRunSummary({
      htMain: 4, htMeta: 0, atMain: 0, atMeta: 0,
      totalRows: quotes.length,
      classify: classified,
      validationErrors,
    });
    expect(summary).toContain('DRY RUN');
    expect(summary).toContain('Would insert:         1');
    expect(summary).toContain('Would update:         1');
    expect(summary).toContain('Would skip (dupes):   1');
    expect(summary).toContain('Validation errors:    1');
  });
});
