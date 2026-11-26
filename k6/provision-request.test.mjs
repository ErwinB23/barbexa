import test from 'node:test';
import assert from 'node:assert/strict';
import {
  provisionRequest,
  nextPreparationLevel,
} from './lib/provision-request.mjs';
const aborted = () =>
  new TypeError('fetch failed', {
    cause: new AggregateError([
      Object.assign(new Error('aborted'), { code: 'ECONNABORTED' }),
    ]),
  });
test('provisioning retries ECONNABORTED at most three times with identical setter data and closed connections', async () => {
  const seen = [],
    waits = [],
    events = [];
  const body = {
    action: 'configure-shop',
    barbershopId: 'synthetic',
    policies: { maxFuturePerClient: 600 },
  };
  const r = await provisionRequest(
    async (_p, o) => {
      seen.push(structuredClone(o));
      o.body.policies.maxFuturePerClient = 1;
      if (seen.length < 3) throw aborted();
      return { status: 200 };
    },
    '/functions/v1/barbershop-operation',
    { body },
    { sleep: async (ms) => waits.push(ms), emit: (e) => events.push(e) },
  );
  assert.equal(r.status, 200);
  assert.equal(seen.length, 3);
  assert.deepEqual(waits, [500, 1000]);
  for (const s of seen) {
    assert.deepEqual(s.body, body);
    assert.equal(s.connectionClose, true);
  }
  assert.equal(events.filter((e) => e.phase === 'retry').length, 2);
});
test('transport exhaustion is explicit and preserves the original cause', async () => {
  let n = 0;
  await assert.rejects(
    provisionRequest(
      async () => {
        n++;
        throw aborted();
      },
      '/functions/v1/barbershop-operation',
      { body: { action: 'set-shop-hours' } },
      { sleep: async () => {} },
    ),
    (e) =>
      e.message.includes('set-shop-hours') &&
      e.cause?.cause instanceof AggregateError,
  );
  assert.equal(n, 3);
});
test('non-idempotent operations, arbitrary TypeErrors and HTTP business errors are never blindly retried', async () => {
  for (const [p, body] of [
    ['/functions/v1/create-barbershop', { name: 'X' }],
    [
      '/auth/v1/token?grant_type=password',
      { email: 'PRIVATE', password: 'SECRET' },
    ],
    ['/functions/v1/barbershop-operation', { action: 'upsert-service' }],
  ]) {
    let n = 0;
    const events = [];
    await assert.rejects(
      provisionRequest(
        async () => {
          n++;
          throw aborted();
        },
        p,
        { body },
        { sleep: async () => {}, emit: (e) => events.push(e) },
      ),
    );
    assert.equal(n, 1);
    assert.ok(!JSON.stringify(events).includes('SECRET'));
    assert.ok(!JSON.stringify(events).includes('PRIVATE'));
  }
  let n = 0;
  const r = await provisionRequest(
    async () => {
      n++;
      return { status: 500 };
    },
    '/functions/v1/barbershop-operation',
    { body: { action: 'configure-shop' } },
  );
  assert.equal(n, 1);
  assert.equal(r.status, 500);
  await assert.rejects(
    provisionRequest(
      async () => {
        throw new TypeError('coding error');
      },
      '/functions/v1/barbershop-operation',
      { body: { action: 'configure-shop' } },
    ),
  );
});
test('seed retries keep the same idempotency UUID; no new reservation request is generated', async () => {
  const id = '00000000-0000-4000-8000-000000000001',
    ids = [];
  await provisionRequest(
    async (_p, o) => {
      ids.push(o.body.requestId);
      if (ids.length === 1) throw aborted();
      return { status: 200 };
    },
    '/functions/v1/reservation-command',
    { body: { action: 'confirm', requestId: id } },
    { sleep: async () => {} },
  );
  assert.deepEqual(ids, [id, id]);
});
test('preparation selects 50 after approved 25 and never repeats accredited levels', () => {
  const m = { levels: { 25: { passed: true, recovered: true } } };
  assert.equal(nextPreparationLevel(m), 50);
  m.levels[50] = { passed: true, recovered: true };
  assert.equal(nextPreparationLevel(m), 100);
  m.levels[100] = { passed: true, recovered: true };
  assert.equal(nextPreparationLevel(m), null);
  assert.throws(() =>
    nextPreparationLevel({
      levels: {
        25: { passed: true, recovered: true },
        50: { passed: false, recovered: true },
      },
    }),
  );
});
