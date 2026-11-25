import { AuthError } from '../domain/auth-error';

// One transport for the integrated runtime. No cross-project redirects, LOCAL
// fallbacks or tokens sent to Storage/other services through this Auth/business SDK.
export function createPinnedProjectFetch(
  baseUrl: string,
  fetcher: typeof fetch = fetch,
  localTeamDevelopment = false,
): typeof fetch {
  const target = new URL(baseUrl);
  if (
    (target.protocol !== 'https:' &&
      !(localTeamDevelopment && baseUrl === 'http://127.0.0.1:54421')) ||
    target.username ||
    target.password ||
    target.pathname !== '/' ||
    target.search ||
    target.hash
  )
    throw new AuthError('invalid-input');
  return async (input, init) => {
    const url = new URL(
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url,
    );
    if (
      url.origin !== target.origin ||
      url.username ||
      url.password ||
      url.hash ||
      !['/auth/v1/', '/rest/v1/', '/functions/v1/'].some((prefix) =>
        url.pathname.startsWith(prefix),
      )
    )
      throw new AuthError('provider-unavailable');
    return fetcher(input, { ...init, redirect: 'error' });
  };
}
