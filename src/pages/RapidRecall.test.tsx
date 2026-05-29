import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  RAPID_RECALL_AOS,
  RAPID_RECALL_DRILL_LABELS,
  getRapidRecallWorkbookCountByType,
  rapidRecallWorkbookItems,
} from "@/data/rapidRecallWorkbook";
import {
  formatTimedParagraphDrillText,
  getRapidRecallTimedParagraphDrillForItemId,
  getRapidRecallTimedParagraphDrillCount,
  rapidRecallTimedParagraphDrills,
} from "@/data/rapidRecallTimedParagraphDrills";
import {
  buildTimedDrillSessionSummary,
  formatTimedDrillSessionSummaryForCopy,
} from "@/data/rapidRecallTimedDrillSessionSummary";
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

function openRelationshipsRoutePlan() {
  fireEvent.click(screen.getByRole("tab", { name: "Route selection" }));
  fireEvent.click(screen.getByRole("button", {
    name: /Build route from this drill for Question focus: relationships damaged by misunderstanding/i,
  }));
  return screen.getByLabelText("Rapid Recall route plan handoff");
}

function startRelationshipsTimedDrill() {
  const routePlanPanel = openRelationshipsRoutePlan();
  fireEvent.click(within(routePlanPanel).getByRole("button", { name: "Start timed paragraph drill" }));
  return screen.getByLabelText("Timed paragraph drill");
}

function selectBestStem(stageIndex: number) {
  const drillData = getRapidRecallTimedParagraphDrillForItemId("route-relationships-misunderstanding");
  if (!drillData) throw new Error("Missing timed paragraph drill fixture");

  const stage = drillData.stages[stageIndex];
  const bestStem = stage.stemOptions.find((option) => option.isBest);
  if (!bestStem) throw new Error(`Missing best stem for stage ${stage.label}`);

  const drillPanel = screen.getByLabelText("Timed paragraph drill");
  fireEvent.click(within(drillPanel).getByLabelText(`Select stem: ${bestStem.text}`));
  return { drillPanel, stage, bestStem };
}

function completeRelationshipsTimedDrillWithBestStems() {
  startRelationshipsTimedDrill();

  const selectedStems = [];
  for (let stageIndex = 0; stageIndex < 4; stageIndex += 1) {
    const selected = selectBestStem(stageIndex);
    selectedStems.push(selected.bestStem.text);
    fireEvent.click(within(selected.drillPanel).getByRole("button", {
      name: stageIndex === 3 ? "Complete drill" : "Next stage",
    }));
  }

  return selectedStems;
}

function bestSelectionIdsForRelationships() {
  const drill = getRapidRecallTimedParagraphDrillForItemId("route-relationships-misunderstanding");
  if (!drill) throw new Error("Missing timed paragraph drill fixture");

  return Object.fromEntries(drill.stages.map((stage) => {
    const bestStem = stage.stemOptions.find((option) => option.isBest);
    if (!bestStem) throw new Error(`Missing best stem for ${stage.label}`);
    return [stage.id, bestStem.id];
  }));
}

