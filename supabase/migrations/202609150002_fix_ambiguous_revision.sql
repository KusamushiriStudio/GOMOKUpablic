-- 既存ユーザーの資産と対戦がまったく更新できなかった不具合の修正。
--
-- 症状
--   triad_commit_profile / triad_commit_match は、返り値を
--   `returns table(status text, revision bigint, ...)` で宣言している。
--   この名前は PL/pgSQL の変数になるため、更新文の中の
--       set ... revision = revision + 1
--   の右辺が「変数の revision」と「列の revision」のどちらとも取れる。
--   PostgreSQL はこれを 42702（column reference "revision" is ambiguous）
--   として実行時に落とす。
--
--   落ちるのは UPDATE の側だけなので、
--     ・新規プロフィールの作成（INSERT）は成功する
--     ・2回目以降の更新（ガチャ・育成・装備・名前・ミッション・対戦報酬・
--       対戦の着手）はすべて失敗する
--   という形になり、「登録はできるが何も進まない」状態になっていた。
--   実際、triad_profiles の revision は全員 1 のまま止まっていた。
--
-- 直し方
--   更新文で表に別名を付け、右辺を別名で修飾する。これで列だと確定する。
--   他の箇所（select ... into や returning）はもともと修飾済みなので触らない。

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
    update public.triad_profiles tp2
      set data = p_data, revision = tp2.revision + 1, updated_at = now()
      where tp2.user_id = p_user_id
      returning tp2.revision into current_revision;
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
  update public.triad_matches tm2
    set data = p_data, revision = tm2.revision + 1, updated_at = now()
    where tm2.match_id = p_match_id
    returning tm2.revision into current_revision;
  insert into public.triad_requests(user_id,request_id,body_hash,response) values(p_user_id,p_request_id,p_body_hash,p_response);
  return query select 'committed',current_revision,p_response;
end $$;

revoke all on function public.triad_commit_profile(uuid,bigint,jsonb,text,text,jsonb) from public, anon, authenticated;
revoke all on function public.triad_commit_match(uuid,text,bigint,jsonb,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.triad_commit_profile(uuid,bigint,jsonb,text,text,jsonb) to service_role;
grant execute on function public.triad_commit_match(uuid,text,bigint,jsonb,text,text,jsonb) to service_role;
