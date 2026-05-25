# PR C — ProseCompass Safe Recovery (Claude Code Prompt) — 2026-05-25

Paste the section below into a fresh Claude Code session, working in
`Dr-T-B/prose-prep` against `main` (post-merge of PR #19 → #21). The prompt
is self-contained; do not assume context from this conversation.

---

## Prompt

You are working in `Dr-T-B/prose-prep` on a new branch off `main`.

**Branch name:** `feat/prose-compass-server-side-ui`
**Goal of this PR (PR C):** introduce a `ProseCompass` page in the React app
that calls the existing `generate-model-essay` Supabase edge function and
renders the placeholder response. No client-side LLM, no Gemini, no `.env.local`,
no AO5.

This is a **UI-only** PR. The server-side edge function already exists from
PR #21 and currently returns a controlled placeholder response. Live model
generation will land in a later PR — `ProseCompass` must be built against the
placeholder contract that exists today.

---

### Required reading before any edits

Read and internalise these files exactly as they exist on `main`. Do not
infer their contents from prior conversations — open each one:

1. `supabase/functions/generate-model-essay/index.ts` — auth, CORS, dispatch.
2. `supabase/functions/generate-model-essay/validation.ts` — request schema,
   response shape (`PlaceholderResponse`), and exported constants
   (`QUESTION_TEXT_MIN`, `QUESTION_TEXT_MAX`, `SHORT_FIELD_MAX`,
   `VALID_TARGET_LEVELS`).
3. `src/test/generateModelEssayValidation.test.ts` — the existing Vitest
   pattern for this function.
4. `src/pages/EssayMarker.tsx` lines ~1070–1130 — the canonical
   `fetch(\`${VITE_SUPABASE_URL}/functions/v1/<fn>\`, …)` call pattern used
   elsewhere in this codebase (Bearer JWT from `supabase.auth.getSession()`).
5. `src/App.tsx` — current route table.
6. `src/components/AppShell.tsx` — current nav table.
7. `scripts/check-no-client-llm-secrets.mjs` — the forbidden-pattern scanner
   that gates this PR.
8. `docs/RESCUE_BRANCH_REVIEW_2026_05_25.md` — explains what must NOT be
   recovered from the rescue branch.

After reading, confirm in writing (in your response to me) the following
three facts before editing anything:

- The edge function currently returns `{ status: 'placeholder', message, echoed, essayPlan, safety }` — no `essay` field, no quotations.
- The protected layout in `src/App.tsx` is wrapped by
  `<ProtectedRoute allowAnonymous><AppShell /></ProtectedRoute>` and the root
  route `/` is currently `<Dashboard />`.
- `src/services/essayGenerationService.ts` does **not** exist on `main` and
  must remain absent.

If any of those three facts are not true, stop and report — do not improvise.

---

### Hard constraints (non-negotiable)

1. **Do not** create or recover `src/services/essayGenerationService.ts`.
2. **Do not** add `@google/genai`, any Gemini SDK, or any LLM SDK to
   `package.json`. The UI calls the edge function over `fetch` only.
3. **Do not** read or reference `VITE_GEMINI_API_KEY`, `GEMINI_API_KEY`,
   `GoogleGenAI`, `@google/genai`, or `.env.local` in any source file,
   comment, JSX copy, error string, placeholder text, or tooltip.
4. **Do not** mention "Gemini", "Google", "AO5", or "Assessment Objective 5"
   in any user-facing string in the new component. The endpoint advertises
   AO1–AO4 only.
5. **Do not** move the root `/` route. `Dashboard` stays at `/`.
   `LandingPage.tsx` is out of scope for this PR — do not create it,
   do not recover it, do not link to it.
6. **Do not** recover the rescue-branch `ProseCompass.tsx` wholesale. Read
   it for reference only if helpful (`git show
   origin/rescue/local-phase-3-4-and-prosecompass:src/pages/ProseCompass.tsx`),
   then **write a fresh component** matching this PR's contract. The rescue
   file contains unsafe copy and an unsafe service import.
7. **Do not** broaden or weaken `scripts/check-no-client-llm-secrets.mjs`.
   It is the contract.
8. **Do not** use a project-wide grep for `AO5` as a verification step.
   `AO5` appears legitimately in defensive comments, server-side scope notes,
   migration filenames, and audit docs across the repo. Use the targeted
   checks listed in the Verification section instead.

---

### Scope of changes

Create or edit only these files. Anything else, stop and ask.

**Create**

- `src/pages/ProseCompass.tsx` — new page component (described below).

**Edit**

- `src/App.tsx` — add one import and one `<Route path="/compass" element={<ProseCompass />} />` inside the existing protected `<AppShell />` group. Do not touch any other route. Do not change `/`.
- `src/components/AppShell.tsx` — add one entry `{ to: "/compass", label: "Prose Compass" }` to the `STUDENT_NAV` array, placed adjacent to `/builder` so it sits with the generation-style tools. Do not change ordering of any other entry.

**Optional (only if it fits the existing pattern — see Tests section)**

- `src/pages/ProseCompass.test.tsx` — Vitest + React Testing Library, mirroring `src/pages/AnnotatedEssayPack.test.tsx` / `Dashboard.test.tsx` only if those exist and use a setup that the new test can re-use without new infrastructure.

No other files. No `package.json` changes. No new dependencies. No new env
vars. No new edge functions. No schema or seed edits.

---

### `ProseCompass.tsx` contract

The component renders a single screen that:

1. Lets a signed-in student submit `{ questionText, theme?, thesisAxis?, targetLevel? }` to the existing edge function and shows the returned `PlaceholderResponse`.

2. **Form fields**, all controlled React state:
   - `questionText` — required `<textarea>`. Client-side validate against the constants exported by `supabase/functions/generate-model-essay/validation.ts`: `QUESTION_TEXT_MIN` and `QUESTION_TEXT_MAX`. Import the constants from the function module the same way `src/test/generateModelEssayValidation.test.ts` does (`'../../supabase/functions/generate-model-essay/validation'`) so the bounds cannot drift. Disable submit when the trimmed length is outside the bounds.
   - `theme` — optional `<input>`, capped client-side at `SHORT_FIELD_MAX`.
   - `thesisAxis` — optional `<input>`, capped client-side at `SHORT_FIELD_MAX`.
   - `targetLevel` — optional `<select>` over `VALID_TARGET_LEVELS` (`'L4' | 'L5'`) plus an empty "Not specified" option.

3. **Submit handler** must:
   - Read the current session via `supabase.auth.getSession()` (use the same `supabase` client import path that `EssayMarker.tsx` uses).
   - If there is no JWT, transition into the unauthenticated state (see below) — do not call the function.
   - Build the URL as `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-model-essay` (mirror `EssayMarker.tsx`).
   - `POST` JSON with `Authorization: Bearer <jwt>` and `Content-Type: application/json`.
   - On non-2xx, surface the server's `{ error }` string if present; otherwise a generic mapped message based on status code.
   - On 2xx, parse the JSON and store it as the latest `PlaceholderResponse`. Type the parsed response using the `PlaceholderResponse` type re-exported from the validation module (do not re-declare the shape).

4. **Four required render states**, each visibly distinct:
   - **Unauthenticated** — when `useAuth()` resolves with no user. Render a friendly notice with a `<NavLink to="/auth">` and no form. Do not attempt to submit.
   - **Loading** — while the fetch is in flight. Disable the submit button, show a spinner or "Generating plan…" indicator. Do not show stale results.
   - **Error** — when the fetch fails or the server returns a non-2xx. Show the error message in an accessible region (`role="alert"`). Keep the form usable so the student can retry.
   - **Placeholder** — when the response arrives. Render `essayPlan.thesis`, the `essayPlan.paragraphMoves` list, the `essayPlan.assessmentObjectives` row, and the `safety.quoteConstraint` line. Include a calm explanatory caption ("Live generation is not yet wired — this is a structured plan from the server.") drawn from the response's own copy where possible. Do **not** invent quotations. Do **not** render a `safety.serverSideProviderPlanned` field's raw value in user-visible copy — show a neutral phrasing like "Server-side generation" instead.

5. **Forbidden copy** (the scanner won't catch these but they break constraints 3–4):
   - No "Gemini", no "Google", no "GoogleGenAI".
   - No `.env.local`, no `VITE_GEMINI_API_KEY`, no `GEMINI_API_KEY`.
   - No "AO5" or "Assessment Objective 5".
   - No instruction to the student to provide a key, set a variable, or configure anything outside the form.

6. **Component shape**: a single default-exported React function component, no class, no service-class indirection, no separate `essayGenerationService.ts`. The `fetch` call lives inside the component (or a colocated hook in the same file) — same scope discipline as `EssayMarker.tsx`.

---

### Tests

Add a test file only if **both** of these hold:

- A peer page-level test already exists with a runnable setup (look at
  `src/pages/AnnotatedEssayPack.test.tsx`, `src/pages/Dashboard.test.tsx`,
  `src/pages/Phase3Dashboard.test.tsx`) — confirm by opening one and reading
  its imports / mocks.
- You can mirror that setup with **no new** test infrastructure, no new
  mock helpers, no new fixtures, no changes to `src/test/setup.ts`, and no
  new dev dependencies.

If both hold, add `src/pages/ProseCompass.test.tsx` covering:
- Renders the unauthenticated notice when `useAuth` returns no user.
- Disables submit when `questionText` is below `QUESTION_TEXT_MIN`.
- On a mocked 200, renders the `essayPlan.thesis` and the paragraph-moves list.
- On a mocked 401, renders the error region.

If either condition fails, **do not add the test**. Instead, document the
decision inline in the PR body under "Tests skipped because:" with one
sentence naming the missing prerequisite. Manual verification (see below)
is then mandatory.

Do **not** add tests for the edge function in this PR — those exist already
in `src/test/generateModelEssayValidation.test.ts`.

---

### Verification (must all pass before opening the PR)

Run from the repo root:

```bash
npm run check:no-client-llm
npm run lint
npm run test
npm run typecheck
npm run build
```

Then run **targeted** source greps (not a wide AO5 sweep):

```bash
# 1. The new page must contain no forbidden tokens (none of these should match).
git grep -nE 'Gemini|GoogleGenAI|@google/genai|VITE_GEMINI_API_KEY|GEMINI_API_KEY|\.env\.local|AO5|Assessment Objective 5' \
  -- src/pages/ProseCompass.tsx

# 2. The page must call the edge function URL, not a local service.
git grep -nE 'functions/v1/generate-model-essay' -- src/pages/ProseCompass.tsx

# 3. The forbidden service file must remain absent.
test ! -f src/services/essayGenerationService.ts && echo OK

# 4. package.json must not declare @google/genai or any Gemini package.
git grep -nE '"@google/genai"|gemini' -- package.json || echo "OK: no gemini deps"
```

If `npm run check:no-client-llm` fails, do not "fix" the scanner — fix the
code. The scanner is the contract.

Manual verification (always required, even when automated tests are added):

1. `npm run dev`, sign in, visit `/compass`.
2. Submit a question shorter than `QUESTION_TEXT_MIN` — submit should be
   disabled.
3. Submit a valid question — confirm the placeholder thesis and paragraph
   moves render and that the network panel shows a POST to
   `/functions/v1/generate-model-essay` with a `Bearer` Authorization header.
4. Sign out, revisit `/compass` — confirm the unauthenticated notice
   renders and no submit button is present.
5. With network DevTools, force the request to fail (offline) — confirm the
   error region renders and is accessible.

Report the manual verification results in the PR description.

---

### PR description template

```
## Summary
- Adds `ProseCompass` page calling the existing server-side `generate-model-essay` edge function.
- Wires `/compass` route and nav entry. Root route unchanged.
- No client-side LLM. No new dependencies. No schema or seed changes.

## Server-side contract used
Calls `POST /functions/v1/generate-model-essay` with
`{ questionText, theme?, thesisAxis?, targetLevel? }`; renders the
`PlaceholderResponse` returned by PR #21.

## States rendered
Unauthenticated · Loading · Error · Placeholder

## Tests
[Either: "Added ProseCompass.test.tsx mirroring AnnotatedEssayPack.test.tsx"]
[Or:    "Tests skipped because: <one-sentence reason>. Manual verification below."]

## Verification
- npm run check:no-client-llm: pass
- npm run lint: pass
- npm run test: pass
- npm run typecheck: pass
- npm run build: pass
- Targeted greps: clean (paste output)
- Manual checks: <pasted summary of 5 manual steps>
```

---

### Failure modes to avoid

- Recovering `ProseCompass.tsx` from the rescue branch and "patching" the
  Gemini references out. Rewrite fresh against the placeholder contract.
- Re-introducing `essayGenerationService.ts` "just for the type definitions"
  — import the types directly from
  `supabase/functions/generate-model-essay/validation` instead.
- Adding a "fallback mock generator" for when the edge function is
  unreachable. The four render states are sufficient; do not generate text
  in the client under any condition.
- Adding `@google/genai` back to `package.json` "to keep types compatible".
  It must not appear.
- Linking the new `/compass` nav from `LandingPage` (which does not exist
  on `main`) or from any new marketing page. LandingPage is PR D.
- Editing `scripts/check-no-client-llm-secrets.mjs` to allow the new file
  through. The scanner already excludes nothing relevant — if it complains,
  the source is wrong.
- Renaming, moving, or "tidying" any unrelated route, nav entry, or
  component while you are in `App.tsx` / `AppShell.tsx`.

---

When you have completed all of the above and every verification step
passes, open the PR with the title:

`feat(ui): ProseCompass page wired to server-side generator (PR C)`

and request review. Do not merge.

---

## Assumptions baked into this prompt

The prompt was drafted against the repo at HEAD `a1d120e` (post PR #21) and
assumes:

- PR #21's `generate-model-essay` edge function and validator are merged to
  `main` with the response shape shown in
  `supabase/functions/generate-model-essay/validation.ts` (`status: 'placeholder'`, no `essay` field, no quotations).
- `npm run check:no-client-llm` is the canonical scanner script; its
  forbidden-pattern list is treated as immutable for the purposes of this PR.
- The repo's existing edge-function call pattern is the one used in
  `src/pages/EssayMarker.tsx` (Bearer JWT from `supabase.auth.getSession()`,
  `fetch` against `${VITE_SUPABASE_URL}/functions/v1/<fn>`). The new page
  follows that pattern rather than `supabase.functions.invoke(…)` so the
  Authorization header is explicit.
- `useAuth()` from `@/contexts/AuthContext` exposes a `user` field whose
  falsiness can drive the unauthenticated state (matches existing usage in
  `AppShell.tsx`).
- Root route policy ("don't move `/`") is a hard product constraint until
  explicitly relaxed in a later PR. PR C does not seek that approval.
- `LandingPage.tsx` is reserved for PR D and is out of scope here.
- The test suite uses Vitest (`npm run test`) and the existing setup under
  `src/test/setup.ts` is sufficient; no test runner changes are permitted in
  PR C.
- AO5 is intentionally excluded from the server contract and from this UI;
  any future AO5 work is out of scope and must not be foreshadowed in copy
  or comments.
