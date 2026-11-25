import { noticeMessage } from './notice-message';
import { NoticeDeleteConfirmation } from './notice-delete-confirmation.web';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { useInbox } from './inbox-context';
import type { Inbox, Notice } from '../application/inbox';
import { AppButton } from '../../../shared/ui/app-button';
import {
  WorkspaceIcon,
  type WorkspaceIconName,
} from '../../../shared/ui/workspace-icon.web';
import { inboxStyles } from './inbox-screen.web.styles';
type Filter = 'all' | 'unread' | 'reservations' | 'invitations';
function category(n: Notice) {
  // No category in the existing contract; invitation responses can point to /agenda.
  if (/^invitación\b/i.test(n.title) || n.target === '/staff')
    return 'invitations';
  if (
    /^(reserva|atención|inasistencia|pago|reembolso)\b/i.test(n.title) ||
    n.target === '/my-reservations'
  )
    return 'reservations';
  return 'updates';
}
function Scissors() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M7 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0m16 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6 8l14 14M18 8 4 22" />
    </svg>
  );
}
function Pole() {
  return (
    <svg
      className="bx-inbox-pole"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M36 24v-5a14 14 0 0 1 28 0v5M36 76v5a14 14 0 0 0 28 0v-5M36 30h28v40H36ZM31 24h38v6H31ZM31 70h38v6H31ZM37 45l26-15M37 60l26-15M45 70l18-11M12 48h12m52 0h12M20 20l9 7m42 0 9-7M20 79l9-7m42 0 9 7" />
    </svg>
  );
}
const filters: { id: Filter; label: string; icon?: WorkspaceIconName }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'unread', label: 'Sin leer' },
  { id: 'reservations', label: 'Reservas', icon: 'calendar' },
  { id: 'invitations', label: 'Invitaciones', icon: 'user' },
];
export function InboxContent(p: {
  state: ReturnType<Inbox['getSnapshot']>;
  filter: Filter;
  onFilter: (filter: Filter) => void;
  onRefresh: () => void;
  onRead: (id: string) => void;
  errorAction?: 'read' | 'load' | 'delete';
  deleteId?: string | null;
  onDeleteRequest?: (id: string) => void;
  onDeleteCancel?: () => void;
  onDeleteConfirm?: (id: string) => void;
}) {
  const visible = p.state.items.filter(
    (n) =>
      p.filter === 'all' ||
      (p.filter === 'unread' ? !n.readAt : category(n) === p.filter),
  );
  const known = p.state.phase === 'ready' || p.state.items.length > 0;
  return (
    <section className="bx-inbox" aria-label="Tus notificaciones">
      <style>{inboxStyles}</style>
      <div className="bx-inbox-ornament">
        <span />
        <Scissors />
        <span />
      </div>
      <header className="bx-inbox-heading">
        <h1>Notificaciones</h1>
        <p>
          Reservas, invitaciones y actualizaciones de tus citas en un solo
          lugar.
        </p>
      </header>
      <div className="bx-inbox-toolbar">
        <span className="bx-inbox-count">
          <WorkspaceIcon name="bell" />
          {known ? `${p.state.unread} sin leer` : 'Consultando…'}
        </span>
        <div
          className="bx-inbox-filters"
          role="group"
          aria-label="Filtrar notificaciones"
        >
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={p.filter === f.id}
              onClick={() => p.onFilter(f.id)}
            >
              {f.icon && <WorkspaceIcon name={f.icon} />}
              <span>{f.label}</span>
            </button>
          ))}
        </div>
        <div className="bx-inbox-refresh">
          <AppButton
            label={
              p.state.busy && p.errorAction !== 'read'
                ? 'Actualizando…'
                : 'Actualizar notificaciones'
            }
            disabled={p.state.busy}
            onPress={p.onRefresh}
          />
        </div>
      </div>
      <div className="bx-inbox-layout">
        <div className="bx-inbox-main">
          <h2>Tus notificaciones{known ? ` (${visible.length})` : ''}</h2>
          {p.state.phase === 'loading' && (
            <p className="bx-inbox-status" role="status">
              Consultando tus notificaciones…
            </p>
          )}
          {p.state.phase === 'unavailable' && (
            <p className="bx-inbox-status" role="status">
              Las notificaciones no están disponibles en este momento. Puedes
              volver a consultar.
            </p>
          )}
          {p.state.phase === 'error' && !p.state.busy && (
            <div className="bx-inbox-status bx-inbox-error" role="alert">
              <p>
                {p.errorAction === 'delete'
                  ? 'La eliminación no se pudo confirmar. Vuelve a consultar o reintenta en la tarjeta; no hemos ocultado el aviso como si se hubiera borrado.'
                  : p.errorAction === 'read'
                    ? 'No pudimos marcar la notificación como leída. Conservamos su estado; vuelve a intentarlo en la tarjeta.'
                    : 'No pudimos actualizar tus notificaciones. Conservamos los avisos disponibles.'}
              </p>
              <AppButton
                label="Reintentar consulta"
                variant="secondary"
                onPress={p.onRefresh}
              />
            </div>
          )}
          {p.state.phase === 'ready' && !visible.length && (
            <div className="bx-inbox-empty" role="status">
              <WorkspaceIcon name="bell" />
              <h3>
                {p.state.items.length
                  ? 'No hay resultados para este filtro'
                  : 'Todavía no tienes notificaciones'}
              </h3>
              <p>
                {p.state.items.length
                  ? 'Elige otro filtro para consultar tus avisos.'
                  : 'Las novedades de tus reservas e invitaciones aparecerán aquí automáticamente.'}
              </p>
            </div>
          )}
          <ul className="bx-inbox-list">
            {visible.map((n) => {
              const type = category(n),
                icon =
                  type === 'invitations'
                    ? 'user'
                    : type === 'reservations'
                      ? 'calendar'
                      : 'bell';
              return (
                <li
                  key={n.id}
                  className={`bx-inbox-card${!n.readAt ? ' bx-inbox-card--unread' : ' bx-inbox-card--read'}`}
                >
                  <details
                    className="bx-inbox-disclosure"
                    onToggle={(event) => {
                      if (event.currentTarget.open && !n.readAt) p.onRead(n.id);
                    }}
                  >
                    <summary className="bx-inbox-summary">
                      <span className="bx-inbox-icon">
                        <WorkspaceIcon name={icon} />
                      </span>
                      <div className="bx-inbox-card-body">
                        <div className="bx-inbox-card-heading">
                          <h3>{n.title}</h3>
                          {!n.readAt && (
                            <span className="bx-inbox-unread">Sin leer</span>
                          )}
                          <time dateTime={n.createdAt}>
                            {new Intl.DateTimeFormat('es-PE', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                              timeZone: 'America/Lima',
                            }).format(new Date(n.createdAt))}
                          </time>
                        </div>
                        <p className="bx-inbox-preview">
                          {noticeMessage(n.message)}
                        </p>
                      </div>
                      <span className="bx-inbox-expand" aria-hidden="true">
                        <WorkspaceIcon name="chevron" />
                      </span>
                    </summary>
                    <div className="bx-inbox-expanded">
                      <Pole />
                      <div className="bx-inbox-meta">
                        {(() => {
                          // Only extract the exact appointment format already supplied
                          // by the server. Other messages remain verbatim below.
                          const match =
                            /^(.*) · (\d{2}\/\d{2}\/\d{4}) (\d{2}:\d{2}) · hora de Lima$/.exec(
                              n.message,
                            );
                          return match ? (
                            <dl>
                              <div>
                                <dt>
                                  <WorkspaceIcon name="shop" />
                                  Barbería
                                </dt>
                                <dd>{match[1]}</dd>
                              </div>
                              <div>
                                <dt>
                                  <WorkspaceIcon name="calendar" />
                                  Fecha de la cita
                                </dt>
                                <dd>{match[2]}</dd>
                              </div>
                              <div>
                                <dt>
                                  <WorkspaceIcon name="calendar" />
                                  Hora
                                </dt>
                                <dd>{match[3]}</dd>
                              </div>
                            </dl>
                          ) : null;
                        })()}
                      </div>
                      <div className="bx-inbox-event-detail">
                        <h4>Detalle de la notificación</h4>
                        <p className="bx-inbox-description">
                          {noticeMessage(n.message)}
                        </p>
                      </div>
                      <div className="bx-inbox-actions">
                        {p.onDeleteRequest && (
                          <button
                            type="button"
                            className="bx-inbox-delete"
                            aria-label={`Eliminar notificación: ${n.title}`}
                            title={
                              p.state.canRemove
                                ? 'Eliminar esta notificación'
                                : 'El borrado necesita activarse en el servidor'
                            }
                            disabled={p.state.busy || !p.state.canRemove}
                            onClick={() => p.onDeleteRequest?.(n.id)}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
                            </svg>
                          </button>
                        )}
                        {['/staff', '/my-reservations', '/agenda'].includes(
                          n.target,
                        ) && (
                          <Link
                            href={
                              n.title === 'Invitación aceptada' &&
                              n.target === '/agenda'
                                ? '/staff?view=team'
                                : n.target === '/agenda'
                                  ? '/staff?view=professional&section=agenda'
                                  : n.target
                            }
                            className="bx-inbox-detail"
                          >
                            {n.title === 'Invitación aceptada' &&
                            n.target === '/agenda'
                              ? 'Ver equipo'
                              : n.target === '/staff'
                                ? 'Abrir invitaciones'
                                : n.target === '/agenda'
                                  ? 'Abrir agenda'
                                  : 'Abrir reserva'}{' '}
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              aria-hidden="true"
                            >
                              <path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </div>
                  </details>
                  {p.deleteId === n.id && (
                    <NoticeDeleteConfirmation
                      busy={p.state.busy}
                      onConfirm={() => p.onDeleteConfirm?.(n.id)}
                      onCancel={p.onDeleteCancel}
                    />
                  )}
                </li>
              );
            })}
          </ul>
          {p.state.items.length === 50 && (
            <p className="bx-inbox-limit">
              Se muestran los últimos 50 avisos. Los filtros se aplican a esta
              lista; el contador incluye todos los avisos sin leer.
            </p>
          )}
        </div>
        <aside className="bx-inbox-about" aria-labelledby="inbox-about-title">
          <Pole />
          <h2 id="inbox-about-title">Sobre tus notificaciones</h2>
          <p>
            Aquí verás confirmaciones de reservas, invitaciones de barberías y
            otras actualizaciones importantes de tus citas.
          </p>
          <div className="bx-inbox-about-items">
            {[
              {
                icon: 'calendar' as const,
                title: 'Reservas',
                text: 'Confirmaciones y cambios de tus citas.',
              },
              {
                icon: 'user' as const,
                title: 'Invitaciones',
                text: 'Novedades sobre invitaciones de barberías.',
              },
              {
                icon: 'bell' as const,
                title: 'Actualizaciones',
                text: 'Información sobre la atención y los pagos de tus reservas.',
              },
            ].map((item) => (
              <div key={item.title}>
                <span className="bx-inbox-icon">
                  <WorkspaceIcon name={item.icon} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bx-inbox-ornament bx-inbox-ornament--small">
            <span />
            <Scissors />
            <span />
          </div>
        </aside>
      </div>
    </section>
  );
}
export function InboxScreen() {
  const { app, state } = useInbox();
  const [filter, setFilter] = useState<Filter>('all');
  const [errorAction, setErrorAction] = useState<'load' | 'read' | 'delete'>(
    'load',
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  useEffect(() => {
    const acknowledge = () => {
      if (state.phase === 'ready' && document.visibilityState === 'visible')
        app?.acknowledge();
    };
    acknowledge();
    document.addEventListener('visibilitychange', acknowledge);
    return () => document.removeEventListener('visibilitychange', acknowledge);
  }, [app, state]);
  return (
    <InboxContent
      state={state}
      filter={filter}
      onFilter={setFilter}
      errorAction={errorAction}
      deleteId={deleteId}
      onDeleteRequest={setDeleteId}
      onDeleteCancel={() => setDeleteId(null)}
      onDeleteConfirm={(id) => {
        setErrorAction('delete');
        void app?.removeNotice(id).then(() => {
          if (app.getSnapshot().phase === 'ready') setDeleteId(null);
        });
      }}
      onRefresh={() => {
        setErrorAction('load');
        void app?.load();
      }}
      onRead={(id) => {
        setErrorAction('read');
        void app?.markRead(id);
      }}
    />
  );
}
