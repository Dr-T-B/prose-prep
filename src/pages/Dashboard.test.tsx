import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GradeBModeProvider } from "@/contexts/GradeBModeContext";
import Dashboard from "./Dashboard";

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: mockSupabase.from,
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user" }, loading: false }),
}));

describe("Dashboard", () => {
  beforeEach(() => {
    mockSupabase.from.mockReset();
  });

  function renderDashboard() {
    return render(
      <GradeBModeProvider>
        <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <Dashboard />
        </MemoryRouter>
      </GradeBModeProvider>,
    );
  }

  function mockDashboardTables({
    readiness = [],
    themes = [],
    quotes = [],
    markerResults = [],
    readinessError = null,
  }: {
    readiness?: unknown[];
    themes?: unknown[];
    quotes?: unknown[];
    markerResults?: unknown[];
    readinessError?: { message: string } | null;
  }) {
    mockSupabase.from.mockImplementation((table: string) => {
      const responses: Record<string, { data: unknown[] | null; error: { message: string } | null }> = {
        ao_readiness: { data: readiness, error: readinessError },
        themes: { data: themes, error: null },
        quotes: { data: quotes, error: null },
        essay_marker_results: { data: markerResults, error: null },
      };
      const response = responses[table];
      if (!response) throw new Error(`Unexpected table: ${table}`);
      const promise = Promise.resolve(response);
      const builder: {
        select: ReturnType<typeof vi.fn>;
        order: ReturnType<typeof vi.fn>;
        limit: ReturnType<typeof vi.fn>;
        then: typeof promise.then;
      } = {
        select: vi.fn(() => builder),
        order: vi.fn(() => builder),
        limit: vi.fn(() => builder),
        then: promise.then.bind(promise),
      };
      return builder;
    });
  }

  it("shows dashboard load errors instead of failing silently", async () => {
    mockDashboardTables({
      readinessError: { message: "permission denied for table ao_readiness" },
    });

    renderDashboard();

    expect(await screen.findByText("permission denied for table ao_readiness")).toBeInTheDocument();
  });

  it("counts human-readable quote theme tags against canonical theme ids", async () => {
    mockDashboardTables({
      readiness: [
        { ao: "AO1", label: "Argument", weight: 25, score: 70, trend: 1, note: "Secure" },
      ],
      themes: [{ id: "education", label: "Education", sort_order: 1 }],
      quotes: [
        {
          id: "quote-1",
          source: "hard-times",
          theme_tags: ["Education and utilitarianism"],
          is_verified: true,
        },
        {
          id: "quote-2",
          source: "atonement",
          theme_tags: ["education"],
          is_verified: false,
        },
      ],
    });

    renderDashboard();

    expect(await screen.findByText("Education")).toBeInTheDocument();
    expect(screen.getAllByText("1 quote")).toHaveLength(2);
  });

  it("renders inside the Grade B mode provider used by the app", async () => {
    mockDashboardTables({});

    renderDashboard();

    expect(await screen.findByText("Revision Dashboard")).toBeInTheDocument();
  });
});
