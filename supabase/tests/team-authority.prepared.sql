-- PREPARED, NOT EXECUTED. Requires separate LOCAL migration + fixture authorization.
-- psql -X -v ON_ERROR_STOP=1 -v authority_fixture_authorized=true -f this-file
-- Operator must first verify the target is app-barberia-002-local:54422.
-- Seven NEW synthetic confirmed users/profiles, three shops, synthetic memberships/
-- invitations/professional, one service, two reservations/items/care rows, no
-- passwords, sessions or emails. These IDs are all new and roll back.
-- All effects roll back. Never include this file in an unattended generic test run.
\set ON_ERROR_STOP on
\if :{?authority_fixture_authorized}
\if :authority_fixture_authorized
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
create temporary table authority_baseline as select
 (select count(*) from auth.users) users,
 (select count(*) from public.profiles) profiles,
 (select count(*) from public.reservations) reservations;
select users as baseline_users,profiles as baseline_profiles,reservations as baseline_reservations from authority_baseline \gset
create function pg_temp.require(ok boolean,label text) returns void language plpgsql as $test$
begin if ok is distinct from true then raise exception 'AUTHORITY_TEST_FAILED: %',label;end if;end;$test$;
create function pg_temp.denied(q text,expected text,label text) returns void language plpgsql as $test$
begin
 begin execute q;exception when others then
  if sqlstate=expected then return;end if;
  raise exception 'AUTHORITY_TEST_WRONG_SQLSTATE: % (% instead of %)',label,sqlstate,expected;
 end;
 raise exception 'AUTHORITY_TEST_UNEXPECTED_SUCCESS: %',label;
end;$test$;
select pg_temp.require(to_regprocedure('public.team_authority_command(uuid,text,jsonb)') is not null,'migration prerequisite');
create temporary table authority_ids as select gen_random_uuid() owner_a,gen_random_uuid() secondary1,
 gen_random_uuid() secondary2,gen_random_uuid() secondary3,gen_random_uuid() owner_b,
 gen_random_uuid() worker,gen_random_uuid() client;
create temporary table authority_users as select unnest(array[owner_a,secondary1,secondary2,secondary3,owner_b,worker,client]) id from authority_ids;
insert into auth.users(id,email,is_anonymous,email_confirmed_at)
 select id,'authority-'||id::text||'@example.invalid',false,now() from authority_users;
insert into public.profiles(id,display_name) select id,'Authority synthetic fixture' from authority_users;
create temporary table authority_shops as select
 (public.create_own_barbershop(owner_a,'Authority synthetic A')->'barbershop'->>'id')::uuid a,
 (public.create_own_barbershop(owner_b,'Authority synthetic B')->'barbershop'->>'id')::uuid b,
 gen_random_uuid() legacy from authority_ids;
set constraints all immediate;
set constraints all deferred;
select pg_temp.require((select count(*)=2 from private.barbershop_ownership where barbershop_id in(a,b)),'atomic owner provisioning') from authority_shops;
select pg_temp.require(private.authority_owner(owner_a,a),'creator is owner') from authority_ids,authority_shops;
select pg_temp.denied(format('insert into private.barbershop_ownership(barbershop_id,owner_user_id,source) values(%L,%L,%L)',a,owner_b,'new-shop'),'23505','one owner') from authority_ids,authority_shops;
-- No partial shop if an ownership/event step fails: injected only inside rollback.
create function pg_temp.reject_authority_event() returns trigger language plpgsql as $test$begin raise exception 'SYNTHETIC_EVENT_FAILURE';end;$test$;
create trigger authority_fixture_failure before insert on private.team_authority_events for each row execute function pg_temp.reject_authority_event();
select pg_temp.denied(format('select public.create_own_barbershop(%L,%L)',owner_a,'Authority MUST rollback'),'P0001','creation rolls back all steps') from authority_ids;
drop trigger authority_fixture_failure on private.team_authority_events;
select pg_temp.require(not exists(select 1 from public.barbershops where name='Authority MUST rollback'),'no partial shop');
-- Three pending invitations DO NOT reserve the two available seats.
create temporary table authority_invites as select
 (public.admin_invitation_create(owner_a,jsonb_build_object('requestId',gen_random_uuid(),'barbershopId',a,'email','authority-'||secondary1||'@example.invalid'))->>'id')::uuid i1,
 (public.admin_invitation_create(owner_a,jsonb_build_object('requestId',gen_random_uuid(),'barbershopId',a,'email','authority-'||secondary2||'@example.invalid'))->>'id')::uuid i2,
 (public.admin_invitation_create(owner_a,jsonb_build_object('requestId',gen_random_uuid(),'barbershopId',a,'email','authority-'||secondary3||'@example.invalid'))->>'id')::uuid i3 from authority_ids,authority_shops;
