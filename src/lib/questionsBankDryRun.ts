import type { Database, Json } from "@/integrations/supabase/types";

type RemoteQuestionInsert = Database["public"]["Tables"]["questions"]["Insert"];

export const QUESTION_IMPORT_BATCH = "questions-bank-priority-2026-05";
export const EXPECTED_PAPER_CODE = "9ET0/02";
export const EXPECTED_TEXT_PAIRING = "Hard Times / Atonement";
export const ALLOWED_SOURCE_TYPES = [
  "official past-paper",
  "adapted past-paper",
  "exam-style mock",
  "speculative practice",
] as const;
export const ALLOWED_LEVELS = ["secure", "strong", "top_band"] as const;

export type AllowedAssessmentObjective = "AO1" | "AO2" | "AO3" | "AO4";

export const COMPONENT_2_ALLOWED_AOS = new Set<AllowedAssessmentObjective>([
  "AO1",
  "AO2",
  "AO3",
  "AO4",
]);

export const ALLOWED_AOS = [...COMPONENT_2_ALLOWED_AOS] as AllowedAssessmentObjective[];

type AllowedSourceType = (typeof ALLOWED_SOURCE_TYPES)[number];
type AllowedLevel = (typeof ALLOWED_LEVELS)[number];

export type LocalQuestionForDryRun = {
  id?: string;
  family?: string;
  stem?: string;
  primary_route_id?: string;
  secondary_route_id?: string;
  likely_core_methods?: string[];
  level_tag?: string;
  source_type?: string;
  authenticity_status?: string;
  year_source?: string;
  paper_code?: string;
  text_pairing?: string;
  ao_emphasis?: string;
  builder_handoff_notes?: string;
  sourceType?: string;
  authenticityStatus?: string;
  yearSource?: string;
  paperCode?: string;
  textPairing?: string;
  aoEmphasis?: string;
  builderHandoffNotes?: string;
};

export type QuestionImportMetadata = {
  builder_handoff_notes?: string;
  review_notes: string[];
  import_batch: string;
  validation_warnings: string[];
};

export type QuestionImportPayload = Omit<RemoteQuestionInsert, "metadata"> & {
  metadata: QuestionImportMetadata;
};

export type ValidationIssue = {
  id: string;
  field: string;
  message: string;
};

export type ValidationReport = {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  duplicateGeneratedIds: string[];
  conflictingExistingIds: string[];
  conflictingSourceIds: string[];
  existingIdCheckRan: boolean;
  sourceIdCheckRan: boolean;
  aoCompliant: boolean;
};

export type DryRunSummary = {
  totalQuestionsInspected: number;
  totalPayloadsGenerated: number;
  validationErrorCount: number;
  warningCount: number;
  duplicateGeneratedIds: string[];
  conflictingExistingIds: string[];
  conflictingSourceIds: string[];
  existingIdCheckRan: boolean;
  sourceIdCheckRan: boolean;
  sourceTypeDistribution: Record<string, number>;
  paperCodeDistribution: Record<string, number>;
  textPairingDistribution: Record<string, number>;
  aoCompliant: boolean;
};

export type QuestionsBankDryRunOptions = {
  routeIds?: Set<string>;
  existingIds?: Iterable<string>;
  sourceIds?: Iterable<string>;
};

function firstPresent(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim().length > 0);
}

function countBy<T>(items: T[], getKey: (item: T) => string | null | undefined): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item) || "(missing)";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function isJsonSerializable(value: unknown): boolean {
  try {
    JSON.stringify(value);
    return true;
  } catch {
    return false;
  }
}

function stringValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringValues);
  if (value && typeof value === "object") return Object.entries(value).flatMap(([key, nested]) => [key, ...stringValues(nested)]);
  return [];
}

function containsForbiddenAo(value: unknown): boolean {
  return stringValues(value).some((entry) => /\bAO5\b/i.test(entry));
}

function hasOfficialClaim(status: string | undefined): boolean {
  if (!status) return false;
  return /\bofficial\b/i.test(status) && !/\bnot official\b/i.test(status);
}

