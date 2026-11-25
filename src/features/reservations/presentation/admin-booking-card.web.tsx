import { useState, useEffect, useRef } from 'react';
import type { BookingDetail } from '../domain/types';
import type { CareView } from '../domain/care';
import { CareControl } from './care-control';
import { CancellationControl } from './cancellation-control';
import { RescheduleControl } from './reschedule-control';
import { AdminAgendaIcon as Icon, localTime } from './admin-agenda-icons.web';
const money = (amount: number) => `S/ ${(amount / 100).toFixed(2)}`;
export function AdminBookingCardWeb({
  detail: d,
  onCare,
}: {
  detail: BookingDetail;
  onCare: (view: CareView) => void;
}) {
  const [show, setShow] = useState(true);
  const live = useRef(true);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  return (
    <details className="bx-aa-booking">
      <summary
        className="bx-aa-booking-summary"
        aria-label={`Detalles de la cita de ${d.clientDisplayNameSnapshot} a las ${localTime(d.startsAt)}`}
      >
        <span className="bx-aa-shop-icon">
          <Icon name="shop" />
        </span>
        <div>
          <h3>{d.shopNameSnapshot}</h3>
          <span
            className={`bx-aa-badge ${d.state === 'cancelled' ? 'is-cancelled' : ''}`}
          >
            <Icon name={d.state === 'confirmed' ? 'check' : 'cancel'} />
            {d.state === 'confirmed' ? 'Cita confirmada' : 'Cita cancelada'}
          </span>
        </div>
        <time dateTime={d.startsAt}>
          <Icon name="calendar" />
          <span>
            {new Date(d.startsAt).toLocaleDateString('es-PE', {
              timeZone: 'America/Lima',
            })}
            <strong>{localTime(d.startsAt)}</strong>
          </span>
        </time>
        <span className="bx-aa-card-chevron" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </summary>
      <div className="bx-aa-booking-body">
        <div className="bx-aa-booking-main">
          <div>
            <p>
              <Icon name="user" />
              <span>
                Profesional: <strong>{d.barberNameSnapshot}</strong>
              </span>
            </p>
            <p>
              <Icon name="user" />
              <span>
                Cliente: <strong>{d.clientDisplayNameSnapshot}</strong>
              </span>
            </p>
          </div>
          <div>
            {d.items.map((item) => (
              <div className="bx-aa-service" key={item.serviceId}>
                <Icon name="scissors" />
                <div>
                  <strong>
                    {item.nameSnapshot} · {item.durationMin} min ·{' '}
                    {money(item.priceSnapshot.amountMinor)}
                  </strong>
                  {item.descriptionSnapshot && (
                    <p>{item.descriptionSnapshot}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bx-aa-booking-total">
          <Icon name="card" />
          <strong>
            Total confirmado: {money(d.total.amountMinor)} · {d.durationMin}{' '}
            minutos
          </strong>
        </div>
        <p className="bx-aa-booking-meta">
          <Icon name="info" />
          Antelación de cancelación de esta cita:{' '}
          {d.policySnapshot.cancellationAdvanceMin} minutos.
        </p>
        <p className="bx-aa-booking-meta bx-aa-code">
          <Icon name="calendar" />
          <span>Código de cita: {d.id}</span>
        </p>
        <CareControl
          key={d.id}
          reservationId={d.id}
          startsAt={d.startsAt}
          onUpdated={(view) => {
            if (!live.current) return;
            setShow(true);
            onCare(view);
          }}
          renderActions={(view) => (
            <div className="bx-aa-manage">
              {view && (
                <details>
                  <summary>Gestionar esta cita</summary>
                  <div className="bx-aa-manage-body">
                    {(view.attendance === null ||
                      view.attendance === 'confirmed') && (
                      <CancellationControl detail={d} staff />
                    )}
                  </div>
                </details>
              )}
              <RescheduleControl detail={d} staff canChange={false} />
            </div>
          )}
          renderLayout={(parts) => (
            <>
              <div className="bx-aa-care-trigger">
                <Icon name="card" />
                {parts.trigger}
              </div>
              {parts.view && show && (
                <section className="bx-aa-care">
                  <div className="bx-aa-care-heading">
                    <h4>Atención y pago</h4>
                    <button
                      type="button"
                      onClick={() => setShow(false)}
                      disabled={parts.busy}
                    >
                      Cerrar detalle
                    </button>
                  </div>
                  <div className="bx-aa-care-status">
                    <div>
                      <span>Atención</span>
                      <strong>
                        {parts.view.attendance === null
                          ? 'Sin registro'
                          : {
                              confirmed: 'Pendiente',
                              'in-service': 'En atención',
                              completed: 'Completada',
                              cancelled: 'Cancelada',
                              'no-show': 'Inasistencia',
                            }[parts.view.attendance]}
                      </strong>
                    </div>
                    <div>
                      <span>Pago</span>
                      <strong>
                        {parts.view.payment
                          ? `${parts.view.payment.method === 'cash' ? 'Efectivo' : 'Yape'} · ${{ pending: 'Pendiente', paid: 'Recibido', refunded: 'Reembolsado' }[parts.view.payment.status]}`
                          : 'Sin registro financiero'}
                      </strong>
                      {parts.view.payment && (
                        <small>{money(parts.view.payment.amountMinor)}</small>
                      )}
                    </div>
                  </div>
                  {parts.view.yapeReport && (
                    <p>
                      Código de seguridad Yape:{' '}
                      <strong>{parts.view.yapeReport.securityCode}</strong>.
                      Verifica el ingreso en tu Yape antes de confirmar la
                      recepción.
                    </p>
                  )}
                  {parts.view.yapeInstructions && (
                    <p className="bx-aa-booking-meta">
                      Yape: {parts.view.yapeInstructions}
                    </p>
                  )}
                  <div className="bx-aa-care-operations">
                    {parts.operations.map((o) => (
                      <button
                        key={o.command}
                        type="button"
                        disabled={parts.busy}
                        onClick={o.onSelect}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  {parts.view.events.length > 0 && (
                    <details>
                      <summary>
                        Actividad de la reserva ({parts.view.events.length})
                      </summary>
                      {parts.view.events.map((event, i) => (
                        <p key={i}>
                          {{
                            created: 'Reserva creada',
                            started: 'Atención iniciada',
                            completed: 'Atención completada',
                            'in-service': 'Atención en curso',
                            received: 'Pago recibido',
                            refunded: 'Reembolso registrado',
                            cancelled: 'Cita cancelada',
                            'no-show': 'Inasistencia registrada',
                          }[event.kind] ?? 'Actualización de la reserva'}{' '}
                          ·{' '}
                          {new Date(event.occurredAt).toLocaleString('es-PE', {
                            timeZone: 'America/Lima',
                          })}
                          {event.reason ? ` · ${event.reason}` : ''}
                        </p>
                      ))}
                    </details>
                  )}
                </section>
              )}
              <div className="bx-aa-care-feedback">{parts.feedback}</div>
              {parts.actions}
            </>
          )}
        />
      </div>
    </details>
  );
}
