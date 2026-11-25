import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadCore } from './load-core.mjs';
const user = '11111111-1111-4111-8111-111111111111',
  shop = '22222222-2222-4222-8222-222222222222';
const profile = {
  id: '33333333-3333-4333-8333-333333333333',
  userId: user,
  barbershopId: shop,
  professionalName: 'Own',
  active: true,
};
function fixture() {
  let scope = {
    userId: user,
    generation: 1,
    barbershopId: shop,
    role: 'barber',
  };
  const calls = [];
  const gateway = {
    getOwnProfessional: async (...args) => {
      calls.push(args);
      return profile;
    },
    updateOwnProfessional: async (...args) => {
      calls.push(args);
      return { ...profile, professionalName: args[1] };
    },
  };
  const { createOperationApplication } = loadCore(
    'src/features/barbershop-operation/application/operation-application.ts',
  );
  const app = createOperationApplication({
    gateway,
    scope: () => scope,
    createShop: async () => ({ id: shop, name: 'Not used' }),
    selfProfessionalEnabled: true,
  });
  return {
    app,
    gateway,
    calls,
    change: (s) => {
      scope = s;
    },
    scope: () => scope,
  };
}
test('barber edits own contextual name without admin upsert/actor/id/activation payload', async () => {
  const f = fixture();
  assert.equal((await f.app.getOwnProfessional()).userId, user);
  const result = await f.app.updateOwnProfessional(' Edited ');
  assert.equal(result.professionalName, 'Edited');
  assert.deepEqual(f.calls[1], [shop, 'Edited']);
  await assert.rejects(
    () => f.app.updateOwnProfessional(' '),
    (e) => e.code === 'INVALID_INPUT',
  );
  await assert.rejects(
    () => f.app.setPublication('published'),
    (e) => e.code === 'FORBIDDEN',
  );
});
test('own professional discards cross-context/foreign responses and prevents overlapping saves', async () => {
  const f = fixture();
  let release;
  f.gateway.updateOwnProfessional = () =>
    new Promise((r) => {
      release = r;
    });
  const first = f.app.updateOwnProfessional('Edited');
  await assert.rejects(
    () => f.app.updateOwnProfessional('Again'),
    (e) => e.code === 'CONFLICT',
  );
  f.change({ ...f.scope(), generation: 2, barbershopId: user });
  release(profile);
  await assert.rejects(
    () => first,
    (e) => e.code === 'FORBIDDEN',
  );
  const g = fixture();
  g.gateway.getOwnProfessional = async () => ({ ...profile, userId: shop });
  await assert.rejects(
    () => g.app.getOwnProfessional(),
    (e) => e.code === 'FORBIDDEN',
  );
});
test('client adapter verifies actor then sends closed own-profile commands and rejects other tenant projection', async () => {
  const { createOperationHttpAdapter } = loadCore(
    'src/features/barbershop-operation/infrastructure/operation-http-adapter.ts',
  );
  const sent = [];
  let wrong = false;
  const gateway = createOperationHttpAdapter({
    baseUrl: 'http://127.0.0.1:54421',
    publicKey: 'sb_publishable_fixture',
    getAccessToken: async () => 'synthetic',
    expectedUser: () => user,
    fetcher: async (url, init) => {
      sent.push({ url, init });
      return {
        ok: true,
        json: async () =>
          url.endsWith('/auth/v1/user')
            ? { id: user, email_confirmed_at: 'confirmed', is_anonymous: false }
            : { ...profile, barbershopId: wrong ? user : shop },
      };
    },
  });
  await gateway.getOwnProfessional(shop);
  await gateway.updateOwnProfessional(shop, 'Edited');
  const payloads = sent
    .filter((c) => c.url.includes('/functions/'))
    .map((c) => JSON.parse(c.init.body));
  assert.deepEqual(payloads, [
    { action: 'get-own-professional', barbershopId: shop },
    {
      action: 'update-own-professional',
      barbershopId: shop,
      professionalName: 'Edited',
    },
  ]);
  wrong = true;
  await assert.rejects(() => gateway.getOwnProfessional(shop));
});
test('SQL draft restricts new functions without rewriting tables, RLS, grants or historical migrations', () => {
  const sql = fs.readFileSync(
    'specs/008-autogestion-profesional/contracts/profile.sql',
    'utf8',
  );
  assert.ok(sql.includes("set search_path = ''"));
  assert.ok(sql.includes('private.booking_actor(p_actor_id)'));
  assert.ok(sql.includes('m.user_id = p_actor_id'));
  assert.ok(sql.includes("m.status = 'active'"));
  assert.ok(sql.includes('p.user_id = p_actor_id'));
  assert.ok(sql.includes('for share'));
  assert.ok(sql.includes('for update'));
  assert.ok(sql.includes('from public, anon, authenticated, service_role'));
  assert.ok(
    !/\b(?:alter table|drop table|truncate|create policy)\b/i.test(sql),
  );
});
