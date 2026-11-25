import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCore } from './load-core.mjs';
import { detail, id } from './booking-payload-fixture.mjs';

const deferred = () => {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
};
function fixture(overrides = {}) {
  let scope = { userId: id(90), generation: 1, contextKey: 'none' };
  const calls = [];
  const shop = {
    barbershopId: id(1),
    name: 'Local',
    address: 'Dirección',
    publicContact: '',
    publicationState: 'published',
  };
  const { createPrivateHome } = loadCore(
    'src/features/reservations/application/private-home.ts',
  );
  const app = createPrivateHome({
    scope: () => scope,
    offers: {
      listVisibleShops: async (cursor, name) => {
        calls.push([cursor, name]);
        return [shop];
      },
      getCatalog: async () => ({
        ...shop,
        services: [],
        professionals: [],
        capabilities: [],
      }),
      ...overrides.offers,
    },
    listOwn: overrides.listOwn ?? (async () => [detail]),
  });
  return {
    app,
    calls,
    shop,
    scope: (value) => {
      scope = value;
    },
  };
}
test('discovery reads catalog and own reservations without a booking mutation port', async () => {
  const { app, calls } = fixture();
  await Promise.all([app.search('Local'), app.loadOwn()]);
  assert.equal(app.getSnapshot().shops[0].name, 'Local');
  assert.equal(app.getSnapshot().own[0].id, detail.id);
  assert.deepEqual(calls, [[null, 'Local']]);
});
test('late search and catalog responses cannot replace newer selections', async () => {
  const old = deferred(),
    catalog = deferred();
  const { app, shop } = fixture({
    offers: {
      listVisibleShops: (_, name) =>
        name === 'old' ? old.promise : Promise.resolve([]),
      getCatalog: () => catalog.promise,
    },
  });
  const first = app.search('old');
  await app.search('new');
  old.resolve([shop]);
  await first;
  assert.equal(app.getSnapshot().shops.length, 0);
  const selection = app.openShop(id(1));
  app.closeShop();
  catalog.resolve({ ...shop, services: [] });
  await selection;
  assert.equal(app.getSnapshot().offer, null);
});
test('logout or context change discards pending private data and resets snapshots', async () => {
  const pending = deferred();
  const { app, scope } = fixture({ listOwn: () => pending.promise });
  const request = app.loadOwn();
  scope(null);
  app.invalidateScope();
  pending.resolve([detail]);
  await request;
  assert.equal(app.getSnapshot().own.length, 0);
  assert.equal(app.getSnapshot().ownPhase, 'idle');
  await app.search('x');
  assert.equal(app.getSnapshot().shops.length, 0);
});
test('pagination retains the submitted query and ignores a duplicate load', async () => {
  const page = deferred();
  const { app, calls, shop } = fixture();
  await app.search('consulta');
  assert.equal(app.getSnapshot().hasMore, false);
  const f = fixture({
    offers: {
      listVisibleShops: async (cursor, name) => {
        calls.push([cursor, name]);
        return cursor
          ? page.promise
          : Array.from({ length: 50 }, (_, i) => ({
              ...shop,
              barbershopId: id(i + 1),
            }));
      },
    },
  });
  await f.app.search('consulta');
  const first = f.app.more();
  const second = f.app.more();
  page.resolve([]);
  await Promise.all([first, second]);
  assert.equal(calls.filter(([cursor]) => cursor !== null).length, 1);
  assert.deepEqual(calls.at(-1), [id(50), 'consulta']);
});
test('read failure is recoverable and never converted into a successful empty result', async () => {
  let fail = true;
  const { app } = fixture({
    listOwn: async () => {
      if (fail) throw Error('network');
      return [];
    },
  });
  await app.loadOwn();
  assert.equal(app.getSnapshot().ownPhase, 'error');
  fail = false;
  await app.loadOwn();
  assert.equal(app.getSnapshot().ownPhase, 'ready');
});
test('next appointment selects the nearest future confirmed reservation', () => {
  const { nextAppointment } = loadCore(
    'src/features/reservations/application/private-home.ts',
  );
  const now = Date.parse('2026-11-18T14:00:00Z');
  assert.equal(
    nextAppointment(
      [
        { ...detail, id: id(7), startsAt: '2026-11-17T15:00:00Z' },
        {
          ...detail,
          id: id(8),
          startsAt: '2026-11-18T14:30:00Z',
          state: 'cancelled',
        },
        { ...detail, id: id(9), startsAt: '2026-11-19T15:00:00Z' },
        detail,
      ],
      now,
    ).id,
    detail.id,
  );
  assert.equal(nextAppointment([], now), null);
});

test('wrong shop response is rejected and an invalid identifier never reaches the port', async () => {
  const calls = [];
  const { app, shop } = fixture({
    offers: {
      getCatalog: async (id) => {
        calls.push(id);
        return { ...shop, barbershopId: 'foreign' };
      },
    },
  });
  await app.openShop('invalid');
  assert.equal(calls.length, 0);
  await app.openShop(id(1));
  assert.equal(app.getSnapshot().offerPhase, 'error');
  assert.equal(app.getSnapshot().offer, null);
});

test('overlong searches never reach the port and disposal discards a pending response', async () => {
  const pending = deferred();
  const { app, calls } = fixture();
  await app.search('x'.repeat(201));
  assert.equal(calls.length, 0);
  assert.equal(app.getSnapshot().shopsPhase, 'error');
  const f = fixture({ listOwn: () => pending.promise });
  const request = f.app.loadOwn();
  f.app.dispose();
  pending.resolve([detail]);
  await request;
  assert.equal(f.app.getSnapshot().own.length, 0);
});
