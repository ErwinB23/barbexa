import { useState } from 'react';
import { WorkspaceIcon } from '../../../shared/ui/workspace-icon.web';
import { SiteIcon } from '../../../shared/ui/site-icon.web';
import type { ReceivedInvitation } from './received-invitations.web';
import { invitationDate } from './invitation-history';
import { invitationsInboxStyles } from './invitations-inbox.styles';
export interface InboxInvitation extends ReceivedInvitation {
  kind: 'administrator' | 'barber';
  inviterName?: string;
}
export interface InboxState {
  responseUnverified?: boolean;
  administrator: readonly InboxInvitation[] | null;
  barber: readonly InboxInvitation[] | null;
  busy: boolean;
  errors: readonly string[];
  message: string;
}
export interface InboxProps {
  state: InboxState;
  onRefresh: () => void;
  onRespond: (i: InboxInvitation, d: 'accept' | 'reject') => void;
}
const statuses = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
  expired: 'Vencida',
};
type Filter = 'all' | 'administrator' | 'barber' | 'pending' | 'accepted';
function Mark({
  name,
}: {
  name: 'shield' | 'clock' | 'check' | 'refresh' | 'history' | 'info';
}) {
  const paths = {
    shield: 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Zm-5 10 3 3 7-7',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 3v6l4 3',
    check: 'm5 12 4 4L20 5',
    refresh:
      'M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6m-4 9a9 9 0 0 0 15 2l3-3m0 6v-6h-6',
    history: 'M3 12a9 9 0 1 1 2 6M3 4v8h8m1-6v6l4 3',
    info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 7v7m0-10h.01',
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
      <path d={paths[name]} />
    </svg>
  );
}
function InvitationCard({
  invitation: i,
  busy,
  onRespond,
}: {
  invitation: InboxInvitation;
  busy: boolean;
  onRespond: InboxProps['onRespond'];
}) {
  const admin = i.kind === 'administrator';
  const role = admin ? 'Administrador secundario' : 'Barbero profesional';
  return (
    <article className={`bx-ii-invitation is-${i.status}`}>
      <div className="bx-ii-role">
        <span className="bx-ii-role-icon">
          {admin ? <Mark name="shield" /> : <SiteIcon name="scissors" />}
        </span>
        <div>
          <h3>{role}</h3>
          <p className="bx-ii-shop">
            <WorkspaceIcon name="shop" />
            {i.barbershopName ?? 'Barbería no disponible'}
          </p>
          <p>
            {i.status === 'pending'
              ? admin
                ? 'Te han invitado a colaborar en la administración de esta barbería, según los permisos asignados.'
                : 'Te han invitado a formar parte del equipo profesional y atender las reservas que te asignen.'
              : i.status === 'expired'
                ? 'El periodo de aceptación terminó. Esta invitación ya no está disponible.'
                : `Esta invitación está ${statuses[i.status].toLowerCase()}.`}
          </p>
        </div>
      </div>
      <dl className="bx-ii-meta">
        <div>
          <WorkspaceIcon name="user" />
          <dt>Invitado por</dt>
          <dd>{i.inviterName ?? 'No disponible'}</dd>
        </div>
        <div>
          <WorkspaceIcon name="calendar" />
          <dt>Recibida el</dt>
          <dd>{invitationDate(i.createdAt)}</dd>
        </div>
        {i.expiresAt && (
          <div>
            <Mark name="clock" />
            <dt>{i.status === 'expired' ? 'Venció el' : 'Válida hasta'}</dt>
            <dd>{invitationDate(i.expiresAt)}</dd>
          </div>
        )}
      </dl>
      <div className="bx-ii-card-actions">
        <span className={`bx-ii-status is-${i.status}`}>
          <Mark
            name={
              i.status === 'pending'
                ? 'clock'
                : i.status === 'accepted'
                  ? 'check'
                  : 'info'
            }
          />
          {statuses[i.status]}
        </span>
        {i.status === 'pending' && (
          <>
            <button
              type="button"
              className="bx-ii-primary"
              disabled={busy}
              onClick={() => onRespond(i, 'accept')}
            >
              <Mark name="check" />
              Aceptar invitación
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onRespond(i, 'reject')}
            >
              Rechazar
            </button>
          </>
        )}
        <details className="bx-ii-detail">
          <summary>Ver detalle</summary>
          <div>
            <strong>{i.barbershopName ?? 'Barbería'}</strong>
            <p>Rol: {role}</p>
            <p>Estado: {statuses[i.status]}</p>
            <p>Recibida el: {invitationDate(i.createdAt)}</p>
            {i.expiresAt && <p>Válida hasta: {invitationDate(i.expiresAt)}</p>}
            <p>
              La invitación concede acceso únicamente después de aceptarla y
              solo a la barbería indicada.
            </p>
          </div>
        </details>
      </div>
    </article>
  );
}
export function InvitationsInboxWeb({
  state: s,
  onRefresh,
  onRespond,
}: InboxProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const complete = s.administrator !== null && s.barber !== null;
  const all = [...(s.administrator ?? []), ...(s.barber ?? [])].sort(
    (a, b) =>
      (Date.parse(b.createdAt ?? '') || 0) -
        (Date.parse(a.createdAt ?? '') || 0) || a.id.localeCompare(b.id),
  );
  const rows = all.filter(
    (i) => filter === 'all' || filter === i.kind || filter === i.status,
  );
  const count = (status: InboxInvitation['status']) =>
    complete ? all.filter((i) => i.status === status).length : '—';
  return (
    <main className="bx-inbox">
      <style>{invitationsInboxStyles}</style>
      <header className="bx-ii-header">
        <div>
          <h1>Mis invitaciones recibidas</h1>
          <p>
            Consulta y responde únicamente las invitaciones dirigidas a tu
            cuenta.
          </p>
        </div>
      </header>
      <nav className="bx-ii-filters" aria-label="Filtrar invitaciones">
        {(
          [
            ['all', 'Todas'],
            ['administrator', 'Administración'],
            ['barber', 'Barbero'],
            ['pending', 'Pendientes'],
            ['accepted', 'Aceptadas'],
          ] as const
        ).map(([value, label]) => (
          <button
            type="button"
            key={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {value === 'administrator' ? (
              <Mark name="shield" />
            ) : value === 'barber' ? (
              <SiteIcon name="scissors" />
            ) : value === 'pending' ? (
              <Mark name="clock" />
            ) : value === 'accepted' ? (
              <Mark name="check" />
            ) : null}
            {label}
          </button>
        ))}
        <button
          className="bx-ii-refresh"
          type="button"
          disabled={s.busy}
          onClick={onRefresh}
        >
          <Mark name="refresh" />
          {s.busy ? 'Actualizando…' : 'Actualizar invitaciones'}
        </button>
      </nav>
      <div className="bx-ii-columns">
        <section className="bx-ii-panel bx-ii-tray">
          <div className="bx-ii-title">
            <span>
              <WorkspaceIcon name="mail" />
            </span>
            <div>
              <h2>Bandeja de invitaciones</h2>
              <p>
                {s.busy
                  ? 'Consultando tus invitaciones…'
                  : complete
                    ? `Tienes ${all.length} invitaciones dirigidas a tu cuenta.`
                    : 'La lista está incompleta. Actualiza para volver a consultar.'}
              </p>
            </div>
          </div>
          {s.errors.map((e) => (
            <p className="bx-ii-error" role="alert" key={e}>
              {e}
            </p>
          ))}
          {s.message && (
            <p className="bx-ii-success" role="status">
              {s.message}
            </p>
          )}
          {rows.length ? (
            <div className="bx-ii-list">
              {rows.map((i) => (
                <InvitationCard
                  key={`${i.kind}:${i.id}`}
                  invitation={i}
                  busy={s.busy || !!s.responseUnverified}
                  onRespond={onRespond}
                />
              ))}
            </div>
          ) : (
            <div className="bx-ii-empty" role="status">
              <WorkspaceIcon name="mail" />
              <strong>
                {s.busy
                  ? 'Cargando invitaciones…'
                  : !complete
                    ? 'No se pudo verificar toda la bandeja'
                    : all.length
                      ? 'No hay invitaciones para este filtro'
                      : 'Todavía no tienes invitaciones'}
              </strong>
              <p>
                {complete && !all.length
                  ? 'Cuando una barbería te invite, podrás responder desde aquí.'
                  : 'Puedes actualizar la bandeja o elegir otro filtro.'}
              </p>
            </div>
          )}
          <footer className="bx-ii-history">
            <Mark name="history" />
            <div>
              <h3>Historial reciente</h3>
              <p>
                Consulta tus invitaciones respondidas o que ya no están
                disponibles.
              </p>
            </div>
            <button type="button" onClick={() => setFilter('all')}>
              Ver historial completo <WorkspaceIcon name="arrow" />
            </button>
          </footer>
        </section>
        <aside className="bx-ii-aside">
          <section className="bx-ii-panel">
            <h2>
              <WorkspaceIcon name="reservations" />
              Resumen
            </h2>
            <p>Invitaciones por tipo que requieren tu respuesta.</p>
            {(['administrator', 'barber'] as const).map((kind) => (
              <div className="bx-ii-summary-row" key={kind}>
                {kind === 'administrator' ? (
                  <Mark name="shield" />
                ) : (
                  <SiteIcon name="scissors" />
                )}
                <strong>
                  Invitaciones de{' '}
                  {kind === 'administrator' ? 'administración' : 'barbero'}{' '}
                  pendientes
                </strong>
                <b>
                  {s[kind]?.filter((i) => i.status === 'pending').length ?? '—'}
                </b>
              </div>
            ))}
          </section>
          <section className="bx-ii-panel bx-ii-rules">
            <h2>
              <Mark name="shield" />
              Reglas importantes
            </h2>
            <div>
              <Mark name="check" />
              <p>
                <strong>Cuenta confirmada</strong>Solo una cuenta confirmada
                puede aceptar invitaciones.
              </p>
            </div>
            <div>
              <WorkspaceIcon name="calendar" />
              <p>
                <strong>Vigencia de administración</strong>Estas invitaciones
                caducan a los siete días. Las de barbero siguen sus propias
                reglas.
              </p>
            </div>
            <div>
              <WorkspaceIcon name="user" />
              <p>
                <strong>Límites por rol</strong>Solo el propietario puede
                invitar administradores secundarios; el límite es de dos.
              </p>
            </div>
          </section>
          <section className="bx-ii-panel">
            <h2>
              <WorkspaceIcon name="mail" />
              Estado de mis respuestas
            </h2>
            <p>Resumen general de tus invitaciones.</p>
            <div className="bx-ii-totals">
              <span className="bx-ii-status is-pending">
                {count('pending')} pendientes
              </span>
              <span className="bx-ii-status is-accepted">
                {count('accepted')} aceptadas
              </span>
              <span className="bx-ii-status is-expired">
                {count('expired')} vencidas
              </span>
              <span className="bx-ii-status">
                {count('rejected')} rechazadas
              </span>
              <span className="bx-ii-status">
                {count('cancelled')} canceladas
              </span>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
