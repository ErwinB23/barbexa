import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadCore } from '../../integration/booking/load-core.mjs';
const file =
  'supabase/functions/_shared/reservations/application/cancel-reservation.ts';
const id = '11111111-1111-4111-8111-111111111111';
function useCase(gateway) {
  const mod = fs.existsSync(file) ? loadCore(file) : {};
  assert.equal(typeof mod.createCancelReservation, 'function');
  return mod.createCancelReservation(gateway);
}
test('cancel requires verified actor and rejects actor/role body overrides', async () => {
  let calls = 0;
  const cancel = useCase({
    cancel: async () => {
      calls++;
      return {};
    },
  });
  await assert.rejects(cancel(null, { requestId: id, reservationId: id }));
  await assert.rejects(
    cancel({ userId: id }, { requestId: id, reservationId: id, userId: id }),
  );
  assert.equal(calls, 0);
});
test('cancel forwards only closed validated input and preserves safe failures', async () => {
  const result = { state: 'cancelled' };
  const cancel = useCase({
    cancel: async (actor, input) => {
      assert.equal(actor.userId, id);
      assert.equal(input.reservationId, id);
      return result;
    },
  });
  assert.equal(
    await cancel({ userId: id }, { requestId: id, reservationId: id }),
    result,
  );
  const failing = useCase({
    cancel: async () => {
      throw Error('private provider data');
    },
  });
  await assert.rejects(
    failing({ userId: id }, { requestId: id, reservationId: id }),
    (e) => e.code === 'DEPENDENCY_UNAVAILABLE',
  );
});
