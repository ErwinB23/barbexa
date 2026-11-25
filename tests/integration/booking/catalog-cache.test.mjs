import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createCoreLoader } from './load-core.mjs';
import { detail, id } from './booking-payload-fixture.mjs';
const entry =
  'src/features/barbershop-operation/infrastructure/catalog-cache.ts';
const catalog = (tenant) => ({
  barbershopId: tenant,
  name: 'Commercial fixture',
  publicationState: 'published',
  publicContact: 'Public',
  address: 'Local',
  policies: {},
  services: [],
  professionals: [],
  capabilities: [],
});
function fixture() {
  const mod = fs.existsSync(entry) ? createCoreLoader()(entry) : {};
  assert.equal(typeof mod.createCatalogCache, 'function');
  return mod.createCatalogCache;
}
test('catalog cache keys tenant/version/account and expires exactly at 30 seconds', async () => {
  let now = 100,
    calls = 0;
  const cache = fixture()({ now: () => now });
  const read = (owner, tenant, version = 'v1') =>
    cache.read(owner, tenant, version, async () => {
      calls++;
      return catalog(tenant);
    });
  await read('A', 'one');
  const hit = await read('A', 'one');
  assert.equal(calls, 1);
  hit.name = 'mutated by caller';
  assert.equal((await read('A', 'one')).name, 'Commercial fixture');
  await read('A', 'two');
  await read('A', 'one', 'v2');
  assert.equal(calls, 3);
  now = 30100;
  await read('A', 'one');
  assert.equal(calls, 4);
  await read('B', 'one');
  assert.equal(calls, 5);
});
test('mutation/session invalidation drops late reads, coalesces inflight requests and never caches failures', async () => {
  const cache = fixture()();
  let finish,
    calls = 0;
  const loader = () => {
    calls++;
    return new Promise((r) => {
      finish = r;
    });
  };
  const a = cache.read('A', 'one', 'v1', loader),
    b = cache.read('A', 'one', 'v1', loader);
  assert.equal(calls, 1);
  cache.invalidate();
  finish(catalog('one'));
  await assert.rejects(a);
  await assert.rejects(b);
  await assert.rejects(
    cache.read('A', 'one', 'v1', async () => {
      throw Error('dependency');
    }),
  );
  cache.setScope('A:1:one');
  await cache.read('A', 'one', 'v1', async () => catalog('one'));
  cache.setScope('A:2:two');
  let refetched = false;
  await cache.read('A', 'one', 'v1', async () => {
    refetched = true;
    return catalog('one');
  });
  assert.ok(refetched);
  cache.dispose();
  await assert.rejects(
    cache.read('A', 'one', 'v1', async () => catalog('one')),
  );
});
test('shared adapter cache verifies Auth on every hit, invalidates mutations and excludes private reads', async () => {
  const load = createCoreLoader(),
    { createCatalogCache } = load(entry),
    { createOperationHttpAdapter } = load(
      'src/features/barbershop-operation/infrastructure/operation-http-adapter.ts',
    );
  const cache = createCatalogCache();
  let auth = 0,
    catalogs = 0,
    privateReads = 0,
    denied = false,
    failMutation = false;
  const dto = {
    barbershopId: id(1),
    name: 'Public',
    publicationState: 'published',
    address: 'Local',
    publicContact: 'Local',
    policies: detail.policySnapshot,
    services: [],
    professionals: [],
    capabilities: [],
  };
  const opts = {
    baseUrl: 'http://127.0.0.1:54421',
    publicKey: 'sb_publishable_fixture',
    getAccessToken: async () => 'fixture',
    expectedUser: () => id(4),
    catalogCache: cache,
    fetcher: async (url) => {
      const p = new URL(url).pathname;
      let value = null,
        status = 200;
      if (p === '/auth/v1/user') {
        auth++;
        value = {
          id: id(4),
          is_anonymous: false,
          email_confirmed_at: 'confirmed',
        };
        if (denied) {
          status = 401;
          value = {};
        }
      } else if (p.endsWith('/get_booking_catalog')) {
        catalogs++;
        value = dto;
      } else if (p.endsWith('/list_own_staff_invitations')) {
        privateReads++;
        value = [];
      } else if (failMutation) {
        status = 503;
        value = { error: { code: 'DEPENDENCY_UNAVAILABLE' } };
      }
      return { ok: status === 200, status, json: async () => value };
    },
  };
  const reader = createOperationHttpAdapter(opts),
    writer = createOperationHttpAdapter(opts);
  await reader.getCatalog(id(1));
  await reader.getCatalog(id(1));
  assert.equal(auth, 2);
  assert.equal(catalogs, 1);
  await reader.listOwnInvitations();
  await reader.listOwnInvitations();
  assert.equal(privateReads, 2);
  await writer.setPublication(id(1), 'paused');
  await reader.getCatalog(id(1));
  assert.equal(catalogs, 2);
  failMutation = true;
  await assert.rejects(writer.setPublication(id(1), 'paused'));
  await reader.getCatalog(id(1));
  assert.equal(catalogs, 3);
  denied = true;
  await assert.rejects(
    reader.getCatalog(id(1)),
    (e) => e.code === 'UNAUTHENTICATED',
  );
  assert.equal(catalogs, 3);
  denied = false;
  dto.name = 'Other project catalog';
  const other = createOperationHttpAdapter({
    ...opts,
    baseUrl: 'https://another.example',
  });
  assert.equal((await other.getCatalog(id(1))).name, 'Other project catalog');
});
