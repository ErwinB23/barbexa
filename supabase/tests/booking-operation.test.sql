begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions,pg_catalog;
select no_plan();
select has_function('public','configure_booking_shop',array['uuid','jsonb'],'configure RPC exists');
select has_function('public','respond_booking_invitation',array['uuid','jsonb'],'response RPC exists');
select (to_regprocedure('public.configure_booking_shop(uuid,jsonb)') is not null) as ready \gset
\if :ready
create temporary table op_ids as select gen_random_uuid() a,gen_random_uuid() b,gen_random_uuid() shared,gen_random_uuid() admin_b,gen_random_uuid() recipient,gen_random_uuid() inactive;
insert into auth.users(id,email,is_anonymous,email_confirmed_at) select shared,'sql004-shared@example.invalid',false,now() from op_ids union all select admin_b,'sql004-admin@example.invalid',false,now() from op_ids union all select recipient,'sql004-recipient@example.invalid',false,now() from op_ids union all select inactive,'sql004-inactive@example.invalid',false,now() from op_ids;
insert into profiles(id,display_name) select shared,'Operation fixture' from op_ids union all select admin_b,'Operation fixture' from op_ids union all select recipient,'Operation fixture' from op_ids union all select inactive,'Operation fixture' from op_ids;
insert into barbershops(id,name) select a,'Operation A' from op_ids union all select b,'Operation B' from op_ids;
insert into barbershop_memberships(user_id,barbershop_id,role,status) select shared,a,'administrator','active' from op_ids union all select shared,b,'barber','active' from op_ids union all select admin_b,b,'administrator','active' from op_ids union all select inactive,a,'barber','inactive' from op_ids;
create function pg_temp.attempt(q text,want text,label text) returns text language plpgsql security invoker as $fn$
begin execute q;return extensions.is('00000',want,label);exception when others then return extensions.is(sqlstate,want,label);end;$fn$;
select pg_temp.attempt(format('select public.configure_booking_shop(%L,%L)',shared,jsonb_build_object('barbershopId',b,'publicContact','Test','address','Local','policies',jsonb_build_object('minimumNoticeMin',0,'bookingHorizonDays',30,'maxFuturePerClient',5,'slotStepMin',15,'bufferMin',0,'cancellationAdvanceMin',120))),'42501','admin A cannot configure B as barber') from op_ids;
select public.configure_booking_shop(shared,jsonb_build_object('barbershopId',a,'publicContact','Test','address','Local','policies',jsonb_build_object('minimumNoticeMin',0,'bookingHorizonDays',30,'maxFuturePerClient',5,'slotStepMin',15,'bufferMin',0,'cancellationAdvanceMin',120))) from op_ids;
select pg_temp.attempt(format('select public.set_booking_publication(%L,%L)',shared,jsonb_build_object('barbershopId',a,'state','published')),'23514','publication requires operational offering') from op_ids;
create temporary table op_resources as select
 (public.upsert_booking_service(shared,jsonb_build_object('barbershopId',a,'name','Cut','description','Local','price',jsonb_build_object('amountMinor',2550,'currency','PEN'),'durationMin',30,'active',true))->>'id')::uuid service_id,
 (public.set_booking_professional(shared,jsonb_build_object('barbershopId',a,'userId',shared,'professionalName','Admin attends','active',true))->>'id')::uuid barber_id from op_ids;
