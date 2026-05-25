export interface PastPaperQuestion {
  id: string;
  questionText: string;
  theme: string;
  examBoard: 'Edexcel';
  year: number | string;
  sampleThesisOptions: string[];
}

export interface EssayGenerationResult {
  essayMetadata: {
    questionText: string;
    theme: string;
    thesisAxis: string;
  };
  modelAnswer: {
    introduction: string;
    bodyParagraph1: string;
    bodyParagraph2: string;
    bodyParagraph3: string;
    conclusion: string;
  };
  examinerBreakdown: {
    ao1_conceptual_umbrella_notes: string;
    ao2_micro_linguistic_highlights: string;
    ao3_symbiosis_validation: string;
    ao4_comparative_pivot_excellence: string;
  };
}
