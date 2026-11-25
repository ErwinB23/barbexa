-- 010: LOCAL migration authorized 2026-11-15; no historical backfill.
-- Two private tables, five closed helpers, five service-only wrappers. No backfill.
begin;
create table private.reschedule_settings (
 barbershop_id uuid primary key references public.barbershops(id) on delete restrict,
 reschedule_advance_min integer not null default 120 check(reschedule_advance_min>=0)
);
create table private.reschedule_events (
 id uuid primary key default gen_random_uuid(),
 reservation_id uuid not null,barbershop_id uuid not null,
 old_starts_at timestamptz not null,new_starts_at timestamptz not null,
 actor_user_id uuid not null references public.profiles(id) on delete restrict,
 capacity text not null check(capacity in('client','barber','administrator')),
 reason text check(reason is null or length(btrim(reason)) between 1 and 2000),
 occurred_at timestamptz not null default clock_timestamp(),
 request_id uuid not null,fingerprint jsonb not null,result_json jsonb not null,
 unique(actor_user_id,request_id),
 foreign key(reservation_id,barbershop_id) references public.reservations(id,barbershop_id) on delete restrict,
 check(isfinite(old_starts_at) and isfinite(new_starts_at) and old_starts_at<>new_starts_at)
);
create index reschedule_events_resource_time on private.reschedule_events(reservation_id,occurred_at,id);
alter table private.reschedule_settings enable row level security;
alter table private.reschedule_events enable row level security;
revoke all on private.reschedule_settings,private.reschedule_events from public,anon,authenticated,service_role;

create function private.reschedule_capacity(actor uuid,r public.reservations) returns text
language plpgsql security invoker set search_path='' as $fn$
declare role_name text;
begin
 select m.role into role_name from public.barbershop_memberships m
 where m.user_id=actor and m.barbershop_id=r.barbershop_id and m.status='active' for share;
 if role_name='administrator' then return 'administrator';end if;
 if role_name='barber' then
  perform 1 from public.barber_profiles p where p.id=r.barber_id and p.user_id=actor
    and p.barbershop_id=r.barbershop_id and p.active for share;
  if found then return 'barber';end if;
 end if;
 if actor=r.client_user_id then return 'client';end if;
 raise exception using errcode='P0002',message='NOT_AVAILABLE';
end;$fn$;

create function private.reschedule_lock(actor uuid,target uuid,writing boolean) returns public.reservations
language plpgsql security invoker set search_path='' as $fn$
declare r public.reservations;key bigint;
begin
 perform private.booking_actor(actor);
 select * into r from public.reservations where id=target;
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 -- Protocol shared with004/005: config -> sorted physical people -> reservation -> membership/profile.
 perform 1 from public.barbershop_booking_settings where barbershop_id=r.barbershop_id for share;
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 if writing then
  for key in select distinct hashtextextended('booking-person:'||x::text,0) k
    from(select r.client_user_id x union select r.barber_user_id) people order by k
    loop perform pg_advisory_xact_lock(key);end loop;
  select * into r from public.reservations where id=target for update;
 else select * into r from public.reservations where id=target for share;
 end if;
 perform private.reschedule_capacity(actor,r);
 return r;
end;$fn$;

create function private.reschedule_eligible(r public.reservations,capacity text,reason text,stamp timestamptz,writing boolean) returns void
language plpgsql security invoker set search_path='' as $fn$
declare c private.booking_care;advance integer:=120;
begin
 if r.state<>'confirmed' then raise exception using errcode='23505',message='CONFLICT';end if;
 select * into c from private.booking_care where reservation_id=r.id for share;
 if found and (c.attendance<>'confirmed' or c.payment_status not in('pending','paid')) then
  raise exception using errcode='23505',message='CONFLICT';end if;
 -- No care row on legacy appointments means no invented financial or attendance history.
 select coalesce((select s.reschedule_advance_min from private.reschedule_settings s
   where s.barbershop_id=r.barbershop_id),120) into advance;
 if stamp>r.starts_at-make_interval(mins=>advance) then
  if capacity='client' then raise exception using errcode='42501',message='FORBIDDEN';end if;
  if writing and reason is null then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 end if;
end;$fn$;

create function private.reschedule_available(original public.reservations,at_time timestamptz) returns boolean
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
 and not exists(select 1 from public.schedule_exceptions e where e.barbershop_id=original.barbershop_id
  and(e.barber_id is null or e.barber_id=original.barber_id)
  and tstzrange(e.starts_at,e.ends_at,'[)') && tstzrange(at_time,at_time+make_interval(mins=>original.duration_min+original.buffer_min),'[)'))
 and not exists(select 1 from public.reservations r where r.id<>original.id
  and r.barber_user_id=original.barber_user_id and r.state='confirmed'
  and r.occupied && tstzrange(at_time,at_time+make_interval(mins=>original.duration_min+original.buffer_min),'[)')));
