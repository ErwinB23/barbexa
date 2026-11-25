import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import path from 'node:path';
import { test } from 'node:test';
import { fixture } from './fixtures/composition.mjs';

const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'recovery@example.invalid',
  email_confirmed_at: '2026-11-15',
  is_anonymous: false,
};
const target = 'http://localhost:8081/auth/reset-password';
const token = (sessionId = '22222222-2222-4222-8222-222222222222') =>
  `e30.${Buffer.from(JSON.stringify({ sub: user.id, session_id: sessionId })).toString('base64url')}.signature-fixture`;
function setup() {
  const f = fixture();
  f.globals.atob = atob;
  const calls = { request: 0, exchange: 0, update: 0, logout: 0 };
  const controls = {
    requestError: null,
    exchangeError: null,
    redirectType: 'recovery',
    token: token(),
    updateError: null,
  };
  f.auth.getUser = async () => ({ data: { user }, error: null });
  f.auth.getSession = async () => ({
    data: { session: { access_token: controls.token } },
    error: null,
  });
  f.auth.resetPasswordForEmail = async (email, options) => {
    calls.request++;
    assert.equal(email, user.email);
    assert.equal(options.redirectTo, target);
    return { data: {}, error: controls.requestError };
  };
  f.auth.exchangeCodeForSession = async (_code, options) => {
    calls.exchange++;
    calls.flowId = options?.flowId;
    return {
      data: {
        session: { access_token: controls.token },
        redirectType: controls.redirectType,
      },
      error: controls.exchangeError,
    };
  };
  f.auth.updateUser = async (value) => {
    calls.update++;
    assert.deepEqual(Object.keys(value), ['password']);
    return { data: { user }, error: controls.updateError };
  };
  f.auth.signOut = async (options) => {
    calls.logout++;
    assert.equal(options.scope, 'local');
    return { error: null };
  };
  const { createSupabaseAuthAdapter } = f.load(
    path.resolve(
      'src/features/authentication/infrastructure/supabase-auth-adapter.ts',
    ),
  );
  const options = {
    baseUrl: 'https://technical.supabase.co',
    publicKey: 'sb_publishable_fixture',
    storage: f.storage,
    storageKey: 'recovery-fixture',
    confirmationRedirectUrl: 'http://localhost:8081/auth/callback',
    recoveryRedirectUrl: target,
  };
  const adapter = createSupabaseAuthAdapter(options);
  return { ...f, adapter, options, createSupabaseAuthAdapter, calls, controls };
}
test('recovery request is non-enumerative, exact-target and rate/network safe', async () => {
  const f = setup();
  await f.adapter.requestRecovery(user.email, target);
  assert.equal(await f.adapter.getAccessToken(), null);
  await assert.rejects(
    () => f.adapter.requestRecovery(user.email, 'https://attacker.invalid'),
    (e) => e.code === 'invalid-input',
  );
  f.controls.requestError = { code: 'user_not_found', status: 400 };
  await f.adapter.requestRecovery(user.email, target);
  f.controls.requestError = { status: 429 };
  await assert.rejects(
    () => f.adapter.requestRecovery(user.email, target),
    (e) => e.code === 'rate-limited',
  );
  f.controls.requestError = { name: 'AuthRetryableFetchError' };
  await assert.rejects(
    () => f.adapter.requestRecovery(user.email, target),
    (e) => e.code === 'network-unavailable',
  );
  assert.equal(f.calls.request, 4);
});
test('PKCE purpose and verified session binding survive restart without ordinary token access; update signs out', async () => {
  const f = setup();
  const input = {
    code: 'synthetic-code',
    purpose: 'recovery',
    flowId: 'flow_123',
  };
  await Promise.all([
    f.adapter.completeCallback(input),
    f.adapter.completeCallback(input),
  ]);
  assert.equal(f.calls.exchange, 1);
  assert.equal(f.calls.flowId, 'flow_123');
  assert.equal(await f.adapter.getAccessToken(), null);
  f.adapter.dispose();
  const resumed = f.createSupabaseAuthAdapter(f.options);
  assert.equal((await resumed.restoreAndVerify()).kind, 'recovery');
  assert.equal(await resumed.getAccessToken(), null);
  await resumed.setRecoveredPassword('fictitious-new-password');
  assert.equal(f.calls.update, 1);
  assert.equal(f.calls.logout, 1);
  assert.equal(await resumed.getAccessToken(), null);
  assert.equal(await f.storage.getItem('recovery-fixture-recovery'), null);
});
test('forged purpose, missing verifier, expiry, changed session and cancellation cannot authorize update', async () => {
  for (const code of [
    'flow_state_expired',
    'pkce_verifier_not_found',
    'invalid_grant',
  ]) {
    const f = setup();
    f.controls.exchangeError = { code };
    await assert.rejects(
      () =>
        f.adapter.completeCallback({ code: 'invalid', purpose: 'recovery' }),
      (e) => e.code === 'link-invalid',
    );
    await assert.rejects(
      () => f.adapter.setRecoveredPassword('new-fictitious'),
      (e) => e.code === 'link-invalid',
    );
    assert.equal(f.calls.update, 0);
  }
  for (const purpose of ['confirmation', 'recovery']) {
    const f = setup();
    f.controls.redirectType = purpose === 'recovery' ? null : 'recovery';
    await assert.rejects(
      () => f.adapter.completeCallback({ code: 'forged', purpose }),
      (e) => e.code === 'link-invalid',
    );
    assert.equal(await f.adapter.getAccessToken(), null);
  }
  const f = setup();
  await f.adapter.completeCallback({ code: 'valid', purpose: 'recovery' });
  f.controls.token = token('33333333-3333-4333-8333-333333333333');
  await assert.rejects(
    () => f.adapter.setRecoveredPassword('new-fictitious'),
    (e) => e.code === 'link-invalid',
  );
  await f.adapter.signOutCurrent();
  await assert.rejects(() => f.adapter.setRecoveredPassword('new-fictitious'));
  assert.equal(f.calls.update, 0);
});
test('both parsers accept a single SDK flow id, sanitize query, reject type/tokens/duplicate flow', () => {
  const f = setup();
  const config = {
    callbackUrl: 'http://localhost:8081/auth/callback',
    recoveryUrl: target,
  };
  const web = f.load(
    path.resolve(
      'src/features/authentication/infrastructure/auth-links.web.ts',
    ),
  );
  const native = f.load(
    path.resolve(
      'src/features/authentication/infrastructure/auth-links.native.ts',
    ),
  );
  let clean;
  assert.equal(
    web.captureAuthLink(
      `${target}?code=test&sb_flow_id=flow_123`,
      config,
      (v) => (clean = v),
    ).flowId,
    'flow_123',
  );
  assert.equal(clean, '/auth/reset-password');
  assert.equal(
    native.parseAuthLink(
      'appbarberia://auth/reset-password?code=test&sb_flow_id=flow_123',
      {
        callbackUrl: 'appbarberia://auth/callback',
        recoveryUrl: 'appbarberia://auth/reset-password',
      },
    ).purpose,
    'recovery',
  );
  for (const suffix of [
    '?type=recovery',
    '?code=a&sb_flow_id=x&sb_flow_id=y',
    '?code=a&sb_flow_id=bad%2Fid',
    '#access_token=invalid',
  ])
    assert.throws(() => web.parseAuthLink(target + suffix, config));
});