describe("RapidRecall", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders the Rapid Recall Workbook title and core drill modes", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Rapid Recall Workbook" })).toBeInTheDocument();
    expect(screen.getByText("Fast AO1-AO4 decision drills for Component 2 Prose.")).toBeInTheDocument();

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

  it("adds static route plans to route-selection drills and comparative multiple-choice route drills", () => {
    const routeSelectionItems = rapidRecallWorkbookItems.filter((item) => item.type === "route-selection");
    const comparativeMultipleChoiceItems = rapidRecallWorkbookItems.filter((item) => (
      item.type === "multiple-choice" && item.textFocus === "Comparative"
    ));

    expect(routeSelectionItems).toHaveLength(8);
    expect(routeSelectionItems.every((item) => item.routePlan)).toBe(true);
    expect(comparativeMultipleChoiceItems.length).toBeGreaterThanOrEqual(5);
    expect(comparativeMultipleChoiceItems.every((item) => item.routePlan)).toBe(true);
  });

  it("adds static timed paragraph drills to all route-selection plans and comparative route plans", () => {
    const routeSelectionItems = rapidRecallWorkbookItems.filter((item) => item.type === "route-selection");
    const comparativeMultipleChoiceItems = rapidRecallWorkbookItems.filter((item) => (
      item.type === "multiple-choice" && item.textFocus === "Comparative" && item.routePlan
    ));
    const timedRouteSelectionItems = routeSelectionItems.filter((item) => getRapidRecallTimedParagraphDrillForItemId(item.id));
    const timedComparativeMultipleChoiceItems = comparativeMultipleChoiceItems.filter((item) => (
      getRapidRecallTimedParagraphDrillForItemId(item.id)
    ));

    expect(getRapidRecallTimedParagraphDrillCount()).toBeGreaterThanOrEqual(12);
    expect(timedRouteSelectionItems).toHaveLength(8);
    expect(timedComparativeMultipleChoiceItems.length).toBeGreaterThanOrEqual(4);

    for (const drill of rapidRecallTimedParagraphDrills) {
      expect(drill.stages).toHaveLength(4);
      for (const stage of drill.stages) {
        expect(stage.stemOptions).toHaveLength(3);
        expect(stage.stemOptions.filter((option) => option.isBest)).toHaveLength(1);
      }
    }
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
    expect(JSON.stringify(rapidRecallTimedParagraphDrills)).not.toContain(excluded);
    expect(container).not.toHaveTextContent(excluded);
  });

  it("keeps timed paragraph drill AO tags limited to AO1, AO2, AO3 and AO4", () => {
    const allowedAos = new Set(RAPID_RECALL_AOS);

    for (const drill of rapidRecallTimedParagraphDrills) {
      for (const stage of drill.stages) {
        expect(stage.aoFocus.every((ao) => allowedAos.has(ao))).toBe(true);
      }
    }
  });

  it("shows route handoff actions only for suitable cards", () => {
    renderPage();

    expect(screen.getAllByRole("button", { name: /Build route from this drill/i }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("tab", { name: "Fill blanks" }));

    expect(screen.queryByRole("button", { name: /Build route from this drill/i })).not.toBeInTheDocument();
  });

  it("shows the timed paragraph drill action only after a timed route plan is opened", () => {
    renderPage();

    expect(screen.queryByRole("button", { name: "Start timed paragraph drill" })).not.toBeInTheDocument();

    const routePlanPanel = openRelationshipsRoutePlan();

    expect(within(routePlanPanel).getByRole("button", { name: "Start timed paragraph drill" })).toBeInTheDocument();
  });

  it("does not show the timed paragraph drill action for cards without a route plan", () => {
    renderPage();

    fireEvent.click(screen.getByRole("tab", { name: "Fill blanks" }));

    expect(screen.queryByRole("button", { name: "Start timed paragraph drill" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Build route from this drill/i })).not.toBeInTheDocument();
  });

  it("narrows visible cards with theme and text filters", () => {
    renderPage();

    expect(screen.getByText(/For a question on childhood/i)).toBeInTheDocument();
    expect(screen.getByText(/Which decision best frames gender/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Theme filter"), { target: { value: "childhood" } });
    fireEvent.change(screen.getByLabelText("Text filter"), { target: { value: "Comparative" } });
    fireEvent.change(screen.getByLabelText("AO filter"), { target: { value: "AO3" } });

    expect(screen.getByText(/For a question on childhood/i)).toBeInTheDocument();
    expect(screen.queryByText(/Which decision best frames gender/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Session summary")).toHaveTextContent("1");

    fireEvent.change(screen.getByLabelText("AO filter"), { target: { value: "AO2" } });

    expect(screen.queryByText(/For a question on childhood/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Session summary")).toHaveTextContent("0");
  });

  it("opens the timed paragraph drill on the first thesis stage with three stem options", () => {
    renderPage();

    const drillPanel = startRelationshipsTimedDrill();

    expect(within(drillPanel).getByRole("heading", { name: "Timed paragraph drill" })).toBeInTheDocument();
    expect(within(drillPanel).getByRole("heading", { name: "Thesis opening" })).toBeInTheDocument();
    expect(within(drillPanel).getByText("Suggested time: 90 seconds")).toBeInTheDocument();
    expect(within(drillPanel).getAllByRole("button", { name: /^Select stem:/ })).toHaveLength(3);
    expect(screen.queryByLabelText("Practice session summary")).not.toBeInTheDocument();
  });

  it("reveals the best timed stem explanation after selection", () => {
    renderPage();

    startRelationshipsTimedDrill();
    const { drillPanel, bestStem } = selectBestStem(0);

    expect(within(drillPanel).getByText("Why this works")).toBeInTheDocument();
    expect(within(drillPanel).getByText(bestStem.explanation)).toBeInTheDocument();
  });

  it("moves through thesis, Hard Times, Atonement and comparative judgement stages", () => {
    renderPage();

    startRelationshipsTimedDrill();

    let selected = selectBestStem(0);
    fireEvent.click(within(selected.drillPanel).getByRole("button", { name: "Next stage" }));
    expect(screen.getByRole("heading", { name: "Hard Times paragraph opening" })).toBeInTheDocument();

    selected = selectBestStem(1);
    fireEvent.click(within(selected.drillPanel).getByRole("button", { name: "Next stage" }));
    expect(screen.getByRole("heading", { name: "Atonement paragraph opening" })).toBeInTheDocument();

    selected = selectBestStem(2);
    fireEvent.click(within(selected.drillPanel).getByRole("button", { name: "Next stage" }));
    expect(screen.getByRole("heading", { name: "Comparative judgement opening" })).toBeInTheDocument();
  });

  it("resets the timed paragraph drill to the first stage", () => {
    renderPage();

    startRelationshipsTimedDrill();
    const selected = selectBestStem(0);
    fireEvent.click(within(selected.drillPanel).getByRole("button", { name: "Next stage" }));

    expect(screen.getByRole("heading", { name: "Hard Times paragraph opening" })).toBeInTheDocument();

    fireEvent.click(within(screen.getByLabelText("Timed paragraph drill")).getByRole("button", { name: "Reset drill" }));

    expect(screen.getByRole("heading", { name: "Thesis opening" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Select stem:/ })).toHaveLength(3);
  });

  it("shows completion and a practice session summary after the final timed paragraph drill stage", () => {
    renderPage();

    const selectedStems = completeRelationshipsTimedDrillWithBestStems();
    const summary = screen.getByLabelText("Practice session summary");
    const excluded = ["AO", "5"].join("");

    expect(screen.getByText("Route complete: thesis, Hard Times, Atonement, judgement.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy selected stems" })).toBeInTheDocument();
    expect(within(summary).getByRole("button", { name: "Use this summary in feedback coach" })).toBeInTheDocument();
    expect(within(summary).getByRole("heading", { name: "Practice session summary" })).toBeInTheDocument();
    for (const selectedStem of selectedStems) {
      expect(within(summary).getByText(selectedStem)).toBeInTheDocument();
    }
    expect(within(summary).getByText("AO focus covered")).toBeInTheDocument();
    expect(within(summary).getByText("AO1, AO2, AO3, AO4")).toBeInTheDocument();
    expect(within(summary).getByText("AO4 bridge")).toBeInTheDocument();
    expect(within(summary).getByText(/social miseducation in Dickens; narrative misperception in McEwan/i)).toBeInTheDocument();
    expect(within(summary).getByText("Exam warning")).toBeInTheDocument();
    expect(within(summary).getByText(/avoid two separate relationship summaries/i)).toBeInTheDocument();
    expect(within(summary).getByText("Next revision target")).toBeInTheDocument();
    expect(within(summary).getByText("Move to a timed handwritten paragraph using this route.")).toBeInTheDocument();
    expect(summary).not.toHaveTextContent(excluded);
  });

  it("copies the practice session summary after completion", async () => {
    renderPage();

    completeRelationshipsTimedDrillWithBestStems();
    fireEvent.click(within(screen.getByLabelText("Practice session summary")).getByRole("button", {
      name: "Copy session summary",
    }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("Practice Session Summary"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("Next revision target:"));
    expect(await screen.findByText("Session summary copied")).toBeInTheDocument();
  });

  it("copies a compact practice session summary for the feedback coach", async () => {
    renderPage();

    const selectedStems = completeRelationshipsTimedDrillWithBestStems();
    fireEvent.click(within(screen.getByLabelText("Practice session summary")).getByRole("button", {
      name: "Use this summary in feedback coach",
    }));

    const writeTextMock = vi.mocked(navigator.clipboard.writeText);
    const lastCall = writeTextMock.mock.calls[writeTextMock.mock.calls.length - 1];
    const copiedSummary = String(lastCall?.[0]);
    const excluded = ["AO", "5"].join("");

    expect(copiedSummary).toContain("Practice Session Summary");
    expect(copiedSummary).toContain("Selected route: thesis -> Hard Times -> Atonement -> comparative judgement");
    expect(copiedSummary).toContain("Route bridge:");
    for (const selectedStem of selectedStems) {
      expect(copiedSummary).toContain(selectedStem);
    }
    expect(copiedSummary).not.toContain(excluded);
    expect(copiedSummary).not.toMatch(/full essay|model answer|rewrite/i);
    expect(await screen.findByText("Session summary copied. Paste it into Route context on the feedback coach.")).toBeInTheDocument();
  });

  it("clears the practice session summary when retrying the timed drill", () => {
    renderPage();

    completeRelationshipsTimedDrillWithBestStems();
    expect(screen.getByLabelText("Practice session summary")).toBeInTheDocument();

    fireEvent.click(within(screen.getByLabelText("Practice session summary")).getByRole("button", {
      name: "Retry timed drill",
    }));

    expect(screen.queryByLabelText("Practice session summary")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Thesis opening" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Select stem:/ })).toHaveLength(3);
  });

  it("builds deterministic next revision targets from selected stem quality", () => {
    const item = rapidRecallWorkbookItems.find((candidate) => candidate.id === "route-relationships-misunderstanding");
    const drill = getRapidRecallTimedParagraphDrillForItemId("route-relationships-misunderstanding");
    if (!item?.routePlan || !drill) throw new Error("Missing timed paragraph drill fixture");

    const bestSelections = bestSelectionIdsForRelationships();
    const bestSummary = buildTimedDrillSessionSummary({
      drill,
      routePlan: item.routePlan,
      selectedOptionIds: bestSelections,
    });
    const weakerThesisSummary = buildTimedDrillSessionSummary({
      drill,
      routePlan: item.routePlan,
      selectedOptionIds: { ...bestSelections, [drill.stages[0].id]: "broad-comparison" },
    });
    const weakerJudgementSummary = buildTimedDrillSessionSummary({
      drill,
      routePlan: item.routePlan,
      selectedOptionIds: { ...bestSelections, [drill.stages[3].id]: "similar-different" },
    });
    const weakerHardTimesSummary = buildTimedDrillSessionSummary({
      drill,
      routePlan: item.routePlan,
      selectedOptionIds: { ...bestSelections, [drill.stages[1].id]: "hard-times-topic" },
    });
    const weakerAtonementSummary = buildTimedDrillSessionSummary({
      drill,
      routePlan: item.routePlan,
      selectedOptionIds: { ...bestSelections, [drill.stages[2].id]: "atonement-topic" },
    });

    expect(bestSummary.nextRevisionTarget).toBe("Move to a timed handwritten paragraph using this route.");
    expect(weakerThesisSummary.nextRevisionTarget).toBe("Strengthen the comparative argument before writing.");
    expect(weakerJudgementSummary.nextRevisionTarget).toBe("Strengthen the comparative argument before writing.");
    expect(weakerHardTimesSummary.nextRevisionTarget).toBe("Tighten the text-specific method/context link before writing.");
    expect(weakerAtonementSummary.nextRevisionTarget).toBe("Tighten the text-specific method/context link before writing.");
  });

  it("formats the practice session summary for copying", () => {
    const item = rapidRecallWorkbookItems.find((candidate) => candidate.id === "route-relationships-misunderstanding");
    const drill = getRapidRecallTimedParagraphDrillForItemId("route-relationships-misunderstanding");
    if (!item?.routePlan || !drill) throw new Error("Missing timed paragraph drill fixture");

    const summary = buildTimedDrillSessionSummary({
      drill,
      routePlan: item.routePlan,
      selectedOptionIds: bestSelectionIdsForRelationships(),
    });
    const formatted = formatTimedDrillSessionSummaryForCopy(summary);
    const excluded = ["AO", "5"].join("");

    expect(formatted).toContain("Practice Session Summary");
    expect(formatted).toContain("Theme: relationships");
    expect(formatted).toContain("Question focus: relationships damaged by misunderstanding");
    expect(formatted).toContain("Thesis opening:");
    expect(formatted).toContain("Hard Times opening:");
    expect(formatted).toContain("Atonement opening:");
    expect(formatted).toContain("Comparative judgement opening:");
    expect(formatted).toContain("AO focus covered: AO1, AO2, AO3, AO4");
    expect(formatted).toContain("AO4 bridge:");
    expect(formatted).toContain("Exam warning:");
    expect(formatted).toContain("Next revision target: Move to a timed handwritten paragraph using this route.");
    expect(formatted).not.toContain(excluded);
  });

  it("formats selected timed paragraph stems for copying", () => {
    const item = rapidRecallWorkbookItems.find((candidate) => candidate.id === "route-relationships-misunderstanding");
    const drill = getRapidRecallTimedParagraphDrillForItemId("route-relationships-misunderstanding");
    if (!item || !drill) throw new Error("Missing timed paragraph drill fixture");

    const selectedOptionIds = bestSelectionIdsForRelationships();
    const formatted = formatTimedParagraphDrillText({ item, drill, selectedOptionIds });
    const excluded = ["AO", "5"].join("");

    expect(formatted).toContain("Timed Paragraph Drill");
    expect(formatted).toContain("Theme:");
    expect(formatted).toContain("Question focus:");
    expect(formatted).toContain("Thesis opening:");
    expect(formatted).toContain("Hard Times opening:");
    expect(formatted).toContain("Atonement opening:");
    expect(formatted).toContain("Comparative judgement opening:");
    expect(formatted).toContain("AO focus: AO1, AO2, AO3, AO4");
    expect(formatted).toContain("Exam warning:");
    expect(formatted).not.toContain(excluded);
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

  it("builds and copies a compact route plan from a route-selection drill", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("tab", { name: "Route selection" }));
    fireEvent.click(screen.getByRole("button", {
      name: /Build route from this drill for Question focus: relationships damaged by misunderstanding/i,
    }));

    const panel = screen.getByLabelText("Rapid Recall route plan handoff");
    expect(within(panel).getByRole("heading", { name: "4-step Component 2 route plan" })).toBeInTheDocument();
    expect(within(panel).getByText(/Planning route only - not a full essay generator/i)).toBeInTheDocument();
    expect(within(panel).getByText("1. Comparative thesis")).toBeInTheDocument();
    expect(within(panel).getByRole("heading", { name: "2. Hard Times paragraph route" })).toBeInTheDocument();
    expect(within(panel).getByRole("heading", { name: "3. Atonement paragraph route" })).toBeInTheDocument();
    expect(within(panel).getByRole("heading", { name: "4. Comparative judgement route" })).toBeInTheDocument();
    expect(within(panel).getAllByText(/AO4 bridge/i).length).toBeGreaterThan(0);

    fireEvent.click(within(panel).getByRole("button", { name: "Copy route plan" }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("Rapid Recall Route Plan"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("Planning route only - not a full essay."));
    expect(await screen.findByText("Route plan copied")).toBeInTheDocument();
  });

  it("builds a route plan from a comparative multiple-choice drill without rendering excluded wording", () => {
    const { container } = renderPage();
    const excluded = ["AO", "5"].join("");

    fireEvent.click(screen.getByRole("button", {
      name: /Build route from this drill for For a question on childhood/i,
    }));

    expect(screen.getByLabelText("Rapid Recall route plan handoff")).toHaveTextContent("childhood as shaped by adult systems");
    expect(container).not.toHaveTextContent(excluded);
  });

  it("renders a print-friendly workbook layout", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Printable layout" }));

    expect(screen.getByLabelText("Printable Rapid Recall Workbook")).toBeInTheDocument();
    expect(screen.getAllByText(/Answer: ______________________________/i).length).toBeGreaterThan(0);
  });
});
