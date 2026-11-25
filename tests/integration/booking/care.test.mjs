import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCoreLoader } from './load-core.mjs';
const id = '00000000-0000-4000-8000-000000000001';
test('care command rejects authority/money injection and requires explicit external refund attestation', () => {
  const { careCommand } = createCoreLoader()(
    'src/features/reservations/domain/care.ts',
  );
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(
        careCommand({ command: 'start', reservationId: id, requestId: id }),
      ),
    ),
    { command: 'start', reservationId: id, requestId: id },
  );
  for (const extra of [
    { userId: id },
    { role: 'administrator' },
    { amountMinor: 1 },
  ])
    assert.throws(() =>
      careCommand({
        command: 'start',
        reservationId: id,
        requestId: id,
        ...extra,
      }),
    );
  assert.throws(() =>
    careCommand({
      command: 'refund',
      reservationId: id,
      requestId: id,
      reason: 'external',
      attested: false,
    }),
  );
  assert.throws(() =>
    careCommand({
      command: 'refund',
      reservationId: id,
      requestId: id,
      reason: ' ',
      attested: true,
    }),
  );
  assert.equal(
    careCommand({
      command: 'refund',
      reservationId: id,
      requestId: id,
      reason: ' external ',
      attested: true,
    }).reason,
    'external',
  );
});
test('care transitions use inclusive server time and never treat payment as attendance', () => {
  const { nextAttendance } = createCoreLoader()(
    'src/features/reservations/domain/care.ts',
  );
  assert.throws(() => nextAttendance('confirmed', 'start', 999, 1000, 10));
  assert.equal(
    nextAttendance('confirmed', 'start', 1000, 1000, 10),
    'in-service',
  );
  assert.throws(() => nextAttendance('confirmed', 'no-show', 600999, 1000, 10));
  assert.equal(
    nextAttendance('confirmed', 'no-show', 601000, 1000, 10),
    'no-show',
  );
  assert.equal(
    nextAttendance('in-service', 'complete', 1001, 1000, 10),
    'completed',
  );
  for (const state of ['confirmed', 'cancelled', 'completed', 'no-show'])
    assert.throws(() => nextAttendance(state, 'complete', 1001, 1000, 10));
});
test('care payload validates scope, null legacy absence and financial projection', () => {
  const { careView } = createCoreLoader()(
    'src/features/reservations/domain/care.ts',
  );
  const view = {
    reservationId: id,
    attendance: null,
    payment: null,
    noShowToleranceMin: null,
    yapeInstructions: null,
    events: [],
    permissions: { attend: false, receive: false, refund: false },
  };
  assert.equal(careView(view, id).payment, null);
  assert.throws(() =>
    careView(
      { ...view, reservationId: '00000000-0000-4000-8000-000000000002' },
      id,
    ),
  );
  assert.throws(() =>
    careView(
      {
        ...view,
        payment: {
          method: 'cash',
          status: 'paid',
          amountMinor: -1,
          currency: 'PEN',
        },
      },
      id,
    ),
  );
});
test('care application discards late result after identity switch', async () => {
  const load = createCoreLoader(),
    { createCareActions } = load(
      'src/features/reservations/application/care.ts',
    );
  let user = id,
    finish;
  const action = createCareActions(
    {
      execute: () =>
        new Promise((r) => {
          finish = r;
        }),
    },
    () => user,
  );
  const work = action({ command: 'read', reservationId: id });
  user = null;
  finish({});
  await assert.rejects(work, (e) => e.code === 'UNAUTHENTICATED');
});
test('care client uses existing Auth verified transport and excludes input identity', async () => {
  const { createReservationHttpAdapter } = createCoreLoader()(
    'src/features/reservations/infrastructure/reservation-http-adapter.ts',
  );
  const sent = [];
  const app = createReservationHttpAdapter({
    baseUrl: 'http://127.0.0.1:54421',
    publicKey: 'sb_publishable_fixture',
    expectedUser: () => id,
    getAccessToken: async () => 'fake',
    fetcher: async (url, init) => {
      sent.push(JSON.parse(init.body || '{}'));
      return Response.json(
        url.endsWith('/user')
          ? { id, is_anonymous: false, email_confirmed_at: 'yes' }
          : { reservationId: id },
      );
    },
  });
  await app.care({ command: 'read', reservationId: id });
  assert.deepEqual(sent[1], {
    action: 'care',
    command: 'read',
    reservationId: id,
  });
});

test('care deduplication is isolated by authenticated generation/context, not just request body', async () => {
  const { createCareActions } = createCoreLoader()(
    'src/features/reservations/application/care.ts',
  );
  let scope = 'account-A:1:shop-A';
  const replies = [];
  const execute = createCareActions(
    { execute: () => new Promise((resolve) => replies.push(resolve)) },
    () => scope,
  );
  const input = { command: 'read', reservationId: id };
  const old = execute(input);
  const rejected = assert.rejects(old, (e) => e.code === 'UNAUTHENTICATED');
  scope = 'account-B:2:shop-B';
  const next = execute(input);
  assert.equal(
    replies.length,
    2,
    'new actor must not join the old pending operation',
  );
  replies[0]({ owner: 'A' });
  replies[1]({ owner: 'B' });
  await rejected;
  assert.equal((await next).owner, 'B');
});
