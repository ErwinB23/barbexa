-- Additive read-only agenda. No tables, data, existing ACL/RLS or Auth configuration changes.
begin;
create function private.booking_agenda(shop uuid, local_date date, professional uuid, filter_state text)
returns jsonb language plpgsql stable security definer set search_path='' as $fn$
declare actor uuid:=auth.uid(); member_role text; own_professional uuid; result jsonb;
begin
 if actor is null or not exists(select 1 from auth.users u where u.id=actor and not u.is_anonymous and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=now())) then
  raise exception using errcode='42501',message='UNAUTHENTICATED';
 end if;
 if shop is null or local_date is null or local_date not between date '2000-01-01' and date '2100-12-31' or (filter_state is not null and filter_state not in('confirmed','cancelled')) then
  raise exception using errcode='22023',message='INVALID_INPUT';
 end if;
 select m.role into member_role from public.barbershop_memberships m where m.user_id=actor and m.barbershop_id=shop and m.status='active';
 if member_role is null or member_role not in('administrator','barber') then raise exception using errcode='42501',message='FORBIDDEN';end if;
 if member_role='barber' then
  select p.id into own_professional from public.barber_profiles p where p.user_id=actor and p.barbershop_id=shop and p.active;
  if own_professional is null or (professional is not null and professional<>own_professional) then raise exception using errcode='42501',message='FORBIDDEN';end if;
  professional:=own_professional;
 elsif professional is not null and not exists(select 1 from public.barber_profiles p where p.id=professional and p.barbershop_id=shop) then
  raise exception using errcode='42501',message='FORBIDDEN';
 end if;
 select coalesce(jsonb_agg(private.reservation_json(r) order by r.starts_at,r.id),'[]'::jsonb) into result from
  (select r.* from public.reservations r where r.barbershop_id=shop
    and r.starts_at >= (local_date::timestamp at time zone 'America/Lima')
    and r.starts_at < ((local_date+1)::timestamp at time zone 'America/Lima')
    and (professional is null or r.barber_id=professional)
    and (filter_state is null or r.state=filter_state)
    order by r.starts_at,r.id limit 200) r;
 return result;
end $fn$;
create function public.list_booking_agenda(p_barbershop_id uuid,p_local_date date,p_barber_id uuid default null,p_state text default null)
returns jsonb language sql stable security invoker set search_path='' as $fn$
 select private.booking_agenda(p_barbershop_id,p_local_date,p_barber_id,p_state);
$fn$;
revoke all on function private.booking_agenda(uuid,date,uuid,text),public.list_booking_agenda(uuid,date,uuid,text) from public,anon,authenticated,service_role;
grant execute on function private.booking_agenda(uuid,date,uuid,text),public.list_booking_agenda(uuid,date,uuid,text) to authenticated;
commit;
-- Reversal (only separately authorized): drop the public wrapper, then its private function.
