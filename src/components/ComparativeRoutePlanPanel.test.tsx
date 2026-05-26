import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComparativeRoutePlanPanel } from "./ComparativeRoutePlanPanel";

describe("ComparativeRoutePlanPanel", () => {
  it("surfaces comparative matrix AO-content as essay-planning route material", () => {
    render(
      <ComparativeRoutePlanPanel
        pairing={{
          thesis: "Both novels make childhood formation the origin of later damage.",
          ao2: "Track child focalisation, classroom dialogue, and recurring images of order.",
          ao3: "Connect Victorian utilitarian schooling with inter-war class assumptions.",
          ao4: "Compare external ideological pressure with internalised misreading.",
          character: "Louisa and Briony expose different kinds of formation.",
          narrative: "Narrative perspective controls how each childhood is judged.",
          structure: "Opening formation shapes the consequences that follow.",
          exam_fit: "2023 Q2 direct fit.",
        }}
      />,
    );

    expect(screen.getByText("Essay planning route")).toBeInTheDocument();
    expect(screen.getByText("Thesis route")).toBeInTheDocument();
    expect(screen.getByText("AO2 method angle")).toBeInTheDocument();
    expect(screen.getByText("AO3 context angle")).toBeInTheDocument();
    expect(screen.getByText("AO4 comparative link")).toBeInTheDocument();
    expect(screen.getByText("Character cue")).toBeInTheDocument();
    expect(screen.getByText("Narrative cue")).toBeInTheDocument();
    expect(screen.getByText("Structure cue")).toBeInTheDocument();
    expect(screen.getByText("Exam fit")).toBeInTheDocument();
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();

    expect(screen.getByText(/childhood formation/)).toBeInTheDocument();
    expect(screen.getByText(/child focalisation/)).toBeInTheDocument();
    expect(screen.getByText(/Victorian utilitarian schooling/)).toBeInTheDocument();
    expect(screen.getByText(/external ideological pressure/)).toBeInTheDocument();
    expect(screen.getByText(/Louisa and Briony/)).toBeInTheDocument();
    expect(screen.getByText(/Narrative perspective controls/)).toBeInTheDocument();
    expect(screen.getByText(/Opening formation shapes/)).toBeInTheDocument();
    expect(screen.getByText(/2023 Q2 direct fit/)).toBeInTheDocument();
  });
});
