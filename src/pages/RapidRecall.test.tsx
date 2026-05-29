import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  RAPID_RECALL_MODE_LABELS,
  getRapidRecallTaskCountByMode,
  rapidRecallTasks,
} from "@/data/rapidRecall";
import RapidRecall from "./RapidRecall";

function renderPage(initialPath = "/rapid-recall") {
  return render(
    <MemoryRouter
      initialEntries={[initialPath]}
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <Routes>
        <Route path="/rapid-recall" element={<RapidRecall />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RapidRecall", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders the Rapid Recall route", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Rapid Recall" })).toBeInTheDocument();
    expect(screen.getByText(/Fast decision drills for Hard Times and Atonement/i)).toBeInTheDocument();
  });

  it("ships at least six tasks for every mode", () => {
    const counts = getRapidRecallTaskCountByMode();

    expect(rapidRecallTasks).toHaveLength(36);
    for (const mode of Object.keys(RAPID_RECALL_MODE_LABELS)) {
      expect(counts[mode as keyof typeof counts]).toBeGreaterThanOrEqual(6);
    }
  });

  it("changes visible tasks when the mode selector changes", () => {
    renderPage();

    expect(screen.getByText(/Gradgrind's demand for 'Facts'/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Quote Function" }));

    expect(screen.getByText(/best function of the repeated word 'Facts'/i)).toBeInTheDocument();
    expect(screen.queryByText(/Gradgrind's demand for 'Facts'/i)).not.toBeInTheDocument();
  });

  it("answers a multiple-choice task and shows feedback", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Childhood" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Check answer" })[0]);

    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    expect(screen.getByText(/Dickens criticises systems that narrow a child's imagination/i)).toBeInTheDocument();
  });

  it("answers a fill-in-the-blank task and shows feedback", () => {
    renderPage();

    const input = screen.getByLabelText("Answer for theme-education-sissy");
    fireEvent.change(input, { target: { value: "feeling" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Check answer" })[2]);

    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    expect(screen.getByText(/Sissy's emotional intelligence counters/i)).toBeInTheDocument();
  });

  it("answers a route-selection task and shows feedback", () => {
    renderPage();

    fireEvent.click(screen.getByRole("tab", { name: "Comparative Route" }));
    fireEvent.click(screen.getByRole("button", {
      name: /both writers show childhood being shaped by adult systems/i,
    }));
    fireEvent.click(screen.getAllByRole("button", { name: "Check answer" })[0]);

    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    expect(screen.getByText(/similarity and difference/i)).toBeInTheDocument();
  });

  it("updates attempted, correct and accuracy in the progress summary", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Childhood" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Check answer" })[0]);

    const summary = screen.getByLabelText("Session summary");
    expect(within(summary).getByText("Theme Match")).toBeInTheDocument();
    expect(within(summary).getAllByText("1")).toHaveLength(2);
    expect(within(summary).getByText("100%")).toBeInTheDocument();
  });

  it("reset session clears progress", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Childhood" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Check answer" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    const summary = screen.getByLabelText("Session summary");
    expect(within(summary).getAllByText("0")).toHaveLength(2);
    expect(within(summary).getByText("0%")).toBeInTheDocument();
    expect(screen.queryByText(/Dickens criticises systems that narrow a child's imagination/i)).not.toBeInTheDocument();
  });

  it("renders worksheet mode", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Worksheet mode" }));

    expect(screen.getByLabelText("Printable worksheet")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Questions" })).toBeInTheDocument();
  });

  it("shows and hides the answer key in worksheet mode", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Worksheet mode" }));
    expect(screen.queryByLabelText("Answer key")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show answer key" }));
    expect(screen.getByLabelText("Answer key")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Hide answer key" }));
    expect(screen.queryByLabelText("Answer key")).not.toBeInTheDocument();
  });

  it("copies the current worksheet to the clipboard", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Worksheet mode" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy worksheet" }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("Rapid Recall Workbook"));
    expect(await screen.findByText("Worksheet copied")).toBeInTheDocument();
  });

  it("does not render excluded assessment-objective wording in active data or UI", () => {
    const { container } = renderPage();
    const excluded = ["AO", "5"].join("");

    expect(JSON.stringify(rapidRecallTasks)).not.toContain(excluded);
    expect(container).not.toHaveTextContent(excluded);

    fireEvent.click(screen.getByRole("button", { name: "Worksheet mode" }));
    expect(container).not.toHaveTextContent(excluded);
  });
});
