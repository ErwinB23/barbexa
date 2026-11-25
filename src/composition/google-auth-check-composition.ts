import { Platform } from 'react-native';
import { createPlatformStorage, prepareSdkRuntime } from './auth-platform';
import {
  createSessionStorage,
  type SessionStorage,
} from '../features/authentication/infrastructure/session-storage-core';
import { createSupabaseAuthAdapter } from '../features/authentication/infrastructure/supabase-auth-adapter';
import { createGoogleAuthCheck } from '../features/authentication/application/google-auth-check';
import { AuthError } from '../features/authentication/domain/auth-error';
import type { AuthReturnFence } from '../features/authentication/application/auth-return-fence';
import {
  cloudAuthCheckConfig,
  createCloudAuthFetch,
  googleCheckActivation,
  googleCheckNamespace,
  type GoogleCheckActivation,
} from '../features/authentication/infrastructure/cloud-auth-check';
import { captureAuthLink } from '../features/authentication/infrastructure/auth-links.web';
import { parseAuthLink } from '../features/authentication/infrastructure/auth-links.native';
import { openOAuthUrl } from './oauth-browser';

export interface GoogleCheckProfile {
  readonly kind: 'loading' | 'local' | 'setup' | 'active' | 'failed';
  readonly activation?: GoogleCheckActivation;
}
// A route change must not replace the running SDK or its PKCE consumer.
export function resolveGoogleCheckProfile(
  previous: GoogleCheckProfile,
  value: GoogleCheckActivation | null,
  path: string,
): GoogleCheckProfile {
  const test = path === '/auth/google-test',
    callback = path === '/auth/callback';
  if (value && (value.phase !== 'retired' || test || callback)) {
    if (
      previous.kind === 'active' &&
      previous.activation?.publicKey === value.publicKey
    )
      return previous;
    return { kind: 'active', activation: value };
  }
  if (previous.kind === 'local' && !test) return previous;
  return { kind: test ? 'setup' : 'local' };
}

export function createGoogleCheckActivationStore(storage?: SessionStorage) {
  if (!__DEV__) throw new AuthError('provider-unavailable');
  const namespace = {
    ...googleCheckNamespace,
    environment: 'google-auth-activation',
  };
  const driver =
    storage ??
    (Platform.OS === 'web'
      ? createSessionStorage(namespace, {
          getItem: async (key) => window.sessionStorage.getItem(key),
          setItem: async (key, value) =>
            window.sessionStorage.setItem(key, value),
          removeItem: async (key) => window.sessionStorage.removeItem(key),
        })
      : createPlatformStorage(namespace));
  const store = {
    async read() {
      const raw = await driver.getItem('selection');
      return raw === null ? null : googleCheckActivation(raw);
    },
    async write(value: GoogleCheckActivation) {
      const raw = JSON.stringify(value);
      googleCheckActivation(raw);
      await driver.setItem('selection', raw);
    },
    async clearRetired() {
      const value = await store.read();
      if (value && value.phase !== 'retired')
        throw new AuthError('provider-unavailable');
      if (value) await driver.removeItem('selection');
    },
  };
  const fence: AuthReturnFence = {
    allow: async () => !(await store.read()),
    localFlowStarted: () => store.clearRetired(),
  };
  return { ...store, fence };
}
export type GoogleCheckActivationStore = ReturnType<
  typeof createGoogleCheckActivationStore
>;
export async function verifyCloudGoogleConfiguration(key: string) {
  const config = cloudAuthCheckConfig(key, Platform.OS, __DEV__);
  const response = await createCloudAuthFetch()(
    config.baseUrl + '/auth/v1/settings',
    {
      headers: { apikey: config.publicKey },
      signal: AbortSignal.timeout(8000),
    },
  );
  const data: unknown = await response.json();
  if (
    !response.ok ||
    !data ||
    typeof data !== 'object' ||
    !('external' in data) ||
    !data.external ||
    typeof data.external !== 'object' ||
    !('google' in data.external) ||
    data.external.google !== true
  )
    throw new AuthError('provider-unavailable');
  return config;
}
export function createCloudGoogleCheck(activation: GoogleCheckActivation) {
  const config = cloudAuthCheckConfig(
    activation.publicKey,
    Platform.OS,
    __DEV__,
  );
  if (
    Platform.OS === 'web' &&
    window.location.origin !== 'http://localhost:8081'
  )
    throw new AuthError('invalid-input');
  prepareSdkRuntime();
  const auth = createSupabaseAuthAdapter({
    ...config,
    googleEnabled: true,
    openOAuthUrl,
    confirmationRedirectUrl: config.callbackUrl,
    recoveryRedirectUrl: config.recoveryUrl,
    authFetch: createCloudAuthFetch(),
    storage: createPlatformStorage(config),
  });
  const application = createGoogleAuthCheck(
    auth,
    activation.phase === 'pending',
  );
  let active = true;
  return {
    application,
    setRefreshActive: auth.setRefreshActive,
    async acceptRaw(raw: string) {
      if (!active) return false;
      const url = new URL(raw),
        target = new URL(config.callbackUrl);
      if (
        url.protocol !== target.protocol ||
        url.host !== target.host ||
        url.pathname !== target.pathname ||
        (!url.search && !url.hash)
      )
        return false;
      try {
        const input =
          Platform.OS === 'web'
            ? captureAuthLink(raw, config, (path) =>
                window.history.replaceState(window.history.state, '', path),
              )
            : parseAuthLink(raw, config);
        await application.accept(input);
      } catch (e) {
        application.reportFailure(
          e instanceof AuthError ? e.code : 'link-invalid',
        );
      }
      return true;
    },
    dispose() {
      active = false;
      application.dispose();
      auth.dispose();
    },
  };
}
