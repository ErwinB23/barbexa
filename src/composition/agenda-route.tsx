import { useContext } from 'react';
import { useRouter } from 'expo-router';
import { BookingContext } from '../features/reservations/presentation/booking-context';
import { useRegistration } from '../features/authentication/presentation/use-registration';
import { AgendaScreen } from '../features/reservations/presentation/agenda-screen';
import { Screen } from '../shared/ui/screen';
import { AppText } from '../shared/ui/app-text';
import { AppButton } from '../shared/ui/app-button';
export function AgendaRoute() {
  const router = useRouter(),
    { state, configured, callbackError } = useRegistration(),
    booking = useContext(BookingContext);
  if (
    !configured ||
    callbackError ||
    state.kind !== 'ready' ||
    !booking?.agenda
  )
    return null;
  if (state.context.kind !== 'selected')
    return (
      <Screen>
        <AppText>
          Selecciona una barbería con membresía activa para consultar tu agenda.
        </AppText>
        <AppButton
          label="Ver mis barberías"
          onPress={() => router.push('/context')}
        />
      </Screen>
    );
  return (
    <AgendaScreen
      key={`${state.identity.userId}:${state.generation}:${state.context.context.barbershopId}:${state.context.context.role}`}
      application={booking.agenda}
      barbershopId={state.context.context.barbershopId}
      shopName={state.context.barbershop?.name}
      administrator={state.context.context.role === 'administrator'}
      onContext={() => router.push('/context')}
    />
  );
}
