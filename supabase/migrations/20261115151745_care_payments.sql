-- REVIEW DRAFT ONLY. Never executed; transfer into a CLI-created migration only after approval.
-- Additive objects. No historical backfill. PostgreSQL 17; depends on all 004 migrations.
begin;

create table private.care_settings (
 barbershop_id uuid primary key references public.barbershops(id) on delete restrict,
 no_show_tolerance_min integer not null default 10 check(no_show_tolerance_min between 0 and 1440),
 yape_instructions text check(yape_instructions is null or length(btrim(yape_instructions)) between 1 and 2000)
);
create table private.booking_care (
 reservation_id uuid primary key,
 barbershop_id uuid not null,
 attendance text not null default 'confirmed' check(attendance in('confirmed','in-service','completed','no-show','cancelled')),
 no_show_tolerance_min integer not null check(no_show_tolerance_min between 0 and 1440),
 method text not null check(method in('cash','yape')),
 payment_status text not null default 'pending' check(payment_status in('pending','paid','refunded')),
 amount_minor bigint not null check(amount_minor>=0),
 yape_instructions_snapshot text,
 foreign key(reservation_id,barbershop_id) references public.reservations(id,barbershop_id) on delete restrict,
 check(method<>'yape' or coalesce(length(btrim(yape_instructions_snapshot))>0,false))
);
create index booking_care_shop_idx on private.booking_care(barbershop_id,reservation_id);
create table private.care_events (
 id uuid primary key default gen_random_uuid(),
 reservation_id uuid,
 barbershop_id uuid not null references public.barbershops(id) on delete restrict,
 actor_user_id uuid not null references public.profiles(id) on delete restrict,
 request_id uuid not null,
 fingerprint jsonb not null,
 kind text not null check(kind in('configured','created','start','complete','no-show','receive','refund')),
 capacity text not null check(capacity in('client','barber','administrator')),
 occurred_at timestamptz not null default clock_timestamp(),
 reason text,
 amount_minor bigint check(amount_minor>=0),
 method text check(method in('cash','yape')),
 unique(actor_user_id,request_id),
 foreign key(reservation_id,barbershop_id) references public.reservations(id,barbershop_id) on delete restrict,
 check(kind<>'refund' or coalesce(length(btrim(reason))>0,false))
);
create unique index care_events_once_per_transition on private.care_events(reservation_id,kind) where reservation_id is not null;
create index care_events_shop_time on private.care_events(barbershop_id,occurred_at);
create index care_events_actor on private.care_events(actor_user_id);
alter table private.care_settings enable row level security;
alter table private.booking_care enable row level security;
alter table private.care_events enable row level security;
-- No policy grants ordinary callers access; privileged functions below revalidate each actor/resource.
revoke all on private.care_settings,private.booking_care,private.care_events from public,anon,authenticated,service_role;

