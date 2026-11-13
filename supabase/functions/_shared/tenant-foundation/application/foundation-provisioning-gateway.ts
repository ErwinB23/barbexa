import type { Profile, ProfileInput, VerifiedActor } from '../domain/types.ts';
export interface FoundationProvisioningGateway {
  ensureOwnProfile(actor: VerifiedActor, input: ProfileInput): Promise<Profile>;
}
