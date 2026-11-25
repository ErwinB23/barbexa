import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCore, createCoreLoader } from './load-core.mjs';
const shop = '00000000-0000-4000-8000-000000000001';
const other = '00000000-0000-4000-8000-000000000002';
function fixture() {
  const { createOperationApplication } = loadCore(
    'src/features/barbershop-operation/application/operation-application.ts',
  );
  let scope = {
    userId: 'fixture',
    generation: 1,
    barbershopId: shop,
    role: 'administrator',
  };
  let current = { id: shop, name: 'Original' };
  const calls = [];
  const names = {
    async get(id) {
      calls.push(['get', id]);
      return current;
    },
    async rename(id, name) {
      calls.push(['rename', id, name]);
      current = { id, name };
      return current;
    },
  };
  const app = createOperationApplication({
    scope: () => scope,
    gateway: {},
    shopNames: names,
    createShop: async (name) => {
      calls.push(['create', name]);
      return { id: other, name };
    },
  });
  return {
    app,
    calls,
    names,
    setScope: (value) => {
      scope = value;
    },
  };
}
test('selected shop rename reuses its ID and a separate port, never creates another shop', async () => {
  const f = fixture();
  assert.equal(typeof f.app.getSelectedShop, 'function');
  assert.equal((await f.app.getSelectedShop()).name, 'Original');
  const value = await f.app.renameSelectedShop('  Nuevo  ');
  assert.equal(value.id, shop);
  assert.equal(value.name, 'Nuevo');
  assert.equal(
    JSON.stringify(f.calls),
    JSON.stringify([
      ['get', shop],
      ['rename', shop, 'Nuevo'],
    ]),
  );
  assert.equal((await f.app.createShop('Otra')).id, other);
  assert.equal(
    JSON.stringify(f.calls.at(-1)),
    JSON.stringify(['create', 'Otra']),
  );
});
test('empty name and nonadministrative contexts never reach the rename port', async () => {
  const f = fixture();
  assert.equal(typeof f.app.renameSelectedShop, 'function');
  await assert.rejects(
    f.app.renameSelectedShop('  '),
    (e) => e.code === 'INVALID_INPUT',
  );
  for (const scope of [
    null,
    { userId: 'fixture', generation: 2 },
    { userId: 'fixture', generation: 3, barbershopId: shop, role: 'barber' },
  ]) {
    f.setScope(scope);
    await assert.rejects(f.app.renameSelectedShop('X'), (e) =>
      ['FORBIDDEN', 'UNAUTHENTICATED'].includes(e.code),
    );
  }
  assert.equal(f.calls.length, 0);
});
test('rename rejects duplicate sends and does not expose a late result after context changes', async () => {
  const f = fixture();
  assert.equal(typeof f.app.renameSelectedShop, 'function');
  let release;
  f.names.rename = () =>
    new Promise((r) => {
      release = r;
    });
  const pending = f.app.renameSelectedShop('X');
  await assert.rejects(
    f.app.renameSelectedShop('X'),
    (e) => e.code === 'CONFLICT',
  );
  f.setScope({
    userId: 'fixture',
    generation: 2,
    barbershopId: other,
    role: 'administrator',
  });
  release({ id: shop, name: 'X' });
  await assert.rejects(pending, (e) => e.code === 'FORBIDDEN');
});
test('wrong-tenant provider response is not rendered as a successful selected shop edit', async () => {
  const f = fixture();
  assert.equal(typeof f.app.getSelectedShop, 'function');
  f.names.get = async () => ({ id: other, name: 'Foreign' });
  await assert.rejects(
    f.app.getSelectedShop(),
    (e) => e.code === 'DEPENDENCY_UNAVAILABLE',
  );
  f.names.rename = async () => ({ id: other, name: 'Foreign' });
  await assert.rejects(
    f.app.renameSelectedShop('X'),
    (e) => e.code === 'DEPENDENCY_UNAVAILABLE',
  );
});

