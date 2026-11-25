import { createContext } from 'react';

import type {
  AuthApplicationSource,
  SessionApplicationSource,
} from '../application/auth-gateway';
import type { AuthFailure } from '../domain/auth-error';

export const AuthContext = createContext<AuthApplicationSource | null>(null);
export const RegistrationContext = createContext<{
  application: SessionApplicationSource;
  callbackError: AuthFailure | null;
  configured: boolean;
  capturedReturn?: '/auth/callback' | '/auth/reset-password' | null;
} | null>(null);
