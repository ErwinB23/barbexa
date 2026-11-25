import { useContext, useSyncExternalStore } from 'react';
import { RegistrationContext } from './auth-context';
import { AuthError } from '../domain/auth-error';
const serverSnapshot = Object.freeze({ kind: 'resolving' } as const);
export function useRegistration() {
  const services = useContext(RegistrationContext);
  if (!services) throw new AuthError('provider-unavailable');
  const state = useSyncExternalStore(
    services.application.subscribe,
    services.application.getSnapshot,
    () => serverSnapshot,
  );
  return {
    ...services,
    state,
    canRetryProfile: services.application.canRetryProfile(),
  };
}
