import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Compare from "./Compare";

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location-path">{location.pathname}</span>;
}

describe("Compare", () => {
  it("redirects legacy /compare traffic to the canonical /matrix experience", () => {
    render(
      <MemoryRouter
        initialEntries={["/compare"]}
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <Routes>
          <Route path="/compare" element={<Compare />} />
          <Route
            path="/matrix"
            element={(
              <>
                <h1>Comparative Revision Matrix</h1>
                <LocationProbe />
              </>
            )}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Comparative Revision Matrix" })).toBeInTheDocument();
    expect(screen.getByTestId("location-path")).toHaveTextContent("/matrix");
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
  });
});
