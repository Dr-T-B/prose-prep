import type { Database } from "@/integrations/supabase/types";
import type { EssayPlan, ParagraphCard } from "@/lib/planStore";
import type { BuilderHandoffItem } from "@/lib/builderHandoff";
import type { QuestionFamily } from "@/data/seed";

export type EssayPlanRow = Database["public"]["Tables"]["essay_plans"]["Row"];
const LEGACY_EXTENSION_ENABLED_KEY = ["ao", "5_enabled"].join("_");
const LEGACY_EXTENSION_IDS_KEY = ["selected", "ao", "5_ids"].join("_");

export function essayPlanToInsert(
  plan: EssayPlan & { is_current?: boolean },
  userId: string
) {
  return {
    user_id: userId,
    client_plan_id: plan.id,
    question_id: plan.question_id ?? null,
    family: plan.family ?? null,
    route_id: plan.route_id ?? null,
    thesis_level: plan.thesis_level,
    thesis_id: plan.thesis_id ?? null,
    selected_quote_ids: plan.selected_quote_ids ?? [],
    interpretive_extension_enabled: plan.interpretive_extension_enabled ?? false,
    selected_interpretive_extension_ids: plan.selected_interpretive_extension_ids ?? [],
    notes: plan.notes ?? null,
    paragraph_cards: plan.paragraph_cards ?? [],
    builder_handoffs: plan.builder_handoffs ?? [],
    is_current: plan.is_current ?? false,
  };
}

export function rowToEssayPlan(row: EssayPlanRow): EssayPlan {
  const compat = row as EssayPlanRow & Record<string, unknown>;
  const enabled =
    typeof compat.interpretive_extension_enabled === "boolean"
      ? compat.interpretive_extension_enabled
      : Boolean(compat[LEGACY_EXTENSION_ENABLED_KEY]);
  const selectedIds = Array.isArray(compat.selected_interpretive_extension_ids)
    ? compat.selected_interpretive_extension_ids as string[]
    : Array.isArray(compat[LEGACY_EXTENSION_IDS_KEY])
      ? compat[LEGACY_EXTENSION_IDS_KEY] as string[]
      : [];

  return {
    id: row.client_plan_id ?? row.id,
    updated_at: new Date(row.updated_at).getTime(),
    question_id: row.question_id ?? undefined,
    family: (row.family as QuestionFamily) ?? undefined,
    route_id: row.route_id ?? undefined,
    thesis_level: row.thesis_level as EssayPlan["thesis_level"],
    thesis_id: row.thesis_id ?? undefined,
    selected_quote_ids: (row.selected_quote_ids as string[]) ?? [],
    interpretive_extension_enabled: enabled,
    selected_interpretive_extension_ids: selectedIds,
    notes: row.notes ?? undefined,
    paragraph_cards: (row.paragraph_cards as ParagraphCard[]) ?? [],
    builder_handoffs: (row.builder_handoffs as BuilderHandoffItem[]) ?? [],
  };
}
