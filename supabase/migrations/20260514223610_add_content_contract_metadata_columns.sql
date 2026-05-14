begin;

alter table public.quote_methods
  add column if not exists is_active boolean not null default true,
  add column if not exists sort_order integer;

alter table public.comparative_matrix
  add column if not exists level_band text,
  add column if not exists is_active boolean not null default true,
  add column if not exists sort_order integer;

comment on column public.quote_methods.is_active is
  'Marks whether the quote-method row is active for app retrieval and content import validation.';

comment on column public.quote_methods.sort_order is
  'Optional deterministic display/import order for quote-method content.';

comment on column public.comparative_matrix.level_band is
  'Optional educational level band used by app/import content, for example secure, strong, or top_band.';

comment on column public.comparative_matrix.is_active is
  'Marks whether the comparative matrix row is active for app retrieval and content import validation.';

comment on column public.comparative_matrix.sort_order is
  'Optional deterministic display/import order for comparative matrix content.';

commit;
