import { aoRouteCombinations } from "@/data/aoRouteCombinations";
import { getAo1ConceptRouteById } from "@/lib/ao1ConceptRoutes";
import { getAo2MethodRouteById } from "@/lib/ao2MethodRoutes";
import { getAo3ContextRouteById } from "@/lib/ao3ContextRoutes";
import { getAo4ComparativeRouteById } from "@/lib/ao4ComparativeRoutes";
import type {
  AoRouteCombination,
  AoRouteCombinationPriority,
  ResolvedAoRouteCombination,
} from "@/types/aoRouteCombinations";

const PRIORITY_RANK: Record<AoRouteCombinationPriority, number> = {
  CORE: 0,
  HIGH: 1,
  MEDIUM: 2,
};

const SEARCH_ALIASES: Record<string, string[]> = {
  author: ["authorship", "narrative", "writing"],
  authorship: ["author", "narrative", "writing"],
  children: ["childhood", "child"],
  child: ["childhood", "children"],
  facts: ["fact", "education"],
  female: ["women", "gender"],
  gender: ["women", "female"],
  guilt: ["responsibility", "repair", "atonement"],
  industrialism: ["industry", "war", "human cost"],
  marriage: ["relationships", "love"],
  memory: ["authorship", "narrative", "remembering"],
  place: ["setting", "atmosphere"],
  setting: ["place", "atmosphere"],
  truth: ["deception", "storytelling", "fiction"],
  war: ["industrialism", "violence", "human cost"],
  women: ["gender", "female"],
};

function normalise(value: string): string {
  return value.toLowerCase().replace(/[_/,-]+/g, " ").replace(/\s+/g, " ").trim();
}

function expandTerms(query: string): string[] {
  const terms = normalise(query).split(" ").filter(Boolean);
  return Array.from(new Set(terms.flatMap((term) => [term, ...(SEARCH_ALIASES[term] ?? [])])));
}

function sortByPriority(combinations: AoRouteCombination[]): AoRouteCombination[] {
  return [...combinations].sort((a, b) => {
    const priorityDelta = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (priorityDelta !== 0) return priorityDelta;
    return a.id.localeCompare(b.id);
  });
}

function scoreCombination(combination: AoRouteCombination, query: string): number {
  const normalisedQuery = normalise(query);
  if (!normalisedQuery) return 1;

  const terms = expandTerms(normalisedQuery);
  const searchableFields = [
    { value: combination.theme, weight: 80 },
    { value: combination.questionTriggers.join(" "), weight: 50 },
    { value: combination.studentUseCase, weight: 24 },
    { value: combination.recommendedParagraphPattern.join(" "), weight: 16 },
    { value: combination.teacherNote ?? "", weight: 8 },
  ];

  return searchableFields.reduce((score, field) => {
    const value = normalise(field.value);
    if (!value) return score;
    let nextScore = score;
    if (value === normalisedQuery) nextScore += field.weight * 3;
    if (value.includes(normalisedQuery)) nextScore += field.weight * 2;
    terms.forEach((term) => {
      if (value.split(" ").includes(term)) nextScore += field.weight;
      else if (value.includes(term)) nextScore += Math.max(1, Math.floor(field.weight / 2));
    });
    return nextScore;
  }, 0);
}

export function getAllAoRouteCombinations(): AoRouteCombination[] {
  return sortByPriority(aoRouteCombinations);
}

export function getAoRouteCombinationById(id: string): AoRouteCombination | undefined {
  return aoRouteCombinations.find((combination) => combination.id === id);
}

export function searchAoRouteCombinations(query: string): AoRouteCombination[] {
  const normalisedQuery = normalise(query);
  if (!normalisedQuery) return getAllAoRouteCombinations();

  return aoRouteCombinations
    .map((combination) => ({ combination, score: scoreCombination(combination, normalisedQuery) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      const scoreDelta = b.score - a.score;
      if (scoreDelta !== 0) return scoreDelta;
      const priorityDelta = PRIORITY_RANK[a.combination.priority] - PRIORITY_RANK[b.combination.priority];
      if (priorityDelta !== 0) return priorityDelta;
      return a.combination.id.localeCompare(b.combination.id);
    })
    .map(({ combination }) => combination);
}

export function getAoRouteCombinationsForTheme(theme: string): AoRouteCombination[] {
  return searchAoRouteCombinations(theme);
}

export function getCoreAoRouteCombinations(): AoRouteCombination[] {
  return getAllAoRouteCombinations().filter((combination) => combination.priority === "CORE");
}

export function getResolvedAoRouteCombination(id: string): ResolvedAoRouteCombination | undefined {
  const combination = getAoRouteCombinationById(id);
  if (!combination) return undefined;

  const ao1Route = combination.ao1RouteId ? getAo1ConceptRouteById(combination.ao1RouteId) : undefined;
  const ao2Routes = combination.ao2RouteIds
    .map((routeId) => getAo2MethodRouteById(routeId))
    .filter((route): route is NonNullable<typeof route> => Boolean(route));
  const ao3Routes = combination.ao3RouteIds
    .map((routeId) => getAo3ContextRouteById(routeId))
    .filter((route): route is NonNullable<typeof route> => Boolean(route));
  const ao4Routes = combination.ao4RouteIds
    .map((routeId) => getAo4ComparativeRouteById(routeId))
    .filter((route): route is NonNullable<typeof route> => Boolean(route));

  return {
    ...combination,
    ao1Route,
    ao2Routes,
    ao3Routes,
    ao4Routes,
    unresolvedAo1RouteId: combination.ao1RouteId && !ao1Route ? combination.ao1RouteId : undefined,
    unresolvedAo2RouteIds: combination.ao2RouteIds.filter(
      (routeId) => !ao2Routes.some((route) => route.id === routeId),
    ),
    unresolvedAo3RouteIds: combination.ao3RouteIds.filter(
      (routeId) => !ao3Routes.some((route) => route.id === routeId),
    ),
    unresolvedAo4RouteIds: combination.ao4RouteIds.filter(
      (routeId) => !ao4Routes.some((route) => route.id === routeId),
    ),
  };
}
