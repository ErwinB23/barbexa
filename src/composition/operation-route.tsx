import { PaymentsAndRulesPanel } from './payments-and-rules-panel';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { useTeamAuthority } from './use-team-authority';
import { TeamAuthorityPanel } from '../features/barbershop-operation/presentation/team-authority-panel';
import { bookingRequestId } from './booking-request-id';
import { StatusMessage } from '../shared/ui/status-message';
import { useRegistration } from '../features/authentication/presentation/use-registration';
import { OperationContext } from '../features/barbershop-operation/presentation/operation-context';
import {
  OperationScreen,
  type OperationPage,
} from '../features/barbershop-operation/presentation/operation-screen';
export function OperationRoute({ page }: { page: OperationPage }) {
  const router = useRouter();
  const {
    state,
    configured,
    callbackError,
    application: registration,
  } = useRegistration();
  const app = useContext(OperationContext);
  const teamAuthority = useTeamAuthority();
  if (!configured || callbackError || state.kind !== 'ready' || !app)
    return null;
  if (
    page === 'barbershop-admin' &&
    (state.context.kind === 'resolving' || state.context.kind === 'error')
  ) {
    const failed = state.context.kind === 'error';
    return (
      <StatusMessage
        state={failed ? 'error' : 'loading'}
        message={
          failed
            ? 'No se pudo actualizar la información de tu barbería.'
            : 'Actualizando la información de tu barbería…'
        }
        onRetry={() => void registration.refreshContext()}
      />
    );
  }
  if (
    teamAuthority.enabled &&
    state.context.kind === 'selected' &&
    state.context.context.role === 'administrator' &&
    !teamAuthority.value
  ) {
    return (
      <StatusMessage
        state={teamAuthority.phase === 'error' ? 'error' : 'loading'}
        message="Verificando los permisos de esta barbería."
        onRetry={() => void teamAuthority.retry()}
      />
    );
  }
  const key =
    state.kind === 'ready'
      ? `${state.identity.userId}:${state.generation}:${state.context.kind === 'selected' ? `${state.context.context.barbershopId}:${state.context.context.role}` : state.context.kind}`
      : 'unavailable';
  return (
    <OperationScreen
      key={key}
      application={app}
      permissions={teamAuthority.value?.permissions}
      authorityPanel={
        teamAuthority.value && app.authority
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
      page={page}
      paymentsAndRules={
        page === 'payments-rules' &&
        state.context.kind === 'selected' &&
        state.context.context.role === 'administrator' ? (
          <PaymentsAndRulesPanel
            key={key}
            barbershopId={state.context.context.barbershopId}
          />
        ) : undefined
      }
      title={
        state.kind === 'ready' && state.context.kind === 'selected'
          ? (state.context.barbershop?.name ?? 'Tu barbería')
          : 'Oferta y personal'
      }
      onContext={() => router.push('/context')}
      onNavigate={(p) => router.push(`/${p}`)}
    />
  );
}