select public.respond_booking_invitation(secondary1,jsonb_build_object('invitationId',i1,'decision','accept')) from authority_ids,authority_invites;
select public.respond_booking_invitation(secondary1,jsonb_build_object('invitationId',i1,'decision','accept')) from authority_ids,authority_invites;
-- Promote an existing worker in place; the professional row must remain unchanged.
insert into public.barbershop_memberships(user_id,barbershop_id,role,status) select secondary2,a,'barber','active' from authority_ids,authority_shops;
insert into public.barber_profiles(user_id,barbershop_id,professional_name,active) select secondary2,a,'Authority professional',true from authority_ids,authority_shops;
create temporary table authority_prof_before as select to_jsonb(p) payload from public.barber_profiles p where p.user_id=(select secondary2 from authority_ids) and p.barbershop_id=(select a from authority_shops);
select public.respond_booking_invitation(secondary2,jsonb_build_object('invitationId',i2,'decision','accept')) from authority_ids,authority_invites;
-- Two synthetic future bookings, created directly as isolated test fixtures only.
create temporary table authority_service as
 with inserted as(insert into public.services(barbershop_id,name,description,price_amount,duration_min,active) select a,'Authority cut','Synthetic',25,30,true from authority_shops returning id) select id from inserted;
create temporary table authority_bookings as select gen_random_uuid() id,days,
 clock_timestamp()+make_interval(days=>days) starts_at from generate_series(2,3) days;
insert into public.reservations(id,barbershop_id,client_user_id,barber_id,barber_user_id,request_id,fingerprint,starts_at,ends_at,occupied_until,duration_min,buffer_min,total_amount,shop_name_snapshot,barber_name_snapshot,client_display_name_snapshot,policy_snapshot)
 select r.id,a,client,p.id,secondary2,gen_random_uuid(),repeat('0',64),r.starts_at,r.starts_at+interval '30 minutes',r.starts_at+interval '30 minutes',30,0,25,'Authority A','Authority professional','Authority client','{"cancellationAdvanceMin":120}'::jsonb
 from authority_ids,authority_shops,authority_bookings r,public.barber_profiles p where p.user_id=secondary2 and p.barbershop_id=a;
insert into public.reservation_items(reservation_id,barbershop_id,service_id,name_snapshot,description_snapshot,price_snapshot,duration_min)
 select r.id,a,s.id,'Authority cut','Synthetic',25,30 from authority_bookings r,authority_shops,authority_service s;
insert into private.booking_care(reservation_id,barbershop_id,no_show_tolerance_min,method,amount_minor)
 select r.id,a,10,'cash',2500 from authority_bookings r,authority_shops;