select public.set_booking_capabilities(shared,jsonb_build_object('barbershopId',a,'barberId',barber_id,'serviceIds',jsonb_build_array(service_id))) from op_ids,op_resources;
select public.set_booking_hours(shared,jsonb_build_object('barbershopId',a,'hours',jsonb_build_array(jsonb_build_object('weekday',1,'opensMin',540,'closesMin',1080)))) from op_ids;
select public.set_booking_hours(shared,jsonb_build_object('barbershopId',a,'barberId',barber_id,'hours',jsonb_build_array(jsonb_build_object('weekday',1,'opensMin',540,'closesMin',1080)))) from op_ids,op_resources;
select public.set_booking_publication(shared,jsonb_build_object('barbershopId',a,'state','published')) from op_ids;
select pg_temp.attempt(format('select public.configure_booking_shop(%L,%L)',admin_b,jsonb_build_object('barbershopId',a,'publicContact','Test','address','Local','policies',jsonb_build_object('minimumNoticeMin',0,'bookingHorizonDays',30,'maxFuturePerClient',5,'slotStepMin',15,'bufferMin',0,'cancellationAdvanceMin',120))),'42501','admin B cannot configure A') from op_ids;
select is((select role from barbershop_memberships where barbershop_id=(select a from op_ids) and user_id=(select shared from op_ids)),'administrator','admin professional preserves contextual role');
select ok((select active from barber_profiles where id=(select barber_id from op_resources)),'admin professional explicit and active');
create temporary table op_invite as select (public.invite_booking_staff(shared,jsonb_build_object('barbershopId',a,'email','sql004-recipient@example.invalid'))->>'id')::uuid id from op_ids;
select is((select count(*)::int from barbershop_memberships where user_id=(select recipient from op_ids)),0,'pending grants no membership');
select pg_temp.attempt(format('select public.invite_booking_staff(%L,%L)',shared,jsonb_build_object('barbershopId',a,'email','sql004-recipient@example.invalid')),'23505','duplicate pending denied') from op_ids;
select pg_temp.attempt(format('select public.respond_booking_invitation(%L,%L)',admin_b,jsonb_build_object('invitationId',id,'decision','accept')),'P0002','wrong recipient denied') from op_ids,op_invite;
select public.respond_booking_invitation(recipient,jsonb_build_object('invitationId',id,'decision','accept')) from op_ids,op_invite;
select is((select count(*)::int from barbershop_memberships where user_id=(select recipient from op_ids) and status='active' and role='barber'),1,'accept creates single active barber membership');
select pg_temp.attempt(format('select public.respond_booking_invitation(%L,%L)',recipient,jsonb_build_object('invitationId',id,'decision','accept')),'23505','repeat acceptance cannot duplicate') from op_ids,op_invite;
create temporary table op_reject as select (public.invite_booking_staff(shared,jsonb_build_object('barbershopId',a,'email','sql004-inactive@example.invalid'))->>'id')::uuid id from op_ids;
select public.respond_booking_invitation(inactive,jsonb_build_object('invitationId',id,'decision','reject')) from op_ids,op_reject;
select is((select status from barbershop_memberships where user_id=(select inactive from op_ids)),'inactive','rejection grants no access');
select lives_ok(format('select public.invite_booking_staff(%L,%L)',shared,jsonb_build_object('barbershopId',a,'email','sql004-inactive@example.invalid')),'new invitation after rejection') from op_ids;
create temporary table op_conflict as select (public.invite_booking_staff(shared,jsonb_build_object('barbershopId',a,'email','sql004-shared@example.invalid'))->>'id')::uuid id from op_ids;
select pg_temp.attempt(format('select public.respond_booking_invitation(%L,%L)',shared,jsonb_build_object('invitationId',id,'decision','accept')),'23505','acceptance does not downgrade an active administrator') from op_ids,op_conflict;
select ok(not has_function_privilege('authenticated','public.upsert_booking_service(uuid,jsonb)','EXECUTE'),'ordinary RPC write denied');
select public.set_booking_professional(shared,jsonb_build_object('barbershopId',a,'userId',recipient,'professionalName','No schedule','active',true)) from op_ids;
select public.set_booking_capabilities(shared,jsonb_build_object('barbershopId',a,'barberId',(select id from public.barber_profiles where user_id=recipient and barbershop_id=a),'serviceIds',jsonb_build_array(service_id))) from op_ids,op_resources;
grant select on op_ids to authenticated;
select set_config('request.jwt.claims',json_build_object('sub',(select admin_b from op_ids),'role','authenticated')::text,true);
set local role authenticated;
select ok((public.get_booking_catalog((select a from op_ids))->'professionals'->0->>'professionalName')='Admin attends','authenticated non member sees published commercial projection');
select is(jsonb_array_length(public.get_booking_catalog((select a from op_ids))->'capabilities'),1,'catalog hides capabilities of unavailable professionals');
select ok(not ((public.get_booking_catalog((select a from op_ids))->'professionals'->0) ? 'userId'),'catalog has no auth identity');
select pg_temp.attempt(format('select private.booking_invitations(%L,%L)',shared,a),'42501','private read helper cannot impersonate another actor') from op_ids;
reset role;
-- Forward guard fixture only, rolled back with this test: NOT the T015 reservation schema.
select (to_regclass('public.reservations') is null) as forward_contract \gset
\if :forward_contract
create table public.reservations(id uuid,barbershop_id uuid,barber_id uuid,starts_at timestamptz,ends_at timestamptz,occupied_until timestamptz,state text);
insert into public.reservations select gen_random_uuid(),a,barber_id,'2030-01-07T15:00:00Z','2030-01-07T15:30:00Z','2030-01-07T15:30:00Z','confirmed' from op_ids,op_resources;
select lives_ok(format('select private.booking_preserve_reservations(%L)',a),'forward valid reservation has no false conflict') from op_ids;
select pg_temp.attempt(format('select public.set_booking_professional(%L,%L)',shared,jsonb_build_object('barbershopId',a,'id',barber_id,'userId',shared,'professionalName','Admin attends','active',false)),'23505','committed reservation prevents disabling professional') from op_ids,op_resources;
select ok((select active from barber_profiles where id=(select barber_id from op_resources)),'conflicting mutation rolls back');
\else
select diag('Forward contract fixture omitted when real reservation schema exists; actual cases belong to T015/T016.');
\endif
\else
select fail('operations not implemented');
\endif
select * from finish();
rollback;