create function private.care_json(r public.reservations,actor uuid) returns jsonb
language sql stable security definer set search_path='' as $fn$
 select jsonb_build_object(
 'reservationId',r.id,
 'attendance',case when c.reservation_id is null then null when r.state='cancelled' then 'cancelled' else c.attendance end,
 'noShowToleranceMin',c.no_show_tolerance_min,
 'payment',case when c.reservation_id is null then null else jsonb_build_object('method',c.method,'status',c.payment_status,'amountMinor',c.amount_minor,'currency','PEN') end,
 'yapeInstructions',c.yape_instructions_snapshot,
 'events',coalesce((select jsonb_agg(jsonb_build_object('kind',e.kind,'occurredAt',to_char(e.occurred_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'actorUserId',e.actor_user_id,'capacity',e.capacity,'reason',e.reason) order by e.occurred_at,e.id) from private.care_events e where e.reservation_id=r.id),'[]'::jsonb),
 'permissions',jsonb_build_object(
 'attend',exists(select 1 from public.barber_profiles p join public.barbershop_memberships m on m.user_id=p.user_id and m.barbershop_id=p.barbershop_id where p.id=r.barber_id and p.user_id=actor and p.active and m.status='active' and m.role in('barber','administrator')),
 'receive',exists(select 1 from public.barbershop_memberships m where m.barbershop_id=r.barbershop_id and m.user_id=actor and m.status='active' and (m.role='administrator' or exists(select 1 from public.barber_profiles p where p.id=r.barber_id and p.user_id=actor and p.active))),
 'refund',exists(select 1 from public.barbershop_memberships m where m.barbershop_id=r.barbershop_id and m.user_id=actor and m.status='active' and m.role='administrator')))
 from (select 1) seed left join private.booking_care c on c.reservation_id=r.id;
$fn$;

create function private.care_command(actor uuid,d jsonb) returns jsonb
language plpgsql security definer set search_path='' as $fn$
declare action text; shop uuid; target uuid; request uuid; r public.reservations;
 c private.booking_care; cfg private.care_settings; old private.care_events; role_name text;
 assigned boolean; key bigint; stamp timestamptz; instructions text; tolerance integer;
begin
 perform private.booking_actor(actor);
 if jsonb_typeof(d) is distinct from 'object' or jsonb_typeof(d->'command') is distinct from 'string' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 action:=d->>'command';
 if action in('settings','configure','payment-options') then
  if action='configure' then
   perform private.booking_keys(d,array['command','barbershopId','requestId','noShowToleranceMin','yapeInstructions']);
  else perform private.booking_keys(d,array['command','barbershopId']);end if;
  shop:=(d->>'barbershopId')::uuid;
  if shop is null then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  if action='payment-options' then
   if not exists(select 1 from public.barbershop_booking_settings where barbershop_id=shop and publication_state in('published','paused')) then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
   return jsonb_build_object('cash',true,'yape',exists(select 1 from private.care_settings where barbershop_id=shop and yape_instructions is not null));
  end if;
  -- Same shop-first lock as operations/booking. No data is created by settings reads.
  if action='configure' then
   perform 1 from public.barbershop_booking_settings where barbershop_id=shop for update;
  else perform 1 from public.barbershop_booking_settings where barbershop_id=shop for share;end if;
  perform 1 from public.barbershop_memberships where barbershop_id=shop and user_id=actor and role='administrator' and status='active' for share;
  if not found then raise exception using errcode='42501',message='FORBIDDEN';end if;
  if action='configure' then
   request:=(d->>'requestId')::uuid;
   if request is null or jsonb_typeof(d->'noShowToleranceMin') is distinct from 'number' or (d->>'noShowToleranceMin') !~ '^\d+$' or jsonb_typeof(d->'yapeInstructions') not in('string','null') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
   tolerance:=(d->>'noShowToleranceMin')::integer;instructions:=nullif(btrim(d->>'yapeInstructions'),'');
   if tolerance<0 or tolerance>1440 or length(instructions)>2000 then raise exception using errcode='22023',message='INVALID_INPUT';end if;
   select * into old from private.care_events where actor_user_id=actor and request_id=request;
   if found and old.fingerprint<>d then raise exception using errcode='23505',message='CONFLICT';end if;
   if not found then
    insert into private.care_settings values(shop,tolerance,instructions) on conflict(barbershop_id) do update set no_show_tolerance_min=excluded.no_show_tolerance_min,yape_instructions=excluded.yape_instructions;
    insert into private.care_events(barbershop_id,actor_user_id,request_id,fingerprint,kind,capacity) values(shop,actor,request,d,'configured','administrator');
   end if;
  end if;
  select * into cfg from private.care_settings where barbershop_id=shop;
  return jsonb_build_object('barbershopId',shop,'noShowToleranceMin',coalesce(cfg.no_show_tolerance_min,10),'yapeInstructions',cfg.yape_instructions);
 end if;
 if action='read' then perform private.booking_keys(d,array['command','reservationId']);
 elsif action in('start','complete','no-show') then perform private.booking_keys(d,array['command','reservationId','requestId']);
 elsif action='receive' then perform private.booking_keys(d,array['command','reservationId','requestId','attested']);
 elsif action='refund' then perform private.booking_keys(d,array['command','reservationId','requestId','attested','reason']);
 else raise exception using errcode='22023',message='INVALID_INPUT';end if;
 target:=(d->>'reservationId')::uuid;
 if target is null then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 select * into r from public.reservations where id=target;
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 perform 1 from public.barbershop_booking_settings where barbershop_id=r.barbershop_id for share;
 for key in select distinct hashtextextended('booking-person:'||x::text,0) k from(select r.client_user_id x union select r.barber_user_id) p order by k loop perform pg_advisory_xact_lock(key);end loop;
 select * into r from public.reservations where id=target for update;
 select m.role into role_name from public.barbershop_memberships m where m.barbershop_id=r.barbershop_id and m.user_id=actor and m.status='active' for share;
 perform 1 from public.barber_profiles p where p.id=r.barber_id and p.barbershop_id=r.barbershop_id and p.user_id=actor and p.active for share;
 assigned:=found and role_name in('barber','administrator');
 if actor<>r.client_user_id and not coalesce(role_name='administrator' or assigned,false) then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 if action='read' then return private.care_json(r,actor);end if;
 if action in('start','complete','no-show') and not coalesce(assigned,false) then raise exception using errcode='42501',message='FORBIDDEN';end if;
 if action='receive' and not coalesce(role_name='administrator' or assigned,false) then raise exception using errcode='42501',message='FORBIDDEN';end if;
 if action='refund' and role_name is distinct from 'administrator' then raise exception using errcode='42501',message='FORBIDDEN';end if;
 if action in('receive','refund') and d->'attested' is distinct from 'true'::jsonb then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 if action='refund' and (jsonb_typeof(d->'reason') is distinct from 'string' or coalesce(length(btrim(d->>'reason')),0)=0 or length(d->>'reason')>2000) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 request:=(d->>'requestId')::uuid;
 if request is null then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 select * into old from private.care_events where actor_user_id=actor and request_id=request;
 if found then
  if old.fingerprint<>d then raise exception using errcode='23505',message='CONFLICT';end if;
  return private.care_json(r,actor);
 end if;
 select * into c from private.booking_care where reservation_id=target for update;
 -- Legacy bookings have no financial/attendance history and remain unchanged.
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 stamp:=clock_timestamp();
 if action='start' then
  if r.state<>'confirmed' or c.attendance<>'confirmed' or stamp<r.starts_at then raise exception using errcode='23505',message='CONFLICT';end if;
  update private.booking_care set attendance='in-service' where reservation_id=target;
 elsif action='complete' then
  if r.state<>'confirmed' or c.attendance<>'in-service' then raise exception using errcode='23505',message='CONFLICT';end if;
  update private.booking_care set attendance='completed' where reservation_id=target;
 elsif action='no-show' then
  if r.state<>'confirmed' or c.attendance<>'confirmed' or stamp<r.starts_at+make_interval(mins=>c.no_show_tolerance_min) then raise exception using errcode='23505',message='CONFLICT';end if;
  update private.booking_care set attendance='no-show' where reservation_id=target;
 elsif action='receive' then
  if c.payment_status<>'pending' then raise exception using errcode='23505',message='CONFLICT';end if;
  update private.booking_care set payment_status='paid' where reservation_id=target;
 elsif action='refund' then
  if r.state<>'cancelled' or c.payment_status<>'paid' then raise exception using errcode='23505',message='CONFLICT';end if;
  update private.booking_care set payment_status='refunded' where reservation_id=target;
 end if;
 insert into private.care_events(reservation_id,barbershop_id,actor_user_id,request_id,fingerprint,kind,capacity,occurred_at,reason,amount_minor,method)
 values(target,r.barbershop_id,actor,request,d,action,case when action in('start','complete','no-show') then 'barber' else role_name end,stamp,nullif(btrim(d->>'reason'),''),case when action in('receive','refund') then c.amount_minor else null end,case when action in('receive','refund') then c.method else null end);
 return private.care_json(r,actor);
exception when invalid_text_representation or numeric_value_out_of_range then raise exception using errcode='22023',message='INVALID_INPUT';
end $fn$;

create function private.confirm_booking_paid(actor uuid,d jsonb) returns jsonb
language plpgsql security definer set search_path='' as $fn$
declare result jsonb; cfg private.care_settings; r public.reservations; c private.booking_care; method text;
begin
 perform private.booking_actor(actor);
 perform private.booking_keys(d,array['requestId','barbershopId','serviceIds','barberId','startsAt','paymentMethod']);
 method:=d->>'paymentMethod';
 if jsonb_typeof(d->'paymentMethod') is distinct from 'string' or method not in('cash','yape') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 -- Existing engine acquires shop/person/row locks, validates price/duration and handles rollback.
 result:=private.reservation_confirm(actor,d-'paymentMethod');
 select * into r from public.reservations where id=(result->'detail'->>'id')::uuid for update;
 select * into c from private.booking_care where reservation_id=r.id;
 if (result->>'replayed')::boolean then
  if not found or c.method<>method then raise exception using errcode='23505',message='CONFLICT';end if;
  return result;
 end if;
 select * into cfg from private.care_settings where barbershop_id=r.barbershop_id;
 if method='yape' and cfg.yape_instructions is null then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 insert into private.booking_care(reservation_id,barbershop_id,no_show_tolerance_min,method,amount_minor,yape_instructions_snapshot)
 values(r.id,r.barbershop_id,coalesce(cfg.no_show_tolerance_min,10),method,(r.total_amount*100)::bigint,case when method='yape' then cfg.yape_instructions end);
 insert into private.care_events(reservation_id,barbershop_id,actor_user_id,request_id,fingerprint,kind,capacity,amount_minor,method)
 values(r.id,r.barbershop_id,actor,(d->>'requestId')::uuid,d,'created','client',(r.total_amount*100)::bigint,method);
 return result;
exception when invalid_text_representation or numeric_value_out_of_range then raise exception using errcode='22023',message='INVALID_INPUT';
end $fn$;

create function private.care_cancel_guard() returns trigger
language plpgsql security definer set search_path='' as $fn$
begin
 if old.state<>new.state and new.state='cancelled' then
  if exists(select 1 from private.booking_care where reservation_id=old.id and attendance<>'confirmed') then raise exception using errcode='23505',message='CONFLICT';end if;
  update private.booking_care set attendance='cancelled' where reservation_id=old.id;
 end if;
 return new;
end $fn$;
create trigger care_cancel_guard before update of state on public.reservations for each row execute function private.care_cancel_guard();

create function public.care_booking(p_actor_id uuid,p_data jsonb) returns jsonb language sql security invoker set search_path='' as $fn$ select private.care_command(p_actor_id,p_data); $fn$;
create function public.confirm_booking_paid(p_actor_id uuid,p_data jsonb) returns jsonb language sql security invoker set search_path='' as $fn$ select private.confirm_booking_paid(p_actor_id,p_data); $fn$;
revoke all on function private.care_json(public.reservations,uuid),private.care_command(uuid,jsonb),private.confirm_booking_paid(uuid,jsonb),private.care_cancel_guard(),public.care_booking(uuid,jsonb),public.confirm_booking_paid(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function private.care_command(uuid,jsonb),private.confirm_booking_paid(uuid,jsonb),public.care_booking(uuid,jsonb),public.confirm_booking_paid(uuid,jsonb) to service_role;
-- Coordinated activation required: old Edge code must not keep creating ledger-free new bookings.
-- The new SECURITY DEFINER paid-confirm calls the old engine as its owner, not service_role.
-- Historical replay/read endpoints and already stored reservations remain unchanged.
revoke execute on function public.confirm_booking(uuid,jsonb),private.reservation_confirm(uuid,jsonb) from service_role;
notify pgrst,'reload schema';
commit;
-- Reversal: separately reviewed drops, no CASCADE; retain/audit all new records first.
-- Applying this file or exercising SQL against real data is NOT authorized by its preparation.
