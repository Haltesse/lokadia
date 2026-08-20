-- ════════════════════════════════════════════════════════════════════════
--  Correctif : le droit à l'effacement bloqué par les journaux append-only
-- ════════════════════════════════════════════════════════════════════════
--
--  Bug trouvé par `supabase/tests/pro-journey.mjs`.
--
--  `audit_log` et `crisis_log` sont volontairement inaltérables : un
--  déclencheur refuse tout UPDATE et tout DELETE, y compris en
--  service_role. C'est ce qui rend le registre présentable à un auditeur.
--
--  Mais le déclencheur ne distinguait pas la suppression d'une ligne
--  isolée de la suppression **en cascade** provoquée par l'effacement de
--  l'organisation entière. Conséquence : dès qu'une organisation avait une
--  seule entrée de journal, elle devenait indestructible — et le bouton
--  « Supprimer l'organisation et toutes ses données » de l'écran RGPD
--  échouait en erreur 400. Une obligation légale (article 17 du RGPD)
--  rendue inopérante par une protection technique.
--
--  Le correctif distingue les deux cas par une question simple : **est-ce
--  que l'organisation existe encore ?** Lors d'un effacement en cascade,
--  la ligne parente est déjà supprimée quand le déclencheur enfant se
--  déclenche ; lors d'une suppression ciblée, elle est toujours là.
--
--  La garantie qui compte est préservée : tant que l'organisation vit,
--  personne — pas même nous — ne peut effacer une entrée de son journal.
--  Quand elle exerce son droit à l'effacement, tout part, journal compris.
--  Un journal qui survivrait à l'effacement des données qu'il décrit
--  serait lui-même une violation.

create or replace function public.audit_log_immutable()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE'
     and not exists (select 1 from public.organizations where id = old.org_id) then
    return old;
  end if;
  raise exception 'audit_log est en append-only : % interdit', tg_op;
end;
$$;

create or replace function public.crisis_log_immutable()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE'
     and not exists (select 1 from public.organizations where id = old.org_id) then
    return old;
  end if;
  raise exception 'crisis_log est en append-only : % interdit', tg_op;
end;
$$;
