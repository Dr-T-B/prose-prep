import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Component2Dashboard
 * -------------------
 * Wired panels (AO readiness, theme readiness, quote recall) read from
 * Supabase. Essay history and weakness diagnosis remain mock pending real
 * data — flagged with per-panel "Sample data" pills.
 *
 * Pearson Edexcel A-Level English Literature
 * Component 2: Prose · 9ET0/02 — assesses AO1–AO4 only.
 */

const EXAM_DATE_ISO = "2026-06-01";

type AO = "AO1" | "AO2" | "AO3" | "AO4";

interface AoReadinessRow {
  ao: AO;
  label: string;
  weight: number;
  score: number;
  trend: number;
  note: string;
}

interface ThemeRow {
  id: string;
  title: string;
  hardTimes: number;
  atonement: number;
  connection: string;
}

interface QuoteProgressRow {
  text: "Hard Times" | "Atonement";
  learned: number;
  total: number;
}

type Essay = {
  id: string;
  date: string;
  question: string;
  themeId: string;
  mark: number;
  band: "C" | "B" | "A" | "A*";
  weakest: AO;
};

// TODO: wire to essay_plans or timed_sessions when real data accrues
const ESSAYS: Essay[] = [
  { id: "e1", date: "12 Apr", question: "Compare presentations of guilt and the possibility of atonement.", themeId: "guilt", mark: 26, band: "B", weakest: "AO4" },
  { id: "e2", date: "26 Apr", question: "'Imagination is more dangerous than ignorance.'", themeId: "education", mark: 29, band: "B", weakest: "AO4" },
  { id: "e3", date: "08 May", question: "Compare the corrupting effects of social class.", themeId: "class", mark: 31, band: "A", weakest: "AO3" },
  { id: "e4", date: "13 May", question: "Compare uses of narrative form to shape moral response.", themeId: "narrative", mark: 28, band: "B", weakest: "AO2" },
];

