import type {
  Profile,
  ProfileInput,
  VerifiedActor,
  CreatedBarbershop,
} from '../domain/types.ts';

export interface FoundationProvisioningGateway {
  ensureOwnProfile(actor: VerifiedActor, input: ProfileInput): Promise<Profile>;
}
export interface BarbershopProvisioningGateway {
  createOwnBarbershop(
    actor: VerifiedActor,
    input: { name: string },
  ): Promise<CreatedBarbershop>;
}
