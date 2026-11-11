import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { tokens } from './tokens';

// La composición raíz suministrará SafeAreaProvider cuando se implemente T014.
export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
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
    gap: tokens.space.lg,
  },
});
