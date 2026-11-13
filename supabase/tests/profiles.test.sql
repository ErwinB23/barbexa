begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions,pg_catalog;
select no_plan();
-- Test-only exception boundary: missing grants must be TAP failures, not an aborted suite.
create function pg_temp.profile_result(q text, expected text, label text) returns text
language plpgsql security invoker as $test$
declare actual text;
begin
 execute q into actual;
 return extensions.is(actual,expected,label);
exception when others then
 return extensions.fail(label || ' SQLSTATE=' || sqlstate);
end;
$test$;
select has_function('public','ensure_own_profile',array['uuid','text','text']);
select ok(has_column_privilege('authenticated','public.profiles','display_name','UPDATE'),'editable name');
select ok(has_column_privilege('authenticated','public.profiles','phone','UPDATE'),'editable phone');
select ok(not has_column_privilege('authenticated','public.profiles','id','UPDATE'),'immutable id');
select ok(not has_table_privilege('authenticated','public.profiles','INSERT'),'no direct insert');
select ok(not has_table_privilege('authenticated','public.profiles','DELETE'),'no direct delete');
select ok(not has_table_privilege('anon','public.profiles','SELECT'),'anonymous denied');
select ok(not has_table_privilege('service_role','public.profiles','SELECT'),'service no direct read');
-- Fixtures are synthetic and rolled back; owner prepares, authenticated exercises RLS.
insert into auth.users(id) values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
insert into public.profiles values ('11111111-1111-4111-8111-111111111111','Own','1'),('22222222-2222-4222-8222-222222222222','Other',null);
select throws_ok($$insert into public.profiles values ('11111111-1111-4111-8111-111111111111','Duplicate',null)$$,'23505',null,'profile PK');
select throws_ok($$insert into public.profiles values ('33333333-3333-4333-8333-333333333333','Missing',null)$$,'23503',null,'Auth FK');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","user_metadata":{"role":"administrator"}}',true);
select pg_temp.profile_result('select string_agg(id::text, '','') from public.profiles','11111111-1111-4111-8111-111111111111','own only even with forged admin metadata');
select lives_ok($$update public.profiles set display_name='Edited',phone=null where id=auth.uid()$$,'own update');
select pg_temp.profile_result('select display_name from public.profiles where id=auth.uid()','Edited','update persisted');
select pg_temp.profile_result('select count(*)::text from public.profiles where id=''22222222-2222-4222-8222-222222222222''','0','other hidden');
select lives_ok($$update public.profiles set display_name='Stolen' where id='22222222-2222-4222-8222-222222222222'$$,'other update hidden');
select throws_ok($$update public.profiles set id='22222222-2222-4222-8222-222222222222'$$,'42501',null,'id denied');
select throws_ok($$delete from public.profiles$$,'42501',null,'delete denied');
select throws_ok($$select public.ensure_own_profile(auth.uid(),'Spoof',null)$$,'42501',null,'ordinary RPC denied');
reset role;
select is((select display_name from public.profiles where id='22222222-2222-4222-8222-222222222222'),'Other','other unchanged');
set local role anon;
select throws_ok($$select id from public.profiles$$,'42501',null,'anonymous read denied');
select throws_ok($$select public.ensure_own_profile('11111111-1111-4111-8111-111111111111','Spoof',null)$$,'42501',null,'anonymous RPC denied');
reset role;
select ok(exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and p.proname='ensure_own_profile' and p.prosecdef and p.proconfig @> array['search_path=""']),'private definer safe search path');
select ok(exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='ensure_own_profile' and not p.prosecdef),'public invoker');
-- Privileged provisioning is only available through these narrow functions.
select ok(has_function_privilege('service_role','public.ensure_own_profile(uuid,text,text)','EXECUTE'),'service wrapper executable');
select ok(has_function_privilege('service_role','private.ensure_own_profile(uuid,text,text)','EXECUTE'),'service implementation executable');
select ok(not has_function_privilege('authenticated','public.ensure_own_profile(uuid,text,text)','EXECUTE'),'user wrapper ACL');
select ok(not has_function_privilege('anon','public.ensure_own_profile(uuid,text,text)','EXECUTE'),'anon wrapper ACL');
select ok(not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace cross join lateral aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where p.proname='ensure_own_profile' and n.nspname in ('public','private') and a.grantee=0),'no implicit PUBLIC execute');
select ok(not has_schema_privilege('authenticated','private','USAGE'),'user private schema denied');
insert into auth.users(id) values ('33333333-3333-4333-8333-333333333333');
set local role service_role;
select results_eq($$select display_name from public.ensure_own_profile('33333333-3333-4333-8333-333333333333','  New  ','  ')$$,array['New'],'service provisions normalized profile');
select results_eq($$select display_name from public.ensure_own_profile('33333333-3333-4333-8333-333333333333','Replacement','other')$$,array['New'],'repeated provisioning does not overwrite');
select throws_ok($$select public.ensure_own_profile(null,'Name',null)$$,'42501','UNAUTHENTICATED','null actor');
select throws_ok($$select public.ensure_own_profile('44444444-4444-4444-8444-444444444444','Name',null)$$,'42501','UNAUTHENTICATED','unknown actor');
select throws_ok($$select public.ensure_own_profile('33333333-3333-4333-8333-333333333333',' ',null)$$,'22023','INVALID_INPUT','SQL revalidates name');
select throws_ok($$select id from public.profiles$$,'42501',null,'service still cannot read table');
reset role;
select is((select phone from public.profiles where id='33333333-3333-4333-8333-333333333333'),null,'empty phone persisted as null');
select is((select count(*)::int from public.profiles where id='33333333-3333-4333-8333-333333333333'),1,'one profile per actor');
set local role authenticated;
select throws_ok($$insert into public.profiles(id,display_name) values ('44444444-4444-4444-8444-444444444444','Denied')$$,'42501',null,'ordinary INSERT denied');
select throws_ok($$update public.profiles set display_name=' ' where id=auth.uid()$$,'23514',null,'SQL rejects blank profile name');
reset role;
select * from finish();
rollback;
