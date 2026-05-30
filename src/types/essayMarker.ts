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

export type MarkerQuestionPayload =
  | { question_id: string; question_stem?: string }
  | { question_id?: string; question_stem: string };

export type MarkerPayload =
  | ({
      mode: 'full_essay' | 'paragraph_only';
      essay_text: string;
    } & MarkerQuestionPayload)
  | {
      mode: 'structured_attempt';
      paragraph_attempt_id: string;
    };
