import { FormEvent, useMemo, useState } from "react";
import { Clipboard, ClipboardCheck, Printer, Send, ShieldCheck } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PARAGRAPH_FEEDBACK_ENDPOINT,
  PARAGRAPH_FEEDBACK_LIMITS,
  createUnsafeParagraphFeedbackFallback,
  validateParagraphFeedbackResponse,
} from "@/lib/paragraphFeedbackContract";
import { formatParagraphFeedbackRecord } from "@/lib/paragraphFeedbackExport";
import type { ParagraphFeedbackAoKey, ParagraphFeedbackCriterion, ParagraphFeedbackResponse } from "@/types/paragraphFeedback";

const FEEDBACK_SECTIONS: Array<{ key: ParagraphFeedbackAoKey; cardTitle: string; recordTitle: string }> = [
  { key: "ao1", cardTitle: "AO1: argument focus", recordTitle: "AO1 - Argument focus" },
  { key: "ao2", cardTitle: "AO2: method / word / effect", recordTitle: "AO2 - Method / word / effect" },
  { key: "ao3", cardTitle: "AO3: context relevance", recordTitle: "AO3 - Context relevance" },
  { key: "ao4", cardTitle: "AO4: comparison quality", recordTitle: "AO4 - Comparison quality" },
];

type FeedbackExportContext = {
  questionFocus?: string;
  theme?: string;
  routeContext?: string;
};

function getParagraphError(paragraph: string): string | null {
  const length = paragraph.trim().length;
  if (length === 0) return "Paste one paragraph to begin.";
  if (length < PARAGRAPH_FEEDBACK_LIMITS.paragraphMin) {
    return `Paragraph must be at least ${PARAGRAPH_FEEDBACK_LIMITS.paragraphMin} characters.`;
  }
  if (length > PARAGRAPH_FEEDBACK_LIMITS.paragraphMax) {
    return `Paragraph must be ${PARAGRAPH_FEEDBACK_LIMITS.paragraphMax} characters or fewer.`;
  }
  return null;
}

function getOptionalLengthError(label: string, value: string, maxLength: number): string | null {
  return value.trim().length > maxLength ? `${label} must be ${maxLength} characters or fewer.` : null;
}

function getFeedbackExportContext(questionFocus: string, theme: string, routeContext: string): FeedbackExportContext {
  return {
    ...(questionFocus.trim() ? { questionFocus: questionFocus.trim() } : {}),
    ...(theme.trim() ? { theme: theme.trim() } : {}),
    ...(routeContext.trim() ? { routeContext: routeContext.trim() } : {}),
  };
}

function isErrorPayload(value: unknown): value is { error: string } {
  return typeof value === "object" && value !== null && "error" in value && typeof (value as { error: unknown }).error === "string";
}

function FeedbackCriterionCard({ title, criterion }: { title: string; criterion: ParagraphFeedbackCriterion }) {
  return (
    <article className="rounded-sm border border-rule bg-paper p-4 shadow-card">
      <h2 className="font-serif text-xl">{title}</h2>
      <dl className="mt-3 space-y-3 text-sm leading-relaxed">
        <div>
          <dt className="label-eyebrow mb-1">Strength</dt>
          <dd>{criterion.strength}</dd>
        </div>
        <div>
          <dt className="label-eyebrow mb-1">Target</dt>
          <dd>{criterion.target}</dd>
        </div>
      </dl>
    </article>
  );
}

function FeedbackRecordContextItem({ label, value }: { label: string; value?: string }) {
  const safeValue = value?.trim();
  if (!safeValue) return null;

  return (
    <div className="rounded-sm border border-rule bg-white p-3 print:border-black print:p-2">
      <dt className="label-eyebrow mb-1 print:text-[9pt] print:text-black">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm leading-relaxed print:text-[10.5pt] print:leading-snug">{safeValue}</dd>
    </div>
  );
}

function FeedbackRecordCriterion({ title, criterion }: { title: string; criterion: ParagraphFeedbackCriterion }) {
  return (
    <article className="rounded-sm border border-rule bg-white p-3 print:break-inside-avoid print:border-black print:p-2">
      <h3 className="font-serif text-lg print:text-[13pt]">{title}</h3>
      <dl className="mt-2 grid gap-2 text-sm leading-relaxed print:mt-1 print:gap-1 print:text-[10.5pt] print:leading-snug">
        <div>
          <dt className="label-eyebrow mb-1 print:text-[9pt] print:text-black">Strength</dt>
          <dd>{criterion.strength}</dd>
        </div>
        <div>
          <dt className="label-eyebrow mb-1 print:text-[9pt] print:text-black">Target</dt>
          <dd>{criterion.target}</dd>
        </div>
      </dl>
    </article>
  );
}

