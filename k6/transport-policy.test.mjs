import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isStressTransportEOF } from './lib/transport-policy.mjs';
test('only transport EOF in read-only Stress bypasses functional assertion, never success', () => {
  for (const error of [
    'EOF',
    'unexpected EOF',
    'Post "http://127.0.0.1:54721/rest/v1/rpc/list_booking_slots": EOF',
  ])
    assert.equal(
      isStressTransportEOF('stress', 'read', { status: 0, error }),
      true,
    );
  for (const type of ['smoke', 'load', 'load-academico', 'spike', null])
    assert.equal(
      isStressTransportEOF(type, 'read', { status: 0, error: 'EOF' }),
      false,
    );
  for (const response of [
    { status: 200, error: 'EOF' },
    { status: 503, error: 'EOF' },
    { status: 0, error: 'connection refused' },
    { status: 0, error: 'request timeout' },
    { status: 0, error: 'DNS error' },
  ])
    assert.equal(isStressTransportEOF('stress', 'read', response), false);
  assert.equal(
    isStressTransportEOF('stress', 'mixed', { status: 0, error: 'EOF' }),
    false,
  );
});
