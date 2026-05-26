export type ComparativeRoutePlanPairing = {
  axis?: string | null;
  thesis?: string | null;
  ao2?: string | null;
  ao3?: string | null;
  ao4?: string | null;
  character?: string | null;
  narrative?: string | null;
  structure?: string | null;
  exam_fit?: string | null;
};

const hasText = (value?: string | null) => !!value?.trim();

const fieldOrPrompt = (value: string | null | undefined, prompt: string) =>
  hasText(value) ? value!.trim() : prompt;

export function buildEssayPlanScaffold(pairing: ComparativeRoutePlanPairing): string {
  const lines: string[] = [];

  lines.push("# Component 2 Prose essay route plan");
  lines.push("Hard Times × Atonement");
  lines.push("Pearson Edexcel A-Level English Literature — AO1, AO2, AO3, AO4");
  lines.push("");

  lines.push("## Route heading");
  lines.push(fieldOrPrompt(pairing.axis, "Comparative axis: define the line of comparison linking both novels."));
  lines.push("");

  lines.push("## Thesis");
  lines.push(fieldOrPrompt(pairing.thesis, "Write one arguable thesis that answers the question and can be sustained across the whole essay."));
  lines.push("");

  lines.push("## Paragraph 1 — opening comparative claim");
  lines.push("AO1: Make a direct comparative claim about how both writers present the question focus.");
  lines.push("Use this route material: " + fieldOrPrompt(pairing.axis, "state the shared or contrasting idea that will control the paragraph."));
  lines.push("");

  lines.push("## Paragraph 2 — AO2 method focus");
  lines.push(fieldOrPrompt(pairing.ao2, "Select precise methods from both texts: narrative voice, form, structure, imagery, diction, dialogue, or focalisation."));
  lines.push("Planning prompt: name the method, quote or reference briefly, then explain how meaning is made.");
  lines.push("");

  lines.push("## Paragraph 3 — AO3 context focus");
  lines.push(fieldOrPrompt(pairing.ao3, "Integrate context as pressure on interpretation: Victorian social systems, education, class, gender, war, modernity, or inter-war values."));
  lines.push("Planning prompt: connect context to the writer's construction of meaning, not as detached background.");
  lines.push("");

  lines.push("## Paragraph 4 — AO4 comparative link");
  lines.push(fieldOrPrompt(pairing.ao4, "Make the comparison explicit: convergence, divergence, reversal, escalation, or contrast between Dickens and McEwan."));
  lines.push("Planning prompt: keep Hard Times and Atonement in the same sentence wherever possible.");
  lines.push("");

  lines.push("## Character / narrative / structure prompts");
  lines.push("- Character: " + fieldOrPrompt(pairing.character, "identify the character pairing or contrast that best supports the route."));
  lines.push("- Narrative: " + fieldOrPrompt(pairing.narrative, "explain how narration, perspective, or voice steers the reader's judgement."));
  lines.push("- Structure: " + fieldOrPrompt(pairing.structure, "explain where this route sits in each novel's wider pattern of development."));
  lines.push("");

  lines.push("## Exam fit / timed-writing reminder");
  lines.push(fieldOrPrompt(pairing.exam_fit, "Use this route only if it answers the exact wording of the question; adapt the thesis before writing."));
  lines.push("Timed plan: introduction, four comparative paragraphs, concise conclusion. Keep comparison active throughout.");
  lines.push("");

  lines.push("## Brief conclusion direction");
  lines.push("Return to the thesis and state the larger comparative significance of the route across both novels.");
  lines.push("");

  lines.push("## Final AO check");
  lines.push("- AO1: coherent argument and accurate textual references");
  lines.push("- AO2: close analysis of writerly method");
  lines.push("- AO3: context integrated into interpretation");
  lines.push("- AO4: sustained comparison between Hard Times and Atonement");

  return lines.join("\n");
}
