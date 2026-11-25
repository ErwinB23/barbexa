import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from './load-core.mjs';
const user = '00000000-0000-4000-8000-000000000002',
  shop = '00000000-0000-4000-8000-000000000001';
function factory(fetcher, extra = {}) {
  const { createOperationHttpAdapter } = loadCore(
    'src/features/barbershop-operation/infrastructure/operation-http-adapter.ts',
  );
  return createOperationHttpAdapter({
    baseUrl: 'http://127.0.0.1:54421',
    publicKey: 'sb_publishable_fixture',
    getAccessToken: async () => 'fixture-access',
    expectedUser: () => user,
    fetcher,
    ...extra,
  });
}
const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});
test('HTTP adapter binds Auth verified identity and sends only contextual command input', async () => {
  const sent = [];
  const app = factory(async (url, init) => {
    sent.push({ url, init });
    return response(
      url.endsWith('/auth/v1/user')
        ? { id: user, is_anonymous: false, email_confirmed_at: 'confirmed' }
        : null,
    );
  });
  await app.setPublication(shop, 'published');
  assert.equal(sent.length, 2);
  assert.deepEqual(JSON.parse(sent[1].init.body), {
    action: 'set-publication',
    barbershopId: shop,
    state: 'published',
  });
  assert.equal(sent[1].init.headers.Authorization, 'Bearer fixture-access');
});
test('Auth identity mismatch prevents all mutations', async () => {
  let calls = 0;
  const app = factory(async () => {
    calls++;
    return response({
      id: shop,
      is_anonymous: false,
      email_confirmed_at: 'confirmed',
    });
  });
  await assert.rejects(
    app.setPublication(shop, 'published'),
    (e) => e.code === 'UNAUTHENTICATED',
  );
  assert.equal(calls, 1);
});
test('production adapter rejects HTTP LAN and privileged credentials', () => {
  assert.throws(
    () =>
      factory(() => {}, {
        baseUrl: 'http://192.168.0.33:54421',
        developmentHttpOrigin: 'http://192.168.0.33:54421',
      }),
    (e) => e.code === 'INVALID_INPUT',
  );
  assert.throws(
    () => factory(() => {}, { publicKey: 'sb_secret_fixture' }),
    (e) => e.code === 'INVALID_INPUT',
  );
});
test('management projection translates database names and never invents global roles', async () => {
  const app = factory(async (url) => {
    if (url.endsWith('/auth/v1/user'))
      return response({
        id: user,
        is_anonymous: false,
        email_confirmed_at: 'confirmed',
      });
    if (url.includes('list_barbershop_memberships'))
      return response([
        { user_id: user, role: 'administrator', status: 'active' },
      ]);
    return response([]);
  });
  const data = await app.getManagement(shop);
  assert.equal(data.members[0].userId, user);
  assert.equal(data.members[0].role, 'administrator');
  assert.equal(data.settings, null);
  assert.equal(data.services.length, 0);
});
test('secondary management omits protected roster and outgoing invitation reads', async () => {
  const sent = [];
  const app = factory(async (url) => {
    sent.push(url);
    return response(
      url.endsWith('/auth/v1/user')
        ? { id: user, is_anonymous: false, email_confirmed_at: 'confirmed' }
        : [],
    );
  });
  const data = await app.getManagement(shop, false);
  assert.equal(data.members.length, 0);
  assert.equal(data.invitations.length, 0);
  assert.equal(
    sent.some(
      (url) =>
        url.includes('list_barbershop_memberships') ||
        url.includes('list_shop_staff_invitations'),
    ),
    false,
  );
  assert.ok(sent.some((url) => url.includes('/rest/v1/services')));
});
