import type { ReactNode } from 'react';
import type { BookingDetail } from '../domain/types';
import { AppButton } from '../../../shared/ui/app-button';
import {
  WorkspaceIcon,
  type WorkspaceIconName,
} from '../../../shared/ui/workspace-icon.web';
import { confirmationStyles } from './booking-confirmation-web.styles';

type ConfirmationIconName =
  WorkspaceIconName | 'clock' | 'coins' | 'scissors' | 'shield' | 'flag';
function ConfirmationIcon({ name }: { name: ConfirmationIconName }) {
  const paths: Record<string, string> = {
    clock: 'M12 7v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    coins:
      'M3 6c0-4 18-4 18 0s-18 4-18 0Zm0 0v6c0 4 18 4 18 0V6M3 12v6c0 4 18 4 18 0v-6',
    scissors:
      'M8 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m14 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0M7 7l13 15M17 7 4 22',
    shield: 'M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7Zm-5 9 3 3 6-6',
    flag: 'M4 22V3c6-4 10 5 16 0v11c-6 5-10-4-16 0',
  };
  return paths[name] ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  ) : (
    <WorkspaceIcon name={name as WorkspaceIconName} />
  );
}
export function ConfirmationAction({
  icon,
  children,
}: {
  icon: WorkspaceIconName;
  children: ReactNode;
}) {
  return (
    <div className="bx-confirm-action">
      <WorkspaceIcon name={icon} />
      {children}
      <WorkspaceIcon name="arrow" />
    </div>
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m6 12 4 4 8-8" />
    </svg>
  );
}
function Scissors() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="5" cy="5" r="3" />
      <circle cx="19" cy="5" r="3" />
      <path d="m7 7 13 15M17 7 4 22" />
    </svg>
  );
}
function Row({
  icon,
  label,
  children,
}: {
  icon: ConfirmationIconName;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="bx-confirm-row">
      <ConfirmationIcon name={icon} />
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
const soles = (minor: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(
    minor / 100,
  );
export function BookingConfirmationWeb({
  detail: d,
  replayed = false,
  onOwn,
  onAnother,
  care,
}: {
  detail: BookingDetail;
  replayed?: boolean;
  onOwn: () => void;
  onAnother: () => void;
  care: ReactNode;
}) {
  const date = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(d.startsAt));
  const advance = d.policySnapshot.cancellationAdvanceMin;
  return (
    <div className="bx-confirmation">
      <style>{confirmationStyles}</style>
      <div className="bx-confirm-wrap">
        <header className="bx-confirm-top">
          <div className="bx-confirm-brand" aria-label="BARBEXA">
            <span />
            <div>
              <Scissors />
              <b>BARBEXA</b>
            </div>
            <span />
          </div>
          <div className="bx-confirm-own">
            <WorkspaceIcon name="calendar" />
            <AppButton
              label="Mis reservas"
              variant="secondary"
              onPress={onOwn}
            />
          </div>
        </header>
        <section
          className="bx-confirm-success"
          aria-labelledby="booking-confirmed-title"
        >
          <div className="bx-confirm-check">
            <Check />
          </div>
          <h1 id="booking-confirmed-title">¡Reserva confirmada!</h1>
          <p>
            {replayed
              ? 'Recuperamos los datos de tu cita sin crear otra reserva.'
              : 'Tu cita ha sido registrada correctamente.'}
          </p>
          <div className="bx-confirm-banner" role="status">
            <Check />
            Tu reserva está confirmada.
          </div>
        </section>
        <div className="bx-confirm-columns">
          <section
            className="bx-confirm-card bx-confirm-details"
            aria-label="Detalle de la reserva confirmada"
          >
            <header>
              <span className="bx-confirm-shop-icon">
                <Scissors />
              </span>
              <div>
                <h2>{d.shopNameSnapshot}</h2>
                <span className="bx-confirm-badge">
                  <Check />
                  Cita confirmada
                </span>
              </div>
            </header>
            <dl>
              <Row icon="calendar" label="Fecha y hora">
                <strong>{date} · hora de Lima</strong>
              </Row>
              <Row icon="user" label="Profesional">
                <strong>{d.barberNameSnapshot}</strong>
              </Row>
              <Row icon="user" label="Cliente">
                <strong>{d.clientDisplayNameSnapshot}</strong>
              </Row>
              <Row
                icon="scissors"
                label={d.items.length > 1 ? 'Servicios' : 'Servicio'}
              >
                <div className="bx-confirm-services">
                  {d.items.map((item) => (
                    <div key={item.serviceId}>
                      <strong>{item.nameSnapshot}</strong>
                      {item.descriptionSnapshot && (
                        <small>{item.descriptionSnapshot}</small>
                      )}
                    </div>
                  ))}
                </div>
              </Row>
              <Row icon="coins" label="Total">
                <div className="bx-confirm-total">
                  <strong>{soles(d.total.amountMinor)}</strong>
                  <span>
                    <ConfirmationIcon name="clock" />
                    <span>
                      Duración<strong>{d.durationMin} minutos</strong>
                    </span>
                  </span>
                </div>
              </Row>
              <Row icon="reservations" label="Código de cita">
                <span className="bx-confirm-code">{d.id}</span>
              </Row>
            </dl>
            <p className="bx-confirm-policy-note">
              <WorkspaceIcon name="bell" />
              Antelación de cancelación de esta cita: {advance} minutos.
            </p>
          </section>
          <aside
            className="bx-confirm-sidebar"
            aria-label="Información y acciones de tu cita"
          >
            <section className="bx-confirm-card">
              <h2>
                <ConfirmationIcon name="flag" />
                Qué sigue
              </h2>
              <ol className="bx-confirm-next">
                <li>Presenta tu cita en la barbería.</li>
                <li>Consulta atención y pago.</li>
                <li>
                  Gestiona cambios desde <strong>Mis reservas</strong>.
                </li>
              </ol>
            </section>
            <section className="bx-confirm-card">
              <h2>
                <ConfirmationIcon name="shield" />
                Políticas
              </h2>
              <div className="bx-confirm-policies">
                <p>
                  <WorkspaceIcon name="calendar" />
                  <span>
                    <strong>Cancelación:</strong>{' '}
                    {advance === 0 ? (
                      'puedes solicitar la cancelación hasta el inicio de tu cita.'
                    ) : (
                      <>
                        puedes solicitar la cancelación con al menos {advance}{' '}
                        minutos de antelación.
                      </>
                    )}
                  </span>
                </p>
                <p>
                  <WorkspaceIcon name="calendar" />
                  <span>
                    <strong>Puntualidad:</strong> te recomendamos llegar a
                    tiempo para brindarte la mejor atención.
                  </span>
                </p>
              </div>
            </section>
            <section className="bx-confirm-card bx-confirm-actions">
              <h2>
                <WorkspaceIcon name="bolt" />
                Acciones rápidas
              </h2>
              {care}
              <ConfirmationAction icon="calendar">
                <AppButton
                  label="Reservar otra cita"
                  variant="secondary"
                  onPress={onAnother}
                />
              </ConfirmationAction>
              <ConfirmationAction icon="calendar">
                <AppButton
                  label="Ir a mis reservas"
                  variant="secondary"
                  onPress={onOwn}
                />
              </ConfirmationAction>
            </section>
          </aside>
        </div>
        <ol className="bx-confirm-progress" aria-label="Estado de tu reserva">
          <li className="is-done">
            <Check />
            <strong>Reserva creada</strong>
            <span>Tu solicitud fue registrada.</span>
          </li>
          <li className="is-done">
            <Check />
            <strong>Confirmación registrada</strong>
            <span>Detalles disponibles en Mis reservas.</span>
          </li>
          <li>
            <span className="bx-confirm-pending" />
            <strong>Atención en la barbería</strong>
            <span>Consulta el estado de tu atención y pago.</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
