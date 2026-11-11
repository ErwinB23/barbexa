import { Stack } from 'expo-router';

import { AppProvider } from '@/composition/app-provider';

export const unstable_settings = { initialRouteName: 'index' };

// ExpoRoot ya suministra SafeAreaProvider para las vistas de la aplicación.
export default function RootLayout() {
  return (
    <AppProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="technical" options={{ title: 'Base técnica' }} />
        <Stack.Screen
          name="+not-found"
          options={{ title: 'Página no encontrada' }}
        />
      </Stack>
    </AppProvider>
  );
}
