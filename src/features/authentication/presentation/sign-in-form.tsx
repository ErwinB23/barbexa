import { useRef, type ComponentRef, type ReactNode } from 'react';
import { TextInput } from 'react-native';
import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { Screen } from '../../../shared/ui/screen';
import { PageHeader } from '../../../shared/ui/page-header';
import { StatusMessage } from '../../../shared/ui/status-message';
export { GoogleAccessContent as GoogleLoginContent } from './google-access';
export const signInHeaderOptions = { headerShown: true };
export function SignInForm({
  email,
  password,
  busy,
  error,
  notice,
  onEmail,
  onPassword,
  onSubmit,
  onRegister,
  onHome,
  onRetryCleanup,
  onForgotPassword,
  googleAccess,
}: {
  email: string;
  password: string;
  busy: boolean;
  error: string | null;
  notice: string | null;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  onSubmit: () => void;
  onRegister: () => void;
  onHome: () => void;
  onRetryCleanup: (() => void) | null;
  onForgotPassword?: () => void;
  googleAccess?: ReactNode;
}) {
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  return (
    <Screen width="form">
      <PageHeader
        title="Inicia sesión"
        subtitle="Tus reservas y tus barberías, en un solo lugar. Usa tu correo confirmado para continuar."
      />
      {notice && <AppText accessibilityLiveRegion="polite">{notice}</AppText>}
      {googleAccess}
      <AppTextField
        id="sign-in-email"
        label="Correo electrónico"
        value={email}
        onChangeText={onEmail}
        disabled={busy}
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <AppTextField
        ref={passwordRef}
        id="sign-in-password"
        label="Contraseña"
        value={password}
        onChangeText={onPassword}
        disabled={busy}
        secureTextEntry
        autoComplete="current-password"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
      {busy && <StatusMessage state="loading" message="Comprobando acceso…" />}
      {error && (
        <AppText tone="error" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
      {onRetryCleanup && (
        <AppButton
          label="Reintentar cierre local"
          onPress={onRetryCleanup}
          disabled={busy}
        />
      )}
      <AppButton
        label="Iniciar sesión"
        onPress={onSubmit}
        disabled={busy || !!onRetryCleanup}
      />
      <AppButton
        label="Crear cuenta"
        variant="secondary"
        onPress={onRegister}
        disabled={busy}
      />
      {onForgotPassword && (
        <AppButton
          label="Olvidé mi contraseña"
          variant="ghost"
          onPress={onForgotPassword}
          disabled={busy}
        />
      )}
      <AppButton label="Volver al inicio" variant="ghost" onPress={onHome} />
    </Screen>
  );
}
