import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ComparativeMatrix from "./ComparativeMatrix";

const matrixRows = [
  {
    id: "route-childhood",
    axis: "Childhood and formation",
    hard_times: "Dickens shows Gradgrind's schoolroom narrowing Louisa's emotional life.",
    atonement: "McEwan shows Briony's ordered imagination turning error into accusation.",
    ao2: "Analyse narrative focalisation, repetition and symbolic classroom imagery.",
    ao3: "Victorian education and 1930s class codes shape how children are trained to see.",
    ao4: "Both novels connect childhood to damage, but Dickens externalises pressure while McEwan internalises misreading.",
    thesis: "Both novels present childhood as a site where systems become personal damage.",
    character: "Louisa, Briony",
    narrative: "focalisation",
    structure: "opening formation",
    exam_fit: "childhood questions",
  },
  {
    id: "route-war",
    axis: "War and consequence",
    hard_times: "Dickens presents industrial conflict through Coketown's exhausting routines.",
    atonement: "McEwan presents Dunkirk as bodily and historical rupture.",
    ao2: "Analyse violent imagery and shifts in narrative scale.",
    ao3: "Industrialisation and wartime trauma expose different historical pressures.",
    ao4: "Both writers treat systems as destructive, though the historical forms differ.",
    thesis: "The comparison is strongest when pressure is linked to method, not theme alone.",
    character: "Stephen, Robbie",
    narrative: "omniscient narration",
    structure: "rupture",
    exam_fit: "conflict questions",
  },
];

const supabaseMocks = vi.hoisted(() => {
  const order = vi.fn();
  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  return { eq, from, order, select };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: supabaseMocks.from },
}));

