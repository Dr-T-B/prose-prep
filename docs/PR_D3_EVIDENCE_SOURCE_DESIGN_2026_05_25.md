# PR D3 — Evidence Source Design — 2026-05-25

Design pass for the architectural question deferred by PR D2: where does the
`generate-model-essay` Edge Function read curated evidence from, and how does
that choice interact with security, latency, deploy cadence, and the
sanitiser?

PR D2 shipped plan-only generation with no evidence retrieval. PR D3 is the
first step toward evidence-backed generation. This doc lays out the options
without picking one — the decision should be made by the project owner after
weighing the trade-offs below.

---

## Question

How does the Edge Function obtain the verified Hard Times / Atonement
quote+method evidence it will pass into the provider prompt?

Two viable paths:

- **A. Seed-at-build** — bundle a curated, vetted JSON snapshot into the
  Edge Function deploy artifact.
- **B. Service-role at request** — the Edge Function queries Supabase using
  a service-role key (or a row-level-security-scoped role) at request time.

Both are technically achievable from where PR D2 leaves the repo. They differ
mainly in *who controls the evidence*, *when updates take effect*, and
*what new keys/surfaces the function must handle*.

---

## Context — where evidence lives today

The repo currently contains evidence in two distinct shapes:

- **Frontend seed file**: [src/data/seed.ts](../src/data/seed.ts) — a
  ~1,000-line static TypeScript module with typed `QuestionFamily`,
  paired arguments per text, and method commentary. Currently consumed only
  by client components (Dashboard, ComparativeMatrix, ParagraphEngine).
- **Database tables**: migrations under
  [supabase/migrations](../supabase/migrations) — including `quote_methods`,
  `quote_pairs`, `quotes`, `quote_question_links`. Authoritative for
  in-app content beyond the seed file. The 2026-05-19 schema remediation
  flagged `quote_pairs` normalisation as a remaining curatorial item, so the
  DB shape is not fully settled.

Neither source is currently consumed by the Edge Function. PR D2 deliberately
did not touch either.

---

## Option A — Seed-at-build

The Edge Function imports a curated JSON (or `.ts`) snapshot at module-load
time. The snapshot is checked into the repo under
`supabase/functions/generate-model-essay/evidence/` and is the only evidence
the function ever sees.

### Properties

- **No DB hop.** Function startup reads memory; request latency is provider-
  call time plus prompt assembly only.
- **No additional secret surface.** The function continues to need only
  `MODEL_PROVIDER_API_KEY`; no service-role key in scope.
- **Update cadence = deploy cadence.** A new quote requires a PR, a review,
  and a function redeploy.
- **Immutable per deploy.** The deployed function and the evidence it can
  cite move together. Easy to audit "what did the function know on
  date X" from git history alone.
- **Curation lives in code review.** Every evidence change is a diff a
  reviewer can read; no out-of-band DB writes can change function behaviour.
- **Size ceiling.** Edge Function deploys have a size budget. A bundled
  evidence JSON for two texts at A-level granularity is well under any
  realistic limit, but the ceiling exists and matters for future text
  additions.

### When it fits

- Evidence is *curated artisanally* by a small number of people who already
  use the PR workflow.
- The team is comfortable with "edit the JSON, open a PR, deploy" as the
  authoring loop.
- We want a hard guarantee that the function cannot cite content that
  hasn't passed code review.

---

## Option B — Service-role at request

The Edge Function holds a Supabase service-role key (or a narrowly-scoped
role) and queries the existing `quote_methods` / `quote_pairs` / related
tables at request time, filtered by the user's theme and text selection.

### Properties

- **DB hop per request.** Adds ~tens of ms to request latency under healthy
  conditions; more under DB stress. The provider call already dominates
  total request time, so the marginal cost is small but real.
- **Additional secret surface.** A service-role key in the Edge Function is
  a high-blast-radius credential. Must be set via Supabase secrets, never
  logged, never returned to the client. Compromise of the function process
  exposes more than just generator-cost; it exposes write access to user
  data unless we scope down to a read-only role.
- **Live updates.** New evidence rows appear to the function the moment
  they're written to the DB. Authoring loop is decoupled from deploys.
- **Curation lives in DB writes.** Whoever has write access to the relevant
  tables controls function output. Code review is no longer the gating
  mechanism for what the function can cite. RLS / role design becomes
  load-bearing.
- **Query design matters.** The function needs predictable, indexed queries
  per request — theme and text are the obvious dimensions. Schema drift
  (e.g. the deferred `quote_pairs` normalisation) is a coupling point.

### When it fits

- Evidence is *curated by content authors who do not work in the codebase*
  and we want their changes live without engineering involvement.
- Volume of evidence is large enough that bundling it would meaningfully
  inflate function cold-start time.
- The team is willing to invest in a read-only role and audit story for the
  service-role surface.

---

## Side-by-side

| Concern                          | A. Seed-at-build                 | B. Service-role at request           |
| -------------------------------- | -------------------------------- | ------------------------------------ |
| Per-request latency overhead     | None                             | DB round-trip (~tens of ms)          |
| Secret surface added             | None                             | Service-role (or scoped) key         |
| Update cadence                   | Deploy-coupled                   | Live                                 |
| Audit story                      | `git log` is authoritative       | DB row history + RLS policy          |
| Schema drift coupling            | None                             | Tight                                |
| Authoring loop                   | PR review                        | DB writes (UI or SQL)                |
| Cold-start cost                  | Bundle size                      | None                                 |
| Worst-case failure mode          | Stale evidence post-curation     | DB outage → `provider_unavailable`   |

