-- Builder content-contract repair.
-- Forward-only, idempotent, and local-only until explicitly reviewed/applied.
-- This migration aligns live Builder content with the frontend contract:
-- levels are secure/strong/top_band and active questions use families with
-- supporting theses, paragraph jobs, quote methods, comparative rows, and
-- interpretive tensions.

update public.routes
set level_tag = case level_tag
  when 'B' then 'secure'
  when 'core' then 'secure'
  when 'A' then 'strong'
  when 'B/A' then 'strong'
  when 'A*' then 'top_band'
  when 'A/A*' then 'top_band'
  when 'advanced' then 'top_band'
  else level_tag
end
where level_tag in ('B', 'core', 'A', 'B/A', 'A*', 'A/A*', 'advanced');

update public.questions
set level_tag = case level_tag
  when 'B' then 'secure'
  when 'core' then 'secure'
  when 'A' then 'strong'
  when 'B/A' then 'strong'
  when 'A*' then 'top_band'
  when 'A/A*' then 'top_band'
  when 'advanced' then 'top_band'
  else level_tag
end
where level_tag in ('B', 'core', 'A', 'B/A', 'A*', 'A/A*', 'advanced');

update public.theses
set level = case level
  when 'B' then 'secure'
  when 'core' then 'secure'
  when 'A' then 'strong'
  when 'B/A' then 'strong'
  when 'A*' then 'top_band'
  when 'A/A*' then 'top_band'
  when 'advanced' then 'top_band'
  else level
end
where level in ('B', 'core', 'A', 'B/A', 'A*', 'A/A*', 'advanced');

update public.quote_methods
set level_tag = case level_tag
  when 'B' then 'secure'
  when 'core' then 'secure'
  when 'A' then 'strong'
  when 'B/A' then 'strong'
  when 'A*' then 'top_band'
  when 'A/A*' then 'top_band'
  when 'advanced' then 'top_band'
  else level_tag
end
where level_tag in ('B', 'core', 'A', 'B/A', 'A*', 'A/A*', 'advanced');

update public.comparative_matrix
set level_band = case level_band
  when 'B' then 'secure'
  when 'core' then 'secure'
  when 'A' then 'strong'
  when 'B/A' then 'strong'
  when 'A*' then 'top_band'
  when 'A/A*' then 'top_band'
  when 'advanced' then 'top_band'
  else level_band
end
where level_band in ('B', 'core', 'A', 'B/A', 'A*', 'A/A*', 'advanced');

update public.interpretive_tensions
set level_tag = case level_tag
  when 'B' then 'secure'
  when 'core' then 'secure'
  when 'A' then 'strong'
  when 'B/A' then 'strong'
  when 'A*' then 'top_band'
  when 'A/A*' then 'top_band'
  when 'advanced' then 'top_band'
  else level_tag
end
where level_tag in ('B', 'core', 'A', 'B/A', 'A*', 'A/A*', 'advanced');

update public.paragraph_jobs
set level_band = case level_band
  when 'B' then 'secure'
  when 'core' then 'secure'
  when 'A' then 'strong'
  when 'B/A' then 'strong'
  when 'A*' then 'top_band'
  when 'A/A*' then 'top_band'
  when 'advanced' then 'top_band'
  else level_band
end
where level_band in ('B', 'core', 'A', 'B/A', 'A*', 'A/A*', 'advanced');

update public.paragraph_stems
set level_band = case level_band
  when 'B' then 'secure'
  when 'core' then 'secure'
  when 'A' then 'strong'
  when 'B/A' then 'strong'
  when 'A*' then 'top_band'
  when 'A/A*' then 'top_band'
  when 'advanced' then 'top_band'
  else level_band
end
where level_band in ('B', 'core', 'A', 'B/A', 'A*', 'A/A*', 'advanced');

update public.glossary_terms
set level_tag = case level_tag
  when 'B' then 'secure'
  when 'core' then 'secure'
  when 'A' then 'strong'
  when 'B/A' then 'strong'
  when 'A*' then 'top_band'
  when 'A/A*' then 'top_band'
  when 'advanced' then 'top_band'
  else level_tag
end
where level_tag in ('B', 'core', 'A', 'B/A', 'A*', 'A/A*', 'advanced');

update public.character_cards
set level_band = case level_band
  when 'B' then 'secure'
  when 'core' then 'secure'
  when 'A' then 'strong'
  when 'B/A' then 'strong'
  when 'A*' then 'top_band'
  when 'A/A*' then 'top_band'
  when 'advanced' then 'top_band'
  else level_band
end
where level_band in ('B', 'core', 'A', 'B/A', 'A*', 'A/A*', 'advanced');

update public.symbol_entries
set level_band = case level_band
  when 'B' then 'secure'
  when 'core' then 'secure'
  when 'A' then 'strong'
  when 'B/A' then 'strong'
  when 'A*' then 'top_band'
  when 'A/A*' then 'top_band'
  when 'advanced' then 'top_band'
  else level_band
end
where level_band in ('B', 'core', 'A', 'B/A', 'A*', 'A/A*', 'advanced');

-- Keep existing educational question rows but remove unsupported families from
-- the active Builder surface. The three inserted active rows below are the
-- families verified to have full support coverage in the live content audit.
update public.questions
set is_active = false
where family not in ('class', 'guilt', 'imagination');

insert into public.questions (
  id,
  family,
  stem,
  primary_route_id,
  secondary_route_id,
  likely_core_methods,
  level_tag,
  is_active
) values
  (
    'q-builder-class-contract',
    'class',
    'Compare how Dickens and McEwan present class as a force that shapes whose voices are believed.',
    'route-class',
    'route-systems',
    array['focalisation', 'social contrast', 'symbolism'],
    'top_band',
    true
  ),
  (
    'q-builder-guilt-contract',
    'guilt',
    'Compare how Dickens and McEwan present guilt and the possibility of moral repair.',
    'route-guilt',
    'route-narrative',
    array['metafiction', 'structural contrast', 'imagery'],
    'top_band',
    true
  ),
  (
    'q-builder-imagination-contract',
    'imagination',
    'Compare how Dickens and McEwan present imagination as both necessary and dangerous.',
    'route-imagination',
    'route-perception',
    array['symbolism', 'focalisation', 'narrative perspective'],
    'top_band',
    true
  )
on conflict (id) do update
set family = excluded.family,
    stem = excluded.stem,
    primary_route_id = excluded.primary_route_id,
    secondary_route_id = excluded.secondary_route_id,
    likely_core_methods = excluded.likely_core_methods,
    level_tag = excluded.level_tag,
    is_active = excluded.is_active;
