import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
const userId = '11111111-1111-4111-8111-111111111111';
const tokenFor = (sub) => {
  const claims = { sub, session_id: userId };
  return `a.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.b`;
};
function fixture() {
  let emit;
  const values = new Map([['session-purpose', 'normal']]);
  const calls = { sessions: 0, users: 0, refresh: [] };
  const controls = {
    present: true,
    token: 'fictitious-token',
    userId,
    sessionError: null,
    userError: null,
    purpose: 'normal',
    userPending: null,
  };
  const sdk = {
    auth: {
      broadcastChannel: {
        close() {
          calls.closed = true;
        },
      },
      onAuthStateChange: (callback) => {
        emit = callback;
        return { data: { subscription: { unsubscribe() {} } } };
      },
      stopAutoRefresh: () => calls.refresh.push(false),
      startAutoRefresh: () => calls.refresh.push(true),
      getSession: async () => {
        calls.sessions++;
        return {
          data: {
            session: controls.present ? { access_token: controls.token } : null,
          },
          error: controls.sessionError,
        };
      },
      getUser: async () => {
        calls.users++;
        if (controls.userPending) await controls.userPending;
        return {
          data: {
            user: {
              id: controls.userId,
              email: 'fixture@example.invalid',
              email_confirmed_at: '2026-11-14',
              is_anonymous: false,
            },
          },
          error: controls.userError,
        };
      },
    },
  };
  function load(file) {
    if (!file.endsWith('.ts')) file += '.ts';
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
      URL,
      atob,
      queueMicrotask,
      __DEV__: false,
      fetch,
    })(
      (n) =>
        n === '@supabase/supabase-js'
          ? { createClient: () => sdk }
          : load(path.resolve(path.dirname(file), n)),
      module,
      module.exports,
    );
    return module.exports;
  }
  const module = load(
    path.resolve(
      'src/features/authentication/infrastructure/supabase-auth-adapter.ts',
    ),
  );
  const storage = {
    getItem: async (k) => values.get(k) ?? null,
    setItem: async (k, v) => {
      values.set(k, v);
    },
    removeItem: async (k) => {
      values.delete(k);
    },
  };
  return {
    adapter: module.createSupabaseAuthAdapter({
      baseUrl: 'https://fixture.supabase.co',
      publicKey: 'sb_publishable_fixture',
      storageKey: 'session',
      storage,
    }),
    values,
    calls,
    controls,
    sdk,
    emit: (event) => emit(event, {}),
  };
}
test('restore reads SDK session then verifies getUser; native SDK channel is closed without global mutation', async () => {
  const f = fixture();
  assert.equal((await f.adapter.restoreAndVerify()).kind, 'authenticated');
  assert.equal(f.calls.sessions, 1);
  assert.equal(f.calls.users, 1);
  assert.equal(f.calls.closed, true);
  assert.equal(f.sdk.auth.broadcastChannel, null);
  f.adapter.dispose();
});

test('SDK token renewal during getUser/getSession does not masquerade as account invalidation', async () => {
  const f = fixture();
  const original = f.sdk.auth.getUser;
  f.sdk.auth.getUser = async () => {
    f.emit('TOKEN_REFRESHED');
    return original();
  };
  assert.equal((await f.adapter.restoreAndVerify()).kind, 'authenticated');
  const getSession = f.sdk.auth.getSession;
  f.sdk.auth.getSession = async () => {
    f.emit('TOKEN_REFRESHED');
    return getSession();
  };
  assert.equal(await f.adapter.getAccessToken(), 'fictitious-token');
  f.emit('SIGNED_OUT');
  assert.equal(await f.adapter.getAccessToken(), null);
  f.adapter.dispose();
});
test('restore distinguishes absent or rejected session from offline and never releases an unverified token', async () => {
  const absent = fixture();
  absent.controls.present = false;
  assert.equal((await absent.adapter.restoreAndVerify()).kind, 'signed-out');
  assert.equal(absent.calls.users, 0);
  const rejected = fixture();
  rejected.controls.userError = { status: 401 };
  assert.equal((await rejected.adapter.restoreAndVerify()).kind, 'signed-out');
  assert.equal(await rejected.adapter.getAccessToken(), null);
  const offline = fixture();
  offline.controls.sessionError = {
    name: 'AuthRetryableFetchError',
    status: 0,
  };
  await assert.rejects(
    () => offline.adapter.restoreAndVerify(),
    (e) => e.code === 'network-unavailable',
  );
  assert.equal(await offline.adapter.getAccessToken(), null);
});

test('background verification keeps a previously verified actor usable and blocks another actor or rejected credentials', async () => {
  const f = fixture();
  const otherUser = '22222222-2222-4222-8222-222222222222';
  f.controls.token = tokenFor(userId);
  await f.adapter.restoreAndVerify();
  let release;
  f.controls.userPending = new Promise((resolve) => (release = resolve));
  const verification = f.adapter.restoreAndVerify(userId);
  f.emit('TOKEN_REFRESHED');
  assert.equal(await f.adapter.getAccessToken(), f.controls.token);
  f.controls.token = tokenFor(otherUser);
  assert.equal(await f.adapter.getAccessToken(), null);
  f.controls.userId = otherUser;
  release();
  assert.equal((await verification).kind, 'signed-out');
  assert.equal(await f.adapter.getAccessToken(), null);
  f.adapter.dispose();
});
test('pending recovery and missing purpose cannot restore ordinary account access', async () => {
  for (const marker of ['pending', 'recovery', null]) {
    const f = fixture();
    if (marker === null) f.values.delete('session-purpose');
    else f.values.set('session-purpose', marker);
    if (marker === 'recovery') {
      // A marker alone is insufficient: the new update path requires a verified
      // session binding. Valid recovery restart is covered in recovery-links.
      await assert.rejects(
        () => f.adapter.restoreAndVerify(),
        (e) => e.code === 'link-invalid',
      );
      assert.equal(await f.adapter.getAccessToken(), null);
      continue;
    }
    assert.equal(
      (await f.adapter.restoreAndVerify()).kind,
      marker === 'recovery' ? 'recovery' : 'signed-out',
    );
    assert.equal(await f.adapter.getAccessToken(), null);
    assert.equal(f.calls.users, 0);
  }
});
test('invalidation stops refresh and rejects a delayed verification; disposal cannot revive session', async () => {
  const f = fixture();
  let release;
  f.controls.userPending = new Promise((r) => (release = r));
  const p = f.adapter.restoreAndVerify();
  await Promise.resolve();
  await Promise.resolve();
  f.adapter.invalidateSession();
  release();
  await assert.rejects(() => p);
  assert.equal(await f.adapter.getAccessToken(), null);
  f.adapter.setRefreshActive(false);
  assert.equal(f.calls.refresh.at(-1), false);
  f.adapter.dispose();
  await assert.rejects(() => f.adapter.restoreAndVerify());
});
