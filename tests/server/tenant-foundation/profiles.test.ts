import { ensureOwnProfile } from '../../../supabase/functions/_shared/tenant-foundation/application/ensure-own-profile.ts';

import {
  profileInput,
  profilePatch,
  validId,
  dependency,
} from '../../../supabase/functions/_shared/tenant-foundation/domain/validation.ts';
import { FoundationError } from '../../../supabase/functions/_shared/tenant-foundation/domain/types.ts';
const id = '11111111-1111-4111-8111-111111111111';
const profile = { userId: id, displayName: 'Existing', phone: null };
function equal(a: unknown, b: unknown) {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw Error('Mismatch');
}
async function rejects(action: () => Promise<unknown>, code: string) {
  try {
    await action();
  } catch (e) {
    equal((e as { code: string }).code, code);
    return;
  }
  throw Error('Expected rejection');
}
Deno.test(
  'verified actor forwarded and repeated ensure preserves existing data',
  async () => {
    const gateway = {
      ensureOwnProfile: async (actor: { userId: string }, input: unknown) => {
        equal(actor, { userId: id });
        equal(input, { displayName: 'New', phone: null });
        return profile;
      },
    };
    for (let i = 0; i < 2; i++)
      equal(
        await ensureOwnProfile(
          gateway,
          { userId: id },
          { displayName: ' New ' },
        ),
        profile,
      );
  },
);
Deno.test('invalid actor/input and provider failure', async () => {
  const gateway = { ensureOwnProfile: async () => profile };
  for (const actor of [null, {}, { userId: 'fake' }])
    await rejects(
      () => ensureOwnProfile(gateway, actor, { displayName: 'Name' }),
      'UNAUTHENTICATED',
    );
  for (const input of [
    {},
    { displayName: ' ' },
    { displayName: 'Name', actorId: id },
  ])
    await rejects(
      () => ensureOwnProfile(gateway, { userId: id }, input),
      'INVALID_INPUT',
    );
  await rejects(
    () =>
      ensureOwnProfile(
        {
          ensureOwnProfile: async () => {
            throw Error('secret');
          },
        },
        { userId: id },
        { displayName: 'Name' },
      ),
    'DEPENDENCY_UNAVAILABLE',
  );
});
Deno.test(
  'runtime validation null empty omitted fields and safe errors',
  async () => {
    equal(validId(id), true);
    equal(validId(null), false);
    equal(validId('invalid'), false);
    for (const phone of [null, '', '  '])
      equal(profileInput({ displayName: ' Name ', phone }), {
        displayName: 'Name',
        phone: null,
      });
    equal(profileInput({ displayName: 'Name', phone: ' 123 ' }), {
      displayName: 'Name',
      phone: '123',
    });
    equal(profilePatch({ displayName: ' Name ' }), { displayName: 'Name' });
    equal(profilePatch({ phone: null }), { phone: null });
    equal(profilePatch({ phone: ' 1 ' }), { phone: '1' });
    for (const input of [
      null,
      [],
      {},
      { displayName: 7 },
      { displayName: '' },
      { displayName: 'Name', phone: 7 },
    ])
      await rejects(async () => profileInput(input), 'INVALID_INPUT');
    for (const input of [
      {},
      { phone: undefined },
      { displayName: 7 },
      { phone: 7 },
      { role: 'admin' },
    ])
      await rejects(async () => profilePatch(input), 'INVALID_INPUT');
    await rejects(
      () =>
        dependency(async () => {
          throw new FoundationError('FORBIDDEN');
        }),
      'FORBIDDEN',
    );
  },
);

// Anticipated HTTP contracts: deliberately RED until the T017 handler exists.
for (const [code, status] of [
  ['UNAUTHENTICATED', 401],
  ['INVALID_INPUT', 400],
  ['DEPENDENCY_UNAVAILABLE', 503],
] as const) {
  Deno.test('HTTP contract ' + code, async () => {
    const handlerPath =
      '../../../supabase/functions/_shared/tenant-foundation/presentation/ensure-profile-handler.ts';
    const { createEnsureProfileHandler } = await import(handlerPath);
    const handler = createEnsureProfileHandler({
      verifyActor: async () => ({ userId: id }),
      ensureOwnProfile: async () => {
        throw new FoundationError(code);
      },
    });
    const response = await handler(
      new Request('http://localhost/ensure-profile', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer synthetic-test-only',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName: 'Name' }),
      }),
    );
    equal(response.status, status);
    equal((await response.json()).error.code, code);
  });
}
