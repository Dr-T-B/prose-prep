import type {
  Component2AO,
  RapidRecallRoutePlan,
  RapidRecallTimedParagraphDrill,
  TimedDrillSessionSummary,
  TimedDrillSessionSummaryStem,
  TimedParagraphDrillStageLabel,
} from "@/types/rapidRecall";

const STAGE_ORDER: TimedParagraphDrillStageLabel[] = [
  "Thesis opening",
  "Hard Times paragraph opening",
  "Atonement paragraph opening",
  "Comparative judgement opening",
];

const AO_FOCUS_ORDER: Component2AO[] = ["AO1", "AO2", "AO3", "AO4"];

function orderedAoFocus(aos: Iterable<Component2AO>) {
  const selectedAos = new Set(aos);
  return AO_FOCUS_ORDER.filter((ao) => selectedAos.has(ao));
}

function selectedStemText(
  summary: TimedDrillSessionSummary,
  label: TimedParagraphDrillStageLabel,
) {
  return summary.selectedStems.find((stem) => stem.stageLabel === label)?.stemText ?? "Not selected";
}

export function getTimedDrillNextRevisionTarget(summaryStems: TimedDrillSessionSummaryStem[]) {
  const thesis = summaryStems.find((stem) => stem.stageLabel === "Thesis opening");
  const hardTimes = summaryStems.find((stem) => stem.stageLabel === "Hard Times paragraph opening");
  const atonement = summaryStems.find((stem) => stem.stageLabel === "Atonement paragraph opening");
  const judgement = summaryStems.find((stem) => stem.stageLabel === "Comparative judgement opening");

  if (summaryStems.length === STAGE_ORDER.length && summaryStems.every((stem) => stem.isBest)) {
    return "Move to a timed handwritten paragraph using this route.";
  }

  if (thesis?.isBest === false || judgement?.isBest === false) {
    return "Strengthen the comparative argument before writing.";
  }

  if (hardTimes?.isBest === false || atonement?.isBest === false) {
    return "Tighten the text-specific method/context link before writing.";
  }

  return "Review the route and repeat one timed stage.";
}

export function buildTimedDrillSessionSummary({
  drill,
  routePlan,
  selectedOptionIds,
}: {
  drill: RapidRecallTimedParagraphDrill;
  routePlan?: RapidRecallRoutePlan;
  selectedOptionIds: Record<string, string>;
}): TimedDrillSessionSummary {
  const selectedStems = STAGE_ORDER.map((label) => {
    const stage = drill.stages.find((candidate) => candidate.label === label);
    if (!stage) return undefined;

    const option = stage.stemOptions.find((candidate) => candidate.id === selectedOptionIds[stage.id]);
    if (!option) return undefined;

    return {
      stageLabel: label,
      stemText: option.text,
      aoFocus: stage.aoFocus,
      isBest: Boolean(option.isBest),
    };
  }).filter((stem): stem is TimedDrillSessionSummaryStem => Boolean(stem));

  return {
    theme: drill.theme,
    questionFocus: drill.questionFocus,
    selectedStems,
    aoFocusCovered: orderedAoFocus(selectedStems.flatMap((stem) => stem.aoFocus)),
    ao4Bridge: routePlan?.routeBridge,
    examWarning: routePlan?.examWarning ?? drill.examWarning,
    nextRevisionTarget: getTimedDrillNextRevisionTarget(selectedStems),
  };
}

export function formatTimedDrillSessionSummaryForCopy(summary: TimedDrillSessionSummary) {
  return [
    "Practice Session Summary",
    "",
    `Theme: ${summary.theme}`,
    `Question focus: ${summary.questionFocus}`,
    `Thesis opening: ${selectedStemText(summary, "Thesis opening")}`,
    `Hard Times opening: ${selectedStemText(summary, "Hard Times paragraph opening")}`,
    `Atonement opening: ${selectedStemText(summary, "Atonement paragraph opening")}`,
    `Comparative judgement opening: ${selectedStemText(summary, "Comparative judgement opening")}`,
    `AO focus covered: ${summary.aoFocusCovered.join(", ")}`,
    `AO4 bridge: ${summary.ao4Bridge ?? "Not available"}`,
    `Exam warning: ${summary.examWarning ?? "Use this as a review note, not a full essay."}`,
    `Next revision target: ${summary.nextRevisionTarget}`,
  ].join("\n");
}
