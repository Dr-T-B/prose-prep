export type Ao4Priority = "Tier 1" | "Tier 2";

export interface Ao4ComparativeRoute {
  id: string;
  themeExamTrigger: string;
  comparativeThesis: string;
  hardTimesComparisonPoint: string;
  atonementComparisonPoint: string;
  similarity: string;
  difference: string;
  conceptualBridge: string;
  bestEvidenceZones: string;
  paragraphRoute: string;
  examSentenceStem: string;
  priority: Ao4Priority;
}
