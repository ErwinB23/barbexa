import { FoundationError, type Profile } from '../domain/types.ts';
import { validId } from '../domain/validation.ts';
import type { FoundationProvisioningGateway } from '../application/foundation-provisioning-gateway.ts';
interface Options {
  baseUrl: string;
  serviceKey: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}
export function createPostgresFoundationAdapter({
  baseUrl,
  serviceKey,
  fetcher = fetch,
  timeoutMs = 5000,
}: Options): FoundationProvisioningGateway {
  return {
    async ensureOwnProfile(actor, input) {
      try {
        const headers: Record<string, string> = {
          apikey: serviceKey,
          'Content-Type': 'application/json',
        };
        if (!serviceKey.startsWith('sb_secret_'))
          headers.Authorization = 'Bearer ' + serviceKey;
        const r = await fetcher(baseUrl + '/rest/v1/rpc/ensure_own_profile', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            p_actor_id: actor.userId,
            p_display_name: input.displayName,
            p_phone: input.phone,
          }),
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!r.ok) {
          const codes: Record<
            number,
            'UNAUTHENTICATED' | 'FORBIDDEN' | 'CONFLICT' | 'INVALID_INPUT'
          > = {
            401: 'UNAUTHENTICATED',
            403: 'FORBIDDEN',
            409: 'CONFLICT',
            400: 'INVALID_INPUT',
          };
          throw new FoundationError(
            codes[r.status] ?? 'DEPENDENCY_UNAVAILABLE',
          );
        }
        const rows: unknown = await r.json();
        if (!Array.isArray(rows) || rows.length !== 1)
          throw new FoundationError('DEPENDENCY_UNAVAILABLE');
        const row: unknown = rows[0];
        if (
          typeof row !== 'object' ||
          row === null ||
          !('id' in row) ||
          !validId(row.id) ||
          row.id !== actor.userId ||
          !('display_name' in row) ||
          typeof row.display_name !== 'string' ||
          !row.display_name.trim() ||
          !('phone' in row) ||
          (row.phone !== null && typeof row.phone !== 'string')
        )
          throw new FoundationError('DEPENDENCY_UNAVAILABLE');
        const profile: Profile = {
          userId: row.id,
          displayName: row.display_name,
          phone: row.phone,
        };
        return profile;
      } catch (e) {
        if (e instanceof FoundationError) throw e;
        throw new FoundationError('DEPENDENCY_UNAVAILABLE');
      }
    },
  };
}
