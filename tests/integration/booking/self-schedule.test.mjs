import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadCore } from './load-core.mjs';
const user = '11111111-1111-4111-8111-111111111111',
  shop = '22222222-2222-4222-8222-222222222222',
  id = '33333333-3333-4333-8333-333333333333';
const row = {
  professional: {
    id,
    userId: user,
    barbershopId: shop,
    professionalName: 'Own',
    active: true,
  },
  version: 2,
  shopHours: [],
  hours: [],
  blocks: [],
};
test('own schedule HTTP verifies actor and sends no owner/professional or role', async () => {
  const { createOperationHttpAdapter } = loadCore(
    'src/features/barbershop-operation/infrastructure/operation-http-adapter.ts',
  );
  const sent = [];
  let wrong = false,
    denied = false;
  const gateway = createOperationHttpAdapter({
    baseUrl: 'http://127.0.0.1:54421',
    publicKey: 'sb_publishable_fixture',
    expectedUser: () => user,
    getAccessToken: async () => 'synthetic',
    fetcher: async (url, init) => {
      sent.push({ url, body: init.body });
      return {
        ok: !denied,
        status: denied ? 403 : 200,
        json: async () =>
          denied
            ? { error: { code: 'FORBIDDEN' } }
            : url.endsWith('/auth/v1/user')
              ? {
                  id: user,
                  is_anonymous: false,
                  email_confirmed_at: 'verified',
                }
              : {
                  ...row,
                  professional: {
                    ...row.professional,
                    userId: wrong ? shop : user,
                  },
                },
      };
    },
  });
  await gateway.getOwnSchedule(shop);
  await gateway.setOwnSchedule(shop, 2, []);
  const block = {
    id,
    startsAt: '2026-11-20T15:00:00.000Z',
    endsAt: '2026-11-20T16:00:00.000Z',
    reason: null,
  };
  await gateway.upsertOwnBlock(shop, 2, block);
  await gateway.removeOwnBlock(shop, 2, id);
  const payloads = sent
    .filter((c) => c.url.includes('/functions/'))
    .map((c) => JSON.parse(c.body));
  assert.deepEqual(payloads, [
    { action: 'get-own-schedule', barbershopId: shop },
    { action: 'set-own-schedule', barbershopId: shop, version: 2, hours: [] },
    { action: 'upsert-own-block', barbershopId: shop, version: 2, block },
    { action: 'remove-own-block', barbershopId: shop, version: 2, blockId: id },
  ]);
  wrong = true;
  await assert.rejects(() => gateway.getOwnSchedule(shop));
  wrong = false;
  denied = true;
  await assert.rejects(() => gateway.getOwnSchedule(shop));
});
test('009 SQL draft keeps ACL narrow and protects committed occupied ranges without historical rewrites', () => {
  const sql = fs.readFileSync(
    'specs/009-horarios-profesionales/contracts/schedule.sql',
    'utf8',
  );
  assert.equal((sql.match(/create function /g) ?? []).length, 5);
  assert.ok(sql.includes("set search_path = ''"));
  assert.ok(sql.includes('private.self_professional_command'));
  assert.ok(sql.includes('for update'));
  assert.ok(sql.includes('cfg.version'));
  assert.ok(sql.includes("r.state='confirmed'"));
  assert.ok(sql.includes('r.occupied_until'));
  assert.ok(sql.includes("'[)'"));
  assert.ok(
    sql.includes(
      'where id=block_id and barbershop_id=shop and barber_id=person',
    ),
  );
  assert.ok(
    !/\b(?:alter table|drop table|create table|create policy|truncate)\b/i.test(
      sql,
    ),
  );
  assert.ok(!/\b(?:update|delete from) public\.reservations\b/i.test(sql));
});
