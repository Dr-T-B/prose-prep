import { annotatedEssayPracticePack } from "@/data/annotatedEssayPracticePack";

export const completeAnnotatedEssayFixture = {
  pack: annotatedEssayPracticePack,
  essay: annotatedEssayPracticePack.annotated_essays.find(
    (essay) => essay.id === "essay_children_roles_level5_20260524",
  )!,
  question: annotatedEssayPracticePack.essay_questions.find(
    (question) => question.id === "eq_ht_at_children_roles_20260524",
  )!,
  paragraphs: annotatedEssayPracticePack.essay_paragraphs.filter(
    (paragraph) => paragraph.essay_id === "essay_children_roles_level5_20260524",
  ),
  annotations: annotatedEssayPracticePack.ao_annotations.filter(
    (annotation) => annotation.essay_id === "essay_children_roles_level5_20260524",
  ),
};

