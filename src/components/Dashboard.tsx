import { useMemo } from "react";

/**
 * Component2DashboardMock
 * -----------------------
 * Sandbox prototype only. All data is mocked inline below — no fetches,
 * no Supabase, no auth. Safe to copy into the real app later if approved.
 *
 * Pearson Edexcel A-Level English Literature
 * Component 2: Prose · 9ET0/02
 * Texts: Hard Times (Dickens) · Atonement (McEwan)
 */

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const EXAM_DATE_ISO = "2026-06-01";

type AO = "AO1" | "AO2" | "AO3" | "AO4" | "AO5";

const AO_META: Record<AO, { label: string; weight: number }> = {
  AO1: { label: "Argument, terminology, expression", weight: 28 },
  AO2: { label: "Analysis of methods", weight: 24 },
  AO3: { label: "Contextual understanding", weight: 16 },
  AO4: { label: "Connections between texts", weight: 16 },
  AO5: { label: "Different interpretations", weight: 16 },
};

const AO_READINESS: Record<AO, { score: number; trend: number; note: string }> = {
  AO1: { score: 78, trend: +4, note: "Thesis statements sharper; expression still occasionally informal." },
  AO2: { score: 71, trend: +2, note: "Naming methods precisely — avoid 'uses imagery'." },
  AO3: { score: 64, trend: -1, note: "Atonement context (postwar, metafiction) thinner than Dickens." },
  AO4: { score: 58, trend: +6, note: "Comparative hinges improving; still text-by-text in ¶3." },
  AO5: { score: 52, trend: +1, note: "Add a counter-reading per paragraph; cite a critic by name." },
};

type Text = "Hard Times" | "Atonement";

type ThemeRow = {
  id: string;
  title: string;
  hardTimes: number;
  atonement: number;
  connection: string;
};

const THEMES: ThemeRow[] = [
  { id: "class", title: "Class & social hierarchy", hardTimes: 82, atonement: 74, connection: "Externalised industry vs. internalised class misreading" },
  { id: "education", title: "Education & imagination", hardTimes: 88, atonement: 60, connection: "Suppressed fancy vs. unchecked fancy" },
  { id: "guilt", title: "Guilt & atonement", hardTimes: 55, atonement: 72, connection: "Partial redemption vs. denied absolution" },
  { id: "narrative", title: "Narrative authority & form", hardTimes: 48, atonement: 81, connection: "Intrusive Victorian narrator vs. metafictional author-God" },
  { id: "gender", title: "Gender & power", hardTimes: 62, atonement: 68, connection: "Louisa's commodification vs. Cecilia's self-determination" },
  { id: "memory", title: "Memory & truth", hardTimes: 30, atonement: 70, connection: "Weakest comparative axis — needs work" },
];

const QUOTE_PROGRESS: Array<{ text: Text; learned: number; total: number }> = [
  { text: "Hard Times", learned: 22, total: 30 },
  { text: "Atonement", learned: 17, total: 30 },
];

type Essay = {
  id: string;
  date: string;
  question: string;
  themeId: string;
  mark: number; // out of 40
  band: "C" | "B" | "A" | "A*";
  weakest: AO;
};

const ESSAYS: Essay[] = [
  { id: "e1", date: "12 Apr", question: "Compare presentations of guilt and the possibility of atonement.", themeId: "guilt", mark: 26, band: "B", weakest: "AO5" },
  { id: "e2", date: "26 Apr", question: "'Imagination is more dangerous than ignorance.'", themeId: "education", mark: 29, band: "B", weakest: "AO4" },
  { id: "e3", date: "08 May", question: "Compare the corrupting effects of social class.", themeId: "class", mark: 31, band: "A", weakest: "AO3" },
  { id: "e4", date: "13 May", question: "Compare uses of narrative form to shape moral response.", themeId: "narrative", mark: 28, band: "B", weakest: "AO2" },
];

