type ComparativeRoutePlanPairing = {
  thesis?: string | null;
  ao2?: string | null;
  ao3?: string | null;
  ao4?: string | null;
  character?: string | null;
  narrative?: string | null;
  structure?: string | null;
  exam_fit?: string | null;
};

const hasText = (value?: string | null) => !!value?.trim();

export function ComparativeRoutePlanPanel({ pairing }: { pairing: ComparativeRoutePlanPairing }) {
  const aoItems = [
    { label: "AO2 method angle", value: pairing.ao2 },
    { label: "AO3 context angle", value: pairing.ao3 },
    { label: "AO4 comparative link", value: pairing.ao4 },
  ];
  const planningItems = [
    { label: "Character cue", value: pairing.character },
    { label: "Narrative cue", value: pairing.narrative },
    { label: "Structure cue", value: pairing.structure },
    { label: "Exam fit", value: pairing.exam_fit },
  ];

  const hasPlanningRoute =
    hasText(pairing.thesis) ||
    aoItems.some((item) => hasText(item.value)) ||
    planningItems.some((item) => hasText(item.value));

  if (!hasPlanningRoute) return null;

  return (
    <div className="border-t border-rule pt-3">
      <p className="label-eyebrow mb-2 text-[10px]">Essay planning route</p>
      <div className="space-y-3">
        {hasText(pairing.thesis) && (
          <div className="border-l-2 border-primary pl-3">
            <p className="label-eyebrow mb-1 text-[10px]">Thesis route</p>
            <p className="font-serif text-sm leading-relaxed">{pairing.thesis}</p>
          </div>
        )}

        {aoItems.some((item) => hasText(item.value)) && (
          <div className="grid sm:grid-cols-3 gap-3">
            {aoItems.map((item) => (
              hasText(item.value) && (
                <section key={item.label} className="border border-rule bg-paper-dim/30 rounded-sm p-3">
                  <h4 className="label-eyebrow mb-1 text-[10px]">{item.label}</h4>
                  <p className="text-xs text-ink-muted leading-relaxed">{item.value}</p>
                </section>
              )
            ))}
          </div>
        )}

        {planningItems.some((item) => hasText(item.value)) && (
          <div className="grid sm:grid-cols-2 gap-3">
            {planningItems.map((item) => (
              hasText(item.value) && (
                <section key={item.label} className="border border-rule bg-paper rounded-sm p-3">
                  <h4 className="label-eyebrow mb-1 text-[10px]">{item.label}</h4>
                  <p className="text-xs text-ink-muted leading-relaxed">{item.value}</p>
                </section>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
