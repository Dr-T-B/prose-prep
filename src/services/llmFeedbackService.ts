import {
  EvaluationRequest,
  EvaluationResult
} from '@/types/essayEngine';

// Client-side qualitative LLM calibration is disabled in this build: the
// previous implementation called a hosted LLM directly from the browser,
// which would have shipped a provider key into the client bundle. Re-enable
// behind the server-side `generate-model-essay` edge function before
// reintroducing.
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
