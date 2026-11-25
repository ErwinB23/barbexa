-- Prepared locally. Apply only after explicit database authorization.
begin;
alter table public.services
  add column category text not null default 'Otros'
    check (category in ('Corte de cabello','Barba','Tratamientos','Otros')),
  add column archived boolean not null default false,
  add constraint services_archived_not_active check (not archived or not active);

-- Preserve the grouping previously shown for existing services.
update public.services set category = case
  when lower(name) ~ 'corte|cabello|fade|peinado' then 'Corte de cabello'
  when lower(name) ~ 'barba|bigote|afeitado' then 'Barba'
  when lower(name) ~ 'tratamiento|capilar|hidrat|masaje|lavado' then 'Tratamientos'
  else 'Otros' end;

-- Keep the existing command's locks, tenant checks and future-booking invariants.
-- All metadata and availability writes commit together or roll back together.
create or replace function private.upsert_service_catalog(p_actor_id uuid,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $fn$
declare result jsonb; shop uuid; target uuid; next_category text; is_archived boolean;
begin
  perform private.booking_actor(p_actor_id);
  perform private.booking_keys(p_data,array['barbershopId','name','description','price','durationMin','active'],array['id','category','archived']);
  shop := (p_data->>'barbershopId')::uuid;
  perform private.authority_lock(shop);
  perform private.authority_assert(p_actor_id,shop,'services');
  if p_data ? 'category' then
    if jsonb_typeof(p_data->'category') is distinct from 'string'
      or p_data->>'category' not in ('Corte de cabello','Barba','Tratamientos','Otros') then
      raise exception using errcode='22023',message='INVALID_INPUT';
    end if;
    next_category := p_data->>'category';
  end if;
  if p_data ? 'archived' and (p_data->'archived' is distinct from 'true'::jsonb
      or not p_data ? 'id' or p_data->'active' is distinct from 'false'::jsonb) then
    raise exception using errcode='22023',message='INVALID_INPUT';
  end if;
  if p_data ? 'id' then
    target := (p_data->>'id')::uuid;
    select archived into is_archived from public.services where id=target and barbershop_id=shop for update;
    if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
    if is_archived then
      if p_data->'archived' = 'true'::jsonb then
        return (select jsonb_build_object('id',s.id,'barbershopId',s.barbershop_id,'name',s.name,'description',s.description,'price',jsonb_build_object('currency','PEN','amountMinor',(s.price_amount*100)::bigint),'durationMin',s.duration_min,'active',s.active,'archived',s.archived,'category',s.category) from public.services s where s.id=target and s.barbershop_id=shop);
      end if;
      raise exception using errcode='23505',message='CONFLICT';
    end if;
  end if;
  result := private.booking_command(p_actor_id,'upsert-service',p_data-'category'-'archived');
  target := (result->>'id')::uuid;
  update public.services set category=coalesce(next_category,category),
    archived=coalesce((p_data->>'archived')::boolean,archived)
    where id=target and barbershop_id=shop;
  return result || (select jsonb_build_object('category',category,'archived',archived) from public.services where id=target and barbershop_id=shop);
end;$fn$;
revoke all on function private.upsert_service_catalog(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function private.upsert_service_catalog(uuid,jsonb) to service_role;
create or replace function public.upsert_booking_service(p_actor_id uuid,p_data jsonb)
returns jsonb language sql security invoker set search_path='' as $fn$
 select private.upsert_service_catalog(p_actor_id,p_data);
$fn$;
revoke all on function public.upsert_booking_service(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.upsert_booking_service(uuid,jsonb) to service_role;
commit;
