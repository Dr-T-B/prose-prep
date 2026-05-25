import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { annotatedEssayPracticePack } from "@/data/annotatedEssayPracticePack";
import { completeAnnotatedEssayFixture } from "@/test/fixtures/annotatedEssayPracticePack.fixture";

const loadAnnotatedEssayPracticePackMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prose/annotatedEssays", () => ({
  loadAnnotatedEssayPracticePack: loadAnnotatedEssayPracticePackMock,
}));

import AnnotatedEssayPack from "./AnnotatedEssayPack";

async function renderSettledAnnotatedEssayPack() {
  const view = render(<AnnotatedEssayPack />);
  await waitFor(() => expect(screen.queryByText("Loading live data")).not.toBeInTheDocument());
  return view;
}

describe("AnnotatedEssayPack", () => {
  beforeEach(() => {
    loadAnnotatedEssayPracticePackMock.mockReset();
    loadAnnotatedEssayPracticePackMock.mockResolvedValue({
      pack: annotatedEssayPracticePack,
      source: "fallback",
      diagnostics: [],
    });
  });

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

  it("opens the essay and renders paragraph annotations", async () => {
    await renderSettledAnnotatedEssayPack();

    expect(screen.getByRole("heading", { name: /Annotated Paper 2 Essay Practice Pack/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Compare how the writers present the roles of children/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Paragraph 1/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Why it scores:/i).length).toBeGreaterThan(0);
  });

  it("renders live Supabase data when the repository returns it", async () => {
    const livePack = {
      ...annotatedEssayPracticePack,
      title: "Live Supabase Annotated Essay Pack",
      essay_questions: [
        {
          ...annotatedEssayPracticePack.essay_questions[0],
          question_text: "Live Supabase question: compare knowledge.",
          provenance: {
            ...annotatedEssayPracticePack.essay_questions[0].provenance,
            verification_status: "teacher review required",
            reviewed: false,
          },
        },
        ...annotatedEssayPracticePack.essay_questions.slice(1),
      ],
      annotated_essays: [
        {
          ...annotatedEssayPracticePack.annotated_essays[0],
          title: "Live Supabase Model Essay",
          thesis: "Live Supabase thesis loaded through the repository.",
        },
      ],
    };
    loadAnnotatedEssayPracticePackMock.mockResolvedValueOnce({
      pack: livePack,
      source: "supabase",
      diagnostics: [],
    });

    await renderSettledAnnotatedEssayPack();

    expect(screen.getByText("Live Supabase Annotated Essay Pack")).toBeInTheDocument();
    expect(screen.getByText("Live Supabase")).toBeInTheDocument();
    expect(screen.getAllByText(/Live Supabase question: compare knowledge/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Teacher Review Required").length).toBeGreaterThan(0);
  });

  it("keeps bundled fallback seed data visible when live data is unavailable", async () => {
    loadAnnotatedEssayPracticePackMock.mockResolvedValueOnce({
      pack: annotatedEssayPracticePack,
      source: "fallback",
      diagnostics: ["Supabase returned no essay_questions rows; bundled seed data is being used."],
    });

    await renderSettledAnnotatedEssayPack();

    expect(screen.getByRole("heading", { name: /Annotated Paper 2 Essay Practice Pack/i })).toBeInTheDocument();
    expect(screen.getByText("Bundled fallback")).toBeInTheDocument();
    expect(screen.getAllByText(/Compare how the writers present the roles of children/i).length).toBeGreaterThan(0);
  });

  it("shows teacher-review-required status badges", async () => {
    await renderSettledAnnotatedEssayPack();

    expect(screen.getAllByText("Teacher Review Required")).not.toHaveLength(0);
  });

  it("toggles AO-specific annotations and hides them for self-testing", async () => {
    await renderSettledAnnotatedEssayPack();

    fireEvent.click(screen.getByRole("button", { name: "AO2 only" }));
    expect(screen.getAllByText("AO2 method").length).toBeGreaterThan(0);
    expect(screen.queryByText("evaluative comment")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Hide annotations/i }));
    expect(screen.getAllByText(/Annotations hidden for self-testing/i).length).toBeGreaterThan(0);
  });

  it("filters paragraph stems by theme in drill mode", async () => {
    await renderSettledAnnotatedEssayPack();

    fireEvent.change(screen.getByLabelText("Theme"), { target: { value: "marriage" } });

    expect(screen.getByText(/Marriage becomes a social technology/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Louisa Gradgrind/i).length).toBeGreaterThan(0);
  });

  it("links a question route to a model essay, quote clusters and stems", async () => {
    await renderSettledAnnotatedEssayPack();

    const routePanel = screen.getByRole("heading", { name: "Question Route, Links And Pitfalls" }).closest("section");
    expect(routePanel).not.toBeNull();
    const route = within(routePanel!);

    expect(route.getByText("Key quote clusters")).toBeInTheDocument();
    expect(route.getByText("Linked paragraph stems")).toBeInTheDocument();
    expect(route.getByText(/Level 5 Timed Model: Roles of Children/i)).toBeInTheDocument();
  });

  it("links timed practice to the model thesis and annotated model essay", async () => {
    await renderSettledAnnotatedEssayPack();

    fireEvent.click(screen.getByRole("button", { name: /Compare with model answer/i }));

    expect(screen.getByText("Model thesis")).toBeInTheDocument();
    expect(screen.getAllByText(/Dickens presents childhood as something adult systems deform/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Open annotated model essay/i })).toBeInTheDocument();
  });

  it("reveals the AO overlay trainer annotations", async () => {
    await renderSettledAnnotatedEssayPack();

    fireEvent.click(screen.getByRole("button", { name: /Reveal annotated answer/i }));

    expect(screen.getAllByText(/A clean comparative method sentence/i).length).toBeGreaterThan(0);
  });
});