select public.care_booking(secondary1,jsonb_build_object('command','receive','reservationId',id,'requestId',gen_random_uuid(),'attested',true)) from authority_ids,authority_bookings where days=3;
select public.cancel_booking(secondary1,jsonb_build_object('reservationId',id,'requestId',gen_random_uuid(),'reason','Synthetic authorized cancellation')) from authority_ids,authority_bookings where days=3;
select pg_temp.denied(format('select public.care_booking(%L,%L)',secondary1,jsonb_build_object('command','refund','reservationId',id,'requestId',gen_random_uuid(),'attested',true,'reason','Synthetic')),'42501','secondary cannot refund') from authority_ids,authority_bookings where days=3;
select public.care_booking(owner_a,jsonb_build_object('command','refund','reservationId',id,'requestId',gen_random_uuid(),'attested',true,'reason','Synthetic authorized refund')) from authority_ids,authority_bookings where days=3;
select pg_temp.denied(format('select public.care_booking(%L,%L)',owner_a,jsonb_build_object('command','start','reservationId',id,'requestId',gen_random_uuid())),'42501','owner without assignment cannot attend') from authority_ids,authority_bookings where days=2;
create temporary table authority_booking_before as select to_jsonb(r) payload from public.reservations r join authority_bookings x on x.id=r.id;
create temporary table authority_care_before as select to_jsonb(c) payload from private.booking_care c join authority_bookings x on x.id=c.reservation_id;
select pg_temp.require((select count(*)=2 from public.barbershop_memberships where barbershop_id=a and role='administrator' and status='active' and user_id<>owner_a),'two secondaries') from authority_ids,authority_shops;
select pg_temp.denied(format('select public.respond_booking_invitation(%L,%L)',secondary3,jsonb_build_object('invitationId',i3,'decision','accept')),'23505','third secondary and old public wrapper denied') from authority_ids,authority_invites;
select pg_temp.denied(format('select private.booking_command(%L,%L,%L)',secondary3,'accept-invitation',jsonb_build_object('invitationId',i3)),'23505','old private barber path cannot grant administration') from authority_ids,authority_invites;
-- Synthetic old accepted invitation without stamp, at full quota. A replay is a read.
delete from private.authority_invitation_stamp where invitation_id=(select i1 from authority_invites);
update public.staff_invitations set created_at=created_at-interval '8 days',responded_at=responded_at-interval '8 days' where id=(select i1 from authority_invites);
update private.admin_invitation_mail set expires_at=expires_at-interval '8 days' where invitation_id=(select i1 from authority_invites);
create temporary table authority_replay_before as select
 (select jsonb_agg(to_jsonb(m) order by m.id) from public.barbershop_memberships m where m.barbershop_id=a) members,
 (select to_jsonb(o) from private.barbershop_ownership o where o.barbershop_id=a) owner,
 (select count(*) from private.team_authority_events) events from authority_shops;
