import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Clipboard, Printer, RotateCcw, XCircle } from "lucide-react";
import {
  RAPID_RECALL_MODE_LABELS,
  RAPID_RECALL_TASK_TYPE_LABELS,
  rapidRecallTasks,
  type RapidRecallMode,
  type RapidRecallTask,
} from "@/data/rapidRecall";

type AnswerRecord = {
  correct: boolean;
  response: string | string[];
};

const MODES = Object.keys(RAPID_RECALL_MODE_LABELS) as RapidRecallMode[];

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, " ");
}

function formatAnswer(answer: string | string[]) {
  return Array.isArray(answer) ? answer.join("; ") : answer;
}

function isCorrect(task: RapidRecallTask, response: string | string[]) {
  if (Array.isArray(task.answer)) {
    if (!Array.isArray(response)) return false;
    const expected = task.answer.map(normalise).sort();
    const selected = response.map(normalise).sort();
    return expected.length === selected.length && expected.every((item, index) => item === selected[index]);
  }

  if (Array.isArray(response)) return false;
  const expected = normalise(task.answer);
  const selected = normalise(response);
  if (task.type === "fill-blank") {
    return selected === expected || selected.includes(expected);
  }
  return selected === expected;
}

function aoClass(ao: string) {
  return ao === "AO1"
    ? "chip-ao1"
    : ao === "AO2"
      ? "chip-ao2"
      : ao === "AO3"
        ? "chip-ao3"
        : "chip-ao4";
}

function buildWorksheetText(tasks: RapidRecallTask[], modeLabel: string, includeAnswerKey: boolean) {
  const lines = [
    "Rapid Recall Workbook",
    `Mode: ${modeLabel}`,
    "Component 2 Prose: Hard Times and Atonement",
    "",
    "Questions",
    ...tasks.flatMap((task, index) => [
      `${index + 1}. [${RAPID_RECALL_TASK_TYPE_LABELS[task.type]}] ${task.prompt}`,
      task.options?.length ? `Options: ${task.options.join(" | ")}` : "Answer: ______________________________",
      `Focus: ${task.textFocus} | Theme: ${task.theme} | AO: ${task.aoFocus.join(", ")} | ${task.difficulty}`,
      "",
    ]),
  ];

  if (includeAnswerKey) {
    lines.push(
      "Answer Key",
      ...tasks.flatMap((task, index) => [
        `${index + 1}. ${formatAnswer(task.answer)}`,
        `Why: ${task.explanation}`,
        `Exam-use: ${task.examUse}`,
        "",
      ]),
    );
  }

  return lines.join("\n");
}

