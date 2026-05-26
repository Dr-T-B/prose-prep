import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GradeBModeProvider } from "@/contexts/GradeBModeContext";
import { setCurrentPlan } from "@/lib/planStore";
import type { ContentBundle } from "@/lib/contentRepo";
import EssayBuilder from "./EssayBuilder";

const content: ContentBundle = {
  routes: [
    {
      id: "r-childhood",
      name: "Childhood formation",
      core_question: "How do childhood systems shape later moral damage?",
      hard_times_emphasis: "Gradgrind's schoolroom as formation.",
      atonement_emphasis: "Briony's misreading as formation.",
      comparative_insight: "External system versus internalised story.",
      best_use: "Use for questions about children and formation.",
      level_tag: "strong",
    },
    {
      id: "r-alt",
      name: "Alternative childhood route",
      core_question: "How does childhood create pressure?",
      hard_times_emphasis: "Alternative Hard Times route.",
      atonement_emphasis: "Alternative Atonement route.",
      comparative_insight: "Alternative comparison.",
      best_use: "Alternative use.",
      level_tag: "secure",
    },
  ],
  questions: [
    {
      id: "q-childhood",
      family: "childhood",
      stem: "Compare the roles of children in both novels.",
      primary_route_id: "r-childhood",
      secondary_route_id: "r-alt",
      likely_core_methods: [],
      level_tag: "strong",
    },
  ],
  theses: [],
  paragraph_jobs: [],
  quote_methods: [],
  interpretive_tensions: [],
  characters: [],
  themes: [],
  symbols: [],
  comparative_matrix: [
    {
      id: "cm-childhood-route",
      axis: "Roles of children",
      hard_times: "Dickens tests childhood through a restrictive schoolroom.",
      atonement: "McEwan tests childhood through a misreading child narrator.",
      divergence: "Dickens condemns formation from outside; McEwan stages error from within.",
      themes: ["childhood"],
      level_band: "strong",
      ao2: "AO2 method detail for classroom dialogue and child focalisation.",
      ao3: "AO3 context detail for utilitarian schooling and inter-war class assumptions.",
      ao4: "AO4 comparison detail linking external pressure to internalised misreading.",
      thesis: "Both novels make childhood formation the origin of later damage.",
      character: "Louisa and Briony expose different kinds of formation.",
      narrative: "Narrative perspective controls how each childhood is judged.",
      structure: "Opening formation shapes the consequences that follow.",
      exam_fit: "2023 Q2 direct fit.",
    },
  ],
  glossary_terms: [],
  paragraph_stems: [],
  modules: [],
  lessons: [],
  resources: [],
  source: "local",
};

vi.mock("@/lib/ContentProvider", () => ({
  useContent: () => content,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/lib/planRepository", () => ({
  listCloudPlans: vi.fn(() => Promise.resolve([])),
  saveCurrentPlanHybrid: vi.fn(),
  setLocalCurrentPlan: vi.fn(),
}));

vi.mock("@/components/ParagraphEngine", () => ({
  default: () => <div data-testid="paragraph-engine" />,
}));

vi.mock("@/components/QuotePicker", () => ({
  default: () => <div data-testid="quote-picker" />,
}));

describe("EssayBuilder", () => {
  beforeEach(() => {
    localStorage.clear();
    setCurrentPlan({
      id: "plan-childhood",
      updated_at: 1,
      family: "childhood",
      question_id: "q-childhood",
      route_id: "r-childhood",
      thesis_level: "strong",
      selected_quote_ids: [],
      interpretive_extension_enabled: false,
      selected_interpretive_extension_ids: [],
      paragraph_cards: [],
      builder_handoffs: [],
    });
  });

  it("shows Comparative Matrix AO-content in the essay planning route", async () => {
    render(
      <GradeBModeProvider>
        <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <EssayBuilder />
        </MemoryRouter>
      </GradeBModeProvider>,
    );

    expect(await screen.findByText("Essay planning route")).toBeInTheDocument();
    expect(screen.getByText("Thesis route")).toBeInTheDocument();
    expect(screen.getByText("AO2 method angle")).toBeInTheDocument();
    expect(screen.getByText("AO3 context angle")).toBeInTheDocument();
    expect(screen.getByText("AO4 comparative link")).toBeInTheDocument();
    expect(screen.getByText("Character cue")).toBeInTheDocument();
    expect(screen.getByText("Narrative cue")).toBeInTheDocument();
    expect(screen.getByText("Structure cue")).toBeInTheDocument();
    expect(screen.getByText("Exam fit")).toBeInTheDocument();
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();

    expect(screen.getByText(/childhood formation/)).toBeInTheDocument();
    expect(screen.getByText(/classroom dialogue/)).toBeInTheDocument();
    expect(screen.getByText(/utilitarian schooling/)).toBeInTheDocument();
    expect(screen.getByText(/external pressure/)).toBeInTheDocument();
    expect(screen.getByText(/Louisa and Briony/)).toBeInTheDocument();
    expect(screen.getByText(/Narrative perspective controls/)).toBeInTheDocument();
    expect(screen.getByText(/Opening formation shapes/)).toBeInTheDocument();
    expect(screen.getByText(/2023 Q2 direct fit/)).toBeInTheDocument();
  });
});
