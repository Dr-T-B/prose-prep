import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Ao3ContextRoutePanel from "./Ao3ContextRoutePanel";
import { getAo3ContextRouteById } from "@/lib/ao3ContextRoutes";

describe("Ao3ContextRoutePanel", () => {
  it("renders the core AO3 planning fields for a route", () => {
    const route = getAo3ContextRouteById("AO3-01");
    expect(route).toBeDefined();

    render(<Ao3ContextRoutePanel route={route!} />);

    expect(screen.getByText("Core AO3 Context Claim")).toBeInTheDocument();
    expect(screen.getByText(route!.coreContextClaim)).toBeInTheDocument();
    expect(screen.getByText("Hard Times context")).toBeInTheDocument();
    expect(screen.getByText(route!.hardTimesContext)).toBeInTheDocument();
    expect(screen.getByText("Atonement context")).toBeInTheDocument();
    expect(screen.getByText(route!.atonementContext)).toBeInTheDocument();
    expect(screen.getByText("AO2 Method Link")).toBeInTheDocument();
    expect(screen.getByText(route!.ao2MethodLink)).toBeInTheDocument();
    expect(screen.getByText("AO4 Comparative Hinge")).toBeInTheDocument();
    expect(screen.getByText(route!.ao4ComparativeHinge)).toBeInTheDocument();
    expect(screen.getByText("Misuse / Pitfall to Avoid")).toBeInTheDocument();
    expect(screen.getByText(route!.misuseWarning)).toBeInTheDocument();
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
  });
});
