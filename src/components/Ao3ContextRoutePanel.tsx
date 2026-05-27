import type { Ao3ContextRoute } from "@/types/ao3ContextRoutes";

function priorityClasses(priority: Ao3ContextRoute["priority"]): string {
  if (priority === "CORE") return "border-primary bg-highlight/55 text-ink";
  if (priority === "HIGH") return "border-rule-strong bg-paper-dim text-ink";
  return "border-rule bg-paper text-ink-muted";
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-rule pt-3">
      <h4 className="label-eyebrow mb-1 text-[10px]">{label}</h4>
      <p className="text-sm leading-relaxed text-ink-muted">{children}</p>
    </section>
  );
}

export default function Ao3ContextRoutePanel({ route }: { route: Ao3ContextRoute }) {
  return (
    <article className="border border-rule bg-paper rounded-sm p-4 shadow-card print:shadow-none">
      <header className="flex flex-col gap-2 border-b border-rule pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="label-eyebrow mb-1 text-[10px]">AO3 Context Route</p>
          <h3 className="font-serif text-xl leading-tight">{route.themeExamRoute}</h3>
        </div>
        <span
          className={`inline-flex w-fit items-center rounded-sm border px-2 py-1 text-[10px] font-mono uppercase tracking-wider ${priorityClasses(route.priority)}`}
        >
          {route.priority}
        </span>
      </header>

      <section className="mt-3 border-l-4 border-primary bg-highlight/35 px-3 py-2">
        <h4 className="label-eyebrow mb-1 text-[10px]">Core AO3 Context Claim</h4>
        <p className="font-serif text-base leading-relaxed text-ink">{route.coreContextClaim}</p>
      </section>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <section className="border border-rule bg-paper-dim/30 rounded-sm p-3">
          <h4 className="label-eyebrow mb-1 text-[10px]">Hard Times context</h4>
          <p className="text-sm leading-relaxed text-ink-muted">{route.hardTimesContext}</p>
        </section>
        <section className="border border-rule bg-paper-dim/30 rounded-sm p-3">
          <h4 className="label-eyebrow mb-1 text-[10px]">Atonement context</h4>
          <p className="text-sm leading-relaxed text-ink-muted">{route.atonementContext}</p>
        </section>
      </div>

      <div className="mt-4 grid gap-x-4 gap-y-3 md:grid-cols-2">
        <FieldBlock label="Contextual Pressure / Institution">{route.contextualPressure}</FieldBlock>
        <FieldBlock label="How Context Shapes Meaning">{route.meaningEffect}</FieldBlock>
        <FieldBlock label="AO2 Method Link">{route.ao2MethodLink}</FieldBlock>
        <FieldBlock label="AO4 Comparative Hinge">{route.ao4ComparativeHinge}</FieldBlock>
      </div>

      <section className="mt-4 border-t border-rule pt-3">
        <h4 className="label-eyebrow mb-1 text-[10px]">Exam-Ready AO3 Sentence</h4>
        <p className="font-serif text-base leading-relaxed text-ink">{route.examReadySentence}</p>
      </section>

      <section className="mt-4 border border-amber-300 bg-amber-50 px-3 py-2 text-amber-950 rounded-sm">
        <h4 className="label-eyebrow mb-1 text-[10px] text-amber-900">Misuse / Pitfall to Avoid</h4>
        <p className="text-sm leading-relaxed">{route.misuseWarning}</p>
      </section>
    </article>
  );
}
