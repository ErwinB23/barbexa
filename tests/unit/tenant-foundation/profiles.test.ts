import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ensureOwnProfile,
  getOwnProfile,
  updateOwnProfile,
} from '../../../src/features/tenant-foundation/application/profiles.js';

import {
  validId,
  profileInput,
  profilePatch,
  dependency,
} from '../../../src/features/tenant-foundation/domain/validation.js';
import { FoundationError } from '../../../src/features/tenant-foundation/domain/types.js';
const id = '11111111-1111-4111-8111-111111111111';
const profile = { userId: id, displayName: 'Example', phone: null };
const failure = async () => {
  throw new Error('private upstream detail');
};
const gateway = {
  ensureOwnProfile: async () => profile,
  getOwnProfile: async () => profile,
  updateOwnProfile: async () => profile,
};

test('ensure success and repeated ensure preserve existing profile', async () => {
  assert.deepEqual(
    await ensureOwnProfile(gateway, { displayName: ' New ' }),
    profile,
  );
  assert.deepEqual(
    await ensureOwnProfile(gateway, { displayName: 'Other', phone: '1' }),
    profile,
  );
});
test('read success and controlled absence', async () => {
  assert.deepEqual(await getOwnProfile(gateway), profile);
  assert.equal(
    await getOwnProfile({ ...gateway, getOwnProfile: async () => null }),
    null,
  );
});
test('normalization and PATCH omitted/null/empty phone', async () => {
  for (const phone of [null, '', '  '])
    await updateOwnProfile(
      {
        ...gateway,
        updateOwnProfile: async (input) => {
          assert.deepEqual(input, { phone: null });
          return profile;
        },
      },
      { phone },
    );
  await updateOwnProfile(
    {
      ...gateway,
      updateOwnProfile: async (input) => {
        assert.deepEqual(input, { displayName: 'Edited' });
        return profile;
      },
    },
    { displayName: ' Edited ' },
  );
  await ensureOwnProfile(
    {
      ...gateway,
      ensureOwnProfile: async (input) => {
        assert.deepEqual(input, { displayName: 'New', phone: null });
        return profile;
      },
    },
    { displayName: ' New ' },
  );
  await updateOwnProfile(
    {
      ...gateway,
      updateOwnProfile: async (input) => {
        assert.deepEqual(input, { phone: '123' });
        return profile;
      },
    },
    { phone: ' 123 ' },
  );
});
test('invalid runtime input never reaches gateway', async () => {
  for (const input of [
    null,
    [],
    {},
    { displayName: '' },
    { displayName: 7 },
    { displayName: 'x', phone: 3 },
    { displayName: 'x', userId: id },
  ])
    await assert.rejects(ensureOwnProfile(gateway, input), {
      code: 'INVALID_INPUT',
    });
  for (const input of [
    {},
    { phone: undefined },
    { displayName: ' ' },
    { userId: id },
    { phone: 7 },
  ])
    await assert.rejects(updateOwnProfile(gateway, input), {
      code: 'INVALID_INPUT',
    });
});
test('dependency failures sanitized and missing update not success', async () => {
  await assert.rejects(
    ensureOwnProfile(
      { ...gateway, ensureOwnProfile: failure },
      { displayName: 'X' },
    ),
    { code: 'DEPENDENCY_UNAVAILABLE' },
  );
  await assert.rejects(getOwnProfile({ ...gateway, getOwnProfile: failure }), {
    code: 'DEPENDENCY_UNAVAILABLE',
  });
  await assert.rejects(
    updateOwnProfile(
      { ...gateway, updateOwnProfile: failure },
      { phone: null },
    ),
    { code: 'DEPENDENCY_UNAVAILABLE' },
  );
  await assert.rejects(
    updateOwnProfile(
      { ...gateway, updateOwnProfile: async () => null },
      { phone: null },
    ),
    { code: 'NOT_AVAILABLE' },
  );
});
test('identifier validation and typed errors preserve safe codes', async () => {
  assert.equal(validId(id), true);
  for (const value of [null, 'invalid']) assert.equal(validId(value), false);
  const error = new FoundationError('FORBIDDEN');
  await assert.rejects(
    dependency(async () => {
      throw error;
    }),
    (e) => e === error,
  );
  assert.deepEqual(profileInput({ displayName: 'Name', phone: ' 123 ' }), {
    displayName: 'Name',
    phone: '123',
  });
  assert.deepEqual(profileInput({ displayName: 'Name', phone: null }), {
    displayName: 'Name',
    phone: null,
  });
  assert.deepEqual(profilePatch({ displayName: ' Name ', phone: ' 1 ' }), {
    displayName: 'Name',
    phone: '1',
  });
});
