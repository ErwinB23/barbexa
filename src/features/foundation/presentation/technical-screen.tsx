import { AppButton } from '@/shared/ui/app-button';
import { AppText } from '@/shared/ui/app-text';
import { Screen } from '@/shared/ui/screen';

import { useAppInformation } from './use-app-information';

export function TechnicalScreen({ onBack }: { onBack: () => void }) {
  const { estado, reintentar } = useAppInformation();
  return (
    <Screen>
      <AppText variant="title">Una base para crecer</AppText>
      {estado.estado === 'cargando' ? (
        <AppText accessibilityLiveRegion="polite">
          Cargando información…
        </AppText>
      ) : estado.estado === 'exito' ? (
        <>
          <AppText variant="action">{estado.informacion.nombre}</AppText>
          <AppText tone="textSecondary">
            Versión {estado.informacion.version}
          </AppText>
          <AppText>{estado.informacion.descripcion}</AppText>
        </>
      ) : (
        <>
          <AppText tone="error" accessibilityLiveRegion="polite">
            No pudimos cargar la información. Puedes volver a intentarlo.
          </AppText>
          <AppButton
            label="Reintentar"
            onPress={() => {
              void reintentar();
            }}
          />
        </>
      )}
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
