export type Ao1Priority = "CORE" | "HIGH" | "MEDIUM";

export interface Ao1ConceptRoute {
  id: string;
  priority: Ao1Priority;
  themeFocus: string;
  likelyExamStems: string;
  coreAo1Argument: string;
  hardTimesConceptualRoute: string;
  atonementConceptualRoute: string;
  comparativeHingeJudgement: string;
  thesisSentenceStarter: string;
}
