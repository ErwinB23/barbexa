import { FoundationError, type VerifiedActor } from '../domain/types.ts';
import { validId, profileInput, dependency } from '../domain/validation.ts';
import type { FoundationProvisioningGateway } from './foundation-provisioning-gateway.ts';
// Only an Auth-verifying entry may construct this context; structural typing is not authentication.
export async function ensureOwnProfile(
  gateway: FoundationProvisioningGateway,
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
  const value = profileInput(input);
  return dependency(() => gateway.ensureOwnProfile(verified, value));
}
