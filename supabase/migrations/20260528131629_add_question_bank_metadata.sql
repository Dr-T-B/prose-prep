-- Migration: add_question_bank_metadata
-- Description: Adds metadata columns to the questions table as per ADR.

ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS source_type text,
ADD COLUMN IF NOT EXISTS authenticity_status text,
ADD COLUMN IF NOT EXISTS year_source text,
ADD COLUMN IF NOT EXISTS paper_code text,
ADD COLUMN IF NOT EXISTS text_pairing text,
ADD COLUMN IF NOT EXISTS ao_emphasis text,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.questions.source_type IS 'official/adapted/mock/speculative classification';
COMMENT ON COLUMN public.questions.authenticity_status IS 'verification note';
COMMENT ON COLUMN public.questions.year_source IS 'source year or internal source note';
COMMENT ON COLUMN public.questions.paper_code IS 'paper code, e.g. 9ET0/02';
COMMENT ON COLUMN public.questions.text_pairing IS 'text pairing, e.g. Hard Times / Atonement';
COMMENT ON COLUMN public.questions.ao_emphasis IS 'AO1/AO2/AO3/AO4 emphasis only';
COMMENT ON COLUMN public.questions.metadata IS 'flexible admin metadata such as builder_handoff_notes, review_notes, import_batch, validation_warnings';
