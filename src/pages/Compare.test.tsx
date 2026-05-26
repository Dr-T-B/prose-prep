import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ContentProvider", () => ({
  useContent: () => ({
    comparative_matrix: [
      {
        id: "cm-test-01",
        axis: "Roles of children",
        hard_times: "Dickens tests childhood through a restrictive schoolroom.",
        atonement: "McEwan tests childhood through a misreading child narrator.",
        divergence: "Dickens condemns formation from outside; McEwan stages error from within.",
        themes: ["childhood", "education"],
        ao2: "AO2 method detail long enough to behave like migrated matrix prose.",
        ao3: "AO3 context detail long enough to behave like migrated matrix prose.",
        ao4: "AO4 comparison detail long enough to behave like migrated matrix prose.",
        thesis: "Both novels use childhood as the point where social systems become personal damage.",
        character: "Louisa and Briony expose different kinds of formation.",
        narrative: "Narrative perspective controls how each childhood is judged.",
        structure: "The opening formation shapes the consequences that follow.",
        exam_fit: "2023 Q2 direct fit.",
      },
    ],
  }),
}));

import Compare from "./Compare";

describe("Compare", () => {
  it("renders populated comparative matrix AO-content fields", () => {
    render(<Compare />);

    expect(screen.getByText("Roles of children")).toBeInTheDocument();
    expect(screen.getByText("AO2")).toBeInTheDocument();
    expect(screen.getByText("AO3")).toBeInTheDocument();
    expect(screen.getByText("AO4")).toBeInTheDocument();
    expect(screen.getByText(/Both novels use childhood/)).toBeInTheDocument();
    expect(screen.getByText(/Narrative perspective controls/)).toBeInTheDocument();
    expect(screen.getByText(/2023 Q2 direct fit/)).toBeInTheDocument();
  });
});
