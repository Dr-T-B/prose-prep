import type { ReactNode } from "react";
import type { ResolvedAoRouteCombination } from "@/types/aoRouteCombinations";

function priorityClasses(priority: ResolvedAoRouteCombination["priority"]): string {
  if (priority === "CORE") return "border-primary bg-highlight/55 text-ink";
  if (priority === "HIGH") return "border-rule-strong bg-paper-dim text-ink";
  return "border-rule bg-paper text-ink-muted";
}

function PlanningBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-rule pt-3">
      <h4 className="label-eyebrow mb-1 text-[10px]">{title}</h4>
      {children}
    </section>
  );
}

export default function AoRouteCombinationPanel({
  combination,
}: {
  combination: ResolvedAoRouteCombination;
}) {
  return (
    <article className="border border-rule bg-paper rounded-sm p-4 shadow-card print:shadow-none">
      <header className="flex flex-col gap-2 border-b border-rule pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="label-eyebrow mb-1 text-[10px]">Suggested AO Route Combination</p>
          <h3 className="font-serif text-xl leading-tight">{combination.theme}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{combination.studentUseCase}</p>
        </div>
        <span
          className={`inline-flex w-fit items-center rounded-sm border px-2 py-1 text-[10px] font-mono uppercase tracking-wider ${priorityClasses(combination.priority)}`}
        >
          {combination.priority}
        </span>
      </header>

      <section className="mt-3">
        <h4 className="label-eyebrow mb-2 text-[10px]">Question triggers</h4>
        <div className="flex flex-wrap gap-1.5">
          {combination.questionTriggers.map((trigger) => (
            <span
              key={trigger}
              className="rounded-sm border border-rule bg-paper-dim px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-ink-muted"
            >
              {trigger}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-x-4 gap-y-3 lg:grid-cols-2">
        <PlanningBlock title="AO1 thesis route">
          {combination.ao1Route ? (
            <div>
              <p className="font-serif text-base leading-snug text-ink">{combination.ao1Route.themeFocus}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                {combination.ao1Route.thesisSentenceStarter}
              </p>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-ink-muted">
              {combination.ao1RouteId
                ? `${combination.ao1RouteId} is not resolved in the current local seed.`
                : "No AO1 route has been attached yet."}
            </p>
          )}
        </PlanningBlock>

        <PlanningBlock title="AO2 method routes">
          <ul className="space-y-2">
            {combination.ao2Routes.length > 0 ? (
              combination.ao2Routes.map((route) => (
                <li key={route.id} className="text-sm leading-relaxed text-ink-muted">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink">{route.id}</span>
                  <span className="mx-1 text-rule">/</span>
                  <span className="font-medium text-ink">{route.ao2Route}:</span> {route.examSentenceStem}
                </li>
              ))
            ) : (
              <li className="text-sm leading-relaxed text-ink-muted">Full AO2 route resolution is pending.</li>
            )}
          </ul>
        </PlanningBlock>

        <PlanningBlock title="AO3 context routes">
          <ul className="space-y-2">
            {combination.ao3Routes.map((route) => (
              <li key={route.id} className="text-sm leading-relaxed text-ink-muted">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink">{route.id}</span>
                <span className="mx-1 text-rule">/</span>
                <span className="font-medium text-ink">{route.themeExamRoute}:</span> {route.coreContextClaim}
              </li>
            ))}
          </ul>
        </PlanningBlock>

        <PlanningBlock title="AO4 comparative hinge routes">
          <ul className="space-y-2">
            {combination.ao4Routes.length > 0 ? (
              combination.ao4Routes.map((route) => (
                <li key={route.id} className="text-sm leading-relaxed text-ink-muted">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink">{route.id}</span>
                  <span className="mx-1 text-rule">/</span>
                  <span className="font-medium text-ink">{route.themeExamTrigger}:</span> {route.conceptualBridge}
                </li>
              ))
            ) : (
              <li className="text-sm leading-relaxed text-ink-muted">Full AO4 route resolution is pending.</li>
            )}
          </ul>
        </PlanningBlock>
      </div>

      <section className="mt-4 border-t border-rule pt-3">
        <h4 className="label-eyebrow mb-2 text-[10px]">Recommended paragraph pattern</h4>
        <ol className="grid gap-2 md:grid-cols-2">
          {combination.recommendedParagraphPattern.map((step, index) => (
            <li key={step} className="flex gap-2 text-sm leading-relaxed text-ink-muted">
              <span className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {combination.teacherNote && (
        <section className="mt-4 border border-rule bg-paper-dim/45 px-3 py-2 rounded-sm">
          <h4 className="label-eyebrow mb-1 text-[10px]">Teacher note</h4>
          <p className="text-sm leading-relaxed text-ink-muted">{combination.teacherNote}</p>
        </section>
      )}
    </article>
  );
}
