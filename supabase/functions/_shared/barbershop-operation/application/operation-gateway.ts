import type {
  VerifiedActor,
  ShopSetup,
  Service,
  Professional,
  PublicationState,
  Hours,
  ScheduleException,
  StaffInvitation,
  BookingCatalog,
} from '../domain/types.ts';
export interface BarbershopPersistenceGateway {
  getOwnProfessional(
    actor: VerifiedActor,
    barbershopId: string,
  ): Promise<Professional>;
  updateOwnProfessional(
    actor: VerifiedActor,
    barbershopId: string,
    professionalName: string,
  ): Promise<Professional>;
  configureShop(actor: VerifiedActor, input: ShopSetup): Promise<void>;
  setPublication(
    actor: VerifiedActor,
    barbershopId: string,
    state: PublicationState,
  ): Promise<void>;
  upsertService(
    actor: VerifiedActor,
    input: Omit<Service, 'id'> & { readonly id?: string },
  ): Promise<Service>;
  setProfessional(
    actor: VerifiedActor,
    input: Omit<Professional, 'id'> & { readonly id?: string },
  ): Promise<Professional>;
  setCapabilities(
    actor: VerifiedActor,
    barbershopId: string,
    barberId: string,
    serviceIds: readonly string[],
  ): Promise<void>;
  setShopHours(
    actor: VerifiedActor,
    barbershopId: string,
    hours: readonly Hours[],
  ): Promise<void>;
  setBarberHours(
    actor: VerifiedActor,
    barbershopId: string,
    barberId: string,
    hours: readonly Hours[],
  ): Promise<void>;
  setException(actor: VerifiedActor, input: ScheduleException): Promise<void>;
  inviteExistingUser(
    actor: VerifiedActor,
    barbershopId: string,
    email: string,
  ): Promise<StaffInvitation>;
  respondInvitation(
    actor: VerifiedActor,
    invitationId: string,
    decision: 'accept' | 'reject',
  ): Promise<StaffInvitation>;
  cancelInvitation(
    actor: VerifiedActor,
    invitationId: string,
  ): Promise<StaffInvitation>;
  getCatalog(
    actor: VerifiedActor,
    barbershopId: string,
  ): Promise<BookingCatalog>;
}
