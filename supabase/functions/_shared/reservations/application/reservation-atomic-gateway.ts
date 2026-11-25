import type {
  VerifiedActor,
  ReservationInput,
  BookingResult,
  CancellationInput,
  BookingDetail,
} from '../domain/types.ts';
export interface ReservaAtomicaGateway {
  confirm(
    actor: VerifiedActor,
    input: ReservationInput,
  ): Promise<BookingResult>;
  cancel(
    actor: VerifiedActor,
    input: CancellationInput,
  ): Promise<BookingDetail>;
}