test('update errors preserve restriction for retry and cleanup failure is explicit', async () => {
  const f = setup();
  await f.adapter.completeCallback({ code: 'valid', purpose: 'recovery' });
  f.controls.updateError = { name: 'AuthRetryableFetchError' };
  await assert.rejects(
    () => f.adapter.setRecoveredPassword('new'),
    (e) => e.code === 'network-unavailable',
  );
  assert.equal(await f.adapter.getAccessToken(), null);
  f.controls.updateError = { code: 'weak_password' };
  await assert.rejects(
    () => f.adapter.setRecoveredPassword('new'),
    (e) => e.code === 'weak-password',
  );
  f.controls.updateError = null;
  f.storage.removeItem = async () => {
    throw Error('storage unavailable');
  };
  await assert.rejects(
    () => f.adapter.setRecoveredPassword('new'),
    (e) => e.code === 'persistence-failed',
  );
  assert.equal(await f.adapter.getAccessToken(), null);
});

test('a marker without a coherent verified session never resumes recovery or provides an ordinary token', async () => {
  const f = setup();
  await f.storage.setItem('recovery-fixture-purpose', 'recovery');
  await assert.rejects(
    () => f.adapter.restoreAndVerify(),
    (e) => e.code === 'link-invalid',
  );
  assert.equal(await f.adapter.getAccessToken(), null);
  assert.equal(f.calls.update, 0);
});
