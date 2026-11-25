/* global Deno */
// Reuse report validation contracts on Deno-loaded server modules.
import assert from 'node:assert/strict';
import * as care from '../../../supabase/functions/_shared/reservations/domain/care.ts';
const test = Deno.test;
const createCoreLoader = () => () => care;
const reservationId = '00000000-0000-4000-8000-000000000001';
const requestId = '00000000-0000-4000-8000-000000000002';
for (const file of ['supabase/functions/_shared/reservations/domain/care.ts']) {
  test(`${file}: report accepts exactly three digits, preserving leading zeros and rejecting injected authority/money`, () => {
    const { careCommand } = createCoreLoader()(file);
    const command = {
      command: 'report-yape',
      reservationId,
      requestId,
      securityCode: '007',
    };
    assert.equal(careCommand(command).securityCode, '007');
    for (const securityCode of [
      '12',
      '1234',
      'a12',
      ' 123',
      '１２３',
      123,
      null,
    ]) {
      assert.throws(() => careCommand({ ...command, securityCode }));
    }
    for (const extra of [
      { amountMinor: 1 },
      { actorId: reservationId },
      { role: 'administrator' },
      { status: 'paid' },
    ]) {
      assert.throws(() => careCommand({ ...command, ...extra }));
    }
  });
}
