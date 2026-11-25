import type {
  ReservationInput,
  BookingResult,
  CancellationInput,
  SlotQuery,
  AvailableSlot,
  BookingDetail,
} from '../domain/types';
export interface ReservaRemotaGateway {
  confirm(input: ReservationInput): Promise<BookingResult>;
  cancel(input: CancellationInput): Promise<BookingDetail>;
  listSlots(query: SlotQuery): Promise<readonly AvailableSlot[]>;
  listOwnReservations(
    reservationId?: string,
  ): Promise<readonly BookingDetail[]>;
}
