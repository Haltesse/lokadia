-- ════════════════════════════════════════════════════════════════════════
--  Lokadia grand public — destinations suivies et alertes (Lot 5)
-- ════════════════════════════════════════════════════════════════════════
--
--  Même promesse que la veille Pro : ZÉRO BRUIT. Côté voyageur, la
--  seconde condition n'est pas « des personnes sur place » mais « la
--  destination a été suivie explicitement » — un opt-in, pas une
--  inscription par défaut. Et on ne notifie que ce qui a réellement
--  changé depuis le dernier passage.
--
--  · traveler_watchlist          ce que le voyageur suit
--  · destination_snapshots       dernier état connu d'une destination.
--    Table PARTAGÉE, sans utilisateur : c'est de la donnée publique
--    (Lokascore), pas une donnée personnelle. Elle sert de référence de
--    comparaison à tout le monde.
--  · traveler_alerts             le changement détecté, pour un
--    utilisateur donné, avec son statut de lecture
--  · traveler_push_subscriptions abonnement Web Push, opt-in explicite
--
--  Les abonnements Pro (`push_subscriptions`) sont rattachés à une
--  organisation et à un `traveler` : ils ne peuvent pas servir ici, où
--  l'identité est un compte `auth.users`.

-- ─── 1. Destinations suivies ─────────────────────────────────────────────

create table if not exists public.traveler_watchlist (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  destination_id text not null,
  /** Libellé affiché, figé au moment du suivi (« Tokyo, Japon ») */
  destination_label text not null,
  country_iso    text,
  created_at     timestamptz not null default now(),
  unique (user_id, destination_id)
);

-- ─── 2. Instantanés par destination (donnée publique, partagée) ──────────

create table if not exists public.destination_snapshots (
  destination_id text primary key,
  score          integer check (score between 0 and 100),
  level          text,
  sources        text[],
  captured_at    timestamptz not null default now()
);

-- ─── 3. Alertes personnelles ─────────────────────────────────────────────

create table if not exists public.traveler_alerts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  destination_id text not null,
  destination_label text not null,
  kind           text not null
                 check (kind in ('score_drop', 'level_change')),
  previous_value text,
  current_value  text,
  severity       text not null default 'vigilance'
                 check (severity in ('info', 'vigilance', 'urgent')),
  summary        text not null,
  sources        text[],
  status         text not null default 'unread' check (status in ('unread', 'read')),
  created_at     timestamptz not null default now()
);

-- ─── 4. Abonnements Web Push du voyageur ─────────────────────────────────

create table if not exists public.traveler_push_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  endpoint      text not null unique,
  p256dh        text not null,
  auth          text not null,
  consented_at  timestamptz not null default now(),
  last_used_at  timestamptz,
  failure_count integer not null default 0
);

-- ─── 5. RLS ──────────────────────────────────────────────────────────────

alter table public.traveler_watchlist          enable row level security;
alter table public.destination_snapshots       enable row level security;
alter table public.traveler_alerts             enable row level security;
alter table public.traveler_push_subscriptions enable row level security;

-- Liste de suivi : strictement personnelle.
create policy watchlist_select on public.traveler_watchlist
  for select using (auth.uid() = user_id);
create policy watchlist_insert on public.traveler_watchlist
  for insert with check (auth.uid() = user_id);
create policy watchlist_delete on public.traveler_watchlist
  for delete using (auth.uid() = user_id);

-- Instantanés : lecture pour tout compte connecté (donnée publique),
-- écriture réservée au service_role (la fonction de veille).
create policy destination_snapshots_select on public.destination_snapshots
  for select using (auth.role() = 'authenticated');

-- Alertes : lues et marquées lues par leur destinataire. AUCUNE policy
-- d'insertion : seule la fonction de veille (service_role) en crée, sans
-- quoi un client pourrait se fabriquer de fausses alertes de sécurité.
create policy traveler_alerts_select on public.traveler_alerts
  for select using (auth.uid() = user_id);
create policy traveler_alerts_update on public.traveler_alerts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy traveler_alerts_delete on public.traveler_alerts
  for delete using (auth.uid() = user_id);

-- Abonnements push : posés et retirés par leur propriétaire.
create policy traveler_push_select on public.traveler_push_subscriptions
  for select using (auth.uid() = user_id);
create policy traveler_push_insert on public.traveler_push_subscriptions
  for insert with check (auth.uid() = user_id);
create policy traveler_push_delete on public.traveler_push_subscriptions
  for delete using (auth.uid() = user_id);

-- ─── 6. Index ────────────────────────────────────────────────────────────

create index if not exists watchlist_user_idx
  on public.traveler_watchlist (user_id, created_at desc);
create index if not exists watchlist_destination_idx
  on public.traveler_watchlist (destination_id);
create index if not exists traveler_alerts_user_idx
  on public.traveler_alerts (user_id, status, created_at desc);
create index if not exists traveler_push_user_idx
  on public.traveler_push_subscriptions (user_id);
