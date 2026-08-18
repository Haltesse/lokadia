-- ════════════════════════════════════════════════════════════════════════
--  Avis sur l'application (page /rate)
-- ════════════════════════════════════════════════════════════════════════
--
--  Un avis est **rattaché à un compte**, et il n'y en a qu'un par compte,
--  modifiable. C'est ce qui distingue un retour utilisateur d'un
--  formulaire à spam : sans compte, rien n'empêche de déposer mille notes.
--  L'alternative — un envoi anonyme — supposerait une modération que nous
--  n'avons pas.
--
--  Personne ne lit l'avis d'un autre : la RLS limite la lecture à ses
--  propres lignes. La moyenne publique passe par une fonction dédiée qui
--  ne renvoie que des agrégats, jamais les lignes.

create table if not exists public.app_ratings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  rating     smallint not null check (rating between 1 and 5),
  comment    text check (comment is null or char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.app_ratings enable row level security;

create policy app_ratings_select on public.app_ratings
  for select using (auth.uid() = user_id);
create policy app_ratings_insert on public.app_ratings
  for insert with check (auth.uid() = user_id);
create policy app_ratings_update on public.app_ratings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy app_ratings_delete on public.app_ratings
  for delete using (auth.uid() = user_id);

create index if not exists app_ratings_created_idx on public.app_ratings (created_at desc);

-- Horodatage de modification posé par la base, pas par le client.
create or replace function public.touch_app_rating()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists app_ratings_touch on public.app_ratings;
create trigger app_ratings_touch
  before update on public.app_ratings
  for each row execute function public.touch_app_rating();

/**
 * Agrégat public : nombre d'avis et moyenne.
 *
 * `security definer` parce que la RLS interdit — volontairement — de lire
 * les lignes des autres. La fonction ne renvoie que des agrégats : on peut
 * connaître la moyenne sans pouvoir remonter à un avis.
 *
 * La moyenne n'est renvoyée qu'à partir de 10 avis. En deçà, une note
 * affichée « 5,0 » reposant sur deux votes est un argument commercial, pas
 * une information : le client renvoie alors null et l'écran le dit.
 */
create or replace function public.app_rating_summary()
returns table (total bigint, average numeric)
language sql
security definer
set search_path = public
as $$
  select
    count(*)::bigint as total,
    case when count(*) >= 10 then round(avg(rating)::numeric, 1) end as average
  from public.app_ratings;
$$;

revoke all on function public.app_rating_summary() from public;
grant execute on function public.app_rating_summary() to anon, authenticated;
