import { ao4ComparativeRoutes } from "@/data/ao4ComparativeRoutes";
import type { Ao4ComparativeRoute, Ao4Priority } from "@/types/ao4ComparativeRoutes";

const PRIORITY_RANK: Record<Ao4Priority, number> = {
  "Tier 1": 0,
  "Tier 2": 1,
};

const SEARCH_FIELDS: Array<keyof Ao4ComparativeRoute> = [
  "themeExamTrigger",
  "comparativeThesis",
  "hardTimesComparisonPoint",
  "atonementComparisonPoint",
  "similarity",
  "difference",
  "conceptualBridge",
  "bestEvidenceZones",
  "paragraphRoute",
  "examSentenceStem",
];

const SEARCH_FIELD_WEIGHTS: Record<(typeof SEARCH_FIELDS)[number], number> = {
  themeExamTrigger: 80,
  comparativeThesis: 32,
  hardTimesComparisonPoint: 18,
  atonementComparisonPoint: 18,
  similarity: 18,
  difference: 18,
  conceptualBridge: 24,
  bestEvidenceZones: 14,
  paragraphRoute: 12,
  examSentenceStem: 18,
};

const SEARCH_ALIASES: Record<string, string[]> = {
  author: ["authorship", "storytelling", "narrative"],
  authorship: ["author", "storytelling", "narrative"],
  child: ["childhood", "children"],
  children: ["childhood", "child"],
  facts: ["fact", "education", "formation"],
  gender: ["women", "female"],
  industrialism: ["industry", "war", "factory"],
  justice: ["injustice", "legal"],
  marriage: ["relationships", "love"],
  memory: ["hindsight", "retrospective"],
  narrative: ["perspective", "authorship", "storytelling"],
  perspective: ["narrative", "focalisation"],
  setting: ["place", "coketown", "tallis"],
  truth: ["falsehood", "storytelling"],
  war: ["industrialism", "military", "violence"],
  women: ["gender", "female"],
};

function normalise(value: string): string {
  return value.toLowerCase().replace(/[_/,-]+/g, " ").replace(/\s+/g, " ").trim();
}

function expandSearchTerms(query: string): string[] {
  const terms = normalise(query).split(" ").filter(Boolean);
  return Array.from(new Set(terms.flatMap((term) => [term, ...(SEARCH_ALIASES[term] ?? [])])));
}

function sortByPriority(routes: Ao4ComparativeRoute[]): Ao4ComparativeRoute[] {
  return [...routes].sort((a, b) => {
    const priorityDelta = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (priorityDelta !== 0) return priorityDelta;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });
}

function getSearchScore(route: Ao4ComparativeRoute, query: string): number {
  const normalisedQuery = normalise(query);
  if (!normalisedQuery) return 1;

  const terms = expandSearchTerms(normalisedQuery);
  let score = 0;

  SEARCH_FIELDS.forEach((field) => {
    const value = normalise(route[field]);
    if (!value) return;
    if (value === normalisedQuery) score += SEARCH_FIELD_WEIGHTS[field] * 3;
    if (value.includes(normalisedQuery)) score += SEARCH_FIELD_WEIGHTS[field] * 2;
    terms.forEach((term) => {
      if (value.split(" ").includes(term)) score += SEARCH_FIELD_WEIGHTS[field];
      else if (value.includes(term)) score += Math.max(1, Math.floor(SEARCH_FIELD_WEIGHTS[field] / 2));
    });
  });

  return score;
}

export function getAllAo4ComparativeRoutes(): Ao4ComparativeRoute[] {
  return sortByPriority(ao4ComparativeRoutes);
}

export function getAo4ComparativeRouteById(id: string): Ao4ComparativeRoute | undefined {
  return ao4ComparativeRoutes.find((route) => route.id === id);
}

export function searchAo4ComparativeRoutes(query: string): Ao4ComparativeRoute[] {
  const normalisedQuery = normalise(query);
  if (!normalisedQuery) return getAllAo4ComparativeRoutes();

  return ao4ComparativeRoutes
    .map((route) => ({ route, score: getSearchScore(route, normalisedQuery) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      const scoreDelta = b.score - a.score;
      if (scoreDelta !== 0) return scoreDelta;
      const priorityDelta = PRIORITY_RANK[a.route.priority] - PRIORITY_RANK[b.route.priority];
      if (priorityDelta !== 0) return priorityDelta;
      return a.route.id.localeCompare(b.route.id, undefined, { numeric: true });
    })
    .map(({ route }) => route);
}

export function getAo4RoutesForTheme(theme: string): Ao4ComparativeRoute[] {
  return searchAo4ComparativeRoutes(theme);
}

export function getTierOneAo4Routes(): Ao4ComparativeRoute[] {
  return getAllAo4ComparativeRoutes().filter((route) => route.priority === "Tier 1");
}

export function getCoreAo4Routes(): Ao4ComparativeRoute[] {
  return getTierOneAo4Routes();
}
