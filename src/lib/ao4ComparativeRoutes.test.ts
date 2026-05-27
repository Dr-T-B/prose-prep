import { describe, expect, it } from "vitest";
import { ao4ComparativeRoutes } from "@/data/ao4ComparativeRoutes";
import {
  getAllAo4ComparativeRoutes,
  getAo4ComparativeRouteById,
  getCoreAo4Routes,
  getTierOneAo4Routes,
  searchAo4ComparativeRoutes,
} from "@/lib/ao4ComparativeRoutes";
import type { Ao4ComparativeRoute, Ao4Priority } from "@/types/ao4ComparativeRoutes";

const REQUIRED_FIELDS: Array<keyof Ao4ComparativeRoute> = [
  "id",
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
  "priority",
];

const EXPECTED_IDS = Array.from({ length: 24 }, (_, index) => `AO4-${String(index + 1).padStart(2, "0")}`);
const VALID_PRIORITIES = new Set<Ao4Priority>(["Tier 1", "Tier 2"]);

describe("AO4 comparative route dataset", () => {
  it("matches the source sheet route count and IDs", () => {
    expect(ao4ComparativeRoutes).toHaveLength(24);
    expect(ao4ComparativeRoutes.map((route) => route.id).sort()).toEqual(EXPECTED_IDS);
  });

  it("uses unique non-empty route IDs", () => {
    const ids = ao4ComparativeRoutes.map((route) => route.id);

    expect(ids.every((id) => id.trim().length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps all required fields non-empty", () => {
    ao4ComparativeRoutes.forEach((route) => {
      REQUIRED_FIELDS.forEach((field) => {
        expect(String(route[field]).trim(), `${route.id}.${field}`).not.toBe("");
      });
    });
  });

  it("enforces source data-quality guardrails", () => {
    ao4ComparativeRoutes.forEach((route) => {
      expect(route.id, `${route.id}.id`).toMatch(/^AO4-\d{2}$/);
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

describe("AO4 comparative route utilities", () => {
  it("returns routes with Tier 1 entries first", () => {
    const routes = getAllAo4ComparativeRoutes();
    const firstTierTwoIndex = routes.findIndex((route) => route.priority === "Tier 2");
    const lastTierOneIndex = routes.map((route) => route.priority).lastIndexOf("Tier 1");

    expect(firstTierTwoIndex).toBeGreaterThan(0);
    expect(lastTierOneIndex).toBeLessThan(firstTierTwoIndex);
    expect(getTierOneAo4Routes().every((route) => route.priority === "Tier 1")).toBe(true);
    expect(getCoreAo4Routes()).toEqual(getTierOneAo4Routes());
  });

  it("finds routes by ID", () => {
    expect(getAo4ComparativeRouteById("AO4-01")?.themeExamTrigger).toMatch(/Childhood/i);
  });

  it.each([
    ["childhood", "AO4-01"],
    ["education", "AO4-02"],
    ["class", "AO4-03"],
    ["truth", "AO4-05"],
    ["memory", "AO4-06"],
    ["guilt", "AO4-07"],
    ["imagination", "AO4-08"],
    ["gender", "AO4-09"],
    ["marriage", "AO4-10"],
    ["setting", "AO4-12"],
    ["justice", "AO4-14"],
    ["war", "AO4-16"],
    ["industrialism", "AO4-16"],
    ["narrative perspective", "AO4-19"],
  ])("returns the expected top route for %s", (query, expectedId) => {
    expect(searchAo4ComparativeRoutes(query)[0]?.id).toBe(expectedId);
  });
});
