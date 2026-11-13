import {
  listOwnMemberships,
  listBarbershopMemberships,
} from '../features/tenant-foundation/application/memberships';
import {
  createOwnBarbershop,
  getBarbershop,
  renameBarbershop,
} from '../features/tenant-foundation/application/barbershops';
import {
  createTenantFoundationHttpAdapter,
  type TenantFoundationHttpOptions,
} from '../features/tenant-foundation/infrastructure/tenant-foundation-http-adapter';
import {
  ensureOwnProfile,
  getOwnProfile,
  updateOwnProfile,
} from '../features/tenant-foundation/application/profiles';
export function createTenantFoundation(options: TenantFoundationHttpOptions) {
  const gateway = createTenantFoundationHttpAdapter(options);
  return {
    listOwnMemberships: () => listOwnMemberships(gateway),
    listBarbershopMemberships: (id: unknown) =>
      listBarbershopMemberships(gateway, id),
    createOwnBarbershop: (input: unknown) =>
      createOwnBarbershop(gateway, input),
    getBarbershop: (id: unknown) => getBarbershop(gateway, id),
    renameBarbershop: (id: unknown, name: unknown) =>
      renameBarbershop(gateway, id, name),
    ensureOwnProfile: (input: unknown) => ensureOwnProfile(gateway, input),
    getOwnProfile: () => getOwnProfile(gateway),
    updateOwnProfile: (input: unknown) => updateOwnProfile(gateway, input),
  };
}
