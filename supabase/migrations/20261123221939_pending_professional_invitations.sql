-- 016: pending recipient email for the authorized administrator and in-app reminder.
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
   'recipientEmail',case when i.role='barber' and i.status='pending' then (select u.email from auth.users u where u.id=i.recipient_user_id) else null end,
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
create function public.remind_professional_invitation(p_shop_id uuid,p_invitation_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $fn$
declare actor uuid:=(select auth.uid()); i public.staff_invitations; shop_name text; stamp timestamptz:=statement_timestamp();
begin
 perform private.booking_actor(actor);
 perform private.authority_assert(actor,p_shop_id,'team',true);
 select * into i from public.staff_invitations where id=p_invitation_id and barbershop_id=p_shop_id for update;
 if not found or i.role<>'barber' or i.status<>'pending' then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 if exists(select 1 from private.web_notifications n where n.resource_id=i.id and n.recipient_id=i.recipient_user_id and n.source_key like 'invitation-reminder:%' and n.created_at>stamp-interval '60 seconds') then return jsonb_build_object('created',false);end if;
 select name into strict shop_name from public.barbershops where id=p_shop_id;
 insert into private.web_notifications(recipient_id,barbershop_id,resource_id,source_key,staff,title,message,target,created_at)
 values(i.recipient_user_id,p_shop_id,i.id,'invitation-reminder:'||i.id||':'||gen_random_uuid(),false,'Invitación pendiente',shop_name||' · Te recordamos que tienes una invitación para formar parte del equipo.','/staff',stamp);
 return jsonb_build_object('created',true);
end;$fn$;
revoke all on function public.remind_professional_invitation(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.remind_professional_invitation(uuid,uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
