import { describe, expect, it } from "vitest";
import { ao2MethodRoutes } from "@/data/ao2MethodRoutes";
import {
  getAllAo2MethodRoutes,
  getAo2MethodRouteById,
  getAo2RoutesForTheme,
  getCoreAo2MethodRoutes,
  searchAo2MethodRoutes,
} from "@/lib/ao2MethodRoutes";
import type { Ao2MethodRoute, Ao2Priority } from "@/types/ao2MethodRoutes";

const REQUIRED_FIELDS: Array<keyof Ao2MethodRoute> = [
  "id",
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
  "priority",
];

const EXPECTED_IDS = Array.from({ length: 24 }, (_, index) => `AO2-${String(index + 1).padStart(2, "0")}`);
const VALID_PRIORITIES = new Set<Ao2Priority>(["CORE", "HIGH", "MEDIUM"]);

describe("AO2 method route dataset", () => {
  it("matches the source sheet route count and IDs", () => {
    expect(ao2MethodRoutes).toHaveLength(24);
    expect(ao2MethodRoutes.map((route) => route.id).sort()).toEqual(EXPECTED_IDS);
  });

  it("uses unique non-empty route IDs", () => {
    const ids = ao2MethodRoutes.map((route) => route.id);

    expect(ids.every((id) => id.trim().length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses only AO2-XX route ID format", () => {
    ao2MethodRoutes.forEach((route) => {
      expect(route.id).toMatch(/^AO2-\d{2}$/);
    });
  });

  it("keeps all required fields non-empty", () => {
    ao2MethodRoutes.forEach((route) => {
      REQUIRED_FIELDS.forEach((field) => {
        expect(String(route[field]).trim(), `${route.id}.${field}`).not.toBe("");
      });
    });
  });

  it("enforces source data-quality guardrails", () => {
    ao2MethodRoutes.forEach((route) => {
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

describe("AO2 method route utilities", () => {
  it("returns routes with CORE entries first", () => {
    const routes = getAllAo2MethodRoutes();
    const firstHighIndex = routes.findIndex((route) => route.priority === "HIGH");
    const lastCoreIndex = routes.map((route) => route.priority).lastIndexOf("CORE");

    expect(firstHighIndex).toBeGreaterThan(0);
    expect(lastCoreIndex).toBeLessThan(firstHighIndex);
    expect(getCoreAo2MethodRoutes().every((route) => route.priority === "CORE")).toBe(true);
  });

  it("finds routes by ID", () => {
    expect(getAo2MethodRouteById("AO2-04")?.ao2Route).toBe("Perspective and focalisation");
  });

  it.each([
    ["setting", "AO2-01"],
    ["imagery", "AO2-02"],
    ["irony", "AO2-03"],
    ["perspective", "AO2-04"],
    ["focalisation", "AO2-04"],
    ["dialogue", "AO2-06"],
    ["structure", "AO2-07"],
    ["naming", "AO2-08"],
    ["surveillance", "AO2-10"],
    ["writing", "AO2-11"],
    ["repetition", "AO2-13"],
    ["body", "AO2-14"],
    ["childhood", "AO2-15"],
    ["endings", "AO2-16"],
    ["institutions", "AO2-18"],
    ["journey", "AO2-19"],
    ["nature", "AO2-20"],
    ["genre", "AO2-21"],
    ["reliability", "AO2-23"],
    ["memory", "AO2-24"],
  ])("returns the expected top route for %s", (query, expectedId) => {
    expect(searchAo2MethodRoutes(query)[0]?.id).toBe(expectedId);
  });

  it("uses the same search behaviour for theme lookup", () => {
    expect(getAo2RoutesForTheme("memory")[0]?.id).toBe(searchAo2MethodRoutes("memory")[0]?.id);
  });
});
