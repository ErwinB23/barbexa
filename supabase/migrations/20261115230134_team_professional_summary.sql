-- 011 authorized LOCAL activation; no business rows rewritten.
begin;
set local lock_timeout='5s';
set local statement_timeout='20s';
-- REVIEW ONLY. No migration/application permission. Existing barber rows are not rewritten.

-- Metadata inspection confirmed this exact original CHECK name. Only new admin role is added.
alter table public.staff_invitations drop constraint staff_invitations_role_check;
alter table public.staff_invitations add constraint staff_invitations_role_check check(role in('barber','administrator'));
create table private.admin_invitation_mail (
 invitation_id uuid primary key references public.staff_invitations(id) on delete restrict,
 requesting_actor_id uuid not null references public.profiles(id) on delete restrict,
 request_id uuid not null,fingerprint jsonb not null,
 recipient_email text not null check(length(recipient_email) between 3 and 254),
 expires_at timestamptz not null check(isfinite(expires_at)),expired boolean not null default false,
 delivery_state text not null default 'pending' check(delivery_state in('pending','sending','sent','failed','unknown')),
 claim_id uuid,claim_actor_id uuid references public.profiles(id) on delete restrict,
 unique(requesting_actor_id,request_id),
 check((claim_id is null)=(claim_actor_id is null))
);
alter table private.admin_invitation_mail enable row level security;
revoke all on private.admin_invitation_mail from public,anon,authenticated,service_role;

