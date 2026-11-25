import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCoreLoader } from './load-core.mjs';
import { id } from './booking-payload-fixture.mjs';
function fixture(patch = {}) {
  const load = createCoreLoader();
  return load(
    'src/features/barbershop-operation/infrastructure/operation-http-adapter.ts',
  ).createOperationHttpAdapter({
    baseUrl: 'https://fixture.invalid',
    publicKey: 'sb_publishable_fixture',
    expectedUser: () => id(90),
    getAccessToken: async () => 'synthetic',
    fetcher: async (url) =>
      Response.json(
        url.endsWith('/auth/v1/user')
          ? { id: id(90), is_anonymous: false, email_confirmed_at: 'verified' }
          : url.endsWith('/rpc/list_shop_staff_invitations')
            ? [
                {
                  id: id(3),
                  barbershopId: id(1),
                  role: 'barber',
                  status: 'accepted',
                  createdAt: '2026-11-22T15:00:00.000Z',
                  respondedAt: '2026-11-23T15:00:00.000Z',
                  recipientName: 'Nombre de cuenta',
                  recipientEmail: 'persona@example.invalid',
                  professionalActive: false,
                  ...patch,
                },
              ]
            : [],
      ),
  });
}
test('management retains real invitation dates, account name and current activity', async () => {
  const data = await fixture().getManagement(id(1));
  assert.equal(data.invitations[0].recipientName, 'Nombre de cuenta');
  assert.equal(data.invitations[0].recipientEmail, 'persona@example.invalid');
  assert.equal(data.invitations[0].createdAt, '2026-11-22T15:00:00.000Z');
  assert.equal(data.invitations[0].professionalActive, false);
  assert.equal(
    (
      await fixture({
        createdAt: undefined,
        respondedAt: undefined,
        recipientName: undefined,
        professionalActive: undefined,
      }).getManagement(id(1))
    ).invitations[0].createdAt,
    undefined,
  );
});
test('management rejects invitation metadata from a different shop or malformed values', async () => {
  for (const patch of [
    { barbershopId: id(2) },
    { createdAt: 'yesterday' },
    { professionalActive: 'true' },
    { respondedAt: 'not-a-date' },
  ])
    await assert.rejects(() => fixture(patch).getManagement(id(1)));
});

test('reminder adapter binds shop and invitation after verifying Auth and decodes deduplication', async () => {
  const load = createCoreLoader();
  const calls = [];
  const gateway = load(
    'src/features/barbershop-operation/infrastructure/operation-http-adapter.ts',
  ).createOperationHttpAdapter({
    baseUrl: 'https://fixture.invalid',
    publicKey: 'sb_publishable_fixture',
    expectedUser: () => id(90),
    getAccessToken: async () => 'synthetic',
    fetcher: async (url, init) => {
      if (url.endsWith('/auth/v1/user'))
        return Response.json({
          id: id(90),
          is_anonymous: false,
          email_confirmed_at: 'verified',
        });
      calls.push({ url, body: JSON.parse(init.body) });
      return Response.json({ created: false });
    },
  });
  assert.equal((await gateway.remindInvitation(id(1), id(3))).created, false);
  assert.ok(calls[0].url.endsWith('/rpc/remind_professional_invitation'));
  assert.deepEqual(calls[0].body, { p_shop_id: id(1), p_invitation_id: id(3) });
});
