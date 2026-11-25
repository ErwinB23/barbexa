import { useEffect, useRef, useState } from 'react';
import { AuthError, type AuthFailure } from '../domain/auth-error';
import { authMessage } from './auth-messages';
import { useRegistration } from './use-registration';
import { GoogleAccess } from './google-access';
import { SignInForm, GoogleLoginContent } from './sign-in-form';
export { SignInForm, signInHeaderOptions } from './sign-in-form';
export function SignInScreen({
  onReady,
  onProfile,
  onRegister,
  onHome,
  onForgotPassword,
}: {
  onReady: () => void;
  onProfile: () => void;
  onRegister: () => void;
  onHome: () => void;
  onForgotPassword?: () => void;
}) {
  const { application, state, configured } = useRegistration();
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState('');
  const [error, setError] = useState<AuthFailure | null>(null);
  const sending = useRef(false),
    active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    if (state.kind === 'ready') onReady();
    else if (state.kind === 'profile-required' || application.canRetryProfile())
      onProfile();
  }, [state, application, onReady, onProfile]);
  async function submit() {
    if (sending.current || !configured) return;
    sending.current = true;
    setError(null);
    const input = { email, password };
    setPassword('');
    try {
      await application.signIn(input);
    } catch (e) {
      if (active.current)
        setError(e instanceof AuthError ? e.code : 'provider-unavailable');
    } finally {
      sending.current = false;
    }
  }
  async function cleanup() {
    setError(null);
    try {
      await application.signOutCurrent();
    } catch {
      if (active.current) setError('persistence-failed');
    }
  }
  const code = error ?? (state.kind === 'retryable-error' ? state.error : null);
  const incomplete = code === 'persistence-failed';
  const notice =
    state.kind === 'signed-out' && state.logout
      ? state.logout === 'confirmed'
        ? 'Sesión cerrada en este dispositivo.'
        : 'Sesión cerrada localmente. No se confirmó la revocación remota; otros dispositivos no se cerraron.'
      : null;
  return (
    <SignInForm
      email={email}
      password={password}
      busy={
        !configured ||
        state.kind === 'resolving' ||
        state.kind === 'oauth-pending'
      }
      googleAccess={<GoogleAccess renderContent={GoogleLoginContent} />}
      error={
        incomplete
          ? 'El cierre local no está confirmado por un fallo de almacenamiento. Reintenta la limpieza antes de continuar.'
          : code
            ? authMessage(code)
            : null
      }
      notice={notice}
      onEmail={setEmail}
      onPassword={setPassword}
      onSubmit={() => {
        void submit();
      }}
      onRegister={onRegister}
      onHome={onHome}
      onForgotPassword={onForgotPassword}
      onRetryCleanup={
        incomplete
          ? () => {
              void cleanup();
            }
          : null
      }
    />
  );
}
