import { useState } from 'react';
import type { SignInForm as NativeSignInForm } from './sign-in-form';
import { LoginIcon } from './login-icons.web';
import { AuthWebShell, navigate } from './auth-web-shell';
export { GoogleLoginContent } from './google-access-content.web';

export const signInHeaderOptions = { headerShown: false };
type Props = Parameters<typeof NativeSignInForm>[0];
export function SignInForm(props: Props) {
  const [visible, setVisible] = useState(false);
  const { busy, error, notice } = props;
  return (
    <AuthWebShell titleId="login-title" onHome={props.onHome}>
      <h1 id="login-title">Bienvenido de nuevo</h1>
      <p className="ab-login__subtitle">
        Inicia sesión para gestionar tus reservas, citas y perfil.
      </p>
      {notice && (
        <p role="status" className="ab-login__message">
          {notice}
        </p>
      )}
      {error && (
        <p
          id="login-error"
          role="alert"
          className="ab-login__message ab-login__message--error"
        >
          {error}
        </p>
      )}
      <form
        className="ab-login__form"
        aria-busy={busy}
        onSubmit={(event) => {
          event.preventDefault();
          if (!busy && !props.onRetryCleanup) props.onSubmit();
        }}
      >
        <div className="ab-login__field">
          <div className="ab-login__input-shell ab-login__floating-field">
            <LoginIcon name="mail" />
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder=" "
              value={props.email}
              onChange={(e) => props.onEmail(e.target.value)}
              disabled={busy}
              required
              aria-describedby={error ? 'login-error' : undefined}
              aria-invalid={!!error}
            />
            <label htmlFor="login-email">Correo electrónico</label>
          </div>
        </div>
        <div className="ab-login__field">
          <div className="ab-login__input-shell ab-login__floating-field">
            <LoginIcon name="lock" />
            <input
              id="login-password"
              name="password"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder=" "
              value={props.password}
              onChange={(e) => props.onPassword(e.target.value)}
              disabled={busy}
              required
              aria-describedby={error ? 'login-error' : undefined}
              aria-invalid={!!error}
            />
            <label htmlFor="login-password">Contraseña</label>
            <button
              className="ab-login__eye"
              type="button"
              aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={visible}
              disabled={busy}
              onClick={() => setVisible((v) => !v)}
            >
              <LoginIcon name={visible ? 'eye-off' : 'eye'} />
            </button>
          </div>
        </div>
        {props.onForgotPassword && (
          <a
            className="ab-login__forgot"
            href="/forgot-password"
            aria-disabled={busy}
            tabIndex={busy ? -1 : undefined}
            onClick={(e) => navigate(e, props.onForgotPassword, busy)}
          >
            ¿Olvidaste tu contraseña?
          </a>
        )}
        {busy && (
          <p className="ab-login__loading" role="status">
            Comprobando acceso…
          </p>
        )}
        {props.onRetryCleanup && (
          <button
            type="button"
            className="ab-login__cleanup"
            disabled={busy}
            onClick={props.onRetryCleanup}
          >
            Reintentar cierre local
          </button>
        )}
        <button
          type="submit"
          className="ab-login__primary"
          disabled={busy || !!props.onRetryCleanup}
        >
          Iniciar sesión
          <LoginIcon name="arrow" />
        </button>
      </form>
      <div className="ab-login__divider">o continúa con</div>
      {props.googleAccess}
      <p className="ab-login__signup">
        <span>¿No tienes cuenta?</span>
        <a
          href="/sign-up"
          aria-disabled={busy}
          tabIndex={busy ? -1 : undefined}
          onClick={(e) => navigate(e, props.onRegister, busy)}
        >
          Crear cuenta
        </a>
      </p>
    </AuthWebShell>
  );
}
