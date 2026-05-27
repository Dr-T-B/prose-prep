import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Ao4ComparativeRoutePanel from "./Ao4ComparativeRoutePanel";
import { getAo4ComparativeRouteById } from "@/lib/ao4ComparativeRoutes";

describe("Ao4ComparativeRoutePanel", () => {
  it("renders the source-locked AO4 planning fields for a route", () => {
    const route = getAo4ComparativeRouteById("AO4-03");
    expect(route).toBeDefined();

    render(<Ao4ComparativeRoutePanel route={route!} />);

    expect(screen.getByText("AO4 Comparative Route")).toBeInTheDocument();
    expect(screen.getByText(route!.themeExamTrigger)).toBeInTheDocument();
    expect(screen.getByText("Comparative Thesis")).toBeInTheDocument();
    expect(screen.getByText(route!.comparativeThesis)).toBeInTheDocument();
    expect(screen.getByText("Hard Times comparison point")).toBeInTheDocument();
    expect(screen.getByText(route!.hardTimesComparisonPoint)).toBeInTheDocument();
    expect(screen.getByText("Atonement comparison point")).toBeInTheDocument();
    expect(screen.getByText(route!.atonementComparisonPoint)).toBeInTheDocument();
    expect(screen.getByText("Similarity")).toBeInTheDocument();
    expect(screen.getByText(route!.similarity)).toBeInTheDocument();
    expect(screen.getByText("Difference")).toBeInTheDocument();
    expect(screen.getByText(route!.difference)).toBeInTheDocument();
    expect(screen.getByText("AO4 hinge / conceptual bridge")).toBeInTheDocument();
    expect(screen.getByText(route!.conceptualBridge)).toBeInTheDocument();
    expect(screen.getByText("Best evidence zones")).toBeInTheDocument();
    expect(screen.getByText(route!.bestEvidenceZones)).toBeInTheDocument();
    expect(screen.getByText("Paragraph route")).toBeInTheDocument();
    expect(screen.getByText(route!.paragraphRoute)).toBeInTheDocument();
    expect(screen.getByText("Exam sentence stem")).toBeInTheDocument();
    expect(screen.getByText(route!.examSentenceStem)).toBeInTheDocument();
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
  });
});
