import { AuthError } from '../domain/auth-error';

// Open only the URL returned by our SDK for our configured Auth server, never an
// arbitrary redirect/provider token from a callback or user-supplied parameter.
export function googleAuthorizationUrl(
  raw: unknown,
  baseUrl: string,
  redirect: string,
): string {
  try {
    if (typeof raw !== 'string') throw Error();
    const url = new URL(raw),
      expected = new URL('/auth/v1/authorize', baseUrl);
    if (
      url.origin !== expected.origin ||
      url.pathname !== expected.pathname ||
      url.username ||
      url.password ||
      url.hash ||
      [
        'provider',
        'redirect_to',
        'code_challenge',
        'code_challenge_method',
      ].some((key) => url.searchParams.getAll(key).length !== 1) ||
      url.searchParams.get('provider') !== 'google' ||
      url.searchParams.get('redirect_to') !== redirect ||
      url.searchParams.get('code_challenge_method') !== 's256' ||
      !/^[A-Za-z0-9_-]{43}$/.test(
        url.searchParams.get('code_challenge') ?? '',
      ) ||
      [...url.searchParams.keys()].some(
        (key) =>
          ![
            'provider',
            'redirect_to',
            'code_challenge',
            'code_challenge_method',
            'prompt',
          ].includes(key),
      )
    )
      throw Error();
    return url.href;
  } catch {
    throw new AuthError('provider-unavailable');
  }
}
