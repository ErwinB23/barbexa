import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequestReservation } from '../../../src/features/reservations/application/request-reservation.js';
import {
  reservationInput,
  reservationActor,
  reservationId,
  slotQuery,
} from '../../../src/features/reservations/domain/reservation-input.js';
import { BusinessError } from '../../../src/features/reservations/domain/values.js';
import { id, input, detail } from './booking-fixture.js';
const code = (expected: string) => (e: unknown) =>
  (e as BusinessError).code === expected;
test('closed reservation values normalize UUIDs preserve requests and reject all untrusted fields', () => {
  assert.deepEqual(reservationInput(input), input);
  assert.ok(Object.isFrozen(reservationInput(input).serviceIds));
  assert.equal(
    reservationId('AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA'),
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  );
  for (const value of [
    null,
    [],
    {},
    { ...input, actorId: id(4) },
    { ...input, price: 1 },
    { ...input, barberId: 'wrong' },
    { ...input, serviceIds: [] },
    { ...input, serviceIds: [id(2), id(2)] },
    { ...input, serviceIds: Array(101).fill(id(2)) },
    { ...input, startsAt: '2026-02-30T15:00:00.000Z' },
  ])
    assert.throws(() => reservationInput(value), code('INVALID_INPUT'));
  assert.equal(reservationInput({ ...input, barberId: id(3) }).barberId, id(3));
  assert.throws(() => reservationId(null), code('INVALID_INPUT'));
});
test('slot dates and verified actor shapes are independently validated', () => {
  const query = {
    barbershopId: id(1),
    localDate: '2026-11-18',
    serviceIds: [id(2)],
    barberId: null,
  };
  assert.equal(slotQuery(query).localDate, query.localDate);
  assert.equal(slotQuery({ ...query, barberId: id(3) }).barberId, id(3));
  for (const localDate of [null, 'wrong', '2026-02-30', '2026-00-00'])
    assert.throws(
      () => slotQuery({ ...query, localDate }),
      code('INVALID_INPUT'),
    );
  assert.deepEqual(reservationActor({ userId: id(4) }), { userId: id(4) });
  for (const actor of [null, {}, { userId: 'wrong' }])
    assert.throws(() => reservationActor(actor), code('UNAUTHENTICATED'));
});
test('request use case forwards only validated values and preserves dependency error safety', async () => {
  const seen: unknown[] = [];
  const result = { detail, replayed: true };
  const request = createRequestReservation({
    confirm: async (value) => {
      seen.push(value);
      return result;
    },
  });
  assert.equal(await request(input), result);
  assert.equal(await request(input), result);
  assert.equal(seen.length, 2);
  const reject = createRequestReservation({
    confirm: async () => {
      throw new BusinessError('CONFLICT', 'professional-unavailable');
    },
  });
  await assert.rejects(reject(input), code('CONFLICT'));
  const broken = createRequestReservation({
    confirm: async () => {
      throw Error('private SQL fixture');
    },
  });
  await assert.rejects(
    broken(input),
    (e) =>
      code('DEPENDENCY_UNAVAILABLE')(e) &&
      !(e as Error).message.includes('private SQL'),
  );
});
