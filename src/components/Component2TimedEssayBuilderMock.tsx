import { useEffect, useMemo, useRef, useState } from "react";

type Mode = "B" | "A" | "A*";

type Question = {
  id: string;
  prompt: string;
  focus: string;
  keywords: string[];
  suggestedRoutes: string[];
};

type Route = {
  id: string;
  label: string;
  hardTimes: string;
  atonement: string;
  ao2: string;
  ao3: string;
  ao4: string;
  ao5: string;
};

type Anchor = {
  id: string;
  text: "Hard Times" | "Atonement";
  quote: string;
  method: string;
  effect: string;
  routeId: string;
  verified: boolean;
  quoteType: "verbatim" | "anchor";
};

const QUESTIONS: Question[] = [
  {
    id: "q1",
    prompt:
      "Compare how Dickens and McEwan present the consequences of suppressing the imagination.",
    focus: "Imagination suppressed; emotional/moral cost",
    keywords: ["imagination", "suppression", "consequences"],
    suggestedRoutes: ["r-imag", "r-childhood", "r-narrative"],
  },
  {
    id: "q2",
    prompt:
      "Compare the writers' presentation of guilt and the desire for atonement.",
    focus: "Guilt; moral repair; lifelong reckoning",
    keywords: ["guilt", "atonement", "responsibility"],
    suggestedRoutes: ["r-guilt", "r-narrative", "r-family"],
  },
  {
    id: "q3",
    prompt:
      "Compare how Dickens and McEwan use narrative method to control the reader's judgement.",
    focus: "Narrative voice; reliability; reader manipulation",
    keywords: ["narrative", "voice", "unreliable"],
    suggestedRoutes: ["r-narrative", "r-imag", "r-class"],
  },
  {
    id: "q4",
    prompt:
      "Compare the presentation of class and social hierarchy in the two novels.",
    focus: "Class systems; mobility; inherited power",
    keywords: ["class", "power", "hierarchy"],
    suggestedRoutes: ["r-class", "r-family", "r-guilt"],
  },
];

const ROUTES: Route[] = [
  {
    id: "r-imag",
    label: "Imagination vs rationality",
    hardTimes:
      "Coketown's utilitarian schoolroom starves Louisa and Tom of fancy, leaving them emotionally maimed.",
    atonement:
      "Briony's hyperactive imagination becomes a moral weapon — she fictionalises Robbie into a monster.",
    ao2: "Dickens: monosyllabic 'Fact, fact, fact' syntax. McEwan: free indirect drift between Briony's fantasies and reality.",
    ao3: "1854 Gradgrindian utilitarianism vs 1935 pre-war class anxieties and the rise of modernist interiority.",
    ao4: "Both writers indict the misuse of mental faculties — one starves imagination, one weaponises it.",
    ao5: "Leavisite reading: imagination is moral oxygen. Postmodern reading: all narration is already fictionalisation.",
  },
  {
    id: "r-guilt",
    label: "Guilt and atonement",
    hardTimes:
      "Gradgrind's collapse before the dying Stephen is a partial, late repentance.",
    atonement:
      "Briony spends a lifetime drafting and redrafting the novel as her only available reparation.",
    ao2: "Dickens: dialogic confession scenes. McEwan: recursive metafictional coda destabilises 'truth'.",
    ao3: "Victorian Christian framework of repentance vs post-war secular crisis of moral authority.",
    ao4: "Both texts ask whether private remorse can ever discharge public harm.",
    ao5: "Feminist reading: Briony's 'atonement' is also self-aggrandisement; Marxist reading: Gradgrind's repentance leaves the system intact.",
  },
  {
    id: "r-childhood",
    label: "Childhood and moral formation",
    hardTimes:
      "The Gradgrind children are emotional experiments, raised on statistics rather than stories.",
    atonement:
      "Thirteen-year-old Briony has the vocabulary of fiction without the moral judgement to use it.",
    ao2: "Dickens: third-person omniscient diagnosis. McEwan: focalisation through a half-formed mind.",
    ao3: "Romantic ideal of the child (Wordsworth/Blake) vs Freudian/post-war anxieties about juvenile cognition.",
    ao4: "Both writers stage childhood as the site where moral systems are first ruined.",
    ao5: "Bildungsroman reading vs trauma-theory reading.",
  },
  {
    id: "r-narrative",
    label: "Narrative truth and unreliability",
    hardTimes:
      "Dickens's narrator is morally authoritative, almost sermonising.",
    atonement:
      "McEwan's narrator turns out to be Briony, undoing every prior certainty.",
    ao2: "Dickens: editorial intrusion and apostrophe. McEwan: metafictional frame and revealed authorship.",
    ao3: "Victorian realism vs late-twentieth-century postmodern self-consciousness.",
    ao4: "Both novels foreground the moral consequences of who is allowed to tell the story.",
    ao5: "Booth's rhetoric of fiction vs Hutcheon's poetics of postmodernism.",
  },
  {
    id: "r-class",
    label: "Class and social hierarchy",
    hardTimes:
      "Bounderby's invented rags-to-riches myth props up an exploitative factory order.",
    atonement:
      "The Tallises' casual authority allows Robbie's accusation to stick without question.",
    ao2: "Dickens: caricature and hyperbole. McEwan: precise sociological notation of country-house manners.",
    ao3: "Industrial-era class consolidation vs interwar gentry decline.",
    ao4: "Both writers expose how class secures the right to be believed.",
    ao5: "Marxist reading foregrounds structural violence; liberal-humanist reading foregrounds individual prejudice.",
  },
  {
    id: "r-family",
    label: "Family failure",
    hardTimes:
      "Gradgrind's home is a laboratory; love is replaced by data.",
    atonement:
      "The Tallis household is held together by absent fathers and ailing mothers.",
    ao2: "Dickens: domestic interiors as moral diagrams. McEwan: heat, lassitude, and unspoken resentments.",
    ao3: "Victorian patriarchy and the cult of domesticity vs the disintegrating interwar family.",
    ao4: "Both novels make family the engine of later catastrophe.",
    ao5: "Psychoanalytic vs sociological readings of the family unit.",
  },
];

