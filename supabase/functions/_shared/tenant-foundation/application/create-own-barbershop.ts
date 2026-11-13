import { FoundationError, type VerifiedActor } from '../domain/types.ts';
import { validId, dependency } from '../domain/validation.ts';
import {
  barbershopInput,
  createdBarbershop,
} from '../domain/barbershop-validation.ts';
import type { BarbershopProvisioningGateway } from './foundation-provisioning-gateway.ts';
export async function createOwnBarbershop(
  gateway: BarbershopProvisioningGateway,
  actor: unknown,
  input: unknown,
) {
  if (
    typeof actor !== 'object' ||
    actor === null ||
    !('userId' in actor) ||
    !validId(actor.userId)
  )
    throw new FoundationError('UNAUTHENTICATED');
  const verified: VerifiedActor = { userId: actor.userId };
  const value = barbershopInput(input);
  return createdBarbershop(
    await dependency(() => gateway.createOwnBarbershop(verified, value)),
    verified.userId,
  );
}
