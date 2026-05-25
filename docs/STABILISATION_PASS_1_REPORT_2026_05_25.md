# Stabilisation Pass 1 Report — 2026-05-25

## Branch

`stabilisation/pass-1`

## Pass split

- **Pass 1A** — code hygiene, security mitigation, public metadata (prior session)
- **Pass 1B** — documentation and migration reconciliation reporting (this session)

No app logic was changed in Pass 1B.

## Commits on this branch (since `main`)

```
a3d7832 fix(security): disable client-side Gemini call in llmFeedbackService
3624206 fix(meta): replace AO5 with AO1–AO4 in index.html public metadata
5d3cabf fix(lint): prefer-const for pivotIndex in essayValidationEngine
```

Pass 1B commits will be appended after this report is written.

## Files changed

### Pass 1A

- `src/lib/marker/essayValidationEngine.ts` — `let → const` for `pivotIndex`
- `index.html`, `dist/index.html` — AO5 removed from public metadata
- `src/services/llmFeedbackService.ts` — client-side Gemini call disabled;
  `VITE_GEMINI_API_KEY` and `@google/genai` references removed from runtime code

### Pass 1B

- `README.md` — added Canonical hosting status block under "Live app"
- `docs/STAGING_MIGRATION_RECONCILIATION_NOTE_2026_05_25.md` — new
- `docs/STABILISATION_PASS_1_REPORT_2026_05_25.md` — this file

## Completed fixes

- lint prefer-const
- AO5 public metadata removal (index.html / dist/index.html)
- client-side Gemini browser-key mitigation in `llmFeedbackService`
- README/canonical URL clarification
- migration reconciliation note

## Verification (2026-05-25)

### `npm run lint`

`0 errors, 24 warnings`. All warnings are pre-existing
`react-refresh/only-export-components` and one
`react-hooks/exhaustive-deps` — none introduced or relevant to Pass 1A/1B.

### `npm run build`

Built successfully in 3.71s.

```
dist/index.html                     2.87 kB │ gzip:   1.02 kB
dist/assets/index-D4T4dFO_.css    115.94 kB │ gzip:  19.87 kB
dist/assets/index-EpE-mTIK.js   2,040.13 kB │ gzip: 535.36 kB
```

The "Some chunks are larger than 500 kB" warning is pre-existing.

### AO5 grep

`grep -RIn "AO5\|ao5" index.html public src supabase docs README.md package.json netlify.toml`

- `index.html` / `public/` / `README.md` / `package.json` / `netlify.toml`:
  **no hits**. Public metadata is clean.
- Residual hits, **all intentional and deferred**:
  - `src/test/markerValidation.test.ts`,
    `src/lib/prose/annotatedEssays.test.ts`,
    `src/pages/AnnotatedEssayPack.test.tsx` — assertions that prohibit AO5.
  - `src/lib/prose/annotatedEssays.ts:52`,
    `src/data/annotatedEssayPracticePack/index.ts:1059` — compliance copy
    that explicitly states Component 2 does not assess AO5.
  - `src/components/character-pairing/CharacterPairingCard.tsx:93` — internal
    UI comment label `Synthesis & AO5 Section`. App-logic change, deferred.
  - `supabase/migrations/*` — historical migration files (including
    `drama_scene_ao5_readings`, `ao5_tension`, etc.). DB-shape change,
    deferred.

### Gemini / browser-key grep

`grep -RIn "VITE_GEMINI_API_KEY\|GEMINI_API_KEY\|GoogleGenAI\|@google/genai\|AIzaSy" src supabase public package.json dist`

- `src/services/llmFeedbackService.ts:7` — comment only, no runtime
  reference (Pass 1A target — confirmed clean).
- `src/pages/ProseCompass.tsx`, `src/services/essayGenerationService.ts` —
  **untracked** files outside Pass 1A/1B scope. The latter imports
  `GoogleGenAI` and reads `VITE_GEMINI_API_KEY` at runtime; if introduced as
  tracked code it would re-create the mitigated risk.
- `package.json:28` — `@google/genai: ^2.6.0` still listed as a dependency.
  Because `essayGenerationService.ts` (untracked) imports it, a fresh
  `npm run build` still bundles the SDK into `dist/assets/index-*.js`.
  Removing the dependency requires resolving the untracked files' status
  first; deferred.

### URL curl checks

```
curl -I -L https://prosetutor.netlify.app
HTTP/2 503
server: Netlify
date: Mon, 25 May 2026 13:50:32 GMT

curl -I -L https://prose-craft-aid.lovable.app
HTTP/2 200
server: cloudflare
date: Mon, 25 May 2026 13:50:32 GMT
```

Result matches the README canonical-hosting block.

### `supabase migration list --linked`

Linked project ref: `nxlxunygoccbnzdopqna`. CLI v2.98.2.

Two remote-only migrations are still present and have no local file:

- `20260523170000` (2026-05-23 17:00:00 UTC)
- `20260524222952` (2026-05-24 22:29:52 UTC)

Full migration table is captured in
`docs/STAGING_MIGRATION_RECONCILIATION_NOTE_2026_05_25.md`.

## Explicit deferred items

The following items were deliberately not addressed in this pass and remain
open:

- theme vocabulary canonicalisation
- `essay_plans` / `saved_essay_plans` consolidation
- marker Section A / Section B metadata
- Supabase RLS / RPC advisor hardening
- paragraph-builder consolidation
- AO3 teaching-surface build
- remote-only migration reconciliation implementation
  (this pass only documents the state; recovery of
  `20260523170000` and `20260524222952` is not attempted)
- `@google/genai` dependency removal and disposition of untracked
  `essayGenerationService.ts` / `ProseCompass.tsx`
- `CharacterPairingCard.tsx` internal AO5 comment cleanup

## Unrelated dirty files left untouched

Working tree before Pass 1B commits also contained, untouched:

- Deletions (staged via prior session, not by this pass):
  - `# prose-prep — Full Repo + DB Crash Audit (v2).md`
  - `AUDIT_REPORT.md`
  - `BACKEND_STATUS.md`
- Modified (Phase 3 / Phase 4 work belonging to another stream):
  - `src/App.tsx`
  - `src/components/AppShell.tsx`
  - `src/data/seed.ts`
  - `src/pages/Phase4Workspace.tsx`
- Untracked (not authored or staged by this pass):
  - `AUDIT_REPORT25052026.md`
  - `src/pages/LandingPage.tsx`
  - `src/pages/ProseCompass.tsx`
  - `src/services/essayGenerationService.ts`

## Blockers

None for this pass.

The remote-only migration reconciliation **does** block further DB migration
authoring — see
`docs/STAGING_MIGRATION_RECONCILIATION_NOTE_2026_05_25.md` for the
recommended next action.

## Suggested next phase

After this branch is reviewed and merged, the next substantive phase is
**Theme Vocabulary Canonicalisation**, per the earlier Codex assessment.
