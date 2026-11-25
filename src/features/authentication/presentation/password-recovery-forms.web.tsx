import { useEffect, useRef, type ComponentProps } from 'react';
import { AuthWebField } from './auth-web-field';
import { AuthWebShell } from './auth-web-shell';
import { LoginIcon } from './login-icons.web';
import { PasswordRequirements } from './password-requirements.web';
import type * as Native from './password-recovery-forms';
import { recoveryWebStyles } from './password-recovery-web.styles';

export const recoveryHeaderOptions = { headerShown: false };

function RecoveryFeedback({
  busy,
  error,
}: {
  busy?: string;
  error: string | null;
}) {
  return (
    <>
      {busy && (
        <p className="ab-login__loading" role="status">
          {busy}
        </p>
      )}
      {error && (
        <p className="ab-login__message ab-login__message--error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

function BackToLogin({
  busy,
  onCancel,
}: {
  busy: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="ab-recovery__footer">
      <button
        type="button"
        className="ab-recovery__link ab-recovery__back"
        disabled={busy}
        onClick={onCancel}
      >
        <LoginIcon name="arrow" />
        Volver al inicio de sesión
      </button>
    </div>
  );
}

export function ForgotPasswordForm({
  email,
  busy,
  sent,
  error,
  onEmail,
  onSubmit,
  onCancel,
}: ComponentProps<typeof Native.ForgotPasswordForm>) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (sent) heading.current?.focus();
  }, [sent]);
  return (
    <AuthWebShell
      variant="recovery"
      styles={recoveryWebStyles}
      titleId="recovery-title"
    >
      <h1 id="recovery-title" ref={heading} tabIndex={-1}>
        {sent ? 'Revisa tu correo' : 'Recupera tu acceso'}
      </h1>
      {sent ? (
        <>
          <p className="ab-login__subtitle">
            Si existe una cuenta con ese correo, recibirás un enlace para
            restablecer tu contraseña. Ábrelo en este mismo navegador para
            continuar.
          </p>
          <p className="ab-recovery__hint">
            Si no encuentras el correo, revisa tu bandeja de spam o solicita un
            enlace nuevo. Si recibes varios, usa el más reciente.
          </p>
          <RecoveryFeedback
            busy={busy ? 'Preparando tu solicitud…' : undefined}
            error={error}
          />
          <button
            type="button"
            className="ab-login__primary"
            disabled={busy}
            onClick={onCancel}
          >
            Volver al inicio de sesión
          </button>
          <div className="ab-recovery__footer">
            <button
              type="button"
              className="ab-recovery__link"
              disabled={busy}
              onClick={onSubmit}
            >
              Reenviar enlace
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="ab-login__subtitle">
            Te enviaremos un enlace a tu correo electrónico para que puedas
            restablecer tu contraseña.
          </p>
          <form
            className="ab-login__form ab-recovery__request-form"
            aria-busy={busy}
            onSubmit={(event) => {
              event.preventDefault();
              if (!busy) onSubmit();
            }}
          >
            <AuthWebField
              id="recovery-email"
              label="Correo electrónico"
              icon="mail"
              type="email"
              autoComplete="email"
              value={email}
              change={onEmail}
              busy={busy}
            />
            <RecoveryFeedback
              busy={busy ? 'Solicitando enlace…' : undefined}
              error={error}
            />
            <button type="submit" className="ab-login__primary" disabled={busy}>
              Enviar enlace <LoginIcon name="arrow" />
            </button>
          </form>
          <BackToLogin busy={busy} onCancel={onCancel} />
        </>
      )}
    </AuthWebShell>
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
}: ComponentProps<typeof Native.ResetPasswordForm>) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (completed) heading.current?.focus();
  }, [completed]);
  return (
    <AuthWebShell
      variant="recovery"
      styles={recoveryWebStyles}
      titleId="reset-title"
    >
      <h1 id="reset-title" ref={heading} tabIndex={-1}>
        {completed
          ? 'Contraseña actualizada'
          : 'Establece una nueva contraseña'}
      </h1>
      {completed ? (
        <p className="ab-login__subtitle" role="status">
          Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
      ) : allowed ? (
        <>
          <p className="ab-login__subtitle">
            Ingresa y confirma tu nueva contraseña para recuperar el acceso a tu
            cuenta.
          </p>
          <form
            className="ab-login__form"
            aria-busy={busy}
            onSubmit={(event) => {
              event.preventDefault();
              if (!busy) onSubmit();
            }}
          >
            <AuthWebField
              id="reset-password"
              label="Nueva contraseña"
              icon="lock"
              type="password"
              autoComplete="new-password"
              value={password}
              change={onPassword}
              busy={busy}
              descriptionId="reset-password-requirements"
            />
            <PasswordRequirements
              id="reset-password-requirements"
              password={password}
            />
            <AuthWebField
              id="reset-confirmation"
              label="Confirmar contraseña"
              icon="lock"
              type="password"
              autoComplete="new-password"
              value={confirmation}
              change={onConfirmation}
              busy={busy}
            />
            <RecoveryFeedback
              busy={busy ? 'Guardando nueva contraseña…' : undefined}
              error={error}
            />
            <button type="submit" className="ab-login__primary" disabled={busy}>
              Guardar nueva contraseña
            </button>
          </form>
        </>
      ) : (
        !busy && (
          <p className="ab-login__subtitle">
            Necesitas un enlace válido solicitado desde este navegador. Si
            venció, ya se usó o falta su verificación, solicita uno nuevo.
          </p>
        )
      )}
      {(completed || !allowed) && (
        <RecoveryFeedback
          busy={
            busy
              ? completed
                ? 'Volviendo al inicio de sesión…'
                : 'Verificando recuperación…'
              : undefined
          }
          error={error}
        />
      )}
      {!allowed && !busy && !completed && (
        <button type="button" className="ab-login__primary" onClick={onRequest}>
          Solicitar nuevo enlace
        </button>
      )}
      <BackToLogin busy={busy} onCancel={onCancel} />
    </AuthWebShell>
  );
}
