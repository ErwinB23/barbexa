import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from './load-core.mjs';
const file = 'src/features/notifications/application/inbox.ts';

test('opening multiple notices during refresh queues each read once and waits for server confirmation', async () => {
  const { createInbox } = loadCore(file);
  let finish;
  const writes = [],
    rows = [
      { id: 'one', readAt: null },
      { id: 'two', readAt: null },
    ];
  let delay = false;
  const app = createInbox({
    scope: () => 'user',
    gateway: {
      list: async () => {
        if (delay) {
          delay = false;
          await new Promise((resolve) => {
            finish = resolve;
          });
        }
        return {
          items: rows.map((n) => ({ ...n })),
          unread: rows.filter((n) => !n.readAt).length,
        };
      },
      read: async (id) => {
        writes.push(id);
        rows.find((n) => n.id === id).readAt = 'confirmed';
      },
    },
  });
  await app.load();
  delay = true;
  const refresh = app.refresh();
  const one = app.markRead('one'),
    duplicate = app.markRead('one'),
    two = app.markRead('two');
  assert.equal(writes.length, 0);
  assert.equal(app.getSnapshot().unread, 2);
  finish();
  await Promise.all([refresh, one, duplicate, two]);
  assert.deepEqual(writes, ['one', 'two']);
  assert.equal(app.getSnapshot().unread, 0);
});

test('seen cursor storage is isolated by account and tolerates unavailable or invalid storage', () => {
  const { createInboxSeenStorage } = loadCore(
    'src/features/notifications/infrastructure/inbox-seen-storage.ts',
  );
  const values = new Map();
  const store = createInboxSeenStorage(() => ({
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  }));
  const cursor = { at: '2026-11-22T10:00:00Z', ids: ['one'] };
  store.set('A', cursor);
  assert.equal(JSON.stringify(store.get('A')), JSON.stringify(cursor));
  assert.equal(store.get('B'), null);
  for (const bad of [
    '{',
    '{"at":"invalid","ids":[]}',
    '{"at":"2026-11-22","ids":[2]}',
  ]) {
    values.set('barbexa:notifications-seen:v1:A', bad);
    assert.equal(store.get('A'), null);
  }
  const blocked = createInboxSeenStorage(() => {
    throw Error('blocked');
  });
  assert.equal(blocked.get('A'), null);
  assert.doesNotThrow(() => blocked.set('A', cursor));
});

test('opening the inbox acknowledges loaded notices without writes; only newer notices restore the badge', async () => {
  const { createInbox } = loadCore(file);
  let account = 'A',
    ready = true,
    writes = 0;
  let rows = [{ id: 'one', createdAt: '2026-11-22T10:00:00Z', readAt: null }];
  const saved = new Map();
  const deps = {
    scope: () => account,
    viewer: () => account,
    seen: {
      get: (key) => saved.get(key) ?? null,
      set: (key, value) => saved.set(key, value),
    },
    gateway: {
      list: async () => {
        if (!ready) throw Error('network');
        return { items: rows, unread: rows.length };
      },
      read: async () => {
        writes++;
      },
    },
  };
  const app = createInbox(deps);
  app.acknowledge(); // Does not acknowledge a failed or unfinished query.
  await app.load();
  assert.equal(app.getSnapshot().unseen, 1);
  app.acknowledge();
  assert.equal(app.getSnapshot().unseen, 0);
  assert.equal(app.getSnapshot().unread, 1);
  await app.refresh();
  assert.equal(app.getSnapshot().unseen, 0);
  rows = [
    { id: 'two', createdAt: '2026-11-22T10:00:00Z', readAt: null },
    ...rows,
  ];
  await app.refresh();
  assert.equal(app.getSnapshot().unseen, 1); // Same timestamp, different ID.
  const reloaded = createInbox(deps);
  await reloaded.load();
  assert.equal(reloaded.getSnapshot().unseen, 1);
  account = 'B';
  app.invalidateScope();
  await app.load();
  assert.equal(app.getSnapshot().unseen, 2);
  assert.equal(writes, 0);
  ready = false;
  await app.load();
  app.acknowledge();
  assert.equal(app.getSnapshot().unseen, 2);
});
test('background refresh preserves the visible ready snapshot and unchanged results do not rerender', async () => {
  const { createInbox } = loadCore(file);
  let finish,
    fail = false;
  const data = { items: [{ id: 'one', readAt: null }], unread: 1 };
  let first = true;
  const app = createInbox({
    scope: () => 'user',
    gateway: {
      list: () =>
        first
          ? ((first = false), Promise.resolve(data))
          : new Promise((resolve, reject) => {
              finish = () =>
                fail
                  ? reject(Error('network'))
                  : resolve(JSON.parse(JSON.stringify(data)));
            }),
    },
  });
  await app.load();
  const before = app.getSnapshot();
  const refresh = app.refresh();
  assert.equal(app.getSnapshot(), before);
  finish();
  await refresh;
  assert.equal(app.getSnapshot(), before);
  fail = true;
  const retry = app.refresh();
  finish();
  await retry;
  assert.equal(app.getSnapshot(), before);
});
test('session renewal in the same context keeps the badge; changing context clears private results', async () => {
  const { createInbox } = loadCore(file);
  let scope = 'user:A';
  const app = createInbox({
    scope: () => scope,
    gateway: { list: async () => ({ items: [{ id: 'one' }], unread: 1 }) },
  });
  await app.load();
  const before = app.getSnapshot();
  app.invalidateScope();
  assert.equal(app.getSnapshot(), before);
  scope = 'user:B';
  app.invalidateScope();
  assert.equal(app.getSnapshot().unread, 0);
  assert.equal(app.getSnapshot().items.length, 0);
});
test('HTTP adapter uses the current actor token, forbids arbitrary destinations and distinguishes missing migration from server failure', async () => {
  const { createInboxHttp } = loadCore(
    'src/features/notifications/infrastructure/inbox-http.ts',
  );
  let body = { items: [], unread: 0 },
    status = 200;
  const calls = [];
  const adapter = createInboxHttp({
    baseUrl: 'https://fixture.supabase.co',
    publicKey: 'public-fixture',
    getAccessToken: async () => 'test-only',
    fetcher: async (url, init) => {
      calls.push({ url, init });
      return { ok: status === 200, status, json: async () => body };
    },
  });
  await adapter.list();
  assert.equal(
    calls[0].url,
    'https://fixture.supabase.co/rest/v1/rpc/list_my_notifications',
  );
  assert.equal(calls[0].init.headers.Authorization, 'Bearer test-only');
  assert.equal(calls[0].init.body, '{}');
  status = 404;
  body = { code: 'PGRST202' };
  await assert.rejects(adapter.list(), /NOTIFICATIONS_NOT_INSTALLED/);
  status = 500;
  await assert.rejects(adapter.list(), /DEPENDENCY_UNAVAILABLE/);
  status = 200;
  body = {
    items: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        title: 'Event',
        message: 'Message',
        target: 'https://external.test',
        createdAt: '2026-11-22T10:00:00Z',
        readAt: null,
      },
    ],
    unread: 1,
  };
  await assert.rejects(adapter.list(), /INVALID_RESPONSE/);
});
test('inbox discards late responses after logout and never shares another session history', async () => {
  const { createInbox } = loadCore(file);
  let scope = 'user-A',
    finish;
  const app = createInbox({
    scope: () => scope,
    gateway: { list: () => new Promise((r) => (finish = r)) },
  });
  const pending = app.load();
  scope = 'user-B';
  app.invalidate();
  finish({ items: [{ id: 'private-A' }], unread: 1 });
  await pending;
  assert.equal(app.getSnapshot().items.length, 0);
});
test('marking read is confirmed by server; failed writes never invent read status and concurrent sends are blocked', async () => {
  const { createInbox } = loadCore(file);
  let fail = true,
    calls = 0;
  const row = { id: 'one', readAt: null };
  const app = createInbox({
    scope: () => 'user',
    gateway: {
      list: async () => ({ items: [row], unread: row.readAt ? 0 : 1 }),
      async read() {
        calls++;
        if (fail) throw Error();
        row.readAt = '2026-11-22T12:00:00Z';
      },
    },
  });
  await app.load();
  await app.markRead('one');
  assert.equal(app.getSnapshot().unread, 1);
  fail = false;
  await Promise.all([app.markRead('one'), app.markRead('one')]);
  assert.equal(calls, 2);
  assert.equal(app.getSnapshot().unread, 0);
});

