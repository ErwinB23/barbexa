import type { ReservaAtomicaGateway } from './reservation-atomic-gateway.ts';
import { cancellationInput } from '../domain/cancellation.ts';
import { reservationActor } from '../domain/reservation-input.ts';
import { BusinessError } from '../domain/values.ts';
export function createCancelReservation(
  gateway: Pick<ReservaAtomicaGateway, 'cancel'>,
) {
  return async function CancelarReserva(actor: unknown, input: unknown) {
    const identity = reservationActor(actor),
      value = cancellationInput(input);
    try {
      return await gateway.cancel(identity, value);
    } catch (e) {
      if (e instanceof BusinessError) throw e;
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    }
  };
}
