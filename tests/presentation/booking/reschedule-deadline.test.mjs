import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCore } from '../../integration/booking/load-core.mjs';
test('expired client rescheduling explains the deadline without treating staff or future bookings as expired', () => {
  const { rescheduleDeadlineMessage } = loadCore(
    'src/features/reservations/presentation/booking-format.ts',
  );
  const start = '2026-11-24T23:00:00Z';
  assert.equal(
    rescheduleDeadlineMessage(start, false, Date.parse('2026-11-25T00:00:00Z')),
    'El plazo para reprogramar esta cita terminó. Contacta con la barbería.',
  );
  assert.equal(
    rescheduleDeadlineMessage(start, true, Date.parse('2026-11-25T00:00:00Z')),
    null,
  );
  assert.equal(
    rescheduleDeadlineMessage(start, false, Date.parse('2026-11-24T21:00:00Z')),
    null,
  );
});
