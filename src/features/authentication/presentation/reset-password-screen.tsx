import { useEffect, useRef, useState } from 'react';
import { AuthError } from '../domain/auth-error';
import { newPasswordProblem } from '../domain/password-policy';
import { authMessage } from './auth-messages';
import { useRegistration } from './use-registration';

import { ResetPasswordForm } from '@/features/authentication/presentation/password-recovery-forms';

export { ResetPasswordForm };

export function ResetPasswordScreen({
  onLogin,
  onRequest,
}: {
  onLogin: () => void;
  onRequest: () => void;
}) {
  const { application, state, configured, callbackError } = useRegistration();
  const [password, setPassword] = useState(''),
    [confirmation, setConfirmation] = useState(''),
    [busy, setBusy] = useState(false),
    [completed, setCompleted] = useState(false),
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
    if (
      pending.current ||
      !configured ||
      state.kind !== 'recovery' ||
      callbackError
    )
      return;
    const problem = newPasswordProblem(password, confirmation);
    if (problem) {
      setError(authMessage(problem));
      return;
    }
    pending.current = true;
    setBusy(true);
    setError(null);
    const value = password;
    setPassword('');
    setConfirmation('');
    try {
      await application.setRecoveredPassword(value);
      if (active.current) setCompleted(true);
    } catch (e) {
      if (active.current)
        setError(
          e instanceof AuthError && e.code === 'invalid-input'
            ? 'La nueva contraseña no cumple la política de seguridad o coincide con la anterior. Elige otra clave.'
            : authMessage(
                e instanceof AuthError ? e.code : 'provider-unavailable',
              ),
        );
    } finally {
      pending.current = false;
      if (active.current) setBusy(false);
    }
  }
  async function leave(destination: () => void) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setPassword('');
    setConfirmation('');
    try {
      await application.signOutCurrent();
      if (active.current) destination();
    } catch {
      if (active.current) setError(authMessage('persistence-failed'));
    } finally {
      pending.current = false;
      if (active.current) setBusy(false);
    }
  }
  return (
    <ResetPasswordForm
      allowed={state.kind === 'recovery' && !callbackError}
      busy={!configured || busy || state.kind === 'resolving'}
      completed={completed}
      password={password}
      confirmation={confirmation}
      error={error ?? (callbackError ? authMessage(callbackError) : null)}
      onPassword={(value) => {
        setError(null);
        setPassword(value);
      }}
      onConfirmation={(value) => {
        setError(null);
        setConfirmation(value);
      }}
      onSubmit={() => {
        void submit();
      }}
      onCancel={() => {
        void leave(onLogin);
      }}
      onRequest={() => {
        void leave(onRequest);
      }}
    />
  );
}
