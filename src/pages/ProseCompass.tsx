import { useState, type FormEvent } from "react";
import { NavLink } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  QUESTION_TEXT_MAX,
  QUESTION_TEXT_MIN,
  SHORT_FIELD_MAX,
  VALID_TARGET_LEVELS,
  type PlaceholderResponse,
  type TargetLevel,
} from "../../supabase/functions/generate-model-essay/validation";

type SubmitState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "result"; response: PlaceholderResponse };

function mapHttpError(status: number): string {
  if (status === 401) return "Your session has expired. Sign in again to generate a plan.";
  if (status === 400) return "The request was rejected. Check the field lengths and try again.";
  if (status === 429) return "Too many requests. Wait a moment before trying again.";
  if (status >= 500) return "The server-side generator is unavailable. Try again shortly.";
  return `Request failed (status ${status}).`;
}

export default function ProseCompass() {
  const { user, loading: authLoading } = useAuth();

  const [questionText, setQuestionText] = useState("");
  const [theme, setTheme] = useState("");
  const [thesisAxis, setThesisAxis] = useState("");
  const [targetLevel, setTargetLevel] = useState<TargetLevel | "">("");
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });

  if (authLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8">
        <header className="mb-6">
          <h1 className="font-serif text-2xl">Prose Compass</h1>
          <p className="text-sm text-ink-muted mt-1">
            A guided planner for AO1–AO4 model essay structure.
          </p>
        </header>
        <div
          role="status"
          className="border border-rule bg-paper-dim/50 p-6 text-sm text-ink-muted"
        >
          <p className="mb-3 text-ink">
            Sign in to plan a model essay with Prose Compass.
          </p>
          <p>
            <NavLink to="/auth" className="underline text-ink">
              Sign in
            </NavLink>{" "}
            to continue.
          </p>
        </div>
      </div>
    );
  }

  const trimmedLength = questionText.trim().length;
  const withinBounds =
    trimmedLength >= QUESTION_TEXT_MIN && trimmedLength <= QUESTION_TEXT_MAX;
  const isLoading = submitState.kind === "loading";
  const canSubmit = withinBounds && !isLoading;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitState({ kind: "loading" });

    let session;
    try {
      const result = await supabase.auth.getSession();
      session = result.data.session;
    } catch {
      setSubmitState({
        kind: "error",
        message: "Could not read your session. Refresh and try again.",
      });
      return;
    }
    const jwt = session?.access_token;
    if (!jwt) {
      setSubmitState({ kind: "error", message: mapHttpError(401) });
      return;
    }

    const body: Record<string, unknown> = { questionText: questionText.trim() };
    const themeValue = theme.trim();
    if (themeValue) body.theme = themeValue;
    const axisValue = thesisAxis.trim();
    if (axisValue) body.thesisAxis = axisValue;
    if (targetLevel) body.targetLevel = targetLevel;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-model-essay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        let serverMessage: string | null = null;
        try {
          const errBody = (await response.json()) as { error?: unknown };
          if (errBody && typeof errBody.error === "string") {
            serverMessage = errBody.error;
          }
        } catch {
          // Non-JSON error body — fall through to mapped message.
        }
        setSubmitState({
          kind: "error",
          message: serverMessage ?? mapHttpError(response.status),
        });
        return;
      }

      const parsed = (await response.json()) as PlaceholderResponse;
      setSubmitState({ kind: "result", response: parsed });
    } catch {
      setSubmitState({
        kind: "error",
        message: "Network request failed. Check your connection and try again.",
      });
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8">
      <header className="mb-6">
        <h1 className="font-serif text-2xl">Prose Compass</h1>
        <p className="text-sm text-ink-muted mt-1">
          A guided planner that drafts an AO1–AO4 essay structure from a single
          question prompt. Live generation is wired server-side; this page renders
          the structured plan returned by the planner endpoint.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <form
          onSubmit={handleSubmit}
          className="border border-rule bg-paper-dim/30 p-6 space-y-5"
          aria-labelledby="prose-compass-form-heading"
        >
          <h2 id="prose-compass-form-heading" className="font-serif text-lg">
            Plan a model essay
          </h2>

          <div className="space-y-1.5">
            <label htmlFor="prose-compass-question" className="block text-xs font-mono uppercase tracking-wider text-ink-muted">
              Question
            </label>
            <textarea
              id="prose-compass-question"
              className="w-full min-h-[140px] border border-rule bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              maxLength={QUESTION_TEXT_MAX}
              placeholder="Paste the full essay question."
              required
            />
            <p className="text-xs text-ink-muted">
              {trimmedLength}/{QUESTION_TEXT_MAX} characters (minimum {QUESTION_TEXT_MIN}).
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="prose-compass-theme" className="block text-xs font-mono uppercase tracking-wider text-ink-muted">
                Theme (optional)
              </label>
              <input
                id="prose-compass-theme"
                type="text"
                className="w-full border border-rule bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
                maxLength={SHORT_FIELD_MAX}
                placeholder="e.g. power"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="prose-compass-axis" className="block text-xs font-mono uppercase tracking-wider text-ink-muted">
                Thesis axis (optional)
              </label>
              <input
                id="prose-compass-axis"
                type="text"
                className="w-full border border-rule bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={thesisAxis}
                onChange={(event) => setThesisAxis(event.target.value)}
                maxLength={SHORT_FIELD_MAX}
                placeholder="e.g. coercion vs consent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="prose-compass-target" className="block text-xs font-mono uppercase tracking-wider text-ink-muted">
              Target level (optional)
            </label>
            <select
              id="prose-compass-target"
              className="w-full border border-rule bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={targetLevel}
              onChange={(event) => setTargetLevel(event.target.value as TargetLevel | "")}
            >
              <option value="">Not specified</option>
              {VALID_TARGET_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={!canSubmit} className="gap-2">
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isLoading ? "Generating plan…" : "Generate plan"}
            </Button>
            {!withinBounds && trimmedLength > 0 && (
              <span className="text-xs text-ink-muted">
                Question must be at least {QUESTION_TEXT_MIN} characters.
              </span>
            )}
          </div>
        </form>

        <section aria-live="polite" className="lg:sticky lg:top-24 lg:self-start">
          {submitState.kind === "idle" && (
            <div className="border border-rule bg-paper-dim/30 p-6 text-sm text-ink-muted">
              Submit a question to receive a structured AO1–AO4 plan from the
              server-side planner.
            </div>
          )}

          {submitState.kind === "loading" && (
            <div className="border border-rule bg-paper-dim/30 p-6 text-sm text-ink-muted flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating plan…
            </div>
          )}

          {submitState.kind === "error" && (
            <div
              role="alert"
              className="border border-rule bg-paper-dim/30 p-6 text-sm text-ink"
            >
              <p className="font-medium mb-1">We couldn’t generate a plan.</p>
              <p className="text-ink-muted">{submitState.message}</p>
            </div>
          )}

          {submitState.kind === "result" && (
            <PlanResult response={submitState.response} />
          )}
        </section>
      </div>
    </div>
  );
}

