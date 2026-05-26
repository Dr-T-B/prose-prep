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

export function buildEssayPlanScaffold(pairing: ComparativeRoutePlanPairing): string {
  const lines: string[] = [];
  lines.push("# Essay plan — Component 2: Prose");
  lines.push("");

  lines.push("## 1. Thesis / argument direction");
  lines.push(hasText(pairing.thesis) ? pairing.thesis!.trim() : "_Draft the thesis you will defend across all three paragraphs._");
  lines.push("");

  lines.push("## 2. Comparative route");
  lines.push(hasText(pairing.axis) ? pairing.axis!.trim() : "_State the comparative axis you are arguing along._");
  lines.push("");

  lines.push("## 3. Paragraph 1 — AO2 method angle");
  lines.push(hasText(pairing.ao2) ? pairing.ao2!.trim() : "_Anchor this paragraph in a close-method reading (form, language, structure)._");
  lines.push("");

  lines.push("## 4. Paragraph 2 — AO3 contextual angle");
  lines.push(hasText(pairing.ao3) ? pairing.ao3!.trim() : "_Integrate the relevant context as a pressure on meaning, not as background._");
  lines.push("");

  lines.push("## 5. Paragraph 3 — AO4 comparative angle");
  lines.push(hasText(pairing.ao4) ? pairing.ao4!.trim() : "_Drive the comparison forward — convergence, divergence, or escalation._");
  lines.push("");

  const cues: string[] = [];
  if (hasText(pairing.character)) cues.push(`- Character: ${pairing.character!.trim()}`);
  if (hasText(pairing.narrative)) cues.push(`- Narrative: ${pairing.narrative!.trim()}`);
  if (hasText(pairing.structure)) cues.push(`- Structure: ${pairing.structure!.trim()}`);
  if (cues.length > 0) {
    lines.push("## 6. Structural / narrative cue");
    lines.push(...cues);
    lines.push("");
  }

  if (hasText(pairing.exam_fit)) {
    lines.push("## 7. Exam-fit reminder");
    lines.push(pairing.exam_fit!.trim());
    lines.push("");
  }

  lines.push("## Final checklist");
  lines.push("- AO1: maintain argument");
  lines.push("- AO2: analyse method");
  lines.push("- AO3: integrate context");
  lines.push("- AO4: compare throughout");

  return lines.join("\n");
}
