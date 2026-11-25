import { BusinessError } from '../domain/values.ts';
import type { VerifiedActor } from '../domain/types.ts';
import {
  parseOperation,
  type OperationCommand,
} from '../application/operation.ts';
interface Dependencies {
  verifyActor: (token: string) => Promise<VerifiedActor>;
  execute: (
    actor: VerifiedActor,
    command: OperationCommand,
  ) => Promise<unknown>;
  allowedOrigins: readonly string[];
  log?: (event: { requestId: string; status: number }) => void;
}
export function createOperationHandler(deps: Dependencies) {
  return async (request: Request): Promise<Response> => {
    const requestId = crypto.randomUUID(),
      headers = new Headers({
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
        Vary: 'Origin',
        'Cache-Control': 'no-store',
      });
    const reply = (status: number, value: unknown) => {
      deps.log?.({ requestId, status });
      return new Response(status === 204 ? null : JSON.stringify(value), {
        status,
        headers,
      });
    };
    const fail = (status: number, code: string) =>
      reply(status, { error: { code, message: code }, requestId });
    const origin = request.headers.get('Origin');
    if (origin) {
      if (!deps.allowedOrigins.includes(origin)) return fail(403, 'FORBIDDEN');
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set(
        'Access-Control-Allow-Headers',
        'authorization,apikey,content-type',
      );
      headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    }
    if (request.method === 'OPTIONS') return reply(204, null);
    if (request.method !== 'POST') return fail(405, 'METHOD_NOT_ALLOWED');
    const token = /^Bearer ([^\s]+)$/i.exec(
      request.headers.get('Authorization') ?? '',
    )?.[1];
    if (!token) return fail(401, 'UNAUTHENTICATED');
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
              return fail(413, 'PAYLOAD_TOO_LARGE');
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
      let input: unknown;
      try {
        input = JSON.parse(
          new TextDecoder('utf-8', { fatal: true }).decode(bytes),
        );
      } catch {
        throw new BusinessError('INVALID_INPUT');
      }
      const command = parseOperation(input),
        result = await deps.execute(actor, command);
      return reply(200, result ?? { ok: true });
    } catch (e) {
      const code = e instanceof BusinessError ? e.code : 'INTERNAL_ERROR';
      const status: Record<string, number> = {
        INVALID_INPUT: 400,
        UNAUTHENTICATED: 401,
        FORBIDDEN: 403,
        NOT_AVAILABLE: 404,
        PROFILE_REQUIRED: 409,
        CONFLICT: 409,
        DEPENDENCY_UNAVAILABLE: 503,
      };
      return fail(status[code] ?? 500, code);
    }
  };
}
