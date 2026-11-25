-- 004 T005: additive catalog foundation only. No booking RPC, reservation or data backfill.
begin;
create extension if not exists btree_gist with schema extensions;
set local search_path=public,extensions,pg_catalog;

create table public.barbershop_booking_settings (
 barbershop_id uuid primary key references public.barbershops(id) on delete restrict,
 publication_state text not null default 'draft' check(publication_state in('draft','published','paused','withdrawn')),
 public_contact text check(public_contact is null or length(btrim(public_contact))>0),
 address text check(address is null or length(btrim(address))>0),
 minimum_notice_min integer check(minimum_notice_min>=0),
 booking_horizon_days integer check(booking_horizon_days>0),
 max_future_per_client integer check(max_future_per_client>0),
 slot_step_min integer check(slot_step_min>0 and slot_step_min<=1440),
 buffer_min integer check(buffer_min>=0),
 cancellation_advance_min integer not null default 120 check(cancellation_advance_min>=0),
 version integer not null default 1 check(version>0),
 constraint booking_publication_complete check(publication_state not in('published','paused') or
  (public_contact is not null and address is not null and minimum_notice_min is not null and
   booking_horizon_days is not null and max_future_per_client is not null and slot_step_min is not null and buffer_min is not null))
);
create table public.services (
 id uuid primary key default gen_random_uuid(),barbershop_id uuid not null references public.barbershops(id) on delete restrict,
 name text not null check(length(btrim(name))>0),description text not null default '',
 price_amount numeric(12,2) not null check(price_amount>=0 and price_amount<>'NaN'::numeric),
 duration_min integer not null check(duration_min>0),active boolean not null default false,
 unique(id,barbershop_id)
);
create index services_shop_idx on public.services(barbershop_id,id);
create table public.barber_profiles (
 id uuid primary key default gen_random_uuid(),barbershop_id uuid not null,user_id uuid not null,
 professional_name text not null check(length(btrim(professional_name))>0),active boolean not null default false,
 constraint barber_profiles_membership_fkey foreign key(user_id,barbershop_id) references public.barbershop_memberships(user_id,barbershop_id) on delete restrict,
 unique(user_id,barbershop_id),unique(id,barbershop_id),unique(id,barbershop_id,user_id)
);
create index barber_profiles_shop_idx on public.barber_profiles(barbershop_id,id);
create table public.barber_services (
 barbershop_id uuid not null,barber_id uuid not null,service_id uuid not null,active boolean not null default true,
 primary key(barbershop_id,barber_id,service_id),
 foreign key(barber_id,barbershop_id) references public.barber_profiles(id,barbershop_id) on delete restrict,
 constraint barber_services_service_fkey foreign key(service_id,barbershop_id) references public.services(id,barbershop_id) on delete restrict
);
create index barber_services_professional_idx on public.barber_services(barber_id,barbershop_id);
create index barber_services_service_idx on public.barber_services(service_id,barbershop_id);
create table public.barbershop_hours (
 id uuid primary key default gen_random_uuid(),barbershop_id uuid not null references public.barbershops(id) on delete restrict,
 weekday integer not null check(weekday between 0 and 6),opens_min integer not null,closes_min integer not null,
 check(opens_min>=0 and opens_min<closes_min and closes_min<=1440),
 open_span int4range generated always as(int4range(opens_min,closes_min,'[)')) stored,
 exclude using gist(barbershop_id with =,weekday with =,open_span with &&) deferrable initially immediate
);
create table public.barber_schedules (
 id uuid primary key default gen_random_uuid(),barbershop_id uuid not null,barber_id uuid not null,
 weekday integer not null check(weekday between 0 and 6),opens_min integer not null,closes_min integer not null,
 check(opens_min>=0 and opens_min<closes_min and closes_min<=1440),
 open_span int4range generated always as(int4range(opens_min,closes_min,'[)')) stored,
 foreign key(barber_id,barbershop_id) references public.barber_profiles(id,barbershop_id) on delete restrict,
 exclude using gist(barber_id with =,weekday with =,open_span with &&) deferrable initially immediate
);
create index barber_schedules_shop_idx on public.barber_schedules(barbershop_id,barber_id);
create table public.schedule_exceptions (
 id uuid primary key default gen_random_uuid(),barbershop_id uuid not null references public.barbershops(id) on delete restrict,
 barber_id uuid,starts_at timestamptz not null,ends_at timestamptz not null,
 reason text check(reason is null or length(btrim(reason))>0),
 check(isfinite(starts_at) and isfinite(ends_at) and starts_at<ends_at),
 foreign key(barber_id,barbershop_id) references public.barber_profiles(id,barbershop_id) on delete restrict
);
create index schedule_exceptions_shop_time_idx on public.schedule_exceptions(barbershop_id,starts_at);
create index schedule_exceptions_barber_idx on public.schedule_exceptions(barber_id,barbershop_id);
create table public.staff_invitations (
 id uuid primary key default gen_random_uuid(),barbershop_id uuid not null references public.barbershops(id) on delete restrict,
 recipient_user_id uuid not null references public.profiles(id) on delete restrict,
 inviter_user_id uuid not null references public.profiles(id) on delete restrict,
 role text not null default 'barber' check(role='barber'),
 status text not null default 'pending' check(status in('pending','accepted','rejected','cancelled')),
 created_at timestamptz not null default statement_timestamp(),responded_at timestamptz,
 check(isfinite(created_at) and (responded_at is null or(isfinite(responded_at) and responded_at>=created_at))),
 check((status='pending' and responded_at is null) or(status<>'pending' and responded_at is not null))
);
create unique index staff_invitations_one_pending on public.staff_invitations(barbershop_id,recipient_user_id) where status='pending';
create index staff_invitations_recipient_idx on public.staff_invitations(recipient_user_id,status);
create index staff_invitations_inviter_idx on public.staff_invitations(inviter_user_id);

