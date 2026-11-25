import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCoreLoader } from './load-core.mjs';
import { id } from './booking-payload-fixture.mjs';
const loadCore = createCoreLoader();
const core = (p) => loadCore('src/features/' + p + '.ts');
test('administrative invitation management retains uncertain requests and refresh failure cannot undo acceptance', async () => {
  const { createAdminInvitations } = core(
    'barbershop-operation/application/admin-invitations',
  );
  let scope = {
      userId: id(1),
      barbershopId: id(2),
      generation: 1,
      role: 'administrator',
    },
    fail = false;
  const seen = [],
    row = { id: id(3), status: 'pending' };
  const app = createAdminInvitations({
    scope: () => scope,
    requestId: () => id(4),
    onAccepted: async () => {
      throw Error('refresh failed');
    },
    gateway: {
      createAdmin: async () => {
        throw Error('uncertain');
      },
      listAdmin: async (shop) => {
        seen.push(shop);
        if (fail) throw Error('network');
        return [row];
      },
      respondAdmin: async () => row,
      cancelAdmin: async () => row,
      retryAdminMail: async () => row,
    },
  });
  assert.equal(app.hasPendingInvitation(), false);
  await assert.rejects(app.invite('fixture@example.invalid'));
  assert.equal(app.hasPendingInvitation(), true);
  await app.loadOutgoing();
  await app.cancel(id(3));
  await app.retryMail(id(3));
  await app.respond(id(3), 'accept');
  await app.respond(id(3), 'reject');
  assert.equal(seen[0], id(2));
  fail = true;
  await assert.rejects(app.loadOutgoing(), { code: 'DEPENDENCY_UNAVAILABLE' });
  scope = null;
  await assert.rejects(app.loadOwn(), { code: 'UNAUTHENTICATED' });
  assert.equal(app.hasPendingInvitation(), false);
});
test('reschedule policy and history use contextual management ports and reject unavailable or stale dependencies', async () => {
  const { createRescheduleActions } = core(
      'reservations/application/reschedule',
    ),
    { BusinessError } = core('reservations/domain/values');
  const { rescheduleHistoryQuery } = core('reservations/domain/reschedule');
  assert.equal(rescheduleHistoryQuery({ reservationId: id(1) }), id(1));
  assert.throws(() => rescheduleHistoryQuery({ reservationId: 'bad' }));
  let scope = 'A',
    failure = null;
  const policy = { barbershopId: id(2), advanceMin: 120 };
  const work = async (value) => {
    if (failure) throw failure;
    return value;
  };
  const app = createRescheduleActions(
    {},
    () => scope,
    () => id(3),
    {
      getReschedulePolicy: () => work(policy),
      setReschedulePolicy: work,
      listRescheduleHistory: () => work([]),
    },
  );
  assert.equal((await app.readPolicy(id(2))).advanceMin, 120);
  assert.equal((await app.setPolicy(policy)).barbershopId, id(2));
  assert.deepEqual(await app.history(id(1)), []);
  failure = new BusinessError('FORBIDDEN');
  await assert.rejects(app.readPolicy(id(2)), { code: 'FORBIDDEN' });
  failure = Error('private');
  await assert.rejects(app.history(id(1)), { code: 'DEPENDENCY_UNAVAILABLE' });
  await assert.rejects(
    createRescheduleActions(
      {},
      () => scope,
      () => id(3),
    ).readPolicy(id(2)),
    { code: 'DEPENDENCY_UNAVAILABLE' },
  );
  const stale = createRescheduleActions(
    {},
    () => scope,
    () => id(3),
    {
      getReschedulePolicy: async () => {
        scope = 'B';
        return policy;
      },
    },
  );
  await assert.rejects(stale.readPolicy(id(2)), { code: 'UNAUTHENTICATED' });
  scope = null;
  await assert.rejects(app.history(id(1)), { code: 'UNAUTHENTICATED' });
});
test('discovery pagination removes duplicates, notifications notify subscribers and clear expired session results', async () => {
  const { createPrivateHome } = core('reservations/application/private-home');
  let scope = { userId: id(1), generation: 1, contextKey: 'A' },
    pages = 0,
    notify = 0;
  const first = Array.from({ length: 50 }, (_, i) => ({
    barbershopId: id(i + 1),
    name: 'Local',
  }));
  const app = createPrivateHome({
    scope: () => scope,
    offers: {
      listVisibleShops: async () =>
        ++pages === 1 ? first : [first[0], { barbershopId: id(99) }],
      getCatalog: async () => {
        throw Error();
      },
    },
    listOwn: async () => {
      throw Error();
    },
  });
  const off = app.subscribe(() => notify++);
  await app.search();
  await app.more();
  assert.equal(app.getSnapshot().shops.length, 51);
  await app.loadOwn();
  assert.equal(app.getSnapshot().ownPhase, 'error');
  off();
  assert.ok(notify > 0);
  scope = null;
  app.invalidateScope();
  const { createInbox } = core('notifications/application/inbox');
  let account = 'A',
    count = 0;
  const inbox = createInbox({
    scope: () => account,
    gateway: {
      list: async () => {
        throw Error('UNAUTHENTICATED');
      },
      read: async () => {},
    },
  });
  const unsub = inbox.subscribe(() => count++);
  await inbox.refresh();
  assert.equal(inbox.getSnapshot().phase, 'error');
  assert.ok(count > 0);
  unsub();
});
test('professional capability is contextual and actor validation cannot accept extra authority', () => {
  const { teamActor } = core('barbershop-operation/domain/team-input');
  assert.equal(teamActor({ userId: id(1) }).userId, id(1));
  assert.throws(() => teamActor({ userId: id(1), role: 'owner' }), {
    code: 'UNAUTHENTICATED',
  });
  const { createOperationApplication } = core(
    'barbershop-operation/application/operation-application',
  );
  let scope = { userId: id(1), generation: 1, barbershopId: id(2) };
  const app = createOperationApplication({
    scope: () => scope,
    selfProfessionalEnabled: true,
    gateway: {},
    createShop: async () => ({ id: id(2), name: 'Local' }),
  });
  assert.equal(app.canEditOwnProfessional(), true);
  scope = null;
  assert.equal(app.canEditOwnProfessional(), false);
});
test('authority subscribers observe invalidation and removal is safe after unsubscribe', () => {
  const { createTeamAuthority } = core(
    'barbershop-operation/application/team-authority',
  );
  let scope = null,
    count = 0;
  const app = createTeamAuthority({ scope: () => scope, gateway: {} });
  const off = app.subscribe(() => count++);
  app.invalidate();
  assert.equal(count, 1);
  off();
  app.invalidate();
  assert.equal(count, 1);
});

