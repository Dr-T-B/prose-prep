import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => {
  return {
    supabase: {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({
              data: [
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
                }
              ],
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

  it("does not output any AO5 data", async () => {
    render(<ComparativeMatrix />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 comparative routes/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
  });
});
