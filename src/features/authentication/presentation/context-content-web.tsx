import type { ContextState } from '../domain/session-state';
import { AppButton } from '../../../shared/ui/app-button';
import { WorkspaceIcon } from '../../../shared/ui/workspace-icon.web';
import { contextContentStyles } from './context-content-web.styles';

const roleLabel = {
  administrator: 'Administrador',
  barber: 'Barbero',
} as const;
function ContextIcon({
  name,
}: {
  name: 'shield' | 'switch' | 'refresh' | 'scissors';
}) {
  const paths = {
    shield: 'M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7Zm-5 9 3 3 6-6',
    switch: 'M3 7h17m-5-5 5 5-5 5M21 17H4m5-5-5 5 5 5',
    refresh:
      'M20 8a9 9 0 0 0-15-3L2 8m0-6v6h6M4 16a9 9 0 0 0 15 3l3-3m0 6v-6h-6',
    scissors:
      'M7 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0m16 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6 9l14 13M18 9 4 22',
  };
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
export function ContextContentWeb({
  context,
  onSelect,
  onRefresh,
  onChoose,
  onAccount,
  onAgenda,
}: {
  context: ContextState;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  onChoose: () => void;
  onAccount: () => void;
  onAgenda?: () => void;
}) {
  return (
    <div className="bx-context-page">
      <style>{contextContentStyles}</style>
      <header className="bx-context-heading">
        <h1>Tus barberías</h1>
        <p>
          Selecciona dónde vas a trabajar. Tus permisos se mantienen separados
          en cada barbería.
        </p>
      </header>
      {context.kind === 'selected' ? (
        <>
          <section
            className="bx-context-shop"
            aria-label="Barbería seleccionada"
          >
            <span className="bx-context-shop-icon">
              <WorkspaceIcon name="shop" />
            </span>
            <div className="bx-context-shop-details">
              <h2>{context.barbershop?.name ?? 'Barbería seleccionada'}</h2>
              <span className="bx-context-role">
                <ContextIcon name="shield" />
                {roleLabel[context.context.role]}
              </span>
              <p>Este permiso corresponde únicamente a esta barbería.</p>
            </div>
            <div className="bx-context-pole" aria-hidden="true">
              <i />
              <span />
            </div>
          </section>
          {context.context.role === 'administrator' && onAgenda && (
            <section
              className="bx-context-agenda"
              aria-labelledby="context-agenda-title"
            >
              <span className="bx-context-info-icon">
                <WorkspaceIcon name="calendar" />
              </span>
              <div>
                <span className="bx-context-eyebrow">RESERVAS DEL EQUIPO</span>
                <h2 id="context-agenda-title">Agenda de esta barbería</h2>
                <p>
                  Consulta las reservas de{' '}
                  {context.barbershop?.name ?? 'esta barbería'}, agrupadas por
                  profesional. Revisa la fecha, la atención y el pago de cada
                  cita.
                </p>
              </div>
              <AppButton
                label={`Ver agenda de ${context.barbershop?.name ?? 'esta barbería'}`}
                onPress={onAgenda}
              />
            </section>
          )}
          <div className="bx-context-info-grid">
            <section
              className="bx-context-info"
              aria-labelledby="context-access-title"
            >
              <span className="bx-context-info-icon">
                <ContextIcon name="shield" />
              </span>
              <div>
                <h2 id="context-access-title">Estado de acceso</h2>
                <ul>
                  <li>Permisos activos</li>
                  <li>Rol: {roleLabel[context.context.role]}</li>
                  <li>Acceso exclusivo a esta barbería</li>
                </ul>
              </div>
            </section>
            <section
              className="bx-context-info"
              aria-labelledby="context-management-title"
            >
              <span className="bx-context-info-icon">
                <WorkspaceIcon name="shop" />
              </span>
              <div>
                <h2 id="context-management-title">Gestión de barberías</h2>
                <p>
                  Cambia a otra barbería o actualiza la lista para ver los
                  accesos más recientes.
                </p>
              </div>
            </section>
          </div>
        </>
      ) : context.kind === 'choosing' ? (
        <section
          className="bx-context-choice"
          aria-label="Barberías disponibles"
        >
          <p>Elige una barbería. Tu rol puede ser diferente en cada una.</p>
          <div className="bx-context-choice-grid">
            {context.memberships.map((member) => {
              const shop = context.barbershops?.find(
                (v) => v.id === member.barbershopId,
              );
              return shop ? (
                <article className="bx-context-option" key={member.id}>
                  <WorkspaceIcon name="shop" />
                  <h2>{shop.name}</h2>
                  <p>{roleLabel[member.role]}</p>
                  <AppButton
                    variant="secondary"
                    label={`Elegir ${shop.name} (${roleLabel[member.role]})`}
                    onPress={() => onSelect(shop.id)}
                  />
                </article>
              ) : null;
            })}
          </div>
        </section>
      ) : (
        <div
          className={`bx-context-message${context.kind === 'error' ? ' bx-context-message--error' : ''}`}
          role={context.kind === 'error' ? 'alert' : 'status'}
        >
          <WorkspaceIcon name="shop" />
          <p>
            {context.kind === 'resolving'
              ? 'Comprobando membresías y acceso…'
              : context.kind === 'none'
                ? 'No tienes membresías activas autorizadas. Tu cuenta sigue siendo válida.'
                : context.error === 'network-unavailable'
                  ? 'No pudimos comprobar la conexión. Reintenta sin usar permisos guardados.'
                  : 'No se pudo acceder a la barbería. Actualiza tus membresías; tu sesión sigue activa.'}
          </p>
        </div>
      )}
      <div className="bx-context-divider" aria-hidden="true">
        <ContextIcon name="scissors" />
      </div>
      <div className="bx-context-actions">
        {context.kind === 'selected' && (
          <div className="bx-context-action">
            <ContextIcon name="switch" />
            <AppButton label="Cambiar de barbería" onPress={onChoose} />
          </div>
        )}
        <div className="bx-context-action bx-context-action--secondary">
          <ContextIcon name="refresh" />
          <AppButton
            label="Actualizar barberías"
            variant="secondary"
            onPress={onRefresh}
            disabled={context.kind === 'resolving'}
          />
        </div>
      </div>
      <div className="bx-context-return">
        <WorkspaceIcon name="user" />
        <AppButton
          label="Volver a mi cuenta"
          variant="ghost"
          onPress={onAccount}
        />
      </div>
    </div>
  );
}
