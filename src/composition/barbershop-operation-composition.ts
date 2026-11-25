import {
  createOperationHttpAdapter,
  type OperationHttpOptions,
} from '../features/barbershop-operation/infrastructure/operation-http-adapter';
import {
  createOperationApplication,
  type OperationScope,
  type ShopNameGateway,
} from '../features/barbershop-operation/application/operation-application';
import { createSelfScheduleApplication } from '../features/barbershop-operation/application/self-schedule';
import { bookingRequestId } from './booking-request-id';
import { createAdminInvitations } from '../features/barbershop-operation/application/admin-invitations';
import { createOwnSummaryApplication } from '../features/barbershop-operation/application/own-summary';
import { createProfessionalProfile } from '../features/barbershop-operation/application/professional-profile';
import { createTeamAuthority } from '../features/barbershop-operation/application/team-authority';
import { createShopClosures } from '../features/barbershop-operation/application/shop-closures';
export function createBarbershopOperation(
  options: OperationHttpOptions & {
    shopNames?: ShopNameGateway;
    selfProfessionalEnabled?: boolean;
    teamAuthorityEnabled?: boolean;
    selfScheduleEnabled?: boolean;
    adminInvitationsEnabled?: boolean;
    adminInvitationDelivery?: 'email' | 'in-app';
    professionalSummaryEnabled?: boolean;
    onAcceptedInvitation?: () => Promise<void>;
    scope: () => OperationScope | null;
    createShop: (
      name: string,
    ) => Promise<{ readonly id: string; readonly name: string }>;
  },
) {
  const gateway = createOperationHttpAdapter(options);
  return createOperationApplication({
    shopClosures: createShopClosures({ gateway, scope: options.scope }),
    authority: options.teamAuthorityEnabled
      ? createTeamAuthority({ gateway, scope: options.scope })
      : undefined,
    adminInvitations: options.adminInvitationsEnabled
      ? createAdminInvitations({
          gateway,
          delivery: options.adminInvitationDelivery,
          scope: options.scope,
          requestId: bookingRequestId,
          onAccepted: options.onAcceptedInvitation,
        })
      : undefined,
    ownSummary: options.professionalSummaryEnabled
      ? createOwnSummaryApplication({ gateway, scope: options.scope })
      : undefined,
    selfSchedule: options.selfScheduleEnabled
      ? createSelfScheduleApplication({
          gateway,
          scope: options.scope,
          enabled: true,
          newId: bookingRequestId,
        })
      : undefined,
    selfProfessionalEnabled: options.selfProfessionalEnabled,
    professionalProfile: options.selfProfessionalEnabled
      ? createProfessionalProfile({ gateway, scope: options.scope })
      : undefined,
    gateway,
    shopNames: options.shopNames,
    scope: options.scope,
    createShop: options.createShop,
  });
}
export function createBookingOfferReader(options: OperationHttpOptions) {
  const gateway = createOperationHttpAdapter(options);
  return {
    listVisibleShops: gateway.listVisibleShops,
    getCatalog: gateway.getCatalog,
  };
}
