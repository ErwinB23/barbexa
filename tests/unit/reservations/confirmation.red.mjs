// T014 executable behavior contracts. Remain RED until the T017 application exists.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadCore } from '../../integration/booking/load-core.mjs';
const entry = 'src/features/reservations/application/request-reservation.ts';
const input = {
  requestId: '00000000-0000-4000-8000-000000000001',
  barbershopId: '00000000-0000-4000-8000-000000000002',
  serviceIds: ['00000000-0000-4000-8000-000000000003'],
  barberId: null,
  startsAt: '2026-12-01T15:00:00.000Z',
};
function useCase(gateway) {
  const module = fs.existsSync(entry) ? loadCore(entry) : {};
  assert.equal(
    typeof module.createRequestReservation,
    'function',
    'T017 application is not implemented',
  );
  return module.createRequestReservation(gateway);
}
test('closed input rejects forged actor price duration and snapshots before transport', async () => {
  let called = 0;
  const app = useCase({
    confirm: async () => {
      called++;
    },
  });
  for (const key of [
    'clientId',
    'actorId',
    'role',
    'price',
    'total',
    'duration',
    'snapshots',
  ])
    await assert.rejects(
      app({ ...input, [key]: 'forged' }),
      (e) => e.code === 'INVALID_INPUT',
    );
  assert.equal(called, 0);
});
test('idempotent retries preserve caller request identity rather than generating a new key', async () => {
  const seen = [];
  const answer = { detail: { id: 'fixture' }, replayed: true };
  const app = useCase({
    confirm: async (value) => {
      seen.push(value);
      return answer;
    },
  });
  await app(input);
  await app({ ...input });
  assert.equal(seen[0].requestId, input.requestId);
  assert.equal(seen[1].requestId, input.requestId);
});
test('multiple service ids and any professional are forwarded without client snapshots', async () => {
  let seen;
  const app = useCase({
    confirm: async (value) => {
      seen = value;
      return { detail: { id: 'fixture' }, replayed: false };
    },
  });
  await app({
    ...input,
    serviceIds: [...input.serviceIds, '00000000-0000-4000-8000-000000000004'],
  });
  assert.equal(seen.serviceIds.length, 2);
  assert.equal(seen.barberId, null);
  assert.deepEqual(Object.keys(seen).sort(), Object.keys(input).sort());
});
test('duplicate service or invalid instant never reaches transport', async () => {
  let called = 0;
  const app = useCase({
    confirm: async () => {
      called++;
    },
  });
  for (const value of [
    { ...input, serviceIds: [] },
    { ...input, serviceIds: [input.serviceIds[0], input.serviceIds[0]] },
    { ...input, startsAt: '2026-02-30T15:00:00.000Z' },
  ])
    await assert.rejects(app(value), (e) => e.code === 'INVALID_INPUT');
  assert.equal(called, 0);
});
