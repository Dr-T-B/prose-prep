# Rescue Branch Review — 2026-05-25

**Branch reviewed:** `origin/rescue/local-phase-3-4-and-prosecompass`
**Base:** `main` (post-merge of PR #19, HEAD `ad9711e`)
**Review branch:** `fix/prosecompass-gemini-server-side`
**Mode:** Read-only audit; no source files recovered in this pass. One markdown doc recovered (see §10).

---

## 1. Files changed on the rescue branch

| Path | Status | Lines | Risk |
|---|---|---|---|
| `AUDIT_REPORT25052026.md` | new | +465 | Low (docs, descriptive) |
| `src/App.tsx` | mod | +5 / -2 | Medium (route restructure; couples to unsafe files) |
| `src/components/AppShell.tsx` | mod | +2 / -1 | Medium (nav coupled to `/compass`) |
| `src/data/seed.ts` | mod | +30 / -9 | Medium (interface relaxed; new entries off-schema) |
| `src/pages/LandingPage.tsx` | new | +190 | Low intrinsically; depends on route restructure + `/compass` |
| `src/pages/Phase4Workspace.tsx` | mod | +12 / -6 | Low (UX-only, semantic change) |
| `src/pages/ProseCompass.tsx` | new | +524 | **Critical** (client-side Gemini key UI + generator call) |
| `src/services/essayGenerationService.ts` | new | +102 | **Critical** (`GoogleGenAI` browser client, reads `VITE_GEMINI_API_KEY`) |

## 2. Recovery classification

### Safe to recover (rewrite-free)
- *None as standalone wholesale recoveries.* See §3 / §7 for the one near-safe candidate (`Phase4Workspace.tsx`) and why it's deferred.

### Safe with one mechanical condition
- `AUDIT_REPORT25052026.md` — pure documentation, no code. **Recovered** in this pass as `docs/AUDIT_REPORT_2026_05_25.md` to match the existing dated-doc naming convention.
- `src/pages/Phase4Workspace.tsx` — UX-only behavioural change (see §6). Safe technically; deferred pending product sign-off on the empty-by-default semantics.

### Must NOT be merged in current form
- `src/pages/ProseCompass.tsx` — direct dependency on `essayGenerationService.ts`; user-facing copy instructs students to set `VITE_GEMINI_API_KEY` in `.env.local` (line 308); error message references the same env var (line 95).
- `src/services/essayGenerationService.ts` — imports `GoogleGenAI` from `@google/genai`, reads `VITE_GEMINI_API_KEY` / `GEMINI_API_KEY` at module init, instantiates the client in the browser.
- `package.json` change adding `@google/genai` dependency (rescue line 28) — the dependency exists only to support the unsafe client path.

### Coupled to unsafe files (don't recover independently)
- `src/App.tsx` route additions for `/compass` and `LandingPage` import.
- `src/components/AppShell.tsx` nav entry for Prose Compass.
- `src/pages/LandingPage.tsx` — self-contained markup but routes to `/phase4` and `/compass`; `/compass` is unsafe. `/phase4` already exists on main.

## 3. Exact Gemini / client-key references found

Hard-fail patterns (`VITE_GEMINI_API_KEY`, `GEMINI_API_KEY`, `GoogleGenAI`, `@google/genai`) on the rescue branch:

```
package.json:28                                       "@google/genai": "^2.6.0",
src/pages/ProseCompass.tsx:95                         "...verify your connection or VITE_GEMINI_API_KEY configuration."
src/pages/ProseCompass.tsx:308                        Tip: Supply your Gemini key via the `.env.local` ... as `VITE_GEMINI_API_KEY`.
src/services/essayGenerationService.ts:1              import { GoogleGenAI } from '@google/genai';
src/services/essayGenerationService.ts:27             import.meta.env.VITE_GEMINI_API_KEY ||
src/services/essayGenerationService.ts:28             (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') ||
src/services/essayGenerationService.ts:32             console.warn('[ProseCraft] Missing VITE_GEMINI_API_KEY. Using sandbox mock generation.');
src/services/essayGenerationService.ts:37             const ai = new GoogleGenAI({ apiKey });
```

Benign matches (post-removal comment in already-merged file):

```
src/services/llmFeedbackService.ts:7–8   // previous implementation read VITE_GEMINI_API_KEY at the client and called
                                          // Gemini directly, shipping the key into the browser bundle. Re-enable
```

`AUDIT_REPORT25052026.md` references the patterns descriptively as part of the security finding write-up; not a usage site.

## 4. LandingPage.tsx — useful and safe?

**Useful:** yes. Replaces an auth-gated landing with a public marketing surface explaining the four features (Paragraph Engine, Functional Equivalence Pairings, Algorithmic Essay Linter, Prose Compass). Static JSX, only depends on `react-router-dom`'s `Link` and `lucide-react` icons.

**Safe intrinsically:** yes — no API calls, no auth bypass, no env reads.

**Safe to recover as-is:** no. The component links to `/compass` (unsafe route) and changes the root route from `Dashboard` (auth-gated on main) to `LandingPage` (public). That second change is a product decision about whether the marketing surface should sit at `/` or somewhere else (e.g. `/landing`).

**Recommendation:** quarantine reference only. When ProseCompass is rebuilt server-side, recover this file with the `/compass` link either removed or pointing at the rebuilt route; mount it at `/landing` to avoid moving the existing root.

## 5. Phase4Workspace.tsx — useful and safe?

**Useful:** yes. Two changes:
1. Lines 138–148: when no thesis axis is selected, both quote lists return `[]` instead of all quotes from each text. Stops the dropdowns from showing a meaningless full list before the user picks an axis.
2. Lines 421–460: both quote `<select>`s are `disabled` until `selectedAxis` is truthy; placeholder text becomes "Select an axis first..." instead of "-- Select Quote --".

**Safe intrinsically:** yes — pure UI, no service or env dependency.

**Behavioural caveat:** the empty-by-default behaviour is a user-visible product decision. Users who currently land on the page without selecting an axis will see empty dropdowns rather than the full quote bank. Worth a product confirmation before cherry-pick.

**Recommendation:** safe cherry-pick once product confirms the empty-by-default semantics. Single-file pick:

```
git checkout origin/rescue/local-phase-3-4-and-prosecompass -- src/pages/Phase4Workspace.tsx
```

Deferred in this pass.

## 6. App.tsx / AppShell.tsx route changes — useful and safe?

`App.tsx` changes:
- Adds imports for `LandingPage` and `ProseCompass`.
- Moves `Dashboard` from `/` to `/dashboard` (and removes the `/dashboard → /` redirect).
- Adds public `/` → `LandingPage` route (outside the auth-protected layout).
- Adds `/compass` → `ProseCompass` route inside the protected layout.

`AppShell.tsx`:
- Sidebar Dashboard link rewritten from `/` to `/dashboard`.
- Adds Prose Compass nav entry.

**Safety:** the route restructure itself is safe code-wise, but every recovered hunk pulls in an unsafe page (`ProseCompass`) or an as-yet-unmounted page (`LandingPage`). Recovering only the Dashboard re-route in isolation would break in-app links that assume Dashboard at `/`.

**Recommendation:** do not recover. After ProseCompass is rebuilt server-side, redo these route edits manually in the same PR as the rebuild.

## 7. seed.ts — useful and safe?

Two changes:
1. **`ComparativeMatrixEntry` interface relaxed.** Every previously-required field (`axis`, `hard_times`, `atonement`, `divergence`, `themes`) is now optional, and 8 new optional fields are added (`title`, `theme`, `description`, `pedagogicalFocus`, `criticalLenses`, `textATargets`, `textBTargets`).
2. **Two new matrix entries appended** (`matrix-bounderby-marshall`, `matrix-sissy-cecilia`) using only the new shape — they lack `axis`, `hard_times`, `atonement`, `divergence`, `themes`.

**Risk:** the interface change is a TypeScript-only relaxation, but every consumer of `ComparativeMatrixEntry` on main currently assumes the required fields exist. After this change, `entry.axis.toUpperCase()` style usage becomes a runtime crash. The two new entries would render as broken cards in any UI that reads the originally-required fields.

**Useful curricular content:** the two new entries' descriptions, critical lenses, and pedagogical focus look like Phase 3 character-pairing data being shoehorned into the comparative matrix. They probably belong in a separate dataset (e.g. a new `CHARACTER_PAIRINGS` array) with its own shape.

**Recommendation:** do not recover. Move the two new entries' *content* into a new typed dataset under Phase 3 work; keep `ComparativeMatrixEntry` strict.

## 8. ProseCompass.tsx / essayGenerationService.ts

**Recovery blocked** until the generator is rewritten as a Supabase edge function that:
- holds the Gemini key server-side only;
- accepts `{ questionText, theme, thesisAxis }` and returns the JSON schema currently defined in `MASTER_SYSTEM_INSTRUCTION`;
- constrains the model's quotations to the seed/DB quote bank (per Critical finding C3 of the 2026-05-25 audit — see `docs/AUDIT_REPORT_2026_05_25.md`).

The ProseCompass component itself can then be recovered with three deletions:
- import of `generateModelEssay` swapped for a `fetch('/functions/v1/generate-model-essay', …)` call (matching the pattern used in `mark-component2-essay`);
- removal of the `VITE_GEMINI_API_KEY` mention from the error string on line 95;
- removal of the `.env.local` tip block on lines 305–310.

## 9. Recommended implementation plan

1. **PR A (this branch — recovery audit, this pass).** Land the review report + the recovered 2026-05-25 audit doc.
2. **PR B (server-side generator).** Build `supabase/functions/generate-model-essay/` with the system instruction + quote-bank constraint from §8. Add the Gemini key to Supabase function secrets only; never to Vite env. Add an integration test that confirms `dist/assets/*.js` contains no `GoogleGenAI` and no `VITE_GEMINI_API_KEY`.
3. **PR C (ProseCompass UI).** Recover a rewritten `ProseCompass.tsx` that calls the edge function from PR B. Drop `essayGenerationService.ts` and the `@google/genai` dependency entirely.
4. **PR D (LandingPage + routing).** Mount `LandingPage.tsx` at `/landing` (or `/` if product approves moving Dashboard). Add `/compass` route. Update `AppShell` nav.
5. **PR E (Phase 3 content).** Move the two character-pairing entries from rescue `seed.ts` into a new strictly-typed `CHARACTER_PAIRINGS` dataset; restore `ComparativeMatrixEntry` strictness.
6. **PR F (Phase 4 UX).** Cherry-pick `Phase4Workspace.tsx` after product confirms the empty-by-default dropdown semantics.

## 10. Files actually recovered in this pass

- `docs/AUDIT_REPORT_2026_05_25.md` — recovered from rescue `AUDIT_REPORT25052026.md`, renamed to match the existing `docs/*_YYYY_MM_DD.md` convention. Pure markdown.

No source files recovered.

## 11. Verification commands run

```bash
git status --short
git branch --show-current
git fetch origin
git diff --stat main..origin/rescue/local-phase-3-4-and-prosecompass
git grep -nE 'VITE_GEMINI_API_KEY|GEMINI_API_KEY|GoogleGenAI|@google/genai' \
        origin/rescue/local-phase-3-4-and-prosecompass -- 'src/**' 'package.json' '*.ts' '*.tsx'
```

To re-verify after recovery, run from the working tree:

```bash
grep -RIn 'VITE_GEMINI_API_KEY\|GEMINI_API_KEY\|GoogleGenAI\|@google/genai' src package.json || true
npm run lint
npm run build
git status --short
```

## 12. Files left quarantined (reference only — preserved on rescue branch)

- `src/pages/ProseCompass.tsx`
- `src/services/essayGenerationService.ts`
- `src/pages/LandingPage.tsx`
- `src/App.tsx` (rescue version)
- `src/components/AppShell.tsx` (rescue version)
- `src/data/seed.ts` (rescue version)

All reachable via `git show origin/rescue/local-phase-3-4-and-prosecompass:<path>` when needed during PR B–F.

## 13. Incidental finding on `main`

While running the verification grep against the working tree, `package.json:28` on `main` still declares `"@google/genai": "^2.6.0"`. PR #19 removed the client-side usage but left the dependency in place. This is now an orphan dep: no code under `src/` imports it (only a removal-comment in `src/services/llmFeedbackService.ts:7` mentions the name). Worth removing in PR B alongside the server-side rewrite, or sooner as a one-line cleanup.
