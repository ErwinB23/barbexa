import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
function fixture() {
  const storage = new Map([
    ['auth-test', 'fictitious-session'],
    ['unrelated', 'preserve-me'],
  ]);
  const calls = { scopes: [], getUser: 0 };
  let config, event;
  const controls = {
    error: null,
    confirmed: true,
    anonymous: false,
    network: false,
    deleteFails: false,
    pending: null,
    logoutStatus: 204,
  };
  const driver = {
    getItem: async (k) => storage.get(k) ?? null,
    setItem: async (k, v) => {
      storage.set(k, v);
    },
    removeItem: async (k) => {
      if (controls.deleteFails) throw Error('fixture-storage-denial');
      storage.delete(k);
    },
  };
  const sdk = {
    auth: {
      onAuthStateChange: (f) => {
        event = f;
        return { data: { subscription: { unsubscribe() {} } } };
      },
      stopAutoRefresh() {},
      startAutoRefresh() {},
      getSession: async () => ({
        data: {
          session: storage.has('auth-test')
            ? { access_token: 'fictitious-access' }
            : null,
        },
        error: null,
      }),
      getUser: async () => {
        calls.getUser++;
        return {
          data: {
            user: {
              id: '11111111-1111-4111-8111-111111111111',
              email: 'local@example.invalid',
              email_confirmed_at: controls.confirmed ? '2026-11-14' : null,
              is_anonymous: controls.anonymous,
            },
          },
          error: null,
        };
      },
      signInWithPassword: async ({ password }) => {
        calls.password = password;
        if (controls.pending) await controls.pending;
        if (controls.error)
          return { data: { session: null }, error: controls.error };
        storage.set('auth-test', 'fictitious-session');
        event('SIGNED_IN');
        return {
          data: { session: {}, weakPassword: controls.weakPassword },
          error: null,
        };
      },
      signOut: async (options) => {
        calls.scopes.push(options.scope);
        await driver.removeItem('auth-test');
        event('SIGNED_OUT');
        if (controls.network)
          return { error: { name: 'AuthRetryableFetchError', status: 0 } };
        await config.global.fetch(
          'https://fixture.supabase.co/auth/v1/logout?scope=local',
          { method: 'POST' },
        );
        return { error: null };
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
      fetch: async () => new Response(null, { status: controls.logoutStatus }),
    })(
      (n) =>
        n === '@supabase/supabase-js'
          ? {
              createClient: (_url, _key, options) => {
                config = options;
                return sdk;
              },
            }
          : load(path.resolve(path.dirname(file), n)),
      module,
      module.exports,
    );
    return module.exports;
  }
  const { createSupabaseAuthAdapter } = load(
    path.resolve(
      'src/features/authentication/infrastructure/supabase-auth-adapter.ts',
    ),
  );
  return {
    adapter: createSupabaseAuthAdapter({
      baseUrl: 'https://fixture.supabase.co',
      publicKey: 'sb_publishable_fixture',
      storage: driver,
      storageKey: 'auth-test',
    }),
    controls,
    storage,
    calls,
  };
}
test('adapter verifies login through getUser and logout uses only scope local without erasing unrelated storage', async () => {
  const f = fixture();
  assert.equal(
    (await f.adapter.signIn('local@example.invalid', 'fictitious-password'))
      .kind,
    'authenticated',
  );
  assert.equal(f.calls.getUser, 1);
  const result = await f.adapter.signOutCurrent();
  assert.equal(result.remoteRevocationConfirmed, true);
  assert.deepEqual(f.calls.scopes, ['local']);
  assert.equal(f.storage.has('auth-test'), false);
  assert.equal(f.storage.get('unrelated'), 'preserve-me');
  assert.equal(await f.adapter.getAccessToken(), null);
});
test('a legacy password accepted by Auth can log in even when the provider reports a weakness', async () => {
  const f = fixture();
  f.controls.weakPassword = { reasons: ['length', 'characters'] };
  const result = await f.adapter.signIn('local@example.invalid', 'old123');
  assert.equal(result.kind, 'authenticated');
  assert.equal(f.calls.password, 'old123');
});
test('adapter distinguishes invalid credentials unconfirmed and network failure without trusting user metadata', async () => {
  for (const [error, expected] of [
    [{ code: 'invalid_credentials', status: 400 }, 'credentials-rejected'],
    [{ code: 'email_not_confirmed', status: 400 }, 'confirmation-required'],
    [{ name: 'AuthRetryableFetchError', status: 0 }, 'network-unavailable'],
  ]) {
    const f = fixture();
    f.controls.error = error;
    await assert.rejects(
      () => f.adapter.signIn('local@example.invalid', 'fictitious'),
      (e) => e.code === expected,
    );
    assert.equal(await f.adapter.getAccessToken(), null);
  }
  for (const prop of ['confirmed', 'anonymous']) {
    const f = fixture();
    f.controls[prop] = prop === 'anonymous';
    await assert.rejects(() =>
      f.adapter.signIn('local@example.invalid', 'fictitious'),
    );
    assert.equal(await f.adapter.getAccessToken(), null);
  }
});
test('offline logout remains local-only and deletion failure is explicitly incomplete', async () => {
  const f = fixture();
  f.controls.network = true;
  assert.equal(
    (await f.adapter.signOutCurrent()).remoteRevocationConfirmed,
    false,
  );
  assert.equal(f.storage.has('auth-test'), false);
  const g = fixture();
  g.controls.deleteFails = true;
  await assert.rejects(
    () => g.adapter.signOutCurrent(),
    (e) => e.code === 'persistence-failed',
  );
  assert.equal(await g.adapter.getAccessToken(), null);
  g.controls.deleteFails = false;
  await g.adapter.signOutCurrent();
  assert.equal(g.storage.has('auth-test'), false);
});
test('logout gates access immediately and waits for a late credential write before its final cleanup', async () => {
  const f = fixture();
  let resolve;
  f.controls.pending = new Promise((r) => {
    resolve = r;
  });
  const login = f.adapter
    .signIn('local@example.invalid', 'fictitious')
    .catch((e) => e.code);
  const logout = f.adapter.signOutCurrent();
  assert.equal(await f.adapter.getAccessToken(), null);
  resolve();
  await login;
  await logout;
  assert.equal(f.storage.has('auth-test'), false);
  assert.equal(await f.adapter.getAccessToken(), null);
});
test('logout removes only indexed own PKCE slots and never claims remote success on a swallowed HTTP rejection', async () => {
  const f = fixture();
  f.storage.set(
    'auth-test-flows-code-verifier',
    JSON.stringify(['controlled-flow']),
  );
  f.storage.set(
    'auth-test-flow-controlled-flow-code-verifier',
    'fictitious-verifier',
  );
  f.storage.set('auth-test-user', 'fictitious-user');
  f.controls.logoutStatus = 403;
  assert.equal(
    (await f.adapter.signOutCurrent()).remoteRevocationConfirmed,
    false,
  );
  assert.ok([...f.storage.keys()].every((k) => !k.startsWith('auth-test')));
  assert.equal(f.storage.get('unrelated'), 'preserve-me');
});
test('corrupt verifier index and failed cleanup block new credentials until explicit successful cleanup', async () => {
  const f = fixture();
  f.storage.set('auth-test-flows-code-verifier', 'not-json');
  await assert.rejects(
    () => f.adapter.signOutCurrent(),
    (e) => e.code === 'persistence-failed',
  );
  await assert.rejects(
    () => f.adapter.signIn('local@example.invalid', 'fictitious'),
    (e) => e.code === 'persistence-failed',
  );
  f.storage.delete('auth-test-flows-code-verifier');
  await f.adapter.signOutCurrent();
  assert.equal(f.storage.has('auth-test'), false);
});
