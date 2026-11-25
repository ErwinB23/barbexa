import { useRef, type ComponentRef } from 'react';
import { TextInput } from 'react-native';
import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { Screen } from '../../../shared/ui/screen';
import { PageHeader } from '../../../shared/ui/page-header';
import { StatusMessage } from '../../../shared/ui/status-message';
import { PasswordRequirements } from './password-requirements';
export const recoveryHeaderOptions = {};
export function ForgotPasswordForm({
  email,
  busy,
  sent,
  error,
  onEmail,
  onSubmit,
  onCancel,
}: {
  email: string;
  busy: boolean;
  sent: boolean;
  error: string | null;
  onEmail: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <Screen width="form">
      <PageHeader title="Recupera tu acceso" />
      <AppText tone="textSecondary">
        Solicita un enlace y ábrelo en este mismo navegador o instalación.
        Puedes cerrar esta vista, pero conserva los datos de la aplicación hasta
        terminar.
      </AppText>
      <AppTextField
        id="recovery-email"
        label="Correo electrónico"
        value={email}
        onChangeText={onEmail}
        disabled={busy}
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="send"
        onSubmitEditing={onSubmit}
      />
      {busy && <StatusMessage state="loading" message="Solicitando enlace…" />}
      {sent && (
        <StatusMessage
          state="success"
          message="Si existe una cuenta con ese correo, recibirás un enlace para cambiar tu contraseña."
        />
      )}
      {error && (
        <AppText tone="error" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
      <AppButton
        label={sent ? 'Solicitar otro enlace' : 'Enviar enlace'}
        onPress={onSubmit}
        disabled={busy}
      />
      <AppButton
        label="Cancelar y volver a iniciar sesión"
        variant="ghost"
        onPress={onCancel}
        disabled={busy}
      />
    </Screen>
  );
}

export function ResetPasswordForm({
  allowed,
  busy,
  completed,
  password,
  confirmation,
  error,
  onPassword,
  onConfirmation,
  onSubmit,
  onCancel,
  onRequest,
}: {
  allowed: boolean;
  busy: boolean;
  completed: boolean;
  password: string;
  confirmation: string;
  error: string | null;
  onPassword: (value: string) => void;
  onConfirmation: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onRequest: () => void;
}) {
  const confirmationRef = useRef<ComponentRef<typeof TextInput>>(null);
  return (
    <Screen width="form">
      <PageHeader title="Nueva contraseña" />
      {completed ? (
        <StatusMessage
          state="success"
          message="Contraseña actualizada. Inicia sesión con tu nueva clave."
        />
      ) : busy ? (
        <StatusMessage state="loading" message="Verificando recuperación…" />
      ) : null}
      {!completed && allowed ? (
        <>
          <AppText tone="textSecondary">
            Este acceso solo permite recuperar tu contraseña. No habilita las
            reservas ni los datos de tu cuenta.
          </AppText>
          <AppTextField
            id="reset-password"
            label="Nueva contraseña"
            value={password}
            onChangeText={onPassword}
            disabled={busy}
            secureTextEntry
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => confirmationRef.current?.focus()}
          />
          <PasswordRequirements password={password} />
          <AppTextField
            ref={confirmationRef}
            id="reset-confirmation"
            label="Repite la nueva contraseña"
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
          <AppButton
            label="Guardar nueva contraseña"
            onPress={onSubmit}
            disabled={busy}
          />
        </>
      ) : !completed && !busy ? (
        <>
          <AppText>
            Necesitas un enlace válido solicitado desde este navegador o
            instalación. Si venció, ya se usó o falta su verificación, solicita
            uno nuevo.
          </AppText>
          <AppButton label="Solicitar nuevo enlace" onPress={onRequest} />
        </>
      ) : null}
      {error && (
        <AppText tone="error" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
      <AppButton
        label={completed ? 'Ir a iniciar sesión' : 'Cancelar recuperación'}
        variant={completed ? 'primary' : 'ghost'}
        onPress={onCancel}
        disabled={busy}
      />
    </Screen>
  );
}
