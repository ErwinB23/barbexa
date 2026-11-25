import { useState } from 'react';
import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { Screen } from '../../../shared/ui/screen';
import { PageHeader } from '../../../shared/ui/page-header';
import { StatusMessage } from '../../../shared/ui/status-message';
import type { SessionView } from '../domain/session-state';
import { AuthError, type AuthFailure } from '../domain/auth-error';
import { useRegistration } from './use-registration';
import { authMessage } from './auth-messages';
import { GoogleAccess } from './google-access';
interface Details {
  displayName: string;
  phone: string;
}
export function ConfirmationContent({
  state,
  error,
  canRetryProfile,
  details,
  onDetails,
  onRetry,
  onRegister,
  onHome,
}: {
  state: SessionView;
  error: string | null;
  canRetryProfile: boolean;
  details: Details;
  onDetails: (field: keyof Details, value: string) => void;
  onRetry: () => void;
  onRegister: () => void;
  onHome: () => void;
}) {
  if (Platform.OS === 'web' && state.kind === 'ready' && !error) {
    return <Redirect href="/account" />;
  }
  return (
    <Screen width="form">
      <PageHeader title="Confirmación de cuenta" />
      {error && (
        <AppText tone="error" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
      {state.kind === 'resolving' ? (
        <StatusMessage state="loading" message="Verificando acceso y perfil…" />
      ) : state.kind === 'oauth-pending' ? (
        <StatusMessage
          state="loading"
          message="Esperando el retorno de Google…"
        />
      ) : state.kind === 'ready' ? (
        <>
          <StatusMessage state="success" message="Perfil confirmado" />
          <AppText>{state.profile.displayName}</AppText>
          <AppText>
            Tu perfil está disponible. En Mi cuenta puedes revisar tus barberías
            y el rol que tienes en cada una.
          </AppText>
        </>
      ) : state.kind === 'profile-required' ? (
        <>
          <AppText>
            Tu correo está confirmado. Completa los datos de tu propio perfil.
          </AppText>
          <AppTextField
            id="profile-name"
            label="Nombre visible"
            value={details.displayName}
            onChangeText={(v) => onDetails('displayName', v)}
          />
          <AppTextField
            id="profile-phone"
            label="Teléfono (opcional)"
            value={details.phone}
            onChangeText={(v) => onDetails('phone', v)}
            keyboardType="phone-pad"
          />
          <AppButton label="Completar perfil" onPress={onRetry} />
        </>
      ) : state.kind === 'retryable-error' ? (
        <>
          <AppText tone="error" accessibilityLiveRegion="polite">
            {authMessage(state.error)}
          </AppText>
          {canRetryProfile && (
            <AppButton label="Reintentar perfil" onPress={onRetry} />
          )}
        </>
      ) : state.kind === 'recovery' ? (
        <AppText>
          Este enlace corresponde a recuperación. Abre el enlace original de
          recuperación para cambiar tu contraseña; no concede acceso al negocio.
        </AppText>
      ) : (
        <>
          <AppText>
            Revisa el correo y abre el enlace de confirmación en este mismo
            navegador o instalación.
          </AppText>
          <AppText tone="textSecondary">
            No cierres la sesión ni borres el almacenamiento mientras confirmas.
            Si no puedes completar el enlace, vuelve a empezar de forma segura.
          </AppText>
        </>
      )}
      <AppButton
        label="Volver al registro"
        onPress={onRegister}
        disabled={state.kind === 'resolving'}
      />
      <AppButton label="Volver al inicio" onPress={onHome} />
    </Screen>
  );
}
export function ConfirmEmailScreen({
  onRegister,
  onHome,
}: {
  onRegister: () => void;
  onHome: () => void;
}) {
  const { application, state, callbackError, canRetryProfile } =
    useRegistration();
  const [details, setDetails] = useState<Details>({
    displayName: '',
    phone: '',
  });
  const [error, setError] = useState<AuthFailure | null>(null);
  async function retry() {
    setError(null);
    try {
      await application.retryProfile(
        state.kind === 'profile-required'
          ? {
              displayName: details.displayName,
              phone: details.phone.trim() || null,
            }
          : undefined,
      );
    } catch (e) {
      setError(e instanceof AuthError ? e.code : 'provider-unavailable');
    }
  }
  const code = callbackError ?? error;
  return (
    <>
      {state.kind === 'oauth-pending' && <GoogleAccess />}
      <ConfirmationContent
        state={callbackError ? { kind: 'signed-out' } : state}
        error={code ? authMessage(code) : null}
        canRetryProfile={!callbackError && canRetryProfile}
        details={details}
        onDetails={(field, value) =>
          setDetails((v) => ({ ...v, [field]: value }))
        }
        onRetry={() => {
          void retry();
        }}
        onRegister={onRegister}
        onHome={onHome}
      />
    </>
  );
}
