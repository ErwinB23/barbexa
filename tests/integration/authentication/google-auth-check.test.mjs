import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fixture } from './fixtures/composition.mjs';
const cloud = 'https://vuoncrtkkkquvddunrxx.supabase.co';
const identity = {
  userId: '11111111-1111-4111-8111-111111111111',
  email: 'fixture@example.invalid',
  emailConfirmed: true,
  isAnonymous: false,
};
const publicKey = 'sb_publishable_fixture_for_google_check_only';

test('Cloud check rejects privileged keys, non-development builds and unsupported platforms', () => {
  const f = fixture('web', true),
    { cloudAuthCheckConfig, googleCheckActivation } = f.load(
      path.resolve(
        'src/features/authentication/infrastructure/cloud-auth-check.ts',
      ),
    );
  for (const key of ['sb_secret_fixture', 'eyJ.fixture.jwt', ''])
    assert.throws(() => cloudAuthCheckConfig(key, 'web', true));
  assert.throws(() => cloudAuthCheckConfig(publicKey, 'web', false));
  assert.throws(() => cloudAuthCheckConfig(publicKey, 'ios', true));
  for (const platform of ['web', 'android']) {
    const config = cloudAuthCheckConfig(publicKey, platform, true);
    assert.equal(config.baseUrl, cloud);
    assert.equal(config.project, 'vuoncrtkkkquvddunrxx');
    assert.ok(
      config.callbackUrl.startsWith(
        platform === 'web' ? 'http://localhost:8081/' : 'appbarberia://',
      ),
    );
  }
  assert.throws(() =>
    googleCheckActivation(
      JSON.stringify({
        version: 1,
        publicKey,
        phase: 'pending',
        access_token: 'forbidden',
      }),
    ),
  );
});

test('activation keeps LOCAL storage untouched and fences stale Cloud returns until an explicit LOCAL flow', async () => {
  const f = fixture('web', true),
    { createGoogleCheckActivationStore, resolveGoogleCheckProfile } = f.load(
      path.resolve('src/composition/google-auth-check-composition.ts'),
    );
  const values = new Map([['local-session', 'unchanged']]);
  const driver = {
    getItem: async (k) => values.get(k) ?? null,
    setItem: async (k, v) => {
      values.set(k, v);
    },
    removeItem: async (k) => {
      values.delete(k);
    },
  };
  const store = createGoogleCheckActivationStore(driver);
  assert.equal(await store.fence.allow(), true);
  const activation = { version: 1, publicKey, phase: 'active' };
  await store.write(activation);
  assert.equal(await store.fence.allow(), false);
  await assert.rejects(() => store.fence.localFlowStarted());
  const original = resolveGoogleCheckProfile(
    { kind: 'loading' },
    activation,
    '/auth/google-test',
  );
  const pending = { ...activation, phase: 'pending' };
  assert.equal(
    resolveGoogleCheckProfile(original, pending, '/auth/callback'),
    original,
  );
  assert.equal(resolveGoogleCheckProfile(original, pending, '/'), original);
  await store.write({ ...activation, phase: 'retired' });
  assert.equal(await store.fence.allow(), false);
  assert.equal(
    resolveGoogleCheckProfile(
      { kind: 'loading' },
      await store.read(),
      '/auth/callback',
    ).kind,
    'active',
  );
  await store.fence.localFlowStarted();
  assert.equal(await store.fence.allow(), true);
  assert.equal(values.get('local-session'), 'unchanged');
  assert.equal(values.size, 1);
});