function TaskCard({
  task,
  answerRecord,
  draft,
  onDraftChange,
  onSubmit,
}: {
  task: RapidRecallTask;
  answerRecord?: AnswerRecord;
  draft: string | string[];
  onDraftChange: (taskId: string, value: string | string[]) => void;
  onSubmit: (task: RapidRecallTask) => void;
}) {
  const isAnswered = Boolean(answerRecord);
  const selectedValues = Array.isArray(draft) ? draft : [];
  const selectedValue = typeof draft === "string" ? draft : "";

  const toggleMatch = (option: string) => {
    const next = selectedValues.includes(option)
      ? selectedValues.filter((item) => item !== option)
      : [...selectedValues, option];
    onDraftChange(task.id, next);
  };

  return (
    <article className="rounded-sm border border-rule bg-paper p-4 shadow-card print:break-inside-avoid print:bg-white print:shadow-none">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="label-eyebrow">{RAPID_RECALL_TASK_TYPE_LABELS[task.type]}</span>
        <span className="rounded-sm border border-rule bg-paper-dim/70 px-2 py-0.5 text-[10px] font-mono text-ink-muted">
          {task.difficulty}
        </span>
        <span className="rounded-sm border border-rule bg-paper-dim/70 px-2 py-0.5 text-[10px] font-mono text-ink-muted">
          {task.textFocus}
        </span>
      </div>

      <h3 className="mb-3 font-serif text-xl leading-snug">{task.prompt}</h3>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {task.aoFocus.map((ao) => (
          <span key={ao} className={`rounded-sm px-2 py-1 text-[10px] font-mono font-medium ${aoClass(ao)}`}>
            {ao}
          </span>
        ))}
        <span className="rounded-sm border border-rule px-2 py-1 text-[10px] font-mono text-ink-muted">
          {task.theme}
        </span>
      </div>

      {task.type === "fill-blank" ? (
        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-mono uppercase tracking-wider text-ink-muted">Short answer</span>
          <input
            value={selectedValue}
            onChange={(event) => onDraftChange(task.id, event.target.value)}
            className="w-full rounded-sm border border-rule-strong bg-paper px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Type the missing word or phrase"
            aria-label={`Answer for ${task.id}`}
          />
        </label>
      ) : (
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          {task.options?.map((option) => {
            const active = Array.isArray(draft) ? selectedValues.includes(option) : selectedValue === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => task.type === "matching" ? toggleMatch(option) : onDraftChange(task.id, option)}
                className={`rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
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
          onClick={() => onSubmit(task)}
          className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Check answer
        </button>
        {isAnswered && (
          <span className="text-xs font-mono text-ink-muted">
            Your answer: {formatAnswer(answerRecord?.response ?? "")}
          </span>
        )}
      </div>

      {answerRecord && (
        <div
          role="status"
          className={`mt-4 rounded-sm border p-3 ${
            answerRecord.correct
              ? "border-green-200 bg-green-50 text-green-950"
              : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
        >
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
            {answerRecord.correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {answerRecord.correct ? "Correct" : "Needs review"}
          </div>
          <p className="text-sm leading-relaxed">{task.explanation}</p>
          <p className="mt-2 text-xs leading-relaxed">
            <b>AO reminder:</b> {task.aoFocus.join(", ")} - {task.aoFocus.includes("AO4")
              ? "make the comparison explicit."
              : "name the route before adding evidence."}
          </p>
          <p className="mt-1 text-xs leading-relaxed">
            <b>Exam-use:</b> {task.examUse}
          </p>
        </div>
      )}
    </article>
  );
}

export default function RapidRecall() {
  const [mode, setMode] = useState<RapidRecallMode>("theme-match");
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [drafts, setDrafts] = useState<Record<string, string | string[]>>({});
  const [worksheetMode, setWorksheetMode] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const tasksForMode = useMemo(
    () => rapidRecallTasks.filter((task) => task.mode === mode),
    [mode],
  );

  const attempted = Object.keys(answers).length;
  const correct = Object.values(answers).filter((answer) => answer.correct).length;
  const accuracy = attempted === 0 ? 0 : Math.round((correct / attempted) * 100);
  const modeLabel = RAPID_RECALL_MODE_LABELS[mode];

  const handleDraftChange = (taskId: string, value: string | string[]) => {
    setDrafts((current) => ({ ...current, [taskId]: value }));
  };

  const handleSubmit = (task: RapidRecallTask) => {
    const emptyDraft = task.type === "matching" ? [] : "";
    const response = drafts[task.id] ?? emptyDraft;
    setAnswers((current) => ({
      ...current,
      [task.id]: {
        response,
        correct: isCorrect(task, response),
      },
    }));
  };

  const resetSession = () => {
    setAnswers({});
    setDrafts({});
    setCopyStatus(null);
  };

  const copyWorksheet = async () => {
    const text = buildWorksheetText(tasksForMode, modeLabel, showAnswerKey);
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Worksheet copied");
    } catch {
      setCopyStatus("Copy unavailable");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 print:px-0 print:py-0 sm:px-6 lg:px-10">
      <header className="mb-6 rounded-sm border border-rule bg-paper p-5 shadow-card print:border-b print:border-l-0 print:border-r-0 print:border-t-0 print:bg-white print:shadow-none">
        <p className="label-eyebrow mb-2">Component 2 Prose Workbook</p>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <h1 className="font-serif text-3xl lg:text-4xl">Rapid Recall</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
              Fast decision drills for Hard Times and Atonement. Use quick, low-writing tasks to practise
              AO1 argument, AO2 methods, AO3 context and AO4 comparison before timed planning or essay writing.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 no-print">
            <button
              type="button"
              onClick={() => setWorksheetMode((current) => !current)}
              className="inline-flex items-center gap-1.5 rounded-sm border border-rule bg-paper px-3 py-2 text-xs font-medium hover:bg-paper-dim"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {worksheetMode ? "Hide worksheet" : "Worksheet mode"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-sm border border-rule bg-paper px-3 py-2 text-xs font-medium hover:bg-paper-dim"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
          </div>
        </div>
      </header>

      <section className="mb-6 grid gap-3 no-print lg:grid-cols-[1fr_260px]">
        <div className="rounded-sm border border-rule bg-paper p-3 shadow-card">
          <p className="label-eyebrow mb-2">Mode selector</p>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Rapid Recall modes">
            {MODES.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={mode === item}
                onClick={() => setMode(item)}
                className={`rounded-sm border px-3 py-2 text-xs font-medium transition-colors ${
                  mode === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-rule bg-paper hover:bg-paper-dim"
                }`}
              >
                {RAPID_RECALL_MODE_LABELS[item]}
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
              className="inline-flex items-center gap-1 rounded-sm border border-rule px-2 py-1 text-[10px] font-mono text-ink-muted hover:text-ink"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="meta-mono">Mode</dt>
              <dd className="font-medium">{modeLabel}</dd>
            </div>
            <div>
              <dt className="meta-mono">Attempted</dt>
              <dd className="font-medium">{attempted}</dd>
            </div>
            <div>
              <dt className="meta-mono">Correct</dt>
              <dd className="font-medium">{correct}</dd>
            </div>
            <div>
              <dt className="meta-mono">Accuracy</dt>
              <dd className="font-medium">{accuracy}%</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className={worksheetMode ? "hidden print:block" : "grid gap-4 print:hidden md:grid-cols-2"}>
        {tasksForMode.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            answerRecord={answers[task.id]}
            draft={drafts[task.id] ?? (task.type === "matching" ? [] : "")}
            onDraftChange={handleDraftChange}
            onSubmit={handleSubmit}
          />
        ))}
      </section>

      {worksheetMode && (
        <section
          aria-label="Printable worksheet"
          className="rounded-sm border border-rule bg-paper p-5 shadow-card print:border-0 print:bg-white print:p-0 print:shadow-none"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:mb-2">
            <div>
              <p className="label-eyebrow">Print-friendly worksheet</p>
              <h2 className="font-serif text-2xl">{modeLabel}</h2>
            </div>
            <div className="flex flex-wrap gap-2 no-print">
              <button
                type="button"
                onClick={() => setShowAnswerKey((current) => !current)}
                className="rounded-sm border border-rule bg-paper px-3 py-2 text-xs font-medium hover:bg-paper-dim"
              >
                {showAnswerKey ? "Hide answer key" : "Show answer key"}
              </button>
              <button
                type="button"
                onClick={copyWorksheet}
                className="inline-flex items-center gap-1.5 rounded-sm border border-rule bg-paper px-3 py-2 text-xs font-medium hover:bg-paper-dim"
              >
                <Clipboard className="h-3.5 w-3.5" />
                Copy worksheet
              </button>
            </div>
          </div>
          {copyStatus && <p role="status" className="mb-3 text-xs font-mono text-ink-muted no-print">{copyStatus}</p>}

          <div className="mb-5 grid gap-3 print:gap-2">
            <h3 className="font-serif text-xl">Questions</h3>
            {tasksForMode.map((task, index) => (
              <article key={task.id} className="break-inside-avoid rounded-sm border border-rule bg-white p-3 print:p-2">
                <p className="mb-1 text-xs font-mono text-ink-muted">
                  {index + 1}. {RAPID_RECALL_TASK_TYPE_LABELS[task.type]} | {task.textFocus} | {task.theme} | {task.aoFocus.join(", ")}
                </p>
                <p className="text-sm font-medium leading-relaxed">{task.prompt}</p>
                {task.options?.length ? (
                  <ul className="mt-2 grid gap-1 text-xs leading-relaxed sm:grid-cols-2 print:grid-cols-2">
                    {task.options.map((option) => (
                      <li key={option} className="rounded-sm border border-rule px-2 py-1">
                        {option}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-3 h-8 border-b border-rule" aria-hidden="true" />
                )}
              </article>
            ))}
          </div>

          {showAnswerKey && (
            <div className="grid gap-3 print:gap-2" aria-label="Answer key">
              <h3 className="font-serif text-xl">Answer Key</h3>
              {tasksForMode.map((task, index) => (
                <article key={`${task.id}-answer`} className="break-inside-avoid rounded-sm border border-rule bg-white p-3 print:p-2">
                  <p className="text-sm font-semibold">{index + 1}. {formatAnswer(task.answer)}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">{task.explanation}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                    <b>Exam-use:</b> {task.examUse}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
