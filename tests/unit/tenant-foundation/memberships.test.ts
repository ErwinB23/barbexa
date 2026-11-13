import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  listOwnMemberships,
  listBarbershopMemberships,
} from '../../../src/features/tenant-foundation/application/memberships.js';
import { FoundationError } from '../../../src/features/tenant-foundation/domain/types.js';
import type { Membership } from '../../../src/features/tenant-foundation/domain/types.js';
const id = '11111111-1111-4111-8111-111111111111';
const own = {
  id,
  userId: id,
  barbershopId: id,
  role: 'barber' as const,
  status: 'inactive' as const,
};
const gateway = {
  listOwnMemberships: async () => [own],
  listBarbershopMemberships: async (_id: string) => [own],
};
test('own inactive and contextual membership lists preserve minimal types', async () => {
  assert.deepEqual(await listOwnMemberships(gateway), [own]);
  assert.deepEqual(await listBarbershopMemberships(gateway, id), [own]);
  assert.deepEqual(
    await listOwnMemberships({
      ...gateway,
      listOwnMemberships: async () => [],
    }),
    [],
  );
});
test('invalid tenant provider failures and forbidden not cached', async () => {
  await assert.rejects(listBarbershopMemberships(gateway, 'bad'), {
    code: 'INVALID_INPUT',
  });
  let calls = 0;
  const changing = {
    ...gateway,
    listBarbershopMemberships: async () => {
      calls++;
      throw new FoundationError('FORBIDDEN');
    },
  };
  await assert.rejects(listBarbershopMemberships(changing, id), {
    code: 'FORBIDDEN',
  });
  await assert.rejects(listBarbershopMemberships(changing, id), {
    code: 'FORBIDDEN',
  });
  assert.equal(calls, 2);
  await assert.rejects(
    listOwnMemberships({
      ...gateway,
      listOwnMemberships: async () => {
        throw Error('private upstream');
      },
    }),
    { code: 'DEPENDENCY_UNAVAILABLE' },
  );
});

test('membership results reject malformed data and foreign tenant, and project minimal fields', async () => {
  for (const value of [null, {}, [null], [{ ...own, role: 'client' }]]) {
    const invalid = async () => value as unknown as Membership[];
    await assert.rejects(
      listOwnMemberships({ ...gateway, listOwnMemberships: invalid }),
      { code: 'DEPENDENCY_UNAVAILABLE' },
    );
  }
  await assert.rejects(
    listBarbershopMemberships(
      {
        ...gateway,
        listBarbershopMemberships: async () => [
          { ...own, barbershopId: '22222222-2222-4222-8222-222222222222' },
        ],
      },
      id,
    ),
    { code: 'DEPENDENCY_UNAVAILABLE' },
  );
  const projected = await listOwnMemberships({
    ...gateway,
    listOwnMemberships: async () => [
      { ...own, profile: 'not part of the contract' },
    ],
  });
  assert.deepEqual(projected, [own]);
  await assert.rejects(
    listBarbershopMemberships(
      {
        ...gateway,
        listBarbershopMemberships: async () => {
          throw Error('private upstream');
        },
      },
      id,
    ),
    { code: 'DEPENDENCY_UNAVAILABLE' },
  );
});
