import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GradeBModeProvider } from "@/contexts/GradeBModeContext";
import { setCurrentPlan, getCurrentPlan } from "@/lib/planStore";
import { ROUTE_HANDOFF_ID } from "@/lib/builderHandoff";
import type { ContentBundle } from "@/lib/contentRepo";
import ParagraphEngine from "./ParagraphEngine";

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
  ],
  questions: [
    {
      id: "q-childhood",
      family: "childhood",
      stem: "Compare the roles of children in both novels.",
      primary_route_id: "r-childhood",
      secondary_route_id: "r-childhood",
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
  comparative_matrix: [],
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

const baseHandoff = {
  id: ROUTE_HANDOFF_ID,
  kind: "comparison" as const,
  originModule: "comparison" as const,
  label: "Route hints",
  title: "Childhood formation",
  text: "Both novels make childhood formation the origin of later damage.",
  metadata: {
    thesis: "Both novels make childhood formation the origin of later damage.",
    axis: "Childhood formation",
    ao2: "Track child focalisation, classroom dialogue, and recurring images of order.",
    ao3: "Connect Victorian utilitarian schooling with inter-war class assumptions.",
    ao4: "Compare external ideological pressure with internalised misreading.",
    character: "Louisa and Briony expose different kinds of formation.",
    narrative: "Narrative perspective controls how each childhood is judged.",
    structure: "Opening formation shapes the consequences that follow.",
    exam_fit: "2023 Q2 direct fit.",
  },
};

const renderEmbedded = () =>
  render(
    <GradeBModeProvider>
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <ParagraphEngine embedded />
      </MemoryRouter>
    </GradeBModeProvider>,
  );

describe("ParagraphEngine — Route hints banner", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the read-only route-hints banner when an embedded plan has a route handoff", () => {
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
      builder_handoffs: [baseHandoff],
    });

    renderEmbedded();

    expect(screen.getByLabelText(/route hints for paragraph drafting/i)).toBeInTheDocument();
    expect(screen.getByText("Thesis")).toBeInTheDocument();
    expect(screen.getByText("Comparative axis")).toBeInTheDocument();
    expect(screen.getByText("AO2 method focus")).toBeInTheDocument();
    expect(screen.getByText("AO3 context focus")).toBeInTheDocument();
    expect(screen.getByText("AO4 comparative link")).toBeInTheDocument();
    expect(screen.getByText("Character")).toBeInTheDocument();
    expect(screen.getByText("Narrative")).toBeInTheDocument();
    expect(screen.getByText("Structure")).toBeInTheDocument();
    expect(screen.getByText("Exam fit")).toBeInTheDocument();

    expect(screen.getByText(/Both novels make childhood formation/)).toBeInTheDocument();
    expect(screen.getByText(/child focalisation/)).toBeInTheDocument();
    expect(screen.getByText(/utilitarian schooling/)).toBeInTheDocument();
    expect(screen.getByText(/external ideological pressure/)).toBeInTheDocument();
    expect(screen.getByText(/Louisa and Briony/)).toBeInTheDocument();
    expect(screen.getByText(/2023 Q2 direct fit/)).toBeInTheDocument();

    expect(screen.queryByText(/AO5/i)).not.toBeInTheDocument();
  });

  it("hides empty metadata rows in the banner", () => {
    setCurrentPlan({
      id: "plan-sparse",
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
          ...baseHandoff,
          metadata: {
            thesis: "Sparse route thesis.",
            axis: "Sparse axis",
          },
        },
      ],
    });

    renderEmbedded();

    expect(screen.getByText("Thesis")).toBeInTheDocument();
    expect(screen.getByText("Comparative axis")).toBeInTheDocument();
    expect(screen.queryByText("AO2 method focus")).not.toBeInTheDocument();
    expect(screen.queryByText("Exam fit")).not.toBeInTheDocument();
  });

  it("renders nothing route-hint-related when no handoff is present", () => {
    setCurrentPlan({
      id: "plan-no-handoff",
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

    renderEmbedded();

    expect(screen.queryByLabelText(/route hints for paragraph drafting/i)).not.toBeInTheDocument();
  });

});

