import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GradeBModeProvider } from "@/contexts/GradeBModeContext";
import { setCurrentPlan } from "@/lib/planStore";
import type { ContentBundle } from "@/lib/contentRepo";
import { renderPlanText } from "@/lib/planLogic";
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
    expect(screen.getAllByText(/classroom dialogue/).length).toBeGreaterThan(0);
    expect(screen.getByText(/utilitarian schooling/)).toBeInTheDocument();
    expect(screen.getByText(/external pressure/)).toBeInTheDocument();
    expect(screen.getByText(/Louisa and Briony/)).toBeInTheDocument();
    expect(screen.getByText(/Narrative perspective controls/)).toBeInTheDocument();
    expect(screen.getByText(/Opening formation shapes/)).toBeInTheDocument();
    expect(screen.getByText(/2023 Q2 direct fit/)).toBeInTheDocument();

    expect(screen.getByText("Suggested AO Route Combination")).toBeInTheDocument();
    expect(screen.getByText("AO1 thesis route")).toBeInTheDocument();
    expect(screen.getByText("AO2 method routes")).toBeInTheDocument();
    expect(screen.getByText("AO3 context routes")).toBeInTheDocument();
    expect(screen.getByText("AO4 comparative hinge routes")).toBeInTheDocument();
    expect(screen.getByText("AO3 Context Routes")).toBeInTheDocument();
    expect(screen.getByText("Core AO3 Context Claim")).toBeInTheDocument();
  });

  it("renders a matrix route handoff in ExploreIntake, allows creating a paragraph card, and prevents duplicate cards on subsequent clicks", async () => {
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
      builder_handoffs: [
        {
          id: "comparison:matrix:cm-childhood-route",
          kind: "comparison",
          originModule: "comparison",
          label: "Comparative Route",
          title: "Roles of children",
          text: "Both novels make childhood formation the origin of later damage.",
          sourceText: "# Comparative Route: Roles of children...",
          family: "childhood",
          metadata: {
            source: "comparative_matrix",
            axis: "Roles of children",
            hardTimes: "Dickens tests childhood through a restrictive schoolroom.",
            atonement: "McEwan tests childhood through a misreading child narrator.",
            thesis: "Both novels make childhood formation the origin of later damage.",
            ao2: "AO2 method detail for classroom dialogue and child focalisation.",
            ao3: "AO3 context detail for utilitarian schooling and inter-war class assumptions.",
            ao4: "AO4 comparison detail linking external pressure to internalised misreading.",
            examFit: "2023 Q2 direct fit.",
          },
        },
      ],
    });

    render(
      <GradeBModeProvider>
        <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <EssayBuilder />
        </MemoryRouter>
      </GradeBModeProvider>,
    );

    expect(screen.getByText("Planning notes attached to this essay")).toBeInTheDocument();
    expect(screen.getAllByText("Roles of children").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Both novels make childhood formation the origin of later damage.").length).toBeGreaterThan(0);

    const createBtn = screen.getByRole("button", { name: "Create paragraph card from Roles of children" });
    expect(createBtn).toBeInTheDocument();
    expect(createBtn).not.toBeDisabled();

    fireEvent.click(createBtn);

    expect(await screen.findByRole("button", { name: "Paragraph card from Roles of children created" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Paragraph card from Roles of children created" })).toBeDisabled();

    const plan = JSON.parse(localStorage.getItem("c2p.currentPlan.v1") || "{}");
    expect(plan.paragraph_cards.length).toBe(1);
    const card = plan.paragraph_cards[0];
    expect(card.id).toBe("paragraph:matrix:comparison:matrix:cm-childhood-route");
    expect(card.title).toBe("Roles of children");
    expect(card.claim).toBe("Both novels make childhood formation the origin of later damage.");
    expect(card.method_focus).toBe("AO2 method detail for classroom dialogue and child focalisation.");
    expect(card.context_anchor).toBe("AO3 context detail for utilitarian schooling and inter-war class assumptions.");
    expect(card.comparative_direction).toBe("AO4 comparison detail linking external pressure to internalised misreading.");
    expect(card.notes).toContain("Hard Times: Dickens tests childhood through a restrictive schoolroom.");
    expect(card.notes).toContain("Atonement: McEwan tests childhood through a misreading child narrator.");
    expect(card.notes).toContain("Exam suitability: 2023 Q2 direct fit.");
    expect(card.notes).toContain("Next step: Add quotations and refine into an exam paragraph.");
    expect(card.draft).toBe(true);

    expect(JSON.stringify(card)).not.toContain("AO5");
    expect(JSON.stringify(card)).not.toContain("ao5");
  });

  it("renderPlanText formats paragraph_cards correctly when present, and falls back to paragraph_jobs when empty", () => {
    const planWithCards = {
      id: "plan-childhood",
      updated_at: 1,
      family: "childhood" as any,
      question_id: "q-childhood",
      route_id: "r-childhood",
      thesis_level: "strong" as any,
      selected_quote_ids: [],
      interpretive_extension_enabled: false,
      selected_interpretive_extension_ids: [],
      paragraph_cards: [
        {
          id: "paragraph:matrix:comparison:matrix:cm-childhood-route",
          title: "Roles of children",
          claim: "Both novels make childhood formation the origin of later damage.",
          comparative_direction: "AO4 comparison detail linking external pressure to internalised misreading.",
          evidence_ht_ids: [],
          evidence_at_ids: [],
          evidence_cmp_ids: [],
          method_focus: "AO2 method detail for classroom dialogue and child focalisation.",
          context_anchor: "AO3 context detail for utilitarian schooling and inter-war class assumptions.",
          analytical_position_prompt: "",
          notes: "Hard Times: Dickens tests childhood through a restrictive schoolroom.\nAtonement: McEwan tests childhood through a misreading child narrator.",
          draft: true,
        },
      ],
      builder_handoffs: [],
    };

    const outputWithCards = renderPlanText(planWithCards, content);
    expect(outputWithCards).toContain("PARAGRAPH CARDS");
    expect(outputWithCards).toContain("Paragraph 1 — Roles of children");
    expect(outputWithCards).toContain("Claim:\nBoth novels make childhood formation the origin of later damage.");
    expect(outputWithCards).toContain("Comparative direction:\nAO4 comparison detail linking external pressure to internalised misreading.");
    expect(outputWithCards).toContain("AO2 — Method:\nAO2 method detail for classroom dialogue and child focalisation.");
    expect(outputWithCards).toContain("AO3 — Context:\nAO3 context detail for utilitarian schooling and inter-war class assumptions.");
    expect(outputWithCards).toContain("Notes:\nHard Times: Dickens tests childhood through a restrictive schoolroom.\nAtonement: McEwan tests childhood through a misreading child narrator.");
    expect(outputWithCards).toContain("FINAL CHECKLIST");
    expect(outputWithCards).toContain("- AO1: argument is sustained");
    expect(outputWithCards).toContain("- AO4: comparison remains active");
    expect(outputWithCards).not.toContain("AO5");

    const planEmptyCards = {
      ...planWithCards,
      paragraph_cards: [],
    };
    const outputEmptyCards = renderPlanText(planEmptyCards, content);
    expect(outputEmptyCards).not.toContain("PARAGRAPH CARDS");
    expect(outputEmptyCards).not.toContain("FINAL CHECKLIST");
  });

  it("LiveOutput component in EssayBuilder renders paragraph_cards correctly when present", async () => {
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
      paragraph_cards: [
        {
          id: "paragraph:matrix:comparison:matrix:cm-childhood-route",
          title: "Roles of children",
          claim: "Both novels make childhood formation the origin of later damage.",
          comparative_direction: "AO4 comparison detail linking external pressure to internalised misreading.",
          evidence_ht_ids: [],
          evidence_at_ids: [],
          evidence_cmp_ids: [],
          method_focus: "AO2 method detail for classroom dialogue and child focalisation.",
          context_anchor: "AO3 context detail for utilitarian schooling and inter-war class assumptions.",
          analytical_position_prompt: "",
          notes: "Hard Times: Dickens tests childhood through a restrictive schoolroom.\nAtonement: McEwan tests childhood through a misreading child narrator.",
          draft: true,
        },
      ],
      builder_handoffs: [],
    });

    render(
      <GradeBModeProvider>
        <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <EssayBuilder />
        </MemoryRouter>
      </GradeBModeProvider>,
    );

    expect(screen.getByText("Paragraph cards")).toBeInTheDocument();
    expect(screen.getAllByText("Roles of children").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AO2 Method:").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AO2 method detail for classroom dialogue and child focalisation.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AO3 Context:").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AO3 context detail for utilitarian schooling and inter-war class assumptions.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Comparative direction:").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AO4 comparison detail linking external pressure to internalised misreading.").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Hard Times: Dickens tests childhood/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Final checklist").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/comparison remains active/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
  });
});
