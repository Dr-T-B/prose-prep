-- Forward-only migration: add childhood as a fourth supported Builder family.
--
-- Adds:
--   * one paragraph_jobs row keyed by question_family = 'childhood'
--   * one canonical active question row q-builder-childhood-contract
--
-- Pre-existing childhood support (theses, quote_methods, comparative_matrix,
-- interpretive_tensions) already passes the Builder content contract; this
-- migration closes the only gap (paragraph_jobs + active question row).
--
-- Idempotent: ON CONFLICT (id) DO UPDATE on both inserts.
-- Non-destructive: no DELETE, no DROP, no RLS changes, no type regeneration.
-- Route pairing: primary = route-imagination (matches existing childhood theses);
--                secondary = route-narrative (Briony as child-novelist tension).

begin;

-- Builder-quality paragraph job for childhood, anchored to route-imagination
-- (the route all three existing childhood theses use).
insert into public.paragraph_jobs (
  id,
  question_family,
  route_id,
  job_title,
  text1_prompt,
  text2_prompt,
  divergence_prompt,
  judgement_prompt,
  recommended_methods,
  recommended_themes,
  suggested_evidence_type,
  level_band
) values (
  'pj-childhood-1a',
  'childhood',
  'route-imagination',
  'Childhood as ideological formation',
  'How does Gradgrind''s injunction "You are never to fancy" (absolute prohibition, modal "never") show childhood being shaped by a system that treats imagination as a defect to be drilled out?',
  'How does Briony''s "labyrinth of construction" (metaphor of self-trapping architecture) show a child''s mind formed less by external prohibition than by her own elaborating imagination?',
  'Dickens locates the damage of childhood in an external system that mutilates imagination; McEwan locates it in an internal faculty whose unchecked elaboration produces false certainty. Is the more dangerous force in childhood the system imposed on the child or the interpretive habit the child generates?',
  'Childhood in both novels is presented as formation rather than innocence: Dickens indicts the ideological apparatus that flattens the child, while McEwan indicts the unsupervised imaginative apparatus inside the child, and the top-band reading recognises that both novels treat childhood as the site where adult harm is rehearsed.',
  ARRAY['symbolism', 'focalisation', 'imperative voice']::text[],
  ARRAY['childhood', 'imagination', 'education']::text[],
  'short_textual_evidence',
  null
)
on conflict (id) do update set
  question_family = excluded.question_family,
  route_id = excluded.route_id,
  job_title = excluded.job_title,
  text1_prompt = excluded.text1_prompt,
  text2_prompt = excluded.text2_prompt,
  divergence_prompt = excluded.divergence_prompt,
  judgement_prompt = excluded.judgement_prompt,
  recommended_methods = excluded.recommended_methods,
  recommended_themes = excluded.recommended_themes,
  suggested_evidence_type = excluded.suggested_evidence_type,
  level_band = excluded.level_band,
  updated_at = now();

-- Canonical active question for the childhood family.
insert into public.questions (
  id,
  family,
  stem,
  primary_route_id,
  secondary_route_id,
  likely_core_methods,
  level_tag,
  is_active
) values (
  'q-builder-childhood-contract',
  'childhood',
  'Compare how Dickens and McEwan present childhood as a site of formation rather than innocence.',
  'route-imagination',
  'route-narrative',
  ARRAY['symbolism', 'focalisation', 'narrative perspective']::text[],
  'top_band',
  true
)
on conflict (id) do update set
  family = excluded.family,
  stem = excluded.stem,
  primary_route_id = excluded.primary_route_id,
  secondary_route_id = excluded.secondary_route_id,
  likely_core_methods = excluded.likely_core_methods,
  level_tag = excluded.level_tag,
  is_active = excluded.is_active,
  updated_at = now();

commit;
