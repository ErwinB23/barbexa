import { useEffect, useRef, useState } from 'react';
import type { AuthorityPermissions } from '../domain/team-authority';
import type { AdminInvitation } from '../domain/admin-invitations';
import type { TeamAuthorityViewProps } from './team-authority-panel';
import type { AdminInvitationViewProps } from './admin-invitations';
import { adminManagementStyles } from './admin-management.web.styles';

const paths = {
  users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0m5-4a4 4 0 0 1 0 8m4 10v-2a4 4 0 0 0-3-4',
  mail: 'M3 5h18v14H3Zm0 1 9 7 9-7',
  shield: 'M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7Zm-5 9 3 3 6-6',
  crown: 'm3 7 4 4 5-7 5 7 4-4-3 13H6ZM6 17h12',
  add: 'M15 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M3 21v-2a7 7 0 0 1 14 0v2m3-12v6m-3-3h6',
  search: 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0m-2 5 6 6',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  more: 'M12 4v1m0 6v1m0 6v1',
  check: 'M20 12a8 8 0 1 1-2-5m-11 5 4 4 10-11',
  lock: 'M5 10h14v11H5Zm3 0V6a4 4 0 0 1 8 0v4m-4 5v2',
  calendar: 'M3 5h18v16H3Zm0 5h18M8 2v6m8-6v6',
  refresh: 'M20 8a8 8 0 0 0-14-3L3 8m0-6v6h6m-5 8a8 8 0 0 0 14 3l3-3m0 6v-6h-6',
  close: 'm6 6 12 12M6 18 18 6',
  chevron: 'm9 5 7 7-7 7',
  clock: 'M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0m-8-5v6l4 2',
} as const;
type IconName = keyof typeof paths;
export function AdminManagementIcon({ name }: { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={name === 'more' ? 3 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
function Heading(p: { icon: IconName; title: string; description: string }) {
  return (
    <div className="bx-am-heading">
      <span className="bx-am-icon">
        <AdminManagementIcon name={p.icon} />
      </span>
      <div>
        <h3>{p.title}</h3>
        <p>{p.description}</p>
      </div>
    </div>
  );
}
const capabilities: {
  key: keyof AuthorityPermissions;
  label: string;
  secondary: boolean;
}[] = [
  {
    key: 'manageAdministrators',
    label: 'Administrar invitaciones y administradores',
    secondary: false,
  },
  {
    key: 'manageTeam',
    label: 'Gestionar equipo e invitar profesionales',
    secondary: false,
  },
  {
    key: 'editServices',
    label: 'Gestionar servicios y precios',
    secondary: true,
  },
  {
    key: 'editHours',
    label: 'Configurar horarios y disponibilidad',
    secondary: true,
  },
  {
    key: 'manageReservations',
    label: 'Gestionar reservas y agenda',
    secondary: true,
  },
  {
    key: 'confirmPayment',
    label: 'Confirmar pagos recibidos',
    secondary: true,
  },
  {
    key: 'publish',
    label: 'Gestionar la publicación de la barbería',
    secondary: false,
  },
  {
    key: 'refund',
    label: 'Registrar devoluciones autorizadas',
    secondary: false,
  },
];
const invitationLabels = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
  expired: 'Vencida',
} as const;
function invitationStatus(invitation: AdminInvitation) {
  return invitation.status === 'pending' &&
    Date.parse(invitation.expiresAt) <= Date.now()
    ? 'expired'
    : invitation.status;
}
function date(value: string) {
  return Number.isFinite(Date.parse(value))
    ? new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Lima',
      }).format(new Date(value))
    : 'Fecha no disponible';
}

