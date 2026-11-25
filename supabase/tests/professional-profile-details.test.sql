-- Prepared, not executed: run only in an explicitly authorized rehearsal DB.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions,pg_catalog;
select no_plan();
select has_function('public','get_own_professional_profile_details',array['uuid','jsonb'],'own profile read RPC exists');
select has_function('public','update_own_professional_profile_details',array['uuid','jsonb'],'own profile update RPC exists');
create temporary table pp_ids as select gen_random_uuid() actor,gen_random_uuid() other_actor,gen_random_uuid() shop_a,gen_random_uuid() shop_b;
insert into auth.users(id,email,is_anonymous,email_confirmed_at)
 select actor,'pp013-own@example.invalid',false,now() from pp_ids union all
 select other_actor,'pp013-other@example.invalid',false,now() from pp_ids;
insert into profiles(id,display_name) select actor,'Profile fixture' from pp_ids union all select other_actor,'Other fixture' from pp_ids;
insert into barbershops(id,name) select shop_a,'Profile A' from pp_ids union all select shop_b,'Profile B' from pp_ids;
insert into barbershop_booking_settings(barbershop_id) select shop_a from pp_ids union all select shop_b from pp_ids;
insert into barbershop_memberships(user_id,barbershop_id,role,status,joined_at)
 select actor,shop_a,'barber','active',null from pp_ids union all
 select actor,shop_b,'barber','active','2026-11-23T12:00:00Z'::timestamptz from pp_ids union all
 select other_actor,shop_a,'administrator','active',now() from pp_ids;
insert into barber_profiles(barbershop_id,user_id,professional_name,active)
 select shop_a,actor,'Original A',true from pp_ids union all select shop_b,actor,'Original B',true from pp_ids;
create function pg_temp.pp_attempt(q text,want text,label text) returns text language plpgsql as $fn$
begin execute q;return extensions.is('00000',want,label);exception when others then return extensions.is(sqlstate,want,label);end;$fn$;
create temporary table pp_draft as select jsonb_build_object('professionalName','Saved A','description',repeat('🙂',250),'instagram','@real','tiktok','https://www.tiktok.com/@real','facebook',null) body;
select is(public.update_own_professional_profile_details(actor,jsonb_build_object('barbershopId',shop_a,'profile',body))->>'professionalName','Saved A','atomic own save') from pp_ids,pp_draft;
select is(public.get_own_professional_profile_details(actor,jsonb_build_object('barbershopId',shop_a))->>'description',repeat('🙂',250),'description persists on independent read') from pp_ids;
select is(public.get_own_professional_profile_details(actor,jsonb_build_object('barbershopId',shop_a))->>'instagram','@real','social persists') from pp_ids;
select is(public.get_own_professional_profile_details(actor,jsonb_build_object('barbershopId',shop_a))->>'memberSince',null,'no invented historical date') from pp_ids;
select is(public.get_own_professional_profile_details(actor,jsonb_build_object('barbershopId',shop_b))->>'memberSince','2026-11-23T12:00:00.000Z','real membership timestamp returned') from pp_ids;
select is((select professional_name from barber_profiles where barbershop_id=shop_b),'Original B','same actor other tenant unchanged') from pp_ids;
select pg_temp.pp_attempt(format('select public.update_own_professional_profile_details(%L,%L)',actor,jsonb_build_object('barbershopId',shop_a,'userId',other_actor,'profile',body)),'22023','forged identity denied') from pp_ids,pp_draft;
select pg_temp.pp_attempt(format('select public.update_own_professional_profile_details(%L,%L)',actor,jsonb_build_object('barbershopId',shop_a,'profile',body||jsonb_build_object('description',repeat('x',251),'professionalName','Must not persist'))),'22023','251 characters rejected atomically') from pp_ids,pp_draft;
select pg_temp.pp_attempt(format('select public.update_own_professional_profile_details(%L,%L)',actor,jsonb_build_object('barbershopId',shop_a,'profile',body||jsonb_build_object('instagram','https://instagram.com.evil.invalid/x'))),'22023','foreign social host rejected') from pp_ids,pp_draft;
select is((select professional_name from barber_profiles where barbershop_id=shop_a),'Saved A','failed updates preserve all prior values') from pp_ids;
select pg_temp.pp_attempt(format('select public.get_own_professional_profile_details(%L,%L)',other_actor,jsonb_build_object('barbershopId',shop_a)),'P0002','admin without own professional cannot edit another') from pp_ids;
select public.update_own_booking_professional(actor,jsonb_build_object('barbershopId',shop_a,'professionalName','Legacy renamed')) from pp_ids;
select is(public.get_own_professional_profile_details(actor,jsonb_build_object('barbershopId',shop_a))->>'description',repeat('🙂',250),'legacy name update preserves new fields') from pp_ids;
update barbershop_memberships set status='inactive' where user_id=(select actor from pp_ids) and barbershop_id=(select shop_a from pp_ids);
select pg_temp.pp_attempt(format('select public.get_own_professional_profile_details(%L,%L)',actor,jsonb_build_object('barbershopId',shop_a)),'42501','inactive membership cannot read') from pp_ids;
select pg_temp.pp_attempt(format('select public.update_own_professional_profile_details(%L,%L)',actor,jsonb_build_object('barbershopId',shop_a,'profile',body)),'42501','inactive membership cannot save') from pp_ids,pp_draft;
select ok(not has_function_privilege('anon','public.get_own_professional_profile_details(uuid,jsonb)','EXECUTE'),'anonymous cannot invoke read');
select ok(not has_function_privilege('authenticated','public.get_own_professional_profile_details(uuid,jsonb)','EXECUTE'),'browser role cannot invoke read directly');
select ok(not has_function_privilege('anon','public.update_own_professional_profile_details(uuid,jsonb)','EXECUTE'),'anonymous cannot invoke write');
select ok(not has_function_privilege('authenticated','public.update_own_professional_profile_details(uuid,jsonb)','EXECUTE'),'browser role cannot invoke write directly');
select ok(has_function_privilege('service_role','public.update_own_professional_profile_details(uuid,jsonb)','EXECUTE'),'verified Edge role can invoke write');
select * from finish();
rollback;
