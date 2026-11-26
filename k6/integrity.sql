-- Read-only: run only through the guarded operator against barbexa-k6-lab.
begin read only;
select jsonb_build_object(
  'reservations', (select count(*) from public.reservations),
  'overlaps', (select count(*) from public.reservations a join public.reservations b
    on a.id < b.id and a.barber_user_id=b.barber_user_id and a.occupied && b.occupied
    where a.state='confirmed' and b.state='confirmed'),
  'duplicateRequests', (select count(*) from (select client_user_id,barbershop_id,request_id
    from public.reservations group by 1,2,3 having count(*)>1) d),
  'partialReservations', (select count(*) from public.reservations r where
    not exists(select 1 from public.reservation_items i where i.reservation_id=r.id)
    or (select coalesce(sum(i.duration_min),0) from public.reservation_items i where i.reservation_id=r.id)<>r.duration_min
    or (select coalesce(sum(i.price_snapshot),0) from public.reservation_items i where i.reservation_id=r.id)<>r.total_amount
    or (select count(*) from public.reservation_events e where e.reservation_id=r.id and e.kind='confirmed')<>1
    or not exists(select 1 from private.booking_care c where c.reservation_id=r.id and c.barbershop_id=r.barbershop_id)),
  'tenantMismatch', (select count(*) from public.reservation_items i join public.reservations r on r.id=i.reservation_id
    join public.services s on s.id=i.service_id where i.barbershop_id<>r.barbershop_id or i.barbershop_id<>s.barbershop_id),
  'duplicateReceipts', (select count(*) from (select reservation_id from private.care_events
    where kind='receive' group by reservation_id having count(*)>1) d)
);
rollback;
