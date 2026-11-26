import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  requestedLevels,
  acceptedEvidence,
  pressureDecision,
} from './lib/cli-policy.mjs';
test('complete plan resumes pending levels through 1000 and rejects arbitrary input', () => {
  assert.deepEqual(requestedLevels('50'), [50]);
  assert.equal(requestedLevels('completo').at(-1), 1000);
  assert.throws(() => requestedLevels('2000'));
  assert.throws(() => requestedLevels('50 --force'));
});
test('reuse requires actual matching results, checks and integrity', () => {
  const metric = {
    values: { rate: 1, passes: 3, fails: 0 },
    thresholds: { 'rate==1': { ok: true } },
  };
  const s = { mode: 'read', level: 25, metrics: { checks: metric } };
  const i = {
    before: { reservations: 0, overlaps: 0 },
    after: { reservations: 0, overlaps: 0 },
    interrupted: null,
  };
  assert.ok(acceptedEvidence(s, i, { runId: 'owned' }, 'owned', 25));
  assert.ok(
    acceptedEvidence(
      { ...s, metrics: { checks: { value: 1, passes: 3, fails: 0 } } },
      i,
      { runId: 'owned' },
      'owned',
      25,
      { exit: 0, interrupted: null },
    ),
  );
  assert.equal(
    acceptedEvidence(
      { ...s, metrics: { checks: { value: 0.9, passes: 9, fails: 1 } } },
      i,
      { runId: 'owned' },
      'owned',
      25,
      { exit: 99, interrupted: null },
    ),
    false,
  );
  assert.equal(
    acceptedEvidence(
      s,
      { ...i, interrupted: 'FAIL' },
      { runId: 'owned' },
      'owned',
      25,
    ),
    false,
  );
  assert.equal(
    acceptedEvidence(s, i, { runId: 'foreign' }, 'owned', 25),
    false,
  );
});
test('point memory readings warn; critical and sustained saturation stop', () => {
  const sample = {
    freeMiB: 1024,
    ramPercent: 89,
    cpu: 40,
    connectionRatio: 0.2,
  };
  assert.equal(pressureDecision(sample, {}, 0).stop, false);
  const high = pressureDecision({ ...sample, ramPercent: 92 }, {}, 0);
  assert.equal(high.stop, false);
  assert.equal(
    pressureDecision({ ...sample, ramPercent: 92 }, high.state, 16000).stop,
    true,
  );
  assert.equal(pressureDecision({ ...sample, freeMiB: 300 }, {}, 0).stop, true);
});
