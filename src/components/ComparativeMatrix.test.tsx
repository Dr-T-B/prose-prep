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
});
