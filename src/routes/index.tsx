import { createFileRoute } from "@tanstack/react-router";
import { Component2DashboardMock } from "@/components/Component2DashboardMock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Edexcel A-Level Prose Revision — Hard Times & Atonement (Prototype)" },
      {
        name: "description",
        content:
          "Mock-data prototype for Pearson Edexcel A-Level English Literature Component 2: Prose revision (Hard Times & Atonement).",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      <div className="border-b border-border bg-muted/40 px-4 py-3 print:hidden">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Prototype · mock data only
          </span>
          <p className="text-sm text-muted-foreground">
            This tool supports Pearson Edexcel A-Level English Literature Component 2: Prose
            revision for <em>Hard Times</em> and <em>Atonement</em>. It is currently a
            mock-data prototype.
          </p>
        </div>
      </div>
      <Component2DashboardMock />
    </div>
  );
}
