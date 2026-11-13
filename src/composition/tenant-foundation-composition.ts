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
    ensureOwnProfile: (input: unknown) => ensureOwnProfile(gateway, input),
    getOwnProfile: () => getOwnProfile(gateway),
    updateOwnProfile: (input: unknown) => updateOwnProfile(gateway, input),
  };
}
