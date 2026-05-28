import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockComparativeRows = vi.hoisted(() => {
  const defaultRows = [
    {
      id: "1",
      axis: "Difficult circumstances",
      hard_times: "Dickens uses circumstance as setting.",
      atonement: "McEwan uses circumstance as plot device.",
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
    const ao2Filter = screen.getByRole("button", { name: "AO2" });
    fireEvent.click(ao2Filter);

    await waitFor(() => {
      // Should filter out the second row since it has no AO2
      expect(screen.getByText(/Showing 1 of 2 comparative routes/i)).toBeInTheDocument();
      expect(screen.getByText(/\(AO2 filter active\)/i)).toBeInTheDocument();
    });
  });

  it("combines AO filtering with search so only matching filtered rows remain", async () => {
    mockComparativeRows.setRows([
      ...mockComparativeRows.defaultRows,
      {
        id: "3",
        axis: "Threshold spaces",
        hard_times: "Dickens presents threshold rooms as controlled spaces.",
        atonement: "McEwan presents threshold rooms as sites of misreading.",
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
    fireEvent.change(screen.getByPlaceholderText(/Search rows/i), {
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

    const select = screen.getByRole("combobox");
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
    const select = screen.getByRole("combobox");

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

    fireEvent.change(screen.getByPlaceholderText(/Search rows/i), {
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
    expect(screen.getByPlaceholderText(/Search rows/i)).toHaveValue("");
  });

  it("renders sparse comparative rows without crashing", async () => {
    mockComparativeRows.setRows([
      {
        id: "sparse-1",
        axis: "Sparse route",
        hard_times: "Some Dickens content.",
        atonement: "Some McEwan content.",
        ao2: "",
        ao3: "",
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
      expect(screen.getByText(/Showing 1 of 1 comparative routes/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Sparse route/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
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
    fireEvent.change(screen.getByPlaceholderText(/Search rows/i), {
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
      expect(screen.getByPlaceholderText(/Search rows/i)).toHaveValue("");
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
