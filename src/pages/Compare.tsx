import { useContent } from "@/lib/ContentProvider";
import { QUESTION_FAMILY_LABELS } from "@/data/seed";
import type { QuestionFamily } from "@/data/seed";

const hasText = (value?: string | null) => !!value?.trim();

export default function Compare() {
  const { comparative_matrix } = useContent();

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <header className="mb-12 max-w-3xl">
        <p className="label-eyebrow mb-3 text-primary">Comparative routes</p>
        <h1 className="font-serif text-4xl lg:text-5xl mb-4">Compare</h1>
        <p className="font-serif text-lg text-ink-muted leading-relaxed">
          Selected axes between Hard Times and Atonement. Each entry names the
          shared concern, how each writer handles it, and the divergence that
          separates them — the joint on which a comparative argument actually moves.
        </p>
      </header>

      {comparative_matrix.length === 0 && (
        <p className="text-sm text-ink-muted italic">No comparative data loaded yet.</p>
      )}

      <div className="space-y-12">
        {comparative_matrix.map((c) => {
          const aoItems = [
            { label: "AO2", value: c.ao2 },
            { label: "AO3", value: c.ao3 },
            { label: "AO4", value: c.ao4 },
          ];
          const planningItems = [
            { label: "Thesis", value: c.thesis },
            { label: "Character", value: c.character },
            { label: "Narrative", value: c.narrative },
            { label: "Structure", value: c.structure },
            { label: "Exam fit", value: c.exam_fit },
          ];
          const hasAoContent = aoItems.some((item) => hasText(item.value));
          const hasPlanningContent = planningItems
            .filter((item) => item.label !== "Thesis")
            .some((item) => hasText(item.value));

          return (
            <article
              key={c.id}
              className="grid md:grid-cols-12 gap-8 pb-12 border-b border-rule last:border-0"
            >
              {/* Left: axis + theme pills */}
              <header className="md:col-span-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                  Hard Times <span className="text-primary">↔</span> Atonement
                </p>
                <h2 className="font-serif text-2xl lg:text-3xl mt-2 leading-snug">{c.axis}</h2>
                {c.themes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {c.themes.map((t) => {
                      const label = QUESTION_FAMILY_LABELS[t as QuestionFamily] ?? t;
                      return (
                        <span
                          key={t}
                          className="text-[10px] font-mono px-1.5 py-0.5 border border-rule rounded-sm bg-paper-dim/60"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </header>

              {/* Right: evidence + divergence */}
              <div className="md:col-span-8 space-y-6">
                {/* Hard Times */}
                <div className="border-l-2 border-rule pl-5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1">
                    Hard Times
                  </p>
                  <p className="text-sm text-ink-muted leading-relaxed">{c.hard_times}</p>
                </div>

                {/* Atonement */}
                <div className="border-l-2 border-rule pl-5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1">
                    Atonement
                  </p>
                  <p className="text-sm text-ink-muted leading-relaxed">{c.atonement}</p>
                </div>

                {/* Divergence — the analytical joint */}
                <div className="bg-paper-dim/40 border border-rule rounded-sm p-5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-2">
                    Divergence
                  </p>
                  <p className="font-serif text-base leading-relaxed italic">{c.divergence}</p>
                </div>

                {hasText(c.thesis) && (
                  <div className="border-t border-rule pt-5">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-2">
                      Thesis
                    </p>
                    <p className="font-serif text-base leading-relaxed">{c.thesis}</p>
                  </div>
                )}

                {hasAoContent && (
                  <div className="grid sm:grid-cols-3 gap-4">
                    {aoItems.map((item) => (
                      hasText(item.value) && (
                        <section key={item.label} className="border-t border-rule pt-3">
                          <h3 className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-2">
                            {item.label}
                          </h3>
                          <p className="text-sm text-ink-muted leading-relaxed">{item.value}</p>
                        </section>
                      )
                    ))}
                  </div>
                )}

                {hasPlanningContent && (
                  <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4">
                    {planningItems
                      .filter((item) => item.label !== "Thesis")
                      .map((item) => (
                        hasText(item.value) && (
                          <section key={item.label} className="border-t border-rule pt-3">
                            <h3 className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-2">
                              {item.label}
                            </h3>
                            <p className="text-sm text-ink-muted leading-relaxed">{item.value}</p>
                          </section>
                        )
                      ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
