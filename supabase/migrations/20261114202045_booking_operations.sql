-- 004 T009: new RPC only; no historical migration/policy/data rewrite.
begin;
create function private.booking_keys(d jsonb, required text[], optional text[] default array[]::text[]) returns void
language plpgsql set search_path='' as $fn$
begin
 if jsonb_typeof(d) is distinct from 'object' or not(d ?& required) or exists(select 1 from jsonb_object_keys(d) k where not(k=any(required||optional))) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
end;$fn$;
create function private.booking_actor(actor uuid) returns void language plpgsql security definer set search_path='' as $fn$
begin
 if actor is null or not exists(select 1 from auth.users where id=actor and is_anonymous=false and email_confirmed_at is not null and (banned_until is null or banned_until<=now())) then raise exception using errcode='28000',message='UNAUTHENTICATED';end if;
 if not exists(select 1 from public.profiles where id=actor) then raise exception using errcode='P0001',message='PROFILE_REQUIRED';end if;
end;$fn$;
create function private.booking_admin(actor uuid,shop uuid) returns void language plpgsql security definer set search_path='' as $fn$
begin
 perform private.booking_actor(actor);
 if not exists(select 1 from public.barbershop_memberships where user_id=actor and barbershop_id=shop and role='administrator' and status='active') then raise exception using errcode='42501',message='FORBIDDEN';end if;
 insert into public.barbershop_booking_settings(barbershop_id) values(shop) on conflict do nothing;
 perform 1 from public.barbershop_booking_settings where barbershop_id=shop for update;
 perform 1 from public.barbershop_memberships where user_id=actor and barbershop_id=shop and role='administrator' and status='active' for share;
 if not found then raise exception using errcode='42501',message='FORBIDDEN';end if;
end;$fn$;
-- Forward guard: no reservation schema is created here. T015/T016 must exercise the real tables.
create function private.booking_preserve_reservations(shop uuid) returns void language plpgsql security definer set search_path='' as $fn$
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
  or exists(select 1 from public.schedule_exceptions e where e.barbershop_id=r.barbershop_id and(e.barber_id is null or e.barber_id=r.barber_id) and tstzrange(e.starts_at,e.ends_at,'[)') && tstzrange(r.starts_at,r.occupied_until,'[)'))))$q$ into invalid using shop;
 if invalid then raise exception using errcode='23505',message='CONFLICT';end if;
 if to_regclass('public.reservation_items') is not null then
  execute $q$select exists(select 1 from public.reservations r join public.reservation_items i on i.reservation_id=r.id and i.barbershop_id=r.barbershop_id where r.barbershop_id=$1 and r.state='confirmed' and r.starts_at>=now() and not exists(select 1 from public.barber_services c where c.barber_id=r.barber_id and c.barbershop_id=r.barbershop_id and c.service_id=i.service_id and c.active))$q$ into invalid using shop;
  if invalid then raise exception using errcode='23505',message='CONFLICT';end if;
 end if;
end;$fn$;
create function private.booking_invitation_json(i public.staff_invitations) returns jsonb language sql stable set search_path='' as $fn$
 select jsonb_build_object('id',i.id,'barbershopId',i.barbershop_id,'role',i.role,'status',i.status);
