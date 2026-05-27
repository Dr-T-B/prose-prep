import type { Ao1ConceptRoute } from "@/types/ao1ConceptRoutes";
import type { Ao3ContextRoute } from "@/types/ao3ContextRoutes";
import type { Ao4ComparativeRoute } from "@/types/ao4ComparativeRoutes";
import type { Ao2MethodRoute } from "@/types/ao2MethodRoutes";

export type AoRouteCombinationPriority = "CORE" | "HIGH" | "MEDIUM";

export interface AoRouteCombination {
  id: string;
  theme: string;
  questionTriggers: string[];
  priority: AoRouteCombinationPriority;
  ao1RouteId?: string;
  ao2RouteIds: string[];
  ao3RouteIds: string[];
  ao4RouteIds: string[];
  recommendedParagraphPattern: string[];
  studentUseCase: string;
  teacherNote?: string;
}

export interface ResolvedAoRouteCombination extends AoRouteCombination {
  ao1Route?: Ao1ConceptRoute;
  ao2Routes: Ao2MethodRoute[];
  ao3Routes: Ao3ContextRoute[];
  ao4Routes: Ao4ComparativeRoute[];
  unresolvedAo1RouteId?: string;
  unresolvedAo2RouteIds: string[];
  unresolvedAo3RouteIds: string[];
  unresolvedAo4RouteIds: string[];
}
