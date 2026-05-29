import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockComparativeRows = vi.hoisted(() => {
  const defaultRows = [
    {
      id: "1",
      axis: "Difficult circumstances",
      hard_times: "Dickens uses circumstance as setting.",
      atonement: "McEwan uses circumstance as plot device.",
      divergence: "External pressure in Dickens contrasts with retrospective moral reconstruction in McEwan.",
      ao2: "AO2 specific method.",
      ao3: "AO3 historical context.",
      ao4: "AO4 comparison link.",
      thesis: "Both texts...",
      character: "Various",
      narrative: "Various",
      structure: "Various",
      exam_fit: "Good",
      themes: ["childhood", "education"],
    },
    {
      id: "2",
      axis: "Difficult circumstances",
      hard_times: "Dickens focuses on poverty.",
      atonement: "McEwan focuses on war.",
      divergence: "Dickens frames pressure socially while McEwan frames it through wartime aftermath.",
      ao2: "",
      ao3: "Another AO3 context.",
      ao4: "Another AO4 comparison.",
      thesis: "Alternative thesis...",
      character: "Various",
      narrative: "Various",
      structure: "Various",
      exam_fit: "Good",
      themes: ["class"],
    },
  ];
  let rows = defaultRows;

  return {
    defaultRows,
    getRows: () => rows,
    resetRows: () => {
      rows = defaultRows;
    },
    setRows: (nextRows: typeof defaultRows) => {
      rows = nextRows;
    },
  };
});

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => {
  return {
    supabase: {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({
              data: mockComparativeRows.getRows(),
              error: null
            })
          })
        })
      })
    }
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockIntegrate = vi.fn();
vi.mock("@/lib/builderHandoff", () => ({
  integrateBuilderHandoffsIntoCurrentPlan: (items: any) => mockIntegrate(items),
}));

import ComparativeMatrix from "./ComparativeMatrix";

