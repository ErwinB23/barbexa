import type { MembershipGateway } from './tenant-foundation-gateway';
import { FoundationError, type Membership } from '../domain/types';
import { dependency } from '../domain/validation';
import { isMembership, shopId } from '../domain/barbershop-validation';

function memberships(value: unknown): Membership[] {
  if (!Array.isArray(value) || !value.every(isMembership))
    throw new FoundationError('DEPENDENCY_UNAVAILABLE');
  return value.map(({ id, userId, barbershopId, role, status }) => ({
    id,
    userId,
    barbershopId,
    role,
    status,
  }));
}

export async function listOwnMemberships(gateway: MembershipGateway) {
  return memberships(await dependency(() => gateway.listOwnMemberships()));
}

export async function listBarbershopMemberships(
  gateway: MembershipGateway,
  id: unknown,
) {
  const key = shopId(id);
  const result = memberships(
    await dependency(() => gateway.listBarbershopMemberships(key)),
  );
  if (result.some((m) => m.barbershopId !== key))
    throw new FoundationError('DEPENDENCY_UNAVAILABLE');
  return result;
}
