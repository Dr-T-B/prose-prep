import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useGradeBMode } from "@/contexts/GradeBModeContext";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Component2Dashboard
 * -------------------
 * All six panels (AO readiness, theme readiness, quote recall, essay history,
 * weakness diagnosis, printable summary) now read from Supabase.
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
  level: number | null;
  band: "C" | "B" | "A" | "A*";
  weakest: AO;
};

interface Weakness {
  id: string;
  title: string;
  detail: string;
  aos: AO[];
  severity: "high" | "med" | "low";
}

interface DashboardMarkerRow {
  id: string;
  created_at: string;
  question_stem: string | null;
  provisional_level: string | null;
  result_json: {
    aoFeedback?: Partial<Record<AO, { level?: string; weakness?: string }>>;
    priorityWeaknesses?: string[];
  };
}

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

const MARKER_DATE_FMT = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" });

function formatMarkerDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return MARKER_DATE_FMT.format(d);
}

function parseLevel(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = s.match(/(\d+)\s*$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

function levelToBand(provisional_level: string | null): "C" | "B" | "A" | "A*" {
  switch (provisional_level) {
    case "Level 5":
      return "A*";
    case "Level 4":
      return "A";
    case "Level 3":
      return "B";
    default:
      return "C";
  }
}

const AO_ORDER: AO[] = ["AO1", "AO2", "AO3", "AO4"];

function weakestAo(
  aoFeedback: DashboardMarkerRow["result_json"]["aoFeedback"] | undefined,
): AO {
  if (!aoFeedback) return "AO2";
  let chosen: AO | null = null;
  let chosenLevel = Number.POSITIVE_INFINITY;
  for (const ao of AO_ORDER) {
    const lvl = parseLevel(aoFeedback[ao]?.level);
    if (lvl === null) continue;
    if (lvl < chosenLevel) {
      chosen = ao;
      chosenLevel = lvl;
    }
  }
  return chosen ?? "AO2";
}

function severityForLevel(level: number | null): "high" | "med" | "low" {
  if (level === null) return "med";
  if (level <= 3) return "high";
  if (level === 4) return "med";
  return "low";
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

function normalizeThemeKey(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const THEME_TAG_ALIASES: Record<string, string[]> = {
  education: ["education", "education and utilitarianism", "utilitarianism", "fact"],
  class: ["class", "social class", "class and power", "power"],
  guilt: ["guilt", "guilt and atonement", "atonement"],
  narrative: ["narrative", "narrative authority", "memory and truth", "truth"],
};

function quoteMatchesThemeTag(themeId: string, themeLabel: string, tags: string[] | null | undefined): boolean {
  if (!Array.isArray(tags)) return false;
  const accepted = new Set(
    [themeId, themeLabel, ...(THEME_TAG_ALIASES[normalizeThemeKey(themeId).replace(/\s+/g, "_")] ?? []), ...(THEME_TAG_ALIASES[normalizeThemeKey(themeId)] ?? [])]
      .map(normalizeThemeKey)
      .filter(Boolean),
  );
  return tags.some((tag) => accepted.has(normalizeThemeKey(tag)));
}

export function Component2Dashboard() {
  const { gradeBMode } = useGradeBMode();
  const { user, loading: authLoading } = useAuth();
  const days = daysUntil(EXAM_DATE_ISO);

  const [readiness, setReadiness] = useState<AoReadinessRow[]>([]);
  const [themes, setThemes] = useState<ThemeRow[]>([]);
  const [quoteProgress, setQuoteProgress] = useState<QuoteProgressRow[]>([]);
  const [markerResults, setMarkerResults] = useState<DashboardMarkerRow[]>([]);
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

    const markerResultsPromise = (supabase.from as unknown as (t: string) => ReturnType<typeof supabase.from>)(
      "essay_marker_results",
    )
      .select("id, created_at, question_stem, provisional_level, result_json")
      .order("created_at", { ascending: false })
      .limit(10);

    Promise.all([readinessPromise, themesPromise, quotesPromise, markerResultsPromise]).then(
      ([rRes, tRes, qRes, mRes]) => {
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
        if (mRes.error) {
          setError(mRes.error.message);
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
              quoteMatchesThemeTag(id, label, q.theme_tags),
          ).length;
          const at = quoteRows.filter(
            (q) =>
              q.source === "atonement" &&
              quoteMatchesThemeTag(id, label, q.theme_tags),
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

        const markerRows: DashboardMarkerRow[] = ((mRes.data ?? []) as unknown[]).map((r) => {
          const row = r as Record<string, unknown>;
          const json = (row.result_json ?? {}) as DashboardMarkerRow["result_json"];
          return {
            id: row.id as string,
            created_at: row.created_at as string,
            question_stem: (row.question_stem as string | null) ?? null,
            provisional_level: (row.provisional_level as string | null) ?? null,
            result_json: {
              aoFeedback: json.aoFeedback,
              priorityWeaknesses: json.priorityWeaknesses,
            },
          };
        });

        setReadiness(aoRows);
        setThemes(themeRows);
        setQuoteProgress([
          { text: "Hard Times", learned: htLearned, total: htTotal },
          { text: "Atonement", learned: atLearned, total: atTotal },
        ]);
        setMarkerResults(markerRows);
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
  const showAnon = !authLoading && !user;

  const essays = useMemo<Essay[]>(() => {
    return markerResults.map((mr) => ({
      id: mr.id,
      date: formatMarkerDate(mr.created_at),
      question: mr.question_stem ?? "Untitled attempt",
      level: parseLevel(mr.provisional_level),
      band: levelToBand(mr.provisional_level),
      weakest: weakestAo(mr.result_json.aoFeedback),
    }));
  }, [markerResults]);

  const mostRecentDate = essays[0]?.date ?? "";

  const weaknesses = useMemo<Weakness[]>(() => {
    type Carrier = Weakness & { _createdAt: string };
    const carriers: Carrier[] = [];
    for (const mr of markerResults) {
      const items = mr.result_json.priorityWeaknesses ?? [];
      const ao = weakestAo(mr.result_json.aoFeedback);
      const aoLevel = parseLevel(mr.result_json.aoFeedback?.[ao]?.level);
      const severity = severityForLevel(aoLevel);
      const take = items.slice(0, 2);
      take.forEach((text, index) => {
        const detail = text ?? "";
        const truncated = detail.length > 60;
        const title = truncated ? `${detail.slice(0, 60)}…` : detail;
        carriers.push({
          id: `${mr.id}:${index}`,
          title,
          detail,
          aos: [ao],
          severity,
          _createdAt: mr.created_at,
        });
      });
    }

    const seen = new Set<string>();
    const deduped: Carrier[] = [];
    for (const c of carriers) {
      const key = c.detail.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      deduped.push(c);
    }

    deduped.sort((a, b) => {
      const sev = sevWeight(b.severity) - sevWeight(a.severity);
      if (sev !== 0) return sev;
      return b._createdAt.localeCompare(a._createdAt);
    });

    return deduped.slice(0, 5).map(({ _createdAt: _omit, ...w }) => w);
  }, [markerResults]);

  const nextTask = useMemo(() => {
    if (weaknesses.length === 0) {
      return {
        title: "Draft one comparative paragraph",
        reason:
          "No diagnostic data yet — set a 25-minute timer and write one comparative paragraph using a verbatim quotation from each text.",
        action: "Pick any theme from the wheel; open Plan when you're ready to save it.",
        minutes: 25,
      };
    }
    const top = weaknesses[0];
    if (gradeBMode) {
      return {
        title: "Build one comparative paragraph in 4 steps",
        reason: `Step 1: write a claim that fits both novels. Step 2: quote from Atonement and name the method. Step 3: quote from Hard Times and name the method. Step 4: end with one sentence saying how they're similar or different. Focus: ${top.aos.join(", ")}.`,
        action: "Use this starter: 'Both novels show… however, while McEwan…, Dickens…'",
        minutes: 20,
      };
    }
    return {
      title: "Draft a 25-min comparative ¶ on Memory & Truth",
      reason: `Targets ${top.aos.join(", ")} — addresses: ${top.title}.`,
      action: "Use Atonement Part Three opening + Sissy/Stephen exchange (HT Bk II Ch. 6).",
      minutes: 25,
    };
  }, [gradeBMode, weaknesses]);

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
            {showAnon ? (
              <MarkerEmptyState variant="anonymous" />
            ) : essays.length === 0 ? (
              <MarkerEmptyState variant="empty" />
            ) : (
              <>
                <div className="border border-rule">
                  <div className="grid grid-cols-[60px_1fr_60px_50px] text-[10px] uppercase tracking-[0.2em] text-ink-muted bg-paper-dim border-b border-rule">
                    <div className="px-3 py-2">Date</div>
                    <div className="px-3 py-2">Question</div>
                    <div className="px-3 py-2 text-right">Level</div>
                    <div className="px-3 py-2 text-right">Band</div>
                  </div>
                  {essays.slice(0, 5).map((e) => (
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
                      <div className="px-3 py-3 text-right font-serif">{e.level ?? "—"}</div>
                      <div className="px-3 py-3 text-right">
                        <BandPill band={e.band} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-ink-muted">
                  {essays.length} marked attempt{essays.length === 1 ? "" : "s"}
                  {mostRecentDate ? ` · most recent: ${mostRecentDate}` : ""}
                </p>
              </>
            )}
          </Section>
        </div>

        {/* Row 5: Weakness diagnosis */}
        <Section title="Weakness Diagnosis" eyebrow="Where marks are leaking">
          {showAnon ? (
            <MarkerEmptyState variant="anonymous" />
          ) : weaknesses.length === 0 ? (
            <MarkerEmptyState variant="empty" />
          ) : (
            <ul className="divide-y divide-rule border-y border-rule">
              {weaknesses.map((w) => (
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
          )}
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

function MarkerEmptyState({ variant }: { variant: "anonymous" | "empty" }) {
  if (variant === "anonymous") {
    return (
      <p className="text-sm text-ink-muted leading-relaxed">
        <Link to="/auth" className="underline underline-offset-2 hover:text-ink">
          Sign in to see your marked attempts.
        </Link>
      </p>
    );
  }
  return (
    <p className="text-sm text-ink-muted leading-relaxed">
      No marked attempts yet. Submit an essay in{" "}
      <Link to="/essay-marker" className="underline underline-offset-2 hover:text-ink">
        /mark
      </Link>{" "}
      to see diagnostic feedback here.
    </p>
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
