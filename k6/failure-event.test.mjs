import test from 'node:test';
import assert from 'node:assert/strict';
import { failureEvent } from './lib/failure-event.mjs';
test('HTTP500 on confirmation is technical, not an EOF read or successful business result', () => {
  const e = failureEvent({
    operation: 'confirm',
    path: '/functions/v1/reservation-command',
    response: { status: 500, error_code: 1500 },
    body: { requestId: 'synthetic-id', secret: 'DO_NOT_LOG' },
    vu: 3,
    iteration: 254,
    elapsed: 343,
  });
  assert.equal(e.classification, 'technical-http');
  assert.equal(e.operation, 'confirm');
  assert.equal(e.requestId, 'synthetic-id');
  assert.ok(!JSON.stringify(e).includes('DO_NOT_LOG'));
  assert.equal(e.retry, false);
});
test('transport, auth and functional failures are distinct; URL query and response body are not logged', () => {
  for (const [status, kind] of [
    [0, 'technical-transport'],
    [401, 'authorization'],
    [409, 'functional-or-contract'],
    [200, 'functional-or-contract'],
  ]) {
    const e = failureEvent({
      operation: 'reservations',
      path: '/rest/v1/reservations?private=HIDDEN',
      response: { status, error_code: 0, body: 'HIDDEN' },
      vu: 1,
      iteration: 2,
      elapsed: 3,
    });
    assert.equal(e.classification, kind);
    assert.ok(!JSON.stringify(e).includes('HIDDEN'));
  }
});
