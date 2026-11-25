-- 004 T015. Additive local booking engine. No data rewrite, cancellation API or Edge handler.
begin;
create table public.reservations (
 id uuid primary key default gen_random_uuid(),
 barbershop_id uuid not null references public.barbershops(id) on delete restrict,
 client_user_id uuid not null references public.profiles(id) on delete restrict,
 barber_id uuid not null, barber_user_id uuid not null,
 request_id uuid not null, fingerprint text not null check(length(fingerprint)=64),
 state text not null default 'confirmed' check(state in('confirmed','cancelled')),
 starts_at timestamptz not null, ends_at timestamptz not null, occupied_until timestamptz not null,
 occupied tstzrange generated always as(tstzrange(starts_at,occupied_until,'[)')) stored,
 duration_min integer not null check(duration_min>0), buffer_min integer not null check(buffer_min>=0),
 total_amount numeric(12,2) not null check(total_amount>=0 and total_amount<>'NaN'::numeric),
 shop_name_snapshot text not null, barber_name_snapshot text not null, client_display_name_snapshot text not null,
 policy_snapshot jsonb not null check(jsonb_typeof(policy_snapshot)='object'),
 created_at timestamptz not null default statement_timestamp(), cancelled_at timestamptz,
 unique(id,barbershop_id), unique(client_user_id,barbershop_id,request_id),
 foreign key(barber_id,barbershop_id,barber_user_id) references public.barber_profiles(id,barbershop_id,user_id) on delete restrict,
 check(isfinite(starts_at) and isfinite(ends_at) and isfinite(occupied_until) and ends_at=starts_at+make_interval(mins=>duration_min) and occupied_until=ends_at+make_interval(mins=>buffer_min)),
 check((state='confirmed' and cancelled_at is null) or(state='cancelled' and cancelled_at is not null)),
 exclude using gist(barber_user_id extensions.gist_uuid_ops with =, occupied with &&) where(state='confirmed')
);
create index reservations_client_start on public.reservations(client_user_id,starts_at);
create index reservations_shop_start on public.reservations(barbershop_id,starts_at);
create index reservations_barber_start on public.reservations(barber_id,starts_at);
create table public.reservation_items (
 reservation_id uuid not null, barbershop_id uuid not null, service_id uuid not null,
 name_snapshot text not null, description_snapshot text not null,
 price_snapshot numeric(12,2) not null check(price_snapshot>=0 and price_snapshot<>'NaN'::numeric),
 duration_min integer not null check(duration_min>0),
 primary key(reservation_id,service_id),
 foreign key(reservation_id,barbershop_id) references public.reservations(id,barbershop_id) on delete restrict,
 foreign key(service_id,barbershop_id) references public.services(id,barbershop_id) on delete restrict
);
create index reservation_items_service on public.reservation_items(service_id,barbershop_id);
create table public.reservation_events (
 id uuid primary key default gen_random_uuid(), reservation_id uuid not null,barbershop_id uuid not null,
 actor_user_id uuid not null references public.profiles(id) on delete restrict,
 capacity text not null check(capacity in('client','barber','administrator')),
 kind text not null check(kind in('confirmed','cancelled')),
 occurred_at timestamptz not null default statement_timestamp(),reason text,
 unique(reservation_id,kind),
 foreign key(reservation_id,barbershop_id) references public.reservations(id,barbershop_id) on delete restrict,
 check(kind<>'cancelled' or capacity='client' or coalesce(length(btrim(reason))>0,false))
);
create index reservation_events_actor on public.reservation_events(actor_user_id);
create index reservation_events_shop_time on public.reservation_events(barbershop_id,occurred_at);

-- RLS helper binds the actual JWT identity; no caller supplied actor or recursion through reservations.
create function private.reservation_visible(client uuid,shop uuid,professional uuid) returns boolean
language sql stable security definer set search_path='' as $fn$
 select auth.uid() is not null and exists(select 1 from auth.users u where u.id=auth.uid() and not u.is_anonymous and u.email_confirmed_at is not null and(u.banned_until is null or u.banned_until<=now())) and
 (client=auth.uid() or exists(select 1 from public.barbershop_memberships m where m.user_id=auth.uid() and m.barbershop_id=shop and m.status='active' and(m.role='administrator' or exists(select 1 from public.barber_profiles p where p.id=professional and p.user_id=m.user_id and p.barbershop_id=shop and p.active))));
