import { createContext, useContext, useSyncExternalStore } from 'react';
import type { BookingApplication } from '../application/booking-application';
import type { AgendaApplication } from '../application/agenda-application';
import type { CancellationInput, BookingDetail } from '../domain/types';
import { BusinessError } from '../domain/values';
import type { createRescheduleActions } from '../application/reschedule';
import type { PrivateHomeApplication } from '../application/private-home';
export const BookingContext = createContext<
  | (BookingApplication & {
      readonly discovery?: PrivateHomeApplication;
      readonly agenda?: AgendaApplication;
      readonly care?: (input: unknown) => Promise<unknown>;
      readonly reschedule?: ReturnType<typeof createRescheduleActions>;
      readonly cancellationRequestId?: () => string;
      readonly cancelReservation?: (
        input: CancellationInput,
      ) => Promise<BookingDetail>;
    })
  | null
>(null);
export function useBooking() {
  const application = useContext(BookingContext);
  if (!application) throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  const state = useSyncExternalStore(
    application.subscribe,
    application.getSnapshot,
    application.getSnapshot,
  );
  return { application, state };
}