$fn$;
create function private.booking_command(actor uuid,action text,d jsonb) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare shop uuid; entity uuid; recipient uuid; professional uuid; invitation public.staff_invitations; service public.services; person public.barber_profiles; item jsonb; result jsonb:='null'; selected_ids uuid[];
begin
 perform private.booking_actor(actor);
 if action in('accept-invitation','reject-invitation','cancel-invitation') then
  perform private.booking_keys(d,array['invitationId']);
  select * into invitation from public.staff_invitations where id=(d->>'invitationId')::uuid;
  if not found or (action<>'cancel-invitation' and invitation.recipient_user_id<>actor) then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
  shop:=invitation.barbershop_id;
  if action='cancel-invitation' then perform private.booking_admin(actor,shop);
  else perform 1 from public.barbershop_booking_settings where barbershop_id=shop for update;end if;
  select * into invitation from public.staff_invitations where id=invitation.id for update;
  if invitation.status<>'pending' then raise exception using errcode='23505',message='CONFLICT';end if;
  if action='cancel-invitation' then update public.staff_invitations set status='cancelled',responded_at=statement_timestamp() where id=invitation.id returning * into invitation;
  elsif action='reject-invitation' then update public.staff_invitations set status='rejected',responded_at=statement_timestamp() where id=invitation.id returning * into invitation;
  else
   perform 1 from public.barbershop_memberships where user_id=invitation.inviter_user_id and barbershop_id=shop and role='administrator' and status='active' for share;
   if not found then raise exception using errcode='42501',message='FORBIDDEN';end if;
   if exists(select 1 from public.barbershop_memberships where user_id=actor and barbershop_id=shop and status='active' and role<>'barber') then raise exception using errcode='23505',message='CONFLICT';end if;
   insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values(actor,shop,'barber','active') on conflict(user_id,barbershop_id) do update set role='barber',status='active' where public.barbershop_memberships.status='inactive' or public.barbershop_memberships.role='barber';
   if not found then raise exception using errcode='23505',message='CONFLICT';end if;
   update public.staff_invitations set status='accepted',responded_at=statement_timestamp() where id=invitation.id returning * into invitation;
  end if;
  return private.booking_invitation_json(invitation);
 end if;
 shop:=(d->>'barbershopId')::uuid;
 perform private.booking_admin(actor,shop);
 case action
 when 'configure-shop' then
  perform private.booking_keys(d,array['barbershopId','publicContact','address','policies']);
  perform private.booking_keys(d->'policies',array['minimumNoticeMin','bookingHorizonDays','maxFuturePerClient','slotStepMin','bufferMin','cancellationAdvanceMin']);
  update public.barbershop_booking_settings set public_contact=d->>'publicContact',address=d->>'address',minimum_notice_min=(d->'policies'->>'minimumNoticeMin')::integer,booking_horizon_days=(d->'policies'->>'bookingHorizonDays')::integer,max_future_per_client=(d->'policies'->>'maxFuturePerClient')::integer,slot_step_min=(d->'policies'->>'slotStepMin')::integer,buffer_min=(d->'policies'->>'bufferMin')::integer,cancellation_advance_min=(d->'policies'->>'cancellationAdvanceMin')::integer where barbershop_id=shop;
 when 'set-publication' then
  perform private.booking_keys(d,array['barbershopId','state']);
  if d->>'state'='published' and not exists(select 1 from public.services s join public.barber_services c on c.service_id=s.id and c.barbershop_id=s.barbershop_id and c.active join public.barber_profiles p on p.id=c.barber_id and p.barbershop_id=c.barbershop_id and p.active join public.barbershop_memberships m on m.user_id=p.user_id and m.barbershop_id=p.barbershop_id and m.status='active' where s.barbershop_id=shop and s.active and exists(select 1 from public.barber_schedules h where h.barber_id=p.id and h.barbershop_id=shop)) then raise exception using errcode='23514',message='CONFLICT';end if;
  update public.barbershop_booking_settings set publication_state=d->>'state' where barbershop_id=shop;
 when 'upsert-service' then
  perform private.booking_keys(d,array['barbershopId','name','description','price','durationMin','active'],array['id']);
  perform private.booking_keys(d->'price',array['amountMinor','currency']);
  if (d->'price'->>'currency') is distinct from 'PEN' or jsonb_typeof(d->'price'->'amountMinor') is distinct from 'number' or (d->'price'->>'amountMinor')!~'^[0-9]+$' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  if d ? 'id' then update public.services set name=d->>'name',description=d->>'description',price_amount=(d->'price'->>'amountMinor')::numeric/100,duration_min=(d->>'durationMin')::integer,active=(d->>'active')::boolean where id=(d->>'id')::uuid and barbershop_id=shop returning * into service;
   if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
  else insert into public.services(barbershop_id,name,description,price_amount,duration_min,active) values(shop,d->>'name',d->>'description',(d->'price'->>'amountMinor')::numeric/100,(d->>'durationMin')::integer,(d->>'active')::boolean) returning * into service;end if;
  result:=jsonb_build_object('id',service.id,'barbershopId',shop,'name',service.name,'description',service.description,'price',jsonb_build_object('amountMinor',(service.price_amount*100)::bigint,'currency','PEN'),'durationMin',service.duration_min,'active',service.active);
 when 'set-professional' then
  perform private.booking_keys(d,array['barbershopId','userId','professionalName','active'],array['id']);
  recipient:=(d->>'userId')::uuid;
  perform 1 from public.barbershop_memberships where barbershop_id=shop and user_id=recipient and status='active' for share;
  if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
  if d ? 'id' then update public.barber_profiles set professional_name=d->>'professionalName',active=(d->>'active')::boolean where id=(d->>'id')::uuid and barbershop_id=shop and user_id=recipient returning * into person;
   if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
  else insert into public.barber_profiles(barbershop_id,user_id,professional_name,active) values(shop,recipient,d->>'professionalName',(d->>'active')::boolean) on conflict(user_id,barbershop_id) do update set professional_name=excluded.professional_name,active=excluded.active returning * into person;end if;
  result:=jsonb_build_object('id',person.id,'barbershopId',shop,'userId',person.user_id,'professionalName',person.professional_name,'active',person.active);
 when 'set-capabilities' then
  perform private.booking_keys(d,array['barbershopId','barberId','serviceIds']);professional:=(d->>'barberId')::uuid;
  if not exists(select 1 from public.barber_profiles where id=professional and barbershop_id=shop) then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
  if jsonb_typeof(d->'serviceIds') is distinct from 'array' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  select coalesce(array_agg(v::uuid),array[]::uuid[]) into selected_ids from jsonb_array_elements_text(d->'serviceIds') v;
  if cardinality(selected_ids)<>(select count(distinct v) from unnest(selected_ids)v) or exists(select 1 from unnest(selected_ids)v where not exists(select 1 from public.services where id=v and barbershop_id=shop)) then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  delete from public.barber_services where barbershop_id=shop and barber_id=professional;
  insert into public.barber_services(barbershop_id,barber_id,service_id) select shop,professional,v from unnest(selected_ids)v;
 when 'set-hours' then
  perform private.booking_keys(d,array['barbershopId','hours'],array['barberId']);
  if jsonb_typeof(d->'hours') is distinct from 'array' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
  professional:=(d->>'barberId')::uuid;
  if professional is not null and not exists(select 1 from public.barber_profiles where id=professional and barbershop_id=shop) then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
  set constraints public.shop_hours_containment,public.professional_hours_containment deferred;
  if professional is null then delete from public.barbershop_hours where barbershop_id=shop;else delete from public.barber_schedules where barbershop_id=shop and barber_id=professional;end if;
  for item in select * from jsonb_array_elements(d->'hours') loop
   perform private.booking_keys(item,array['weekday','opensMin','closesMin']);
   if professional is null then insert into public.barbershop_hours(barbershop_id,weekday,opens_min,closes_min) values(shop,(item->>'weekday')::integer,(item->>'opensMin')::integer,(item->>'closesMin')::integer);
   else insert into public.barber_schedules(barbershop_id,barber_id,weekday,opens_min,closes_min) values(shop,professional,(item->>'weekday')::integer,(item->>'opensMin')::integer,(item->>'closesMin')::integer);end if;
  end loop;
  set constraints public.shop_hours_containment,public.professional_hours_containment immediate;
 when 'set-exception' then
  perform private.booking_keys(d,array['barbershopId','barberId','startsAt','endsAt','reason']);
  insert into public.schedule_exceptions(barbershop_id,barber_id,starts_at,ends_at,reason) values(shop,(d->>'barberId')::uuid,(d->>'startsAt')::timestamptz,(d->>'endsAt')::timestamptz,d->>'reason');
 when 'invite-existing-user' then
  perform private.booking_keys(d,array['barbershopId','email']);
  select u.id into recipient from auth.users u join public.profiles p on p.id=u.id where lower(u.email)=lower(btrim(d->>'email')) and u.is_anonymous=false and u.email_confirmed_at is not null;
  if recipient is null then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
  insert into public.staff_invitations(barbershop_id,recipient_user_id,inviter_user_id) values(shop,recipient,actor) returning * into invitation;
  result:=private.booking_invitation_json(invitation);
 else raise exception using errcode='22023',message='INVALID_INPUT';
 end case;
 perform private.booking_preserve_reservations(shop);
 update public.barbershop_booking_settings set version=version+1 where barbershop_id=shop;
 return result;
