// T014 server behavioral contracts, independent of SQL concurrency evidence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadCore } from '../../integration/booking/load-core.mjs';
const entry =
  'supabase/functions/_shared/reservations/application/confirm-reservation.ts';
const actor = { userId: '00000000-0000-4000-8000-000000000001' };
const input = {
  requestId: '00000000-0000-4000-8000-000000000002',
  barbershopId: '00000000-0000-4000-8000-000000000003',
  serviceIds: ['00000000-0000-4000-8000-000000000004'],
  barberId: null,
  startsAt: '2026-12-01T15:00:00.000Z',
};
function useCase(gateway) {
  const module = fs.existsSync(entry) ? loadCore(entry) : {};
  assert.equal(
    typeof module.createConfirmReservation,
    'function',
    'T017 server application is not implemented',
  );
  return module.createConfirmReservation(gateway);
}
test('missing verified actor cannot invoke privileged gateway', async () => {
  let calls = 0;
  const app = useCase({
    confirm: async () => {
      calls++;
    },
  });
  await assert.rejects(app(null, input));
  assert.equal(calls, 0);
});
test('verified actor cannot be replaced by actor or price in body', async () => {
  let calls = 0;
  const app = useCase({
    confirm: async () => {
      calls++;
    },
  });
  for (const key of ['actorId', 'clientId', 'price', 'snapshots'])
    await assert.rejects(
      app(actor, { ...input, [key]: 'forged' }),
      (e) => e.code === 'INVALID_INPUT',
    );
  assert.equal(calls, 0);
});
test('SQL historical detail and replay status are returned unchanged', async () => {
  const result = {
    detail: {
      id: 'fixture',
      total: { amountMinor: 3500, currency: 'PEN' },
      durationMin: 30,
    },
    replayed: true,
  };
  let seen;
  const app = useCase({
    confirm: async (a, d) => {
      seen = { a, d };
      return result;
    },
  });
  assert.equal(await app(actor, input), result);
  assert.equal(seen.a.userId, actor.userId);
  assert.equal(seen.d.requestId, input.requestId);
});
test('unexpected persistence failure is translated without private tenant data', async () => {
  const app = useCase({
    confirm: async () => {
      throw Error('private tenant fixture detail');
    },
  });
  await assert.rejects(
    app(actor, input),
    (e) =>
      e.code === 'DEPENDENCY_UNAVAILABLE' &&
      !e.message.includes('private tenant'),
  );
});
