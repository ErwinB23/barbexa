import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  careCommand,
  careView,
  nextAttendance,
} from '../../../src/features/reservations/domain/care';
import { createCareActions } from '../../../src/features/reservations/application/care';
const id = '00000000-0000-4000-8000-000000000001';
test('care closed commands and financial absence validated across all actions', () => {
  for (const command of [
    'start',
    'complete',
    'no-show',
    'receive',
    'refund',
    'read',
    'settings',
    'payment-options',
    'configure',
  ]) {
    const read = ['read', 'settings', 'payment-options'].includes(command),
      shop = ['settings', 'payment-options', 'configure'].includes(command);
    const input = {
      command,
      [shop ? 'barbershopId' : 'reservationId']: id,
      ...(!read ? { requestId: id } : {}),
      ...(['receive', 'refund'].includes(command) ? { attested: true } : {}),
      ...(command === 'refund' ? { reason: ' external ' } : {}),
      ...(command === 'configure'
        ? { noShowToleranceMin: 10, yapeInstructions: null }
        : {}),
    };
    assert.equal(careCommand(input).command, command);
    for (const extra of [
      { role: 'administrator' },
      { userId: id },
      { price: 1 },
    ])
      assert.throws(() => careCommand({ ...input, ...extra }));
  }
  for (const raw of [
    null,
    [],
    1,
    {},
    { command: 1 },
    { command: 'unknown' },
    { command: 'read', reservationId: 'bad' },
    { command: 'receive', reservationId: id, requestId: id, attested: false },
    {
      command: 'refund',
      reservationId: id,
      requestId: id,
      attested: true,
      reason: ' ',
    },
    {
      command: 'configure',
      barbershopId: id,
      requestId: id,
      noShowToleranceMin: -1,
      yapeInstructions: null,
    },
  ])
    assert.throws(() => careCommand(raw));
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
  assert.equal(
    careView(
      {
        ...view,
        attendance: 'completed',
        noShowToleranceMin: 10,
        yapeInstructions: 'instrucciones',
        payment: {
          method: 'cash',
          status: 'pending',
          currency: 'PEN',
          amountMinor: 100,
        },
        events: [
          {
            kind: 'start',
            occurredAt: '2026-11-15T00:00:00Z',
            capacity: 'barber',
            reason: null,
            actorUserId: id,
          },
        ],
      },
      id,
    ).attendance,
    'completed',
  );
  for (const raw of [
    null,
    {},
    { ...view, reservationId: 'bad' },
    { ...view, events: [{}] },
    { ...view, payment: {} },
    { ...view, permissions: {} },
  ])
    assert.throws(() => careView(raw, id));
  assert.equal(
    nextAttendance('confirmed', 'start', 1000, 1000, 10),
    'in-service',
  );
  assert.equal(
    nextAttendance('in-service', 'complete', 1000, 1000, 10),
    'completed',
  );
  assert.equal(
    nextAttendance('confirmed', 'no-show', 601000, 1000, 10),
    'no-show',
  );
  assert.throws(() => nextAttendance('confirmed', 'start', NaN, 1000, 10));
  assert.throws(() => nextAttendance('confirmed', 'start', 999, 1000, 10));
  assert.throws(() => nextAttendance('completed', 'complete', 1000, 1000, 10));
});
test('care application deduplicates pending request, releases errors and drops stale responses', async () => {
  let user: string | null = id,
    resolve!: (v: unknown) => void,
    calls = 0;
  const execute = createCareActions(
    {
      execute: () => {
        calls++;
        return new Promise((r) => {
          resolve = r;
        });
      },
    },
    () => user,
  );
  const input = { command: 'read', reservationId: id };
  const a = execute(input),
    b = execute(input);
  assert.equal(calls, 1);
  resolve({});
  await Promise.all([a, b]);
  const late = execute(input);
  user = null;
  resolve({});
  await assert.rejects(late);
  await assert.rejects(execute(input));
  user = id;
  const failing = createCareActions(
    {
      execute: async () => {
        throw Error('network');
      },
    },
    () => user,
  );
  await assert.rejects(failing(input));
  await assert.rejects(failing(input));
});
test('care configuration validates textual instructions and bounds', () => {
  assert.equal(
    careCommand({
      command: 'configure',
      barbershopId: id,
      requestId: id,
      noShowToleranceMin: 0,
      yapeInstructions: 'Local',
    }).yapeInstructions,
    'Local',
  );
  for (const yapeInstructions of ['', 1, ' '.repeat(2001)])
    assert.throws(() =>
      careCommand({
        command: 'configure',
        barbershopId: id,
        requestId: id,
        noShowToleranceMin: 10,
        yapeInstructions,
      }),
    );
  for (const noShowToleranceMin of [-1, 1441, 0.5])
    assert.throws(() =>
      careCommand({
        command: 'configure',
        barbershopId: id,
        requestId: id,
        noShowToleranceMin,
        yapeInstructions: null,
      }),
    );
});
