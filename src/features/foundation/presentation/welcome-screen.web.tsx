import { Link } from 'expo-router';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { WebSurface } from '@/shared/ui/web-surface';
import { BarbexaBrand } from '@/shared/ui/barbexa-brand.web';
import { SiteIcon as LoginIcon } from '@/shared/ui/site-icon.web';
import { welcomeWebStyles } from './welcome-web.styles';
import { StepFlipCard } from './step-flip-card.web';
import type { WelcomeScreen as SharedWelcomeScreen } from './welcome-screen';

const sections = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'como-funciona', label: '¿Cómo funciona?' },
  { id: 'beneficios', label: 'Beneficios' },
] as const;
const steps = [
  {
    title: 'Elige una barbería',
    description:
      'Explora las barberías disponibles y selecciona la que prefieras.',
    icon: 'scissors',
    backTitle: 'Encuentra tu barbería ideal',
    details:
      'En Barbexa puedes explorar las barberías disponibles y conocer sus servicios antes de elegir dónde realizar tu próximo corte.',
    points: [
      'Explora las barberías disponibles.',
      'Conoce los servicios que ofrecen.',
      'Consulta precios y duraciones.',
      'Selecciona la opción que prefieras.',
    ],
  },
  {
    title: 'Selecciona un servicio',
    description: 'Consulta precios, duración y profesionales disponibles.',
    icon: 'user',
    backTitle: 'Personaliza tu próxima visita',
    details:
      'Selecciona el servicio que necesitas y revisa su precio y tiempo estimado de atención. Cuando esté disponible, también podrás elegir al profesional de tu preferencia.',
    points: [
      'Consulta los servicios ofrecidos.',
      'Revisa precios y duración.',
      'Elige el servicio que necesitas.',
      'Selecciona un profesional cuando corresponda.',
    ],
  },
  {
    title: 'Reserva tu cita',
    description: 'Elige un horario disponible y confirma tu reserva.',
    icon: 'calendar',
    backTitle: 'Confirma tu próximo corte',
    details:
      'Consulta las fechas y horarios disponibles, selecciona el momento que mejor se adapte a tu agenda y revisa los detalles antes de confirmar.',
    points: [
      'Selecciona una fecha disponible.',
      'Elige el horario que prefieras.',
      'Revisa el resumen de tu reserva.',
      'Confirma y consulta tu cita desde tu cuenta.',
    ],
  },
] as const;
const benefits = [
  {
    title: 'Ahorra tiempo',
    description:
      'Consulta los horarios disponibles sin tener que acudir personalmente.',
    icon: 'calendar',
    backTitle: 'Encuentra un horario antes de ir',
    details:
      'Revisa la disponibilidad de la barbería y del profesional desde el proceso de reserva. Elige una fecha y una hora que se ajusten a tu día.',
    points: [
      'Consulta los horarios disponibles.',
      'Selecciona la fecha que te convenga.',
      'Revisa los detalles antes de confirmar.',
    ],
  },
  {
    title: 'Organiza tus citas',
    description: 'Revisa las reservas desde tu cuenta.',
    icon: 'user',
    backTitle: 'Tus reservas, siempre a mano',
    details:
      'Entra a Mis reservas para consultar tus citas y su estado. Desde cada reserva puedes revisar los detalles y las acciones disponibles según sus condiciones.',
    points: [
      'Consulta fecha, hora y profesional.',
      'Revisa tus reservas y su historial.',
      'Cancela o reprograma cuando las condiciones lo permitan.',
    ],
  },
  {
    title: 'Información clara',
    description: 'Consulta servicios, precios y duración antes de reservar.',
    icon: 'scissors',
    backTitle: 'Conoce el servicio antes de reservar',
    details:
      'Consulta los servicios que ofrece cada barbería, su precio y el tiempo de atención. Revisa el resumen de tu selección antes de confirmar la cita.',
    points: [
      'Compara los servicios disponibles.',
      'Consulta el precio y la duración.',
      'Revisa el total de tu selección.',
    ],
  },
  {
    title: 'Desde cualquier lugar',
    description: 'Utiliza Barbexa desde tu computadora o navegador móvil.',
    icon: 'phone',
    backTitle: 'Accede desde tu navegador',
    details:
      'Usa Barbexa desde una computadora, tablet o navegador móvil con conexión a internet. Accede con tu cuenta para reservar y consultar tus citas.',
    points: [
      'Diseño adaptable al tamaño de tu pantalla.',
      'Accede a tu cuenta desde la Web.',
      'Consulta tus reservas con conexión a internet.',
    ],
  },
] as const;
export function WelcomeScreen({
  onOpenSession,
  onRegister,
  onBooking,
  sessionLabel = 'Iniciar sesión',
}: ComponentProps<typeof SharedWelcomeScreen>) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState('inicio');
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const update = () => {
      let current = 'inicio';
      const top = container.getBoundingClientRect().top;
      for (const { id } of sections) {
        const target = container.querySelector<HTMLElement>('#' + id);
        if (
          target &&
          target.getBoundingClientRect().top - top <=
            container.clientHeight * 0.4
        )
          current = id;
      }
      setActive(current);
    };
    container.addEventListener('scroll', update, { passive: true });
    const header = container.querySelector('header');
    const measureHeader = () => {
      container.style.setProperty(
        '--landing-header-height',
        `${(header?.getBoundingClientRect().height ?? 80) + 16}px`,
      );
    };
    measureHeader();
    const resize =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(measureHeader);
    if (header) resize?.observe(header);
    update();
    return () => {
      container.removeEventListener('scroll', update);
      resize?.disconnect();
    };
  }, []);
  return (
    <WebSurface kind="home">
      <style>{welcomeWebStyles}</style>
      <div className="bx-landing" ref={root}>
        <header className="bx-landing-header">
          <a href="#inicio" className="bx-landing-brand">
            <BarbexaBrand />
          </a>
          <nav aria-label="Navegación principal">
            {sections.map(({ id, label }) => (
              <a
                key={id}
                href={'#' + id}
                aria-current={active === id ? 'location' : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="bx-landing-access">
            {onOpenSession && (
              <Link
                href={onBooking ? '/account' : '/sign-in'}
                className="bx-landing-login"
              >
                {sessionLabel}
              </Link>
            )}
            {onRegister && (
              <Link href="/sign-up" className="bx-landing-register">
                Crear cuenta
              </Link>
            )}
          </div>
        </header>
        <main>
          <section
            id="inicio"
            className="bx-landing-hero"
            aria-labelledby="welcome-title"
          >
            <img
              className="bx-landing-photo"
              src="/images/login-barbershop-1920x1080.generated.jpg"
              alt=""
              width={1920}
              height={1080}
              fetchPriority="high"
              decoding="async"
            />
            <div className="bx-landing-copy">
              <div className="bx-landing-flourish" aria-hidden="true">
                <span />
                <LoginIcon name="scissors" />
                <span />
              </div>
              <p className="bx-landing-eyebrow">
                BARBERÍAS · SERVICIOS · RESERVAS
              </p>
              <h1 id="welcome-title">
                Tu próximo corte <em>empieza aquí.</em>
              </h1>
              <p className="bx-landing-description">
                Descubre barberías, compara servicios y reserva tu cita de forma
                fácil, rápida y segura.
              </p>
            </div>
            <ul className="bx-landing-highlights">
              <li>
                <LoginIcon name="calendar" />
                <span>
                  Reserva
                  <br />
                  en minutos
                </span>
              </li>
              <li>
                <LoginIcon name="user" />
                <span>
                  Profesionales
                  <br />
                  disponibles
                </span>
              </li>
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 5v7l6 3" />
                </svg>
                <span>
                  Horarios
                  <br />
                  disponibles
                </span>
              </li>
            </ul>
          </section>
          <section
            id="como-funciona"
            className="bx-landing-info"
            aria-labelledby="how-title"
          >
            <h2 id="how-title">¿Cómo funciona?</h2>
            <div className="bx-landing-steps">
              {steps.map((step, index) => (
                <StepFlipCard key={step.title} step={index + 1} {...step} />
              ))}
            </div>
          </section>
          <section
            id="beneficios"
            className="bx-landing-info bx-landing-info--benefits"
            aria-labelledby="benefits-title"
          >
            <h2 id="benefits-title">Beneficios de Barbexa</h2>
            <div className="bx-landing-benefits">
              {benefits.map((benefit) => (
                <StepFlipCard key={benefit.title} {...benefit} />
              ))}
            </div>
          </section>
        </main>
        <footer className="bx-landing-footer">
          <span>Barbexa</span>
          <Link href="/technical">Ver base técnica</Link>
        </footer>
      </div>
    </WebSurface>
  );
}
