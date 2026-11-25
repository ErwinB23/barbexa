-- 015: additive administrative invitation history, no data or permission changes.
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
create or replace function private.booking_invitations(actor uuid,shop uuid) returns jsonb language plpgsql stable security definer set search_path='' as $fn$
begin
 if actor is distinct from (select auth.uid()) then raise exception using errcode='42501',message='FORBIDDEN';end if;
 perform private.booking_actor(actor);
 if shop is not null and not exists(select 1 from public.barbershop_memberships where user_id=actor and barbershop_id=shop and role='administrator' and status='active') then raise exception using errcode='42501',message='FORBIDDEN';end if;
 if shop is null then
  return coalesce((select jsonb_agg(private.booking_invitation_json(i)||jsonb_build_object('barbershopName',b.name) order by i.created_at,i.id) from public.staff_invitations i join public.barbershops b on b.id=i.barbershop_id where i.recipient_user_id=actor),'[]');
 end if;
 return coalesce((select jsonb_agg(private.booking_invitation_json(i)||jsonb_build_object(
   'barbershopName',b.name,'recipientName',p.display_name,
   'createdAt',to_char(i.created_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
   'respondedAt',case when i.responded_at is null then null else to_char(i.responded_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') end,
   'professionalActive',case when i.status<>'accepted' or bp.id is null then null else bp.active and coalesce(m.status='active',false) end
  ) order by i.created_at desc,i.id desc)
 from public.staff_invitations i join public.barbershops b on b.id=i.barbershop_id
 join public.profiles p on p.id=i.recipient_user_id
 left join public.barber_profiles bp on bp.barbershop_id=i.barbershop_id and bp.user_id=i.recipient_user_id
 left join public.barbershop_memberships m on m.barbershop_id=i.barbershop_id and m.user_id=i.recipient_user_id
 where i.barbershop_id=shop),'[]');
end;$fn$;
notify pgrst, 'reload schema';
commit;
