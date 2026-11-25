import { useEffect, useRef, useState } from 'react';
import { AuthError } from '../domain/auth-error';
import { authMessage } from './auth-messages';
import { useRegistration } from './use-registration';

import { ForgotPasswordForm } from '@/features/authentication/presentation/password-recovery-forms';

export { ForgotPasswordForm };

export function ForgotPasswordScreen({ onLogin }: { onLogin: () => void }) {
  const { application, configured, state } = useRegistration();
  const [email, setEmail] = useState(''),
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false),
    [error, setError] = useState<string | null>(null);
  const pending = useRef(false),
    active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  async function submit() {
    if (!configured || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      await application.requestRecovery({ email });
      if (!active.current) return;
      const result = application.getSnapshot();
      if (result.kind === 'recovery-sent') setSent(true);
      else if (result.kind === 'retryable-error')
        setError(authMessage(result.error));
    } catch (e) {
      if (active.current)
        setError(
          e instanceof AuthError && e.code === 'invalid-input'
            ? 'Escribe un correo electrónico válido.'
            : authMessage(
                e instanceof AuthError ? e.code : 'provider-unavailable',
              ),
        );
    } finally {
      pending.current = false;
      if (active.current) setBusy(false);
    }
  }
  async function cancel() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      await application.signOutCurrent();
      if (active.current) onLogin();
    } catch {
      if (active.current) setError(authMessage('persistence-failed'));
    } finally {
      pending.current = false;
      if (active.current) setBusy(false);
    }
  }
  return (
    <ForgotPasswordForm
      email={email}
      busy={!configured || busy || state.kind === 'resolving'}
      sent={sent}
      error={error}
      onEmail={setEmail}
      onSubmit={() => {
        void submit();
      }}
      onCancel={() => {
        void cancel();
      }}
    />
  );
}
