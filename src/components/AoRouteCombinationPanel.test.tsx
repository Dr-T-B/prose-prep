import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AoRouteCombinationPanel from "./AoRouteCombinationPanel";
import { getResolvedAoRouteCombination } from "@/lib/aoRouteCombinations";

describe("AoRouteCombinationPanel", () => {
  it("renders a complete student-facing essay route plan", () => {
    const combination = getResolvedAoRouteCombination("aorc_class_credibility");
    expect(combination).toBeDefined();

    render(<AoRouteCombinationPanel combination={combination!} />);

    expect(screen.getByText("Suggested AO Route Combination")).toBeInTheDocument();
    expect(screen.getAllByText("Class").length).toBeGreaterThan(0);
    expect(screen.getByText("Question triggers")).toBeInTheDocument();
    expect(screen.getByText("AO1 thesis route")).toBeInTheDocument();
    expect(screen.getByText("AO2 method routes")).toBeInTheDocument();
    expect(screen.getByText("AO3 context routes")).toBeInTheDocument();
    expect(screen.getByText("AO4 comparative hinge routes")).toBeInTheDocument();
    expect(screen.getByText("Recommended paragraph pattern")).toBeInTheDocument();
    expect(screen.getByText(combination!.ao1Route!.thesisSentenceStarter)).toBeInTheDocument();
    expect(screen.getByText(combination!.ao3Routes[0].coreContextClaim)).toBeInTheDocument();
    expect(screen.getByText(/Stephen's dialect and Robbie's class-marked description/)).toBeInTheDocument();
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
  });
});
