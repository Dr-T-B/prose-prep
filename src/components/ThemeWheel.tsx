import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ThemeRow {
  id: string;
  label: string;
  short: string;
  htAngle: string;
  atAngle: string;
  ao2: string | null;
  ao3: string | null;
  ao4: string | null;
  sortOrder: number | null;
}

interface Quote {
  id: string;
  text: string;
  attribution: string | null;
  location: string | null;
  source: string | null;
  themeTags: string[] | null;
  isVerified: boolean | null;
}

export default function Component2ThemeWheel() {
  const [themes, setThemes] = useState<ThemeRow[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const themesPromise = (supabase.from as unknown as (t: string) => ReturnType<typeof supabase.from>)(
      "themes",
    )
      .select("*")
      .order("sort_order", { ascending: true });

    const quotesPromise = supabase
      .from("quotes")
      .select("id, text, attribution, location, source, theme_tags, is_verified");

    Promise.all([themesPromise, quotesPromise]).then(([tRes, qRes]) => {
      if (cancelled) return;
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
      const mappedThemes: ThemeRow[] = (tRes.data ?? []).map((r) => {
        const row = r as Record<string, unknown>;
        return {
          id: row.id as string,
          label: row.label as string,
          short: row.short as string,
          htAngle: (row.ht_angle as string) ?? "",
          atAngle: (row.at_angle as string) ?? "",
          ao2: (row.ao2 as string | null) ?? null,
          ao3: (row.ao3 as string | null) ?? null,
          ao4: (row.ao4 as string | null) ?? null,
          sortOrder: (row.sort_order as number | null) ?? null,
        };
      });
      const mappedQuotes: Quote[] = (qRes.data ?? []).map((r) => ({
        id: r.id as string,
        text: (r.text as string) ?? "",
        attribution: (r.attribution as string | null) ?? null,
        location: (r.location as string | null) ?? null,
        source: (r.source as string | null) ?? null,
        themeTags: (r.theme_tags as string[] | null) ?? null,
        isVerified: (r.is_verified as boolean | null) ?? null,
      }));
      setThemes(mappedThemes);
      setQuotes(mappedQuotes);
      if (mappedThemes.length > 0) {
        setSelectedId((prev) => prev ?? mappedThemes[0].id);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const selected = useMemo(
    () => themes.find((t) => t.id === selectedId) ?? themes[0],
    [themes, selectedId],
  );

  const htQuotes = useMemo(() => {
    if (!selected) return [];
    return quotes.filter(
      (q) =>
        q.source === "hard-times" &&
        Array.isArray(q.themeTags) &&
        q.themeTags.includes(selected.id),
    );
  }, [quotes, selected]);

  const atQuotes = useMemo(() => {
    if (!selected) return [];
    return quotes.filter(
      (q) =>
        q.source === "atonement" &&
        Array.isArray(q.themeTags) &&
        q.themeTags.includes(selected.id),
    );
  }, [quotes, selected]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper text-ink flex items-center justify-center">
        <p className="text-sm text-ink-muted">Loading themes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-ink">Could not load themes.</p>
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

  if (!selected) {
    return (
      <div className="min-h-screen bg-paper text-ink flex items-center justify-center">
        <p className="text-sm text-ink-muted">No themes available.</p>
      </div>
    );
  }

  const size = 520;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 240;
  const rInner = 90;
  const n = themes.length;

  const slice = (i: number) => {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    const x0o = cx + rOuter * Math.cos(a0);
    const y0o = cy + rOuter * Math.sin(a0);
    const x1o = cx + rOuter * Math.cos(a1);
    const y1o = cy + rOuter * Math.sin(a1);
    const x0i = cx + rInner * Math.cos(a0);
    const y0i = cy + rInner * Math.sin(a0);
    const x1i = cx + rInner * Math.cos(a1);
    const y1i = cy + rInner * Math.sin(a1);
    const d = [
      `M ${x0o} ${y0o}`,
      `A ${rOuter} ${rOuter} 0 0 1 ${x1o} ${y1o}`,
      `L ${x1i} ${y1i}`,
      `A ${rInner} ${rInner} 0 0 0 ${x0i} ${y0i}`,
      "Z",
    ].join(" ");
    const am = (a0 + a1) / 2;
    const rm = (rOuter + rInner) / 2;
    const lx = cx + rm * Math.cos(am);
    const ly = cy + rm * Math.sin(am);
    const rot = (am * 180) / Math.PI;
    return { d, lx, ly, rot };
  };

  return (
    <div className="min-h-screen bg-paper text-ink relative">
      {/* TOKEN-EXCEPTION: print-only background reset for paper output */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-block { display: block !important; }
          body { background: white; }
        }
        .print-block { display: none; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-8 print:py-0">
        {/* Header */}
        <header className="flex items-start justify-between border-b border-rule pb-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-muted">
              Pearson Edexcel A-Level · Component 2: Prose (9ET0/02)
            </p>
            <h1 className="font-serif text-3xl mt-1">
              Theme Wheel — Hard Times &amp; Atonement
            </h1>
            <p className="text-sm text-ink-muted mt-1">
              Click a segment to load comparative AO notes. Optimised for
              revision and print.
            </p>
            <p className="text-[11px] text-ink-muted mt-2 max-w-2xl">
              Quote anchors are idea locators, not verbatim quotations. Verify
              exact wording in Penguin Hard Times or Vintage Atonement before
              citing in an essay.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print text-xs uppercase tracking-widest border border-rule px-3 py-2 hover:bg-paper"
          >
            Print
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-8 no-print">
          {/* Wheel */}
          <div>
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-auto"
              role="img"
              aria-label="Theme wheel"
            >
              {themes.map((t, i) => {
                const { d, lx, ly, rot } = slice(i);
                const active = t.id === selected.id;
                return (
                  <g
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className="cursor-pointer"
                  >
                    {/* TOKEN-EXCEPTION: SVG/chart wheel slice fills cannot use Tailwind classes */}
                    <path
                      d={d}
                      fill={active ? "#1c1917" : i % 2 ? "#e7e5e4" : "#f5f5f4"}
                      stroke="#a8a29e"
                      strokeWidth={0.75}
                      className="transition-colors"
                    />
                    {/* TOKEN-EXCEPTION: SVG/chart label fill */}
                    <text
                      x={lx}
                      y={ly}
                      transform={`rotate(${
                        rot > 90 || rot < -90 ? rot + 180 : rot
                      } ${lx} ${ly})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={11}
                      fontFamily="ui-sans-serif, system-ui"
                      fill={active ? "#fafaf9" : "#1c1917"}
                      style={{ pointerEvents: "none" }}
                    >
                      {t.short}
                    </text>
                  </g>
                );
              })}
              {/* TOKEN-EXCEPTION: SVG/chart inner circle fill */}
              <circle
                cx={cx}
                cy={cy}
                r={rInner - 2}
                fill="#fafaf9"
                stroke="#a8a29e"
              />
              {/* TOKEN-EXCEPTION: SVG/chart center text fill */}
              <text
                x={cx}
                y={cy - 8}
                textAnchor="middle"
                fontSize={12}
                fontFamily="ui-serif, Georgia"
                fill="#44403c"
              >
                Component 2
              </text>
              {/* TOKEN-EXCEPTION: SVG/chart center text fill */}
              <text
                x={cx}
                y={cy + 10}
                textAnchor="middle"
                fontSize={11}
                fill="#78716c"
              >
                Prose · Comparative
              </text>
              {/* TOKEN-EXCEPTION: SVG/chart center text fill */}
              <text
                x={cx}
                y={cy + 28}
                textAnchor="middle"
                fontSize={10}
                fill="#a8a29e"
              >
                AO1–AO4
              </text>
            </svg>
            <div className="mt-3 grid grid-cols-2 gap-1 text-[11px] text-ink-muted">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`text-left px-2 py-1 border ${
                    t.id === selected.id
                      ? "border-rule bg-paper text-ink"
                      : "border-rule hover:bg-paper"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <article className="bg-paper border border-rule p-6 shadow-sm">
            <ThemeDetail theme={selected} htQuotes={htQuotes} atQuotes={atQuotes} />
          </article>
        </div>

        {/* Printable section: all themes */}
        <section className="print-block mt-8">
          <h2 className="font-serif text-2xl border-b border-rule pb-2 mb-4">
            Revision Summary — All Themes
          </h2>
          <p className="text-[11px] text-ink-muted mb-4">
            Quote anchors are idea locators. Verify exact wording before citing.
          </p>
          <div className="space-y-6">
            {themes.map((t) => {
              const ht = quotes.filter(
                (q) =>
                  q.source === "hard-times" &&
                  Array.isArray(q.themeTags) &&
                  q.themeTags.includes(t.id),
              );
              const at = quotes.filter(
                (q) =>
                  q.source === "atonement" &&
                  Array.isArray(q.themeTags) &&
                  q.themeTags.includes(t.id),
              );
              return (
                <div key={t.id} className="break-inside-avoid">
                  <ThemeDetail theme={t} htQuotes={ht} atQuotes={at} compact />
                  <hr className="my-4 border-rule" />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function ThemeDetail({
  theme,
  htQuotes,
  atQuotes,
  compact = false,
}: {
  theme: ThemeRow;
  htQuotes: Quote[];
  atQuotes: Quote[];
  compact?: boolean;
}) {
  return (
    <div>
      <header className="mb-4">
        <p className="text-[11px] uppercase tracking-widest text-ink-muted">
          Theme cluster
        </p>
        <h2 className={`font-serif ${compact ? "text-xl" : "text-2xl"} mt-1`}>
          {theme.label}
        </h2>
      </header>

      <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2"} gap-4`}>
        <TextCard
          title="Hard Times — Dickens (1854)"
          angle={theme.htAngle}
          quotes={htQuotes}
        />
        <TextCard
          title="Atonement — McEwan (2001)"
          angle={theme.atAngle}
          quotes={atQuotes}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <AO label="AO2 · Methods" body={theme.ao2 ?? ""} />
        <AO label="AO3 · Context" body={theme.ao3 ?? ""} />
        <AO label="AO4 · Comparison route" body={theme.ao4 ?? ""} highlight />
      </div>
    </div>
  );
}

function TextCard({
  title,
  angle,
  quotes,
}: {
  title: string;
  angle: string;
  quotes: Quote[];
}) {
  return (
    <div className="border border-rule p-3 bg-paper">
      <p className="text-[11px] uppercase tracking-widest text-ink-muted">
        {title}
      </p>
      <p className="text-sm mt-1 leading-snug">{angle}</p>
      {quotes.length === 0 ? (
        <p className="mt-2 text-[11px] text-ink-muted italic">
          No tagged quotations yet for this theme.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {quotes.map((q) => {
            const verified = q.isVerified === true;
            return (
              <li
                key={q.id}
                className={`text-[12px] pl-2 border-l-2 ${
                  verified
                    ? "border-rule text-ink"
                    : "border-rule border-dashed text-ink-muted"
                }`}
              >
                <p
                  className={`text-[9px] uppercase tracking-widest mb-0.5 ${
                    verified ? "text-ink-muted" : "text-ao4"
                  }`}
                >
                  {verified ? "Verified quotation" : "Quote anchor / paraphrase"}
                </p>
                {verified ? (
                  <p className="italic">
                    "{q.text}"{" "}
                    <span className="not-italic text-ink-muted">
                      ({q.location ?? "—"})
                    </span>
                  </p>
                ) : (
                  <p>
                    {q.text}{" "}
                    <span className="text-ink-muted">({q.location ?? "—"})</span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AO({
  label,
  body,
  highlight,
}: {
  label: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border p-3 ${
        highlight
          ? "border-rule bg-paper text-ink"
          : "border-rule bg-paper"
      }`}
    >
      <p className="text-[10px] uppercase tracking-widest text-ink-muted">
        {label}
      </p>
      <p className="text-sm mt-1 leading-snug">{body}</p>
    </div>
  );
}
