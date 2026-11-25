import { BusinessError } from '../domain/values.ts';
import type {
  BookingResult,
  BookingDetail,
  VerifiedActor,
} from '../domain/types.ts';
interface Dependencies {
  verifyActor: (token: string) => Promise<VerifiedActor>;
  confirm: (actor: VerifiedActor, input: unknown) => Promise<BookingResult>;
  cancel?: (actor: VerifiedActor, input: unknown) => Promise<BookingDetail>;
  care?: (actor: VerifiedActor, input: unknown) => Promise<unknown>;
  reschedule?: (actor: VerifiedActor, input: unknown) => Promise<BookingResult>;
  rescheduleSlots?: (actor: VerifiedActor, input: unknown) => Promise<unknown>;
  reschedulePolicy?: (actor: VerifiedActor, input: unknown) => Promise<unknown>;
  rescheduleHistory?: (
    actor: VerifiedActor,
    input: unknown,
  ) => Promise<unknown>;
  allowedOrigins: readonly string[];
  log?: (event: { requestId: string; status: number }) => void;
}
export function createReservationHandler(deps: Dependencies) {
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
    const fail = (status: number, code: string, message = code) =>
      reply(status, { error: { code, message }, requestId });
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
      const reader = request.body?.getReader(),
        chunks: Uint8Array[] = [];
      let total = 0;
      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
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
      if (
        !input ||
        typeof input !== 'object' ||
        Array.isArray(input) ||
        !('action' in input) ||
        ![
          'confirm',
          'cancel',
          'care',
          'reschedule',
          'reschedule-slots',
          'reschedule-policy',
          'reschedule-history',
        ].includes(String(input.action))
      )
        throw new BusinessError('INVALID_INPUT');
      const { action: _, ...body } = input;
      void _;
      if (input.action === 'reschedule-policy') {
        if (!deps.reschedulePolicy) throw new BusinessError('INVALID_INPUT');
        return reply(200, await deps.reschedulePolicy(actor, body));
      }
      if (input.action === 'reschedule-history') {
        if (!deps.rescheduleHistory) throw new BusinessError('INVALID_INPUT');
        return reply(200, await deps.rescheduleHistory(actor, body));
      }
      if (input.action === 'reschedule-slots') {
        if (!deps.rescheduleSlots) throw new BusinessError('INVALID_INPUT');
        return reply(200, await deps.rescheduleSlots(actor, body));
      }
      if (input.action === 'reschedule') {
        if (!deps.reschedule) throw new BusinessError('INVALID_INPUT');
        const result = await deps.reschedule(actor, body);
        return reply(result.replayed ? 200 : 201, result.detail);
      }
      if (input.action === 'care') {
        if (!deps.care) throw new BusinessError('INVALID_INPUT');
        return reply(200, await deps.care(actor, body));
      }
      if (input.action === 'cancel') {
        if (!deps.cancel) throw new BusinessError('INVALID_INPUT');
        return reply(200, await deps.cancel(actor, body));
      }
      const result = await deps.confirm(actor, body);
      return reply(result.replayed ? 200 : 201, result.detail);
    } catch (e) {
      const error =
        e instanceof BusinessError
          ? e
          : new BusinessError('DEPENDENCY_UNAVAILABLE');
      const status = {
        INVALID_INPUT: 400,
        UNAUTHENTICATED: 401,
        FORBIDDEN: 403,
        NOT_AVAILABLE: 404,
        PROFILE_REQUIRED: 409,
        CONFLICT: 409,
        DEPENDENCY_UNAVAILABLE: 503,
      }[error.code];
      return fail(
        status,
        error.code,
        error.reason === 'professional-unavailable'
          ? 'Profesional no disponible en ese horario'
          : error.code,
      );
    }
  };
}
