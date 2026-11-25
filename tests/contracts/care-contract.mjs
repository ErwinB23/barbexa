import assert from 'node:assert/strict';
export function careContract(test, api, label) {
  const id = '11111111-1111-4111-8111-111111111111',
    requestId = '22222222-2222-4222-8222-222222222222';
  test(
    label +
      ': attendance transitions respect start, tolerance and terminal states',
    () => {
      assert.equal(
        api.nextAttendance('confirmed', 'start', 100, 100, 0),
        'in-service',
      );
      assert.equal(
        api.nextAttendance('in-service', 'complete', 100, 100, 10),
        'completed',
      );
      assert.equal(
        api.nextAttendance('confirmed', 'no-show', 600100, 100, 10),
        'no-show',
      );
      for (const state of [
        'confirmed',
        'in-service',
        'completed',
        'cancelled',
        'no-show',
      ])
        for (const command of ['start', 'complete', 'no-show']) {
          const permitted =
            (state === 'confirmed' && command !== 'complete') ||
            (state === 'in-service' && command === 'complete');
          if (!permitted)
            assert.throws(
              () => api.nextAttendance(state, command, 600100, 100, 10),
              { code: 'CONFLICT' },
            );
        }
      for (const args of [
        [Infinity, 100, 0],
        [100, NaN, 0],
        [100, 100, 0.5],
        [100, 100, -1],
      ])
        assert.throws(() => api.nextAttendance('confirmed', 'start', ...args), {
          code: 'INVALID_INPUT',
        });
      assert.throws(
        () => api.nextAttendance('confirmed', 'start', 99, 100, 0),
        { code: 'CONFLICT' },
      );
      assert.throws(
        () => api.nextAttendance('confirmed', 'no-show', 600099, 100, 10),
        { code: 'CONFLICT' },
      );
    },
  );
  test(
    label +
      ': closed payment commands reject forged identity, attestation and out-of-range settings',
    () => {
      for (const input of [
        null,
        [],
        {},
        { command: 'unknown' },
        { command: 5 },
      ])
        assert.throws(() => api.careCommand(input));
      for (const command of [
        'read',
        'start',
        'complete',
        'no-show',
        'receive',
        'refund',
        'report-yape',
        'settings',
        'payment-options',
        'configure',
      ]) {
        const shop = ['settings', 'payment-options', 'configure'].includes(
          command,
        );
        const read = ['read', 'settings', 'payment-options'].includes(command);
        const input = {
          command,
          [shop ? 'barbershopId' : 'reservationId']: id,
          ...(!read ? { requestId } : {}),
          ...(['receive', 'refund'].includes(command)
            ? { attested: true }
            : {}),
          ...(command === 'refund' ? { reason: ' Reason ' } : {}),
          ...(command === 'configure'
            ? { noShowToleranceMin: 0, yapeInstructions: null }
            : {}),
          ...(command === 'report-yape' ? { securityCode: '007' } : {}),
        };
        assert.equal(api.careCommand(input).command, command);
        assert.throws(() => api.careCommand({ ...input, actorUserId: id }));
        const missing = { ...input };
        delete missing[shop ? 'barbershopId' : 'reservationId'];
        missing.extra = 1;
        assert.throws(() => api.careCommand(missing));
        if (['receive', 'refund'].includes(command))
          assert.throws(() => api.careCommand({ ...input, attested: false }));
        if (command === 'refund')
          for (const reason of [null, '', 'x'.repeat(2001)])
            assert.throws(() => api.careCommand({ ...input, reason }));
        if (command === 'configure') {
          for (const noShowToleranceMin of [-1, 1441, 0.5, null])
            assert.throws(() =>
              api.careCommand({ ...input, noShowToleranceMin }),
            );
          for (const yapeInstructions of [3, '', 'x'.repeat(2001)])
            assert.throws(() =>
              api.careCommand({ ...input, yapeInstructions }),
            );
          assert.equal(
            api.careCommand({
              ...input,
              noShowToleranceMin: 1440,
              yapeInstructions: 'Yape',
            }).noShowToleranceMin,
            1440,
          );
        }
      }
    },
  );
  test(
    label +
      ': untrusted care projections fail closed for identity, money, events and Yape reports',
    () => {
      const base = {
        reservationId: id,
        attendance: null,
        payment: null,
        noShowToleranceMin: null,
        yapeInstructions: null,
        events: [],
        permissions: { attend: false, receive: false, refund: false },
      };
      assert.equal(api.careView(base, id).payment, null);
      for (const attendance of [
        'confirmed',
        'in-service',
        'completed',
        'no-show',
        'cancelled',
      ])
        assert.equal(
          api.careView({ ...base, attendance }, id).attendance,
          attendance,
        );
      const event = {
        kind: 'receive',
        occurredAt: '2026-11-24T00:00:00.000Z',
        capacity: 'barber',
        reason: null,
        actorUserId: id,
      };
      for (const capacity of ['client', 'barber', 'administrator'])
        api.careView(
          { ...base, events: [{ ...event, capacity, reason: 'reason' }] },
          id,
        );
      const payment = {
        method: 'cash',
        status: 'pending',
        amountMinor: 0,
        currency: 'PEN',
      };
      for (const method of ['cash', 'yape'])
        for (const status of ['pending', 'paid', 'refunded'])
          api.careView(
            { ...base, payment: { ...payment, method, status } },
            id,
          );
      for (const patch of [
        { reservationId: requestId },
        { attendance: 'bad' },
        { noShowToleranceMin: -1 },
        { noShowToleranceMin: 1441 },
        { noShowToleranceMin: 0.5 },
        { yapeInstructions: 4 },
        { events: {} },
        { events: Array(1001).fill(event) },
        { permissions: null },
        { permissions: { attend: 1, receive: false, refund: false } },
        { payment: undefined },
        { payment: { ...payment, method: 'card' } },
        { payment: { ...payment, status: 'bad' } },
        { payment: { ...payment, amountMinor: 0.5 } },
        { payment: { ...payment, amountMinor: -1 } },
        { payment: { ...payment, currency: 'USD' } },
        { canReportYape: 1 },
        { yapeReport: false },
        { yapeReport: { securityCode: 1 } },
        { yapeReport: { securityCode: '12' } },
        { yapeReport: { securityCode: '007', submittedAt: 5 } },
        { yapeReport: { securityCode: '007', submittedAt: 'bad' } },
      ])
        assert.throws(() => api.careView({ ...base, ...patch }, id), {
          code: 'DEPENDENCY_UNAVAILABLE',
        });
      for (const patch of [
        null,
        { kind: 2 },
        { occurredAt: 'bad' },
        { capacity: 'owner' },
        { reason: 1 },
        { actorUserId: 'bad' },
      ])
        assert.throws(
          () =>
            api.careView(
              {
                ...base,
                events: [patch === null ? null : { ...event, ...patch }],
              },
              id,
            ),
          { code: 'DEPENDENCY_UNAVAILABLE' },
        );
      for (const noShowToleranceMin of [0, 1440])
        api.careView(
          {
            ...base,
            noShowToleranceMin,
            yapeInstructions: 'instructions',
            canReportYape: true,
            yapeReport: {
              securityCode: '007',
              submittedAt: '2026-11-24T00:00:00.000Z',
            },
          },
          id,
        );
      api.careView({ ...base, canReportYape: false, yapeReport: null }, id);
      assert.throws(() => api.careView(null, id));
    },
  );
}
