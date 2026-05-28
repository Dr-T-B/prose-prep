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
    const toggleBtn = within(articles[0]).getByRole("button");

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
    const toggle1 = within(articles[0]).getByRole("button");
    const toggle2 = within(articles[1]).getByRole("button");

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
      expect(within(article).getByRole("button")).toHaveAttribute("aria-expanded", "true");
    }

    fireEvent.click(screen.getByRole("button", { name: "Collapse all" }));

    for (const article of screen.getAllByRole("article")) {
      expect(within(article).getByRole("button")).toHaveAttribute("aria-expanded", "false");
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

    expect(screen.getByRole("button", { name: "Childhood" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Class" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Education" })).toBeInTheDocument();
  });

  it("filters rows when a theme filter is clicked (toggled) using OR semantics", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    // Toggle 'Childhood' on
    fireEvent.click(screen.getByRole("button", { name: "Childhood" }));

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 2 comparative routes/i)).toBeInTheDocument();
      expect(screen.getByText(/1 theme selected/i)).toBeInTheDocument();
    });

    // Toggle 'Class' on as well (OR semantics: matches Row 1 or Row 2)
    fireEvent.click(screen.getByRole("button", { name: "Class" }));

    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
      expect(screen.getByText(/2 themes selected/i)).toBeInTheDocument();
    });

    // Reset themes by clicking 'Reset themes'
    fireEvent.click(screen.getByRole("button", { name: /Reset themes/i }));

    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
      expect(screen.queryByText(/themes selected/i)).not.toBeInTheDocument();
    });
  });

  it("composes theme filter with search query and clears it on clear filters", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });

    // Select theme Childhood
    fireEvent.click(screen.getByRole("button", { name: "Childhood" }));

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

    // Clicking "Clear all filters" in empty state should restore everything
    fireEvent.click(screen.getByRole("button", { name: /Clear all filters/i }));

    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search rows/i)).toHaveValue("");
    });
  });

  it("does not render any AO5 options or labels in theme vocabulary or controls", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ao5/i)).not.toBeInTheDocument();
  });
});
