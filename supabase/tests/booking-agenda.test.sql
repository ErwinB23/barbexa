begin;
select '1..4';
select case when to_regprocedure('public.list_booking_agenda(uuid,date,uuid,text)') is not null then 'ok' else 'not ok' end || ' 1 - agenda RPC exists';
select case when to_regprocedure('private.booking_agenda(uuid,date,uuid,text)') is not null then 'ok' else 'not ok' end || ' 2 - private agenda query exists';
select case when to_regprocedure('public.list_booking_agenda(uuid,date,uuid,text)') is not null and not has_function_privilege('anon',to_regprocedure('public.list_booking_agenda(uuid,date,uuid,text)'),'EXECUTE') then 'ok' else 'not ok' end || ' 3 - anon cannot execute agenda';
select case when to_regprocedure('public.list_booking_agenda(uuid,date,uuid,text)') is not null and has_function_privilege('authenticated',to_regprocedure('public.list_booking_agenda(uuid,date,uuid,text)'),'EXECUTE') then 'ok' else 'not ok' end || ' 4 - authenticated can request authorized agenda';
rollback;
