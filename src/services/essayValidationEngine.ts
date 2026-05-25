import {
  ParagraphValidationErrorCode,
  ValidationErrorItem,
  ActiveFlagItem,
  EvaluationRequest,
  EvaluationResult,
  StructuralScores,
  ActiveFlagType
} from '../types/essayEngine';
import {
  ABSTRACT_NOMINALIZATIONS,
  WEAK_CONNECTIVES,
  AUTHORIAL_DESIGN_VERBS,
  MODAL_VERBS,
  AO2_DEVICES,
  AO3_CONTEXTS
} from '../utils/essayParserRules';

// Helper to split paragraph into sentences and keep track of character offsets
function splitSentences(text: string): { text: string; start: number; end: number }[] {
  const sentences: { text: string; start: number; end: number }[] = [];
  const regex = /[^.!?]+[.!?]*/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const sText = match[0];
    const start = match.index;
    const end = start + sText.length;
    sentences.push({ text: sText, start, end });
  }
  return sentences;
}

// Helper to tokenize text into words for distance verification, keeping track of original word indices
function tokenizeText(text: string): { word: string; index: number }[] {
  const words: { word: string; index: number }[] = [];
  // Match alphanumeric sequences
  const regex = /[a-zA-Z0-9']+/g;
  let match;
  let index = 0;
  while ((match = regex.exec(text)) !== null) {
    words.push({
      word: match[0].toLowerCase(),
      index: index++
    });
  }
  return words;
}

export function evaluateParagraph(request: EvaluationRequest): EvaluationResult {
  const { text, targetTextPairing } = request;
  const sentences = splitSentences(text);
  const errors: ValidationErrorItem[] = [];
  const activeFlags: ActiveFlagItem[] = [];

  if (sentences.length === 0) {
    return {
      isValid: false,
      errors: [
        {
          code: ParagraphValidationErrorCode.ERR_01,
          message: 'The paragraph is empty.',
          startOffset: 0,
          endOffset: 0
        }
      ],
      activeFlags: [],
      structuralScores: { ao1: 1, ao2: 1, ao3: 1, ao4: 1, overall: 1 },
      feedback: 'Please enter a paragraph to evaluate.'
    };
  }

  // Comparative indicators for the Umbrella sentence
  const comparativeIndicators = [
    'whereas', 'while', 'contrast', 'however', 'conversely', 'unlike', 
    'both', 'parallel', 'diverge', 'diverges', 'echo', 'echoes', 
    'similarly', 'comparatively', 'synthesis', 'comparison'
  ];

  // Text A (Dickens / Hard Times) indicators
  const textAIndicators = [
    'dickens', 'hard times', 'gradgrind', 'bounderby', 'sissy', 'jupe',
    'louisa', 'coketown', 'hands', 'blackpool', 'bitzer', "m'choakumchild"
  ];
  if (targetTextPairing?.hardTimesMethod) {
    textAIndicators.push(targetTextPairing.hardTimesMethod.toLowerCase());
  }

  // Text B (McEwan / Atonement) indicators
  const textBIndicators = [
    'mcewan', 'atonement', 'briony', 'robbie', 'cecilia', 'tallis',
    'lola', 'dunkirk', 'turner', 'epilogue'
  ];
  if (targetTextPairing?.atonementMethod) {
    textBIndicators.push(targetTextPairing.atonementMethod.toLowerCase());
  }

  // ---------------------------------------------------------------------------
  // 1. Chronological Pipeline Check
  // ---------------------------------------------------------------------------

  // A. Umbrella Check (Sentence 1)
  const firstSentence = sentences[0];
  const firstTextLower = firstSentence.text.toLowerCase();
  const hasComparisonIndicator = comparativeIndicators.some(w => firstTextLower.includes(w));
  const hasConceptOrDesignVerb = 
    ABSTRACT_NOMINALIZATIONS.some(w => firstTextLower.includes(w)) ||
    AUTHORIAL_DESIGN_VERBS.some(w => firstTextLower.includes(w));

  if (!hasComparisonIndicator || !hasConceptOrDesignVerb) {
    errors.push({
      code: ParagraphValidationErrorCode.ERR_01,
      message: 'The opening "Umbrella" sentence must serve as a comparative thesis statement, introducing abstract concepts and comparative transitions.',
      startOffset: firstSentence.start,
      endOffset: firstSentence.end
    });
  }

  // B. Text A Check
  const textLower = text.toLowerCase();
  const hasTextA = textAIndicators.some(w => textLower.includes(w)) || 
                   (targetTextPairing?.hardTimesQuote && textLower.includes(targetTextPairing.hardTimesQuote.toLowerCase().slice(0, 15)));
  if (!hasTextA) {
    errors.push({
      code: ParagraphValidationErrorCode.ERR_02,
      message: 'The paragraph is missing analysis of Text A (Charles Dickens / Hard Times).',
      startOffset: firstSentence.end,
      endOffset: text.length
    });
  }

  // C. Comparative Pivot Check
  const pivotIndex = -1;
  let weakConnectiveFound: string | null = null;
  let weakConnectiveStart = -1;
  let weakConnectiveEnd = -1;

  // Search for weak connectives first
  for (const conn of WEAK_CONNECTIVES) {
    const connRegex = new RegExp(`\\b${conn}\\b`, 'i');
    const match = connRegex.exec(text);
    if (match) {
      weakConnectiveFound = match[0];
      weakConnectiveStart = match.index;
      weakConnectiveEnd = match.index + match[0].length;
      break;
    }
  }

  // Search for comparative transitions
  const comparativeTransitions = [
    'whereas', 'while', 'by contrast', 'however', 'conversely', 'unlike', 
    'contrasts', 'diverges', 'echoes'
  ];
  let pivotFound = false;
  let pivotStart = -1;
  let pivotEnd = -1;

  for (const trans of comparativeTransitions) {
    const transRegex = new RegExp(`\\b${trans}\\b`, 'i');
    const match = transRegex.exec(text);
    if (match) {
      pivotFound = true;
      pivotStart = match.index;
      pivotEnd = match.index + match[0].length;
      break;
    }
  }

  if (weakConnectiveFound) {
    errors.push({
      code: ParagraphValidationErrorCode.ERR_03,
      message: `Weak sequential connective found ("${weakConnectiveFound}"). Level 5 requires a synthetic comparative weave instead of sequential listing.`,
      startOffset: weakConnectiveStart,
      endOffset: weakConnectiveEnd
    });
  } else if (!pivotFound) {
    errors.push({
      code: ParagraphValidationErrorCode.ERR_03,
      message: 'Missing Comparative Pivot transition to weave Text A and Text B analysis together.',
      startOffset: firstSentence.end,
      endOffset: text.length
    });
  }

  // D. Text B Check
  const hasTextB = textBIndicators.some(w => textLower.includes(w)) ||
                   (targetTextPairing?.atonementQuote && textLower.includes(targetTextPairing.atonementQuote.toLowerCase().slice(0, 15)));
  if (!hasTextB) {
    errors.push({
      code: ParagraphValidationErrorCode.ERR_04,
      message: 'The paragraph is missing analysis of Text B (Ian McEwan / Atonement).',
      startOffset: pivotFound ? pivotEnd : firstSentence.end,
      endOffset: text.length
    });
  }

  // E. Speculative Hedges (ERR_05)
  for (const modal of MODAL_VERBS) {
    const modalRegex = new RegExp(`\\b${modal}\\b`, 'i');
    const match = modalRegex.exec(text);
    if (match) {
      errors.push({
        code: ParagraphValidationErrorCode.ERR_05,
        message: `Speculative hedge found ("${match[0]}"). Use active, confident authorial design verbs for high-tier academic analysis.`,
        startOffset: match.index,
        endOffset: match.index + match[0].length
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Pedagogical Flags Scans
  // ---------------------------------------------------------------------------

  // A. History Dump Scan
  // Triggers if a sentence starts directly with a historical date/context point
  const historyDumpRegex = /^\s*(In \d{4}|During the \w+ era|In the \w+ century|In the interwar|Around \d{4})\b/i;
  for (const s of sentences) {
    const match = historyDumpRegex.exec(s.text);
    if (match) {
      activeFlags.push({
        type: 'HISTORY_DUMP',
        message: 'History Dump: Context must be introduced through the writer\'s narrative and thematic intent, not as a raw date statement.',
        startOffset: s.start + s.text.indexOf(match[1]),
        endOffset: s.start + s.text.indexOf(match[1]) + match[1].length
      });
    }
  }

  // B. History Sandwich / Sequential Blocking Scan
  // Triggers if Text A sentences are entirely separated before all Text B sentences
  const sentenceTextAIndices: number[] = [];
  const sentenceTextBIndices: number[] = [];
  sentences.forEach((s, idx) => {
    if (idx === 0) return; // Exclude comparative umbrella sentence
    const sLower = s.text.toLowerCase();
    const isTextA = textAIndicators.some(w => sLower.includes(w));
    const isTextB = textBIndicators.some(w => sLower.includes(w));
    if (isTextA) sentenceTextAIndices.push(idx);
    if (isTextB) sentenceTextBIndices.push(idx);
  });

  if (
    sentenceTextAIndices.length > 1 && 
    sentenceTextBIndices.length > 1 &&
    Math.max(...sentenceTextAIndices) < Math.min(...sentenceTextBIndices)
  ) {
    activeFlags.push({
      type: 'HISTORY_SANDWICH',
      message: 'History Sandwich: Your paragraph isolates Text A analysis from Text B analysis. Level 5 requires a woven comparative transition throughout.',
      startOffset: sentences[sentenceTextAIndices[0]].start,
      endOffset: sentences[sentenceTextBIndices[sentenceTextBIndices.length - 1]].end
    });
  }

  // C. Mimetic Fallacy Scan
  // Triggers if a sentence contains context (AO3) + reflection verb, but lacks method (AO2)
  const reflectionVerbs = ['reflects', 'mirrors', 'shows', 'portrays', 'depicts', 'reproduces'];
  for (const s of sentences) {
    const sLower = s.text.toLowerCase();
    const hasAO3 = AO3_CONTEXTS.some(w => sLower.includes(w));
    const hasReflectionVerb = reflectionVerbs.some(v => sLower.includes(v));
    const hasAO2 = AO2_DEVICES.some(d => sLower.includes(d)) || 
                   (targetTextPairing?.hardTimesMethod && sLower.includes(targetTextPairing.hardTimesMethod.toLowerCase())) ||
                   (targetTextPairing?.atonementMethod && sLower.includes(targetTextPairing.atonementMethod.toLowerCase()));
    
    if (hasAO3 && hasReflectionVerb && !hasAO2) {
      activeFlags.push({
        type: 'MIMETIC_FALLACY',
        message: 'Mimetic Fallacy: Treat the text as a constructed aesthetic representation rather than a direct mirror of history. Analyze the literary methods shaping meaning.',
        startOffset: s.start,
        endOffset: s.end
      });
    }
  }

  // D. AO2/AO3 Symbiosis Check (15-word window)
  const tokens = tokenizeText(text);
  const ao2Indices: number[] = [];
  const ao3Indices: number[] = [];

  tokens.forEach(tok => {
    const isAO2 = AO2_DEVICES.some(d => tok.word.includes(d)) ||
                  (targetTextPairing?.hardTimesMethod?.toLowerCase().includes(tok.word)) ||
                  (targetTextPairing?.atonementMethod?.toLowerCase().includes(tok.word));
    const isAO3 = AO3_CONTEXTS.some(c => tok.word.includes(c));

    if (isAO2) ao2Indices.push(tok.index);
    if (isAO3) ao3Indices.push(tok.index);
  });

  let symbiosisAchieved = false;
  if (ao2Indices.length > 0 && ao3Indices.length > 0) {
    let minDistance = Infinity;
    for (const a2 of ao2Indices) {
      for (const a3 of ao3Indices) {
        const dist = Math.abs(a2 - a3);
        if (dist < minDistance) minDistance = dist;
      }
    }
    // Check if within 15 words (inclusive of boundary)
    if (minDistance <= 15) {
      symbiosisAchieved = true;
    }
  }

  if (!symbiosisAchieved) {
    activeFlags.push({
      type: 'AO2_AO3_SYMBIOSIS_MISSING',
      message: 'Missing AO2/AO3 Symbiosis: Literary method analysis (AO2) and socio-political context (AO3) should be integrated within a tight 15-word window.',
      startOffset: 0,
      endOffset: text.length
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Structural Scoring Calculations
  // ---------------------------------------------------------------------------
  const scoreAo1 = errors.some(e => e.code === ParagraphValidationErrorCode.ERR_01) ? 2 : 5;
  const scoreAo2 = errors.some(e => e.code === ParagraphValidationErrorCode.ERR_02 || e.code === ParagraphValidationErrorCode.ERR_04) ? 2 : 5;
  const scoreAo3 = activeFlags.some(f => f.type === 'HISTORY_DUMP' || f.type === 'AO2_AO3_SYMBIOSIS_MISSING' || f.type === 'MIMETIC_FALLACY') ? 3 : 5;
  const scoreAo4 = errors.some(e => e.code === ParagraphValidationErrorCode.ERR_03) || activeFlags.some(f => f.type === 'HISTORY_SANDWICH') ? 3 : 5;
  
  const scoreOverall = Math.round((scoreAo1 + scoreAo2 + scoreAo3 + scoreAo4) / 4);

  const scores: StructuralScores = {
    ao1: scoreAo1,
    ao2: scoreAo2,
    ao3: scoreAo3,
    ao4: scoreAo4,
    overall: scoreOverall
  };

  // ---------------------------------------------------------------------------
  // 4. Feedback Generation
  // ---------------------------------------------------------------------------
  const feedbackParts: string[] = [];
  const isValid = errors.length === 0;

  if (isValid) {
    feedbackParts.push('Excellent comparative paragraph structure! You have successfully established a comparative umbrella sentence, integrated analysis for both texts, and woven them together using a strong comparative transition.');
  } else {
    feedbackParts.push('Your paragraph draft has structural issues that prevent it from achieving Level 5. Please review the errors flagged.');
  }

  if (errors.some(e => e.code === ParagraphValidationErrorCode.ERR_01)) {
    feedbackParts.push('Pedagogical Tip (AO1): Ensure your opening sentence functions as a comparative thesis (Umbrella) with abstract nominalizations and active verbs.');
  }
  if (activeFlags.some(f => f.type === 'HISTORY_DUMP')) {
    feedbackParts.push('Pedagogical Tip (AO3): Introduce historical context (AO3) as an pressure acting on narrative form rather than dumping facts/dates at the start of a sentence.');
  }
  if (activeFlags.some(f => f.type === 'HISTORY_SANDWICH')) {
    feedbackParts.push('Pedagogical Tip (AO4): Avoid sequential blocking (analyzing Dickens then McEwan separately). Weave them together continuously.');
  }
  if (activeFlags.some(f => f.type === 'MIMETIC_FALLACY')) {
    feedbackParts.push('Pedagogical Tip (AO2): Avoid treating the novels as passive mirrors of reality. Analyze how their specific narrative form and devices construct meaning.');
  }
  if (activeFlags.some(f => f.type === 'AO2_AO3_SYMBIOSIS_MISSING')) {
    feedbackParts.push('Pedagogical Tip (AO2/AO3): Strive to integrate literary methods (AO2) and context (AO3) together within a 15-word token distance for Level 5 symbiosis.');
  }

  return {
    isValid,
    errors,
    activeFlags,
    structuralScores: scores,
    feedback: feedbackParts.join(' ')
  };
}
