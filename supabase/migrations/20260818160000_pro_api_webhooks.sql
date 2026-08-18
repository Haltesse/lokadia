-- ════════════════════════════════════════════════════════════════════════
--  Lokadia Pro — API, webhooks et marque blanche (Lot P6)
-- ════════════════════════════════════════════════════════════════════════
--
--  · api_keys        clés d'accès à l'API lecture seule d'une organisation
--  · webhooks        points de livraison sortants, signés
--  · webhook_deliveries  journal des envois — sans lui, « on ne reçoit
--    rien » est indébogable
--
--  Sécurité des clés : **seul le haché est stocké**. La clé en clair
--  n'existe qu'une fois, au moment de sa création, dans la réponse de la
--  fonction qui la génère. Si l'organisation la perd, elle en régénère
--  une : personne, y compris nous, ne peut la relire. Un préfixe non
--  secret (`lok_live_a1b2…`) permet de la reconnaître dans une liste.

create table if not exists public.api_keys (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  label         text not null check (char_length(label) between 2 and 80),
  /** Préfixe affichable, non secret — sert uniquement à identifier la clé */
  prefix        text not null,
  /** SHA-256 de la clé complète. La clé elle-même n'est jamais stockée. */
  key_hash      text not null unique,
  scopes        text[] not null default '{read}',
  created_by    uuid not null references auth.users (id),
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz,
  revoked_at    timestamptz
);

create table if not exists public.webhooks (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  url           text not null check (url ~ '^https://'),
  /** Secret de signature HMAC, visible par l'organisation : elle en a
      besoin pour vérifier nos envois. */
  secret        text not null,
  events        text[] not null default '{watch.alert,crisis.opened,checkin.response}',
  active        boolean not null default true,
  created_by    uuid not null references auth.users (id),
  created_at    timestamptz not null default now(),
  last_success_at timestamptz,
  failure_count integer not null default 0
);

create table if not exists public.webhook_deliveries (
  id            bigint generated always as identity primary key,
  webhook_id    uuid not null references public.webhooks (id) on delete cascade,
  org_id        uuid not null references public.organizations (id) on delete cascade,
  event         text not null,
  status_code   integer,
  error         text,
  created_at    timestamptz not null default now()
);

-- Marque blanche : couleur et logo de l'organisation, dans `settings`.
-- Pas de nouvelle colonne — `organizations.settings` existe pour ça.

alter table public.api_keys           enable row level security;
alter table public.webhooks           enable row level security;
alter table public.webhook_deliveries enable row level security;

-- Clés : visibles et gérées par les administrateurs uniquement. Un
-- gestionnaire n'a pas à distribuer des accès machine.
create policy api_keys_select on public.api_keys
  for select using (public.org_role(org_id) = 'admin');
create policy api_keys_update on public.api_keys
  for update using (public.org_role(org_id) = 'admin');
create policy api_keys_delete on public.api_keys
  for delete using (public.org_role(org_id) = 'admin');
-- Pas de policy d'INSERT : les clés sont créées exclusivement par
-- l'Edge Function, qui seule connaît la clé en clair et n'en stocke que
-- le haché. Un client ne peut pas s'en fabriquer une.

create policy webhooks_select on public.webhooks
  for select using (public.org_role(org_id) = 'admin');
create policy webhooks_insert on public.webhooks
  for insert with check (public.org_role(org_id) = 'admin' and created_by = auth.uid());
create policy webhooks_update on public.webhooks
  for update using (public.org_role(org_id) = 'admin');
create policy webhooks_delete on public.webhooks
  for delete using (public.org_role(org_id) = 'admin');

-- Journal de livraison : lecture seule pour l'organisation, écriture
-- réservée à la fonction d'envoi.
create policy webhook_deliveries_select on public.webhook_deliveries
  for select using (public.is_org_member(org_id));

create index if not exists api_keys_org_idx    on public.api_keys (org_id);
create index if not exists webhooks_org_idx    on public.webhooks (org_id);
create index if not exists deliveries_org_idx  on public.webhook_deliveries (org_id, created_at desc);
