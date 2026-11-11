import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/shared/ui/app-button';
import { AppText } from '@/shared/ui/app-text';
import { Screen } from '@/shared/ui/screen';
import { tokens } from '@/shared/ui/tokens';

export function WelcomeScreen({
  onOpenTechnical,
}: {
  onOpenTechnical: () => void;
}) {
  return (
    <Screen>
      <View style={styles.introduction}>
        <AppText variant="caption" tone="textSecondary">
          TU ESTILO, TU MOMENTO
        </AppText>
        <AppText variant="title">App Barbería</AppText>
        <AppText tone="textSecondary">
          Estamos preparando una nueva forma de conectar contigo y con tu
          barbería.
        </AppText>
      </View>
      <View style={styles.panel}>
        <AppText variant="action">Un buen comienzo</AppText>
        <AppText tone="textSecondary">
          Conoce la base de esta primera versión. Las reservas estarán
          disponibles en una próxima etapa.
        </AppText>
        <AppButton
          label="Ver base técnica"
          onPress={onOpenTechnical}
          accessibilityHint="Abre la información de esta versión"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  introduction: {
    paddingTop: tokens.space.xxl,
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
