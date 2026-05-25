import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AnnotatedEssayReview, { buildPromotionPatch } from "./AnnotatedEssayReview";

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: mockSupabase.from,
    auth: {
      getUser: vi.fn(async () => ({ data: { user: { id: "admin-1" } }, error: null })),
    },
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

const sampleRows: Record<string, unknown[]> = {
  essay_questions: [
    {
      id: "eq_1",
      question_text: "Compare childhood in the novels.",
      verification_status: "teacher review required",
      reviewed: false,
      reviewed_at: null,
      approved_at: null,
      review_notes: null,
      correction_notes: null,
      updated_at: "2026-05-25T10:00:00.000Z",
      theme: "childhood",
    },
  ],
  annotated_essays: [],
  essay_paragraphs: [],
  ao_annotations: [],
  paragraph_stems: [],
  quote_method_links: [],
  misconception_upgrades: [],
};

describe("buildPromotionPatch", () => {
  const baseline = { reviewed_at: null, approved_at: null };

  beforeEach(() => {
    mockSupabase.from.mockImplementation((table: string) => ({
      select: () => ({
        order: async () => ({
          data: sampleRows[table] ?? [],
          error: null,
        }),
      }),
    }));
  });

  it("marking reviewed sets reviewed=true, reviewed_at=now, reviewed_by=user", () => {
    const patch = buildPromotionPatch({
      next: "reviewed",
      userId: "user-1",
      existing: baseline,
    });
    expect(patch.verification_status).toBe("reviewed");
    expect(patch.reviewed).toBe(true);
    expect(typeof patch.reviewed_at).toBe("string");
    expect(patch.reviewed_by).toBe("user-1");
  });

  it("approving preserves prior reviewed_at and adds approved metadata", () => {
    const reviewedAt = "2026-05-20T10:00:00.000Z";
    const patch = buildPromotionPatch({
      next: "approved",
      userId: "user-1",
      existing: { reviewed_at: reviewedAt, approved_at: null },
    });
    expect(patch.verification_status).toBe("approved");
    expect(patch.reviewed).toBe(true);
    expect(patch.reviewed_at).toBe(reviewedAt);
    expect(patch.reviewed_by).toBe("user-1");
    expect(typeof patch.approved_at).toBe("string");
    expect(patch.approved_by).toBe("user-1");
  });

  it("marking needs correction sets reviewed=false and persists correction notes", () => {
    const patch = buildPromotionPatch({
      next: "needs correction",
      userId: "user-1",
      existing: baseline,
      correctionNotes: "Quote attribution wrong — verify with text",
    });
    expect(patch.verification_status).toBe("needs correction");
    expect(patch.reviewed).toBe(false);
    expect(patch.correction_notes).toBe("Quote attribution wrong — verify with text");
  });

  it("returning to 'teacher review required' clears prior review/approval audit", () => {
    const patch = buildPromotionPatch({
      next: "teacher review required",
      userId: "user-1",
      existing: { reviewed_at: "2026-05-20", approved_at: "2026-05-21" },
    });
    expect(patch.verification_status).toBe("teacher review required");
    expect(patch.reviewed).toBe(false);
    expect(patch.reviewed_at).toBeNull();
    expect(patch.reviewed_by).toBeNull();
    expect(patch.approved_at).toBeNull();
    expect(patch.approved_by).toBeNull();
  });

  it("retiring preserves the audit trail and only flips visibility", () => {
    const patch = buildPromotionPatch({
      next: "retired",
      userId: "user-1",
      existing: { reviewed_at: "2026-05-20", approved_at: "2026-05-21" },
    });
    expect(patch.verification_status).toBe("retired");
    expect(patch.reviewed_at).toBeUndefined();
    expect(patch.approved_at).toBeUndefined();
  });

  it("empty notes string is persisted as null so the column doesn't carry whitespace", () => {
    const patch = buildPromotionPatch({
      next: "reviewed",
      userId: "user-1",
      existing: baseline,
      notes: "",
    });
    expect(patch.review_notes).toBeNull();
  });

  it("renders the admin review component with rows from the seven-table queue", async () => {
    render(<AnnotatedEssayReview />);

    expect(screen.getByRole("heading", { name: /Annotated essay content review/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Compare childhood in the novels/i)).toBeInTheDocument();
    });
    expect(screen.getByText("Essay questions")).toBeInTheDocument();
    expect(screen.getAllByText(/teacher review required/i).length).toBeGreaterThan(0);
  });
});