test('restored confirmation is idempotent and cannot switch reservation silently', async () => {
  const { createBookingApplication } = core(
    'reservations/application/booking-application',
  );
  const row = { id: id(5), state: 'confirmed' };
  const app = createBookingApplication({
    scope: () => ({ userId: id(1), generation: 1, contextKey: 'A' }),
    requestId: () => id(4),
    today: () => '2026-11-24',
    offers: {},
    gateway: { listOwnReservations: async () => [row] },
  });
  await app.restoreConfirmation(id(5));
  await app.restoreConfirmation(id(5));
  await assert.rejects(app.restoreConfirmation(id(6)), { code: 'CONFLICT' });
});
test('ready shop data and slot management publish results but never raw provider errors', async () => {
  const { createPrivateHome } = core('reservations/application/private-home');
  const home = createPrivateHome({
    scope: () => ({ userId: id(1), generation: 1, contextKey: 'A' }),
    offers: {
      getCatalog: async () => ({ barbershopId: id(2) }),
      listVisibleShops: async () => [],
    },
    listOwn: async () => [],
  });
  await home.openShop(id(2));
  assert.equal(home.getSnapshot().offerPhase, 'ready');
  const { createRescheduleActions } = core(
    'reservations/application/reschedule',
  );
  let failure = false;
  const app = createRescheduleActions(
    {
      listRescheduleSlots: async () => {
        if (failure) throw Error('provider detail');
        return [];
      },
    },
    () => 'A',
    () => id(3),
  );
  assert.deepEqual(
    await app.slots({ reservationId: id(1), localDate: '2026-11-24' }),
    [],
  );
  failure = true;
  await assert.rejects(
    app.slots({ reservationId: id(1), localDate: '2026-11-24' }),
    { code: 'DEPENDENCY_UNAVAILABLE' },
  );
});
test('unknown administrative commands and mismatched summary dates fail closed', async () => {
  const { parseAdminInvitation } = core(
    'barbershop-operation/domain/admin-invitations',
  );
  assert.throws(() => parseAdminInvitation({ action: 'grant-owner' }), {
    code: 'INVALID_INPUT',
  });
  const { createOwnSummaryApplication } = core(
    'barbershop-operation/application/own-summary',
  );
  let failure = false;
  const app = createOwnSummaryApplication({
    scope: () => ({
      userId: id(1),
      generation: 1,
      barbershopId: id(2),
      role: 'barber',
    }),
    gateway: {
      getOwnSummary: async () => {
        if (failure) throw Error('private');
        return {
          professional: { userId: id(1), barbershopId: id(2), active: true },
          localDate: '2026-11-23',
        };
      },
    },
  });
  await assert.rejects(app.read('2026-11-24'), {
    code: 'DEPENDENCY_UNAVAILABLE',
  });
  failure = true;
  await assert.rejects(app.read('2026-11-24'), {
    code: 'DEPENDENCY_UNAVAILABLE',
  });
});
test('authority without a selected shop becomes idle and multi-notice acknowledgement selects the newest date', async () => {
  const { createTeamAuthority } = core(
    'barbershop-operation/application/team-authority',
  );
  const authority = createTeamAuthority({ scope: () => null, gateway: {} });
  await authority.read();
  assert.equal(authority.getSnapshot().phase, 'idle');
  const { createInbox } = core('notifications/application/inbox');
  const inbox = createInbox({
    scope: () => 'A',
    gateway: {
      read: async () => {},
      list: async () => ({
        items: [
          { id: 'a', createdAt: '2026-11-23T00:00:00.000Z', readAt: null },
          { id: 'b', createdAt: '2026-11-24T00:00:00.000Z', readAt: null },
        ],
        unread: 2,
      }),
    },
  });
  await inbox.load();
  inbox.acknowledge();
  assert.equal(inbox.getSnapshot().unseen, 0);
});
test('Google diagnostic opens its provider once without requiring an error branch', async () => {
  const { createGoogleAuthCheck } = core(
    'authentication/application/google-auth-check',
  );
  let calls = 0;
  const app = createGoogleAuthCheck({
    subscribe: () => () => {},
    signInWithGoogle: async () => {
      calls++;
    },
    completeCallback: async () => ({ kind: 'signed-out' }),
    restoreAndVerify: async () => ({ kind: 'signed-out' }),
    signOutCurrent: async () => ({ remoteRevocationConfirmed: true }),
  });
  await app.startGoogle();
  assert.equal(calls, 1);
  assert.equal(app.getSnapshot().kind, 'oauth-pending');
  app.dispose();
});

