import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { integrateBuilderHandoffsIntoCurrentPlan, type BuilderHandoffItem } from "@/lib/builderHandoff";

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
  themes: string[] | null;
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
  { key: "all", label: "All details" },
  { key: "character", label: "Character / function" },
  { key: "narrative", label: "Narrative method" },
  { key: "structure", label: "Structural method" },
  { key: "examFit", label: "Exam question suitability" },
] as const;

const AO_FILTER_OPTIONS = [
  { key: "all", label: "All AOs" },
  { key: "AO2", label: "AO2" },
  { key: "AO3", label: "AO3" },
  { key: "AO4", label: "AO4" },
] as const;

type LensKey = (typeof LENS_OPTIONS)[number]["key"];
type AoFilter = (typeof AO_FILTER_OPTIONS)[number]["key"];
type AoRowKey = Extract<keyof Row, "ao2" | "ao3" | "ao4">;

const AO_ROW_KEYS: Record<Exclude<AoFilter, "all">, AoRowKey> = {
  AO2: "ao2",
  AO3: "ao3",
  AO4: "ao4",
};

const hasText = (value: unknown) => typeof value === "string" && value.trim().length > 0;

export default function Component2ComparativeMatrix() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [lens, setLens] = useState<LensKey>("all");
  const [aoFilter, setAoFilter] = useState<AoFilter>("all");
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [printMode, setPrintMode] = useState<"compact" | "cards" | "teacher">("compact");
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("comparative_matrix")
      .select(
        "id, axis, hard_times, atonement, ao2, ao3, ao4, thesis, character, narrative, structure, exam_fit, themes",
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
          themes: ((r as { themes?: string[] | null }).themes) ?? null,
        }));
        setRows(mapped);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const themeOptions = useMemo(() => {
    const allThemes = new Set<string>();
    rows.forEach((row) => {
      if (row.themes && Array.isArray(row.themes)) {
        row.themes.forEach((t) => {
          if (t) allThemes.add(t);
        });
      }
    });
    return Array.from(allThemes).sort();
  }, [rows]);

  const toggleTheme = (theme: string) => {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  const formatThemeLabel = (themeId: string) => {
    if (!themeId) return "";
    const spaced = themeId.replace(/-/g, " ");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  const handleCopy = (row: Row) => {
    const text = formatComparativeRouteExport(row);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedId(row.id);
          setTimeout(() => {
            setCopiedId(null);
          }, 2000);
        })
        .catch((err) => {
          console.error("Clipboard copy failed:", err);
          alert("Failed to copy route to clipboard. Please copy manually.");
        });
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
        setCopiedId(row.id);
        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      } catch (err) {
        console.error("Fallback copy failed:", err);
        alert("Copy not supported on this browser. Please copy manually.");
      }
      document.body.removeChild(textarea);
    }
  };

  const handleSendToEssayBuilder = (row: Row) => {
    try {
      const handoff = createMatrixRouteBuilderHandoff(row);
      integrateBuilderHandoffsIntoCurrentPlan([handoff]);
      navigate("/builder");
    } catch (err) {
      console.error("Failed to send comparative route to essay builder:", err);
      navigate("/builder");
    }
  };

  const filtered = useMemo(() => {
    let result = rows;
    if (aoFilter !== "all") {
      const aoKey = AO_ROW_KEYS[aoFilter];
      result = result.filter((r) => hasText(r[aoKey]));
    }
    if (selectedThemes.length > 0) {
      result = result.filter(r => {
        const rowThemes = r.themes ?? [];
        return selectedThemes.some(theme => rowThemes.includes(theme));
      });
    }
    const q = query.trim().toLowerCase();
    if (!q) return result;
    return result.filter((r) =>
      Object.values(r)
        .map(v => Array.isArray(v) ? v.join(" ") : v)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, query, aoFilter, selectedThemes]);

  const getSubtitle = (ht: string, at: string) => {
    const getFocus = (str: string) => str.split(/[.,;]/)[0];
    return `${getFocus(ht)} ↔ ${getFocus(at)}`;
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedIds(new Set(filtered.map((r) => r.id)));
  const collapseAll = () => setExpandedIds(new Set());
  const clearFilters = () => {
    setQuery("");
    setAoFilter("all");
    setLens("all");
    setSelectedThemes([]);
  };

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
            <span className="text-sm text-ink-muted font-medium w-full mb-2">
              Showing {filtered.length} of {rows.length} comparative routes
              {aoFilter !== "all" ? ` (${aoFilter.toUpperCase()} filter active)` : ""}
              {selectedThemes.length > 0 ? ` (${selectedThemes.length} theme${selectedThemes.length > 1 ? "s" : ""} selected)` : ""}
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rows (e.g. Briony, Coketown, Dunkirk)…"
              className="w-72 rounded-md border border-rule bg-paper px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ink"
            />
            <div className="flex flex-wrap gap-1 rounded-md border border-rule p-1">
              {AO_FILTER_OPTIONS.map((ao) => (
                <button
                  key={ao.key}
                  onClick={() => setAoFilter(ao.key)}
                  aria-pressed={aoFilter === ao.key}
                  className={`rounded px-3 py-1 text-xs font-medium transition ${
                    aoFilter === ao.key
                      ? "bg-ink text-paper"
                      : "text-ink-muted hover:bg-rule"
                  }`}
                >
                  {ao.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 rounded-md border border-rule p-1">
              {LENS_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setLens(opt.key)}
                  aria-pressed={lens === opt.key}
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
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={expandAll} className="rounded-md border border-rule px-3 py-1 text-xs font-medium hover:bg-rule">Expand all</button>
              <button type="button" onClick={collapseAll} className="rounded-md border border-rule px-3 py-1 text-xs font-medium hover:bg-rule">Collapse all</button>
              <button type="button" onClick={clearFilters} className="rounded-md border border-rule px-3 py-1 text-xs font-medium hover:bg-rule">Clear filters</button>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <select
                value={printMode}
                onChange={(e) => setPrintMode(e.target.value as any)}
                className="rounded-md border border-rule bg-paper px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ink"
              >
                <option value="compact">Compact Matrix</option>
                <option value="cards">Revision Cards</option>
                <option value="teacher">Teacher Pack</option>
              </select>
              <button
                onClick={() => window.print()}
                className="rounded-md border border-rule px-3 py-2 text-xs font-medium hover:bg-rule"
              >
                Print {printMode === "compact" ? "compact matrix" : printMode === "cards" ? "revision cards" : "teacher pack"}
              </button>
            </div>
            {themeOptions.length > 0 && (
              <div className="w-full flex flex-wrap items-center gap-1.5 mt-2 bg-rule/5 p-2 rounded-md border border-rule/50">
                <span className="text-xs font-mono uppercase tracking-wider text-ink-muted mr-2">Filter by Themes:</span>
                {themeOptions.map((theme) => {
                  const isSelected = selectedThemes.includes(theme);
                  const label = formatThemeLabel(theme);
                  return (
                    <button
                      key={theme}
                      onClick={() => toggleTheme(theme)}
                      aria-pressed={isSelected}
                      aria-label={`Toggle ${label} theme filter`}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                        isSelected
                          ? "bg-ink text-paper"
                          : "border border-rule bg-paper text-ink-muted hover:bg-rule/40 hover:text-ink"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
                {selectedThemes.length > 0 && (
                  <button
                    onClick={() => setSelectedThemes([])}
                    aria-label="Reset theme filters"
                    className="ml-auto text-xs font-medium text-ink-muted hover:text-ink underline underline-offset-2 decoration-dotted"
                  >
                    Reset themes
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-rule p-8 text-center bg-paper mt-4">
            <p className="text-sm text-ink font-medium">
              No comparative routes match the current filters. Try clearing a theme or search term.
            </p>
            <button
              onClick={clearFilters}
              aria-label="Clear all active filters"
              className="mt-3 rounded-md border border-rule px-3 py-1.5 text-xs font-medium hover:bg-rule"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* Wide-screen matrix */}
            <div className={`hidden overflow-x-auto rounded-lg border border-rule lg:block ${printMode === 'compact' ? 'print:block' : 'print:hidden'}`}>
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-rule/50">
                  <tr>
                    <th className="sticky left-0 z-10 w-48 bg-rule/50 p-3 font-mono text-xs uppercase tracking-wider text-ink-muted">
                      Theme
                    </th>
                    {visibleCols(lens, aoFilter).map((c) => (
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
                        <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-ink-muted font-normal leading-tight mb-2">
                          {getSubtitle(row.hardTimes, row.atonement)}
                        </div>
                        <div className="flex flex-col gap-1.5 items-start print:hidden">
                          <button
                            onClick={() => handleCopy(row)}
                            aria-label={`Copy comparative route for ${row.theme}`}
                            className="inline-flex items-center gap-1 rounded border border-rule bg-paper px-2 py-0.5 font-mono text-[10px] font-medium text-ink-muted hover:bg-rule/40 hover:text-ink transition"
                          >
                            {copiedId === row.id ? "Copied!" : "Copy route"}
                          </button>
                          <button
                            onClick={() => handleSendToEssayBuilder(row)}
                            aria-label={`Send comparative route for ${row.theme} to Essay Builder`}
                            className="inline-flex items-center gap-1 rounded border border-rule bg-paper px-2 py-0.5 font-mono text-[10px] font-medium text-ink-muted hover:bg-rule/40 hover:text-ink transition"
                          >
                            Send to Essay Builder
                          </button>
                        </div>
                      </th>
                      {visibleCols(lens, aoFilter).map((c) => (
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
            <div className={`space-y-3 lg:hidden ${printMode === 'cards' ? 'print:block' : 'print:hidden'}`}>
              {filtered.map((row) => {
                const open = expandedIds.has(row.id);
                return (
                  <article
                    key={row.id}
                    className="overflow-hidden rounded-lg border border-rule"
                  >
                    <button
                      onClick={() => toggleExpanded(row.id)}
                      aria-expanded={open}
                      aria-controls={`comparative-matrix-route-${row.id}`}
                      className="flex w-full items-center justify-between bg-rule/30 px-4 py-3 text-left"
                    >
                      <div className="flex-1 pr-4">
                        <span className="block font-serif text-lg font-semibold">
                          {row.theme}
                        </span>
                        <span className="block mt-1 font-mono text-[10px] uppercase text-ink-muted leading-tight">
                          {getSubtitle(row.hardTimes, row.atonement)}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-ink-muted">
                        {open ? "Hide" : "Open"}
                      </span>
                    </button>
                    {open && (
                      <div id={`comparative-matrix-route-${row.id}`} className="space-y-4 p-4">
                        <Pair label="Hard Times" body={row.hardTimes} />
                        <Pair label="Atonement" body={row.atonement} />
                        {(() => {
                          const aoItems = [
                            { key: "ao2", label: "AO2 Method", body: row.ao2 },
                            { key: "ao3", label: "AO3 Context", body: row.ao3 },
                            { key: "ao4", label: "AO4 Compare", body: row.ao4 },
                          ];
                          
                          if (aoFilter !== "all") {
                            return aoItems
                              .filter((item) => item.key === AO_ROW_KEYS[aoFilter])
                              .map((item) => {
                                if (aoFilter === "AO2") return { ...item, label: "Method" };
                                if (aoFilter === "AO3") return { ...item, label: "Context" };
                                return { ...item, label: "Comparative Link" };
                              })
                              .map((item) => (
                                <AO key={item.key} label={item.label} body={item.body} />
                              ));
                          }

                          return aoItems.map(item => (
                            <AO key={item.key} label={item.label} body={item.body} />
                          ));
                        })()}
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
                        <div className="grid grid-cols-2 gap-2 mt-3 print:hidden">
                          <button
                            onClick={() => handleCopy(row)}
                            aria-label={`Copy comparative route for ${row.theme}`}
                            className="inline-flex items-center justify-center gap-1 rounded border border-rule bg-paper py-1.5 font-mono text-xs font-medium text-ink-muted hover:bg-rule/40 hover:text-ink transition"
                          >
                            {copiedId === row.id ? "Copied!" : "Copy route"}
                          </button>
                          <button
                            onClick={() => handleSendToEssayBuilder(row)}
                            aria-label={`Send comparative route for ${row.theme} to Essay Builder`}
                            className="inline-flex items-center justify-center gap-1 rounded border border-rule bg-paper py-1.5 font-mono text-xs font-medium text-ink-muted hover:bg-rule/40 hover:text-ink transition"
                          >
                            Send to Essay Builder
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}

        {/* Printable full dump */}
        <section className={`hidden ${printMode === 'teacher' ? 'print:block' : 'print:hidden'}`}>
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

function visibleCols(lens: LensKey, aoFilter: AoFilter) {
  const selectedAoKey = aoFilter === "all" ? null : AO_ROW_KEYS[aoFilter];
  const cols = selectedAoKey
    ? COLS.filter((col) => !col.ao || col.key === selectedAoKey)
    : COLS;

  if (lens === "all") return cols;
  const extraKey = lens as keyof Row;
  const extraLabel =
    LENS_OPTIONS.find((l) => l.key === lens)?.label ?? "Detail";
  const lensCols = [
    { key: "hardTimes" as keyof Row, label: "Hard Times argument" },
    { key: "atonement" as keyof Row, label: "Atonement argument" },
    { key: "thesis" as keyof Row, label: "Thesis sentence starter" },
  ];
  if (selectedAoKey) {
    const selectedAoCol = COLS.find((col) => col.key === selectedAoKey);
    if (selectedAoCol) lensCols.splice(2, 0, selectedAoCol);
  }
  if (!lensCols.some((col) => col.key === extraKey)) {
    lensCols.splice(lensCols.length - 1, 0, { key: extraKey, label: extraLabel });
  }
  return lensCols;
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

function formatComparativeRouteExport(row: Row): string {
  const parts: string[] = [];
  
  parts.push(`# Comparative Route: ${row.theme}`);
  
  if (row.themes && row.themes.length > 0) {
    const readableThemes = row.themes
      .map((t) => {
        const spaced = t.replace(/-/g, " ");
        return spaced.charAt(0).toUpperCase() + spaced.slice(1);
      })
      .join(", ");
    parts.push(`Themes: ${readableThemes}`);
  }
  
  if (row.thesis) {
    parts.push(`Thesis:\n${row.thesis}`);
  }
  
  if (row.hardTimes) {
    parts.push(`Hard Times:\n${row.hardTimes}`);
  }
  
  if (row.atonement) {
    parts.push(`Atonement:\n${row.atonement}`);
  }
  
  if (row.ao2) {
    parts.push(`AO2 — Method:\n${row.ao2}`);
  }
  
  if (row.ao3) {
    parts.push(`AO3 — Context:\n${row.ao3}`);
  }
  
  if (row.ao4) {
    parts.push(`AO4 — Comparison:\n${row.ao4}`);
  }
  
  if (row.examFit) {
    parts.push(`Exam fit:\n${row.examFit}`);
  }
  
  parts.push(`Revision use:\nUse this route as a paragraph plan or mini essay scaffold. Adapt quotations and contextual evidence to the exact question.`);
  
  return parts.join("\n\n");
}

function createMatrixRouteBuilderHandoff(row: Row): BuilderHandoffItem {
  const metadata: Record<string, string | string[]> = {
    source: "comparative_matrix",
    axis: row.theme,
    hardTimes: row.hardTimes,
    atonement: row.atonement,
    thesis: row.thesis,
    ao2: row.ao2,
    ao3: row.ao3,
    ao4: row.ao4,
    character: row.character,
    narrative: row.narrative,
    structure: row.structure,
    examFit: row.examFit,
  };

  if (row.themes && row.themes.length > 0) {
    metadata.themes = row.themes;
  }

  return {
    id: `comparison:matrix:${row.id}`,
    kind: "comparison",
    originModule: "comparison",
    label: "Comparative Route",
    title: row.theme,
    text: row.thesis || `Comparative route for ${row.theme}.`,
    sourceText: formatComparativeRouteExport(row),
    family: row.themes && row.themes.length > 0 ? (row.themes[0] as any) : undefined,
    metadata,
  };
}
