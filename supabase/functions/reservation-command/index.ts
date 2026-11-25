import { createFoundationActorVerifier } from '../_shared/tenant-foundation/composition.ts';
import { createReservationService } from '../_shared/reservations/composition.ts';
Deno.serve(createReservationService(createFoundationActorVerifier()));
