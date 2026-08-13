-- ════════════════════════════════════════════════════════════════════════
--  Lokadia Pro — gestion de crise (Lot P3)
-- ════════════════════════════════════════════════════════════════════════
--
--  · crisis_events      : un événement ouvert (incident réel ou exercice)
--  · crisis_log         : main courante append-only, exportable en rapport
--  · checkin_requests   : campagne « Êtes-vous en sécurité ? » ciblée
--  · checkin_responses  : une ligne par personne visée, avec son lien
--                         tokenisé. La réponse et l'éventuelle position
--                         sont posées EXCLUSIVEMENT par l'Edge Function.
--  · push_subscriptions : abonnements Web Push, opt-in explicite, liés au
--                         voyageur via son lien personnel (pas de compte
--                         requis, pas de tracking permanent)
--  · escalation_contacts: arbre d'astreinte (qui, dans quel ordre, sous
--                         quel délai)
--
--  RGPD : la position n'est JAMAIS collectée en continu. Elle est
--  facultative, consentie à l'instant de la réponse, et purgeable.

-- ─── 1. Événements de crise ──────────────────────────────────────────────

create table if not exists public.crisis_events (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  title        text not null check (char_length(title) between 2 and 200),
  description  text,
  country_iso  text,
  city         text,
  severity     text not null default 'vigilance'
               check (severity in ('info', 'vigilance', 'urgent')),
  status       text not null default 'open' check (status in ('open', 'closed')),
  /** true = exercice : n'alarme personne, mais produit une preuve d'entraînement */
  is_exercise  boolean not null default false,
  opened_by    uuid not null references auth.users (id),
  opened_at    timestamptz not null default now(),
  closed_at    timestamptz
);

-- Main courante : horodatée, jamais modifiable (rapport post-incident)
create table if not exists public.crisis_log (
  id          bigint generated always as identity primary key,
  org_id      uuid not null references public.organizations (id) on delete cascade,
  event_id    uuid not null references public.crisis_events (id) on delete cascade,
  actor_label text not null,
  entry       text not null,
  kind        text not null default 'note'
              check (kind in ('note', 'decision', 'checkin', 'message', 'status')),
  created_at  timestamptz not null default now()
);

create or replace function public.crisis_log_immutable()
returns trigger language plpgsql as $$
begin
  raise exception 'crisis_log est en append-only : % interdit', tg_op;
end;
$$;

drop trigger if exists crisis_log_no_update_delete on public.crisis_log;
create trigger crisis_log_no_update_delete
  before update or delete on public.crisis_log
  for each row execute function public.crisis_log_immutable();

-- ─── 2. Check-in de sécurité ─────────────────────────────────────────────

create table if not exists public.checkin_requests (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  event_id     uuid references public.crisis_events (id) on delete set null,
  message      text not null check (char_length(message) between 5 and 1000),
  /** Description lisible du ciblage, affichée dans le rapport */
  scope_label  text not null,
  is_exercise  boolean not null default false,
  /** Position demandée ? Toujours facultative pour le voyageur. */
  ask_position boolean not null default false,
  created_by   uuid not null references auth.users (id),
  created_at   timestamptz not null default now()
);

create table if not exists public.checkin_responses (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  request_id   uuid not null references public.checkin_requests (id) on delete cascade,
  traveler_id  uuid not null references public.travelers (id) on delete cascade,
  mission_id   uuid references public.missions (id) on delete set null,
  token        uuid not null unique default gen_random_uuid(),
  status       text not null default 'pending'
               check (status in ('pending', 'safe', 'help')),
  responded_at timestamptz,
  note         text,
  -- Position facultative, consentie à l'acte (jamais en continu)
  position_lat double precision,
  position_lon double precision,
  position_accuracy_m integer,
  reminded_at  timestamptz,
  reminder_count integer not null default 0,
  unique (request_id, traveler_id)
);

-- ─── 3. Abonnements Web Push (opt-in explicite) ──────────────────────────

create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  traveler_id  uuid not null references public.travelers (id) on delete cascade,
  endpoint     text not null unique,
  p256dh       text not null,
  auth         text not null,
  consented_at timestamptz not null default now(),
  last_used_at timestamptz,
  failure_count integer not null default 0
);

-- ─── 4. Arbre d'escalade / astreinte ─────────────────────────────────────

create table if not exists public.escalation_contacts (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  rank        integer not null default 1,
  name        text not null,
  role        text,
  phone       text,
  email       text,
  /** Délai avant de passer au contact suivant, en minutes */
  delay_min   integer not null default 15,
  created_at  timestamptz not null default now()
);

-- ─── 5. RLS ──────────────────────────────────────────────────────────────

alter table public.crisis_events       enable row level security;
alter table public.crisis_log          enable row level security;
alter table public.checkin_requests    enable row level security;
alter table public.checkin_responses   enable row level security;
alter table public.push_subscriptions  enable row level security;
alter table public.escalation_contacts enable row level security;

create policy crisis_events_select on public.crisis_events
  for select using (public.is_org_member(org_id));
create policy crisis_events_insert on public.crisis_events
  for insert with check (public.can_write(org_id));
create policy crisis_events_update on public.crisis_events
  for update using (public.can_write(org_id));
create policy crisis_events_delete on public.crisis_events
  for delete using (public.can_write(org_id));

create policy crisis_log_select on public.crisis_log
  for select using (public.is_org_member(org_id));
create policy crisis_log_insert on public.crisis_log
  for insert with check (public.can_write(org_id));

create policy checkin_requests_select on public.checkin_requests
  for select using (public.is_org_member(org_id));
create policy checkin_requests_insert on public.checkin_requests
  for insert with check (public.can_write(org_id));

-- Les réponses sont lisibles par l'org et créées par elle (une ligne par
-- personne visée), mais le statut/la position ne sont posés que par
-- l'Edge Function `checkin-respond` (service_role) : pas de policy update.
create policy checkin_responses_select on public.checkin_responses
  for select using (public.is_org_member(org_id));
create policy checkin_responses_insert on public.checkin_responses
  for insert with check (public.can_write(org_id));

-- Abonnements push : lisibles par l'org (pour connaître la couverture),
-- écrits uniquement par l'Edge Function via le lien personnel du voyageur.
create policy push_subscriptions_select on public.push_subscriptions
  for select using (public.is_org_member(org_id));
create policy push_subscriptions_delete on public.push_subscriptions
  for delete using (public.can_write(org_id));

create policy escalation_select on public.escalation_contacts
  for select using (public.is_org_member(org_id));
create policy escalation_insert on public.escalation_contacts
  for insert with check (public.can_write(org_id));
create policy escalation_update on public.escalation_contacts
  for update using (public.can_write(org_id));
create policy escalation_delete on public.escalation_contacts
  for delete using (public.can_write(org_id));

-- ─── 6. Index ────────────────────────────────────────────────────────────

create index if not exists crisis_events_org_idx     on public.crisis_events (org_id, opened_at desc);
create index if not exists crisis_log_event_idx      on public.crisis_log (event_id, created_at);
create index if not exists checkin_requests_org_idx  on public.checkin_requests (org_id, created_at desc);
create index if not exists checkin_responses_req_idx on public.checkin_responses (request_id);
create index if not exists checkin_responses_token_idx on public.checkin_responses (token);
create index if not exists checkin_responses_org_idx on public.checkin_responses (org_id, status);
create index if not exists push_subs_traveler_idx    on public.push_subscriptions (traveler_id);
create index if not exists push_subs_org_idx         on public.push_subscriptions (org_id);
create index if not exists escalation_org_rank_idx   on public.escalation_contacts (org_id, rank);
