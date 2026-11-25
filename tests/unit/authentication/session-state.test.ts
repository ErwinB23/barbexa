import assert from 'node:assert/strict';
import { test } from 'node:test';
import { verifiedIdentity } from '../../../src/features/authentication/domain/identity.js';
import { AuthError } from '../../../src/features/authentication/domain/auth-error.js';
import {
  readySession,
  selectedContext,
} from '../../../src/features/authentication/domain/session-state.js';

const userId = '11111111-1111-4111-8111-111111111111';
const barbershopId = '22222222-2222-4222-8222-222222222222';
const identityInput = {
  userId,
  email: 'technical@example.invalid',
  emailConfirmed: true,
  isAnonymous: false,
};

test('identity accepts only confirmed non-anonymous shape, never role metadata', () => {
  const identity = verifiedIdentity({
    ...identityInput,
    role: 'administrator',
  });
  assert.deepEqual(identity, identityInput);
  for (const input of [
    null,
    {},
    { ...identityInput, userId: 'bad' },
    { ...identityInput, emailConfirmed: false },
    { ...identityInput, isAnonymous: true },
    { ...identityInput, email: '' },
  ]) {
    assert.throws(() => verifiedIdentity(input), AuthError);
  }
});

test('ready requires a matching profile with nullable phone and valid generation', () => {
  const identity = verifiedIdentity(identityInput);
  const profile = { userId, displayName: 'Technical', phone: null };
  const result = readySession(identity, profile, 0);
  assert.equal(result.kind, 'ready');
  assert.equal(result.profile.phone, null);
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.profile));
  for (const generation of [-1, 0.5, NaN, Infinity])
    assert.throws(() => readySession(identity, profile, generation), AuthError);
  assert.throws(
    () => readySession(identity, { ...profile, userId: barbershopId }, 0),
    AuthError,
  );
});

test('selected context requires active own membership, matching resource and exact role', () => {
  const identity = verifiedIdentity(identityInput);
  const membership = {
    id: userId,
    userId,
    barbershopId,
    role: 'barber' as const,
    status: 'active' as const,
  };
  const shop = { id: barbershopId, name: 'Technical' };
  const context = selectedContext(identity, membership, shop);
  assert.equal(context.role, 'barber');
  assert.ok(Object.isFrozen(context));
  for (const changed of [
    { ...membership, userId: barbershopId },
    { ...membership, status: 'inactive' as const },
  ])
    assert.throws(() => selectedContext(identity, changed, shop), AuthError);
  assert.throws(
    () => selectedContext(identity, membership, { ...shop, id: userId }),
    AuthError,
  );
});

test('errors carry only a public code and safe message', () => {
  const error = new AuthError('persistence-failed');
  assert.equal(error.code, 'persistence-failed');
  assert.equal(error.message, 'persistence-failed');
  assert.equal('token' in error, false);
});
