import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: null,
    isAdmin: false,
    signOut: vi.fn(),
    loading: false,
  }),
}));

vi.mock("@/contexts/GradeBModeContext", () => ({
  GradeBModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useGradeBMode: () => ({
    gradeBMode: false,
    setGradeBMode: vi.fn(),
  }),
}));

vi.mock("@/lib/ContentProvider", () => ({
  ContentProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import App from "./App";

describe("App routing", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  const originalWarn = console.warn;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation((message?: unknown, ...args: unknown[]) => {
      if (typeof message === "string" && message.includes("React Router Future Flag Warning")) {
        return;
      }
      originalWarn(message, ...args);
    });
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("renders Rapid Recall from the application route table", () => {
    window.history.pushState({}, "", "/rapid-recall");

    render(<App />);

    expect(screen.getByRole("heading", { name: "Rapid Recall Workbook" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Rapid Recall" })).toHaveAttribute("href", "/rapid-recall");
  });
});
