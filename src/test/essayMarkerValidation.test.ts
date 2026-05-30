import { describe, expect, it } from "vitest";

import { validateInput, validateShape } from "../../supabase/functions/mark-component2-essay/validation";

const answer = Array.from(
  { length: 42 },
  () => "Dickens and McEwan compare childhood through narrative method, contextual pressure and changing social expectations in ways that shape the reader's response.",
).join(" ");

function safeResult() {
  return {
    examWarning: "Formative guidance only: use this as practice feedback, not an official assessment judgement.",
    summary: "The answer keeps a clear comparative focus and uses context appropriately.",
    aoFeedback: {
      AO1: { diagnosticLabel: "argument clarity", strength: "Clear focus.", nextStep: "Sharpen the claim." },
      AO2: { diagnosticLabel: "method analysis", strength: "Useful method focus.", nextStep: "Zoom in further." },
      AO3: { diagnosticLabel: "context integration", strength: "Context is relevant.", nextStep: "Connect context to method." },
      AO4: { diagnosticLabel: "comparison", strength: "Comparison is sustained.", nextStep: "Make transitions more explicit." },
    },
    strengths: ["Clear focus", "Relevant method", "Useful comparison"],
    priorityTargets: ["Sharper thesis", "Closer method", "More context"],
    quoteMethodDiagnostic: [],
    revisionPrompts: ["What is the comparison?", "Where is context integrated?", "Which method matters most?"],
    nextStep: "Revise one paragraph with a clearer comparative hinge.",
  };
}

describe("essay marker validation", () => {
  it("accepts an existing question id", () => {
    const result = validateInput({
      mode: "full_essay",
      question_id: "q-1",
      essay_text: answer,
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toMatchObject({ question_id: "q-1" });
  });

  it("accepts a submitted custom question stem", () => {
    const question = "Compare how Dickens and McEwan present guilt in Hard Times and Atonement. You must relate your discussion to relevant contextual factors.";
    const result = validateInput({
      mode: "full_essay",
      question_stem: question,
      essay_text: answer,
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toMatchObject({ question_stem: question });
  });

  it("requires exactly one question reference for answer feedback", () => {
    expect(validateInput({ mode: "full_essay", essay_text: answer }).ok).toBe(false);
    expect(validateInput({ mode: "full_essay", question_id: "q-1", question_stem: "Question", essay_text: answer }).ok).toBe(false);
  });

  it("rejects unsafe custom question wording", () => {
    const excludedAo = ["AO", "5"].join("");
    expect(validateInput({ mode: "full_essay", question_stem: `Compare ${excludedAo}`, essay_text: answer }).ok).toBe(false);
    expect(validateInput({ mode: "full_essay", question_stem: "Please generate a model answer about childhood", essay_text: answer }).ok).toBe(false);
  });

  it("keeps shaped feedback formative and AO1-AO4 only", () => {
    expect(validateShape(safeResult()).ok).toBe(true);

    const unsafe = safeResult();
    unsafe.summary = "This would receive a high score.";
    expect(validateShape(unsafe).ok).toBe(false);
  });
});
