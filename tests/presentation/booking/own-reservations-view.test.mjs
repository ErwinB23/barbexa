import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../../integration/booking/load-core.mjs';
test('own reservation projection separates attendance from booking status and selects the latest eligible future appointment', () => {
  const { ownReservationsView } = loadCore(
    'src/features/reservations/presentation/own-reservations-view.ts',
  );
  const rows = Object.freeze([
    { id: 'cancel', state: 'cancelled', startsAt: '2026-11-23T10:00:00Z' },
    { id: 'done', state: 'confirmed', startsAt: '2026-11-23T11:00:00Z' },
    { id: 'next', state: 'confirmed', startsAt: '2026-11-23T12:00:00Z' },
  ]);
  const p = ownReservationsView(
    rows,
    {
      done: { attendance: 'completed' },
      next: { attendance: 'confirmed' },
      cancel: { attendance: 'cancelled' },
    },
    Date.parse('2026-11-23T09:00:00Z'),
  );
  assert.equal(p.next.id, 'next');
  assert.equal(p.attended, 1);
  assert.equal(p.upcoming, 1);
  assert.equal(p.cancelled, 1);
  assert.equal(rows[0].id, 'cancel');
  assert.equal(ownReservationsView([], {}, 0).next, null);
});

test('customer history and upcoming use descending appointment instants across states and dates', () => {
  const { ownReservationsView } = loadCore(
    'src/features/reservations/presentation/own-reservations-view.ts',
  );
  const rows = Object.freeze([
    { id: 'early', state: 'confirmed', startsAt: '2026-11-24T15:00:00Z' },
    { id: 'late', state: 'confirmed', startsAt: '2026-11-24T18:00:00-05:00' },
    {
      id: 'newest-cancelled',
      state: 'cancelled',
      startsAt: '2026-11-25T15:00:00Z',
    },
    { id: 'old', state: 'confirmed', startsAt: '2026-11-23T15:00:00Z' },
  ]);
  const p = ownReservationsView(rows, {}, Date.parse('2026-11-24T00:00:00Z'));
  assert.equal(
    Array.from(p.sorted, (row) => row.id).join(','),
    'newest-cancelled,late,early,old',
  );
  assert.equal(p.next.id, 'late');
  assert.equal(p.upcoming, 2);
  assert.equal(rows[0].id, 'early');
});
