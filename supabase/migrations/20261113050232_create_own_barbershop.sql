begin;
create function private.create_own_barbershop(p_actor_id uuid, p_name text) returns jsonb
language plpgsql security definer set search_path = '' as $function$
declare shop public.barbershops; member public.barbershop_memberships;
begin
  if p_actor_id is null or not exists(select 1 from auth.users u where u.id=p_actor_id and not coalesce(u.is_anonymous,false)) then
    raise exception using errcode='42501',message='UNAUTHENTICATED';
  end if;
  if not exists(select 1 from public.profiles p where p.id=p_actor_id) then
    raise exception using errcode='P0001',message='PROFILE_REQUIRED';
  end if;
  if p_name is null or pg_catalog.btrim(p_name)='' then
    raise exception using errcode='22023',message='INVALID_INPUT';
  end if;
  insert into public.barbershops(name) values(pg_catalog.btrim(p_name)) returning * into shop;
  insert into public.barbershop_memberships(user_id,barbershop_id,role,status)
    values(p_actor_id,shop.id,'administrator','active') returning * into member;
  return pg_catalog.jsonb_build_object('barbershop',pg_catalog.to_jsonb(shop),'membership',pg_catalog.to_jsonb(member));
end;
$function$;
revoke all on function private.create_own_barbershop(uuid,text) from public,anon,authenticated;
grant execute on function private.create_own_barbershop(uuid,text) to service_role;
create function public.create_own_barbershop(p_actor_id uuid,p_name text) returns jsonb
language sql security invoker set search_path = '' as $function$
  select private.create_own_barbershop(p_actor_id,p_name);
$function$;
revoke all on function public.create_own_barbershop(uuid,text) from public,anon,authenticated;
grant execute on function public.create_own_barbershop(uuid,text) to service_role;
commit;
