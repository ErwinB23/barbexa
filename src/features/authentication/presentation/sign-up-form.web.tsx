import type { SignUpFormProps } from './sign-up-form';
import { AuthWebShell, navigate } from './auth-web-shell';
import { AuthWebField } from './auth-web-field';
import { PasswordRequirements } from './password-requirements.web';
import { signUpWebStyles } from './sign-up-web.styles';

export { GoogleLoginContent as SignUpGoogleContent } from './google-access-content.web';
export const signUpHeaderOptions = { headerShown: false };

export function SignUpForm({
  values,
  confirmation,
  busy,
  error,
  onChange,
  onConfirmation,
  onSubmit,
  onHome,
  onLogin,
  googleAccess,
}: SignUpFormProps) {
  return (
    <AuthWebShell
      variant="signup"
      styles={signUpWebStyles}
      titleId="signup-title"
      onHome={onHome}
    >
      <h1 id="signup-title">Crea tu cuenta</h1>
      <p className="ab-login__subtitle">
        Confirma tu correo y empieza a reservar. No necesitas pertenecer a una
        barbería.
      </p>
      {googleAccess}
      <div className="ab-login__divider">o regístrate con tu correo</div>
      <form
        className="ab-login__form"
        aria-busy={busy}
        onSubmit={(event) => {
          event.preventDefault();
          if (!busy) onSubmit();
        }}
      >
        <AuthWebField
          id="sign-up-name"
          label="Nombre visible"
          icon="user"
          value={values.displayName}
          autoComplete="name"
          busy={busy}
          change={(value) => onChange('displayName', value)}
        />
        <AuthWebField
          id="sign-up-email"
          label="Correo electrónico"
          icon="mail"
          type="email"
          value={values.email}
          autoComplete="email"
          busy={busy}
          change={(value) => onChange('email', value)}
        />
        <AuthWebField
          id="sign-up-phone"
          label="Teléfono (opcional)"
          icon="phone"
          type="tel"
          value={values.phone}
          autoComplete="tel"
          busy={busy}
          required={false}
          change={(value) => onChange('phone', value)}
        />
        <AuthWebField
          id="sign-up-password"
          label="Contraseña"
          icon="lock"
          type="password"
          value={values.password}
          autoComplete="new-password"
          busy={busy}
          descriptionId="signup-password-requirements"
          change={(value) => onChange('password', value)}
        />
        <PasswordRequirements
          checksOnly
          id="signup-password-requirements"
          password={values.password}
        />
        <AuthWebField
          id="sign-up-confirmation"
          label="Confirmar contraseña"
          icon="lock"
          type="password"
          value={confirmation}
          autoComplete="new-password"
          busy={busy}
          change={onConfirmation}
        />
        {error && (
          <p
            className="ab-login__message ab-login__message--error"
            role="alert"
          >
            {error}
          </p>
        )}
        {busy && (
          <p role="status" className="ab-login__loading">
            Preparando tu registro…
          </p>
        )}
        <button type="submit" className="ab-login__primary" disabled={busy}>
          Crear cuenta
        </button>
      </form>
      <p className="ab-login__signup">
        <span>¿Ya tienes cuenta?</span>
        <a href="/sign-in" onClick={(event) => navigate(event, onLogin)}>
          Iniciar sesión
        </a>
      </p>
      <a
        className="ab-signup__home"
        href="/"
        onClick={(event) => navigate(event, onHome)}
      >
        Volver al inicio
      </a>
    </AuthWebShell>
  );
}
