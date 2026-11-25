import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCancelReservation } from '../../../src/features/reservations/application/cancel-reservation.js';
import { BusinessError } from '../../../src/features/reservations/domain/values.js';
import type { BookingDetail } from '../../../src/features/reservations/domain/types.js';
import {
  cancellationInput,
  clientCancellationAllowed,
} from '../../../src/features/reservations/domain/cancellation.js';
const id = '11111111-1111-4111-8111-111111111111';
test('cancel application forwards the closed input and translates only unknown dependency errors', async () => {
  const detail = { state: 'cancelled' } as BookingDetail;
  const app = createCancelReservation({
    cancel: async (input) => {
      assert.equal(input.reservationId, id);
      return detail;
    },
  });
  assert.equal(await app({ requestId: id, reservationId: id }), detail);
  for (const error of [
    new BusinessError('FORBIDDEN'),
    Error('provider detail'),
  ]) {
    const failing = createCancelReservation({
      cancel: async () => {
        throw error;
      },
    });
    await assert.rejects(
      failing({ requestId: id, reservationId: id }),
      (e) =>
        (e as BusinessError).code ===
        (error instanceof BusinessError
          ? 'FORBIDDEN'
          : 'DEPENDENCY_UNAVAILABLE'),
    );
  }
});
test('cancellation uses inclusive historical configured deadline, including default 120 minutes', () => {
  const start = '2026-12-01T15:00:00.000Z';
  assert.equal(
    clientCancellationAllowed(
      start,
      120,
      Date.parse('2026-12-01T13:00:00.000Z'),
    ),
    true,
  );
  assert.equal(
    clientCancellationAllowed(
      start,
      120,
      Date.parse('2026-12-01T13:00:00.001Z'),
    ),
    false,
  );
  assert.equal(
    clientCancellationAllowed(
      start,
      30,
      Date.parse('2026-12-01T14:30:00.000Z'),
    ),
    true,
  );
  assert.equal(clientCancellationAllowed(start, 0, Date.parse(start)), true);
  assert.equal(
    clientCancellationAllowed(
      start,
      120,
      Date.parse('2026-12-01T14:00:00.000Z'),
    ),
    false,
  );
});
test('closed cancellation input never accepts actor, role, tenant or policy overrides', () => {
  const input = { requestId: id, reservationId: id };
  assert.equal(cancellationInput(input).reservationId, id);
  assert.equal(
    cancellationInput({ ...input, reason: '  Local test  ' }).reason,
    'Local test',
  );
  for (const key of ['userId', 'role', 'barbershopId', 'policy'])
    assert.throws(() => cancellationInput({ ...input, [key]: 'forged' }));
  assert.throws(() =>
    cancellationInput({ ...input, reservationId: 'invalid' }),
  );
  assert.throws(() => clientCancellationAllowed('invalid', 120, 0));
  assert.throws(() =>
    clientCancellationAllowed('2026-12-01T15:00:00.000Z', -1, 0),
  );
});
