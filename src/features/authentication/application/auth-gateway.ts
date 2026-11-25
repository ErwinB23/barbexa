import type { Identity } from '../domain/identity';
import type { SessionView } from '../domain/session-state';

// Superficie mínima T008; acciones y coordinación funcional se incorporan por historia.
export interface AuthApplicationSource {
  getSnapshot(): SessionView;
  subscribe(listener: () => void): () => void;
}
export interface RegistrationApplicationSource extends AuthApplicationSource {
  register(input: unknown): Promise<void>;
  completeCallback(input: ValidatedCallback): Promise<void>;
  retryProfile(input?: {
    readonly displayName: string;
    readonly phone: string | null;
  }): Promise<void>;
  canRetryProfile(): boolean;
}
export interface SessionApplicationSource extends RegistrationApplicationSource {
  signInWithGoogle(): Promise<void>;
  cancelGoogle(): Promise<void>;
  canUseGoogle(): boolean;
  updateOwnProfile(input: unknown): Promise<void>;
  requestRecovery(input: unknown): Promise<void>;
  setRecoveredPassword(input: unknown): Promise<void>;
  signIn(input: unknown): Promise<void>;
  signOutCurrent(): Promise<{ readonly remoteRevocationConfirmed: boolean }>;
  restoreAndVerify(): Promise<void>;
  invalidateSession(reason?: 'lifecycle'): void;
  setRefreshActive(active: boolean): void;
  selectContext(id: unknown): Promise<void>;
  refreshContext(): Promise<void>;
  chooseContext(): Promise<void>;
}

export interface RegistrationInput {
  readonly displayName: string;
  readonly phone: string | null;
  readonly email: string;
  readonly password: string;
}
export type AuthResolution =
  | { readonly kind: 'signed-out' }
  | { readonly kind: 'authenticated'; readonly identity: Identity }
  | { readonly kind: 'recovery' };
export type AuthEvent =
  | { readonly kind: 'session-changed' }
  | { readonly kind: 'signed-out' }
  | { readonly kind: 'recovery' };
export interface ValidatedCallback {
  readonly code: string;
  readonly purpose: 'confirmation' | 'recovery';
  readonly flowId?: string;
}

export interface AuthGateway {
  signInWithGoogle(): Promise<void>;
  register(
    input: RegistrationInput,
  ): Promise<
    | { readonly kind: 'confirmation-required' }
    | { readonly kind: 'authenticated'; readonly identity: Identity }
  >;
  signIn(email: string, password: string): Promise<AuthResolution>;
  restoreAndVerify(expectedUserId?: string): Promise<AuthResolution>;
  invalidateSession?(): void;
  setRefreshActive?(active: boolean): void;
  subscribe(listener: (event: AuthEvent) => void): () => void;
  signOutCurrent(): Promise<{ readonly remoteRevocationConfirmed: boolean }>;
  requestRecovery(email: string, returnTarget: string): Promise<void>;
  completeCallback(input: ValidatedCallback): Promise<AuthResolution>;
  setRecoveredPassword(password: string): Promise<void>;
}
