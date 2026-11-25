import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fixture } from './fixtures/composition.mjs';
const identity = {
  userId: '11111111-1111-4111-8111-111111111111',
  email: 'fixture@example.invalid',
  emailConfirmed: true,
  isAnonymous: false,
};
const own = {
  userId: identity.userId,
  displayName: 'Own fixture',
  phone: null,
};
test('real Android composition bounds restoration to 15 seconds without granting access on timeout', async () => {
  const f = fixture('android', true);
  let expire,
    delay,
    cancelled = 0;
  f.globals.setTimeout = (callback, ms) => {
    expire = callback;
    delay = ms;
    return 1;
  };
  f.globals.clearTimeout = () => cancelled++;
  f.auth.getUser = () => new Promise(() => {});
  const app = f.foundation.createRegistrationApplication();
  const pending = app.restoreAndVerify();
  assert.equal(delay, 15000);
  expire();
  await pending;
  assert.equal(app.getSnapshot().kind, 'retryable-error');
  assert.equal(cancelled, 1);
  f.foundation.dispose();
});
function startup() {
  const f = fixture('android', true);
  const { createSessionCoordinator } = f.load(
    path.resolve(
      'src/features/authentication/application/session-coordinator.ts',
    ),
  );
  let expire, finish, emit;
  const controls = {
    restore: async () => ({ kind: 'authenticated', identity }),
    profile: async () => own,
  };
  let cancelled = 0,
    invalidated = 0;
  const app = createSessionCoordinator({
    auth: {
      subscribe(listener) {
        emit = listener;
        return () => {};
      },
      register: async () => ({ kind: 'confirmation-required' }),
      completeCallback: async () => ({ kind: 'authenticated', identity }),
      restoreAndVerify: () => controls.restore(),
      invalidateSession: () => invalidated++,
      signOutCurrent: async () => ({ remoteRevocationConfirmed: false }),
    },
    profiles: {
      getOwnProfile: () => controls.profile(),
      ensureOwnProfile: async () => own,
    },
    startRestoreDeadline: (callback) => {
      expire = callback;
      return () => cancelled++;
    },
  });
  return {
    app,
    controls,
    expire: () => expire(),
    cancelled: () => cancelled,
    invalidated: () => invalidated,
    emit: (event) => emit(event),
    deferRestore() {
      controls.restore = () =>
        new Promise((resolve) => {
          finish = resolve;
        });
    },
    finish: () => finish({ kind: 'authenticated', identity }),
  };
}
test('hung Auth/storage restoration becomes a recoverable error, releases retry and ignores a late result', async () => {
  const f = startup();
  f.deferRestore();
  const pending = f.app.restoreAndVerify();
  assert.equal(f.app.getSnapshot().kind, 'resolving');
  f.expire();
  await pending;
  assert.equal(f.app.getSnapshot().kind, 'retryable-error');
  assert.equal(f.app.getSnapshot().error, 'network-unavailable');
  assert.equal(f.invalidated(), 1);
  f.controls.restore = async () => ({ kind: 'signed-out' });
  await f.app.restoreAndVerify();
  assert.equal(f.app.getSnapshot().kind, 'signed-out');
  f.finish();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(f.app.getSnapshot().kind, 'signed-out');
  f.app.dispose();
});
test('valid foreground checks coalesce and preserve the ready snapshot, form scope and route', async () => {
  const f = startup();
  await f.app.restoreAndVerify();
  const ready = f.app.getSnapshot();
  const transitions = [];
  f.app.subscribe(() => transitions.push(f.app.getSnapshot().kind));
  f.deferRestore();
  const pending = f.app.restoreAndVerify();
  const focus = f.app.restoreAndVerify();
  f.emit({ kind: 'session-changed' });
  assert.equal(f.app.getSnapshot(), ready);
  f.finish();
  await Promise.all([pending, focus]);
  assert.equal(f.app.getSnapshot(), ready);
  assert.deepEqual(transitions, []);
  f.app.dispose();
});
test('foreground verification hides private data only after losing trust and can retry offline errors', async () => {
  const f = startup();
  await f.app.restoreAndVerify();
  const ready = f.app.getSnapshot();
  f.deferRestore();
  const pending = f.app.restoreAndVerify();
  assert.equal(f.app.getSnapshot(), ready);
  f.expire();
  await pending;
  assert.equal(f.app.getSnapshot().kind, 'retryable-error');
  f.finish();
  await Promise.resolve();
  assert.equal(f.app.getSnapshot().kind, 'retryable-error');
  f.controls.restore = async () => ({ kind: 'authenticated', identity });
  await f.app.restoreAndVerify();
  assert.equal(f.app.getSnapshot().kind, 'ready');
  f.controls.restore = async () => ({ kind: 'signed-out' });
  await f.app.restoreAndVerify();
  assert.equal(f.app.getSnapshot().kind, 'signed-out');
  f.app.dispose();
});
test('slow profile restoration cannot leave startup blocked forever or expose a late profile', async () => {
  const f = startup();
  let complete;
  f.controls.profile = () =>
    new Promise((resolve) => {
      complete = resolve;
    });
  const pending = f.app.restoreAndVerify();
  await new Promise((resolve) => setImmediate(resolve));
  f.expire();
  await pending;
  assert.equal(f.app.getSnapshot().kind, 'retryable-error');
  complete(own);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(f.app.getSnapshot().kind, 'retryable-error');
  f.controls.profile = async () => own;
  await f.app.restoreAndVerify();
  assert.equal(f.app.getSnapshot().kind, 'ready');
  f.app.dispose();
});
test('successful cold restoration and resume cancel deadlines; logout and disposal invalidate stale startup', async () => {
  const f = startup();
  await f.app.restoreAndVerify();
  assert.equal(f.app.getSnapshot().kind, 'ready');
  assert.equal(f.cancelled(), 1);
  f.app.invalidateSession('lifecycle');
  await f.app.restoreAndVerify();
  assert.equal(f.app.getSnapshot().kind, 'ready');
  assert.equal(f.cancelled(), 2);
  f.deferRestore();
  const old = f.app.restoreAndVerify();
  await f.app.signOutCurrent();
  f.expire();
  await old;
  f.finish();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(f.app.getSnapshot().kind, 'signed-out');
  f.app.dispose();
  const g = startup();
  g.deferRestore();
  const unmounted = g.app.restoreAndVerify();
  g.app.dispose();
  g.expire();
  await unmounted;
  assert.notEqual(g.app.getSnapshot().kind, 'ready');
});
