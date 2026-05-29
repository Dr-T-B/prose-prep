import type {
  Component2AO,
  RapidRecallDrillType,
  RapidRecallTheme,
  RapidRecallWorkbookItem,
} from "@/types/rapidRecall";

export type RapidRecallFilterValue<T extends string> = "All" | T;

function normaliseFilterValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim().replace(/\s+/g, " ");
}

function filterMatchesValue(filter: string, value: string) {
  return filter === "All" || normaliseFilterValue(filter) === normaliseFilterValue(value);
}

function itemMatchesAoFilter(item: RapidRecallWorkbookItem, filter: RapidRecallFilterValue<Component2AO>) {
  return filter === "All" || item.aoFocus.some((ao) => filterMatchesValue(filter, ao));
}

function itemMatchesTextFilter(item: RapidRecallWorkbookItem, filter: RapidRecallFilterValue<RapidRecallWorkbookItem["textFocus"]>) {
  if (filterMatchesValue(filter, item.textFocus)) return true;

  const text = normaliseFilterValue(filter);
  return item.type === "route-selection"
    && item.textFocus === "Comparative"
    && Boolean(item.routePlan)
    && (text === normaliseFilterValue("Hard Times") || text === normaliseFilterValue("Atonement"));
}

export function matchesRapidRecallWorkbookFilters({
  item,
  activeType,
  themeFilter,
  aoFilter,
  textFilter,
}: {
  item: RapidRecallWorkbookItem;
  activeType: RapidRecallDrillType;
  themeFilter: RapidRecallFilterValue<RapidRecallTheme>;
  aoFilter: RapidRecallFilterValue<Component2AO>;
  textFilter: RapidRecallFilterValue<RapidRecallWorkbookItem["textFocus"]>;
}) {
  return item.type === activeType
    && filterMatchesValue(themeFilter, item.theme)
    && itemMatchesAoFilter(item, aoFilter)
    && itemMatchesTextFilter(item, textFilter);
}
