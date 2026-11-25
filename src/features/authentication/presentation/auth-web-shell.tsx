import type { MouseEvent, ReactNode } from 'react';
import { BarberEmblem, LoginIcon } from './login-icons.web';
import { loginWebStyles } from './sign-in-web.styles';
import { authReferenceStyles } from './auth-reference.styles';

export function navigate(
  event: MouseEvent<HTMLAnchorElement>,
  action?: () => void,
  disabled = false,
) {
  if (disabled) {
    event.preventDefault();
    return;
  }
  if (
    !action ||
    event.button !== 0 ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  event.preventDefault();
  action();
}
export function AuthWebShell({
  children,
  titleId,
  onHome,
  variant,
  styles,
}: {
  children: ReactNode;
  titleId: string;
  onHome?: () => void;
  variant?: 'signup' | 'recovery';
  styles?: string;
}) {
  const brand = (
    <>
      <BarberEmblem />
      <span>BARBEXA</span>
    </>
  );
  const content = (
    <main className={variant ? `ab-login ab-${variant}` : 'ab-login'}>
      <style>{loginWebStyles}</style>
      {styles && <style>{styles}</style>}
      {variant && <style>{authReferenceStyles}</style>}
      <img
        className="ab-login__photograph"
        src="/images/login-barbershop-1920x1080.generated.jpg"
        alt=""
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
      />
      <aside
        className="ab-login__story"
        aria-label="BARBEXA, tu barbería siempre contigo"
      >
        <span className="ab-login__scissors" aria-hidden="true">
          <LoginIcon name="scissors" />
        </span>
        <h2>BARBEXA</h2>
        <span className="ab-login__rule" aria-hidden="true" />
        <p className="ab-login__tagline">Tu barbería, siempre contigo.</p>
        <span
          className="ab-login__rule ab-login__rule--gold"
          aria-hidden="true"
        />
        <p className="ab-login__description">
          Reserva tus citas, gestiona tus servicios y mantén tu estilo al día de
          forma fácil y rápida.
        </p>
        <ul className="ab-login__benefits">
          <li>
            <LoginIcon name="calendar" />
            <span>
              Reserva citas
              <br />
              online
            </span>
          </li>
          <li>
            <LoginIcon name="scissors" />
            <span>
              Gestiona
              <br />
              tus servicios
            </span>
          </li>
          <li>
            <LoginIcon name="user" />
            <span>
              Tu perfil
              <br />y preferencias
            </span>
          </li>
        </ul>
      </aside>
      <section className="ab-login__card" aria-labelledby={titleId}>
        {onHome ? (
          <a
            href="/"
            className="ab-login__brand"
            aria-label="BARBEXA, volver al inicio"
            onClick={(e) => navigate(e, onHome)}
          >
            {brand}
          </a>
        ) : (
          <div className="ab-login__brand">{brand}</div>
        )}
        {children}
      </section>
    </main>
  );
  return variant === 'signup' ? (
    <div className="ab-signup-scroll">{content}</div>
  ) : (
    content
  );
}
