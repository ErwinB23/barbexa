import { createClient } from '@supabase/supabase-js';
import type { SupabaseClientOptions } from '@supabase/supabase-js';

import type {
  AuthEvent,
  AuthGateway,
  AuthResolution,
  RegistrationInput,
  ValidatedCallback,
} from '../application/auth-gateway';
import {
  registrationInput,
  signInInput,
  recoveryEmail,
  recoveredPassword,
} from '../application/auth-actions';
import { AuthError } from '../domain/auth-error';
import { verifiedIdentity } from '../domain/identity';
import { validateAuthTargets } from './auth-link-validation';
import type { SessionStorage } from './session-storage-core';
import { googleAuthorizationUrl } from './google-authorization-url';
import { readAuthSessionBinding } from './auth-session-binding';

export interface AuthAdapterOptions {
  readonly authFetch?: typeof fetch;
  readonly googleEnabled?: boolean;
  readonly openOAuthUrl?: (url: string) => Promise<void>;
  readonly baseUrl: string;
  readonly publicKey: string;
  readonly storage: SessionStorage;
  readonly storageKey: string;
  readonly clientFactory?: typeof createClient;
  readonly developmentHttpOrigin?: string;
  readonly confirmationRedirectUrl?: string;
  readonly recoveryRedirectUrl?: string;
}