function PlanResult({ response }: { response: PlaceholderResponse }) {
  const { essayPlan, safety } = response;
  return (
    <article className="border border-rule bg-paper-dim/30 p-6 space-y-5">
      <header>
        <h2 className="font-serif text-lg">Essay plan</h2>
        <p className="text-xs text-ink-muted mt-1">
          Live generation is not yet wired — this is a structured plan from the
          server-side planner.
        </p>
      </header>

      <section className="space-y-1.5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-ink-muted">
          Thesis
        </h3>
        <p className="text-sm text-ink">{essayPlan.thesis}</p>
      </section>

      <section className="space-y-1.5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-ink-muted">
          Paragraph moves
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-ink">
          {essayPlan.paragraphMoves.map((move, index) => (
            <li key={index}>{move}</li>
          ))}
        </ol>
      </section>

      <section className="space-y-1.5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-ink-muted">
          Assessment objectives
        </h3>
        <ul className="flex flex-wrap gap-2 text-xs">
          {essayPlan.assessmentObjectives.map((ao) => (
            <li
              key={ao}
              className="font-mono px-2 py-0.5 border border-rule bg-paper text-ink"
            >
              {ao}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-1.5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-ink-muted">
          Quote policy
        </h3>
        <p className="text-sm text-ink-muted">{safety.quoteConstraint}</p>
        <p className="text-xs text-ink-muted">Server-side generation.</p>
      </section>
    </article>
  );
}
