import {
  rescheduleInput,
  rescheduleQuery,
  type RescheduleInput,
  type RescheduleQuery,
  type ReschedulePolicy,
  type RescheduleEvent,
  reschedulePolicyCommand,
  rescheduleHistoryQuery,
} from '../domain/reschedule.ts';
import { reservationActor } from '../domain/reservation-input.ts';
import { BusinessError } from '../domain/values.ts';
import type {
  VerifiedActor,
  BookingResult,
  AvailableSlot,
} from '../domain/types.ts';
export interface RescheduleAtomicGateway {
  reschedule(
    actor: VerifiedActor,
    input: RescheduleInput,
  ): Promise<BookingResult>;
  listRescheduleSlots(
    actor: VerifiedActor,
    query: RescheduleQuery,
  ): Promise<readonly AvailableSlot[]>;
}
export interface RescheduleManagementAtomicGateway {
  getReschedulePolicy(
    actor: VerifiedActor,
    shop: string,
  ): Promise<ReschedulePolicy>;
  setReschedulePolicy(
    actor: VerifiedActor,
    input: ReschedulePolicy,
  ): Promise<ReschedulePolicy>;
  listRescheduleHistory(
    actor: VerifiedActor,
    reservation: string,
  ): Promise<readonly RescheduleEvent[]>;
}
export function createRescheduleOperation(
  gateway: RescheduleAtomicGateway,
  management?: RescheduleManagementAtomicGateway,
) {
  const safe = (e: unknown) =>
    e instanceof BusinessError
      ? e
      : new BusinessError('DEPENDENCY_UNAVAILABLE');
  return {
    async policy(actor: unknown, input: unknown) {
      const identity = reservationActor(actor),
        value = reschedulePolicyCommand(input);
      if (!management) throw new BusinessError('INVALID_INPUT');
      try {
        return value.advanceMin === undefined
          ? await management.getReschedulePolicy(identity, value.barbershopId)
          : await management.setReschedulePolicy(identity, {
              barbershopId: value.barbershopId,
              advanceMin: value.advanceMin,
            });
      } catch (e) {
        throw safe(e);
      }
    },
    async history(actor: unknown, input: unknown) {
      const identity = reservationActor(actor),
        id = rescheduleHistoryQuery(input);
      if (!management) throw new BusinessError('INVALID_INPUT');
      try {
        return await management.listRescheduleHistory(identity, id);
      } catch (e) {
        throw safe(e);
      }
    },
    async reschedule(actor: unknown, input: unknown) {
      const identity = reservationActor(actor),
        value = rescheduleInput(input);
      try {
        return await gateway.reschedule(identity, value);
      } catch (e) {
        throw safe(e);
      }
    },
    async slots(actor: unknown, input: unknown) {
      const identity = reservationActor(actor),
        value = rescheduleQuery(input);
      try {
        return await gateway.listRescheduleSlots(identity, value);
      } catch (e) {
        throw safe(e);
      }
    },
  };
}
