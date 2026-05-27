import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Ao1ConceptRoutePanel from "./Ao1ConceptRoutePanel";
import { getAo1ConceptRouteById } from "@/lib/ao1ConceptRoutes";

describe("Ao1ConceptRoutePanel", () => {
  it("renders the source-locked AO1 thesis planning fields for a route", () => {
    const route = getAo1ConceptRouteById("AO1-015");
    expect(route).toBeDefined();

    render(<Ao1ConceptRoutePanel route={route!} />);

    expect(screen.getByText("AO1 Concept Route")).toBeInTheDocument();
    expect(screen.getByText(route!.themeFocus)).toBeInTheDocument();
    expect(screen.getByText("Core AO1 argument")).toBeInTheDocument();
    expect(screen.getByText(route!.coreAo1Argument)).toBeInTheDocument();
    expect(screen.getByText("Hard Times conceptual route")).toBeInTheDocument();
    expect(screen.getByText(route!.hardTimesConceptualRoute)).toBeInTheDocument();
    expect(screen.getByText("Atonement conceptual route")).toBeInTheDocument();
    expect(screen.getByText(route!.atonementConceptualRoute)).toBeInTheDocument();
    expect(screen.getByText("Comparative hinge / judgement")).toBeInTheDocument();
    expect(screen.getByText(route!.comparativeHingeJudgement)).toBeInTheDocument();
    expect(screen.getByText("Likely exam stems")).toBeInTheDocument();
    expect(screen.getByText(route!.likelyExamStems)).toBeInTheDocument();
    expect(screen.getByText("Thesis sentence starter")).toBeInTheDocument();
    expect(screen.getByText(route!.thesisSentenceStarter)).toBeInTheDocument();
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
  });
});
