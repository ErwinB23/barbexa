import type { ReactNode } from 'react';
import { CareOperationConfirmation } from './care-operation-confirmation.web';
import type { BookingDetail } from '../features/reservations/domain/types';
import type {
  CareLayoutParts,
  CareOperation,
} from '../features/reservations/presentation/care-control';
import { bookingTime } from '../features/reservations/presentation/booking-format';
import { WorkspaceIcon } from '../shared/ui/workspace-icon.web';
import { SiteIcon } from '../shared/ui/site-icon.web';
import { professionalDetailStyles } from './professional-reservation-detail.styles';

const attendanceLabels = {
  confirmed: 'Pendiente',
  'in-service': 'En atención',
  completed: 'Completada',
  'no-show': 'No asistió',
  cancelled: 'Cancelada',
};
const paymentLabels = {
  pending: 'Pendiente',
  paid: 'Recibido',
  refunded: 'Reembolsado',
};
const eventLabels: Record<string, string> = {
  'report-yape': 'Pago Yape reportado por el cliente',
  created: 'Creado el',
  started: 'Atención iniciada',
  completed: 'Atención completada',
  'no-show': 'Inasistencia registrada',
  received: 'Pago recibido',
  paid: 'Pago recibido',
  refunded: 'Reembolso registrado',
  cancelled: 'Cita cancelada',
};
const date = (value: string) =>
  new Date(value).toLocaleDateString('es-PE', { timeZone: 'America/Lima' });
const stamp = (value: string) =>
  new Date(value).toLocaleString('es-PE', { timeZone: 'America/Lima' });
