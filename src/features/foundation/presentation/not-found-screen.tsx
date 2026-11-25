import { AppButton } from '@/shared/ui/app-button';
import { AppText } from '@/shared/ui/app-text';
import { Screen } from '@/shared/ui/screen';

export function NotFoundScreen({ onGoHome }: { onGoHome: () => void }) {
  return (
    <Screen webSurface="public">
      <AppText variant="caption" tone="textSecondary">
        APP BARBERÍA
      </AppText>
      <AppText variant="title">No encontramos esta página</AppText>
      <AppText tone="textSecondary">
        El enlace puede haber cambiado. Vuelve al inicio para continuar.
      </AppText>
      <AppButton label="Volver al inicio" onPress={onGoHome} />
    </Screen>
  );
}
