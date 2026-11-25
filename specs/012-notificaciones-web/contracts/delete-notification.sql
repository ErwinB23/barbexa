-- DRAFT: approval required before any database execution, including rehearsal.
-- User-visible removal uses a tombstone: preserve deduplication and business history.
begin;
alter table private.web_notifications add column deleted_at timestamptz;
create index web_notifications_active_inbox on private.web_notifications(recipient_id,created_at desc,id desc) where deleted_at is null;

create or replace function public.list_my_notifications() returns jsonb
language plpgsql security definer set search_path='' as $fn$
declare result jsonb; total bigint;
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception using errcode='42501',message='UNAUTHENTICATED';end if;
 select count(*) into total from private.web_notifications n where n.deleted_at is null and private.web_notice_visible(n) and n.read_at is null;
 select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'title',q.title,'message',q.message,'target',q.target,'createdAt',q.created_at,'readAt',q.read_at) order by q.created_at desc,q.id desc),'[]'::jsonb)
 into result from(select n.* from private.web_notifications n where n.deleted_at is null and private.web_notice_visible(n) order by n.created_at desc,n.id desc limit 50) q;
 return jsonb_build_object('items',result,'unread',total,'canRemove',true);
end;$fn$;
revoke all on function public.list_my_notifications() from public,anon,service_role;
grant execute on function public.list_my_notifications() to authenticated;

create or replace function public.read_my_notification(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $fn$
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception using errcode='42501',message='UNAUTHENTICATED';end if;
 update private.web_notifications n set read_at=coalesce(n.read_at,statement_timestamp()) where n.id=p_id and n.deleted_at is null and private.web_notice_visible(n);
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 return jsonb_build_object('read',true);
end;$fn$;
revoke all on function public.read_my_notification(uuid) from public,anon,service_role;
grant execute on function public.read_my_notification(uuid) to authenticated;


create function public.delete_my_notification(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $fn$
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
  raise exception using errcode='42501',message='UNAUTHENTICATED';
 end if;
 -- Visibility still binds recipient and the current membership for staff notices.
 -- No deleted_at filter here: repeating an uncertain request is idempotent.
 update private.web_notifications n
 set deleted_at=coalesce(n.deleted_at,statement_timestamp())
 where n.id=p_id and private.web_notice_visible(n);
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 return jsonb_build_object('deleted',true);
end;$fn$;
revoke all on function public.delete_my_notification(uuid) from public,anon,service_role;
grant execute on function public.delete_my_notification(uuid) to authenticated;
commit;
