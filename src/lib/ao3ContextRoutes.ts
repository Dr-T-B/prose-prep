import { ao3ContextRoutes } from "@/data/ao3ContextRoutes";
import type { Ao3ContextRoute, Ao3Priority } from "@/types/ao3ContextRoutes";

const PRIORITY_RANK: Record<Ao3Priority, number> = {
  CORE: 0,
  HIGH: 1,
  MEDIUM: 2,
};

const SEARCH_FIELDS: Array<keyof Ao3ContextRoute> = [
  "themeExamRoute",
  "coreContextClaim",
  "contextualPressure",
  "ao2MethodLink",
  "ao4ComparativeHinge",
  "examReadySentence",
];

const SEARCH_FIELD_WEIGHTS: Record<(typeof SEARCH_FIELDS)[number], number> = {
  themeExamRoute: 80,
  coreContextClaim: 30,
  contextualPressure: 18,
  ao2MethodLink: 14,
  ao4ComparativeHinge: 14,
  examReadySentence: 12,
};

const SEARCH_ALIASES: Record<string, string[]> = {
  gender: ["women", "female"],
  women: ["gender", "female"],
};

function normalise(value: string): string {
  return value.toLowerCase().replace(/[_/,-]+/g, " ").replace(/\s+/g, " ").trim();
}

function expandSearchTerms(query: string): string[] {
  const terms = query.split(" ").filter(Boolean);
  return Array.from(new Set(terms.flatMap((term) => [term, ...(SEARCH_ALIASES[term] ?? [])])));
}

function sortByPriority(routes: Ao3ContextRoute[]): Ao3ContextRoute[] {
  return [...routes].sort((a, b) => {
    const priorityDelta = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (priorityDelta !== 0) return priorityDelta;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });
}

function getSearchScore(route: Ao3ContextRoute, query: string): number {
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

export function getAllAo3ContextRoutes(): Ao3ContextRoute[] {
  return sortByPriority(ao3ContextRoutes);
}

export function getAo3ContextRouteById(id: string): Ao3ContextRoute | undefined {
  return ao3ContextRoutes.find((route) => route.id === id);
}

export function getAo3RoutesByPriority(priority: Ao3Priority): Ao3ContextRoute[] {
  return getAllAo3ContextRoutes().filter((route) => route.priority === priority);
}

export function searchAo3Routes(query: string): Ao3ContextRoute[] {
  const normalisedQuery = normalise(query);
  if (!normalisedQuery) return getAllAo3ContextRoutes();

  return ao3ContextRoutes
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

export function getAo3RoutesForTheme(theme: string): Ao3ContextRoute[] {
  return searchAo3Routes(theme);
}

export function getCoreAo3Routes(): Ao3ContextRoute[] {
  return getAo3RoutesByPriority("CORE");
}
