import { createFoundationActorVerifier } from '../_shared/tenant-foundation/composition.ts';
import { createBarbershopOperationService } from '../_shared/barbershop-operation/composition.ts';
Deno.serve(
  createBarbershopOperationService(createFoundationActorVerifier(), {
    localProject: 'app-barberia-002-local',
  }),
);
