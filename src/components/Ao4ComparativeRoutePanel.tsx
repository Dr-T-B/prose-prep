import type { ReactNode } from "react";
import type { Ao4ComparativeRoute } from "@/types/ao4ComparativeRoutes";

function FieldBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="border-t border-rule pt-3">
      <h4 className="label-eyebrow mb-1 text-[10px]">{label}</h4>
      <p className="text-sm leading-relaxed text-ink-muted">{children}</p>
    </section>
  );
}

export default function Ao4ComparativeRoutePanel({ route }: { route: Ao4ComparativeRoute }) {
  return (
    <article className="border border-rule bg-paper rounded-sm p-4 shadow-card print:shadow-none">
      <header className="flex flex-col gap-2 border-b border-rule pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="label-eyebrow mb-1 text-[10px]">AO4 Comparative Route</p>
          <h3 className="font-serif text-xl leading-tight">{route.themeExamTrigger}</h3>
        </div>
        <span className="inline-flex w-fit items-center rounded-sm border border-primary bg-highlight/55 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-ink">
          {route.priority}
        </span>
      </header>

      <section className="mt-3 border-l-4 border-primary bg-highlight/35 px-3 py-2">
        <h4 className="label-eyebrow mb-1 text-[10px]">Comparative Thesis</h4>
        <p className="font-serif text-base leading-relaxed text-ink">{route.comparativeThesis}</p>
      </section>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <section className="border border-rule bg-paper-dim/30 rounded-sm p-3">
          <h4 className="label-eyebrow mb-1 text-[10px]">Hard Times comparison point</h4>
          <p className="text-sm leading-relaxed text-ink-muted">{route.hardTimesComparisonPoint}</p>
        </section>
        <section className="border border-rule bg-paper-dim/30 rounded-sm p-3">
          <h4 className="label-eyebrow mb-1 text-[10px]">Atonement comparison point</h4>
          <p className="text-sm leading-relaxed text-ink-muted">{route.atonementComparisonPoint}</p>
        </section>
      </div>

      <div className="mt-4 grid gap-x-4 gap-y-3 md:grid-cols-2">
        <FieldBlock label="Similarity">{route.similarity}</FieldBlock>
        <FieldBlock label="Difference">{route.difference}</FieldBlock>
        <FieldBlock label="AO4 hinge / conceptual bridge">{route.conceptualBridge}</FieldBlock>
        <FieldBlock label="Best evidence zones">{route.bestEvidenceZones}</FieldBlock>
        <FieldBlock label="Paragraph route">{route.paragraphRoute}</FieldBlock>
        <FieldBlock label="Exam sentence stem">{route.examSentenceStem}</FieldBlock>
      </div>
    </article>
  );
}
