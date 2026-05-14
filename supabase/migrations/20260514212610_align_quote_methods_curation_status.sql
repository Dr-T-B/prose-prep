begin;

alter table public.quote_methods
  drop constraint if exists quote_methods_curation_status_check;

alter table public.quote_methods
  add constraint quote_methods_curation_status_check
  check (curation_status = any (array['secure', 'strong', 'top_band']::text[]));

comment on column public.quote_methods.curation_status is
  'Canonical Prose quote/method curation band: secure, strong, or top_band.';

commit;
