import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
  BookingView,
  BookingApplication,
} from '../application/booking-application';
import type { BookingDetail } from '../domain/types';
import { careView, type CareView } from '../domain/care';
import { StatusMessage } from '../../../shared/ui/status-message';
import { WorkspaceIcon } from '../../../shared/ui/workspace-icon.web';
import { CareControl } from './care-control';
import { ClientYapePayment } from './client-yape-payment.web';
import { CancellationControl } from './cancellation-control';
import { RescheduleControl } from './reschedule-control';
import { ClientRescheduleForm } from './client-reschedule-form.web';
import { bookingError, bookingTime } from './booking-format';
import { ownReservationsView } from './own-reservations-view';
import { myReservationsStyles } from './my-reservations.web.styles';
type OwnApplication = BookingApplication & {
  readonly care?: (input: unknown) => Promise<unknown>;
};
const date = (value: string) =>
  new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'long',
    timeZone: 'America/Lima',
  }).format(new Date(value));
const money = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(
    value / 100,
  );
function Badge({ detail, care }: { detail: BookingDetail; care?: CareView }) {
  const status =
    detail.state === 'cancelled'
      ? 'cancelled'
      : care?.attendance === 'completed'
        ? 'completed'
        : care?.attendance === 'no-show'
          ? 'no-show'
          : care?.attendance === 'in-service'
            ? 'in-service'
            : 'confirmed';
  const labels = {
    confirmed: 'Cita confirmada',
    completed: 'Cita atendida',
    'no-show': 'No asistió',
    'in-service': 'En atención',
    cancelled: 'Cita cancelada',
  };
  return (
    <span className={`bx-own-badge bx-own-badge--${status}`}>
      {labels[status]}
    </span>
  );
}
function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="bx-own-heading">
      <span>
        <WorkspaceIcon name="calendar" />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </header>
  );
}
function AppointmentControls({
  detail,
  verified,
  detailHost,
  onOpen,
}: {
  detail: BookingDetail;
  verified?: CareView;
  detailHost: HTMLDivElement | null;
  onOpen: () => void;
}) {
  const [showCare, setShowCare] = useState(false);
  useEffect(() => {
    if (showCare && detailHost) detailHost.scrollIntoView({ block: 'nearest' });
  }, [showCare, detailHost]);
  const allowed = (v: CareView | null) =>
    detail.state === 'confirmed' &&
    !!v &&
    (v.attendance === null || v.attendance === 'confirmed');
  return (
    <div className="bx-own-controls">
      <CareControl
        key={`${detail.id}:${verified ? 'verified' : 'unknown'}`}
        reservationId={detail.id}
        initialView={verified}
        onReadStart={() => {
          setShowCare(true);
          onOpen();
        }}
        renderPaymentInfo={(view, report) => (
          <ClientYapePayment
            key={detail.id}
            view={view}
            report={report}
            cancelled={detail.state === 'cancelled'}
          />
        )}
        renderLayout={({ trigger, content, actions, busy, view }) => (
          <>
            <div className="bx-own-action-row">
              <div className="bx-own-read-action">{trigger}</div>
              {actions}
            </div>
            {showCare &&
              detailHost &&
              createPortal(
                <section
                  className="bx-own-care-detail"
                  aria-label="Atención y pago de la cita"
                  aria-busy={busy}
                >
                  <header className="bx-own-care-heading">
                    <h3>Atención y pago</h3>
                    <button
                      type="button"
                      aria-label="Cerrar atención y pago"
                      onClick={() => setShowCare(false)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="m7 7 10 10M17 7 7 17" />
                      </svg>
                    </button>
                  </header>
                  {busy && (
                    <p role="status">Consultando el estado de tu cita…</p>
                  )}
                  {view?.payment?.method === 'cash' && (
                    <p className="bx-own-muted">
                      Esta reserva tiene pago en efectivo. Pagarás
                      presencialmente en la barbería.
                    </p>
                  )}
                  {content}
                </section>,
                detailHost,
              )}
          </>
        )}
        renderActions={(view) => {
          const canChange = allowed(view);
          return (
            <>
              <div className="bx-own-reschedule-action">
                <RescheduleControl
                  detail={detail}
                  canChange={canChange}
                  renderContent={ClientRescheduleForm}
                />
              </div>
              {canChange && (
                <div className="bx-own-cancel-action">
                  <CancellationControl detail={detail} />
                </div>
              )}
            </>
          );
        }}
      />
    </div>
  );
}
export function MyReservationsWebContent({
  state,
  application: app,
  onBook,
  care,
  careReady,
  now,
  selectedId,
  onSelect,
}: {
  state: BookingView;
  application: OwnApplication;
  onBook: () => void;
  care: Readonly<Record<string, CareView>>;
  careReady: boolean;
  now: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const projection = ownReservationsView(state.own, care, now);
  const selected =
    projection.sorted.find((r) => r.id === selectedId) ??
    projection.next ??
    projection.sorted[0] ??
    null;
  const [copyState, setCopyState] = useState('');
  const [detailHost, setDetailHost] = useState<HTMLDivElement | null>(null);
  const next = projection.next;
  return (
    <div className="bx-own">
      <style>{myReservationsStyles}</style>
      <header className="bx-own-header">
        <div>
          <h1>Mis reservas</h1>
          <p>Tus citas confirmadas y tu historial, siempre a mano.</p>
        </div>
        <div className="bx-own-top-actions">
          <button
            type="button"
            className="bx-own-top-action bx-own-top-action--primary"
            onClick={onBook}
          >
            <WorkspaceIcon name="calendar" />
            <span>Reservar una cita</span>
          </button>
          <button
            type="button"
            className="bx-own-top-action"
            disabled={state.ownPhase === 'loading'}
            onClick={() => void app.loadOwn()}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M20 7a9 9 0 0 0-15-2L2 8m0-5v5h5m-3 9a9 9 0 0 0 15 2l3-3m0 5v-5h-5" />
            </svg>
            <span>Actualizar mis reservas</span>
          </button>
        </div>
      </header>
      {(state.ownPhase === 'loading' ||
        state.ownError ||
        (state.ownPhase === 'ready' && !state.own.length)) && (
        <div className="bx-own-feedback">
          {state.ownPhase === 'loading' && (
            <StatusMessage
              state="loading"
              message="Consultando tus reservas…"
            />
          )}
          {state.ownError && (
            <StatusMessage
              state="error"
              message={bookingError(state.ownError)}
              onRetry={() => void app.loadOwn()}
            />
          )}
          {state.ownPhase === 'ready' && !state.own.length && (
            <StatusMessage
              state="empty"
              message="Todavía no tienes reservas. Elige Reservar una cita para empezar."
            />
          )}
        </div>
      )}
      <div className="bx-own-layout">
        <div className="bx-own-left">
          <section className="bx-own-section" aria-label="Próxima cita">
            <Heading
              title="Próxima cita"
              subtitle="Tu siguiente reserva confirmada."
            />
            {next ? (
              <article
                className="bx-own-featured"
                tabIndex={0}
                aria-label="Seleccionar próxima cita"
                onClick={() => {
                  setCopyState('');
                  onSelect(next.id);
                }}
                onKeyDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === 'Enter' || event.key === ' ')
                  ) {
                    event.preventDefault();
                    setCopyState('');
                    onSelect(next.id);
                  }
                }}
              >
                <div className="bx-own-featured-head">
                  <h2>{next.shopNameSnapshot}</h2>
                  <Badge detail={next} care={care[next.id]} />
                </div>
                <div className="bx-own-featured-body">
                  <div className="bx-own-date">
                    <WorkspaceIcon name="calendar" />
                    <div>
                      <strong>{date(next.startsAt)}</strong>
                      <small>a las {bookingTime(next.startsAt)}</small>
                    </div>
                  </div>
                  <div className="bx-own-featured-grid">
                    <div>
                      <p>
                        <WorkspaceIcon name="shop" />
                        <strong>{next.shopNameSnapshot}</strong>
                      </p>
                      <p>
                        <WorkspaceIcon name="user" />
                        Profesional: {next.barberNameSnapshot}
                      </p>
                      {next.items.map((i) => (
                        <div className="bx-own-service" key={i.serviceId}>
                          <WorkspaceIcon name="reservations" />
                          <div>
                            Servicio: <strong>{i.nameSnapshot}</strong>
                            {i.descriptionSnapshot && (
                              <small>{i.descriptionSnapshot}</small>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p>
                        Duración<strong>{next.durationMin} minutos</strong>
                      </p>
                      <p>
                        Precio<strong>{money(next.total.amountMinor)}</strong>
                      </p>
                    </div>
                  </div>
                  <AppointmentControls
                    detail={next}
                    onOpen={() => onSelect(next.id)}
                    verified={care[next.id]}
                    detailHost={selected?.id === next.id ? detailHost : null}
                  />
                </div>
              </article>
            ) : (
              state.ownPhase !== 'loading' && (
                <div className="bx-own-empty">
                  No tienes una próxima cita confirmada.
                </div>
              )
            )}
          </section>
          <section className="bx-own-section" aria-label="Historial reciente">
            <Heading
              title="Historial reciente"
              subtitle="Tus últimas reservas y cambios."
            />
            <div className="bx-own-history">
              {projection.sorted
                .filter((r) => r.id !== next?.id)
                .map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    className="bx-own-history-card"
                    aria-pressed={selected?.id === r.id}
                    onClick={() => {
                      setCopyState('');
                      onSelect(r.id);
                    }}
                  >
                    <div className="bx-own-row">
                      <h3>{r.shopNameSnapshot}</h3>
                      <Badge detail={r} care={care[r.id]} />
                    </div>
                    <p>
                      <WorkspaceIcon name="calendar" />
                      {date(r.startsAt)} a las {bookingTime(r.startsAt)}
                    </p>
                    <p>
                      <WorkspaceIcon name="user" />
                      Profesional: {r.barberNameSnapshot}
                    </p>
                    <p>
                      <WorkspaceIcon name="reservations" />
                      Servicio: {r.items.map((i) => i.nameSnapshot).join(' + ')}
                    </p>
                    <div className="bx-own-card-footer">
                      <span>{r.durationMin} minutos</span>
                      <span>{money(r.total.amountMinor)}</span>
                      <WorkspaceIcon name="chevron" />
                    </div>
                  </button>
                ))}
              {!projection.sorted.some((r) => r.id !== next?.id) &&
                state.ownPhase === 'ready' && (
                  <p className="bx-own-empty">
                    No hay otras reservas en tu historial.
                  </p>
                )}
            </div>
            {state.own.length === 50 && (
              <p className="bx-own-muted">
                Se muestran las 50 citas más recientes por fecha. El resumen
                corresponde a este listado.
              </p>
            )}
          </section>
        </div>
        <aside className="bx-own-right">
          <section className="bx-own-panel">
            <Heading title="Resumen" subtitle="Un vistazo a tus reservas." />
            <dl className="bx-own-counts">
              <div>
                <dt>Próximas</dt>
                <dd>{careReady ? projection.upcoming : 'Por consultar'}</dd>
              </div>
              <div>
                <dt>Atendidas</dt>
                <dd>{careReady ? projection.attended : 'Por consultar'}</dd>
              </div>
              <div>
                <dt>Canceladas</dt>
                <dd>{projection.cancelled}</dd>
              </div>
            </dl>
            {!careReady && !!state.own.length && (
              <p className="bx-own-muted">
                La atención se verifica por separado del estado de reserva.
              </p>
            )}
          </section>
          <section className="bx-own-panel">
            <Heading
              title="Detalle de la cita"
              subtitle="Información de tu reserva seleccionada."
            />
            {selected ? (
              <>
                <Badge detail={selected} care={care[selected.id]} />
                <dl className="bx-own-detail">
                  <div>
                    <dt>Fecha</dt>
                    <dd>{date(selected.startsAt)}</dd>
                  </div>
                  <div>
                    <dt>Hora</dt>
                    <dd>{bookingTime(selected.startsAt)}</dd>
                  </div>
                  <div>
                    <dt>Barbería</dt>
                    <dd>{selected.shopNameSnapshot}</dd>
                  </div>
                  <div>
                    <dt>Profesional</dt>
                    <dd>{selected.barberNameSnapshot}</dd>
                  </div>
                  <div>
                    <dt>Servicios</dt>
                    <dd>
                      {selected.items.map((i) => (
                        <p key={i.serviceId}>
                          {i.nameSnapshot}
                          {i.descriptionSnapshot && (
                            <small>{i.descriptionSnapshot}</small>
                          )}
                        </p>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt>Duración y precio</dt>
                    <dd>
                      {selected.durationMin} minutos ·{' '}
                      {money(selected.total.amountMinor)}
                    </dd>
                  </div>
                  <div>
                    <dt>Antelación para cancelar</dt>
                    <dd>
                      {selected.policySnapshot.cancellationAdvanceMin} minutos
                    </dd>
                  </div>
                  <div>
                    <dt>Código de cita</dt>
                    <dd>
                      <code>{selected.id}</code>
                      <button
                        type="button"
                        aria-label="Copiar código de reserva"
                        className="bx-own-copy"
                        onClick={() => {
                          if (!navigator.clipboard?.writeText) {
                            setCopyState(
                              'No se pudo copiar. Puedes seleccionar el código.',
                            );
                            return;
                          }
                          void navigator.clipboard
                            .writeText(selected.id)
                            .then(() => setCopyState('Código copiado.'))
                            .catch(() =>
                              setCopyState(
                                'No se pudo copiar. Puedes seleccionar el código.',
                              ),
                            );
                        }}
                      >
                        Copiar
                      </button>
                      <small role="status">{copyState}</small>
                    </dd>
                  </div>
                </dl>
                <div ref={setDetailHost} className="bx-own-care-host" />
                {selected.id !== next?.id && (
                  <AppointmentControls
                    key={selected.id}
                    detail={selected}
                    onOpen={() => onSelect(selected.id)}
                    verified={care[selected.id]}
                    detailHost={detailHost}
                  />
                )}
              </>
            ) : (
              <p className="bx-own-muted">
                Tus reservas aparecerán aquí cuando estén disponibles.
              </p>
            )}
          </section>
          <section className="bx-own-panel bx-own-help">
            <Heading
              title="¿Necesitas ayuda?"
              subtitle="Gestiona tu reserva de forma sencilla."
            />
            {[
              [
                'Reprogramar cita',
                'Cambia la fecha y hora de tu reserva según disponibilidad.',
              ],
              ['Cancelar cita', 'Anula tu reserva si aún está permitido.'],
              [
                'Consultar atención y pago',
                'Revisa el estado de tu atención y el detalle del pago.',
              ],
            ].map(([title, text]) => (
              <div key={title}>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
}
export function MyReservationsWeb(props: {
  state: BookingView;
  application: OwnApplication;
  onBook: () => void;
}) {
  const { state, application: app } = props;
  const [selectedId, onSelect] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [loaded, setLoaded] = useState<{
    source: readonly BookingDetail[];
    care: Record<string, CareView>;
    ready: boolean;
  } | null>(null);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    let current = true;
    if (state.ownPhase !== 'ready' || !app.care) return;
    const care: Record<string, CareView> = {};
    let index = 0,
      failed = false;
    async function worker() {
      while (current && index < state.own.length) {
        const r = state.own[index++];
        try {
          care[r.id] = careView(
            await app.care!({ command: 'read', reservationId: r.id }),
            r.id,
          );
        } catch {
          failed = true;
        }
      }
    }
    void Promise.all(
      Array.from({ length: Math.min(4, state.own.length) }, worker),
    ).then(() => {
      if (current) setLoaded({ source: state.own, care, ready: !failed });
    });
    return () => {
      current = false;
    };
  }, [app, state.own, state.ownPhase]);
  const valid = loaded?.source === state.own;
  return (
    <MyReservationsWebContent
      {...props}
      now={now}
      selectedId={selectedId}
      onSelect={onSelect}
      care={valid ? loaded.care : {}}
      careReady={!state.own.length || (valid && loaded.ready)}
    />
  );
}
