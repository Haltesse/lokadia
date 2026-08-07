-- ════════════════════════════════════════════════════════════════════════
--  landing_signups — leads des pages landing (dont formulaire /pro)
-- ════════════════════════════════════════════════════════════════════════
--
--  Jusqu'ici la table n'existait pas : le front tombait silencieusement en
--  localStorage et les leads B2B étaient perdus. Écriture seule pour le
--  public (insert/upsert par email) ; lecture réservée au service_role.

create table if not exists public.landing_signups (
  email       text primary key,
  source      text,
  created_at  timestamptz not null default now()
);

alter table public.landing_signups enable row level security;

-- Dépôt de lead autorisé (anonyme ou connecté) ; aucune lecture ni mise à
-- jour publique. Le client insère en ON CONFLICT DO NOTHING (pas d'update,
-- donc pas de confirmation possible de l'existence d'un email).
create policy landing_signups_insert on public.landing_signups
  for insert with check (true);
