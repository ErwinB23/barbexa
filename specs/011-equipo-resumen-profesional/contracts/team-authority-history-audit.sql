-- READ-ONLY AUDIT, executed as introspection only in 2C.2. No repair or business RPC invocation.
-- Verify Docker/local target app-barberia-002-local:54422 independently before use.
-- Missing/false/mismatched objects stop reconciliation; never infer pass from counts alone.
begin isolation level repeatable read read only;
set local statement_timeout='15s';
select jsonb_build_object('section','environment','version',version(),'database',current_database(),
 'readOnly',current_setting('transaction_read_only'),'defaultIsolation',current_setting('default_transaction_isolation'));
select jsonb_build_object('section','migration_history','records',jsonb_agg(jsonb_build_object('version',version,'name',name) order by version))
from supabase_migrations.schema_migrations;
-- Agenda: two functions, no table/policy/trigger changes.
-- Cancellation: three functions, depends on original reservation columns/events.
-- Care: six functions + three private tables + four explicit indexes + one trigger;
-- revokes the two old payment-free confirmation entry points. No historical backfill.
with expected(signature,definer,volatility,result,auth_execute,service_execute,defaults) as(values
 ('private.booking_agenda(uuid,date,uuid,text)',true,'s','jsonb',true,false,0),
 ('public.list_booking_agenda(uuid,date,uuid,text)',false,'s','jsonb',true,false,2),
 ('private.cancellation_before_limit(timestamptz,integer,timestamptz)',false,'i','boolean',false,false,0),
 ('private.reservation_cancel(uuid,jsonb)',true,'v','jsonb',false,true,0),
 ('public.cancel_booking(uuid,jsonb)',false,'v','jsonb',false,true,0),
 ('private.care_json(public.reservations,uuid)',true,'s','jsonb',false,false,0),
 ('private.care_command(uuid,jsonb)',true,'v','jsonb',false,true,0),
 ('private.confirm_booking_paid(uuid,jsonb)',true,'v','jsonb',false,true,0),
 ('private.care_cancel_guard()',true,'v','trigger',false,false,0),
 ('public.care_booking(uuid,jsonb)',false,'v','jsonb',false,true,0),
 ('public.confirm_booking_paid(uuid,jsonb)',false,'v','jsonb',false,true,0),
 ('public.confirm_booking(uuid,jsonb)',false,'v','jsonb',false,false,0),
 ('private.reservation_confirm(uuid,jsonb)',true,'v','jsonb',false,false,0))
select jsonb_build_object('section','function_contract','objects',jsonb_agg(jsonb_build_object(
 'signature',e.signature,'present',p.oid is not null,'owner',pg_get_userbyid(p.proowner),
 'arguments',pg_get_function_arguments(p.oid),'result',pg_get_function_result(p.oid),
 'bodySha256',encode(sha256(convert_to(regexp_replace(replace(p.prosrc,E'\r\n',E'\n'),'^[[:space:]]+|[[:space:]]+$','','g'),'UTF8')),'hex'),
 'safeHeader',p.prosecdef=e.definer and p.provolatile::text=e.volatility and pg_get_function_result(p.oid)=e.result and p.pronargdefaults=e.defaults and coalesce('search_path=""'=any(p.proconfig),false),
 'closedAcl',not has_function_privilege('anon',p.oid,'execute') and has_function_privilege('authenticated',p.oid,'execute')=e.auth_execute and has_function_privilege('service_role',p.oid,'execute')=e.service_execute
 and not exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where a.grantee=0 and a.privilege_type='EXECUTE')) order by e.signature))
