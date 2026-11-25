import { useContext } from 'react';
import { BookingContext } from '../features/reservations/presentation/booking-context';
import { CareSettings } from '../features/reservations/presentation/care-control';
import { ReschedulePolicyControl } from '../features/reservations/presentation/reschedule-control';
import {
  PaymentsRulesWeb,
  ReservationRuleWeb,
} from '../features/reservations/presentation/payments-rules-web';
export function PaymentsAndRulesPanel({
  barbershopId,
}: {
  barbershopId: string;
}) {
  const booking = useContext(BookingContext);
  if (!booking?.care)
    return (
      <p role="status">
        La configuración de pagos y atención no está disponible en esta sesión.
      </p>
    );
  return (
    <CareSettings
      autoLoad
      key={barbershopId}
      barbershopId={barbershopId}
      renderLayout={(parts) => (
        <PaymentsRulesWeb
          parts={parts}
          reservations={
            booking.reschedule ? (
              <ReschedulePolicyControl
                autoLoad
                key={barbershopId}
                barbershopId={barbershopId}
                renderContent={(props) => <ReservationRuleWeb {...props} />}
              />
            ) : (
              <p role="status">
                Las reglas de reprogramación no están disponibles en esta
                sesión.
              </p>
            )
          }
        />
      )}
    />
  );
}
