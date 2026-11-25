import { useRef, type ComponentRef, type ReactNode } from 'react';
import { TextInput } from 'react-native';
import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { Screen } from '../../../shared/ui/screen';
import { PageHeader } from '../../../shared/ui/page-header';
import { StatusMessage } from '../../../shared/ui/status-message';
import { PasswordRequirements } from './password-requirements';
export interface RegistrationValues {
  displayName: string;
  email: string;
  phone: string;
  password: string;
}
export interface SignUpFormProps {
  values: RegistrationValues;
  confirmation: string;
  busy: boolean;
  error: string | null;
  onChange: (field: keyof RegistrationValues, value: string) => void;
  onConfirmation: (value: string) => void;
  onSubmit: () => void;
  onHome: () => void;
  onLogin?: () => void;
  googleAccess?: ReactNode;
}

export { GoogleAccessContent as SignUpGoogleContent } from './google-access';
export const signUpHeaderOptions = {};
export function SignUpForm({
  values,
  confirmation,
  busy,
  error,
  onChange,
  onConfirmation,
  onSubmit,
  onHome,
  googleAccess,
}: SignUpFormProps) {
  const emailRef = useRef<ComponentRef<typeof TextInput>>(null),
    phoneRef = useRef<ComponentRef<typeof TextInput>>(null),
    passwordRef = useRef<ComponentRef<typeof TextInput>>(null),
    confirmationRef = useRef<ComponentRef<typeof TextInput>>(null);
  return (
    <Screen width="form">
      <PageHeader
        title="Crea tu cuenta"
        subtitle="Confirma tu correo y empieza a reservar. No necesitas pertenecer a una barbería."
      />
      {googleAccess}
      <AppTextField
        id="sign-up-name"
        label="Nombre visible"
        value={values.displayName}
        onChangeText={(v) => onChange('displayName', v)}
        disabled={busy}
        autoComplete="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <AppTextField
        id="sign-up-email"
        ref={emailRef}
        label="Correo electrónico"
        value={values.email}
        onChangeText={(v) => onChange('email', v)}
        disabled={busy}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        returnKeyType="next"
        onSubmitEditing={() => phoneRef.current?.focus()}
      />
      <AppTextField
        id="sign-up-phone"
        ref={phoneRef}
        label="Teléfono (opcional)"
        value={values.phone}
        onChangeText={(v) => onChange('phone', v)}
        disabled={busy}
        keyboardType="phone-pad"
        autoComplete="tel"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <AppTextField
        id="sign-up-password"
        ref={passwordRef}
        label="Contraseña"
        value={values.password}
        onChangeText={(v) => onChange('password', v)}
        disabled={busy}
        secureTextEntry
        autoComplete="new-password"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => confirmationRef.current?.focus()}
      />
      <PasswordRequirements password={values.password} />
      <AppTextField
        id="sign-up-confirmation"
        ref={confirmationRef}
        label="Confirmar contraseña"
        value={confirmation}
        onChangeText={onConfirmation}
        disabled={busy}
        secureTextEntry
        autoComplete="new-password"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
      {busy && (
        <StatusMessage state="loading" message="Preparando tu registro…" />
      )}
      {error && (
        <AppText tone="error" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
      <AppButton label="Crear cuenta" disabled={busy} onPress={onSubmit} />
      <AppButton label="Volver al inicio" variant="ghost" onPress={onHome} />
    </Screen>
  );
}
