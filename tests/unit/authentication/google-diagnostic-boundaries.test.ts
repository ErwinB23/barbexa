import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createGoogleAuthCheck } from '../../../src/features/authentication/application/google-auth-check.js';
import type {
  AuthEvent,
  AuthResolution,
} from '../../../src/features/authentication/application/auth-gateway.js';
import { AuthError } from '../../../src/features/authentication/domain/auth-error.js';
function fixture() {
  let listener: (event: AuthEvent) => void = () => {};
  let resolution: AuthResolution = {
    kind: 'authenticated',
    identity: {
      userId: '11111111-1111-4111-8111-111111111111',
      email: 'fixture@example.invalid',
      emailConfirmed: true,
      isAnonymous: false,
    },
  };
  let failure: unknown = null,
    calls = 0;
  const read = async () => {
    if (failure) throw failure;
    return resolution;
  };
  const app = createGoogleAuthCheck({
    subscribe: (fn) => {
      listener = fn;
      return () => {};
    },
    signInWithGoogle: async () => {
      if (failure) throw failure;
    },
    completeCallback: async () => {
      calls++;
      return read();
    },
    restoreAndVerify: read,
    signOutCurrent: async () => {
      if (failure) throw failure;
      return { remoteRevocationConfirmed: true };
    },
  });
  return {
    app,
    event: (e: AuthEvent) => listener(e),
    set: (r: AuthResolution) => {
      resolution = r;
    },
    fail: (e: unknown) => {
      failure = e;
    },
    calls: () => calls,
  };
}
test('diagnostic verifies callback once, clears state on logout and never restores after disposal', async () => {
  const f = fixture();
  let changes = 0;
  const off = f.app.subscribe(() => {
    changes++;
  });
  const a = f.app.accept({ code: 'fixture', purpose: 'confirmation' });
  assert.equal(a, f.app.accept({ code: 'fixture', purpose: 'confirmation' }));
  await a;
  assert.equal(f.calls(), 1);
  assert.equal(f.app.getSnapshot().callbackVerified, true);
  await assert.rejects(f.app.startGoogle());
  await f.app.restore();
  await f.app.logout();
  assert.equal(f.app.getSnapshot().logoutConfirmed, true);
  f.event({ kind: 'signed-out' });
  off();
  assert.ok(changes > 0);
  f.app.dispose();
  await f.app.restore();
  await f.app.logout();
  assert.equal(f.app.getSnapshot().kind, 'signed-out');
  await assert.rejects(f.app.accept({ code: 'other', purpose: 'recovery' }));
});
test('diagnostic distinguishes invalid callbacks, generic provider failure and explicit auth errors', async () => {
  const f = fixture();
  f.set({ kind: 'signed-out' });
  await f.app.restore();
  assert.equal(f.app.getSnapshot().kind, 'signed-out');
  await f.app.accept({ code: 'invalid', purpose: 'confirmation' });
  assert.equal(f.app.getSnapshot().error, 'link-invalid');
  f.fail(new Error('private provider message'));
  await f.app.startGoogle();
  assert.equal(f.app.getSnapshot().error, 'provider-unavailable');
  f.fail(new AuthError('network-unavailable'));
  await f.app.restore();
  assert.equal(f.app.getSnapshot().error, 'network-unavailable');
  await f.app.logout();
  assert.equal(f.app.getSnapshot().kind, 'error');
  f.app.reportFailure('link-invalid');
  assert.equal(f.app.getSnapshot().error, 'link-invalid');
  f.app.dispose();
});
