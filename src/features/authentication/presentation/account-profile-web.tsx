import type { ReactNode } from 'react';
import type { SessionView } from '../domain/session-state';
import { AppButton } from '../../../shared/ui/app-button';
import { WorkspaceIcon } from '../../../shared/ui/workspace-icon.web';
import {
  AccountMembershipCount,
  distinctOwnShops,
} from './account-membership-count';
import { ProfileEditIcon } from './personal-profile-form.web';
import { accountProfileStyles } from './account-profile-web.styles';

export function AccountProfileWeb({
  state,
  profileEditor,
  workspaceContent,
  onBooking,
  onOwn,
}: {
  state: Extract<SessionView, { kind: 'ready' }>;
  profileEditor?: ReactNode;
  workspaceContent?: ReactNode;
  onBooking?: () => void;
  onOwn?: () => void;
}) {
  const context = state.context;
  const membership =
    context.kind === 'selected'
      ? `${context.barbershop?.name ?? 'Barbería seleccionada'} · ${context.context.role === 'administrator' ? 'Administrador' : 'Barbero'}`
      : context.kind === 'none'
        ? 'Sin barberías vinculadas'
        : 'Selecciona o revisa tu contexto de barbería.';
  const linked =
    context.kind === 'none' ? (
      <strong>0</strong>
    ) : context.kind === 'choosing' ? (
      <strong>
        {distinctOwnShops(context.memberships, state.identity.userId)}
      </strong>
    ) : (
      <AccountMembershipCount
        userId={state.identity?.userId ?? ''}
        generation={state.generation}
        scope={
          context.kind === 'selected'
            ? context.context.barbershopId
            : context.kind
        }
      />
    );
  return (
    <div className="bx-account-page">
      <style>{accountProfileStyles}</style>
      <header className="bx-account-heading">
        <h1>Mi cuenta</h1>
      </header>
      <section className="bx-account-identity" aria-label="Tu perfil">
        <div className="bx-account-silhouette">
          <WorkspaceIcon name="user" />
        </div>
        <div className="bx-account-details">
          <h2>{state.profile.displayName}</h2>
          <p className="bx-account-phone">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m7 3 3 5-3 3a16 16 0 0 0 6 6l3-3 5 3c0 3-2 5-5 4A24 24 0 0 1 3 8C2 5 4 3 7 3Z" />
            </svg>
            {state.profile.phone ?? 'Sin teléfono registrado'}
          </p>
          <p className="bx-account-membership">
            <WorkspaceIcon name="shop" />
            {membership}
          </p>
        </div>
      </section>
      <div className="bx-account-columns">
        <section className="bx-account-edit-card">
          <div className="bx-account-card-title">
            <span>
              <ProfileEditIcon name="pencil" />
            </span>
            <div>
              <h2>Editar perfil personal</h2>
              <p>Actualiza tu información de cuenta.</p>
            </div>
          </div>
          <div className="bx-account-editor">{profileEditor}</div>
        </section>
        <aside className="bx-account-actions">
          <section className="bx-account-summary">
            <div className="bx-account-card-title">
              <span>
                <ProfileEditIcon name="layers" />
              </span>
              <div>
                <h2>Resumen de tu cuenta</h2>
                <p>Una vista rápida de tu cuenta personal.</p>
              </div>
            </div>
            <div className="bx-account-summary-grid">
              <div>
                <ProfileEditIcon name="check" />
                <span>
                  <small>Confirmación de cuenta</small>
                  <strong className="bx-account-confirmed">
                    {state.identity?.emailConfirmed
                      ? 'Correo confirmado'
                      : 'Por verificar'}
                  </strong>
                </span>
              </div>
              <div>
                <WorkspaceIcon name="shop" />
                <span>
                  <small>Barberías vinculadas</small>
                  {linked}
                </span>
              </div>
            </div>
          </section>
          <section
            className="bx-account-appointments"
            aria-labelledby="account-appointments-title"
          >
            <div className="bx-account-card-title">
              <span>
                <WorkspaceIcon name="calendar" />
              </span>
              <h2 id="account-appointments-title">Tus próximas citas</h2>
              <p>
                Reserva un nuevo horario o consulta las citas que ya
                confirmaste.
              </p>
            </div>
            <div className="bx-account-booking-actions">
              {onBooking && (
                <span className="bx-account-booking-button">
                  <WorkspaceIcon name="calendar" />
                  <AppButton label="Reservar una cita" onPress={onBooking} />
                </span>
              )}
              {onOwn && (
                <span className="bx-account-booking-button">
                  <WorkspaceIcon name="reservations" />
                  <AppButton
                    label="Mis reservas"
                    variant="secondary"
                    onPress={onOwn}
                  />
                </span>
              )}
            </div>
          </section>
          {workspaceContent}
        </aside>
      </div>
    </div>
  );
}
