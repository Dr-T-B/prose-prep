export type Ao2Priority = "CORE" | "HIGH" | "MEDIUM";

export interface Ao2MethodRoute {
  id: string;
  ao2Route: string;
  hardTimesMethod: string;
  hardTimesEvidenceZone: string;
  hardTimesAo2Effect: string;
  atonementMethod: string;
  atonementEvidenceZone: string;
  atonementAo2Effect: string;
  comparativeAo4Hinge: string;
  bestThemes: string;
  examSentenceStem: string;
  priority: Ao2Priority;
}