test('remount after rename shares pending name reads instead of reporting a conflict', async () => {
  const f = fixture();
  await f.app.renameSelectedShop('Juanito');
  let release,
    reads = 0;
  f.names.get = () => {
    reads++;
    return new Promise((resolve) => {
      release = resolve;
    });
  };
  const first = f.app.getSelectedShop();
  const remounted = f.app.getSelectedShop();
  const results = Promise.all([first, remounted]);
  release({ id: shop, name: 'Juanito' });
  assert.equal((await results)[1].name, 'Juanito');
  assert.equal(reads, 1);
  f.names.get = async () => ({ id: shop, name: 'Fresh' });
  assert.equal((await f.app.getSelectedShop()).name, 'Fresh');
});

test('a read started before rename cannot satisfy the reload after saving', async () => {
  const f = fixture();
  let release;
  f.names.get = () =>
    new Promise((resolve) => {
      release = resolve;
    });
  const previous = f.app.getSelectedShop();
  await f.app.renameSelectedShop('Juanito');
  f.names.get = async () => ({ id: shop, name: 'Juanito' });
  const refreshed = f.app.getSelectedShop();
  release({ id: shop, name: 'Old' });
  assert.equal((await refreshed).name, 'Juanito');
  await previous;
});

test('overlapping reads remain isolated when selecting a second shop', async () => {
  const f = fixture();
  let release;
  f.names.get = () =>
    new Promise((resolve) => {
      release = resolve;
    });
  const old = f.app.getSelectedShop();
  const denied = assert.rejects(old, (e) => e.code === 'FORBIDDEN');
  f.setScope({
    userId: 'fixture',
    generation: 2,
    barbershopId: other,
    role: 'administrator',
  });
  f.names.get = async () => ({ id: other, name: 'Second' });
  assert.equal((await f.app.getSelectedShop()).name, 'Second');
  release({ id: shop, name: 'First' });
  await denied;
});

test('a failed shared query can be retried without retaining its rejection', async () => {
  const f = fixture();
  f.names.get = async () => {
    throw Error('offline');
  };
  const failed = await Promise.allSettled([
    f.app.getSelectedShop(),
    f.app.getSelectedShop(),
  ]);
  assert.ok(failed.every((result) => result.status === 'rejected'));
  f.names.get = async () => ({ id: shop, name: 'Recovered' });
  assert.equal((await f.app.getSelectedShop()).name, 'Recovered');
});

