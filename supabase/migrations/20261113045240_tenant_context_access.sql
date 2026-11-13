begin;

-- Actor is exclusively auth.uid(); no alternate user parameter or JWT role metadata.
create function private.is_active_member(p_shop_id uuid) returns boolean
language sql stable security definer set search_path = '' as $function$
  select exists (
    select 1 from public.barbershop_memberships m
    where m.barbershop_id = p_shop_id and m.user_id = (select auth.uid())
      and m.status = 'active'
  );
$function$;
create function private.is_active_admin(p_shop_id uuid) returns boolean
language sql stable security definer set search_path = '' as $function$
  select exists (
    select 1 from public.barbershop_memberships m
    where m.barbershop_id = p_shop_id and m.user_id = (select auth.uid())
      and m.status = 'active' and m.role = 'administrator'
  );
$function$;
revoke all on function private.is_active_member(uuid) from public, anon, authenticated, service_role;
revoke all on function private.is_active_admin(uuid) from public, anon, authenticated, service_role;
grant usage on schema private to authenticated;
grant execute on function private.is_active_member(uuid), private.is_active_admin(uuid) to authenticated;

grant select (id, name) on public.barbershops to authenticated;
grant update (name) on public.barbershops to authenticated;
create policy barbershops_select_active_member on public.barbershops
  for select to authenticated using (private.is_active_member(id));
create policy barbershops_update_active_admin on public.barbershops
  for update to authenticated using (private.is_active_admin(id))
  with check (private.is_active_admin(id));

grant select (id, user_id, barbershop_id, role, status)
  on public.barbershop_memberships to authenticated;
create policy memberships_select_own on public.barbershop_memberships
  for select to authenticated using (user_id = (select auth.uid()));
-- No membership writes, shop creation, staff listing or provisioning RPC in this step.
commit;