const ANCHORS: Anchor[] = [
  {
    id: "a1",
    text: "Hard Times",
    quote: "\u201CNow, what I want is, Facts.\u201D",
    method: "Imperative + capitalised noun",
    effect: "Reduces children to receptacles; reifies Fact as deity.",
    routeId: "r-imag",
    verified: true,
    quoteType: "verbatim",
  },
  {
    id: "a2",
    text: "Hard Times",
    quote: "Anchor: Stephen Blackpool\u2019s repeated \u2018muddle\u2019 language \u2014 verify exact wording before citing.",
    method: "Demotic monosyllable; refrain",
    effect: "Names systemic injustice without the vocabulary to indict it.",
    routeId: "r-class",
    verified: false,
    quoteType: "anchor",
  },
  {
    id: "a3",
    text: "Hard Times",
    quote: "Anchor: Gradgrind kneels by the dying Stephen \u2014 verify exact wording before citing.",
    method: "Tableau; reversal of posture",
    effect: "Stages partial moral collapse of the utilitarian father.",
    routeId: "r-guilt",
    verified: false,
    quoteType: "anchor",
  },
  {
    id: "a4",
    text: "Atonement",
    quote: "Anchor: Briony\u2019s testimony that she saw Robbie \u2014 verify exact wording before citing.",
    method: "First-person assertion; visual idiom",
    effect: "Performs certainty Briony does not in fact possess.",
    routeId: "r-narrative",
    verified: false,
    quoteType: "anchor",
  },
  {
    id: "a5",
    text: "Atonement",
    quote: "Anchor: Briony\u2019s letter-writing as an old woman in the coda \u2014 verify exact wording before citing.",
    method: "Recursive metafiction; framing coda",
    effect: "Reframes the novel as a lifelong act of imperfect repair.",
    routeId: "r-guilt",
    verified: false,
    quoteType: "anchor",
  },
  {
    id: "a6",
    text: "Atonement",
    quote: "Anchor: Robbie\u2019s typed draft slips into the wrong envelope \u2014 verify exact wording before citing.",
    method: "Material symbol; dramatic irony",
    effect: "A single object detonates class assumptions and sexual policing.",
    routeId: "r-class",
    verified: false,
    quoteType: "anchor",
  },
  {
    id: "a7",
    text: "Atonement",
    quote: "Anchor: heat saturates the Tallis house before the crime \u2014 verify exact wording before citing.",
    method: "Pathetic fallacy; sensory diffusion",
    effect: "Stages a household whose moral attention is dulled by torpor.",
    routeId: "r-family",
    verified: false,
    quoteType: "anchor",
  },
];

