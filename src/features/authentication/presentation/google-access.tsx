import { useRef, useState, type ReactNode } from 'react';
import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
import { StatusMessage } from '../../../shared/ui/status-message';
import { AuthError } from '../domain/auth-error';
import { authMessage } from './auth-messages';
import { useRegistration } from './use-registration';

export function GoogleAccessContent({
  enabled,
  pending,
  busy,
  error,
  onBegin,
  onCancel,
}: {
  enabled: boolean;
  pending: boolean;
  busy: boolean;
  error: string | null;
  onBegin: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      {pending ? (
        <>
          <StatusMessage
            state="loading"
            message="Continúa con Google en el navegador. Al volver verificaremos tu cuenta."
          />
          <AppButton
            label="Cancelar acceso con Google"
            disabled={busy}
            variant="secondary"
            onPress={() => {
              if (!busy) onCancel();
            }}
          />
        </>
      ) : (
        <>
          <AppButton
            label="Continuar con Google"
            disabled={!enabled || busy}
            variant="secondary"
            onPress={() => {
              if (enabled && !busy) onBegin();
            }}
          />
          {!enabled && (
            <AppText tone="textSecondary">
              Google pendiente de configuración en este entorno. Puedes usar tu
              correo.
            </AppText>
          )}
        </>
      )}
      {error && (
        <AppText tone="error" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
    </>
  );
}

export type GoogleAccessContentProps = Parameters<
  typeof GoogleAccessContent
>[0];
export function GoogleAccess({
  renderContent: Content = GoogleAccessContent,
}: {
  renderContent?: (props: GoogleAccessContentProps) => ReactNode;
}) {
  const { application, state, configured } = useRegistration();
  const [error, setError] = useState<string | null>(null),
    [busy, setBusy] = useState(false);
  const sending = useRef(false);
  if (
    !['signed-out', 'resolving', 'retryable-error', 'oauth-pending'].includes(
      state.kind,
    )
  )
    return null;
  async function run(cancel: boolean) {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setError(null);
    try {
      if (cancel) await application.cancelGoogle();
      else await application.signInWithGoogle();
    } catch (error) {
      setError(
        authMessage(
          error instanceof AuthError ? error.code : 'provider-unavailable',
        ),
      );
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }
  return (
    <Content
      enabled={configured && application.canUseGoogle?.() === true}
      pending={state.kind === 'oauth-pending'}
      busy={busy || !configured || state.kind === 'resolving'}
      error={error}
      onBegin={() => {
        void run(false);
      }}
      onCancel={() => {
        void run(true);
      }}
    />
  );
}