test('the composed SDK uses the Cloud-only transport and a namespace different from LOCAL', async () => {
  const f = fixture('web', true);
  f.globals.window = { location: { origin: 'http://localhost:8081' } };
  let requests = 0;
  f.globals.fetch = async () => {
    requests++;
    return Response.json({});
  };
  const { createCloudGoogleCheck } = f.load(
    path.resolve('src/composition/google-auth-check-composition.ts'),
  );
  const localStorageKey = f.options.auth.storageKey,
    localCalls = f.calls.length;
  const check = createCloudGoogleCheck({
    version: 1,
    publicKey,
    phase: 'active',
  });
  assert.notEqual(f.options.auth.storageKey, localStorageKey);
  assert.equal(f.options.auth.flowType, 'pkce');
  assert.equal(f.options.auth.detectSessionInUrl, false);
  for (const url of [
    'http://127.0.0.1:54421/auth/v1/user',
    cloud + '/rest/v1/profiles',
    cloud + '/functions/v1/ensure-profile',
  ])
    await assert.rejects(() =>
      f.options.global.fetch(url, {
        headers: { Authorization: 'Bearer fixture' },
      }),
    );
  assert.equal(requests, 0);
  assert.equal(f.calls.length, localCalls);
  await f.options.global.fetch(cloud + '/auth/v1/user');
  assert.equal(requests, 1);
  check.dispose();
});
test('Auth-only transport rejects LOCAL, business endpoints and redirects before forwarding any credential', async () => {
  const f = fixture('web', true),
    { createCloudAuthFetch } = f.load(
      path.resolve(
        'src/features/authentication/infrastructure/cloud-auth-check.ts',
      ),
    );
  const sent = [];
  const transport = createCloudAuthFetch(async (url, init) => {
    sent.push({ url: String(url), redirect: init.redirect });
    return Response.json({});
  });
  await transport(cloud + '/auth/v1/user', {
    headers: { Authorization: 'Bearer fixture-user' },
  });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].redirect, 'error');
  for (const endpoint of [
    'http://127.0.0.1:54421/auth/v1/user',
    'http://192.168.0.16:54421/auth/v1/token',
    cloud + '/rest/v1/profiles',
    cloud + '/functions/v1/ensure-profile',
    cloud + '/auth/v1/admin/users',
    cloud + '/auth/v1/signup',
    'https://klebvayvsvibwjpkzrff.supabase.co/auth/v1/user',
  ])
    await assert.rejects(() =>
      transport(endpoint, {
        headers: { Authorization: 'Bearer fixture-user' },
      }),
    );
  assert.equal(sent.length, 1);
});
test('Google diagnostic coordinates only Auth, verifies callback/session once and keeps identity and secrets out of its public view', async () => {
  const f = fixture('web', true),
    { createGoogleAuthCheck } = f.load(
      path.resolve(
        'src/features/authentication/application/google-auth-check.ts',
      ),
    );
  let starts = 0,
    exchanges = 0,
    restores = 0,
    logout = 0;
  let resolve;
  const opening = new Promise((r) => (resolve = r));
  const gateway = {
    signInWithGoogle: async () => {
      starts++;
      await opening;
    },
    completeCallback: async () => {
      exchanges++;
      return { kind: 'authenticated', identity };
    },
    restoreAndVerify: async () => {
      restores++;
      return { kind: 'authenticated', identity };
    },
    signOutCurrent: async () => {
      logout++;
      return { remoteRevocationConfirmed: true };
    },
    subscribe: () => () => {},
  };
  const app = createGoogleAuthCheck(gateway);
  const one = app.startGoogle(),
    two = app.startGoogle();
  assert.equal(starts, 1);
  resolve();
  await Promise.all([one, two]);
  assert.equal(app.getSnapshot().kind, 'oauth-pending');
  await app.restore();
  assert.equal(restores, 0);
  const input = { code: 'private-code-fixture', purpose: 'confirmation' };
  await Promise.all([app.accept(input), app.accept(input)]);
  assert.equal(exchanges, 1);
  assert.equal(app.getSnapshot().kind, 'verified');
  assert.equal(app.getSnapshot().identityVerified, true);
  assert.equal(app.getSnapshot().sessionVerified, true);
  assert.ok(!JSON.stringify(app.getSnapshot()).includes('fixture'));
  await app.restore();
  assert.equal(app.getSnapshot().callbackVerified, true);
  await app.logout();
  assert.equal(logout, 1);
  assert.equal(app.getSnapshot().kind, 'signed-out');
  assert.equal(app.getSnapshot().logoutConfirmed, true);
  app.dispose();
});
test('late OAuth response cannot resurrect a logged-out diagnostic session', async () => {
  const f = fixture('android', true),
    { createGoogleAuthCheck } = f.load(
      path.resolve(
        'src/features/authentication/application/google-auth-check.ts',
      ),
    );
  let complete;
  const result = new Promise((r) => (complete = r));
  const app = createGoogleAuthCheck({
    signInWithGoogle: async () => {},
    completeCallback: () => result,
    restoreAndVerify: async () => ({ kind: 'authenticated', identity }),
    signOutCurrent: async () => ({ remoteRevocationConfirmed: true }),
    subscribe: () => () => {},
  });
  await app.startGoogle();
  const pending = app.accept({
    code: 'private-fixture',
    purpose: 'confirmation',
  });
  await app.logout();
  complete({ kind: 'authenticated', identity });
  await pending;
  assert.equal(app.getSnapshot().kind, 'signed-out');
  assert.equal(app.getSnapshot().identityVerified, false);
  app.dispose();
});
