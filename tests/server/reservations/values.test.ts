import { reservationPeriod } from '../../../supabase/functions/_shared/reservations/domain/types.ts';
import { utcInstant } from '../../../supabase/functions/_shared/reservations/domain/values.ts';
const assert = {
  equal: (a: unknown, b: unknown) => {
    if (a !== b) throw Error('Assertion');
  },
  deepEqual: (a: unknown, b: unknown) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) throw Error('Assertion');
  },
  ok: (a: unknown) => {
    if (!a) throw Error('Assertion');
  },
  throws: (fn: () => unknown, check?: (e: unknown) => boolean) => {
    try {
      fn();
    } catch (e) {
      if (!check || check(e)) return;
      throw e;
    }
    throw Error('Expected rejection');
  },
};
const test = Deno.test;
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
