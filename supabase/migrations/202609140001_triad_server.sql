create table if not exists public.triad_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.triad_rooms (
  code text primary key check (code ~ '^[0-9A-F]{6}$'),
  data jsonb not null,
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.triad_matches (
  match_id text primary key,
  room_code text references public.triad_rooms(code) on delete set null,
  data jsonb not null,
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.triad_requests (
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id text not null check (length(request_id) between 1 and 128),
  body_hash text not null,
  response jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, request_id)
);

alter table public.triad_profiles enable row level security;
alter table public.triad_rooms enable row level security;
alter table public.triad_matches enable row level security;
alter table public.triad_requests enable row level security;

revoke all on public.triad_profiles, public.triad_rooms, public.triad_matches, public.triad_requests from anon, authenticated;

alter table public.triad_rooms replica identity full;
alter table public.triad_matches replica identity full;
do $$ begin
  alter publication supabase_realtime add table public.triad_rooms;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.triad_matches;
exception when duplicate_object then null;
end $$;

create or replace function public.triad_commit_profile(
  p_user_id uuid,
  p_expected_revision bigint,
  p_data jsonb,
  p_request_id text,
  p_body_hash text,
  p_response jsonb
) returns table(status text, revision bigint, response jsonb)
language plpgsql security definer set search_path = public as $$
declare
  current_revision bigint;
  prior public.triad_requests%rowtype;
begin
  select * into prior from public.triad_requests
    where user_id = p_user_id and request_id = p_request_id for update;
  if found then
    if prior.body_hash <> p_body_hash then return query select 'conflict', null::bigint, null::jsonb;
    else return query select 'replay', null::bigint, prior.response; end if;
    return;
  end if;
  select tp.revision into current_revision from public.triad_profiles tp where tp.user_id = p_user_id for update;
  if current_revision is null then
    if p_expected_revision <> 0 then return query select 'stale', null::bigint, null::jsonb; return; end if;
    insert into public.triad_profiles(user_id, data, revision) values (p_user_id, p_data, 1);
    current_revision := 1;
  else
    if current_revision <> p_expected_revision then return query select 'stale', current_revision, null::jsonb; return; end if;
    update public.triad_profiles set data = p_data, revision = revision + 1, updated_at = now() where user_id = p_user_id returning triad_profiles.revision into current_revision;
  end if;
  insert into public.triad_requests(user_id, request_id, body_hash, response) values (p_user_id, p_request_id, p_body_hash, p_response);
  return query select 'committed', current_revision, p_response;
end $$;

create or replace function public.triad_commit_match(
  p_user_id uuid,
  p_match_id text,
  p_expected_revision bigint,
  p_data jsonb,
  p_request_id text,
  p_body_hash text,
  p_response jsonb
) returns table(status text, revision bigint, response jsonb)
language plpgsql security definer set search_path = public as $$
declare current_revision bigint; prior public.triad_requests%rowtype;
begin
  select * into prior from public.triad_requests where user_id=p_user_id and request_id=p_request_id for update;
  if found then
    if prior.body_hash <> p_body_hash then return query select 'conflict',null::bigint,null::jsonb;
    else return query select 'replay',null::bigint,prior.response; end if;
    return;
  end if;
  select tm.revision into current_revision from public.triad_matches tm where tm.match_id=p_match_id for update;
  if current_revision is null then return query select 'missing',null::bigint,null::jsonb; return; end if;
  if current_revision <> p_expected_revision then return query select 'stale',current_revision,null::jsonb; return; end if;
  update public.triad_matches set data=p_data, revision=revision+1, updated_at=now() where match_id=p_match_id returning triad_matches.revision into current_revision;
  insert into public.triad_requests(user_id,request_id,body_hash,response) values(p_user_id,p_request_id,p_body_hash,p_response);
  return query select 'committed',current_revision,p_response;
end $$;

revoke all on function public.triad_commit_profile(uuid,bigint,jsonb,text,text,jsonb) from public, anon, authenticated;
revoke all on function public.triad_commit_match(uuid,text,bigint,jsonb,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.triad_commit_profile(uuid,bigint,jsonb,text,text,jsonb) to service_role;
grant execute on function public.triad_commit_match(uuid,text,bigint,jsonb,text,text,jsonb) to service_role;
