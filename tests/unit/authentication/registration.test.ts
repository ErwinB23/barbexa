import assert from 'node:assert/strict';
import { test } from 'node:test';
import type {
  AuthGateway,
  RegistrationInput,
  ValidatedCallback,
  AuthEvent,
  AuthApplicationSource,
} from '../../../src/features/authentication/application/auth-gateway.js';
import type {
  OwnProfile,
  SessionView,
} from '../../../src/features/authentication/domain/session-state.js';
import { AuthError } from '../../../src/features/authentication/domain/auth-error.js';

// Contract-first T010. T011 will provide this factory; no fake production coordinator.
interface RegistrationCoordinator extends AuthApplicationSource {
  canRetryProfile(): boolean;
  register(input: unknown): Promise<void>;
  completeCallback(input: ValidatedCallback): Promise<void>;
  retryProfile(input?: {
    displayName: string;
    phone: string | null;
  }): Promise<void>;
  getSnapshot(): SessionView;
  dispose(): void;
}
const identity = {
  userId: '11111111-1111-4111-8111-111111111111',
  email: 'test@example.invalid',
  emailConfirmed: true,
  isAnonymous: false,
} as const;
const input: RegistrationInput = {
  displayName: 'Prueba técnica',
  phone: null,
  email: identity.email,
  password: 'test-only-not-a-real-password',
};
const profile: OwnProfile = {
  userId: identity.userId,
  displayName: 'Nombre conservado',
  phone: null,
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
async function fixture() {
  let emit: (event: AuthEvent) => void = () => {};
  const calls = { register: 0, exchange: 0, get: 0, ensure: 0 };
  const received: unknown[] = [];
  const controls = {
    register: async (): ReturnType<AuthGateway['register']> => ({
      kind: 'confirmation-required',
    }),
    exchange: async (): ReturnType<AuthGateway['completeCallback']> => ({
      kind: 'authenticated',
      identity,
    }),
    get: async (): Promise<OwnProfile | null> => profile,
    ensure: async (): Promise<OwnProfile> => profile,
  };
  const unused = async (): Promise<never> => {
    throw new Error('Operation outside the T010 registration scenario');
  };
  const auth: AuthGateway = {
    signInWithGoogle: unused,
    signIn: unused,
    restoreAndVerify: unused,
    signOutCurrent: unused,
    requestRecovery: unused,
    setRecoveredPassword: unused,
    subscribe: (listener) => {
      emit = listener;
      return () => {
        emit = () => {};
      };
    },
    register: async (value) => {
      calls.register++;
      received.push(value);
      return controls.register();
    },
    completeCallback: async () => {
      calls.exchange++;
      return controls.exchange();
    },
  };
  const profiles = {
    getOwnProfile: async () => {
      calls.get++;
      return controls.get();
    },
    ensureOwnProfile: async (value: {
      displayName: string;
      phone: string | null;
    }) => {
      calls.ensure++;
      received.push(value);
      return controls.ensure();
    },
  };
  // Computed path keeps existing tests compilable; the missing implementation must fail at runtime.
  const target =
    '../../../src/features/authentication/application/' +
    'session-coordinator.js';
  const module = (await import(target)) as {
    createSessionCoordinator: (ports: {
      auth: typeof auth;
      profiles: typeof profiles;
    }) => RegistrationCoordinator;
  };
  assert.equal(typeof module.createSessionCoordinator, 'function');
  return {
    coordinator: module.createSessionCoordinator({ auth, profiles }),
    calls,
    controls,
    received,
    emit: (event: AuthEvent) => emit(event),
  };
}

test('registration rejects malformed input before any Auth or profile operation', async () => {
  const f = await fixture();
  for (const value of [
    null,
    {},
    { ...input, email: '' },
    { ...input, email: 'invalid' },
    { ...input, password: '' },
    { ...input, displayName: '   ' },
    { ...input, phone: 42 },
  ]) {
    await assert.rejects(
      () => f.coordinator.register(value),
      (e: unknown) => e instanceof AuthError && e.code === 'invalid-input',
    );
  }
  assert.deepEqual(f.calls, { register: 0, exchange: 0, get: 0, ensure: 0 });
});

test('profile retry from presentation uses retained details and never repeats registration', async () => {
  const f = await fixture();
  assert.equal(f.coordinator.canRetryProfile(), false);
  f.controls.register = async () => ({ kind: 'authenticated', identity });
  f.controls.get = async () => null;
  f.controls.ensure = async () => {
    throw new AuthError('network-unavailable');
  };
  await f.coordinator.register(input);
  assert.equal(f.coordinator.canRetryProfile(), true);
  f.controls.ensure = async () => profile;
  await f.coordinator.retryProfile();
  assert.equal(f.coordinator.getSnapshot().kind, 'ready');
  assert.equal(f.coordinator.canRetryProfile(), false);
  assert.equal(f.calls.register, 1);
  f.coordinator.dispose();
  assert.equal(f.coordinator.canRetryProfile(), false);
});

test('callback without in-memory details offers profile completion before a no-argument retry', async () => {
  const f = await fixture();
  f.controls.get = async () => null;
  await f.coordinator.completeCallback({
    code: 'callback-without-draft',
    purpose: 'confirmation',
  });
  assert.equal(f.coordinator.getSnapshot().kind, 'profile-required');
  assert.equal(f.coordinator.canRetryProfile(), true);
  await f.coordinator.retryProfile();
  assert.equal(f.coordinator.getSnapshot().kind, 'profile-required');
  assert.equal(f.calls.ensure, 0);
  f.coordinator.dispose();
});
test('confirmation-required never reads or creates a profile and never publishes ready', async () => {
  const f = await fixture();
  await f.coordinator.register(input);
  assert.equal(f.coordinator.getSnapshot().kind, 'confirmation-required');
  assert.deepEqual(f.calls, { register: 1, exchange: 0, get: 0, ensure: 0 });
});
test('concurrent double submit calls Auth register once', async () => {
  const f = await fixture();
  const pending = deferred<Awaited<ReturnType<AuthGateway['register']>>>();
  f.controls.register = () => pending.promise;
  const a = f.coordinator.register(input),
    b = f.coordinator.register(input);
  await Promise.resolve();
  assert.equal(f.calls.register, 1);
  pending.resolve({ kind: 'confirmation-required' });
  await Promise.all([a, b]);
  assert.equal(f.coordinator.getSnapshot().kind, 'confirmation-required');
});
test('duplicate confirmation is consumed once including after the first exchange settles', async () => {
  const f = await fixture();
  const pending =
    deferred<Awaited<ReturnType<AuthGateway['completeCallback']>>>();
  f.controls.exchange = () => pending.promise;
  const link = {
    code: 'test-confirmation-code',
    purpose: 'confirmation',
  } as const;
  const a = f.coordinator.completeCallback(link),
    b = f.coordinator.completeCallback(link);
  await Promise.resolve();
  assert.equal(f.calls.exchange, 1);
  pending.resolve({ kind: 'authenticated', identity });
  await Promise.all([a, b]);
  await f.coordinator.completeCallback(link);
  assert.equal(f.calls.exchange, 1);
  assert.equal(f.calls.get, 1);
  assert.equal(f.calls.ensure, 0);
});
test('existing own profile is preserved instead of overwritten by registration metadata', async () => {
  const f = await fixture();
  f.controls.register = async () => ({ kind: 'authenticated', identity });
  await f.coordinator.register(input);
  const state = f.coordinator.getSnapshot();
  assert.equal(state.kind, 'ready');
  if (state.kind !== 'ready') assert.fail();
  assert.deepEqual(state.profile, profile);
  assert.equal(f.calls.ensure, 0);
  assert.equal(JSON.stringify(state).includes(input.password), false);
});
test('absent profile uses existing own-profile port with nullable phone and no arbitrary actor', async () => {
  const f = await fixture();
  f.controls.register = async () => ({ kind: 'authenticated', identity });
  f.controls.get = async () => null;
  await f.coordinator.register({ ...input, displayName: '  Prueba técnica  ' });
  assert.equal(f.calls.ensure, 1);
  assert.deepEqual(f.received.at(-1), {
    displayName: 'Prueba técnica',
    phone: null,
  });
});
test('profile normalization follows 002: no extra name length limit and blank phone becomes null', async () => {
  const f = await fixture();
  f.controls.register = async () => ({ kind: 'authenticated', identity });
  f.controls.get = async () => null;
  const displayName = 'N'.repeat(600);
  await f.coordinator.register({ ...input, displayName, phone: '   ' });
  assert.deepEqual(f.received.at(-1), { displayName, phone: null });
});
test('confirmation without registration data requires own profile input instead of inventing a name', async () => {
  const f = await fixture();
  f.controls.get = async () => null;
  await f.coordinator.completeCallback({
    code: 'test-code-without-origin-view',
    purpose: 'confirmation',
  });
  assert.equal(f.coordinator.getSnapshot().kind, 'profile-required');
  assert.equal(f.calls.ensure, 0);
  await f.coordinator.retryProfile({
    displayName: input.displayName,
    phone: null,
  });
  assert.equal(f.calls.ensure, 1);
  assert.equal(f.calls.register, 0);
  assert.equal(f.coordinator.getSnapshot().kind, 'ready');
});
test('profile network failure stays non-ready; retry does not sign up or overwrite a now-existing profile', async () => {
  const f = await fixture();
  f.controls.register = async () => ({ kind: 'authenticated', identity });
  f.controls.get = async () => {
    throw new AuthError('network-unavailable');
  };
  await f.coordinator.register(input).catch(() => {});
  assert.equal(f.coordinator.getSnapshot().kind, 'retryable-error');
  f.controls.get = async () => profile;
  await f.coordinator.retryProfile({
    displayName: input.displayName,
    phone: null,
  });
  const state = f.coordinator.getSnapshot();
  assert.equal(state.kind, 'ready');
  if (state.kind !== 'ready') assert.fail();
  assert.deepEqual(state.profile, profile);
  assert.equal(f.calls.register, 1);
  assert.equal(f.calls.exchange, 0);
  assert.equal(f.calls.ensure, 0);
});
test('ensure failure can retry profile without repeating registration', async () => {
  const f = await fixture();
  f.controls.register = async () => ({ kind: 'authenticated', identity });
  f.controls.get = async () => null;
  f.controls.ensure = async () => {
    throw new AuthError('network-unavailable');
  };
  await f.coordinator.register(input).catch(() => {});
  assert.equal(f.coordinator.getSnapshot().kind, 'retryable-error');
  f.controls.ensure = async () => profile;
  await f.coordinator.retryProfile({
    displayName: input.displayName,
    phone: null,
  });
  assert.equal(f.calls.register, 1);
  assert.equal(f.calls.ensure, 2);
  assert.equal(f.coordinator.getSnapshot().kind, 'ready');
});
test('registration timeout does not retry signUp automatically or claim success', async () => {
  const f = await fixture();
  f.controls.register = async () => {
    throw new AuthError('network-unavailable');
  };
  await f.coordinator.register(input).catch(() => {});
  assert.equal(f.calls.register, 1);
  assert.equal(f.calls.get, 0);
  const state = f.coordinator.getSnapshot();
  assert.equal(state.kind, 'retryable-error');
  if (state.kind !== 'retryable-error') assert.fail();
  assert.equal(state.error, 'network-unavailable');
});
test('sign-out during a profile request discards the old result', async () => {
  const f = await fixture();
  const pending = deferred<OwnProfile | null>();
  f.controls.register = async () => ({ kind: 'authenticated', identity });
  f.controls.get = () => pending.promise;
  const registration = f.coordinator.register(input);
  await Promise.resolve();
  await Promise.resolve();
  f.emit({ kind: 'signed-out' });
  pending.resolve(profile);
  await registration;
  assert.equal(f.coordinator.getSnapshot().kind, 'signed-out');
  assert.equal(f.calls.ensure, 0);
});
test('failed new confirmation cannot retry the previously verified account profile', async () => {
  const f = await fixture();
  f.controls.register = async () => ({ kind: 'authenticated', identity });
  await f.coordinator.register(input);
  f.controls.exchange = async () => {
    throw new AuthError('link-invalid');
  };
  await f.coordinator.completeCallback({
    code: 'different-failed-code',
    purpose: 'confirmation',
  });
  await assert.rejects(() =>
    f.coordinator.retryProfile({ displayName: 'Other', phone: null }),
  );
  assert.equal(f.calls.get, 1);
});
test('subscriptions are removable and disposal rejects new credential operations', async () => {
  const f = await fixture();
  let notifications = 0;
  const off = f.coordinator.subscribe(() => notifications++);
  await f.coordinator.register(input);
  assert.ok(notifications > 0);
  off();
  const previous = notifications;
  f.emit({ kind: 'session-changed' });
  assert.equal(f.coordinator.getSnapshot().kind, 'confirmation-required');
  f.emit({ kind: 'recovery' });
  assert.equal(f.coordinator.getSnapshot().kind, 'recovery');
  assert.equal(notifications, previous);
  f.coordinator.dispose();
  await assert.rejects(() => f.coordinator.register(input));
  await assert.rejects(() =>
    f.coordinator.completeCallback({
      code: 'after-dispose',
      purpose: 'confirmation',
    }),
  );
  await assert.rejects(() =>
    f.coordinator.retryProfile({ displayName: 'Test', phone: null }),
  );
});
test('provider-verified recovery never bootstraps a normal profile; untrusted errors are sanitized', async () => {
  const f = await fixture();
  f.controls.exchange = async () => ({ kind: 'recovery' });
  await f.coordinator.completeCallback({
    code: 'recovery-only',
    purpose: 'recovery',
  });
  assert.equal(f.coordinator.getSnapshot().kind, 'recovery');
  assert.equal(f.calls.get, 0);
  assert.equal(f.calls.ensure, 0);
  await assert.rejects(() =>
    f.coordinator.retryProfile({ displayName: 'Test', phone: null }),
  );
  f.coordinator.dispose();
  const g = await fixture();
  g.controls.register = async () => {
    throw new Error('raw provider test detail');
  };
  await g.coordinator.register(input);
  assert.deepEqual(g.coordinator.getSnapshot(), {
    kind: 'retryable-error',
    error: 'provider-unavailable',
  });
  g.coordinator.dispose();
});
test('a failed profile retry remains recoverable and concurrent retry presses do not duplicate ensure', async () => {
  const f = await fixture();
  f.controls.register = async () => ({ kind: 'authenticated', identity });
  f.controls.get = async () => null;
  f.controls.ensure = async () => {
    throw new AuthError('network-unavailable');
  };
  await f.coordinator.register(input);
  const details = { displayName: input.displayName, phone: null };
  await Promise.all([
    f.coordinator.retryProfile(details),
    f.coordinator.retryProfile(details),
  ]);
  assert.deepEqual(f.coordinator.getSnapshot(), {
    kind: 'retryable-error',
    error: 'network-unavailable',
  });
  assert.equal(f.calls.register, 1);
  assert.equal(f.calls.ensure, 2);
  f.coordinator.dispose();
});
