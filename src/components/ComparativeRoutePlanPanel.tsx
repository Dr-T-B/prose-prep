import { useState } from "react";
import {
  buildEssayPlanScaffold,
  type ComparativeRoutePlanPairing,
} from "@/lib/comparativeRouteScaffold";
import {
  integrateBuilderHandoffsIntoCurrentPlan,
  ROUTE_HANDOFF_ID,
  type BuilderHandoffItem,
} from "@/lib/builderHandoff";

const hasText = (value?: string | null) => !!value?.trim();

function buildRouteHandoffItem(pairing: ComparativeRoutePlanPairing): BuilderHandoffItem {
  const metadata: Record<string, string | string[]> = {};
  const put = (key: string, value?: string | null) => {
    if (hasText(value)) metadata[key] = value!.trim();
  };
  put("thesis", pairing.thesis);
  put("axis", pairing.axis);
  put("ao2", pairing.ao2);
  put("ao3", pairing.ao3);
  put("ao4", pairing.ao4);
  put("character", pairing.character);
  put("narrative", pairing.narrative);
  put("structure", pairing.structure);
  put("exam_fit", pairing.exam_fit);
  put("hard_times", pairing.hard_times);
  put("atonement", pairing.atonement);
  put("divergence", pairing.divergence);
  if (pairing.themes && pairing.themes.length) metadata.themes = pairing.themes;

  const family =
    pairing.themes && pairing.themes.length ? (pairing.themes[0] as BuilderHandoffItem["family"]) : undefined;

  return {
    id: ROUTE_HANDOFF_ID,
    kind: "comparison",
    originModule: "comparison",
    label: "Route hints",
    title: pairing.axis?.trim() || "Selected comparative route",
    text: pairing.thesis?.trim() || pairing.divergence?.trim() || "Route hints applied to paragraph drafting.",
    canonicalId: pairing.id ?? undefined,
    family,
    metadata,
  };
}

export function ComparativeRoutePlanPanel({
  pairing,
  onApplyRouteHandoff,
}: {
  pairing: ComparativeRoutePlanPairing;
  /** When supplied, EssayBuilder owns the integration so its useCurrentPlan
   *  state updates and child consumers re-render. Without it, the panel falls
   *  back to writing through the plan-store helper directly. */
  onApplyRouteHandoff?: (item: BuilderHandoffItem) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [handoffApplied, setHandoffApplied] = useState(false);

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

  const handleUseForParagraphDrafting = () => {
    const item = buildRouteHandoffItem(pairing);
    if (onApplyRouteHandoff) {
      onApplyRouteHandoff(item);
    } else {
      integrateBuilderHandoffsIntoCurrentPlan([item]);
    }
    setHandoffApplied(true);
    window.setTimeout(() => setHandoffApplied(false), 1800);
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

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy Component 2 essay route plan scaffold"
            className="px-3 py-1.5 border border-rule-strong bg-paper text-xs font-mono rounded-sm hover:bg-paper-dim transition-colors"
          >
            Copy timed essay-plan scaffold
          </button>
          <button
            type="button"
            onClick={handleUseForParagraphDrafting}
            aria-label="Use this route for paragraph drafting"
            className="px-3 py-1.5 border border-rule-strong bg-paper text-xs font-mono rounded-sm hover:bg-paper-dim transition-colors"
          >
            Use this route for paragraph drafting
          </button>
          {copied && (
            <span role="status" className="text-[10px] font-mono text-primary">
              Copied to clipboard
            </span>
          )}
          {handoffApplied && (
            <span role="status" className="text-[10px] font-mono text-primary">
              Route hints applied
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
