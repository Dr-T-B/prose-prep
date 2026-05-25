import { useState, useCallback } from "react";
import { evaluateParagraph } from "@/services/essayValidationEngine";
import { generateQualitativeFeedback } from "@/services/llmFeedbackService";
import {
  EvaluationResult,
  TargetTextPairing,
  PromptParameters,
} from "@/types/essayEngine";

export function useParagraphValidation() {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [targetTextPairing, setTargetTextPairing] = useState<TargetTextPairing>({
    hardTimesQuote: null,
    atonementQuote: null,
    hardTimesMethod: null,
    atonementMethod: null,
    themeLabel: null,
  });
  const [promptParameters, setPromptParameters] = useState<PromptParameters>({
    theme: null,
    targetGrade: "A*",
  });

  const runAudit = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Run local validation first synchronously
      const localResult = evaluateParagraph({
        text,
        targetTextPairing,
        promptParameters,
      });

      // Update intermediate result state so local marks render immediately
      setResult(localResult);

      // Simulate premium deep-analysis delay (600ms) to enhance UI UX
      await new Promise((resolve) => setTimeout(resolve, 600));

      // 2. Call generative LLM feedback service to enrich the results
      const enrichedResult = await generateQualitativeFeedback(
        {
          text,
          targetTextPairing,
          promptParameters,
        },
        localResult
      );

      setResult(enrichedResult);
    } catch (err) {
      console.error("[ProseCraft] Audit execution error:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("An unexpected validation or qualitative feedback error occurred.")
      );
    } finally {
      setLoading(false);
    }
  }, [text, targetTextPairing, promptParameters]);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    text,
    setText,
    loading,
    result,
    error,
    targetTextPairing,
    setTargetTextPairing,
    promptParameters,
    setPromptParameters,
    runAudit,
    clearResult,
  };
}