// TODO: wire to essay_plans or timed_sessions when real data accrues
const WEAKNESSES: Array<{ id: string; title: string; severity: "high" | "med" | "low"; detail: string; aos: AO[] }> = [
  { id: "w1", title: "AO4 paragraph drift", severity: "high", aos: ["AO4"], detail: "Paragraphs 3–4 default to single-text analysis. Open every ¶ with a comparative claim." },
  { id: "w2", title: "Atonement context shallow", severity: "high", aos: ["AO3"], detail: "Postwar Britain, metafiction debates, McEwan on Lola's silence — currently 2 quotable references." },
  { id: "w3", title: "Critic citations missing", severity: "med", aos: ["AO3"], detail: "Bring in Leavis (HT) and Currie / Head (Atonement) by name to anchor critical context." },
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

function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

function bandFor(score: number): "C" | "B" | "A" | "A*" {
  if (score >= 85) return "A*";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  return "C";
}

function connectionLabel(ht: number, at: number): string {
  const hasHt = ht > 0;
  const hasAt = at > 0;
  if (hasHt && hasAt) {
    return ht >= 2 && at >= 2 ? "Strong both" : "Underdeveloped both sides";
  }
  if (hasHt) return "Hard Times only";
  if (hasAt) return "Atonement only";
  return "Underdeveloped";
}

export function Component2Dashboard() {
  const days = daysUntil(EXAM_DATE_ISO);

  const [readiness, setReadiness] = useState<AoReadinessRow[]>([]);
  const [themes, setThemes] = useState<ThemeRow[]>([]);
  const [quoteProgress, setQuoteProgress] = useState<QuoteProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const readinessPromise = (supabase.from as unknown as (t: string) => ReturnType<typeof supabase.from>)(
      "ao_readiness",
    )
      .select("*")
      .order("ao", { ascending: true });

    const themesPromise = (supabase.from as unknown as (t: string) => ReturnType<typeof supabase.from>)(
      "themes",
    )
      .select("id, label, sort_order")
      .order("sort_order", { ascending: true });

    const quotesPromise = supabase
      .from("quotes")
      .select("id, source, theme_tags, is_verified");

    Promise.all([readinessPromise, themesPromise, quotesPromise]).then(
      ([rRes, tRes, qRes]) => {
        if (cancelled) return;
        if (rRes.error) {
          setError(rRes.error.message);
          setLoading(false);
          return;
        }
        if (tRes.error) {
          setError(tRes.error.message);
          setLoading(false);
          return;
        }
        if (qRes.error) {
          setError(qRes.error.message);
          setLoading(false);
          return;
        }

        const aoRows: AoReadinessRow[] = (rRes.data ?? []).map((r) => {
          const row = r as Record<string, unknown>;
          return {
            ao: row.ao as AO,
            label: (row.label as string) ?? "",
            weight: Number(row.weight ?? 0),
            score: Number(row.score ?? 0),
            trend: Number(row.trend ?? 0),
            note: (row.note as string) ?? "",
          };
        });

        const quoteRows = (qRes.data ?? []) as Array<{
          id: string;
          source: string | null;
          theme_tags: string[] | null;
          is_verified: boolean | null;
        }>;

        const themeRows: ThemeRow[] = (tRes.data ?? []).map((r) => {
          const row = r as Record<string, unknown>;
          const id = row.id as string;
          const label = (row.label as string) ?? id;
          const ht = quoteRows.filter(
            (q) =>
              q.source === "hard-times" &&
              Array.isArray(q.theme_tags) &&
              q.theme_tags.includes(id),
          ).length;
          const at = quoteRows.filter(
            (q) =>
              q.source === "atonement" &&
              Array.isArray(q.theme_tags) &&
              q.theme_tags.includes(id),
          ).length;
          return {
            id,
            title: label,
            hardTimes: ht,
            atonement: at,
            connection: connectionLabel(ht, at),
          };
        });

        const htTotal = quoteRows.filter((q) => q.source === "hard-times").length;
        const htLearned = quoteRows.filter(
          (q) => q.source === "hard-times" && q.is_verified === true,
        ).length;
        const atTotal = quoteRows.filter((q) => q.source === "atonement").length;
        const atLearned = quoteRows.filter(
          (q) => q.source === "atonement" && q.is_verified === true,
        ).length;

        setReadiness(aoRows);
        setThemes(themeRows);
        setQuoteProgress([
          { text: "Hard Times", learned: htLearned, total: htTotal },
          { text: "Atonement", learned: atLearned, total: atTotal },
        ]);
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const overall = useMemo(() => {
    if (readiness.length === 0) return 0;
    const totalWeight = readiness.reduce((s, r) => s + r.weight, 0);
    if (totalWeight === 0) return 0;
    const weighted =
      readiness.reduce((s, r) => s + r.score * r.weight, 0) / totalWeight;
    return Math.round(weighted);
  }, [readiness]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-paper text-ink flex items-center justify-center">
        <p className="text-sm text-ink-muted">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-ink">Could not load the revision dashboard.</p>
        <p className="text-xs text-ink-muted max-w-md text-center">{error}</p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="rounded-md border border-rule px-3 py-2 text-xs font-medium hover:bg-rule"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink relative">
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {readiness.map((r) => (
              <AOCard key={r.ao} row={r} />
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
            {themes.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_120px_120px_1.4fr] items-center border-b border-rule last:border-b-0 text-sm"
              >
                <div className="px-4 py-3 font-serif">{t.title}</div>
                <div className="px-4 py-3 text-xs text-ink-muted">{t.hardTimes} quote{t.hardTimes === 1 ? "" : "s"}</div>
                <div className="px-4 py-3 text-xs text-ink-muted">{t.atonement} quote{t.atonement === 1 ? "" : "s"}</div>
                <div className="px-4 py-3 text-ink-muted text-xs leading-relaxed">
                  {t.connection}
                </div>
              </div>
            ))}
            {themes.length === 0 && (
              <div className="px-4 py-6 text-xs text-ink-muted">No themes loaded.</div>
            )}
          </div>
        </Section>

        {/* Row 4: Quote recall + Essay tracker */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Quote Recall" eyebrow="Memorisation">
            <div className="space-y-4">
              {quoteProgress.map((q) => {
                const pct = q.total > 0 ? Math.round((q.learned / q.total) * 100) : 0;
                return (
                  <div key={q.text} className="border border-rule p-4">
                    <div className="flex items-baseline justify-between">
                      <div className="font-serif text-lg">{q.text}</div>
                      <div className="text-xs text-ink-muted">
                        {q.learned}/{q.total} learned · {pct}%
                      </div>
                    </div>
                    <Bar value={pct} className="mt-3" />
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Comparative Essay Practice" eyebrow="Build → Test → Refine">
            <SampleDataPill />
            <div className="border border-rule mt-3">
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
          <SampleDataPill />
          <ul className="divide-y divide-rule border-y border-rule mt-3">
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
                <li>Close on the AO4 hinge.</li>
              </ul>
            </SummaryBlock>
          </div>
        </Section>
      </main>

      <footer className="border-t border-rule mt-10 print:hidden">
        <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-ink-muted flex justify-between">
          <span>Component 2 · Prose · 9ET0/02</span>
          <span>Component2Dashboard</span>
        </div>
      </footer>
    </div>
  );
}

export default Component2Dashboard;

function SampleDataPill() {
  return (
    <span className="text-ao1 border border-rule px-2 py-0.5 rounded text-xs">
      Sample data
    </span>
  );
}

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

function AOCard({ row }: { row: AoReadinessRow }) {
  const trendStr = row.trend > 0 ? `+${row.trend}` : `${row.trend}`;
  return (
    <div className="border border-rule p-4 bg-paper">
      <div className="flex items-baseline justify-between">
        <div className="font-serif text-xl">{row.ao}</div>
        <div className="text-[10px] uppercase tracking-wider text-ink-muted">
          {row.weight}% weight
        </div>
      </div>
      <div className="text-[11px] text-ink-muted mt-1 leading-snug min-h-[28px]">
        {row.label}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="font-serif text-3xl">{row.score}</div>
        <div
          className={`text-xs ${
            row.trend >= 0 ? "text-ink" : "text-ink-muted"
          }`}
        >
          {trendStr} this week
        </div>
      </div>
      <Bar value={row.score} className="mt-2" />
      <p className="text-[11px] text-ink-muted mt-3 leading-snug">{row.note}</p>
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
