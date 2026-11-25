import {
  rescheduleInput,
  rescheduleQuery,
  type RescheduleInput,
  type RescheduleQuery,
  type ReschedulePolicy,
  type RescheduleEvent,
} from '../domain/reschedule';
import { BusinessError } from '../domain/values';
import type { AvailableSlot, BookingResult } from '../domain/types';
export interface RescheduleGateway {
  reschedule(input: RescheduleInput): Promise<BookingResult>;
  listRescheduleSlots(
    query: RescheduleQuery,
  ): Promise<readonly AvailableSlot[]>;
}
export interface RescheduleManagementGateway {
  getReschedulePolicy(shop: string): Promise<ReschedulePolicy>;
  setReschedulePolicy(input: ReschedulePolicy): Promise<ReschedulePolicy>;
  listRescheduleHistory(
    reservation: string,
  ): Promise<readonly RescheduleEvent[]>;
}
export function createRescheduleActions(
  gateway: RescheduleGateway,
  scope: () => string | null,
  requestId: () => string,
  management?: RescheduleManagementGateway,
) {
  let owner: string | null = null,
    pending: RescheduleInput | null = null,
    inFlight: Promise<BookingResult> | null = null;
  function capture() {
    const key = scope();
    if (key !== owner) {
      owner = key;
      pending = null;
      inFlight = null;
    }
    if (!key) throw new BusinessError('UNAUTHENTICATED');
    return key;
  }
  function current(key: string) {
    if (scope() !== key) throw new BusinessError('UNAUTHENTICATED');
  }
  const safe = (e: unknown) =>
    e instanceof BusinessError
      ? e
      : new BusinessError('DEPENDENCY_UNAVAILABLE');
  async function manage<T>(
    work: (gateway: RescheduleManagementGateway) => Promise<T>,
  ) {
    const key = capture();
    if (!management) throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    try {
      const result = await work(management);
      current(key);
      return result;
    } catch (e) {
      current(key);
      throw safe(e);
    }
  }
  return {
    readPolicy: (shop: string) => manage((g) => g.getReschedulePolicy(shop)),
    setPolicy: (input: ReschedulePolicy) =>
      manage((g) => g.setReschedulePolicy(input)),
    history: (reservation: string) =>
      manage((g) => g.listRescheduleHistory(reservation)),
    async slots(value: unknown) {
      const key = capture(),
        query = rescheduleQuery(value);
      try {
        const slots = await gateway.listRescheduleSlots(query);
        current(key);
        return slots;
      } catch (e) {
        current(key);
        throw safe(e);
      }
    },
    submit(value: Omit<RescheduleInput, 'requestId'>): Promise<BookingResult> {
      let key: string, input: RescheduleInput;
      try {
        key = capture();
        input = rescheduleInput({
          ...value,
          requestId: pending?.requestId ?? requestId(),
        });
        if (pending && JSON.stringify(pending) !== JSON.stringify(input))
          throw new BusinessError('CONFLICT');
        if (inFlight) return inFlight;
      } catch (e) {
        return Promise.reject(safe(e));
      }
      pending = input;
      const work = Promise.resolve()
        .then(() => gateway.reschedule(input))
        .then((result) => {
          current(key);
          pending = null;
          return result;
        })
        .catch((e) => {
          current(key);
          const error = safe(e);
          if (error.code !== 'DEPENDENCY_UNAVAILABLE') pending = null;
          throw error;
        })
        .finally(() => {
          if (inFlight === work) inFlight = null;
        });
      inFlight = work;
      return work;
    },
  };
}
