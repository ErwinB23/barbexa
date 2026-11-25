import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSessionCoordinator } from '../../../src/features/authentication/application/session-coordinator.js';
import type { AuthEvent } from '../../../src/features/authentication/application/auth-gateway.js';
import type { OwnProfile } from '../../../src/features/authentication/domain/session-state.js';
const identity = {
  userId: '11111111-1111-4111-8111-111111111111',
  email: 'f@example.invalid',
  emailConfirmed: true,
  isAnonymous: false,
} as const;
const own: OwnProfile = {
  userId: identity.userId,
  displayName: 'Existing own',
  phone: null,
};
function fixture(enabled = true, resolvedIdentity = identity) {
  let listener: (event: AuthEvent) => void = () => {};
  const calls = {
    google: 0,
    exchange: 0,
    profile: 0,
    ensure: 0,
    restore: 0,
    logout: 0,
  };
  const control = {
    start: async () => {},
    profile: own as OwnProfile | null,
    failProfile: false,
  };
  const auth = {
    subscribe: (f: typeof listener) => {
      listener = f;
      return () => {};
    },
    signInWithGoogle: async () => {
      calls.google++;
      await control.start();
    },
    register: async () => ({ kind: 'confirmation-required' }) as const,
    completeCallback: async () => {
      calls.exchange++;
      return { kind: 'authenticated', identity: resolvedIdentity } as const;
    },
    restoreAndVerify: async () => {
      calls.restore++;
      return { kind: 'signed-out' } as const;
    },
    signOutCurrent: async () => {
      calls.logout++;
      return { remoteRevocationConfirmed: false };
    },
  };
  const source = createSessionCoordinator({
    googleEnabled: enabled,
    auth,
    profiles: {
      getOwnProfile: async () => {
        calls.profile++;
        return control.profile;
      },
      ensureOwnProfile: async (input) => {
        calls.ensure++;
        if (control.failProfile) throw new Error('network');
        return { ...own, ...input };
      },
    },
  });
  const google = source as typeof source & {
    signInWithGoogle(): Promise<void>;
    cancelGoogle(): Promise<void>;
    invalidateSession(reason?: 'lifecycle'): void;
  };
  return {
    source: google,
    calls,
    control,
    emit: (event: AuthEvent) => listener(event),
  };
}
test('Google initiation opens once, never invents profile or identity before verified callback', async () => {
  const f = fixture();
  await f.source.restoreAndVerify();
  await Promise.all([f.source.signInWithGoogle(), f.source.signInWithGoogle()]);
  assert.equal(f.calls.google, 1);
  assert.equal(f.calls.profile, 0);
  assert.equal(f.source.getSnapshot().kind, 'oauth-pending');
  await f.source.completeCallback({
    code: 'synthetic',
    purpose: 'confirmation',
  });
  await f.source.completeCallback({
    code: 'synthetic',
    purpose: 'confirmation',
  });
  assert.equal(f.calls.exchange, 1);
  assert.equal(f.calls.ensure, 0);
  const state = f.source.getSnapshot();
  assert.equal(state.kind, 'ready');
  if (state.kind === 'ready')
    assert.equal(state.profile.displayName, 'Existing own');
});
test('verified Google name creates only a missing own profile with no phone, while existing profiles remain intact', async () => {
  for (const existing of [true, false]) {
    const f = fixture(true, {
      ...identity,
      suggestedDisplayName: 'Nombre de Google',
    } as typeof identity);
    if (!existing) f.control.profile = null;
    await f.source.restoreAndVerify();
    await f.source.signInWithGoogle();
    await f.source.completeCallback({
      code: 'profile-test',
      purpose: 'confirmation',
    });
    const state = f.source.getSnapshot();
    assert.equal(state.kind, 'ready');
    assert.equal(f.calls.ensure, existing ? 0 : 1);
    if (state.kind === 'ready') {
      assert.equal(
        state.profile.displayName,
        existing ? own.displayName : 'Nombre de Google',
      );
      assert.equal(state.profile.phone, null);
    }
  }
});

