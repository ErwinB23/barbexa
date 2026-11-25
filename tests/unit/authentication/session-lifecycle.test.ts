import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSessionCoordinator } from '../../../src/features/authentication/application/session-coordinator.js';
import { AuthError } from '../../../src/features/authentication/domain/auth-error.js';
import type {
  AuthEvent,
  AuthResolution,
} from '../../../src/features/authentication/application/auth-gateway.js';
import type {
  OwnProfile,
  SessionView,
} from '../../../src/features/authentication/domain/session-state.js';
const identity = {
  userId: '11111111-1111-4111-8111-111111111111',
  email: 'fixture@example.invalid',
  emailConfirmed: true,
  isAnonymous: false,
} as const;
const profile: OwnProfile = {
  userId: identity.userId,
  displayName: 'Own profile',
  phone: null,
};
interface Source {
  restoreAndVerify(): Promise<void>;
  invalidateSession(): void;
  setRefreshActive(active: boolean): void;
  signOutCurrent(): Promise<unknown>;
  subscribe(listener: () => void): () => void;
  getSnapshot(): SessionView;
  dispose(): void;
}
function fixture(withDeadline = false) {
  let listener: (e: AuthEvent) => void = () => {};
  let expire = () => {};
  const calls = { restore: 0, profile: 0, refresh: [] as boolean[] };
  const controls = {
    restore: async (): Promise<AuthResolution> => ({
      kind: 'authenticated',
      identity,
    }),
    profile: async () => profile as typeof profile | null,
  };
  const auth = {
    subscribe: (f: typeof listener) => {
      listener = f;
      return () => {};
    },
    register: async () => ({ kind: 'confirmation-required' }) as const,
    completeCallback: async () =>
      ({ kind: 'authenticated', identity }) as const,
    restoreAndVerify: async () => {
      calls.restore++;
      return controls.restore();
    },
    signOutCurrent: async () => ({ remoteRevocationConfirmed: false }),
    setRefreshActive: (active: boolean) => {
      calls.refresh.push(active);
    },
    invalidateSession() {},
  };
  const source = createSessionCoordinator({
    auth,
    ...(withDeadline && {
      startRestoreDeadline: (callback: () => void) => {
        expire = callback;
        return () => {};
      },
    }),
    profiles: {
      getOwnProfile: async () => {
        calls.profile++;
        return controls.profile();
      },
      ensureOwnProfile: async () => profile,
    },
  }) as unknown as Source;
  return {
    source,
    calls,
    controls,
    expire: () => expire(),
    emit: (e: AuthEvent) => listener(e),
  };
}
test('restoration verifies identity/profile and deduplicates concurrent focus requests', async () => {
  const f = fixture();
  await Promise.all([f.source.restoreAndVerify(), f.source.restoreAndVerify()]);
  assert.equal(f.calls.restore, 1);
  assert.equal(f.source.getSnapshot().kind, 'ready');
});
test('absent invalid recovery and offline session states never invent ready', async () => {
  for (const kind of [
    'signed-out',
    'recovery',
    'network',
    'invalid',
  ] as const) {
    const f = fixture();
    f.controls.restore = async () => {
      if (kind === 'network') throw new AuthError('network-unavailable');
      if (kind === 'invalid') throw new AuthError('credentials-rejected');
      return { kind };
    };
    await f.source.restoreAndVerify();
    assert.equal(f.calls.profile, 0);
    assert.equal(
      f.source.getSnapshot().kind,
      kind === 'network'
        ? 'retryable-error'
        : kind === 'invalid'
          ? 'signed-out'
          : kind,
    );
  }
});
test('missing profile stays restricted and connectivity failure offers a safe retry', async () => {
  const f = fixture();
  f.controls.profile = async () => null;
  await f.source.restoreAndVerify();
  assert.equal(f.source.getSnapshot().kind, 'profile-required');
  const g = fixture();
  g.controls.restore = async () => {
    throw new AuthError('network-unavailable');
  };
  await g.source.restoreAndVerify();
  g.controls.restore = async () => ({ kind: 'authenticated', identity });
  await g.source.restoreAndVerify();
  assert.equal(g.source.getSnapshot().kind, 'ready');
});
test('ready revalidation keeps the current snapshot, updates changed profile and hides missing profile', async () => {
  const f = fixture();
  await f.source.restoreAndVerify();
  const ready = f.source.getSnapshot();
  const transitions: string[] = [];
  f.source.subscribe(() => transitions.push(f.source.getSnapshot().kind));
  const resumes = Promise.all([
    f.source.restoreAndVerify(),
    f.source.restoreAndVerify(),
  ]);
  f.emit({ kind: 'session-changed' });
  assert.equal(f.source.getSnapshot(), ready);
  await resumes;
  assert.equal(f.source.getSnapshot(), ready);
  assert.equal(f.calls.restore, 2);
  assert.deepEqual(transitions, []);
  f.controls.profile = async () => ({ ...profile, phone: '555123456' });
  await f.source.restoreAndVerify();
  const updated = f.source.getSnapshot();
  if (updated.kind !== 'ready' || ready.kind !== 'ready') assert.fail();
  assert.equal(updated.generation, ready.generation);
  assert.equal(updated.profile.phone, '555123456');
  f.controls.profile = async () => null;
  await f.source.restoreAndVerify();
  assert.deepEqual(transitions, ['ready', 'profile-required']);
});
test('ready revalidation rejects a different identity and can recover from a network failure', async () => {
  const f = fixture();
  await f.source.restoreAndVerify();
  f.controls.restore = async () => {
    throw new AuthError('network-unavailable');
  };
  await f.source.restoreAndVerify();
  assert.equal(f.source.getSnapshot().kind, 'retryable-error');
  f.controls.restore = async () => ({ kind: 'authenticated', identity });
  await f.source.restoreAndVerify();
  f.controls.restore = async () => ({ kind: 'signed-out' });
  await f.source.restoreAndVerify();
  assert.equal(f.source.getSnapshot().kind, 'signed-out');
  f.controls.restore = async () => ({ kind: 'authenticated', identity });
  await f.source.restoreAndVerify();
  f.controls.restore = async () => ({
    kind: 'authenticated',
    identity: { ...identity, userId: '22222222-2222-4222-8222-222222222222' },
  });
  await f.source.restoreAndVerify();
  assert.equal(f.source.getSnapshot().kind, 'signed-out');
});
test('a timed out revalidation cannot restore the profile after Auth replies late', async () => {
  const f = fixture(true);
  await f.source.restoreAndVerify();
  const ready = f.source.getSnapshot();
  let reply!: (value: AuthResolution) => void;
  f.controls.restore = () => new Promise((resolve) => (reply = resolve));
  const verification = f.source.restoreAndVerify();
  assert.equal(f.source.getSnapshot(), ready);
  f.expire();
  await verification;
  reply({ kind: 'authenticated', identity });
  await Promise.resolve();
  assert.deepEqual(f.source.getSnapshot(), {
    kind: 'retryable-error',
    error: 'network-unavailable',
  });
});
test('logout and cross-tab invalidation discard in-flight identity and profile responses', async () => {
  const f = fixture();
  let resolve!: (v: AuthResolution) => void;
  f.controls.restore = () =>
    new Promise((r) => {
      resolve = r;
    });
  const old = f.source.restoreAndVerify();
  await f.source.signOutCurrent();
  resolve({ kind: 'authenticated', identity });
  await old;
  assert.equal(f.source.getSnapshot().kind, 'signed-out');
  assert.equal(f.calls.profile, 0);
  const g = fixture();
  let finish!: (v: typeof profile | null) => void;
  let entered!: () => void;
  const started = new Promise<void>((r) => {
    entered = r;
  });
  g.controls.profile = () =>
    new Promise((r) => {
      finish = r;
      entered();
    });
  const p = g.source.restoreAndVerify();
  await started;
  g.source.invalidateSession();
  assert.notEqual(g.source.getSnapshot().kind, 'ready');
  finish(profile);
  await p;
  assert.notEqual(g.source.getSnapshot().kind, 'ready');
});
test('lifecycle refresh control does not import a platform and disposal cancels restoration', async () => {
  const f = fixture();
  f.source.setRefreshActive(true);
  f.source.setRefreshActive(false);
  assert.deepEqual(f.calls.refresh, [true, false]);
  f.source.dispose();
  await assert.rejects(() => f.source.restoreAndVerify());
});
