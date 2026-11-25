-- Disposable local database only. Test fixtures always roll back.
begin;
set local statement_timeout='30s';
-- The clone omits ACLs. Reproduce existing Cloud schema access, not table access.
grant usage on schema private to service_role;
create function private.catalog_test_failure() returns trigger language plpgsql as $failure$
begin if new.name='Atomic test' and new.category='Barba' then raise exception 'TEST_CATEGORY_FAILURE';end if;return new;end;
$failure$;
create trigger catalog_test_failure before update on public.services for each row execute function private.catalog_test_failure();
do $test$
declare
 owner_id uuid; outsider uuid; shop uuid; other_shop uuid; service_id uuid;
 payload jsonb; response jsonb; category_name text; rejected boolean;
 professional uuid; booking uuid; starts timestamptz; before_booking text;
begin
 select u.id into strict owner_id from auth.users u join public.profiles p on p.id=u.id
 where u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false) limit 1;
 select u.id into strict outsider from auth.users u join public.profiles p on p.id=u.id
 where u.id<>owner_id and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false) limit 1;
 shop := (public.create_own_barbershop(owner_id,'Catalog local test')->'barbershop'->>'id')::uuid;
 other_shop := (public.create_own_barbershop(outsider,'Other tenant test')->'barbershop'->>'id')::uuid;
 payload := jsonb_build_object('barbershopId',shop,'name','Corte clásico','description','Test',
   'price',jsonb_build_object('currency','PEN','amountMinor',1500),'durationMin',30,'active',true,'category','Corte de cabello');
 -- Match the real Edge role: it has RPC execution but no direct table writes.
 perform set_config('role','service_role',true);
 response := public.upsert_booking_service(owner_id,payload);
 perform set_config('role','supabase_admin',true);
 service_id := (response->>'id')::uuid;
 if response->>'category'<>'Corte de cabello' or response->'archived'<>'false'::jsonb then raise exception 'CATEGORY_NOT_PERSISTED';end if;
 payload := payload||jsonb_build_object('id',service_id);
 foreach category_name in array array['Barba','Tratamientos','Otros','Corte de cabello'] loop
  response := public.upsert_booking_service(owner_id,payload||jsonb_build_object('category',category_name));
  if (select category from public.services where id=service_id)<>category_name then raise exception 'EDIT_CATEGORY_NOT_PERSISTED';end if;
 end loop;
 -- Old clients can still edit without erasing the existing category.
 response := public.upsert_booking_service(owner_id,payload-'category');
 if response->>'category'<>'Corte de cabello' then raise exception 'LEGACY_RESET_CATEGORY';end if;
 rejected:=false;
 begin perform public.upsert_booking_service(owner_id,payload||jsonb_build_object('category','Unknown','name','Must roll back'));
 exception when sqlstate '22023' then rejected:=true;end;
 if not rejected or (select name from public.services where id=service_id)<>'Corte clásico' then raise exception 'INVALID_INPUT_WROTE_DATA';end if;
 rejected:=false;
 begin perform public.upsert_booking_service(outsider,payload);
 exception when sqlstate '42501' then rejected:=true;end;
 if not rejected then raise exception 'OUTSIDER_EDIT_ALLOWED';end if;
 rejected:=false;
 begin perform public.upsert_booking_service(outsider,payload||jsonb_build_object('barbershopId',other_shop));
 exception when sqlstate 'P0002' then rejected:=true;end;
 if not rejected then raise exception 'FOREIGN_SERVICE_ACCEPTED';end if;
 insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values(outsider,shop,'barber','active');
 rejected:=false;
 begin perform public.upsert_booking_service(outsider,payload);
 exception when sqlstate '42501' then rejected:=true;end;
 if not rejected then raise exception 'BARBER_EDIT_ALLOWED';end if;
 -- Invalid archival cannot change availability or category.
 rejected:=false;
 begin perform public.upsert_booking_service(owner_id,payload||jsonb_build_object('archived',true));
 exception when sqlstate '22023' then rejected:=true;end;
 if not rejected then raise exception 'ACTIVE_ARCHIVE_ALLOWED';end if;
 rejected:=false;
 begin perform public.upsert_booking_service(owner_id,(payload-'id')||jsonb_build_object('name','Atomic test','category','Barba'));
 exception when raise_exception then rejected:=true;end;
 if not rejected or exists(select 1 from public.services where name='Atomic test' and barbershop_id=shop) then raise exception 'PARTIAL_SERVICE_WAS_COMMITTED';end if;
 -- Existing future reservations keep their historical items when a service is retired.
 insert into public.barber_profiles(barbershop_id,user_id,professional_name,active) values(shop,owner_id,'Test barber',true) returning id into professional;
 insert into public.barber_services(barbershop_id,barber_id,service_id,active) values(shop,professional,service_id,true);
 insert into public.barbershop_hours(barbershop_id,weekday,opens_min,closes_min) select shop,d,0,1440 from generate_series(0,6)d;
 insert into public.barber_schedules(barbershop_id,barber_id,weekday,opens_min,closes_min) select shop,professional,d,0,1440 from generate_series(0,6)d;
 select greatest(coalesce(max(occupied_until),now()),now())+interval '2 days' into starts from public.reservations;
 insert into public.reservations(barbershop_id,client_user_id,barber_id,barber_user_id,request_id,fingerprint,starts_at,ends_at,occupied_until,duration_min,buffer_min,total_amount,shop_name_snapshot,barber_name_snapshot,client_display_name_snapshot,policy_snapshot)
 values(shop,outsider,professional,owner_id,gen_random_uuid(),repeat('a',64),starts,starts+interval '30 minutes',starts+interval '30 minutes',30,0,15,'Test shop','Test barber','Client','{}') returning id into booking;
 insert into public.reservation_items(reservation_id,barbershop_id,service_id,name_snapshot,description_snapshot,price_snapshot,duration_min) values(booking,shop,service_id,'Corte clásico','Test',15,30);
 select md5(to_jsonb(r)::text) into before_booking from public.reservations r where id=booking;
 response := public.upsert_booking_service(owner_id,payload||jsonb_build_object('active',false,'archived',true));
 if response->'archived'<>'true'::jsonb or response->'active'<>'false'::jsonb then raise exception 'ARCHIVE_NOT_SAVED';end if;
 perform public.upsert_booking_service(owner_id,payload||jsonb_build_object('active',false,'archived',true));
 if (select count(*) from public.services where id=service_id)<>1 then raise exception 'ARCHIVE_DELETED_HISTORY';end if;
 if (select md5(to_jsonb(r)::text) from public.reservations r where id=booking)<>before_booking
 or not exists(select 1 from public.reservation_items i where i.reservation_id=booking and i.service_id=(response->>'id')::uuid and i.price_snapshot=15) then raise exception 'BOOKING_HISTORY_CHANGED';end if;
 rejected:=false;
 begin perform public.upsert_booking_service(owner_id,payload);
 exception when sqlstate '23505' then rejected:=true;end;
 if not rejected then raise exception 'ARCHIVED_REACTIVATED';end if;
 if has_function_privilege('anon','public.upsert_booking_service(uuid,jsonb)','execute')
 or has_function_privilege('authenticated','public.upsert_booking_service(uuid,jsonb)','execute')
 or not has_function_privilege('service_role','public.upsert_booking_service(uuid,jsonb)','execute') then raise exception 'RPC_GRANTS_INVALID';end if;
end;
$test$;
rollback;
