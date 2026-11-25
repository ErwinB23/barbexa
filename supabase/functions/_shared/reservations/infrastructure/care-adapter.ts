import type { CareAtomicGateway } from '../application/care.ts';
import { BusinessError } from '../domain/values.ts';
import { providerError } from './booking-payload.ts';
export function createCareAdapter(
  baseUrl: string,
  serviceKey: string,
  fetcher: typeof fetch = fetch,
): CareAtomicGateway {
  return {
    async execute(actorId, input) {
      try {
        const headers: Record<string, string> = {
          apikey: serviceKey,
          'Content-Type': 'application/json',
        };
        if (!serviceKey.startsWith('sb_secret_'))
          headers.Authorization = 'Bearer ' + serviceKey;
        const response = await fetcher(baseUrl + '/rest/v1/rpc/care_booking', {
          method: 'POST',
          headers,
          body: JSON.stringify({ p_actor_id: actorId, p_data: input }),
          signal: AbortSignal.timeout(8000),
        });
        const value: unknown = await response.json();
        if (!response.ok) throw providerError(value, response.status);
        return value;
      } catch (e) {
        if (e instanceof BusinessError) throw e;
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      }
    },
  };
}
