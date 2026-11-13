import type { Profile, ProfileInput, ProfilePatch } from '../domain/types';
export interface TenantFoundationGateway {
  ensureOwnProfile(input: ProfileInput): Promise<Profile>;
  getOwnProfile(): Promise<Profile | null>;
  updateOwnProfile(input: ProfilePatch): Promise<Profile | null>;
}
