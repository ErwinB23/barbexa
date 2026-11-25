import { AuthError } from '../domain/auth-error';
export const googleCheckProject = 'vuoncrtkkkquvddunrxx';
export const googleCheckOrigin = 'https://vuoncrtkkkquvddunrxx.supabase.co';
export const googleCheckNamespace = {
  environment: 'google-auth-check',
  project: googleCheckProject,
} as const;
export interface GoogleCheckActivation {
  readonly version: 1;
  readonly publicKey: string;
  readonly phase: 'active' | 'pending' | 'retired';
}
export function googleCheckActivation(raw: string): GoogleCheckActivation {
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !value ||
      typeof value !== 'object' ||
      Object.keys(value).length !== 3 ||
      !('version' in value) ||
      value.version !== 1 ||
      !('phase' in value) ||
      !['active', 'pending', 'retired'].includes(String(value.phase)) ||
      !('publicKey' in value) ||
      typeof value.publicKey !== 'string' ||
      !/^sb_publishable_[A-Za-z0-9_-]{16,200}$/.test(value.publicKey)
    )
      throw Error();
    return {
      version: 1,
      publicKey: value.publicKey,
      phase: value.phase as GoogleCheckActivation['phase'],
    };
  } catch {
    throw new AuthError('persistence-failed');
  }
}
export function createCloudAuthFetch(
  fetcher: typeof fetch = fetch,
): typeof fetch {
  return async (input, init) => {
    const raw =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const url = new URL(raw),
      method = (
        init?.method ??
        (typeof input === 'object' && 'method' in input ? input.method : 'GET')
      ).toUpperCase();
    const methods: Record<string, readonly string[]> = {
      '/auth/v1/settings': ['GET'],
      '/auth/v1/user': ['GET'],
      '/auth/v1/token': ['POST'],
      '/auth/v1/logout': ['POST'],
    };
    if (
      url.origin !== googleCheckOrigin ||
      url.username ||
      url.password ||
      url.hash ||
      !methods[url.pathname]?.includes(method)
    )
      throw new AuthError('provider-unavailable');
    return fetcher(input, { ...init, redirect: 'error' });
  };
}
export function cloudAuthCheckConfig(
  publicKey: string,
  platform: string,
  development: boolean,
) {
  if (
    !development ||
    !['web', 'android'].includes(platform) ||
    !/^sb_publishable_[A-Za-z0-9_-]{16,200}$/.test(publicKey)
  )
    throw new AuthError('invalid-input');
  return {
    baseUrl: googleCheckOrigin,
    publicKey,
    ...googleCheckNamespace,
    storageKey: 'auth-google-check-vuoncrtkkkquvddunrxx',
    callbackUrl:
      platform === 'web'
        ? 'http://localhost:8081/auth/callback'
        : 'appbarberia://auth/callback',
    recoveryUrl:
      platform === 'web'
        ? 'http://localhost:8081/auth/reset-password'
        : 'appbarberia://auth/reset-password',
  };
}
