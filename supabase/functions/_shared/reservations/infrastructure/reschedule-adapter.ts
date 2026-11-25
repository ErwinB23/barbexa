import type {
  RescheduleAtomicGateway,
  RescheduleManagementAtomicGateway,
} from '../application/reschedule.ts';
import {
  reschedulePolicyPayload,
  rescheduleHistoryPayload,
} from './reschedule-payload.ts';
import {
  bookingResult,
  availableSlots,
  providerError,
} from './booking-payload.ts';
import { BusinessError } from '../domain/values.ts';
export function createRescheduleAdapter({
  baseUrl,
  serviceKey,
  fetcher = fetch,
}: {
  baseUrl: string;
  serviceKey: string;
  fetcher?: typeof fetch;
}): RescheduleAtomicGateway & RescheduleManagementAtomicGateway {
  async function call(
    name:
      | 'reschedule_booking'
      | 'list_reschedule_slots'
      | 'get_reschedule_policy'
      | 'set_reschedule_policy'
      | 'get_reschedule_history',
    actor: string,
    data: unknown,
  ) {
    try {
      const headers: Record<string, string> = {
        apikey: serviceKey,
        'Content-Type': 'application/json',
      };
      if (!serviceKey.startsWith('sb_secret_'))
        headers.Authorization = 'Bearer ' + serviceKey;
      const response = await fetcher(baseUrl + '/rest/v1/rpc/' + name, {
        method: 'POST',
        headers,
        body: JSON.stringify({ p_actor_id: actor, p_data: data }),
        signal: AbortSignal.timeout(8000),
      });
      const value: unknown = await response.json();
      if (!response.ok) throw providerError(value, response.status);
      return value;
    } catch (e) {
      if (e instanceof BusinessError) throw e;
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    }
  }
  return {
    async getReschedulePolicy(actor, shop) {
      return reschedulePolicyPayload(
        await call('get_reschedule_policy', actor.userId, {
          barbershopId: shop,
        }),
        shop,
      );
    },
    async setReschedulePolicy(actor, input) {
      return reschedulePolicyPayload(
        await call('set_reschedule_policy', actor.userId, input),
        input.barbershopId,
      );
    },
    async listRescheduleHistory(actor, id) {
      return rescheduleHistoryPayload(
        await call('get_reschedule_history', actor.userId, {
          reservationId: id,
        }),
      );
    },
    async reschedule(actor, input) {
      const result = bookingResult(
        await call('reschedule_booking', actor.userId, input),
      );
      if (
        result.detail.id !== input.reservationId ||
        result.detail.startsAt !== input.startsAt ||
        result.detail.state !== 'confirmed'
      )
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      return result;
    },
    async listRescheduleSlots(actor, query) {
      return availableSlots(
        await call('list_reschedule_slots', actor.userId, query),
      );
    },
  };
}
