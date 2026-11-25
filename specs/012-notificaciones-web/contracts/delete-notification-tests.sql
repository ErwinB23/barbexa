-- Run ONLY against an approved disposable rehearsal database after notifications.sql
-- and delete-notification.sql. Entire fixture is rolled back. Never run against Cloud.
begin;
insert into auth.users(id,email,is_anonymous,email_confirmed_at) values
 ('00000000-0000-4000-8000-000000000901','delete-a@example.invalid',false,now()),
 ('00000000-0000-4000-8000-000000000902','delete-b@example.invalid',false,now());
insert into public.profiles(id,display_name) values
 ('00000000-0000-4000-8000-000000000901','Delete fixture A'),
 ('00000000-0000-4000-8000-000000000902','Delete fixture B');
insert into public.barbershops(id,name) values('00000000-0000-4000-8000-000000000910','Delete fixture');
insert into private.web_notifications(id,recipient_id,barbershop_id,resource_id,source_key,staff,title,message,target)
select ('00000000-0000-4000-8000-'||lpad((920+i)::text,12,'0'))::uuid,
 ('00000000-0000-4000-8000-'||lpad((900+i)::text,12,'0'))::uuid,
 '00000000-0000-4000-8000-000000000910',gen_random_uuid(),'delete-fixture',false,'Fixture','Fixture','/my-reservations'
from generate_series(1,2)i;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000901',true);
select set_config('request.jwt.claims','{"is_anonymous":false}',true);
do $test$
declare before_count int; after_list jsonb;
begin
 select (public.list_my_notifications()->>'unread')::int into before_count;
 if before_count<>1 then raise exception 'Expected one own unread notice';end if;
 begin
  perform public.delete_my_notification('00000000-0000-4000-8000-000000000922');
  raise exception 'Foreign notice deletion unexpectedly succeeded';
 exception when no_data_found then null;
 end;
 perform public.delete_my_notification('00000000-0000-4000-8000-000000000921');
 perform public.delete_my_notification('00000000-0000-4000-8000-000000000921');
 after_list:=public.list_my_notifications();
 if (after_list->>'unread')::int<>0 or jsonb_array_length(after_list->'items')<>0 then raise exception 'Deleted notice remains visible';end if;
 begin
  perform public.read_my_notification('00000000-0000-4000-8000-000000000921');
  raise exception 'Deleted notice unexpectedly marked read';
 exception when no_data_found then null;
 end;
end;$test$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000902',true);
do $test$ begin
 if jsonb_array_length(public.list_my_notifications()->'items')<>1 then raise exception 'Other recipient changed';end if;
end;$test$;
reset role;
do $test$ begin
 if (select count(*) from private.web_notifications where source_key='delete-fixture')<>2 then raise exception 'Tombstone removed deduplication data';end if;
 if has_function_privilege('anon','public.delete_my_notification(uuid)','execute') then raise exception 'Anonymous execution leaked';end if;
end;$test$;
rollback;
