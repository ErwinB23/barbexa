import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSessionCoordinator } from '../../../src/features/authentication/application/session-coordinator.js';
import { AuthError } from '../../../src/features/authentication/domain/auth-error.js';
import type {
  AuthEvent,
  AuthResolution,
} from '../../../src/features/authentication/application/auth-gateway.js';
import type { SessionView } from '../../../src/features/authentication/domain/session-state.js';

const actor = {
  userId: '11111111-1111-4111-8111-111111111111',
  email: 'local@example.invalid',
  emailConfirmed: true,
  isAnonymous: false,
} as const;
const profile = {
  userId: actor.userId,
  displayName: 'Perfil local',
  phone: null,
};
const credentials = { email: actor.email, password: 'fictitious-test-only' };
interface LoginSource {
  getSnapshot(): SessionView;
  signIn(input: unknown): Promise<void>;
  signOutCurrent(): Promise<{ readonly remoteRevocationConfirmed: boolean }>;
  dispose(): void;
}
function fixture() {
  let event: (e: AuthEvent) => void = () => {};
  const calls = { login: 0, logout: 0, profile: 0 };
  const controls = {
    login: async (): Promise<AuthResolution> => ({
      kind: 'authenticated',
      identity: actor,
    }),
    logout: async () => ({ remoteRevocationConfirmed: true }),
  };
  const auth = {
    subscribe: (f: typeof event) => {
      event = f;
      return () => {};
    },
    register: async () => ({ kind: 'confirmation-required' }) as const,
    completeCallback: async () =>
      ({ kind: 'authenticated', identity: actor }) as const,
    signIn: async () => {
      calls.login++;
      return controls.login();
    },
    signOutCurrent: async () => {
      calls.logout++;
      return controls.logout();
    },
  };
  const source = createSessionCoordinator({
    auth,
    profiles: {
      getOwnProfile: async () => {
        calls.profile++;
        return profile;
      },
      ensureOwnProfile: async () => profile,
    },
  }) as unknown as LoginSource;
  return { source, calls, controls, emit: (e: AuthEvent) => event(e) };
}
test('login validates exact credential input and rejects identities roles and public keys as credentials', async () => {
  const f = fixture();
  for (const input of [
    null,
    {},
    { ...credentials, email: 'invalid' },
    { ...credentials, password: '' },
    { ...credentials, role: 'administrator' },
    { ...credentials, userId: actor.userId },
    { publicKey: 'sb_publishable_fixture' },
  ])
    await assert.rejects(
      () => f.source.signIn(input),
      (e) => e instanceof AuthError && e.code === 'invalid-input',
    );
  assert.equal(f.calls.login, 0);
});
test('login verifies identity and loads only the existing own profile', async () => {
  const f = fixture();
  await f.source.signIn(credentials);
  assert.equal(f.source.getSnapshot().kind, 'ready');
  assert.equal(f.calls.profile, 1);
  assert.ok(
    !JSON.stringify(f.source.getSnapshot()).includes(credentials.password),
  );
});
test('invalid unconfirmed and network login results never expose account data', async () => {
  for (const code of [
    'credentials-rejected',
    'confirmation-required',
    'network-unavailable',
  ] as const) {
    const f = fixture();
    f.controls.login = async () => {
      throw new AuthError(code);
    };
    await f.source.signIn(credentials);
    assert.deepEqual(f.source.getSnapshot(), {
      kind: 'retryable-error',
      error: code,
    });
    assert.equal(f.calls.profile, 0);
  }
});
test('logout clears private state synchronously and reports local-only offline outcome', async () => {
  const f = fixture();
  await f.source.signIn(credentials);
  f.controls.logout = async () => ({ remoteRevocationConfirmed: false });
  const pending = f.source.signOutCurrent();
  assert.notEqual(f.source.getSnapshot().kind, 'ready');
  assert.deepEqual(await pending, { remoteRevocationConfirmed: false });
  const state = f.source.getSnapshot();
  assert.equal(state.kind, 'signed-out');
  assert.ok(!JSON.stringify(state).includes(profile.displayName));
});
test('failed persistent cleanup cannot claim logout success and blocks login until cleanup retry succeeds', async () => {
  const f = fixture();
  await f.source.signIn(credentials);
  f.controls.logout = async () => {
    throw new AuthError('persistence-failed');
  };
  await assert.rejects(() => f.source.signOutCurrent());
  assert.deepEqual(f.source.getSnapshot(), {
    kind: 'retryable-error',
    error: 'persistence-failed',
  });
  await assert.rejects(() => f.source.signIn(credentials));
  assert.equal(f.calls.login, 1);
  f.controls.logout = async () => ({ remoteRevocationConfirmed: true });
  await f.source.signOutCurrent();
  await f.source.signIn(credentials);
  assert.equal(f.source.getSnapshot().kind, 'ready');
});
test('logout invalidates a pending login and rejects late signed-in events', async () => {
  const f = fixture();
  let resolve!: (value: AuthResolution) => void;
  f.controls.login = () =>
    new Promise((r) => {
      resolve = r;
    });
  const pending = f.source.signIn(credentials);
  await f.source.signOutCurrent();
  resolve({ kind: 'authenticated', identity: actor });
  await pending;
  f.emit({ kind: 'session-changed' });
  assert.equal(f.source.getSnapshot().kind, 'signed-out');
  assert.equal(f.calls.profile, 0);
});
test('missing login identity, recovery and anonymous identity cannot become ready', async () => {
  for (const result of [
    { kind: 'signed-out' },
    { kind: 'recovery' },
    { kind: 'authenticated', identity: { ...actor, isAnonymous: true } },
  ]) {
    const f = fixture();
    f.controls.login = async () => result as AuthResolution;
    await f.source.signIn(credentials);
    assert.notEqual(f.source.getSnapshot().kind, 'ready');
    assert.equal(f.calls.profile, 0);
  }
});
test('disposed coordinator rejects login and logout; duplicate presses share one login', async () => {
  const f = fixture();
  await Promise.all([
    f.source.signIn(credentials),
    f.source.signIn(credentials),
  ]);
  assert.equal(f.calls.login, 1);
  f.source.dispose();
  await assert.rejects(() => f.source.signIn(credentials));
  await assert.rejects(() => f.source.signOutCurrent());
});
