-- Prepared014. Execute only in a separately authorized isolated rehearsal DB.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions,pg_catalog;
select no_plan();
create temporary table sd_ids as select gen_random_uuid() shop_a,gen_random_uuid() shop_b,gen_random_uuid() professional,gen_random_uuid() client,gen_random_uuid() barber_a,gen_random_uuid() barber_b;
insert into auth.users(id,email,is_anonymous,email_confirmed_at)
 select professional,'sd014-professional@example.invalid',false,now() from sd_ids union all select client,'sd014-client@example.invalid',false,now() from sd_ids;
insert into profiles(id,display_name) select professional,'Professional fixture' from sd_ids union all select client,'Client fixture' from sd_ids;
insert into barbershops(id,name) select shop_a,'Commercial A' from sd_ids union all select shop_b,'Commercial B' from sd_ids;
insert into barbershop_booking_settings(barbershop_id,publication_state,public_contact,address,minimum_notice_min,booking_horizon_days,max_future_per_client,slot_step_min,buffer_min)
 select shop_a,'published','984702275','Address A',0,30,5,15,0 from sd_ids union all select shop_b,'published','987654321','Address B',0,30,5,15,0 from sd_ids;
insert into barbershop_memberships(user_id,barbershop_id,role,status) select professional,shop_a,'barber','active' from sd_ids union all select professional,shop_b,'barber','active' from sd_ids;
insert into barber_profiles(id,user_id,barbershop_id,professional_name,professional_description,active) select barber_a,professional,shop_a,'Professional A','Description A',true from sd_ids union all select barber_b,professional,shop_b,'Professional B','Description B',true from sd_ids;
insert into barbershop_hours(barbershop_id,weekday,opens_min,closes_min) select shop_a,1,510,780 from sd_ids union all select shop_a,1,855,1320 from sd_ids union all select shop_b,1,600,1000 from sd_ids;
insert into barber_schedules(barbershop_id,barber_id,weekday,opens_min,closes_min) select shop_a,barber_a,1,510,780 from sd_ids union all select shop_b,barber_b,1,600,1000 from sd_ids;
insert into schedule_exceptions(barbershop_id,barber_id,starts_at,ends_at,reason) select shop_a,null::uuid,now()+interval '1 day',now()+interval '2 days','PRIVATE A' from sd_ids union all select shop_b,null::uuid,now()+interval '3 days',now()+interval '4 days','PRIVATE B' from sd_ids union all select shop_a,barber_a,now()+interval '5 days',now()+interval '6 days','PRIVATE PERSONAL' from sd_ids;
select set_config('request.jwt.claim.sub',(select client::text from sd_ids),true);
select set_config('request.jwt.claims',jsonb_build_object('sub',(select client from sd_ids),'role','authenticated')::text,true);
grant select on sd_ids to authenticated;
set local role authenticated;
create temporary table sd_catalog as select public.get_booking_catalog((select shop_a from sd_ids)) data;
reset role;
select is(data->>'name','Commercial A','selected shop only') from sd_catalog;
select is(jsonb_array_length(data->'shopHours'),2,'both split shift intervals included') from sd_catalog;
select is(data->'shopHours'->0->>'opensMin','510','hours ordered by real start') from sd_catalog;
select is(data->'shopHours'->1->>'opensMin','855','afternoon interval not lost') from sd_catalog;
select is(data->'professionals'->0->>'description','Description A','public professional description from real profile') from sd_catalog;
select ok(position('Description B' in data::text)=0,'other shop profile not leaked') from sd_catalog;
select is(jsonb_array_length(data->'shopClosures'),1,'only global active closures of selected shop') from sd_catalog;
select ok(position('PRIVATE' in data::text)=0,'private closure reasons never exposed') from sd_catalog;
select ok(position('userId' in data::text)=0,'private actor identity never exposed') from sd_catalog;
select ok(not has_function_privilege('anon','public.get_booking_catalog(uuid)','execute'),'anonymous access unchanged');
update barbershop_booking_settings set publication_state='draft' where barbershop_id=(select shop_a from sd_ids);
select throws_ok(format('select public.get_booking_catalog(%L)',(select shop_a from sd_ids)),'P0002','NOT_AVAILABLE','draft catalog unavailable');
select throws_ok(format('select private.booking_catalog(%L,%L)',(select professional from sd_ids),(select shop_b from sd_ids)),'42501','FORBIDDEN','forged actor denied');
select * from finish();
rollback;