$fn$;
alter table public.reservations enable row level security;
alter table public.reservation_items enable row level security;
alter table public.reservation_events enable row level security;
revoke all on public.reservations,public.reservation_items,public.reservation_events from public,anon,authenticated,service_role;
-- Internal physical identity and fingerprint are deliberately not client projections.
grant select(id,barbershop_id,client_user_id,barber_id,request_id,state,starts_at,ends_at,duration_min,total_amount,shop_name_snapshot,barber_name_snapshot,client_display_name_snapshot,policy_snapshot,created_at,cancelled_at) on public.reservations to authenticated;
grant select on public.reservation_items to authenticated;
grant select(id,reservation_id,barbershop_id,capacity,kind,occurred_at,reason) on public.reservation_events to authenticated;
create policy reservation_read on public.reservations for select to authenticated using(private.reservation_visible(client_user_id,barbershop_id,barber_id));
create policy reservation_items_read on public.reservation_items for select to authenticated using(exists(select 1 from public.reservations r where r.id=reservation_id and r.barbershop_id=reservation_items.barbershop_id));
create policy reservation_events_read on public.reservation_events for select to authenticated using(exists(select 1 from public.reservations r where r.id=reservation_id and r.barbershop_id=reservation_events.barbershop_id));

create function private.reservation_json(r public.reservations) returns jsonb language sql stable set search_path='' as $fn$
 select jsonb_build_object('id',r.id,'barbershopId',r.barbershop_id,'barberId',r.barber_id,'state',r.state,'startsAt',to_char(r.starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'endsAt',to_char(r.ends_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
 'shopNameSnapshot',r.shop_name_snapshot,'barberNameSnapshot',r.barber_name_snapshot,'clientDisplayNameSnapshot',r.client_display_name_snapshot,'total',jsonb_build_object('amountMinor',(r.total_amount*100)::bigint,'currency','PEN'),'durationMin',r.duration_min,'policySnapshot',r.policy_snapshot,
 'items',(select jsonb_agg(jsonb_build_object('serviceId',i.service_id,'nameSnapshot',i.name_snapshot,'descriptionSnapshot',i.description_snapshot,'priceSnapshot',jsonb_build_object('amountMinor',(i.price_snapshot*100)::bigint,'currency','PEN'),'durationMin',i.duration_min) order by i.service_id) from public.reservation_items i where i.reservation_id=r.id));
$fn$;

-- One availability predicate for estimates and confirmation. Reads other tenants only as a boolean.
create function private.reservation_available(shop uuid,professional uuid,services uuid[],at_time timestamptz,minutes integer,buffer integer) returns boolean
language sql stable security definer set search_path='' as $fn$
 select exists(select 1 from public.barber_profiles p join public.barbershop_memberships m on(m.user_id=p.user_id and m.barbershop_id=p.barbershop_id)
 where p.id=professional and p.barbershop_id=shop and p.active and m.status='active' and m.role in('barber','administrator')
 and not exists(select 1 from unnest(services) s where not exists(select 1 from public.barber_services c where c.barbershop_id=shop and c.barber_id=p.id and c.service_id=s and c.active))
 and coalesce((select range_agg(int4range(h.opens_min,h.closes_min,'[)')) from public.barbershop_hours h where h.barbershop_id=shop and h.weekday=extract(dow from at_time at time zone 'America/Lima')) @> int4range((extract(hour from at_time at time zone 'America/Lima')*60+extract(minute from at_time at time zone 'America/Lima'))::int,(extract(hour from at_time at time zone 'America/Lima')*60+extract(minute from at_time at time zone 'America/Lima'))::int+minutes+buffer,'[)'),false)
 and coalesce((select range_agg(int4range(h.opens_min,h.closes_min,'[)')) from public.barber_schedules h where h.barber_id=p.id and h.barbershop_id=shop and h.weekday=extract(dow from at_time at time zone 'America/Lima')) @> int4range((extract(hour from at_time at time zone 'America/Lima')*60+extract(minute from at_time at time zone 'America/Lima'))::int,(extract(hour from at_time at time zone 'America/Lima')*60+extract(minute from at_time at time zone 'America/Lima'))::int+minutes+buffer,'[)'),false)
 and not exists(select 1 from public.schedule_exceptions e where e.barbershop_id=shop and(e.barber_id is null or e.barber_id=p.id) and tstzrange(e.starts_at,e.ends_at,'[)') && tstzrange(at_time,at_time+make_interval(mins=>minutes+buffer),'[)'))
 and not exists(select 1 from public.reservations r where r.barber_user_id=p.user_id and r.state='confirmed' and r.occupied && tstzrange(at_time,at_time+make_interval(mins=>minutes+buffer),'[)')));
$fn$;

create function private.reservation_confirm(actor uuid,d jsonb) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare shop uuid; requested uuid; request uuid; ids uuid[]; start_time timestamptz; stamp timestamptz; local_time timestamp; cfg public.barbershop_booking_settings; chosen public.barber_profiles; old public.reservations; result public.reservations; price numeric; minutes integer; cnt integer; fingerprint_value text; key bigint; profile_name text; shop_name text; policies jsonb;
begin
 perform private.booking_actor(actor);
 perform private.booking_keys(d,array['requestId','barbershopId','serviceIds','barberId','startsAt']);
 if jsonb_typeof(d->'serviceIds')<>'array' or jsonb_array_length(d->'serviceIds') not between 1 and 100 or jsonb_typeof(d->'startsAt')<>'string' or (d->>'startsAt') !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 shop:=(d->>'barbershopId')::uuid;request:=(d->>'requestId')::uuid;requested:=(d->>'barberId')::uuid;start_time:=(d->>'startsAt')::timestamptz;
 if shop is null or request is null or start_time is null or not isfinite(start_time) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 select array_agg(s order by s),count(distinct s) into ids,cnt from(select value::uuid s from jsonb_array_elements_text(d->'serviceIds')) v;
 if cnt<>cardinality(ids) or array_position(ids,null) is not null then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 fingerprint_value:=encode(sha256(convert_to(jsonb_build_object('services',ids,'barber',requested,'starts',extract(epoch from start_time))::text,'UTF8')),'hex');
 select * into old from public.reservations where client_user_id=actor and barbershop_id=shop and request_id=request;
 if found then
  if old.fingerprint<>fingerprint_value then raise exception using errcode='23505',message='CONFLICT';end if;
  return jsonb_build_object('detail',private.reservation_json(old),'replayed',true);
 end if;
 -- Lock protocol: shop configuration, sorted global physical-person advisory keys, membership/profile.
 select * into cfg from public.barbershop_booking_settings where barbershop_id=shop for share;
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 for key in select distinct hashtextextended('booking-person:'||x::text,0) k from(select actor x union select p.user_id from public.barber_profiles p where p.barbershop_id=shop and(requested is null or p.id=requested)) people order by k loop perform pg_advisory_xact_lock(key);end loop;
 select * into old from public.reservations where client_user_id=actor and barbershop_id=shop and request_id=request;
 if found then
  if old.fingerprint<>fingerprint_value then raise exception using errcode='23505',message='CONFLICT';end if;
  return jsonb_build_object('detail',private.reservation_json(old),'replayed',true);
 end if;
 stamp:=clock_timestamp();local_time:=start_time at time zone 'America/Lima';
 if cfg.publication_state<>'published' then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 if start_time<stamp+make_interval(mins=>cfg.minimum_notice_min) or local_time::date>(stamp at time zone 'America/Lima')::date+cfg.booking_horizon_days or extract(second from local_time)<>0 or (extract(hour from local_time)*60+extract(minute from local_time))::int%cfg.slot_step_min<>0 then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 if (select count(*) from public.reservations where client_user_id=actor and barbershop_id=shop and state='confirmed' and starts_at>=stamp)>=cfg.max_future_per_client then raise exception using errcode='23505',message='CONFLICT';end if;
 select sum(price_amount),sum(duration_min),count(*) into price,minutes,cnt from public.services where id=any(ids) and barbershop_id=shop and active;
 if cnt<>cardinality(ids) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 select p.* into chosen from public.barber_profiles p where p.barbershop_id=shop and(requested is null or p.id=requested) and private.reservation_available(shop,p.id,ids,start_time,minutes,cfg.buffer_min) order by p.id limit 1 for share;
 if not found then raise exception using errcode='23505',message='Profesional no disponible en ese horario';end if;
 perform 1 from public.barbershop_memberships where user_id=chosen.user_id and barbershop_id=shop and status='active' and role in('barber','administrator') for share;
 if not found or not private.reservation_available(shop,chosen.id,ids,start_time,minutes,cfg.buffer_min) then raise exception using errcode='23505',message='Profesional no disponible en ese horario';end if;
 select display_name into profile_name from public.profiles where id=actor for share;
 select name into shop_name from public.barbershops where id=shop for share;
 policies:=jsonb_build_object('minimumNoticeMin',cfg.minimum_notice_min,'bookingHorizonDays',cfg.booking_horizon_days,'maxFuturePerClient',cfg.max_future_per_client,'slotStepMin',cfg.slot_step_min,'bufferMin',cfg.buffer_min,'cancellationAdvanceMin',cfg.cancellation_advance_min);
 insert into public.reservations(barbershop_id,client_user_id,barber_id,barber_user_id,request_id,fingerprint,starts_at,ends_at,occupied_until,duration_min,buffer_min,total_amount,shop_name_snapshot,barber_name_snapshot,client_display_name_snapshot,policy_snapshot)
 values(shop,actor,chosen.id,chosen.user_id,request,fingerprint_value,start_time,start_time+make_interval(mins=>minutes),start_time+make_interval(mins=>minutes+cfg.buffer_min),minutes,cfg.buffer_min,price,shop_name,chosen.professional_name,profile_name,policies) returning * into result;
 insert into public.reservation_items(reservation_id,barbershop_id,service_id,name_snapshot,description_snapshot,price_snapshot,duration_min) select result.id,shop,s.id,s.name,s.description,s.price_amount,s.duration_min from public.services s where s.id=any(ids) and s.barbershop_id=shop;
 insert into public.reservation_events(reservation_id,barbershop_id,actor_user_id,capacity,kind) values(result.id,shop,actor,'client','confirmed');
 return jsonb_build_object('detail',private.reservation_json(result),'replayed',false);
exception
 when exclusion_violation then raise exception using errcode='23505',message='Profesional no disponible en ese horario';
 when invalid_text_representation or datetime_field_overflow or numeric_value_out_of_range then raise exception using errcode='22023',message='INVALID_INPUT';
end;$fn$;
create function public.confirm_booking(p_actor_id uuid,p_data jsonb) returns jsonb language sql security invoker set search_path='' as $fn$select private.reservation_confirm(p_actor_id,p_data);$fn$;

create function private.reservation_slots(shop uuid,day date,ids uuid[],professional uuid) returns jsonb language plpgsql stable security definer set search_path='' as $fn$
declare cfg public.barbershop_booking_settings;price numeric;minutes integer;cnt integer;result jsonb;
begin
 perform private.booking_actor(auth.uid());
 if day is null or ids is null or cardinality(ids) not between 1 and 100 or cardinality(ids)<>(select count(distinct s) from unnest(ids) s) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 select * into cfg from public.barbershop_booking_settings where barbershop_id=shop;
 if not found or cfg.publication_state not in('published','paused') then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 if cfg.publication_state='paused' or day<(now() at time zone 'America/Lima')::date or day>(now() at time zone 'America/Lima')::date+cfg.booking_horizon_days then return '[]'::jsonb;end if;
 select sum(price_amount),sum(duration_min),count(*) into price,minutes,cnt from public.services where id=any(ids) and barbershop_id=shop and active;
 if cnt<>cardinality(ids) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 select coalesce(jsonb_agg(jsonb_build_object('startsAt',to_char(at_time at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'endsAt',to_char((at_time+make_interval(mins=>minutes)) at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'estimatedTotal',jsonb_build_object('amountMinor',(price*100)::bigint,'currency','PEN')) order by at_time),'[]'::jsonb) into result from
 (select (day+make_interval(mins=>m)) at time zone 'America/Lima' at_time from generate_series(0,1439,cfg.slot_step_min) m) slots
 where at_time>=statement_timestamp()+make_interval(mins=>cfg.minimum_notice_min) and exists(select 1 from public.barber_profiles p where p.barbershop_id=shop and(professional is null or p.id=professional) and private.reservation_available(shop,p.id,ids,at_time,minutes,cfg.buffer_min));
 return result;
end;$fn$;
create function public.list_booking_slots(p_barbershop_id uuid,p_local_date date,p_service_ids uuid[],p_barber_id uuid default null) returns jsonb language sql stable security invoker set search_path='' as $fn$select private.reservation_slots(p_barbershop_id,p_local_date,p_service_ids,p_barber_id);$fn$;

-- Explicit ACLs in this same transaction. Service key alone is not a user identity.
revoke all on function private.reservation_visible(uuid,uuid,uuid),private.reservation_json(public.reservations),private.reservation_available(uuid,uuid,uuid[],timestamptz,integer,integer),private.reservation_confirm(uuid,jsonb),private.reservation_slots(uuid,date,uuid[],uuid),public.confirm_booking(uuid,jsonb),public.list_booking_slots(uuid,date,uuid[],uuid) from public,anon,authenticated,service_role;
grant execute on function private.reservation_visible(uuid,uuid,uuid),private.reservation_slots(uuid,date,uuid[],uuid),public.list_booking_slots(uuid,date,uuid[],uuid) to authenticated;
grant execute on function private.reservation_confirm(uuid,jsonb),public.confirm_booking(uuid,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
