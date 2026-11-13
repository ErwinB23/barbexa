-- T034: run only through a guarded local operator, never the public API.
-- Fixtures are transaction-local and always rolled back, including on disconnect.
\set ON_ERROR_STOP on
begin;
set local statement_timeout = '60s';
set local lock_timeout = '5s';
select version();
select indexname, indexdef from pg_indexes where schemaname='public'
  and tablename in ('profiles','barbershops','barbershop_memberships') order by indexname;
insert into auth.users(id)
  select ('34000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid from generate_series(1,10000) i;
insert into public.profiles(id,display_name)
  select id,'Query plan fixture' from auth.users where id::text like '34000000-%';
insert into public.barbershops(id,name)
  select ('35000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,'Query plan fixture' from generate_series(1,1000) i;
insert into public.barbershop_memberships(user_id,barbershop_id,role,status)
  select ('34000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,
    ('35000000-0000-4000-8000-'||lpad((((i-1)%1000)+1)::text,12,'0'))::uuid,
    'administrator','active' from generate_series(1,10000) i;
insert into public.barbershop_memberships(user_id,barbershop_id,role,status)
  select ('34000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,
    ('35000000-0000-4000-8000-'||lpad(((i%1000)+1)::text,12,'0'))::uuid,
    'barber',case when i%5=0 then 'inactive' else 'active' end from generate_series(1,10000) i;
-- Do not ANALYZE persistent tables: this experiment also preserves their statistics.
select 'fixture volume',10000 as users_profiles,1000 as shops,20000 as memberships;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"34000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
\echo OWN_PROFILE_RLS
explain (analyze,buffers,settings) select id,display_name,phone from public.profiles where id=auth.uid();
\echo OWN_MEMBERSHIPS_RLS
explain (analyze,buffers,settings) select id,user_id,barbershop_id,role,status from public.barbershop_memberships where user_id=auth.uid();
\echo OWN_MEMBERSHIPS_ADAPTER_LITERAL_RLS
explain (analyze,buffers,settings) select id,user_id,barbershop_id,role,status from public.barbershop_memberships where user_id='34000000-0000-4000-8000-000000000001';
\echo TENANT_MEMBERSHIPS_RLS
explain (analyze,buffers,settings) select id,user_id,barbershop_id,role,status from public.barbershop_memberships where barbershop_id='35000000-0000-4000-8000-000000000001';
\echo SHOP_RLS
explain (analyze,buffers,settings) select id,name from public.barbershops where id='35000000-0000-4000-8000-000000000001';
\echo HELPERS_AND_LISTING
explain (analyze,buffers,settings) select private.is_active_member('35000000-0000-4000-8000-000000000001'),private.is_active_admin('35000000-0000-4000-8000-000000000001');
explain (analyze,buffers,settings) select * from public.list_barbershop_memberships('35000000-0000-4000-8000-000000000001');
reset role;
\echo HELPER_INNER_LOOKUP_OWNER_NOT_RLS_PROOF
explain (analyze,buffers,settings) select exists(select 1 from public.barbershop_memberships where user_id='34000000-0000-4000-8000-000000000001' and barbershop_id='35000000-0000-4000-8000-000000000001' and role='administrator' and status='active');
rollback;
select 'fixture rows after rollback',count(*) from auth.users where id::text like '34000000-%';
