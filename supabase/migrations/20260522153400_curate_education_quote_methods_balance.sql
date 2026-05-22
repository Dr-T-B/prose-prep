-- Forward-only migration: improve Education quote-method balance.
--
-- Scope:
--   * retag six existing, active Atonement quote-method rows with education
--   * add missing q-education links for the same Atonement education evidence
--
-- Rationale:
--   The active Education Builder family already has strong Hard Times coverage,
--   but direct best_themes education coverage was one-sided: 14 Hard Times rows
--   and 0 Atonement rows. These existing Atonement rows support education in the
--   broad literary sense of childhood formation, narrative self-education,
--   interpretation, moral learning, and Briony's development as a writer.
--
-- Non-destructive:
--   no schema change, no RLS change, no type regeneration, no route/question
--   activation change, no unrelated family change, no DELETE/DROP.

begin;

-- Retag existing high-quality Atonement evidence so direct Education toolkit
-- lookups by quote_methods.best_themes include both set texts.
update public.quote_methods
set best_themes = case
      when 'education' = any(best_themes) then best_themes
      else array_append(best_themes, 'education')
    end,
    updated_at = now()
where id in (
    'qm_at_01', -- Briony's child formation: desire to order the world
    'qm_at_06', -- drafting mistaken for atonement; writing as moral learning
    'qm_at_08', -- false certainty and calculation after misreading
    'qm_at_13', -- interested perception and failure to see clearly
    'qm_at_16', -- child author constructing scenes from telling details
    'qm_at_17'  -- childlike approach to truth and writerly development
  )
  and source_text = 'Atonement'
  and is_active is true;

-- q-education already linked qm_at_06 and qm_at_16. Add the remaining curated
-- rows to the question-aware primary QuotePicker path. ON CONFLICT keeps this
-- safe to re-run and avoids duplicate links.
insert into public.quote_question_links (
  id,
  quote_id,
  question_id,
  relevance_score,
  rationale
) values
  (
    '877618b6-4549-40ca-84de-4afc1435e37b',
    'qm_at_01',
    'q-education',
    86,
    'Briony''s childhood desire to order the world supports education as moral and imaginative formation.'
  ),
  (
    '6dc88c70-ed88-4168-98a8-44e47b4a7a07',
    'qm_at_08',
    'q-education',
    88,
    'Briony''s false certainty shows the danger of self-taught interpretation without ethical humility.'
  ),
  (
    '03ed3855-85c4-487b-8661-87539a144bfa',
    'qm_at_13',
    'q-education',
    87,
    'The line exposes motivated misreading, making education a question of learning how to see clearly.'
  ),
  (
    '913d7664-eb48-4836-80a9-d31fdf9cc8e2',
    'qm_at_17',
    'q-education',
    84,
    'Briony''s childlike approach to truth supports narrative self-education and writerly maturation.'
  )
on conflict (quote_id, question_id) do update set
  relevance_score = excluded.relevance_score,
  rationale = excluded.rationale,
  updated_at = now();

commit;