function hasVerifiedOfficialSource(payload: QuestionImportPayload): boolean {
  const status = payload.authenticity_status ?? "";
  const source = payload.year_source ?? "";
  return /\bverified\b/i.test(status)
    && /\b(19|20)\d{2}\b/.test(source)
    && !/\b(mock|practice|generated|unverified)\b/i.test(source);
}

function aoMatchesAllowedSet(value: string | null | undefined): boolean {
  if (!value) return false;
  const tokens = value.split(/[\/,;|&\s]+/).filter(Boolean);
  return tokens.length > 0 && tokens.every((token) => COMPONENT_2_ALLOWED_AOS.has(token as AllowedAssessmentObjective));
}

function addIssue(target: ValidationIssue[], id: string, field: string, message: string) {
  target.push({ id, field, message });
}

export function selectReviewedPriorityQuestions(questions: LocalQuestionForDryRun[]): LocalQuestionForDryRun[] {
  return questions.filter((question) =>
    firstPresent(question.source_type, question.sourceType)
    || firstPresent(question.authenticity_status, question.authenticityStatus)
    || firstPresent(question.paper_code, question.paperCode)
  );
}

export function toQuestionImportPayload(question: LocalQuestionForDryRun): QuestionImportPayload {
  const builderHandoffNotes = firstPresent(question.builder_handoff_notes, question.builderHandoffNotes);
  const metadata: QuestionImportMetadata = {
    review_notes: [],
    import_batch: QUESTION_IMPORT_BATCH,
    validation_warnings: [],
  };

  if (builderHandoffNotes) {
    metadata.builder_handoff_notes = builderHandoffNotes;
  }

  return {
    id: question.id ?? "",
    family: question.family ?? "",
    stem: question.stem ?? "",
    primary_route_id: question.primary_route_id ?? "",
    secondary_route_id: question.secondary_route_id ?? "",
    likely_core_methods: question.likely_core_methods ?? [],
    level_tag: question.level_tag ?? "",
    source_type: firstPresent(question.source_type, question.sourceType) ?? null,
    authenticity_status: firstPresent(question.authenticity_status, question.authenticityStatus) ?? null,
    year_source: firstPresent(question.year_source, question.yearSource) ?? null,
    paper_code: firstPresent(question.paper_code, question.paperCode) ?? null,
    text_pairing: firstPresent(question.text_pairing, question.textPairing) ?? null,
    ao_emphasis: firstPresent(question.ao_emphasis, question.aoEmphasis) ?? null,
    metadata,
  };
}

