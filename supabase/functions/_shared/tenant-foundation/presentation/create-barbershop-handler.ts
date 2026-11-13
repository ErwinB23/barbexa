import {
  FoundationError,
  type VerifiedActor,
  type CreatedBarbershop,
} from '../domain/types.ts';
import { barbershopInput } from '../domain/barbershop-validation.ts';
interface Dependencies {
  verifyActor: (token: string) => Promise<VerifiedActor>;
  createOwnBarbershop: (
    actor: VerifiedActor,
    input: unknown,
  ) => Promise<CreatedBarbershop>;
  allowedOrigins?: readonly string[];
  log?: (event: { requestId: string; status: number }) => void;
}
export function createBarbershopHandler(deps: Dependencies) {
  return async (request: Request): Promise<Response> => {
    const requestId = crypto.randomUUID();
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-Request-Id': requestId,
      Vary: 'Origin',
    });
    const reply = (status: number, body: unknown) => {
      deps.log?.({ requestId, status });
      return new Response(status === 204 ? null : JSON.stringify(body), {
        status,
        headers,
      });
    };
    const error = (status: number, code: string) =>
      reply(status, { error: { code, message: code }, requestId });
    const origin = request.headers.get('Origin');
    if (origin) {
      if (!deps.allowedOrigins?.includes(origin))
        return error(403, 'FORBIDDEN');
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set(
        'Access-Control-Allow-Headers',
        'authorization,apikey,content-type',
      );
      headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    }
    if (request.method === 'OPTIONS') return reply(204, null);
    if (request.method !== 'POST') {
      headers.set('Allow', 'POST, OPTIONS');
      return error(405, 'METHOD_NOT_ALLOWED');
    }
    const token = /^Bearer ([^\s]+)$/i.exec(
      request.headers.get('Authorization') ?? '',
    )?.[1];
    if (!token) return error(401, 'UNAUTHENTICATED');
    try {
      const actor = await deps.verifyActor(token);
      const reader = request.body?.getReader();
      let total = 0;
      const chunks: Uint8Array[] = [];
      if (reader) {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            total += value.length;
            if (total > 8192) {
              await reader.cancel();
              return error(413, 'PAYLOAD_TOO_LARGE');
            }
            chunks.push(value);
          }
        } finally {
          reader.releaseLock();
        }
      }
      const bytes = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(
          new TextDecoder('utf-8', { fatal: true }).decode(bytes),
        );
      } catch {
        throw new FoundationError('INVALID_INPUT');
      }
      const input = barbershopInput(parsed);
      const result = await deps.createOwnBarbershop(actor, input);
      return reply(201, result);
    } catch (e) {
      const code = e instanceof FoundationError ? e.code : 'INTERNAL_ERROR';
      const status: Record<string, number> = {
        INVALID_INPUT: 400,
        UNAUTHENTICATED: 401,
        FORBIDDEN: 403,
        PROFILE_REQUIRED: 409,
        CONFLICT: 409,
        DEPENDENCY_UNAVAILABLE: 503,
      };
      return error(status[code] ?? 500, code);
    }
  };
}
