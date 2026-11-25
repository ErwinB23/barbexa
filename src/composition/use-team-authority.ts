import { useContext, useEffect, useSyncExternalStore } from 'react';
import { OperationContext } from '../features/barbershop-operation/presentation/operation-context';
import { useRegistration } from '../features/authentication/presentation/use-registration';
import type { WorkspaceAuthority } from '../features/authentication/presentation/workspace-access';

const empty = { phase: 'idle', value: null, scopeKey: '' } as const;
const noSubscribe = () => () => {};
const getEmpty = () => empty;

// No application/HTTP request exists until the explicit composition flag is enabled.
export function useTeamAuthority() {
  const { state } = useRegistration();
  const app = useContext(OperationContext)?.authority;
  const key = app?.scopeKey() ?? '';
  const snapshot = useSyncExternalStore(
    app?.subscribe ?? noSubscribe,
    app?.getSnapshot ?? getEmpty,
    app?.getSnapshot ?? getEmpty,
  );
  useEffect(() => {
    if (app) void app.read(true);
  }, [app, key]);
  const value =
    snapshot.phase === 'ready' && snapshot.scopeKey === key
      ? snapshot.value
      : null;
  const selected =
    state.kind === 'ready' && state.context.kind === 'selected'
      ? state.context.context
      : null;
  const selectedRole = selected?.role;
  useEffect(() => {
    if (
      !app ||
      selectedRole !== 'administrator' ||
      (snapshot.phase !== 'idle' &&
        snapshot.phase !== 'loading' &&
        snapshot.scopeKey === key)
    )
      return;
    const pendingSnapshot = app.getSnapshot();
    const timer = setTimeout(() => {
      const current = app.getSnapshot();
      if (
        app.scopeKey() === key &&
        current.scopeKey === key &&
        current === pendingSnapshot &&
        (current.phase === 'idle' || current.phase === 'loading')
      )
        app.invalidate();
    }, 12000);
    return () => clearTimeout(timer);
  }, [app, key, selectedRole, snapshot.phase, snapshot.scopeKey]);
  const authority: WorkspaceAuthority | undefined = app
    ? (value ?? {
        userId: state.kind === 'ready' ? state.identity.userId : '',
        barbershopId: selected?.barbershopId ?? '',
        capacity: 'unavailable',
        permissions: { editServices: false, manageTeam: false },
      })
    : undefined;
  return {
    enabled: !!app,
    authority,
    value,
    phase: snapshot.scopeKey === key ? snapshot.phase : 'loading',
    retry: () => app?.read(true),
  };
}
