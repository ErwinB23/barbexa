-- DRAFT: not applied to LOCAL or Cloud. Requires separate activation approval.
-- Depends on migrations 1–18. Additive, no historical backfill or email/push.
begin;
create table private.web_notifications (
 id uuid primary key default gen_random_uuid(),
 recipient_id uuid not null references public.profiles(id) on delete restrict,
 barbershop_id uuid not null references public.barbershops(id) on delete restrict,
 resource_id uuid not null,
 source_key text not null,
 staff boolean not null,
 title text not null check(length(title) between 1 and 160),
 message text not null check(length(message) between 1 and 1000),
 target text not null check(target in('/staff','/my-reservations','/agenda')),
 created_at timestamptz not null default statement_timestamp(), read_at timestamptz,
 unique(recipient_id,source_key)
);
create index web_notifications_inbox on private.web_notifications(recipient_id,created_at desc,id desc);
create index web_notifications_unread on private.web_notifications(recipient_id) where read_at is null;
alter table private.web_notifications enable row level security;
revoke all on private.web_notifications from public,anon,authenticated,service_role;

-- Private storage is never exposed; public RPCs bind the signed JWT identity.
create function private.web_notice_visible(n private.web_notifications) returns boolean
language sql stable security definer set search_path='' as $fn$
 select n.recipient_id=auth.uid() and (
  not n.staff or exists(select 1 from public.barbershop_memberships m
   where m.barbershop_id=n.barbershop_id and m.user_id=auth.uid() and m.status='active'
   and (m.role='administrator' or exists(select 1 from public.reservations r
    where r.id=n.resource_id and r.barbershop_id=n.barbershop_id and r.barber_user_id=auth.uid())))
 );
$fn$;
revoke all on function private.web_notice_visible(private.web_notifications) from public,anon,authenticated,service_role;

create function public.list_my_notifications() returns jsonb
language plpgsql security definer set search_path='' as $fn$
declare result jsonb; total bigint;
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception using errcode='42501',message='UNAUTHENTICATED';end if;
 select count(*) into total from private.web_notifications n where private.web_notice_visible(n) and n.read_at is null;
 select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'title',q.title,'message',q.message,'target',q.target,'createdAt',q.created_at,'readAt',q.read_at) order by q.created_at desc,q.id desc),'[]'::jsonb)
 into result from(select n.* from private.web_notifications n where private.web_notice_visible(n) order by n.created_at desc,n.id desc limit 50) q;
 return jsonb_build_object('items',result,'unread',total);
end;$fn$;
revoke all on function public.list_my_notifications() from public,anon,service_role;
grant execute on function public.list_my_notifications() to authenticated;

create function public.read_my_notification(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $fn$
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception using errcode='42501',message='UNAUTHENTICATED';end if;
 update private.web_notifications n set read_at=coalesce(n.read_at,statement_timestamp()) where n.id=p_id and private.web_notice_visible(n);
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 return jsonb_build_object('read',true);
end;$fn$;
revoke all on function public.read_my_notification(uuid) from public,anon,service_role;
grant execute on function public.read_my_notification(uuid) to authenticated;

create function private.web_notice_reservation(reservation uuid, source text, caption text) returns void
language plpgsql security definer set search_path='' as $fn$
declare r public.reservations; recipient uuid;
begin
 select * into strict r from public.reservations where id=reservation;
 -- UNION deduplicates the owner who is also the assigned professional or client.
 for recipient in select r.client_user_id union select r.barber_user_id
  union select m.user_id from public.barbershop_memberships m where m.barbershop_id=r.barbershop_id and m.role='administrator' and m.status='active'
 loop
  insert into private.web_notifications(recipient_id,barbershop_id,resource_id,source_key,staff,title,message,target)
   values(recipient,r.barbershop_id,r.id,source,recipient<>r.client_user_id,caption,
    r.shop_name_snapshot||' · '||to_char(r.starts_at at time zone 'America/Lima','DD/MM/YYYY HH24:MI')||' · hora de Lima',
    case when recipient=r.client_user_id then '/my-reservations' else '/agenda' end)
   on conflict(recipient_id,source_key) do nothing;
 end loop;
end;$fn$;
revoke all on function private.web_notice_reservation(uuid,text,text) from public,anon,authenticated,service_role;

create function private.web_notice_reservation_event() returns trigger
language plpgsql security definer set search_path='' as $fn$
begin
 perform private.web_notice_reservation(new.reservation_id,'reservation:'||new.id,
  case new.kind when 'confirmed' then 'Reserva confirmada' else 'Reserva cancelada' end);
 return new;
end;$fn$;
create trigger web_notice_reservation after insert on public.reservation_events for each row execute function private.web_notice_reservation_event();

create function private.web_notice_care_event() returns trigger
language plpgsql security definer set search_path='' as $fn$
declare caption text;
begin
 caption:=case new.kind when 'start' then 'Atención iniciada' when 'complete' then 'Atención completada' when 'no-show' then 'Inasistencia registrada' when 'receive' then 'Pago recibido' when 'refund' then 'Reembolso registrado' else null end;
 if new.reservation_id is not null and caption is not null then
  perform private.web_notice_reservation(new.reservation_id,'care:'||new.id,caption);
 end if;
 return new;
end;$fn$;
create trigger web_notice_care after insert on private.care_events for each row execute function private.web_notice_care_event();

create function private.web_notice_reschedule_event() returns trigger
language plpgsql security definer set search_path='' as $fn$
begin
 perform private.web_notice_reservation(new.reservation_id,'reschedule:'||new.id,'Reserva reprogramada');
 return new;
end;$fn$;
create trigger web_notice_reschedule after insert on private.reschedule_events for each row execute function private.web_notice_reschedule_event();

create function private.web_notice_invitation_event() returns trigger
language plpgsql security definer set search_path='' as $fn$
declare shop_name text;
begin
 if tg_op='UPDATE' and new.status is not distinct from old.status then return new;end if;
 select name into strict shop_name from public.barbershops where id=new.barbershop_id;
 insert into private.web_notifications(recipient_id,barbershop_id,resource_id,source_key,staff,title,message,target)
 values(case when new.status in('pending','cancelled') then new.recipient_user_id else new.inviter_user_id end,
  new.barbershop_id,new.id,'invitation:'||new.id||':'||new.status,false,
  case new.status when 'pending' then 'Invitación recibida' when 'accepted' then 'Invitación aceptada' when 'rejected' then 'Invitación rechazada' else 'Invitación cancelada' end,
  shop_name||' · '||case new.status when 'pending' then 'Tienes una invitación para formar parte del equipo.' when 'accepted' then 'Tu invitación fue aceptada.' when 'rejected' then 'Tu invitación fue rechazada.' else 'La invitación fue cancelada.' end,
  case when new.status in('pending','cancelled') then '/staff' else '/agenda' end)
 on conflict(recipient_id,source_key) do nothing;
 return new;
end;$fn$;
create trigger web_notice_invitation after insert or update of status on public.staff_invitations for each row execute function private.web_notice_invitation_event();
revoke all on function private.web_notice_reservation_event(),private.web_notice_care_event(),private.web_notice_reschedule_event(),private.web_notice_invitation_event() from public,anon,authenticated,service_role;
commit;
