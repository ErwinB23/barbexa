-- Prepared only: apply to an isolated synthetic database first. Never auto-apply to LOCAL/Cloud.
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';

-- A single reference is the logical withdrawal state; the existing append-only event
-- stores actor/time/reason and before/after. No parallel closure or audit tables.
alter table public.schedule_exceptions add column withdrawal_event_id uuid unique
 references private.team_authority_events(id) on delete restrict;
alter table public.schedule_exceptions add constraint shop_closure_withdrawal_only
 check(withdrawal_event_id is null or barber_id is null);
create index schedule_exceptions_active_shop_time on public.schedule_exceptions(barbershop_id,starts_at)
 where withdrawal_event_id is null;
create unique index shop_closure_single_withdrawal_event
 on private.team_authority_events(barbershop_id,(fingerprint->>'closureId'))
 where action='shop-closure-withdrawn';

create function private.shop_closure_json(e public.schedule_exceptions) returns jsonb
language sql stable security definer set search_path='' as $fn$
 select jsonb_build_object('id',e.id,'barbershopId',e.barbershop_id,
 'startsAt',to_char(e.starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
 'endsAt',to_char(e.ends_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
 'reason',e.reason,'status',case when e.withdrawal_event_id is null then 'active' else 'withdrawn' end,
 'withdrawal',(select jsonb_build_object('eventId',a.id,'actorUserId',a.actor_user_id,
 'occurredAt',to_char(a.occurred_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'reason',a.reason)
 from private.team_authority_events a where a.id=e.withdrawal_event_id));
$fn$;

create function private.shop_closure_history_guard() returns trigger
language plpgsql security definer set search_path='' as $fn$
begin
 if TG_OP='DELETE' then
  if old.barber_id is null then raise exception using errcode='42501',message='FORBIDDEN';end if;
  return old;
 end if;
 if old.withdrawal_event_id is not null then raise exception using errcode='42501',message='FORBIDDEN';end if;
 if new.withdrawal_event_id is not null then
  if new.barber_id is not null or (to_jsonb(new)-'withdrawal_event_id')<>(to_jsonb(old)-'withdrawal_event_id')
   or not exists(select 1 from private.team_authority_events a where a.id=new.withdrawal_event_id
    and a.barbershop_id=new.barbershop_id and a.action='shop-closure-withdrawn'
    and a.fingerprint->>'closureId'=new.id::text and a.before_state=to_jsonb(old) and a.after_state=to_jsonb(new))
  then raise exception using errcode='42501',message='FORBIDDEN';end if;
 end if;
 return new;
end;$fn$;
create trigger shop_closure_history before update or delete on public.schedule_exceptions
 for each row execute function private.shop_closure_history_guard();

create function private.list_shop_closures(actor uuid,d jsonb) returns jsonb
language plpgsql security definer set search_path='' as $fn$
declare shop uuid;after_id uuid;items jsonb;cursor_id text;
begin
 perform private.booking_actor(actor);
 perform private.booking_keys(d,array['barbershopId','cursor']);
 if jsonb_typeof(d->'barbershopId') is distinct from 'string'
  or jsonb_typeof(d->'cursor') not in('string','null') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 shop:=(d->>'barbershopId')::uuid;after_id:=(d->>'cursor')::uuid;
 if shop is null then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 perform private.authority_assert(actor,shop,'hours',false);
 select coalesce(jsonb_agg(private.shop_closure_json(e) order by e.id),'[]') into items
 from(select * from public.schedule_exceptions where barbershop_id=shop and barber_id is null
  and(after_id is null or id>after_id) order by id limit 101)e;
 if jsonb_array_length(items)>100 then items:=items-100;cursor_id:=items->99->>'id';end if;
 return jsonb_build_object('barbershopId',shop,'closures',items,'nextCursor',cursor_id);
exception when invalid_text_representation then raise exception using errcode='22023',message='INVALID_INPUT';
end;$fn$;

create function private.withdraw_shop_closure(actor uuid,d jsonb) returns jsonb
language plpgsql security definer set search_path='' as $fn$
declare shop uuid;target uuid;request uuid;e public.schedule_exceptions;event_id uuid;why text;fingerprint_value jsonb;
begin
 perform private.booking_actor(actor);
 perform private.booking_keys(d,array['barbershopId','closureId','requestId','reason']);
 if exists(select 1 from jsonb_each(d) x where jsonb_typeof(x.value)<>'string') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 shop:=(d->>'barbershopId')::uuid;target:=(d->>'closureId')::uuid;request:=(d->>'requestId')::uuid;
 -- Same whitespace set as ECMAScript trim; direct SQL cannot accept blank tab/NBSP motives.
 why:=btrim(d->>'reason',U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF');
 if shop is null or target is null or request is null or why is null or why='' or length(d->>'reason')>2000 then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 perform private.authority_assert(actor,shop,'hours',false);
 select * into e from public.schedule_exceptions where id=target and barbershop_id=shop and barber_id is null;
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 -- Historical replay remains authorized NOW and performs no provisioning/locks/writes.
 if e.withdrawal_event_id is not null then return jsonb_build_object('closure',private.shop_closure_json(e),'replayed',true);end if;
 -- Consistent ordering with publication/booking/authority writers, then current membership and row.
 perform private.authority_lock(shop);
 perform private.authority_assert(actor,shop,'hours');
 select * into e from public.schedule_exceptions where id=target and barbershop_id=shop and barber_id is null for update;
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 if e.withdrawal_event_id is not null then return jsonb_build_object('closure',private.shop_closure_json(e),'replayed',true);end if;
 if exists(select 1 from private.team_authority_events where actor_user_id=actor and request_id=request)
 then raise exception using errcode='23505',message='CONFLICT';end if;
 event_id:=gen_random_uuid();
 fingerprint_value:=jsonb_build_object('barbershopId',shop,'closureId',target,'reason',why);
 insert into private.team_authority_events(id,barbershop_id,actor_user_id,target_user_id,request_id,action,fingerprint,before_state,after_state,result,reason)
 values(event_id,shop,actor,null,request,'shop-closure-withdrawn',fingerprint_value,to_jsonb(e),
  to_jsonb(e)||jsonb_build_object('withdrawal_event_id',event_id),jsonb_build_object('closureId',target,'status','withdrawn','withdrawalEventId',event_id),why);
 update public.schedule_exceptions set withdrawal_event_id=event_id where id=target returning * into e;
 update public.barbershop_booking_settings set version=version+1 where barbershop_id=shop;
 return jsonb_build_object('closure',private.shop_closure_json(e),'replayed',false);
exception when invalid_text_representation or numeric_value_out_of_range then raise exception using errcode='22023',message='INVALID_INPUT';
end;$fn$;

create function public.list_admin_booking_closures(p_actor_id uuid,p_data jsonb) returns jsonb
language sql security invoker set search_path='' as $fn$select private.list_shop_closures(p_actor_id,p_data);$fn$;
create function public.withdraw_admin_booking_closure(p_actor_id uuid,p_data jsonb) returns jsonb
language sql security invoker set search_path='' as $fn$select private.withdraw_shop_closure(p_actor_id,p_data);$fn$;
revoke all on function private.shop_closure_json(public.schedule_exceptions),private.shop_closure_history_guard(),
 private.list_shop_closures(uuid,jsonb),private.withdraw_shop_closure(uuid,jsonb),
 public.list_admin_booking_closures(uuid,jsonb),public.withdraw_admin_booking_closure(uuid,jsonb)
 from public,anon,authenticated,service_role;
grant execute on function private.list_shop_closures(uuid,jsonb),private.withdraw_shop_closure(uuid,jsonb),
 public.list_admin_booking_closures(uuid,jsonb),public.withdraw_admin_booking_closure(uuid,jsonb) to service_role;

-- Existing availability consumers are replaced below with ONLY the active-closure predicate.

create or replace function private.booking_preserve_reservations(shop uuid) returns void language plpgsql security definer set search_path='' as $fn$
declare invalid boolean;
begin
 if to_regclass('public.reservations') is null then return;end if;
 execute $q$select exists(select 1 from public.reservations r
 left join public.barber_profiles p on p.id=r.barber_id and p.barbershop_id=r.barbershop_id
 left join public.barbershop_memberships m on m.user_id=p.user_id and m.barbershop_id=p.barbershop_id
 where r.barbershop_id=$1 and r.state='confirmed' and r.starts_at>=now() and (
  not coalesce(p.active and m.status='active' and m.role in('barber','administrator'),false)
  or not coalesce((select range_agg(tstzrange(((r.starts_at at time zone 'America/Lima')::date+make_interval(mins=>h.opens_min)) at time zone 'America/Lima',((r.starts_at at time zone 'America/Lima')::date+make_interval(mins=>h.closes_min)) at time zone 'America/Lima','[)')) from public.barbershop_hours h where h.barbershop_id=r.barbershop_id and h.weekday=extract(dow from r.starts_at at time zone 'America/Lima')) @> tstzrange(r.starts_at,r.occupied_until,'[)'),false)
  or not coalesce((select range_agg(tstzrange(((r.starts_at at time zone 'America/Lima')::date+make_interval(mins=>h.opens_min)) at time zone 'America/Lima',((r.starts_at at time zone 'America/Lima')::date+make_interval(mins=>h.closes_min)) at time zone 'America/Lima','[)')) from public.barber_schedules h where h.barbershop_id=r.barbershop_id and h.barber_id=r.barber_id and h.weekday=extract(dow from r.starts_at at time zone 'America/Lima')) @> tstzrange(r.starts_at,r.occupied_until,'[)'),false)
  or exists(select 1 from public.schedule_exceptions e where e.withdrawal_event_id is null and e.barbershop_id=r.barbershop_id and(e.barber_id is null or e.barber_id=r.barber_id) and tstzrange(e.starts_at,e.ends_at,'[)') && tstzrange(r.starts_at,r.occupied_until,'[)'))))$q$ into invalid using shop;
 if invalid then raise exception using errcode='23505',message='CONFLICT';end if;
 if to_regclass('public.reservation_items') is not null then
  execute $q$select exists(select 1 from public.reservations r join public.reservation_items i on i.reservation_id=r.id and i.barbershop_id=r.barbershop_id where r.barbershop_id=$1 and r.state='confirmed' and r.starts_at>=now() and not exists(select 1 from public.barber_services c where c.barber_id=r.barber_id and c.barbershop_id=r.barbershop_id and c.service_id=i.service_id and c.active))$q$ into invalid using shop;
  if invalid then raise exception using errcode='23505',message='CONFLICT';end if;
 end if;
end;$fn$;

create or replace function private.reservation_available(shop uuid,professional uuid,services uuid[],at_time timestamptz,minutes integer,buffer integer) returns boolean
language sql stable security definer set search_path='' as $fn$
 select exists(select 1 from public.barber_profiles p join public.barbershop_memberships m on(m.user_id=p.user_id and m.barbershop_id=p.barbershop_id)
 where p.id=professional and p.barbershop_id=shop and p.active and m.status='active' and m.role in('barber','administrator')
 and not exists(select 1 from unnest(services) s where not exists(select 1 from public.barber_services c where c.barbershop_id=shop and c.barber_id=p.id and c.service_id=s and c.active))
 and coalesce((select range_agg(int4range(h.opens_min,h.closes_min,'[)')) from public.barbershop_hours h where h.barbershop_id=shop and h.weekday=extract(dow from at_time at time zone 'America/Lima')) @> int4range((extract(hour from at_time at time zone 'America/Lima')*60+extract(minute from at_time at time zone 'America/Lima'))::int,(extract(hour from at_time at time zone 'America/Lima')*60+extract(minute from at_time at time zone 'America/Lima'))::int+minutes+buffer,'[)'),false)
 and coalesce((select range_agg(int4range(h.opens_min,h.closes_min,'[)')) from public.barber_schedules h where h.barber_id=p.id and h.barbershop_id=shop and h.weekday=extract(dow from at_time at time zone 'America/Lima')) @> int4range((extract(hour from at_time at time zone 'America/Lima')*60+extract(minute from at_time at time zone 'America/Lima'))::int,(extract(hour from at_time at time zone 'America/Lima')*60+extract(minute from at_time at time zone 'America/Lima'))::int+minutes+buffer,'[)'),false)
 and not exists(select 1 from public.schedule_exceptions e where e.withdrawal_event_id is null and e.barbershop_id=shop and(e.barber_id is null or e.barber_id=p.id) and tstzrange(e.starts_at,e.ends_at,'[)') && tstzrange(at_time,at_time+make_interval(mins=>minutes+buffer),'[)'))
 and not exists(select 1 from public.reservations r where r.barber_user_id=p.user_id and r.state='confirmed' and r.occupied && tstzrange(at_time,at_time+make_interval(mins=>minutes+buffer),'[)')));
$fn$;

create or replace function private.self_schedule_command(p_actor_id uuid, p_action text, p_data jsonb)
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
        or exists(select 1 from public.schedule_exceptions e where e.withdrawal_event_id is null and e.barbershop_id=shop
          and (e.barber_id is null or e.barber_id=person)
          and tstzrange(e.starts_at,e.ends_at,'[)') && tstzrange(r.starts_at,r.occupied_until,'[)'))
      )
    ) then raise exception using errcode='23505', message='CONFLICT'; end if;
    update public.barbershop_booking_settings set version=version+1 where barbershop_id=shop returning * into cfg;
  end if;
  return pg_catalog.jsonb_build_object('professional',profile_json,'version',cfg.version,
    'shopHours',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('weekday',h.weekday,'opensMin',h.opens_min,'closesMin',h.closes_min) order by h.weekday,h.opens_min) from public.barbershop_hours h where h.barbershop_id=shop),'[]'::jsonb),
    'hours',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('weekday',h.weekday,'opensMin',h.opens_min,'closesMin',h.closes_min) order by h.weekday,h.opens_min) from public.barber_schedules h where h.barbershop_id=shop and h.barber_id=person),'[]'::jsonb),
    'blocks',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('id',e.id,'startsAt',pg_catalog.to_char(e.starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'endsAt',pg_catalog.to_char(e.ends_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'reason',e.reason) order by e.starts_at,e.id) from public.schedule_exceptions e where e.withdrawal_event_id is null and e.barbershop_id=shop and e.barber_id=person),'[]'::jsonb));
