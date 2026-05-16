import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Row {
  id: string;
  theme: string;
  hardTimes: string;
  atonement: string;
  ao2: string;
  ao3: string;
  ao4: string;
  thesis: string;
  character: string;
  narrative: string;
  structure: string;
  examFit: string;
}

const COLS: { key: keyof Row; label: string; ao?: string }[] = [
  { key: "hardTimes", label: "Hard Times argument" },
  { key: "atonement", label: "Atonement argument" },
  { key: "ao2", label: "AO2 method trigger", ao: "AO2" },
  { key: "ao3", label: "AO3 context", ao: "AO3" },
  { key: "ao4", label: "AO4 comparative link", ao: "AO4" },
  { key: "thesis", label: "Thesis sentence starter" },
];

const LENS_OPTIONS = [
  { key: "all", label: "All AOs" },
  { key: "character", label: "Character / function" },
  { key: "narrative", label: "Narrative method" },
  { key: "structure", label: "Structural method" },
  { key: "examFit", label: "Exam question suitability" },
] as const;

type LensKey = (typeof LENS_OPTIONS)[number]["key"];

export default function Component2ComparativeMatrix() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [lens, setLens] = useState<LensKey>("all");
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("comparative_matrix")
      .select(
        "id, axis, hard_times, atonement, ao2, ao3, ao4, thesis, character, narrative, structure, exam_fit",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError(err.message);
          setLoading(false);
          return;
        }
        const mapped: Row[] = (data ?? []).map((r) => ({
          id: r.id as string,
          theme: (r.axis as string) ?? "",
          hardTimes: (r.hard_times as string) ?? "",
          atonement: (r.atonement as string) ?? "",
          ao2: ((r as { ao2?: string }).ao2) ?? "",
          ao3: ((r as { ao3?: string }).ao3) ?? "",
          ao4: ((r as { ao4?: string }).ao4) ?? "",
          thesis: ((r as { thesis?: string }).thesis) ?? "",
          character: ((r as { character?: string }).character) ?? "",
          narrative: ((r as { narrative?: string }).narrative) ?? "",
          structure: ((r as { structure?: string }).structure) ?? "",
          examFit: ((r as { exam_fit?: string }).exam_fit) ?? "",
        }));
        setRows(mapped);
        if (mapped.length > 0) setOpenId((prev) => prev ?? mapped[0].id);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      Object.values(r).join(" ").toLowerCase().includes(q),
    );
  }, [rows, query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper text-ink flex items-center justify-center">
        <p className="text-sm text-ink-muted">Loading matrix…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-ink">Could not load the comparative matrix.</p>
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
      <div className="mx-auto max-w-7xl px-6 py-10 print:px-0 print:py-0">
        <header className="mb-8 border-b border-rule pb-6 print:mb-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
            Pearson Edexcel A-Level · Component 2 · Prose
          </p>
          <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight">
            Comparative Revision Matrix
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted">
            Hard Times (Dickens, 1854) vs Atonement (McEwan, 2001). Thematic
            rows with text-specific arguments, AO2–AO4 triggers and a thesis
            sentence starter for the comparative essay.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rows (e.g. Briony, Coketown, Dunkirk)…"
              className="w-72 rounded-md border border-rule bg-paper px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ink"
            />
            <div className="flex flex-wrap gap-1 rounded-md border border-rule p-1">
              {LENS_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setLens(opt.key)}
                  className={`rounded px-3 py-1 text-xs font-medium transition ${
                    lens === opt.key
                      ? "bg-ink text-paper"
                      : "text-ink-muted hover:bg-rule"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => window.print()}
              className="ml-auto rounded-md border border-rule px-3 py-2 text-xs font-medium hover:bg-rule"
            >
              Print matrix
            </button>
          </div>
        </header>

        {/* Wide-screen matrix */}
        <div className="hidden overflow-x-auto rounded-lg border border-rule lg:block print:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-rule/50">
              <tr>
                <th className="sticky left-0 z-10 w-48 bg-rule/50 p-3 font-mono text-xs uppercase tracking-wider text-ink-muted">
                  Theme
                </th>
                {visibleCols(lens).map((c) => (
                  <th
                    key={c.key as string}
                    className="min-w-[14rem] border-l border-rule p-3 font-mono text-xs uppercase tracking-wider text-ink-muted"
                  >
                    {c.ao && (
                      <span className="mr-1 rounded bg-ink/10 px-1.5 py-0.5 font-mono text-[10px] text-ink">
                        {c.ao}
                      </span>
                    )}
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr
                  key={row.id}
                  className={idx % 2 ? "bg-rule/20" : "bg-paper"}
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 w-48 border-t border-rule bg-inherit p-3 align-top font-serif text-base font-semibold"
                  >
                    {row.theme}
                  </th>
                  {visibleCols(lens).map((c) => (
                    <td
                      key={c.key as string}
                      className="min-w-[14rem] border-l border-t border-rule p-3 align-top text-sm leading-relaxed"
                    >
                      {row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile / tablet accordion */}
        <div className="space-y-3 lg:hidden print:hidden">
          {filtered.map((row) => {
            const open = openId === row.id;
            return (
              <article
                key={row.id}
                className="overflow-hidden rounded-lg border border-rule"
              >
                <button
                  onClick={() => setOpenId(open ? null : row.id)}
                  className="flex w-full items-center justify-between bg-rule/30 px-4 py-3 text-left"
                >
                  <span className="font-serif text-lg font-semibold">
                    {row.theme}
                  </span>
                  <span className="font-mono text-xs text-ink-muted">
                    {open ? "Hide" : "Open"}
                  </span>
                </button>
                {open && (
                  <div className="space-y-4 p-4">
                    <Pair label="Hard Times" body={row.hardTimes} />
                    <Pair label="Atonement" body={row.atonement} />
                    <AO label="AO2 · Method" body={row.ao2} />
                    <AO label="AO3 · Context" body={row.ao3} />
                    <AO label="AO4 · Comparison" body={row.ao4} />
                    <div className="rounded-md border-l-4 border-ink bg-ink/5 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink">
                        Thesis starter
                      </p>
                      <p className="mt-1 font-serif text-sm italic">
                        {row.thesis}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Meta label="Character" body={row.character} />
                      <Meta label="Narrative" body={row.narrative} />
                      <Meta label="Structure" body={row.structure} />
                      <Meta label="Exam fit" body={row.examFit} />
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Printable full dump */}
        <section className="hidden print:block">
          <div className="space-y-6 pt-4">
            {rows.map((row) => (
              <div key={row.id} className="break-inside-avoid border-t border-rule pt-4">
                <h2 className="font-serif text-xl font-semibold">{row.theme}</h2>
                <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <Print term="Hard Times" def={row.hardTimes} />
                  <Print term="Atonement" def={row.atonement} />
                  <Print term="AO2" def={row.ao2} />
                  <Print term="AO3" def={row.ao3} />
                  <Print term="AO4" def={row.ao4} />
                  <Print term="Thesis" def={row.thesis} />
                  <Print term="Exam fit" def={row.examFit} />
                </dl>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function visibleCols(lens: LensKey) {
  if (lens === "all") return COLS;
  const extraKey = lens as keyof Row;
  const extraLabel =
    LENS_OPTIONS.find((l) => l.key === lens)?.label ?? "Detail";
  return [
    { key: "hardTimes" as keyof Row, label: "Hard Times argument" },
    { key: "atonement" as keyof Row, label: "Atonement argument" },
    { key: extraKey, label: extraLabel },
    { key: "thesis" as keyof Row, label: "Thesis sentence starter" },
  ];
}

function Pair({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function AO({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-md bg-rule/40 p-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-ink">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function Meta({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded border border-rule p-2">
      <p className="font-mono text-[9px] uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <p className="mt-0.5 leading-snug">{body}</p>
    </div>
  );
}

function Print({ term, def }: { term: string; def: string }) {
  return (
    <>
      <dt className="font-mono uppercase tracking-wider text-ink-muted">
        {term}
      </dt>
      <dd className="leading-snug">{def}</dd>
    </>
  );
}
