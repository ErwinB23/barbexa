import { WorkspaceIcon } from '../../../shared/ui/workspace-icon.web';
import { receivedInvitationStyles } from './received-invitations.styles';

export interface ReceivedInvitation {
  id: string;
  barbershopName?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
  createdAt?: string;
  expiresAt?: string;
}
export interface ReceivedInvitationProps {
  kind: 'administrator' | 'barber';
  rows: readonly ReceivedInvitation[] | null;
  busy: boolean;
  error?: string | null;
  message?: string | null;
  onLoad: () => void;
  onRespond: (id: string, decision: 'accept' | 'reject') => void;
}
const states = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
  expired: 'Caducada',
};
const date = (value: string) =>
  new Date(value).toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Lima',
  });
export function ReceivedInvitationsWeb(p: ReceivedInvitationProps) {
  const admin = p.kind === 'administrator';
  const pending = p.rows?.filter((i) => i.status === 'pending').length;
  const rows = p.rows
    ? [...p.rows].sort(
        (a, b) =>
          (b.createdAt ? Date.parse(b.createdAt) : 0) -
            (a.createdAt ? Date.parse(a.createdAt) : 0) ||
          a.id.localeCompare(b.id),
      )
    : null;
  return (
    <section
      className="bx-received"
      aria-label={
        admin
          ? 'Invitaciones recibidas de administración'
          : 'Invitaciones recibidas de barbero'
      }
      aria-busy={p.busy}
    >
      <style>{receivedInvitationStyles}</style>
      <header>
        <span className="bx-ri-icon">
          <WorkspaceIcon name={admin ? 'shop' : 'user'} />
        </span>
        <div>
          <h2>
            {admin
              ? 'Para administrar una barbería'
              : 'Para trabajar como barbero'}
          </h2>
          <p>
            {admin
              ? 'Invitaciones para incorporarte como administrador secundario.'
              : 'Invitaciones para formar parte del equipo profesional.'}
          </p>
        </div>
        <button type="button" disabled={p.busy} onClick={p.onLoad}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6m-4 9a9 9 0 0 0 15 2l3-3m0 6v-6h-6" />
          </svg>
          {p.busy ? 'Actualizando…' : 'Actualizar'}
        </button>
      </header>
      <div className="bx-ri-overview">
        <span>
          <WorkspaceIcon name="mail" />
          Dirigidas a tu cuenta
        </span>
        <span>
          {pending === undefined
            ? 'Por consultar'
            : `${pending} ${pending === 1 ? 'pendiente' : 'pendientes'}`}
        </span>
      </div>
      {p.error && (
        <p className="bx-ri-message bx-ri-error" role="alert">
          {p.error}
        </p>
      )}
      {p.message && (
        <p className="bx-ri-message bx-ri-success" role="status">
          {p.message}
        </p>
      )}
      {rows === null ? (
        <p className="bx-ri-empty" role="status">
          {p.busy
            ? 'Consultando tus invitaciones…'
            : p.error
              ? 'La lista no está disponible. Pulsa Actualizar para volver a consultar.'
              : 'Preparando tus invitaciones…'}
        </p>
      ) : rows.length === 0 ? (
        <div className="bx-ri-empty">
          <WorkspaceIcon name="mail" />
          <strong>
            No tienes invitaciones {admin ? 'de administración' : 'de barbero'}.
          </strong>
          <p>Cuando una barbería te invite, podrás responder desde aquí.</p>
        </div>
      ) : (
        <div className="bx-ri-list">
          {rows.map((i) => (
            <article key={i.id}>
              <div className="bx-ri-invitation-heading">
                <span className="bx-ri-shop-icon">
                  <WorkspaceIcon name="shop" />
                </span>
                <div>
                  <h3>{i.barbershopName ?? 'Barbería'}</h3>
                  <p>
                    {admin ? 'Administrador secundario' : 'Barbero profesional'}
                  </p>
                </div>
                <span className={`bx-ri-status bx-ri-status--${i.status}`}>
                  {states[i.status]}
                </span>
              </div>
              {(i.createdAt || i.expiresAt) && (
                <dl>
                  {i.createdAt && (
                    <div>
                      <dt>Recibida el</dt>
                      <dd>{date(i.createdAt)}</dd>
                    </div>
                  )}
                  {i.expiresAt && (
                    <div>
                      <dt>Válida hasta</dt>
                      <dd>{date(i.expiresAt)}</dd>
                    </div>
                  )}
                </dl>
              )}
              {i.status === 'pending' && (
                <>
                  <p className="bx-ri-hint">
                    {admin
                      ? 'Al aceptar, obtendrás acceso de administración a esta barbería.'
                      : 'Al aceptar, te incorporarás al equipo de esta barbería.'}
                  </p>
                  <div className="bx-ri-actions">
                    <button
                      type="button"
                      className="bx-ri-accept"
                      disabled={p.busy}
                      onClick={() => p.onRespond(i.id, 'accept')}
                    >
                      Aceptar invitación
                    </button>
                    <button
                      type="button"
                      disabled={p.busy}
                      onClick={() => p.onRespond(i.id, 'reject')}
                    >
                      Rechazar
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
      {admin && (
        <p className="bx-ri-footnote">
          Las invitaciones de administración caducan a los 7 días. Necesitas una
          cuenta confirmada para aceptarlas.
        </p>
      )}
    </section>
  );
}
