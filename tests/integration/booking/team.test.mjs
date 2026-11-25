import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCoreLoader } from './load-core.mjs';
const user = '11111111-1111-4111-8111-111111111111',
  shop = '22222222-2222-4222-8222-222222222222',
  invite = '33333333-3333-4333-8333-333333333333';
const invitation = {
  id: invite,
  barbershopId: shop,
  barbershopName: 'Local',
  recipientName: 'Invitado',
  role: 'administrator',
  status: 'pending',
  createdAt: '2026-11-15T12:00:00.000Z',
  expiresAt: '2026-11-22T12:00:00.000Z',
  deliveryStatus: 'pending',
};
test('administrator invitation input normalizes email and rejects identities, roles, URLs and confirmation overrides', () => {
  const load = createCoreLoader(),
    { parseAdminInvitation } = load(
      'src/features/barbershop-operation/domain/admin-invitations.ts',
    );
  const input = {
    action: 'invite-administrator',
    requestId: invite,
    barbershopId: shop,
    email: '  TEST@example.invalid  ',
  };
  assert.equal(parseAdminInvitation(input).email, 'test@example.invalid');
  for (const v of [
    { ...input, email: 'test@example.invalid\r\nBcc: stolen@example.invalid' },
    ...['userId', 'role', 'recipientId', 'callbackUrl', 'confirmed'].map(
      (k) => ({ ...input, [k]: user }),
    ),
  ])
    assert.throws(
      () => parseAdminInvitation(v),
      (e) => e.code === 'INVALID_INPUT',
    );
  assert.equal(
    parseAdminInvitation({
      action: 'list-admin-invitations',
      barbershopId: null,
    }).barbershopId,
    null,
  );
});
test('invitation double submit shares request; uncertain retry preserves identity and blocks replacing recipient', async () => {
  const load = createCoreLoader(),
    { createAdminInvitations } = load(
      'src/features/barbershop-operation/application/admin-invitations.ts',
    );
  let calls = 0,
    fail = true;
  const sent = [];
  const app = createAdminInvitations({
    scope: () => ({
      userId: user,
      generation: 1,
      barbershopId: shop,
      role: 'administrator',
    }),
    requestId: () => invite,
    gateway: {
      createAdmin: async (value) => {
        calls++;
        sent.push(value);
        if (fail) throw Error('private diagnostic');
        return invitation;
      },
    },
  });
  const a = app.invite('test@example.invalid'),
    b = app.invite('test@example.invalid');
  await Promise.all([
    assert.rejects(a, (e) => e.code === 'DEPENDENCY_UNAVAILABLE'),
    assert.rejects(b, (e) => e.code === 'DEPENDENCY_UNAVAILABLE'),
  ]);
  assert.equal(calls, 1);
  await assert.rejects(
    app.invite('other@example.invalid'),
    (e) => e.code === 'CONFLICT',
  );
  fail = false;
  await app.invite('test@example.invalid');
  assert.deepEqual(sent[0], sent[1]);
});
test('invitation actions retain contextual authorization and discard late private lists', async () => {
  const load = createCoreLoader(),
    { createAdminInvitations } = load(
      'src/features/barbershop-operation/application/admin-invitations.ts',
    );
  let scope = {
      userId: user,
      generation: 1,
      barbershopId: shop,
      role: 'barber',
    },
    resolve;
  const app = createAdminInvitations({
    scope: () => scope,
    requestId: () => invite,
    gateway: {
      listAdmin: async () =>
        await new Promise((r) => {
          resolve = r;
        }),
    },
  });
  await assert.rejects(
    app.invite('test@example.invalid'),
    (e) => e.code === 'FORBIDDEN',
  );
  const pending = app.loadOwn();
  await Promise.resolve();
  scope = null;
  resolve([invitation]);
  await assert.rejects(pending, (e) => e.code === 'UNAUTHENTICATED');
});
test('summary validates day and partition without inventing care on legacy bookings or showing another professional', async () => {
  const load = createCoreLoader(),
    { createOwnSummaryApplication } = load(
      'src/features/barbershop-operation/application/own-summary.ts',
    );
  let scope = {
      userId: user,
      generation: 1,
      barbershopId: shop,
      role: 'barber',
    },
    wrong = false;
  const view = {
    professional: {
      id: invite,
      userId: user,
      barbershopId: shop,
      professionalName: 'Ficticio',
      active: true,
    },
    localDate: '2026-11-16',
    total: 3,
    scheduled: 1,
    inService: 0,
    completed: 0,
    cancelled: 1,
    noShow: 0,
    unrecorded: 1,
    upcoming: 1,
    nextStartsAt: '2026-11-16T16:00:00.000Z',
  };
  const app = createOwnSummaryApplication({
    scope: () => scope,
    gateway: {
      getOwnSummary: async () => ({
        ...view,
        professional: { ...view.professional, userId: wrong ? shop : user },
      }),
    },
  });
  assert.equal((await app.read('2026-11-16')).unrecorded, 1);
  await assert.rejects(
    app.read('2026-02-30'),
    (e) => e.code === 'INVALID_INPUT',
  );
  wrong = true;
  await assert.rejects(app.read('2026-11-16'), (e) => e.code === 'FORBIDDEN');
  scope = null;
  await assert.rejects(
    app.read('2026-11-16'),
    (e) => e.code === 'UNAUTHENTICATED',
  );
});
test('summary rejects a forged command action with the public safe error code', () => {
  const { ownSummaryQuery } = createCoreLoader()(
    'src/features/barbershop-operation/domain/own-summary.ts',
  );
  assert.throws(
    () =>
      ownSummaryQuery({
        action: 'admin-summary',
        barbershopId: shop,
        localDate: '2026-11-16',
      }),
    (e) => e.code === 'INVALID_INPUT',
  );
});
test('committed acceptance survives a failed context refresh without pretending the database operation failed', async () => {
  const { createAdminInvitations } = createCoreLoader()(
    'src/features/barbershop-operation/application/admin-invitations.ts',
  );
  const app = createAdminInvitations({
    scope: () => ({ userId: user, generation: 1 }),
    requestId: () => invite,
    gateway: {
      respondAdmin: async () => ({ ...invitation, status: 'accepted' }),
    },
    onAccepted: () => {
      throw Error('refresh failed');
    },
  });
  assert.equal((await app.respond(invite, 'accept')).status, 'accepted');
});
