-- ONLY in the independent rehearsal DB, with synthetic identities.
begin;
insert into auth.users(id,email,is_anonymous,email_confirmed_at)
 select ('00000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,'fixture'||i||'@example.invalid',false,now() from generate_series(1,4)i;
insert into public.profiles(id,display_name) select id,'Fixture' from auth.users;
insert into public.barbershops(id,name) values('00000000-0000-4000-8000-000000000010','Notifications fixture');
insert into public.barbershop_memberships(user_id,barbershop_id,role,status)
 select ('00000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,'00000000-0000-4000-8000-000000000010',case when i=2 then 'administrator' else 'barber' end,'active' from generate_series(2,3)i;
insert into private.barbershop_ownership(barbershop_id,owner_user_id,created_by,source) values('00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000002','new-shop');
insert into public.barber_profiles(id,barbershop_id,user_id,professional_name,active) values('00000000-0000-4000-8000-000000000020','00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000003','Professional fixture',true);
insert into public.reservations(id,barbershop_id,client_user_id,barber_id,barber_user_id,request_id,fingerprint,starts_at,ends_at,occupied_until,duration_min,buffer_min,total_amount,shop_name_snapshot,barber_name_snapshot,client_display_name_snapshot,policy_snapshot)
 values('00000000-0000-4000-8000-000000000021','00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000020','00000000-0000-4000-8000-000000000003',gen_random_uuid(),repeat('a',64),'2030-01-01 15:00Z','2030-01-01 15:30Z','2030-01-01 15:30Z',30,0,25,'Fixture','Professional','Client','{}');
insert into public.reservation_events(reservation_id,barbershop_id,actor_user_id,capacity,kind) values('00000000-0000-4000-8000-000000000021','00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','client','confirmed');
insert into public.staff_invitations(id,barbershop_id,recipient_user_id,inviter_user_id) values('00000000-0000-4000-8000-000000000030','00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000002');
update public.staff_invitations set status='accepted',responded_at=statement_timestamp() where id='00000000-0000-4000-8000-000000000030';
update public.staff_invitations set status='accepted' where id='00000000-0000-4000-8000-000000000030';
insert into private.care_events(reservation_id,barbershop_id,actor_user_id,request_id,fingerprint,kind,capacity,reason)
 select '00000000-0000-4000-8000-000000000021','00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000003',gen_random_uuid(),'{}',k,'barber','Isolated notification fixture' from unnest(array['start','complete','no-show','receive','refund'])k;
-- refund requires explicit reason.
insert into public.reservation_events(reservation_id,barbershop_id,actor_user_id,capacity,kind) values('00000000-0000-4000-8000-000000000021','00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','client','cancelled');
insert into private.reschedule_events(reservation_id,barbershop_id,old_starts_at,new_starts_at,actor_user_id,capacity,request_id,fingerprint,result_json)
 values('00000000-0000-4000-8000-000000000021','00000000-0000-4000-8000-000000000010','2030-01-01 15:00Z','2030-01-01 16:00Z','00000000-0000-4000-8000-000000000001','client',gen_random_uuid(),'{}','{}');
commit;
do $$ begin
 if (select count(*) from private.web_notifications)<>26 then raise exception 'WRONG_EVENT_FANOUT';end if;
 if has_table_privilege('authenticated','private.web_notifications','select') or has_function_privilege('anon','public.list_my_notifications()','execute') then raise exception 'ACL_LEAK';end if;
 if not (select relrowsecurity from pg_class where oid='private.web_notifications'::regclass) then raise exception 'RLS_MISSING';end if;
end $$;
-- Anonymous caller denied by actual ACL.
set role anon;
do $$ begin perform public.list_my_notifications();raise exception 'ANON_ALLOWED';exception when insufficient_privilege then null;end $$;
reset role;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';
set role authenticated;
do $$ declare n jsonb; first_id uuid; begin
 n:=public.list_my_notifications();if jsonb_array_length(n->'items')<>8 then raise exception 'CLIENT_ISOLATION';end if;
 first_id:=(n->'items'->0->>'id')::uuid;
 perform public.read_my_notification(first_id);perform public.read_my_notification(first_id);
 if (public.list_my_notifications()->>'unread')::int<>7 then raise exception 'READ_NOT_IDEMPOTENT';end if;
 begin perform public.read_my_notification('00000000-0000-4000-8000-000000000030');raise exception 'FOREIGN_MARK_ALLOWED';exception when no_data_found then null;end;
 begin perform count(*) from private.web_notifications;raise exception 'PRIVATE_TABLE_EXPOSED';exception when insufficient_privilege then null;end;
end $$;
reset role;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000004';
set role authenticated;
do $$ begin if jsonb_array_length(public.list_my_notifications()->'items')<>1 then raise exception 'INVITATION_RECIPIENT_ISOLATION';end if;end $$;
reset role;
-- Revoked staff no longer sees former operational data.
update public.barbershop_memberships set status='inactive' where user_id='00000000-0000-4000-8000-000000000003';
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000003';
set role authenticated;
do $$ begin if jsonb_array_length(public.list_my_notifications()->'items')<>0 then raise exception 'REVOKED_ACCESS_LEAK';end if;end $$;
reset role;
begin;
select private.web_notice_reservation('00000000-0000-4000-8000-000000000021','rollback-event','Rollback fixture');
rollback;
do $$ begin if exists(select 1 from private.web_notifications where source_key='rollback-event') then raise exception 'ROLLBACK_LEAK';end if;end $$;
select 'all functional assertions passed';
