import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from './load-core.mjs';
const user = '11111111-1111-4111-8111-111111111111',
  shop = '22222222-2222-4222-8222-222222222222',
  id = '33333333-3333-4333-8333-333333333333';
const inv = {
  id,
  barbershopId: shop,
  barbershopName: 'Local',
  recipientName: 'Ficticio',
  role: 'administrator',
  status: 'pending',
  createdAt: '2026-11-15T12:00:00.000Z',
  expiresAt: '2026-11-22T12:00:00.000Z',
  deliveryStatus: 'sent',
};
test('team HTTP sends closed actions after Auth verification, normalizes profile-only counters and guards tenant response', async () => {
  const { createOperationHttpAdapter } = loadCore(
    'src/features/barbershop-operation/infrastructure/operation-http-adapter.ts',
  );
  const sent = [];
  let wrong = false;
  const adapter = createOperationHttpAdapter({
    baseUrl: 'http://127.0.0.1:54421',
    publicKey: 'sb_publishable_fixture',
    getAccessToken: async () => 'synthetic',
    expectedUser: () => user,
    fetcher: async (url, init) => {
      if (url.endsWith('/auth/v1/user'))
        return Response.json({
          id: user,
          is_anonymous: false,
          email_confirmed_at: 'verified',
        });
      const command = JSON.parse(init.body);
      sent.push(command);
      if (command.action === 'own-professional-summary')
        return Response.json({
          professional: {
            id,
            userId: user,
            barbershopId: shop,
            professionalName: 'Own',
            active: true,
          },
          localDate: command.localDate,
          total: 2,
          scheduled: 1,
          inService: 0,
          completed: 0,
          cancelled: 0,
          noShow: 0,
          unrecorded: 1,
          upcoming: 1,
          nextStartsAt: '2026-11-16T15:00:00.000Z',
        });
      const value = {
        ...inv,
        barbershopId: wrong ? user : shop,
        status:
          command.action === 'respond-admin-invitation'
            ? 'accepted'
            : command.action === 'cancel-admin-invitation'
              ? 'cancelled'
              : 'pending',
      };
      return Response.json(
        command.action === 'list-admin-invitations' ? [value] : value,
      );
    },
  });
  await adapter.createAdmin({
    requestId: id,
    barbershopId: shop,
    email: ' USER@example.invalid ',
  });
  assert.deepEqual(sent[0], {
    action: 'invite-administrator',
    requestId: id,
    barbershopId: shop,
    email: 'user@example.invalid',
  });
  assert.equal((await adapter.listAdmin(null)).length, 1);
  await adapter.respondAdmin(id, 'accept');
  await adapter.cancelAdmin(id);
  await adapter.retryAdminMail(id);
  assert.equal((await adapter.getOwnSummary(shop, '2026-11-16')).unrecorded, 1);
  wrong = true;
  await assert.rejects(
    adapter.createAdmin({
      requestId: id,
      barbershopId: shop,
      email: 'user@example.invalid',
    }),
    (e) => e.code === 'DEPENDENCY_UNAVAILABLE',
  );
});
test('legacy invitation responses preserve administrator role instead of silently downgrading the projection', async () => {
  const { createOperationHttpAdapter } = loadCore(
    'src/features/barbershop-operation/infrastructure/operation-http-adapter.ts',
  );
  const gateway = createOperationHttpAdapter({
    baseUrl: 'http://127.0.0.1:54421',
    publicKey: 'sb_publishable_fixture',
    getAccessToken: async () => 'synthetic',
    expectedUser: () => user,
    fetcher: async (url) =>
      Response.json(
        url.endsWith('/auth/v1/user')
          ? { id: user, is_anonymous: false, email_confirmed_at: 'verified' }
          : { ...inv, status: 'accepted' },
      ),
  });
  assert.equal(
    (await gateway.respondInvitation(id, 'accept')).role,
    'administrator',
  );
});