-- Constraint trigger validates containment in the UNION of the shop intervals. Not an API.
create function private.check_booking_hours() returns trigger
language plpgsql security definer set search_path='' as $fn$
declare v_shop uuid;
begin
 for v_shop in select distinct id from pg_catalog.unnest(array[
  case when tg_op<>'DELETE' then new.barbershop_id end,
  case when tg_op<>'INSERT' then old.barbershop_id end]) as changed(id) where id is not null order by id
 loop
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('booking-hours:'||v_shop::text,0));
  if exists(select 1 from public.barber_schedules s where s.barbershop_id=v_shop and not coalesce(
   (select pg_catalog.range_agg(h.open_span) from public.barbershop_hours h where h.barbershop_id=v_shop and h.weekday=s.weekday) @> s.open_span,false))
  then raise exception using errcode='23514',message='Professional hours outside shop hours';end if;
 end loop;
 return null;
end;
$fn$;
revoke all on function private.check_booking_hours() from public,anon,authenticated,service_role;
create constraint trigger shop_hours_containment after insert or update or delete on public.barbershop_hours deferrable initially immediate for each row execute function private.check_booking_hours();
create constraint trigger professional_hours_containment after insert or update or delete on public.barber_schedules deferrable initially immediate for each row execute function private.check_booking_hours();

alter table public.barbershop_booking_settings enable row level security;
revoke all on table public.barbershop_booking_settings from public,anon,authenticated,service_role;
grant select on public.barbershop_booking_settings to authenticated;
create policy barbershop_booking_settings_read on public.barbershop_booking_settings for select to authenticated using (private.is_active_member(barbershop_id));

alter table public.services enable row level security;
revoke all on table public.services from public,anon,authenticated,service_role;
grant select on public.services to authenticated;
create policy services_read on public.services for select to authenticated using (private.is_active_member(barbershop_id));

alter table public.barber_profiles enable row level security;
revoke all on table public.barber_profiles from public,anon,authenticated,service_role;
grant select on public.barber_profiles to authenticated;
create policy barber_profiles_read on public.barber_profiles for select to authenticated using (private.is_active_member(barbershop_id));

alter table public.barber_services enable row level security;
revoke all on table public.barber_services from public,anon,authenticated,service_role;
grant select on public.barber_services to authenticated;
create policy barber_services_read on public.barber_services for select to authenticated using (private.is_active_member(barbershop_id));

alter table public.barbershop_hours enable row level security;
revoke all on table public.barbershop_hours from public,anon,authenticated,service_role;
grant select on public.barbershop_hours to authenticated;
create policy barbershop_hours_read on public.barbershop_hours for select to authenticated using (private.is_active_member(barbershop_id));

alter table public.barber_schedules enable row level security;
revoke all on table public.barber_schedules from public,anon,authenticated,service_role;
grant select on public.barber_schedules to authenticated;
create policy barber_schedules_read on public.barber_schedules for select to authenticated using (private.is_active_member(barbershop_id));

alter table public.schedule_exceptions enable row level security;
revoke all on table public.schedule_exceptions from public,anon,authenticated,service_role;
grant select on public.schedule_exceptions to authenticated;
create policy schedule_exceptions_read on public.schedule_exceptions for select to authenticated using (private.is_active_member(barbershop_id));

alter table public.staff_invitations enable row level security;
revoke all on table public.staff_invitations from public,anon,authenticated,service_role;
grant select(id,barbershop_id,recipient_user_id,role,status,created_at,responded_at) on public.staff_invitations to authenticated;
create policy staff_invitations_read on public.staff_invitations for select to authenticated using (recipient_user_id=(select auth.uid()) or private.is_active_admin(barbershop_id));

-- No backfill, direct business writes, new RPC or reservation tables in T005.
commit;
