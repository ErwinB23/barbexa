import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
import { fixture } from './fixtures/composition.mjs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = process.cwd();
const nativeRequire = createRequire(path.join(root, 'package.json'));
const actor = '11111111-1111-4111-8111-111111111111';
const nextTick = () => new Promise((resolve) => queueMicrotask(resolve));

test('login and local logout reuse the same SDK and 002 profile composition on Web then Android', async () => {
  for (const platform of ['web', 'android']) {
    const f = fixture(platform);
    f.auth.signInWithPassword = async () => ({
      data: { session: {} },
      error: null,
    });
    f.auth.getUser = async () => ({
      data: {
        user: {
          id: actor,
          email: 'local@example.invalid',
          email_confirmed_at: '2026-11-14',
          is_anonymous: false,
        },
      },
      error: null,
    });
    f.auth.signOut = async (options) => {
      assert.equal(options.scope, 'local');
      await f.storage.removeItem(f.options.auth.storageKey);
      return { error: null };
    };
    const app = f.foundation.createRegistrationApplication();
    await app.signIn({
      email: 'local@example.invalid',
      password: 'fictitious-test-only',
    });
    assert.equal(app.getSnapshot().kind, 'ready');
    assert.equal(app.getSnapshot().profile.displayName, 'Technical');
    assert.equal(f.counts().factories, 1);
    await app.signOutCurrent();
    assert.equal(app.getSnapshot().kind, 'signed-out');
    const requests = f.calls.length;
    await assert.rejects(() => f.foundation.tenant.getOwnProfile());
    assert.equal(f.calls.length, requests);
    f.foundation.dispose();
  }
});

test('Android development composition wires the exact local origin into Auth and tenant HTTP', async () => {
  const f = fixture('android', true, 'http://192.168.10.20:54421');
  await f.foundation.tenant.getOwnProfile();
  assert.equal(f.calls.length, 2);
  assert.ok(
    f.calls.every((call) => call.url.startsWith('http://192.168.10.20:54421/')),
  );
  f.foundation.dispose();
  assert.throws(() => fixture('android', false, 'http://192.168.10.20:54421'));
  assert.throws(() => fixture('web', true, 'http://192.168.10.20:54421'));
});
test('registration application reuses existing 002 own-profile reads through composition on Web and Android', async () => {
  for (const platform of ['web', 'android']) {
    const f = fixture(platform);
    let signups = 0;
    f.auth.signUp = async () => {
      signups++;
      return { data: { session: {} }, error: null };
    };
    f.auth.getUser = async () => ({
      data: {
        user: {
          id: actor,
          email: 'test@example.invalid',
          email_confirmed_at: '2026-11-14T00:00:00Z',
          is_anonymous: false,
        },
      },
      error: null,
    });
    assert.equal(typeof f.foundation.createRegistrationApplication, 'function');
    const application = f.foundation.createRegistrationApplication();
    assert.equal(f.foundation.createRegistrationApplication(), application);
    await application.register({
      email: 'test@example.invalid',
      password: 'test-only-not-real',
      displayName: 'New data must not overwrite profile',
      phone: null,
    });
    const state = application.getSnapshot();
    assert.equal(state.kind, 'ready');
    assert.equal(state.profile.displayName, 'Technical');
    assert.equal(signups, 1);
    assert.equal(
      f.calls.filter((c) => c.url.includes('/rest/v1/profiles')).length,
      1,
    );
    assert.equal(
      f.calls.filter((c) => c.url.includes('/rest/v1/barbershop_memberships'))
        .length,
      1,
    );
    assert.equal(f.calls.length, 4);
    f.foundation.dispose();
  }
});

test('one SDK and one observer, persisted PKCE, public immutable snapshot without credentials', () => {
  const f = fixture();
  assert.equal(f.counts().factories, 1);
  assert.equal(f.options.auth.flowType, 'pkce');
  assert.equal(f.options.auth.persistSession, true);
  assert.equal(f.options.auth.detectSessionInUrl, false);
  assert.equal(f.options.auth.storage, f.storage);
  const a = f.foundation.application.subscribe(() => {}),
    b = f.foundation.application.subscribe(() => {});
  assert.equal(f.counts().subscriptions, 1);
  assert.equal(f.foundation.application.getSnapshot().kind, 'resolving');
  assert.equal(Object.isFrozen(f.foundation.application.getSnapshot()), true);
  assert.equal(
    JSON.stringify(f.foundation.application.getSnapshot()).includes('token'),
    false,
  );
  a();
  b();
  f.foundation.dispose();
  assert.equal(f.counts().unsubscribes, 1);
});

test('Auth events are deferred, no SDK reentrant reads, unsubscribe drops queued work', async () => {
  const f = fixture();
  let notifications = 0;
  const off = f.foundation.application.subscribe(() => {
    notifications++;
  });
  f.emit('SIGNED_OUT');
  assert.equal(notifications, 0);
  assert.equal(f.counts().sessionReads, 0);
  await nextTick();
  assert.equal(f.foundation.application.getSnapshot().kind, 'signed-out');
  assert.equal(notifications, 1);
  f.emit('SIGNED_IN');
  off();
  f.foundation.dispose();
  await nextTick();
  assert.equal(notifications, 1);
});

