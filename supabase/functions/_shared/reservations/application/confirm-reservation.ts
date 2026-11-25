import type { ReservaAtomicaGateway } from './reservation-atomic-gateway.ts';
import {
  reservationInput,
  reservationActor,
} from '../domain/reservation-input.ts';
import { BusinessError } from '../domain/values.ts';
export function createConfirmReservation(
  gateway: Pick<ReservaAtomicaGateway, 'confirm'>,
) {
  return async function ConfirmarReserva(actor: unknown, input: unknown) {
    const identity = reservationActor(actor),
      value = reservationInput(input);
    try {
      return await gateway.confirm(identity, value);
    } catch (e) {
      if (e instanceof BusinessError) throw e;
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    }
  };
}