function FeedbackRevisionPrompts() {
  return (
    <section
      aria-label="Revision action"
      className="rounded-sm border border-rule-strong bg-white p-3 print:break-inside-avoid print:border-black print:p-2"
    >
      <h3 className="font-serif text-lg print:text-[13pt]">Revision action</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 print:mt-2 print:grid-cols-2 print:gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted print:text-[9pt] print:text-black">What I will improve next:</p>
          <div aria-hidden="true" className="mt-3 h-14 border-b border-dashed border-rule-strong print:h-12 print:border-black" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted print:text-[9pt] print:text-black">One sentence I will redraft:</p>
          <div aria-hidden="true" className="mt-3 h-14 border-b border-dashed border-rule-strong print:h-12 print:border-black" />
        </div>
      </div>
    </section>
  );
}

function FeedbackExportRecord({
  context,
  feedback,
  copyStatus,
  onCopy,
  onPrint,
}: {
  context: FeedbackExportContext | null;
  feedback: ParagraphFeedbackResponse;
  copyStatus: string | null;
  onCopy: () => void;
  onPrint: () => void;
}) {
  const hasContext = Boolean(context?.questionFocus || context?.theme || context?.routeContext);

  return (
    <section
      aria-label="Feedback export record"
      className="rounded-sm border border-rule-strong bg-paper p-4 shadow-card print:m-0 print:break-inside-auto print:border-0 print:bg-white print:p-0 print:text-black print:shadow-none"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 print:block">
        <div>
          <p className="label-eyebrow print:text-[9pt] print:text-black">Revision record</p>
          <h2 className="font-serif text-2xl print:text-[18pt]">Paragraph Feedback Record</h2>
        </div>
        <div className="no-print flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button type="button" onClick={onCopy} className="w-full gap-2 sm:w-auto">
            <Clipboard className="h-4 w-4" />
            Copy feedback record
          </Button>
          <Button type="button" variant="outline" onClick={onPrint} className="w-full gap-2 sm:w-auto">
            <Printer className="h-4 w-4" />
            Print feedback record
          </Button>
        </div>
      </div>

      {copyStatus && (
        <p role="status" aria-live="polite" className="no-print mt-3 text-xs font-mono text-ink-muted">
          {copyStatus}
        </p>
      )}

      <div className="mt-4 grid gap-3 print:mt-2 print:gap-2">
        {hasContext && (
          <section className="grid gap-2 print:break-inside-avoid print:gap-1" aria-label="Submitted feedback context">
            <h3 className="font-serif text-lg print:text-[13pt]">Submitted focus</h3>
            <dl className="grid gap-2 print:gap-1">
              <FeedbackRecordContextItem label="Question focus" value={context?.questionFocus} />
              <FeedbackRecordContextItem label="Theme" value={context?.theme} />
              <FeedbackRecordContextItem label="Route context" value={context?.routeContext} />
            </dl>
          </section>
        )}

        <section className="grid gap-2 print:gap-1" aria-label="Assessment objective feedback">
          {FEEDBACK_SECTIONS.map((section) => (
            <FeedbackRecordCriterion key={section.key} title={section.recordTitle} criterion={feedback[section.key]} />
          ))}
          {feedback.routeMatch && <FeedbackRecordCriterion title="Route match" criterion={feedback.routeMatch} />}
        </section>

        <article className="rounded-sm border border-rule-strong bg-white p-3 print:break-inside-avoid print:border-black print:p-2">
          <h3 className="font-serif text-lg print:text-[13pt]">Next target</h3>
          <p className="mt-2 text-sm leading-relaxed print:mt-1 print:text-[10.5pt] print:leading-snug">{feedback.nextTarget}</p>
        </article>

        {feedback.safetyNotice && (
          <article className="rounded-sm border border-rule-strong bg-white p-3 print:break-inside-avoid print:border-black print:p-2">
            <h3 className="font-serif text-lg print:text-[13pt]">Safety notice</h3>
            <p className="mt-2 text-sm leading-relaxed print:mt-1 print:text-[10.5pt] print:leading-snug">{feedback.safetyNotice}</p>
          </article>
        )}

        <FeedbackRevisionPrompts />
      </div>
    </section>
  );
}