select pg_temp.require((public.respond_booking_invitation(secondary1,jsonb_build_object('invitationId',i1,'decision','accept'))->>'status')='accepted','historical accepted replay after expiry, without quota allocation') from authority_ids,authority_invites;
select pg_temp.denied(format('select public.respond_booking_invitation(%L,%L)',client,jsonb_build_object('invitationId',i1,'decision','accept')),'P0002','other recipient cannot read an accepted response') from authority_ids,authority_invites;
select pg_temp.require((select jsonb_agg(to_jsonb(m) order by m.id) from public.barbershop_memberships m where m.barbershop_id=a)=(select members from authority_replay_before) and (select to_jsonb(o) from private.barbershop_ownership o where o.barbershop_id=a)=(select owner from authority_replay_before) and (select count(*) from private.team_authority_events)=(select events from authority_replay_before),'historical replay preserves membership, owner and audit') from authority_shops;
select pg_temp.denied(format('select public.admin_invitation_create(%L,%L)',secondary1,jsonb_build_object('requestId',gen_random_uuid(),'barbershopId',a,'email','authority-'||client||'@example.invalid')),'42501','secondary cannot invite administrators') from authority_ids,authority_shops;
select pg_temp.denied(format('select public.invite_booking_staff(%L,%L)',secondary1,jsonb_build_object('barbershopId',a,'email','authority-'||worker||'@example.invalid')),'42501','secondary cannot invite workers') from authority_ids,authority_shops;
select pg_temp.denied(format('select public.set_booking_publication(%L,%L)',secondary1,jsonb_build_object('barbershopId',a,'state','paused')),'42501','secondary cannot publish') from authority_ids,authority_shops;
-- Retirement is explicit, replayable and preserves professional work.
create temporary table authority_retire as select jsonb_build_object('barbershopId',a,'requestId',gen_random_uuid(),'expectedVersion',1,'memberUserId',secondary2,'disposition','barber','reason','Synthetic keep professional work') payload from authority_ids,authority_shops;
select pg_temp.denied(format('select public.team_authority_command(%L,%L,%L)',owner_a,'remove-secondary',payload||jsonb_build_object('requestId',gen_random_uuid(),'disposition','inactive')),'23505','future bookings block membership deactivation') from authority_ids,authority_retire;
select public.team_authority_command(owner_a,'remove-secondary',payload) from authority_ids,authority_retire;
select public.team_authority_command(owner_a,'remove-secondary',payload) from authority_ids,authority_retire;
select pg_temp.require((select to_jsonb(p) from public.barber_profiles p where p.user_id=secondary2 and p.barbershop_id=a)=(select payload from authority_prof_before),'retirement preserves professional row') from authority_ids,authority_shops;
select pg_temp.require((select role='barber' and status='active' from public.barbershop_memberships where user_id=secondary2 and barbershop_id=a),'retirement keeps worker active') from authority_ids,authority_shops;
select pg_temp.denied(format('select public.respond_booking_invitation(%L,%L)',secondary2,jsonb_build_object('invitationId',i2,'decision','accept')),'42501','accepted replay cannot restore retired administration') from authority_ids,authority_invites;
-- A historical issuer who now lacks authority does not rewrite the accepted fact.
update public.staff_invitations set inviter_user_id=(select secondary2 from authority_ids) where id=(select i1 from authority_invites);
select pg_temp.require((public.respond_booking_invitation(secondary1,jsonb_build_object('invitationId',i1,'decision','accept'))->>'status')='accepted','historical issuer no longer authorized; result only, no new grant') from authority_ids,authority_invites;
select pg_temp.require(not exists((select payload from authority_booking_before except select to_jsonb(r) from public.reservations r join authority_bookings x on x.id=r.id) union all (select payload from authority_care_before except select to_jsonb(c) from private.booking_care c join authority_bookings x on x.id=c.reservation_id)),'retirement preserves booking and payment rows');
select pg_temp.denied(format('select public.team_authority_command(%L,%L,%L)',owner_a,'remove-secondary',payload||jsonb_build_object('reason','different')),'23505','idempotency rejects different content') from authority_ids,authority_retire;
select pg_temp.denied(format('select public.team_authority_command(%L,%L,%L)',owner_a,'remove-secondary',payload||jsonb_build_object('requestId',gen_random_uuid(),'memberUserId',owner_a)),'42501','owner cannot be removed') from authority_ids,authority_retire;
-- Expiration is evaluated on server time, touching only this new fixture invitation.
update private.admin_invitation_mail set expires_at=clock_timestamp()-interval '1 second' where invitation_id=(select i3 from authority_invites);
select pg_temp.denied(format('select public.respond_booking_invitation(%L,%L)',secondary3,jsonb_build_object('invitationId',i3,'decision','accept')),'23505','expired invitation') from authority_ids,authority_invites;
update public.staff_invitations set status='cancelled',responded_at=clock_timestamp() where id=(select i3 from authority_invites);
select pg_temp.denied(format('select public.respond_booking_invitation(%L,%L)',secondary3,jsonb_build_object('invitationId',i3,'decision','accept')),'23505','cancelled invitation cannot be reused') from authority_ids,authority_invites;
-- Reuse only this synthetic fixture to simulate an old pending invitation from a former admin.
update public.staff_invitations set status='pending',responded_at=null,inviter_user_id=(select secondary2 from authority_ids) where id=(select i3 from authority_invites);
update private.admin_invitation_mail set expires_at=clock_timestamp()+interval '1 day' where invitation_id=(select i3 from authority_invites);
select pg_temp.denied(format('select public.respond_booking_invitation(%L,%L)',secondary3,jsonb_build_object('invitationId',i3,'decision','accept')),'42501','pending invitation from former admin cannot grant privileges') from authority_ids,authority_invites;
-- Owner A can independently work as a barber in B, without acquiring authority in B.
insert into public.barbershop_memberships(user_id,barbershop_id,role,status) select owner_a,b,'barber','active' from authority_ids,authority_shops;
select pg_temp.require((public.team_authority_command(owner_a,'read-team-authority',jsonb_build_object('barbershopId',b))->>'capacity')='barber','owner A is only barber B') from authority_ids,authority_shops;
select pg_temp.denied(format('select private.authority_assert(%L,%L,%L)',owner_a,b,'team'),'42501','tenant isolation') from authority_ids,authority_shops;
-- Transfer stays pending: no final ownership switch is implemented or allowed.
create temporary table authority_transfer as select public.team_authority_command(owner_a,'initiate-ownership-transfer',jsonb_build_object('barbershopId',a,'requestId',gen_random_uuid(),'expectedVersion',1,'recipientUserId',secondary1)) payload from authority_ids,authority_shops;
select pg_temp.denied(format('select public.team_authority_command(%L,%L,%L)',secondary1,'accept-ownership-transfer',jsonb_build_object('barbershopId',a,'requestId',gen_random_uuid(),'expectedVersion',1,'transferId',(payload->>'transferId')::uuid)),'23505','final acceptance blocked') from authority_ids,authority_shops,authority_transfer;
select public.team_authority_command(secondary1,'reject-ownership-transfer',jsonb_build_object('barbershopId',a,'requestId',gen_random_uuid(),'expectedVersion',1,'transferId',(payload->>'transferId')::uuid)) from authority_ids,authority_shops,authority_transfer;
select pg_temp.require(private.authority_owner(owner_a,a),'transfer leaves owner unchanged') from authority_ids,authority_shops;
-- Legacy rows are not inferred or rewritten, even when one admin appears obvious.
insert into public.barbershops(id,name) select legacy,'Authority synthetic legacy' from authority_shops;
insert into public.barbershop_memberships(user_id,barbershop_id,role,status) select worker,legacy,'administrator','active' from authority_ids,authority_shops;
select pg_temp.require((public.team_authority_command(worker,'read-team-authority',jsonb_build_object('barbershopId',legacy))->>'capacity')='unregularized','no inferred historical owner') from authority_ids,authority_shops;
select pg_temp.denied(format('select private.authority_assert(%L,%L,%L)',worker,legacy,'services'),'42501','unregularized administration blocked') from authority_ids,authority_shops;
-- Explicit operator-only regularization of this synthetic legacy, with exact snapshot.
select private.regularize_barbershop_ownership(legacy,worker,(select jsonb_agg(jsonb_build_object('userId',user_id,'role',role,'status',status) order by user_id) from public.barbershop_memberships where barbershop_id=legacy),'Synthetic reviewed regularization') from authority_ids,authority_shops;
set constraints all immediate;
select pg_temp.require(not has_function_privilege('authenticated','public.team_authority_command(uuid,text,jsonb)','execute'),'ordinary RPC closed');
select pg_temp.require(not has_function_privilege('service_role','private.regularize_barbershop_ownership(uuid,uuid,jsonb,text)','execute'),'regularization not exposed to service');
select pg_temp.require(not has_function_privilege('service_role','public.confirm_booking(uuid,jsonb)','execute'),'old payment-free confirmer closed');
-- RLS: a secondary sees only their own membership, not team roster.
grant select on authority_shops to authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',secondary1,'role','authenticated')::text,true) from authority_ids;
set local role authenticated;
select pg_temp.require((select count(*) from public.barbershop_memberships where barbershop_id=(select a from authority_shops))=1,'secondary cannot read team roster');
select pg_temp.denied('select * from private.barbershop_ownership','42501','private ownership inaccessible');
reset role;
select pg_temp.require((select count(*) from public.reservations)=(select reservations+2 from authority_baseline),'only two synthetic reservations');
select 'Prepared sequential authority assertions completed; transaction rolls back' as result;
rollback;
select 1/case when (select count(*) from auth.users)=:baseline_users and (select count(*) from public.profiles)=:baseline_profiles and (select count(*) from public.reservations)=:baseline_reservations then 1 else 0 end as baseline_restored;
\else
\echo 'Not authorized: no SQL executed.'
\endif
\else
\echo 'Fixture authorization flag absent: no SQL executed.'
\endif
