import { createRescheduleOperation } from '../../../supabase/functions/_shared/reservations/application/reschedule.ts';
import { createReservationHandler } from '../../../supabase/functions/_shared/reservations/presentation/reservation-handler.ts';
import { BusinessError } from '../../../supabase/functions/_shared/reservations/domain/values.ts';
import type { BookingResult } from '../../../supabase/functions/_shared/reservations/domain/types.ts';
import { createRescheduleAdapter } from '../../../supabase/functions/_shared/reservations/infrastructure/reschedule-adapter.ts';
const id = '11111111-1111-4111-8111-111111111111';
const input = {
  requestId: id,
  reservationId: id,
  expectedStartsAt: '2026-12-01T15:00:00.000Z',
  startsAt: '2026-12-02T15:00:00.000Z',
};
Deno.test(
  'reschedule management accepts policy changes only through verified actor and closed values',
  async () => {
    const operations = createRescheduleOperation(
      {
        reschedule: async () => ({}) as BookingResult,
        listRescheduleSlots: async () => [],
      },
      {
        getReschedulePolicy: async (actor, shop) => {
          if (actor.userId !== id || shop !== id) throw Error('identity');
          return { barbershopId: shop, advanceMin: 120 };
        },
        setReschedulePolicy: async (_actor, value) => value,
        listRescheduleHistory: async () => [],
      },
    );
    if (
      (await operations.policy({ userId: id }, { barbershopId: id }))
        .advanceMin !== 120
    )
      throw Error('read');
    await rejects(
      () =>
        operations.policy({ userId: id }, { barbershopId: id, advanceMin: -1 }),
      'INVALID_INPUT',
    );
    await rejects(
      () => operations.policy(null, { barbershopId: id, advanceMin: 30 }),
      'UNAUTHENTICATED',
    );
    await rejects(
      () =>
        operations.history({ userId: id }, { reservationId: id, userId: id }),
      'INVALID_INPUT',
    );
  },
);
Deno.test(
  'reschedule persistence uses fixed RPC and verified actor, never caller identity',
  async () => {
    const sent: { url: string; body: unknown }[] = [];
    const adapter = createRescheduleAdapter({
      baseUrl: 'http://local',
      serviceKey: 'sb_secret_fixture',
      fetcher: async (url, init) => {
        sent.push({ url: String(url), body: JSON.parse(String(init?.body)) });
        return Response.json([]);
      },
    });
    await adapter.listRescheduleSlots(
      { userId: id },
      { reservationId: id, localDate: '2026-12-02' },
    );
    if (
      !sent[0].url.endsWith('/rpc/list_reschedule_slots') ||
      JSON.stringify(sent[0].body) !==
        JSON.stringify({
          p_actor_id: id,
          p_data: { reservationId: id, localDate: '2026-12-02' },
        })
    )
      throw Error('projection');
  },
);
async function rejects(work: () => Promise<unknown>, code: string) {
  try {
    await work();
  } catch (e) {
    if (e instanceof BusinessError && e.code === code) return;
    throw Error('unexpected error');
  }
  throw Error('expected denial');
}
Deno.test(
  'reschedule separates verified actor and rejects forged tenant and financial attributes',
  async () => {
    let calls = 0;
    const ops = createRescheduleOperation({
      reschedule: async (actor, value) => {
        calls++;
        if (actor.userId !== id || value.reservationId !== id)
          throw Error('identity');
        return {} as BookingResult;
      },
      listRescheduleSlots: async () => [],
    });
    await ops.reschedule({ userId: id }, input);
    await rejects(() => ops.reschedule(null, input), 'UNAUTHENTICATED');
    await rejects(
      () => ops.reschedule({ userId: id }, { ...input, userId: id }),
      'INVALID_INPUT',
    );
    await rejects(
      () =>
        ops.slots(
          { userId: id },
          { reservationId: id, localDate: '2026-02-30' },
        ),
      'INVALID_INPUT',
    );
    if (calls !== 1) throw Error('unexpected invocation');
  },
);
Deno.test(
  'reschedule hides provider diagnostics and keeps authorized business denials',
  async () => {
    for (const error of [
      new BusinessError('FORBIDDEN'),
      Error('private diagnostics'),
    ]) {
      const ops = createRescheduleOperation({
        reschedule: async () => {
          throw error;
        },
        listRescheduleSlots: async () => {
          throw error;
        },
      });
      await rejects(
        () => ops.reschedule({ userId: id }, input),
        error instanceof BusinessError ? 'FORBIDDEN' : 'DEPENDENCY_UNAVAILABLE',
      );
    }
  },
);
Deno.test(
  'reschedule handler gates unconfigured capability, JWT and Origin',
  async () => {
    let count = 0;
    const handler = createReservationHandler({
      verifyActor: async () => ({ userId: id }),
      confirm: async () => {
        throw Error('wrong branch');
      },
      reschedule: async () => {
        count++;
        return { detail: {} as BookingResult['detail'], replayed: true };
      },
      rescheduleSlots: async () => [],
      allowedOrigins: ['http://localhost:8081'],
    });
    const req = (action: string, headers: Record<string, string>) =>
      new Request('http://local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ action, ...input }),
      });
    if ((await handler(req('reschedule', {}))).status !== 401)
      throw Error('missing JWT');
    if (
      (
        await handler(
          req('reschedule', {
            Authorization: 'Bearer synthetic',
            Origin: 'http://untrusted.local',
          }),
        )
      ).status !== 403
    )
      throw Error('Origin');
    if (
      (await handler(req('reschedule', { Authorization: 'Bearer synthetic' })))
        .status !== 200 ||
      count !== 1
    )
      throw Error('dispatch');
    const disabled = createReservationHandler({
      verifyActor: async () => ({ userId: id }),
      confirm: async () => {
        throw Error('wrong branch');
      },
      allowedOrigins: [],
    });
    if (
      (await disabled(req('reschedule', { Authorization: 'Bearer synthetic' })))
        .status !== 400
    )
      throw Error('capability');
  },
);
