-- ════════════════════════════════════════════════════════════════════════
--  Lokadia Pro — socle multi-tenant (Lot P1)
-- ════════════════════════════════════════════════════════════════════════
--
--  Règles appliquées :
--   · organization_id sur chaque table métier, RLS activée PARTOUT.
--   · Les policies passent par des fonctions SECURITY DEFINER (pas de
--     récursion RLS sur org_members).
--   · La création d'une organisation passe par create_organization()
--     (l'appelant devient admin) — jamais d'INSERT direct.
--   · Écriture réservée aux rôles admin/manager ; dept_lead voit
--     uniquement son département ; viewer lit tout, n'écrit rien.
--   · Données personnelles : protégées par RLS + chiffrement au repos
--     Supabase. Pas de chiffrement par colonne à ce lot (prévu si besoin
--     au Lot P2 avec pgsodium).
--
--  Appliquer : `supabase db push` (ou copier dans Studio > SQL Editor).

-- ─── 1. Organisations ────────────────────────────────────────────────────

create table if not exists public.organizations (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(name) between 2 and 120),
  tier           text not null default 'starter'
                 check (tier in ('starter', 'pro', 'enterprise')),
  pilot_ends_at  timestamptz,                -- fin du pilote gratuit 3 mois
  settings       jsonb not null default '{}'::jsonb,
  created_by     uuid not null references auth.users (id),
  created_at     timestamptz not null default now()
);

create table if not exists public.org_members (
  org_id         uuid not null references public.organizations (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  role           text not null default 'viewer'
                 check (role in ('admin', 'manager', 'viewer', 'dept_lead')),
  department_id  uuid,                       -- FK ajoutée après création de departments
  created_at     timestamptz not null default now(),
  primary key (org_id, user_id)
);

create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 120),
  created_at  timestamptz not null default now()
);

alter table public.org_members
  add constraint org_members_department_fk
  foreign key (department_id) references public.departments (id) on delete set null;

-- ─── 2. Effectif & missions ──────────────────────────────────────────────

create table if not exists public.travelers (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organizations (id) on delete cascade,
  department_id      uuid references public.departments (id) on delete set null,
  first_name         text not null,
  last_name          text not null,
  email              text,
  phone              text,
  nationality        text,                   -- ISO 3166-1 alpha-2
  emergency_contact  jsonb,                  -- { name, phone, relation }
  user_id            uuid references auth.users (id) on delete set null,
  consent_at         timestamptz,            -- consentement au suivi (RGPD)
  created_at         timestamptz not null default now()
);

create table if not exists public.missions (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations (id) on delete cascade,
  traveler_id     uuid not null references public.travelers (id) on delete cascade,
  destination_id  text,                      -- id du catalogue destinations Lokadia (si couvert)
  country_iso     text not null,             -- ISO 3166-1 alpha-2
  country_name    text not null,
  city            text,
  date_start      date not null,
  date_end        date not null check (date_end >= date_start),
  status          text not null default 'approved'
                  check (status in ('draft', 'submitted', 'approved', 'refused', 'active', 'done')),
  created_by      uuid not null references auth.users (id),
  created_at      timestamptz not null default now()
);

create table if not exists public.compliance_items (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  mission_id    uuid not null references public.missions (id) on delete cascade,
  kind          text not null
                check (kind in ('briefing', 'insurance', 'emergency_contact', 'formalities')),
  status        text not null default 'pending' check (status in ('pending', 'done')),
  completed_at  timestamptz,
  evidence      text,
  unique (mission_id, kind)
);

-- Dossier de conformité créé automatiquement à chaque mission
create or replace function public.seed_compliance_items()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.compliance_items (org_id, mission_id, kind)
  values
    (new.org_id, new.id, 'briefing'),
    (new.org_id, new.id, 'insurance'),
    (new.org_id, new.id, 'emergency_contact'),
    (new.org_id, new.id, 'formalities')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists missions_seed_compliance on public.missions;
create trigger missions_seed_compliance
  after insert on public.missions
  for each row execute function public.seed_compliance_items();

-- ─── 3. Historisation Lokascore (variation 30 j, alimentée par snapshot) ─

create table if not exists public.lokascore_history (
  id               bigint generated always as identity primary key,
  destination_key  text not null,            -- destination_id catalogue OU ISO pays
  score            integer check (score between 0 and 100),
  level            text,
  captured_on      date not null default current_date,
  unique (destination_key, captured_on)
);

-- ─── 4. Helpers RLS (SECURITY DEFINER → pas de récursion) ────────────────

create or replace function public.is_org_member(p_org uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_members
    where org_id = p_org and user_id = auth.uid()
  );
$$;

create or replace function public.org_role(p_org uuid)
returns text
language sql stable security definer
set search_path = public
as $$
  select role from public.org_members
  where org_id = p_org and user_id = auth.uid();
$$;

