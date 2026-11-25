import { Link } from 'expo-router';
import { ShopDetailWeb } from './shop-detail.web';
import type { ReactNode } from 'react';
import type { PrivateHomeView } from '../application/private-home';
import { nextAppointment } from '../application/private-home';
import { WorkspaceIcon } from '../../../shared/ui/workspace-icon.web';

export type PrivateHomeSection = 'home' | 'explore' | 'shop' | 'notices';
const illustration = '/images/login-barbershop-1920x1080.generated.jpg';
const dateTime = (value: string) =>
  new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Lima',
  }).format(new Date(value));
export function PrivateHomeContent({
  name,
  state,
  view,
  query,
  now,
  onQuery,
  onSearch,
  onMore,
  onRetryOwn,
  onRetryShop = onSearch,
  onOpenShop,
  onReserve,
  reservationLocked = false,
  systemNotices,
}: {
  name: string;
  state: PrivateHomeView;
  view: PrivateHomeSection;
  query: string;
  now: number;
  onQuery: (value: string) => void;
  onSearch: () => void;
  onMore: () => void;
  onRetryOwn: () => void;
  onOpenShop: (id: string) => void;
  onReserve: (id: string, professionalId?: string) => void;
  onRetryShop?: () => void;
  reservationLocked?: boolean;
  systemNotices?: ReactNode;
}) {
  if (view === 'shop')
    return (
      <ShopDetailWeb
        key={state.offer?.barbershopId ?? 'pending'}
        offer={state.offer}
        phase={state.offerPhase}
        query={state.query}
        now={now}
        onReserve={onReserve}
        onRetry={onRetryShop}
        reservationLocked={reservationLocked}
      />
    );
  const next = nextAppointment(state.own, now);
  return (
    <div className="bx-private-home">
      <header className="bx-private-hero">
        <div className="bx-hero-copy">
          <p className="bx-private-eyebrow">
            BARBEXA <span />
          </p>
          <h1>
            {view === 'home'
              ? `Hola, ${name}`
              : view === 'explore'
                ? 'Explora tu próximo estilo'
                : 'Tus notificaciones'}
          </h1>
          <p className="bx-private-intro">
            Organiza tus citas, descubre barberías y vive una experiencia de
            cuidado personal a tu medida.
          </p>
          <form
            className="bx-private-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              onSearch();
            }}
          >
            <WorkspaceIcon name="search" />
            <input
              aria-label="Buscar barberías por nombre"
              type="search"
              maxLength={200}
              placeholder="Buscar barberías por nombre…"
              value={query}
              onChange={(event) => onQuery(event.target.value)}
            />
            <button type="submit" aria-label="Buscar barberías">
              <WorkspaceIcon name="arrow" />
            </button>
          </form>
        </div>
      </header>
      <div
        className={`bx-home-feed${view === 'home' ? ' bx-home-feed--home' : ''}`}
      >
        {view === 'notices' ? (
          <section className="bx-home-empty">
            <WorkspaceIcon name="bell" />
            <h2>Notificaciones</h2>
            <Link href="/account?view=notices">
              Ver todas las notificaciones
            </Link>
          </section>
        ) : (
          <>
            <section aria-labelledby="bx-shops-title">
              <div className="bx-section-heading">
                <div>
                  <h2 id="bx-shops-title">
                    {view === 'explore'
                      ? 'Explorar barberías'
                      : 'Barberías recomendadas'}
                  </h2>
                  <p>
                    {state.query
                      ? `Resultados para «${state.query}»`
                      : 'Barberías disponibles para tu próxima visita.'}
                  </p>
                </div>
                {view === 'home' && (
                  <Link className="bx-text-link" href="/account?view=explore">
                    Ver todas <WorkspaceIcon name="chevron" />
                  </Link>
                )}
              </div>
              {state.shopsPhase === 'loading' && (
                <p role="status">Consultando barberías…</p>
              )}
              {state.shopsPhase === 'error' && (
                <div role="alert" className="bx-inline-note">
                  <p>No pudimos cargar las barberías.</p>
                  <button type="button" onClick={onSearch}>
                    Reintentar barberías
                  </button>
                </div>
              )}
              {state.shopsPhase === 'ready' && !state.shops.length && (
                <div className="bx-home-empty bx-catalog-empty">
                  <WorkspaceIcon name="shop" />
                  <h3>
                    No hay barberías
                    {state.query ? ' con ese nombre' : ' disponibles todavía'}
                  </h3>
                  <p>
                    {state.query
                      ? 'Prueba con otro nombre en el buscador.'
                      : 'Cuando se publiquen, podrás conocer sus servicios y reservar aquí.'}
                  </p>
                </div>
              )}
              <div className="bx-shop-grid">
                {(view === 'home' ? state.shops.slice(0, 3) : state.shops).map(
                  (shop) => (
                    <article className="bx-shop-card" key={shop.barbershopId}>
                      <div className="bx-shop-picture">
                        <img src={illustration} alt="" loading="lazy" />
                        <span>Imagen ilustrativa</span>
                      </div>
                      <div className="bx-shop-info">
                        <div>
                          <h3>{shop.name}</h3>
                          <p>
                            <WorkspaceIcon name="pin" />
                            {shop.address || 'Dirección no indicada'}
                          </p>
                          <span className="bx-shop-status">
                            {shop.publicationState === 'paused'
                              ? 'Reservas pausadas'
                              : 'Consulta servicios y horarios'}
                          </span>
                        </div>
                        <button
                          className="bx-card-button"
                          type="button"
                          onClick={() => onOpenShop(shop.barbershopId)}
                          aria-label={`Ver barbería ${shop.name}`}
                        >
                          Ver barbería <WorkspaceIcon name="chevron" />
                        </button>
                      </div>
                    </article>
                  ),
                )}
              </div>
              {view === 'explore' && state.hasMore && (
                <button
                  type="button"
                  className="bx-gold-button bx-more-shops"
                  disabled={state.shopsPhase === 'loading'}
                  onClick={onMore}
                >
                  Ver más barberías
                </button>
              )}
            </section>
            {view === 'home' && (
              <section
                className="bx-movements"
                aria-labelledby="bx-movements-title"
              >
                <div className="bx-section-heading">
                  <div>
                    <h2 id="bx-movements-title">Tus movimientos</h2>
                    <p>Tu próxima cita y los accesos que necesitas.</p>
                  </div>
                </div>
                <div className="bx-movement-grid">
                  <article className="bx-movement bx-next-appointment">
                    <h3>
                      <WorkspaceIcon name="calendar" />
                      Próxima reserva
                      {state.ownPhase === 'ready' && next && (
                        <span className="bx-confirmed">Confirmada</span>
                      )}
                    </h3>
                    {state.ownPhase === 'loading' && (
                      <p role="status">Consultando tu próxima reserva…</p>
                    )}
                    {state.ownPhase === 'error' && (
                      <div role="alert">
                        <p>No pudimos consultar tus reservas.</p>
                        <button type="button" onClick={onRetryOwn}>
                          Reintentar reservas
                        </button>
                      </div>
                    )}
                    {state.ownPhase === 'ready' &&
                      (next ? (
                        <Link href="/my-reservations" className="bx-next-link">
                          <span className="bx-appointment-mark">
                            <WorkspaceIcon name="shop" />
                          </span>
                          <span>
                            <strong>{next.shopNameSnapshot}</strong>
                            <span>
                              {next.items.map((s) => s.nameSnapshot).join(', ')}
                            </span>
                            <span>
                              <WorkspaceIcon name="calendar" />
                              {dateTime(next.startsAt)} · Perú
                            </span>
                          </span>
                          <WorkspaceIcon name="chevron" />
                        </Link>
                      ) : (
                        <div className="bx-movement-empty">
                          <p>Todavía no tienes una próxima reserva.</p>
                          <Link href="/booking">
                            Encuentra tu próximo corte
                          </Link>
                        </div>
                      ))}
                  </article>
                  <article className="bx-movement">
                    <h3>
                      <WorkspaceIcon name="bolt" />
                      Accesos rápidos
                    </h3>
                    <div className="bx-quick-links">
                      <Link href="/booking">
                        <WorkspaceIcon name="calendar" />
                        Reservar una cita
                        <WorkspaceIcon name="chevron" />
                      </Link>
                      <Link href="/account?view=explore">
                        <WorkspaceIcon name="search" />
                        Explorar barberías
                        <WorkspaceIcon name="chevron" />
                      </Link>
                      <Link href="/my-reservations">
                        <WorkspaceIcon name="reservations" />
                        Mis reservas
                        <WorkspaceIcon name="chevron" />
                      </Link>
                    </div>
                  </article>
                  <article className="bx-movement">
                    <h3>
                      <WorkspaceIcon name="bell" />
                      Avisos del sistema
                    </h3>
                    {systemNotices ?? (
                      <Link href="/account?view=notices">
                        Ver todas las notificaciones
                      </Link>
                    )}
                  </article>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
