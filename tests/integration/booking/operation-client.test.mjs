import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from './load-core.mjs';
const shop = '00000000-0000-4000-8000-000000000001',
  user = '00000000-0000-4000-8000-000000000002';
function fixture() {
  let scope = {
    userId: user,
    generation: 1,
    barbershopId: shop,
    role: 'administrator',
  };
  const calls = [];
  let finish;
  const gateway = {
    setPublication: async (...args) => calls.push(args),
    respondInvitation: async () => ({ status: 'accepted' }),
    getManagement: async () => ({
      services: [],
      professionals: [],
      hours: [],
      invitations: [],
    }),
    listOwnInvitations: async () => [],
  };
  const { createOperationApplication } = loadCore(
    'src/features/barbershop-operation/application/operation-application.ts',
  );
  const application = createOperationApplication({
    gateway,
    scope: () => scope,
    createShop: async (name) => ({ id: shop, name }),
  });
  return {
    application,
    calls,
    setScope: (s) => (scope = s),
    gateway,
    defer: () => {
      gateway.setPublication = () => new Promise((r) => (finish = r));
      return () => finish();
    },
  };
}
test('contextual barber never gains admin authority from another shop', async () => {
  const f = fixture();
  f.setScope({
    userId: user,
    generation: 2,
    barbershopId: shop,
    role: 'barber',
  });
  await assert.rejects(
    f.application.setPublication('published'),
    (e) => e.code === 'FORBIDDEN',
  );
  assert.equal(f.calls.length, 0);
});
test('zero membership can create own shop and accept own invitation but not administer', async () => {
  const f = fixture();
  f.setScope({ userId: user, generation: 1 });
  assert.equal((await f.application.createShop('Local')).name, 'Local');
  assert.equal(
    (await f.application.respondInvitation(shop, 'accept')).status,
    'accepted',
  );
  await assert.rejects(
    f.application.setPublication('published'),
    (e) => e.code === 'FORBIDDEN',
  );
});
test('operation injects selected tenant and duplicate submission is blocked', async () => {
  const f = fixture();
  await f.application.setPublication('published');
  assert.deepEqual(f.calls[0], [shop, 'published']);
  const release = f.defer();
  const pending = f.application.setPublication('paused');
  await assert.rejects(
    f.application.setPublication('paused'),
    (e) => e.code === 'CONFLICT',
  );
  release();
  await pending;
});
test('late response from old account or tenant is discarded', async () => {
  const f = fixture();
  const release = f.defer();
  const p = f.application.setPublication('paused');
  f.setScope({
    userId: user,
    generation: 2,
    barbershopId: '00000000-0000-4000-8000-000000000003',
    role: 'administrator',
  });
  release();
  await assert.rejects(p, (e) => e.code === 'FORBIDDEN');
});

test('management reloads overlapping a remount share the query without a false save conflict', async () => {
  const f = fixture();
  let release,
    reads = 0;
  f.gateway.getManagement = () => {
    reads++;
    return new Promise((resolve) => {
      release = resolve;
    });
  };
  const first = f.application.load();
  const remounted = f.application.load();
  const result = Promise.all([first, remounted]);
  release({ services: [], professionals: [], hours: [], invitations: [] });
  assert.equal((await result).length, 2);
  assert.equal(reads, 1);
});

test('professional reminder delegates selected tenant and denies non administrator', async () => {
  const f = fixture();
  f.gateway.remindInvitation = async (...args) => {
    f.calls.push(args);
    return { created: true };
  };
  assert.equal((await f.application.remindInvitation(user)).created, true);
  assert.deepEqual(f.calls, [[shop, user]]);
  f.setScope({
    userId: user,
    generation: 2,
    barbershopId: shop,
    role: 'barber',
  });
  await assert.rejects(
    () => f.application.remindInvitation(user),
    (e) => e.code === 'FORBIDDEN',
  );
});
