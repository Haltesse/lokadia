-- Le journal d'audit reste inaltérable — sauf quand l'organisation entière
-- est effacée.
--
--   npx supabase db query --linked --file supabase/tests/audit-log-immutability.sql
--
-- Trois cas, dans l'ordre où ils comptent :
--   1. supprimer une entrée isolée → refusé
--   2. modifier une entrée         → refusé
--   3. effacer l'organisation      → accepté, le journal part avec elle
--
-- Tout est annulé par une exception finale : le test ne laisse rien en base.

do $$
declare
  u1 uuid; o uuid;
  delete_bloque boolean := false;
  update_bloque boolean := false;
  cascade_ok    boolean := false;
begin
  select id into u1 from auth.users order by created_at asc limit 1;

  insert into public.organizations (name, tier, created_by)
    values ('TEST-IMMUTABILITE', 'pro', u1) returning id into o;

  insert into public.audit_log (org_id, actor, actor_label, action)
    values (o, u1, 'test@exemple.invalid', 'test.entry');

  -- 1. Suppression ciblée : doit être refusée tant que l'organisation vit
  begin
    delete from public.audit_log where org_id = o;
  exception when others then delete_bloque := true;
  end;

  -- 2. Modification : toujours refusée
  begin
    update public.audit_log set action = 'falsifie' where org_id = o;
  exception when others then update_bloque := true;
  end;

  -- 3. Effacement de l'organisation : la cascade doit passer
  begin
    delete from public.organizations where id = o;
    cascade_ok := true;
  exception when others then cascade_ok := false;
  end;

  raise exception 'RESULTAT suppression_ciblee_bloquee=% modification_bloquee=% effacement_org_possible=%',
    delete_bloque, update_bloque, cascade_ok;
end $$;