test('deleting one notification waits for server confirmation, deduplicates clicks and updates the list only after success', async () => {
  const { createInbox } = loadCore(file);
  let calls = 0;
  let fail = true;
  let rows = [
    { id: 'one', readAt: null },
    { id: 'two', readAt: null },
  ];
  const app = createInbox({
    scope: () => 'viewer',
    gateway: {
      list: async () => ({ items: rows, unread: rows.length, canRemove: true }),
      read: async () => {},
      remove: async (id) => {
        calls++;
        if (fail) throw Error('controlled');
        rows = rows.filter((row) => row.id !== id);
      },
    },
  });
  await app.load();
  await app.removeNotice('one');
  assert.equal(app.getSnapshot().items.length, 2);
  fail = false;
  await Promise.all([app.removeNotice('one'), app.removeNotice('one')]);
  assert.equal(calls, 2);
  assert.equal(app.getSnapshot().items.length, 1);
  assert.equal(app.getSnapshot().items[0].id, 'two');
  assert.equal(app.getSnapshot().unread, 1);
});

test('delete adapter sends only the notification ID using the current token and requires a positive receipt', async () => {
  const { createInboxHttp } = loadCore(
    'src/features/notifications/infrastructure/inbox-http.ts',
  );
  const calls = [];
  let body = { deleted: true };
  const adapter = createInboxHttp({
    baseUrl: 'https://fixture.supabase.co',
    publicKey: 'fixture',
    getAccessToken: async () => 'current-actor',
    fetcher: async (url, init) => {
      calls.push({ url, init });
      return { ok: true, status: 200, json: async () => body };
    },
  });
  const id = '11111111-1111-4111-8111-111111111111';
  await adapter.remove(id);
  assert.match(calls[0].url, /delete_my_notification$/);
  assert.equal(calls[0].init.body, JSON.stringify({ p_id: id }));
  assert.equal(calls[0].init.headers.Authorization, 'Bearer current-actor');
  body = { deleted: false };
  await assert.rejects(adapter.remove(id), /INVALID_RESPONSE/);
  await assert.rejects(adapter.remove('wrong'), /INVALID_INPUT/);
});

test('a deletion response from a previous account never changes the current inbox', async () => {
  const { createInbox } = loadCore(file);
  let scope = 'A',
    finish;
  let rows = [{ id: 'one', readAt: null }];
  const app = createInbox({
    scope: () => scope,
    gateway: {
      list: async () => ({ items: rows, unread: 1, canRemove: true }),
      remove: () => new Promise((r) => (finish = r)),
      read: async () => {},
    },
  });
  await app.load();
  const pending = app.removeNotice('one');
  scope = 'B';
  app.invalidate();
  rows = [{ id: 'two', readAt: null }];
  await app.load();
  finish();
  await pending;
  assert.equal(app.getSnapshot().items[0].id, 'two');
});
