import { useEffect, useRef, useState } from 'react';
import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
import { Screen } from '../../../shared/ui/screen';
import { AuthError, type AuthFailure } from '../domain/auth-error';
import { newPasswordProblem } from '../domain/password-policy';
import { useRegistration } from './use-registration';
import { authMessage } from './auth-messages';
import { GoogleAccess } from './google-access';
import {
  SignUpForm,
  SignUpGoogleContent,
  type RegistrationValues,
} from './sign-up-form';
export { SignUpForm, signUpHeaderOptions } from './sign-up-form';
export function SignUpScreen({
  onConfirm,
  onHome,
  onLogin,
}: {
  onConfirm: () => void;
  onHome: () => void;
  onLogin?: () => void;
}) {
  const { application, state, configured } = useRegistration();
  const [values, setValues] = useState<RegistrationValues>({
    displayName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<AuthFailure | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const sending = useRef(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  async function submit() {
    if (sending.current || !configured) return;
    const problem = newPasswordProblem(values.password, confirmation);
    if (problem) {
      setError(problem);
      return;
    }
    sending.current = true;
    setSubmitting(true);
    setError(null);
    const input = { ...values, phone: values.phone.trim() || null };
    setValues((v) => ({ ...v, password: '' }));
    setConfirmation('');
    try {
      await application.register(input);
      const next = application.getSnapshot();
      if (
        active.current &&
        (['confirmation-required', 'ready', 'profile-required'].includes(
          next.kind,
        ) ||
          application.canRetryProfile())
      )
        onConfirm();
    } catch (e) {
      if (active.current)
        setError(e instanceof AuthError ? e.code : 'provider-unavailable');
    } finally {
      sending.current = false;
      if (active.current) setSubmitting(false);
    }
  }
  const code = error ?? (state.kind === 'retryable-error' ? state.error : null);
  if (
    state.kind === 'ready' ||
    state.kind === 'profile-required' ||
    application.canRetryProfile()
  )
    return (
      <Screen>
        <AppText variant="title">Continúa con tu perfil</AppText>
        <AppText>
          Ya hay una confirmación en curso. No hace falta registrar otra cuenta
          para completar o reintentar tu perfil.
        </AppText>
        <AppButton label="Continuar con la confirmación" onPress={onConfirm} />
        <AppButton label="Volver al inicio" onPress={onHome} />
      </Screen>
    );
  return (
    <SignUpForm
      values={values}
      confirmation={confirmation}
      busy={
        submitting ||
        !configured ||
        state.kind === 'resolving' ||
        state.kind === 'oauth-pending'
      }
      googleAccess={<GoogleAccess renderContent={SignUpGoogleContent} />}
      error={code ? authMessage(code) : null}
      onChange={(field, value) => {
        if (field === 'password') setError(null);
        setValues((v) => ({ ...v, [field]: value }));
      }}
      onConfirmation={(value) => {
        setError(null);
        setConfirmation(value);
      }}
      onSubmit={() => {
        void submit();
      }}
      onHome={onHome}
      onLogin={onLogin}
    />
  );
}