end;$fn$;

create function public.configure_booking_shop(p_actor_id uuid,p_data jsonb) returns jsonb language sql security invoker set search_path='' as $fn$ select private.booking_command(p_actor_id,'configure-shop',p_data);$fn$;
revoke all on function public.configure_booking_shop(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.configure_booking_shop(uuid,jsonb) to service_role;

create function public.set_booking_publication(p_actor_id uuid,p_data jsonb) returns jsonb language sql security invoker set search_path='' as $fn$ select private.booking_command(p_actor_id,'set-publication',p_data);$fn$;
revoke all on function public.set_booking_publication(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.set_booking_publication(uuid,jsonb) to service_role;

create function public.upsert_booking_service(p_actor_id uuid,p_data jsonb) returns jsonb language sql security invoker set search_path='' as $fn$ select private.booking_command(p_actor_id,'upsert-service',p_data);$fn$;
revoke all on function public.upsert_booking_service(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.upsert_booking_service(uuid,jsonb) to service_role;

create function public.set_booking_professional(p_actor_id uuid,p_data jsonb) returns jsonb language sql security invoker set search_path='' as $fn$ select private.booking_command(p_actor_id,'set-professional',p_data);$fn$;
revoke all on function public.set_booking_professional(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.set_booking_professional(uuid,jsonb) to service_role;

create function public.set_booking_capabilities(p_actor_id uuid,p_data jsonb) returns jsonb language sql security invoker set search_path='' as $fn$ select private.booking_command(p_actor_id,'set-capabilities',p_data);$fn$;
revoke all on function public.set_booking_capabilities(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.set_booking_capabilities(uuid,jsonb) to service_role;

create function public.set_booking_hours(p_actor_id uuid,p_data jsonb) returns jsonb language sql security invoker set search_path='' as $fn$ select private.booking_command(p_actor_id,'set-hours',p_data);$fn$;
revoke all on function public.set_booking_hours(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.set_booking_hours(uuid,jsonb) to service_role;

create function public.set_booking_exception(p_actor_id uuid,p_data jsonb) returns jsonb language sql security invoker set search_path='' as $fn$ select private.booking_command(p_actor_id,'set-exception',p_data);$fn$;
revoke all on function public.set_booking_exception(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.set_booking_exception(uuid,jsonb) to service_role;

create function public.invite_booking_staff(p_actor_id uuid,p_data jsonb) returns jsonb language sql security invoker set search_path='' as $fn$ select private.booking_command(p_actor_id,'invite-existing-user',p_data);$fn$;
revoke all on function public.invite_booking_staff(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.invite_booking_staff(uuid,jsonb) to service_role;

create function public.cancel_booking_invitation(p_actor_id uuid,p_data jsonb) returns jsonb language sql security invoker set search_path='' as $fn$ select private.booking_command(p_actor_id,'cancel-invitation',p_data);$fn$;
revoke all on function public.cancel_booking_invitation(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.cancel_booking_invitation(uuid,jsonb) to service_role;

create function public.respond_booking_invitation(p_actor_id uuid,p_data jsonb) returns jsonb language plpgsql security invoker set search_path='' as $fn$
begin
 perform private.booking_keys(p_data,array['invitationId','decision']);
 if p_data->>'decision' not in('accept','reject') then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 return private.booking_command(p_actor_id,(p_data->>'decision')||'-invitation',p_data-'decision');
end;$fn$;
revoke all on function public.respond_booking_invitation(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.respond_booking_invitation(uuid,jsonb) to service_role;
create function private.booking_catalog(actor uuid,shop uuid) returns jsonb language plpgsql stable security definer set search_path='' as $fn$
declare result jsonb;
begin
 if actor is distinct from (select auth.uid()) then raise exception using errcode='42501',message='FORBIDDEN';end if;
 perform private.booking_actor(actor);
 select jsonb_build_object('barbershopId',b.id,'name',b.name,'publicationState',s.publication_state,'publicContact',s.public_contact,'address',s.address,'policies',jsonb_build_object('minimumNoticeMin',s.minimum_notice_min,'bookingHorizonDays',s.booking_horizon_days,'maxFuturePerClient',s.max_future_per_client,'slotStepMin',s.slot_step_min,'bufferMin',s.buffer_min,'cancellationAdvanceMin',s.cancellation_advance_min),
 'services',coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'barbershopId',shop,'name',v.name,'description',v.description,'price',jsonb_build_object('amountMinor',(v.price_amount*100)::bigint,'currency','PEN'),'durationMin',v.duration_min,'active',v.active) order by v.id) from public.services v where v.barbershop_id=shop and v.active),'[]'),
 'professionals',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'barbershopId',shop,'professionalName',p.professional_name,'active',p.active) order by p.id) from public.barber_profiles p join public.barbershop_memberships m on m.user_id=p.user_id and m.barbershop_id=shop and m.status='active' where p.barbershop_id=shop and p.active and exists(select 1 from public.barber_schedules h where h.barber_id=p.id and h.barbershop_id=shop)),'[]'),
 'capabilities',coalesce((select jsonb_agg(jsonb_build_object('barberId',c.barber_id,'serviceId',c.service_id) order by c.barber_id,c.service_id) from public.barber_services c join public.services v on v.id=c.service_id and v.barbershop_id=shop and v.active join public.barber_profiles p on p.id=c.barber_id and p.barbershop_id=shop and p.active join public.barbershop_memberships m on m.user_id=p.user_id and m.barbershop_id=shop and m.status='active' where c.barbershop_id=shop and c.active),'[]')) into result
 from public.barbershops b join public.barbershop_booking_settings s on s.barbershop_id=b.id where b.id=shop and s.publication_state in('published','paused');
 if result is null then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 return result;
end;$fn$;
create function public.get_booking_catalog(p_barbershop_id uuid) returns jsonb language sql stable security invoker set search_path='' as $fn$ select private.booking_catalog((select auth.uid()),p_barbershop_id);$fn$;
create function private.booking_list(actor uuid,cursor_id uuid,name_filter text) returns jsonb language plpgsql stable security definer set search_path='' as $fn$
begin
 if actor is distinct from (select auth.uid()) then raise exception using errcode='42501',message='FORBIDDEN';end if;
 perform private.booking_actor(actor);
 return coalesce((select jsonb_agg(q.item) from(select jsonb_build_object('barbershopId',b.id,'name',b.name,'publicationState',s.publication_state,'publicContact',s.public_contact,'address',s.address) item from public.barbershops b join public.barbershop_booking_settings s on s.barbershop_id=b.id where s.publication_state in('published','paused') and(cursor_id is null or b.id>cursor_id) and b.name ilike '%'||coalesce(name_filter,'')||'%' order by b.id limit 50)q),'[]');
end;$fn$;
create function public.list_booking_barbershops(p_cursor uuid default null,p_name text default '') returns jsonb language sql stable security invoker set search_path='' as $fn$ select private.booking_list((select auth.uid()),p_cursor,p_name);$fn$;
create function private.booking_invitations(actor uuid,shop uuid) returns jsonb language plpgsql stable security definer set search_path='' as $fn$
begin
 if actor is distinct from (select auth.uid()) then raise exception using errcode='42501',message='FORBIDDEN';end if;
 perform private.booking_actor(actor);
 if shop is not null and not exists(select 1 from public.barbershop_memberships where user_id=actor and barbershop_id=shop and role='administrator' and status='active') then raise exception using errcode='42501',message='FORBIDDEN';end if;
 return coalesce((select jsonb_agg(private.booking_invitation_json(i)||jsonb_build_object('barbershopName',b.name) order by i.created_at,i.id) from public.staff_invitations i join public.barbershops b on b.id=i.barbershop_id where(case when shop is null then i.recipient_user_id=actor else i.barbershop_id=shop end)),'[]');
end;$fn$;
create function public.list_own_staff_invitations() returns jsonb language sql stable security invoker set search_path='' as $fn$ select private.booking_invitations((select auth.uid()),null);$fn$;
create function public.list_shop_staff_invitations(p_barbershop_id uuid) returns jsonb language sql stable security invoker set search_path='' as $fn$ select private.booking_invitations((select auth.uid()),p_barbershop_id);$fn$;

revoke all on function private.booking_keys(jsonb,text[],text[]) from public,anon,authenticated,service_role;

revoke all on function private.booking_actor(uuid) from public,anon,authenticated,service_role;

revoke all on function private.booking_admin(uuid,uuid) from public,anon,authenticated,service_role;

revoke all on function private.booking_preserve_reservations(uuid) from public,anon,authenticated,service_role;

revoke all on function private.booking_invitation_json(public.staff_invitations) from public,anon,authenticated,service_role;

revoke all on function private.booking_command(uuid,text,jsonb) from public,anon,authenticated,service_role;

revoke all on function private.booking_catalog(uuid,uuid) from public,anon,authenticated,service_role;

revoke all on function private.booking_list(uuid,uuid,text) from public,anon,authenticated,service_role;

revoke all on function private.booking_invitations(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function private.booking_command(uuid,text,jsonb), private.booking_keys(jsonb,text[],text[]) to service_role;
grant execute on function private.booking_catalog(uuid,uuid) to authenticated;
grant execute on function private.booking_list(uuid,uuid,text) to authenticated;
grant execute on function private.booking_invitations(uuid,uuid) to authenticated;
revoke all on function public.get_booking_catalog(uuid) from public,anon,authenticated,service_role;
grant execute on function public.get_booking_catalog(uuid) to authenticated;
revoke all on function public.list_booking_barbershops(uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.list_booking_barbershops(uuid,text) to authenticated;
revoke all on function public.list_own_staff_invitations() from public,anon,authenticated,service_role;
grant execute on function public.list_own_staff_invitations() to authenticated;
revoke all on function public.list_shop_staff_invitations(uuid) from public,anon,authenticated,service_role;
grant execute on function public.list_shop_staff_invitations(uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
