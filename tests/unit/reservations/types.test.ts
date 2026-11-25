import assert from 'node:assert/strict';
import { test } from 'node:test';
import { reservationPeriod } from '../../../src/features/reservations/domain/types.js';
import { utcInstant } from '../../../src/features/reservations/domain/values.js';
test('reservation period is immutable and positive, without converting local timezone heuristically', () => {
  const start = utcInstant('2026-12-01T10:00:00.000Z'),
    end = utcInstant('2026-12-01T10:30:00.000Z');
  assert.deepEqual(reservationPeriod(start, end), {
    startsAt: start,
    endsAt: end,
  });
  assert.ok(Object.isFrozen(reservationPeriod(start, end)));
  assert.throws(() => reservationPeriod(start, start));
  assert.throws(() => reservationPeriod(end, start));
});
