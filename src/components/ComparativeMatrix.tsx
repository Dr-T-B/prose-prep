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

type AoFilter = "all" | "AO2" | "AO3" | "AO4";
type PrintMode = "compact" | "cards" | "teacher";
type TagField = "character" | "narrative" | "structure" | "examFit";
type MatrixFilters = {
  ao: AoFilter;
  character: string;
  narrative: string;
  structure: string;
  examFit: string;
};

const PRINT_MODE_LABELS: Record<PrintMode, string> = {
  compact: "Compact matrix",
  cards: "Revision cards",
  teacher: "Full teacher pack",
};

const AO_FILTER_OPTIONS: Exclude<AoFilter, "all">[] = ["AO2", "AO3", "AO4"];

const PREVIEW_LENGTHS = {
  screenArgument: 190,
  screenTag: 58,
  compactText: 115,
  compactAo: 80,
  compactExamFit: 70,
  cardArgument: 230,
  cardAo: 180,
  cardSummary: 220,
};

const EMPTY_FILTERS: MatrixFilters = {
  ao: "all",
  character: "all",
  narrative: "all",
  structure: "all",
  examFit: "all",
};

export default function Component2ComparativeMatrix() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [printMode, setPrintMode] = useState<PrintMode>("compact");
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
        setExpandedIds((prev) => {
          if (prev.size || mapped.length === 0) return prev;
          return new Set([mapped[0].id]);
        });
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filterOptions = useMemo(
    () => ({
      character: collectTagOptions(rows, "character"),
      narrative: collectTagOptions(rows, "narrative"),
      structure: collectTagOptions(rows, "structure"),
      examFit: collectTagOptions(rows, "examFit"),
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const searchMatch = q
        ? Object.values(row).join(" ").toLowerCase().includes(q)
        : true;
      const aoMatch =
        filters.ao === "all" || getAoText(row, filters.ao).trim().length > 0;
      const tagMatch = (field: TagField) =>
        filters[field] === "all" ||
        row[field].toLowerCase().includes(filters[field].toLowerCase());

      return (
        searchMatch &&
        aoMatch &&
        tagMatch("character") &&
        tagMatch("narrative") &&
        tagMatch("structure") &&
        tagMatch("examFit")
      );
    });
  }, [filters, query, rows]);

  const hasFilters =
    query.trim() ||
    filters.ao !== "all" ||
    filters.character !== "all" ||
    filters.narrative !== "all" ||
    filters.structure !== "all" ||
    filters.examFit !== "all";

  const setFilter = (key: keyof MatrixFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const expandAll = () => setExpandedIds(new Set(filtered.map((row) => row.id)));
  const collapseAll = () => setExpandedIds(new Set());
  const clearFilters = () => {
    setQuery("");
    setFilters(EMPTY_FILTERS);
  };

  const printSelectedMode = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper text-ink flex items-center justify-center">
        <p className="text-sm text-ink-muted">Loading matrix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-ink">Could not load the comparative matrix.</p>
        <p className="max-w-md text-center text-xs text-ink-muted">{error}</p>
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
    <div className="min-h-screen bg-paper text-ink">
      <ComparativeMatrixPrintStyles />
      <main className="matrix-screen-ui mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-rule pb-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
            Pearson Edexcel A-Level - Component 2 - Prose
          </p>
          <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight">
            Comparative Revision Matrix
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
            Card-based revision routes for Hard Times and Atonement, with AO2,
            AO3 and AO4 kept visible for fast planning and controlled printing.
          </p>
        </header>

        <ComparativeMatrixToolbar
          query={query}
          filters={filters}
          filterOptions={filterOptions}
          printMode={printMode}
          resultCount={filtered.length}
          totalCount={rows.length}
          hasFilters={Boolean(hasFilters)}
          onQueryChange={setQuery}
          onFilterChange={setFilter}
          onPrintModeChange={setPrintMode}
          onPrint={printSelectedMode}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onClearFilters={clearFilters}
        />

        {filtered.length === 0 ? (
          <section className="mt-6 rounded-lg border border-rule bg-paper p-6 text-sm text-ink-muted">
            No routes match the current filters.
          </section>
        ) : (
          <section
            aria-label="Comparative revision routes"
            className="mt-6 grid gap-4 lg:grid-cols-2"
          >
            {filtered.map((row) => {
              const expanded = expandedIds.has(row.id);
              return (
                <ComparativeMatrixCard
                  key={row.id}
                  row={row}
                  expanded={expanded}
                  onToggle={() =>
                    setExpandedIds((current) => {
                      const next = new Set(current);
                      if (next.has(row.id)) next.delete(row.id);
                      else next.add(row.id);
                      return next;
                    })
                  }
                />
              );
            })}
          </section>
        )}
      </main>

      <ComparativeMatrixPrintView mode={printMode} rows={filtered} />
    </div>
  );
}