test('refreshing a ready account without a selected tenant resolves its memberships again', async () => {
  const { createSessionCoordinator } = core(
    'authentication/application/session-coordinator',
  );
  const identity = {
    userId: id(1),
    email: 'fixture@example.invalid',
    emailConfirmed: true,
    isAnonymous: false,
  };
  let listener = () => {},
    resolutions = 0;
  const context = {
    subscribe: (fn) => {
      listener = fn;
      return () => {};
    },
    getSnapshot: () => ({ kind: 'choosing', memberships: [] }),
    resolve: async () => {
      resolutions++;
      listener();
    },
    revalidate: async () => {},
    clear: () => {},
    dispose: () => {},
    select: async () => {},
    choose: async () => {},
  };
  const app = createSessionCoordinator({
    context,
    auth: {
      subscribe: () => () => {},
      register: async () => ({ kind: 'confirmation-required' }),
      completeCallback: async () => ({ kind: 'authenticated', identity }),
      restoreAndVerify: async () => ({ kind: 'authenticated', identity }),
    },
    profiles: {
      getOwnProfile: async () => ({
        userId: id(1),
        displayName: 'Fixture',
        phone: null,
      }),
      ensureOwnProfile: async () => {
        throw Error('unexpected');
      },
    },
  });
  await app.restoreAndVerify();
  assert.equal(app.getSnapshot().kind, 'ready');
  await app.refreshContext();
  assert.equal(resolutions, 2);
  app.dispose();
});

test('committed administrative acceptance refreshes context successfully without changing the returned invitation', async () => {
  const { createAdminInvitations } = core(
    'barbershop-operation/application/admin-invitations',
  );
  let refreshed = 0;
  const invitation = { id: id(3), status: 'accepted' };
  const app = createAdminInvitations({
    scope: () => ({ userId: id(1), generation: 1 }),
    requestId: () => id(4),
    onAccepted: async () => {
      refreshed++;
    },
    gateway: { respondAdmin: async () => invitation },
  });
  assert.equal(await app.respond(id(3), 'accept'), invitation);
  assert.equal(refreshed, 1);
});
