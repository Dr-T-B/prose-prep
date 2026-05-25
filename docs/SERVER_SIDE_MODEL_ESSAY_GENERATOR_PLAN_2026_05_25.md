# Server-Side Model Essay Generator — Foundation Plan (2026-05-25)

This document records the architectural decision and PR sequence for moving
model-essay generation from a client-side LLM call to a Supabase Edge
Function. It is the design context for PR B (the foundation) and the
prerequisite for any later recovery of `ProseCompass.tsx`.

## 1. Why the rescue `essayGenerationService.ts` must not be merged

Per the 2026-05-25 audit ([AUDIT_REPORT_2026_05_25.md](AUDIT_REPORT_2026_05_25.md))
and rescue review ([RESCUE_BRANCH_REVIEW_2026_05_25.md](RESCUE_BRANCH_REVIEW_2026_05_25.md)),
the rescue copy of `src/services/essayGenerationService.ts`:

- imports `GoogleGenAI` from `@google/genai`,
- reads `import.meta.env.VITE_GEMINI_API_KEY`,
- falls back to `process.env.GEMINI_API_KEY`,
- instantiates the Gemini client in browser code, and
- is paired with `src/pages/ProseCompass.tsx` guidance instructing students
  to put a Gemini key in `.env.local`.

Any of those alone is a hard blocker. A `VITE_`-prefixed key is shipped into
the browser bundle by Vite at build time, so the key cannot be kept secret on
the client. The rescue file is therefore classified critical-quarantine and
cannot be recovered without a full rewrite against a server-side boundary.

## 2. Why generation must move server-side

- Provider keys (Anthropic, Gemini, anything paid) must live only on the
  server. Vite cannot hide a `VITE_*` env var.
- Quote-bank validation must happen against authoritative DB rows, not
  whatever the client claims. That means the quote bank, the validator, and
  the final response shape all need to be assembled on the server.
- Rate limiting and abuse controls already live in Supabase Edge Functions
  (see `mark-component2-essay`); adding the generator alongside them keeps
  one trust boundary.
- AO1–AO4 enforcement is easier to guarantee server-side. AO5 is excluded
  from this product surface by an explicit `stripAO5` style pass.

## 3. Intended future architecture

```
ProseCompass UI (browser)
        │  supabase.functions.invoke('generate-model-essay', { body })
        ▼
Supabase Edge Function: generate-model-essay (Deno)
        │  JWT-validated, CORS-gated, rate-limited
        ├── input validation (validation.ts)
        ├── quote-bank load (server-side, exact-match validated)
        ├── Anthropic call (server-side key)
        └── response shape: thesis + paragraph moves + verified quotes only
```

Hard rules carried into every PR in this track:

- No `VITE_GEMINI_API_KEY`, no `@google/genai` in `src/`.
- No `GoogleGenAI` instantiation in browser code.
- AO1, AO2, AO3, AO4 only — never AO5.
- Generated quotations must be exact-match validated against the quote bank.
  Unverified quotations are blocked or explicitly marked.

## 4. Current PR scope (PR B — this PR)

- Add `supabase/functions/generate-model-essay/` with:
  - `index.ts` — JWT-checked, CORS-handled placeholder endpoint.
  - `validation.ts` — pure request validators and response builder.
- Add Vitest coverage at `src/test/generateModelEssayValidation.test.ts`.
- Add `scripts/check-no-client-llm-secrets.mjs` and the
  `check:no-client-llm` npm script. Scans `src/` and `package.json` for
  forbidden Gemini/client-LLM patterns and exits non-zero on hit.
- Remove the orphan `@google/genai` dependency from `package.json` (no
  tracked source imports it after PR #19).
- Soften the historical comment in `src/services/llmFeedbackService.ts` so
  the scanner does not need a per-line allowlist.

PR B explicitly does **not**:

- recover `ProseCompass.tsx` or `essayGenerationService.ts`;
- make any live LLM call;
- require a real API key in CI or local dev;
- apply any Supabase migration;
- alter `mark-component2-essay` scoring or schema.

## 5. Future PR C — ProseCompass UI recovery

PR C will:

- recover `ProseCompass.tsx` as a rewritten UI that calls
  `supabase.functions.invoke('generate-model-essay', …)`;
- remove every `.env.local` Gemini-key instruction from documentation and UI
  copy;
- replace the placeholder response wiring with the real Anthropic-backed
  generator;
- introduce the quote-bank exact-match validator and the rejection path for
  unverified quotations;
- add e2e coverage of the new flow.

Until PR C lands, the placeholder response defined in `validation.ts`
documents the contract the frontend will rely on, so the UI work can begin
against a stable shape.
