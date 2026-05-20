export type AoLevel =
  | 'Level 1'
  | 'Level 2'
  | 'Level 3'
  | 'Level 4'
  | 'Level 5';

export type QuoteDiagnostic = {
  quote: string;
  status: 'verified' | 'unverified' | 'paraphrased';
  note: string;
};

export type AoFeedback = {
  level: AoLevel;
  strength: string;
  weakness: string;
  nextAction: string;
};

export type MarkerResult = {
  provisionalLevel: AoLevel;
  provisionalMarks?: number;
  overallSummary: string;
  aoFeedback: {
    AO1: AoFeedback;
    AO2: AoFeedback;
    AO3: AoFeedback;
    AO4: AoFeedback;
  };
  topStrengths: string[];
  priorityWeaknesses: string[];
  quoteMethodDiagnostic: QuoteDiagnostic[];
  modelUpgradeParagraph: string;
  nextDrill: {
    title: string;
    durationMinutes: number;
    instructions: string;
    appRoute: string;
  };
  examWarning: string;
};

export type MarkerMode = 'full_essay' | 'paragraph_only' | 'structured_attempt';

export type MarkerPayload = {
  mode: MarkerMode;
  question_id?: string;
  essay_text?: string;
  target_grade?: string;
  paragraph_attempt_id?: string;
};
