import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  profileDraft,
  profileCommand,
  professionalProfile,
} from '../../../src/features/barbershop-operation/domain/professional-profile.js';
import { createProfessionalProfile } from '../../../src/features/barbershop-operation/application/professional-profile.js';
import type { OperationScope } from '../../../src/features/barbershop-operation/application/operation-scope.js';
const user = '11111111-1111-4111-8111-111111111111',
  shop = '22222222-2222-4222-8222-222222222222';
const draft = {
  professionalName: ' Real ',
  description: ' Experience ',
  instagram: null,
  tiktok: null,
  facebook: null,
};
const row = {
  ...draft,
  id: user,
  userId: user,
  barbershopId: shop,
  active: true,
  barbershopName: 'Local',
  memberSince: null,
};
test('professional profile accepts exact Unicode length, normalizes links and rejects injected fields', () => {
  assert.equal(
    profileDraft({
      ...draft,
      description: '😀'.repeat(250),
      instagram: ' ',
      tiktok: 'https://vm.tiktok.com/ok',
      facebook: '@real',
    }).description.length,
    500,
  );
  for (const patch of [
    { professionalName: '' },
    { description: '😀'.repeat(251) },
    { instagram: 7 },
    { instagram: 'https://instagram.com.evil.invalid/x' },
    { facebook: 'x'.repeat(251) },
    { role: 'owner' },
  ])
    assert.throws(() => profileDraft({ ...draft, ...patch }));
  assert.equal(
    professionalProfile({ ...row, memberSince: '2026-11-20T12:00:00.000Z' })
      .memberSince,
    '2026-11-20T12:00:00.000Z',
  );
  for (const patch of [
    { active: false },
    { barbershopName: '' },
    { memberSince: 'invalid' },
  ])
    assert.throws(() => professionalProfile({ ...row, ...patch }));
  assert.throws(() => profileCommand({ action: 'bad', barbershopId: shop }));
  assert.equal(
    profileCommand({
      action: 'get-own-professional-profile',
      barbershopId: shop,
    }).barbershopId,
    shop,
  );
});
test('profile saves are deduplicated, stale results denied and failure releases write guard', async () => {
  let scope: OperationScope | null = {
    userId: user,
    generation: 1,
    barbershopId: shop,
    role: 'barber',
  };
  let release!: (value: unknown) => void;
  const app = createProfessionalProfile({
    scope: () => scope,
    gateway: {
      executeProfessionalProfile: () =>
        new Promise((r) => {
          release = r;
        }),
    },
  });
  const first = app.save(draft);
  await assert.rejects(app.save(draft), { code: 'CONFLICT' });
  scope = { ...scope!, generation: 2 };
  release(row);
  await assert.rejects(first, { code: 'FORBIDDEN' });
  const second = app.save(draft);
  release(row);
  assert.equal((await second).userId, user);
  const read = app.read();
  release({ ...row, userId: shop });
  await assert.rejects(read, { code: 'FORBIDDEN' });
  scope = null;
  await assert.rejects(app.read(), { code: 'UNAUTHENTICATED' });
  scope = { userId: user, generation: 3, barbershopId: shop, role: undefined };
  await assert.rejects(app.save(draft), { code: 'FORBIDDEN' });
});