test('a query made during rename cannot supply the read after the write completes', async () => {
  const f = fixture();
  let finishWrite, finishRead;
  f.names.rename = () =>
    new Promise((resolve) => {
      finishWrite = resolve;
    });
  const saving = f.app.renameSelectedShop('Juanito');
  f.names.get = () =>
    new Promise((resolve) => {
      finishRead = resolve;
    });
  const during = f.app.getSelectedShop();
  finishWrite({ id: shop, name: 'Juanito' });
  await saving;
  f.names.get = async () => ({ id: shop, name: 'Juanito' });
  assert.equal((await f.app.getSelectedShop()).name, 'Juanito');
  finishRead({ id: shop, name: 'Before commit' });
  await during;
});
test('composition reuses foundation GET/PATCH, invalidates catalogue and never calls create', async () => {
  const load = createCoreLoader();
  const { createTenantFoundation } = load(
    'src/composition/tenant-foundation-composition.ts',
  );
  const { createShopNameGateway } = load(
    'src/composition/shop-name-gateway.ts',
  );
  let current = { id: shop, name: 'Actual' },
    invalidations = 0;
  const calls = [];
  const tenant = createTenantFoundation({
    baseUrl: 'http://127.0.0.1:54421',
    publicKey: 'sb_publishable_fixture',
    getAccessToken: async () => 'unit-only',
    fetcher: async (url, init) => {
      calls.push({ url, method: init.method ?? 'GET', body: init.body });
      if (url.endsWith('/auth/v1/user'))
        return {
          ok: true,
          json: async () => ({ id: other, is_anonymous: false }),
        };
      assert.ok(url.includes('/rest/v1/barbershops?'));
      if (init.method === 'PATCH')
        current = { id: shop, ...JSON.parse(init.body) };
      return { ok: true, json: async () => [current] };
    },
  });
  const port = createShopNameGateway(tenant, () => {
    invalidations++;
  });
  assert.equal((await port.get(shop)).name, 'Actual');
  assert.equal((await port.rename(shop, 'Nuevo')).id, shop);
  assert.equal((await port.get(shop)).name, 'Nuevo');
  assert.equal(invalidations, 1);
  const writes = calls.filter((x) => x.method !== 'GET');
  assert.equal(writes.length, 1);
  assert.equal(writes[0].method, 'PATCH');
  assert.equal(writes[0].body, JSON.stringify({ name: 'Nuevo' }));
  assert.ok(writes[0].url.includes('id=eq.' + shop));
});
test('composition preserves safe provider permission errors and never invalidates after a failed rename', async () => {
  const load = createCoreLoader(),
    { createShopNameGateway } = load('src/composition/shop-name-gateway.ts');
  const { FoundationError } = load(
    'src/features/tenant-foundation/domain/types.ts',
  );
  let invalidations = 0;
  const port = createShopNameGateway(
    {
      getBarbershop: async () => null,
      renameBarbershop: async () => {
        throw new FoundationError('FORBIDDEN');
      },
    },
    () => {
      invalidations++;
    },
  );
  await assert.rejects(
    port.rename(shop, 'X'),
    (e) => e.code === 'FORBIDDEN' && !e.message.includes('private'),
  );
  assert.equal(invalidations, 0);
});

test('refresh after renaming with two shops keeps the selected shop visible throughout revalidation', async () => {
  const load = createCoreLoader();
  const { createTenantContext } = load(
    'src/features/authentication/application/tenant-context.ts',
  );
  const { createSessionCoordinator } = load(
    'src/features/authentication/application/session-coordinator.ts',
  );
  const identity = {
    userId: shop,
    email: 'fixture@example.invalid',
    emailConfirmed: true,
    isAnonymous: false,
  };
  const members = [shop, other].map((id) => ({
    id,
    userId: identity.userId,
    barbershopId: id,
    role: 'administrator',
    status: 'active',
  }));
  let name = 'Original',
    readMembers = async () => members;
  const context = createTenantContext({
    listOwnMemberships: () => readMembers(),
    getBarbershop: async (id) => ({ id, name: id === other ? name : 'First' }),
    preference: {
      get: async () => other,
      set: async () => {},
      remove: async () => {},
    },
  });
  const profile = {
    userId: identity.userId,
    displayName: 'Owner',
    phone: null,
  };
  const source = createSessionCoordinator({
    auth: {
      subscribe: () => () => {},
      restoreAndVerify: async () => ({ kind: 'authenticated', identity }),
    },
    profiles: {
      getOwnProfile: async () => profile,
      ensureOwnProfile: async () => profile,
    },
    context,
  });
  await source.restoreAndVerify();
  assert.equal(source.getSnapshot().context.context.barbershopId, other);
  name = 'Juanito';
  let release;
  readMembers = () =>
    new Promise((resolve) => {
      release = resolve;
    });
  const observed = [];
  const off = source.subscribe(() => {
    observed.push(source.getSnapshot().context.kind);
  });
  const updating = source.refreshContext();
  assert.equal(source.getSnapshot().context.kind, 'selected');
  release(members);
  await updating;
  assert.equal(source.getSnapshot().context.barbershop.name, 'Juanito');
  assert.equal(source.getSnapshot().context.context.barbershopId, other);
  assert.ok(observed.every((kind) => kind === 'selected'));
  off();
  source.dispose();
});
