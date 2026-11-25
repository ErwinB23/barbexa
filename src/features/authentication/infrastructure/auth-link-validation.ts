import type { ValidatedCallback } from '../application/auth-gateway';
import { AuthError } from '../domain/auth-error';

export interface AuthLinkConfig {
  readonly callbackUrl: string;
  readonly recoveryUrl: string;
}
export function validateAuthTargets(
  config: AuthLinkConfig,
  platform: 'web' | 'native',
) {
  try {
    const targets = [new URL(config.callbackUrl), new URL(config.recoveryUrl)];
    targets.forEach((url, index) => {
      if (
        url.username ||
        url.password ||
        url.search ||
        url.hash ||
        (url.pathname !== (index ? '/auth/reset-password' : '/auth/callback') &&
          platform === 'web')
      )
        throw Error();
      if (platform === 'web') {
        if (!(
          url.protocol === 'https:' ||
          (url.protocol === 'http:' &&
            ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
        ))
          throw Error();
      } else if (
        url.protocol !== 'appbarberia:' ||
        url.hostname !== 'auth' ||
        url.port ||
        url.pathname !== (index ? '/reset-password' : '/callback')
      )
        throw Error();
    });
    if (targets[0].origin !== targets[1].origin) throw Error();
    return targets;
  } catch {
    throw new AuthError('link-invalid');
  }
}
export function parseConfiguredAuthLink(
  raw: string,
  config: AuthLinkConfig,
  platform: 'web' | 'native',
): ValidatedCallback {
  const targets = validateAuthTargets(config, platform);
  try {
    const url = new URL(raw);
    const index = targets.findIndex(
      (target) =>
        target.protocol === url.protocol &&
        target.host === url.host &&
        target.pathname === url.pathname,
    );
    if (
      index >= 0 &&
      !url.username &&
      !url.password &&
      !url.hash &&
      !url.searchParams.has('code') &&
      url.searchParams.getAll('error').length === 1 &&
      url.searchParams.get('error') === 'access_denied' &&
      [...url.searchParams.keys()].every((key) =>
        ['error', 'error_code', 'error_description'].includes(key),
      )
    )
      throw new AuthError('oauth-cancelled');
    if (
      index < 0 ||
      url.username ||
      url.password ||
      url.hash ||
      url.searchParams.getAll('code').length !== 1 ||
      [...url.searchParams.keys()].some(
        (key) => !['code', 'sb_flow_id'].includes(key),
      ) ||
      url.searchParams.getAll('sb_flow_id').length > 1
    )
      throw Error();
    const code = url.searchParams.get('code');
    if (!code?.trim()) throw Error();
    const flowId = url.searchParams.get('sb_flow_id');
    if (flowId !== null && !/^[a-zA-Z0-9_-]{1,128}$/.test(flowId))
      throw Error();
    return Object.freeze({
      code,
      purpose: index === 0 ? 'confirmation' : 'recovery',
      ...(flowId ? { flowId } : {}),
    });
  } catch (error) {
    if (error instanceof AuthError && error.code === 'oauth-cancelled')
      throw error;
    throw new AuthError('link-invalid');
  }
}
