// Anthropic provider wrapper — server-only.
//
// Contract:
//   - Exactly one outbound HTTP request per call (MAX_PROVIDER_CALLS_PER_REQUEST).
//   - max_tokens bounded by MAX_OUTPUT_TOKENS.
//   - AbortController cancels the request after PROVIDER_TIMEOUT_MS.
//   - No retry loop.
//   - Returns typed result; raw HTTP body, stack traces, and provider names
//     never leak out of this module to the caller's response.
//
// The fetch implementation is injectable so Vitest tests can drive the
// success / http / timeout / parse paths without touching network or
// Deno-only globals.

import { MAX_OUTPUT_TOKENS, PROVIDER_TIMEOUT_MS } from './validation.ts';

export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
export const ANTHROPIC_API_VERSION = '2023-06-01';
export const DEFAULT_ANTHROPIC_MODEL = 'claude-haiku-4-5';

export type ProviderFailureReason =
  | 'http_error'
  | 'parse_error'
  | 'timeout'
  | 'empty_response';

export type ProviderResult =
  | { ok: true; json: unknown }
  | { ok: false; reason: ProviderFailureReason };

export type CallAnthropicOptions = {
  apiKey: string;
  model: string;
  system: string;
  user: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

export async function callAnthropic(opts: CallAnthropicOptions): Promise<ProviderResult> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.timeoutMs ?? PROVIDER_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetchImpl(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': opts.apiKey,
        'anthropic-version': ANTHROPIC_API_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: opts.system,
        messages: [{ role: 'user', content: opts.user }],
      }),
      signal: controller.signal,
    });
    if (!resp.ok) return { ok: false, reason: 'http_error' };

    let envelope: unknown;
    try {
      envelope = await resp.json();
    } catch {
      return { ok: false, reason: 'parse_error' };
    }

    const text = extractFirstTextBlock(envelope);
    if (text === null) return { ok: false, reason: 'empty_response' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      return { ok: false, reason: 'parse_error' };
    }
    return { ok: true, json: parsed };
  } catch (err) {
    if (isAbortError(err)) return { ok: false, reason: 'timeout' };
    return { ok: false, reason: 'http_error' };
  } finally {
    clearTimeout(timer);
  }
}

function extractFirstTextBlock(envelope: unknown): string | null {
  if (!envelope || typeof envelope !== 'object') return null;
  const content = (envelope as { content?: unknown }).content;
  if (!Array.isArray(content)) return null;
  for (const block of content) {
    if (
      block &&
      typeof block === 'object' &&
      (block as { type?: unknown }).type === 'text' &&
      typeof (block as { text?: unknown }).text === 'string'
    ) {
      return (block as { text: string }).text;
    }
  }
  return null;
}

function isAbortError(err: unknown): boolean {
  return Boolean(err) && typeof err === 'object' && (err as { name?: unknown }).name === 'AbortError';
}
