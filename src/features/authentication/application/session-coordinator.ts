import type {
  AuthApplicationSource,
  AuthGateway,
  ValidatedCallback,
} from './auth-gateway';
import {
  profileDetails,
  registrationInput,
  authFailure,
  type ProfileDetails,
  signInInput,
  recoveryEmail,
  recoveredPassword,
} from './auth-actions';
import { AuthError } from '../domain/auth-error';
import { verifiedIdentity, type Identity } from '../domain/identity';
import type { TenantContextSource } from './tenant-context';
import {
  readySession,
  type OwnProfile,
  type SessionView,
} from '../domain/session-state';

export interface RegistrationProfileGateway {
  getOwnProfile(): Promise<OwnProfile | null>;
  ensureOwnProfile(input: ProfileDetails): Promise<OwnProfile>;
  updateOwnProfile?(input: ProfileDetails): Promise<OwnProfile>;
}
export function createSessionCoordinator({
  auth,
  profiles,
  context,
  recoveryReturnTarget,
  googleEnabled = false,
  startRestoreDeadline,
}: {
  auth: Pick<AuthGateway, 'register' | 'completeCallback' | 'subscribe'> &
    Partial<
      Pick<
        AuthGateway,
        | 'signIn'
        | 'signInWithGoogle'
        | 'signOutCurrent'
        | 'restoreAndVerify'
        | 'invalidateSession'
        | 'setRefreshActive'
        | 'requestRecovery'
        | 'setRecoveredPassword'
      >
    >;
  profiles: RegistrationProfileGateway;
  context?: TenantContextSource;
  recoveryReturnTarget?: string;
  googleEnabled?: boolean;
  // Clock policy is injected by composition; no platform dependency in the core.
  startRestoreDeadline?: (expire: () => void) => () => void;
}) {
  let snapshot: SessionView = Object.freeze({ kind: 'resolving' });
  let generation = 0,
    disposed = false;
  let actor: Identity | undefined, details: ProfileDetails | undefined;
  let registerPending: Promise<void> | undefined;
  let profilePending: Promise<void> | undefined;
  let editPending: { version: number; result: Promise<void> } | undefined;
  let loginPending: Promise<void> | undefined;
  let googlePending: Promise<void> | undefined;
  let recoveryPending: Promise<void> | undefined;
  let passwordPending: Promise<void> | undefined;
  let logoutPending:
    Promise<{ readonly remoteRevocationConfirmed: boolean }> | undefined;
  let cleanupRequired = false;
  let restorePending: Promise<void> | undefined;
  let cancelRestore: (() => void) | undefined;
  let callbackCount = 0;
  let callback:
    | { code: string; purpose: string; flowId?: string; result: Promise<void> }
    | undefined;
  const listeners = new Set<() => void>();
  const current = (version: number) => !disposed && version === generation;
  function publish(next: SessionView) {
    snapshot = Object.freeze(next);
    for (const listener of listeners) listener();
  }
  function fail(error: unknown, version: number) {
    if (current(version))
      publish({ kind: 'retryable-error', error: authFailure(error).code });
  }
  function clearActor() {
    actor = undefined;
    details = undefined;
    callback = undefined;
    context?.clear();
  }
  const unsubscribe = auth.subscribe((event) => {
    if (logoutPending || cleanupRequired) return;
    if (event.kind === 'recovery' && callbackCount) return;
    if (event.kind !== 'signed-out' && event.kind !== 'recovery') return;
    generation++;
    cancelRestore?.();
    restorePending = undefined;
    clearActor();
    publish({ kind: event.kind });
  });
  async function bootstrap(version: number, input?: ProfileDetails) {
    const identity = actor;
    if (!identity || !current(version)) return;
    const existing = await profiles.getOwnProfile();
    if (!current(version)) return;
    if (!existing && !input && identity.suggestedDisplayName) {
      input = profileDetails({
        displayName: identity.suggestedDisplayName,
        phone: null,
      });
      details = input;
    }
    if (!existing && !input) {
      publish({ kind: 'profile-required', identity });
      return;
    }
    const profile = existing ?? (await profiles.ensureOwnProfile(input!));
    if (!current(version)) return;
    publish(readySession(identity, profile, version));
    details = undefined;
    if (context) await context.resolve(identity);
  }
  async function revalidateReady(version: number, identity: Identity) {
    if (snapshot.kind !== 'ready') return;
    const profile = snapshot.profile;
    if (editPending?.version !== version) {
      const existing = await profiles.getOwnProfile();
      if (!current(version) || snapshot.kind !== 'ready') return;
      // Do not overwrite a local profile edit with an older read.
      if (editPending?.version !== version && snapshot.profile === profile) {
        if (!existing) {
          generation++;
          actor = identity;
          publish({ kind: 'profile-required', identity });
          context?.clear();
          return;
        }
        const verified = readySession(identity, existing, version);
        if (
          existing.displayName !== profile.displayName ||
          existing.phone !== profile.phone ||
          identity.email !== snapshot.identity.email
        )
          publish({ ...verified, context: snapshot.context });
      }
    }
    if (current(version)) await context?.revalidate(identity);
  }
  const offContext = context?.subscribe(() => {
    if (
      snapshot.kind === 'ready' &&
      actor &&
      snapshot.identity.userId === actor.userId
    )
      publish({ ...snapshot, context: context!.getSnapshot() });
  });
  const source: AuthApplicationSource = {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
  function invalidateSession(reason?: 'lifecycle') {
    if (disposed) return;
    // Launching the system browser is expected to hide the app. Other invalidations
    // (logout/cross-tab) still invalidate the attempt and its credential epoch.
    if (
      reason === 'lifecycle' &&
      (googlePending || snapshot.kind === 'oauth-pending' || callbackCount)
    )
      return;
    generation++;
    cancelRestore?.();
    clearActor();
    restorePending = undefined;
    auth.invalidateSession?.();
    publish({ kind: 'resolving' });
  }
  async function restoreAndVerify(): Promise<void> {
    if (disposed || !auth.restoreAndVerify)
      throw new AuthError('provider-unavailable');
    if (cleanupRequired || logoutPending) return;
    if (googlePending || snapshot.kind === 'oauth-pending') return;
    if (loginPending || registerPending || recoveryPending || passwordPending)
      return;
    if (callbackCount) return callback?.result;
    if (restorePending) return restorePending;
    const expectedUserId =
      snapshot.kind === 'ready' ? snapshot.identity.userId : undefined;
    const version = expectedUserId ? generation : ++generation;
    if (!expectedUserId) {
      actor = undefined;
      details = undefined;
      context?.clear();
      publish({ kind: 'resolving' });
    }
    const work = (async () => {
      try {
        const result = await auth.restoreAndVerify!(expectedUserId);
        if (!current(version)) return;
        if (result.kind !== 'authenticated') {
          if (expectedUserId) {
            generation++;
            clearActor();
          }
          publish({ kind: result.kind });
          return;
        }
        const identity = verifiedIdentity(result.identity);
        if (expectedUserId) {
          if (identity.userId !== expectedUserId)
            throw new AuthError('credentials-rejected');
          await revalidateReady(version, identity);
        } else {
          actor = identity;
          await bootstrap(version);
        }
      } catch (error) {
        if (!current(version)) return;
        const failure = authFailure(error);
        if (expectedUserId) {
          generation++;
          clearActor();
          auth.invalidateSession?.();
        }
        if (failure.code === 'credentials-rejected')
          publish({ kind: 'signed-out' });
        else publish({ kind: 'retryable-error', error: failure.code });
      }
    })();
    let cancelDeadline: (() => void) | undefined;
    const deadline = startRestoreDeadline
      ? new Promise<void>((resolve) => {
          const stop = startRestoreDeadline(() => {
            if (current(version)) {
              generation++;
              clearActor();
              auth.invalidateSession?.();
              publish({
                kind: 'retryable-error',
                error: 'network-unavailable',
              });
            }
            resolve();
          });
          cancelDeadline = () => {
            stop();
            resolve();
          };
        })
      : undefined;
    const task = deadline ? Promise.race([work, deadline]) : work;
    restorePending = task;
    cancelRestore = cancelDeadline;
    try {
      await task;
    } finally {
      cancelDeadline?.();
      if (cancelRestore === cancelDeadline) cancelRestore = undefined;
      if (restorePending === task) restorePending = undefined;
    }
  }
  return {
    ...source,
    canUseGoogle: () => googleEnabled && !!auth.signInWithGoogle,
    async signInWithGoogle(): Promise<void> {
      if (disposed || !googleEnabled || !auth.signInWithGoogle)
        throw new AuthError('provider-unavailable');
      if (cleanupRequired || logoutPending)
        throw new AuthError('persistence-failed');
      if (googlePending) return googlePending;
      if (snapshot.kind === 'oauth-pending') return;
      if (actor || !['signed-out', 'retryable-error'].includes(snapshot.kind))
        throw new AuthError('credentials-rejected');
      const version = ++generation;
      details = undefined;
      callback = undefined;
      context?.clear();
      publish({ kind: 'oauth-pending' });
      const task = (async () => {
        try {
          await auth.signInWithGoogle!();
        } catch (error) {
          if (!current(version)) return;
          fail(error, version);
          throw authFailure(error);
        }
      })();
      googlePending = task;
      try {
        await task;
      } finally {
        if (googlePending === task) googlePending = undefined;
      }
    },
    async cancelGoogle(): Promise<void> {
      if (snapshot.kind !== 'oauth-pending' && !googlePending) return;
      await this.signOutCurrent();
    },
    async updateOwnProfile(input: unknown): Promise<void> {
      if (disposed || !profiles.updateOwnProfile)
        throw new AuthError('provider-unavailable');
      if (
        snapshot.kind !== 'ready' ||
        !actor ||
        cleanupRequired ||
        logoutPending
      )
        throw new AuthError('credentials-rejected');
      if (
        !input ||
        typeof input !== 'object' ||
        Array.isArray(input) ||
        Object.keys(input).some(
          (key) => !['displayName', 'phone'].includes(key),
        )
      )
        throw new AuthError('invalid-input');
      const value = profileDetails(input);
      const identity = actor,
        version = generation;
      if (editPending?.version === version) return editPending.result;
      const task = (async () => {
        try {
          const profile = await profiles.updateOwnProfile!(value);
          if (
            !current(version) ||
            snapshot.kind !== 'ready' ||
            actor !== identity
          )
            throw new AuthError('credentials-rejected');
          const verified = readySession(identity, profile, version);
          // Editing personal details never replaces membership/context or navigation.
          publish({ ...snapshot, profile: verified.profile });
        } catch (error) {
          const failure = authFailure(error);
          if (current(version) && failure.code === 'credentials-rejected') {
            generation++;
            actor = undefined;
            details = undefined;
            callback = undefined;
            context?.clear();
            auth.invalidateSession?.();
            publish({ kind: 'signed-out' });
          }
          throw failure;
        }
      })();
      editPending = { version, result: task };
      try {
        await task;
      } finally {
        if (editPending?.result === task) editPending = undefined;
      }
    },
    async requestRecovery(input: unknown): Promise<void> {
      if (googlePending || snapshot.kind === 'oauth-pending')
        throw new AuthError('credentials-rejected');
      if (disposed || !auth.requestRecovery || !recoveryReturnTarget)
        throw new AuthError('provider-unavailable');
      if (cleanupRequired || logoutPending)
        throw new AuthError('persistence-failed');
      const email = recoveryEmail(input);
      if (recoveryPending) return recoveryPending;
      const version = ++generation;
      actor = undefined;
      details = undefined;
      callback = undefined;
      context?.clear();
      publish({ kind: 'resolving' });
      recoveryPending = (async () => {
        try {
          await auth.requestRecovery!(email, recoveryReturnTarget);
          if (current(version)) publish({ kind: 'recovery-sent' });
        } catch (error) {
          fail(error, version);
        }
      })();
      try {
        await recoveryPending;
      } finally {
        recoveryPending = undefined;
      }
    },
    async setRecoveredPassword(input: unknown): Promise<void> {
      if (disposed || !auth.setRecoveredPassword)
        throw new AuthError('provider-unavailable');
      if (passwordPending) return passwordPending;
      if (snapshot.kind !== 'recovery' || cleanupRequired || logoutPending)
        throw new AuthError('link-invalid');
      const password = recoveredPassword(input);
      const version = generation;
      passwordPending = (async () => {
        try {
          await auth.setRecoveredPassword!(password);
          if (!current(version)) return;
          actor = undefined;
          details = undefined;
          callback = undefined;
          context?.clear();
          publish({ kind: 'signed-out' });
        } catch (error) {
          // A network/validation failure leaves the restricted form retryable.
          if (current(version)) publish({ kind: 'recovery' });
          throw authFailure(error);
        }
      })();
      try {
        await passwordPending;
      } finally {
        passwordPending = undefined;
      }
    },
    restoreAndVerify,
    invalidateSession,
    setRefreshActive(active: boolean) {
      if (!disposed) auth.setRefreshActive?.(active);
    },
    async selectContext(id: unknown) {
      if (!context || snapshot.kind !== 'ready' || !actor)
        throw new AuthError('credentials-rejected');
      await context.select(id);
    },
    async refreshContext() {
      if (!context || snapshot.kind !== 'ready' || !actor)
        throw new AuthError('credentials-rejected');
      // Refresh selected metadata without temporarily turning an existing shop
      // into an unknown membership. Revalidation still checks current access.
      if (snapshot.context.kind === 'selected') await context.revalidate(actor);
      else await context.resolve(actor);
    },
    async chooseContext() {
      if (!context || snapshot.kind !== 'ready' || !actor)
        throw new AuthError('credentials-rejected');
      await context.choose();
    },
    async signIn(input: unknown): Promise<void> {
      if (googlePending || snapshot.kind === 'oauth-pending')
        throw new AuthError('credentials-rejected');
      if (disposed || !auth.signIn) throw new AuthError('provider-unavailable');
      if (cleanupRequired) throw new AuthError('persistence-failed');
      if (logoutPending) throw new AuthError('credentials-rejected');
      const value = signInInput(input);
      if (loginPending) return loginPending;
      const version = ++generation;
      actor = undefined;
      context?.clear();
      details = undefined;
      callback = undefined;
      publish({ kind: 'resolving' });
      loginPending = (async () => {
        try {
          const response = await auth.signIn!(value.email, value.password);
          if (!current(version)) return;
          if (response.kind !== 'authenticated')
            throw new AuthError('credentials-rejected');
          actor = verifiedIdentity(response.identity);
          await bootstrap(version);
        } catch (error) {
          fail(error, version);
        }
      })();
      try {
        await loginPending;
      } finally {
        loginPending = undefined;
      }
    },
    async signOutCurrent(): Promise<{
      readonly remoteRevocationConfirmed: boolean;
    }> {
      if (disposed || !auth.signOutCurrent)
        throw new AuthError('provider-unavailable');
      if (logoutPending) return logoutPending;
      const version = ++generation;
      cancelRestore?.();
      restorePending = undefined;
      actor = undefined;
      context?.clear();
      details = undefined;
      callback = undefined;
      cleanupRequired = true;
      publish({ kind: 'resolving' });
      logoutPending = (async () => {
        try {
          const result = await auth.signOutCurrent!();
          if (current(version)) {
            cleanupRequired = false;
            publish({
              kind: 'signed-out',
              logout: result.remoteRevocationConfirmed
                ? 'confirmed'
                : 'local-only',
            });
          }
          return result;
        } catch {
          if (current(version))
            publish({ kind: 'retryable-error', error: 'persistence-failed' });
          throw new AuthError('persistence-failed');
        }
      })();
      try {
        return await logoutPending;
      } finally {
        logoutPending = undefined;
      }
    },
    canRetryProfile: () =>
      !disposed &&
      !!actor &&
      (snapshot.kind === 'profile-required' ||
        snapshot.kind === 'retryable-error'),
    async register(input: unknown): Promise<void> {
      if (googlePending || snapshot.kind === 'oauth-pending')
        throw new AuthError('credentials-rejected');
      if (disposed) throw new AuthError('provider-unavailable');
      if (cleanupRequired || logoutPending)
        throw new AuthError('persistence-failed');
      const value = registrationInput(input);
      if (registerPending) return registerPending;
      const version = ++generation;
      callback = undefined;
      actor = undefined;
      context?.clear();
      details = { displayName: value.displayName, phone: value.phone };
      publish({ kind: 'resolving' });
      registerPending = (async () => {
        try {
          const result = await auth.register(value);
          if (!current(version)) return;
          if (result.kind === 'confirmation-required') {
            publish({ kind: 'confirmation-required' });
            return;
          }
          actor = verifiedIdentity(result.identity);
          await bootstrap(version, details);
        } catch (error) {
          fail(error, version);
        }
      })();
      try {
        await registerPending;
      } finally {
        registerPending = undefined;
      }
    },
    async completeCallback(input: ValidatedCallback): Promise<void> {
      if (disposed) throw new AuthError('provider-unavailable');
      if (cleanupRequired || logoutPending)
        throw new AuthError('persistence-failed');
      if (
        !input ||
        typeof input.code !== 'string' ||
        !input.code.trim() ||
        !['confirmation', 'recovery'].includes(input.purpose)
      )
        throw new AuthError('link-invalid');
      if (
        callback?.code === input.code &&
        callback.purpose === input.purpose &&
        callback.flowId === input.flowId
      )
        return callback.result;
      const version = ++generation;
      actor = undefined;
      context?.clear();
      publish({ kind: 'resolving' });
      callbackCount++;
      const result = (async () => {
        try {
          const response = await auth.completeCallback(input);
          if (!current(version)) return;
          if (response.kind === 'recovery') {
            actor = undefined;
            details = undefined;
            publish({ kind: 'recovery' });
            return;
          }
          if (response.kind !== 'authenticated')
            throw new AuthError('link-invalid');
          actor = verifiedIdentity(response.identity);
          await bootstrap(version, details);
        } catch (error) {
          fail(error, version);
        }
      })();
      callback = {
        code: input.code,
        purpose: input.purpose,
        flowId: input.flowId,
        result,
      };
      try {
        return await result;
      } finally {
        callbackCount--;
      }
    },
    async retryProfile(input?: unknown): Promise<void> {
      if (disposed || !actor || snapshot.kind === 'recovery')
        throw new AuthError('credentials-rejected');
      const value = input === undefined ? details : profileDetails(input);
      if (profilePending) return profilePending;
      details = value;
      const version = generation;
      publish({ kind: 'resolving' });
      profilePending = bootstrap(version, value).catch((error) =>
        fail(error, version),
      );
      try {
        await profilePending;
      } finally {
        profilePending = undefined;
      }
    },
    dispose() {
      disposed = true;
      generation++;
      cancelRestore?.();
      actor = undefined;
      details = undefined;
      callback = undefined;
      listeners.clear();
      offContext?.();
      context?.dispose();
      unsubscribe();
    },
  };
}
