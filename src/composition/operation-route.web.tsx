import { PaymentsAndRulesPanel } from './payments-and-rules-panel.web';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useContext } from 'react';
import { useRegistration } from '../features/authentication/presentation/use-registration';
import { workspaceAccess } from '../features/authentication/presentation/workspace-access';
import { OperationContext } from '../features/barbershop-operation/presentation/operation-context';
import { useTeamAuthority } from './use-team-authority';
import { TeamAuthorityPanel } from '../features/barbershop-operation/presentation/team-authority-panel';
import { AdminManagementPanel } from '../features/barbershop-operation/presentation/admin-management-panel.web';
import { bookingRequestId } from './booking-request-id';
import { ShopNameEditor } from '../features/barbershop-operation/presentation/shop-name-editor.web';
import { ShopClosuresPanel } from '../features/barbershop-operation/presentation/shop-closures-panel.web';
import { ReceivedInvitationsPage } from './received-invitations-page.web';
import { ProfessionalWorkspace } from './professional-workspace.web';
import {
  OperationScreen,
  type OperationPage,
} from '../features/barbershop-operation/presentation/operation-screen';

function AccessDenied() {
  return (
    <section className="bx-home-empty" role="status">
      <h1>No tienes permisos para esta sección</h1>
      <p>
        Selecciona una barbería en la que tengas una membresía activa con las
        facultades necesarias.
      </p>
      <Link href="/context">Revisar mis barberías</Link>
      <br />
      <Link href="/account">Volver al Inicio</Link>
      <br />
      <Link href="/account?view=profile">Ir a Mi perfil</Link>
    </section>
  );
}