---

## Cross-cutting concerns (either path)

These are needed regardless of which source is chosen, and should be
planned alongside the source decision rather than left implicit.

### Quote-bank shape contract

The function needs a stable retrieval shape. Minimum fields:

- `id` (stable)
- `text` (the canonical quote string — provenance-locked)
- `sourceText` ("Hard Times" | "Atonement")
- `theme` or `questionFamily` (for retrieval keying)
- `method` (commentary that the provider may paraphrase)
- `evidenceRef` (optional, structured — e.g. `{ book: 1, chapter: 5 }`)

The current DB tables and `seed.ts` do not agree on this shape. A
canonical retrieval shape needs to be defined before either path can land.

### Sanitiser upgrades

PR D2's sanitiser rejects all quotation-shaped content. Once retrieval is
in scope, the sanitiser changes meaning:

- **Allowed quotation**: text exactly matching a `text` field in the
  evidence passed into the prompt. Exact-match (Unicode-normalised, smart-
  quote folded). No fuzzy matching.
- **Rejected quotation**: anything else, regardless of how plausible.

This means the sanitiser becomes context-dependent — it must accept the
evidence batch as input, not just the provider output. That's a real
design change, not a tweak.

### Critic-name allowlist

D2 noted but did not implement this. Once the provider is genuinely
producing analytical paragraphs, it will reach for critic names (Leavis,
Eagleton, Tanner, Currie, Head, Hilliard, etc.). Some are appropriate;
fabricated attributions are not.

The conservative move is an allowlist sourced from the same evidence path
chosen above — i.e. a critic only appears in output if they appear in the
evidence the function received. Same source-of-truth as the quote bank;
same audit story.

### AO5 sanitiser robustness

D2's `NEGATIVE_AO_PATTERN` catches `AO5`, "assessment objective 5", and
"fifth assessment objective". Worth a once-over before D3 lands real
generation: are there other phrasings the provider might use ("AO five",
"the fifth AO", numeric-word variants)? Add what's needed; the test file
already has the negative-assertion scaffolding.

---

## PR D2 verification outcome (recorded 2026-05-25)

PR D2 ([#30](https://github.com/Dr-T-B/prose-prep/pull/30)) merged at `77cf765`. Secret-name rename ([#32](https://github.com/Dr-T-B/prose-prep/pull/32)) merged at `632fea4`. Edge Function now reads `ANTHROPIC_API_KEY` from Supabase secrets (already configured on project `nxlxunygoccbnzdopqna`; no stale `MODEL_PROVIDER_API_KEY` present in the project).

Deployed live. Live probes:

- `OPTIONS /functions/v1/generate-model-essay` → 200, CORS headers intact (`access-control-allow-origin: *`, methods `POST, OPTIONS`, headers `authorization, x-client-info, apikey, content-type`).
- Unauthenticated `POST` → 401 with `sb-error-code: UNAUTHORIZED_NO_AUTH_HEADER`. JWT gate enforced at the Supabase gateway; request never reaches the function body.

**End-to-end provider call against a signed-in user is still pending.** A signed-in `/compass` submission needs to be inspected against the four failure modes (fabricated quotations, critic-name leakage, locator references, AO5 leakage) before this design pass is treated as fully grounded. The doc will be updated once that response is observed.

## D3 / D4 backlog (carried from D2 review)

- ~~Rename `MODEL_PROVIDER_API_KEY` → `ANTHROPIC_API_KEY`~~ — done in [#32](https://github.com/Dr-T-B/prose-prep/pull/32).
- **Add an explanatory comment on the "full essay" UI placeholder string** in [ProseCompass.tsx:184](../src/pages/ProseCompass.tsx) so the next repo-wide grep doesn't flag it. Trivial.
- **Critic allowlist** — design alongside the evidence-source decision (see above).
- **Sanitiser context-dependence** — once retrieval lands, the sanitiser needs the evidence batch as input. Refactor `sanitiseProviderPlan` accordingly.
- **`quote_pairs` normalisation** — the deferred curatorial item from the 2026-05-19 schema remediation. Likely blocks Option B; mostly orthogonal to Option A but affects the canonical retrieval shape either way.

---

## Open questions for the team

1. Who is the intended *author of curated evidence* — engineers via PRs, or content owners via a DB-backed UI? The answer largely determines A vs B.
2. Is there a target update cadence that "wait for the next deploy" would violate?
3. If Option B, do we accept a service-role key in the Edge Function, or do we scope a new read-only role specifically for this function?
4. Is the existing schema (`quote_methods`, `quote_pairs`, etc.) close enough to the retrieval shape we need, or does the canonical shape want a new view / materialised projection?
5. What's the appetite for a hybrid (seed-at-build for the initial vetted corpus, with a read-only DB query as a *supplementary* lookup) versus a clean single-source decision?

---

## Recommendation framing

This doc deliberately stops short of a recommendation. The right call
depends on who curates evidence in practice, and on the team's appetite
for adding a service-role surface to the Edge Function. Both are project-
level decisions, not technical ones.

Suggested next step: 15-minute conversation with the project owner to
answer questions 1 and 3 above; remaining design follows from those.
