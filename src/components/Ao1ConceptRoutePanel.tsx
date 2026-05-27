import type { ReactNode } from "react";
import type { Ao1ConceptRoute } from "@/types/ao1ConceptRoutes";

function priorityClasses(priority: Ao1ConceptRoute["priority"]): string {
  if (priority === "CORE") return "border-primary bg-highlight/55 text-ink";
  if (priority === "HIGH") return "border-rule-strong bg-paper-dim text-ink";
  return "border-rule bg-paper text-ink-muted";
}

function FieldBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="border-t border-rule pt-3">
      <h4 className="label-eyebrow mb-1 text-[10px]">{label}</h4>
      <p className="text-sm leading-relaxed text-ink-muted">{children}</p>
    </section>
  );
}

export default function Ao1ConceptRoutePanel({ route }: { route: Ao1ConceptRoute }) {
  return (
    <article className="border border-rule bg-paper rounded-sm p-4 shadow-card print:shadow-none">
      <header className="flex flex-col gap-2 border-b border-rule pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="label-eyebrow mb-1 text-[10px]">AO1 Concept Route</p>
          <h3 className="font-serif text-xl leading-tight">{route.themeFocus}</h3>
        </div>
        <span
          className={`inline-flex w-fit items-center rounded-sm border px-2 py-1 text-[10px] font-mono uppercase tracking-wider ${priorityClasses(route.priority)}`}
        >
          {route.priority}
        </span>
      </header>

      <section className="mt-3 border-l-4 border-primary bg-highlight/35 px-3 py-2">
        <h4 className="label-eyebrow mb-1 text-[10px]">Core AO1 argument</h4>
        <p className="font-serif text-base leading-relaxed text-ink">{route.coreAo1Argument}</p>
      </section>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <section className="border border-rule bg-paper-dim/30 rounded-sm p-3">
          <h4 className="label-eyebrow mb-1 text-[10px]">Hard Times conceptual route</h4>
          <p className="text-sm leading-relaxed text-ink-muted">{route.hardTimesConceptualRoute}</p>
        </section>
        <section className="border border-rule bg-paper-dim/30 rounded-sm p-3">
          <h4 className="label-eyebrow mb-1 text-[10px]">Atonement conceptual route</h4>
          <p className="text-sm leading-relaxed text-ink-muted">{route.atonementConceptualRoute}</p>
        </section>
      </div>

      <div className="mt-4 grid gap-x-4 gap-y-3 md:grid-cols-2">
        <FieldBlock label="Comparative hinge / judgement">{route.comparativeHingeJudgement}</FieldBlock>
        <FieldBlock label="Likely exam stems">{route.likelyExamStems}</FieldBlock>
      </div>

      <section className="mt-4 border-t border-rule pt-3">
        <h4 className="label-eyebrow mb-1 text-[10px]">Thesis sentence starter</h4>
        <p className="font-serif text-base leading-relaxed text-ink">{route.thesisSentenceStarter}</p>
      </section>
    </article>
  );
}