create function private.admin_invitation_json(i public.staff_invitations) returns jsonb
language sql stable security invoker set search_path='' as $fn$
 select jsonb_build_object('id',i.id,'barbershopId',i.barbershop_id,'barbershopName',b.name,
  'recipientName',p.display_name,'role','administrator',
  'status',case when m.expired or(i.status='pending' and m.expires_at<=statement_timestamp()) then 'expired' else i.status end,
  'createdAt',to_char(i.created_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  'expiresAt',to_char(m.expires_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'deliveryStatus',m.delivery_state)
 from private.admin_invitation_mail m join public.barbershops b on b.id=i.barbershop_id
 join public.profiles p on p.id=i.recipient_user_id where m.invitation_id=i.id and i.role='administrator';
$fn$;
create function private.admin_invitation_admin(actor uuid,shop uuid) returns void
language plpgsql security invoker set search_path='' as $fn$
begin
 perform private.booking_actor(actor);
 if not exists(select 1 from public.barbershops where id=shop) then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 -- Dedicated invitation lock: no offering, schedules or reservations are modified.
 perform pg_advisory_xact_lock(hashtextextended('admin-invitation-shop:'||shop::text,0));
 perform 1 from public.barbershop_memberships where user_id=actor and barbershop_id=shop and status='active' and role='administrator' for share;
 if not found then raise exception using errcode='42501',message='FORBIDDEN';end if;
end;$fn$;
create function private.admin_invitation_command(actor uuid,action text,d jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $fn$
declare i public.staff_invitations;m private.admin_invitation_mail;shop uuid;target uuid;recipient uuid;
 request uuid;stamp timestamptz;address text;claim uuid;requested_state text;
begin
 perform private.booking_actor(actor);
 if action='create' then
  perform private.booking_keys(d,array['requestId','barbershopId','email']);
  if jsonb_typeof(d->'requestId') is distinct from 'string' or jsonb_typeof(d->'barbershopId') is distinct from 'string'
   or jsonb_typeof(d->'email') is distinct from 'string' or length(d->>'email')>254
   or(d->>'email') ~ '[\r\n]' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  shop:=(d->>'barbershopId')::uuid;request:=(d->>'requestId')::uuid;address:=lower(btrim(d->>'email'));
  perform private.admin_invitation_admin(actor,shop);stamp:=clock_timestamp();
  select * into m from private.admin_invitation_mail where requesting_actor_id=actor and request_id=request for update;
  if found then
   if m.fingerprint<>jsonb_build_object('barbershopId',shop,'email',address) then raise exception using errcode='23505',message='CONFLICT';end if;
   select * into i from public.staff_invitations where id=m.invitation_id;
   return private.admin_invitation_json(i);
  end if;
  select u.id into recipient from auth.users u join public.profiles p on p.id=u.id
    where lower(u.email)=address and u.email_confirmed_at is not null and not u.is_anonymous
      and(u.banned_until is null or u.banned_until<=stamp) for share of u;
  if not found then raise exception using errcode='P0001',message='PROFILE_REQUIRED';end if;
  if exists(select 1 from public.barbershop_memberships where user_id=recipient and barbershop_id=shop and role='administrator' and status='active') then raise exception using errcode='23505',message='CONFLICT';end if;
  -- Expire only new administrator invitations, never any existing barber invitation.
  for i in select x.* from public.staff_invitations x join private.admin_invitation_mail md on md.invitation_id=x.id
    where x.barbershop_id=shop and x.recipient_user_id=recipient and x.role='administrator' and x.status='pending' and md.expires_at<=stamp for update of x
  loop
   update public.staff_invitations set status='cancelled',responded_at=stamp where id=i.id;
   update private.admin_invitation_mail set expired=true where invitation_id=i.id;
  end loop;
  if exists(select 1 from public.staff_invitations where barbershop_id=shop and recipient_user_id=recipient and status='pending') then raise exception using errcode='23505',message='CONFLICT';end if;
  insert into public.staff_invitations(barbershop_id,recipient_user_id,inviter_user_id,role,created_at) values(shop,recipient,actor,'administrator',clock_timestamp()) returning * into i;
  insert into private.admin_invitation_mail(invitation_id,requesting_actor_id,request_id,fingerprint,recipient_email,expires_at)
    values(i.id,actor,request,jsonb_build_object('barbershopId',shop,'email',address),address,i.created_at+interval '7 days');
  return private.admin_invitation_json(i);
 elsif action='list' then
  perform private.booking_keys(d,array['barbershopId']);
  if jsonb_typeof(d->'barbershopId')='null' then shop:=null;
  elsif jsonb_typeof(d->'barbershopId')='string' then shop:=(d->>'barbershopId')::uuid;perform private.admin_invitation_admin(actor,shop);
  else raise exception using errcode='22023',message='INVALID_INPUT';end if;
  return coalesce((select jsonb_agg(private.admin_invitation_json(x) order by x.created_at desc,x.id desc)
   from(select inv.* from public.staff_invitations inv join private.admin_invitation_mail md on md.invitation_id=inv.id
   where inv.role='administrator' and(case when shop is null then inv.recipient_user_id=actor else inv.barbershop_id=shop end)
   order by inv.created_at desc,inv.id desc limit 200)x),'[]'::jsonb);
 end if;
 if action='respond' then perform private.booking_keys(d,array['invitationId','decision']);
 elsif action='claim' then perform private.booking_keys(d,array['invitationId','claimId']);
 elsif action='finish' then perform private.booking_keys(d,array['invitationId','claimId','status']);
 elsif action in('get','cancel') then perform private.booking_keys(d,array['invitationId']);
 else raise exception using errcode='22023',message='INVALID_INPUT';end if;
 if jsonb_typeof(d->'invitationId') is distinct from 'string' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 target:=(d->>'invitationId')::uuid;
 select * into i from public.staff_invitations where id=target and role='administrator';
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 shop:=i.barbershop_id;
 if action='respond' then
  if i.recipient_user_id<>actor then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
  perform pg_advisory_xact_lock(hashtextextended('admin-invitation-shop:'||shop::text,0));
 elsif action<>'finish' then perform private.admin_invitation_admin(actor,shop);
 end if;
 select * into i from public.staff_invitations where id=target and role='administrator' for update;
 select * into m from private.admin_invitation_mail where invitation_id=target for update;
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 stamp:=clock_timestamp();
 if action='get' then return private.admin_invitation_json(i);
 elsif action='finish' then
  if jsonb_typeof(d->'claimId') is distinct from 'string' or jsonb_typeof(d->'status') is distinct from 'string' or(d->>'status') not in('sent','failed','unknown') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  claim:=(d->>'claimId')::uuid;requested_state:=d->>'status';
  if m.claim_id is distinct from claim or m.claim_actor_id is distinct from actor then raise exception using errcode='42501',message='FORBIDDEN';end if;
  if m.delivery_state<>'sending' then
   if m.delivery_state=requested_state then return jsonb_build_object('ok',true);end if;
   raise exception using errcode='23505',message='CONFLICT';
  end if;
  update private.admin_invitation_mail set delivery_state=requested_state where invitation_id=target;
  return jsonb_build_object('ok',true);
 elsif action='claim' then
  if jsonb_typeof(d->'claimId') is distinct from 'string' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  if i.status<>'pending' or m.expired or m.expires_at<=stamp or m.delivery_state in('sending','sent','unknown') then return jsonb_build_object('claimed',false,'status',m.delivery_state);end if;
  perform 1 from auth.users u where u.id=i.recipient_user_id and lower(u.email)=m.recipient_email
   and u.email_confirmed_at is not null and not u.is_anonymous and(u.banned_until is null or u.banned_until<=stamp) for share;
  if not found then raise exception using errcode='P0001',message='PROFILE_REQUIRED';end if;
  claim:=(d->>'claimId')::uuid;
  update private.admin_invitation_mail set delivery_state='sending',claim_id=claim,claim_actor_id=actor where invitation_id=target;
  return jsonb_build_object('claimed',true,'envelope',jsonb_build_object('invitationId',target,'recipientEmail',m.recipient_email,
    'barbershopName',(select name from public.barbershops where id=shop),'expiresAt',to_char(m.expires_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')));
 elsif action='cancel' then
  if i.status='cancelled' and not m.expired then return private.admin_invitation_json(i);end if;
  if i.status<>'pending' or m.expired or m.expires_at<=stamp then raise exception using errcode='23505',message='CONFLICT';end if;
  update public.staff_invitations set status='cancelled',responded_at=stamp where id=target returning * into i;
  return private.admin_invitation_json(i);
 end if;
 if jsonb_typeof(d->'decision') is distinct from 'string' or(d->>'decision') not in('accept','reject') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 if(i.status='accepted' and d->>'decision'='accept')or(i.status='rejected' and d->>'decision'='reject')then return private.admin_invitation_json(i);end if;
 if i.status<>'pending' or m.expired or m.expires_at<=stamp then raise exception using errcode='23505',message='CONFLICT';end if;
 if d->>'decision'='reject' then update public.staff_invitations set status='rejected',responded_at=stamp where id=target returning * into i;
 else
  perform 1 from public.barbershop_memberships bm join auth.users u on u.id=bm.user_id
   where bm.user_id=i.inviter_user_id and bm.barbershop_id=shop and bm.role='administrator' and bm.status='active'
   and u.email_confirmed_at is not null and not u.is_anonymous and(u.banned_until is null or u.banned_until<=stamp) for share of bm,u;
  if not found then raise exception using errcode='42501',message='FORBIDDEN';end if;
  insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values(actor,shop,'administrator','active')
   on conflict(user_id,barbershop_id) do update set role='administrator',status='active';
  update public.staff_invitations set status='accepted',responded_at=stamp where id=target returning * into i;
 end if;
 return private.admin_invitation_json(i);
exception when unique_violation then raise exception using errcode='23505',message='CONFLICT';
 when invalid_text_representation or datetime_field_overflow then raise exception using errcode='22023',message='INVALID_INPUT';
end;$fn$;

-- Even the old private barber path cannot consume a new admin invitation as a barber.
create function private.guard_admin_invitation_accept() returns trigger
language plpgsql security invoker set search_path='' as $fn$
begin
 if not exists(select 1 from private.admin_invitation_mail md where md.invitation_id=old.id and not md.expired and md.expires_at>clock_timestamp())
  or not exists(select 1 from public.barbershop_memberships bm where bm.user_id=new.recipient_user_id and bm.barbershop_id=new.barbershop_id and bm.role='administrator' and bm.status='active')
 then raise exception using errcode='23505',message='CONFLICT';end if;return new;
end;$fn$;
create trigger admin_invitation_accept_guard before update of status on public.staff_invitations
for each row when(old.role='administrator' and new.status='accepted') execute function private.guard_admin_invitation_accept();

create function public.admin_invitation_create(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path='' as $fn$select private.admin_invitation_command(p_actor_id,'create',p_data);$fn$;
create function public.admin_invitation_list(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path='' as $fn$select private.admin_invitation_command(p_actor_id,'list',p_data);$fn$;
create function public.admin_invitation_get(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path='' as $fn$select private.admin_invitation_command(p_actor_id,'get',p_data);$fn$;
create function public.admin_invitation_respond(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path='' as $fn$select private.admin_invitation_command(p_actor_id,'respond',p_data);$fn$;
create function public.admin_invitation_cancel(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path='' as $fn$select private.admin_invitation_command(p_actor_id,'cancel',p_data);$fn$;
create function public.admin_invitation_claim_mail(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path='' as $fn$select private.admin_invitation_command(p_actor_id,'claim',p_data);$fn$;
create function public.admin_invitation_finish_mail(p_actor_id uuid,p_data jsonb) returns jsonb language sql security definer set search_path='' as $fn$select private.admin_invitation_command(p_actor_id,'finish',p_data);$fn$;
-- Existing signature, role-aware routing; the original barber implementation is preserved.
create or replace function public.respond_booking_invitation(p_actor_id uuid,p_data jsonb) returns jsonb
language plpgsql security definer set search_path='' as $fn$
declare target_role text;
begin
 perform private.booking_actor(p_actor_id);perform private.booking_keys(p_data,array['invitationId','decision']);
 if p_data->>'decision' not in('accept','reject') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 select role into target_role from public.staff_invitations where id=(p_data->>'invitationId')::uuid;
 if target_role='administrator' then return private.admin_invitation_command(p_actor_id,'respond',p_data);end if;
 return private.booking_command(p_actor_id,(p_data->>'decision')||'-invitation',p_data-'decision');
end;$fn$;
revoke all on function private.admin_invitation_json(public.staff_invitations),private.admin_invitation_admin(uuid,uuid),private.admin_invitation_command(uuid,text,jsonb),private.guard_admin_invitation_accept() from public,anon,authenticated,service_role;
revoke all on function public.admin_invitation_create(uuid,jsonb),public.admin_invitation_list(uuid,jsonb),public.admin_invitation_get(uuid,jsonb),public.admin_invitation_respond(uuid,jsonb),public.admin_invitation_cancel(uuid,jsonb),public.admin_invitation_claim_mail(uuid,jsonb),public.admin_invitation_finish_mail(uuid,jsonb),public.respond_booking_invitation(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.admin_invitation_create(uuid,jsonb),public.admin_invitation_list(uuid,jsonb),public.admin_invitation_get(uuid,jsonb),public.admin_invitation_respond(uuid,jsonb),public.admin_invitation_cancel(uuid,jsonb),public.admin_invitation_claim_mail(uuid,jsonb),public.admin_invitation_finish_mail(uuid,jsonb),public.respond_booking_invitation(uuid,jsonb) to service_role;



-- REVIEW ONLY. Never apply without explicit LOCAL migration authorization.

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