end;
$fn$;

create or replace function private.reschedule_available(original public.reservations,at_time timestamptz) returns boolean
language sql stable security invoker set search_path='' as $fn$
 select exists(select 1 from public.barber_profiles p
 join public.barbershop_memberships m on m.user_id=p.user_id and m.barbershop_id=p.barbershop_id
 where p.id=original.barber_id and p.barbershop_id=original.barbershop_id and p.active
 and m.status='active' and m.role in('barber','administrator')
 and not exists(select 1 from public.reservation_items i where i.reservation_id=original.id
  and not exists(select 1 from public.barber_services s where s.barbershop_id=original.barbershop_id
    and s.barber_id=original.barber_id and s.service_id=i.service_id and s.active))
 and coalesce((select range_agg(tstzrange(
  ((at_time at time zone 'America/Lima')::date+make_interval(mins=>h.opens_min)) at time zone 'America/Lima',
  ((at_time at time zone 'America/Lima')::date+make_interval(mins=>h.closes_min)) at time zone 'America/Lima','[)'))
  from public.barbershop_hours h where h.barbershop_id=original.barbershop_id
    and h.weekday=extract(dow from at_time at time zone 'America/Lima'))
  @> tstzrange(at_time,at_time+make_interval(mins=>original.duration_min+original.buffer_min),'[)'),false)
 and coalesce((select range_agg(tstzrange(
  ((at_time at time zone 'America/Lima')::date+make_interval(mins=>h.opens_min)) at time zone 'America/Lima',
  ((at_time at time zone 'America/Lima')::date+make_interval(mins=>h.closes_min)) at time zone 'America/Lima','[)'))
  from public.barber_schedules h where h.barbershop_id=original.barbershop_id and h.barber_id=original.barber_id
    and h.weekday=extract(dow from at_time at time zone 'America/Lima'))
  @> tstzrange(at_time,at_time+make_interval(mins=>original.duration_min+original.buffer_min),'[)'),false)
 and not exists(select 1 from public.schedule_exceptions e where e.withdrawal_event_id is null and e.barbershop_id=original.barbershop_id
  and(e.barber_id is null or e.barber_id=original.barber_id)
  and tstzrange(e.starts_at,e.ends_at,'[)') && tstzrange(at_time,at_time+make_interval(mins=>original.duration_min+original.buffer_min),'[)'))
 and not exists(select 1 from public.reservations r where r.id<>original.id
  and r.barber_user_id=original.barber_user_id and r.state='confirmed'
  and r.occupied && tstzrange(at_time,at_time+make_interval(mins=>original.duration_min+original.buffer_min),'[)')));
$fn$;

notify pgrst,'reload schema';
commit;
