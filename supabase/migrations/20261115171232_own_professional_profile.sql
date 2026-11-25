-- 008: authorized additive LOCAL profile RPC; no existing business rows are changed on application.
-- Adds functions only. No table/policy/grant rewrite or historical data backfill.
begin;

create function private.self_professional_command(p_actor_id uuid, p_action text, p_data jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $fn$
declare
  shop uuid;
  person public.barber_profiles%rowtype;
  new_name text;
begin
  perform private.booking_actor(p_actor_id);
  if p_action = 'get' then
    perform private.booking_keys(p_data, array['barbershopId']);
  elsif p_action = 'update' then
    perform private.booking_keys(p_data, array['barbershopId', 'professionalName']);
    if pg_catalog.jsonb_typeof(p_data->'professionalName') is distinct from 'string' then
      raise exception using errcode='22023', message='INVALID_INPUT';
    end if;
    new_name := pg_catalog.btrim(p_data->>'professionalName');
    if new_name = '' then raise exception using errcode='22023', message='INVALID_INPUT'; end if;
  else raise exception using errcode='22023', message='INVALID_INPUT';
  end if;
  if pg_catalog.jsonb_typeof(p_data->'barbershopId') is distinct from 'string' then
    raise exception using errcode='22023', message='INVALID_INPUT';
  end if;
  shop := (p_data->>'barbershopId')::uuid;

  -- Same order as004: tenant settings, current membership, professional.
  -- Serialize with admin changes and confirmation; never trust a stale JWT role.
  if p_action = 'update' then
    perform 1 from public.barbershop_booking_settings where barbershop_id = shop for update;
  else
    perform 1 from public.barbershop_booking_settings where barbershop_id = shop for share;
  end if;
  if not found then raise exception using errcode='42501', message='FORBIDDEN'; end if;
  perform 1 from public.barbershop_memberships m
    where m.user_id = p_actor_id and m.barbershop_id = shop
      and m.status = 'active' and m.role in ('barber', 'administrator') for share;
  if not found then raise exception using errcode='42501', message='FORBIDDEN'; end if;

  if p_action = 'update' then
    select p.* into person from public.barber_profiles p
      where p.user_id = p_actor_id and p.barbershop_id = shop and p.active for update;
  else
    select p.* into person from public.barber_profiles p
      where p.user_id = p_actor_id and p.barbershop_id = shop and p.active for share;
  end if;
  if not found then raise exception using errcode='P0002', message='NOT_AVAILABLE'; end if;
  if p_action = 'update' and person.professional_name is distinct from new_name then
    update public.barber_profiles set professional_name = new_name
      where id = person.id and user_id = p_actor_id and barbershop_id = shop
      returning * into person;
    update public.barbershop_booking_settings set version = version + 1 where barbershop_id = shop;
  end if;
  return pg_catalog.jsonb_build_object('id', person.id, 'barbershopId', shop,
    'userId', person.user_id, 'professionalName', person.professional_name, 'active', person.active);
end;
$fn$;

-- Narrow definer entry points: only the trusted Edge role can call them. They let
-- the internal invoker run as owner without granting service_role direct access.
-- The verified actor still undergoes explicit business authorization above.
create function public.get_own_booking_professional(p_actor_id uuid, p_data jsonb)
returns jsonb language sql security definer set search_path = '' as $fn$
  select private.self_professional_command(p_actor_id, 'get', p_data);
$fn$;
create function public.update_own_booking_professional(p_actor_id uuid, p_data jsonb)
returns jsonb language sql security definer set search_path = '' as $fn$
  select private.self_professional_command(p_actor_id, 'update', p_data);
$fn$;
revoke all on function private.self_professional_command(uuid,text,jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.get_own_booking_professional(uuid,jsonb),
  public.update_own_booking_professional(uuid,jsonb) from public, anon, authenticated, service_role;
grant execute on function public.get_own_booking_professional(uuid,jsonb),
  public.update_own_booking_professional(uuid,jsonb) to service_role;
notify pgrst, 'reload schema';
commit;

-- Future authorized reversal: drop public wrappers, then private function only,
-- no CASCADE and no deletion of profiles, memberships, settings or reservations.
