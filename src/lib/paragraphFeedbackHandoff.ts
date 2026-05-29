export type ParagraphFeedbackHandoff = {
  questionFocus?: string;
  theme?: string;
  routeContext?: string;
};

export const PARAGRAPH_FEEDBACK_PATH = "/paragraph-feedback";

const HANDOFF_PARAM_KEYS = ["questionFocus", "theme", "routeContext"] as const;

function optionalParam(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildParagraphFeedbackHandoffUrl(handoff: ParagraphFeedbackHandoff): string {
  const params = new URLSearchParams();

  for (const key of HANDOFF_PARAM_KEYS) {
    const value = optionalParam(handoff[key]);
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return query ? `${PARAGRAPH_FEEDBACK_PATH}?${query}` : PARAGRAPH_FEEDBACK_PATH;
}

export function readParagraphFeedbackHandoff(search: string): ParagraphFeedbackHandoff {
  const params = new URLSearchParams(search);

  return {
    ...(optionalParam(params.get("questionFocus") ?? undefined) ? {
      questionFocus: optionalParam(params.get("questionFocus") ?? undefined),
    } : {}),
    ...(optionalParam(params.get("theme") ?? undefined) ? {
      theme: optionalParam(params.get("theme") ?? undefined),
    } : {}),
    ...(optionalParam(params.get("routeContext") ?? undefined) ? {
      routeContext: optionalParam(params.get("routeContext") ?? undefined),
    } : {}),
  };
}
