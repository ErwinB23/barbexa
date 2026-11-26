import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  profile,
  windowAt,
  segmentResults,
  metricValues,
} from './lib/profiles.mjs';
test('unfinished stress plateaus cannot become accredited capacity', () => {
  const metrics = {};
  const segment = 'stress-100';
  for (const op of ['catalog', 'slots']) {
    metrics[`operation_wall_ms{segment:${segment},operation:${op}}`] = {
      'p(95)': 20,
    };
    metrics[`accepted_responses{segment:${segment},operation:${op}}`] = {
      count: 2,
    };
  }
  for (const name of ['technical_errors', 'unexpected_results'])
    metrics[`${name}{segment:${segment}}`] = { value: 0 };
  metrics[`segment_requests{segment:${segment}}`] = { count: 4 };
  let result = segmentResults(profile('stress'), metrics);
  assert.equal(result[0].passed, false);
  metrics[`segment_completed{segment:${segment}}`] = { count: 1 };
  result = segmentResults(profile('stress'), metrics);
  assert.equal(result[0].passed, true);
  assert.equal(result[1].passed, false);
  assert.equal(
    metricValues(
      { 'x{segment:stress-1000}': { count: 99 } },
      'x',
      'stress-100',
    ),
    null,
  );
});
test('four profiles preserve requested timings and academic supplement', () => {
  assert.equal(profile('smoke').scenario.maxDuration, '30s');
  const load = profile('load');
  assert.deepEqual(
    load.windows.map((w) => [w.level, w.seconds]),
    [
      [10, 60],
      [25, 60],
      [50, 60],
      [100, 600],
    ],
  );
  assert.equal(profile('stress').windows.length, 10);
  assert.ok(profile('stress').windows.every((w) => w.seconds === 60));
  assert.deepEqual(
    profile('load-academico').windows.map((w) => w.seconds),
    [600, 600],
  );
  assert.throws(() => profile('spike', 0));
  assert.throws(() => profile('spike', 1100));
  const spike = profile('spike', 400);
  assert.equal(spike.durationSeconds, 130);
  assert.equal(spike.maxVU, 400);
  assert.equal(windowAt(spike, 40).name, 'spike-peak');
});
