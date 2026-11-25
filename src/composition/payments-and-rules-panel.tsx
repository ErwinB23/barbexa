import { useContext, type ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { BookingContext } from '../features/reservations/presentation/booking-context';
import { CareSettings } from '../features/reservations/presentation/care-control';
import { ReschedulePolicyControl } from '../features/reservations/presentation/reschedule-control';
import { Section } from '../shared/ui/page-header';
import { AppText } from '../shared/ui/app-text';
import { tokens } from '../shared/ui/tokens';

function RuleSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Section title={title} description={description}>
      <View style={{ gap: tokens.space.md }}>{children}</View>
    </Section>
  );
}
export function PaymentsAndRulesPanel({
  barbershopId,
}: {
  barbershopId: string;
}) {
  const booking = useContext(BookingContext);
  const content = (
    <View style={{ gap: tokens.space.lg }}>
      <AppText variant="heading">Pagos y reglas</AppText>
      <AppText tone="textSecondary">
        Estos ajustes se aplican a la barbería seleccionada y a su equipo.
      </AppText>
      {booking?.care ? (
        <CareSettings
          key={barbershopId}
          barbershopId={barbershopId}
          renderLayout={(parts) => (
            <>
              <View style={{ gap: tokens.space.sm }}>{parts.read}</View>
              <View style={{ gap: tokens.space.lg }}>
                <RuleSection
                  title="Pagos"
                  description="El efectivo y Yape se confirman manualmente al recibir el pago."
                >
                  <AppText tone="textSecondary">
                    Indica el número y el titular de Yape. Deja las
                    instrucciones vacías para deshabilitar Yape.
                  </AppText>
                  {parts.payments}
                </RuleSection>
                <RuleSection
                  title="Reglas de atención"
                  description="Define cuántos minutos de tolerancia tiene el cliente antes de registrar una inasistencia."
                >
                  {parts.attendance}
                </RuleSection>
              </View>
              <AppText tone="textSecondary">
                Consulta la configuración para editarla. El botón de guardado
                actualiza Pagos y Reglas de atención juntos.
              </AppText>
              {parts.save}
              {parts.feedback}
            </>
          )}
        />
      ) : (
        <AppText>
          La configuración de pagos y atención no está disponible en esta
          sesión.
        </AppText>
      )}
      <RuleSection
        title="Reglas de reservas"
        description="Configura cuánto tiempo antes de la cita puede solicitarse una reprogramación."
      >
        {booking?.reschedule ? (
          <ReschedulePolicyControl
            key={barbershopId}
            barbershopId={barbershopId}
          />
        ) : (
          <AppText>
            Las reglas de reprogramación no están disponibles en esta sesión.
          </AppText>
        )}
      </RuleSection>
    </View>
  );
  return Platform.OS === 'web' ? (
    <div className="bx-payments-rules">
      <style>{`
.bx-payments-rules {max-width:1040px; padding:12px 0 24px;}
.bx-payments-rules [data-bx-part='section'] {border-color:var(--bx-line); background:var(--bx-card);}
.bx-payments-rules [data-bx-part='button'] {max-width:560px;}
`}</style>
      {content}
    </div>
  ) : (
    content
  );
}
