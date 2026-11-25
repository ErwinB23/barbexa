import { useState, type ReactNode } from 'react';
import { Link } from 'expo-router';
import type { BookingOffer } from '../application/booking-offer-gateway';
import { WorkspaceIcon } from '../../../shared/ui/workspace-icon.web';
import { SiteIcon } from '../../../shared/ui/site-icon.web';
import {
  contactLinks,
  mapSearch,
  openingState,
  visibleOffer,
  weeklyHours,
} from './shop-detail-view';
import { shopDetailStyles } from './shop-detail-web.styles';

const money = (v: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(
    v / 100,
  );
function DetailIcon({
  name,
}: {
  name: 'info' | 'clock' | 'star' | 'share' | 'whatsapp';
}) {
  const paths = {
    info: 'M12 11v6m0-10v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    clock: 'M12 6v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    star: 'm12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z',
    share:
      'M8 11l8-5m-8 7 8 5M8 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0m14-8a3 3 0 1 1-6 0 3 3 0 0 1 6 0m0 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    whatsapp:
      'M4 20l1-5a9 9 0 1 1 4 5ZM8 7c0 5 4 9 8 9l1-3-3-1-1 1-3-3 1-1-1-2Z',
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
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
function Card({
  title,
  icon,
  children,
  action,
  id,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <section className="bx-sd-card" id={id}>
      <header>
        <span className="bx-sd-icon">{icon}</span>
        <h2>{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
export function ShopDetailWeb({
  offer,
  phase,
  query,
  now,
  reservationLocked = false,
  onReserve,
  onRetry,
}: {
  offer: BookingOffer | null;
  phase: 'idle' | 'loading' | 'ready' | 'error';
  query: string;
  now: number;
  reservationLocked?: boolean;
  onReserve: (id: string, professionalId?: string) => void;
  onRetry: () => void;
}) {
  const [all, setAll] = useState(false);
  const back = (
    <Link
      className="bx-sd-back"
      href={`/account?view=explore&q=${encodeURIComponent(query)}`}
    >
      <span aria-hidden="true">←</span> Volver a explorar
    </Link>
  );
  if (phase !== 'ready' || !offer)
    return (
      <div className="bx-private-home bx-detail-page">
        <style>{shopDetailStyles}</style>
        {back}
        <section className="bx-sd-state" aria-label="Detalle de barbería">
          {phase === 'error' ? (
            <>
              <WorkspaceIcon name="shop" />
              <h1>No pudimos cargar esta barbería</h1>
              <p>Comprueba tu conexión y vuelve a consultar su información.</p>
              <button type="button" onClick={onRetry}>
                Reintentar
              </button>
            </>
          ) : (
            <>
              <div className="bx-sd-skeleton" aria-hidden="true" />
              <h1 role="status">Consultando la barbería…</h1>
              <p>Estamos preparando sus servicios y horarios.</p>
            </>
          )}
        </section>
      </div>
    );
  const { services, professionals } = visibleOffer(offer),
    status = openingState(offer.shopHours, offer.shopClosures, now),
    contacts = contactLinks(offer.publicContact),
    map = mapSearch(offer.address),
    locked =
      reservationLocked ||
      offer.publicationState !== 'published' ||
      !services.length ||
      !professionals.length;
  const label =
    status === 'open'
      ? 'Abierto ahora'
      : status === 'closed'
        ? 'Cerrado ahora'
        : 'Horario por confirmar';
  const badge = (
    <span className={`bx-sd-status bx-sd-status--${status}`}>
      <span aria-hidden="true" />
      {label}
    </span>
  );
  return (
    <div className="bx-private-home bx-detail-page">
      <style>{shopDetailStyles}</style>
      {back}
      <section className="bx-sd-banner" aria-label="Detalle de barbería">
        <div className="bx-sd-mark" aria-label={`Barbería ${offer.name}`}>
          <SiteIcon name="scissors" />
          <span>{offer.name}</span>
        </div>
        <div className="bx-sd-banner-copy">
          <h1>{offer.name}</h1>
          <p>
            <WorkspaceIcon name="pin" />
            {offer.address || 'Dirección no registrada'}
          </p>
          {badge}
        </div>
        <button
          className="bx-sd-primary"
          type="button"
          disabled={locked}
          onClick={() => onReserve(offer.barbershopId)}
        >
          <SiteIcon name="calendar" />
          Reservar en esta barbería
        </button>
        <small className="bx-sd-illustrative">Imagen ilustrativa</small>
      </section>
      {(reservationLocked || offer.publicationState === 'paused') && (
        <p className="bx-sd-notice" role="status">
          {reservationLocked
            ? 'Finaliza o revisa tu reserva actual antes de iniciar otra.'
            : 'Las reservas de esta barbería están pausadas por el momento.'}
        </p>
      )}
      <div className="bx-sd-layout">
        <div className="bx-sd-main">
          <Card title="Sobre la barbería" icon={<DetailIcon name="info" />}>
            <p className="bx-sd-empty">
              Descripción no registrada. Puedes conocer sus servicios,
              profesionales y horarios a continuación.
            </p>
          </Card>
          <Card
            title="Servicios"
            icon={<SiteIcon name="scissors" />}
            id="shop-all-services"
            action={
              services.length > 3 ? (
                <button
                  className="bx-sd-text-action"
                  type="button"
                  aria-expanded={all}
                  aria-controls="shop-services-grid"
                  onClick={() => setAll(!all)}
                >
                  {all ? 'Ver menos' : 'Ver todos los servicios'}
                  <WorkspaceIcon name="arrow" />
                </button>
              ) : undefined
            }
          >
            {services.length ? (
              <div className="bx-sd-services" id="shop-services-grid">
                {services.slice(0, all ? services.length : 3).map((s) => (
                  <article className="bx-sd-service" key={s.id}>
                    <div>
                      <span className="bx-sd-icon">
                        <SiteIcon name="scissors" />
                      </span>
                      <div>
                        <h3>{s.name}</h3>
                        <p>{s.description || 'Sin descripción registrada.'}</p>
                      </div>
                    </div>
                    <footer>
                      <span>
                        <DetailIcon name="clock" />
                        {s.durationMin} min
                      </span>
                      <strong>{money(s.price.amountMinor)}</strong>
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <p className="bx-sd-empty">
                No hay servicios disponibles por el momento.
              </p>
            )}
          </Card>
          <Card
            title="Barberos disponibles"
            icon={<WorkspaceIcon name="user" />}
          >
            {professionals.length ? (
              <div className="bx-sd-professionals">
                {professionals.map((p) => (
                  <article className="bx-sd-professional" key={p.id}>
                    <span className="bx-sd-avatar">
                      <WorkspaceIcon name="user" />
                    </span>
                    <div>
                      <h3>{p.professionalName}</h3>
                      {p.description && <p>{p.description}</p>}
                      <p className="bx-sd-specialties">
                        {services
                          .filter((s) =>
                            offer.capabilities.some(
                              (c) =>
                                c.barberId === p.id && c.serviceId === s.id,
                            ),
                          )
                          .map((s) => s.name)
                          .join(' · ')}
                      </p>
                      <button
                        type="button"
                        className="bx-sd-primary"
                        disabled={locked}
                        onClick={() => onReserve(offer.barbershopId, p.id)}
                        aria-label={`Reservar con ${p.professionalName}`}
                      >
                        Reservar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="bx-sd-empty">
                No hay profesionales habilitados para reservar por el momento.
              </p>
            )}
          </Card>
          <Card title="Reseñas de clientes" icon={<DetailIcon name="star" />}>
            <div className="bx-sd-reviews-empty">
              <span className="bx-sd-review-star">
                <DetailIcon name="star" />
              </span>
              <div>
                <h3>Todavía no hay reseñas</h3>
                <p>
                  Cuando haya opiniones disponibles de esta barbería, aparecerán
                  aquí.
                </p>
              </div>
            </div>
          </Card>
        </div>
        <aside
          className="bx-sd-sidebar"
          aria-label="Información de la barbería"
        >
          <Card
            title="Horarios de atención"
            icon={<SiteIcon name="calendar" />}
            action={badge}
          >
            <p className="bx-sd-timezone">Hora de Lima · Atención del local</p>
            {!offer.shopHours && (
              <p className="bx-sd-empty">
                Los horarios todavía no están disponibles para consultar.
              </p>
            )}
            <dl className="bx-sd-hours">
              {weeklyHours(offer.shopHours).map((day) => (
                <div key={day.day}>
                  <dt>{day.label}</dt>
                  <dd>
                    {day.intervals === null
                      ? 'Por confirmar'
                      : day.intervals.length
                        ? day.intervals.map((v) => <span key={v}>{v}</span>)
                        : 'Cerrado'}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card title="Ubicación" icon={<WorkspaceIcon name="pin" />}>
            <p className="bx-sd-address">
              {offer.address || 'Dirección no registrada.'}
            </p>
            <div className="bx-sd-location">
              <WorkspaceIcon name="pin" />
              <span>Dirección de la barbería</span>
            </div>
            {map && (
              <>
                <a
                  className="bx-sd-outline"
                  href={map}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver en el mapa
                  <WorkspaceIcon name="arrow" />
                </a>
                <p className="bx-sd-caption">
                  Se buscará la dirección indicada. La ubicación exacta no está
                  registrada.
                </p>
              </>
            )}
          </Card>
          <Card title="Contacto" icon={<SiteIcon name="phone" />}>
            {offer.publicContact ? (
              <p className="bx-sd-contact-number">{offer.publicContact}</p>
            ) : (
              <p className="bx-sd-empty">Contacto no registrado.</p>
            )}
            {contacts && (
              <div className="bx-sd-contact-actions">
                <a href={contacts.call}>
                  <SiteIcon name="phone" />
                  Llamar
                </a>
                <a
                  href={contacts.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DetailIcon name="whatsapp" />
                  Escribir por WhatsApp
                </a>
              </div>
            )}
          </Card>
          <Card title="Redes sociales" icon={<DetailIcon name="share" />}>
            <p className="bx-sd-empty">Redes sociales no registradas.</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
