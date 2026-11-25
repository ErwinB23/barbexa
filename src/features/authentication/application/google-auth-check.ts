import type {
  AuthGateway,
  ValidatedCallback,
  AuthResolution,
} from './auth-gateway';
import { AuthError, type AuthFailure } from '../domain/auth-error';
import { verifiedIdentity } from '../domain/identity';

export interface GoogleAuthCheckView {
  readonly kind:
    'signed-out' | 'oauth-pending' | 'resolving' | 'verified' | 'error';
  readonly identityVerified: boolean;
  readonly sessionVerified: boolean;
  readonly callbackVerified: boolean;
  readonly logoutConfirmed: boolean | null;
  readonly error?: AuthFailure;
}
type Gateway = Pick<
  AuthGateway,
  | 'signInWithGoogle'
  | 'completeCallback'
  | 'restoreAndVerify'
  | 'signOutCurrent'
  | 'subscribe'
>;
export function createGoogleAuthCheck(auth: Gateway, pending = false) {
  const empty = {
    identityVerified: false,
    sessionVerified: false,
    callbackVerified: false,
    logoutConfirmed: null,
  };
  let snapshot: GoogleAuthCheckView = Object.freeze({
    ...empty,
    kind: pending ? 'oauth-pending' : 'signed-out',
  });
  let epoch = 0,
    disposed = false,
    closing = false,
    opening: Promise<void> | undefined;
  let callback: { code: string; result: Promise<void> } | undefined;
  const listeners = new Set<() => void>();
  const publish = (next: GoogleAuthCheckView) => {
    if (disposed) return;
    snapshot = Object.freeze(next);
    for (const fn of listeners) fn();
  };
  const fail = (e: unknown, v: number) => {
    if (v === epoch)
      publish({
        ...empty,
        kind: 'error',
        error: e instanceof AuthError ? e.code : 'provider-unavailable',
      });
  };
  function verified(result: AuthResolution, v: number, fromCallback: boolean) {
    if (v !== epoch || disposed) return;
    if (result.kind !== 'authenticated') {
      publish({ ...empty, kind: 'signed-out' });
      return;
    }
    verifiedIdentity(result.identity);
    publish({
      ...empty,
      kind: 'verified',
      identityVerified: true,
      sessionVerified: true,
      callbackVerified: fromCallback || snapshot.callbackVerified,
    });
  }
  const off = auth.subscribe((event) => {
    if (event.kind === 'signed-out' && !closing) {
      epoch++;
      callback = undefined;
      publish({ ...empty, kind: 'signed-out' });
    }
  });
  return {
    getSnapshot: () => snapshot,
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    startGoogle(): Promise<void> {
      if (opening) return opening;
      if (
        disposed ||
        closing ||
        snapshot.kind === 'oauth-pending' ||
        snapshot.kind === 'verified'
      )
        return Promise.reject(new AuthError('provider-unavailable'));
      const v = ++epoch;
      callback = undefined;
      publish({ ...empty, kind: 'oauth-pending' });
      opening = (async () => {
        try {
          await auth.signInWithGoogle();
        } catch (e) {
          fail(e, v);
        } finally {
          opening = undefined;
        }
      })();
      return opening;
    },
    async restore() {
      if (disposed || closing || snapshot.kind === 'oauth-pending' || opening)
        return;
      const v = ++epoch;
      publish({
        ...empty,
        kind: 'resolving',
        callbackVerified: snapshot.callbackVerified,
      });
      try {
        verified(await auth.restoreAndVerify(), v, false);
      } catch (e) {
        fail(e, v);
      }
    },
    accept(input: ValidatedCallback): Promise<void> {
      if (disposed || closing || input.purpose !== 'confirmation')
        return Promise.reject(new AuthError('link-invalid'));
      if (callback?.code === input.code) return callback.result;
      const v = ++epoch;
      const result = (async () => {
        try {
          const value = await auth.completeCallback(input);
          if (v !== epoch || disposed) return;
          if (value.kind !== 'authenticated')
            throw new AuthError('link-invalid');
          const session = await auth.restoreAndVerify();
          verified(session, v, true);
        } catch (e) {
          fail(e, v);
        }
      })();
      callback = { code: input.code, result };
      return result;
    },
    async logout() {
      if (closing || disposed) return;
      closing = true;
      const v = ++epoch;
      callback = undefined;
      publish({ ...empty, kind: 'resolving' });
      try {
        const result = await auth.signOutCurrent();
        if (v === epoch)
          publish({
            ...empty,
            kind: 'signed-out',
            logoutConfirmed: result.remoteRevocationConfirmed,
          });
      } catch (e) {
        fail(e, v);
      } finally {
        closing = false;
      }
    },
    reportFailure(error: AuthFailure) {
      epoch++;
      callback = undefined;
      publish({ ...empty, kind: 'error', error });
    },
    dispose() {
      disposed = true;
      epoch++;
      callback = undefined;
      off();
      listeners.clear();
    },
  };
}
export type GoogleAuthCheckApplication = ReturnType<
  typeof createGoogleAuthCheck
>;