export function validateQuestionImportPayloads(
  payloads: QuestionImportPayload[],
  options: QuestionsBankDryRunOptions = {},
): ValidationReport {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const seenIds = new Set<string>();
  const duplicateGeneratedIds = new Set<string>();
  const existingIds = options.existingIds ? new Set(options.existingIds) : undefined;
  const sourceIds = options.sourceIds ? new Set(options.sourceIds) : undefined;
  const conflictingExistingIds = new Set<string>();
  const conflictingSourceIds = new Set<string>();

  payloads.forEach((payload) => {
    const id = payload.id || "(missing id)";
    if (!payload.id || !/^[a-z0-9][a-z0-9_-]*$/i.test(payload.id)) {
      addIssue(errors, id, "id", "Question ID must be present and stable.");
    }

    if (payload.id && seenIds.has(payload.id)) {
      duplicateGeneratedIds.add(payload.id);
      addIssue(errors, id, "id", "Duplicate generated payload ID.");
    }
    seenIds.add(payload.id);

    if (payload.id && existingIds?.has(payload.id)) {
      conflictingExistingIds.add(payload.id);
      addIssue(errors, id, "id", "Generated payload ID conflicts with an existing question-bank ID.");
    }

    if (payload.id && sourceIds?.has(payload.id)) {
      conflictingSourceIds.add(payload.id);
      addIssue(errors, id, "id", "Generated payload ID conflicts with a source/import ID.");
    }

    if (!payload.stem?.trim()) {
      addIssue(errors, id, "stem", "Question stem is required.");
    }

    if (!(ALLOWED_LEVELS as readonly string[]).includes(payload.level_tag as AllowedLevel)) {
      addIssue(errors, id, "level_tag", `Difficulty must be one of: ${ALLOWED_LEVELS.join(", ")}.`);
    }

    if (!Array.isArray(payload.likely_core_methods) || payload.likely_core_methods.filter(Boolean).length === 0) {
      addIssue(errors, id, "likely_core_methods", "Likely methods must be present.");
    }

    if (payload.paper_code !== EXPECTED_PAPER_CODE) {
      addIssue(errors, id, "paper_code", `Paper code must be ${EXPECTED_PAPER_CODE}.`);
    }

    if (payload.text_pairing !== EXPECTED_TEXT_PAIRING) {
      addIssue(errors, id, "text_pairing", `Text pairing must be ${EXPECTED_TEXT_PAIRING}.`);
    }

    if (!(ALLOWED_SOURCE_TYPES as readonly string[]).includes(payload.source_type as AllowedSourceType)) {
      addIssue(errors, id, "source_type", `Source type must be one of: ${ALLOWED_SOURCE_TYPES.join(", ")}.`);
    }

    if (payload.source_type === "official past-paper" && !hasVerifiedOfficialSource(payload)) {
      addIssue(errors, id, "authenticity_status", "Official past-paper entries require verified source/year metadata.");
    }

    if (
      (payload.source_type === "exam-style mock" || payload.source_type === "speculative practice")
      && hasOfficialClaim(payload.authenticity_status ?? undefined)
    ) {
      addIssue(errors, id, "authenticity_status", "Mock/speculative entries must not claim official status.");
    }

    if (!aoMatchesAllowedSet(payload.ao_emphasis)) {
      addIssue(errors, id, "ao_emphasis", "AO emphasis must reference AO1/AO2/AO3/AO4 only.");
    }

    if (containsForbiddenAo(payload)) {
      addIssue(errors, id, "ao_emphasis", "AO5 is forbidden anywhere in the payload or metadata.");
    }

    if (!isJsonSerializable(payload.metadata)) {
      addIssue(errors, id, "metadata", "Metadata must be serialisable JSON.");
    }

    if (options.routeIds) {
      if (!options.routeIds.has(payload.primary_route_id)) {
        addIssue(errors, id, "primary_route_id", "Primary route ID must reference an existing route.");
      }
      if (!options.routeIds.has(payload.secondary_route_id)) {
        addIssue(errors, id, "secondary_route_id", "Secondary route ID must reference an existing route.");
      }
    }

    if (!payload.metadata.builder_handoff_notes) {
      addIssue(warnings, id, "metadata.builder_handoff_notes", "Builder handoff notes are missing.");
    }
  });

  return {
    errors,
    warnings,
    duplicateGeneratedIds: [...duplicateGeneratedIds].sort(),
    conflictingExistingIds: [...conflictingExistingIds].sort(),
    conflictingSourceIds: [...conflictingSourceIds].sort(),
    existingIdCheckRan: Boolean(existingIds),
    sourceIdCheckRan: Boolean(sourceIds),
    aoCompliant: !errors.some((error) => error.field === "ao_emphasis"),
  };
}

export function buildDryRunSummary(
  totalQuestionsInspected: number,
  payloads: QuestionImportPayload[],
  validation: ValidationReport,
): DryRunSummary {
  return {
    totalQuestionsInspected,
    totalPayloadsGenerated: payloads.length,
    validationErrorCount: validation.errors.length,
    warningCount: validation.warnings.length,
    duplicateGeneratedIds: validation.duplicateGeneratedIds,
    conflictingExistingIds: validation.conflictingExistingIds,
    conflictingSourceIds: validation.conflictingSourceIds,
    existingIdCheckRan: validation.existingIdCheckRan,
    sourceIdCheckRan: validation.sourceIdCheckRan,
    sourceTypeDistribution: countBy(payloads, (payload) => payload.source_type),
    paperCodeDistribution: countBy(payloads, (payload) => payload.paper_code),
    textPairingDistribution: countBy(payloads, (payload) => payload.text_pairing),
    aoCompliant: validation.aoCompliant,
  };
}

export function toJson(value: QuestionImportMetadata): Json {
  return value as Json;
}
