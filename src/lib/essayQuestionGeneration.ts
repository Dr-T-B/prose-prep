export const CURATED_ESSAY_THEMES = [
  "childhood",
  "education",
  "family",
  "female relationships",
  "misunderstanding",
  "memory",
  "guilt",
  "class",
  "power",
  "storytelling",
  "setting",
  "conflict",
  "hope",
  "independence",
  "marriage",
  "social criticism",
] as const;

export type EssayQuestionTheme = typeof CURATED_ESSAY_THEMES[number];

export type EssayQuestionGenerationResult =
  | { ok: true; theme: string; questions: string[] }
  | { ok: false; error: string };

const COMPONENT_2_STYLE_WARNING =
  "For Edexcel Component 2, stronger practice questions usually ask you to compare both texts and relate ideas to context.";

const UNSAFE_THEME_RE = new RegExp(
  [
    "\\bAO\\s*5\\b",
    "\\bmark(?:s|ing|ed)?\\b",
    "\\bscore(?:s|d|ing)?\\b",
    "\\bgrade(?:s|d|ing)?\\b",
    "\\blevel(?:s)?\\b",
    "\\bband(?:s)?\\b",
    "top[-\\s]?band",
    "model\\s+answer",
    "model\\s+paragraph",
    "\\brewrite\\b",
    "rewritten\\s+paragraph",
    "full\\s+essay",
  ].join("|"),
  "i",
);

const COMPARISON_RE = /\b(compare|comparison|comparative|both|two chosen texts|between)\b/i;
const CONTEXT_RE = /\b(context|contextual|social|historical|victorian|modern|twentieth|twenty-first|1935|1940|1999|1854)\b/i;
const BOTH_TEXTS_RE = /\b(hard times|atonement|dickens|mcewan|both texts|two chosen texts)\b/i;

function normaliseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function normaliseTheme(theme: string): string {
  return normaliseWhitespace(theme).replace(/[?.!]+$/g, "").toLowerCase();
}

function sentenceCaseTheme(theme: string): string {
  const normalised = normaliseTheme(theme);
  return normalised.charAt(0).toUpperCase() + normalised.slice(1);
}

export function isSafeEssayQuestionTheme(theme: string): boolean {
  const normalised = normaliseTheme(theme);
  return Boolean(normalised) && normalised.length <= 80 && !UNSAFE_THEME_RE.test(normalised);
}

export function getQuestionStyleWarning(question: string): string | null {
  const normalised = normaliseWhitespace(question);
  if (!normalised) return null;

  const hasComparison = COMPARISON_RE.test(normalised);
  const hasContext = CONTEXT_RE.test(normalised);
  const hasBothTexts = BOTH_TEXTS_RE.test(normalised);

  return hasComparison && hasContext && hasBothTexts ? null : COMPONENT_2_STYLE_WARNING;
}

export function generateEssayQuestionsFromTheme(
  themeInput: string,
  requestedCount = 5,
): EssayQuestionGenerationResult {
  const theme = normaliseTheme(themeInput);
  if (!theme) return { ok: false, error: "Choose or type a theme first." };
  if (!isSafeEssayQuestionTheme(theme)) {
    return { ok: false, error: "Use a short theme or idea for practice question generation." };
  }

  const count = Math.min(Math.max(Math.round(requestedCount), 3), 5);
  const themeTitle = sentenceCaseTheme(theme);
  const questionTemplates = [
    `Compare the ways in which the writers of your two chosen texts present ${theme}. You must relate your discussion to relevant contextual factors.`,
    `Compare the significance of ${theme} in Hard Times and Atonement. You must relate your discussion to relevant contextual factors.`,
    `Compare how Dickens and McEwan use narrative methods to present ideas about ${theme}. You must relate your discussion to relevant contextual factors.`,
    `Compare the ways in which ${theme} shapes characters' choices in your two chosen texts. You must relate your discussion to relevant contextual factors.`,
    `Compare how the writers of Hard Times and Atonement present changing attitudes to ${theme}. You must relate your discussion to relevant contextual factors.`,
  ];

  return {
    ok: true,
    theme: themeTitle,
    questions: questionTemplates.slice(0, count),
  };
}
