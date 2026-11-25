import type { TeamAuthorityPersistence } from '../application/team-authority.ts';
import { BusinessError, type BusinessErrorCode } from '../domain/values.ts';
export function createTeamAuthorityPersistence(options: {
  baseUrl: string;
  serviceKey: string;
  fetcher?: typeof fetch;
}): TeamAuthorityPersistence {
  return {
    async execute(actor, command) {
      const { action, ...data } = command;
      const headers: Record<string, string> = {
        apikey: options.serviceKey,
        'Content-Type': 'application/json',
      };
      if (!options.serviceKey.startsWith('sb_secret_'))
        headers.Authorization = 'Bearer ' + options.serviceKey;
      try {
        const r = await (options.fetcher ?? fetch)(
          options.baseUrl + '/rest/v1/rpc/team_authority_command',
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              p_actor_id: actor.userId,
              p_action: action,
              p_data: data,
            }),
            signal: AbortSignal.timeout(10000),
          },
        );
        if (!r.ok) {
          const e = (await r.json()) as { message?: unknown };
          const code = (
            [
              'FORBIDDEN',
              'UNAUTHENTICATED',
              'NOT_AVAILABLE',
              'CONFLICT',
              'INVALID_INPUT',
              'PROFILE_REQUIRED',
            ] as BusinessErrorCode[]
          ).find((c) => e.message === c);
          throw new BusinessError(code ?? 'DEPENDENCY_UNAVAILABLE');
        }
        return await r.json();
      } catch (e) {
        if (e instanceof BusinessError) throw e;
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      }
    },
  };
}
