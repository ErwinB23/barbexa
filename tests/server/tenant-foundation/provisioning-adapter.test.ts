import { createPostgresFoundationAdapter } from '../../../supabase/functions/_shared/tenant-foundation/infrastructure/postgres-foundation-adapter.ts';
import { createBarbershopHandler } from '../../../supabase/functions/_shared/tenant-foundation/presentation/create-barbershop-handler.ts';
const id = '11111111-1111-4111-8111-111111111111';
function ok(v: unknown) {
  if (!v) throw Error('Assertion');
}
Deno.test(
  'barbershop RPC maps own membership and handler rejects forged role',
  async () => {
    const gateway = createPostgresFoundationAdapter({
      baseUrl: 'http://127.0.0.1:54421',
      serviceKey: 'service-test-only',
      fetcher: async (_url, init) => {
        const body = JSON.parse(String(init?.body));
        ok(body.p_actor_id === id);
        return Response.json({
          barbershop: { id, name: 'Name' },
          membership: {
            id,
            user_id: id,
            barbershop_id: id,
            role: 'administrator',
            status: 'active',
          },
        });
      },
    });
    const result = await gateway.createOwnBarbershop(
      { userId: id },
      { name: 'Name' },
    );
    ok(result.membership.userId === id);
    const handler = createBarbershopHandler({
      verifyActor: async () => ({ userId: id }),
      createOwnBarbershop: async () => result,
    });
    const req = (body: unknown) =>
      new Request('http://localhost', {
        method: 'POST',
        headers: { Authorization: 'Bearer fixture-only' },
        body: JSON.stringify(body),
      });
    ok((await handler(req({ name: 'Name' }))).status === 201);
    ok(
      (await handler(req({ name: 'Name', role: 'administrator' }))).status ===
        400,
    );
  },
);
