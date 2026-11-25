-- Prepared test only. Run against explicitly authorized disposable local fixtures.
-- Set yape_test.reservation_id to a confirmed, unpaid Yape reservation without a
-- previous report, and yape_test.outsider_id to a confirmed unrelated profile.
-- The caller must be the local test database owner. Entire transaction rolls back.
begin;
do $test$
declare
 fixture_reservation uuid := current_setting('yape_test.reservation_id')::uuid;
 outsider uuid := current_setting('yape_test.outsider_id')::uuid;
 r public.reservations;
 d jsonb;
 result jsonb;
 request uuid := gen_random_uuid();
 rejected boolean;
 bad_code text;
 initial_notices bigint;
begin
 select * into strict r from public.reservations where id=fixture_reservation;
 if r.client_user_id=outsider or exists(select 1 from public.barbershop_memberships where user_id=outsider and barbershop_id=r.barbershop_id and status='active') then
  raise exception 'OUTSIDER_FIXTURE_INVALID';
 end if;
 if not exists(select 1 from private.booking_care where reservation_id=fixture_reservation and method='yape' and payment_status='pending' and attendance='confirmed') or r.state<>'confirmed' or exists(select 1 from private.yape_payment_reports where reservation_id=fixture_reservation) then
  raise exception 'REPORT_FIXTURE_INVALID';
 end if;
 d:=jsonb_build_object('command','report-yape','reservationId',fixture_reservation,'requestId',request,'securityCode','007');
 -- Unrelated callers cannot read or report the customer's payment.
 rejected:=false;
 begin
  perform private.care_command(outsider,jsonb_build_object('command','read','reservationId',fixture_reservation));
 exception when sqlstate 'P0002' then rejected:=true;end;
 if not rejected then raise exception 'OUTSIDER_READ_ALLOWED';end if;
 rejected:=false;
 begin perform private.care_command(outsider,d);
 exception when sqlstate 'P0002' or sqlstate '42501' then rejected:=true;end;
 if not rejected then raise exception 'OUTSIDER_REPORT_ALLOWED';end if;
 -- Validate at the database boundary, including numeric JSON and forged amounts.
 foreach bad_code in array array['12','1234','abc',' 123'] loop
  rejected:=false;
  begin perform private.care_command(r.client_user_id,jsonb_set(d,'{securityCode}',to_jsonb(bad_code)));
  exception when sqlstate '22023' then rejected:=true;end;
  if not rejected then raise exception 'BAD_CODE_ACCEPTED';end if;
 end loop;
 rejected:=false;
 begin perform private.care_command(r.client_user_id,d||jsonb_build_object('amountMinor',1));
 exception when sqlstate '22023' then rejected:=true;end;
 if not rejected then raise exception 'FORGED_AMOUNT_ACCEPTED';end if;
 select count(*) into initial_notices from private.web_notifications where resource_id=fixture_reservation;
 result:=private.care_command(r.client_user_id,d);
 if result->'yapeReport'->>'securityCode'<>'007' or result->'payment'->>'status'<>'pending' or (result->>'canReportYape')::boolean then raise exception 'REPORT_STATE_INVALID';end if;
 if not exists(select 1 from private.care_events where reservation_id=fixture_reservation and kind='report-yape' and capacity='client') then raise exception 'AUDIT_MISSING';end if;
 if (select count(*) from private.web_notifications where resource_id=fixture_reservation)<=initial_notices then raise exception 'NOTICE_MISSING';end if;
 -- A network retry returns the same report without another event/notice.
 perform private.care_command(r.client_user_id,d);
 if (select count(*) from private.care_events where reservation_id=fixture_reservation and kind='report-yape')<>1 then raise exception 'DUPLICATE_REPORT';end if;
 rejected:=false;
 begin perform private.care_command(r.client_user_id,jsonb_set(d,'{securityCode}','"008"'::jsonb));
 exception when sqlstate '23505' then rejected:=true;end;
 if not rejected then raise exception 'RETRY_CODE_CHANGED';end if;
 rejected:=false;
 begin perform private.care_command(r.client_user_id,jsonb_set(d,'{requestId}',to_jsonb(gen_random_uuid())));
 exception when sqlstate '23505' then rejected:=true;end;
 if not rejected then raise exception 'NEW_REPORT_OVERWROTE_EXISTING';end if;
end;
$test$;
rollback;
