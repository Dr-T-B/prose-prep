import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryResult = {
  data: unknown[] | null;
  error: { message?: string } | null;
};

const mockSupabase = vi.hoisted(() => {
  const responses: Record<string, QueryResult> = {};

  const makeQuery = (table: string) => {
    const query = {
      eq: vi.fn(() => query),
      order: vi.fn(() => query),
      then: (resolve: (value: QueryResult) => void, reject: (reason: unknown) => void) =>
        Promise.resolve(responses[table] ?? { data: [], error: null }).then(resolve, reject),
    };
    return query;
  };

  return {
    responses,
    from: vi.fn((table: string) => ({
      select: vi.fn(() => makeQuery(table)),
    })),
  };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: mockSupabase.from,
  },
}));

describe("content repository fallback", () => {
  beforeEach(() => {
    mockSupabase.from.mockClear();
    for (const key of Object.keys(mockSupabase.responses)) {
      delete mockSupabase.responses[key];
    }
  });

  it("keeps remote glossary rows when core seed-backed tables are empty", async () => {
    mockSupabase.responses.glossary_terms = {
      data: [
        {
          id: "g1",
          term: "zeugma",
          definition: "A word applied to two others in different senses.",
          category: "method",
          is_active: true,
          sort_order: 1,
        },
      ],
      error: null,
    };

    const { loadContent, localContentBundle } = await import("./contentRepo");
    const bundle = await loadContent();

    expect(bundle.source).toBe("remote");
    expect(bundle.routes).toEqual(localContentBundle.routes);
    expect(bundle.glossary_terms).toEqual(mockSupabase.responses.glossary_terms.data);
  });

  it("falls back only the dataset whose query fails", async () => {
    mockSupabase.responses.routes = {
      data: [
        {
          id: "remote-route",
          name: "Remote route",
          core_question: "How does the comparison work?",
        },
      ],
      error: null,
    };
    mockSupabase.responses.questions = {
      data: null,
      error: { message: "permission denied" },
    };

    const { loadContent, localContentBundle } = await import("./contentRepo");
    const bundle = await loadContent();

    expect(bundle.routes).toEqual(mockSupabase.responses.routes.data);
    expect(bundle.questions).toEqual(localContentBundle.questions);
  });

  it("remote active questions override local seed when Supabase returns non-empty active question rows", async () => {
    mockSupabase.responses.questions = {
      data: [{ id: "remote_q1", stem: "Remote question" }],
      error: null,
    };

    const { loadContent, localContentBundle } = await import("./contentRepo");
    const bundle = await loadContent();

    expect(bundle.questions).toHaveLength(1);
    expect(bundle.questions[0].id).toBe("remote_q1");
    expect(bundle.questions.length).not.toBe(localContentBundle.questions.length);
  });

  it("local seed fallback is used when Supabase returns an error", async () => {
    mockSupabase.responses.questions = {
      data: null,
      error: { message: "Internal Server Error" },
    };

    const { loadContent, localContentBundle } = await import("./contentRepo");
    const bundle = await loadContent();

    // Mapping changes likely_core_methods to [] if undefined, so we check length and IDs
    expect(bundle.questions.length).toBe(localContentBundle.questions.length);
    expect(bundle.questions[0].id).toBe(localContentBundle.questions[0].id);
  });

  it("local seed fallback is used when Supabase returns no active question rows", async () => {
    mockSupabase.responses.questions = {
      data: [],
      error: null,
    };

    const { loadContent, localContentBundle } = await import("./contentRepo");
    const bundle = await loadContent();

    expect(bundle.questions.length).toBe(localContentBundle.questions.length);
    expect(bundle.questions[0].id).toBe(localContentBundle.questions[0].id);
  });

  it("local priority questions exist in fallback seed and do not include AO5", async () => {
    const { localContentBundle } = await import("./contentRepo");
    
    const questions = localContentBundle.questions;
    expect(questions.length).toBeGreaterThanOrEqual(12);
    
    questions.forEach(q => {
      // Ensure no AO5 terminology is introduced in metadata
      if ('ao_emphasis' in q) {
        expect(String((q as any).ao_emphasis).includes("AO5")).toBe(false);
      }
      expect(JSON.stringify(q).includes("AO5")).toBe(false);
      expect(JSON.stringify(q).includes("AO5")).toBe(false);
    });
  });
});
