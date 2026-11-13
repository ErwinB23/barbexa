import { createOwnBarbershop } from '../../../supabase/functions/_shared/tenant-foundation/application/create-own-barbershop.ts';
import { FoundationError } from '../../../supabase/functions/_shared/tenant-foundation/domain/types.ts';

import {
  isBarbershop,
  isMembership,
  barbershopInput,
  shopId,
  createdBarbershop,
} from '../../../supabase/functions/_shared/tenant-foundation/domain/barbershop-validation.ts';
const id = '11111111-1111-4111-8111-111111111111';
const result = {
  barbershop: { id, name: 'Test' },
  membership: {
    id,
    userId: id,
    barbershopId: id,
    role: 'administrator' as const,
    status: 'active' as const,
  },
};
function ok(v: unknown) {
  if (!v) throw Error('Assertion');
}
async function rejects(fn: () => Promise<unknown>, code: string) {
  try {
    await fn();
  } catch (e) {
    ok((e as { code: string }).code === code);
    return;
  }
  throw Error('Expected failure');
}
Deno.test(
  'server own create forwards verified context and normalized name',
  async () => {
    const gateway = {
      createOwnBarbershop: async (
        actor: { userId: string },
        input: { name: string },
      ) => {
        ok(actor.userId === id);
        ok(input.name === 'Test');
        return result;
      },
    };
    ok(
      (await createOwnBarbershop(gateway, { userId: id }, { name: ' Test ' }))
        .membership.userId === id,
    );
  },
);
Deno.test(
  'server invalid actor impersonation profile required and provider timeout',
  async () => {
    const gateway = { createOwnBarbershop: async () => result };
    await rejects(
      () => createOwnBarbershop(gateway, { userId: 'bad' }, { name: 'X' }),
      'UNAUTHENTICATED',
    );
    for (const input of [
      { name: ' ' },
      { name: 'X', actorId: id },
      { name: 'X', role: 'administrator' },
    ])
      await rejects(
        () => createOwnBarbershop(gateway, { userId: id }, input),
        'INVALID_INPUT',
      );
    for (const error of [
      new FoundationError('PROFILE_REQUIRED'),
      Error('timeout'),
    ]) {
      let calls = 0;
      await rejects(
        () =>
          createOwnBarbershop(
            {
              createOwnBarbershop: async () => {
                calls++;
                throw error;
              },
            },
            { userId: id },
            { name: 'X' },
          ),
        error instanceof FoundationError
          ? 'PROFILE_REQUIRED'
          : 'DEPENDENCY_UNAVAILABLE',
      );
      ok(calls === 1);
    }
  },
);
Deno.test('server validators and malformed persistence results', async () => {
  for (const value of [
    null,
    {},
    { id: 'bad', name: 'X' },
    { id, name: 4 },
    { id, name: '' },
  ])
    ok(!isBarbershop(value));
  for (const value of [
    null,
    {},
    { ...result.membership, id: 'bad' },
    { ...result.membership, userId: 'bad' },
    { ...result.membership, barbershopId: 'bad' },
    { ...result.membership, role: 'client' },
    { ...result.membership, status: 'pending' },
  ])
    ok(!isMembership(value));
  ok(
    isMembership({ ...result.membership, role: 'barber', status: 'inactive' }),
  );
  ok(shopId(id) === id);
  await rejects(async () => shopId('bad'), 'INVALID_INPUT');
  for (const input of [null, [], {}, { name: 4 }])
    await rejects(async () => barbershopInput(input), 'INVALID_INPUT');
  for (const actor of [null, {}, { userId: 3 }])
    await rejects(
      () =>
        createOwnBarbershop(
          { createOwnBarbershop: async () => result },
          actor,
          { name: 'X' },
        ),
      'UNAUTHENTICATED',
    );
  for (const membership of [
    { ...result.membership, userId: '22222222-2222-4222-8222-222222222222' },
    { ...result.membership, role: 'barber' as const },
    { ...result.membership, status: 'inactive' as const },
    {
      ...result.membership,
      barbershopId: '22222222-2222-4222-8222-222222222222',
    },
  ])
    await rejects(
      () =>
        createOwnBarbershop(
          { createOwnBarbershop: async () => ({ ...result, membership }) },
          { userId: id },
          { name: 'X' },
        ),
      'DEPENDENCY_UNAVAILABLE',
    );
  ok(createdBarbershop(result).barbershop.id === id);
});
