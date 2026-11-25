import type { ReactNode } from 'react';
import type {
  BookingApplication,
  BookingView,
} from '../application/booking-application';
import { AppButton } from '../../../shared/ui/app-button';
import { StatusMessage } from '../../../shared/ui/status-message';
import { WorkspaceIcon } from '../../../shared/ui/workspace-icon.web';
import { PaymentChoice } from './payment-choice';
import { BookingCalendar } from './booking-calendar.web';
import { bookingError, bookingTime } from './booking-format';
import { bookingWebStyles } from './booking-content.web.styles';
const money = (amount: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(
    amount / 100,
  );
function Scissors() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="5" cy="6" r="3" />
      <circle cx="19" cy="6" r="3" />
      <path d="m7 8 13 14M17 8 4 22" />
    </svg>
  );
}
function Step({
  number,
  title,
  subtitle,
  children,
}: {
  number: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="bx-book-card">
      <header className="bx-book-step">
        <span>{number}</span>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}
export function BookingContentWeb({
  state: s,
  application: app,
  careEnabled,
  onOwn,
  confirmed,
}: {
  state: BookingView;
  application: BookingApplication;
  careEnabled: boolean;
  onOwn: () => void;
  confirmed?: ReactNode;
}) {
  const busy = [
      'loading-shops',
      'loading-offer',
      'loading-slots',
      'confirming',
    ].includes(s.phase),
    locked = busy || s.uncertain || !!s.result;
  const offer = s.offer,
    selected = offer?.services.filter((v) => s.serviceIds.includes(v.id)) ?? [];
  const total = selected.reduce((a, v) => a + v.price.amountMinor, 0),
    duration = selected.reduce((a, v) => a + v.durationMin, 0);
  const professional = s.barberId
    ? (offer?.professionals.find((v) => v.id === s.barberId)
        ?.professionalName ?? 'Sin seleccionar')
    : 'Cualquier profesional disponible';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(s.date)
    ? new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'long',
        timeZone: 'UTC',
      }).format(new Date(`${s.date}T12:00:00Z`))
    : 'Sin seleccionar';
  if (s.result && confirmed) return <>{confirmed}</>;
  return (
    <div className="bx-book">
      <style>{bookingWebStyles}</style>
      <div className="bx-book-brand" aria-hidden="true">
        <span />
        <div>
          <Scissors />
          <b>BARBEXA</b>
        </div>
        <span />
      </div>
      <header className="bx-book-header">
        <div>
          <h1>Reservar una cita</h1>
          <p>Elige tus servicios y encuentra el horario que mejor te viene.</p>
        </div>
        <AppButton label="Mis reservas" variant="secondary" onPress={onOwn} />
      </header>
      {busy && (
        <StatusMessage
          state="loading"
          message={
            s.phase === 'confirming'
              ? 'Confirmando tu cita…'
              : 'Consultando disponibilidad…'
          }
        />
      )}
      {s.error && (
        <StatusMessage
          state="error"
          message={bookingError(s.error.code, s.error.professionalUnavailable)}
          onRetry={() =>
            void (s.uncertain
              ? app.confirm()
              : offer
                ? app.querySlots()
                : app.loadShops())
          }
          retryLabel={
            s.uncertain
              ? 'Reintentar la misma solicitud'
              : 'Reintentar consulta'
          }
        />
      )}
      {s.uncertain && (
        <p role="status">
          No sabemos aún si se confirmó la cita. El reintento conserva la misma
          solicitud y no crea una segunda reserva. Si recargas o cierras sesión,
          consulta Mis reservas antes de reservar otra vez.
        </p>
      )}
      {s.result ? (
        confirmed
      ) : (
        <div className="bx-book-layout">
          <main className="bx-book-steps">
            <Step number={1} title="Barbería seleccionada">
              {offer && (
                <div className="bx-book-shop">
                  <WorkspaceIcon name="shop" />
                  <div>
                    <h3>{offer.name}</h3>
                    <div className="bx-book-contact">
                      {offer.address && (
                        <span>
                          <WorkspaceIcon name="pin" />
                          {offer.address}
                        </span>
                      )}
                      {offer.publicContact && (
                        <span>{offer.publicContact}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="bx-book-shops">
                {s.shops.map((shop) => (
                  <button
                    type="button"
                    key={shop.barbershopId}
                    aria-pressed={offer?.barbershopId === shop.barbershopId}
                    disabled={locked}
                    onClick={() => void app.chooseShop(shop.barbershopId)}
                  >
                    {shop.name}
                    {shop.publicationState === 'paused' && ' · Pausada'}
                  </button>
                ))}
              </div>
              {s.shopsQueried &&
                !s.shops.length &&
                s.phase !== 'loading-shops' && (
                  <StatusMessage
                    state="empty"
                    message="No hay barberías publicadas para reservar."
                  />
                )}
              {(s.hasMore || !offer) && (
                <div className="bx-book-shop-actions">
                  {s.hasMore && (
                    <AppButton
                      label="Ver más barberías"
                      variant="ghost"
                      disabled={locked}
                      onPress={() =>
                        void app.loadShops(s.shops.at(-1)?.barbershopId ?? null)
                      }
                    />
                  )}
                  {!offer && (
                    <AppButton
                      label="Actualizar barberías disponibles"
                      variant="secondary"
                      disabled={locked}
                      onPress={() => void app.loadShops()}
                    />
                  )}
                </div>
              )}
            </Step>
            {offer && (
              <>
                {offer.publicationState === 'paused' && (
                  <StatusMessage
                    state="empty"
                    message="Esta barbería está pausada y no acepta citas nuevas."
                  />
                )}
                <Step
                  number={2}
                  title="Servicios"
                  subtitle="Elige uno o varios servicios para tu cita."
                >
                  <div className="bx-book-services">
                    {offer.services
                      .filter((v) => v.active)
                      .map((service) => (
                        <button
                          type="button"
                          className="bx-book-service"
                          key={service.id}
                          disabled={locked}
                          aria-pressed={s.serviceIds.includes(service.id)}
                          onClick={() => {
                            app.setServices(
                              s.serviceIds.includes(service.id)
                                ? s.serviceIds.filter((id) => id !== service.id)
                                : [...s.serviceIds, service.id],
                            );
                          }}
                        >
                          <Scissors />
                          <span>
                            <strong>{service.name}</strong>
                            <small>
                              {money(service.price.amountMinor)} ·{' '}
                              {service.durationMin} min
                            </small>
                          </span>
                          {s.serviceIds.includes(service.id) && (
                            <span className="bx-book-check" aria-hidden="true">
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                  {!offer.services.some((v) => v.active) && (
                    <StatusMessage
                      state="empty"
                      message="No hay servicios activos disponibles."
                    />
                  )}
                </Step>
                <Step
                  number={3}
                  title="Profesional y horario"
                  subtitle="Elige un profesional, la fecha y el horario disponible."
                >
                  <div
                    className="bx-book-professionals"
                    role="group"
                    aria-label="Profesional"
                  >
                    <button
                      type="button"
                      disabled={locked}
                      aria-pressed={!s.barberId}
                      onClick={() => app.setProfessional(null)}
                    >
                      <WorkspaceIcon name="user" />
                      Cualquier profesional disponible
                    </button>
                    {offer.professionals
                      .filter(
                        (p) =>
                          p.active &&
                          s.serviceIds.every((id) =>
                            offer.capabilities.some(
                              (c) => c.barberId === p.id && c.serviceId === id,
                            ),
                          ),
                      )
                      .map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          disabled={locked}
                          aria-pressed={s.barberId === p.id}
                          onClick={() => app.setProfessional(p.id)}
                        >
                          <WorkspaceIcon name="user" />
                          {p.professionalName}
                        </button>
                      ))}
                  </div>
                  <div className="bx-book-dates">
                    <div>
                      <h3>
                        <WorkspaceIcon name="calendar" />
                        Fecha
                      </h3>
                      <BookingCalendar
                        key={offer.barbershopId}
                        value={s.date}
                        horizon={offer.policies?.bookingHorizonDays ?? 0}
                        disabled={locked}
                        onChange={(date) => {
                          if (locked) return;
                          app.setDate(date);
                          if (
                            selected.length &&
                            offer.publicationState === 'published'
                          )
                            void app.querySlots();
                        }}
                      />
                    </div>
                    <div>
                      <h3>
                        <WorkspaceIcon name="calendar" />
                        Horarios disponibles
                      </h3>
                      <p className="bx-book-note">
                        Todos los horarios corresponden a Lima.
                      </p>
                      <AppButton
                        label="Consultar horarios"
                        disabled={
                          locked ||
                          !selected.length ||
                          !s.date ||
                          offer.publicationState !== 'published'
                        }
                        onPress={() => void app.querySlots()}
                      />
                      {s.phase === 'loading-slots' && (
                        <StatusMessage
                          state="loading"
                          message="Buscando horarios disponibles…"
                        />
                      )}
                      {!s.slotsQueried && (
                        <p className="bx-book-placeholder">
                          {!selected.length
                            ? 'Selecciona al menos un servicio para consultar los horarios.'
                            : s.date
                              ? 'Pulsa «Consultar horarios» para ver las opciones disponibles.'
                              : 'Selecciona una fecha para ver los horarios disponibles.'}
                        </p>
                      )}
                      {s.slotsQueried &&
                        !s.slots.length &&
                        s.phase !== 'loading-slots' && (
                          <StatusMessage
                            state="empty"
                            message="No hay horarios disponibles para esta selección. Prueba otra fecha o profesional."
                          />
                        )}
                      {(['Mañana', 'Tarde'] as const).map((period) => {
                        const slots = s.slots
                          .filter(
                            (slot) =>
                              Number(bookingTime(slot.startsAt).slice(0, 2)) <
                                12 ===
                              (period === 'Mañana'),
                          )
                          .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
                        if (!slots.length) return null;
                        return (
                          <section
                            className="bx-book-period"
                            aria-label={period}
                            key={period}
                          >
                            <h4>
                              {period}
                              <small>
                                {period === 'Mañana'
                                  ? 'Antes de las 12:00'
                                  : 'Desde las 12:00'}
                              </small>
                            </h4>
                            <div className="bx-book-slots">
                              {slots.map((slot) => (
                                <button
                                  type="button"
                                  key={slot.startsAt}
                                  aria-pressed={s.startsAt === slot.startsAt}
                                  aria-label={`${bookingTime(slot.startsAt)}–${bookingTime(slot.endsAt)} · hora Lima`}
                                  disabled={locked}
                                  onClick={() => app.chooseSlot(slot.startsAt)}
                                >
                                  {bookingTime(slot.startsAt)}
                                </button>
                              ))}
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  </div>
                </Step>
              </>
            )}
          </main>
          <aside className="bx-book-sidebar">
            <section className="bx-book-summary">
              <h2>
                <WorkspaceIcon name="calendar" />
                Resumen de la cita
              </h2>
              <div className="bx-book-summary-body">
                <dl>
                  <div>
                    <dt>Barbería</dt>
                    <dd>
                      {offer?.name ?? 'Sin seleccionar'}
                      <small>
                        {[offer?.address, offer?.publicContact]
                          .filter(Boolean)
                          .join(' · ')}
                      </small>
                    </dd>
                  </div>
                  <div>
                    <dt>Servicios</dt>
                    <dd>
                      {selected.map((v) => v.name).join(' + ') ||
                        'Sin seleccionar'}
                    </dd>
                  </div>
                  <div>
                    <dt>Fecha</dt>
                    <dd>{date}</dd>
                  </div>
                  <div>
                    <dt>Profesional</dt>
                    <dd>{offer ? professional : 'Sin seleccionar'}</dd>
                  </div>
                  <div>
                    <dt>Horario · Lima</dt>
                    <dd>
                      {s.startsAt ? bookingTime(s.startsAt) : 'Sin seleccionar'}
                    </dd>
                  </div>
                  <div>
                    <dt>Duración</dt>
                    <dd>{duration} min</dd>
                  </div>
                </dl>
                <div className="bx-book-total">
                  <strong>Precio total</strong>
                  <b>{money(total)}</b>
                </div>
                {!!s.startsAt && (
                  <div className="bx-book-payment">
                    <h3>Revisa tu cita</h3>
                    {careEnabled && offer && (
                      <PaymentChoice
                        key={offer.barbershopId}
                        barbershopId={offer.barbershopId}
                        selected={s.paymentMethod}
                        disabled={locked}
                        onSelect={(method) => app.choosePayment(method)}
                      />
                    )}
                    <p className="bx-book-note">
                      Las condiciones vigentes se revisan al confirmar.
                    </p>
                    <AppButton
                      label={
                        s.uncertain
                          ? 'Reintentar la misma confirmación'
                          : 'Confirmar reserva'
                      }
                      disabled={
                        busy ||
                        (careEnabled && !s.uncertain && !s.paymentMethod)
                      }
                      onPress={() => {
                        if (!careEnabled || s.uncertain || s.paymentMethod)
                          void app.confirm();
                      }}
                    />
                  </div>
                )}
              </div>
            </section>
            <section className="bx-book-card bx-book-help">
              <h2>¿Cómo reservar?</h2>
              <ul>
                {[
                  'Selecciona la barbería y los servicios que deseas.',
                  'Elige un profesional, la fecha y un horario disponible.',
                  'Selecciona el medio de pago y confirma tu cita.',
                ].map((text) => (
                  <li key={text}>
                    <span aria-hidden="true">✓</span>
                    {text}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
