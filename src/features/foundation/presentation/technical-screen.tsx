import { AppButton } from '@/shared/ui/app-button';
import { AppText } from '@/shared/ui/app-text';
import { Screen } from '@/shared/ui/screen';

export function TechnicalScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen>
      <AppText variant="title">Una base para crecer</AppText>
      <AppText tone="textSecondary">Primera etapa de App Barbería</AppText>
      <AppText>
        Esta versión presenta la navegación inicial y los componentes
        compartidos de la aplicación.
      </AppText>
      <AppText variant="action">Tecnología</AppText>
      <AppText>Expo, React Native, Expo Router y TypeScript estricto.</AppText>
      <AppText variant="action">Organización</AppText>
      <AppText>
        Presentación separada del futuro núcleo de la aplicación, con contratos
        y adaptadores por funcionalidad.
      </AppText>
      <AppText tone="textSecondary">
        La identidad, las barberías y las reservas se integrarán en etapas
        posteriores.
      </AppText>
      <AppButton label="Volver al inicio" onPress={onBack} />
    </Screen>
  );
}
