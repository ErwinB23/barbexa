import {
  createReservationHttpAdapter,
  type ReservationHttpOptions,
} from '../features/reservations/infrastructure/reservation-http-adapter';
import {
  createBookingApplication,
  type BookingScope,
} from '../features/reservations/application/booking-application';
import {
  BusinessError,
  type BusinessErrorCode,
} from '../features/reservations/domain/values';
import { createBookingOfferReader } from './barbershop-operation-composition';
import type { CatalogCache } from '../features/barbershop-operation/infrastructure/catalog-cache';
import { bookingRequestId, bookingToday } from './booking-request-id';
import { createCancelReservation } from '../features/reservations/application/cancel-reservation';
import {
  createAgendaApplication,
  type AgendaScope,
} from '../features/reservations/application/agenda-application';
import { createCareActions } from '../features/reservations/application/care';
import { createRescheduleActions } from '../features/reservations/application/reschedule';
import { createPrivateHome } from '../features/reservations/application/private-home';
export function createReservations(
  options: ReservationHttpOptions & {
    catalogCache?: CatalogCache;
    careEnabled?: boolean;
    rescheduleEnabled?: boolean;
    scope: () => BookingScope | null;
    agendaScope?: () => AgendaScope | null;
  },
) {
  const reader = createBookingOfferReader(options);
  const mapped = async <T>(work: () => Promise<T>) => {
    try {
      return await work();
    } catch (e) {
      const codes: BusinessErrorCode[] = [
        'INVALID_INPUT',
        'UNAUTHENTICATED',
        'FORBIDDEN',
        'NOT_AVAILABLE',
        'PROFILE_REQUIRED',
        'CONFLICT',
        'DEPENDENCY_UNAVAILABLE',
      ];
      const code =
        codes.find(
          (c) => e && typeof e === 'object' && 'code' in e && e.code === c,
        ) ?? 'DEPENDENCY_UNAVAILABLE';
      throw new BusinessError(code);
    }
  };
  const gateway = createReservationHttpAdapter(options);
  const cancel = createCancelReservation(gateway);
  const agenda = createAgendaApplication({
    gateway,
    scope: options.agendaScope ?? (() => null),
    today: bookingToday,
  });
  const booking = createBookingApplication({
    gateway,
    offers: {
      listVisibleShops: (cursor, name) =>
        mapped(() => reader.listVisibleShops(cursor, name)),
      getCatalog: (shop) => mapped(() => reader.getCatalog(shop)),
    },
    scope: options.scope,
    requestId: bookingRequestId,
    today: bookingToday,
  });
  const discovery = createPrivateHome({
    offers: {
      listVisibleShops: (cursor, name) =>
        mapped(() => reader.listVisibleShops(cursor, name)),
      getCatalog: (shop) => mapped(() => reader.getCatalog(shop)),
    },
    listOwn: gateway.listOwnReservations,
    scope: options.scope,
  });
  return {
    ...booking,
    discovery,
    reschedule: options.rescheduleEnabled
      ? createRescheduleActions(
          gateway,
          () => {
            const s = options.scope();
            return s ? `${s.userId}:${s.generation}:${s.contextKey}` : null;
          },
          bookingRequestId,
          gateway,
        )
      : undefined,
    care: options.careEnabled
      ? createCareActions({ execute: gateway.care }, () => {
          const s = options.scope();
          return s ? `${s.userId}:${s.generation}:${s.contextKey}` : null;
        })
      : undefined,
    agenda,
    cancellationRequestId: bookingRequestId,
    async cancelReservation(input: unknown) {
      const before = options.scope();
      if (!before) throw new BusinessError('UNAUTHENTICATED');
      const detail = await cancel(input),
        after = options.scope();
      if (
        !after ||
        after.userId !== before.userId ||
        after.generation !== before.generation ||
        after.contextKey !== before.contextKey
      )
        throw new BusinessError('UNAUTHENTICATED');
      await Promise.all([booking.loadOwn(), agenda.load()]);
      return detail;
    },
    invalidateScope() {
      discovery.invalidateScope();
      booking.invalidateScope();
      agenda.invalidateScope();
    },
    dispose() {
      discovery.dispose();
      agenda.dispose();
      booking.dispose();
    },
  };
}
