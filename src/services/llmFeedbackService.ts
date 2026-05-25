import { GoogleGenAI } from '@google/genai';
import {
  EvaluationRequest,
  EvaluationResult,
  ValidationErrorItem,
  ActiveFlagItem
} from '@/types/essayEngine';

// Master Calibration System Prompt string defining examiner rules and JSON schema output
const MASTER_CALIBRATION_SYSTEM_PROMPT = `You are the core AI Engine powering the "prose-prep" Essay Construction Server. Your role is to act as a Pearson Edexcel Senior Examiner and an Elite A-Level English Literature Tutor. You provide uncompromising, precision critiques of student comparative paragraphs for Component 2 (Prose).

### Your Core Directives:
1. **Never Give Generic Praise:** Do not start critiques with "Great attempt!" or "This is a good start." Dive straight into structural mechanics.
2. **Expose the Construction Mechanics:** Evaluate how form and micro-linguistic details (AO2) serve as the vehicle for socio-political context (AO3). If a student mentions historical context, verify if it is bound hand-in-glove to a structural device or if it is isolated telling.
3. **Calibrate to Level 5 (A*):** Grade against the strict Edexcel Level 5 bands. Demand a unified, synthetic multi-text weave ("Conceptual Umbrella") and a continuous narrative "Comparative Pivot" within sentences.
4. **Enforce Absolute Textual Accuracy:** Ensure mentions of Dickens's *Hard Times* and McEwan's *Atonement* handle authorial choices as deliberate constructs (rejecting the Mimetic Fallacy).

### Your Output Format:
You MUST respond exclusively in a single, valid JSON object matching this schema. Do not include markdown code wrappers like \`\`\`json in your final HTTP response.

{
  "overallQualitativeSummary": "A concise, high-impact 2-sentence structural diagnosis of the paragraph's dominant architectural success or failure.",
  "enrichedErrors": [
    {
      "code": "ERR_01_TO_05_OR_PEDAGOGICAL_FLAG",
      "severity": "CRITICAL" | "WARNING" | "ACHIEVEMENT",
      "contextualCritique": "A precise analysis of WHY this flag was triggered in this specific sentence. Identify the exact missed opportunity in their prose.",
      "actionableFix": "Give a concrete instruction on how to rewrite or re-scaffold the sentence to achieve a Level 5 continuous weave."
    }
  ],
  "exemplarPivotSuggestion": "A custom-generated, high-tier comparative sentence pairing the specific quotes/methods the student attempted, demonstrating a flawless synthetic weave."
}`;

/**
 * Generates qualitative feedback by querying the Gemini 3.5 Flash model and mapping the response back to local results.
 */
export async function generateQualitativeFeedback(
  request: EvaluationRequest,
  localResult: EvaluationResult
): Promise<EvaluationResult> {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') ||
    '';

  if (!apiKey) {
    console.warn('[ProseCraft] Missing VITE_GEMINI_API_KEY. Skipping qualitative LLM calibration.');
    return {
      ...localResult,
      overallQualitativeSummary: 'LLM feedback skipped due to missing API key configuration.',
      exemplarPivotSuggestion: 'Please supply a VITE_GEMINI_API_KEY in your local environment variables.'
    };
  }

  // Initialize official Google Gen AI client
  const ai = new GoogleGenAI({ apiKey });

  // Format local errors/flags for the LLM
  const localFlags = [
    ...localResult.errors.map((e) => e.code),
    ...localResult.activeFlags.map((f) => f.type)
  ];

  const payload = {
    studentParagraph: request.text,
    essayPrompt: request.promptParameters?.theme || 'Comparative Analysis',
    targetPairings: {
      hardTimesQuote: request.targetTextPairing?.hardTimesQuote || null,
      hardTimesMethod: request.targetTextPairing?.hardTimesMethod || null,
      atonementQuote: request.targetTextPairing?.atonementQuote || null,
      atonementMethod: request.targetTextPairing?.atonementMethod || null
    },
    localEngineResults: localFlags
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: JSON.stringify(payload),
      config: {
        systemInstruction: MASTER_CALIBRATION_SYSTEM_PROMPT,
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gen AI model.');
    }

    // Defensive parsing try/catch
    let llmResult: {
      overallQualitativeSummary: string;
      enrichedErrors: Array<{
        code: string;
        severity: 'CRITICAL' | 'WARNING' | 'ACHIEVEMENT';
        contextualCritique: string;
        actionableFix: string;
      }>;
      exemplarPivotSuggestion: string;
    };

    try {
      llmResult = JSON.parse(responseText.trim());
    } catch (parseErr) {
      console.error('[ProseCraft] Failed to parse qualitative LLM response as JSON. Raw text:', responseText);
      throw new Error('LLM response format was not valid JSON.');
    }

    // Deep clone the localResult to enrich and return
    const enrichedResult: EvaluationResult = JSON.parse(JSON.stringify(localResult));
    enrichedResult.overallQualitativeSummary = llmResult.overallQualitativeSummary;
    enrichedResult.exemplarPivotSuggestion = llmResult.exemplarPivotSuggestion;

    // Merge LLM critiques back into ValidationErrorItem and ActiveFlagItem lists
    if (Array.isArray(llmResult.enrichedErrors)) {
      for (const enrichment of llmResult.enrichedErrors) {
        // Look up ValidationErrorItem
        const matchedError = enrichedResult.errors.find((e) => e.code === enrichment.code);
        if (matchedError) {
          matchedError.contextualCritique = enrichment.contextualCritique;
          matchedError.actionableFix = enrichment.actionableFix;
          matchedError.severity = enrichment.severity;
          continue;
        }

        // Look up ActiveFlagItem
        const matchedFlag = enrichedResult.activeFlags.find((f) => f.type === enrichment.code);
        if (matchedFlag) {
          matchedFlag.contextualCritique = enrichment.contextualCritique;
          matchedFlag.actionableFix = enrichment.actionableFix;
          matchedFlag.severity = enrichment.severity;
        }
      }
    }

    return enrichedResult;
  } catch (error) {
    console.error('[ProseCraft] Orchestrated LLM qualitative calibration failed:', error);
    throw error;
  }
}