describe("ComparativeMatrix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMocks.order.mockResolvedValue({ data: matrixRows, error: null });
    Object.defineProperty(window, "print", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("renders route cards as the primary matrix UI", async () => {
    render(<ComparativeMatrix />);

    const routeList = await screen.findByLabelText("Comparative revision routes");
    const cards = within(routeList).getAllByRole("article");

    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByRole("heading", { name: "Childhood and formation" })).toBeInTheDocument();
    expect(within(cards[0]).getByText("Hard Times")).toBeInTheDocument();
    expect(within(cards[0]).getByText("Atonement")).toBeInTheDocument();
    expect(within(cards[0]).getByText("AO2")).toBeInTheDocument();
    expect(within(cards[0]).getByText("AO3")).toBeInTheDocument();
    expect(within(cards[0]).getByText("AO4")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("keeps search and filter controls working", async () => {
    render(<ComparativeMatrix />);

    await screen.findByRole("heading", { name: "Childhood and formation" });

    fireEvent.change(screen.getByLabelText(/Search rows/i), {
      target: { value: "Dunkirk" },
    });
    expect(screen.queryByRole("heading", { name: "Childhood and formation" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "War and consequence" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    fireEvent.change(screen.getByLabelText(/Narrative method/i), {
      target: { value: "focalisation" },
    });
    expect(screen.getByRole("heading", { name: "Childhood and formation" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "War and consequence" })).not.toBeInTheDocument();
  });

  it("clears search and every filter control", async () => {
    render(<ComparativeMatrix />);

    await screen.findByRole("heading", { name: "Childhood and formation" });

    fireEvent.change(screen.getByLabelText(/Search rows/i), {
      target: { value: "Dunkirk" },
    });
    fireEvent.change(screen.getByLabelText(/AO/i), {
      target: { value: "AO2" },
    });
    fireEvent.change(screen.getByLabelText(/Character\/function/i), {
      target: { value: "Robbie" },
    });
    fireEvent.change(screen.getByLabelText(/Narrative method/i), {
      target: { value: "omniscient narration" },
    });
    fireEvent.change(screen.getByLabelText(/Structural method/i), {
      target: { value: "rupture" },
    });
    fireEvent.change(screen.getByLabelText(/Exam suitability/i), {
      target: { value: "conflict questions" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(screen.getByLabelText(/Search rows/i)).toHaveValue("");
    expect(screen.getByLabelText(/AO/i)).toHaveValue("all");
    expect(screen.getByLabelText(/Character\/function/i)).toHaveValue("all");
    expect(screen.getByLabelText(/Narrative method/i)).toHaveValue("all");
    expect(screen.getByLabelText(/Structural method/i)).toHaveValue("all");
    expect(screen.getByLabelText(/Exam suitability/i)).toHaveValue("all");
    expect(screen.getByRole("heading", { name: "Childhood and formation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "War and consequence" })).toBeInTheDocument();
  });

  it("expands and collapses an individual card", async () => {
    render(<ComparativeMatrix />);

    const collapseButton = await screen.findByRole("button", {
      name: "Collapse details",
    });
    expect(collapseButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("AO2 Method Trigger")).toBeInTheDocument();

    fireEvent.click(collapseButton);
    expect(screen.getAllByRole("button", { name: "Expand details" })[0]).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByText("AO2 Method Trigger")).not.toBeInTheDocument();
  });

  it("supports expand all and collapse all", async () => {
    render(<ComparativeMatrix />);

    await screen.findByRole("heading", { name: "Childhood and formation" });
    fireEvent.click(screen.getByRole("button", { name: "Expand all" }));
    expect(screen.getAllByRole("button", { name: "Collapse details" })).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Collapse all" }));
    expect(screen.getAllByRole("button", { name: "Expand details" })).toHaveLength(2);
  });

  it("changes the selected print mode", async () => {
    render(<ComparativeMatrix />);

    await screen.findByRole("heading", { name: "Childhood and formation" });
    fireEvent.change(screen.getByLabelText(/Print mode/i), {
      target: { value: "cards" },
    });

    expect(screen.getByRole("button", { name: "Print revision cards" })).toBeInTheDocument();
    expect(screen.getByText("Comparative Revision Cards")).toBeInTheDocument();
  });

  it("renders only the selected print view", async () => {
    render(<ComparativeMatrix />);

    await screen.findByRole("heading", { name: "Childhood and formation" });
    expect(screen.getByText("Compact matrix print - short route previews")).toBeInTheDocument();
    expect(screen.queryByText("Study-card print - one or two routes per page")).not.toBeInTheDocument();
    expect(screen.queryByText("Full AO2, AO3 and AO4 route content")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Print mode/i), {
      target: { value: "teacher" },
    });

    expect(screen.queryByText("Compact matrix print - short route previews")).not.toBeInTheDocument();
    expect(screen.queryByText("Study-card print - one or two routes per page")).not.toBeInTheDocument();
    expect(screen.getByText("Full AO2, AO3 and AO4 route content")).toBeInTheDocument();
  });

  it("prints using the selected print mode", async () => {
    render(<ComparativeMatrix />);

    await screen.findByRole("heading", { name: "Childhood and formation" });
    fireEvent.change(screen.getByLabelText(/Print mode/i), {
      target: { value: "teacher" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Print full teacher pack" }));

    expect(window.print).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Comparative Matrix Teacher Pack")).toBeInTheDocument();
  });

  it("does not render excluded assessment-objective text in the matrix UI or print views", async () => {
    render(<ComparativeMatrix />);

    await screen.findByRole("heading", { name: "Childhood and formation" });

    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
  });

  it("handles long prose and missing optional fields without relying on fixture shape", async () => {
    supabaseMocks.order.mockResolvedValueOnce({
      data: [
        {
          id: "route-sparse",
          axis: "Sparse long-content route",
          hard_times: "Dickens ".repeat(80),
          atonement: "McEwan ".repeat(80),
          ao2: null,
          ao3: "",
          ao4: null,
          thesis: null,
          character: null,
          narrative: "",
          structure: null,
          exam_fit: "",
        },
      ],
      error: null,
    });

    render(<ComparativeMatrix />);

    const routeList = await screen.findByLabelText("Comparative revision routes");
    const card = within(routeList).getByRole("article");

    expect(within(card).getByRole("heading", { name: "Sparse long-content route" })).toBeInTheDocument();
    expect(within(card).getByText(/Dickens Dickens/)).toBeInTheDocument();
    expect(within(card).getByText(/McEwan McEwan/)).toBeInTheDocument();
    expect(within(card).queryByText("AO2")).not.toBeInTheDocument();
    expect(within(card).queryByText("AO3")).not.toBeInTheDocument();
    expect(within(card).queryByText("AO4")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 1 routes")).toBeInTheDocument();
  });
});
