import { createOperationHandler } from '../../../supabase/functions/_shared/barbershop-operation/presentation/operation-handler.ts';
import { createPostgresOperationAdapter } from '../../../supabase/functions/_shared/barbershop-operation/infrastructure/postgres-operation-adapter.ts';
import { executeShopClosure } from '../../../supabase/functions/_shared/barbershop-operation/application/shop-closures.ts';
import { parseShopClosure } from '../../../supabase/functions/_shared/barbershop-operation/domain/shop-closure.ts';
import { BusinessError } from '../../../supabase/functions/_shared/barbershop-operation/domain/values.ts';
const id = '00000000-0000-4000-8000-000000000001';
const command = {
  action: 'withdraw-shop-closure',
  barbershopId: id,
  closureId: id,
  requestId: id,
  reason: 'Prueba',
};
const closure = {
  id,
  barbershopId: id,
  startsAt: '2026-11-21T15:00:00Z',
  endsAt: '2026-11-21T16:00:00Z',
  reason: 'Original',
  status: 'withdrawn',
  withdrawal: {
    eventId: id,
    actorUserId: id,
    occurredAt: '2026-11-20T15:00:00Z',
    reason: 'Prueba',
  },
};
function ok(v: unknown) {
  if (!v) throw Error('Assertion');
}
Deno.test(
  'closure Edge envelope preserves 401/403/404, closed command, replay and safe errors',
  async () => {
    let code = '',
      calls = 0;
    const handler = createOperationHandler({
      allowedOrigins: ['http://localhost:8081'],
      verifyActor: async (token) => {
        if (token !== 'fixture') throw new BusinessError('UNAUTHENTICATED');
        return { userId: id };
      },
      execute: async (actor, c) => {
        calls++;
        ok(actor.userId === id);
        if (code) throw new BusinessError(code as 'FORBIDDEN');
        return executeShopClosure(
          {
            listShopClosures: async () => ({
              barbershopId: id,
              closures: [closure],
              nextCursor: null,
            }),
            withdrawShopClosure: async () => ({ closure, replayed: true }),
          },
          actor,
          parseShopClosure(c),
        );
      },
    });
    async function send(token = 'fixture', body: unknown = command) {
      return handler(
        new Request('http://local.invalid', {
          method: 'POST',
          headers: {
            Origin: 'http://localhost:8081',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify(body),
        }),
      );
    }
    ok((await send('invalid')).status === 401);
    for (const [failure, status] of [
      ['FORBIDDEN', 403],
      ['NOT_AVAILABLE', 404],
      ['DEPENDENCY_UNAVAILABLE', 503],
    ] as const) {
      code = failure;
      const r = await send();
      ok(r.status === status);
      ok(!JSON.stringify(await r.json()).includes('fixture'));
    }
    code = '';
    const before = calls;
    ok((await send('fixture', { ...command, actorUserId: id })).status === 400);
    ok(calls === before);
    const r = await send();
    const body = await r.json();
    ok(
      r.status === 200 &&
        body.replayed &&
        body.closure.withdrawal.eventId === id,
    );
    ok(r.headers.get('Cache-Control') === 'no-store');
  },
);
Deno.test(
  'closure adapter uses only fixed RPCs and trusted actor; malformed projections fail closed',
  async () => {
    const calls: { url: string; body: Record<string, unknown> }[] = [];
    let malformed = false;
    const gateway = createPostgresOperationAdapter({
      baseUrl: 'http://local.invalid',
      serviceKey: 'sb_secret_fixture',
      fetcher: async (url, init) => {
        calls.push({ url: String(url), body: JSON.parse(String(init?.body)) });
        return new Response(
          JSON.stringify(
            String(url).endsWith('list_admin_booking_closures')
              ? { barbershopId: id, closures: [closure], nextCursor: null }
              : {
                  closure: malformed
                    ? { ...closure, barbershopId: 'foreign' }
                    : closure,
                  replayed: false,
                },
          ),
        );
      },
    });
    const actor = { userId: id };
    await executeShopClosure(
      gateway,
      actor,
      parseShopClosure({
        action: 'list-shop-closures',
        barbershopId: id,
        cursor: null,
      }),
    );
    await executeShopClosure(gateway, actor, parseShopClosure(command));
    ok(calls[0].url.endsWith('/rpc/list_admin_booking_closures'));
    ok(calls[1].url.endsWith('/rpc/withdraw_admin_booking_closure'));
    ok(
      calls.every(
        (c) =>
          c.body.p_actor_id === id && !('action' in (c.body.p_data as object)),
      ),
    );
    malformed = true;
    let denied = false;
    try {
      await executeShopClosure(gateway, actor, parseShopClosure(command));
    } catch (e) {
      denied =
        e instanceof BusinessError && e.code === 'DEPENDENCY_UNAVAILABLE';
    }
    ok(denied);
  },
);
