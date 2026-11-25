import { Stack } from 'expo-router';
import { NavigationFrame } from '@/features/authentication/presentation/navigation-frame';

import { AppProvider } from '@/composition/app-provider';
import { RegistrationRuntimeProvider } from '@/composition/registration-runtime-provider';
import { useRegistration } from '@/features/authentication/presentation/use-registration';
import {
  retainAccountRoute,
  isSessionVerificationPending,
} from '@/features/authentication/presentation/navigation-policy';
import { SessionFeedback } from '@/features/authentication/presentation/account-screen';
import { GoogleAuthCheckGate } from '@/composition/google-auth-check-gate';
import { recoveryHeaderOptions } from '@/features/authentication/presentation/password-recovery-forms';

export const unstable_settings = { anchor: 'index' };

// ExpoRoot ya suministra SafeAreaProvider para las vistas de la aplicación.
export default function RootLayout() {
  return (
    <AppProvider>
      <GoogleAuthCheckGate>
        {(returnFence) => (
          <RegistrationRuntimeProvider returnFence={returnFence}>
            <SessionNavigator />
            <SessionFeedback />
          </RegistrationRuntimeProvider>
        )}
      </GoogleAuthCheckGate>
    </AppProvider>
  );
}
export function SessionNavigator() {
  const { state, callbackError } = useRegistration();
  const verifying = isSessionVerificationPending(state);
  return (
    <NavigationFrame blocked={verifying}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="technical" options={{ title: 'Base técnica' }} />
        <Stack.Screen
          name="+not-found"
          options={{ title: 'Página no encontrada' }}
        />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Protected guard={!callbackError && retainAccountRoute(state)}>
          <Stack.Screen name="(account)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen
          name="auth/callback"
          options={{ title: 'Confirmación' }}
        />
        <Stack.Screen
          name="auth/reset-password"
          options={{ title: 'Nueva contraseña', ...recoveryHeaderOptions }}
        />
      </Stack>
    </NavigationFrame>
  );
}
