do $$
declare
  u1 uuid; u2 uuid; o uuid; t uuid; m uuid; a uuid;
  self_blocked boolean := false;
  untraced_blocked boolean := false;
  other_ok boolean := false;
begin
  select id into u1 from auth.users order by created_at asc limit 1;
  select id into u2 from auth.users where id <> u1 order by created_at desc limit 1;

  insert into public.organizations (name, tier, created_by) values ('TEST-ROLLBACK', 'pro', u1) returning id into o;
  insert into public.travelers (org_id, first_name, last_name, email)
    values (o, 'Test', 'Rollback', 'test@example.invalid') returning id into t;
  insert into public.missions (org_id, traveler_id, country_iso, country_name, date_start, date_end, created_by)
    values (o, t, 'MA', 'Maroc', current_date, current_date + 5, u1) returning id into m;

  insert into public.mission_risk_assessments
    (org_id, mission_id, factors, inherent_level, mitigations, residual_level, status, submitted_by, submitted_at, created_by)
    values (o, m, '[]'::jsonb, 3, '{}', 2, 'submitted', u1, now(), u1)
    returning id into a;

  -- 1. Auto-validation : doit etre refusee
  begin
    update public.mission_risk_assessments
      set status = 'approved', decided_by = u1, decided_at = now() where id = a;
  exception when check_violation then self_blocked := true;
  end;

  -- 2. Decision sans trace : doit etre refusee
  begin
    update public.mission_risk_assessments
      set status = 'approved' where id = a;
  exception when check_violation then untraced_blocked := true;
  end;

  -- 3. Validation par une autre personne : doit passer
  begin
    update public.mission_risk_assessments
      set status = 'approved', decided_by = u2, decided_at = now() where id = a;
    other_ok := true;
  exception when others then other_ok := false;
  end;

  raise exception 'RESULTAT auto_validation_bloquee=% decision_sans_trace_bloquee=% validation_par_autrui_ok=%',
    self_blocked, untraced_blocked, other_ok;
end $$;
