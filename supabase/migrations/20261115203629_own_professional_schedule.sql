-- 009: own professional schedule, LOCAL activation authorized 2026-11-15.
begin;
create function private.self_schedule_command(p_actor_id uuid, p_action text, p_data jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $fn$
declare
  shop uuid;
  person uuid;
  profile_json jsonb;
  cfg public.barbershop_booking_settings%rowtype;
  item jsonb;
  block_id uuid;
  block_start timestamptz;
  block_end timestamptz;
  block_reason text;
begin
  perform private.booking_actor(p_actor_id);
  case p_action
    when 'read' then perform private.booking_keys(p_data, array['barbershopId']);
    when 'hours' then perform private.booking_keys(p_data, array['barbershopId','version','hours']);
    when 'upsert' then perform private.booking_keys(p_data, array['barbershopId','version','block']);
    when 'remove' then perform private.booking_keys(p_data, array['barbershopId','version','blockId']);
    else raise exception using errcode='22023', message='INVALID_INPUT';
  end case;
  if pg_catalog.jsonb_typeof(p_data->'barbershopId') is distinct from 'string' then
    raise exception using errcode='22023', message='INVALID_INPUT';
  end if;
  shop := (p_data->>'barbershopId')::uuid;
  -- Config comes first: existing004 confirmation holds SHARE before person keys.
  -- UPDATE serializes changes with confirmations and admin offering changes.
  if p_action = 'read' then
    select * into cfg from public.barbershop_booking_settings where barbershop_id=shop for share;
  else
    select * into cfg from public.barbershop_booking_settings where barbershop_id=shop for update;
  end if;
  if not found then raise exception using errcode='42501', message='FORBIDDEN'; end if;
  -- 008 locks/revalidates current membership and active own profile; no arbitrary barberId.
  profile_json := private.self_professional_command(p_actor_id,'get',pg_catalog.jsonb_build_object('barbershopId',shop));
  person := (profile_json->>'id')::uuid;
  if p_action <> 'read' then
    if pg_catalog.jsonb_typeof(p_data->'version') is distinct from 'number'
       or (p_data->>'version') !~ '^[1-9][0-9]*$' then
      raise exception using errcode='22023', message='INVALID_INPUT';
    end if;
    if (p_data->>'version')::integer <> cfg.version then
      raise exception using errcode='23505', message='CONFLICT';
    end if;
  end if;
  if p_action = 'hours' then
    if pg_catalog.jsonb_typeof(p_data->'hours') is distinct from 'array' then
      raise exception using errcode='22023', message='INVALID_INPUT';
    end if;
    -- Deletes only the requesting professional's intervals, within this transaction.
    -- Any invalid replacement or committed-booking conflict rolls the whole change back.
    delete from public.barber_schedules where barbershop_id=shop and barber_id=person;
    for item in select * from pg_catalog.jsonb_array_elements(p_data->'hours') loop
      perform private.booking_keys(item,array['weekday','opensMin','closesMin']);
      if pg_catalog.jsonb_typeof(item->'weekday') is distinct from 'number'
        or pg_catalog.jsonb_typeof(item->'opensMin') is distinct from 'number'
        or pg_catalog.jsonb_typeof(item->'closesMin') is distinct from 'number'
        or (item->>'weekday') !~ '^[0-6]$'
        or (item->>'opensMin') !~ '^[0-9]+$' or (item->>'closesMin') !~ '^[0-9]+$' then
        raise exception using errcode='22023', message='INVALID_INPUT';
      end if;
      insert into public.barber_schedules(barbershop_id,barber_id,weekday,opens_min,closes_min)
        values(shop,person,(item->>'weekday')::integer,(item->>'opensMin')::integer,(item->>'closesMin')::integer);
    end loop;
    -- Existing004 table constraints/exclusion and containment trigger remain authoritative.
    set constraints public.professional_hours_containment immediate;
  elsif p_action = 'upsert' then
    item := p_data->'block';
    perform private.booking_keys(item,array['id','startsAt','endsAt','reason']);
    if pg_catalog.jsonb_typeof(item->'id') is distinct from 'string'
      or pg_catalog.jsonb_typeof(item->'startsAt') is distinct from 'string'
      or pg_catalog.jsonb_typeof(item->'endsAt') is distinct from 'string'
      or (pg_catalog.jsonb_typeof(item->'reason') not in ('string','null')) then
      raise exception using errcode='22023', message='INVALID_INPUT';
    end if;
    block_id := (item->>'id')::uuid;
    if (item->>'startsAt') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$'
      or (item->>'endsAt') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$' then
      raise exception using errcode='22023', message='INVALID_INPUT';
    end if;
    block_start := (item->>'startsAt')::timestamptz;
    block_end := (item->>'endsAt')::timestamptz;
    block_reason := nullif(pg_catalog.btrim(item->>'reason'),'');
    if not pg_catalog.isfinite(block_start) or not pg_catalog.isfinite(block_end) or block_start>=block_end then
      raise exception using errcode='22023', message='INVALID_INPUT';
    end if;
    insert into public.schedule_exceptions(id,barbershop_id,barber_id,starts_at,ends_at,reason)
      values(block_id,shop,person,block_start,block_end,block_reason)
      on conflict(id) do update set starts_at=excluded.starts_at,ends_at=excluded.ends_at,reason=excluded.reason
      where public.schedule_exceptions.barbershop_id=shop and public.schedule_exceptions.barber_id=person;
    if not found then raise exception using errcode='42501', message='FORBIDDEN'; end if;
  elsif p_action = 'remove' then
    if pg_catalog.jsonb_typeof(p_data->'blockId') is distinct from 'string' then
      raise exception using errcode='22023', message='INVALID_INPUT';
    end if;
    block_id := (p_data->>'blockId')::uuid;
    delete from public.schedule_exceptions where id=block_id and barbershop_id=shop and barber_id=person;
    if not found then raise exception using errcode='P0002', message='NOT_AVAILABLE'; end if;
  end if;
  if p_action <> 'read' then
    if exists (
      select 1 from public.reservations r where r.barbershop_id=shop and r.barber_id=person
        and r.state='confirmed' and r.occupied_until>pg_catalog.clock_timestamp() and (
        not coalesce((select pg_catalog.range_agg(tstzrange(
          ((r.starts_at at time zone 'America/Lima')::date+pg_catalog.make_interval(mins=>h.opens_min)) at time zone 'America/Lima',
          ((r.starts_at at time zone 'America/Lima')::date+pg_catalog.make_interval(mins=>h.closes_min)) at time zone 'America/Lima','[)'))
          from public.barber_schedules h where h.barber_id=person and h.barbershop_id=shop
            and h.weekday=extract(dow from r.starts_at at time zone 'America/Lima')) @> tstzrange(r.starts_at,r.occupied_until,'[)'),false)
        or exists(select 1 from public.schedule_exceptions e where e.barbershop_id=shop
          and (e.barber_id is null or e.barber_id=person)
          and tstzrange(e.starts_at,e.ends_at,'[)') && tstzrange(r.starts_at,r.occupied_until,'[)'))
      )
    ) then raise exception using errcode='23505', message='CONFLICT'; end if;
    update public.barbershop_booking_settings set version=version+1 where barbershop_id=shop returning * into cfg;
  end if;
  return pg_catalog.jsonb_build_object('professional',profile_json,'version',cfg.version,
    'shopHours',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('weekday',h.weekday,'opensMin',h.opens_min,'closesMin',h.closes_min) order by h.weekday,h.opens_min) from public.barbershop_hours h where h.barbershop_id=shop),'[]'::jsonb),
    'hours',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('weekday',h.weekday,'opensMin',h.opens_min,'closesMin',h.closes_min) order by h.weekday,h.opens_min) from public.barber_schedules h where h.barbershop_id=shop and h.barber_id=person),'[]'::jsonb),
    'blocks',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('id',e.id,'startsAt',pg_catalog.to_char(e.starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'endsAt',pg_catalog.to_char(e.ends_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'reason',e.reason) order by e.starts_at,e.id) from public.schedule_exceptions e where e.barbershop_id=shop and e.barber_id=person),'[]'::jsonb));
end;
$fn$;

create function public.get_own_booking_schedule(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path = '' as $fn$ select private.self_schedule_command(p_actor_id,'read',p_data); $fn$;
create function public.set_own_booking_schedule(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path = '' as $fn$ select private.self_schedule_command(p_actor_id,'hours',p_data); $fn$;
create function public.upsert_own_booking_block(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path = '' as $fn$ select private.self_schedule_command(p_actor_id,'upsert',p_data); $fn$;
create function public.remove_own_booking_block(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path = '' as $fn$ select private.self_schedule_command(p_actor_id,'remove',p_data); $fn$;
revoke all on function private.self_schedule_command(uuid,text,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.get_own_booking_schedule(uuid,jsonb),public.set_own_booking_schedule(uuid,jsonb),public.upsert_own_booking_block(uuid,jsonb),public.remove_own_booking_block(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.get_own_booking_schedule(uuid,jsonb),public.set_own_booking_schedule(uuid,jsonb),public.upsert_own_booking_block(uuid,jsonb),public.remove_own_booking_block(uuid,jsonb) to service_role;
notify pgrst, 'reload schema';
commit;
-- Future authorized reversal: remove only these four wrappers, then helper; no CASCADE.
