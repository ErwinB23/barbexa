-- Local additive cancellation API; no existing rows, RLS policies or table grants changed.
begin;
create function private.cancellation_before_limit(starts timestamptz,advance integer,at_time timestamptz) returns boolean
language sql immutable set search_path='' as $fn$ select advance>=0 and at_time<=starts-make_interval(mins=>advance); $fn$;
create function private.reservation_cancel(actor uuid,d jsonb) returns jsonb
language plpgsql security definer set search_path='' as $fn$
declare target uuid; request uuid; r public.reservations; person uuid; client uuid; shop uuid; key bigint;
 staff text; reason text; stamp timestamptz; capacity text;
begin
 perform private.booking_actor(actor);
 perform private.booking_keys(d,array['requestId','reservationId'],array['reason']);
 if jsonb_typeof(d->'requestId') is distinct from 'string' or jsonb_typeof(d->'reservationId') is distinct from 'string' or (d ? 'reason' and jsonb_typeof(d->'reason') is distinct from 'string') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 target:=(d->>'reservationId')::uuid;request:=(d->>'requestId')::uuid;reason:=nullif(btrim(d->>'reason'),'');
 select barber_user_id,client_user_id,barbershop_id into person,client,shop from public.reservations where id=target;
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 -- Same protocol as confirmation: shop configuration, sorted physical people, then rows.
 perform 1 from public.barbershop_booking_settings where barbershop_id=shop for share;
 for key in select distinct hashtextextended('booking-person:'||x::text,0) k from (select client x union select person) ids order by k loop perform pg_advisory_xact_lock(key);end loop;
 select * into r from public.reservations where id=target for update;
 select m.role into staff from public.barbershop_memberships m where m.user_id=actor and m.barbershop_id=r.barbershop_id and m.status='active' and (m.role='administrator' or (m.role='barber' and exists(select 1 from public.barber_profiles p where p.id=r.barber_id and p.user_id=actor and p.barbershop_id=r.barbershop_id and p.active))) for share;
 if actor<>r.client_user_id and staff is null then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 -- An authorized repetition preserves the first event, timestamp, actor and reason.
 if r.state='cancelled' then return private.reservation_json(r);end if;
 stamp:=clock_timestamp();
 if actor=r.client_user_id and private.cancellation_before_limit(r.starts_at,(r.policy_snapshot->>'cancellationAdvanceMin')::integer,stamp) then capacity:='client';
 elsif staff is not null then
  if reason is null then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  capacity:=staff;
 else raise exception using errcode='42501',message='FORBIDDEN';end if;
 update public.reservations set state='cancelled',cancelled_at=stamp where id=target returning * into r;
 insert into public.reservation_events(reservation_id,barbershop_id,actor_user_id,capacity,kind,occurred_at,reason) values(r.id,r.barbershop_id,actor,capacity,'cancelled',stamp,reason);
 return private.reservation_json(r);
exception when invalid_text_representation or numeric_value_out_of_range then raise exception using errcode='22023',message='INVALID_INPUT';
end $fn$;
create function public.cancel_booking(p_actor_id uuid,p_data jsonb) returns jsonb language sql security invoker set search_path='' as $fn$
 select private.reservation_cancel(p_actor_id,p_data);
$fn$;
revoke all on function private.cancellation_before_limit(timestamptz,integer,timestamptz),private.reservation_cancel(uuid,jsonb),public.cancel_booking(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function private.reservation_cancel(uuid,jsonb),public.cancel_booking(uuid,jsonb) to service_role;
commit;
-- Reversal requires separate approval and no CASCADE: drop wrapper, cancel implementation, pure time helper.
