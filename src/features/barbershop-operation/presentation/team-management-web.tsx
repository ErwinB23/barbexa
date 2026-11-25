import type { ReactNode } from 'react';
import {
  newestInvitations,
  invitationDate,
  professionalActivity,
} from './invitation-history';
import type { ManagementData } from '../application/operation-application';
import type { Professional } from '../domain/types';
import { AppButton } from '../../../shared/ui/app-button';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { teamManagementStyles } from './team-management-web.styles';

const paths = {
  team: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M18 8a3 3 0 0 1 0 6m4 7v-2a4 4 0 0 0-3-4',
  mail: 'M3 5h18v14H3Zm0 1 9 7 9-7',
  shield: 'M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7Zm-5 9 3 3 6-6',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',
  scissors:
    'M7 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0m16 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6 9l14 13M18 9 4 22',
} as const;
export function TeamManagementIcon({ name }: { name: keyof typeof paths }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
const roleLabels = {
  administrator: 'Administrador',
  barber: 'Profesional',
} as const;
const invitationLabels = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
} as const;
export interface TeamManagementWebProps {
  title: string;
  barbershopId?: string;
  data: ManagementData | null;
  loading: boolean;
  disabled: boolean;
  currentUserId?: string;
  navigation: ReactNode;
  feedback: ReactNode;
  administration?: ReactNode;
  onContext?: () => void;
  email: string;
  member: string;
  professionalName: string;
  barber: string | null;
  capabilities: readonly string[];
  onEmail: (value: string) => void;
  onInvite: () => void;
  onCancelInvitation: (id: string) => void;
  onResendInvitation?: (id: string) => void;
  onMember: (id: string) => void;
  onProfessionalName: (value: string) => void;
  onActivateMember: () => void;
  onSelectProfessional: (id: string) => void;
  onToggleProfessional: (professional: Professional) => void;
  onToggleCapability: (id: string) => void;
  onSaveCapabilities: () => void;
}
function BlockTitle({
  icon,
  title,
  description,
}: {
  icon: keyof typeof paths;
  title: string;
  description: string;
}) {
  return (
    <div className="bx-team-block-title">
      <span className="bx-team-icon">
        <TeamManagementIcon name={icon} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
export function TeamManagementWeb(p: TeamManagementWebProps) {
  const known = !!p.data && !p.loading;
  const members = p.data?.members ?? [],
    professionals = p.data?.professionals ?? [];
  const pending = known
    ? newestInvitations(
        p.data?.invitations ?? [],
        p.barbershopId ?? p.data?.settings?.barbershopId,
      ).filter((i) => i.role === 'barber' && i.status === 'pending')
    : [];
  const history = known
    ? newestInvitations(
        p.data?.invitations ?? [],
        p.barbershopId ?? p.data?.settings?.barbershopId,
      ).filter((i) => i.role === 'barber' && i.status !== 'pending')
    : [];
  const activeProfessionals = professionals.filter(
    (profile) =>
      profile.active &&
      members.some((m) => m.userId === profile.userId && m.status === 'active'),
  ).length;
  const roles = [
    ...new Set(members.filter((m) => m.status === 'active').map((m) => m.role)),
  ];
  const rows = [
    ...members.map((membership, index) => ({
      membership,
      profile: professionals.find((prof) => prof.userId === membership.userId),
      key: membership.userId,
      index,
    })),
    ...professionals
      .filter((prof) => !members.some((m) => m.userId === prof.userId))
      .map((profile, index) => ({
        membership: undefined,
        profile,
        key: profile.userId,
        index: members.length + index,
      })),
  ];
  const selectedProfile = professionals.find((prof) => prof.id === p.barber);
  return (
    <div className="bx-team-page">
      <style>{teamManagementStyles}</style>
      <header className="bx-team-page-heading">
        <h1>{p.title}</h1>
        <p>Configura tu negocio y prepara su oferta para recibir reservas.</p>
        {p.onContext && (
          <button type="button" onClick={p.onContext}>
            Seleccionar o actualizar mis barberías
          </button>
        )}
      </header>
      <nav className="bx-team-tabs" aria-label="Administración de la barbería">
        {p.navigation}
      </nav>
      <div className="bx-team-feedback">{p.feedback}</div>
      <section className="bx-team-hero" aria-label="Resumen del equipo">
        <BlockTitle
          icon="team"
          title="Gestión de equipo y personal"
          description="Administra a los profesionales de tu barbería, sus roles, servicios y accesos."
        />
        <div className="bx-team-metrics">
          <div>
            <span className="bx-team-icon">
              <TeamManagementIcon name="team" />
            </span>
            <div>
              <strong>{known ? activeProfessionals : '—'}</strong>
              <p>Profesionales activos</p>
            </div>
          </div>
          <div>
            <span className="bx-team-icon">
              <TeamManagementIcon name="mail" />
            </span>
            <div>
              <strong>{known ? pending.length : '—'}</strong>
              <p>Invitaciones profesionales pendientes</p>
            </div>
          </div>
          <div>
            <span className="bx-team-icon">
              <TeamManagementIcon name="shield" />
            </span>
            <div>
              <strong>{known ? roles.length : '—'}</strong>
              <p>Roles en el equipo</p>
              <small>
                {known
                  ? roles.map((role) => roleLabels[role]).join(' · ') ||
                    'Sin membresías activas'
                  : 'Consultando accesos'}
              </small>
            </div>
          </div>
        </div>
        <div className="bx-team-pole" aria-hidden="true" />
      </section>
      <section className="bx-team-card bx-team-members">
        <BlockTitle
          icon="team"
          title="Miembros del equipo"
          description="Profesionales con acceso a esta barbería."
        />
        <details className="bx-team-invite">
          <summary aria-disabled={p.disabled}>＋ Añadir miembro</summary>
          <div className="bx-team-invite-form">
            <h3>Invitar a un profesional</h3>
            <p>
              La persona debe tener una cuenta. Tendrá acceso a esta barbería
              cuando acepte su invitación.
            </p>
            <AppTextField
              id="invite-email"
              label="Correo exacto de una cuenta registrada"
              value={p.email}
              onChangeText={p.onEmail}
              disabled={p.disabled}
              autoCapitalize="none"
            />
            <AppButton
              label="Invitar como barbero"
              disabled={p.disabled}
              onPress={p.onInvite}
            />
          </div>
        </details>
        {!known ? (
          <p className="bx-team-empty" role="status">
            {p.loading
              ? 'Consultando miembros y servicios…'
              : 'No se pudo cargar el equipo. Utiliza Reintentar para consultar nuevamente.'}
          </p>
        ) : rows.length === 0 ? (
          <div className="bx-team-empty">
            <TeamManagementIcon name="team" />
            <h3>Aún no tienes profesionales en esta barbería.</h3>
            <p>
              Invita a una cuenta registrada para comenzar a preparar tu equipo.
            </p>
          </div>
        ) : (
          <>
            {!professionals.length && (
              <p className="bx-team-note">
                Aún no tienes profesionales en esta barbería. Puedes preparar el
                perfil de una membresía activa.
              </p>
            )}
            <table className="bx-team-table">
              <caption className="bx-team-sr-only">
                Miembros, perfiles profesionales y servicios de la barbería
                seleccionada
              </caption>
              <thead>
                <tr>
                  <th scope="col">Profesional</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Servicios asignados</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const label =
                    row.profile?.professionalName ??
                    (row.key === p.currentUserId
                      ? 'Mi membresía'
                      : `Miembro ${row.index + 1}`);
                  const services =
                    p.data?.services.filter((service) =>
                      p.data?.capabilities.some(
                        (c) =>
                          c.barberId === row.profile?.id &&
                          c.serviceId === service.id,
                      ),
                    ) ?? [];
                  return (
                    <tr key={row.key}>
                      <td data-label="Profesional">
                        <div className="bx-team-person">
                          <span className="bx-team-avatar">
                            <TeamManagementIcon name="user" />
                          </span>
                          <div>
                            <strong>{label}</strong>
                            <small>
                              {row.profile
                                ? 'Correo no incluido en esta consulta'
                                : 'Sin perfil profesional'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td data-label="Rol">
                        <span
                          className={`bx-team-badge${row.membership?.role === 'administrator' ? ' bx-team-badge--admin' : ''}`}
                        >
                          <TeamManagementIcon
                            name={
                              row.membership?.role === 'administrator'
                                ? 'shield'
                                : 'scissors'
                            }
                          />
                          {row.membership
                            ? roleLabels[row.membership.role]
                            : 'Por comprobar'}
                        </span>
                      </td>
                      <td data-label="Estado">
                        <span
                          className={`bx-team-status${row.membership?.status === 'active' ? ' is-active' : ''}`}
                        >
                          {row.membership?.status === 'active'
                            ? 'Activo'
                            : row.membership
                              ? 'Inactivo'
                              : 'Por comprobar'}
                        </span>
                        {row.profile && !row.profile.active && (
                          <small className="bx-team-profile-note">
                            Perfil profesional inactivo
                          </small>
                        )}
                      </td>
                      <td data-label="Servicios asignados">
                        <div className="bx-team-chips">
                          {services.length ? (
                            <>
                              {services.slice(0, 2).map((service) => (
                                <span key={service.id}>
                                  <TeamManagementIcon name="scissors" />
                                  {service.name}
                                </span>
                              ))}
                              {services.length > 2 && (
                                <span
                                  title={services
                                    .slice(2)
                                    .map((s) => s.name)
                                    .join(', ')}
                                  aria-label={`Otros servicios: ${services
                                    .slice(2)
                                    .map((s) => s.name)
                                    .join(', ')}`}
                                >
                                  +{services.length - 2}
                                </span>
                              )}
                            </>
                          ) : (
                            <small>
                              {row.profile
                                ? 'Sin servicios asignados'
                                : 'Requiere perfil profesional'}
                            </small>
                          )}
                        </div>
                      </td>
                      <td data-label="Acciones">
                        <div className="bx-team-row-actions">
                          {row.profile ? (
                            <>
                              <AppButton
                                label={`Servicios de ${row.profile.professionalName}`}
                                compact
                                variant="secondary"
                                disabled={p.disabled}
                                selected={p.barber === row.profile.id}
                                onPress={() =>
                                  p.onSelectProfessional(row.profile!.id)
                                }
                              />
                              <AppButton
                                label={`${row.profile.active ? 'Desactivar' : 'Activar'} ${row.profile.professionalName}`}
                                compact
                                variant={
                                  row.profile.active ? 'danger' : 'secondary'
                                }
                                disabled={p.disabled}
                                onPress={() =>
                                  p.onToggleProfessional(row.profile!)
                                }
                              />
                            </>
                          ) : row.membership?.status === 'active' ? (
                            <AppButton
                              label={`Preparar perfil de ${label}`}
                              compact
                              variant="secondary"
                              disabled={p.disabled}
                              onPress={() => p.onMember(row.key)}
                            />
                          ) : (
                            <small>Sin acciones disponibles</small>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
        <details
          className="bx-team-profile-editor"
          open={!!p.member || !!p.barber}
        >
          <summary>Perfiles profesionales y servicios</summary>
          <div>
            <p>
              Ser administrador no habilita atención automáticamente. Elige una
              membresía activa y crea su perfil profesional.
            </p>
            <label className="bx-team-select-label">
              Membresía activa
              <select
                value={p.member}
                disabled={p.disabled}
                onChange={(e) => p.onMember(e.target.value)}
              >
                <option value="">Selecciona una membresía</option>
                {members
                  .filter((m) => m.status === 'active')
                  .map((member, index) => (
                    <option key={member.userId} value={member.userId}>
                      {professionals.find(
                        (prof) => prof.userId === member.userId,
                      )?.professionalName ??
                        (member.userId === p.currentUserId
                          ? 'Mi membresía'
                          : `Miembro ${index + 1}`)}{' '}
                      · {roleLabels[member.role]}
                    </option>
                  ))}
              </select>
            </label>
            <AppTextField
              id="professional-name"
              label="Nombre profesional público"
              value={p.professionalName}
              onChangeText={p.onProfessionalName}
              disabled={p.disabled}
              autoCapitalize="none"
            />
            <AppButton
              label="Activar perfil profesional del miembro elegido"
              disabled={p.disabled || !p.member}
              onPress={p.onActivateMember}
            />
            {selectedProfile && (
              <div className="bx-team-capabilities">
                <h3>Servicios de {selectedProfile.professionalName}</h3>
                <p>
                  Selecciona todos los servicios que puede atender este
                  profesional. Guardar reemplaza sus capacidades.
                </p>
                <div className="bx-team-service-choices">
                  {p.data?.services.map((service) => (
                    <AppButton
                      key={service.id}
                      label={`${p.capabilities.includes(service.id) ? 'Seleccionado' : 'Seleccionar'}: ${service.name}`}
                      selected={p.capabilities.includes(service.id)}
                      variant="secondary"
                      disabled={p.disabled}
                      onPress={() => p.onToggleCapability(service.id)}
                    />
                  ))}
                </div>
                <AppButton
                  label="Guardar capacidades seleccionadas"
                  disabled={p.disabled}
                  onPress={p.onSaveCapabilities}
                />
              </div>
            )}
          </div>
        </details>
      </section>
      <section className="bx-team-card">
        <details className="bx-team-history bx-team-pending-disclosure">
          <summary>Pendientes ({known ? pending.length : '…'})</summary>
          <p className="bx-team-history-caption">
            Esperan respuesta. Reenviar genera un aviso dentro de BARBEXA.
          </p>
          {!known ? (
            <p className="bx-team-empty" role="status">
              {p.loading
                ? 'Consultando invitaciones…'
                : 'Las invitaciones aún no se pudieron comprobar.'}
            </p>
          ) : !pending.length ? (
            <p className="bx-team-empty">
              No hay invitaciones pendientes por el momento.
            </p>
          ) : (
            <div className="bx-team-invitation-list">
              {pending.map((invitation) => (
                <article key={invitation.id} className="bx-team-invitation">
                  <span className="bx-team-envelope">
                    <TeamManagementIcon name="mail" />
                  </span>
                  <div>
                    <strong>
                      {invitation.recipientName || 'Nombre no disponible'}
                    </strong>
                    <small>
                      {invitation.recipientEmail || 'Correo no disponible'}
                    </small>
                    <small>
                      Fecha de envío: {invitationDate(invitation.createdAt)} ·
                      Lima
                    </small>
                  </div>
                  <span className="bx-team-pending">Pendiente</span>
                  <div className="bx-team-pending-actions">
                    <AppButton
                      label="Reenviar invitación"
                      variant="secondary"
                      compact
                      disabled={p.disabled || !p.onResendInvitation}
                      onPress={() => p.onResendInvitation?.(invitation.id)}
                    />
                    <AppButton
                      label="Cancelar invitación pendiente"
                      variant="secondary"
                      compact
                      disabled={p.disabled}
                      onPress={() => p.onCancelInvitation(invitation.id)}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </details>
        {history.length > 0 && (
          <details className="bx-team-history">
            <summary>Historial de invitaciones ({history.length})</summary>
            <p className="bx-team-history-caption">
              De la más reciente a la más antigua · Hora de Lima
            </p>
            <div className="bx-team-history-list">
              {history.map((invitation) => (
                <article key={invitation.id} className="bx-team-history-card">
                  <header>
                    <span className="bx-team-avatar">
                      <TeamManagementIcon name="user" />
                    </span>
                    <div>
                      <small>Nombre de cuenta</small>
                      <h3>
                        {invitation.recipientName || 'Nombre no disponible'}
                      </h3>
                    </div>
                    <span
                      className={`bx-team-history-state is-${invitation.status}`}
                    >
                      {invitationLabels[invitation.status]}
                    </span>
                  </header>
                  <dl>
                    <div>
                      <dt>Barbería</dt>
                      <dd>{invitation.barbershopName || p.title}</dd>
                    </div>
                    <div>
                      <dt>Fecha de envío</dt>
                      <dd>{invitationDate(invitation.createdAt)}</dd>
                    </div>
                    <div>
                      <dt>
                        {invitation.status === 'accepted'
                          ? 'Aceptada el'
                          : 'Respondida el'}
                      </dt>
                      <dd>{invitationDate(invitation.respondedAt)}</dd>
                    </div>
                    {invitation.status === 'accepted' && (
                      <div>
                        <dt>Profesional actualmente</dt>
                        <dd>
                          <span
                            className={`bx-team-status ${invitation.professionalActive === true ? 'is-active' : ''}`}
                          >
                            {professionalActivity(invitation)}
                          </span>
                        </dd>
                      </div>
                    )}
                  </dl>
                </article>
              ))}
            </div>
          </details>
        )}
      </section>
      {
        <details className="bx-team-card bx-team-administration">
          <summary>
            <TeamManagementIcon name="shield" />
            Administración, permisos e invitaciones administrativas
          </summary>
          <div>
            {p.administration ?? (
              <p role="status">
                La gestión de administradores todavía no está habilitada. Cuando
                esté disponible, podrás invitar a otro miembro como
                administrador secundario desde aquí.
              </p>
            )}
          </div>
        </details>
      }
    </div>
  );
}
