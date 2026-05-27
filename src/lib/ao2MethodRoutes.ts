import { ao2MethodRoutes } from "@/data/ao2MethodRoutes";
import type { Ao2MethodRoute, Ao2Priority } from "@/types/ao2MethodRoutes";

const PRIORITY_RANK: Record<Ao2Priority, number> = {
  CORE: 0,
  HIGH: 1,
  MEDIUM: 2,
};

const SEARCH_FIELDS: Array<keyof Ao2MethodRoute> = [
  "ao2Route",
  "hardTimesMethod",
  "hardTimesEvidenceZone",
  "hardTimesAo2Effect",
  "atonementMethod",
  "atonementEvidenceZone",
  "atonementAo2Effect",
  "comparativeAo4Hinge",
  "bestThemes",
  "examSentenceStem",
];

const SEARCH_FIELD_WEIGHTS: Record<(typeof SEARCH_FIELDS)[number], number> = {
  ao2Route: 80,
  hardTimesMethod: 24,
  hardTimesEvidenceZone: 14,
  hardTimesAo2Effect: 18,
  atonementMethod: 24,
  atonementEvidenceZone: 14,
  atonementAo2Effect: 18,
  comparativeAo4Hinge: 22,
  bestThemes: 30,
  examSentenceStem: 18,
};

const SEARCH_ALIASES: Record<string, string[]> = {
  author: ["authorship", "writing", "narrative"],
  body: ["bodily", "embodied"],
  child: ["childhood", "children"],
  dialogue: ["speech", "register"],
  endings: ["ending", "closure"],
  focalization: ["focalisation", "perspective"],
  focalisation: ["focalization", "perspective"],
  genre: ["intertextuality", "literary"],
  imagery: ["image", "images", "sensory"],
  institutions: ["institutional", "factory", "bank", "prison", "police"],
  memory: ["hindsight", "retrospection", "repetition"],
  naming: ["labelling", "labels"],
  nature: ["water", "heat", "landscape"],
  perspective: ["focalisation", "viewpoint"],
  reliability: ["reliable", "unreliable", "narrator"],
  repetition: ["patterning", "repeated"],
  setting: ["space", "spatial", "place", "settings"],
  surveillance: ["watching", "seeing"],
  writing: ["documents", "authorship", "textual"],
};

function normalise(value: string): string {
  return value.toLowerCase().replace(/[_/,-]+/g, " ").replace(/\s+/g, " ").trim();
}

function expandSearchTerms(query: string): string[] {
  const terms = normalise(query).split(" ").filter(Boolean);
  return Array.from(new Set(terms.flatMap((term) => [term, ...(SEARCH_ALIASES[term] ?? [])])));
}

function sortByPriority(routes: Ao2MethodRoute[]): Ao2MethodRoute[] {
  return [...routes].sort((a, b) => {
    const priorityDelta = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (priorityDelta !== 0) return priorityDelta;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });
}

function getSearchScore(route: Ao2MethodRoute, query: string): number {
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

export function getAllAo2MethodRoutes(): Ao2MethodRoute[] {
  return sortByPriority(ao2MethodRoutes);
}

export function getAo2MethodRouteById(id: string): Ao2MethodRoute | undefined {
  return ao2MethodRoutes.find((route) => route.id === id);
}

export function searchAo2MethodRoutes(query: string): Ao2MethodRoute[] {
  const normalisedQuery = normalise(query);
  if (!normalisedQuery) return getAllAo2MethodRoutes();

  return ao2MethodRoutes
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

export function getAo2RoutesForTheme(theme: string): Ao2MethodRoute[] {
  return searchAo2MethodRoutes(theme);
}

export function getCoreAo2MethodRoutes(): Ao2MethodRoute[] {
  return getAllAo2MethodRoutes().filter((route) => route.priority === "CORE");
}
