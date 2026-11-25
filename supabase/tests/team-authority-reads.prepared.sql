-- PREPARED ONLY; not executed. Needs separate authorization and committed synthetic
-- fixtures. Never point variables to protected/manual or personal records.
-- Variables: owner, recipient, outsider, shop, reservation, accepted_invitation.
-- accepted_invitation: synthetic accepted, no stamp, recipient active administrator;
-- issuer may have lost authority and expiry may be past (expired flag must be false).
-- No fixture creation or DDL here. This tests the SQL call graph in READ ONLY.
\set ON_ERROR_STOP on
\if :{?authority_read_test_authorized}
\if :authority_read_test_authorized
begin isolation level read committed read only;
set local statement_timeout='10s';
select public.care_booking(:'owner'::uuid,jsonb_build_object('command','read','reservationId',:'reservation'::uuid));
select public.care_booking(:'owner'::uuid,jsonb_build_object('command','settings','barbershopId',:'shop'::uuid));
select public.admin_invitation_list(:'owner'::uuid,jsonb_build_object('barbershopId',:'shop'::uuid));
select public.admin_invitation_get(:'owner'::uuid,jsonb_build_object('invitationId',:'accepted_invitation'::uuid));
select public.respond_booking_invitation(:'recipient'::uuid,jsonb_build_object('invitationId',:'accepted_invitation'::uuid,'decision','accept'));
rollback;
-- Wrong recipient/current retired member: use separate read-only connections and
-- expect P0002/42501. Pending acceptance must not succeed in READ ONLY (it mutates).
-- Run those negatives separately with explicit expected SQLSTATE, not ON_ERROR_STOP off.
\else
\echo 'Read-only business tests not authorized; no SQL executed.'
\endif
\else
\echo 'Read-only business test flag absent; no SQL executed.'
\endif
