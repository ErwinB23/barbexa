import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/shared/ui/app-button';
import { AppText } from '@/shared/ui/app-text';
import { Screen } from '@/shared/ui/screen';
import { tokens } from '@/shared/ui/tokens';

export function WelcomeScreen({
  onOpenTechnical,
  onRegister,
  onOpenSession,
  sessionLabel = 'Iniciar sesión',
  onBooking,
}: {
  onOpenTechnical: () => void;
  onRegister?: () => void;
  onOpenSession?: () => void;
  sessionLabel?: string;
  onBooking?: () => void;
}) {
  return (
    <Screen>
      <View style={styles.brand}>
        <View style={styles.mark}>
          <AppText
            variant="action"
            tone="onAction"
            style={tokens.typography.heading}
          >
            B
          </AppText>
        </View>
        <AppText variant="action">App Barbería</AppText>
      </View>
      <View style={styles.introduction}>
        <AppText variant="caption" tone="textSecondary">
          Tu barbería, a tu ritmo
        </AppText>
        <AppText variant="display">Tu próximo corte empieza aquí.</AppText>
        <AppText tone="textSecondary">
          Elige tus servicios, encuentra un horario y reserva con el profesional
          que prefieras. Tus citas, siempre a mano.
        </AppText>
        {onOpenSession && (
          <AppButton label={sessionLabel} onPress={onOpenSession} />
        )}
        {onBooking && (
          <AppButton label="Reservar una cita" onPress={onBooking} />
        )}
        {onRegister && (
          <AppButton
            label="Crear mi cuenta"
            variant="secondary"
            onPress={onRegister}
          />
        )}
      </View>
      <View style={styles.panel}>
        <AppText variant="heading">Todo listo antes de llegar</AppText>
        <AppText tone="textSecondary">
          Consulta el precio y la duración, elige una hora disponible y revisa
          la confirmación en Mis reservas.
        </AppText>
      </View>
      <AppButton
        variant="ghost"
        label="Ver base técnica"
        onPress={onOpenTechnical}
        accessibilityHint="Abre la información de esta versión"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.md,
    paddingTop: tokens.space.lg,
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.control,
    backgroundColor: tokens.color.action,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introduction: {
    paddingTop: tokens.space.xl,
    paddingBottom: tokens.space.xl,
    gap: tokens.space.lg,
  },
  panel: {
    padding: tokens.space.xl,
    borderRadius: tokens.radius.panel,
    backgroundColor: tokens.color.surface,
    gap: tokens.space.lg,
  },
});
