import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSessionCoordinator } from '../../../src/features/authentication/application/session-coordinator.js';
import { AuthError } from '../../../src/features/authentication/domain/auth-error.js';

function fixture() {
  let requests = 0,
    updates = 0,
    profiles = 0,
    logout = 0;
  const controls = {
    error: null as AuthError | null,
    release: undefined as (() => void) | undefined,
    hold: false,
  };
  const source = createSessionCoordinator({
    recoveryReturnTarget: 'configured-recovery-target',
    auth: {
      subscribe: () => () => {},
      register: async () => ({ kind: 'confirmation-required' }),
      completeCallback: async () => ({ kind: 'recovery' }),
      requestRecovery: async (email: string, target: string) => {
        requests++;
        assert.equal(email, 'local@example.invalid');
        assert.equal(target, 'configured-recovery-target');
        if (controls.hold)
          await new Promise<void>((r) => (controls.release = r));
        if (controls.error) throw controls.error;
      },
      setRecoveredPassword: async () => {
        updates++;
        if (controls.error) throw controls.error;
      },
      signOutCurrent: async () => {
        logout++;
        return { remoteRevocationConfirmed: false };
      },
    },
    profiles: {
      getOwnProfile: async () => {
        profiles++;
        return null;
      },
      ensureOwnProfile: async () => {
        throw Error('must not bootstrap recovery');
      },
    },
  });
  return {
    source,
    controls,
    counts: () => ({ requests, updates, profiles, logout }),
  };
}
test('recovery validates inputs, deduplicates requests and never bootstraps a profile', async () => {
  const f = fixture();
  for (const value of [
    null,
    {},
    { email: 'bad' },
    { email: 'local@example.invalid', role: 'administrator' },
  ])
    await assert.rejects(() => f.source.requestRecovery(value));
  f.controls.hold = true;
  const a = f.source.requestRecovery({ email: ' local@example.invalid ' });
  const b = f.source.requestRecovery({ email: 'local@example.invalid' });
  f.controls.release!();
  await Promise.all([a, b]);
  assert.equal(f.source.getSnapshot().kind, 'recovery-sent');
  assert.equal(f.counts().requests, 1);
  assert.equal(f.counts().profiles, 0);
});
test('only restricted recovery can update; errors retry safely and success ends signed out', async () => {
  const f = fixture();
  await assert.rejects(() => f.source.setRecoveredPassword('new'));
  await f.source.completeCallback({ code: 'synthetic', purpose: 'recovery' });
  for (const value of ['', null, {}])
    await assert.rejects(() => f.source.setRecoveredPassword(value));
  f.controls.error = new AuthError('network-unavailable');
  await assert.rejects(() =>
    f.source.setRecoveredPassword('fictitious-password'),
  );
  assert.equal(f.source.getSnapshot().kind, 'recovery');
  f.controls.error = null;
  await f.source.setRecoveredPassword('fictitious-password');
  assert.equal(f.source.getSnapshot().kind, 'signed-out');
  assert.equal(f.counts().profiles, 0);
  await assert.rejects(() => f.source.setRecoveredPassword('again'));
});
test('request errors are safe; late completion after cancellation/disposal cannot revive access', async () => {
  const f = fixture();
  f.controls.error = new AuthError('rate-limited');
  await f.source.requestRecovery({ email: 'local@example.invalid' });
  assert.equal(f.source.getSnapshot().kind, 'retryable-error');
  f.controls.error = null;
  f.controls.hold = true;
  const p = f.source.requestRecovery({ email: 'local@example.invalid' });
  await f.source.signOutCurrent();
  f.controls.release!();
  await p;
  assert.equal(f.source.getSnapshot().kind, 'signed-out');
  f.source.dispose();
  await assert.rejects(() =>
    f.source.requestRecovery({ email: 'local@example.invalid' }),
  );
});
