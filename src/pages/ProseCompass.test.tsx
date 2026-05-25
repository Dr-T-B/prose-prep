import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildPlaceholderResponse } from "../../supabase/functions/generate-model-essay/validation";

const authMock = vi.hoisted(() => ({
  user: null as { id: string } | null,
  loading: false,
}));

const supabaseMock = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: authMock.user,
    loading: authMock.loading,
    session: null,
    isAdmin: false,
    signOut: vi.fn(),
    refreshRole: vi.fn(),
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: supabaseMock.getSession,
    },
  },
}));

import ProseCompass from "./ProseCompass";

const validQuestion =
  "Compare how the writers present the roles of children in both texts.";

function renderPage() {
  return render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <ProseCompass />
    </MemoryRouter>,
  );
}

describe("ProseCompass", () => {
  const fetchSpy = vi.fn();

  beforeEach(() => {
    authMock.user = { id: "user-1" };
    authMock.loading = false;
    supabaseMock.getSession.mockReset();
    supabaseMock.getSession.mockResolvedValue({
      data: { session: { access_token: "jwt-1" } },
    });
    fetchSpy.mockReset();
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the sign-in notice when no user is present", () => {
    authMock.user = null;
    renderPage();

    expect(
      screen.getByText(/Sign in to plan a model essay with Prose Compass/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Generate plan/i })).not.toBeInTheDocument();
  });

  it("disables submit when the question is below the minimum length", () => {
    renderPage();

    const textarea = screen.getByLabelText(/^Question$/i);
    fireEvent.change(textarea, { target: { value: "short" } });

    const submit = screen.getByRole("button", { name: /Generate plan/i });
    expect(submit).toBeDisabled();
  });

  it("renders the thesis and paragraph moves from a 200 response", async () => {
    const placeholder = buildPlaceholderResponse({
      questionText: validQuestion,
      theme: null,
      thesisAxis: null,
      targetLevel: null,
    });
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => placeholder,
    });

    renderPage();

    fireEvent.change(screen.getByLabelText(/^Question$/i), {
      target: { value: validQuestion },
    });
    fireEvent.click(screen.getByRole("button", { name: /Generate plan/i }));

    expect(await screen.findByText(placeholder.essayPlan.thesis)).toBeInTheDocument();
    for (const move of placeholder.essayPlan.paragraphMoves) {
      expect(screen.getByText(move)).toBeInTheDocument();
    }

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [calledUrl, calledInit] = fetchSpy.mock.calls[0];
    expect(calledUrl).toMatch(/\/functions\/v1\/generate-model-essay$/);
    expect((calledInit as RequestInit).headers).toMatchObject({
      Authorization: "Bearer jwt-1",
      "Content-Type": "application/json",
    });
  });

  it("renders the error region on a 401 response", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "Invalid or expired JWT" }),
    });

    renderPage();

    fireEvent.change(screen.getByLabelText(/^Question$/i), {
      target: { value: validQuestion },
    });
    fireEvent.click(screen.getByRole("button", { name: /Generate plan/i }));

    const alert = await waitFor(() => screen.getByRole("alert"));
    expect(alert).toHaveTextContent(/Invalid or expired JWT/i);
  });
});
