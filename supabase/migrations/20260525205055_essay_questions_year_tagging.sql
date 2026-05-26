-- Stage 0.7: Backfill `year` for two essay_questions rows verified against
-- official Pearson 9ET0/02 question papers. The remaining six rows stay NULL
-- pending the 2017-25 exam-question/theme matrix pull (separate follow-up).
--
-- Guards: each UPDATE filters on `year IS NULL` so re-applying the migration
-- is a no-op and the audit note is not double-appended.
-- `year` is a text column, so values are quoted.

UPDATE essay_questions
SET year = '2022',
    review_notes = CASE
      WHEN review_notes IS NULL OR review_notes = ''
        THEN '[2026-05-25] year=2022 verified against official Pearson 9ET0/02 June 2022 paper, Childhood Q1. Exact wording match.'
      ELSE review_notes || E'\n[2026-05-25] year=2022 verified against official Pearson 9ET0/02 June 2022 paper, Childhood Q1. Exact wording match.'
    END
WHERE id = 'eq_ht_at_marriage_20260524'
  AND year IS NULL;

UPDATE essay_questions
SET year = '2024',
    review_notes = CASE
      WHEN review_notes IS NULL OR review_notes = ''
        THEN '[2026-05-25] year=2024 verified against official Pearson 9ET0/02 June 2024 paper, Childhood Q2. Original wording: "make use of settings"; prose-prep paraphrases as "significance of settings".'
      ELSE review_notes || E'\n[2026-05-25] year=2024 verified against official Pearson 9ET0/02 June 2024 paper, Childhood Q2. Original wording: "make use of settings"; prose-prep paraphrases as "significance of settings".'
    END
WHERE id = 'eq_ht_at_settings_20260524'
  AND year IS NULL;
