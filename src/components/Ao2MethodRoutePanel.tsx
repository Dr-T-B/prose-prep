import type { ReactNode } from "react";
import type { Ao2MethodRoute } from "@/types/ao2MethodRoutes";

function priorityClasses(priority: Ao2MethodRoute["priority"]): string {
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

export default function Ao2MethodRoutePanel({ route }: { route: Ao2MethodRoute }) {
  return (
    <article className="border border-rule bg-paper rounded-sm p-4 shadow-card print:shadow-none">
      <header className="flex flex-col gap-2 border-b border-rule pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="label-eyebrow mb-1 text-[10px]">AO2 Method Route</p>
          <h3 className="font-serif text-xl leading-tight">{route.ao2Route}</h3>
        </div>
        <span
          className={`inline-flex w-fit items-center rounded-sm border px-2 py-1 text-[10px] font-mono uppercase tracking-wider ${priorityClasses(route.priority)}`}
        >
          {route.priority}
        </span>
      </header>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <section className="border border-rule bg-paper-dim/30 rounded-sm p-3">
          <h4 className="label-eyebrow mb-1 text-[10px]">Hard Times method</h4>
          <p className="font-medium leading-relaxed text-ink">{route.hardTimesMethod}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{route.hardTimesEvidenceZone}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{route.hardTimesAo2Effect}</p>
        </section>
        <section className="border border-rule bg-paper-dim/30 rounded-sm p-3">
          <h4 className="label-eyebrow mb-1 text-[10px]">Atonement method</h4>
          <p className="font-medium leading-relaxed text-ink">{route.atonementMethod}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{route.atonementEvidenceZone}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{route.atonementAo2Effect}</p>
        </section>
      </div>

      <div className="mt-4 grid gap-x-4 gap-y-3 md:grid-cols-2">
        <FieldBlock label="Comparative AO4 hinge">{route.comparativeAo4Hinge}</FieldBlock>
        <FieldBlock label="Best themes">{route.bestThemes}</FieldBlock>
      </div>

      <section className="mt-4 border-t border-rule pt-3">
        <h4 className="label-eyebrow mb-1 text-[10px]">Exam sentence stem</h4>
        <p className="font-serif text-base leading-relaxed text-ink">{route.examSentenceStem}</p>
      </section>
    </article>
  );
}
