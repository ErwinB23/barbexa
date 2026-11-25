import {
  parseSelfSchedule,
  executeSelfSchedule,
  type SelfScheduleGateway,
} from '../../../supabase/functions/_shared/barbershop-operation/application/self-schedule.ts';
import {
  parseOperation,
  executeOperation,
  type OperationGateway,
} from '../../../supabase/functions/_shared/barbershop-operation/application/operation.ts';
import { createPostgresOperationAdapter } from '../../../supabase/functions/_shared/barbershop-operation/infrastructure/postgres-operation-adapter.ts';
const user = '11111111-1111-4111-8111-111111111111',
  shop = '22222222-2222-4222-8222-222222222222';
const ok = (v: unknown) => {
  if (!v) throw Error('Assertion');
};
Deno.test(
  'own schedule rejects actor/professional/role and malformed intervals before port',
  () => {
    for (const extra of [
      { userId: user },
      { barberId: user },
      { active: true },
      { role: 'administrator' },
    ]) {
      let rejected = false;
      try {
        parseSelfSchedule({
          action: 'set-own-schedule',
          barbershopId: shop,
          version: 1,
          hours: [],
          ...extra,
        });
      } catch {
        rejected = true;
      }
      ok(rejected);
    }
    for (const hours of [
      [{ weekday: 1, opensMin: 10, closesMin: 5 }],
      [
        { weekday: 1, opensMin: 0, closesMin: 60 },
        { weekday: 1, opensMin: 30, closesMin: 70 },
      ],
    ]) {
      let rejected = false;
      try {
        parseSelfSchedule({
          action: 'set-own-schedule',
          barbershopId: shop,
          version: 1,
          hours,
        });
      } catch {
        rejected = true;
      }
      ok(rejected);
    }
  },
);
Deno.test(
  'schedule forwards verified actor; default main executor leaves009 disabled',
  async () => {
    const calls: unknown[][] = [];
    const gateway = {
      getOwnSchedule: async (...a: unknown[]) => {
        calls.push(a);
        return null;
      },
    } as unknown as SelfScheduleGateway;
    const c = { action: 'get-own-schedule', barbershopId: shop };
    await executeSelfSchedule(gateway, { userId: user }, c);
    ok(
      (calls[0][0] as { userId: string }).userId === user &&
        calls[0][1] === shop,
    );
    const parsed = parseOperation(c);
    let rejected = false;
    try {
      await executeOperation({} as OperationGateway, { userId: user }, parsed);
    } catch {
      rejected = true;
    }
    ok(rejected);
  },
);
Deno.test(
  'own hours/block adapter routes fixed RPC and actor separately; invalid versions/dates never reach it',
  async () => {
    const calls: { url: string; body: Record<string, unknown> }[] = [];
    const adapter = createPostgresOperationAdapter({
      baseUrl: 'http://local.invalid',
      serviceKey: 'sb_secret_fixture',
      fetcher: async (url, init) => {
        calls.push({ url: String(url), body: JSON.parse(String(init?.body)) });
        return new Response('{}', { status: 200 });
      },
    });
    const actor = { userId: user },
      block = {
        id: user,
        startsAt: '2026-11-20T15:00:00.000Z',
        endsAt: '2026-11-20T16:00:00.000Z',
        reason: null,
      };
    await executeSelfSchedule(adapter, actor, {
      action: 'set-own-schedule',
      barbershopId: shop,
      version: 1,
      hours: [],
    });
    await executeSelfSchedule(adapter, actor, {
      action: 'upsert-own-block',
      barbershopId: shop,
      version: 1,
      block,
    });
    await executeSelfSchedule(adapter, actor, {
      action: 'remove-own-block',
      barbershopId: shop,
      version: 1,
      blockId: user,
    });
    ok(
      calls.map((c) => c.url.split('/').pop()).join(',') ===
        'set_own_booking_schedule,upsert_own_booking_block,remove_own_booking_block',
    );
    ok(
      calls.every(
        (c) =>
          c.body.p_actor_id === user &&
          !('userId' in (c.body.p_data as object)),
      ),
    );
    for (const input of [
      { action: 'set-own-schedule', barbershopId: shop, version: 0, hours: [] },
      {
        action: 'remove-own-block',
        barbershopId: shop,
        version: 1,
        blockId: 'x',
      },
      {
        action: 'upsert-own-block',
        barbershopId: shop,
        version: 1,
        block: { ...block, endsAt: block.startsAt },
      },
      {
        action: 'upsert-own-block',
        barbershopId: shop,
        version: 1,
        block: { ...block, userId: user },
      },
    ]) {
      let rejected = false;
      try {
        await executeSelfSchedule(adapter, actor, input);
      } catch {
        rejected = true;
      }
      ok(rejected);
    }
    ok(calls.length === 3);
  },
);
