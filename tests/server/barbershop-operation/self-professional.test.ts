import {
  executeOperation,
  parseOperation,
  type OperationGateway,
} from '../../../supabase/functions/_shared/barbershop-operation/application/operation.ts';
import { createPostgresOperationAdapter } from '../../../supabase/functions/_shared/barbershop-operation/infrastructure/postgres-operation-adapter.ts';
const user = '11111111-1111-4111-8111-111111111111',
  shop = '22222222-2222-4222-8222-222222222222';
const ok = (v: unknown) => {
  if (!v) throw Error('Assertion');
};
Deno.test(
  'own-professional closed commands reject forged identity, status, roles and fields',
  () => {
    for (const extra of [
      { userId: user },
      { role: 'administrator' },
      { active: true },
      { id: user },
      { barberId: user },
    ]) {
      let rejected = false;
      try {
        parseOperation({
          action: 'update-own-professional',
          barbershopId: shop,
          professionalName: 'Own',
          ...extra,
        });
      } catch {
        rejected = true;
      }
      ok(rejected);
    }
    ok(
      parseOperation({ action: 'get-own-professional', barbershopId: shop })
        .action === 'get-own-professional',
    );
  },
);
Deno.test(
  'server carries separately verified actor to own RPC and verifies ownership of projection',
  async () => {
    const calls: unknown[][] = [];
    const gateway = {
      updateOwnProfessional: async (...args: unknown[]) => {
        calls.push(args);
        return null;
      },
    } as unknown as OperationGateway;
    await executeOperation(
      gateway,
      { userId: user },
      {
        action: 'update-own-professional',
        barbershopId: shop,
        professionalName: ' Own ',
      },
    );
    ok(calls[0][0] && (calls[0][0] as { userId: string }).userId === user);
    ok(calls[0][1] === shop && calls[0][2] === 'Own');
    let body: Record<string, unknown> = {},
      wrong = false;
    const adapter = createPostgresOperationAdapter({
      baseUrl: 'http://local.invalid',
      serviceKey: 'sb_secret_fixture',
      fetcher: async (_url, init) => {
        body = JSON.parse(String(init?.body));
        return new Response(
          JSON.stringify({
            id: user,
            userId: wrong ? shop : user,
            barbershopId: shop,
            professionalName: 'Own',
            active: true,
          }),
          { status: 200 },
        );
      },
    });
    await adapter.updateOwnProfessional({ userId: user }, shop, 'Own');
    ok(body.p_actor_id === user);
    ok(!('userId' in (body.p_data as object)));
    wrong = true;
    let rejected = false;
    try {
      await adapter.getOwnProfessional({ userId: user }, shop);
    } catch {
      rejected = true;
    }
    ok(rejected);
  },
);
