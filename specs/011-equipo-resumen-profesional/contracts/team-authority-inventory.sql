-- PREPARED READ ONLY. Not executed. Review target and authorize connection separately.
-- Phase before migration: never infer owner from order or earliest membership.
select b.id as barbershop_id,
 count(*) filter(where m.role='administrator' and m.status='active') as active_administrators,
 count(*) filter(where m.role='administrator' and m.status='active')>3 as exceeds_owner_plus_two,
 coalesce(jsonb_agg(jsonb_build_object('userId',m.user_id,'role',m.role,'status',m.status) order by m.user_id) filter(where m.id is not null),'[]') as reviewed_membership_input
from public.barbershops b left join public.barbershop_memberships m on m.barbershop_id=b.id
group by b.id order by b.id;
-- Output IDs are for an operator-controlled reviewed map; no emails/credentials.
-- No automatic UPDATE, ownership insertion or rank/first-administrator selection.

-- Optional operator-only detail for explicit identity review. IDs are pseudonymous;
-- do not copy them to public evidence. No email/name/phone/credentials are selected.
select b.id as barbershop_id,m.user_id as candidate_user_id,
 (u.email_confirmed_at is not null and not u.is_anonymous and (u.banned_until is null or u.banned_until<=clock_timestamp())) as eligible_account
from public.barbershops b join public.barbershop_memberships m on m.barbershop_id=b.id
join auth.users u on u.id=m.user_id where m.role='administrator' and m.status='active'
order by b.id,m.user_id;
-- This order is presentation only, never a choice of owner. Each shop requires
-- explicit user confirmation, reviewed evidence and the exact membership snapshot.
