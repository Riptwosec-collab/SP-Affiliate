-- Additive SP-Affiliate objects only. No existing application tables/settings change.
create table public.sp_affiliate_workspaces (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null default 1 check (revision > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 20971520),
  updated_at timestamptz not null default now()
);
alter table public.sp_affiliate_workspaces enable row level security;
create policy sp_affiliate_owner_select on public.sp_affiliate_workspaces for select to authenticated using ((select auth.uid()) = owner_id);
create policy sp_affiliate_owner_insert on public.sp_affiliate_workspaces for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy sp_affiliate_owner_update on public.sp_affiliate_workspaces for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
revoke all on public.sp_affiliate_workspaces from anon, public;
grant select, insert, update on public.sp_affiliate_workspaces to authenticated;
create function public.sp_affiliate_save_workspace(p_expected_revision bigint, p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_revision bigint; v_updated timestamptz; k text;
begin
  if auth.uid() is null then raise exception 'SIGN_IN_REQUIRED' using errcode='42501'; end if;
  if p_expected_revision is null or p_expected_revision < 0 or p_payload is null or
    p_payload->>'app' is distinct from 'Affiliate Intelligence Studio' or
    p_payload->>'mode' is distinct from 'real' or p_payload->'data'->>'schemaVersion' is distinct from '2' or
    octet_length(p_payload::text) > 20971520 then raise exception 'INVALID_BACKUP'; end if;
  foreach k in array array['products','stories','plans','posts','experiments'] loop
    if jsonb_typeof(p_payload->'data'->k) is distinct from 'array' then raise exception 'INVALID_BACKUP'; end if;
  end loop;
  if p_expected_revision = 0 then
    insert into public.sp_affiliate_workspaces(owner_id,payload) values(auth.uid(),p_payload)
      on conflict (owner_id) do nothing returning revision,updated_at into v_revision,v_updated;
  else
    update public.sp_affiliate_workspaces set payload=p_payload, revision=revision+1, updated_at=now()
      where owner_id=auth.uid() and revision=p_expected_revision returning revision,updated_at into v_revision,v_updated;
  end if;
  if v_revision is null then raise exception 'CLOUD_CONFLICT' using errcode='P0001'; end if;
  return jsonb_build_object('revision',v_revision,'updated_at',v_updated);
end $$;
revoke all on function public.sp_affiliate_save_workspace(bigint,jsonb) from public,anon;
grant execute on function public.sp_affiliate_save_workspace(bigint,jsonb) to authenticated;

create table public.sp_affiliate_usage (
  bucket text not null,
  day date not null default (now() at time zone 'UTC')::date,
  kind text not null check(kind in ('ai','shopee')),
  requests integer not null default 0,
  primary key(bucket,day,kind)
);
alter table public.sp_affiliate_usage enable row level security;
revoke all on public.sp_affiliate_usage from public,anon,authenticated;
grant select,insert,update,delete on public.sp_affiliate_usage to service_role;
create function public.sp_affiliate_consume_limit(p_user uuid,p_kind text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare n integer; global_max integer; user_max integer;
begin
  if p_user is null or p_kind not in ('ai','shopee') then return false; end if;
  global_max := case when p_kind='ai' then 100 else 500 end;
  user_max := case when p_kind='ai' then 10 else 40 end;
  insert into public.sp_affiliate_usage(bucket,kind,requests) values('global',p_kind,1)
    on conflict (bucket,day,kind) do update set requests=public.sp_affiliate_usage.requests+1
    where public.sp_affiliate_usage.requests<global_max returning requests into n;
  if n is null then return false; end if;
  n:=null;
  insert into public.sp_affiliate_usage(bucket,kind,requests) values(p_user::text,p_kind,1)
    on conflict (bucket,day,kind) do update set requests=public.sp_affiliate_usage.requests+1
    where public.sp_affiliate_usage.requests<user_max returning requests into n;
  if n is null then raise no_data_found; end if;
  return true;
exception when no_data_found then
  -- Roll back both counters when the per-account quota rejects this request.
  return false;
end $$;
revoke all on function public.sp_affiliate_consume_limit(uuid,text) from public,anon,authenticated;
grant execute on function public.sp_affiliate_consume_limit(uuid,text) to service_role;
