import { useMemo, useState } from "react";
import { CheckCircle2, Clipboard, Eye, Printer, Route, RotateCcw, XCircle } from "lucide-react";
import {
  RAPID_RECALL_AOS,
  RAPID_RECALL_DRILL_LABELS,
  RAPID_RECALL_DRILL_TYPES,
  RAPID_RECALL_TEXT_FOCI,
  RAPID_RECALL_THEMES,
  rapidRecallWorkbookItems,
} from "@/data/rapidRecallWorkbook";
import type {
  Component2AO,
  RapidRecallDrillType,
  RapidRecallRoutePlan,
  RapidRecallRoutePlanParagraph,
  RapidRecallTheme,
  RapidRecallWorkbookItem,
} from "@/types/rapidRecall";

type FilterValue<T extends string> = "All" | T;

type WorkbookResult = {
  correct: boolean;
  revealed: boolean;
  response: string;
};

const aoChipClass: Record<Component2AO, string> = {
  AO1: "chip-ao1",
  AO2: "chip-ao2",
  AO3: "chip-ao3",
  AO4: "chip-ao4",
};

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim().replace(/\s+/g, " ");
}

function getExpectedAnswers(item: RapidRecallWorkbookItem) {
  if (item.type === "fill-blank") {
    return [item.answer, ...(item.acceptedAnswers ?? [])];
  }

  return [item.answer];
}

function isCorrect(item: RapidRecallWorkbookItem, response: string) {
  const selected = normalise(response);
  return getExpectedAnswers(item).some((answer) => normalise(answer) === selected);
}

function answerLabel(item: RapidRecallWorkbookItem) {
  if (item.type === "match-pair") return `${item.left} -> ${item.answer}`;
  return item.answer;
}

function formatRoutePlanText(item: RapidRecallWorkbookItem, plan: RapidRecallRoutePlan) {
  const paragraphLines = [
    ["1. Comparative thesis", plan.thesis],
    [`2. ${plan.paragraphOne.title}`, `Hard Times: ${plan.paragraphOne.hardTimesFocus}`, `Atonement: ${plan.paragraphOne.atonementFocus}`, `AO focus: ${plan.paragraphOne.aoFocus.join(", ")}`],
    [`3. ${plan.paragraphTwo.title}`, `Hard Times: ${plan.paragraphTwo.hardTimesFocus}`, `Atonement: ${plan.paragraphTwo.atonementFocus}`, `AO focus: ${plan.paragraphTwo.aoFocus.join(", ")}`],
    [`4. ${plan.paragraphThree.title}`, `Hard Times: ${plan.paragraphThree.hardTimesFocus}`, `Atonement: ${plan.paragraphThree.atonementFocus}`, `AO focus: ${plan.paragraphThree.aoFocus.join(", ")}`],
  ];

  return [
    "Rapid Recall Route Plan",
    `Source drill: ${item.prompt}`,
    `Theme: ${item.theme}`,
    `Text focus: ${item.textFocus}`,
    "",
    ...paragraphLines.flatMap((lines) => [...lines, ""]),
    `Conclusion route: ${plan.conclusion}`,
    plan.routeBridge ? `Route bridge: ${plan.routeBridge}` : "",
    plan.examWarning ? `Exam warning: ${plan.examWarning}` : "",
    "",
    "Planning route only - not a full essay.",
  ].filter(Boolean).join("\n");
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="meta-mono">{label}</dt>
      <dd className="mt-1 break-words text-sm leading-snug text-ink">{value}</dd>
    </div>
  );
}

function RoutePlanParagraphBlock({
  index,
  paragraph,
}: {
  index: number;
  paragraph: RapidRecallRoutePlanParagraph;
}) {
  return (
    <article className="min-w-0 rounded-sm border border-rule bg-white p-3 print:break-inside-avoid">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-serif text-lg leading-snug">{index}. {paragraph.title}</h3>
        <div className="flex flex-wrap gap-1">
          {paragraph.aoFocus.map((ao) => (
            <span key={ao} className={`rounded-sm px-2 py-1 text-[10px] font-mono font-medium ${aoChipClass[ao]}`}>
              {ao}
            </span>
          ))}
        </div>
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <DetailRow label="Hard Times" value={paragraph.hardTimesFocus} />
        <DetailRow label="Atonement" value={paragraph.atonementFocus} />
      </dl>
    </article>
  );
}

