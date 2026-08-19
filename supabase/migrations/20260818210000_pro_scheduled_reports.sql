-- ════════════════════════════════════════════════════════════════════════
--  Lokadia Pro — rapports programmés (complément du Lot P6)
-- ════════════════════════════════════════════════════════════════════════
--
--  Le cadrage prévoyait des rapports programmés ; seul un drapeau
--  d'offre existait. Voici le mécanisme.
--
--  Choix d'architecture : **la génération est écrite en SQL, pas dans une
--  Edge Function.** Programmer l'appel d'une fonction HTTP obligerait à
--  stocker une clé de service dans la commande cron, donc dans la base.
--  Une fonction SQL appelée par pg_cron n'a besoin d'aucun secret : rien
--  à protéger, rien à faire fuiter.
--
--  Le rapport est un instantané de conformité, celui qu'un responsable
--  regarde le lundi matin : qui part, quels dossiers sont incomplets,
--  quels accusés manquent, quelles alertes traînent, quelles évaluations
--  de risque attendent une validation.

create extension if not exists pg_cron;

-- ─── 1. Abonnements aux rapports ─────────────────────────────────────────

create table if not exists public.scheduled_reports (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  kind         text not null default 'compliance'
               check (kind in ('compliance')),
  frequency    text not null default 'weekly'
               check (frequency in ('weekly', 'monthly')),
  active       boolean not null default true,
  /** Prochaine échéance — c'est elle qui décide, pas un calcul au vol */
  next_run_at  timestamptz not null default (now() + interval '7 days'),
  last_run_at  timestamptz,
  created_by   uuid not null references auth.users (id),
  created_at   timestamptz not null default now(),
  unique (org_id, kind)
);

-- ─── 2. Rapports produits ────────────────────────────────────────────────

create table if not exists public.report_runs (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  kind          text not null,
  /** true = déclenché à la main depuis le back-office */
  manual        boolean not null default false,
  payload       jsonb not null,
  created_at    timestamptz not null default now()
);

alter table public.scheduled_reports enable row level security;
alter table public.report_runs       enable row level security;

create policy scheduled_reports_select on public.scheduled_reports
  for select using (public.is_org_member(org_id));
create policy scheduled_reports_insert on public.scheduled_reports
  for insert with check (public.can_write(org_id) and created_by = auth.uid());
create policy scheduled_reports_update on public.scheduled_reports
  for update using (public.can_write(org_id));
create policy scheduled_reports_delete on public.scheduled_reports
  for delete using (public.can_write(org_id));

-- Les rapports sont lus par l'organisation, jamais écrits par le client :
-- un rapport de conformité fabriqué à la main ne prouverait rien.
create policy report_runs_select on public.report_runs
  for select using (public.is_org_member(org_id));

create index if not exists report_runs_org_idx on public.report_runs (org_id, created_at desc);

-- ─── 3. Le contenu du rapport ────────────────────────────────────────────

/**
 * Instantané de conformité d'une organisation, à l'instant présent.
 *
 * Chaque chiffre est calculé, jamais estimé, et le rapport porte sa date :
 * il vaut pour le moment où il a été produit, ce qui est précisément ce
 * qu'on demande à une preuve.
 */
create or replace function public.build_compliance_snapshot(p_org uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'generated_at', now(),
    'organization', (select name from public.organizations where id = p_org),
    'travelers', (select count(*) from public.travelers where org_id = p_org),
    'missions_total', (select count(*) from public.missions where org_id = p_org),
    'missions_active', (
      select count(*) from public.missions
      where org_id = p_org and status in ('approved', 'active')
        and date_start <= current_date and date_end >= current_date
    ),
    'missions_upcoming_30d', (
      select count(*) from public.missions
      where org_id = p_org and status not in ('refused', 'done')
        and date_start > current_date and date_start <= current_date + 30
    ),
    'compliance_complete', (
      select count(*) from public.missions m
      where m.org_id = p_org
        and 4 = (select count(*) from public.compliance_items c
                 where c.mission_id = m.id and c.status = 'done')
    ),
    'compliance_incomplete', (
      select count(*) from public.missions m
      where m.org_id = p_org
        and 4 > (select count(*) from public.compliance_items c
                 where c.mission_id = m.id and c.status = 'done')
    ),
    'briefings_acknowledged', (
      select count(*) from public.briefing_receipts
      where org_id = p_org and read_at is not null
    ),
    'briefings_pending', (
      select count(*) from public.briefing_receipts
      where org_id = p_org and read_at is null
    ),
    'watch_alerts_open', (
      select count(*) from public.watch_alerts
      where org_id = p_org and status = 'open'
    ),
    'risk_awaiting_decision', (
      select count(*) from public.mission_risk_assessments
      where org_id = p_org and status = 'submitted'
    ),
    'risk_residual_high', (
      select count(*) from public.mission_risk_assessments
      where org_id = p_org and status = 'approved' and residual_level >= 3
    )
  );
$$;

/**
 * Génération manuelle, depuis le back-office. Réservée aux membres de
 * l'organisation concernée — la vérification est faite ici, pas côté
 * client.
 */
create or replace function public.generate_report_now(p_org uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_org_member(p_org) then
    raise exception 'Vous ne faites pas partie de cette organisation.';
  end if;

  insert into public.report_runs (org_id, kind, manual, payload)
  values (p_org, 'compliance', true, public.build_compliance_snapshot(p_org))
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.generate_report_now(uuid) from public;
grant execute on function public.generate_report_now(uuid) to authenticated;

/**
 * Passage programmé : produit les rapports échus et repositionne la
 * prochaine échéance. Aucun paramètre, aucun secret — pg_cron l'appelle
 * directement.
 */
create or replace function public.run_due_reports()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  produced integer := 0;
begin
  for r in
    select * from public.scheduled_reports
    where active and next_run_at <= now()
  loop
    insert into public.report_runs (org_id, kind, manual, payload)
    values (r.org_id, r.kind, false, public.build_compliance_snapshot(r.org_id));

    update public.scheduled_reports
       set last_run_at = now(),
           next_run_at = now() + case when r.frequency = 'monthly'
                                      then interval '1 month'
                                      else interval '7 days' end
     where id = r.id;

    produced := produced + 1;
  end loop;

  return produced;
end;
$$;

revoke all on function public.run_due_reports() from public;

-- ─── 4. Planification réelle ─────────────────────────────────────────────
-- Tous les jours à 6 h UTC : la fonction ne produit que ce qui est échu,
-- un passage quotidien suffit donc pour des fréquences hebdomadaires ou
-- mensuelles, sans réveiller la base plus que nécessaire.
select cron.unschedule('lokadia-due-reports')
  where exists (select 1 from cron.job where jobname = 'lokadia-due-reports');

select cron.schedule(
  'lokadia-due-reports',
  '0 6 * * *',
  $cron$ select public.run_due_reports(); $cron$
);