test('Google initial profile failure stays retryable and retry retains the verified name', async () => {
  const f = fixture(true, {
    ...identity,
    suggestedDisplayName: 'Nombre Google',
  } as typeof identity);
  f.control.profile = null;
  f.control.failProfile = true;
  await f.source.restoreAndVerify();
  await f.source.signInWithGoogle();
  await f.source.completeCallback({
    code: 'profile-failure',
    purpose: 'confirmation',
  });
  assert.equal(f.source.getSnapshot().kind, 'retryable-error');
  f.control.failProfile = false;
  await f.source.retryProfile();
  const result = f.source.getSnapshot();
  assert.equal(result.kind, 'ready');
  if (result.kind === 'ready')
    assert.equal(result.profile.displayName, 'Nombre Google');
});

test('disabled Google capability makes no provider call', async () => {
  const f = fixture(false);
  await f.source.restoreAndVerify();
  assert.equal(f.source.canUseGoogle(), false);
  await assert.rejects(() => f.source.signInWithGoogle());
  assert.equal(f.calls.google, 0);
});
test('native background/web visibility cannot erase an in-flight Google return', async () => {
  const f = fixture();
  await f.source.restoreAndVerify();
  await f.source.signInWithGoogle();
  f.source.invalidateSession('lifecycle');
  await f.source.restoreAndVerify();
  assert.equal(f.source.getSnapshot().kind, 'oauth-pending');
  assert.equal(f.calls.restore, 1);
  await f.source.completeCallback({
    code: 'synthetic',
    purpose: 'confirmation',
  });
  assert.equal(f.source.getSnapshot().kind, 'ready');
});
test('new Google identity requires explicit own profile, not trusted metadata or role', async () => {
  const f = fixture();
  f.control.profile = null;
  await f.source.restoreAndVerify();
  await f.source.signInWithGoogle();
  await f.source.completeCallback({
    code: 'synthetic',
    purpose: 'confirmation',
  });
  assert.equal(f.source.getSnapshot().kind, 'profile-required');
  assert.equal(f.calls.ensure, 0);
  await f.source.retryProfile({ displayName: 'Explicit own', phone: null });
  assert.equal(f.calls.ensure, 1);
  assert.equal(f.source.getSnapshot().kind, 'ready');
});
test('cancel clears using existing logout, blocks late start and leaves normal access retryable', async () => {
  const f = fixture();
  await f.source.restoreAndVerify();
  let release!: () => void;
  f.control.start = () =>
    new Promise<void>((r) => {
      release = r;
    });
  const pending = f.source.signInWithGoogle();
  await f.source.cancelGoogle();
  release();
  await pending;
  assert.equal(f.source.getSnapshot().kind, 'signed-out');
  assert.equal(f.calls.logout, 1);
  f.control.start = async () => {};
  await f.source.signInWithGoogle();
  assert.equal(f.calls.google, 2);
});
test('Google failure is safe/retryable and never grants access', async () => {
  const f = fixture();
  await f.source.restoreAndVerify();
  f.control.start = async () => {
    throw new Error('private provider detail');
  };
  await assert.rejects(
    () => f.source.signInWithGoogle(),
    (e: unknown) => e instanceof Error && e.message === 'provider-unavailable',
  );
  assert.equal(f.source.getSnapshot().kind, 'retryable-error');
  assert.equal(f.calls.profile, 0);
});
test('Google cannot link/switch accounts from an authenticated or recovery session', async () => {
  const f = fixture();
  await f.source.completeCallback({
    code: 'synthetic',
    purpose: 'confirmation',
  });
  await assert.rejects(() => f.source.signInWithGoogle());
  assert.equal(f.calls.google, 0);
  f.emit({ kind: 'recovery' });
  await assert.rejects(() => f.source.signInWithGoogle());
  f.source.dispose();
  await assert.rejects(() => f.source.signInWithGoogle());
});
