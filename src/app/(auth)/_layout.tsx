import { Redirect, Stack } from 'expo-router';
import { useRegistration } from '@/features/authentication/presentation/use-registration';
import { authenticationStackOptions } from '@/features/authentication/presentation/account-shell';
import { signInHeaderOptions } from '@/features/authentication/presentation/sign-in-screen';
import { signUpHeaderOptions } from '@/features/authentication/presentation/sign-up-screen';
import { recoveryHeaderOptions } from '@/features/authentication/presentation/password-recovery-forms';
export default function RegistrationLayout() {
  const { state, callbackError } = useRegistration();
  if (state.kind === 'ready' && !callbackError)
    return <Redirect href="/account" />;
  return (
    <Stack screenOptions={authenticationStackOptions}>
      <Stack.Screen
        name="sign-in"
        options={{ title: 'Iniciar sesión', ...signInHeaderOptions }}
      />
      <Stack.Screen
        name="sign-up"
        options={{ title: 'Crear cuenta', ...signUpHeaderOptions }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{ title: 'Recuperar acceso', ...recoveryHeaderOptions }}
      />
      <Stack.Screen
        name="confirm-email"
        options={{ title: 'Confirmar correo' }}
      />
    </Stack>
  );
}
