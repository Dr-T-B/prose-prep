import { describe, expect, it } from "vitest";
import { aoRouteCombinations } from "@/data/aoRouteCombinations";
import { getAo1ConceptRouteById } from "@/lib/ao1ConceptRoutes";
import { getAo2MethodRouteById } from "@/lib/ao2MethodRoutes";
import { getAo3ContextRouteById } from "@/lib/ao3ContextRoutes";
import { getAo4ComparativeRouteById } from "@/lib/ao4ComparativeRoutes";
import {
  getAllAoRouteCombinations,
  getAoRouteCombinationById,
  getAoRouteCombinationsForTheme,
  getCoreAoRouteCombinations,
  getResolvedAoRouteCombination,
  searchAoRouteCombinations,
} from "@/lib/aoRouteCombinations";

const VALID_PRIORITIES = new Set(["CORE", "HIGH", "MEDIUM"]);
const REQUIRED_SEARCHES = [
  "childhood",
  "education",
  "class",
  "truth",
  "gender",
  "setting",
  "war",
  "guilt",
  "memory",
  "marriage",
] as const;

describe("AO route combination dataset", () => {
  it("contains no excluded assessment-objective references", () => {
    expect(JSON.stringify(aoRouteCombinations)).not.toMatch(/AO5/i);
  });

  it("uses unique non-empty combination IDs", () => {
    const ids = aoRouteCombinations.map((combination) => combination.id);

    expect(ids.every((id) => id.trim().length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps required student-facing fields populated", () => {
    aoRouteCombinations.forEach((combination) => {
      expect(combination.theme.trim(), `${combination.id}.theme`).not.toBe("");
      expect(VALID_PRIORITIES.has(combination.priority), `${combination.id}.priority`).toBe(true);
      expect(combination.questionTriggers.length, `${combination.id}.questionTriggers`).toBeGreaterThan(0);
      expect(combination.ao3RouteIds.length, `${combination.id}.ao3RouteIds`).toBeGreaterThan(0);
      expect(combination.recommendedParagraphPattern.length, `${combination.id}.recommendedParagraphPattern`).toBeGreaterThan(0);
      expect(combination.studentUseCase.trim(), `${combination.id}.studentUseCase`).not.toBe("");
    });
  });

  it("references source-locked AO1, AO2, AO3 and AO4 local route material", () => {
    aoRouteCombinations.forEach((combination) => {
      if (combination.ao1RouteId) {
        expect(combination.ao1RouteId, `${combination.id}.ao1RouteId`).toMatch(/^AO1-\d{3}$/);
        expect(getAo1ConceptRouteById(combination.ao1RouteId), `${combination.id}.ao1RouteId`).toBeDefined();
      }

      combination.ao2RouteIds.forEach((routeId) => {
        expect(routeId, `${combination.id}.ao2RouteIds`).toMatch(/^AO2-\d{2}$/);
        expect(getAo2MethodRouteById(routeId), `${combination.id}.ao2RouteIds`).toBeDefined();
      });

      combination.ao3RouteIds.forEach((routeId) => {
        expect(getAo3ContextRouteById(routeId), `${combination.id}.ao3RouteIds`).toBeDefined();
      });

      combination.ao4RouteIds.forEach((routeId) => {
        expect(routeId, `${combination.id}.ao4RouteIds`).toMatch(/^AO4-\d{2}$/);
        expect(getAo4ComparativeRouteById(routeId), `${combination.id}.ao4RouteIds`).toBeDefined();
      });
    });
  });
});

describe("AO route combination utilities", () => {
  it("returns combinations with CORE entries first", () => {
    const combinations = getAllAoRouteCombinations();
    const firstHighIndex = combinations.findIndex((combination) => combination.priority === "HIGH");
    const lastCoreIndex = combinations.map((combination) => combination.priority).lastIndexOf("CORE");

    expect(firstHighIndex).toBeGreaterThan(0);
    expect(lastCoreIndex).toBeLessThan(firstHighIndex);
    expect(getCoreAoRouteCombinations().every((combination) => combination.priority === "CORE")).toBe(true);
  });

  it("finds combinations by ID", () => {
    expect(getAoRouteCombinationById("aorc_childhood_formation")?.theme).toBe("Childhood");
  });

  it.each(REQUIRED_SEARCHES)("returns a useful route combination for %s", (query) => {
    const results = searchAoRouteCombinations(query);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].questionTriggers.join(" ").toLowerCase() + results[0].theme.toLowerCase()).toContain(
      query === "setting" ? "setting" : query,
    );
  });

  it("uses the same search behaviour for theme lookup", () => {
    expect(getAoRouteCombinationsForTheme("class")[0]?.id).toBe(searchAoRouteCombinations("class")[0]?.id);
  });

  it("resolves AO3 route objects for a combination", () => {
    const resolved = getResolvedAoRouteCombination("aorc_truth_storytelling");

    expect(resolved).toBeDefined();
    expect(resolved!.ao3Routes.length).toBe(resolved!.ao3RouteIds.length);
    expect(resolved!.ao3Routes[0]).toHaveProperty("coreContextClaim");
    expect(resolved!.unresolvedAo3RouteIds).toEqual([]);
  });

  it("resolves source-locked AO1 concept route objects for a combination", () => {
    const resolved = getResolvedAoRouteCombination("aorc_truth_storytelling");

    expect(resolved).toBeDefined();
    expect(resolved!.ao1Route).toHaveProperty("coreAo1Argument");
    expect(resolved!.unresolvedAo1RouteId).toBeUndefined();
  });

  it("resolves source-locked AO4 route objects for a combination", () => {
    const resolved = getResolvedAoRouteCombination("aorc_class_credibility");

    expect(resolved).toBeDefined();
    expect(resolved!.ao4Routes.length).toBe(resolved!.ao4RouteIds.length);
    expect(resolved!.ao4Routes[0]).toHaveProperty("comparativeThesis");
    expect(resolved!.unresolvedAo4RouteIds).toEqual([]);
  });

  it("resolves source-locked AO2 method route objects for a combination", () => {
    const resolved = getResolvedAoRouteCombination("aorc_truth_storytelling");

    expect(resolved).toBeDefined();
    expect(resolved!.ao2Routes.length).toBe(resolved!.ao2RouteIds.length);
    expect(resolved!.ao2Routes[0]).toHaveProperty("ao2Route");
    expect(resolved!.unresolvedAo2RouteIds).toEqual([]);
  });
});
