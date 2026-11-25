import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { BookingContext } from '../features/reservations/presentation/booking-context';
import { useRegistration } from '../features/authentication/presentation/use-registration';
import { BookingScreen } from '../features/reservations/presentation/booking-screen';
import { MyReservationsScreen } from '../features/reservations/presentation/my-reservations-screen';
export function BookingRoute({
  page,
}: {
  page: 'booking' | 'my-reservations';
}) {
  const router = useRouter(),
    { state, configured, callbackError } = useRegistration();
  const application = useContext(BookingContext);
  // A retained/hidden route can mount before the runtime's effect creates its ports.
  // Keep its navigator entry, but never mount private consumers before verification.
  if (!configured || callbackError || state.kind !== 'ready' || !application)
    return null;
  const key =
    state.kind === 'ready'
      ? `${state.identity.userId}:${state.generation}:${state.context.kind === 'selected' ? `${state.context.context.barbershopId}:${state.context.context.role}` : state.context.kind}`
      : 'unavailable';
  return page === 'booking' ? (
    <BookingScreen key={key} onOwn={() => router.push('/my-reservations')} />
  ) : (
    <MyReservationsScreen key={key} onBook={() => router.push('/booking')} />
  );
}