const MODE_HINTS: Record<Mode, { label: string; thesis: string; para: string; ao5: string }> = {
  B: {
    label: "Grade B — supported",
    thesis:
      "Both Dickens and McEwan show that [focus]. Dickens uses [method] while McEwan uses [method].",
    para: "Point → Quote → Method → Effect → Context → Brief comparison.",
    ao5: "Mention one named alternative reading.",
  },
  A: {
    label: "Grade A — confident",
    thesis:
      "Although Dickens and McEwan write a century apart, both expose [focus] — but where Dickens [stance], McEwan [counter-stance].",
    para: "Argument → Comparative method → Layered effect → Context → Embedded AO5.",
    ao5: "Weave at least two interpretive lenses (e.g. Marxist + feminist).",
  },
  "A*": {
    label: "Grade A* — challenge",
    thesis:
      "At A* level, argue that the two novels do not merely present [focus] differently; they stage competing aesthetic models for understanding moral, social and narrative failure.",
    para: "Conceptual claim → Comparative architecture → Method-as-argument → Contextual irony → Disruptive AO5.",
    ao5: "Set two readings against each other and adjudicate.",
  },
};

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Component2TimedEssayBuilderMock() {
  const [mode, setMode] = useState<Mode>("A");
  const [questionId, setQuestionId] = useState<string>(QUESTIONS[0].id);
  const [routeIds, setRouteIds] = useState<string[]>([]);
  const [thesis, setThesis] = useState<string>("");
  const [anchorIds, setAnchorIds] = useState<string[]>([]);

  const [secondsLeft, setSecondsLeft] = useState<number>(60 * 60);
  const [running, setRunning] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [scores, setScores] = useState<Record<"AO1" | "AO2" | "AO3" | "AO4" | "AO5", number>>({
    AO1: 3,
    AO2: 3,
    AO3: 3,
    AO4: 3,
    AO5: 3,
  });

  const question = QUESTIONS.find((q) => q.id === questionId)!;
  const chosenRoutes = ROUTES.filter((r) => routeIds.includes(r.id));
  const chosenAnchors = ANCHORS.filter((a) => anchorIds.includes(a.id));
  const hint = MODE_HINTS[mode];

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function toggleRoute(id: string) {
    setRouteIds((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  function toggleAnchor(id: string) {
    setAnchorIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  const paragraphPlan = useMemo(() => {
    return chosenRoutes.map((r, i) => {
      const supporting = chosenAnchors.filter((a) => a.routeId === r.id);
      return {
        n: i + 1,
        route: r,
        anchors: supporting,
      };
    });
  }, [chosenRoutes, chosenAnchors]);

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 print:px-0 print:py-0">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3 print:mb-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Component 2 · Prose · Sandbox
            </p>
            <h1 className="font-serif text-3xl">Timed Essay Builder</h1>
            <p className="text-sm text-muted-foreground">
              Hard Times × Atonement — plan, anchor, time, self-mark.
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            {(["B", "A", "A*"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  mode === m
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:bg-muted"
                }`}
              >
                Grade {m}
              </button>
            ))}
            <button
              onClick={() => window.print()}
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              Print plan
            </button>
          </div>
        </header>

        <section className="mb-5 rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            1 · Choose exam question
          </p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {QUESTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => {
                  setQuestionId(q.id);
                  setRouteIds([]);
                  setAnchorIds([]);
                }}
                className={`rounded-md border p-3 text-left text-sm transition-colors ${
                  questionId === q.id
                    ? "border-foreground bg-muted"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <span className="font-serif text-base">{q.prompt}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 text-sm">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              2 · Question focus
            </span>
            <p className="mt-1 italic">{question.focus}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Keywords: {question.keywords.join(" · ")}
            </p>
          </div>
        </section>

        <section className="mb-5 rounded-lg border border-border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              3 · Choose 3–4 comparative routes
            </p>
            <span className="text-xs text-muted-foreground">
              {routeIds.length}/4 selected
            </span>
          </div>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {ROUTES.map((r) => {
              const suggested = question.suggestedRoutes.includes(r.id);
              const selected = routeIds.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggleRoute(r.id)}
                  className={`relative rounded-md border p-3 text-left text-sm transition-colors ${
                    selected
                      ? "border-foreground bg-muted"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.label}</span>
                    {suggested && (
                      <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
                        suggested
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    HT: {r.hardTimes}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    AT: {r.atonement}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-5 rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            4 · Build your thesis ({hint.label})
          </p>
          <p className="mt-1 text-xs italic text-muted-foreground">
            Frame: {hint.thesis}
          </p>
          <textarea
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            rows={3}
            placeholder="Write your thesis sentence here…"
            className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm font-serif"
          />
        </section>

        <section className="mb-5 rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            5 · Select quote/method anchors
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Verified quotations may be cited directly. Quote anchors are idea
            locators only: verify exact wording in the text before using them in
            an essay.
          </p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {ANCHORS.map((a) => {
              const selected = anchorIds.includes(a.id);
              const routeMatch = routeIds.includes(a.routeId);
              const isAnchor = a.quoteType === "anchor";
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAnchor(a.id)}
                  className={`rounded-md border p-3 text-left text-sm transition-colors ${
                    isAnchor
                      ? "border-dashed border-amber-500/60 bg-amber-50/40 dark:bg-amber-950/20"
                      : ""
                  } ${
                    selected
                      ? "border-foreground bg-muted"
                      : !isAnchor
                        ? "border-border hover:bg-muted/50"
                        : "hover:bg-amber-50/60 dark:hover:bg-amber-950/30"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="uppercase tracking-wider text-muted-foreground">
                      {a.text}
                    </span>
                    <div className="flex items-center gap-1">
                      {routeMatch && (
                        <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
                          on route
                        </span>
                      )}
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${
                          isAnchor
                            ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                            : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                        }`}
                      >
                        {isAnchor ? "Quote anchor / paraphrase" : "Verified quotation"}
                      </span>
                    </div>
                  </div>
                  {isAnchor ? (
                    <p className="mt-1 font-serif">{a.quote}</p>
                  ) : (
                    <p className="mt-1 font-serif italic">{a.quote}</p>
                  )}
                  <p className="mt-1 text-xs">
                    <span className="font-medium">Method:</span> {a.method}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Effect:</span> {a.effect}
                  </p>
                  {isAnchor && (
                    <p className="mt-1 text-[11px] italic text-amber-800 dark:text-amber-300">
                      Verify exact wording before citing.
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-5 rounded-lg border border-border bg-card p-4 print:break-inside-avoid">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            6 · Generated paragraph plan
          </p>
          <p className="mt-1 text-xs italic text-muted-foreground">
            Structure: {hint.para} · AO5: {hint.ao5}
          </p>
          {paragraphPlan.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Pick at least one route to generate paragraphs.
            </p>
          ) : (
            <ol className="mt-3 space-y-3">
              {paragraphPlan.map((p) => (
                <li
                  key={p.route.id}
                  className="rounded-md border border-border p-3 text-sm"
                >
                  <p className="font-medium">
                    ¶{p.n} — {p.route.label}
                  </p>
                  <p className="mt-1 text-xs">
                    <span className="font-medium">Hard Times:</span>{" "}
                    {p.route.hardTimes}
                  </p>
                  <p className="text-xs">
                    <span className="font-medium">Atonement:</span>{" "}
                    {p.route.atonement}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    AO2 {p.route.ao2}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    AO3 {p.route.ao3}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    AO4 {p.route.ao4}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    AO5 {p.route.ao5}
                  </p>
                  {p.anchors.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {p.anchors.map((a) => (
                        <li key={a.id} className="text-xs italic">
                          · ({a.text}) {a.quote} — {a.method}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          )}
          {thesis && (
            <div className="mt-4 rounded-md border border-dashed border-border p-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Thesis
              </p>
              <p className="mt-1 font-serif text-sm">{thesis}</p>
            </div>
          )}
        </section>

        <section className="mb-5 rounded-lg border border-border bg-card p-4 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                7 · 60-minute timer
              </p>
              <p className="font-serif text-4xl tabular-nums">
                {fmt(secondsLeft)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRunning((r) => !r)}
                className="rounded-md border border-foreground bg-foreground px-3 py-1.5 text-sm text-background hover:opacity-90"
              >
                {running ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => {
                  setRunning(false);
                  setSecondsLeft(60 * 60);
                }}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        <section className="mb-10 rounded-lg border border-border bg-card p-4 print:break-inside-avoid">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            8 · Self-assessment (1–5 per AO)
          </p>
          <p className="mt-1 text-xs italic text-muted-foreground">
            Reflective prompts only — these sliders are not official marks.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-5">
            {(Object.keys(scores) as Array<keyof typeof scores>).map((ao) => (
              <label key={ao} className="text-sm">
                <span className="font-medium">{ao}</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={scores[ao]}
                  onChange={(e) =>
                    setScores((s) => ({ ...s, [ao]: Number(e.target.value) }))
                  }
                  className="mt-1 w-full"
                />
                <span className="text-xs text-muted-foreground">
                  Score: {scores[ao]}/5
                </span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm">
            Total: <span className="font-medium">{totalScore}/25</span> ·
            Self-confidence indicator:{" "}
            <span className="font-medium">
              {totalScore >= 18
                ? "Stretching towards high-level control"
                : totalScore >= 11
                  ? "Secure foundation"
                  : "Developing confidence"}
            </span>
          </p>
          <p className="mt-2 text-xs italic text-muted-foreground">
            This is a formative self-confidence indicator, not an Edexcel grade
            boundary or predicted grade.
          </p>
        </section>

        <p className="pb-6 text-center text-xs text-muted-foreground print:hidden">
          Sandbox prototype · mock data only · not connected to backend.
        </p>
      </div>
    </div>
  );
}
