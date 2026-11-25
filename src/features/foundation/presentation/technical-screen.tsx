import { useState } from 'react';

import { AppButton } from '@/shared/ui/app-button';
import { AppText } from '@/shared/ui/app-text';
import { Screen } from '@/shared/ui/screen';
import { StatusMessage } from '@/shared/ui/status-message';

import { useAppInformation } from './use-app-information';

export function TechnicalScreen({
  onBack,
  onGoogleCheck,
}: {
  onBack: () => void;
  onGoogleCheck?: () => void;
}) {
  const { estado, reintentar } = useAppInformation();
  const [sampleRecovered, setSampleRecovered] = useState(false);
  return (
    <Screen webSurface="public">
      <AppText variant="title">Una base para crecer</AppText>
      {estado.estado === 'cargando' ? (
        <StatusMessage state="loading" message="Cargando información…" />
      ) : estado.estado === 'exito' ? (
        <>
          <StatusMessage state="success" message="Información disponible" />
          <AppText variant="action">{estado.informacion.nombre}</AppText>
          <AppText tone="textSecondary">
            Versión {estado.informacion.version}
          </AppText>
          <AppText>{estado.informacion.descripcion}</AppText>
        </>
      ) : (
        <StatusMessage
          state="error"
          message="No pudimos cargar la información. Puedes volver a intentarlo."
          onRetry={() => {
            void reintentar();
          }}
        />
      )}
      <AppText variant="action">Tecnología</AppText>
      <AppText>Expo, React Native, Expo Router y TypeScript estricto.</AppText>
      <AppText variant="action">Organización</AppText>
      <AppText>
        Presentación separada del núcleo de la aplicación, con contratos y
        adaptadores por funcionalidad.
      </AppText>
      <AppText tone="textSecondary">
        La identidad, las barberías y las reservas se integrarán en etapas
        posteriores.
      </AppText>
      <AppText variant="title">Muestras de componentes</AppText>
      <AppText tone="textSecondary">
        Ejemplos visuales locales. No representan el estado de la consulta ni
        datos de negocio.
      </AppText>
      <AppText variant="action">Muestra: carga</AppText>
      <StatusMessage
        state="loading"
        message="Preparando contenido de muestra…"
        announce={false}
      />
      <AppButton
        label="Acción no disponible durante la carga de muestra"
        disabled
      />
      <AppText variant="action">Muestra: vacío</AppText>
      <StatusMessage
        state="empty"
        message="No hay elementos en esta muestra."
        announce={false}
      />
      <AppText variant="action">Muestra: error</AppText>
      {sampleRecovered ? (
        <>
          <StatusMessage
            state="success"
            message="Muestra recuperada correctamente."
          />
          <AppButton
            label="Restablecer muestra de error"
            onPress={() => setSampleRecovered(false)}
          />
        </>
      ) : (
        <StatusMessage
          state="error"
          message="Ejemplo de error recuperable, sin afectar la consulta real."
          retryLabel="Reintentar muestra"
          onRetry={() => setSampleRecovered(true)}
          announce={false}
        />
      )}
      <AppText variant="action">Muestra: éxito</AppText>
      <StatusMessage
        state="success"
        message="Contenido de muestra disponible."
        announce={false}
      />
      {onGoogleCheck && (
        <AppButton
          label="Preparar prueba Google Cloud aislada"
          onPress={onGoogleCheck}
        />
      )}
      <AppButton label="Volver al inicio" onPress={onBack} />
    </Screen>
  );
}