export default function ParagraphFeedback() {
  const [questionFocus, setQuestionFocus] = useState("");
  const [theme, setTheme] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [routeContext, setRouteContext] = useState("");
  const [feedback, setFeedback] = useState<ParagraphFeedbackResponse | null>(null);
  const [feedbackExportContext, setFeedbackExportContext] = useState<FeedbackExportContext | null>(null);
  const [feedbackCopyStatus, setFeedbackCopyStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paragraphError = useMemo(() => getParagraphError(paragraph), [paragraph]);
  const questionError = useMemo(() => (
    getOptionalLengthError("Question focus", questionFocus, PARAGRAPH_FEEDBACK_LIMITS.questionFocusMax)
  ), [questionFocus]);
  const themeError = useMemo(() => getOptionalLengthError("Theme", theme, PARAGRAPH_FEEDBACK_LIMITS.themeMax), [theme]);
  const routeContextError = useMemo(() => (
    getOptionalLengthError("Route context", routeContext, PARAGRAPH_FEEDBACK_LIMITS.routeContextMax)
  ), [routeContext]);
  const validationError = paragraphError ?? questionError ?? themeError ?? routeContextError;
  const canSubmit = !validationError && !isSubmitting;
  const feedbackRecord = useMemo(() => {
    if (!feedback) return "";

    return formatParagraphFeedbackRecord({
      ...(feedbackExportContext ?? {}),
      feedback,
    });
  }, [feedback, feedbackExportContext]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validationError) {
      setError(validationError);
      return;
    }

    const submittedContext = getFeedbackExportContext(questionFocus, theme, routeContext);

    setIsSubmitting(true);
    setError(null);
    setFeedback(null);
    setFeedbackExportContext(null);
    setFeedbackCopyStatus(null);

    try {
      const response = await fetch(PARAGRAPH_FEEDBACK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paragraph: paragraph.trim(),
          ...(questionFocus.trim() ? { questionFocus: questionFocus.trim() } : {}),
          ...(theme.trim() ? { theme: theme.trim() } : {}),
          ...(routeContext.trim() ? { routeContext: routeContext.trim() } : {}),
        }),
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(isErrorPayload(payload) ? payload.error : "Feedback is unavailable. Check the paragraph and try again.");
      }

      const safeFeedback = validateParagraphFeedbackResponse(payload);
      if (!safeFeedback.ok) {
        setFeedback(createUnsafeParagraphFeedbackFallback());
        setFeedbackExportContext(submittedContext);
        setError("Feedback unavailable because the response did not meet the safety contract.");
        return;
      }

      setFeedback(safeFeedback.value);
      setFeedbackExportContext(submittedContext);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Feedback is unavailable. Try again with one paragraph.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyFeedbackRecord = async () => {
    if (!feedbackRecord || !navigator.clipboard?.writeText) {
      setFeedbackCopyStatus("Copy unavailable");
      return;
    }

    try {
      await navigator.clipboard.writeText(feedbackRecord);
      setFeedbackCopyStatus("Feedback record copied");
    } catch {
      setFeedbackCopyStatus("Copy unavailable");
    }
  };

  const printFeedbackRecord = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 print:px-0 print:py-0">
      <header className="mb-6 border-b border-rule pb-5 print:hidden">
        <p className="label-eyebrow mb-2">Component 2 Prose</p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-3xl lg:text-4xl">AI Paragraph Feedback Coach</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
              AO1-AO4 feedback for one Component 2 paragraph. This coach gives improvement targets, not model paragraphs.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-rule bg-paper px-3 py-2 text-xs font-mono text-ink-muted">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Feedback tool only
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] print:hidden">
        <form onSubmit={handleSubmit} className="space-y-5" aria-label="Paragraph feedback form">
          <Card className="rounded-sm border-rule shadow-card">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Your paragraph</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="question-focus">Essay question or question focus (optional but recommended)</Label>
                <Input
                  id="question-focus"
                  value={questionFocus}
                  onChange={(event) => setQuestionFocus(event.target.value)}
                  maxLength={PARAGRAPH_FEEDBACK_LIMITS.questionFocusMax + 1}
                  placeholder="e.g. How do Dickens and McEwan present responsibility?"
                />
                {questionError && <p className="text-xs text-destructive">{questionError}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="theme">Theme (optional)</Label>
                <Input
                  id="theme"
                  value={theme}
                  onChange={(event) => setTheme(event.target.value)}
                  maxLength={PARAGRAPH_FEEDBACK_LIMITS.themeMax + 1}
                  placeholder="e.g. education, class, memory, guilt"
                />
                {themeError && <p className="text-xs text-destructive">{themeError}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paragraph">Paragraph</Label>
                <Textarea
                  id="paragraph"
                  value={paragraph}
                  onChange={(event) => setParagraph(event.target.value)}
                  maxLength={PARAGRAPH_FEEDBACK_LIMITS.paragraphMax + 1}
                  className="min-h-[260px] resize-y leading-relaxed"
                  placeholder="Paste one completed paragraph here."
                  aria-describedby="paragraph-help"
                />
                <div id="paragraph-help" className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
                  <span>{paragraphError ?? "Ready for feedback."}</span>
                  <span>{paragraph.trim().length} / {PARAGRAPH_FEEDBACK_LIMITS.paragraphMax}</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="route-context">Route context</Label>
                <Textarea
                  id="route-context"
                  value={routeContext}
                  onChange={(event) => setRouteContext(event.target.value)}
                  maxLength={PARAGRAPH_FEEDBACK_LIMITS.routeContextMax + 1}
                  className="min-h-[110px] resize-y"
                  placeholder="Paste your practice session summary here."
                  aria-describedby="route-context-help"
                />
                <div id="route-context-help" className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
                  <span>
                    Optional: paste your Rapid Recall practice session summary so the coach can check whether your paragraph follows your selected route.
                  </span>
                  <span>{routeContext.trim().length} / {PARAGRAPH_FEEDBACK_LIMITS.routeContextMax}</span>
                </div>
                {routeContextError && <p className="text-xs text-destructive">{routeContextError}</p>}
              </div>

              <Button type="submit" disabled={!canSubmit} className="w-full gap-2 sm:w-auto">
                <Send className="h-4 w-4" />
                {isSubmitting ? "Getting feedback" : "Get AO feedback"}
              </Button>
            </CardContent>
          </Card>
        </form>

        <aside className="space-y-4">
          <section className="rounded-sm border border-rule bg-paper p-4 shadow-card" aria-label="Feedback constraints">
            <div className="mb-3 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-xl">Guardrails</h2>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed text-ink-muted">
              <li>Paste one paragraph only.</li>
              <li>The coach will not write or rewrite your answer.</li>
              <li>Feedback uses AO1, AO2, AO3 and AO4 only.</li>
            </ul>
          </section>
        </aside>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6 rounded-sm no-print">
          <AlertTitle>Feedback unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {feedback && (
        <section className="mt-6 grid gap-4 print-area print:mt-0 print:block" aria-label="Paragraph feedback results">
          {feedbackRecord && (
            <FeedbackExportRecord
              context={feedbackExportContext}
              feedback={feedback}
              copyStatus={feedbackCopyStatus}
              onCopy={copyFeedbackRecord}
              onPrint={printFeedbackRecord}
            />
          )}

          {feedback.safetyNotice && (
            <Alert className="no-print rounded-sm border-amber-300 bg-amber-50 text-amber-950">
              <AlertTitle>Safety notice</AlertTitle>
              <AlertDescription>{feedback.safetyNotice}</AlertDescription>
            </Alert>
          )}

          <div className="no-print grid gap-4 md:grid-cols-2">
            {FEEDBACK_SECTIONS.map((section) => (
              <FeedbackCriterionCard key={section.key} title={section.cardTitle} criterion={feedback[section.key]} />
            ))}
            {feedback.routeMatch && (
              <FeedbackCriterionCard title="Route match" criterion={feedback.routeMatch} />
            )}
          </div>

          <article className="no-print rounded-sm border border-primary/30 bg-highlight p-4 shadow-card">
            <h2 className="font-serif text-xl">Next target</h2>
            <p className="mt-2 text-sm leading-relaxed">{feedback.nextTarget}</p>
          </article>
        </section>
      )}
    </div>
  );
}
