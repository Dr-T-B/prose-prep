import { describe, expect, it } from "vitest";
import { ao3ContextRoutes } from "@/data/ao3ContextRoutes";
import {
  getAllAo3ContextRoutes,
  getAo3ContextRouteById,
  getAo3RoutesByPriority,
  getCoreAo3Routes,
  searchAo3Routes,
} from "@/lib/ao3ContextRoutes";
import type { Ao3ContextRoute, Ao3Priority } from "@/types/ao3ContextRoutes";

const REQUIRED_FIELDS: Array<keyof Ao3ContextRoute> = [
  "id",
  "themeExamRoute",
  "coreContextClaim",
  "hardTimesContext",
  "atonementContext",
  "contextualPressure",
  "meaningEffect",
  "ao2MethodLink",
  "ao4ComparativeHinge",
  "examReadySentence",
  "misuseWarning",
  "priority",
];

const VALID_PRIORITIES = new Set<Ao3Priority>(["CORE", "HIGH", "MEDIUM"]);

const EXPECTED_ROUTES = [
  ["AO3-01", "Childhood"],
  ["AO3-02", "Education"],
  ["AO3-03", "Imagination vs Facts"],
  ["AO3-04", "Class"],
  ["AO3-05", "Power and Authority"],
  ["AO3-06", "Suffering"],
  ["AO3-07", "Conflict"],
  ["AO3-08", "Love"],
  ["AO3-09", "Marriage"],
  ["AO3-10", "Women and Female Experience"],
  ["AO3-11", "Masculinity"],
  ["AO3-12", "Responsibility"],
  ["AO3-13", "Guilt"],
  ["AO3-14", "Memory"],
  ["AO3-15", "Truth and Deception"],
  ["AO3-16", "Justice and Injustice"],
  ["AO3-17", "Independence and Agency"],
  ["AO3-18", "Social Criticism"],
  ["AO3-19", "Hope and Endings"],
  ["AO3-20", "Morality"],
  ["AO3-21", "Compassion and Care"],
  ["AO3-22", "Identity"],
  ["AO3-23", "Storytelling and Authorship"],
  ["AO3-24", "War / Industrialism / Human Cost"],
] as const;

describe("AO3 context route dataset", () => {
  it("contains exactly the 24 final AO3 routes", () => {
    expect(ao3ContextRoutes).toHaveLength(24);
  });

  it("contains every expected route ID and no extra IDs", () => {
    const actualIds = ao3ContextRoutes.map((route) => route.id).sort();
    const expectedIds = EXPECTED_ROUTES.map(([id]) => id).sort();

    expect(actualIds).toEqual(expectedIds);
  });

  it("keeps expected route IDs aligned to their final theme routes", () => {
    EXPECTED_ROUTES.forEach(([id, title]) => {
      expect(getAo3ContextRouteById(id)?.themeExamRoute).toBe(title);
    });
  });

  it("contains no excluded assessment-objective references", () => {
    expect(JSON.stringify(ao3ContextRoutes)).not.toMatch(/AO5/i);
  });

  it("uses unique route IDs", () => {
    const ids = ao3ContextRoutes.map((route) => route.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses only AO3-XX route ID format", () => {
    ao3ContextRoutes.forEach((route) => {
      expect(route.id).toMatch(/^AO3-\d{2}$/);
    });
  });

  it("keeps all required fields non-empty", () => {
    ao3ContextRoutes.forEach((route) => {
      REQUIRED_FIELDS.forEach((field) => {
        expect(String(route[field]).trim(), `${route.id}.${field}`).not.toBe("");
      });
    });
  });

  it("uses only supported priorities", () => {
    ao3ContextRoutes.forEach((route) => {
      expect(VALID_PRIORITIES.has(route.priority), `${route.id}.priority`).toBe(true);
    });
  });

  it("enforces AO3 route data-quality guardrails", () => {
    ao3ContextRoutes.forEach((route) => {
      expect(route.id, `${route.id}.id`).toMatch(/^AO3-\d{2}$/);
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

describe("AO3 context route utilities", () => {
  it("returns routes with CORE entries first", () => {
    const routes = getAllAo3ContextRoutes();
    const firstHighIndex = routes.findIndex((route) => route.priority === "HIGH");
    const lastCoreIndex = routes.map((route) => route.priority).lastIndexOf("CORE");

    expect(firstHighIndex).toBeGreaterThan(0);
    expect(lastCoreIndex).toBeLessThan(firstHighIndex);
  });

  it("finds routes by ID and priority", () => {
    expect(getAo3ContextRouteById("AO3-01")?.themeExamRoute).toMatch(/Childhood/i);
    expect(getAo3RoutesByPriority("CORE").every((route) => route.priority === "CORE")).toBe(true);
    expect(getCoreAo3Routes()).toEqual(getAo3RoutesByPriority("CORE"));
  });

  it.each([
    ["childhood", /Childhood/i],
    ["education", /Education/i],
    ["class", /Class/i],
    ["truth", /Truth/i],
    ["war", /War/i],
    ["industrialism", /industrialism/i],
    ["authorship", /Authorship/i],
    ["identity", /Identity/i],
    ["compassion", /Compassion/i],
    ["masculinity", /Masculinity/i],
  ])("returns a relevant route for %s", (query, expectedTitle) => {
    const results = searchAo3Routes(query);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((route) => expectedTitle.test(route.themeExamRoute))).toBe(true);
  });

  it.each([
    ["childhood", "AO3-01"],
    ["education", "AO3-02"],
    ["class", "AO3-04"],
    ["truth", "AO3-15"],
    ["women", "AO3-10"],
    ["gender", "AO3-10"],
    ["war", "AO3-24"],
    ["industrialism", "AO3-24"],
    ["authorship", "AO3-23"],
    ["identity", "AO3-22"],
    ["compassion", "AO3-21"],
    ["marriage", "AO3-09"],
    ["memory", "AO3-14"],
    ["guilt", "AO3-13"],
  ])("ranks the most classroom-relevant route first for %s", (query, expectedId) => {
    expect(searchAo3Routes(query)[0]?.id).toBe(expectedId);
  });
});
