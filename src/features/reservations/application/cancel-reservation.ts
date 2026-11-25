import type { ReservaRemotaGateway } from './reservation-remote-gateway';
import { cancellationInput } from '../domain/cancellation';
import { BusinessError } from '../domain/values';
export function createCancelReservation(
  gateway: Pick<ReservaRemotaGateway, 'cancel'>,
) {
  return async function CancelarReserva(input: unknown) {
    const value = cancellationInput(input);
    try {
      return await gateway.cancel(value);
    } catch (e) {
      if (e instanceof BusinessError) throw e;
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    }
  };
}
