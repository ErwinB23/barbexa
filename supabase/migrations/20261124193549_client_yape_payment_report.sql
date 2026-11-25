-- Prepared locally only. Not applied to any database.
-- Full-payment report only. QR storage and partial payments are separate work.
begin;
create table private.yape_payment_reports (
 reservation_id uuid primary key,
 barbershop_id uuid not null,
 client_user_id uuid not null references public.profiles(id) on delete restrict,
 security_code text not null check(security_code ~ '^[0-9]{3}$'),
 submitted_at timestamptz not null default clock_timestamp(),
 foreign key(reservation_id,barbershop_id) references public.reservations(id,barbershop_id) on delete restrict
);
create index yape_payment_reports_shop on private.yape_payment_reports(barbershop_id,reservation_id);
create index yape_payment_reports_client on private.yape_payment_reports(client_user_id);
alter table private.yape_payment_reports enable row level security;
revoke all on private.yape_payment_reports from public,anon,authenticated,service_role;
alter table private.care_events drop constraint care_events_kind_check;
alter table private.care_events add constraint care_events_kind_check
 check(kind in('configured','created','start','complete','no-show','receive','refund','report-yape'));

create or replace function private.care_json(r public.reservations,actor uuid) returns jsonb
language sql stable security definer set search_path='' as $fn$
 select jsonb_build_object(
 'reservationId',r.id,
 'attendance',case when c.reservation_id is null then null when r.state='cancelled' then 'cancelled' else c.attendance end,
 'noShowToleranceMin',c.no_show_tolerance_min,
 'payment',case when c.reservation_id is null then null else jsonb_build_object('method',c.method,'status',c.payment_status,'amountMinor',c.amount_minor,'currency','PEN') end,
 'yapeInstructions',c.yape_instructions_snapshot,
 'canReportYape',coalesce(actor=r.client_user_id and r.state='confirmed' and c.method='yape' and c.payment_status='pending' and c.attendance not in('cancelled','no-show') and not exists(select 1 from private.yape_payment_reports p where p.reservation_id=r.id),false),
 'yapeReport',(select jsonb_build_object('securityCode',p.security_code,'submittedAt',to_char(p.submitted_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')) from private.yape_payment_reports p where p.reservation_id=r.id),
 'events',coalesce((select jsonb_agg(jsonb_build_object('kind',e.kind,'occurredAt',to_char(e.occurred_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'actorUserId',e.actor_user_id,'capacity',e.capacity,'reason',e.reason) order by e.occurred_at,e.id) from private.care_events e where e.reservation_id=r.id),'[]'::jsonb),
 'permissions',jsonb_build_object(
 'attend',exists(select 1 from public.barber_profiles p join public.barbershop_memberships m on m.user_id=p.user_id and m.barbershop_id=p.barbershop_id where p.id=r.barber_id and p.user_id=actor and p.active and m.status='active' and m.role in('barber','administrator')),
 'receive',exists(select 1 from public.barbershop_memberships m where m.barbershop_id=r.barbershop_id and m.user_id=actor and m.status='active' and ((m.role='administrator' and exists(select 1 from private.barbershop_ownership where barbershop_id=r.barbershop_id)) or exists(select 1 from public.barber_profiles p where p.id=r.barber_id and p.user_id=actor and p.active))),
 'refund',exists(select 1 from public.barbershop_memberships m where m.barbershop_id=r.barbershop_id and m.user_id=actor and m.status='active' and m.role='administrator' and private.authority_owner(actor,r.barbershop_id))))
 from (select 1) seed left join private.booking_care c on c.reservation_id=r.id;
$fn$;

create or replace function private.care_command(actor uuid,d jsonb) returns jsonb
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
  if action in('configure','configuration') then perform private.authority_lock(shop);perform private.authority_assert(actor,shop,'operations');end if;
  if shop is null then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  if action='payment-options' then
   if not exists(select 1 from public.barbershop_booking_settings where barbershop_id=shop and publication_state in('published','paused')) then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
   return jsonb_build_object('cash',true,'yape',exists(select 1 from private.care_settings where barbershop_id=shop and yape_instructions is not null));
  end if;
  -- Same shop-first lock as operations/booking. No data is created by settings reads.
  if action='configure' then
   perform 1 from public.barbershop_booking_settings where barbershop_id=shop for update;
   perform 1 from public.barbershop_memberships where barbershop_id=shop and user_id=actor and role='administrator' and status='active' for share;
  else
   perform 1 from public.barbershop_memberships where barbershop_id=shop and user_id=actor and role='administrator' and status='active';
  end if;
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
 elsif action='report-yape' then perform private.booking_keys(d,array['command','reservationId','requestId','securityCode']);
 elsif action='receive' then perform private.booking_keys(d,array['command','reservationId','requestId','attested']);
 elsif action='refund' then perform private.booking_keys(d,array['command','reservationId','requestId','attested','reason']);
 else raise exception using errcode='22023',message='INVALID_INPUT';end if;
 target:=(d->>'reservationId')::uuid;
 if target is null then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 select * into r from public.reservations where id=target;
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 if action='read' then
  select m.role into role_name from public.barbershop_memberships m where m.barbershop_id=r.barbershop_id and m.user_id=actor and m.status='active';
  assigned:=coalesce(role_name in('barber','administrator'),false) and exists(select 1 from public.barber_profiles p where p.id=r.barber_id and p.barbershop_id=r.barbershop_id and p.user_id=actor and p.active);
  if actor<>r.client_user_id and not coalesce(role_name='administrator' or assigned,false) then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
  return private.care_json(r,actor);
 end if;
 perform private.authority_lock(r.barbershop_id);
 shop:=r.barbershop_id;
 if action='refund' then perform private.authority_assert(actor,shop,'refund');end if;
 perform 1 from public.barbershop_booking_settings where barbershop_id=r.barbershop_id for share;
 for key in select distinct hashtextextended('booking-person:'||x::text,0) k from(select r.client_user_id x union select r.barber_user_id) p order by k loop perform pg_advisory_xact_lock(key);end loop;
 select * into r from public.reservations where id=target for update;
 select m.role into role_name from public.barbershop_memberships m where m.barbershop_id=r.barbershop_id and m.user_id=actor and m.status='active' for share;
 perform 1 from public.barber_profiles p where p.id=r.barber_id and p.barbershop_id=r.barbershop_id and p.user_id=actor and p.active for share;
 assigned:=found and role_name in('barber','administrator');
 if actor<>r.client_user_id and not coalesce(role_name='administrator' or assigned,false) then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 if action='report-yape' and actor<>r.client_user_id then raise exception using errcode='42501',message='FORBIDDEN';end if;
 if action='report-yape' and (jsonb_typeof(d->'securityCode') is distinct from 'string' or (d->>'securityCode') !~ '^[0-9]{3}$') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 if action in('start','complete','no-show') and not coalesce(assigned,false) then raise exception using errcode='42501',message='FORBIDDEN';end if;
 if action='receive' and role_name='administrator' and not assigned then perform private.authority_assert(actor,shop,'operations');end if;
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
 if action='report-yape' then
  if r.state<>'confirmed' or c.attendance in('cancelled','no-show') or c.method<>'yape' or c.payment_status<>'pending' then
   raise exception using errcode='23505',message='CONFLICT';
  end if;
  insert into private.yape_payment_reports(reservation_id,barbershop_id,client_user_id,security_code,submitted_at)
   values(r.id,r.barbershop_id,actor,d->>'securityCode',stamp);
 elsif action='start' then
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
 values(target,r.barbershop_id,actor,request,d,action,case when action='report-yape' then 'client' when action in('start','complete','no-show') then 'barber' else role_name end,stamp,nullif(btrim(d->>'reason'),''),case when action in('receive','refund') then c.amount_minor else null end,case when action in('receive','refund') then c.method else null end);
 return private.care_json(r,actor);
exception when invalid_text_representation or numeric_value_out_of_range then raise exception using errcode='22023',message='INVALID_INPUT';
end $fn$;

create or replace function private.web_notice_care_event() returns trigger
language plpgsql security definer set search_path='' as $fn$
declare caption text;
begin
 caption:=case new.kind when 'start' then 'Atención iniciada' when 'complete' then 'Atención completada' when 'no-show' then 'Inasistencia registrada' when 'receive' then 'Pago recibido' when 'refund' then 'Reembolso registrado' when 'report-yape' then 'Pago Yape pendiente de verificación' else null end;
 if new.reservation_id is not null and caption is not null then
  perform private.web_notice_reservation(new.reservation_id,'care:'||new.id,caption);
 end if;
 return new;
end;$fn$;

revoke all on function private.care_command(uuid,jsonb),private.care_json(public.reservations,uuid),private.web_notice_care_event() from public,anon,authenticated,service_role;
grant execute on function private.care_command(uuid,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
