import { Link } from 'expo-router';
import type { SessionView } from '../domain/session-state';
import type { WorkspaceAuthority } from './workspace-access';
import { WorkspaceIcon } from '../../../shared/ui/workspace-icon.web';

export function WebProfileAccess({
  state,
}: {
  state: SessionView;
  authority?: WorkspaceAuthority;
}) {
  if (state.kind !== 'ready') return null;
  return (
    <>
      <section
        className="bx-account-personal"
        aria-labelledby="account-personal-title"
      >
        <div className="bx-account-card-title">
          <span>
            <WorkspaceIcon name="mail" />
          </span>
          <div>
            <h2 id="account-personal-title">Accesos personales</h2>
            <p>Gestiona tus invitaciones y crea tu barbería.</p>
          </div>
        </div>
        <Link className="bx-action" href="/staff">
          <WorkspaceIcon name="mail" /> Mis invitaciones recibidas
          <WorkspaceIcon name="chevron" />
        </Link>
        <Link className="bx-action" href="/barbershop-admin?view=create">
          <WorkspaceIcon name="shop" /> Crear mi barbería
          <WorkspaceIcon name="chevron" />
        </Link>
      </section>
    </>
  );
}
