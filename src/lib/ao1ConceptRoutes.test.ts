import { describe, expect, it } from "vitest";
import { ao1ConceptRoutes } from "@/data/ao1ConceptRoutes";
import {
  getAllAo1ConceptRoutes,
  getAo1ConceptRouteById,
  getAo1RoutesForCluster,
  getAo1RoutesForTheme,
  searchAo1ConceptRoutes,
} from "@/lib/ao1ConceptRoutes";
import type { Ao1ConceptRoute, Ao1Priority } from "@/types/ao1ConceptRoutes";

const REQUIRED_FIELDS: Array<keyof Ao1ConceptRoute> = [
  "id",
  "priority",
  "themeFocus",
  "likelyExamStems",
  "coreAo1Argument",
  "hardTimesConceptualRoute",
  "atonementConceptualRoute",
  "comparativeHingeJudgement",
  "thesisSentenceStarter",
];

const EXPECTED_IDS = Array.from({ length: 24 }, (_, index) => `AO1-${String(index + 1).padStart(3, "0")}`);
const VALID_PRIORITIES = new Set<Ao1Priority>(["CORE", "HIGH", "MEDIUM"]);

describe("AO1 concept route dataset", () => {
  it("matches the source sheet route count and IDs", () => {
    expect(ao1ConceptRoutes).toHaveLength(24);
    expect(ao1ConceptRoutes.map((route) => route.id).sort()).toEqual(EXPECTED_IDS);
  });

  it("uses unique non-empty route IDs", () => {
    const ids = ao1ConceptRoutes.map((route) => route.id);

    expect(ids.every((id) => id.trim().length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("preserves the source AO1-XXX route ID format", () => {
    ao1ConceptRoutes.forEach((route) => {
      expect(route.id).toMatch(/^AO1-\d{3}$/);
    });
  });

  it("keeps all required fields non-empty", () => {
    ao1ConceptRoutes.forEach((route) => {
      REQUIRED_FIELDS.forEach((field) => {
        expect(String(route[field]).trim(), `${route.id}.${field}`).not.toBe("");
      });
    });
  });

  it("enforces source data-quality guardrails", () => {
    ao1ConceptRoutes.forEach((route) => {
      expect(VALID_PRIORITIES.has(route.priority), `${route.id}.priority`).toBe(true);

      REQUIRED_FIELDS.forEach((field) => {
        const value = String(route[field]);
        expect(value.trim(), `${route.id}.${field}`).not.toBe("");
        expect(value, `${route.id}.${field}`).not.toContain("#REF!");
        expect(value, `${route.id}.${field}`).not.toMatch(/AO5/i);
      });
    });
  });
});

describe("AO1 concept route utilities", () => {
  it("returns routes with CORE entries first", () => {
    const routes = getAllAo1ConceptRoutes();
    const firstHighIndex = routes.findIndex((route) => route.priority === "HIGH");
    const lastCoreIndex = routes.map((route) => route.priority).lastIndexOf("CORE");

    expect(firstHighIndex).toBeGreaterThan(0);
    expect(lastCoreIndex).toBeLessThan(firstHighIndex);
  });

  it("finds routes by ID", () => {
    expect(getAo1ConceptRouteById("AO1-015")?.themeFocus).toBe("Truth and deception");
  });

  it.each([
    ["imagination", "AO1-003"],
    ["truth", "AO1-015"],
    ["narrative", "AO1-021"],
    ["perception", "AO1-022"],
    ["class", "AO1-004"],
    ["power", "AO1-005"],
    ["justice", "AO1-016"],
    ["society", "AO1-017"],
    ["childhood", "AO1-001"],
    ["education", "AO1-002"],
    ["suffering", "AO1-006"],
    ["guilt", "AO1-013"],
    ["endings", "AO1-023"],
    ["marriage", "AO1-009"],
    ["women", "AO1-010"],
  ])("returns the expected top route for %s", (query, expectedId) => {
    expect(searchAo1ConceptRoutes(query)[0]?.id).toBe(expectedId);
  });

  it("uses the same search behaviour for theme and cluster lookup", () => {
    expect(getAo1RoutesForTheme("class")[0]?.id).toBe(searchAo1ConceptRoutes("class")[0]?.id);
    expect(getAo1RoutesForCluster("human cost")[0]?.id).toBe(searchAo1ConceptRoutes("human cost")[0]?.id);
  });
});