export function AdminManagementWeb(p: {
  authority: TeamAuthorityViewProps;
  invitations?: AdminInvitationViewProps;
  viewerName?: string;
  scopeKey: string;
}) {
  const a = p.authority,
    authority = a.authority,
    invite = p.invitations;
  const owner = authority.capacity === 'owner';
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'secondary'>(
    owner ? 'owner' : 'secondary',
  );
  const [inviteOpen, setInviteOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const inviteTrigger = useRef<HTMLButtonElement | null>(null);
  const closeInvitation = () => {
    setInviteOpen(false);
    inviteTrigger.current?.focus({ preventScroll: true });
  };
  const load = useRef(invite?.onLoad);
  useEffect(() => {
    load.current = invite?.onLoad;
  });
  useEffect(() => {
    if (owner && invite?.admin) load.current?.();
  }, [p.scopeKey, owner, invite?.admin]);
  useEffect(() => {
    if (inviteOpen && typeof document !== 'undefined') {
      document
        .getElementById('bx-admin-invite')
        ?.scrollIntoView({ block: 'nearest' });
      document
        .getElementById('bx-admin-invite-email')
        ?.focus({ preventScroll: true });
    }
  }, [inviteOpen]);

  const count = owner ? authority.secondaryCount : null;
  const available = count === null ? null : Math.max(0, 2 - count);
  const allMembers = (a.members ?? []).filter(
    (member) =>
      member.role === 'administrator' &&
      (owner || member.userId === authority.userId),
  );
  const activeSecondaries = allMembers.filter(
    (member) =>
      member.status === 'active' && member.userId !== authority.userId,
  );
  const synchronized =
    owner && a.members !== null && activeSecondaries.length === count;
  const canManage =
    owner && authority.permissions.manageAdministrators && synchronized;
  const canInvite =
    canManage &&
    !!invite?.admin &&
    !a.busy &&
    !invite.busy &&
    available !== null &&
    available > 0;
  const canRemove = canManage && !a.busy;
  const name = (userId: string) =>
    a.professionals.find(
      (professional) =>
        professional.userId === userId &&
        professional.barbershopId === authority.barbershopId,
    )?.professionalName ||
    (userId === authority.userId ? p.viewerName : null) ||
    'Nombre no disponible';
  const memberRole = (userId: string) =>
    owner && userId === authority.userId ? 'owner' : 'secondary';
  const filtered = allMembers.filter(
    (member) =>
      (!query ||
        name(member.userId)
          .toLocaleLowerCase('es')
          .includes(query.trim().toLocaleLowerCase('es'))) &&
      (role === 'all' || memberRole(member.userId) === role) &&
      (status === 'all' || member.status === status),
  );
  const invitations =
    invite?.rows?.filter(
      (row) => row.barbershopId === authority.barbershopId,
    ) ?? null;
  const pending =
    invitations === null
      ? null
      : invitations.filter((row) => invitationStatus(row) === 'pending').length;
  const selected = allMembers.find(
    (member) =>
      member.userId === a.selected &&
      member.userId !== authority.userId &&
      member.status === 'active',
  );
  const editing = !!selected && canManage;
  const ownSelectedRole = selectedRole === authority.capacity;
  return (
    <div className="bx-am" data-scope={p.scopeKey}>
      <style>{adminManagementStyles}</style>
      <section className="bx-am-summary" aria-label="Resumen administrativo">
        {[
          {
            icon: 'users' as const,
            title: 'Administradores secundarios',
            value: count === null ? '—' : `${count} / 2`,
            note:
              count === null
                ? 'Consulta exclusiva del propietario'
                : 'Cupos utilizados',
          },
          {
            icon: 'mail' as const,
            title: 'Invitaciones pendientes',
            value: pending === null ? '—' : String(pending),
            note:
              pending === null
                ? 'Pendiente de consulta'
                : 'Esperando aceptación',
          },
          {
            icon: 'shield' as const,
            title: 'Tu rol en esta barbería',
            value: owner ? 'Propietario' : 'Secundario',
            note: owner
              ? 'Administrador principal'
              : 'Administrador con permisos limitados',
          },
          {
            icon: 'add' as const,
            title: 'Cupos disponibles',
            value: available === null ? '—' : String(available),
            note:
              available === null
                ? 'Consulta exclusiva del propietario'
                : available === 0
                  ? 'Límite de secundarios alcanzado'
                  : `Puedes incorporar ${available} ${available === 1 ? 'administrador más' : 'administradores más'}`,
          },
        ].map((metric) => (
          <div className="bx-am-metric" key={metric.title}>
            <span className="bx-am-icon">
              <AdminManagementIcon name={metric.icon} />
            </span>
            <div>
              <h3>{metric.title}</h3>
              <strong
                className={
                  metric.icon === 'shield' ? 'bx-am-role-value' : undefined
                }
              >
                {metric.value}
              </strong>
              <p>{metric.note}</p>
            </div>
          </div>
        ))}
      </section>

      <section
        className="bx-am-card"
        aria-label="Administradores de la barbería"
      >
        <header className="bx-am-card-header">
          <Heading
            icon="users"
            title="Administradores de la barbería"
            description="Usuarios con acceso administrativo a esta barbería."
          />
          {owner && (
            <button
              type="button"
              className="bx-am-button bx-am-primary"
              aria-label="Invitar administrador"
              ref={inviteTrigger}
              aria-expanded={inviteOpen}
              aria-controls="bx-admin-invite"
              disabled={!canInvite && !invite?.uncertain}
              onClick={() => setInviteOpen(true)}
            >
              <AdminManagementIcon name="add" />
              Invitar administrador
            </button>
          )}
        </header>
        {owner && !synchronized && !a.busy && (
          <div className="bx-am-notice" role="status">
            {a.members === null
              ? 'Consulta el equipo para ver los administradores.'
              : 'El equipo cambió. Actualiza los permisos y la lista para continuar.'}
            <button type="button" className="bx-am-link" onClick={a.onReload}>
              Actualizar equipo y permisos
            </button>
          </div>
        )}
        {!owner && (
          <p className="bx-am-note">
            Tu acceso permite consultar tu rol. La gestión de administradores
            corresponde al propietario.
          </p>
        )}
        <div className="bx-am-filters">
          <label className="bx-am-search">
            <AdminManagementIcon name="search" />
            <input
              type="search"
              aria-label="Buscar administradores por nombre"
              placeholder="Buscar por nombre…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label>
            <span className="bx-am-sr">Rol administrativo</span>
            <AdminManagementIcon name="users" />
            <select
              aria-label="Filtrar administradores por rol"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="all">Todos los roles</option>
              <option value="owner">Propietario</option>
              <option value="secondary">Administrador secundario</option>
            </select>
          </label>
          <label>
            <span className="bx-am-sr">Estado de membresía</span>
            <AdminManagementIcon name="check" />
            <select
              aria-label="Filtrar administradores por estado"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </label>
        </div>
        {a.busy && a.members === null ? (
          <p className="bx-am-notice" role="status">
            Consultando administradores…
          </p>
        ) : (
          <div className="bx-am-table-wrap">
            <table className="bx-am-table">
              <caption className="bx-am-sr">
                Administradores y membresías de esta barbería
              </caption>
              <thead>
                <tr>
                  <th>Administrador</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member) => (
                  <tr key={member.userId}>
                    <td>
                      <div className="bx-am-person">
                        <span className="bx-am-avatar">
                          {name(member.userId) === 'Nombre no disponible' ? (
                            <AdminManagementIcon name="users" />
                          ) : (
                            name(member.userId).trim().slice(0, 1).toUpperCase()
                          )}
                        </span>
                        <div>
                          <strong>{name(member.userId)}</strong>
                          <small>
                            {member.userId === authority.userId
                              ? 'Tu cuenta'
                              : 'Acceso a esta barbería'}
                          </small>
                        </div>
                      </div>
                      {detailId === member.userId && (
                        <div
                          className="bx-am-person-detail"
                          role="region"
                          aria-label={`Detalle de ${name(member.userId)}`}
                        >
                          <p>
                            {memberRole(member.userId) === 'owner'
                              ? 'Propietario único. Su cuenta no utiliza cupos secundarios.'
                              : 'La membresía administrativa es independiente de su perfil profesional.'}
                          </p>
                          <p>
                            Los correos y la última actividad no se incluyen en
                            esta consulta.
                          </p>
                        </div>
                      )}
                    </td>
                    <td data-label="Rol">
                      <span className="bx-am-badge">
                        <AdminManagementIcon
                          name={
                            memberRole(member.userId) === 'owner'
                              ? 'crown'
                              : 'shield'
                          }
                        />
                        {memberRole(member.userId) === 'owner'
                          ? 'Propietario'
                          : 'Administrador secundario'}
                      </span>
                    </td>
                    <td data-label="Estado">
                      <span
                        className={`bx-am-badge ${member.status === 'active' ? 'bx-am-success' : 'bx-am-neutral'}`}
                      >
                        <AdminManagementIcon
                          name={member.status === 'active' ? 'check' : 'lock'}
                        />
                        {member.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td data-label="Acciones">
                      <div className="bx-am-row-actions">
                        <button
                          type="button"
                          className="bx-am-square"
                          aria-label={`Ver detalle de ${name(member.userId)}`}
                          aria-expanded={detailId === member.userId}
                          onClick={() =>
                            setDetailId(
                              detailId === member.userId ? null : member.userId,
                            )
                          }
                        >
                          <AdminManagementIcon name="eye" />
                        </button>
                        {owner &&
                          member.userId !== authority.userId &&
                          member.status === 'active' && (
                            <details className="bx-am-menu">
                              <summary
                                aria-label={`Opciones de ${name(member.userId)}`}
                              >
                                <AdminManagementIcon name="more" />
                              </summary>
                              <div>
                                <button
                                  type="button"
                                  aria-label={`Retirar administración de ${name(member.userId)}`}
                                  disabled={!canRemove || a.uncertain}
                                  onClick={(event) => {
                                    a.onSelect(member.userId);
                                    a.onDisposition(null);
                                    a.onReason('');
                                    event?.currentTarget
                                      .closest('details')
                                      ?.removeAttribute('open');
                                  }}
                                >
                                  Retirar administración
                                </button>
                              </div>
                            </details>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <div className="bx-am-empty">
                <AdminManagementIcon name="users" />
                <p>
                  {allMembers.length
                    ? 'No hay administradores con estos filtros'
                    : 'No hay administradores disponibles en esta consulta'}
                </p>
                {allMembers.length > 0 && (
                  <button
                    type="button"
                    className="bx-am-link"
                    onClick={() => {
                      setQuery('');
                      setRole('all');
                      setStatus('all');
                    }}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {editing && (
          <section
            className="bx-am-form bx-am-removal"
            aria-label="Retirar administración"
          >
            <header>
              <Heading
                icon="shield"
                title="Retirar administración"
                description={`Revisa el destino de ${name(a.selected)} antes de confirmar.`}
              />
              <button
                type="button"
                className="bx-am-square"
                aria-label="Cerrar retirada"
                disabled={a.busy || a.uncertain}
                onClick={() => a.onSelect('')}
              >
                <AdminManagementIcon name="close" />
              </button>
            </header>
            <p>
              La cuenta y su historial se conservan. Selecciona el acceso que
              tendrá después.
            </p>
            <div className="bx-am-destinations">
              {(
                [
                  ['barber', 'Conservar como barbero'],
                  ['inactive', 'Desactivar membresía'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className="bx-am-button"
                  aria-pressed={a.disposition === value}
                  disabled={a.busy || a.uncertain}
                  onClick={() => a.onDisposition(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="bx-am-note">
              Conservar como barbero requiere un perfil profesional activo. Los
              compromisos de la agenda pueden impedir una desactivación.
            </p>
            <label htmlFor="bx-admin-removal-reason">
              Motivo de la retirada
            </label>
            <input
              id="bx-admin-removal-reason"
              value={a.reason}
              disabled={a.busy || a.uncertain}
              onChange={(event) => a.onReason(event.target.value)}
            />
            <div className="bx-am-form-actions">
              <button
                type="button"
                className="bx-am-button bx-am-danger"
                aria-label="Confirmar retirada de administración"
                disabled={
                  a.busy ||
                  (!a.uncertain && (!a.disposition || !a.reason.trim()))
                }
                onClick={a.onRemove}
              >
                {a.uncertain
                  ? 'Reintentar la misma retirada'
                  : a.busy
                    ? 'Confirmando…'
                    : 'Confirmar retirada de administración'}
              </button>
              <button
                type="button"
                className="bx-am-button"
                disabled={a.busy || a.uncertain}
                onClick={() => a.onSelect('')}
              >
                Cancelar
              </button>
            </div>
          </section>
        )}
        {a.uncertain && (
          <p className="bx-am-notice" role="status">
            Resultado no confirmado. Conservamos el mismo intento; reintenta sin
            cambiar el destinatario.
          </p>
        )}
        {a.error && (
          <p className="bx-am-notice bx-am-error" role="alert">
            {a.error}
          </p>
        )}
        {a.message && (
          <p className="bx-am-notice bx-am-positive" role="status">
            {a.message}
          </p>
        )}
      </section>

      {inviteOpen && owner && invite?.admin && (
        <section
          className="bx-am-card bx-am-form"
          id="bx-admin-invite"
          aria-label="Invitar administrador secundario"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !invite.busy && !invite.uncertain)
              closeInvitation();
          }}
        >
          <header>
            <Heading
              icon="add"
              title="Invitar administrador secundario"
              description="Envía una invitación dentro de BARBEXA. El acceso comienza cuando la persona acepta."
            />
            <button
              type="button"
              className="bx-am-square"
              aria-label="Cerrar invitación"
              disabled={invite.busy || invite.uncertain}
              onClick={closeInvitation}
            >
              <AdminManagementIcon name="close" />
            </button>
          </header>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!invite.busy && (canInvite || invite.uncertain))
                invite.onInvite();
            }}
          >
            <label htmlFor="bx-admin-invite-email">
              Correo de una cuenta registrada y confirmada
            </label>
            <div className="bx-am-email">
              <AdminManagementIcon name="mail" />
              <input
                id="bx-admin-invite-email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="nombre@ejemplo.com"
                value={invite.email}
                disabled={invite.busy || invite.uncertain}
                onChange={(event) => invite.onEmail(event.target.value)}
              />
            </div>
            <div className="bx-am-form-actions">
              <button
                type="submit"
                className="bx-am-button bx-am-primary"
                disabled={
                  invite.busy ||
                  !invite.email.trim() ||
                  (!canInvite && !invite.uncertain)
                }
              >
                <AdminManagementIcon name="mail" />
                {invite.busy
                  ? 'Procesando…'
                  : invite.uncertain
                    ? 'Reintentar la misma invitación'
                    : 'Enviar invitación'}
              </button>
              <button
                type="button"
                className="bx-am-button"
                disabled={invite.busy || invite.uncertain}
                onClick={() => {
                  closeInvitation();
                  invite.onEmail('');
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
          <div className="bx-am-rules-note">
            <AdminManagementIcon name="shield" />
            <p>
              Solo una cuenta confirmada puede aceptar. La invitación caduca a
              los siete días y no concede permisos al enviarse. Las invitaciones
              pendientes no reservan cupo; el servidor lo comprueba al aceptar.
            </p>
          </div>
        </section>
      )}

      <details
        className="bx-am-card bx-am-invitations"
        aria-label="Invitaciones administrativas enviadas"
      >
        <summary className="bx-am-invitations-toggle">
          <Heading
            icon="mail"
            title="Invitaciones administrativas enviadas"
            description="Consulta las respuestas y la vigencia de tus invitaciones."
          />
          <span className="bx-am-invitations-chevron">
            <AdminManagementIcon name="chevron" />
          </span>
        </summary>
        <div className="bx-am-invitations-content">
          <header className="bx-am-card-header">
            {invite?.admin && (
              <button
                type="button"
                className="bx-am-button"
                disabled={invite.busy}
                onClick={invite.onLoad}
              >
                <AdminManagementIcon name="refresh" />
                {invite.busy ? 'Consultando…' : 'Actualizar invitaciones'}
              </button>
            )}
          </header>
          {!invite ? (
            <p className="bx-am-notice" role="status">
              Las invitaciones administrativas no están habilitadas.
            </p>
          ) : !invite.admin ? (
            <p className="bx-am-note">
              La consulta de invitaciones enviadas corresponde al propietario.
            </p>
          ) : (
            <>
              {invite.error && (
                <p className="bx-am-notice bx-am-error" role="alert">
                  {invite.error}
                </p>
              )}
              {invite.message && (
                <p className="bx-am-notice bx-am-positive" role="status">
                  {invite.message}
                </p>
              )}
              {invite.uncertain && (
                <p className="bx-am-notice" role="status">
                  El resultado no se ha confirmado. Conservamos la misma
                  invitación para reintentar.
                </p>
              )}
              {invitations === null ? (
                <p className="bx-am-notice" role="status">
                  {invite.busy
                    ? 'Consultando invitaciones…'
                    : 'Las invitaciones todavía no se han consultado.'}
                </p>
              ) : !invitations.length ? (
                <div className="bx-am-empty">
                  <span className="bx-am-icon">
                    <AdminManagementIcon name="mail" />
                  </span>
                  <p>Todavía no hay invitaciones administrativas enviadas</p>
                </div>
              ) : (
                <div className="bx-am-sent-list">
                  {[...invitations]
                    .sort(
                      (x, y) =>
                        Date.parse(y.createdAt) - Date.parse(x.createdAt),
                    )
                    .map((row) => {
                      const status = invitationStatus(row);
                      return (
                        <article key={row.id} className="bx-am-sent">
                          <div className="bx-am-sent-person">
                            <span className="bx-am-icon">
                              <AdminManagementIcon name="mail" />
                            </span>
                            <div>
                              <h4>{row.recipientName}</h4>
                              <span
                                className={`bx-am-badge ${status === 'accepted' ? 'bx-am-success' : status === 'pending' ? '' : 'bx-am-neutral'}`}
                              >
                                <AdminManagementIcon
                                  name={
                                    status === 'accepted' ? 'check' : 'clock'
                                  }
                                />
                                {invitationLabels[status]}
                              </span>
                            </div>
                          </div>
                          <dl>
                            <div>
                              <dt>Enviada</dt>
                              <dd>{date(row.createdAt)}</dd>
                            </div>
                            <div>
                              <dt>
                                {status === 'expired' ? 'Venció' : 'Vence'}
                              </dt>
                              <dd>{date(row.expiresAt)}</dd>
                            </div>
                          </dl>
                          {status === 'pending' && (
                            <div className="bx-am-sent-actions">
                              {cancelId !== row.id ? (
                                <button
                                  type="button"
                                  className="bx-am-button"
                                  aria-label={`Cancelar invitación de ${row.recipientName}`}
                                  disabled={invite.busy}
                                  onClick={() => setCancelId(row.id)}
                                >
                                  Cancelar invitación
                                </button>
                              ) : (
                                <div
                                  className="bx-am-cancel-confirm"
                                  role="group"
                                  aria-label={`Confirmar cancelación de ${row.recipientName}`}
                                >
                                  <p>¿Cancelar esta invitación?</p>
                                  <button
                                    type="button"
                                    className="bx-am-button bx-am-danger"
                                    disabled={invite.busy}
                                    onClick={() => invite.onCancel(row.id)}
                                  >
                                    Confirmar cancelación
                                  </button>
                                  <button
                                    type="button"
                                    className="bx-am-button"
                                    disabled={invite.busy}
                                    onClick={() => setCancelId(null)}
                                  >
                                    Conservar
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  <p className="bx-am-note">
                    Se muestra el nombre del destinatario. Su correo no está
                    incluido en esta consulta.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </details>

      <section className="bx-am-card" aria-label="Roles y permisos">
        <Heading
          icon="shield"
          title="Roles y permisos"
          description="Consulta las capacidades de cada rol dentro de tu barbería."
        />
        <div className="bx-am-permissions">
          <div
            className="bx-am-role-selector"
            role="group"
            aria-label="Consultar permisos por rol"
          >
            {(
              [
                [
                  'owner',
                  'Propietario',
                  'Administrador principal de la barbería.',
                  'crown',
                ],
                [
                  'secondary',
                  'Administrador secundario',
                  'Gestión operativa con permisos limitados.',
                  'shield',
                ],
              ] as const
            ).map(([value, label, note, icon]) => (
              <button
                key={value}
                type="button"
                aria-pressed={selectedRole === value}
                onClick={() => setSelectedRole(value)}
              >
                <span className="bx-am-icon">
                  <AdminManagementIcon name={icon} />
                </span>
                <span>
                  <strong>{label}</strong>
                  <small>{note}</small>
                </span>
                <AdminManagementIcon name="chevron" />
              </button>
            ))}
          </div>
          <div className="bx-am-capacity">
            <header>
              <span className="bx-am-icon">
                <AdminManagementIcon
                  name={selectedRole === 'owner' ? 'crown' : 'shield'}
                />
              </span>
              <div>
                <h4>
                  Permisos del rol:{' '}
                  {selectedRole === 'owner'
                    ? 'Propietario'
                    : 'Administrador secundario'}
                </h4>
                <p>
                  {selectedRole === 'owner'
                    ? 'Administra el equipo y las operaciones de su barbería.'
                    : 'Gestiona las operaciones autorizadas; la administración del equipo corresponde al propietario.'}
                </p>
              </div>
            </header>
            <ul>
              {capabilities.map((capability) => {
                const allowed = ownSelectedRole
                  ? authority.permissions[capability.key]
                  : selectedRole === 'owner' || capability.secondary;
                return (
                  <li
                    key={capability.key}
                    className={allowed ? 'bx-am-allowed' : 'bx-am-restricted'}
                  >
                    <AdminManagementIcon name={allowed ? 'check' : 'lock'} />
                    <span>{capability.label}</span>
                    <span className="bx-am-sr">
                      {allowed ? 'Permitido' : 'Restringido'}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="bx-am-note">
              Los permisos se definen por rol y se verifican en cada operación.
              Este panel es informativo. La transferencia de propiedad no está
              disponible en esta interfaz.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
