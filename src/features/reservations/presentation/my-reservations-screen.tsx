import { useEffect } from 'react';
import { Platform } from 'react-native';
import { CancellationControl } from './cancellation-control';
import { RescheduleControl } from './reschedule-control';
import { AppText } from '../../../shared/ui/app-text';
import { AppButton } from '../../../shared/ui/app-button';
import { Screen } from '../../../shared/ui/screen';
import { PageHeader, ActionRow } from '../../../shared/ui/page-header';
import { StatusMessage } from '../../../shared/ui/status-message';
import { useBooking } from './booking-context';
import { BookingCard, bookingError } from './booking-screen';
import { MyReservationsWeb } from './my-reservations.web';
import { ownReservationsView } from './own-reservations-view';
import type {
  BookingView,
  BookingApplication,
} from '../application/booking-application';
export function MyReservationsContent({
  state,
  application: app,
  onBook,
}: {
  state: BookingView;
  application: BookingApplication;
  onBook: () => void;
}) {
  if (Platform.OS === 'web')
    return (
      <MyReservationsWeb state={state} application={app} onBook={onBook} />
    );
  const reservations = ownReservationsView(state.own, {}, 0).sorted;
  return (
    <Screen>
      <PageHeader
        title="Mis reservas"
        subtitle="Tus citas confirmadas y tu historial, siempre a mano."
      />
      <ActionRow>
        <AppButton label="Reservar una cita" onPress={onBook} />
      </ActionRow>
      {state.ownPhase === 'loading' && (
        <StatusMessage state="loading" message="Consultando tus reservas…" />
      )}
      {state.ownError && (
        <StatusMessage
          state="error"
          message={bookingError(state.ownError)}
          onRetry={() => void app.loadOwn()}
        />
      )}
      {state.ownPhase === 'ready' && !state.own.length && (
        <StatusMessage state="empty" message="Todavía no tienes reservas." />
      )}
      {reservations.map((detail) => (
        <BookingCard key={detail.id} detail={detail}>
          {(canChange) => (
            <>
              {canChange && <CancellationControl detail={detail} />}
              <RescheduleControl detail={detail} canChange={canChange} />
            </>
          )}
        </BookingCard>
      ))}
      <AppButton
        label="Actualizar mis reservas"
        variant="ghost"
        disabled={state.ownPhase === 'loading'}
        onPress={() => void app.loadOwn()}
      />
      {state.own.length === 50 && (
        <AppText>Se muestran las 50 citas más recientes por fecha.</AppText>
      )}
    </Screen>
  );
}
export function MyReservationsScreen({ onBook }: { onBook: () => void }) {
  const { application, state } = useBooking();
  useEffect(() => {
    void application.loadOwn();
  }, [application]);
  return (
    <MyReservationsContent
      state={state}
      application={application}
      onBook={onBook}
    />
  );
}
