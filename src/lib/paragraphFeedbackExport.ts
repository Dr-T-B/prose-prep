import type {
  ParagraphFeedbackAoKey,
  ParagraphFeedbackCriterion,
  ParagraphFeedbackResponse,
} from "@/types/paragraphFeedback";

type ParagraphFeedbackExportInput = {
  questionFocus?: string;
  theme?: string;
  routeContext?: string;
  feedback: ParagraphFeedbackResponse;
};

const FEEDBACK_EXPORT_SECTIONS: Array<{ key: ParagraphFeedbackAoKey; title: string }> = [
  { key: "ao1", title: "AO1 - Argument focus" },
  { key: "ao2", title: "AO2 - Method / word / effect" },
  { key: "ao3", title: "AO3 - Context relevance" },
  { key: "ao4", title: "AO4 - Comparison quality" },
];

function optionalText(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function formatCriterion(title: string, criterion: ParagraphFeedbackCriterion): string[] {
  return [
    title,
    `Strength: ${criterion.strength}`,
    `Target: ${criterion.target}`,
  ];
}

export function formatParagraphFeedbackRecord({
  questionFocus,
  theme,
  routeContext,
  feedback,
}: ParagraphFeedbackExportInput): string {
  const recordLines = ["Paragraph Feedback Record"];
  const contextLines: string[] = [];
  const safeQuestionFocus = optionalText(questionFocus);
  const safeTheme = optionalText(theme);
  const safeRouteContext = optionalText(routeContext);

  if (safeQuestionFocus) contextLines.push("Question focus:", safeQuestionFocus);
  if (safeTheme) contextLines.push("Theme:", safeTheme);
  if (safeRouteContext) contextLines.push("Route context:", safeRouteContext);
  if (contextLines.length > 0) recordLines.push("", ...contextLines);

  for (const section of FEEDBACK_EXPORT_SECTIONS) {
    recordLines.push("", ...formatCriterion(section.title, feedback[section.key]));
  }

  if (feedback.routeMatch) {
    recordLines.push("", ...formatCriterion("Route match", feedback.routeMatch));
  }

  recordLines.push("", "Next target:", feedback.nextTarget);

  const safetyNotice = optionalText(feedback.safetyNotice);
  if (safetyNotice) recordLines.push("", "Safety notice:", safetyNotice);

  return recordLines.join("\n");
}
