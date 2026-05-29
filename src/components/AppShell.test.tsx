import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    isAdmin: false,
    signOut: vi.fn(),
    loading: false,
  }),
}));

vi.mock("@/contexts/GradeBModeContext", () => ({
  useGradeBMode: () => ({
    gradeBMode: false,
    setGradeBMode: vi.fn(),
  }),
}));

import AppShell from "./AppShell";

describe("AppShell", () => {
  it("keeps the primary Compare navigation pointed at the canonical matrix route", () => {
    render(
      <MemoryRouter
        initialEntries={["/"]}
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Compare" })).toHaveAttribute("href", "/matrix");
  });
});
