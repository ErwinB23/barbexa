-- Initial business schema only. No ordinary access is enabled in this increment.
begin;

create table public.profiles (
  id uuid primary key,
  display_name text not null,
  phone text,
  constraint profiles_auth_user_fkey foreign key (id)
    references auth.users (id) on delete restrict,
  constraint profiles_display_name_not_blank check (char_length(btrim(display_name)) > 0)
);
alter table public.profiles enable row level security;
revoke all privileges on table public.profiles from public, anon, authenticated, service_role;

create table public.barbershops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  constraint barbershops_name_not_blank check (char_length(btrim(name)) > 0)
);
alter table public.barbershops enable row level security;
revoke all privileges on table public.barbershops from public, anon, authenticated, service_role;

create table public.barbershop_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  barbershop_id uuid not null,
  role text not null,
  status text not null,
  constraint barbershop_memberships_user_fkey foreign key (user_id)
    references public.profiles (id) on delete restrict,
  constraint barbershop_memberships_shop_fkey foreign key (barbershop_id)
    references public.barbershops (id) on delete restrict,
  constraint barbershop_memberships_user_shop_key unique (user_id, barbershop_id),
  constraint barbershop_memberships_role_valid check (role in ('barber', 'administrator')),
  constraint barbershop_memberships_status_valid check (status in ('active', 'inactive'))
);
alter table public.barbershop_memberships enable row level security;
revoke all privileges on table public.barbershop_memberships from public, anon, authenticated, service_role;

create index barbershop_memberships_shop_user_idx
  on public.barbershop_memberships (barbershop_id, user_id);
revoke create on schema public from public, anon, authenticated, service_role;

commit;
