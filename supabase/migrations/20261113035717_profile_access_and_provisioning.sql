begin;

-- Only a profile's owner may read or edit its basic fields.
grant select (id, display_name, phone) on public.profiles to authenticated;
grant update (display_name, phone) on public.profiles to authenticated;
create policy profiles_select_own on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create schema if not exists private;
revoke all on schema private from public, anon, authenticated, service_role;
grant usage on schema private to service_role;

-- The actor parameter is trusted only across the restricted server boundary.
-- Edge must verify Auth before calling; this function also checks current identity existence.
create function private.ensure_own_profile(
  p_actor_id uuid, p_display_name text, p_phone text
) returns setof public.profiles
language plpgsql security definer set search_path = '' as $function$
begin
  if p_actor_id is null or not exists (
    select 1 from auth.users u where u.id = p_actor_id and not coalesce(u.is_anonymous, false)
  ) then
    raise exception using errcode = '42501', message = 'UNAUTHENTICATED';
  end if;
  if p_display_name is null or pg_catalog.btrim(p_display_name) = '' then
    raise exception using errcode = '22023', message = 'INVALID_INPUT';
  end if;
  insert into public.profiles (id, display_name, phone)
    values (p_actor_id, pg_catalog.btrim(p_display_name), nullif(pg_catalog.btrim(p_phone), ''))
    on conflict (id) do nothing;
  -- Separate statement obtains the committed row after an overlapping insert at READ COMMITTED.
  return query select p.id, p.display_name, p.phone from public.profiles p where p.id = p_actor_id;
end;
$function$;
revoke all on function private.ensure_own_profile(uuid, text, text) from public, anon, authenticated;
grant execute on function private.ensure_own_profile(uuid, text, text) to service_role;

create function public.ensure_own_profile(
  p_actor_id uuid, p_display_name text, p_phone text
) returns setof public.profiles
language sql security invoker set search_path = '' as $function$
  select p.id, p.display_name, p.phone
  from private.ensure_own_profile(p_actor_id, p_display_name, p_phone) p;
$function$;
revoke all on function public.ensure_own_profile(uuid, text, text) from public, anon, authenticated;
grant execute on function public.ensure_own_profile(uuid, text, text) to service_role;

commit;
