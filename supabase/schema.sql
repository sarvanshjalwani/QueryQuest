create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default ''
    check (char_length(display_name) <= 60),
  editor_theme text not null default 'vs-dark'
    check (editor_theme in ('vs-dark', 'light')),
  editor_font_size integer not null default 14
    check (editor_font_size between 12 and 20),
  created_at timestamptz not null default now()
);

create table if not exists public.query_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  question_title text not null,
  difficulty text not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.question_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  question_title text not null,
  difficulty text not null,
  solved_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists query_attempts_user_created_idx
  on public.query_attempts (user_id, created_at desc);
create index if not exists query_attempts_user_question_idx
  on public.query_attempts (user_id, question_id, is_correct);

alter table public.profiles enable row level security;
alter table public.query_attempts enable row level security;
alter table public.question_progress enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can read their own attempts" on public.query_attempts;
create policy "Users can read their own attempts"
  on public.query_attempts for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own attempts" on public.query_attempts;
create policy "Users can insert their own attempts"
  on public.query_attempts for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own question progress" on public.question_progress;
create policy "Users can read their own question progress"
  on public.question_progress for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own question progress" on public.question_progress;
create policy "Users can insert their own question progress"
  on public.question_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own question progress" on public.question_progress;
create policy "Users can update their own question progress"
  on public.question_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, update on public.profiles to authenticated;
grant select, insert on public.query_attempts to authenticated;
grant usage, select on sequence public.query_attempts_id_seq to authenticated;
grant select, insert, update on public.question_progress to authenticated;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_profile_after_signup on auth.users;
create trigger create_profile_after_signup
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

create or replace view public.user_statistics
with (security_invoker = true)
as
select
  user_id,
  count(*)::bigint as total_attempts,
  count(*) filter (where is_correct)::bigint as correct_attempts,
  count(distinct question_id) filter (where is_correct)::bigint as solved_questions,
  case
    when count(*) = 0 then 0
    else round(100.0 * count(*) filter (where is_correct) / count(*), 1)
  end as accuracy_percent
from public.query_attempts
group by user_id;

create or replace view public.difficulty_statistics
with (security_invoker = true)
as
select
  user_id,
  difficulty,
  count(*)::bigint as total_attempts,
  count(*) filter (where is_correct)::bigint as correct_attempts
from public.query_attempts
group by user_id, difficulty;

grant select on public.user_statistics to authenticated;
grant select on public.difficulty_statistics to authenticated;