describe("ParagraphEngine — Self-assessment checklist", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const setPlanWithOneCard = () => {
    setCurrentPlan({
      id: "plan-checklist",
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
          id: "card_one",
          title: "Existing card",
          claim: "A student claim.",
          comparative_direction: "",
          evidence_ht_ids: [],
          evidence_at_ids: [],
          evidence_cmp_ids: [],
          method_focus: "",
          context_anchor: "",
          analytical_position_prompt: "",
          notes: "",
        },
      ],
      builder_handoffs: [],
    });
  };

  it("renders a checklist inside every paragraph card", () => {
    setCurrentPlan({
      id: "plan-checklist-multi",
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
          id: "card_a",
          title: "Card A",
          claim: "",
          comparative_direction: "",
          evidence_ht_ids: [],
          evidence_at_ids: [],
          evidence_cmp_ids: [],
          method_focus: "",
          context_anchor: "",
          analytical_position_prompt: "",
          notes: "",
        },
        {
          id: "card_b",
          title: "Card B",
          claim: "",
          comparative_direction: "",
          evidence_ht_ids: [],
          evidence_at_ids: [],
          evidence_cmp_ids: [],
          method_focus: "",
          context_anchor: "",
          analytical_position_prompt: "",
          notes: "",
        },
      ],
      builder_handoffs: [],
    });

    renderEmbedded();

    const checklists = screen.getAllByLabelText(/paragraph quality check/i);
    expect(checklists).toHaveLength(2);
  });

  it("is collapsible via a native <details> element, default-closed", () => {
    setPlanWithOneCard();
    renderEmbedded();

    const checklist = screen.getAllByLabelText(/paragraph quality check/i)[0];
    expect(checklist.tagName.toLowerCase()).toBe("details");
    expect((checklist as HTMLDetailsElement).open).toBe(false);
  });

  it("lists AO1, AO2, AO3, AO4 plus Evidence and Development prompts", () => {
    setPlanWithOneCard();
    renderEmbedded();

    const checklist = screen.getAllByLabelText(/paragraph quality check/i)[0];
    const text = checklist.textContent ?? "";

    expect(text).toMatch(/AO1/);
    expect(text).toMatch(/AO2/);
    expect(text).toMatch(/AO3/);
    expect(text).toMatch(/AO4/);
    expect(text).toMatch(/Evidence/);
    expect(text).toMatch(/Development/);
    expect(text).toMatch(/comparative argument/i);
    expect(text).toMatch(/writerly method/i);
    expect(text).toMatch(/context integrated/i);
    expect(text).toMatch(/Hard Times.*Atonement/i);
    expect(text).toMatch(/precise textual reference|quotation/i);
    expect(text).toMatch(/why the comparison matters/i);
  });

  it("does not reference AO5", () => {
    setPlanWithOneCard();
    renderEmbedded();

    const checklist = screen.getAllByLabelText(/paragraph quality check/i)[0];
    expect(checklist.textContent ?? "").not.toMatch(/AO\s*5/i);
  });

  it("does not contain scoring, grade, or marking language", () => {
    setPlanWithOneCard();
    renderEmbedded();

    const checklist = screen.getAllByLabelText(/paragraph quality check/i)[0];
    const text = checklist.textContent ?? "";

    expect(text).not.toMatch(/score/i);
    expect(text).not.toMatch(/grade/i);
    expect(text).not.toMatch(/\bmark(s|ing)?\b/i);
    expect(text).not.toMatch(/\bband\b/i);
  });

  it("does not mutate paragraph card data when rendered", () => {
    setPlanWithOneCard();
    renderEmbedded();

    const cards = getCurrentPlan().paragraph_cards ?? [];
    expect(cards).toHaveLength(1);
    expect(cards[0].claim).toBe("A student claim.");
    expect(cards[0].method_focus).toBe("");
    expect(cards[0].context_anchor).toBe("");
    expect(cards[0].comparative_direction).toBe("");
    expect(cards[0].notes).toBe("");
  });

  it("renders the same static prompts regardless of card content (sparse-safe)", () => {
    setPlanWithOneCard();
    renderEmbedded();

    const sparseText =
      screen.getAllByLabelText(/paragraph quality check/i)[0].textContent ?? "";

    expect(sparseText).toMatch(/AO1/);
    expect(sparseText).toMatch(/AO4/);
    expect(sparseText).toMatch(/Evidence/);
    expect(sparseText).toMatch(/Development/);
  });
});

describe("ParagraphEngine — Route hints banner: card-mutation guard (legacy)", () => {
  // Original test relocated here verbatim to keep its assertions intact
  // alongside the new checklist describe-block.
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not mutate paragraph_cards when a route handoff is present", () => {
    setCurrentPlan({
      id: "plan-no-mutate",
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
          id: "card_existing",
          title: "Existing card",
          claim: "An existing student-authored claim.",
          comparative_direction: "",
          evidence_ht_ids: [],
          evidence_at_ids: [],
          evidence_cmp_ids: [],
          method_focus: "",
          context_anchor: "",
          analytical_position_prompt: "",
          notes: "",
        },
      ],
      builder_handoffs: [baseHandoff],
    });

    renderEmbedded();

    const cards = getCurrentPlan().paragraph_cards ?? [];
    expect(cards).toHaveLength(1);
    expect(cards[0].claim).toBe("An existing student-authored claim.");
    expect(cards[0].method_focus).toBe("");
    expect(cards[0].context_anchor).toBe("");
    expect(cards[0].comparative_direction).toBe("");
    expect(cards[0].notes).toBe("");
  });
});
