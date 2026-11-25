begin;
-- Structural verification only: no fixtures and no business writes.
select jsonb_build_object(
 'three_private_rls_tables',(select count(*)=3 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='private' and c.relname in('care_settings','booking_care','care_events') and c.relrowsecurity),
 'no_direct_authenticated_table_access',not has_table_privilege('authenticated','private.booking_care','select,insert,update,delete'),
 'no_direct_anon_rpc',not has_function_privilege('anon','public.care_booking(uuid,jsonb)','execute'),
 'no_direct_user_rpc',not has_function_privilege('authenticated','public.care_booking(uuid,jsonb)','execute'),
 'service_rpc',has_function_privilege('service_role','public.care_booking(uuid,jsonb)','execute'),
 'old_confirm_closed',not has_function_privilege('service_role','public.confirm_booking(uuid,jsonb)','execute'),
 'internal_confirm_closed',not has_function_privilege('service_role','private.reservation_confirm(uuid,jsonb)','execute'),
 'search_paths_fixed',(select bool_and(coalesce('search_path=""'=any(proconfig),false)) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and p.proname in('care_command','care_json','confirm_booking_paid','care_cancel_guard')),
 'no_backfill',(select count(*)=0 from private.booking_care),
 'no_fabricated_events',(select count(*)=0 from private.care_events),
 'cancel_guard',(select count(*)=1 from pg_trigger where tgname='care_cancel_guard' and tgrelid='public.reservations'::regclass)
);
do $verify$
declare r public.reservations;v jsonb;
begin
 select * into r from public.reservations order by id limit 1;
 if not found then raise exception 'EXISTING_DATA_MISSING';end if;
 v:=public.care_booking(r.client_user_id,jsonb_build_object('command','read','reservationId',r.id));
 if v->'attendance'<>'null'::jsonb or v->'payment'<>'null'::jsonb or jsonb_array_length(v->'events')<>0 then raise exception 'LEGACY_HISTORY_FABRICATED';end if;
end $verify$;
rollback;
