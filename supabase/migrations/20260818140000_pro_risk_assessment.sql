-- ════════════════════════════════════════════════════════════════════════
--  Lokadia Pro — évaluation de risque par mission (Lot P5, ISO 31030)
-- ════════════════════════════════════════════════════════════════════════
--
--  Ce que la norme demande, et que le produit ne savait pas prouver :
--  qu'un déplacement a été **évalué avant le départ**, que les mesures
--  d'atténuation ont été écrites, et qu'une personne **autre que
--  l'auteur** a validé. C'est cette séparation qui donne sa valeur à la
--  trace : une auto-validation ne prouve rien.
--
--  Trois garde-fous, posés en base plutôt qu'en JavaScript :
--   1. la décision est réservée aux rôles admin / manager ;
--   2. le validateur ne peut pas être l'auteur de la soumission ;
--   3. une évaluation décidée n'est plus modifiable — sinon la trace
--      pourrait être réécrite après coup, ce qui la vide de son sens.

create table if not exists public.mission_risk_assessments (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  mission_id    uuid not null references public.missions (id) on delete cascade,

  /**
   * Facteurs cotés, tels que saisis : [{ id, label, level, note }].
   * Le catalogue des facteurs vit dans l'application (src/app/pro/risk.ts)
   * mais la COTATION est figée ici : si le catalogue évolue, une
   * évaluation passée reste lisible telle qu'elle a été validée.
   */
  factors       jsonb not null default '[]'::jsonb,

  /** Niveau brut, avant mesures — dérivé des facteurs, 1 à 4 */
  inherent_level  integer not null check (inherent_level between 1 and 4),
  /** Mesures d'atténuation décidées, une par ligne */
  mitigations     text[] not null default '{}',
  /** Niveau résiduel déclaré, après mesures — jamais calculé à la place
      de l'organisation : c'est elle qui l'assume */
  residual_level  integer not null check (residual_level between 1 and 4),

  status        text not null default 'draft'
                check (status in ('draft', 'submitted', 'approved', 'refused')),

  submitted_by  uuid references auth.users (id),
  submitted_at  timestamptz,
  decided_by    uuid references auth.users (id),
  decided_at    timestamptz,
  decision_note text,

  created_by    uuid not null references auth.users (id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Une seule évaluation courante par mission
  unique (mission_id),

  -- Séparation des tâches : l'auteur ne se valide pas lui-même
  constraint risk_decider_is_not_submitter
    check (decided_by is null or submitted_by is null or decided_by <> submitted_by),

  -- Une décision porte toujours sa date et son auteur
  constraint risk_decision_is_traced
    check (
      (status in ('draft', 'submitted') and decided_by is null and decided_at is null)
      or (status in ('approved', 'refused') and decided_by is not null and decided_at is not null)
    )
);

alter table public.mission_risk_assessments enable row level security;

-- Lecture : tous les membres de l'organisation.
create policy risk_select on public.mission_risk_assessments
  for select using (public.is_org_member(org_id));

-- Création et modification : admin / manager, et uniquement tant que la
-- décision n'est pas prise.
create policy risk_insert on public.mission_risk_assessments
  for insert with check (public.can_write(org_id) and created_by = auth.uid());

create policy risk_update on public.mission_risk_assessments
  for update
  using (public.can_write(org_id) and status in ('draft', 'submitted'))
  with check (
    public.can_write(org_id)
    -- Le validateur, s'il y en a un, est bien l'utilisateur courant :
    -- impossible de faire signer quelqu'un d'autre.
    and (decided_by is null or decided_by = auth.uid())
  );

create policy risk_delete on public.mission_risk_assessments
  for delete using (public.can_write(org_id) and status = 'draft');

create index if not exists risk_org_idx     on public.mission_risk_assessments (org_id, status);
create index if not exists risk_mission_idx on public.mission_risk_assessments (mission_id);

-- Horodatage de modification, posé par la base et non par le client.
create or replace function public.touch_risk_assessment()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists risk_touch on public.mission_risk_assessments;
create trigger risk_touch
  before update on public.mission_risk_assessments
  for each row execute function public.touch_risk_assessment();