$fn$;

create function private.reschedule_command(actor uuid,action text,d jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $fn$
declare r public.reservations;cfg public.barbershop_booking_settings;old_event private.reschedule_events;
 target uuid;shop uuid;request uuid;reason text;capacity text;stamp timestamptz;at_time timestamptz;
 expected timestamptz;local_time timestamp;day date;response jsonb;before_start timestamptz;advance integer;
begin
 perform private.booking_actor(actor);
 if action in('get-policy','set-policy') then
  if action='get-policy' then perform private.booking_keys(d,array['barbershopId']);
  else perform private.booking_keys(d,array['barbershopId','advanceMin']);end if;
  if jsonb_typeof(d->'barbershopId') is distinct from 'string' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  shop:=(d->>'barbershopId')::uuid;
  if action='set-policy' then perform 1 from public.barbershop_booking_settings where barbershop_id=shop for update;
  else perform 1 from public.barbershop_booking_settings where barbershop_id=shop for share;end if;
  if not found then raise exception using errcode='42501',message='FORBIDDEN';end if;
  perform 1 from public.barbershop_memberships where user_id=actor and barbershop_id=shop and role='administrator' and status='active' for share;
  if not found then raise exception using errcode='42501',message='FORBIDDEN';end if;
  if action='set-policy' then
   if jsonb_typeof(d->'advanceMin') is distinct from 'number' or (d->>'advanceMin') !~ '^[0-9]+$' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
   advance:=(d->>'advanceMin')::integer;
   if coalesce((select reschedule_advance_min from private.reschedule_settings where barbershop_id=shop),120) is distinct from advance then
    insert into private.reschedule_settings(barbershop_id,reschedule_advance_min) values(shop,advance)
     on conflict(barbershop_id) do update set reschedule_advance_min=excluded.reschedule_advance_min;
    update public.barbershop_booking_settings set version=version+1 where barbershop_id=shop;
   end if;
  end if;
  return jsonb_build_object('barbershopId',shop,'advanceMin',coalesce((select reschedule_advance_min from private.reschedule_settings where barbershop_id=shop),120));
 end if;
 if action='reschedule' then perform private.booking_keys(d,array['requestId','reservationId','expectedStartsAt','startsAt'],array['reason']);
 elsif action='slots' then perform private.booking_keys(d,array['reservationId','localDate']);
 elsif action='history' then perform private.booking_keys(d,array['reservationId']);
 else raise exception using errcode='22023',message='INVALID_INPUT';end if;
 if jsonb_typeof(d->'reservationId') is distinct from 'string' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 target:=(d->>'reservationId')::uuid;
 r:=private.reschedule_lock(actor,target,action='reschedule');
 capacity:=private.reschedule_capacity(actor,r);
 if action='history' then
  return coalesce((select jsonb_agg(jsonb_build_object('oldStartsAt',to_char(e.old_starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
   'newStartsAt',to_char(e.new_starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'capacity',e.capacity,'reason',e.reason,
   'occurredAt',to_char(e.occurred_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')) order by e.occurred_at,e.id)
   from(select * from private.reschedule_events where reservation_id=r.id order by occurred_at desc,id desc limit 200)e),'[]'::jsonb);
 end if;
 if action='reschedule' then
  if jsonb_typeof(d->'requestId') is distinct from 'string' or jsonb_typeof(d->'startsAt') is distinct from 'string'
   or jsonb_typeof(d->'expectedStartsAt') is distinct from 'string'
   or (d->>'startsAt') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$'
   or (d->>'expectedStartsAt') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$'
   or(d?'reason' and(jsonb_typeof(d->'reason') is distinct from 'string' or length(d->>'reason')>2000))
   then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  request:=(d->>'requestId')::uuid;at_time:=(d->>'startsAt')::timestamptz;expected:=(d->>'expectedStartsAt')::timestamptz;
  reason:=nullif(btrim(d->>'reason'),'');
  if not isfinite(at_time) or not isfinite(expected) or expected=at_time then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  select * into old_event from private.reschedule_events where actor_user_id=actor and request_id=request;
  if found then
   if old_event.fingerprint<>d then raise exception using errcode='23505',message='CONFLICT';end if;
   return jsonb_build_object('detail',old_event.result_json,'replayed',true);
  end if;
  if r.starts_at<>expected then raise exception using errcode='23505',message='CONFLICT';end if;
 end if;
 stamp:=clock_timestamp();perform private.reschedule_eligible(r,capacity,reason,stamp,action='reschedule');
 select * into cfg from public.barbershop_booking_settings where barbershop_id=r.barbershop_id;
 if cfg.publication_state<>'published' then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 if action='slots' then
  if jsonb_typeof(d->'localDate') is distinct from 'string' or (d->>'localDate') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  day:=(d->>'localDate')::date;
  if day<(stamp at time zone 'America/Lima')::date or day>(stamp at time zone 'America/Lima')::date+cfg.booking_horizon_days then return '[]'::jsonb;end if;
  return coalesce((select jsonb_agg(jsonb_build_object('startsAt',to_char(t.at_time at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
   'endsAt',to_char((t.at_time+make_interval(mins=>r.duration_min)) at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
   'estimatedTotal',jsonb_build_object('amountMinor',(r.total_amount*100)::bigint,'currency','PEN')) order by t.at_time)
   from(select(day+make_interval(mins=>m)) at time zone 'America/Lima' at_time from generate_series(0,1439,cfg.slot_step_min) m)t
   where t.at_time<>r.starts_at and t.at_time>=stamp+make_interval(mins=>cfg.minimum_notice_min)
   and private.reschedule_available(r,t.at_time)),'[]'::jsonb);
 end if;
 local_time:=at_time at time zone 'America/Lima';
 if at_time<stamp+make_interval(mins=>cfg.minimum_notice_min) or local_time::date>(stamp at time zone 'America/Lima')::date+cfg.booking_horizon_days
   or extract(second from local_time)<>0 or(extract(hour from local_time)*60+extract(minute from local_time))::int%cfg.slot_step_min<>0
   then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 if not private.reschedule_available(r,at_time) then raise exception using errcode='23505',message='Profesional no disponible en ese horario';end if;
 -- Lock assigned active membership/profile until commit, just like confirmation004.
 perform 1 from public.barbershop_memberships where barbershop_id=r.barbershop_id and user_id=r.barber_user_id and status='active' and role in('barber','administrator') for share;
 if not found then raise exception using errcode='23505',message='Profesional no disponible en ese horario';end if;
 perform 1 from public.barber_profiles where id=r.barber_id and barbershop_id=r.barbershop_id and active for share;
 if not found then raise exception using errcode='23505',message='Profesional no disponible en ese horario';end if;
 before_start:=r.starts_at;
 update public.reservations set starts_at=at_time,ends_at=at_time+make_interval(mins=>r.duration_min),
   occupied_until=at_time+make_interval(mins=>r.duration_min+r.buffer_min) where id=r.id returning * into r;
 response:=private.reservation_json(r);
 insert into private.reschedule_events(reservation_id,barbershop_id,old_starts_at,new_starts_at,actor_user_id,capacity,reason,occurred_at,request_id,fingerprint,result_json)
  values(r.id,r.barbershop_id,before_start,at_time,actor,capacity,reason,stamp,request,d,response);
 return jsonb_build_object('detail',response,'replayed',false);
exception
 when exclusion_violation then raise exception using errcode='23505',message='Profesional no disponible en ese horario';
 when unique_violation then raise exception using errcode='23505',message='CONFLICT';
 when invalid_text_representation or datetime_field_overflow or numeric_value_out_of_range then raise exception using errcode='22023',message='INVALID_INPUT';
end;$fn$;

create function public.reschedule_booking(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path='' as $fn$select private.reschedule_command(p_actor_id,'reschedule',p_data);$fn$;
create function public.list_reschedule_slots(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path='' as $fn$select private.reschedule_command(p_actor_id,'slots',p_data);$fn$;
create function public.get_reschedule_policy(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path='' as $fn$select private.reschedule_command(p_actor_id,'get-policy',p_data);$fn$;
create function public.set_reschedule_policy(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path='' as $fn$select private.reschedule_command(p_actor_id,'set-policy',p_data);$fn$;
create function public.get_reschedule_history(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path='' as $fn$select private.reschedule_command(p_actor_id,'history',p_data);$fn$;
revoke all on function private.reschedule_capacity(uuid,public.reservations),private.reschedule_lock(uuid,uuid,boolean),private.reschedule_eligible(public.reservations,text,text,timestamptz,boolean),private.reschedule_available(public.reservations,timestamptz),private.reschedule_command(uuid,text,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.reschedule_booking(uuid,jsonb),public.list_reschedule_slots(uuid,jsonb),public.get_reschedule_policy(uuid,jsonb),public.set_reschedule_policy(uuid,jsonb),public.get_reschedule_history(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.reschedule_booking(uuid,jsonb),public.list_reschedule_slots(uuid,jsonb),public.get_reschedule_policy(uuid,jsonb),public.set_reschedule_policy(uuid,jsonb),public.get_reschedule_history(uuid,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
