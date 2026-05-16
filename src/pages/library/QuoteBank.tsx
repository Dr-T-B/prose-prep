import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Quote = {
  id: string;
  text: string;
  attribution: string;
  location: string | null;
  source: "hard-times" | "atonement";
  word_analysis: string | null;
  a_star_insight: string | null;
  anchor_id: string | null;
  paired_anchor_id: string | null;
  is_verified: boolean;
  ao_tags: string[];
  theme_tags: string[];
  created_at: string;
};

const SOURCE_LABEL: Record<string, string> = {
  "hard-times": "Hard Times",
  atonement: "Atonement",
};
const SOURCE_BADGE: Record<string, string> = {
  "hard-times": "bg-hard-times text-paper",
  atonement: "bg-atonement text-paper",
};
const AO_TEXT: Record<string, string> = {
  AO1: "text-ao1",
  AO2: "text-ao2",
  AO3: "text-ao3",
  AO4: "text-ao4",
  AO5: "text-ao5",
};

const ALL = "All";

function unique(values: string[]) {
  return [ALL, ...Array.from(new Set(values)).sort()];
}

type Filters = {
  source: string;
  theme: string;
  ao: string;
  q: string;
};

export default function QuoteBank() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    source: ALL,
    theme: ALL,
    ao: ALL,
    q: "",
  });

  useEffect(() => {
    supabase
      .from("quotes")
      .select("*")
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setQuotes((data as Quote[]) ?? []);
        }
        setLoading(false);
      });
  }, []);

  const opts = useMemo(
    () => ({
      theme: unique(quotes.flatMap((q) => q.theme_tags)),
      ao: [ALL, "AO1", "AO2", "AO3", "AO4", "AO5"],
    }),
    [quotes]
  );

  const filtered = useMemo(
    () =>
      quotes.filter((q) => {
        if (filters.source !== ALL && q.source !== filters.source) return false;
        if (filters.theme !== ALL && !q.theme_tags.includes(filters.theme))
          return false;
        if (filters.ao !== ALL && !q.ao_tags.includes(filters.ao)) return false;
        if (filters.q.trim()) {
          const needle = filters.q.toLowerCase();
          const hay =
            `${q.text} ${q.attribution} ${q.word_analysis ?? ""} ${q.a_star_insight ?? ""}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      }),
    [filters, quotes]
  );

  const reset = () =>
    setFilters({ source: ALL, theme: ALL, ao: ALL, q: "" });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-ink-muted">
        Loading quotes…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="rounded-sm border border-rule bg-paper p-4 text-sm text-ink-muted">
          Failed to load quotes: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 bg-paper text-ink print:px-0 print:py-0">
      <header className="mb-6 border-b border-rule pb-4 print:mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">
            Component 2 · Prose · Sandbox
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
            Quote &amp; Method Bank
          </h1>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-ink-muted">
          Retrieval interface for <em>Hard Times</em> and <em>Atonement</em>.
          Each card follows the formula{" "}
          <strong className="mx-1 text-ink">Method → Word → Effect → Theme</strong>{" "}
          for fast paragraph construction.
        </p>
        <p className="mt-2 max-w-3xl text-xs text-ink-muted">
          Cards are tagged either{" "}
          <strong className="text-ink">Verified quotation</strong> (verbatim,
          exact wording checked) or{" "}
          <strong className="text-ink">Quote anchor / paraphrase</strong> (a
          locator for an idea — verify exact wording in the Penguin Classics{" "}
          <em>Hard Times</em> or Vintage <em>Atonement</em> before citing in an
          exam).
        </p>
      </header>

      <section className="mb-6 grid gap-3 rounded-sm border border-rule bg-paper-dim/30 p-4 print:hidden md:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-mono uppercase tracking-wide text-ink-muted">
            Text
          </span>
          <select
            value={filters.source}
            onChange={(e) =>
              setFilters((f) => ({ ...f, source: e.target.value }))
            }
            className="rounded-sm border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
          >
            <option value={ALL}>All</option>
            <option value="hard-times">Hard Times</option>
            <option value="atonement">Atonement</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-mono uppercase tracking-wide text-ink-muted">
            Theme
          </span>
          <select
            value={filters.theme}
            onChange={(e) =>
              setFilters((f) => ({ ...f, theme: e.target.value }))
            }
            className="rounded-sm border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
          >
            {opts.theme.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-mono uppercase tracking-wide text-ink-muted">
            AO
          </span>
          <select
            value={filters.ao}
            onChange={(e) =>
              setFilters((f) => ({ ...f, ao: e.target.value }))
            }
            className="rounded-sm border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
          >
            {opts.ao.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs md:col-span-3">
          <span className="font-mono uppercase tracking-wide text-ink-muted">
            Search quote / analysis
          </span>
          <input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="e.g. shroud, muddle, oblivious"
            className="rounded-sm border border-rule bg-paper px-2 py-1.5 text-sm text-ink"
          />
        </label>
        <div className="flex items-end gap-2">
          <button
            onClick={reset}
            className="rounded-sm border border-rule bg-paper px-3 py-1.5 text-sm text-ink hover:bg-paper-dim"
          >
            Reset
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-sm border border-rule bg-ink px-3 py-1.5 text-sm text-paper hover:opacity-90"
          >
            Print
          </button>
        </div>
      </section>

      <p className="mb-3 text-xs text-ink-muted print:mb-2">
        Showing <strong className="text-ink">{filtered.length}</strong> of{" "}
        {quotes.length} quotes.
      </p>

      <div className="grid gap-4 md:grid-cols-2 print:grid-cols-1 print:gap-2">
        {filtered.map((q) => {
          const isVerbatim = q.is_verified;
          const sourceBadge =
            SOURCE_BADGE[q.source] ?? "bg-paper text-ink";
          const sourceLabel = SOURCE_LABEL[q.source] ?? q.source;
          return (
            <article
              key={q.id}
              data-anchor-id={q.anchor_id ?? undefined}
              data-paired-anchor={q.paired_anchor_id ?? undefined}
              data-verified={isVerbatim}
              className={
                "break-inside-avoid rounded-sm border bg-paper p-4 shadow-card print:shadow-none " +
                (isVerbatim ? "border-rule" : "border-dashed border-rule")
              }
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider">
                <span className={"rounded-sm px-1.5 py-0.5 " + sourceBadge}>
                  {sourceLabel}
                </span>
                {q.theme_tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-sm border border-rule px-1.5 py-0.5 text-ink-muted"
                  >
                    {t}
                  </span>
                ))}
                {q.ao_tags.map((a) => (
                  <span
                    key={a}
                    className={
                      "rounded-sm border border-rule px-1.5 py-0.5 bg-paper-dim/60 " +
                      (AO_TEXT[a] ?? "")
                    }
                  >
                    {a}
                  </span>
                ))}
                <span
                  className={
                    "rounded-sm px-1.5 py-0.5 border " +
                    (isVerbatim
                      ? "border-rule bg-paper-dim/60 text-ink"
                      : "border-dashed border-rule bg-paper-dim/40 text-ink-muted")
                  }
                  title={
                    isVerbatim
                      ? "Exact wording checked"
                      : "Locator for an idea — verify exact wording before citing"
                  }
                >
                  {isVerbatim ? "Verified quotation" : "Quote anchor / paraphrase"}
                </span>
              </div>

              <blockquote
                className={
                  "border-l-2 pl-3 font-serif text-base italic leading-snug text-ink " +
                  (isVerbatim ? "border-rule" : "border-dashed border-rule")
                }
              >
                {isVerbatim ? `"${q.text}"` : q.text}
              </blockquote>
              <p className="mt-1 text-xs text-ink-muted">
                {q.attribution}
                {q.location ? ` · ${q.location}` : ""}
              </p>

              <dl className="mt-3 grid grid-cols-1 gap-2 text-sm">
                {q.word_analysis && (
                  <Row label="Word-level" value={q.word_analysis} />
                )}
                {q.theme_tags.length > 0 && (
                  <Row label="Theme link" value={q.theme_tags.join(" · ")} />
                )}
                {q.a_star_insight && (
                  <Row label="A/A* insight (AO5)" value={q.a_star_insight} />
                )}
                {q.paired_anchor_id && (
                  <Row label="Paired anchor" value={q.paired_anchor_id} />
                )}
              </dl>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full rounded-sm border border-dashed border-rule p-8 text-center text-sm text-ink-muted">
            No quotes match these filters. Try resetting.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2">
      <dt className="text-[11px] font-mono uppercase tracking-wide text-ink-muted">
        {label}
      </dt>
      <dd className="text-sm text-ink">{value}</dd>
    </div>
  );
}
