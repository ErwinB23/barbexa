import type { ReactNode } from 'react';

import type { AuthApplicationSource } from '../features/authentication/application/auth-gateway';
import { AuthContext } from '../features/authentication/presentation/auth-context';
import { useSessionLifecycle } from '../features/authentication/presentation/use-auth';

export function AuthProvider({
  application,
  children,
  active = false,
}: {
  application: AuthApplicationSource;
  children: ReactNode;
  active?: boolean;
}) {
  useSessionLifecycle(application, active);
  return (
    <AuthContext.Provider value={application}>{children}</AuthContext.Provider>
  );
}
