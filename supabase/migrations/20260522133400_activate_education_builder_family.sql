-- Forward-only migration: activate education as a supported Builder family.
--
-- Adds:
--   * one top-band thesis row keyed by theme_family = 'education'
--   * one paragraph_jobs row keyed by question_family = 'education'
--   * activates the existing q-education question row
--
-- Pre-existing education support already passes the non-thesis/job parts of the
-- Builder content contract: active quote_methods, comparative_matrix rows, and
-- interpretive_tensions. This migration closes the remaining thesis and
-- paragraph-job gaps, then exposes the existing education question.
--
-- Idempotent: inserts use ON CONFLICT (id) DO UPDATE; activation UPDATE is
-- gated to the education question row and only rewrites when the row is not
-- already active.
--
-- Non-destructive: no DELETE, no DROP, no schema change, no RLS change, no type
-- regeneration, and no unrelated family changes.
--
-- Route pairing: q-education already uses primary = route-imagination and
-- secondary = route-perception. Both routes are retained.

begin;

-- Builder thesis for education, anchored to route-imagination because the
-- education question already routes through the imagination/rationality frame.
insert into public.theses (
  id,
  route_id,
  theme_family,
  level,
  thesis_text,
  paragraph_job_1_label,
  paragraph_job_2_label,
  paragraph_job_3_label
) values (
  'thesis-education-astar',
  'route-imagination',
  'education',
  'top_band',
  'Both Hard Times and Atonement present education as moral formation rather than neutral instruction: Dickens attacks a utilitarian system that trains children to distrust fancy and feeling, while McEwan shows Briony schooling herself through genre, class assumption and narrative certainty, so that both novels ask whether learning produces ethical perception or disciplined misreading.',
  'Gradgrind''s facts-only schooling: how education becomes ideological training rather than humane formation',
  'Briony''s literary self-education: how narrative habits turn perception into false certainty',
  'Comparative judgement: education as moral re-education, from Dickens''s reformable Gradgrind to McEwan''s belated and incomplete atonement'
)
on conflict (id) do update set
  route_id = excluded.route_id,
  theme_family = excluded.theme_family,
  level = excluded.level,
  thesis_text = excluded.thesis_text,
  paragraph_job_1_label = excluded.paragraph_job_1_label,
  paragraph_job_2_label = excluded.paragraph_job_2_label,
  paragraph_job_3_label = excluded.paragraph_job_3_label,
  updated_at = now();

-- Builder-quality paragraph job for the education family.
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
  'pj-education-1a',
  'education',
  'route-imagination',
  'Education as moral formation',
  'How does Gradgrind''s opening demand for "Facts" (capitalisation, imperative direct speech, narrowed educational register) present schooling as a system that trains children out of fancy, sympathy and uncertainty?',
  'How does Briony''s desire to make experience fit a readable story pattern show an informal education in genre, class assumption and narrative control rather than mature moral perception?',
  'Dickens locates educational damage in an external institution that drills the child into utilitarian fact; McEwan locates it in Briony''s internalised literary habits, where imagination becomes a self-taught method of misreading. Which version of education is more dangerous: imposed schooling or self-authorising interpretation?',
  'A top-band comparison treats education in both novels as the formation of moral vision: Dickens condemns learning that excludes feeling, while McEwan exposes learning without ethical humility, and both writers make re-education belated, partial and costly.',
  ARRAY['direct speech', 'capitalisation', 'focalisation', 'narrative perspective']::text[],
  ARRAY['education', 'imagination', 'childhood', 'guilt']::text[],
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

-- Activate the existing canonical education question only after the supporting
-- content rows above are present.
update public.questions
set is_active = true,
    updated_at = now()
where id = 'q-education'
  and family = 'education'
  and is_active is distinct from true;

commit;
