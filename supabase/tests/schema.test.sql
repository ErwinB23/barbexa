-- Catalog and integrity tests only. Owner prepares synthetic rows inside rollback.
-- These tests do not claim the later tenant RLS authorization matrix is implemented.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;
select no_plan();

select ok(exists(select 1 from pg_roles where rolname = r), 'platform role exists: ' || r)
from unnest(array['anon','authenticated','service_role']) r;

select ok(to_regclass('public.' || t) is not null, 'table exists: ' || t)
from unnest(array['profiles','barbershops','barbershop_memberships']) t;

select ok(
  coalesce((select array_agg(column_name::text order by ordinal_position)
    from information_schema.columns where table_schema='public' and table_name=e.t) = e.cols, false),
  'exact minimal columns: ' || e.t)
from (values
  ('profiles',array['id','display_name','phone']),
  ('barbershops',array['id','name']),
  ('barbershop_memberships',array['id','user_id','barbershop_id','role','status'])
) as e(t,cols);

select ok(exists(select 1 from pg_attribute a join pg_type ty on ty.oid=a.atttypid
  where a.attrelid=to_regclass('public.'||e.t) and a.attname=e.col and not a.attisdropped
    and ty.typname=e.typ and a.attnotnull=e.nn), 'column type/nullability: '||e.t||'.'||e.col)
from (values
  ('profiles','id','uuid',true),('profiles','display_name','text',true),('profiles','phone','text',false),
  ('barbershops','id','uuid',true),('barbershops','name','text',true),
  ('barbershop_memberships','id','uuid',true),('barbershop_memberships','user_id','uuid',true),
  ('barbershop_memberships','barbershop_id','uuid',true),('barbershop_memberships','role','text',true),
  ('barbershop_memberships','status','text',true)
) as e(t,col,typ,nn);

select ok(exists(select 1 from pg_constraint c where c.conrelid=to_regclass('public.'||t)
  and c.contype='p' and c.conkey=array[(select attnum from pg_attribute where attrelid=c.conrelid and attname='id')]),
  'id primary key: '||t)
from unnest(array['profiles','barbershops','barbershop_memberships']) t;

select ok(exists(select 1 from pg_attrdef d join pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum
  where d.adrelid=to_regclass('public.'||t) and a.attname='id'
  and pg_get_expr(d.adbin,d.adrelid) like '%gen_random_uuid()%'), 'server UUID default: '||t)
from unnest(array['barbershops','barbershop_memberships']) t;

select ok(exists(select 1 from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and c.conkey=array[a.attnum]
  join pg_attribute b on b.attrelid=c.confrelid and c.confkey=array[b.attnum]
  where c.conrelid=to_regclass('public.'||e.t) and c.contype='f' and a.attname=e.col
    and c.confrelid=to_regclass(e.parent) and b.attname='id' and c.confdeltype='r'),
  'restrictive FK: '||e.t||'.'||e.col)
from (values ('profiles','id','auth.users'),('barbershop_memberships','user_id','public.profiles'),
  ('barbershop_memberships','barbershop_id','public.barbershops')) e(t,col,parent);

select ok(exists(select 1 from pg_constraint c where c.conrelid=to_regclass('public.barbershop_memberships')
 and c.contype='u' and c.conkey=array[
   (select attnum from pg_attribute where attrelid=c.conrelid and attname='user_id'),
   (select attnum from pg_attribute where attrelid=c.conrelid and attname='barbershop_id')]),'unique user/shop pair');
select ok(exists(select 1 from pg_indexes where schemaname='public' and tablename='barbershop_memberships'
 and indexdef like '%(barbershop_id, user_id)%'),'tenant/user FK lookup index');

select ok(exists(select 1 from pg_class where oid=to_regclass('public.'||t) and relrowsecurity), 'RLS enabled: '||t)
from unnest(array['profiles','barbershops','barbershop_memberships']) t;
-- T015 explicitly adds only the two own-profile policies. Other tables remain closed.
select ok(to_regclass('public.'||t) is not null and case when t='profiles' then
 (select count(*)=2 and bool_and(polname in ('profiles_select_own','profiles_update_own'))
  from pg_policy where polrelid=to_regclass('public.profiles'))
 else not exists(select 1 from pg_policy where polrelid=to_regclass('public.'||t)) end,
 'only approved policies: '||t)
from unnest(array['profiles','barbershops','barbershop_memberships']) t;

select ok(case when to_regclass('public.'||t) is null then false
 else not has_table_privilege(r,to_regclass('public.'||t),priv) end, 'no direct grant: '||r||' '||t||' '||priv)
from unnest(array['anon','authenticated','service_role']) r
cross join unnest(array['profiles','barbershops','barbershop_memberships']) t
cross join unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) priv;
select ok(exists(select 1 from pg_class where oid=to_regclass('public.'||t)) and not exists(
 select 1 from pg_class c cross join lateral aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a
 where c.oid=to_regclass('public.'||t) and a.grantee=0), 'no PUBLIC table grant: '||t)
from unnest(array['profiles','barbershops','barbershop_memberships']) t;

-- Synthetic Auth identities only in this transaction; never copied from another project.
insert into auth.users(id) values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
select lives_ok($$insert into public.profiles(id,display_name,phone) values ('11111111-1111-4111-8111-111111111111','Technical profile',null)$$,'profile and optional phone accepted');
select throws_ok($$insert into public.profiles(id,display_name) values ('22222222-2222-4222-8222-222222222222','   ')$$,'23514',null,'blank profile name rejected');
select throws_ok($$insert into public.profiles(id,display_name) values ('22222222-2222-4222-8222-222222222222',null)$$,'23502',null,'null profile name rejected');
select throws_ok($$insert into public.profiles(id,display_name) values ('11111111-1111-4111-8111-111111111111','Duplicate')$$,'23505',null,'duplicate identity rejected');
select throws_ok($$insert into public.profiles(id,display_name) values ('33333333-3333-4333-8333-333333333333','Missing auth')$$,'23503',null,'unknown Auth identity rejected');
select lives_ok($$insert into public.barbershops(id,name) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Technical shop'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Technical shop')$$,'duplicate business names permitted');
select throws_ok($$insert into public.barbershops(name) values ('   ')$$,'23514',null,'blank shop name rejected');
select throws_ok($$insert into public.barbershops(name) values (null)$$,'23502',null,'null shop name rejected');
select lives_ok($$insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','administrator','active')$$,'valid fixture association accepted');
select throws_ok($$insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','barber','inactive')$$,'23505',null,'duplicate pair rejected');
select throws_ok($$insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values ('11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','client','active')$$,'23514',null,'client is not a professional membership role');
select throws_ok($$insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values ('11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','barber','pending')$$,'23514',null,'unknown status rejected');
select throws_ok($$insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values ('22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','barber','inactive')$$,'23503',null,'membership requires profile');
select throws_ok($$insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values ('11111111-1111-4111-8111-111111111111','cccccccc-cccc-4ccc-8ccc-cccccccccccc','barber','inactive')$$,'23503',null,'membership requires shop');
select throws_ok($$delete from auth.users where id='11111111-1111-4111-8111-111111111111'$$,'23503',null,'profile restricts identity deletion');
select throws_ok($$delete from public.profiles where id='11111111-1111-4111-8111-111111111111'$$,'23503',null,'membership restricts profile deletion');
select throws_ok($$delete from public.barbershops where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$,'23503',null,'membership restricts shop deletion');

select * from finish();
rollback;