export function OperationRoute({ page }: { page: OperationPage }) {
  const {
    state,
    configured,
    callbackError,
    application: registration,
  } = useRegistration();
  const teamAuthority = useTeamAuthority();
  const app = useContext(OperationContext),
    router = useRouter(),
    { view } = useLocalSearchParams();
  if (!configured || callbackError || state.kind !== 'ready' || !app)
    return null;
  if (
    page === 'barbershop-admin' &&
    (state.context.kind === 'resolving' || state.context.kind === 'error')
  ) {
    const failed = state.context.kind === 'error';
    return (
      <section
        className="bx-home-empty"
        role={failed ? 'alert' : 'status'}
        aria-busy={!failed}
      >
        <h1>Administrar barbería</h1>
        <p>
          {failed
            ? 'No se pudo actualizar la información de tu barbería.'
            : 'Actualizando la información de tu barbería…'}
        </p>
        {failed && (
          <button
            type="button"
            onClick={() => void registration.refreshContext()}
          >
            Volver a consultar
          </button>
        )}
      </section>
    );
  }
  const access = workspaceAccess(state, teamAuthority.authority);
  const staffView =
    view === 'team' || view === 'professional' ? view : 'incoming';
  const createOnly =
    page === 'barbershop-admin' && (view === 'create' || !access.administrator);
  const selectedAdministrator =
    state.context.kind === 'selected' &&
    state.context.context.role === 'administrator';
  const teamView = page === 'staff' && staffView === 'team';
  // No authority request can resolve without an administrative membership.
  // Keep actual context resolution/query errors separate from a known denial.
  if (
    teamView &&
    !selectedAdministrator &&
    state.context.kind !== 'resolving' &&
    state.context.kind !== 'error'
  )
    return <AccessDenied />;
  const needsAuthority =
    (page === 'barbershop-admin' &&
      view !== 'create' &&
      selectedAdministrator) ||
    page === 'services' ||
    page === 'payments-rules' ||
    (page === 'schedules' && selectedAdministrator) ||
    teamView;
  const queryError =
    teamAuthority.phase === 'error' ||
    (teamView && state.context.kind === 'error');
  const loadingPermissions =
    !queryError &&
    (teamAuthority.phase === 'loading' || teamAuthority.phase === 'idle');
  if (
    teamAuthority.enabled &&
    needsAuthority &&
    (!teamAuthority.value || teamAuthority.value.capacity === 'unregularized')
  )
    return (
      <div className="bx-authority-pending">
        <style>{`
.bx-authority-pending{width:100%;max-width:1600px;margin:0 auto;padding:24px clamp(18px,3vw,40px);font-family:var(--bx-font);color:var(--bx-ink);box-sizing:border-box;}
.bx-authority-pending header{margin-bottom:18px;}.bx-authority-pending h1{font-size:26px;margin:0 0 7px;}.bx-authority-pending header p{margin:0;color:var(--bx-muted);font-size:14px;}
.bx-authority-tabs{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;}.bx-authority-tabs a,.bx-authority-actions a,.bx-authority-actions button{min-height:42px;display:inline-flex;align-items:center;padding:10px 15px;border:1px solid var(--bx-line);border-radius:12px;background:#fffdfa;color:var(--bx-action);text-decoration:none;font:600 14px var(--bx-font);box-sizing:border-box;}
.bx-authority-tabs [aria-current='page']{background:#81531f;color:#fff8ed;}.bx-authority-message{padding:22px;border:1px solid var(--bx-line);border-radius:16px;background:#fffdfa;}.bx-authority-message h2{font-size:20px;margin:0 0 8px;}.bx-authority-message p{margin:0;line-height:1.6;font-size:14px;color:var(--bx-muted);}
.bx-authority-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;}.bx-authority-actions button{cursor:pointer;background:#80521e;color:#fff8ec;}.bx-authority-actions button:disabled{opacity:.55;cursor:default;}.bx-authority-pending a:focus-visible,.bx-authority-pending button:focus-visible{outline:3px solid #ab7d39;outline-offset:3px;}
.bx-authority-skeleton{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:18px;}.bx-authority-skeleton span{height:100px;background:linear-gradient(115deg,#f4ebdf,#faf5ed);border:1px solid var(--bx-line);border-radius:15px;}@media(max-width:650px){.bx-authority-skeleton{grid-template-columns:1fr;}}
`}</style>
        <header>
          <h1>
            {state.context.kind === 'selected'
              ? (state.context.barbershop?.name ?? 'Tu barbería')
              : 'Administrar barbería'}
          </h1>
          <p>Administración de la barbería seleccionada</p>
        </header>
        <nav className="bx-authority-tabs" aria-label="Administrar barbería">
          {(
            [
              ['barbershop-admin', 'Barbería'],
              ['staff?view=team', 'Gestión de equipo y personal'],
              ['services', 'Servicios'],
              ['schedules', 'Horarios'],
              ['payments-rules', 'Pagos y reglas'],
            ] as const
          ).map(([path, label]) => (
            <Link
              key={path}
              href={`/${path}`}
              aria-current={path.split('?')[0] === page ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <section
          className="bx-authority-message"
          role={queryError ? 'alert' : 'status'}
          aria-busy={loadingPermissions}
        >
          <h2>
            {queryError
              ? 'No se pudieron consultar los permisos'
              : loadingPermissions
                ? 'Cargando permisos…'
                : 'Administración no disponible'}
          </h2>
          <p>
            {loadingPermissions
              ? 'Comprobando el acceso a esta barbería. La sección se abrirá automáticamente al terminar.'
              : teamAuthority.value?.capacity === 'unregularized'
                ? 'Esta barbería requiere una asignación de propiedad revisada antes de habilitar la administración.'
                : 'La consulta no terminó o no se pudo verificar el acceso. Puedes reintentar sin salir de esta sección.'}
          </p>
          <div className="bx-authority-actions">
            <button
              type="button"
              disabled={loadingPermissions}
              onClick={() => void teamAuthority.retry()}
            >
              {loadingPermissions
                ? 'Verificando acceso…'
                : 'Volver a verificar'}
            </button>
            <Link href="/context">Revisar mis barberías</Link>
            <Link href="/account">Volver al Inicio</Link>
          </div>
        </section>
        {loadingPermissions && (
          <div className="bx-authority-skeleton" aria-hidden="true">
            <span />
            <span />
          </div>
        )}
      </div>
    );

  const denied =
    page === 'staff'
      ? staffView === 'team'
        ? !access.manageTeam
        : staffView === 'professional' && !access.selected
      : page === 'services' || page === 'payments-rules'
        ? !access.administrator
        : page === 'schedules'
          ? !access.selected
          : false;
  if (denied) return <AccessDenied />;
  const context = state.context.kind === 'selected' ? state.context : null;
  if (page === 'staff' && staffView === 'professional' && context)
    return (
      <ProfessionalWorkspace
        key={`${state.identity.userId}:${state.generation}:${context.context.membershipId}:${context.context.role}`}
        application={app}
        shopId={context.context.barbershopId}
        shopName={context.barbershop?.name ?? 'Tu barbería'}
        scopeKey={`${state.identity.userId}:${state.generation}:${context.context.membershipId}:${context.context.role}`}
      />
    );
  if (page === 'staff' && staffView === 'incoming')
    return (
      <ReceivedInvitationsPage
        key={`${state.identity.userId}:${state.generation}:${app.scopeKey()}`}
        application={app}
      />
    );
  return (
    <OperationScreen
      key={`${state.identity.userId}:${state.generation}:${context?.context.membershipId ?? state.context.kind}:${context?.context.role ?? ''}:${page}:${staffView}:${createOnly}`}
      application={app}
      page={page}
      paymentsAndRules={
        page === 'payments-rules' && access.administrator && context ? (
          <PaymentsAndRulesPanel
            key={`${state.identity.userId}:${state.generation}:${context.context.barbershopId}`}
            barbershopId={context.context.barbershopId}
          />
        ) : undefined
      }
      staffView={page === 'staff' ? staffView : undefined}
      createOnly={createOnly}
      shopNameEditor={
        <ShopNameEditor
          application={app}
          onRenamed={registration.refreshContext}
        />
      }
      shopClosuresPanel={
        app.shopClosures ? (
          <ShopClosuresPanel
            application={app.shopClosures}
            newRequestId={bookingRequestId}
          />
        ) : undefined
      }
      permissions={teamAuthority.value?.permissions}
      administrationPanel={
        teamView && teamAuthority.value && app.authority
          ? (data, loading, reload) => (
              <AdminManagementPanel
                key={app.scopeKey()}
                application={app.authority!}
                invitations={app.adminInvitations}
                authority={teamAuthority.value!}
                data={data}
                loading={loading}
                viewerName={state.profile.displayName}
                newRequestId={bookingRequestId}
                onReload={reload}
              />
            )
          : undefined
      }
      authorityPanel={
        teamAuthority.value &&
        app.authority &&
        (page === 'barbershop-admin' ||
          (page === 'staff' && staffView === 'team'))
          ? (data, loading, reload) => (
              <TeamAuthorityPanel
                application={app.authority!}
                authority={teamAuthority.value!}
                data={data}
                loading={loading}
                newRequestId={bookingRequestId}
                onReload={reload}
              />
            )
          : undefined
      }
      title={
        page === 'staff'
          ? staffView === 'incoming'
            ? 'Mis invitaciones recibidas'
            : staffView === 'professional'
              ? 'Mi espacio profesional'
              : `Equipo · ${context?.barbershop?.name ?? 'Tu barbería'}`
          : createOnly
            ? 'Crear mi barbería'
            : (context?.barbershop?.name ?? 'Tu barbería')
      }
      onContext={() => router.push('/context')}
      onAgenda={() => router.push('/agenda')}
      onNavigate={(p) =>
        router.push(p === 'staff' ? '/staff?view=team' : `/${p}`)
      }
    />
  );
}
