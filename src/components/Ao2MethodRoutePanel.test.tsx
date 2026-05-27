import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Ao2MethodRoutePanel from "./Ao2MethodRoutePanel";
import { getAo2MethodRouteById } from "@/lib/ao2MethodRoutes";

describe("Ao2MethodRoutePanel", () => {
  it("renders the source-locked AO2 method planning fields for a route", () => {
    const route = getAo2MethodRouteById("AO2-04");
    expect(route).toBeDefined();

    render(<Ao2MethodRoutePanel route={route!} />);

    expect(screen.getByText("AO2 Method Route")).toBeInTheDocument();
    expect(screen.getByText(route!.ao2Route)).toBeInTheDocument();
    expect(screen.getByText("Hard Times method")).toBeInTheDocument();
    expect(screen.getByText(route!.hardTimesMethod)).toBeInTheDocument();
    expect(screen.getByText(route!.hardTimesEvidenceZone)).toBeInTheDocument();
    expect(screen.getByText(route!.hardTimesAo2Effect)).toBeInTheDocument();
    expect(screen.getByText("Atonement method")).toBeInTheDocument();
    expect(screen.getByText(route!.atonementMethod)).toBeInTheDocument();
    expect(screen.getByText(route!.atonementEvidenceZone)).toBeInTheDocument();
    expect(screen.getByText(route!.atonementAo2Effect)).toBeInTheDocument();
    expect(screen.getByText("Comparative AO4 hinge")).toBeInTheDocument();
    expect(screen.getByText(route!.comparativeAo4Hinge)).toBeInTheDocument();
    expect(screen.getByText("Best themes")).toBeInTheDocument();
    expect(screen.getByText(route!.bestThemes)).toBeInTheDocument();
    expect(screen.getByText("Exam sentence stem")).toBeInTheDocument();
    expect(screen.getByText(route!.examSentenceStem)).toBeInTheDocument();
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
  });
});