function ComparativeMatrixToolbar({
  query,
  filters,
  filterOptions,
  printMode,
  resultCount,
  totalCount,
  hasFilters,
  onQueryChange,
  onFilterChange,
  onPrintModeChange,
  onPrint,
  onExpandAll,
  onCollapseAll,
  onClearFilters,
}: {
  query: string;
  filters: typeof EMPTY_FILTERS;
  filterOptions: Record<TagField, string[]>;
  printMode: PrintMode;
  resultCount: number;
  totalCount: number;
  hasFilters: boolean;
  onQueryChange: (value: string) => void;
  onFilterChange: (key: keyof MatrixFilters, value: string) => void;
  onPrintModeChange: (value: PrintMode) => void;
  onPrint: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onClearFilters: () => void;
}) {
  return (
    <section
      aria-label="Matrix controls"
      className="mt-6 rounded-lg border border-rule bg-rule/20 p-4"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="flex-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
          Search rows
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search Briony, Coketown, Dunkirk..."
            className="mt-1 w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm normal-case tracking-normal text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </label>

        <FilterSelect
          label="AO"
          value={filters.ao}
          onChange={(value) => onFilterChange("ao", value)}
          options={AO_FILTER_OPTIONS}
          allLabel="All AOs"
        />
        <FilterSelect
          label="Character/function"
          value={filters.character}
          onChange={(value) => onFilterChange("character", value)}
          options={filterOptions.character}
          allLabel="All character tags"
        />
        <FilterSelect
          label="Narrative method"
          value={filters.narrative}
          onChange={(value) => onFilterChange("narrative", value)}
          options={filterOptions.narrative}
          allLabel="All narrative tags"
        />
        <FilterSelect
          label="Structural method"
          value={filters.structure}
          onChange={(value) => onFilterChange("structure", value)}
          options={filterOptions.structure}
          allLabel="All structure tags"
        />
        <FilterSelect
          label="Exam suitability"
          value={filters.examFit}
          onChange={(value) => onFilterChange("examFit", value)}
          options={filterOptions.examFit}
          allLabel="All exam routes"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-rule pt-4 xl:flex-row xl:items-center">
        <p className="text-xs text-ink-muted">
          Showing {resultCount} of {totalCount} routes
        </p>
        <div className="flex flex-wrap gap-2 xl:ml-auto">
          <button
            type="button"
            onClick={onExpandAll}
            className="rounded-md border border-rule bg-paper px-3 py-2 text-xs font-medium hover:bg-rule"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={onCollapseAll}
            className="rounded-md border border-rule bg-paper px-3 py-2 text-xs font-medium hover:bg-rule"
          >
            Collapse all
          </button>
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasFilters}
            className="rounded-md border border-rule bg-paper px-3 py-2 text-xs font-medium hover:bg-rule disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear filters
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Print mode
            <select
              value={printMode}
              onChange={(event) => onPrintModeChange(event.target.value as PrintMode)}
              className="mt-1 w-44 rounded-md border border-rule bg-paper px-3 py-2 text-sm normal-case tracking-normal text-ink"
            >
              {Object.entries(PRINT_MODE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={onPrint}
            className="rounded-md bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-ink/90"
          >
            Print {PRINT_MODE_LABELS[printMode].toLowerCase()}
          </button>
        </div>
      </div>
    </section>
  );
}

function ComparativeMatrixCard({
  row,
  expanded,
  onToggle,
}: {
  row: Row;
  expanded: boolean;
  onToggle: () => void;
}) {
  const detailId = `matrix-detail-${row.id}`;

  return (
    <article className="rounded-lg border border-rule bg-paper p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold leading-tight">{row.theme}</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <AoChip label="AO2" active={Boolean(row.ao2)} />
            <AoChip label="AO3" active={Boolean(row.ao3)} />
            <AoChip label="AO4" active={Boolean(row.ao4)} />
          </div>
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={expanded ? detailId : undefined}
          onClick={onToggle}
          className="self-start rounded-md border border-rule px-3 py-2 text-xs font-medium hover:bg-rule"
        >
          {expanded ? "Collapse details" : "Expand details"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ArgumentBlock
          label="Hard Times"
          text={truncateForPreview(row.hardTimes, PREVIEW_LENGTHS.screenArgument)}
        />
        <ArgumentBlock
          label="Atonement"
          text={truncateForPreview(row.atonement, PREVIEW_LENGTHS.screenArgument)}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <TagGroup label="Method" value={row.narrative || row.structure} />
        <TagGroup label="Character" value={row.character} />
        <TagGroup label="Exam fit" value={row.examFit} />
      </div>

      {expanded && (
        <div id={detailId} className="mt-4 space-y-3 border-t border-rule pt-4">
          <ComparativeMatrixDetailSection
            title="AO2 Method Trigger"
            body={row.ao2}
          />
          <ComparativeMatrixDetailSection title="AO3 Context" body={row.ao3} />
          <ComparativeMatrixDetailSection
            title="AO4 Comparative Link"
            body={row.ao4}
          />
          <ComparativeMatrixDetailSection
            title="Exam-use route summary"
            body={row.thesis || row.examFit}
            accent
          />
        </div>
      )}
    </article>
  );
}

function ComparativeMatrixDetailSection({
  title,
  body,
  accent = false,
}: {
  title: string;
  body: string;
  accent?: boolean;
}) {
  if (!body.trim()) return null;

  return (
    <section className={accent ? "rounded-md border-l-4 border-ink bg-ink/5 p-3" : "rounded-md bg-rule/30 p-3"}>
      <h3 className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed">{body}</p>
    </section>
  );
}

function ComparativeMatrixPrintView({
  mode,
  rows,
}: {
  mode: PrintMode;
  rows: Row[];
}) {
  return (
    <aside aria-hidden className="matrix-print-root hidden print:block">
      {mode === "compact" && <ComparativeMatrixCompactPrint rows={rows} />}
      {mode === "cards" && <ComparativeMatrixCardPrint rows={rows} />}
      {mode === "teacher" && <ComparativeMatrixTeacherPrint rows={rows} />}
    </aside>
  );
}

function ComparativeMatrixCompactPrint({ rows }: { rows: Row[] }) {
  return (
    <section className="matrix-print-compact">
      <PrintHeader
        title="Comparative Revision Matrix"
        subtitle="Compact matrix print - short route previews"
      />
      <table className="matrix-print-table">
        <thead>
          <tr>
            <th>Route</th>
            <th>Hard Times</th>
            <th>Atonement</th>
            <th>AO2</th>
            <th>AO3</th>
            <th>AO4</th>
            <th>Exam fit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.theme}</th>
              <td>{truncateForPreview(row.hardTimes, PREVIEW_LENGTHS.compactText)}</td>
              <td>{truncateForPreview(row.atonement, PREVIEW_LENGTHS.compactText)}</td>
              <td>{truncateForPreview(row.ao2, PREVIEW_LENGTHS.compactAo)}</td>
              <td>{truncateForPreview(row.ao3, PREVIEW_LENGTHS.compactAo)}</td>
              <td>{truncateForPreview(row.ao4, PREVIEW_LENGTHS.compactAo)}</td>
              <td>{truncateForPreview(row.examFit, PREVIEW_LENGTHS.compactExamFit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ComparativeMatrixCardPrint({ rows }: { rows: Row[] }) {
  return (
    <section className="matrix-print-cards">
      <PrintHeader
        title="Comparative Revision Cards"
        subtitle="Study-card print - one or two routes per page"
      />
      <div className="matrix-print-card-grid">
        {rows.map((row) => (
          <article key={row.id} className="matrix-print-card">
            <h2>{row.theme}</h2>
            <div className="matrix-print-two-col">
              <PrintMiniBlock label="Hard Times" body={truncateForPreview(row.hardTimes, PREVIEW_LENGTHS.cardArgument)} />
              <PrintMiniBlock label="Atonement" body={truncateForPreview(row.atonement, PREVIEW_LENGTHS.cardArgument)} />
            </div>
            <PrintMiniBlock label="AO2 Method Trigger" body={truncateForPreview(row.ao2, PREVIEW_LENGTHS.cardAo)} />
            <PrintMiniBlock label="AO3 Context" body={truncateForPreview(row.ao3, PREVIEW_LENGTHS.cardAo)} />
            <PrintMiniBlock label="AO4 Comparative Link" body={truncateForPreview(row.ao4, PREVIEW_LENGTHS.cardAo)} />
            <PrintMiniBlock label="Exam-use route summary" body={truncateForPreview(row.thesis || row.examFit, PREVIEW_LENGTHS.cardSummary)} />
          </article>
        ))}
      </div>
    </section>
  );
}

function ComparativeMatrixTeacherPrint({ rows }: { rows: Row[] }) {
  return (
    <section className="matrix-print-teacher">
      <PrintHeader
        title="Comparative Matrix Teacher Pack"
        subtitle="Full AO2, AO3 and AO4 route content"
      />
      {rows.map((row) => (
        <article key={row.id} className="matrix-print-teacher-route">
          <h2>{row.theme}</h2>
          <div className="matrix-print-two-col">
            <PrintMiniBlock label="Hard Times" body={row.hardTimes} />
            <PrintMiniBlock label="Atonement" body={row.atonement} />
          </div>
          <PrintMiniBlock label="AO2 Method Trigger" body={row.ao2} />
          <PrintMiniBlock label="AO3 Context" body={row.ao3} />
          <PrintMiniBlock label="AO4 Comparative Link" body={row.ao4} />
          <PrintMiniBlock label="Exam-use route summary" body={row.thesis || row.examFit} />
          <div className="matrix-print-tags">
            {[row.character, row.narrative, row.structure, row.examFit]
              .filter(Boolean)
              .map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
          </div>
        </article>
      ))}
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  allLabel: string;
}) {
  return (
    <label className="min-w-40 flex-1 text-xs font-medium uppercase tracking-wide text-ink-muted lg:max-w-52">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm normal-case tracking-normal text-ink"
      >
        <option value="all">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function AoChip({ label, active }: { label: string; active: boolean }) {
  if (!active) return null;

  return (
    <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] text-paper">
      {label}
    </span>
  );
}

function ArgumentBlock({ label, text }: { label: string; text: string }) {
  return (
    <section className="rounded-md bg-rule/25 p-3">
      <h3 className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
        {label}
      </h3>
      <p className="mt-1 text-sm leading-relaxed">{text}</p>
    </section>
  );
}

function TagGroup({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <span className="rounded-full border border-rule px-2.5 py-1 text-xs text-ink-muted">
      <span className="font-medium text-ink">{label}:</span> {truncateForPreview(value, PREVIEW_LENGTHS.screenTag)}
    </span>
  );
}

function PrintHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="matrix-print-header">
      <p>Pearson Edexcel A-Level Component 2 Prose</p>
      <h1>{title}</h1>
      <span>{subtitle}</span>
    </header>
  );
}

function PrintMiniBlock({ label, body }: { label: string; body: string }) {
  if (!body.trim()) return null;
  return (
    <section className="matrix-print-mini-block">
      <h3>{label}</h3>
      <p>{body}</p>
    </section>
  );
}

function collectTagOptions(rows: Row[], field: TagField) {
  return Array.from(
    new Set(
      rows
        .flatMap((row) => splitTags(row[field]))
        .filter((value) => value.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

function splitTags(value: string) {
  return value
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAoText(row: Row, ao: Exclude<AoFilter, "all">) {
  const key = ao.toLowerCase() as "ao2" | "ao3" | "ao4";
  return row[key];
}

function truncateForPreview(text: string, maxLength: number) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
}

function ComparativeMatrixPrintStyles() {
  return (
    <style>{`
      @page matrixCompact {
        size: A4 landscape;
        margin: 9mm;
      }

      @page matrixCards {
        size: A4 portrait;
        margin: 11mm;
      }

      @page matrixTeacher {
        size: A4 portrait;
        margin: 12mm;
      }

      @media print {
        body {
          background: #ffffff !important;
        }

        nav,
        header[role="banner"],
        .matrix-screen-ui,
        .screen-only,
        [data-admin-controls="true"] {
          display: none !important;
        }

        .matrix-print-root {
          display: block !important;
          color: #17120d;
          font-family: Georgia, "Times New Roman", serif;
        }

        .matrix-print-header {
          border-bottom: 1px solid #b8aa98;
          margin-bottom: 7mm;
          padding-bottom: 3mm;
        }

        .matrix-print-header p,
        .matrix-print-header span {
          color: #6d6258;
          display: block;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 8pt;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .matrix-print-header h1 {
          font-size: 18pt;
          line-height: 1.1;
          margin: 1.5mm 0;
        }

        .matrix-print-compact {
          page: matrixCompact;
        }

        .matrix-print-table {
          border-collapse: collapse;
          font-size: 7.5pt;
          line-height: 1.25;
          table-layout: fixed;
          width: 100%;
        }

        .matrix-print-table th,
        .matrix-print-table td {
          border: 0.35pt solid #c8bcae;
          padding: 2mm;
          vertical-align: top;
        }

        .matrix-print-table thead th {
          background: #efe9df;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 6.5pt;
          text-transform: uppercase;
        }

        .matrix-print-table tbody th {
          font-size: 8pt;
          width: 14%;
        }

        .matrix-print-cards {
          page: matrixCards;
        }

        .matrix-print-card-grid {
          display: grid;
          gap: 8mm;
          grid-template-columns: 1fr;
        }

        .matrix-print-card {
          break-inside: avoid;
          border: 0.5pt solid #b8aa98;
          min-height: 123mm;
          padding: 6mm;
          page-break-inside: avoid;
        }

        .matrix-print-card h2,
        .matrix-print-teacher-route h2 {
          font-size: 15pt;
          line-height: 1.15;
          margin: 0 0 4mm;
        }

        .matrix-print-two-col {
          display: grid;
          gap: 4mm;
          grid-template-columns: 1fr 1fr;
        }

        .matrix-print-mini-block {
          break-inside: avoid;
          margin-top: 3mm;
          page-break-inside: avoid;
        }

        .matrix-print-mini-block h3 {
          color: #6d6258;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 7.5pt;
          letter-spacing: 0;
          margin: 0 0 1mm;
          text-transform: uppercase;
        }

        .matrix-print-mini-block p {
          font-size: 10pt;
          line-height: 1.35;
          margin: 0;
        }

        .matrix-print-teacher {
          page: matrixTeacher;
        }

        .matrix-print-teacher-route {
          break-inside: avoid;
          border-top: 0.5pt solid #b8aa98;
          margin-top: 7mm;
          padding-top: 5mm;
          page-break-inside: avoid;
        }

        .matrix-print-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 2mm;
          margin-top: 4mm;
        }

        .matrix-print-tags span {
          border: 0.35pt solid #c8bcae;
          border-radius: 99px;
          color: #5b5149;
          font-size: 7.5pt;
          padding: 1mm 2mm;
        }
      }
    `}</style>
  );
}
