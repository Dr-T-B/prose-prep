export type ParagraphFeedbackAoKey = "ao1" | "ao2" | "ao3" | "ao4";

export type ParagraphFeedbackRequest = {
  paragraph: string;
  questionFocus?: string;
  theme?: string;
  routeContext?: string;
};

export type ParagraphFeedbackCriterion = {
  strength: string;
  target: string;
};

export type ParagraphFeedbackResponse = Record<ParagraphFeedbackAoKey, ParagraphFeedbackCriterion> & {
  routeMatch?: ParagraphFeedbackCriterion;
  nextTarget: string;
  safetyNotice?: string;
};

export type ValidatedParagraphFeedbackRequest = {
  paragraph: string;
  questionFocus?: string;
  theme?: string;
  routeContext?: string;
};

export type ParagraphFeedbackRequestValidation =
  | { ok: true; value: ValidatedParagraphFeedbackRequest }
  | { ok: false; error: string };

export type ParagraphFeedbackResponseValidation =
  | { ok: true; value: ParagraphFeedbackResponse }
  | { ok: false; error: string };
