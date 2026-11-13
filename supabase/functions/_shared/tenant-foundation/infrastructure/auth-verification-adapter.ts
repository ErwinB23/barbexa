import { FoundationError, type VerifiedActor } from '../domain/types.ts';
import { validId } from '../domain/validation.ts';
interface Options {
  baseUrl: string;
  publicKey: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}
export function createAuthVerificationAdapter({
  baseUrl,
  publicKey,
  fetcher = fetch,
  timeoutMs = 5000,
}: Options) {
  return async (token: string): Promise<VerifiedActor> => {
    if (!token || /\s/.test(token))
      throw new FoundationError('UNAUTHENTICATED');
    try {
      const response = await fetcher(baseUrl + '/auth/v1/user', {
        headers: { apikey: publicKey, Authorization: 'Bearer ' + token },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.status === 401 || response.status === 403)
        throw new FoundationError('UNAUTHENTICATED');
      if (!response.ok) throw new FoundationError('DEPENDENCY_UNAVAILABLE');
      const user: unknown = await response.json();
      if (
        typeof user !== 'object' ||
        user === null ||
        !('id' in user) ||
        !validId(user.id) ||
        !('is_anonymous' in user) ||
        user.is_anonymous !== false
      )
        throw new FoundationError('UNAUTHENTICATED');
      return { userId: user.id };
    } catch (e) {
      if (e instanceof FoundationError) throw e;
      throw new FoundationError('DEPENDENCY_UNAVAILABLE');
    }
  };
}
