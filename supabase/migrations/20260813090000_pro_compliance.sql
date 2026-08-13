-- ════════════════════════════════════════════════════════════════════════
--  Lokadia Pro — conformité prouvable (Lot P2)
-- ════════════════════════════════════════════════════════════════════════
--
--  · briefings : contenu de briefing pré-départ par pays, SOURCE OFFICIELLE
--    obligatoire (contrainte produit : pas de source = pas de donnée).
--  · briefing_receipts : accusé de lecture nominatif horodaté, par mission.
--    Le voyageur accuse réception via un lien tokenisé (Edge Function
--    briefing-ack, service_role) — aucune écriture client sur read_at.
--  · audit_log : journal append-only. Ni UPDATE ni DELETE, même en
--    service_role (trigger) — c'est ce qui rend le registre présentable
--    à un auditeur.

-- ─── 1. Briefings ────────────────────────────────────────────────────────

create table if not exists public.briefings (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  country_iso  text not null,
  country_name text not null,
  title        text not null check (char_length(title) between 2 and 200),
  content      text not null check (char_length(content) >= 20),
  source       text not null check (char_length(source) >= 3),   -- ex. « France Diplomatie (MEAE) »
  source_url   text,
  created_by   uuid not null references auth.users (id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (org_id, country_iso)
);

create table if not exists public.briefing_receipts (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  briefing_id  uuid not null references public.briefings (id) on delete cascade,
  mission_id   uuid not null references public.missions (id) on delete cascade,
  traveler_id  uuid not null references public.travelers (id) on delete cascade,
  token        uuid not null unique default gen_random_uuid(),
  sent_at      timestamptz not null default now(),
  read_at      timestamptz,
  read_name    text,                    -- nom saisi par le voyageur à l'accusé
  unique (mission_id)
);

-- ─── 2. Journal d'audit (append-only) ────────────────────────────────────

create table if not exists public.audit_log (
  id           bigint generated always as identity primary key,
  org_id       uuid not null references public.organizations (id) on delete cascade,
  actor        uuid,                    -- null pour les actions voyageur (lien token)
  actor_label  text not null,           -- email ou libellé lisible au moment de l'action
  action       text not null,           -- ex. 'traveler.import', 'mission.create', 'briefing.ack'
  target_kind  text,
  target_id    text,
  detail       jsonb,
  created_at   timestamptz not null default now()
);

-- Inaltérable : aucune modification ni suppression, quel que soit le rôle.
create or replace function public.audit_log_immutable()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_log est en append-only : % interdit', tg_op;
end;
$$;

drop trigger if exists audit_log_no_update_delete on public.audit_log;
create trigger audit_log_no_update_delete
  before update or delete on public.audit_log
  for each row execute function public.audit_log_immutable();

-- ─── 3. RLS ──────────────────────────────────────────────────────────────

alter table public.briefings         enable row level security;
alter table public.briefing_receipts enable row level security;
alter table public.audit_log         enable row level security;

create policy briefings_select on public.briefings
  for select using (public.is_org_member(org_id));
create policy briefings_insert on public.briefings
  for insert with check (public.can_write(org_id));
create policy briefings_update on public.briefings
  for update using (public.can_write(org_id));
create policy briefings_delete on public.briefings
  for delete using (public.can_write(org_id));

-- Les accusés : lisibles par l'org, créés par admin/manager. Jamais de
-- update client (read_at est posé exclusivement par l'Edge Function).
create policy receipts_select on public.briefing_receipts
  for select using (public.is_org_member(org_id));
create policy receipts_insert on public.briefing_receipts
  for insert with check (public.can_write(org_id));
create policy receipts_delete on public.briefing_receipts
  for delete using (public.can_write(org_id) and read_at is null);

-- Journal : chaque membre écrit ses propres entrées, l'org les lit.
create policy audit_select on public.audit_log
  for select using (public.is_org_member(org_id));
create policy audit_insert on public.audit_log
  for insert with check (public.is_org_member(org_id) and actor = auth.uid());

-- ─── 4. Index ────────────────────────────────────────────────────────────

create index if not exists briefings_org_idx        on public.briefings (org_id);
create index if not exists receipts_org_idx         on public.briefing_receipts (org_id);
create index if not exists receipts_mission_idx     on public.briefing_receipts (mission_id);
create index if not exists receipts_token_idx       on public.briefing_receipts (token);
create index if not exists audit_org_created_idx    on public.audit_log (org_id, created_at desc);
