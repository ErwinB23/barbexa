import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createOwnBarbershop,
  getBarbershop,
  renameBarbershop,
} from '../../../src/features/tenant-foundation/application/barbershops.js';
import { FoundationError } from '../../../src/features/tenant-foundation/domain/types.js';
import {
  isBarbershop,
  isMembership,
} from '../../../src/features/tenant-foundation/domain/barbershop-validation.js';
const id = '11111111-1111-4111-8111-111111111111';
const shop = { id, name: 'Test' };
const membership = {
  id,
  userId: id,
  barbershopId: id,
  role: 'administrator' as const,
  status: 'active' as const,
};
const result = { barbershop: shop, membership };
const gateway = {
  createOwnBarbershop: async (_input: { name: string }) => result,
  getBarbershop: async (_id: string) => shop,
  renameBarbershop: async (_id: string, _name: string) => shop,
};
test('create/get/rename normalize and use narrow contract', async () => {
  assert.deepEqual(
    await createOwnBarbershop(
      {
        ...gateway,
        createOwnBarbershop: async (input) => {
          assert.deepEqual(input, { name: 'Test' });
          return result;
        },
      },
      { name: ' Test ' },
    ),
    result,
  );
  assert.deepEqual(await getBarbershop(gateway, id), shop);
  assert.deepEqual(await renameBarbershop(gateway, id, ' Test '), shop);
});
test('invalid names identifiers and alternative actor/role rejected', async () => {
  for (const input of [
    null,
    [],
    {},
    { name: '' },
    { name: 3 },
    { name: 'X', userId: id },
    { name: 'X', role: 'administrator' },
  ])
    await assert.rejects(createOwnBarbershop(gateway, input), {
      code: 'INVALID_INPUT',
    });
  await assert.rejects(getBarbershop(gateway, 'bad'), {
    code: 'INVALID_INPUT',
  });
  await assert.rejects(renameBarbershop(gateway, id, ' '), {
    code: 'INVALID_INPUT',
  });
  assert.equal(isBarbershop(null), false);
  for (const role of ['client', null])
    assert.equal(isMembership({ ...membership, role }), false);
  assert.equal(isMembership({ ...membership, status: 'pending' }), false);
  assert.equal(isMembership({ ...membership, userId: 'bad' }), false);
});
test('absence provider PROFILE_REQUIRED and timeout never retry', async () => {
  assert.equal(
    await getBarbershop({ ...gateway, getBarbershop: async () => null }, id),
    null,
  );
  await assert.rejects(
    renameBarbershop(
      { ...gateway, renameBarbershop: async () => null },
      id,
      'X',
    ),
    { code: 'NOT_AVAILABLE' },
  );
  for (const error of [
    new FoundationError('PROFILE_REQUIRED'),
    Error('timeout private detail'),
  ]) {
    let calls = 0;
    await assert.rejects(
      createOwnBarbershop(
        {
          ...gateway,
          createOwnBarbershop: async () => {
            calls++;
            throw error;
          },
        },
        { name: 'X' },
      ),
      {
        code:
          error instanceof FoundationError
            ? 'PROFILE_REQUIRED'
            : 'DEPENDENCY_UNAVAILABLE',
      },
    );
    assert.equal(calls, 1);
  }
});

test('malformed provider outputs identifiers roles and status fail closed', async () => {
  for (const value of [
    null,
    {},
    { id: 'bad', name: 'X' },
    { id, name: 7 },
    { id, name: ' ' },
  ])
    assert.equal(isBarbershop(value), false);
  for (const value of [
    null,
    {},
    { ...membership, id: 'bad' },
    { ...membership, barbershopId: 'bad' },
    { ...membership, status: 'inactive' },
    { ...membership, role: 'barber' },
  ]) {
    if (value && 'status' in value && value.status === 'inactive')
      assert.equal(isMembership(value), true);
    else if (value && 'role' in value && value.role === 'barber')
      assert.equal(isMembership(value), true);
    else assert.equal(isMembership(value), false);
  }
  const bad = { ...shop, id: '22222222-2222-4222-8222-222222222222' };
  await assert.rejects(
    getBarbershop({ ...gateway, getBarbershop: async () => bad }, id),
    { code: 'DEPENDENCY_UNAVAILABLE' },
  );
  await assert.rejects(
    renameBarbershop(
      { ...gateway, renameBarbershop: async () => bad },
      id,
      'X',
    ),
    { code: 'DEPENDENCY_UNAVAILABLE' },
  );
  await assert.rejects(
    createOwnBarbershop(
      {
        ...gateway,
        createOwnBarbershop: async () => ({
          ...result,
          membership: { ...membership, barbershopId: bad.id },
        }),
      },
      { name: 'X' },
    ),
    { code: 'DEPENDENCY_UNAVAILABLE' },
  );
  await assert.rejects(
    createOwnBarbershop(
      {
        ...gateway,
        createOwnBarbershop: async () => ({
          ...result,
          membership: { ...membership, role: 'barber' as const },
        }),
      },
      { name: 'X' },
    ),
    { code: 'DEPENDENCY_UNAVAILABLE' },
  );
  await assert.rejects(
    createOwnBarbershop(
      {
        ...gateway,
        createOwnBarbershop: async () => ({
          ...result,
          membership: { ...membership, status: 'inactive' as const },
        }),
      },
      { name: 'X' },
    ),
    { code: 'DEPENDENCY_UNAVAILABLE' },
  );
});
