-- 物語（1対1）の進行をサーバー側に置く。
--
-- これまで物語の盤面は端末の保存にあり、褒美もクライアントの申告で決まっていた。
-- 正式な資産（ペリカ・XP・術・碁印・着せ替え）が増える以上、盤面と勝敗は
-- サーバーで確かめる必要がある（統合仕様書 §16〜§17）。
--
-- 設計
--  ・1手ごとに triad_story_runs の data を置き換える。revision で競合を弾く。
--  ・進行中の run は1アカウント1本だけ（部分ユニーク索引）。これが
--    「同じ物語を2端末で同時に進める」事故を DB 側で止める（§31・§32）。
--  ・決着の確定は triad_commit_story_run が run と資産をひとつのトランザクション
--    で書く。途中で落ちても「盤面だけ終わって褒美が入らない」状態にならない。
--  ・requestId の重複は既存の triad_requests をそのまま使う（§41）。

create table if not exists public.triad_story_runs (
  run_id text primary key check (length(run_id) between 1 and 128),
  user_id uuid not null references auth.users(id) on delete cascade,
  stage_id int not null check (stage_id between 1 and 30),
  status text not null default 'playing' check (status in ('playing', 'finished', 'aborted')),
  data jsonb not null,
  revision bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 進行中は1人1本。2本目の作成は unique_violation になり、API が案内へ変える。
create unique index if not exists triad_story_runs_one_active
  on public.triad_story_runs (user_id) where status = 'playing';

create index if not exists triad_story_runs_by_user
  on public.triad_story_runs (user_id, updated_at desc);

alter table public.triad_story_runs enable row level security;

-- クライアントは Edge Function 経由でしか触れない（直接の読み書きは全面禁止）。
revoke all on public.triad_story_runs from anon, authenticated;

/**
 * 物語の1手・中止・決着をまとめて確定する。
 *
 * p_expected_revision が負のときは新規作成。
 * p_profile_data を渡した場合は、同じトランザクションで資産も確定する。
 * 返り値の status は triad_commit_profile と同じ語（committed / stale /
 * replay / conflict / missing / busy）で揃えてある。
 */
create or replace function public.triad_commit_story_run(
  p_user_id uuid,
  p_run_id text,
  p_expected_revision bigint,
  p_stage_id int,
  p_status text,
  p_run_data jsonb,
  p_profile_data jsonb,
  p_profile_revision bigint,
  p_request_id text,
  p_body_hash text,
  p_response jsonb
) returns table(status text, revision bigint, profile_revision bigint, response jsonb)
-- 返り値の名前（status・revision）は表の列名と同じなので、更新文では必ず
-- 別名で列を指す。そうしないと PL/pgSQL が 42702（column reference is
-- ambiguous）で落ちる。
language plpgsql security definer set search_path = public as $$
declare
  current_revision bigint;
  current_profile bigint;
  owner uuid;
  prior public.triad_requests%rowtype;
begin
  select * into prior from public.triad_requests
    where user_id = p_user_id and request_id = p_request_id for update;
  if found then
    if prior.body_hash <> p_body_hash then
      return query select 'conflict', null::bigint, null::bigint, null::jsonb;
    else
      return query select 'replay', null::bigint, null::bigint, prior.response;
    end if;
    return;
  end if;

  if p_expected_revision < 0 then
    begin
      insert into public.triad_story_runs(run_id, user_id, stage_id, status, data, revision)
        values (p_run_id, p_user_id, p_stage_id, p_status, p_run_data, 1);
      current_revision := 1;
    exception when unique_violation then
      -- 進行中の run がすでにある（同時開始）。作らずに知らせる。
      return query select 'busy', null::bigint, null::bigint, null::jsonb;
    end;
  else
    select r.revision, r.user_id into current_revision, owner
      from public.triad_story_runs r where r.run_id = p_run_id for update;
    if current_revision is null then
      return query select 'missing', null::bigint, null::bigint, null::jsonb; return;
    end if;
    if owner <> p_user_id then
      return query select 'missing', null::bigint, null::bigint, null::jsonb; return;
    end if;
    if current_revision <> p_expected_revision then
      return query select 'stale', current_revision, null::bigint, null::jsonb; return;
    end if;
    update public.triad_story_runs r2
      set data = p_run_data, status = p_status, updated_at = now(), revision = r2.revision + 1
      where r2.run_id = p_run_id
      returning r2.revision into current_revision;
  end if;

  if p_profile_data is not null then
    select tp.revision into current_profile from public.triad_profiles tp
      where tp.user_id = p_user_id for update;
    if current_profile is null then
      if p_profile_revision <> 0 then
        return query select 'stale', null::bigint, null::bigint, null::jsonb; return;
      end if;
      insert into public.triad_profiles(user_id, data, revision) values (p_user_id, p_profile_data, 1);
      current_profile := 1;
    else
      if current_profile <> p_profile_revision then
        return query select 'stale', null::bigint, current_profile, null::jsonb; return;
      end if;
      update public.triad_profiles tp2 set data = p_profile_data, revision = tp2.revision + 1, updated_at = now()
        where tp2.user_id = p_user_id
        returning tp2.revision into current_profile;
    end if;
  end if;

  insert into public.triad_requests(user_id, request_id, body_hash, response)
    values (p_user_id, p_request_id, p_body_hash, p_response);
  return query select 'committed', current_revision, current_profile, p_response;
end $$;

revoke all on function public.triad_commit_story_run(uuid,text,bigint,int,text,jsonb,jsonb,bigint,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.triad_commit_story_run(uuid,text,bigint,int,text,jsonb,jsonb,bigint,text,text,jsonb) to service_role;
