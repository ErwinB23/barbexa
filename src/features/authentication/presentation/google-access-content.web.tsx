import type { GoogleAccessContentProps } from './google-access';
import { GoogleMark } from './login-icons.web';

export function GoogleLoginContent({
  enabled,
  pending,
  busy,
  error,
  onBegin,
  onCancel,
}: GoogleAccessContentProps) {
  return (
    <div>
      {pending ? (
        <>
          <p className="ab-login__message" role="status">
            Continúa con Google en el navegador. Al volver verificaremos tu
            cuenta.
          </p>
          <button
            className="ab-login__google-button"
            type="button"
            disabled={busy}
            onClick={() => {
              if (!busy) onCancel();
            }}
          >
            Cancelar acceso con Google
          </button>
        </>
      ) : (
        <>
          <button
            className="ab-login__google-button"
            type="button"
            disabled={!enabled || busy}
            onClick={() => {
              if (enabled && !busy) onBegin();
            }}
          >
            <GoogleMark />
            Continuar con Google
          </button>
          {!enabled && (
            <p className="ab-login__google-note">
              Google pendiente de configuración en este entorno. Puedes usar tu
              correo.
            </p>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="ab-login__message ab-login__message--error">
          {error}
        </p>
      )}
    </div>
  );
}
