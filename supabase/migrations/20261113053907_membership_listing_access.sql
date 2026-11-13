begin;

-- Own relations remain visible even when inactive; colleague visibility is contextual.
-- The helper checks auth.uid() and current persisted membership, not JWT metadata.
alter policy memberships_select_own on public.barbershop_memberships
  using (user_id = (select auth.uid()) or private.is_active_admin(barbershop_id));

create function public.list_barbershop_memberships(p_barbershop_id uuid)
returns table (id uuid, user_id uuid, barbershop_id uuid, role text, status text)
language plpgsql security invoker set search_path = '' as $function$
begin
  if not private.is_active_admin(p_barbershop_id) then
    raise exception using errcode = '42501', message = 'FORBIDDEN';
  end if;
  return query
    select m.id, m.user_id, m.barbershop_id, m.role, m.status
    from public.barbershop_memberships m
    where m.barbershop_id = p_barbershop_id;
end;
$function$;

revoke all on function public.list_barbershop_memberships(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.list_barbershop_memberships(uuid) to authenticated;

-- No membership write grants or profile access are added.
commit;
