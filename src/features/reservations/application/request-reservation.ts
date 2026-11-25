import type { ReservaRemotaGateway } from './reservation-remote-gateway';
import { reservationInput } from '../domain/reservation-input';
import { BusinessError } from '../domain/values';
export function createRequestReservation(
  gateway: Pick<ReservaRemotaGateway, 'confirm'>,
) {
  return async function SolicitarReserva(input: unknown) {
    const value = reservationInput(input);
    try {
      return await gateway.confirm(value);
    } catch (e) {
      if (e instanceof BusinessError) throw e;
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    }
  };
}
