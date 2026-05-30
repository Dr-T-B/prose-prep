-- Remove non-canonical Component 2 assessment wording from seeded student-facing content.
-- Forward-only and idempotent: each update targets a stable seeded row id.

UPDATE public.quotes
SET a_star_insight = 'A* / critical perspective: trauma theory (associated with Caruth and LaCapra) frames memory as belated, fractured and ethically unstable — useful interpretive nuance for the word ''realignment'', which anticipates the novel''s recursive structure as Briony keeps re-aligning.'
WHERE id = '79ea51e9-1632-44c0-8031-4151ab7c6dd6'::uuid;

UPDATE public.quotes
SET a_star_insight = 'Critical perspective: Marxist readings suggest Stephen is denied the diagnostic language of his own oppression, while sentimental critics see saintly martyrdom.'
WHERE id = 'dd779a47-0bfd-45d0-a92b-a651b1818c01'::uuid;

UPDATE public.theses
SET paragraph_job_3_label = 'The comparative judgement: industrial exclusion vs epistemic exclusion — which is more damaging? (AO4 / thesis quality)'
WHERE id = 'thesis-class-astar';

UPDATE public.theses
SET paragraph_job_3_label = 'The larger implication: does either novel believe moral repair is possible? Interpretive nuance applied'
WHERE id = 'thesis-guilt-astar';

UPDATE public.theses
SET paragraph_job_3_label = 'The comparative pivot: is imagination redemptive, dangerous, or both? (AO4 / argument quality)'
WHERE id = 'thesis-imagination-a';

UPDATE public.theses
SET paragraph_job_3_label = '"How can a novelist achieve atonement?" — McEwan''s metafictional interrogation vs Dickens''s narratorial confidence: what this reveals about each writer''s moral position (critical perspective)'
WHERE id = 'thesis-imagination-astar';

UPDATE public.annotated_essays
SET risks = array_replace(
  risks,
  '4. The model uses one critic-free framing throughout because AO' || '5 is NOT assessed in Component 2 — a student adapting this should resist the urge to drop in critics from Drama habit.',
  '4. The model uses one critic-free framing throughout because Component 2 uses AO1-AO4 only — a student adapting this should resist the urge to drop in critics from Drama habit.'
)
WHERE id = 'essay_marriage_level5_20260525';

UPDATE public.annotated_essays
SET full_essay_text = replace(
  full_essay_text,
  'Each sentence below is tagged with the AO(s) it primarily serves. For Component 2, AO1-AO4 only (AO' || '5 not assessed).',
  'Each sentence below is tagged with the AO(s) it primarily serves. Component 2 uses AO1-AO4 only.'
)
WHERE id = 'essay_female_relationships_level5_20260525';
