-- SQL RPC integration, disposable DB only. No HTTP or genuine GoTrue JWT.
begin;
insert into auth.users(id,email,is_anonymous,email_confirmed_at)
 select ('00000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,'fixture'||i||'@example.invalid',false,statement_timestamp() from generate_series(5,9)i;
insert into public.profiles(id,display_name) select id,'Fixture' from auth.users where not exists(select 1 from public.profiles p where p.id=auth.users.id);
create table private.notification_test_context(shop uuid, other_shop uuid, reservation uuid, other_notice uuid);
do $test$
declare owner_id uuid:='00000000-0000-4000-8000-000000000005'; client_id uuid:='00000000-0000-4000-8000-000000000006'; worker uuid:='00000000-0000-4000-8000-000000000007'; other_owner uuid:='00000000-0000-4000-8000-000000000009';
 shop uuid; other_shop uuid; professional uuid; service uuid; invitation uuid; booking uuid; r jsonb; d jsonb; hours jsonb; initial_count bigint; start_time text; next_time text; notice uuid;
begin
 -- The same public RPCs invoked by the business adapters, with verified actors.
 shop:=(public.create_own_barbershop(owner_id,'Integral notification fixture')->'barbershop'->>'id')::uuid;
 other_shop:=(public.create_own_barbershop(other_owner,'Other tenant fixture')->'barbershop'->>'id')::uuid;
 perform public.configure_booking_shop(owner_id,jsonb_build_object('barbershopId',shop,'publicContact','Synthetic','address','Synthetic','policies',jsonb_build_object('minimumNoticeMin',0,'bookingHorizonDays',30,'maxFuturePerClient',5,'slotStepMin',15,'bufferMin',0,'cancellationAdvanceMin',0)));
 invitation:=(public.invite_booking_staff(owner_id,jsonb_build_object('barbershopId',shop,'email','fixture7@example.invalid'))->>'id')::uuid;
 if (select count(*) from private.web_notifications where resource_id=invitation and recipient_id=worker)<>1 then raise exception 'REAL_INVITATION_NOT_DELIVERED';end if;
 perform public.respond_booking_invitation(worker,jsonb_build_object('invitationId',invitation,'decision','accept'));
 if not exists(select 1 from public.barbershop_memberships where user_id=worker and barbershop_id=shop and role='barber' and status='active') then raise exception 'REAL_ACCEPT_FAILED';end if;
 if (select count(*) from private.web_notifications where resource_id=invitation)<>2 then raise exception 'ACCEPT_NOTICE_WRONG';end if;
 professional:=(public.set_booking_professional(owner_id,jsonb_build_object('barbershopId',shop,'userId',worker,'professionalName','Synthetic professional','active',true))->>'id')::uuid;
 service:=(public.upsert_booking_service(owner_id,jsonb_build_object('barbershopId',shop,'name','Synthetic service','description','','price',jsonb_build_object('amountMinor',2500,'currency','PEN'),'durationMin',30,'active',true))->>'id')::uuid;
 perform public.set_booking_capabilities(owner_id,jsonb_build_object('barbershopId',shop,'barberId',professional,'serviceIds',jsonb_build_array(service)));
 select jsonb_agg(jsonb_build_object('weekday',day,'opensMin',0,'closesMin',1440)) into hours from generate_series(0,6)day;
 perform public.set_booking_hours(owner_id,jsonb_build_object('barbershopId',shop,'hours',hours));
 perform public.set_booking_hours(owner_id,jsonb_build_object('barbershopId',shop,'barberId',professional,'hours',hours));
 perform public.set_booking_publication(owner_id,jsonb_build_object('barbershopId',shop,'state','published'));
 start_time:=to_char((((statement_timestamp() at time zone 'America/Lima')::date+1)+time '10:00') at time zone 'America/Lima' at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
 next_time:=to_char((((statement_timestamp() at time zone 'America/Lima')::date+1)+time '11:00') at time zone 'America/Lima' at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
 d:=jsonb_build_object('requestId',gen_random_uuid(),'barbershopId',shop,'serviceIds',jsonb_build_array(service),'barberId',professional,'startsAt',start_time,'paymentMethod','cash');
 r:=public.confirm_booking_paid(client_id,d); booking:=(r->'detail'->>'id')::uuid;
 initial_count:=(select count(*) from private.web_notifications where resource_id=booking);
 if initial_count<>3 then raise exception 'REAL_CONFIRM_NOTICES';end if;
 r:=public.confirm_booking_paid(client_id,d);
 if not (r->>'replayed')::boolean or (select count(*) from private.web_notifications where resource_id=booking)<>initial_count then raise exception 'REAL_CONFIRM_REPLAY_DUPLICATES';end if;
 -- Failure after the confirmation engine inserted a reservation must roll back its notices.
 begin
  perform public.confirm_booking_paid(client_id,d||jsonb_build_object('requestId',gen_random_uuid(),'startsAt',next_time,'paymentMethod','yape'));
  raise exception 'YAPE_WITHOUT_SETTINGS_ALLOWED';
 exception when invalid_parameter_value then null;
 end;
 if (select count(*) from public.reservations where barbershop_id=shop)<>1 then raise exception 'FAILED_CONFIRM_RESERVATION_LEAK';end if;
 if (select count(*) from private.web_notifications where barbershop_id=shop)<>5 then raise exception 'FAILED_CONFIRM_NOTICE_LEAK';end if;
 d:=jsonb_build_object('requestId',gen_random_uuid(),'reservationId',booking,'expectedStartsAt',start_time,'startsAt',next_time);
 perform public.reschedule_booking(client_id,d); perform public.reschedule_booking(client_id,d);
 if (select count(*) from private.web_notifications where resource_id=booking)<>6 then raise exception 'REAL_RESCHEDULE_DUPLICATES';end if;
 d:=jsonb_build_object('command','receive','requestId',gen_random_uuid(),'reservationId',booking,'attested',true);
 perform public.care_booking(worker,d);perform public.care_booking(worker,d);
 if (select count(*) from private.web_notifications where resource_id=booking)<>9 then raise exception 'REAL_PAYMENT_DUPLICATES';end if;
 d:=jsonb_build_object('requestId',gen_random_uuid(),'reservationId',booking);
 perform public.cancel_booking(client_id,d);perform public.cancel_booking(client_id,d);
 if (select count(*) from private.web_notifications where resource_id=booking)<>12 then raise exception 'REAL_CANCEL_DUPLICATES';end if;
 d:=jsonb_build_object('command','refund','requestId',gen_random_uuid(),'reservationId',booking,'attested',true,'reason','Isolated fictional refund');
 perform public.care_booking(owner_id,d);perform public.care_booking(owner_id,d);
 if (select count(*) from private.web_notifications where resource_id=booking)<>15 then raise exception 'REAL_REFUND_DUPLICATES';end if;
 if (select payment_status from private.booking_care where reservation_id=booking)<>'refunded' then raise exception 'REAL_PAYMENT_STATE';end if;
 invitation:=(public.invite_booking_staff(other_owner,jsonb_build_object('barbershopId',other_shop,'email','fixture8@example.invalid'))->>'id')::uuid;
 select id into notice from private.web_notifications where resource_id=invitation;
 insert into private.notification_test_context values(shop,other_shop,booking,notice);
end;$test$;
commit;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000005';
-- Select the actual foreign notice before dropping privileges, then attempt the RPC.
select other_notice::text as foreign_notice from private.notification_test_context \gset
set role authenticated;
select set_config('notification.test_foreign_id', :'foreign_notice', false);
do $test$
declare result jsonb;
begin
 result:=public.list_my_notifications();
 if jsonb_array_length(result->'items')<>6 then raise exception 'OWNER_INBOX_WRONG';end if;
 begin perform public.read_my_notification(current_setting('notification.test_foreign_id')::uuid);raise exception 'FOREIGN_TENANT_READ_ALLOWED';exception when no_data_found then null;end;
 if exists(select 1 from jsonb_array_elements(result->'items') n where n->>'message' like '%Other tenant%') then raise exception 'OTHER_TENANT_LEAK';end if;
end;$test$;
reset role;
set request.jwt.claim.sub='00000000-0000-4000-8000-000000000009';
set role authenticated;
do $test$ begin if jsonb_array_length(public.list_my_notifications()->'items')<>0 then raise exception 'OTHER_OWNER_LEAK';end if;end;$test$;
reset role;
select 'business RPC integration passed: invite/accept/confirm/replay/failure rollback/reschedule/payment/cancel/refund and tenant isolation';
