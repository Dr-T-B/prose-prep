import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import {
  RAPID_RECALL_AOS,
  RAPID_RECALL_DRILL_LABELS,
  getRapidRecallWorkbookCountByType,
  rapidRecallWorkbookItems,
} from "@/data/rapidRecallWorkbook";
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
  it("renders the Rapid Recall Workbook title and core drill modes", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Rapid Recall Workbook" })).toBeInTheDocument();
    expect(screen.getByText("Fast AO1–AO4 decision drills for Component 2 Prose.")).toBeInTheDocument();

    for (const label of Object.values(RAPID_RECALL_DRILL_LABELS)) {
      expect(screen.getByRole("tab", { name: label })).toBeInTheDocument();
    }
  });

  it("ships at least eight static items for every required drill type", () => {
    const counts = getRapidRecallWorkbookCountByType();

    expect(rapidRecallWorkbookItems).toHaveLength(32);
    expect(counts["multiple-choice"]).toBeGreaterThanOrEqual(8);
    expect(counts["fill-blank"]).toBeGreaterThanOrEqual(8);
    expect(counts["match-pair"]).toBeGreaterThanOrEqual(8);
    expect(counts["route-selection"]).toBeGreaterThanOrEqual(8);
  });

  it("limits the AO filter to AO1, AO2, AO3 and AO4", () => {
    renderPage();

    expect(RAPID_RECALL_AOS).toEqual(["AO1", "AO2", "AO3", "AO4"]);
    const aoFilter = screen.getByLabelText("AO filter");
    const options = within(aoFilter).getAllByRole("option").map((option) => option.textContent);

    expect(options).toEqual(["All AOs", "AO1", "AO2", "AO3", "AO4"]);
  });

  it("does not render excluded assessment-objective wording in active data or UI", () => {
    const { container } = renderPage();
    const excluded = ["AO", "5"].join("");

    expect(JSON.stringify(rapidRecallWorkbookItems)).not.toContain(excluded);
    expect(container).not.toHaveTextContent(excluded);
  });

  it("narrows visible cards with theme and text filters", () => {
    renderPage();

    expect(screen.getByText(/For a question on childhood/i)).toBeInTheDocument();
    expect(screen.getByText(/Which decision best frames gender/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Theme filter"), { target: { value: "childhood" } });
    fireEvent.change(screen.getByLabelText("Text filter"), { target: { value: "Comparative" } });

    expect(screen.getByText(/For a question on childhood/i)).toBeInTheDocument();
    expect(screen.queryByText(/Which decision best frames gender/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Session summary")).toHaveTextContent("1");
  });

  it("checks a multiple-choice answer and reveals a short explanation", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", {
      name: /Dickens presents childhood as damaged by utilitarian education/i,
    }));
    fireEvent.click(screen.getByRole("button", {
      name: /Check answer for For a question on childhood/i,
    }));

    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    expect(screen.getByText(/This gives a precise AO4 contrast/i)).toBeInTheDocument();
  });

  it("checks a fill-in-the-blank answer", () => {
    renderPage();

    fireEvent.click(screen.getByRole("tab", { name: "Fill blanks" }));
    fireEvent.change(screen.getByLabelText(/Short answer for In Hard Times/i), {
      target: { value: "Facts" },
    });
    fireEvent.click(screen.getByRole("button", {
      name: /Check answer for In Hard Times/i,
    }));

    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    expect(screen.getByText(/capitalised word turns education/i)).toBeInTheDocument();
  });

  it("reveals a match-the-pair answer", () => {
    renderPage();

    fireEvent.click(screen.getByRole("tab", { name: "Match pairs" }));
    fireEvent.change(screen.getByLabelText("Theme filter"), { target: { value: "childhood" } });
    fireEvent.click(screen.getByRole("button", { name: "Reveal answer for Match the quote anchor to its best essay use." }));

    expect(screen.getByRole("status")).toHaveTextContent("Answer revealed");
    expect(screen.getByText(/"Facts" -> Utilitarian education/i)).toBeInTheDocument();
  });

  it("route-selection cards display the AO4 comparative bridge after checking", () => {
    renderPage();

    fireEvent.click(screen.getByRole("tab", { name: "Route selection" }));
    fireEvent.click(screen.getByRole("button", {
      name: /Hard Times: Louisa\/Bounderby and emotional miseducation/i,
    }));
    fireEvent.click(screen.getByRole("button", {
      name: /Check answer for Question focus: relationships damaged by misunderstanding/i,
    }));

    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    expect(screen.getByText(/AO4 bridge:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/McEwan makes narrative perception itself the central problem/i).length).toBeGreaterThan(0);
  });

  it("renders a print-friendly workbook layout", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Printable layout" }));

    expect(screen.getByLabelText("Printable Rapid Recall Workbook")).toBeInTheDocument();
    expect(screen.getAllByText(/Answer: ______________________________/i).length).toBeGreaterThan(0);
  });
});