function ActionIcon({ command }: { command: string }) {
  const paths: Record<string, string> = {
    start: 'm9 5 10 7-10 7Z',
    complete: 'm4 12 5 5L20 6',
    'no-show':
      'M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M2 21v-2a7 7 0 0 1 11-6m3 2 6 6m0-6-6 6',
    receive: 'M3 5h18v14H3ZM3 9h18m-14 6h4',
    refund: 'M3 5h18v14H3ZM3 9h18m7 4-3 3 3 3m-3-3h7',
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[command] ?? paths.start} />
    </svg>
  );
}
function Row({
  label,
  children,
  icon = 'calendar',
}: {
  label: string;
  children: ReactNode;
  icon?: 'calendar' | 'user' | 'scissors' | 'phone';
}) {
  return (
    <div className="bx-rd-row">
      <SiteIcon name={icon} />
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
function Panel({
  title,
  children,
  icon = 'calendar',
  className = '',
}: {
  title: string;
  children: ReactNode;
  icon?: 'calendar' | 'user' | 'bolt' | 'reservations';
  className?: string;
}) {
  return (
    <section className={`bx-rd-panel ${className}`}>
      <h3>
        <WorkspaceIcon name={icon} />
        {title}
      </h3>
      {children}
    </section>
  );
}
function Operation({
  operation,
  busy,
  primary = false,
}: {
  operation: CareOperation;
  busy: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={primary ? 'bx-rd-primary' : ''}
      disabled={busy}
      onClick={operation.onSelect}
    >
      <ActionIcon command={operation.command} />
      {operation.label}
    </button>
  );
}
export function ProfessionalReservationDetail({
  detail: r,
  parts,
}: {
  detail: BookingDetail;
  parts: CareLayoutParts;
}) {
  const { view, busy, operations, feedback, trigger, actions } = parts;
  const attendance = view
    ? view.attendance
      ? attendanceLabels[view.attendance]
      : 'Sin registro previo'
    : 'Sin consultar';
  const payment = view?.payment;
  const method = payment
    ? payment.method === 'cash'
      ? 'Efectivo'
      : 'Yape'
    : view
      ? 'Sin registro financiero'
      : 'Sin consultar';
  const paymentState = payment
    ? paymentLabels[payment.status]
    : view
      ? 'Sin registro financiero'
      : 'Sin consultar';
  const status =
    r.state === 'cancelled'
      ? 'Cancelada'
      : view?.attendance
        ? view.attendance === 'confirmed'
          ? 'Confirmada'
          : attendance
        : 'Confirmada';
  const message = !view
    ? 'Consulta la atención y el pago para verificar sus estados.'
    : status === 'Confirmada'
      ? 'Pendiente'
      : status === 'En atención'
        ? 'La atención de esta reserva está en curso.'
        : `Reserva ${status.toLocaleLowerCase('es')}.`;
  const recommended = operations.find((o) =>
    ['start', 'complete', 'receive', 'refund'].includes(o.command),
  );
  const created = view?.events.find((e) => e.kind === 'created');
  const services = r.items.map((i) => i.nameSnapshot).join(' + ');
  const money = `S/ ${(r.total.amountMinor / 100).toFixed(2)}`;
  return (
    <div className="bx-rd">
      <style>{professionalDetailStyles}</style>
      <p className="bx-rd-situation" role="status">
        {message === 'Pendiente' ? (
          <span className="bx-rd-pending">
            <span aria-hidden="true" />
            Pendiente
          </span>
        ) : (
          message
        )}
      </p>
      <div className="bx-rd-strip">
        <span>
          <SiteIcon name="scissors" />
          Atención: <strong>{attendance}</strong>
        </span>
        <span>
          <WorkspaceIcon name="reservations" />
          Pago:{' '}
          <strong>
            {method} · {paymentState}
          </strong>
        </span>
        <span>
          <WorkspaceIcon name="calendar" />
          Monto: <strong>{money}</strong>
        </span>
      </div>
      <div className="bx-rd-columns">
        <div className="bx-rd-main">
          <div className="bx-rd-data-pair">
            <Panel title="Datos de la reserva">
              <dl>
                <Row label="Fecha">{date(r.startsAt)}</Row>
                <Row label="Hora">{bookingTime(r.startsAt)} · Lima</Row>
                <Row label="Cliente" icon="user">
                  {r.clientDisplayNameSnapshot}
                </Row>
                <Row label="Servicios" icon="scissors">
                  {services}
                </Row>
                <Row label="Duración">{r.durationMin} min</Row>
                <Row label="Creado el">
                  {created
                    ? stamp(created.occurredAt)
                    : view
                      ? 'Fecha no disponible'
                      : 'Por consultar'}
                </Row>
              </dl>
            </Panel>
            <Panel title="Atención y pago" icon="reservations">
              <div className="bx-rd-consult">{trigger}</div>
              <div className="bx-rd-states">
                <div>
                  <SiteIcon name="scissors" />
                  <span>Estado de atención</span>
                  <strong
                    className={`bx-rd-state ${view?.attendance === 'completed' ? 'is-green' : view?.attendance === 'cancelled' ? 'is-neutral' : view?.attendance === 'no-show' ? 'is-red' : ''}`}
                  >
                    {attendance}
                  </strong>
                </div>
                <div>
                  <WorkspaceIcon name="reservations" />
                  <span>Estado de pago</span>
                  <strong
                    className={`bx-rd-state ${payment?.status === 'paid' ? 'is-green' : ''}`}
                  >
                    {paymentState}
                  </strong>
                  <small>
                    {method}
                    {payment
                      ? ` · S/ ${(payment.amountMinor / 100).toFixed(2)}`
                      : ''}
                  </small>
                </div>
              </div>
              {view?.yapeInstructions && (
                <p className="bx-rd-note">Yape: {view.yapeInstructions}</p>
              )}
            </Panel>
          </div>
          <Panel
            title="Gestión de la cita"
            icon="bolt"
            className="bx-rd-management"
          >
            {parts.operationConfirmation && (
              <CareOperationConfirmation {...parts.operationConfirmation} />
            )}
            {busy && <p role="status">Procesando…</p>}
            {view?.yapeReport && (
              <div className="bx-rd-yape-review">
                <span>
                  Código de seguridad Yape{' '}
                  <strong>{view.yapeReport.securityCode}</strong>
                </span>
                <p>
                  Comprueba el ingreso y el importe en tu Yape antes de
                  registrar el pago recibido.
                </p>
              </div>
            )}
            <div className="bx-rd-feedback" aria-live="polite">
              {feedback}
            </div>
            <div className="bx-rd-operations">
              {[...operations]
                .sort(
                  (a, b) =>
                    [
                      'start',
                      'complete',
                      'receive',
                      'no-show',
                      'refund',
                    ].indexOf(a.command) -
                    [
                      'start',
                      'complete',
                      'receive',
                      'no-show',
                      'refund',
                    ].indexOf(b.command),
                )
                .map((o) => (
                  <Operation
                    key={o.command}
                    operation={o}
                    busy={busy}
                    primary={o === recommended}
                  />
                ))}
            </div>
            <div className="bx-rd-existing">{actions}</div>
            {!view && (
              <p className="bx-rd-note">
                Consulta la atención y el pago para ver las acciones
                disponibles.
              </p>
            )}
            {!!view?.events.length && (
              <details className="bx-rd-events">
                <summary>
                  Actividad de la reserva ({view.events.length})
                </summary>
                {view.events.map((e, i) => (
                  <p key={i}>
                    <strong>
                      {eventLabels[e.kind] ?? 'Actividad registrada'}
                    </strong>{' '}
                    · {stamp(e.occurredAt)}
                    {e.reason ? ` · ${e.reason}` : ''}
                  </p>
                ))}
              </details>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
