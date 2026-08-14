-- ════════════════════════════════════════════════════════════════════════
--  Lokadia Pro — veille par pays suivi (Lot P4)
-- ════════════════════════════════════════════════════════════════════════
--
--  Promesse produit : ZÉRO BRUIT. Une organisation n'est notifiée que
--  lorsque quelque chose CHANGE, et seulement pour un pays où elle a
--  effectivement des personnes. Une notification qui n'appelle aucune
--  décision est une notification qui apprend à ignorer les suivantes.
--
--  · watched_countries : ce que l'organisation surveille (ajouté à la
--    main, ou dérivé automatiquement de ses missions)
--  · country_snapshots : dernier état connu d'un pays. Table PARTAGÉE,
--    non rattachée à une organisation : c'est de la donnée publique
--    (Lokascore + niveau d'advisory), pas une donnée client.
--  · watch_alerts : le changement détecté, pour une organisation, avec
--    son statut de traitement — c'est la file qui doit faire mal quand
--    elle s'allonge.

-- ─── 1. Pays suivis ──────────────────────────────────────────────────────

create table if not exists public.watched_countries (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  country_iso  text not null,
  country_name text not null,
  /** true = ajouté automatiquement parce que des missions y ont lieu */
  auto         boolean not null default false,
  added_by     uuid references auth.users (id),
  created_at   timestamptz not null default now(),
  unique (org_id, country_iso)
);

-- ─── 2. Instantanés d'état pays (données publiques, partagées) ───────────

create table if not exists public.country_snapshots (
  country_iso   text primary key,
  score         integer check (score between 0 and 100),
  level         text,
  /** Niveau d'advisory le plus sévère constaté (vert/jaune/orange/rouge) */
  advisory      text,
  sources       text[],
  captured_at   timestamptz not null default now()
);

-- ─── 3. Alertes de changement, par organisation ──────────────────────────

create table if not exists public.watch_alerts (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  country_iso   text not null,
  country_name  text not null,
  kind          text not null
                check (kind in ('score_drop', 'score_rise', 'level_change', 'advisory_change')),
  previous_value text,
  current_value  text,
  /** Nombre de personnes de l'organisation présentes au moment du constat */
  people_count  integer not null default 0,
  severity      text not null default 'vigilance'
                check (severity in ('info', 'vigilance', 'urgent')),
  summary       text not null,
  sources       text[],
  status        text not null default 'open' check (status in ('open', 'acknowledged')),
  acknowledged_by    uuid references auth.users (id),
  acknowledged_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- ─── 4. RLS ──────────────────────────────────────────────────────────────

alter table public.watched_countries  enable row level security;
alter table public.country_snapshots  enable row level security;
alter table public.watch_alerts       enable row level security;

create policy watched_select on public.watched_countries
  for select using (public.is_org_member(org_id));
create policy watched_insert on public.watched_countries
  for insert with check (public.can_write(org_id));
create policy watched_delete on public.watched_countries
  for delete using (public.can_write(org_id));

-- Instantanés : lecture pour tout utilisateur connecté (donnée publique),
-- écriture réservée au service_role (la fonction de veille)
create policy snapshots_select on public.country_snapshots
  for select using (auth.role() = 'authenticated');

-- Alertes : lues par l'organisation, acquittées par admin/gestionnaire.
-- Créées uniquement par la fonction de veille (service_role) : une
-- organisation ne peut pas se fabriquer de fausses alertes.
create policy watch_alerts_select on public.watch_alerts
  for select using (public.is_org_member(org_id));
create policy watch_alerts_update on public.watch_alerts
  for update using (public.can_write(org_id));

-- ─── 5. Index ────────────────────────────────────────────────────────────

create index if not exists watched_org_idx      on public.watched_countries (org_id);
create index if not exists watch_alerts_org_idx on public.watch_alerts (org_id, status, created_at desc);
