-- Adds optional expiry context to the existing documents archive.
-- Safe to run more than once; existing rows remain unchanged.
alter table public.documents
  add column if not exists nota_scadenza text null;

comment on column public.documents.nota_scadenza is
  'Optional note related to the document expiration date.';
