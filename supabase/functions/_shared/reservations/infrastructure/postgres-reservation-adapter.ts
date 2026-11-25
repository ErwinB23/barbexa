import type { ReservaAtomicaGateway } from '../application/reservation-atomic-gateway.ts';
import {
  bookingResult,
  bookingDetail,
  providerError,
} from './booking-payload.ts';
import { BusinessError } from '../domain/values.ts';
interface Options {
  readonly baseUrl: string;
  readonly serviceKey: string;
  readonly fetcher?: typeof fetch;
}
export function createPostgresReservationAdapter({
  baseUrl,
  serviceKey,
  fetcher = fetch,
}: Options): Pick<ReservaAtomicaGateway, 'confirm' | 'cancel'> {
  return {
    async cancel(actor, input) {
      try {
        const headers: Record<string, string> = {
          apikey: serviceKey,
          'Content-Type': 'application/json',
        };
        if (!serviceKey.startsWith('sb_secret_'))
          headers.Authorization = 'Bearer ' + serviceKey;
        const response = await fetcher(
          baseUrl + '/rest/v1/rpc/cancel_booking',
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              p_actor_id: actor.userId,
              p_data: {
                requestId: input.requestId,
                reservationId: input.reservationId,
                ...(input.reason ? { reason: input.reason } : {}),
              },
            }),
            signal: AbortSignal.timeout(8000),
          },
        );
        const value: unknown = await response.json();
        if (!response.ok) throw providerError(value, response.status);
        const detail = bookingDetail(value);
        if (detail.id !== input.reservationId || detail.state !== 'cancelled')
          throw new BusinessError('DEPENDENCY_UNAVAILABLE');
        return detail;
      } catch (e) {
        if (e instanceof BusinessError) throw e;
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      }
    },
    async confirm(actor, input) {
      try {
        const headers: Record<string, string> = {
          apikey: serviceKey,
          'Content-Type': 'application/json',
        };
        if (!serviceKey.startsWith('sb_secret_'))
          headers.Authorization = 'Bearer ' + serviceKey;
        const response = await fetcher(
          baseUrl +
            '/rest/v1/rpc/' +
            (input.paymentMethod ? 'confirm_booking_paid' : 'confirm_booking'),
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              p_actor_id: actor.userId,
              p_data: {
                ...(input.paymentMethod
                  ? { paymentMethod: input.paymentMethod }
                  : {}),
                requestId: input.requestId,
                barbershopId: input.barbershopId,
                serviceIds: input.serviceIds,
                barberId: input.barberId,
                startsAt: input.startsAt,
              },
            }),
            signal: AbortSignal.timeout(8000),
          },
        );
        const value: unknown = await response.json();
        if (!response.ok) throw providerError(value, response.status);
        const result = bookingResult(value);
        if (result.detail.barbershopId !== input.barbershopId)
          return Promise.reject(new BusinessError('DEPENDENCY_UNAVAILABLE'));
        return result;
      } catch (e) {
        if (e instanceof BusinessError) throw e;
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      }
    },
  };
}