describe("ComparativeMatrix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockComparativeRows.resetRows();
  });

  it("renders result count with 'comparative routes'", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: "Comparative Revision Matrix" })).toBeInTheDocument();
  });

  it("surfaces comparative tension from the canonical matrix data contract", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const table = screen.getByRole("table");
    expect(within(table).getByText(/Comparative tension/i)).toBeInTheDocument();
    expect(within(table).getByText(/External pressure in Dickens contrasts/i)).toBeInTheDocument();

    const firstArticle = screen.getAllByRole("article")[0];
    fireEvent.click(within(firstArticle).getAllByRole("button")[0]);

    expect(within(firstArticle).getByText(/Comparative tension/i)).toBeInTheDocument();
    expect(within(firstArticle).getByText(/External pressure in Dickens contrasts/i)).toBeInTheDocument();
  });

  it("labels toolbar search and print layout controls for assistive technology", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const search = screen.getByRole("textbox", { name: /search comparative routes/i });
    const printLayout = screen.getByRole("combobox", { name: /print layout/i });

    expect(search).toHaveAttribute("id", "matrix-search");
    expect(search).toHaveAttribute("placeholder", "Search rows (e.g. Briony, Coketown, Dunkirk)…");
    expect(printLayout).toHaveAttribute("id", "matrix-print-layout");
  });

  it("keeps toolbar controls touch-sized with visible keyboard focus classes", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const search = screen.getByRole("textbox", { name: /search comparative routes/i });
    const printLayout = screen.getByRole("combobox", { name: /print layout/i });
    const ao2Filter = screen.getByRole("button", { name: "AO2" });
    const lensButton = screen.getByRole("button", { name: "Character / function" });
    const expandButton = screen.getByRole("button", { name: "Expand all" });
    const collapseButton = screen.getByRole("button", { name: "Collapse all" });
    const clearButton = screen.getByRole("button", { name: "Clear filters" });
    const printButton = screen.getByRole("button", { name: /Print compact matrix/i });
    const themeChip = screen.getByRole("button", { name: "Toggle Childhood theme filter" });

    for (const control of [
      search,
      printLayout,
      ao2Filter,
      lensButton,
      expandButton,
      collapseButton,
      clearButton,
      printButton,
      themeChip,
    ]) {
      expect(control).toHaveClass("min-h-10");
      expect(control).toHaveClass("focus-visible:ring-2");
      expect(control).toHaveClass("focus-visible:outline-none");
    }

    fireEvent.click(themeChip);
    const resetThemesButton = await screen.findByRole("button", { name: /Reset theme filters/i });
    expect(resetThemesButton).toHaveClass("min-h-10");
    expect(resetThemesButton).toHaveClass("focus-visible:ring-2");
  });

  it("renders card route subtitles separating duplicate themes", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getAllByText(/Difficult circumstances/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Dickens uses circumstance as setting ↔ McEwan uses circumstance as plot device/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Dickens focuses on poverty ↔ McEwan focuses on war/i).length).toBeGreaterThan(0);
    });
  });

  it("filters rows by inclusion when an AO filter is selected", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    // Click AO2 filter
    const allAosFilter = screen.getByRole("button", { name: "All AOs" });
    const ao2Filter = screen.getByRole("button", { name: "AO2" });
    expect(allAosFilter).toHaveAttribute("aria-pressed", "true");
    expect(ao2Filter).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(ao2Filter);

    await waitFor(() => {
      // Should filter out the second row since it has no AO2
      expect(screen.getByText(/Showing 1 of 2 comparative routes/i)).toBeInTheDocument();
      expect(screen.getByText(/\(AO2 filter active\)/i)).toBeInTheDocument();
    });
    expect(allAosFilter).toHaveAttribute("aria-pressed", "false");
    expect(ao2Filter).toHaveAttribute("aria-pressed", "true");
    expect(ao2Filter).toHaveClass("bg-ink", "text-paper");
    expect(allAosFilter).not.toHaveClass("bg-ink");
  });

  it("keeps the filter toolbar above the sticky app shell on mobile", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("region", { name: "Comparative matrix filters" })).toHaveClass(
      "relative",
      "z-40",
      "bg-paper",
    );
  });

  it("marks AO3 and AO4 active when selected and clears back to All AOs", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const allAosFilter = screen.getByRole("button", { name: "All AOs" });
    const ao3Filter = screen.getByRole("button", { name: "AO3" });
    const ao4Filter = screen.getByRole("button", { name: "AO4" });

    fireEvent.click(ao3Filter);
    await waitFor(() => {
      expect(screen.getByText(/\(AO3 filter active\)/i)).toBeInTheDocument();
    });
    expect(ao3Filter).toHaveAttribute("aria-pressed", "true");
    expect(allAosFilter).toHaveAttribute("aria-pressed", "false");
    expect(ao3Filter).toHaveClass("bg-ink", "text-paper");

    fireEvent.click(ao4Filter);
    await waitFor(() => {
      expect(screen.getByText(/\(AO4 filter active\)/i)).toBeInTheDocument();
    });
    expect(ao4Filter).toHaveAttribute("aria-pressed", "true");
    expect(ao3Filter).toHaveAttribute("aria-pressed", "false");
    expect(allAosFilter).toHaveAttribute("aria-pressed", "false");
    expect(ao4Filter).toHaveClass("bg-ink", "text-paper");

    fireEvent.click(allAosFilter);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/filter active/i)).not.toBeInTheDocument();
    expect(allAosFilter).toHaveAttribute("aria-pressed", "true");
    expect(ao4Filter).toHaveAttribute("aria-pressed", "false");
    expect(allAosFilter).toHaveClass("bg-ink", "text-paper");
  });

  it("accepts search text and keeps all AO controls clickable", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const search = screen.getByRole("textbox", { name: /search comparative routes/i });
    fireEvent.change(search, { target: { value: "poverty" } });

    await waitFor(() => {
      expect(search).toHaveValue("poverty");
      expect(screen.getByText(/Showing 1 of 2 comparative routes/i)).toBeInTheDocument();
    });

    for (const ao of ["AO2", "AO3", "AO4"] as const) {
      fireEvent.click(screen.getByRole("button", { name: ao }));
      await waitFor(() => {
        expect(screen.getByRole("button", { name: ao })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", { name: "All AOs" })).toHaveAttribute("aria-pressed", "false");
      });
    }
  });

  it("keeps every secondary lens control clickable", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    for (const lens of [
      "Character / function",
      "Narrative method",
      "Structural method",
      "Exam question suitability",
      "All details",
    ] as const) {
      fireEvent.click(screen.getByRole("button", { name: lens }));
      await waitFor(() => {
        expect(screen.getByRole("button", { name: lens })).toHaveAttribute("aria-pressed", "true");
      });
    }
  });

  it("limits visible AO columns while combining an AO filter with a secondary lens", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "AO2" }));
    fireEvent.click(screen.getByRole("button", { name: "Narrative method" }));

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const table = screen.getByRole("table");
    expect(within(table).getByText(/AO2 method trigger/i)).toBeInTheDocument();
    expect(within(table).getByText(/Narrative method/i)).toBeInTheDocument();
    expect(within(table).queryByText(/AO3 context/i)).not.toBeInTheDocument();
    expect(within(table).queryByText(/AO4 comparative link/i)).not.toBeInTheDocument();
  });

  it("combines AO filtering with search so only matching filtered rows remain", async () => {
    mockComparativeRows.setRows([
      ...mockComparativeRows.defaultRows,
      {
        id: "3",
        axis: "Threshold spaces",
        hard_times: "Dickens presents threshold rooms as controlled spaces.",
        atonement: "McEwan presents threshold rooms as sites of misreading.",
        divergence: "Thresholds are social boundaries in Dickens and perceptual traps in McEwan.",
        ao2: "AO2 spatial imagery around thresholds.",
        ao3: "Domestic context.",
        ao4: "Both writers use rooms as pressure points.",
        thesis: "Both texts frame thresholds as morally revealing spaces.",
        character: "Louisa / Briony",
        narrative: "Spatial perspective",
        structure: "Threshold scenes",
        exam_fit: "Strong",
        themes: ["imagination", "authorship"],
      },
      {
        id: "4",
        axis: "Threshold testimony",
        hard_times: "Dickens presents threshold testimony without method notes.",
        atonement: "McEwan presents threshold testimony as unreliable.",
        divergence: "Dickens stresses public testimony while McEwan stresses private misreading.",
        ao2: "",
        ao3: "Legal and social context.",
        ao4: "Both texts test evidence across thresholds.",
        thesis: "Both texts expose the instability of testimony.",
        character: "Stephen / Briony",
        narrative: "Witnessing",
        structure: "Delayed revelation",
        exam_fit: "Good",
        themes: ["justice"],
      },
    ]);

    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 4 of 4 comparative routes/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "AO2" }));
    fireEvent.change(screen.getByRole("textbox", { name: /search comparative routes/i }), {
      target: { value: "threshold" },
    });

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 4 comparative routes/i)).toBeInTheDocument();
      expect(screen.getByText(/\(AO2 filter active\)/i)).toBeInTheDocument();
    });
    const filteredMatrix = screen.getByRole("table").closest("div");

    expect(within(filteredMatrix!).getByText(/Threshold spaces/i)).toBeInTheDocument();
    expect(within(filteredMatrix!).queryByText(/Dickens uses circumstance as setting/i)).not.toBeInTheDocument();
    expect(within(filteredMatrix!).queryByText(/Threshold testimony/i)).not.toBeInTheDocument();
  });

  it("dynamically reflects the print mode in the print button label", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const printButton = screen.getByRole("button", { name: /Print compact matrix/i });
    expect(printButton).toBeInTheDocument();

    const select = screen.getByRole("combobox", { name: /print layout/i });
    fireEvent.change(select, { target: { value: "cards" } });
    
    expect(screen.getByRole("button", { name: /Print revision cards/i })).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "teacher" } });
    expect(screen.getByRole("button", { name: /Print teacher pack/i })).toBeInTheDocument();
  });

  it("updates printable layout regions when switching print modes", async () => {
    const { container } = render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const compactRegion = screen.getByRole("table").closest("div");
    const cardsRegion = screen.getAllByRole("article")[0].parentElement;
    const teacherRegion = container.querySelector("section");
    const select = screen.getByRole("combobox", { name: /print layout/i });

    expect(compactRegion).toHaveClass("print:block");
    expect(cardsRegion).toHaveClass("print:hidden");
    expect(teacherRegion).toHaveClass("print:hidden");

    fireEvent.change(select, { target: { value: "cards" } });
    expect(compactRegion).toHaveClass("print:hidden");
    expect(cardsRegion).toHaveClass("print:block");
    expect(teacherRegion).toHaveClass("print:hidden");

    fireEvent.change(select, { target: { value: "teacher" } });
    expect(compactRegion).toHaveClass("print:hidden");
    expect(cardsRegion).toHaveClass("print:hidden");
    expect(teacherRegion).toHaveClass("print:block");
  });

  it("does not output any AO5 data", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
  });

  it("sets aria-expanded when a route accordion is toggled", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const articles = screen.getAllByRole("article");
    const toggleBtn = within(articles[0]).getAllByRole("button")[0];

    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("allows multiple comparative routes to remain expanded simultaneously", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const articles = screen.getAllByRole("article");
    const toggle1 = within(articles[0]).getAllByRole("button")[0];
    const toggle2 = within(articles[1]).getAllByRole("button")[0];

    fireEvent.click(toggle1);
    fireEvent.click(toggle2);

    expect(toggle1).toHaveAttribute("aria-expanded", "true");
    expect(toggle2).toHaveAttribute("aria-expanded", "true");
  });

  it("expands and collapses all visible routes", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Expand all" }));

    for (const article of screen.getAllByRole("article")) {
      expect(within(article).getAllByRole("button")[0]).toHaveAttribute("aria-expanded", "true");
    }

    fireEvent.click(screen.getByRole("button", { name: "Collapse all" }));

    for (const article of screen.getAllByRole("article")) {
      expect(within(article).getAllByRole("button")[0]).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("clears search and filters and restores the full result count", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole("textbox", { name: /search comparative routes/i }), {
      target: { value: "setting" },
    });
    fireEvent.click(screen.getByRole("button", { name: "AO2" }));

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 2 comparative routes/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("textbox", { name: /search comparative routes/i })).toHaveValue("");
  });

  it("renders deliberate desktop fallbacks for missing optional cells", async () => {
    mockComparativeRows.setRows([
      {
        id: "sparse-1",
        axis: "Sparse route",
        hard_times: "Some Dickens content.",
        atonement: "Some McEwan content.",
        divergence: " ",
        ao2: "Meaningful AO2 note.",
        ao3: "   ",
        ao4: "",
        thesis: "\t",
        character: "Meaningful character detail.",
        narrative: " ",
        structure: "",
        exam_fit: "  ",
        themes: null,
      },
    ]);

    render(<ComparativeMatrix />);

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 1 comparative routes/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Sparse route/i).length).toBeGreaterThan(0);
    const table = screen.getByRole("table");
    expect(within(table).getByText("Meaningful AO2 note.")).toBeInTheDocument();
    expect(within(table).getAllByLabelText("No content available")).toHaveLength(4);
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
  });

  it("suppresses empty labelled mobile and teacher-print sections for sparse rows", async () => {
    mockComparativeRows.setRows([
      {
        id: "sparse-mobile",
        axis: "Sparse mobile route",
        hard_times: "Some Dickens content.",
        atonement: "Some McEwan content.",
        divergence: " ",
        ao2: "Meaningful AO2 note.",
        ao3: "   ",
        ao4: "",
        thesis: "\t",
        character: "Meaningful character detail.",
        narrative: " ",
        structure: "",
        exam_fit: "  ",
        themes: null,
      },
    ]);

    const { container } = render(<ComparativeMatrix />);

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 1 comparative routes/i)).toBeInTheDocument();
    });

    const article = screen.getByRole("article");
    fireEvent.click(within(article).getByRole("button", { name: /Sparse mobile route/i }));

    expect(within(article).getByText("AO2 Method")).toBeInTheDocument();
    expect(within(article).getByText("Meaningful AO2 note.")).toBeInTheDocument();
    expect(within(article).getByText("Character")).toBeInTheDocument();
    expect(within(article).getByText("Meaningful character detail.")).toBeInTheDocument();
    expect(within(article).queryByText("Comparative tension")).not.toBeInTheDocument();
    expect(within(article).queryByText("AO3 Context")).not.toBeInTheDocument();
    expect(within(article).queryByText("AO4 Compare")).not.toBeInTheDocument();
    expect(within(article).queryByText("Thesis starter")).not.toBeInTheDocument();
    expect(within(article).queryByText("Narrative")).not.toBeInTheDocument();
    expect(within(article).queryByText("Structure")).not.toBeInTheDocument();
    expect(within(article).queryByText("Exam fit")).not.toBeInTheDocument();

    const teacherPrint = container.querySelector("section");
    expect(teacherPrint).not.toBeNull();
    expect(within(teacherPrint!).getByText("AO2")).toBeInTheDocument();
    expect(within(teacherPrint!).getByText("Meaningful AO2 note.")).toBeInTheDocument();
    expect(within(teacherPrint!).queryByText("Comparative tension")).not.toBeInTheDocument();
    expect(within(teacherPrint!).queryByText("AO3")).not.toBeInTheDocument();
    expect(within(teacherPrint!).queryByText("AO4")).not.toBeInTheDocument();
    expect(within(teacherPrint!).queryByText("Thesis")).not.toBeInTheDocument();
    expect(within(teacherPrint!).queryByText("Exam fit")).not.toBeInTheDocument();
  });

  it("treats whitespace-only AO values as empty for AO filters", async () => {
    mockComparativeRows.setRows([
      {
        id: "whitespace-ao3",
        axis: "Whitespace AO3 route",
        hard_times: "Dickens content.",
        atonement: "McEwan content.",
        divergence: "",
        ao2: "",
        ao3: "   ",
        ao4: "",
        thesis: "",
        character: "",
        narrative: "",
        structure: "",
        exam_fit: "",
        themes: null,
      },
      {
        id: "meaningful-ao3",
        axis: "Meaningful AO3 route",
        hard_times: "Dickens content.",
        atonement: "McEwan content.",
        divergence: "",
        ao2: "",
        ao3: "Useful AO3 context.",
        ao4: "",
        thesis: "",
        character: "",
        narrative: "",
        structure: "",
        exam_fit: "",
        themes: null,
      },
    ]);

    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "AO3" }));

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 2 comparative routes/i)).toBeInTheDocument();
      expect(screen.getByText(/\(AO3 filter active\)/i)).toBeInTheDocument();
    });

    const table = screen.getByRole("table");
    expect(within(table).getByText("Meaningful AO3 route")).toBeInTheDocument();
    expect(within(table).getByText("Useful AO3 context.")).toBeInTheDocument();
    expect(within(table).queryByText("Whitespace AO3 route")).not.toBeInTheDocument();
  });

  it("omits whitespace-only labelled sections from copy export", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    mockComparativeRows.setRows([
      {
        id: "sparse-copy",
        axis: "Sparse copy route",
        hard_times: "Some Dickens content.",
        atonement: "Some McEwan content.",
        divergence: " ",
        ao2: "Meaningful AO2 note.",
        ao3: "   ",
        ao4: "",
        thesis: "\t",
        character: "",
        narrative: "",
        structure: "",
        exam_fit: "  ",
        themes: null,
      },
    ]);

    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 1 comparative routes/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: /Copy comparative route for/i })[0]);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledTimes(1);
    });

    const exportedText = writeTextMock.mock.calls[0][0];
    expect(exportedText).toContain("# Comparative Route: Sparse copy route");
    expect(exportedText).toContain("Hard Times:\nSome Dickens content.");
    expect(exportedText).toContain("Atonement:\nSome McEwan content.");
    expect(exportedText).toContain("AO2 — Method:\nMeaningful AO2 note.");
    expect(exportedText).not.toContain("Thesis:");
    expect(exportedText).not.toContain("Comparative tension:");
    expect(exportedText).not.toContain("AO3 — Context:");
    expect(exportedText).not.toContain("AO4 — Comparison:");
    expect(exportedText).not.toContain("Exam fit:");
    expect(exportedText).not.toContain("AO5");

    vi.unstubAllGlobals();
  });

  it("renders theme filter buttons derived from row data in title case", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const childhoodBtn = screen.getByRole("button", { name: "Toggle Childhood theme filter" });
    const classBtn = screen.getByRole("button", { name: "Toggle Class theme filter" });
    const educationBtn = screen.getByRole("button", { name: "Toggle Education theme filter" });

    expect(childhoodBtn).toBeInTheDocument();
    expect(classBtn).toBeInTheDocument();
    expect(educationBtn).toBeInTheDocument();

    // Verify initial aria-pressed states are false
    expect(childhoodBtn).toHaveAttribute("aria-pressed", "false");
    expect(classBtn).toHaveAttribute("aria-pressed", "false");
    expect(educationBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("filters rows when a theme filter is clicked (toggled) using OR semantics", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const childhoodBtn = screen.getByRole("button", { name: "Toggle Childhood theme filter" });

    // Toggle 'Childhood' on
    fireEvent.click(childhoodBtn);

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 2 comparative routes/i)).toBeInTheDocument();
      expect(screen.getByText(/1 theme selected/i)).toBeInTheDocument();
      expect(childhoodBtn).toHaveAttribute("aria-pressed", "true");
    });

    // Reset button should appear and be accessible
    const resetBtn = screen.getByRole("button", { name: /Reset theme filters/i });
    expect(resetBtn).toBeInTheDocument();
    expect(resetBtn).toHaveAttribute("aria-label", "Reset theme filters");

    // Toggle 'Class' on as well (OR semantics: matches Row 1 or Row 2)
    fireEvent.click(screen.getByRole("button", { name: "Toggle Class theme filter" }));

    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
      expect(screen.getByText(/2 themes selected/i)).toBeInTheDocument();
    });

    // Reset themes by clicking 'Reset themes'
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
      expect(screen.queryByText(/themes selected/i)).not.toBeInTheDocument();
      expect(childhoodBtn).toHaveAttribute("aria-pressed", "false");
    });
  });

  it("composes theme filter with search query and clears it on clear filters", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    // Select theme Childhood
    fireEvent.click(screen.getByRole("button", { name: "Toggle Childhood theme filter" }));

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 2 comparative routes/i)).toBeInTheDocument();
    });

    // Search query that matches nothing in Row 1 (e.g. "poverty", which is in Row 2)
    fireEvent.change(screen.getByRole("textbox", { name: /search comparative routes/i }), {
      target: { value: "poverty" },
    });

    await waitFor(() => {
      expect(screen.getByText(/Showing 0 of 2 comparative routes/i)).toBeInTheDocument();
      expect(screen.getByText(/No comparative routes match the current filters. Try clearing a theme or search term./i)).toBeInTheDocument();
    });

    // Verify clear all filters button has unambiguous aria-label
    const clearAllBtn = screen.getByRole("button", { name: /Clear all active filters/i });
    expect(clearAllBtn).toBeInTheDocument();
    expect(clearAllBtn).toHaveAttribute("aria-label", "Clear all active filters");

    // Clicking "Clear all active filters" in empty state should restore everything
    fireEvent.click(clearAllBtn);

    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /search comparative routes/i })).toHaveValue("");
    });
  });

  it("copies formatted comparative route scaffold to clipboard on click", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const copyBtns = screen.getAllByRole("button", { name: /Copy comparative route for/i });
    expect(copyBtns.length).toBeGreaterThan(0);

    expect(copyBtns[0]).toHaveAttribute("aria-label", "Copy comparative route for Difficult circumstances");

    fireEvent.click(copyBtns[0]);

    await waitFor(() => {
      expect(copyBtns[0]).toHaveTextContent("Copied!");
    });

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    const exportedText = writeTextMock.mock.calls[0][0];

    expect(exportedText).toContain("# Comparative Route: Difficult circumstances");
    expect(exportedText).toContain("Themes: Childhood, Education");
    expect(exportedText).toContain("Thesis:\nBoth texts...");
    expect(exportedText).toContain("Hard Times:\nDickens uses circumstance as setting.");
    expect(exportedText).toContain("Atonement:\nMcEwan uses circumstance as plot device.");
    expect(exportedText).toContain("Comparative tension:\nExternal pressure in Dickens contrasts with retrospective moral reconstruction in McEwan.");
    expect(exportedText).toContain("AO2 — Method:\nAO2 specific method.");
    expect(exportedText).toContain("AO3 — Context:\nAO3 historical context.");
    expect(exportedText).toContain("AO4 — Comparison:\nAO4 comparison link.");
    expect(exportedText).toContain("Exam fit:\nGood");
    expect(exportedText).toContain("Revision use:\nUse this route as a paragraph plan or mini essay scaffold. Adapt quotations and contextual evidence to the exact question.");
    expect(exportedText).not.toContain("AO5");

    vi.unstubAllGlobals();
  });

  it("does not render any AO5 options or labels in theme vocabulary or controls", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ao5/i)).not.toBeInTheDocument();
  });

  it("renders 'Send to Essay Builder' buttons with correct accessible labels and triggers handoff and navigation on click", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const sendBtns = screen.getAllByRole("button", { name: /Send comparative route for .* to Essay Builder/i });
    expect(sendBtns.length).toBeGreaterThan(0);

    // First button (Difficult circumstances)
    expect(sendBtns[0]).toHaveAttribute("aria-label", "Send comparative route for Difficult circumstances to Essay Builder");

    fireEvent.click(sendBtns[0]);

    await waitFor(() => {
      expect(mockIntegrate).toHaveBeenCalledTimes(1);
    });

    const handoffPayload = mockIntegrate.mock.calls[0][0][0];
    expect(handoffPayload.id).toBe("comparison:matrix:1");
    expect(handoffPayload.kind).toBe("comparison");
    expect(handoffPayload.originModule).toBe("comparison");
    expect(handoffPayload.label).toBe("Comparative Route");
    expect(handoffPayload.title).toBe("Difficult circumstances");
    expect(handoffPayload.text).toBe("Both texts...");
    expect(handoffPayload.family).toBe("childhood");
    expect(handoffPayload.metadata.source).toBe("comparative_matrix");
    expect(handoffPayload.metadata.hardTimes).toBe("Dickens uses circumstance as setting.");
    expect(handoffPayload.metadata.atonement).toBe("McEwan uses circumstance as plot device.");
    expect(handoffPayload.metadata.divergence).toBe("External pressure in Dickens contrasts with retrospective moral reconstruction in McEwan.");
    expect(handoffPayload.metadata.thesis).toBe("Both texts...");
    expect(handoffPayload.metadata.ao2).toBe("AO2 specific method.");
    expect(handoffPayload.metadata.ao3).toBe("AO3 historical context.");
    expect(handoffPayload.metadata.ao4).toBe("AO4 comparison link.");
    expect(handoffPayload.metadata.examFit).toBe("Good");

    // Payloads shouldn't have any AO5 content
    expect(JSON.stringify(handoffPayload)).not.toContain("AO5");
    expect(JSON.stringify(handoffPayload)).not.toContain("ao5");

    expect(mockNavigate).toHaveBeenCalledWith("/builder");
  });

  it("handles mobile accordion Send to Essay Builder clicks correctly", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    const articles = screen.getAllByRole("article");
    const toggleBtn = within(articles[0]).getAllByRole("button")[0];
    fireEvent.click(toggleBtn);

    const mobileSendBtn = within(articles[0]).getByRole("button", {
      name: "Send comparative route for Difficult circumstances to Essay Builder",
    });
    expect(mobileSendBtn).toBeInTheDocument();

    fireEvent.click(mobileSendBtn);

    expect(mockIntegrate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/builder");
  });
});
