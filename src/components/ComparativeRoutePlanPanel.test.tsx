import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ComparativeRoutePlanPanel } from "./ComparativeRoutePlanPanel";
import { buildEssayPlanScaffold } from "@/lib/comparativeRouteScaffold";

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

  it("writes the polished timed-writing scaffold to the clipboard when the action is used", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ComparativeRoutePlanPanel pairing={fullPairing} />);
    fireEvent.click(screen.getByRole("button", { name: /copy route as essay plan/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const payload = writeText.mock.calls[0][0] as string;

    expect(payload).toContain("# Component 2 Prose essay route plan");
    expect(payload).toContain("Hard Times × Atonement");
    expect(payload).toContain("Pearson Edexcel A-Level English Literature — AO1, AO2, AO3, AO4");
    expect(payload).toContain("## Route heading");
    expect(payload).toContain("Childhood formation");
    expect(payload).toContain("## Thesis");
    expect(payload).toContain("Both novels make childhood formation the origin of later damage.");
    expect(payload).toContain("## Paragraph 1 — opening comparative claim");
    expect(payload).toContain("AO1: Make a direct comparative claim");
    expect(payload).toContain("## Paragraph 2 — AO2 method focus");
    expect(payload).toContain("Track child focalisation");
    expect(payload).toContain("## Paragraph 3 — AO3 context focus");
    expect(payload).toContain("Victorian utilitarian schooling");
    expect(payload).toContain("## Paragraph 4 — AO4 comparative link");
    expect(payload).toContain("external ideological pressure");
    expect(payload).toContain("## Character / narrative / structure prompts");
    expect(payload).toContain("Character: Louisa and Briony");
    expect(payload).toContain("Narrative: Narrative perspective controls");
    expect(payload).toContain("Structure: Opening formation shapes");
    expect(payload).toContain("## Exam fit / timed-writing reminder");
    expect(payload).toContain("2023 Q2 direct fit");
    expect(payload).toContain("## Brief conclusion direction");
    expect(payload).toContain("## Final AO check");
    expect(payload).toContain("AO1: coherent argument");
    expect(payload).toContain("AO2: close analysis");
    expect(payload).toContain("AO3: context integrated");
    expect(payload).toContain("AO4: sustained comparison");

    expect(payload).not.toMatch(/AO5/i);

    expect(await screen.findByText(/copied to clipboard/i)).toBeInTheDocument();
  });
});

describe("buildEssayPlanScaffold", () => {
  it("includes expected headings and every available route field", () => {
    const scaffold = buildEssayPlanScaffold(fullPairing);

    expect(scaffold).toContain("# Component 2 Prose essay route plan");
    expect(scaffold).toContain("## Route heading");
    expect(scaffold).toContain("## Thesis");
    expect(scaffold).toContain("## Paragraph 1 — opening comparative claim");
    expect(scaffold).toContain("## Paragraph 2 — AO2 method focus");
    expect(scaffold).toContain("## Paragraph 3 — AO3 context focus");
    expect(scaffold).toContain("## Paragraph 4 — AO4 comparative link");
    expect(scaffold).toContain("## Character / narrative / structure prompts");
    expect(scaffold).toContain("## Exam fit / timed-writing reminder");
    expect(scaffold).toContain("## Brief conclusion direction");
    expect(scaffold).toContain("## Final AO check");

    expect(scaffold).toContain("Both novels make childhood formation");
    expect(scaffold).toContain("Childhood formation");
    expect(scaffold).toContain("Track child focalisation");
    expect(scaffold).toContain("Victorian utilitarian schooling");
    expect(scaffold).toContain("external ideological pressure");
    expect(scaffold).toContain("Louisa and Briony");
    expect(scaffold).toContain("Narrative perspective controls");
    expect(scaffold).toContain("Opening formation shapes");
    expect(scaffold).toContain("2023 Q2 direct fit");
  });

  it("frames Component 2 through AO1–AO4 only", () => {
    const scaffold = buildEssayPlanScaffold(fullPairing);

    expect(scaffold).toContain("AO1");
    expect(scaffold).toContain("AO2");
    expect(scaffold).toContain("AO3");
    expect(scaffold).toContain("AO4");
    expect(scaffold).not.toMatch(/AO5/i);
  });

  it("uses fallback prompts when optional fields are missing", () => {
    const scaffold = buildEssayPlanScaffold({ thesis: "Argument under test." });

    expect(scaffold).toContain("Argument under test.");
    expect(scaffold).toContain("Comparative axis: define the line of comparison linking both novels.");
    expect(scaffold).toContain("Select precise methods from both texts");
    expect(scaffold).toContain("Integrate context as pressure on interpretation");
    expect(scaffold).toContain("Make the comparison explicit");
    expect(scaffold).toContain("identify the character pairing or contrast");
    expect(scaffold).toContain("explain how narration, perspective, or voice");
    expect(scaffold).toContain("explain where this route sits in each novel's wider pattern");
    expect(scaffold).toContain("Use this route only if it answers the exact wording of the question");
    expect(scaffold).not.toMatch(/AO5/i);
  });

  it("keeps the scaffold printable as plain text with stable section spacing", () => {
    const scaffold = buildEssayPlanScaffold(fullPairing);

    expect(scaffold).not.toContain("undefined");
    expect(scaffold).not.toContain("null");
    expect(scaffold).toMatch(/## Thesis\nBoth novels make childhood formation/);
    expect(scaffold).toMatch(/## Final AO check\n- AO1: coherent argument/);
  });
});
