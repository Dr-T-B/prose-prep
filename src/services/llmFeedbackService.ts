import {
  EvaluationRequest,
  EvaluationResult
} from '@/types/essayEngine';

// Client-side qualitative LLM calibration is disabled in this build: the
// previous implementation read VITE_GEMINI_API_KEY at the client and called
// Gemini directly, shipping the key into the browser bundle. Re-enable
// behind a server-side proxy before reintroducing.
export async function generateQualitativeFeedback(
  _request: EvaluationRequest,
  localResult: EvaluationResult
): Promise<EvaluationResult> {
  return {
    ...localResult,
    overallQualitativeSummary:
      localResult.overallQualitativeSummary ??
      'Qualitative LLM calibration is disabled in this build.',
    exemplarPivotSuggestion: localResult.exemplarPivotSuggestion ?? ''
  };
}
