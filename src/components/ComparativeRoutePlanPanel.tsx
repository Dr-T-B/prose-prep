import { useState } from "react";

type ComparativeRoutePlanPairing = {
  axis?: string | null;
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

export function buildEssayPlanScaffold(pairing: ComparativeRoutePlanPairing): string {
  const lines: string[] = [];
  lines.push("# Essay plan — Component 2: Prose");
  lines.push("");

  lines.push("## 1. Thesis / argument direction");
  lines.push(hasText(pairing.thesis) ? pairing.thesis!.trim() : "_Draft the thesis you will defend across all three paragraphs._");
  lines.push("");

  lines.push("## 2. Comparative route");
  lines.push(hasText(pairing.axis) ? pairing.axis!.trim() : "_State the comparative axis you are arguing along._");
  lines.push("");

  lines.push("## 3. Paragraph 1 — AO2 method angle");
  lines.push(hasText(pairing.ao2) ? pairing.ao2!.trim() : "_Anchor this paragraph in a close-method reading (form, language, structure)._");
  lines.push("");

  lines.push("## 4. Paragraph 2 — AO3 contextual angle");
  lines.push(hasText(pairing.ao3) ? pairing.ao3!.trim() : "_Integrate the relevant context as a pressure on meaning, not as background._");
  lines.push("");

  lines.push("## 5. Paragraph 3 — AO4 comparative angle");
  lines.push(hasText(pairing.ao4) ? pairing.ao4!.trim() : "_Drive the comparison forward — convergence, divergence, or escalation._");
  lines.push("");

  const cues: string[] = [];
  if (hasText(pairing.character)) cues.push(`- Character: ${pairing.character!.trim()}`);
  if (hasText(pairing.narrative)) cues.push(`- Narrative: ${pairing.narrative!.trim()}`);
  if (hasText(pairing.structure)) cues.push(`- Structure: ${pairing.structure!.trim()}`);
  if (cues.length > 0) {
    lines.push("## 6. Structural / narrative cue");
    lines.push(...cues);
    lines.push("");
  }

  if (hasText(pairing.exam_fit)) {
    lines.push("## 7. Exam-fit reminder");
    lines.push(pairing.exam_fit!.trim());
    lines.push("");
  }

  lines.push("## Final checklist");
  lines.push("- AO1: maintain argument");
  lines.push("- AO2: analyse method");
  lines.push("- AO3: integrate context");
  lines.push("- AO4: compare throughout");

  return lines.join("\n");
}

export function ComparativeRoutePlanPanel({ pairing }: { pairing: ComparativeRoutePlanPairing }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

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

  const handleCopy = async () => {
    const scaffold = buildEssayPlanScaffold(pairing);
    try {
      await navigator.clipboard.writeText(scaffold);
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError(true);
      setCopied(false);
    }
  };

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

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 border border-rule-strong bg-paper text-xs font-mono rounded-sm hover:bg-paper-dim transition-colors"
          >
            Copy route as essay plan
          </button>
          {copied && (
            <span role="status" className="text-[10px] font-mono text-primary">
              Copied to clipboard
            </span>
          )}
          {copyError && (
            <span role="status" className="text-[10px] font-mono text-ink-muted">
              Copy failed — select and copy the panel text instead
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
