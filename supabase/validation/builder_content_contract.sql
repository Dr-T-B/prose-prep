-- Builder content-contract validation.
-- Read-only SQL. Expected passing state:
--   1. unsupported_level_values returns zero rows
--   2. unsupported_active_families returns zero rows
--   3. missing_required_fields returns zero rows
--   4. active_question_route_gaps returns zero rows

with level_values as (
  select 'routes.level_tag' as source, r.level_tag::text as value, count(*) from public.routes r group by r.level_tag
  union all select 'questions.level_tag', q.level_tag::text, count(*) from public.questions q group by q.level_tag
  union all select 'theses.level', t.level::text, count(*) from public.theses t group by t.level
  union all select 'quote_methods.level_tag', qm.level_tag::text, count(*) from public.quote_methods qm group by qm.level_tag
  union all select 'comparative_matrix.level_band', cm.level_band::text, count(*) from public.comparative_matrix cm group by cm.level_band
  union all select 'interpretive_tensions.level_tag', it.level_tag::text, count(*) from public.interpretive_tensions it group by it.level_tag
  union all select 'paragraph_jobs.level_band', pj.level_band::text, count(*) from public.paragraph_jobs pj group by pj.level_band
  union all select 'paragraph_stems.level_band', ps.level_band::text, count(*) from public.paragraph_stems ps group by ps.level_band
  union all select 'glossary_terms.level_tag', gt.level_tag::text, count(*) from public.glossary_terms gt group by gt.level_tag
  union all select 'character_cards.level_band', cc.level_band::text, count(*) from public.character_cards cc group by cc.level_band
  union all select 'symbol_entries.level_band', se.level_band::text, count(*) from public.symbol_entries se group by se.level_band
)
select 'unsupported_level_values' as check_name, source, value, count
from level_values
where value is not null
  and value not in ('secure', 'strong', 'top_band')
order by source, value;

with q as (
  select distinct family from public.questions where is_active = true
),
th as (
  select theme_family as family, count(*) thesis_count from public.theses group by theme_family
),
pj as (
  select question_family as family, count(*) job_count from public.paragraph_jobs group by question_family
),
cm as (
  select family, count(*) matrix_count
  from (select unnest(themes) as family from public.comparative_matrix where themes is not null) x
  group by family
),
qm as (
  select family, count(*) quote_count
  from (select unnest(best_themes) as family from public.quote_methods where is_active = true and best_themes is not null) x
  group by family
),
it as (
  select family, count(*) tension_count
  from (select unnest(best_use) as family from public.interpretive_tensions where best_use is not null) x
  group by family
)
select 'unsupported_active_families' as check_name,
       q.family,
       coalesce(th.thesis_count, 0) as thesis_count,
       coalesce(pj.job_count, 0) as paragraph_job_count,
       coalesce(cm.matrix_count, 0) as matrix_count,
       coalesce(qm.quote_count, 0) as quote_count,
       coalesce(it.tension_count, 0) as tension_count
from q
left join th using (family)
left join pj using (family)
left join cm using (family)
left join qm using (family)
left join it using (family)
where coalesce(th.thesis_count, 0) = 0
   or coalesce(pj.job_count, 0) = 0
   or coalesce(cm.matrix_count, 0) = 0
   or coalesce(qm.quote_count, 0) < 2
   or coalesce(it.tension_count, 0) = 0
order by q.family;

with active_families as (
  select distinct family
  from public.questions
  where is_active = true
),
active_family_array as (
  select coalesce(array_agg(family), array[]::text[]) as families
  from active_families
)
select 'missing_required_fields' as check_name, 'questions' as source, id
from public.questions
where is_active = true
  and (family = '' or stem = '' or primary_route_id = '' or secondary_route_id = '' or level_tag = '' or likely_core_methods is null)
union all
select 'missing_required_fields', 'theses', t.id
from public.theses t
join active_families af on af.family = t.theme_family
where t.theme_family = '' or t.level = '' or t.route_id = '' or t.thesis_text = ''
union all
select 'missing_required_fields', 'paragraph_jobs', pj.id
from public.paragraph_jobs pj
join active_families af on af.family = pj.question_family
where pj.question_family = '' or pj.route_id = '' or pj.job_title = '' or pj.text1_prompt = '' or pj.text2_prompt = '' or pj.divergence_prompt = '' or pj.judgement_prompt = ''
union all
select 'missing_required_fields', 'quote_methods', qm.id
from public.quote_methods qm
cross join active_family_array afa
where qm.is_active = true
  and qm.best_themes && afa.families
  and (qm.best_themes is null or cardinality(qm.best_themes) = 0 or qm.quote_text = '' or qm.method = '')
union all
select 'missing_required_fields', 'comparative_matrix', cm.id
from public.comparative_matrix cm
cross join active_family_array afa
where cm.themes && afa.families
  and (cm.themes is null or cardinality(cm.themes) = 0 or cm.axis = '' or cm.hard_times = '' or cm.atonement = '')
union all
select 'missing_required_fields', 'interpretive_tensions', it.id
from public.interpretive_tensions it
cross join active_family_array afa
where it.best_use && afa.families
  and (it.best_use is null or cardinality(it.best_use) = 0 or it.focus = '' or it.dominant_reading = '' or it.alternative_reading = '' or it.interpretive_stem = '')
order by source, id;

select 'active_question_route_gaps' as check_name, q.id, q.primary_route_id, q.secondary_route_id
from public.questions q
left join public.routes pr on pr.id = q.primary_route_id
left join public.routes sr on sr.id = q.secondary_route_id
where q.is_active = true
  and (pr.id is null or sr.id is null)
order by q.id;
