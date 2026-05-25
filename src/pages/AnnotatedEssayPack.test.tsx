import { fireEvent, render as rtlRender, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";
import AnnotatedEssayPack from "./AnnotatedEssayPack";
import { completeAnnotatedEssayFixture } from "@/test/fixtures/annotatedEssayPracticePack.fixture";

// The page now uses react-query (via useAnnotatedEssayPackContent). The hook
// falls back to the bundled seed when Supabase is unreachable, so tests do not
// need a network mock — they just need a QueryClient in scope.
function render(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return rtlRender(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("AnnotatedEssayPack", () => {
  it("provides a complete reviewed-status fixture without Component 2 AO5 scoring", () => {
    const { essay, question, paragraphs, annotations, pack } = completeAnnotatedEssayFixture;

    expect(essay.full_essay_text.length).toBeGreaterThan(4000);
    expect(question.ao_requirements).toEqual(["AO1", "AO2", "AO3", "AO4"]);
    expect(paragraphs).toHaveLength(6);
    expect(annotations.length).toBeGreaterThanOrEqual(10);
    expect(pack.paragraph_stems.length).toBeGreaterThanOrEqual(10);
    expect(pack.essay_questions.flatMap((item) => item.ao_requirements)).not.toContain("AO5");
    expect(pack.essay_paragraphs.flatMap((item) => item.ao_coverage)).not.toContain("AO5");
    expect(pack.ao_annotations.flatMap((item) => item.ao_tags)).not.toContain("AO5");
    expect(essay.provenance.verification_status).toBe("teacher review required");
  });

  it("opens the essay and renders paragraph annotations", () => {
    render(<AnnotatedEssayPack />);

    expect(screen.getByRole("heading", { name: /Annotated Paper 2 Essay Practice Pack/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Compare how the writers present the roles of children/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Paragraph 1/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Why it scores:/i).length).toBeGreaterThan(0);
  });

  it("toggles AO-specific annotations and hides them for self-testing", () => {
    render(<AnnotatedEssayPack />);

    fireEvent.click(screen.getByRole("button", { name: "AO2 only" }));
    expect(screen.getAllByText("AO2 method").length).toBeGreaterThan(0);
    expect(screen.queryByText("evaluative comment")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Hide annotations/i }));
    expect(screen.getAllByText(/Annotations hidden for self-testing/i).length).toBeGreaterThan(0);
  });

  it("filters paragraph stems by theme in drill mode", () => {
    render(<AnnotatedEssayPack />);

    fireEvent.change(screen.getByLabelText("Theme"), { target: { value: "marriage" } });

    expect(screen.getByText(/Marriage becomes a social technology/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Louisa Gradgrind/i).length).toBeGreaterThan(0);
  });

  it("links a question route to a model essay, quote clusters and stems", () => {
    render(<AnnotatedEssayPack />);

    const routePanel = screen.getByRole("heading", { name: "Question Route, Links And Pitfalls" }).closest("section");
    expect(routePanel).not.toBeNull();
    const route = within(routePanel!);

    expect(route.getByText("Key quote clusters")).toBeInTheDocument();
    expect(route.getByText("Linked paragraph stems")).toBeInTheDocument();
    expect(route.getByText(/Level 5 Timed Model: Roles of Children/i)).toBeInTheDocument();
  });

  it("links timed practice to the model thesis and annotated model essay", () => {
    render(<AnnotatedEssayPack />);

    fireEvent.click(screen.getByRole("button", { name: /Compare with model answer/i }));

    expect(screen.getByText("Model thesis")).toBeInTheDocument();
    expect(screen.getAllByText(/Dickens presents childhood as something adult systems deform/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Open annotated model essay/i })).toBeInTheDocument();
  });

  it("reveals the AO overlay trainer annotations", () => {
    render(<AnnotatedEssayPack />);

    fireEvent.click(screen.getByRole("button", { name: /Reveal annotated answer/i }));

    expect(screen.getAllByText(/A clean comparative method sentence/i).length).toBeGreaterThan(0);
  });
});
