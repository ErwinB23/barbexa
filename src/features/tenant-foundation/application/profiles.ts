import { FoundationError } from '../domain/types';
import { dependency, profileInput, profilePatch } from '../domain/validation';
import type { TenantFoundationGateway } from './tenant-foundation-gateway';
export async function ensureOwnProfile(
  gateway: TenantFoundationGateway,
  input: unknown,
) {
  const value = profileInput(input);
  return dependency(() => gateway.ensureOwnProfile(value));
}
export async function getOwnProfile(gateway: TenantFoundationGateway) {
  return dependency(() => gateway.getOwnProfile());
}
export async function updateOwnProfile(
  gateway: TenantFoundationGateway,
  input: unknown,
) {
  const value = profilePatch(input);
  const result = await dependency(() => gateway.updateOwnProfile(value));
  if (result === null) throw new FoundationError('NOT_AVAILABLE');
  return result;
}
