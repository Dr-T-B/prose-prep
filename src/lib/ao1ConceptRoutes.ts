import { ao1ConceptRoutes } from "@/data/ao1ConceptRoutes";
import type { Ao1ConceptRoute, Ao1Priority } from "@/types/ao1ConceptRoutes";

const PRIORITY_RANK: Record<Ao1Priority, number> = {
  CORE: 0,
  HIGH: 1,
  MEDIUM: 2,
};

const SEARCH_FIELDS: Array<keyof Ao1ConceptRoute> = [
  "themeFocus",
  "likelyExamStems",
  "coreAo1Argument",
  "hardTimesConceptualRoute",
  "atonementConceptualRoute",
  "comparativeHingeJudgement",
  "thesisSentenceStarter",
];

const SEARCH_FIELD_WEIGHTS: Record<(typeof SEARCH_FIELDS)[number], number> = {
  themeFocus: 90,
  likelyExamStems: 42,
  coreAo1Argument: 28,
  hardTimesConceptualRoute: 18,
  atonementConceptualRoute: 18,
  comparativeHingeJudgement: 24,
  thesisSentenceStarter: 22,
};

const SEARCH_ALIASES: Record<string, string[]> = {
  author: ["authorship", "narrative", "storytelling"],
  authorship: ["author", "narrative", "storytelling"],
  child: ["childhood", "children"],
  children: ["childhood", "child"],
  endings: ["ending", "closure", "repair"],
  facts: ["fact", "education", "imagination"],
  female: ["women", "gender"],
  gender: ["women", "female"],
  industrialism: ["industry", "systems", "human cost", "war"],
  narrative: ["storytelling", "authorship", "fiction"],
  perception: ["misreading", "judgement", "misunderstanding"],
  power: ["authority", "control", "institutions"],
  setting: ["place", "homes", "city", "countryside"],
  society: ["social", "systems", "reform"],
  truth: ["deception", "certainty", "lies"],
  war: ["human cost", "systems", "industrialism"],
  women: ["gender", "female"],
};

function normalise(value: string): string {
  return value.toLowerCase().replace(/[_/,-]+/g, " ").replace(/\s+/g, " ").trim();
}

function expandSearchTerms(query: string): string[] {
  const terms = normalise(query).split(" ").filter(Boolean);
  return Array.from(new Set(terms.flatMap((term) => [term, ...(SEARCH_ALIASES[term] ?? [])])));
}

function sortByPriority(routes: Ao1ConceptRoute[]): Ao1ConceptRoute[] {
  return [...routes].sort((a, b) => {
    const priorityDelta = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (priorityDelta !== 0) return priorityDelta;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });
}

function getSearchScore(route: Ao1ConceptRoute, query: string): number {
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

export function getAllAo1ConceptRoutes(): Ao1ConceptRoute[] {
  return sortByPriority(ao1ConceptRoutes);
}

export function getAo1ConceptRouteById(id: string): Ao1ConceptRoute | undefined {
  return ao1ConceptRoutes.find((route) => route.id === id);
}

export function searchAo1ConceptRoutes(query: string): Ao1ConceptRoute[] {
  const normalisedQuery = normalise(query);
  if (!normalisedQuery) return getAllAo1ConceptRoutes();

  return ao1ConceptRoutes
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

export function getAo1RoutesForTheme(theme: string): Ao1ConceptRoute[] {
  return searchAo1ConceptRoutes(theme);
}

export function getAo1RoutesForCluster(cluster: string): Ao1ConceptRoute[] {
  return searchAo1ConceptRoutes(cluster);
}