from expected e left join pg_proc p on p.oid=to_regprocedure(e.signature);
with expected(name) as(values('private.care_settings'),('private.booking_care'),('private.care_events'))
select jsonb_build_object('section','private_tables','objects',jsonb_agg(jsonb_build_object('name',e.name,
 'present',c.oid is not null,'rls',c.relrowsecurity,'owner',pg_get_userbyid(c.relowner),
 'closedAcl',not has_table_privilege('anon',c.oid,'select,insert,update,delete,truncate,references,trigger') and not has_table_privilege('authenticated',c.oid,'select,insert,update,delete,truncate,references,trigger') and not has_table_privilege('service_role',c.oid,'select,insert,update,delete,truncate,references,trigger'),
 'columnAcl',not exists(select 1 from pg_attribute a where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped and (has_column_privilege('anon',c.oid,a.attnum,'select,insert,update,references') or has_column_privilege('authenticated',c.oid,a.attnum,'select,insert,update,references') or has_column_privilege('service_role',c.oid,a.attnum,'select,insert,update,references'))),
 'policyCount',(select count(*) from pg_policy where polrelid=c.oid),
 'columns',(select jsonb_agg(jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),'notNull',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid)) order by a.attnum) from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped),
 'constraints',(select jsonb_agg(jsonb_build_object('name',x.conname,'type',x.contype,'validated',x.convalidated,'definition',pg_get_constraintdef(x.oid)) order by x.conname) from pg_constraint x where x.conrelid=c.oid),
 'indexes',(select jsonb_agg(jsonb_build_object('valid',i.indisvalid,'ready',i.indisready,'unique',i.indisunique,'definition',pg_get_indexdef(i.indexrelid),'predicate',pg_get_expr(i.indpred,i.indrelid)) order by i.indexrelid::regclass::text) from pg_index i where i.indrelid=c.oid)
 ) order by e.name)) from expected e left join pg_class c on c.oid=to_regclass(e.name);
select jsonb_build_object('section','reservation_dependencies','columns',(select jsonb_agg(jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),'notNull',a.attnotnull) order by a.attnum) from pg_attribute a where a.attrelid='public.reservations'::regclass and a.attnum>0 and not a.attisdropped),
 'constraints',(select jsonb_agg(jsonb_build_object('table',c.conrelid::regclass::text,'validated',c.convalidated,'definition',pg_get_constraintdef(c.oid)) order by c.conname) from pg_constraint c where c.conrelid in('public.reservations'::regclass,'public.reservation_items'::regclass,'public.reservation_events'::regclass)),
 'policies',(select jsonb_agg(to_jsonb(p) order by p.tablename,p.policyname) from pg_policies p where p.schemaname='public' and p.tablename in('reservations','reservation_items','reservation_events')),
 'ordinaryWrites',(select jsonb_agg(jsonb_build_object('table',c.oid::regclass::text,'anon',has_table_privilege('anon',c.oid,'insert,update,delete'),'authenticated',has_table_privilege('authenticated',c.oid,'insert,update,delete'),'service',has_table_privilege('service_role',c.oid,'insert,update,delete'))) from pg_class c where c.oid in('public.reservations'::regclass,'public.reservation_items'::regclass,'public.reservation_events'::regclass)));
select jsonb_build_object('section','care_trigger','objects',jsonb_agg(jsonb_build_object('name',t.tgname,'enabled',t.tgenabled,'definition',pg_get_triggerdef(t.oid),'function',t.tgfoid::regprocedure::text))) from pg_trigger t where t.tgrelid='public.reservations'::regclass and not t.tgisinternal;
select jsonb_build_object('section','catalog_dependencies','objects',jsonb_agg(jsonb_build_object('dependent',pg_describe_object(d.classid,d.objid,d.objsubid),'required',pg_describe_object(d.refclassid,d.refobjid,d.refobjsubid),'type',d.deptype))) from pg_depend d where (d.classid='pg_proc'::regclass and d.objid in(to_regprocedure('public.list_booking_agenda(uuid,date,uuid,text)'),to_regprocedure('public.cancel_booking(uuid,jsonb)'),to_regprocedure('public.care_booking(uuid,jsonb)'),to_regprocedure('public.confirm_booking_paid(uuid,jsonb)'))) or (d.refclassid='pg_proc'::regclass and d.refobjid=to_regprocedure('private.care_cancel_guard()'));
-- Dollar-quoted SQL/PLpgSQL body dependencies are not exhaustively represented in
-- pg_depend. Review their source call graph as well; metadata alone is not a pass.
select jsonb_build_object('section','counts','users',(select count(*) from auth.users),'profiles',(select count(*) from public.profiles),'shops',(select count(*) from public.barbershops),'memberships',(select count(*) from public.barbershop_memberships),'reservations',(select count(*) from public.reservations),'items',(select count(*) from public.reservation_items),'reservationEvents',(select count(*) from public.reservation_events),'care',(select count(*) from private.booking_care),'careEvents',(select count(*) from private.care_events));
commit;
