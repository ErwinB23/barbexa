import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from './load-core.mjs';
import { id, detail } from './booking-payload-fixture.mjs';
const next = '2026-12-02T15:00:00.000Z';
test('reschedule policy and history use authenticated closed commands and server projections', async () => {
  const { createReservationHttpAdapter } = loadCore(
    'src/features/reservations/infrastructure/reservation-http-adapter.ts',
  );
  const sent = [];
  const adapter = createReservationHttpAdapter({
    baseUrl: 'http://127.0.0.1:54421',
    publicKey: 'sb_publishable_fixture',
    getAccessToken: async () => 'synthetic',
    expectedUser: () => id(4),
    fetcher: async (url, init) => {
      if (url.endsWith('/auth/v1/user'))
        return Response.json({
          id: id(4),
          is_anonymous: false,
          email_confirmed_at: 'verified',
        });
      const value = JSON.parse(init.body);
      sent.push(value);
      return Response.json(
        value.action === 'reschedule-history'
          ? []
          : { barbershopId: id(1), advanceMin: value.advanceMin ?? 120 },
      );
    },
  });
  assert.equal((await adapter.getReschedulePolicy(id(1))).advanceMin, 120);
  assert.equal(
    (await adapter.setReschedulePolicy({ barbershopId: id(1), advanceMin: 60 }))
      .advanceMin,
    60,
  );
  await adapter.listRescheduleHistory(detail.id);
  assert.deepEqual(sent, [
    { action: 'reschedule-policy', barbershopId: id(1) },
    { action: 'reschedule-policy', barbershopId: id(1), advanceMin: 60 },
    { action: 'reschedule-history', reservationId: detail.id },
  ]);
  await assert.rejects(
    adapter.setReschedulePolicy({ barbershopId: id(1), advanceMin: -1 }),
    (e) => e.code === 'INVALID_INPUT',
  );
});
test('rescheduling HTTP verifies current identity and closes the command and slots payload', async () => {
  const { createReservationHttpAdapter } = loadCore(
    'src/features/reservations/infrastructure/reservation-http-adapter.ts',
  );
  const sent = [];
  let wrong = false,
    forbidden = false;
  const adapter = createReservationHttpAdapter({
    baseUrl: 'http://127.0.0.1:54421',
    publicKey: 'sb_publishable_fixture',
    getAccessToken: async () => 'synthetic',
    expectedUser: () => id(4),
    fetcher: async (url, init) => {
      sent.push(JSON.parse(init.body ?? 'null'));
      return Response.json(
        url.endsWith('/auth/v1/user')
          ? { id: id(4), is_anonymous: false, email_confirmed_at: 'verified' }
          : forbidden
            ? { error: { code: 'FORBIDDEN' } }
            : JSON.parse(init.body).action === 'reschedule-slots'
              ? []
              : {
                  ...detail,
                  id: wrong ? id(99) : detail.id,
                  startsAt: next,
                  endsAt: '2026-12-02T15:30:00.000Z',
                },
        { status: forbidden && !url.endsWith('/auth/v1/user') ? 403 : 200 },
      );
    },
  });
  const input = {
    requestId: id(8),
    reservationId: detail.id,
    expectedStartsAt: detail.startsAt,
    startsAt: next,
  };
  await adapter.reschedule(input);
  assert.deepEqual(sent[1], { action: 'reschedule', ...input });
  await adapter.listRescheduleSlots({
    reservationId: detail.id,
    localDate: '2026-12-02',
  });
  assert.deepEqual(sent[3], {
    action: 'reschedule-slots',
    reservationId: detail.id,
    localDate: '2026-12-02',
  });
  wrong = true;
  await assert.rejects(
    adapter.reschedule(input),
    (e) => e.code === 'DEPENDENCY_UNAVAILABLE',
  );
  wrong = false;
  forbidden = true;
  await assert.rejects(
    adapter.reschedule(input),
    (e) => e.code === 'FORBIDDEN',
  );
});
