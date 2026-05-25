export type GradeLevel = 'B' | 'A' | 'A*';
export type AssessmentObjective = 'AO1' | 'AO2' | 'AO3' | 'AO4';

export enum ParagraphValidationErrorCode {
  ERR_01 = 'ERR_01', // Missing or weak Umbrella sentence (comparative thesis statement)
  ERR_02 = 'ERR_02', // Missing or weak Text A analysis (Charles Dickens / Hard Times)
  ERR_03 = 'ERR_03', // Missing or weak Comparative Pivot, or use of sequential block-reporting connectors
  ERR_04 = 'ERR_04', // Missing or weak Text B analysis (Ian McEwan / Atonement)
  ERR_05 = 'ERR_05', // Tentative/speculative modal validation
}

export type ValidationErrorItem = {
  code: ParagraphValidationErrorCode;
  message: string;
  startOffset: number;
  endOffset: number;
  contextualCritique?: string;
  actionableFix?: string;
  severity?: 'CRITICAL' | 'WARNING' | 'ACHIEVEMENT';
};

export type ActiveFlagType =
  | 'HISTORY_DUMP'
  | 'HISTORY_SANDWICH'
  | 'MIMETIC_FALLACY'
  | 'AO2_AO3_SYMBIOSIS_MISSING';

export type ActiveFlagItem = {
  type: ActiveFlagType;
  message: string;
  startOffset: number;
  endOffset: number;
  contextualCritique?: string;
  actionableFix?: string;
  severity?: 'CRITICAL' | 'WARNING' | 'ACHIEVEMENT';
};

export type StructuralScores = {
  ao1: number;
  ao2: number;
  ao3: number;
  ao4: number;
  overall: number;
};

export type TargetTextPairing = {
  hardTimesQuote?: string | null;
  atonementQuote?: string | null;
  hardTimesMethod?: string | null;
  atonementMethod?: string | null;
  themeLabel?: string | null;
};

export type PromptParameters = {
  theme?: string | null;
  targetGrade?: GradeLevel | null;
};

export type EvaluationRequest = {
  text: string;
  targetTextPairing?: TargetTextPairing | null;
  promptParameters?: PromptParameters | null;
};

export type EvaluationResult = {
  isValid: boolean;
  errors: ValidationErrorItem[];
  activeFlags: ActiveFlagItem[];
  structuralScores: StructuralScores;
  feedback: string;
  overallQualitativeSummary?: string;
  exemplarPivotSuggestion?: string;
};
