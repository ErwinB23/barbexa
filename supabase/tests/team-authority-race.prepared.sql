-- NOT EXECUTED. Needs a separately authorized, committed synthetic LOCAL fixture.
-- Preconditions: owned shop with ONE active secondary, two pending NEW stamped
-- admin invitations to distinct confirmed synthetic recipients. No protected IDs.
-- Operator verifies target LOCAL, baseline preservation and isolated fixture manifest.
-- Two independent psql connections, ON_ERROR_STOP=1, authority_race_authorized=true,
-- shop, recipient, invitation, and hold=true for A / hold=false for B.
-- This script NEVER creates fixture rows or guesses any existing membership.
-- Run A; at its prompt run B. Confirm B waits for shop lock, then release A.
-- Expected: A COMMIT, B SQLSTATE23505 and no partial membership/audit.
-- Inspect count=2 non-owner active admins and exactly one accepted invitation.
-- Repeat with reversed winner in separately authorized fixtures, not the same IDs.
-- Revocation race variant: replace A's acceptance with approved owner retirement,
-- B attempts an operational write by the retired member; after A commits B must
-- revalidate current membership and reject42501. Never infer success from timing.
\set ON_ERROR_STOP on
\if :{?authority_race_authorized}
\if :authority_race_authorized
\set VERBOSITY sqlstate
begin;
set local lock_timeout='30s';
set local statement_timeout='45s';
select private.authority_lock(:'shop'::uuid);
select public.respond_booking_invitation(:'recipient'::uuid,jsonb_build_object('invitationId',:'invitation'::uuid,'decision','accept'));
\if :hold
\prompt 'A holds shop lock. Start B, observe its wait, then press Enter to commit A: ' release
\endif
commit;
\else
\echo 'Race not authorized: no SQL executed.'
\endif
\else
\echo 'Race authorization flag absent: no SQL executed.'
\endif
