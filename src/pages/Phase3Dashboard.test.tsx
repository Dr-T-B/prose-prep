import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Phase3Dashboard from "./Phase3Dashboard";

describe("Phase3Dashboard", () => {
  it("renders the dashboard header and pairing cards", () => {
    render(<Phase3Dashboard />);

    expect(screen.getByText("Phase 3: Character Pairings")).toBeInTheDocument();
    expect(screen.getByText("The Suppression of Imagination & Childhood")).toBeInTheDocument();
    expect(screen.getByText("Louisa Gradgrind")).toBeInTheDocument();
    expect(screen.getByText("Briony Tallis")).toBeInTheDocument();
  });
});