function RoutePlanPanel({
  item,
  copyStatus,
  onCopy,
}: {
  item: RapidRecallWorkbookItem;
  copyStatus: string | null;
  onCopy: (item: RapidRecallWorkbookItem) => void;
}) {
  if (!item.routePlan) return null;
  const { routePlan } = item;

  return (
    <section
      aria-label="Rapid Recall route plan handoff"
      className="mb-5 rounded-sm border border-rule-strong bg-paper p-4 shadow-card print:break-inside-avoid print:bg-white print:shadow-none sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-eyebrow">Route plan handoff</p>
          <h2 className="font-serif text-2xl">4-step Component 2 route plan</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">
            Planning route only - not a full essay generator.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onCopy(item)}
          className="no-print inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-rule bg-paper px-3 py-2 text-xs font-medium hover:bg-paper-dim sm:w-auto"
        >
          <Clipboard className="h-3.5 w-3.5" />
          Copy route plan
        </button>
      </div>

      {copyStatus && (
        <p role="status" aria-live="polite" className="mb-3 text-xs font-mono text-ink-muted no-print">
          {copyStatus}
        </p>
      )}

      <div className="mb-3 rounded-sm border border-rule bg-white p-3">
        <p className="meta-mono">1. Comparative thesis</p>
        <p className="mt-1 text-sm leading-relaxed">{routePlan.thesis}</p>
      </div>

      <div className="grid gap-3">
        <RoutePlanParagraphBlock index={2} paragraph={routePlan.paragraphOne} />
        <RoutePlanParagraphBlock index={3} paragraph={routePlan.paragraphTwo} />
        <RoutePlanParagraphBlock index={4} paragraph={routePlan.paragraphThree} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-sm border border-rule bg-white p-3">
          <p className="meta-mono">Conclusion route</p>
          <p className="mt-1 text-sm leading-relaxed">{routePlan.conclusion}</p>
        </div>
        {routePlan.routeBridge && (
          <div className="rounded-sm border border-rule bg-white p-3">
            <p className="meta-mono">AO4 bridge</p>
            <p className="mt-1 text-sm leading-relaxed">{routePlan.routeBridge}</p>
          </div>
        )}
      </div>

      {routePlan.examWarning && (
        <p className="mt-3 rounded-sm border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-950">
          <b>Exam warning:</b> {routePlan.examWarning}
        </p>
      )}
    </section>
  );
}