test('existing tenant transport gets token privately and verifies actor; recovery blocks ordinary operations', async () => {
  const f = fixture();
  f.foundation.application.subscribe(() => {});
  const profile = await f.foundation.tenant.getOwnProfile();
  assert.equal(profile.userId, actor);
  assert.equal(f.calls.length, 2);
  assert.equal(f.calls[0].url.endsWith('/auth/v1/user'), true);
  assert.equal(f.calls[0].authorization, 'Bearer opaque-unit-token');
  assert.equal('createOwnBarbershop' in f.foundation.tenant, false);
  f.emit('PASSWORD_RECOVERY');
  await assert.rejects(
    f.foundation.tenant.getOwnProfile(),
    (e) => e.code === 'UNAUTHENTICATED',
  );
  assert.equal(f.calls.length, 2);
  await nextTick();
  assert.equal(f.foundation.application.getSnapshot().kind, 'recovery');
  f.foundation.dispose();
});

test('signed-out events invalidate an in-flight token read', async () => {
  const f = fixture();
  f.foundation.application.subscribe(() => {});
  let release;
  f.auth.getSession = () =>
    new Promise((r) => {
      release = r;
    });
  const operation = f.foundation.tenant.getOwnProfile();
  f.emit('SIGNED_OUT');
  release({ data: { session: { access_token: 'stale' } }, error: null });
  await assert.rejects(operation, (e) => e.code === 'UNAUTHENTICATED');
  assert.equal(f.calls.length, 0);
  f.foundation.dispose();
});

test('reject privileged key or unsafe target before SDK construction', () => {
  const f = fixture();
  const { createAuthFoundation } = f.load(
    path.join(root, 'src/composition/auth-composition.ts'),
  );
  for (const input of [
    {
      baseUrl: 'https://technical.supabase.co',
      publicKey: 'sb_secret_not_allowed',
    },
    { baseUrl: 'http://unsafe.example', publicKey: 'sb_publishable_unit_test' },
  ])
    assert.throws(
      () =>
        createAuthFoundation({
          ...input,
          environment: 'test',
          project: 'technical',
          storage: f.storage,
        }),
      (e) => e.code === 'invalid-input',
    );
  assert.equal(f.counts().factories, 1);
  f.foundation.dispose();
});

test('Android bridge uses Expo crypto; SDK PKCE helpers produce S256 without Math.random', async () => {
  const f = fixture('android');
  assert.equal(typeof f.globals.crypto?.getRandomValues, 'function');
  assert.equal(typeof f.globals.crypto?.subtle?.digest, 'function');
  // Exercise installed SDK algorithms in an isolated realm with insecure RNG forbidden.
  const code = fs.readFileSync(
    path.join(root, 'node_modules/@supabase/auth-js/dist/main/lib/helpers.js'),
    'utf8',
  );
  const helperModule = { exports: {} };
  const safeMath = Object.create(Math);
  safeMath.random = () => {
    throw Error('insecure random used');
  };
  const sdkRequire = createRequire(
    path.join(root, 'node_modules/@supabase/auth-js/dist/main/lib/helpers.js'),
  );
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
    crypto: f.globals.crypto,
    TextEncoder,
    Uint8Array,
    Uint32Array,
    btoa,
    Math: safeMath,
    console,
  })(sdkRequire, helperModule, helperModule.exports);
  const verifier = helperModule.exports.generatePKCEVerifier();
  const challenge = await helperModule.exports.generatePKCEChallenge(verifier);
  assert.equal(typeof verifier, 'string');
  assert.notEqual(verifier, challenge);
  assert.match(challenge, /^[A-Za-z0-9_-]{43}$/);
  f.foundation.dispose();
});

test('presentation receives only application, provider does not construct a second SDK', () => {
  const f = fixture();
  const { AuthProvider } = f.load(
    path.join(root, 'src/composition/auth-provider.tsx'),
  );
  const { useAuth } = f.load(
    path.join(root, 'src/features/authentication/presentation/use-auth.ts'),
  );
  function Consumer() {
    const snapshot = useAuth();
    return React.createElement('span', null, snapshot.kind);
  }
  assert.match(
    renderToStaticMarkup(
      React.createElement(
        AuthProvider,
        { application: f.foundation.application },
        React.createElement(Consumer),
      ),
    ),
    /resolving/,
  );
  assert.equal(f.counts().factories, 1);
  f.foundation.dispose();
});

test('Web preserves existing crypto; Android bridge preserves receivers of partial APIs and rejects unsupported digest', async () => {
  const web = fixture();
  assert.equal(web.globals.crypto, webcrypto);
  web.foundation.dispose();
  const f = fixture('android');
  const module = f.load(
    path.join(
      root,
      'src/features/authentication/infrastructure/sdk-runtime.native.ts',
    ),
  );
  const existing = {
    getRandomValues(array) {
      assert.equal(this, existing);
      return array;
    },
  };
  Object.defineProperty(f.globals, 'crypto', {
    value: existing,
    configurable: true,
  });
  module.prepareSdkRuntime();
  const bytes = new Uint8Array(16);
  assert.equal(f.globals.crypto.getRandomValues(bytes), bytes);
  await assert.rejects(
    f.globals.crypto.subtle.digest('SHA-1', bytes),
    (e) => e.code === 'provider-unavailable',
  );
  f.foundation.dispose();
});