const WEAKNESSES: Array<{ id: string; title: string; severity: "high" | "med" | "low"; detail: string; aos: AO[] }> = [
  { id: "w1", title: "AO4 paragraph drift", severity: "high", aos: ["AO4"], detail: "Paragraphs 3–4 default to single-text analysis. Open every ¶ with a comparative claim." },
  { id: "w2", title: "Atonement context shallow", severity: "high", aos: ["AO3"], detail: "Postwar Britain, metafiction debates, McEwan on Lola's silence — currently 2 quotable references." },
  { id: "w3", title: "Critic citations missing", severity: "med", aos: ["AO5"], detail: "Bring in Leavis (HT) and Currie / Head (Atonement) by name to anchor counter-readings." },
  { id: "w4", title: "Method vocabulary repetitive", severity: "med", aos: ["AO2"], detail: "Rotate: free indirect discourse, prolepsis, syndeton, synecdoche, focalisation." },
  { id: "w5", title: "Memory & truth thin on HT side", severity: "low", aos: ["AO4"], detail: "Only 30% theme readiness for Hard Times — pull Sissy / Stephen exchanges." },
];

const PRINT_SUMMARY = {
  thesisTemplates: [
    "Although Dickens stages a redemptive softening of his utilitarian ideologues, McEwan denies any equivalent absolution, suggesting that…",
    "Where Hard Times externalises moral failure as industrial landscape, Atonement internalises it as narrative unreliability, so that…",
  ],
  keyQuotes: [
    { text: "Hard Times", quote: "Now, what I want is, Facts.", method: "Capitalised abstract noun; Benthamite satire." },
    { text: "Hard Times", quote: "It was a town of red brick, or of brick that would have been red…", method: "Conditional syntax; synecdoche of mechanised humanity." },
    { text: "Atonement", quote: "How can a novelist achieve atonement when… she is also God?", method: "Rhetorical question; metafictional collapse of author/character." },
    { text: "Atonement", quote: "The word… danced through them obscenely.", method: "Personification; class-sheltered consciousness." },
  ],
  contexts: [
    "1854 industrial Coketown · Benthamite utilitarianism · serialised in Household Words",
    "Dunkirk 1940 · 1999 metafictional coda · postmodern ethics of fiction",
  ],
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

function bandFor(score: number): "C" | "B" | "A" | "A*" {
  if (score >= 85) return "A*";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  return "C";
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function Component2DashboardMock() {
  const days = daysUntil(EXAM_DATE_ISO);

  const overall = useMemo(() => {
    const aos = Object.keys(AO_READINESS) as AO[];
    const weighted =
      aos.reduce((sum, a) => sum + AO_READINESS[a].score * AO_META[a].weight, 0) /
      aos.reduce((sum, a) => sum + AO_META[a].weight, 0);
    return Math.round(weighted);
  }, []);

  const overallBand = bandFor(overall);

  const nextTask = useMemo(() => {
    const top = [...WEAKNESSES].sort(
      (a, b) => sevWeight(b.severity) - sevWeight(a.severity),
    )[0];
    return {
      title: "Draft a 25-min comparative ¶ on Memory & Truth",
      reason: `Targets ${top.aos.join(", ")} — addresses: ${top.title}.`,
      action: "Use Atonement Part Three opening + Sissy/Stephen exchange (HT Bk II Ch. 6).",
      minutes: 25,
    };
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink relative">
      {/* Preview badge */}
      <span className="absolute top-4 right-4 z-50 bg-ink text-paper text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-1 select-none print:hidden">
        Preview — mock data
      </span>

      {/* Top bar */}
      <header className="border-b border-rule bg-paper-dim print:hidden">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-ink-muted">
              Edexcel · 9ET0/02 · Component 2: Prose
            </p>
            <h1 className="font-serif text-2xl mt-1">Revision Dashboard</h1>
          </div>
          <button
            onClick={() => window.print()}
            className="text-xs uppercase tracking-wider border border-ink px-3 py-2 hover:bg-ink hover:text-paper transition-colors"
          >
            Print summary
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        {/* Row 1: Countdown + Next task */}
        <section className="grid gap-6 md:grid-cols-3">
          <CountdownPanel days={days} overall={overall} band={overallBand} />
          <NextTaskPanel task={nextTask} className="md:col-span-2" />
        </section>

        {/* Row 2: AO tracker */}
        <Section title="AO Readiness" eyebrow="Assessment Objectives">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {(Object.keys(AO_READINESS) as AO[]).map((ao) => (
              <AOCard key={ao} ao={ao} />
            ))}
          </div>
        </Section>

        {/* Row 3: Theme grid */}
        <Section title="Theme Readiness" eyebrow="Comparative coverage">
          <div className="border border-rule overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_120px_1.4fr] text-[10px] uppercase tracking-[0.2em] text-ink-muted bg-paper-dim border-b border-rule">
              <div className="px-4 py-3">Theme</div>
              <div className="px-4 py-3">Hard Times</div>
              <div className="px-4 py-3">Atonement</div>
              <div className="px-4 py-3">AO4 hinge</div>
            </div>
            {THEMES.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_120px_120px_1.4fr] items-center border-b border-rule last:border-b-0 text-sm"
              >
                <div className="px-4 py-3 font-serif">{t.title}</div>
                <div className="px-4 py-3"><Bar value={t.hardTimes} /></div>
                <div className="px-4 py-3"><Bar value={t.atonement} /></div>
                <div className="px-4 py-3 text-ink-muted text-xs leading-relaxed">
                  {t.connection}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Row 4: Quote recall + Essay tracker */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Quote Recall" eyebrow="Memorisation">
            <div className="space-y-4">
              {QUOTE_PROGRESS.map((q) => {
                const pct = Math.round((q.learned / q.total) * 100);
                return (
                  <div key={q.text} className="border border-rule p-4">
                    <div className="flex items-baseline justify-between">
                      <div className="font-serif text-lg">{q.text}</div>
                      <div className="text-xs text-ink-muted">
                        {q.learned}/{q.total} learned · {pct}%
                      </div>
                    </div>
                    <Bar value={pct} className="mt-3" />
                    <div className="mt-3 flex gap-2 text-[10px] uppercase tracking-wider">
                      <Tag>Due review: {Math.round(q.learned * 0.3)}</Tag>
                      <Tag>New today: 4</Tag>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Comparative Essay Practice" eyebrow="Build → Test → Refine">
            <div className="border border-rule">
              <div className="grid grid-cols-[60px_1fr_60px_50px] text-[10px] uppercase tracking-[0.2em] text-ink-muted bg-paper-dim border-b border-rule">
                <div className="px-3 py-2">Date</div>
                <div className="px-3 py-2">Question</div>
                <div className="px-3 py-2 text-right">Mark</div>
                <div className="px-3 py-2 text-right">Band</div>
              </div>
              {ESSAYS.map((e) => (
                <div
                  key={e.id}
                  className="grid grid-cols-[60px_1fr_60px_50px] items-center border-b border-rule last:border-b-0 text-sm"
                >
                  <div className="px-3 py-3 text-xs text-ink-muted">{e.date}</div>
                  <div className="px-3 py-3">
                    <div className="font-serif leading-snug">{e.question}</div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-muted mt-1">
                      Weakest: {e.weakest}
                    </div>
                  </div>
                  <div className="px-3 py-3 text-right font-serif">{e.mark}</div>
                  <div className="px-3 py-3 text-right">
                    <BandPill band={e.band} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              4 timed essays · trend{" "}
              <span className="text-ink font-semibold">+5 marks</span> over last
              month.
            </p>
          </Section>
        </div>

        {/* Row 5: Weakness diagnosis */}
        <Section title="Weakness Diagnosis" eyebrow="Where marks are leaking">
          <ul className="divide-y divide-rule border-y border-rule">
            {WEAKNESSES.map((w) => (
              <li key={w.id} className="py-4 grid md:grid-cols-[100px_1fr_auto] gap-4 items-start">
                <SeverityPill severity={w.severity} />
                <div>
                  <div className="font-serif text-base">{w.title}</div>
                  <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                    {w.detail}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {w.aos.map((a) => (
                    <span
                      key={a}
                      className="text-[10px] border border-ink px-1.5 py-0.5"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {/* Row 6: Printable revision summary */}
        <Section
          title="Printable Revision Summary"
          eyebrow="One-page exam-day reference"
          printable
        >
          <div className="border-2 border-ink p-6 bg-paper space-y-6">
            <div className="flex items-baseline justify-between border-b border-rule pb-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-ink-muted">
                  Edexcel · 9ET0/02
                </div>
                <div className="font-serif text-xl">Component 2: Prose — Exam-Day Sheet</div>
              </div>
              <div className="text-right text-xs text-ink-muted">
                {days} days to exam<br />
                01 Jun 2026
              </div>
            </div>

            <SummaryBlock title="Thesis templates">
              <ol className="list-decimal pl-5 space-y-2 text-sm font-serif italic">
                {PRINT_SUMMARY.thesisTemplates.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ol>
            </SummaryBlock>

            <SummaryBlock title="Anchor quotations">
              <ul className="space-y-3 text-sm">
                {PRINT_SUMMARY.keyQuotes.map((q, i) => (
                  <li key={i} className="grid grid-cols-[110px_1fr] gap-3">
                    <div className="text-[10px] uppercase tracking-wider text-ink-muted pt-1">
                      {q.text}
                    </div>
                    <div>
                      <div className="font-serif italic">"{q.quote}"</div>
                      <div className="text-xs text-ink-muted mt-1">{q.method}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </SummaryBlock>

            <SummaryBlock title="Context cues">
              <ul className="text-sm space-y-1 text-ink-muted">
                {PRINT_SUMMARY.contexts.map((c, i) => (
                  <li key={i}>· {c}</li>
                ))}
              </ul>
            </SummaryBlock>

            <SummaryBlock title="Paragraph checklist">
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-ink-muted list-disc pl-5">
                <li>Open with comparative claim, not a text.</li>
                <li>Name the method precisely.</li>
                <li>Embed micro-quotation.</li>
                <li>One context detail per ¶.</li>
                <li>One named critic / counter-reading.</li>
                <li>Close on the AO4 hinge.</li>
              </ul>
            </SummaryBlock>
          </div>
        </Section>
      </main>

      <footer className="border-t border-rule mt-10 print:hidden">
        <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-ink-muted flex justify-between">
          <span>Sandbox prototype · mock data only</span>
          <span>Component2DashboardMock</span>
        </div>
      </footer>
    </div>
  );
}

export default Component2DashboardMock;

// ------------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------------

function CountdownPanel({
  days,
  overall,
  band,
}: {
  days: number;
  overall: number;
  band: string;
}) {
  return (
    <div className="border border-rule p-6 bg-paper-dim">
      <div className="text-[10px] uppercase tracking-[0.25em] text-ink-muted">
        Exam countdown
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        <div className="font-serif text-6xl leading-none">{days}</div>
        <div className="text-xs text-ink-muted">
          days<br />01 Jun 2026<br />09:00, AM session
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-rule flex items-baseline justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-muted">
            Weighted readiness
          </div>
          <div className="font-serif text-2xl">{overall}%</div>
        </div>
        <BandPill band={band as "C" | "B" | "A" | "A*"} large />
      </div>
    </div>
  );
}

function NextTaskPanel({
  task,
  className = "",
}: {
  task: { title: string; reason: string; action: string; minutes: number };
  className?: string;
}) {
  return (
    <div className={`border border-ink p-6 bg-paper relative ${className}`}>
      <div className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.25em] text-ink-muted">
        Recommended next
      </div>
      <div className="text-[10px] uppercase tracking-[0.25em] text-ink-muted">
        Do this now · {task.minutes} min
      </div>
      <h3 className="font-serif text-2xl mt-2 leading-snug max-w-xl">
        {task.title}
      </h3>
      <p className="text-sm text-ink-muted mt-3 leading-relaxed">{task.reason}</p>
      <div className="mt-4 border-l-2 border-ink pl-4">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted">
          Action
        </div>
        <p className="text-sm mt-1">{task.action}</p>
      </div>
      <div className="mt-5 flex gap-2">
        <button className="text-xs uppercase tracking-wider border border-ink px-3 py-2 hover:bg-ink hover:text-paper transition-colors">
          Start timer
        </button>
        <button className="text-xs uppercase tracking-wider border border-rule px-3 py-2 hover:border-ink">
          Skip
        </button>
      </div>
    </div>
  );
}

function AOCard({ ao }: { ao: AO }) {
  const r = AO_READINESS[ao];
  const meta = AO_META[ao];
  const trendStr = r.trend > 0 ? `+${r.trend}` : `${r.trend}`;
  return (
    <div className="border border-rule p-4 bg-paper">
      <div className="flex items-baseline justify-between">
        <div className="font-serif text-xl">{ao}</div>
        <div className="text-[10px] uppercase tracking-wider text-ink-muted">
          {meta.weight}% weight
        </div>
      </div>
      <div className="text-[11px] text-ink-muted mt-1 leading-snug min-h-[28px]">
        {meta.label}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="font-serif text-3xl">{r.score}</div>
        <div
          className={`text-xs ${
            r.trend >= 0 ? "text-ink" : "text-ink-muted"
          }`}
        >
          {trendStr} this week
        </div>
      </div>
      <Bar value={r.score} className="mt-2" />
      <p className="text-[11px] text-ink-muted mt-3 leading-snug">{r.note}</p>
    </div>
  );
}

function Bar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 bg-rule relative ${className}`}>
      <div
        className="absolute inset-y-0 left-0 bg-ink"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-rule px-2 py-1 text-ink-muted">{children}</span>
  );
}

function BandPill({
  band,
  large = false,
}: {
  band: "C" | "B" | "A" | "A*";
  large?: boolean;
}) {
  const isTop = band === "A" || band === "A*";
  return (
    <span
      className={`inline-flex items-center justify-center font-serif border ${
        isTop ? "bg-ink text-paper border-ink" : "border-ink text-ink"
      } ${large ? "text-2xl px-3 py-1 min-w-[3rem]" : "text-xs px-2 py-0.5 min-w-[1.75rem]"}`}
    >
      {band}
    </span>
  );
}

function sevWeight(s: "high" | "med" | "low") {
  return s === "high" ? 3 : s === "med" ? 2 : 1;
}

function SeverityPill({ severity }: { severity: "high" | "med" | "low" }) {
  const label =
    severity === "high" ? "High" : severity === "med" ? "Medium" : "Low";
  const cls =
    severity === "high"
      ? "bg-ink text-paper border-ink"
      : severity === "med"
        ? "border-ink text-ink"
        : "border-rule text-ink-muted";
  return (
    <span
      className={`inline-flex items-center justify-center text-[10px] uppercase tracking-[0.2em] border px-2 py-1 w-fit ${cls}`}
    >
      {label} priority
    </span>
  );
}

function Section({
  title,
  eyebrow,
  children,
  printable = false,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  printable?: boolean;
}) {
  return (
    <section className={printable ? "" : "print:hidden"}>
      <div className="border-b border-rule pb-3 mb-5">
        <div className="text-[10px] uppercase tracking-[0.25em] text-ink-muted">
          {eyebrow}
        </div>
        <h2 className="font-serif text-2xl mt-1">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SummaryBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.25em] text-ink-muted mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}
