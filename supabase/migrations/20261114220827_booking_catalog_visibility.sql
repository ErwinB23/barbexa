-- Directed regression fix: preserve all existing ACL and signatures. No data rewrite.
begin;
create or replace function private.booking_catalog(actor uuid,shop uuid) returns jsonb language plpgsql stable security definer set search_path='' as $fn$
declare result jsonb;
begin
 if actor is distinct from (select auth.uid()) then raise exception using errcode='42501',message='FORBIDDEN';end if;
 perform private.booking_actor(actor);
 select jsonb_build_object('barbershopId',b.id,'name',b.name,'publicationState',s.publication_state,'publicContact',s.public_contact,'address',s.address,'policies',jsonb_build_object('minimumNoticeMin',s.minimum_notice_min,'bookingHorizonDays',s.booking_horizon_days,'maxFuturePerClient',s.max_future_per_client,'slotStepMin',s.slot_step_min,'bufferMin',s.buffer_min,'cancellationAdvanceMin',s.cancellation_advance_min),
 'services',coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'barbershopId',shop,'name',v.name,'description',v.description,'price',jsonb_build_object('amountMinor',(v.price_amount*100)::bigint,'currency','PEN'),'durationMin',v.duration_min,'active',v.active) order by v.id) from public.services v where v.barbershop_id=shop and v.active),'[]'),
 'professionals',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'barbershopId',shop,'professionalName',p.professional_name,'active',p.active) order by p.id) from public.barber_profiles p join public.barbershop_memberships m on m.user_id=p.user_id and m.barbershop_id=shop and m.status='active' where p.barbershop_id=shop and p.active and exists(select 1 from public.barber_schedules h where h.barber_id=p.id and h.barbershop_id=shop)),'[]'),
 'capabilities',coalesce((select jsonb_agg(jsonb_build_object('barberId',c.barber_id,'serviceId',c.service_id) order by c.barber_id,c.service_id) from public.barber_services c join public.services v on v.id=c.service_id and v.barbershop_id=shop and v.active join public.barber_profiles p on p.id=c.barber_id and p.barbershop_id=shop and p.active join public.barbershop_memberships m on m.user_id=p.user_id and m.barbershop_id=shop and m.status='active' where c.barbershop_id=shop and c.active and exists(select 1 from public.barber_schedules h where h.barber_id=p.id and h.barbershop_id=shop)),'[]')) into result
 from public.barbershops b join public.barbershop_booking_settings s on s.barbershop_id=b.id where b.id=shop and s.publication_state in('published','paused');
 if result is null then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 return result;
end;$fn$;
notify pgrst, 'reload schema';
commit;
