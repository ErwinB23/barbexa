import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSessionCoordinator } from '../../../src/features/authentication/application/session-coordinator.js';
import { AuthError } from '../../../src/features/authentication/domain/auth-error.js';
import type { AuthEvent } from '../../../src/features/authentication/application/auth-gateway.js';
import type { ProfileDetails } from '../../../src/features/authentication/application/auth-actions.js';
import type { OwnProfile } from '../../../src/features/authentication/domain/session-state.js';

const identity = {
  userId: '11111111-1111-4111-8111-111111111111',
  email: 'fixture@example.invalid',
  emailConfirmed: true,
  isAnonymous: false,
} as const;
const original: OwnProfile = {
  userId: identity.userId,
  displayName: 'Original',
  phone: '123',
};
const edited = { displayName: 'Edited', phone: null };
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
function fixture() {
  let listener: (event: AuthEvent) => void = () => {};
  const calls: ProfileDetails[] = [];
  const control = {
    write: async (input: ProfileDetails): Promise<OwnProfile> => ({
      userId: identity.userId,
      ...input,
    }),
  };
  const profiles = {
    getOwnProfile: async () => original,
    ensureOwnProfile: async () => original,
    updateOwnProfile: async (input: ProfileDetails) => {
      calls.push(input);
      return control.write(input);
    },
  };
  const source = createSessionCoordinator({
    profiles,
    auth: {
      subscribe: (f) => {
        listener = f;
        return () => {};
      },
      register: async () => ({ kind: 'confirmation-required' }) as const,
      completeCallback: async () =>
        ({ kind: 'authenticated', identity }) as const,
      restoreAndVerify: async () =>
        ({ kind: 'authenticated', identity }) as const,
      signOutCurrent: async () => ({ remoteRevocationConfirmed: true }),
    },
  });
  const update = (input: unknown) =>
    (
      source as typeof source & {
        updateOwnProfile(input: unknown): Promise<void>;
      }
    ).updateOwnProfile(input);
  return {
    source,
    calls,
    control,
    update,
    emit: (event: AuthEvent) => listener(event),
  };
}

test('own edit publishes normalized server profile and preserves verified context/generation', async () => {
  const f = fixture();
  await f.source.restoreAndVerify();
  const before = f.source.getSnapshot();
  assert.equal(before.kind, 'ready');
  await f.update({ displayName: ' Edited ', phone: ' ' });
  const next = f.source.getSnapshot();
  assert.equal(next.kind, 'ready');
  if (before.kind === 'ready' && next.kind === 'ready') {
    assert.deepEqual(next.profile, { userId: identity.userId, ...edited });
    assert.equal(next.context, before.context);
    assert.equal(next.generation, before.generation);
    assert.equal(next.identity, before.identity);
  }
  assert.deepEqual(f.calls, [edited]);
});
test('invalid names, identities, roles and tenant fields never reach persistence', async () => {
  const f = fixture();
  await f.source.restoreAndVerify();
  for (const input of [
    null,
    [],
    {},
    { displayName: '' },
    { ...edited, userId: identity.userId },
    { ...edited, role: 'administrator' },
    { ...edited, barbershopId: 'forged' },
    { ...edited, phone: 2 },
  ]) {
    await assert.rejects(
      () => f.update(input),
      (e: unknown) => e instanceof AuthError && e.code === 'invalid-input',
    );
  }
  assert.equal(f.calls.length, 0);
});
test('unverified, recovery and disposed sessions cannot edit', async () => {
  const f = fixture();
  await assert.rejects(() => f.update(edited));
  f.emit({ kind: 'recovery' });
  await assert.rejects(() => f.update(edited));
  f.source.dispose();
  await assert.rejects(() => f.update(edited));
  assert.equal(f.calls.length, 0);
});
test('simultaneous saves are one write and null phone is retained', async () => {
  const f = fixture();
  await f.source.restoreAndVerify();
  const hold = deferred<OwnProfile>();
  f.control.write = () => hold.promise;
  const first = f.update(edited),
    second = f.update(edited);
  assert.equal(f.calls.length, 1);
  hold.resolve({ ...original, ...edited });
  await Promise.all([first, second]);
  assert.equal(f.source.getSnapshot().kind, 'ready');
});
test('transient failure preserves current profile and allows retry without exposing provider text', async () => {
  const f = fixture();
  await f.source.restoreAndVerify();
  const before = f.source.getSnapshot();
  f.control.write = async () => {
    throw new Error('private provider body');
  };
  await assert.rejects(
    () => f.update(edited),
    (e: unknown) =>
      e instanceof AuthError && e.message === 'provider-unavailable',
  );
  assert.equal(f.source.getSnapshot(), before);
  f.control.write = async (input) => ({ ...original, ...input });
  await f.update(edited);
  assert.equal(f.calls.length, 2);
});
test('foreign server profile is rejected without replacing the own profile', async () => {
  const f = fixture();
  await f.source.restoreAndVerify();
  const before = f.source.getSnapshot();
  f.control.write = async () => ({
    ...original,
    userId: '22222222-2222-4222-8222-222222222222',
  });
  await assert.rejects(() => f.update(edited));
  assert.equal(f.source.getSnapshot(), before);
});
test('definitive identity denial removes private session', async () => {
  const f = fixture();
  await f.source.restoreAndVerify();
  f.control.write = async () => {
    throw new AuthError('credentials-rejected');
  };
  await assert.rejects(() => f.update(edited));
  assert.equal(f.source.getSnapshot().kind, 'signed-out');
});
test('late write after logout cannot restore private account', async () => {
  const f = fixture();
  await f.source.restoreAndVerify();
  const hold = deferred<OwnProfile>();
  f.control.write = () => hold.promise;
  const pending = f.update(edited);
  await f.source.signOutCurrent();
  hold.resolve({ ...original, ...edited });
  await assert.rejects(() => pending);
  assert.equal(f.source.getSnapshot().kind, 'signed-out');
});
test('revocation and reverified generation discard prior writes and permit fresh edits', async () => {
  const f = fixture();
  await f.source.restoreAndVerify();
  const hold = deferred<OwnProfile>();
  f.control.write = () => hold.promise;
  const old = f.update({ displayName: 'Stale', phone: null });
  f.emit({ kind: 'signed-out' });
  await f.source.restoreAndVerify();
  f.control.write = async (input) => ({ ...original, ...input });
  await f.update(edited);
  hold.resolve({ ...original, displayName: 'Stale' });
  await assert.rejects(() => old);
  const final = f.source.getSnapshot();
  assert.equal(final.kind, 'ready');
  if (final.kind === 'ready') assert.equal(final.profile.displayName, 'Edited');
});
