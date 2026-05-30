export type QuoteDiagnostic = {
  quote: string;
  status: 'verified' | 'unverified' | 'paraphrased';
  note: string;
};

export type AoFeedback = {
  diagnosticLabel: string;
  strength: string;
  nextStep: string;
};

export type MarkerResult = {
  summary: string;
  aoFeedback: {
    AO1: AoFeedback;
    AO2: AoFeedback;
    AO3: AoFeedback;
    AO4: AoFeedback;
  };
  strengths: string[];
  priorityTargets: string[];
  quoteMethodDiagnostic: QuoteDiagnostic[];
  revisionPrompts: string[];
  nextStep: string;
  teacherNotes?: string;
  examWarning: string;
};

export type MarkerMode = 'full_essay' | 'paragraph_only' | 'structured_attempt';

export type MarkerPayload = {
  mode: MarkerMode;
  question_id?: string;
  essay_text?: string;
  paragraph_attempt_id?: string;
};