function WorkbookCard({
  item,
  draft,
  result,
  onDraftChange,
  onCheck,
  onReveal,
  onBuildRoutePlan,
}: {
  item: RapidRecallWorkbookItem;
  draft: string;
  result?: WorkbookResult;
  onDraftChange: (itemId: string, value: string) => void;
  onCheck: (item: RapidRecallWorkbookItem) => void;
  onReveal: (item: RapidRecallWorkbookItem) => void;
  onBuildRoutePlan: (item: RapidRecallWorkbookItem) => void;
}) {
  const options = item.type === "fill-blank" ? [] : item.options;
  const showAnswer = Boolean(result?.revealed);

  return (
    <article
      className="min-w-0 rounded-sm border border-rule bg-paper p-4 shadow-card print:break-inside-avoid print:border-rule print:bg-white print:shadow-none"
      aria-labelledby={`${item.id}-prompt`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="label-eyebrow">{RAPID_RECALL_DRILL_LABELS[item.type]}</span>
        <span className="rounded-sm border border-rule bg-paper-dim/70 px-2 py-0.5 text-[10px] font-mono text-ink-muted">
          {item.difficulty}
        </span>
        <span className="rounded-sm border border-rule bg-paper-dim/70 px-2 py-0.5 text-[10px] font-mono text-ink-muted">
          {item.textFocus}
        </span>
      </div>

      <h2 id={`${item.id}-prompt`} className="font-serif text-xl leading-snug">
        {item.prompt}
      </h2>

      {item.type === "match-pair" && (
        <p className="mt-3 rounded-sm border border-rule bg-paper-dim/60 px-3 py-2 text-sm">
          <span className="font-medium">Left:</span> {item.left}
        </p>
      )}

      <dl className="mt-3 grid gap-3 border-y border-rule py-3 sm:grid-cols-3">
        <DetailRow label="Theme" value={item.theme} />
        <DetailRow label="Character" value={item.character} />
        <DetailRow label="Quote anchor" value={item.quoteAnchor} />
      </dl>

      <div className="my-3 flex flex-wrap gap-1.5">
        {item.aoFocus.map((ao) => (
          <span key={ao} className={`rounded-sm px-2 py-1 text-[10px] font-mono font-medium ${aoChipClass[ao]}`}>
            {ao}
          </span>
        ))}
        <span className="rounded-sm border border-rule px-2 py-1 text-[10px] font-mono text-ink-muted">
          {item.essayFunction}
        </span>
      </div>

      {item.type === "fill-blank" ? (
        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-mono uppercase tracking-wider text-ink-muted">Missing word or phrase</span>
          <input
            value={draft}
            onChange={(event) => onDraftChange(item.id, event.target.value)}
            className="w-full rounded-sm border border-rule-strong bg-paper px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Type a short answer"
            aria-label={`Short answer for ${item.prompt}`}
          />
        </label>
      ) : (
        <div className="mb-4 grid gap-2">
          {options.map((option) => {
            const active = draft === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onDraftChange(item.id, option)}
                aria-pressed={active}
                className={`rounded-sm border px-3 py-2 text-left text-sm leading-snug transition-colors ${
                  active
                    ? "border-primary bg-highlight text-ink"
                    : "border-rule bg-paper hover:border-rule-strong hover:bg-paper-dim/70"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onCheck(item)}
          aria-label={`Check answer for ${item.prompt}`}
          className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Check answer
        </button>
        <button
          type="button"
          onClick={() => onReveal(item)}
          aria-label={`Reveal answer for ${item.prompt}`}
          className="inline-flex items-center gap-1.5 rounded-sm border border-rule bg-paper px-3 py-2 text-xs font-medium hover:bg-paper-dim"
        >
          <Eye className="h-3.5 w-3.5" />
          Reveal answer
        </button>
        {item.routePlan && (
          <button
            type="button"
            onClick={() => onBuildRoutePlan(item)}
            aria-label={`Build route from this drill for ${item.prompt}`}
            className="inline-flex items-center gap-1.5 rounded-sm border border-rule bg-paper px-3 py-2 text-xs font-medium hover:bg-paper-dim"
          >
            <Route className="h-3.5 w-3.5" />
            Build route from this drill
          </button>
        )}
        {result?.response && (
          <span className="text-xs font-mono text-ink-muted">
            Your answer: {result.response}
          </span>
        )}
      </div>

      {showAnswer && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={`mt-4 rounded-sm border p-3 ${
            result?.correct
              ? "border-green-200 bg-green-50 text-green-950"
              : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
        >
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
            {result?.correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {result?.correct ? "Correct" : "Answer revealed"}
          </div>
          <p className="text-sm leading-relaxed">
            <b>Answer:</b> {answerLabel(item)}
          </p>
          <p className="mt-2 text-sm leading-relaxed">{item.explanation}</p>
          {item.type === "route-selection" && (
            <p className="mt-2 text-sm leading-relaxed">
              <b>AO4 bridge:</b> {item.ao4Bridge}
            </p>
          )}
          <dl className="mt-3 grid gap-2 text-xs leading-relaxed sm:grid-cols-2">
            <DetailRow label="AO1 move" value={item.ao1Move} />
            <DetailRow label="AO2 method" value={item.ao2Method} />
            <DetailRow label="AO3 context" value={item.ao3Context} />
            <DetailRow label="AO4 comparison" value={item.ao4Comparison} />
          </dl>
        </div>
      )}
    </article>
  );
}

export default function RapidRecallWorkbook() {
  const [activeType, setActiveType] = useState<RapidRecallDrillType>("multiple-choice");
  const [themeFilter, setThemeFilter] = useState<FilterValue<RapidRecallTheme>>("All");
  const [aoFilter, setAoFilter] = useState<FilterValue<Component2AO>>("All");
  const [textFilter, setTextFilter] = useState<FilterValue<RapidRecallWorkbookItem["textFocus"]>>("All");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, WorkbookResult>>({});
  const [printMode, setPrintMode] = useState(false);
  const [routePlanItemId, setRoutePlanItemId] = useState<string | null>(null);
  const [routePlanCopyStatus, setRoutePlanCopyStatus] = useState<string | null>(null);

  const filteredItems = useMemo(() => rapidRecallWorkbookItems.filter((item) => (
    item.type === activeType
    && (themeFilter === "All" || item.theme === themeFilter)
    && (aoFilter === "All" || item.aoFocus.includes(aoFilter))
    && (textFilter === "All" || item.textFocus === textFilter)
  )), [activeType, themeFilter, aoFilter, textFilter]);

  const attempted = Object.values(results).filter((result) => result.response).length;
  const correct = Object.values(results).filter((result) => result.response && result.correct).length;
  const routePlanItem = routePlanItemId
    ? rapidRecallWorkbookItems.find((item) => item.id === routePlanItemId && item.routePlan)
    : undefined;

  const setDraft = (itemId: string, value: string) => {
    setDrafts((current) => ({ ...current, [itemId]: value }));
  };

  const checkItem = (item: RapidRecallWorkbookItem) => {
    const response = drafts[item.id] ?? "";
    setResults((current) => ({
      ...current,
      [item.id]: {
        response,
        correct: isCorrect(item, response),
        revealed: true,
      },
    }));
  };

  const revealItem = (item: RapidRecallWorkbookItem) => {
    const response = drafts[item.id] ?? "";
    setResults((current) => ({
      ...current,
      [item.id]: {
        response,
        correct: response ? isCorrect(item, response) : false,
        revealed: true,
      },
    }));
  };

  const resetSession = () => {
    setDrafts({});
    setResults({});
    setRoutePlanItemId(null);
    setRoutePlanCopyStatus(null);
  };

  const togglePrintMode = () => {
    setPrintMode((current) => !current);
  };

  const printWorkbook = () => {
    setPrintMode(true);
    window.requestAnimationFrame(() => window.print());
  };

  const buildRoutePlan = (item: RapidRecallWorkbookItem) => {
    if (!item.routePlan) return;
    setRoutePlanItemId(item.id);
    setRoutePlanCopyStatus(null);
  };

  const copyRoutePlan = async (item: RapidRecallWorkbookItem) => {
    if (!item.routePlan) return;

    try {
      await navigator.clipboard.writeText(formatRoutePlanText(item, item.routePlan));
      setRoutePlanCopyStatus("Route plan copied");
    } catch {
      setRoutePlanCopyStatus("Copy unavailable");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 print:px-0 print:py-0 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-5 border-b border-rule pb-5 print:mb-3">
        <p className="label-eyebrow mb-2">Component 2 Prose</p>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <h1 className="font-serif text-3xl lg:text-4xl">Rapid Recall Workbook</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
              Fast AO1–AO4 decision drills for Component 2 Prose.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 no-print">
            <button
              type="button"
              onClick={togglePrintMode}
              aria-pressed={printMode}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-rule bg-paper px-3 py-2 text-xs font-medium hover:bg-paper-dim sm:w-auto"
            >
              {printMode ? "Hide printable layout" : "Printable layout"}
            </button>
            <button
              type="button"
              onClick={printWorkbook}
              aria-label="Print Rapid Recall Workbook"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-rule bg-paper px-3 py-2 text-xs font-medium hover:bg-paper-dim sm:w-auto"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
          </div>
        </div>
      </header>

      <section className="mb-5 grid gap-3 no-print lg:grid-cols-[1fr_240px]">
        <div className="rounded-sm border border-rule bg-paper p-3 shadow-card">
          <p className="label-eyebrow mb-2">Drill type</p>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Rapid Recall drill types">
            {RAPID_RECALL_DRILL_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={activeType === type}
                onClick={() => setActiveType(type)}
                className={`min-w-[9rem] flex-1 rounded-sm border px-3 py-2 text-xs font-medium transition-colors sm:flex-none ${
                  activeType === type
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-rule bg-paper hover:bg-paper-dim"
                }`}
              >
                {RAPID_RECALL_DRILL_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-sm border border-rule bg-paper p-3 shadow-card" aria-label="Session summary">
          <div className="mb-2 flex items-center justify-between">
            <p className="label-eyebrow">Session</p>
            <button
              type="button"
              onClick={resetSession}
              aria-label="Reset Rapid Recall Workbook session"
              className="inline-flex items-center gap-1 rounded-sm border border-rule px-2 py-1 text-[10px] font-mono text-ink-muted hover:text-ink"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <DetailRow label="Visible" value={String(filteredItems.length)} />
            <DetailRow label="Attempted" value={String(attempted)} />
            <DetailRow label="Correct" value={String(correct)} />
            <DetailRow label="Mode" value={RAPID_RECALL_DRILL_LABELS[activeType]} />
          </dl>
        </aside>
      </section>

      <section className="mb-5 grid gap-3 rounded-sm border border-rule bg-paper p-3 shadow-card no-print md:grid-cols-3" aria-label="Workbook filters">
        <label className="block">
          <span className="mb-1 block text-xs font-mono uppercase tracking-wider text-ink-muted">Theme filter</span>
          <select
            value={themeFilter}
            onChange={(event) => setThemeFilter(event.target.value as FilterValue<RapidRecallTheme>)}
            className="w-full rounded-sm border border-rule bg-paper px-3 py-2 text-sm"
          >
            <option value="All">All themes</option>
            {RAPID_RECALL_THEMES.map((theme) => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-mono uppercase tracking-wider text-ink-muted">AO filter</span>
          <select
            value={aoFilter}
            onChange={(event) => setAoFilter(event.target.value as FilterValue<Component2AO>)}
            className="w-full rounded-sm border border-rule bg-paper px-3 py-2 text-sm"
          >
            <option value="All">All AOs</option>
            {RAPID_RECALL_AOS.map((ao) => (
              <option key={ao} value={ao}>{ao}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-mono uppercase tracking-wider text-ink-muted">Text filter</span>
          <select
            value={textFilter}
            onChange={(event) => setTextFilter(event.target.value as FilterValue<RapidRecallWorkbookItem["textFocus"]>)}
            className="w-full rounded-sm border border-rule bg-paper px-3 py-2 text-sm"
          >
            <option value="All">All texts</option>
            {RAPID_RECALL_TEXT_FOCI.map((text) => (
              <option key={text} value={text}>{text}</option>
            ))}
          </select>
        </label>
      </section>

      {routePlanItem && (
        <RoutePlanPanel
          item={routePlanItem}
          copyStatus={routePlanCopyStatus}
          onCopy={copyRoutePlan}
        />
      )}

      {!printMode && (
        <section className="grid gap-4 print:hidden md:grid-cols-2" aria-label={`${RAPID_RECALL_DRILL_LABELS[activeType]} cards`}>
          {filteredItems.map((item) => (
            <WorkbookCard
              key={item.id}
              item={item}
              draft={drafts[item.id] ?? ""}
              result={results[item.id]}
              onDraftChange={setDraft}
              onCheck={checkItem}
              onReveal={revealItem}
              onBuildRoutePlan={buildRoutePlan}
            />
          ))}
          {filteredItems.length === 0 && (
            <div className="rounded-sm border border-rule bg-paper p-4 text-sm text-ink-muted">
              No workbook cards match these filters.
            </div>
          )}
        </section>
      )}

      {printMode && (
        <section
          aria-label="Printable Rapid Recall Workbook"
          className="rounded-sm border border-rule bg-paper p-4 shadow-card print:border-0 print:bg-white print:p-0 print:shadow-none"
        >
          <div className="mb-4">
            <p className="label-eyebrow">Printable layout</p>
            <h2 className="font-serif text-2xl">{RAPID_RECALL_DRILL_LABELS[activeType]}</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Theme: {themeFilter} | AO: {aoFilter} | Text: {textFilter}
            </p>
          </div>
          <div className="grid gap-3">
            {filteredItems.map((item, index) => (
              <article key={item.id} className="break-inside-avoid rounded-sm border border-rule bg-white p-3">
                <p className="text-xs font-mono text-ink-muted">
                  {index + 1}. {item.textFocus} | {item.theme} | {item.aoFocus.join(", ")}
                </p>
                <h3 className="mt-1 text-sm font-semibold leading-relaxed">{item.prompt}</h3>
                {item.type === "match-pair" && (
                  <p className="mt-2 text-sm"><b>Left:</b> {item.left}</p>
                )}
                {item.type !== "fill-blank" ? (
                  <ul className="mt-2 grid gap-1 text-xs leading-relaxed sm:grid-cols-2 print:grid-cols-2">
                    {item.options.map((option) => (
                      <li key={option} className="rounded-sm border border-rule px-2 py-1">{option}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4 h-8 border-b border-rule" aria-hidden="true" />
                )}
                <p className="mt-2 text-xs text-ink-muted">Answer: ______________________________</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
