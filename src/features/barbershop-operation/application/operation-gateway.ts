import type {
  ShopSetup,
  Service,
  Professional,
  PublicationState,
  Hours,
  ScheduleException,
  StaffInvitation,
  BookingCatalog,
} from '../domain/types';
export interface BarbershopOperationGateway {
  getOwnProfessional(barbershopId: string): Promise<Professional>;
  updateOwnProfessional(
    barbershopId: string,
    professionalName: string,
  ): Promise<Professional>;
  configureShop(input: ShopSetup): Promise<void>;
  setPublication(barbershopId: string, state: PublicationState): Promise<void>;
  upsertService(
    input: Omit<Service, 'id'> & { readonly id?: string },
  ): Promise<Service>;
  setProfessional(
    input: Omit<Professional, 'id'> & { readonly id?: string },
  ): Promise<Professional>;
  setCapabilities(
    barbershopId: string,
    barberId: string,
    serviceIds: readonly string[],
  ): Promise<void>;
  setShopHours(barbershopId: string, hours: readonly Hours[]): Promise<void>;
  setBarberHours(
    barbershopId: string,
    barberId: string,
    hours: readonly Hours[],
  ): Promise<void>;
  setException(input: ScheduleException): Promise<void>;
  inviteExistingUser(
    barbershopId: string,
    email: string,
  ): Promise<StaffInvitation>;
  respondInvitation(
    invitationId: string,
    decision: 'accept' | 'reject',
  ): Promise<StaffInvitation>;
  remindInvitation?(
    shop: string,
    invitationId: string,
  ): Promise<{ readonly created: boolean }>;
  cancelInvitation(invitationId: string): Promise<StaffInvitation>;
  getCatalog(barbershopId: string): Promise<BookingCatalog>;
}
