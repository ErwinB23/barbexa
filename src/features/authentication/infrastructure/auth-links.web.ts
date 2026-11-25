import {
  parseConfiguredAuthLink,
  validateAuthTargets,
  type AuthLinkConfig,
} from './auth-link-validation';
export function parseAuthLink(raw: string, config: AuthLinkConfig) {
  return parseConfiguredAuthLink(raw, config, 'web');
}
// Presentation supplies the current href and history.replaceState adapter in T013.
// No URL, code or provider error is published to React or persisted here.
export function captureAuthLink(
  raw: string,
  config: AuthLinkConfig,
  replace: (path: string) => void,
) {
  const targets = validateAuthTargets(config, 'web');
  try {
    return parseAuthLink(raw, config);
  } finally {
    let path = targets[0].pathname;
    try {
      const url = new URL(raw);
      if (
        targets.some(
          (t) => t.origin === url.origin && t.pathname === url.pathname,
        )
      )
        path = url.pathname;
    } catch {
      /* Safe configured relative path only. */
    }
    replace(path);
  }
}
