-- ════════════════════════════════════════════════════════════════════════
--  places_cache — cache des résultats POI (Foursquare) pour le planner
-- ════════════════════════════════════════════════════════════════════════
--
--  Réduit drastiquement les appels payants à l'API de lieux : un lieu/une
--  requête déjà vu·e n'est PLUS refacturé·e. Seule l'Edge Function
--  `places-search` (via la clé service_role) lit/écrit cette table — les
--  clients n'y accèdent jamais directement.
--
--  Appliquer : copier-coller dans Supabase Studio > SQL Editor, ou
--  `supabase db push` si tu utilises les migrations CLI.

create table if not exists public.places_cache (
  id          uuid primary key default gen_random_uuid(),
  query_key   text not null unique,        -- ex: "search:tour eiffel:48.85,2.35"
  payload     jsonb not null,              -- résultats POI normalisés
  created_at  timestamptz not null default now()
);

create index if not exists places_cache_query_key_idx
  on public.places_cache (query_key);

-- RLS activée SANS policy client : seul le service_role (l'Edge Function)
-- peut lire/écrire. Aucun accès direct depuis l'app mobile.
alter table public.places_cache enable row level security;
