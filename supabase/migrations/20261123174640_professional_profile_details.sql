-- 013: prepared only. Applying to any database requires specific authorization.
begin;
create function private.professional_social_valid(v text, platform text)
returns boolean language sql immutable security invoker set search_path='' as $fn$
 select v is null or (v=pg_catalog.btrim(v) and pg_catalog.char_length(v) between 1 and 250 and
 ((pg_catalog.char_length(v)<=100 and v !~ $rx$[[:cntrl:]<>:/\\]$rx$) or
 case platform
 when 'instagram' then v ~* $rx$^https://(www\.)?instagram\.com(/[^[:space:]<>\\]*)?$$rx$
 when 'tiktok' then v ~* $rx$^https://((www|vm|vt)\.)?tiktok\.com(/[^[:space:]<>\\]*)?$$rx$
 when 'facebook' then v ~* $rx$^https://((www|m)\.)?(facebook\.com|fb\.com)(/[^[:space:]<>\\]*)?$$rx$
 else false end));
$fn$;
alter table public.barber_profiles
 add column professional_description text not null default '' check(pg_catalog.char_length(professional_description)<=250),
 add column instagram text check(private.professional_social_valid(instagram,'instagram')),
 add column tiktok text check(private.professional_social_valid(tiktok,'tiktok')),
 add column facebook text check(private.professional_social_valid(facebook,'facebook'));
-- Do not invent historical dates: existing memberships remain NULL.
alter table public.barbershop_memberships add column joined_at timestamptz check(joined_at is null or pg_catalog.isfinite(joined_at));
alter table public.barbershop_memberships alter column joined_at set default statement_timestamp();

create function private.own_professional_profile_details(actor uuid, action text, data jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $fn$
declare
 shop uuid; member public.barbershop_memberships%rowtype; person public.barber_profiles%rowtype;
 draft jsonb; new_name text; bio text; ig text; tt text; fb text; shop_name text;
begin
 perform private.booking_actor(actor);
 if action='read' then perform private.booking_keys(data,array['barbershopId']);
 elsif action='write' then
  perform private.booking_keys(data,array['barbershopId','profile']);
  draft:=data->'profile';
  perform private.booking_keys(draft,array['professionalName','description','instagram','tiktok','facebook']);
  if pg_catalog.jsonb_typeof(draft->'professionalName') is distinct from 'string' or
     pg_catalog.jsonb_typeof(draft->'description') is distinct from 'string' or
     pg_catalog.jsonb_typeof(draft->'instagram') not in ('string','null') or
     pg_catalog.jsonb_typeof(draft->'tiktok') not in ('string','null') or
     pg_catalog.jsonb_typeof(draft->'facebook') not in ('string','null') then
   raise exception using errcode='22023',message='INVALID_INPUT';
  end if;
  new_name:=pg_catalog.btrim(draft->>'professionalName'); bio:=pg_catalog.btrim(draft->>'description');
  ig:=nullif(pg_catalog.btrim(draft->>'instagram'),''); tt:=nullif(pg_catalog.btrim(draft->>'tiktok'),''); fb:=nullif(pg_catalog.btrim(draft->>'facebook'),'');
  if new_name='' or pg_catalog.char_length(bio)>250 or not private.professional_social_valid(ig,'instagram') or
    not private.professional_social_valid(tt,'tiktok') or not private.professional_social_valid(fb,'facebook') then
   raise exception using errcode='22023',message='INVALID_INPUT';
  end if;
 else raise exception using errcode='22023',message='INVALID_INPUT'; end if;
 if pg_catalog.jsonb_typeof(data->'barbershopId') is distinct from 'string' then raise exception using errcode='22023',message='INVALID_INPUT';end if;
 shop:=(data->>'barbershopId')::uuid;
 -- Preserve existing lock order and current membership verification from008.
 if action='write' then perform 1 from public.barbershop_booking_settings where barbershop_id=shop for update;
 else perform 1 from public.barbershop_booking_settings where barbershop_id=shop for share;end if;
 if not found then raise exception using errcode='42501',message='FORBIDDEN';end if;
 select m.* into member from public.barbershop_memberships m where m.user_id=actor and m.barbershop_id=shop
  and m.status='active' and m.role in('barber','administrator') for share;
 if not found then raise exception using errcode='42501',message='FORBIDDEN';end if;
 if action='write' then select p.* into person from public.barber_profiles p where p.user_id=actor and p.barbershop_id=shop and p.active for update;
 else select p.* into person from public.barber_profiles p where p.user_id=actor and p.barbershop_id=shop and p.active for share;end if;
 if not found then raise exception using errcode='P0002',message='NOT_AVAILABLE';end if;
 if action='write' and (person.professional_name,person.professional_description,person.instagram,person.tiktok,person.facebook)
  is distinct from (new_name,bio,ig,tt,fb) then
  update public.barber_profiles set professional_name=new_name,professional_description=bio,instagram=ig,tiktok=tt,facebook=fb
   where id=person.id and user_id=actor and barbershop_id=shop returning * into person;
  update public.barbershop_booking_settings set version=version+1 where barbershop_id=shop;
 end if;
 select b.name into shop_name from public.barbershops b where b.id=shop;
 return pg_catalog.jsonb_build_object('id',person.id,'userId',person.user_id,'barbershopId',shop,'active',person.active,
  'professionalName',person.professional_name,'description',person.professional_description,'instagram',person.instagram,'tiktok',person.tiktok,'facebook',person.facebook,
  'barbershopName',shop_name,'memberSince',case when member.joined_at is null then null else pg_catalog.to_char(member.joined_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') end);
end;
$fn$;
create function public.get_own_professional_profile_details(p_actor_id uuid,p_data jsonb)
returns jsonb language sql security definer set search_path='' as $fn$
 select private.own_professional_profile_details(p_actor_id,'read',p_data);
$fn$;
create function public.update_own_professional_profile_details(p_actor_id uuid,p_data jsonb)
returns jsonb language sql security definer set search_path='' as $fn$
 select private.own_professional_profile_details(p_actor_id,'write',p_data);
$fn$;
revoke all on function private.professional_social_valid(text,text),private.own_professional_profile_details(uuid,text,jsonb),
 public.get_own_professional_profile_details(uuid,jsonb),public.update_own_professional_profile_details(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.get_own_professional_profile_details(uuid,jsonb),public.update_own_professional_profile_details(uuid,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
