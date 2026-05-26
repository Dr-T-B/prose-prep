import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ComparativeRoutePlanPanel, buildEssayPlanScaffold } from "./ComparativeRoutePlanPanel";

const fullPairing = {
  axis: "Childhood formation",
  thesis: "Both novels make childhood formation the origin of later damage.",
  ao2: "Track child focalisation, classroom dialogue, and recurring images of order.",
  ao3: "Connect Victorian utilitarian schooling with inter-war class assumptions.",
  ao4: "Compare external ideological pressure with internalised misreading.",
  character: "Louisa and Briony expose different kinds of formation.",
  narrative: "Narrative perspective controls how each childhood is judged.",
  structure: "Opening formation shapes the consequences that follow.",
  exam_fit: "2023 Q2 direct fit.",
};

describe("ComparativeRoutePlanPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("surfaces comparative matrix AO-content as essay-planning route material", () => {
    render(<ComparativeRoutePlanPanel pairing={fullPairing} />);

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

  it("exposes a 'Copy route as essay plan' action", () => {
    render(<ComparativeRoutePlanPanel pairing={fullPairing} />);
    expect(
      screen.getByRole("button", { name: /copy route as essay plan/i }),
    ).toBeInTheDocument();
  });

  it("writes a structured scaffold to the clipboard when the action is used", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ComparativeRoutePlanPanel pairing={fullPairing} />);
    fireEvent.click(screen.getByRole("button", { name: /copy route as essay plan/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const payload = writeText.mock.calls[0][0] as string;

    expect(payload).toContain("Thesis / argument direction");
    expect(payload).toContain("Both novels make childhood formation the origin of later damage.");
    expect(payload).toContain("Comparative route");
    expect(payload).toContain("Childhood formation");
    expect(payload).toContain("Paragraph 1 — AO2 method angle");
    expect(payload).toContain("Track child focalisation");
    expect(payload).toContain("Paragraph 2 — AO3 contextual angle");
    expect(payload).toContain("Victorian utilitarian schooling");
    expect(payload).toContain("Paragraph 3 — AO4 comparative angle");
    expect(payload).toContain("external ideological pressure");
    expect(payload).toContain("Character: Louisa and Briony");
    expect(payload).toContain("Narrative: Narrative perspective controls");
    expect(payload).toContain("Structure: Opening formation shapes");
    expect(payload).toContain("2023 Q2 direct fit");
    expect(payload).toContain("AO1: maintain argument");
    expect(payload).toContain("AO2: analyse method");
    expect(payload).toContain("AO3: integrate context");
    expect(payload).toContain("AO4: compare throughout");

    expect(payload).not.toMatch(/AO5/i);

    expect(await screen.findByText(/copied to clipboard/i)).toBeInTheDocument();
  });
});

describe("buildEssayPlanScaffold", () => {
  it("includes every AO-content field when present", () => {
    const scaffold = buildEssayPlanScaffold(fullPairing);
    expect(scaffold).toContain("Both novels make childhood formation");
    expect(scaffold).toContain("Track child focalisation");
    expect(scaffold).toContain("Victorian utilitarian schooling");
    expect(scaffold).toContain("external ideological pressure");
    expect(scaffold).toContain("Louisa and Briony");
    expect(scaffold).toContain("Narrative perspective controls");
    expect(scaffold).toContain("Opening formation shapes");
    expect(scaffold).toContain("2023 Q2 direct fit");
  });

  it("never references AO5 — Component 2 assesses AO1–AO4 only", () => {
    const scaffold = buildEssayPlanScaffold(fullPairing);
    expect(scaffold).not.toMatch(/AO5/i);

    const sparse = buildEssayPlanScaffold({ thesis: "x" });
    expect(sparse).not.toMatch(/AO5/i);
  });

  it("uses placeholder prompts when individual fields are missing but still emits AO1–AO4 paragraph headings", () => {
    const scaffold = buildEssayPlanScaffold({ thesis: "Argument under test." });
    expect(scaffold).toContain("Thesis / argument direction");
    expect(scaffold).toContain("Argument under test.");
    expect(scaffold).toContain("Paragraph 1 — AO2 method angle");
    expect(scaffold).toContain("Paragraph 2 — AO3 contextual angle");
    expect(scaffold).toContain("Paragraph 3 — AO4 comparative angle");
    expect(scaffold).toContain("Final checklist");
  });

  it("omits the structural cue block when no cue fields are present", () => {
    const scaffold = buildEssayPlanScaffold({ thesis: "x", ao2: "y" });
    expect(scaffold).not.toContain("Structural / narrative cue");
    expect(scaffold).not.toContain("Exam-fit reminder");
  });
});
