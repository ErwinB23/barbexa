-- Verify the deployed RPC with the real Edge role; leave no service behind.
begin;
set local statement_timeout='20s';
do $smoke$
declare actor uuid; shop uuid; payload jsonb; result jsonb; target uuid;
begin
 select o.owner_user_id,o.barbershop_id into strict actor,shop
 from private.barbershop_ownership o join public.barbershop_memberships m on m.user_id=o.owner_user_id and m.barbershop_id=o.barbershop_id
 join auth.users u on u.id=o.owner_user_id
 where m.role='administrator' and m.status='active' and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false) limit 1;
 payload:=jsonb_build_object('barbershopId',shop,'name','Service transaction check','description','Rolled back verification',
 'price',jsonb_build_object('currency','PEN','amountMinor',1550),'durationMin',30,'active',true,'category','Corte de cabello');
 perform set_config('role','service_role',true);
 result:=public.upsert_booking_service(actor,payload);
 target:=(result->>'id')::uuid;
 if result->>'category'<>'Corte de cabello' or result->'price'->>'amountMinor'<>'1550' then raise exception 'CREATE_INVALID';end if;
 result:=public.upsert_booking_service(actor,payload||jsonb_build_object('id',target,'category','Barba'));
 if result->>'category'<>'Barba' then raise exception 'EDIT_INVALID';end if;
 result:=public.upsert_booking_service(actor,payload||jsonb_build_object('id',target,'active',false,'archived',true));
 if result->'archived'<>'true'::jsonb or result->'active'<>'false'::jsonb then raise exception 'ARCHIVE_INVALID';end if;
end;
$smoke$;
rollback;
