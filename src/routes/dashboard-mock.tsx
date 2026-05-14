import { createFileRoute } from "@tanstack/react-router";
import { Component2DashboardMock } from "@/components/Component2DashboardMock";

export const Route = createFileRoute("/dashboard-mock")({
  head: () => ({
    meta: [
      { title: "Component 2 Dashboard — Prose Revision (Mock)" },
      {
        name: "description",
        content:
          "Sandbox prototype dashboard for Pearson Edexcel A-Level English Literature Component 2: Prose, comparing Hard Times and Atonement.",
      },
    ],
  }),
  component: Component2DashboardMock,
});
