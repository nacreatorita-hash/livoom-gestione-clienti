-- Livoom Gestione Clienti
-- Initial production schema for Supabase/PostgreSQL.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 1 and 120),
  cognome text not null check (char_length(trim(cognome)) between 1 and 120),
  telefono text,
  email text,
  tipo text not null default 'Lead'
    check (tipo in ('Lead', 'Prospect', 'Cliente', 'Partner')),
  stato text not null default 'Nuovo'
    check (stato in ('Nuovo', 'In Contatto', 'Trattativa', 'Chiuso Vinto', 'Chiuso Perso')),
  note text,
  source_type text,
  source_url text,
  source_name text,
  source_acquired_at date,
  source_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_id_user_unique unique (id, user_id)
);

create table public.calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contatto_id uuid not null,
  data_chiamata timestamptz not null,
  esito text not null
    check (esito in ('Risposto', 'Non risposto', 'Da richiamare', 'Non interessato', 'Appuntamento fissato')),
  nota text,
  prossimo_richiamo date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calls_contact_owner_fk
    foreign key (contatto_id, user_id)
    references public.contacts(id, user_id)
    on delete cascade
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contatto_id uuid not null,
  titolo text not null check (char_length(trim(titolo)) between 1 and 200),
  data date not null,
  ora text not null check (ora ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'),
  tipo text not null
    check (tipo in ('Video Call', 'Telefonico', 'Presenziale', 'Altro')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_contact_owner_fk
    foreign key (contatto_id, user_id)
    references public.contacts(id, user_id)
    on delete cascade
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contatto_id uuid not null,
  nome_documento text not null check (char_length(trim(nome_documento)) between 1 and 200),
  link_drive text not null check (link_drive ~ '^https://'),
  tipo_documento text not null
    check (tipo_documento in ('Contratto', 'Preventivo', 'Fattura', 'Identità', 'Altro')),
  scadenza date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_contact_owner_fk
    foreign key (contatto_id, user_id)
    references public.contacts(id, user_id)
    on delete cascade
);

create index contacts_user_created_idx
  on public.contacts (user_id, created_at desc);
create index contacts_user_name_idx
  on public.contacts (user_id, nome, cognome);
create index calls_user_date_idx
  on public.calls (user_id, data_chiamata desc);
create index calls_contact_idx
  on public.calls (contatto_id);
create index calls_user_callback_idx
  on public.calls (user_id, prossimo_richiamo)
  where prossimo_richiamo is not null;
create index appointments_user_schedule_idx
  on public.appointments (user_id, data, ora);
create index appointments_contact_idx
  on public.appointments (contatto_id);
create index documents_user_created_idx
  on public.documents (user_id, created_at desc);
create index documents_contact_idx
  on public.documents (contatto_id);

create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

create trigger calls_set_updated_at
before update on public.calls
for each row execute function public.set_updated_at();

create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

alter table public.contacts enable row level security;
alter table public.calls enable row level security;
alter table public.appointments enable row level security;
alter table public.documents enable row level security;

create policy "contacts_select_own" on public.contacts
for select to authenticated
using ((select auth.uid()) = user_id);
create policy "contacts_insert_own" on public.contacts
for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "contacts_update_own" on public.contacts
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "contacts_delete_own" on public.contacts
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "calls_select_own" on public.calls
for select to authenticated
using ((select auth.uid()) = user_id);
create policy "calls_insert_own" on public.calls
for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "calls_update_own" on public.calls
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "calls_delete_own" on public.calls
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "appointments_select_own" on public.appointments
for select to authenticated
using ((select auth.uid()) = user_id);
create policy "appointments_insert_own" on public.appointments
for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "appointments_update_own" on public.appointments
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "appointments_delete_own" on public.appointments
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "documents_select_own" on public.documents
for select to authenticated
using ((select auth.uid()) = user_id);
create policy "documents_insert_own" on public.documents
for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "documents_update_own" on public.documents
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "documents_delete_own" on public.documents
for delete to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.contacts from anon;
revoke all on table public.calls from anon;
revoke all on table public.appointments from anon;
revoke all on table public.documents from anon;

grant select, insert, update, delete on table public.contacts to authenticated;
grant select, insert, update, delete on table public.calls to authenticated;
grant select, insert, update, delete on table public.appointments to authenticated;
grant select, insert, update, delete on table public.documents to authenticated;

