export type Component2AO = "AO1" | "AO2" | "AO3" | "AO4";

export type RapidRecallDrillType =
  | "multiple-choice"
  | "fill-blank"
  | "match-pair"
  | "route-selection";

export type RapidRecallTextFocus = "Hard Times" | "Atonement" | "Comparative";

export type RapidRecallTheme =
  | "childhood"
  | "education"
  | "gender"
  | "class"
  | "family"
  | "guilt"
  | "memory"
  | "power"
  | "social control"
  | "violence"
  | "place"
  | "settings"
  | "misunderstanding"
  | "narrative perspective"
  | "relationships"
  | "important choices"
  | "roles of children";

export type RapidRecallDifficulty = "Foundation" | "Secure" | "Stretch";

export interface RapidRecallRoutePlanParagraph {
  title: string;
  hardTimesFocus: string;
  atonementFocus: string;
  aoFocus: Component2AO[];
}

export interface RapidRecallRoutePlan {
  thesis: string;
  paragraphOne: RapidRecallRoutePlanParagraph;
  paragraphTwo: RapidRecallRoutePlanParagraph;
  paragraphThree: RapidRecallRoutePlanParagraph;
  conclusion: string;
  examWarning?: string;
  routeBridge?: string;
}

export type TimedParagraphDrillStageLabel =
  | "Thesis opening"
  | "Hard Times paragraph opening"
  | "Atonement paragraph opening"
  | "Comparative judgement opening";

export interface TimedParagraphDrillStemOption {
  id: string;
  text: string;
  isBest?: boolean;
  explanation: string;
}

export interface TimedParagraphDrillStage {
  id: string;
  label: TimedParagraphDrillStageLabel;
  suggestedTimeSeconds: number;
  prompt: string;
  aoFocus: Component2AO[];
  stemOptions: TimedParagraphDrillStemOption[];
}

export interface RapidRecallTimedParagraphDrill {
  itemId: string;
  theme: RapidRecallTheme;
  questionFocus: string;
  stages: TimedParagraphDrillStage[];
  examWarning: string;
}

export interface TimedDrillSessionSummaryStem {
  stageLabel: TimedParagraphDrillStageLabel;
  stemText: string;
  aoFocus: Component2AO[];
  isBest: boolean;
}

export interface TimedDrillSessionSummary {
  theme: RapidRecallTheme;
  questionFocus: string;
  selectedStems: TimedDrillSessionSummaryStem[];
  aoFocusCovered: Component2AO[];
  ao4Bridge?: string;
  examWarning?: string;
  nextRevisionTarget: string;
}

export interface RapidRecallBaseItem {
  id: string;
  type: RapidRecallDrillType;
  theme: RapidRecallTheme;
  textFocus: RapidRecallTextFocus;
  character: string;
  quoteAnchor: string;
  aoFocus: Component2AO[];
  ao1Move: string;
  ao2Method: string;
  ao3Context: string;
  ao4Comparison: string;
  essayFunction: string;
  prompt: string;
  explanation: string;
  difficulty: RapidRecallDifficulty;
  routePlan?: RapidRecallRoutePlan;
}

export interface MultipleChoiceRapidRecallItem extends RapidRecallBaseItem {
  type: "multiple-choice";
  options: string[];
  answer: string;
}

export interface FillBlankRapidRecallItem extends RapidRecallBaseItem {
  type: "fill-blank";
  answer: string;
  acceptedAnswers?: string[];
}

export interface MatchPairRapidRecallItem extends RapidRecallBaseItem {
  type: "match-pair";
  left: string;
  options: string[];
  answer: string;
}

export interface RouteSelectionRapidRecallItem extends RapidRecallBaseItem {
  type: "route-selection";
  options: string[];
  answer: string;
  ao4Bridge: string;
}

export type RapidRecallWorkbookItem =
  | MultipleChoiceRapidRecallItem
  | FillBlankRapidRecallItem
  | MatchPairRapidRecallItem
  | RouteSelectionRapidRecallItem;
