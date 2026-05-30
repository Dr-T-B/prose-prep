import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Printer } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import type {
  AoFeedback,
  MarkerMode,
  MarkerPayload,
  MarkerResult,
  QuoteDiagnostic,
} from "@/types/essayMarker";

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: "Check your input and try again.",
  401: "Your session has expired. Please sign in again.",
  404: "Question or attempt not found.",
  422: "The feedback tool returned an unexpected response. Please try again.",
  429: "You've used your 10 feedback requests for this hour. Try again shortly.",
  500: "The feedback tool is temporarily unavailable.",
  503: "The feedback provider is unavailable. No AI feedback was generated.",
};

const EXAM_WARNING_TEXT =
  "Formative guidance only: use this as practice feedback, not an official assessment judgement.";

const MODE_LABEL: Record<MarkerMode, string> = {
  full_essay: "Full essay",
  paragraph_only: "Single paragraph",
  structured_attempt: "Saved attempt",
};

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function truncate(text: string, max: number): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(d.getDate()).padStart(2, "0");
  const mon = months[d.getMonth()];
  const yr = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${mon} ${yr}, ${hh}:${mm}`;
}

function quoteStatusBadgeClasses(status: QuoteDiagnostic["status"]): string {
  switch (status) {
    case "verified":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "unverified":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "paraphrased":
      return "bg-sky-100 text-sky-800 border-sky-200";
  }
}

type MarkerHttpError = { status: number; message: string; raw?: unknown };

function isHttpError(e: unknown): e is MarkerHttpError {
  return !!e && typeof e === "object" && "status" in e && typeof (e as MarkerHttpError).status === "number";
}

const UNSAFE_FEEDBACK_TEXT_RE = new RegExp(
  [
    "\\bAO" + "5\\b",
    "\\b(?:mark|marks|marked|marking)\\s*(?:[:=]|\\d|\\/|out of)\\b",
    "\\b(?:score|scores|scored|scoring)\\s*(?:[:=]|\\d|\\/|out of)\\b",
    "\\b(?:grade|graded|grading)\\b",
    "\\b(?:top[-\\s]?band|band\\s*[1-5]|level\\s*[1-5]\\s+band|upper\\s+band|lower\\s+band|bands?)\\b",
    "\\blevel\\s*[1-5]\\b",
    "model\\s+upgrade\\s+paragraph",
    "model\\s+answer",
    "\\brewrite\\b",
    "rewritten\\s+paragraph",
    "full\\s+essay",
  ].join("|"),
  "i",
);

const FORBIDDEN_FEEDBACK_KEYS = new Set([
  "provisionalLevel",
  "provisionalMarks",
  "level",
  "mark",
  "marks",
  "band",
  "bands",
  "topBand",
  "score",
  "scores",
  "grade",
  "modelUpgradeParagraph",
  "modelAnswer",
  "rewrittenParagraph",
  "fullEssay",
  "AO" + "5",
]);

function hasUnsafeFeedbackValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasUnsafeFeedbackValue);
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).some(([key, entry]) => (
      FORBIDDEN_FEEDBACK_KEYS.has(key) ||
      new RegExp("^ao" + "5$", "i").test(key) ||
      hasUnsafeFeedbackValue(entry)
    ));
  }
  return typeof value === "string" && UNSAFE_FEEDBACK_TEXT_RE.test(value);
}

function isAoFeedback(value: unknown): value is AoFeedback {
  if (!value || typeof value !== "object" || hasUnsafeFeedbackValue(value)) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.diagnosticLabel === "string" &&
    typeof entry.strength === "string" &&
    typeof entry.nextStep === "string"
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string" && !hasUnsafeFeedbackValue(entry));
}

function isQuoteDiagnosticArray(value: unknown): value is QuoteDiagnostic[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const diagnostic = item as Record<string, unknown>;
    return (
      typeof diagnostic.quote === "string" &&
      (diagnostic.status === "verified" || diagnostic.status === "unverified" || diagnostic.status === "paraphrased") &&
      typeof diagnostic.note === "string" &&
      !hasUnsafeFeedbackValue(diagnostic.note)
    );
  });
}

function isSafeMarkerResult(value: unknown): value is MarkerResult {
  if (!value || typeof value !== "object" || hasUnsafeFeedbackValue(value)) return false;
  const result = value as Record<string, unknown>;
  const ao = result.aoFeedback as Record<string, unknown> | undefined;
  return (
    result.examWarning === EXAM_WARNING_TEXT &&
    typeof result.summary === "string" &&
    !!ao &&
    isAoFeedback(ao.AO1) &&
    isAoFeedback(ao.AO2) &&
    isAoFeedback(ao.AO3) &&
    isAoFeedback(ao.AO4) &&
    isStringArray(result.strengths) &&
    isStringArray(result.priorityTargets) &&
    isQuoteDiagnosticArray(result.quoteMethodDiagnostic) &&
    isStringArray(result.revisionPrompts) &&
    typeof result.nextStep === "string"
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SSE streaming: progressive section state + parser
// ────────────────────────────────────────────────────────────────────────────

export type SectionState = {
  examWarning:           string | null;
  summary:               string | null;
  AO1:                   AoFeedback | null;
  AO2:                   AoFeedback | null;
  AO3:                   AoFeedback | null;
  AO4:                   AoFeedback | null;
  strengths:             string[] | null;
  priorityTargets:       string[] | null;
  quoteMethodDiagnostic: QuoteDiagnostic[] | null;
  revisionPrompts:       string[] | null;
  nextStep:              string | null;
  teacherNotes:          string | null;
};

const EMPTY_SECTIONS: SectionState = {
  examWarning: null,
  summary: null,
  AO1: null,
  AO2: null,
  AO3: null,
  AO4: null,
  strengths: null,
  priorityTargets: null,
  quoteMethodDiagnostic: null,
  revisionPrompts: null,
  nextStep: null,
  teacherNotes: null,
};

// Pure: scan the accumulated SSE text for closed <section:NAME>…</section:NAME>
// pairs and return a partial SectionState containing only newly-parsed sections
// (sections already present in `prev` are skipped). Exported for unit tests.
export function parseSectionsDelta(
  text: string,
  prev: SectionState,
): Partial<SectionState> {
  const re = /<section:([^>\s]+)>([\s\S]*?)<\/section:\1>/gi;
  const delta: Partial<SectionState> = {};
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const name = match[1] as keyof SectionState;
    const content = match[2].trim();
    if (prev[name] !== null || delta[name] !== undefined) continue;
    try {
      switch (name) {
        case "examWarning":
        case "summary":
        case "nextStep":
        case "teacherNotes":
          if (!hasUnsafeFeedbackValue(content)) delta[name] = content;
          break;
        case "AO1":
        case "AO2":
        case "AO3":
        case "AO4":
          {
            const parsed = JSON.parse(content) as unknown;
            if (isAoFeedback(parsed)) delta[name] = parsed;
          }
          break;
        case "strengths":
        case "priorityTargets":
        case "revisionPrompts":
          {
            const parsed = JSON.parse(content) as unknown;
            if (isStringArray(parsed)) delta[name] = parsed;
          }
          break;
        case "quoteMethodDiagnostic":
          {
            const parsed = JSON.parse(content) as unknown;
            if (isQuoteDiagnosticArray(parsed)) delta.quoteMethodDiagnostic = parsed;
          }
          break;
        default:
          break;
      }
    } catch {
      // Malformed JSON in a section payload — skip; if the model emits a
      // corrected version later it still won't re-match because the regex
      // is non-greedy and only matches closed tags.
    }
  }
  return delta;
}

function mapHttpError(status: number): string {
  return HTTP_ERROR_MESSAGES[status] ?? HTTP_ERROR_MESSAGES[500];
}

// ────────────────────────────────────────────────────────────────────────────
// Output sub-components
// ────────────────────────────────────────────────────────────────────────────

function ExamWarningCallout() {
  return (
    <Alert className="border-sky-300 bg-sky-50 text-sky-900">
      <AlertTitle className="text-sm font-semibold">Formative feedback only</AlertTitle>
      <AlertDescription className="text-sm">{EXAM_WARNING_TEXT}</AlertDescription>
    </Alert>
  );
}

function SummaryCard({ summary }: { summary: string }) {
  return (
    <Card className="print:break-inside-avoid">
      <CardHeader>
        <CardTitle className="text-base">Summary</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed">{summary}</CardContent>
    </Card>
  );
}

function AOFeedbackCard({ aoKey, feedback }: { aoKey: string; feedback: AoFeedback }) {
  return (
    <Card className="print:break-inside-avoid">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold">{aoKey}</CardTitle>
        <Badge variant="outline" className="bg-paper-dim text-ink border-rule">
          {feedback.diagnosticLabel}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-ink-muted mb-1">Strength</div>
          <p className="leading-relaxed">{feedback.strength}</p>
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-ink-muted mb-1">Next step</div>
          <p className="leading-relaxed">{feedback.nextStep}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StrengthsTargetsCard({
  strengths,
  targets,
}: {
  strengths: string[];
  targets: string[];
}) {
  return (
    <Card className="print:break-inside-avoid">
      <CardHeader>
        <CardTitle className="text-base">Strengths & Priority Targets</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-700 mb-2">Strengths</div>
          <ul className="space-y-1.5 text-sm">
            {strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-600 mt-1">●</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-sky-700 mb-2">Priority targets</div>
          <ul className="space-y-1.5 text-sm">
            {targets.map((target, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-sky-600 mt-1">●</span>
                <span>{target}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function QuoteDiagnosticCard({ items }: { items: QuoteDiagnostic[] }) {
  if (!items.length) return null;
  return (
    <Card className="print:break-inside-avoid">
      <CardHeader>
        <CardTitle className="text-base">Quotation diagnostic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((q, i) => (
          <div key={i} className="border border-rule rounded-sm p-3 bg-paper-dim/30">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <blockquote className="text-sm italic leading-relaxed">"{q.quote}"</blockquote>
              <Badge variant="outline" className={`${quoteStatusBadgeClasses(q.status)} shrink-0`}>
                {q.status}
              </Badge>
            </div>
            {q.note && <p className="text-xs text-ink-muted">{q.note}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RevisionPromptsCard({ prompts }: { prompts: string[] }) {
  return (
    <Card className="print:break-inside-avoid">
      <CardHeader>
        <CardTitle className="text-base">Revision Prompts</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5 text-sm">
          {prompts.map((prompt, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary mt-1">●</span>
              <span>{prompt}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function NextStepCard({ nextStep }: { nextStep: string }) {
  return (
    <Card className="print:break-inside-avoid">
      <CardHeader>
        <CardTitle className="text-base">Next Step</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{nextStep}</p>
      </CardContent>
    </Card>
  );
}

function OutputSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function MarkerOutput({ result }: { result: MarkerResult }) {
  const aoKeys: Array<keyof MarkerResult["aoFeedback"]> = ["AO1", "AO2", "AO3", "AO4"];
  return (
    <div className="space-y-4 print:space-y-3">
      <ExamWarningCallout />
      <SummaryCard summary={result.summary} />
      <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2 print:gap-3">
        {aoKeys.map((k) => (
          <AOFeedbackCard key={k} aoKey={k} feedback={result.aoFeedback[k]} />
        ))}
      </div>
      <StrengthsTargetsCard strengths={result.strengths} targets={result.priorityTargets} />
      <QuoteDiagnosticCard items={result.quoteMethodDiagnostic} />
      <RevisionPromptsCard prompts={result.revisionPrompts} />
      <NextStepCard nextStep={result.nextStep} />
    </div>
  );
}

// Progressive renderer: each section is either skeleton (null) or real
// content (non-null). Render order matches the streaming order produced
// by the Edge Function.
function StreamingMarkerOutput({ sections }: { sections: SectionState }) {
  const aoKeys: Array<"AO1" | "AO2" | "AO3" | "AO4"> = ["AO1", "AO2", "AO3", "AO4"];

  return (
    <div className="space-y-4 print:space-y-3">
      <ExamWarningCallout />
      {sections.summary !== null ? (
        <SummaryCard summary={sections.summary} />
      ) : (
        <Skeleton className="h-24 w-full" />
      )}
      <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2 print:gap-3">
        {aoKeys.map((k) =>
          sections[k] !== null ? (
            <AOFeedbackCard key={k} aoKey={k} feedback={sections[k] as AoFeedback} />
          ) : (
            <Skeleton key={k} className="h-40 w-full" />
          ),
        )}
      </div>
      {sections.strengths !== null && sections.priorityTargets !== null ? (
        <StrengthsTargetsCard
          strengths={sections.strengths}
          targets={sections.priorityTargets}
        />
      ) : (
        <Skeleton className="h-32 w-full" />
      )}
      {sections.quoteMethodDiagnostic !== null && sections.quoteMethodDiagnostic.length > 0 && (
        <QuoteDiagnosticCard items={sections.quoteMethodDiagnostic} />
      )}
      {sections.revisionPrompts !== null ? (
        <RevisionPromptsCard prompts={sections.revisionPrompts} />
      ) : (
        <Skeleton className="h-32 w-full" />
      )}
      {sections.nextStep !== null ? (
        <NextStepCard nextStep={sections.nextStep} />
      ) : (
        <Skeleton className="h-24 w-full" />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// History panel
// ────────────────────────────────────────────────────────────────────────────

type HistoryRow = {
  id: string;
  mode: MarkerMode;
  question_stem: string | null;
  created_at: string;
  aoFeedback: MarkerResult["aoFeedback"] | null;
};

type FullHistoryRow = HistoryRow & { result_json: MarkerResult | null };

function MarkHistoryPanel({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: rows, isLoading, isError } = useQuery<HistoryRow[]>({
    queryKey: ["essay-marker-history", userId],
    enabled: open && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("essay_marker_results")
        .select("id, mode, question_stem, created_at, result_json")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []).map((r) => {
        const json = isSafeMarkerResult(r.result_json) ? r.result_json : null;
        return {
          id: r.id as string,
          mode: r.mode as MarkerMode,
          question_stem: (r.question_stem as string | null) ?? null,
          created_at: r.created_at as string,
          aoFeedback: json?.aoFeedback ?? null,
        };
      });
    },
  });

  const { data: fullRow } = useQuery<FullHistoryRow | null>({
    queryKey: ["essay-marker-history-full", expandedId],
    enabled: !!expandedId,
    queryFn: async () => {
      if (!expandedId) return null;
      const { data, error } = await supabase
        .from("essay_marker_results")
        .select("id, mode, question_stem, created_at, result_json")
        .eq("id", expandedId)
        .single();
      if (error) throw error;
      const json = isSafeMarkerResult(data.result_json) ? data.result_json : null;
      return {
        id: data.id as string,
        mode: data.mode as MarkerMode,
        question_stem: (data.question_stem as string | null) ?? null,
        created_at: data.created_at as string,
        aoFeedback: json?.aoFeedback ?? null,
        result_json: json,
      };
    },
  });

  return (
    <section className="mt-8 no-print">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="font-medium">Feedback history</span>
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {isLoading && <Skeleton className="h-24 w-full" />}
          {isError && (
            <Alert variant="destructive">
              <AlertDescription>Could not load feedback history.</AlertDescription>
            </Alert>
          )}
          {rows && rows.length === 0 && (
            <p className="text-sm text-ink-muted py-4 text-center">No feedback yet.</p>
          )}
          {rows?.map((row) => {
            const isExpanded = expandedId === row.id;
            return (
              <Card key={row.id} className="text-sm">
                <CardContent className="pt-4 pb-3 space-y-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-mono text-ink-muted">
                        {formatDateTime(row.created_at)}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{MODE_LABEL[row.mode]}</Badge>
                      </div>
                      {row.question_stem && (
                        <span className="text-ink-muted">{truncate(row.question_stem, 80)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {row.aoFeedback &&
                        (["AO1", "AO2", "AO3", "AO4"] as const).map((k) => (
                          <Badge
                            key={k}
                            variant="outline"
                            className="bg-paper-dim text-ink-muted border-rule"
                          >
                            {k} · {row.aoFeedback![k].diagnosticLabel}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(isExpanded ? null : row.id)}
                  >
                    {isExpanded ? "Hide feedback" : "View full feedback"}
                  </Button>
                  {isExpanded && (
                    <div className="pt-3 border-t border-rule mt-2">
                      {fullRow && fullRow.id === row.id && fullRow.result_json ? (
                        <MarkerOutput result={fullRow.result_json} />
                      ) : fullRow && fullRow.id === row.id ? (
                        <p className="text-sm text-ink-muted">
                          This older feedback record uses a retired format and is no longer shown.
                        </p>
                      ) : (
                        <OutputSkeleton />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Input panel — mode tabs and form
// ────────────────────────────────────────────────────────────────────────────

type Question = { id: string; stem: string; family: string };
type Attempt = {
  id: string;
  paragraph_function: string | null;
  paragraph_position: number | null;
  created_at: string;
  exam_question_id: string | null;
};

function InputPanel({
  onSubmit,
  isPending,
  errorMessage,
  userId,
}: {
  onSubmit: (payload: MarkerPayload) => void;
  isPending: boolean;
  errorMessage: string | null;
  userId: string | null;
}) {
  const [mode, setMode] = useState<MarkerMode>("full_essay");
  const [questionId, setQuestionId] = useState<string>("");
  const [essayText, setEssayText] = useState<string>("");
  const [attemptId, setAttemptId] = useState<string>("");
  const [validation, setValidation] = useState<{ field: string; message: string } | null>(null);

  const wordCount = useMemo(() => countWords(essayText), [essayText]);

  const questionsQuery = useQuery<Question[]>({
    queryKey: ["marker-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("id, stem, family")
        .eq("is_active", true)
        .order("family");
      if (error) throw error;
      return (data ?? []) as Question[];
    },
  });

  const attemptsQuery = useQuery<Attempt[]>({
    queryKey: ["marker-attempts", userId],
    enabled: mode === "structured_attempt" && !!userId,
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("paragraph_attempts")
        .select("id, paragraph_function, paragraph_position, created_at, exam_question_id")
        .eq("student_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as Attempt[];
    },
  });

  const validate = (): { ok: true; payload: MarkerPayload } | { ok: false; field: string; message: string } => {
    if (mode === "structured_attempt") {
      if (!attemptId) {
        return { ok: false, field: "attempt", message: "Pick a saved attempt for feedback." };
      }
      return {
        ok: true,
        payload: { mode, paragraph_attempt_id: attemptId },
      };
    }
    if (!questionId) {
      return { ok: false, field: "question", message: "Pick a question." };
    }
    if (!essayText.trim()) {
      return { ok: false, field: "essay_text", message: "Paste your work first." };
    }
    if (mode === "full_essay" && (wordCount < 300 || wordCount > 3000)) {
      return { ok: false, field: "essay_text", message: `Full essays must be 300–3000 words (currently ${wordCount}).` };
    }
    if (mode === "paragraph_only" && (wordCount < 150 || wordCount > 600)) {
      return { ok: false, field: "essay_text", message: `Single paragraphs must be 150–600 words (currently ${wordCount}).` };
    }
    return {
      ok: true,
      payload: { mode, question_id: questionId, essay_text: essayText },
    };
  };

  const handleSubmit = () => {
    const r = validate();
    if (!r.ok) {
      setValidation({ field: r.field, message: r.message });
      return;
    }
    setValidation(null);
    onSubmit(r.payload);
  };

  const wordCountColour =
    mode === "full_essay"
      ? wordCount < 300 || wordCount > 3000
        ? "text-red-600"
        : "text-emerald-700"
      : mode === "paragraph_only"
        ? wordCount < 150 || wordCount > 600
          ? "text-red-600"
          : "text-emerald-700"
        : "text-ink-muted";

  return (
    <Card className="no-print">
      <CardHeader>
        <CardTitle className="text-lg">Your work</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={mode} onValueChange={(v) => { setMode(v as MarkerMode); setValidation(null); }}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="full_essay">Full essay</TabsTrigger>
            <TabsTrigger value="paragraph_only">Single paragraph</TabsTrigger>
            <TabsTrigger value="structured_attempt">Saved attempt</TabsTrigger>
          </TabsList>

          <TabsContent value="full_essay" className="space-y-4 mt-4">
            <QuestionPicker
              value={questionId}
              onChange={setQuestionId}
              questions={questionsQuery.data ?? []}
              loading={questionsQuery.isLoading}
            />
            <EssayTextarea
              value={essayText}
              onChange={setEssayText}
              wordCount={wordCount}
              wordCountColour={wordCountColour}
              placeholder="Paste your full essay here…"
            />
          </TabsContent>

          <TabsContent value="paragraph_only" className="space-y-4 mt-4">
            <QuestionPicker
              value={questionId}
              onChange={setQuestionId}
              questions={questionsQuery.data ?? []}
              loading={questionsQuery.isLoading}
            />
            <EssayTextarea
              value={essayText}
              onChange={setEssayText}
              wordCount={wordCount}
              wordCountColour={wordCountColour}
              placeholder="Paste one paragraph here…"
            />
          </TabsContent>

          <TabsContent value="structured_attempt" className="space-y-3 mt-4">
            {attemptsQuery.isLoading && <Skeleton className="h-32 w-full" />}
            {attemptsQuery.data && attemptsQuery.data.length === 0 && (
              <p className="text-sm text-ink-muted">
                No saved paragraph attempts yet. Visit the{" "}
                <Link to="/paragraph-builder" className="underline">Paragraph Builder</Link> to make one.
              </p>
            )}
            <div className="space-y-2">
              {attemptsQuery.data?.map((a) => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => { setAttemptId(a.id); setValidation(null); }}
                  className={`w-full text-left border rounded-sm p-3 transition-colors ${
                    attemptId === a.id
                      ? "border-primary bg-paper-dim"
                      : "border-rule bg-paper hover:bg-paper-dim"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">
                      {a.paragraph_function ?? "Untitled paragraph"}
                      {a.paragraph_position != null && (
                        <span className="ml-2 text-xs font-mono text-ink-muted">#{a.paragraph_position}</span>
                      )}
                    </span>
                    <span className="text-xs font-mono text-ink-muted shrink-0">
                      {formatDateTime(a.created_at)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {validation?.field === "attempt" && (
              <p className="text-xs text-red-600">{validation.message}</p>
            )}
          </TabsContent>
        </Tabs>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? "Generating feedback…" : "Get formative feedback"}
        </Button>
      </CardContent>
    </Card>
  );

  function QuestionPicker({
    value,
    onChange,
    questions,
    loading,
  }: {
    value: string;
    onChange: (v: string) => void;
    questions: Question[];
    loading: boolean;
  }) {
    return (
      <div>
        <Label htmlFor="question" className="text-xs font-mono uppercase tracking-wider text-ink-muted">
          Question
        </Label>
        <Select value={value} onValueChange={onChange} disabled={loading}>
          <SelectTrigger id="question" className="mt-1">
            <SelectValue placeholder={loading ? "Loading…" : "Select a question"} />
          </SelectTrigger>
          <SelectContent>
            {questions.map((q) => (
              <SelectItem key={q.id} value={q.id}>
                <span className="text-xs text-ink-muted font-mono mr-2">{q.family}</span>
                {truncate(q.stem, 100)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validation?.field === "question" && (
          <p className="mt-1 text-xs text-red-600">{validation.message}</p>
        )}
      </div>
    );
  }

  function EssayTextarea({
    value,
    onChange,
    wordCount,
    wordCountColour,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    wordCount: number;
    wordCountColour: string;
    placeholder: string;
  }) {
    return (
      <div>
        <Label htmlFor="essay-text" className="text-xs font-mono uppercase tracking-wider text-ink-muted">
          Your work
        </Label>
        <Textarea
          id="essay-text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 min-h-[280px] font-serif text-sm leading-relaxed"
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className={`font-mono ${wordCountColour}`}>{wordCount} words</span>
          {validation?.field === "essay_text" && (
            <span className="text-red-600">{validation.message}</span>
          )}
        </div>
      </div>
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

// Consume an SSE stream of `data: {chunk}` / `data: {error}` / `data: [DONE]`
// lines and dispatch parsed sections to the supplied setter.
async function consumeStream(
  body: ReadableStream<Uint8Array>,
  onSections: (sectionsUpdater: (prev: SectionState) => SectionState) => void,
  onError: (msg: string) => void,
  onDone: () => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();

        if (payload === "[DONE]") {
          onDone();
          continue;
        }

        let parsed: { chunk?: string; error?: string };
        try {
          parsed = JSON.parse(payload);
        } catch {
          continue;
        }

        if (parsed.error) {
          onError(
            "The feedback tool encountered an error. Partial feedback may be shown.",
          );
          continue;
        }

        if (parsed.chunk) {
          accumulated += parsed.chunk;
          onSections((prev) => {
            const delta = parseSectionsDelta(accumulated, prev);
            if (Object.keys(delta).length === 0) return prev;
            return { ...prev, ...delta };
          });
        }
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // already released
    }
  }
}

export default function EssayMarker() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<SectionState>(EMPTY_SECTIONS);
  const [hasResult, setHasResult] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [friendlyError, setFriendlyError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Cancel any in-flight stream on unmount.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleSubmit = useCallback(
    async (payload: MarkerPayload) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setSections(EMPTY_SECTIONS);
      setHasResult(false);
      setFriendlyError(null);
      setIsPending(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const jwt = session?.access_token;
        if (!jwt) {
          setFriendlyError(mapHttpError(401));
          setIsPending(false);
          return;
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(
          `${supabaseUrl}/functions/v1/mark-component2-essay`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${jwt}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          },
        );

        // Errors raised before the stream opens come back as JSON, not SSE.
        if (!response.ok) {
          await response.json().catch(() => ({}));
          setFriendlyError(mapHttpError(response.status));
          setIsPending(false);
          return;
        }
        if (!response.body) {
          setFriendlyError(mapHttpError(500));
          setIsPending(false);
          return;
        }

        await consumeStream(
          response.body,
          (updater) => setSections(updater),
          (msg) => setFriendlyError(msg),
          () => {
            setHasResult(true);
            setIsPending(false);
            // History view is populated by the Edge Function's post-stream
            // persistence step; nudge React Query to re-fetch.
            queryClient.invalidateQueries({ queryKey: ["essay-marker-history"] });
          },
        );

        // If the server closed without a [DONE] sentinel, settle the UI.
        setIsPending((prev) => (prev ? false : prev));
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        const status = isHttpError(err) ? err.status : 500;
        setFriendlyError(mapHttpError(status));
        setIsPending(false);
      }
    },
    [queryClient],
  );

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
        <Alert>
          <AlertDescription>
            Please <Link to="/auth" className="underline">sign in</Link> to use Essay Feedback.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const showStreaming = isPending || hasResult;
  const printable = hasResult && !isPending;

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 print:px-0 print:py-0">
      <header className="mb-6 no-print">
        <h1 className="font-serif text-2xl">Essay Feedback</h1>
        <p className="text-sm text-ink-muted mt-1">
          Formative AI guidance against AO1–AO4 for Pearson Edexcel A-Level English Literature,
          Component 2 (Prose). No official assessment judgement is generated.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 print:grid-cols-1 print:gap-0">
        <InputPanel
          onSubmit={handleSubmit}
          isPending={isPending}
          errorMessage={friendlyError}
          userId={user.id}
        />

        <section className="lg:sticky lg:top-24 lg:self-start">
          {showStreaming && (
            <>
              {printable && (
                <div className="mb-3 flex justify-end no-print">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print feedback
                  </Button>
                </div>
              )}
              <StreamingMarkerOutput sections={sections} />
            </>
          )}
          {!showStreaming && !friendlyError && (
            <Card className="no-print">
              <CardContent className="pt-6 text-center text-sm text-ink-muted">
                Submit your work to receive formative feedback.
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      <MarkHistoryPanel userId={user.id} />
    </div>
  );
}
