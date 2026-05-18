-- Add the ordering column required by the glossary runtime query and import contract.
-- Non-destructive: preserves existing rows and only fills the new nullable field.

alter table public.glossary_terms
  add column if not exists sort_order integer;

create index if not exists glossary_terms_sort_order_idx
  on public.glossary_terms (sort_order);

update public.glossary_terms
set sort_order = 0
where sort_order is null;
