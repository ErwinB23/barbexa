import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCore, createCoreLoader } from './load-core.mjs';
const domain = () => loadCore('src/features/reservations/domain/reschedule.ts');
const application = () =>
  loadCore('src/features/reservations/application/reschedule.ts');
const id = '11111111-1111-4111-8111-111111111111';
const current = '2026-12-01T15:00:00.000Z';
const next = '2026-12-02T15:00:00.000Z';
const input = {
  requestId: id,
  reservationId: id,
  expectedStartsAt: current,
  startsAt: next,
};
test('rescheduling normalizes optional audit reason and rejects unsafe types/oversize', () => {
  const { rescheduleInput } = domain();
  assert.equal(
    rescheduleInput({ ...input, reason: '  Cambio autorizado  ' }).reason,
    'Cambio autorizado',
  );
  assert.equal(rescheduleInput({ ...input, reason: '  ' }).reason, undefined);
  for (const reason of [null, 42, 'x'.repeat(2001)])
    assert.throws(() => rescheduleInput({ ...input, reason }));
});
test('reschedule closes identity, financial, tenant and professional overrides', () => {
  const { rescheduleInput } = domain();
  assert.equal(rescheduleInput(input).startsAt, next);
  for (const v of [
    null,
    [],
    {},
    { ...input, startsAt: current },
    { ...input, startsAt: '2026-02-30T15:00:00.000Z' },
    ...[
      'userId',
      'barberId',
      'price',
      'role',
      'paymentMethod',
      'barbershopId',
      'advanceMin',
    ].map((k) => ({ ...input, [k]: id })),
  ])
    assert.throws(
      () => rescheduleInput(v),
      (e) => e.code === 'INVALID_INPUT',
    );
});
test('reschedule slot query identifies original booking and accepts only a calendar date', () => {
  const { rescheduleQuery } = domain();
  assert.equal(
    rescheduleQuery({ reservationId: id, localDate: '2026-12-01' }).localDate,
    '2026-12-01',
  );
  for (const v of [
    { reservationId: id, localDate: '2026-02-30' },
    { reservationId: id, localDate: '2026-12-01', barberId: id },
  ])
    assert.throws(() => rescheduleQuery(v));
});
test('client deadline is inclusive and calculated from current booking, never new time', () => {
  const { clientRescheduleAllowed } = domain();
  assert.equal(
    clientRescheduleAllowed(
      current,
      120,
      Date.parse('2026-12-01T13:00:00.000Z'),
    ),
    true,
  );
  assert.equal(
    clientRescheduleAllowed(
      current,
      120,
      Date.parse('2026-12-01T13:00:00.001Z'),
    ),
    false,
  );
  assert.equal(clientRescheduleAllowed(current, 0, Date.parse(current)), true);
  assert.throws(() => clientRescheduleAllowed(current, -1, Date.now()));
});
function setup() {
  let scope = 'user:1:shop';
  const sent = [];
  let calls = 0,
    finish;
  const app = application().createRescheduleActions(
    {
      reschedule: async (value) => {
        calls++;
        sent.push(value);
        return await new Promise((resolve) => {
          finish = resolve;
        });
      },
      listRescheduleSlots: async () => [],
    },
    () => scope,
    () => id,
  );
  return {
    app,
    sent,
    calls: () => calls,
    finish: () => finish({ detail: { id, startsAt: next }, replayed: false }),
    setScope: (v) => {
      scope = v;
    },
  };
}
test('double submission shares one request; uncertain retry retains exact id and target', async () => {
  const { app, calls, finish } = setup();
  const a = app.submit({
    reservationId: id,
    expectedStartsAt: current,
    startsAt: next,
  });
  const b = app.submit({
    reservationId: id,
    expectedStartsAt: current,
    startsAt: next,
  });
  await Promise.resolve();
  assert.equal(calls(), 1);
  finish();
  await Promise.all([a, b]);
});
test('network uncertainty keeps idempotency key and blocks changing target', async () => {
  const sent = [];
  let fail = true;
  const app = application().createRescheduleActions(
    {
      reschedule: async (value) => {
        sent.push(value);
        if (fail) throw Error('provider secret');
        return { detail: { id, startsAt: next }, replayed: true };
      },
      listRescheduleSlots: async () => [],
    },
    () => 'u:1',
    () => id,
  );
  const draft = {
    reservationId: id,
    expectedStartsAt: current,
    startsAt: next,
  };
  await assert.rejects(
    app.submit(draft),
    (e) => e.code === 'DEPENDENCY_UNAVAILABLE',
  );
  await assert.rejects(
    app.submit({ ...draft, startsAt: '2026-12-03T15:00:00.000Z' }),
    (e) => e.code === 'CONFLICT',
  );
  fail = false;
  await app.submit(draft);
  assert.equal(sent.length, 2);
  assert.deepEqual(sent[0], sent[1]);
});
test('logout or context switch discards late command and slot results', async () => {
  const { app, setScope, finish } = setup();
  const a = app.submit({
    reservationId: id,
    expectedStartsAt: current,
    startsAt: next,
  });
  await Promise.resolve();
  setScope(null);
  finish();
  await assert.rejects(a, (e) => e.code === 'UNAUTHENTICATED');
  await assert.rejects(
    app.slots({ reservationId: id, localDate: '2026-12-02' }),
    (e) => e.code === 'UNAUTHENTICATED',
  );
});
test('known authorization and availability denials stay safe and allow a corrected request', async () => {
  const load = createCoreLoader();
  const { BusinessError } = load('src/features/reservations/domain/values.ts');
  let count = 0;
  const app = load(
    'src/features/reservations/application/reschedule.ts',
  ).createRescheduleActions(
    {
      reschedule: async () => {
        if (!count++)
          throw new BusinessError('CONFLICT', 'professional-unavailable');
        return { detail: { id, startsAt: next }, replayed: false };
      },
      listRescheduleSlots: async () => [],
    },
    () => 'u:1',
    () => id,
  );
  const draft = {
    reservationId: id,
    expectedStartsAt: current,
    startsAt: next,
  };
  await assert.rejects(
    app.submit(draft),
    (e) => e.code === 'CONFLICT' && e.reason === 'professional-unavailable',
  );
  await app.submit(draft);
  assert.equal(count, 2);
});