create or replace function public.member_department(p_org uuid)
returns uuid
language sql stable security definer
set search_path = public
as $$
  select department_id from public.org_members
  where org_id = p_org and user_id = auth.uid();
$$;

-- Un dept_lead ne voit que son département ; les autres rôles voient tout
create or replace function public.can_see_department(p_org uuid, p_department uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select case
    when public.org_role(p_org) is distinct from 'dept_lead' then true
    else p_department is not distinct from public.member_department(p_org)
  end;
$$;

create or replace function public.can_write(p_org uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.org_role(p_org) in ('admin', 'manager');
$$;

-- ─── 5. Création d'organisation (l'appelant devient admin) ───────────────

create or replace function public.create_organization(p_name text, p_tier text default 'starter')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;
  if p_tier not in ('starter', 'pro', 'enterprise') then
    raise exception 'invalid tier';
  end if;

  insert into public.organizations (name, tier, pilot_ends_at, created_by)
  values (trim(p_name), p_tier, now() + interval '3 months', auth.uid())
  returning id into v_org;

  insert into public.org_members (org_id, user_id, role)
  values (v_org, auth.uid(), 'admin');

  return v_org;
end;
$$;

-- ─── 6. RLS ──────────────────────────────────────────────────────────────

alter table public.organizations    enable row level security;
alter table public.org_members      enable row level security;
alter table public.departments      enable row level security;
alter table public.travelers        enable row level security;
alter table public.missions         enable row level security;
alter table public.compliance_items enable row level security;
alter table public.lokascore_history enable row level security;

-- organizations : lecture membre, modification admin, création via RPC uniquement
create policy org_select on public.organizations
  for select using (public.is_org_member(id));
create policy org_update on public.organizations
  for update using (public.org_role(id) = 'admin');
create policy org_delete on public.organizations
  for delete using (public.org_role(id) = 'admin');

-- org_members : lecture membre, gestion admin
create policy members_select on public.org_members
  for select using (public.is_org_member(org_id));
create policy members_insert on public.org_members
  for insert with check (public.org_role(org_id) = 'admin');
create policy members_update on public.org_members
  for update using (public.org_role(org_id) = 'admin');
create policy members_delete on public.org_members
  for delete using (public.org_role(org_id) = 'admin');

-- departments
create policy departments_select on public.departments
  for select using (public.is_org_member(org_id));
create policy departments_write on public.departments
  for insert with check (public.can_write(org_id));
create policy departments_update on public.departments
  for update using (public.can_write(org_id));
create policy departments_delete on public.departments
  for delete using (public.can_write(org_id));

-- travelers (portée département pour dept_lead)
create policy travelers_select on public.travelers
  for select using (
    public.is_org_member(org_id)
    and public.can_see_department(org_id, department_id)
  );
create policy travelers_insert on public.travelers
  for insert with check (public.can_write(org_id));
create policy travelers_update on public.travelers
  for update using (public.can_write(org_id));
create policy travelers_delete on public.travelers
  for delete using (public.can_write(org_id));

-- missions (portée département héritée du voyageur)
create policy missions_select on public.missions
  for select using (
    public.is_org_member(org_id)
    and exists (
      select 1 from public.travelers t
      where t.id = traveler_id
        and public.can_see_department(org_id, t.department_id)
    )
  );
create policy missions_insert on public.missions
  for insert with check (public.can_write(org_id));
create policy missions_update on public.missions
  for update using (public.can_write(org_id));
create policy missions_delete on public.missions
  for delete using (public.can_write(org_id));

-- compliance_items
create policy compliance_select on public.compliance_items
  for select using (public.is_org_member(org_id));
create policy compliance_write on public.compliance_items
  for insert with check (public.can_write(org_id));
create policy compliance_update on public.compliance_items
  for update using (public.can_write(org_id));
create policy compliance_delete on public.compliance_items
  for delete using (public.can_write(org_id));

-- lokascore_history : donnée non personnelle, lecture pour tout utilisateur
-- connecté ; écriture réservée au service_role (snapshot serveur)
create policy history_select on public.lokascore_history
  for select using (auth.role() = 'authenticated');

-- ─── 7. Index ────────────────────────────────────────────────────────────

create index if not exists org_members_user_idx      on public.org_members (user_id);
create index if not exists departments_org_idx       on public.departments (org_id);
create index if not exists travelers_org_idx         on public.travelers (org_id);
create index if not exists travelers_department_idx  on public.travelers (department_id);
create index if not exists missions_org_idx          on public.missions (org_id);
create index if not exists missions_traveler_idx     on public.missions (traveler_id);
create index if not exists missions_dates_idx        on public.missions (org_id, date_start, date_end);
create index if not exists compliance_mission_idx    on public.compliance_items (mission_id);
create index if not exists compliance_org_idx        on public.compliance_items (org_id);
create index if not exists history_key_idx           on public.lokascore_history (destination_key, captured_on desc);
