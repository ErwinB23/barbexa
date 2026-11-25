-- REVIEW ONLY. Never apply without explicit LOCAL migration authorization.
begin;
create function private.own_professional_summary(actor uuid,d jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $fn$
declare shop uuid;professional uuid;profile jsonb;day_value date;day_start timestamptz;day_end timestamptz;result jsonb;
begin
 perform private.booking_actor(actor);perform private.booking_keys(d,array['barbershopId','localDate']);
 if jsonb_typeof(d->'barbershopId') is distinct from 'string' or jsonb_typeof(d->'localDate') is distinct from 'string'
   or(d->>'localDate') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 shop:=(d->>'barbershopId')::uuid;day_value:=(d->>'localDate')::date;
 profile:=private.self_professional_command(actor,'get',jsonb_build_object('barbershopId',shop));
 professional:=(profile->>'id')::uuid;
 day_start:=day_value::timestamp at time zone 'America/Lima';day_end:=(day_value+1)::timestamp at time zone 'America/Lima';
 with activity as(select r.starts_at,
   case when r.state='cancelled' then 'cancelled' when c.reservation_id is null then 'unrecorded' else c.attendance end kind
   from public.reservations r left join private.booking_care c on c.reservation_id=r.id and c.barbershop_id=r.barbershop_id
   where r.barber_id=professional and r.barbershop_id=shop and r.barber_user_id=actor and r.starts_at>=day_start and r.starts_at<day_end)
 select jsonb_build_object('professional',profile,'localDate',to_char(day_value,'YYYY-MM-DD'),
   'total',count(*),'scheduled',count(*) filter(where kind='confirmed'),'inService',count(*) filter(where kind='in-service'),
   'completed',count(*) filter(where kind='completed'),'cancelled',count(*) filter(where kind='cancelled'),
   'noShow',count(*) filter(where kind='no-show'),'unrecorded',count(*) filter(where kind='unrecorded'),
   'upcoming',count(*) filter(where kind in('confirmed','unrecorded') and starts_at>=statement_timestamp()),
   'nextStartsAt',to_char(min(starts_at) filter(where kind in('confirmed','unrecorded') and starts_at>=statement_timestamp()) at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
 into result from activity;
 return result;
exception when invalid_text_representation or datetime_field_overflow then raise exception using errcode='22023',message='INVALID_INPUT';
end;$fn$;
create function public.own_professional_summary(p_actor_id uuid,p_data jsonb) returns jsonb
language sql security definer set search_path='' as $fn$select private.own_professional_summary(p_actor_id,p_data);$fn$;
revoke all on function private.own_professional_summary(uuid,jsonb),public.own_professional_summary(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.own_professional_summary(uuid,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