export function validateAuthTarget(
  baseUrl: string,
  publicKey: string,
  developmentHttpOrigin?: string,
): void {
  try {
    const url = new URL(baseUrl);
    const octets = url.hostname.split('.').map(Number);
    const privateAddress =
      octets.length === 4 &&
      octets.every((n) => Number.isInteger(n) && n >= 0 && n <= 255) &&
      (octets[0] === 10 ||
        (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
        (octets[0] === 192 && octets[1] === 168));
    const developmentHttp =
      typeof __DEV__ !== 'undefined' &&
      __DEV__ &&
      privateAddress &&
      url.port === '54421' &&
      url.origin === developmentHttpOrigin;
    const validKey =
      publicKey.startsWith('sb_publishable_') ||
      (() => {
        const claim = JSON.parse(
          atob(publicKey.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
        );
        return claim.role === 'anon';
      })();
    if (
      !validKey ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== '/' ||
      !(
        url.protocol === 'https:' ||
        (url.protocol === 'http:' &&
          (['127.0.0.1', '[::1]'].includes(url.hostname) || developmentHttp))
      )
    )
      throw new Error();
  } catch {
    throw new AuthError('invalid-input');
  }
}

export function createSupabaseAuthAdapter(options: AuthAdapterOptions) {
  validateAuthTarget(
    options.baseUrl,
    options.publicKey,
    options.developmentHttpOrigin,
  );
  let logoutHttpStatus: number | undefined;
  const config: SupabaseClientOptions<'public'> = {
    global: {
      fetch: async (input, init) => {
        const response = await (options.authFetch ?? fetch)(input, init);
        const url = new URL(
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.href
              : input.url,
        );
        if (
          closing &&
          url.origin === new URL(options.baseUrl).origin &&
          url.pathname === '/auth/v1/logout'
        )
          logoutHttpStatus = response.status;
        return response;
      },
    },
    auth: {
      storage: options.storage,
      storageKey: options.storageKey,
      persistSession: true,
      flowType: 'pkce',
      detectSessionInUrl: false,
      autoRefreshToken: true,
      debug: false,
    },
  };
  const client = (options.clientFactory ?? createClient)(
    options.baseUrl,
    options.publicKey,
    config,
  );
  // auth-js 2.119 owns this channel; it otherwise broadcasts complete SDK sessions.
  // Close only this client's channel. Our Web observer forwards change types only.
  const channel = Object.getOwnPropertyDescriptor(
    client.auth,
    'broadcastChannel',
  );
  if (channel?.value) {
    const value: unknown = channel.value;
    if (
      !channel.writable ||
      typeof value !== 'object' ||
      value === null ||
      !('close' in value) ||
      typeof value.close !== 'function'
    )
      throw new AuthError('provider-unavailable');
    value.close();
    Reflect.set(client.auth, 'broadcastChannel', null);
  }
  const purposeKey = `${options.storageKey}-purpose`;
  const recoveryKey = `${options.storageKey}-recovery`;
  // This is a binding, not an authorization claim: getUser verifies the same
  // stored session with Auth before it can be used. A normal/new session cannot
  // inherit a stale recovery marker belonging to a different session.
  function sessionBinding(token: unknown, userId: string): string {
    const binding = readAuthSessionBinding(token);
    if (binding?.userId !== userId) throw new AuthError('link-invalid');
    return JSON.stringify(binding);
  }
  async function verifyRecoveryBinding() {
    if (disposed || closing || signedOut || cleanupFailed || !recovery)
      throw new AuthError('link-invalid');
    const result = await client.auth.getSession();
    if (result.error) throw result.error;
    const identity = await identityFromProvider();
    const binding = sessionBinding(
      result.data.session?.access_token,
      identity.userId,
    );
    if ((await options.storage.getItem(recoveryKey)) !== binding)
      throw new AuthError('link-invalid');
  }
  async function setPurpose(value: 'pending' | 'normal' | 'recovery') {
    try {
      await options.storage.setItem(purposeKey, value);
    } catch {
      throw new AuthError('persistence-failed');
    }
  }
  const listeners = new Set<(event: AuthEvent) => void>();
  let disposed = false,
    signedOut = false,
    recovery = false;
  let credentialEpoch = 0,
    closing = false,
    cleanupFailed = false;
  const pendingCredentials = new Set<Promise<unknown>>();
  function track<T>(promise: Promise<T>): Promise<T> {
    pendingCredentials.add(promise);
    void promise.then(
      () => pendingCredentials.delete(promise),
      () => pendingCredentials.delete(promise),
    );
    return promise;
  }
  function assertCredential(version: number) {
    if (disposed || closing || version !== credentialEpoch)
      throw new AuthError('credentials-rejected');
  }
  const { data } = client.auth.onAuthStateChange((event) => {
    if (disposed) return;
    if (closing && event === 'SIGNED_IN') return;
    if (event === 'SIGNED_OUT') {
      credentialEpoch++;
      signedOut = true;
      recovery = false;
    }
    if (event === 'SIGNED_IN') signedOut = false;
    if (event === 'PASSWORD_RECOVERY') recovery = true;
    const mapped: AuthEvent = Object.freeze({
      kind:
        event === 'SIGNED_OUT'
          ? 'signed-out'
          : recovery
            ? 'recovery'
            : 'session-changed',
    });
    const recipients = [...listeners];
    queueMicrotask(() => {
      if (disposed) return;
      for (const listener of recipients)
        if (listeners.has(listener)) listener(mapped);
    });
  });
  const subscribe: AuthGateway['subscribe'] = (listener) => {
    if (disposed) throw new AuthError('provider-unavailable');
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  function providerError(error: unknown, callback = false): AuthError {
    if (error instanceof AuthError) return error;
    const value =
      error && typeof error === 'object'
        ? (error as { code?: string; name?: string; status?: number })
        : {};
    if (
      value.name === 'TypeError' ||
      value.name === 'AuthRetryableFetchError' ||
      value.status === 0
    )
      return new AuthError('network-unavailable');
    if (value.status === 429 || value.code?.includes('rate_limit'))
      return new AuthError('rate-limited');
    if (value.code === 'email_not_confirmed')
      return new AuthError('confirmation-required');
    if (
      (!callback &&
        ['invalid_credentials', 'invalid_grant', 'user_banned'].includes(
          value.code ?? '',
        )) ||
      (!callback && [400, 401, 403].includes(value.status ?? 0))
    )
      return new AuthError('credentials-rejected');
    if (
      callback &&
      [
        'flow_state_not_found',
        'flow_state_expired',
        'bad_code_verifier',
        'pkce_verifier_not_found',
        'invalid_grant',
      ].includes(value.code ?? '')
    )
      return new AuthError('link-invalid');
    return new AuthError(callback ? 'link-invalid' : 'provider-unavailable');
  }
  async function identityFromProvider() {
    // A refresh replaces a token for the same actor; only credential invalidation
    // (logout, account change, lifecycle/storage invalidation) cancels this check.
    const version = credentialEpoch;
    const result = await client.auth.getUser();
    if (disposed || closing || version !== credentialEpoch || result.error)
      throw result.error ?? new AuthError('credentials-rejected');
    const user = result.data.user;
    if (!user?.email_confirmed_at || user.is_anonymous !== false)
      throw new AuthError('credentials-rejected');
    const google = user.identities?.find(
      (identity) => identity.provider === 'google',
    );
    const providerName = [
      google?.identity_data?.full_name,
      google?.identity_data?.name,
    ].find((name) => typeof name === 'string' && name.trim());
    return verifiedIdentity({
      userId: user.id,
      email: user.email,
      emailConfirmed: true,
      isAnonymous: false,
      suggestedDisplayName: providerName,
    });
  }
  let lastCallback:
    | {
        code: string;
        purpose: string;
        flowId?: string;
        result: Promise<AuthResolution>;
      }
    | undefined;
  let credentialResolutionBlocked = false;
  let revalidating: { userId: string } | undefined;
  let refreshActive = false;
  const adapter = {
    subscribe,
    async signInWithGoogle(): Promise<void> {
      if (
        disposed ||
        closing ||
        cleanupFailed ||
        !options.googleEnabled ||
        !options.openOAuthUrl
      )
        throw new AuthError('provider-unavailable');
      const redirect = options.confirmationRedirectUrl;
      if (!redirect) throw new AuthError('invalid-input');
      validateAuthTargets(
        {
          callbackUrl: redirect,
          recoveryUrl: redirect.replace(/\/callback$/, '/reset-password'),
        },
        redirect.startsWith('appbarberia:') ? 'native' : 'web',
      );
      const version = ++credentialEpoch;
      credentialResolutionBlocked = true;
      lastCallback = undefined;
      recovery = false;
      try {
        await setPurpose('pending');
        await options.storage.removeItem(recoveryKey);
        assertCredential(version);
        const response = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirect,
            skipBrowserRedirect: true,
            queryParams: { prompt: 'select_account' },
          },
        });
        assertCredential(version);
        if (response.error) throw response.error;
        const url = googleAuthorizationUrl(
          response.data.url,
          options.baseUrl,
          redirect,
        );
        await options.openOAuthUrl(url);
        assertCredential(version);
      } catch (error) {
        throw providerError(error);
      }
    },
    invalidateSession() {
      credentialEpoch++;
      credentialResolutionBlocked = true;
      client.auth.stopAutoRefresh();
    },
    setRefreshActive(active: boolean) {
      if (disposed) return;
      refreshActive = active;
      if (active && !signedOut && !closing && !cleanupFailed)
        client.auth.startAutoRefresh?.();
      else client.auth.stopAutoRefresh();
    },
    async restoreAndVerify(expectedUserId?: string): Promise<AuthResolution> {
      if (disposed || closing || cleanupFailed)
        throw new AuthError('provider-unavailable');
      const background = expectedUserId
        ? { userId: expectedUserId }
        : undefined;
      const version = background ? credentialEpoch : ++credentialEpoch;
      revalidating = background;
      if (!background) credentialResolutionBlocked = true;
      let verified = false;
      try {
        const purpose = await options.storage.getItem(purposeKey);
        assertCredential(version);
        if (purpose === 'recovery') {
          credentialResolutionBlocked = true;
          recovery = true;
          signedOut = false;
          await verifyRecoveryBinding();
          assertCredential(version);
          return { kind: 'recovery' };
        }
        if (purpose !== 'normal') return { kind: 'signed-out' };
        const result = await client.auth.getSession();
        assertCredential(version);
        if (result.error) throw result.error;
        if (!result.data.session) return { kind: 'signed-out' };
        const identity = await identityFromProvider();
        assertCredential(version);
        if (background && identity.userId !== background.userId)
          return { kind: 'signed-out' };
        recovery = false;
        signedOut = false;
        verified = true;
        credentialResolutionBlocked = false;
        if (!background && refreshActive) client.auth.startAutoRefresh?.();
        return { kind: 'authenticated', identity };
      } catch (error) {
        if (disposed || closing || version !== credentialEpoch)
          throw new AuthError('credentials-rejected');
        const failure = providerError(error);
        if (failure.code === 'credentials-rejected')
          return { kind: 'signed-out' };
        throw failure;
      } finally {
        if (!verified && version === credentialEpoch)
          credentialResolutionBlocked = true;
        if (revalidating === background) revalidating = undefined;
      }
    },
    async signIn(email: string, password: string): Promise<AuthResolution> {
      if (disposed || closing) throw new AuthError('credentials-rejected');
      if (cleanupFailed) throw new AuthError('persistence-failed');
      const input = signInInput({ email, password });
      const version = ++credentialEpoch;
      credentialResolutionBlocked = true;
      lastCallback = undefined;
      try {
        await setPurpose('pending');
        assertCredential(version);
        const result = await client.auth.signInWithPassword(input);
        assertCredential(version);
        await setPurpose('normal');
        assertCredential(version);
        if (result.error) throw result.error;
        if (!result.data.session) throw new AuthError('credentials-rejected');
        const identity = await identityFromProvider();
        assertCredential(version);
        signedOut = false;
        recovery = false;
        credentialResolutionBlocked = false;
        client.auth.startAutoRefresh?.();
        return { kind: 'authenticated', identity };
      } catch (error) {
        throw providerError(error);
      }
    },
    async signOutCurrent(): Promise<{
      readonly remoteRevocationConfirmed: boolean;
    }> {
      if (disposed) throw new AuthError('provider-unavailable');
      closing = true;
      signedOut = true;
      credentialResolutionBlocked = true;
      recovery = false;
      cleanupFailed = true;
      credentialEpoch++;
      lastCallback = undefined;
      client.auth.stopAutoRefresh();
      try {
        // Wait for old SDK credential writes, while access and private views are already blocked.
        await Promise.allSettled([...pendingCredentials]);
        const keys = [
          options.storageKey,
          `${options.storageKey}-user`,
          `${options.storageKey}-code-verifier`,
          `${options.storageKey}-flows-code-verifier`,
          purposeKey,
          recoveryKey,
        ];
        const index = await options.storage.getItem(
          `${options.storageKey}-flows-code-verifier`,
        );
        if (index !== null) {
          const ids: unknown = JSON.parse(index);
          if (
            !Array.isArray(ids) ||
            !ids.every(
              (id) =>
                typeof id === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(id),
            )
          )
            throw new AuthError('persistence-failed');
          for (const id of ids)
            keys.push(`${options.storageKey}-flow-${id}-code-verifier`);
        }
        logoutHttpStatus = undefined;
        let providerSucceeded = false;
        try {
          const result = await client.auth.signOut({ scope: 'local' });
          providerSucceeded = !result.error;
        } catch {
          /* The own-key verification below is authoritative for local cleanup. */
        }
        for (const key of keys) {
          if ((await options.storage.getItem(key)) !== null)
            await options.storage.removeItem(key);
          if ((await options.storage.getItem(key)) !== null)
            throw new AuthError('persistence-failed');
        }
        cleanupFailed = false;
        return {
          remoteRevocationConfirmed:
            providerSucceeded &&
            logoutHttpStatus !== undefined &&
            logoutHttpStatus >= 200 &&
            logoutHttpStatus < 300,
        };
      } catch {
        throw new AuthError('persistence-failed');
      } finally {
        closing = false;
      }
    },
    async register(
      input: RegistrationInput,
    ): Promise<Awaited<ReturnType<AuthGateway['register']>>> {
      if (disposed) throw new AuthError('provider-unavailable');
      if (closing) throw new AuthError('credentials-rejected');
      if (cleanupFailed) throw new AuthError('persistence-failed');
      const version = ++credentialEpoch;
      const value = registrationInput(input);
      const redirect = options.confirmationRedirectUrl;
      if (!redirect) throw new AuthError('invalid-input');
      const platform = redirect.startsWith('appbarberia:') ? 'native' : 'web';
      const recoveryUrl = redirect.replace(/\/callback$/, '/reset-password');
      validateAuthTargets({ callbackUrl: redirect, recoveryUrl }, platform);
      credentialResolutionBlocked = true;
      try {
        await setPurpose('pending');
        assertCredential(version);
        const result = await client.auth.signUp({
          email: value.email,
          password: value.password,
          options: {
            emailRedirectTo: redirect,
            data: { display_name: value.displayName, phone: value.phone },
          },
        });
        assertCredential(version);
        if (result.error) {
          if (
            ['user_already_exists', 'email_exists'].includes(
              result.error.code ?? '',
            )
          )
            return { kind: 'confirmation-required' };
          if (result.error.code === 'weak_password')
            throw new AuthError('weak-password');
          throw result.error;
        }
        if (!result.data.session) return { kind: 'confirmation-required' };
        const identity = await identityFromProvider();
        assertCredential(version);
        await setPurpose('normal');
        assertCredential(version);
        signedOut = false;
        recovery = false;
        credentialResolutionBlocked = false;
        return { kind: 'authenticated', identity };
      } catch (error) {
        throw providerError(error);
      }
    },
    async requestRecovery(email: string, returnTarget: string): Promise<void> {
      if (disposed || closing || cleanupFailed)
        throw new AuthError('provider-unavailable');
      const address = recoveryEmail({ email });
      const redirect = options.recoveryRedirectUrl;
      if (
        !redirect ||
        returnTarget !== redirect ||
        !options.confirmationRedirectUrl
      )
        throw new AuthError('invalid-input');
      validateAuthTargets(
        { callbackUrl: options.confirmationRedirectUrl, recoveryUrl: redirect },
        redirect.startsWith('appbarberia:') ? 'native' : 'web',
      );
      const version = ++credentialEpoch;
      credentialResolutionBlocked = true;
      recovery = false;
      lastCallback = undefined;
      try {
        await setPurpose('pending');
        await options.storage.removeItem(recoveryKey);
        assertCredential(version);
        const result = await client.auth.resetPasswordForEmail(address, {
          redirectTo: redirect,
        });
        assertCredential(version);
        if (
          result.error &&
          !['user_not_found', 'email_not_found'].includes(
            result.error.code ?? '',
          )
        )
          throw result.error;
      } catch (error) {
        throw providerError(error);
      }
    },
    async updateRecoveredPassword(password: string): Promise<void> {
      const value = recoveredPassword(password);
      const version = credentialEpoch;
      try {
        await verifyRecoveryBinding();
        assertCredential(version);
        const result = await client.auth.updateUser({ password: value });
        assertCredential(version);
        if (result.error) {
          if (result.error.code === 'weak_password')
            throw new AuthError('weak-password');
          if (result.error.code === 'same_password')
            throw new AuthError('invalid-input');
          throw result.error;
        }
      } catch (error) {
        throw providerError(error);
      }
    },
    async completeCallback(input: ValidatedCallback): Promise<AuthResolution> {
      if (disposed) throw new AuthError('provider-unavailable');
      if (closing) throw new AuthError('credentials-rejected');
      if (cleanupFailed) throw new AuthError('persistence-failed');
      if (
        !input ||
        typeof input.code !== 'string' ||
        !input.code.trim() ||
        !['confirmation', 'recovery'].includes(input.purpose) ||
        (input.flowId !== undefined &&
          !/^[a-zA-Z0-9_-]{1,128}$/.test(input.flowId))
      )
        throw new AuthError('link-invalid');
      if (
        lastCallback?.code === input.code &&
        lastCallback.purpose === input.purpose &&
        lastCallback.flowId === input.flowId
      )
        return lastCallback.result;
      credentialResolutionBlocked = true;
      const version = ++credentialEpoch;
      const result = (async (): Promise<AuthResolution> => {
        try {
          await setPurpose('pending');
          await options.storage.removeItem(recoveryKey);
          assertCredential(version);
          const exchanged = await client.auth.exchangeCodeForSession(
            input.code,
            input.flowId ? { flowId: input.flowId } : undefined,
          );
          if (exchanged.error) throw exchanged.error;
          if (!exchanged.data.session) throw new AuthError('link-invalid');
          const identity = await identityFromProvider();
          assertCredential(version);
          const redirectType =
            'redirectType' in exchanged.data
              ? exchanged.data.redirectType
              : null;
          if (redirectType === 'recovery') {
            if (input.purpose !== 'recovery')
              throw new AuthError('link-invalid');
            recovery = true;
            signedOut = false;
            await options.storage.setItem(
              recoveryKey,
              sessionBinding(
                exchanged.data.session.access_token,
                identity.userId,
              ),
            );
            await setPurpose('recovery');
            assertCredential(version);
            return { kind: 'recovery' };
          }
          if (input.purpose !== 'confirmation') {
            recovery = true;
            throw new AuthError('link-invalid');
          }
          recovery = false;
          await setPurpose('normal');
          assertCredential(version);
          signedOut = false;
          credentialResolutionBlocked = false;
          return { kind: 'authenticated', identity };
        } catch (error) {
          throw providerError(error, true);
        }
      })();
      lastCallback = {
        code: input.code,
        purpose: input.purpose,
        flowId: input.flowId,
        result,
      };
      return result;
    },
    async getAccessToken(): Promise<string | null> {
      if (disposed || signedOut || recovery || credentialResolutionBlocked)
        return null;
      const captured = credentialEpoch;
      const expectedUser = revalidating?.userId;
      let response;
      try {
        response = await client.auth.getSession();
      } catch {
        throw new AuthError('provider-unavailable');
      }
      if (
        disposed ||
        signedOut ||
        recovery ||
        credentialResolutionBlocked ||
        captured !== credentialEpoch
      )
        return null;
      if (response.error) throw new AuthError('provider-unavailable');
      const token = response.data.session?.access_token;
      const scopedUser = expectedUser ?? revalidating?.userId;
      if (scopedUser && readAuthSessionBinding(token)?.userId !== scopedUser)
        return null;
      return typeof token === 'string' &&
        token.length > 0 &&
        !token.startsWith('sb_secret_')
        ? token
        : null;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      lastCallback = undefined;
      listeners.clear();
      data.subscription.unsubscribe();
      client.auth.stopAutoRefresh();
    },
  };
  const { updateRecoveredPassword, ...publicAdapter } = adapter;
  return {
    ...publicAdapter,
    signInWithGoogle: () => track(adapter.signInWithGoogle()),
    signIn: (email: string, password: string) =>
      track(adapter.signIn(email, password)),
    register: (input: RegistrationInput) => track(adapter.register(input)),
    completeCallback: (input: ValidatedCallback) =>
      track(adapter.completeCallback(input)),
    requestRecovery: (email: string, target: string) =>
      track(adapter.requestRecovery(email, target)),
    async setRecoveredPassword(password: string): Promise<void> {
      // Logout must run outside track: it waits for pending credential writes.
      await track(updateRecoveredPassword(password));
      await adapter.signOutCurrent();
    },
  };
}
