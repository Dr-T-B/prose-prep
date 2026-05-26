// generate-model-essay
//
// Server-side foundation for the future ProseCompass model-essay generator.
// AO1-AO4 only; no additional assessment objective is included.
//
// PR B scope (this file):
//   - Establish the safe server-side boundary.
//   - Validate request shape and bounds.
//   - Return a controlled placeholder response.
//   - Do NOT call any paid LLM. Do NOT generate quotations.
//
// Future PRs will introduce live Anthropic-based generation behind this same
// endpoint, gated on a server-side quote-bank exact-match validator.

import { createClient } from 'npm:@supabase/supabase-js@2.95.0';
import { buildSystemPrompt, buildUserPrompt } from './prompt.ts';
import { callAnthropic, DEFAULT_ANTHROPIC_MODEL } from './provider.ts';
import {
  buildLimitedEvidenceResponse,
  buildOkResponse,
  buildSafeErrorBody,
  LIMITED_EVIDENCE_REASONS,
  sanitiseProviderPlan,
  validateInput,
} from './validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
      return json(401, { error: 'Missing or malformed Authorization header' });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json(401, { error: 'Invalid or expired JWT' });

    let parsed: unknown;
    try {
      parsed = await req.json();
    } catch {
      return json(400, { error: 'Body must be valid JSON' });
    }

    const validated = validateInput(parsed);
    if (!validated.ok) return json(validated.status, { error: validated.error });

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return json(
        200,
        buildLimitedEvidenceResponse(validated.value, LIMITED_EVIDENCE_REASONS.providerNotConfigured),
      );
    }
    const model = Deno.env.get('MODEL_PROVIDER_MODEL') ?? DEFAULT_ANTHROPIC_MODEL;

    const result = await callAnthropic({
      apiKey,
      model,
      system: buildSystemPrompt(),
      user: buildUserPrompt(validated.value),
    });

    if (!result.ok) {
      console.error('generate-model-essay provider failure', result.reason);
      return json(
        200,
        buildLimitedEvidenceResponse(validated.value, LIMITED_EVIDENCE_REASONS.providerUnavailable),
      );
    }

    const sanitised = sanitiseProviderPlan(result.json);
    if (!sanitised.ok) {
      console.error('generate-model-essay sanitiser rejected output', sanitised.reason);
      return json(
        200,
        buildLimitedEvidenceResponse(validated.value, LIMITED_EVIDENCE_REASONS.providerOutputInvalid),
      );
    }

    return json(200, buildOkResponse(validated.value, sanitised.value));
  } catch (err) {
    // PR D2 will introduce provider calls that can throw. Centralise the
    // failure envelope here so raw provider/stack details never reach the
    // client. Log server-side only.
    console.error('generate-model-essay unhandled error', err);
    return json(500, buildSafeErrorBody());
  }
});
