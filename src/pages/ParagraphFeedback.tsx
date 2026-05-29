import { FormEvent, useMemo, useState } from "react";
import { ClipboardCheck, Send, ShieldCheck } from "lucide-react";

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
import type { ParagraphFeedbackAoKey, ParagraphFeedbackCriterion, ParagraphFeedbackResponse } from "@/types/paragraphFeedback";

const FEEDBACK_SECTIONS: Array<{ key: ParagraphFeedbackAoKey; title: string }> = [
  { key: "ao1", title: "AO1: argument focus" },
  { key: "ao2", title: "AO2: method / word / effect" },
  { key: "ao3", title: "AO3: context relevance" },
  { key: "ao4", title: "AO4: comparison quality" },
];

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

export default function ParagraphFeedback() {
  const [questionFocus, setQuestionFocus] = useState("");
  const [theme, setTheme] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [routeContext, setRouteContext] = useState("");
  const [feedback, setFeedback] = useState<ParagraphFeedbackResponse | null>(null);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

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
        setError("Feedback unavailable because the response did not meet the safety contract.");
        return;
      }

      setFeedback(safeFeedback.value);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Feedback is unavailable. Try again with one paragraph.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 border-b border-rule pb-5">
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
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
        <Alert variant="destructive" className="mt-6 rounded-sm">
          <AlertTitle>Feedback unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {feedback && (
        <section className="mt-6 grid gap-4" aria-label="Paragraph feedback results">
          {feedback.safetyNotice && (
            <Alert className="rounded-sm border-amber-300 bg-amber-50 text-amber-950">
              <AlertTitle>Safety notice</AlertTitle>
              <AlertDescription>{feedback.safetyNotice}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {FEEDBACK_SECTIONS.map((section) => (
              <FeedbackCriterionCard key={section.key} title={section.title} criterion={feedback[section.key]} />
            ))}
            {feedback.routeMatch && (
              <FeedbackCriterionCard title="Route match" criterion={feedback.routeMatch} />
            )}
          </div>

          <article className="rounded-sm border border-primary/30 bg-highlight p-4 shadow-card">
            <h2 className="font-serif text-xl">Next target</h2>
            <p className="mt-2 text-sm leading-relaxed">{feedback.nextTarget}</p>
          </article>
        </section>
      )}
    </div>
  );
}
