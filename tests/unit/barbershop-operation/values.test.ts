import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  moneyPEN,
  utcInstant,
} from '../../../src/features/barbershop-operation/domain/values.js';
test('money stores exact safe minor units including free services, never floats as authority', () => {
  assert.deepEqual(moneyPEN(2550), { amountMinor: 2550, currency: 'PEN' });
  assert.equal(moneyPEN(0).amountMinor, 0);
  assert.ok(Object.isFrozen(moneyPEN(1)));
  for (const value of [
    -1,
    1.1,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
    '25.50',
    null,
  ])
    assert.throws(
      () => moneyPEN(value),
      (e: unknown) => (e as { code: string }).code === 'INVALID_INPUT',
    );
});
test('UTC instants reject impossible dates and noncanonical unzoned input', () => {
  assert.equal(
    utcInstant('2026-12-01T10:00:00.000Z'),
    '2026-12-01T10:00:00.000Z',
  );
  for (const value of [
    null,
    123,
    '2026-02-30T10:00:00.000Z',
    '2026-12-01 10:00',
    'not a date',
  ])
    assert.throws(() => utcInstant(value));
});