test('real SDK constructor with empty storage makes no HTTP request or user operation', async () => {
  const f = fixture();
  const { createAuthFoundation } = f.load(
    path.join(root, 'src/composition/auth-composition.ts'),
  );
  const { createClient } = nativeRequire('@supabase/supabase-js');
  let requests = 0;
  const foundation = createAuthFoundation({
    baseUrl: 'https://technical.supabase.co',
    publicKey: 'sb_publishable_unit_test',
    environment: 'test',
    project: 'real-sdk-probe',
    storage: f.storage,
    clientFactory: (url, key, config) =>
      createClient(url, key, {
        ...config,
        auth: { ...config.auth, autoRefreshToken: false },
        global: {
          fetch: async () => {
            requests++;
            throw Error('network forbidden');
          },
        },
      }),
  });
  await assert.rejects(
    foundation.tenant.getOwnProfile(),
    (e) => e.code === 'UNAUTHENTICATED',
  );
  assert.equal(requests, 0);
  foundation.dispose();
  f.foundation.dispose();
});
test('real SDK signup uses secure PKCE and disposing the view/client preserves its verifier', async () => {
  const f = fixture();
  const { createAuthFoundation } = f.load(
    path.join(root, 'src/composition/auth-composition.ts'),
  );
  const { createClient } = nativeRequire('@supabase/supabase-js');
  const values = new Map();
  let requests = 0;
  const storage = {
    getItem: async (k) => values.get(k) ?? null,
    setItem: async (k, v) => {
      values.set(k, v);
    },
    removeItem: async (k) => {
      values.delete(k);
    },
  };
  const foundation = createAuthFoundation({
    baseUrl: 'https://technical.supabase.co',
    publicKey: 'sb_publishable_test',
    environment: 'test',
    project: 'pkce-registration',
    storage,
    confirmationRedirectUrl: 'http://localhost:8081/auth/callback',
    clientFactory: (url, key, config) =>
      createClient(url, key, {
        ...config,
        auth: { ...config.auth, autoRefreshToken: false },
        global: {
          fetch: async (url, init) => {
            requests++;
            assert.ok(String(url).includes('/signup'));
            const body = JSON.parse(init.body);
            assert.equal(body.code_challenge_method, 's256');
            assert.ok(body.code_challenge.length > 20);
            return new Response(
              JSON.stringify({
                user: {
                  id: actor,
                  email: 'test@example.invalid',
                  is_anonymous: false,
                },
                session: null,
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } },
            );
          },
        },
      }),
  });
  try {
    const application = foundation.createRegistrationApplication();
    await application.register({
      email: 'test@example.invalid',
      password: 'test-only-not-real',
      displayName: 'Test',
      phone: null,
    });
    assert.equal(application.getSnapshot().kind, 'confirmation-required');
    assert.equal(requests, 1);
    const verifierKey = [...values.keys()].find((k) =>
      k.endsWith('-code-verifier'),
    );
    assert.ok(verifierKey);
    assert.ok(values.get(verifierKey).length > 20);
    foundation.dispose();
    assert.ok(values.has(verifierKey));
  } finally {
    foundation.dispose();
    f.foundation.dispose();
    values.clear();
  }
});

test('SDK channel/storage key differs across projects and ambiguous hyphen namespaces', () => {
  const f = fixture();
  const { createAuthFoundation } = f.load(
    path.join(root, 'src/composition/auth-composition.ts'),
  );
  const keys = [];
  for (const [environment, project] of [
    ['a-b', 'c'],
    ['a', 'b-c'],
    ['test', 'other-project'],
  ]) {
    const foundation = createAuthFoundation({
      baseUrl: 'https://technical.supabase.co',
      publicKey: 'sb_publishable_unit_test',
      environment,
      project,
      storage: f.storage,
    });
    keys.push(f.options.auth.storageKey);
    foundation.dispose();
  }
  assert.equal(new Set(keys).size, 3);
  f.foundation.dispose();
});

test('server render remains public even if an injected source already has private state', () => {
  const f = fixture();
  const { AuthProvider } = f.load(
    path.join(root, 'src/composition/auth-provider.tsx'),
  );
  const { useAuth } = f.load(
    path.join(root, 'src/features/authentication/presentation/use-auth.ts'),
  );
  function Consumer() {
    return React.createElement('span', null, useAuth().kind);
  }
  const application = {
    getSnapshot: () => ({ kind: 'ready', privateMarker: 'must-not-render' }),
    subscribe: () => () => {},
  };
  const markup = renderToStaticMarkup(
    React.createElement(
      AuthProvider,
      { application },
      React.createElement(Consumer),
    ),
  );
  assert.match(markup, /resolving/);
  assert.equal(markup.includes('must-not-render'), false);
  f.foundation.dispose();
});
