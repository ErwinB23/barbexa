import { createOperationHandler } from '../../../supabase/functions/_shared/barbershop-operation/presentation/operation-handler.ts';
import { createPostgresOperationAdapter } from '../../../supabase/functions/_shared/barbershop-operation/infrastructure/postgres-operation-adapter.ts';
import { BusinessError } from '../../../supabase/functions/_shared/barbershop-operation/domain/values.ts';
const id = '11111111-1111-4111-8111-111111111111';
const ok = (v: unknown) => {
  if (!v) throw Error('Assertion');
};
Deno.test(
  'handler preserves exact Origin JWT boundary and never accepts anon as a verified user',
  async () => {
    let called = 0;
    const handler = createOperationHandler({
      verifyActor: async (token: string) => {
        if (token !== 'user-fixture')
          throw new BusinessError('UNAUTHENTICATED');
        return { userId: id };
      },
      execute: async () => {
        called++;
        return null;
      },
      allowedOrigins: ['http://localhost:8081'],
    });
    for (const [origin, token, status] of [
      ['http://evil.invalid', 'user-fixture', 403],
      ['http://localhost:8081', 'anon-fixture', 401],
      ['http://localhost:8081', 'user-fixture', 200],
    ] as const) {
      const r = await handler(
        new Request('http://local.invalid', {
          method: 'POST',
          headers: { Origin: origin, Authorization: 'Bearer ' + token },
          body: JSON.stringify({
            action: 'set-publication',
            barbershopId: id,
            state: 'draft',
          }),
        }),
      );
      ok(r.status === status);
      ok(!JSON.stringify(await r.json()).includes('user-fixture'));
    }
    ok(called === 1);
    const pre = await handler(
      new Request('http://local.invalid', {
        method: 'OPTIONS',
        headers: { Origin: 'http://localhost:8081' },
      }),
    );
    ok(
      pre.status === 204 &&
        pre.headers.get('Access-Control-Allow-Origin') ===
          'http://localhost:8081',
    );
  },
);
Deno.test(
  'adapter uses actor from trusted argument, a fixed RPC, and a safe error translation',
  async () => {
    let body: Record<string, unknown> = {};
    let endpoint = '';
    const gateway = createPostgresOperationAdapter({
      baseUrl: 'http://local.invalid',
      serviceKey: 'sb_secret_fixture',
      fetcher: async (url, init) => {
        endpoint = String(url);
        body = JSON.parse(String(init?.body));
        return new Response(
          JSON.stringify({
            code: '23505',
            message: 'private constraint details',
          }),
          { status: 409 },
        );
      },
    });
    let rejected = false;
    try {
      await gateway.inviteExistingUser(
        { userId: id },
        id,
        'test@example.invalid',
      );
    } catch (e) {
      rejected =
        e instanceof BusinessError &&
        e.code === 'CONFLICT' &&
        !e.message.includes('private');
    }
    ok(
      rejected &&
        endpoint.endsWith('/rpc/invite_booking_staff') &&
        body.p_actor_id === id,
    );
  },
);
