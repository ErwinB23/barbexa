import type {
  Profile,
  ProfileInput,
  ProfilePatch,
  Barbershop,
  CreatedBarbershop,
  Membership,
} from '../domain/types';

export interface TenantFoundationGateway {
  ensureOwnProfile(input: ProfileInput): Promise<Profile>;
  getOwnProfile(): Promise<Profile | null>;
  updateOwnProfile(input: ProfilePatch): Promise<Profile | null>;
}
export interface BarbershopGateway {
  createOwnBarbershop(input: { name: string }): Promise<CreatedBarbershop>;
  getBarbershop(id: string): Promise<Barbershop | null>;
  renameBarbershop(id: string, name: string): Promise<Barbershop | null>;
}
export interface MembershipGateway {
  listOwnMemberships(): Promise<Membership[]>;
  listBarbershopMemberships(id: string): Promise<Membership[]>;
}
