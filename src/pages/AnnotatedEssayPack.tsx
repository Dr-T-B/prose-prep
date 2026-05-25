import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Layers3,
  ListChecks,
  PenLine,
  Route,
  Search,
  Sparkles,
} from "lucide-react";
import {
  type AOAnnotation,
  type AnnotatedContentVerificationStatus,
  type Component2AO,
  type EssayParagraph,
  type EssayQuestion,
  type ParagraphStem,
  type QuoteMethodLink,
} from "@/data/annotatedEssayPracticePack";
import { useAnnotatedEssayPackContent } from "@/hooks/useAnnotatedEssayPackContent";

const AO_OPTIONS: Component2AO[] = ["AO1", "AO2", "AO3", "AO4"];
type AnnotationFilter = "all" | "hide" | Component2AO;

const aoClass: Record<Component2AO, string> = {
  AO1: "chip-ao1",
  AO2: "chip-ao2",
  AO3: "chip-ao3",
  AO4: "chip-ao4",
};

function hasAO(annotation: AOAnnotation, filter: AnnotationFilter) {
  if (filter === "all") return true;
  if (filter === "hide") return false;
  return annotation.ao_tags.includes(filter);
}

export default function AnnotatedEssayPack() {
  const { pack, source, fallbackReason } = useAnnotatedEssayPackContent();

  const getQuestion = (questionId: string) =>
    pack.essay_questions.find((q) => q.id === questionId);
  const getEssayParagraphs = (essayId: string) =>
    pack.essay_paragraphs
      .filter((p) => p.essay_id === essayId)
      .sort((a, b) => a.paragraph_number - b.paragraph_number);
  const getParagraphAnnotations = (paragraphId: string, filter: AnnotationFilter = "all") =>
    pack.ao_annotations
      .filter((a) => a.paragraph_id === paragraphId && hasAO(a, filter))
      .sort((a, b) => a.annotation_order - b.annotation_order);

  const [essayId, setEssayId] = useState(pack.annotated_essays[0].id);
  const [questionId, setQuestionId] = useState(pack.essay_questions[0].id);
  const [annotationFilter, setAnnotationFilter] = useState<AnnotationFilter>("all");
  const [drillTheme, setDrillTheme] = useState("All");
  const [drillFamily, setDrillFamily] = useState("All");
  const [drillCharacter, setDrillCharacter] = useState("All");
  const [drillAO, setDrillAO] = useState<"All" | Component2AO>("All");
  const [timedTarget, setTimedTarget] = useState("6");
  const [overlayParagraphId, setOverlayParagraphId] = useState("para_children_roles_2");
  const [overlayRevealed, setOverlayRevealed] = useState(false);
  const [practiceQuestionId, setPracticeQuestionId] = useState("eq_ht_at_children_roles_20260524");
  const [practiceResponse, setPracticeResponse] = useState("");
  const [showPracticeModel, setShowPracticeModel] = useState(false);

  // Defensive lookups: if an admin retires a row, the previously-selected ID may
  // not exist in the current pack. Fall back to the first available entry so the
  // page keeps rendering instead of throwing.
  const essay = pack.annotated_essays.find((e) => e.id === essayId) ?? pack.annotated_essays[0];
  const essayQuestion = getQuestion(essay.question_id) ?? pack.essay_questions[0];
  const selectedQuestion = getQuestion(questionId) ?? pack.essay_questions[0];
  const selectedPracticeQuestion =
    getQuestion(practiceQuestionId) ?? pack.essay_questions[0];
  const paragraphs = getEssayParagraphs(essay.id);

  const themes = useMemo(
    () => ["All", ...Array.from(new Set(pack.paragraph_stems.map((s) => s.theme))).sort()],
    [pack.paragraph_stems],
  );
  const families = useMemo(
    () => ["All", ...Array.from(new Set(pack.paragraph_stems.map((s) => s.question_family))).sort()],
    [pack.paragraph_stems],
  );
  const characters = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(pack.paragraph_stems.flatMap((s) => s.compatible_characters)),
      ).sort(),
    ],
    [pack.paragraph_stems],
  );

  const filteredStems = useMemo(() => {
    return pack.paragraph_stems.filter((stem) => {
      if (drillTheme !== "All" && stem.theme !== drillTheme) return false;
      if (drillFamily !== "All" && stem.question_family !== drillFamily) return false;
      if (drillCharacter !== "All" && !stem.compatible_characters.includes(drillCharacter)) return false;
      if (drillAO !== "All" && !stem.ao_focus.includes(drillAO)) return false;
      return stem.timed_target_minutes <= Number(timedTarget || "60");
    });
  }, [drillTheme, drillFamily, drillCharacter, drillAO, pack.paragraph_stems, timedTarget]);

  const activeDrill = filteredStems[0] ?? pack.paragraph_stems[0];
  const routeEssay = pack.annotated_essays.find((e) => e.question_id === selectedQuestion.id);
  const routeStems = pack.paragraph_stems.filter((s) =>
    selectedQuestion.linked_paragraph_stem_ids.includes(s.id),
  );
  const routeQuotes = pack.quote_method_links.filter(
    (q) => q.essay_question_id === selectedQuestion.id,
  );
  const overlayParagraph =
    pack.essay_paragraphs.find((p) => p.id === overlayParagraphId) ??
    pack.essay_paragraphs[0];
  const overlayAnnotations = getParagraphAnnotations(overlayParagraph.id, "all");
  const practiceEssay = pack.annotated_essays.find(
    (e) => e.question_id === selectedPracticeQuestion.id,
  );
  const practiceStems = pack.paragraph_stems.filter((s) =>
    selectedPracticeQuestion.linked_paragraph_stem_ids.includes(s.id),
  );
  const wordCount = practiceResponse.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-eyebrow mb-1">Pearson Edexcel · 9ET0/02 · Component 2 Prose</p>
          <h1 className="font-serif text-3xl lg:text-4xl">{pack.title}</h1>
          <p className="mt-2 max-w-4xl text-sm text-ink-muted leading-relaxed">
            {pack.description}
          </p>
        </div>
        <div className="border border-rule bg-paper p-3 rounded-sm text-xs max-w-sm">
          <p className="font-mono uppercase tracking-wider text-ink-muted mb-1">Review status</p>
          <StatusBadge status={pack.provenance.verification_status} />
          <p className="mt-1 text-ink-muted">
            Content source: {source === "supabase" ? "live Supabase" : "bundled seed"}
            {source === "seed" && fallbackReason ? ` (${fallbackReason})` : null}
          </p>
          <p className="mt-2 text-ink-muted">{pack.ao_policy_note}</p>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Metric icon={BookOpen} label="Past-paper prompts" value={pack.essay_questions.length} />
        <Metric icon={PenLine} label="Annotated essays" value={pack.annotated_essays.length} />
        <Metric icon={Layers3} label="AO spans" value={pack.ao_annotations.length} />
        <Metric icon={ListChecks} label="Paragraph stems" value={pack.paragraph_stems.length} />
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <section className="space-y-8">
          <Panel
            icon={BookOpen}
            eyebrow="Annotated essay reader"
            title="Model Essay With AO Overlay"
            action={
              <select
                aria-label="Choose essay"
                value={essayId}
                onChange={(event) => setEssayId(event.target.value)}
                className="border border-rule bg-paper rounded-sm px-2 py-1 text-xs"
              >
                {pack.annotated_essays.map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            }
          >
            <div className="border border-rule bg-paper-dim/35 rounded-sm p-4 mb-4">
              <p className="label-eyebrow mb-1">Question</p>
              <p className="font-serif text-lg">{essayQuestion.question_text}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3 text-xs">
                <Meta label="Target" value={`${essay.target_band} · ${essay.estimated_mark_range}`} />
                <Meta label="Timing" value={`${essay.timed_condition_minutes} minutes · ${essay.word_count_band} words`} />
                <Meta label="Source" value={essay.provenance.source} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={essay.provenance.verification_status} />
                <StatusBadge status={essayQuestion.provenance.verification_status} labelPrefix="Question" />
              </div>
              <p className="mt-3 text-sm text-ink-muted">{essay.thesis}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="meta-mono mr-1">Annotations</span>
              <FilterButton active={annotationFilter === "all"} onClick={() => setAnnotationFilter("all")}>
                Show all
              </FilterButton>
              {AO_OPTIONS.map((ao) => (
                <FilterButton key={ao} active={annotationFilter === ao} onClick={() => setAnnotationFilter(ao)}>
                  {ao} only
                </FilterButton>
              ))}
              <FilterButton active={annotationFilter === "hide"} onClick={() => setAnnotationFilter("hide")}>
                <EyeOff className="size-3" /> Hide annotations
              </FilterButton>
            </div>

            <div className="space-y-5">
              {paragraphs.map((paragraph) => (
                <EssayParagraphBlock
                  key={paragraph.id}
                  paragraph={paragraph}
                  annotations={getParagraphAnnotations(paragraph.id, annotationFilter)}
                  hidden={annotationFilter === "hide"}
                />
              ))}
            </div>
          </Panel>

          <Panel icon={Route} eyebrow="Essay route view" title="Question Route, Links And Pitfalls">
            <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
              <div className="space-y-2">
                {pack.essay_questions.map((question) => (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setQuestionId(question.id)}
                    className={`w-full text-left border rounded-sm p-3 text-sm transition-colors ${
                      questionId === question.id
                        ? "border-primary bg-highlight"
                        : "border-rule bg-paper hover:bg-paper-dim/60"
                    }`}
                  >
                    <span className="label-eyebrow block mb-1">{question.theme}</span>
                    <span className="font-serif leading-snug">{question.question_text}</span>
                    <span className="mt-2 block">
                      <StatusBadge status={question.provenance.verification_status} />
                    </span>
                  </button>
                ))}
              </div>
              <QuestionRouteView question={selectedQuestion} essayTitle={routeEssay?.title} stems={routeStems} quotes={routeQuotes} />
            </div>
          </Panel>

          <Panel icon={Search} eyebrow="AO overlay trainer" title="Find AO Evidence, Then Reveal">
            <div className="flex flex-wrap gap-3 mb-4">
              <label className="text-xs">
                <span className="label-eyebrow block mb-1">Paragraph</span>
                <select
                  aria-label="Overlay paragraph"
                  value={overlayParagraphId}
                  onChange={(event) => {
                    setOverlayParagraphId(event.target.value);
                    setOverlayRevealed(false);
                  }}
                  className="border border-rule bg-paper rounded-sm px-2 py-1 text-sm"
                >
                  {paragraphs.map((p) => (
                    <option key={p.id} value={p.id}>Paragraph {p.paragraph_number}: {p.paragraph_function}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => setOverlayRevealed((value) => !value)}
                className="self-end inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-rule-strong rounded-sm bg-paper hover:bg-paper-dim"
              >
                <Eye className="size-3" />
                {overlayRevealed ? "Hide reveal" : "Reveal annotated answer"}
              </button>
            </div>
            <div className="border border-rule bg-paper rounded-sm p-4">
              <p className="font-serif text-base leading-relaxed">{overlayParagraph.paragraph_text}</p>
              {!overlayRevealed && (
                <div className="mt-4 grid sm:grid-cols-4 gap-2">
                  {AO_OPTIONS.map((ao) => (
                    <div key={ao} className={`rounded-sm p-2 text-xs ${aoClass[ao]}`}>
                      Identify one {ao} move
                    </div>
                  ))}
                </div>
              )}
              {overlayRevealed && (
                <AnnotationList annotations={overlayAnnotations} />
              )}
            </div>
          </Panel>
        </section>

        <aside className="space-y-8">
          <Panel icon={PenLine} eyebrow="Paragraph drill mode" title="Generate A Level 5 Stem">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <SelectField label="Theme" value={drillTheme} onChange={setDrillTheme} options={themes} />
              <SelectField label="Question type" value={drillFamily} onChange={setDrillFamily} options={families} />
              <SelectField label="Character pair" value={drillCharacter} onChange={setDrillCharacter} options={characters} />
              <SelectField label="AO focus" value={drillAO} onChange={(value) => setDrillAO(value as "All" | Component2AO)} options={["All", ...AO_OPTIONS]} />
              <label className="text-xs">
                <span className="label-eyebrow block mb-1">Timed target</span>
                <select
                  aria-label="Timed target"
                  value={timedTarget}
                  onChange={(event) => setTimedTarget(event.target.value)}
                  className="w-full border border-rule bg-paper rounded-sm px-2 py-1.5 text-sm"
                >
                  {["4", "5", "6", "7", "10"].map((minutes) => (
                    <option key={minutes} value={minutes}>{minutes} minutes</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-3 meta-mono">{filteredStems.length} matching stems</p>
            <StemDrill stem={activeDrill} />
          </Panel>

          <Panel icon={Clock3} eyebrow="Timed essay practice" title="60-Minute Practice Link">
            <label className="block text-xs mb-3">
              <span className="label-eyebrow block mb-1">Question</span>
              <select
                aria-label="Practice question"
                value={practiceQuestionId}
                onChange={(event) => {
                  setPracticeQuestionId(event.target.value);
                  setShowPracticeModel(false);
                }}
                className="w-full border border-rule bg-paper rounded-sm px-2 py-1.5 text-sm"
              >
                {pack.essay_questions.map((question) => (
                  <option key={question.id} value={question.id}>{question.question_text}</option>
                ))}
              </select>
            </label>
            <div className="border border-rule rounded-sm p-3 bg-paper-dim/35 mb-3">
              <p className="font-serif text-sm leading-snug">{selectedPracticeQuestion.question_text}</p>
              <p className="mt-2 meta-mono">60 minutes · 40 marks · AO1/AO2/AO3/AO4</p>
            </div>
            <textarea
              aria-label="Timed response"
              value={practiceResponse}
              onChange={(event) => setPracticeResponse(event.target.value)}
              className="min-h-[150px] w-full border border-rule bg-paper rounded-sm p-3 text-sm"
              placeholder="Draft your response..."
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="meta-mono">{wordCount} words</span>
              <button
                type="button"
                onClick={() => setShowPracticeModel((value) => !value)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-sm"
              >
                <CheckCircle2 className="size-3" />
                Compare with model answer
              </button>
            </div>
            {showPracticeModel && (
              <div className="mt-4 space-y-3 text-sm">
                <Meta label="Model thesis" value={practiceEssay?.thesis ?? "No full model attached yet; use the route and stems."} />
                <Meta label="Model paragraph route" value={selectedPracticeQuestion.likely_routes.join(" → ")} />
                <Meta label="AO checklist" value={selectedPracticeQuestion.ao_requirements.join(" / ")} />
                <Meta label="Quote-method bank" value={selectedPracticeQuestion.linked_quote_cluster_ids.join(" · ")} />
                <Meta label="Linked stems" value={practiceStems.map((s) => s.id).join(" · ") || "Stems pending"} />
                {practiceEssay && (
                  <button
                    type="button"
                    onClick={() => {
                      setEssayId(practiceEssay.id);
                      setAnnotationFilter("all");
                    }}
                    className="inline-flex items-center gap-1 text-xs underline text-primary"
                  >
                    Open annotated model essay
                  </button>
                )}
              </div>
            )}
          </Panel>

          <Panel icon={Sparkles} eyebrow="Misconception and upgrade engine" title="Common Weaknesses">
            <div className="space-y-3">
              {pack.misconception_upgrades.map((item) => (
                <article key={item.id} className="border border-rule bg-paper rounded-sm p-3">
                  <h3 className="font-serif text-base">{item.weakness}</h3>
                  <p className="text-xs text-ink-muted mt-1">{item.diagnosis}</p>
                  <div className="mt-3 grid gap-2 text-xs">
                    <Meta label="Problem" value={item.example_problem_sentence} />
                    <Meta label="Level 5 upgrade" value={item.improved_level_5_version} />
                    <Meta label="Linked drill" value={item.linked_drill_id} />
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="border border-rule bg-paper rounded-sm p-4 shadow-card">
      <Icon className="size-4 text-primary mb-2" />
      <p className="font-serif text-3xl">{value}</p>
      <p className="label-eyebrow">{label}</p>
    </div>
  );
}

function formatStatus(status: string) {
  return status
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function StatusBadge({
  status,
  labelPrefix,
}: {
  status: AnnotatedContentVerificationStatus;
  labelPrefix?: string;
}) {
  const className =
    status === "approved"
      ? "border-emerald-700/30 bg-emerald-50 text-emerald-900"
      : status === "reviewed"
        ? "border-sky-700/30 bg-sky-50 text-sky-900"
        : status === "needs correction"
          ? "border-amber-700/30 bg-amber-50 text-amber-900"
          : status === "draft" || status === "retired"
            ? "border-rule bg-paper-dim text-ink-muted"
            : "border-primary/30 bg-highlight text-ink";

  return (
    <span className={`inline-flex rounded-sm border px-2 py-1 text-[10px] font-mono uppercase tracking-wider ${className}`}>
      {labelPrefix ? `${labelPrefix}: ` : null}
      {formatStatus(status)}
    </span>
  );
}

function Panel({
  icon: Icon,
  eyebrow,
  title,
  action,
  children,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border border-rule bg-paper rounded-sm shadow-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="label-eyebrow inline-flex items-center gap-1 mb-1">
            <Icon className="size-3" />
            {eyebrow}
          </p>
          <h2 className="font-serif text-2xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded-sm transition-colors ${
        active ? "border-primary bg-highlight text-ink" : "border-rule bg-paper hover:bg-paper-dim"
      }`}
    >
      {children}
    </button>
  );
}

function EssayParagraphBlock({
  paragraph,
  annotations,
  hidden,
}: {
  paragraph: EssayParagraph;
  annotations: AOAnnotation[];
  hidden: boolean;
}) {
  return (
    <article className="border border-rule rounded-sm bg-paper p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="label-eyebrow">Paragraph {paragraph.paragraph_number}</span>
        <span className="meta-mono">{paragraph.paragraph_function}</span>
        {paragraph.ao_coverage.map((ao) => (
          <span key={ao} className={`text-[10px] px-1.5 py-0.5 rounded-sm ${aoClass[ao]}`}>{ao}</span>
        ))}
      </div>
      <p className="font-serif text-[17px] leading-relaxed">{paragraph.paragraph_text}</p>
      <div className="mt-3 border-t border-rule pt-3 text-xs">
        <Meta label="Examiner comment" value={paragraph.examiner_comment ?? ""} />
        <Meta label="Upgrade target" value={paragraph.upgrade_target ?? ""} />
      </div>
      {hidden ? (
        <p className="mt-3 text-xs italic text-ink-muted">Annotations hidden for self-testing.</p>
      ) : (
        <AnnotationList annotations={annotations} />
      )}
    </article>
  );
}

function AnnotationList({ annotations }: { annotations: AOAnnotation[] }) {
  if (annotations.length === 0) {
    return <p className="mt-3 text-xs italic text-ink-muted">No annotations match this filter.</p>;
  }

  return (
    <div className="mt-3 space-y-2">
      {annotations.map((annotation) => (
        <div key={annotation.id} className="border-l-2 border-primary/50 bg-paper-dim/35 p-3 text-xs">
          <div className="mb-1 flex flex-wrap items-center gap-1">
            {annotation.ao_tags.map((ao) => (
              <span key={ao} className={`px-1.5 py-0.5 rounded-sm ${aoClass[ao]}`}>{ao}</span>
            ))}
            <span className="meta-mono">{annotation.annotation_type}</span>
          </div>
          <p className="font-serif text-sm leading-snug">"{annotation.text_span}"</p>
          <p className="mt-2 text-ink-muted">{annotation.explanation}</p>
          <p className="mt-1"><strong>Why it scores:</strong> {annotation.why_it_scores}</p>
          <p className="mt-1 text-ink-muted"><strong>Improve:</strong> {annotation.improvement_note}</p>
        </div>
      ))}
    </div>
  );
}

function QuestionRouteView({
  question,
  essayTitle,
  stems,
  quotes,
}: {
  question: EssayQuestion;
  essayTitle?: string;
  stems: ParagraphStem[];
  quotes: QuoteMethodLink[];
}) {
  return (
    <div className="border border-rule bg-paper rounded-sm p-4">
      <p className="label-eyebrow mb-1">{question.theme} · {question.marks} marks</p>
      <h3 className="font-serif text-xl leading-snug">{question.question_text}</h3>
      <div className="mt-2">
        <StatusBadge status={question.provenance.verification_status} />
      </div>
      <div className="mt-4 grid gap-3">
        <Meta label="Thesis route" value={question.level_5_upgrade_moves[0]} />
        <Meta label="Paragraph route" value={question.likely_routes.join(" → ")} />
        <Meta label="Comparative logic" value="Keep Dickens and McEwan inside the same sentence whenever the paragraph turns from method to meaning." />
        <Meta label="Context route" value="Use historical/social context as a cause of perception, not as a separate fact." />
        <Meta label="Likely pitfalls" value={question.pitfalls.join(" ")} />
        <Meta label="Level 5 upgrade moves" value={question.level_5_upgrade_moves.join(" ")} />
        <Meta label="Model essay" value={essayTitle ?? "No full essay linked yet"} />
      </div>
      {quotes.length > 0 && (
        <div className="mt-4">
          <p className="label-eyebrow mb-2">Key quote clusters</p>
          <div className="grid gap-2">
            {quotes.map((quote) => {
              const needsCorrection = quote.verification_status === "needs correction";
              return (
                <div key={`${quote.quotation}-${quote.method}`} className="border border-rule bg-paper-dim/35 rounded-sm p-2 text-xs">
                  {needsCorrection && (
                    <StatusBadge status="needs correction" labelPrefix="Quote" />
                  )}
                  <p className="font-serif text-sm">"{quote.quotation}" · {quote.method}</p>
                  <p className="mt-1 text-ink-muted">{quote.ao2_explanation}</p>
                  <p className="mt-1"><strong>AO4 partner:</strong> {quote.ao4_comparative_partner}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {stems.length > 0 && (
        <div className="mt-4">
          <p className="label-eyebrow mb-2">Linked paragraph stems</p>
          <ul className="space-y-1 text-xs">
            {stems.map((stem) => <li key={stem.id} className="font-serif">"{stem.stem_text}"</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function StemDrill({ stem }: { stem: ParagraphStem }) {
  const needsCorrection = stem.provenance.verification_status === "needs correction";
  return (
    <div className="mt-4 border border-rule bg-paper rounded-sm p-4">
      {needsCorrection && (
        <div className="mb-2">
          <StatusBadge status="needs correction" labelPrefix="Stem" />
        </div>
      )}
      <div className="mb-2 flex flex-wrap items-center gap-1">
        {stem.ao_focus.map((ao) => (
          <span key={ao} className={`px-1.5 py-0.5 text-[10px] rounded-sm ${aoClass[ao]}`}>{ao}</span>
        ))}
        <StatusBadge status={stem.provenance.verification_status} />
        <span className="meta-mono">{stem.theme} · {stem.timed_target_minutes} min</span>
      </div>
      <p className="font-serif text-lg leading-relaxed">{stem.stem_text}</p>
      <div className="mt-3 grid gap-2 text-xs">
        <Meta label="Quote prompts" value={stem.compatible_quotes.join(" · ")} />
        <Meta label="Suggested texts/characters" value={stem.compatible_characters.join(" · ")} />
        <Meta label="AO2 method prompts" value={stem.method_triggers.join(" · ")} />
        <Meta label="AO3 contextual route" value={stem.context_route} />
        <Meta label="AO4 comparative bridge" value={stem.comparison_route} />
        <Meta label="Self-assessment checklist" value="Argument first; method explains effect; context causes meaning; comparison is explicit." />
        <Meta label="Drill" value={stem.drill_instruction} />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="text-xs">
      <span className="label-eyebrow block mb-1">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-rule bg-paper rounded-sm px-2 py-1.5 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-eyebrow mb-0.5">{label}</p>
      <p className="text-sm leading-relaxed">{value || "Pending"}</p>
    </div>
  );
}
