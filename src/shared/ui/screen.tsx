import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { tokens } from './tokens';
import { webPart } from './web-part';
import { WebSurface } from './web-surface';

export function Screen({
  children,
  width = 'content',
  webSurface,
  webLayout,
}: {
  children: ReactNode;
  width?: 'form' | 'content' | 'wide';
  webSurface?: 'public';
  webLayout?: 'account';
}) {
  const screen = (
    <SafeAreaView {...webPart('screen')} style={styles.safeArea}>
      <ScrollView
        {...webPart('scroll', webLayout)}
        contentContainerStyle={[
          styles.content,
          width === 'form' && styles.form,
          width === 'wide' && styles.wide,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
  return webSurface ? (
    <WebSurface kind={webSurface}>{screen}</WebSurface>
  ) : (
    screen
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: tokens.color.background },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: tokens.size.contentMaxWidth,
    alignSelf: 'center',
    padding: tokens.space.xl,
    paddingBottom: tokens.space.xxl,
    gap: tokens.space.lg,
  },
  form: { maxWidth: tokens.size.formMaxWidth },
  wide: { maxWidth: tokens.size.wideMaxWidth },
});
